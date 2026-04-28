import { AI_CONFIG } from "../config/workers";
import promptsData from "../config/prompts.json";
import { RaciValue } from "@/types/raci";

function extractJSON(text: string): string {
  // Strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Extract first JSON object or array
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) return objMatch[0];
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) return arrMatch[0];
  return text.trim();
}

function parseNumberedList(raw: string): Array<{ name: string; description: string }> {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const tasks: Array<{ name: string; description: string }> = [];
  for (const line of lines) {
    // Match "1. Name: description" or "1. Name - description" or "1. Name"
    const match = line.match(/^\d+[\.\)]\s+(.+)/);
    if (!match) continue;
    const rest = match[1].replace(/\*\*/g, "").trim();
    const sepIdx = rest.search(/[:\-–]/);
    if (sepIdx > 0) {
      tasks.push({
        name: rest.slice(0, sepIdx).trim(),
        description: rest.slice(sepIdx + 1).trim(),
      });
    } else {
      tasks.push({ name: rest.trim(), description: "" });
    }
  }
  return tasks;
}

function parseAIResponse(raw: string, promptType: AIPromptType): Record<string, unknown> {
  // For task generation, try numbered list first (more reliable for small models)
  if (promptType === "taskGeneration") {
    const listTasks = parseNumberedList(raw);
    if (listTasks.length > 0) return { tasks: listTasks };
  }

  try {
    const json = extractJSON(raw);
    const parsed = JSON.parse(json);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if (promptType === "taskGeneration" && Array.isArray(parsed.tasks)) {
        return {
          ...parsed,
          tasks: parsed.tasks.map((item: unknown) =>
            typeof item === "string" ? { name: item, description: "" } : item
          ),
        };
      }
      return parsed;
    }

    if (Array.isArray(parsed)) {
      if (promptType === "roleExtraction") return { roles: parsed };
      if (promptType === "taskGeneration") {
        return {
          tasks: parsed.map((item: unknown) =>
            typeof item === "string" ? { name: item, description: "" } : item
          ),
        };
      }
    }
  } catch {
    // fall through
  }

  return { result: raw };
}

export type AIPromptType =
  | "roleExtraction"
  | "taskGeneration"
  | "raciAdvice"
  | "accountableResolution"
  | "titleGeneration"
  | "projectTypeClassification";

export interface AIRoleSuggestion {
  roles: string[];
  confidence: number;
}

export interface AITaskSuggestion {
  tasks: Array<{ name: string; description?: string }>;
  confidence: number;
}

export interface AIRACISuggestion {
  matrix: Record<string, RaciValue>;
  confidence: number;
}

export interface AIProjectType {
  type: string;
  confidence: number;
}

class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly maxRequests = AI_CONFIG.rateLimit.maxRequests;
  private readonly windowMs = AI_CONFIG.rateLimit.windowMs;

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs
    );
    if (this.requestTimestamps.length < this.maxRequests) {
      this.requestTimestamps.push(now);
      return true;
    }
    return false;
  }

  getRetryAfterMs(): number {
    if (this.requestTimestamps.length === 0) return 0;
    const retryAfter = this.requestTimestamps[0] + this.windowMs - Date.now();
    return Math.max(0, retryAfter);
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs
    );
    return this.maxRequests - this.requestTimestamps.length;
  }
}

export class AIService {
  private rateLimiter = new RateLimiter();
  private abortControllers = new Map<string, AbortController>();
  private lastFallbackUsed: boolean = false;
  private lastFallbackTime: number = 0;

  isFallbackActive(): boolean {
    return this.lastFallbackUsed && Date.now() - this.lastFallbackTime < 10000;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "ping", maxTokens: 1 }),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async extractRoles(
    projectDescription: string,
    requestId?: string
  ): Promise<AIRoleSuggestion> {
    return this.callAI<AIRoleSuggestion>(
      "roleExtraction",
      { projectDescription },
      requestId
    );
  }

  async generateTasks(
    _projectDescription: string,
    projectType: string,
    roles: string[],
    requestId?: string
  ): Promise<AITaskSuggestion> {
    return this.callAI<AITaskSuggestion>(
      "taskGeneration",
      { projectType, roles: roles.join(", ") },
      requestId
    );
  }

  async getRACIAdvice(
    task: string,
    projectType: string,
    roles: string[],
    requestId?: string
  ): Promise<AIRACISuggestion> {
    return this.callAI<AIRACISuggestion>(
      "raciAdvice",
      { task, projectType, roles: roles.join(", ") },
      requestId
    );
  }

  async generateTitle(
    projectDescription: string,
    requestId?: string
  ): Promise<string | null> {
    try {
      const result = await this.callAI<{ result: string }>(
        "titleGeneration",
        { projectDescription },
        requestId
      );
      const raw = (result.result || "").trim().replace(/^["']|["']$/g, "");
      return raw || null;
    } catch {
      return null;
    }
  }

  async resolveAccountable(
    task: string,
    projectType: string,
    roles: string[],
    requestId?: string
  ): Promise<string | null> {
    try {
      const result = await this.callAI<{ result: string }>(
        "accountableResolution",
        { task, projectType, roles: roles.join(", ") },
        requestId
      );
      const raw = (result.result || "").trim();
      // Find the closest matching role name (case-insensitive)
      const match = roles.find(
        (r) => r.toLowerCase() === raw.toLowerCase()
      ) || roles.find(
        (r) => raw.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(raw.toLowerCase())
      );
      return match || null;
    } catch {
      return null;
    }
  }

  async classifyProjectType(
    projectDescription: string,
    requestId?: string
  ): Promise<AIProjectType> {
    return this.callAI<AIProjectType>(
      "projectTypeClassification",
      { projectDescription },
      requestId
    );
  }

  private async callAI<T>(
    promptType: AIPromptType,
    variables: Record<string, string>,
    requestId?: string
  ): Promise<T> {
    const id = requestId || `ai-${Date.now()}-${Math.random()}`;

    try {
      const promptConfig = promptsData[promptType as keyof typeof promptsData];
      if (!promptConfig) {
        throw new AIError("INVALID_PROMPT", `Unknown prompt type: ${promptType}`);
      }

      if (!this.rateLimiter.canMakeRequest()) {
        const retryAfter = this.rateLimiter.getRetryAfterMs();
        throw new AIError(
          "RATE_LIMITED",
          `Rate limit exceeded. Retry after ${Math.ceil(retryAfter / 1000)}s`,
          { retryAfter }
        );
      }

      let prompt = promptConfig.prompt;
      for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(`{{${key}}}`, value);
      }

      const controller = new AbortController();
      this.abortControllers.set(id, controller);
      const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

      try {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            maxTokens: promptConfig.maxTokens || 500,
            temperature: 0.7,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          throw new AIError("API_ERROR", `AI API returned ${response.status}: ${error}`);
        }

        const data = (await response.json()) as { success: boolean; result?: string; error?: string };

        if (!data.success || !data.result) {
          throw new AIError("INVALID_RESPONSE", data.error || "AI returned empty result");
        }

        try {
          const parsed = parseAIResponse(data.result, promptType);
          return { ...parsed, confidence: 0.8 } as T;
        } catch {
          return { result: data.result, confidence: 0.8 } as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof AIError) {
          if (error.code === "RATE_LIMITED") {
            return this.useFallback<T>(promptType, variables);
          }
          throw error;
        }

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AIError("TIMEOUT", `Request timed out after ${AI_CONFIG.timeoutMs}ms`);
          }
          console.warn("Network error for", promptType, ", attempting fallback:", error.message);
          return this.useFallback<T>(promptType, variables);
        }

        throw new AIError("UNKNOWN_ERROR", "An unknown error occurred");
      }
    } finally {
      this.abortControllers.delete(id);
    }
  }

  private useFallback<T>(promptType: AIPromptType, variables: Record<string, string>): T {
    this.lastFallbackUsed = true;
    this.lastFallbackTime = Date.now();
    return this.getFallbackData<T>(promptType, variables);
  }

  private getFallbackData<T>(
    promptType: AIPromptType,
    variables: Record<string, string>
  ): T {
    const projectDescription = variables.projectDescription || "";
    const projectType = variables.projectType || "mobile app";
    const roles = variables.roles ? variables.roles.split(",").map((r) => r.trim()) : [];
    const tasks = variables.tasks ? variables.tasks.split(",").map((t) => t.trim()) : [];

    switch (promptType) {
      case "projectTypeClassification":
        return { type: AI_FALLBACKS.classifyProjectType(projectDescription), confidence: 0.5 } as T;
      case "roleExtraction":
        return { roles: AI_FALLBACKS.getRoles(projectDescription), confidence: 0.5 } as T;
      case "taskGeneration":
        return { tasks: AI_FALLBACKS.getTasks(projectType), confidence: 0.5 } as T;
      case "raciAdvice":
        return { matrix: AI_FALLBACKS.getRACIMatrix(roles, tasks), confidence: 0.5 } as T;
      default:
        return {} as T;
    }
  }

  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  getRateLimitStatus(): { remaining: number; limit: number; resetAfterMs: number } {
    return {
      remaining: this.rateLimiter.getRemainingRequests(),
      limit: AI_CONFIG.rateLimit.maxRequests,
      resetAfterMs: this.rateLimiter.getRetryAfterMs(),
    };
  }
}

export class AIError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "AIError";
  }
}

export const AI_FALLBACKS = {
  classifyProjectType(input: string): string {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("crm")) return "crm migration";
    if (lowerInput.includes("website") || lowerInput.includes("web") || lowerInput.includes("redesign")) return "web redesign";
    if (lowerInput.includes("marketing") || lowerInput.includes("campaign")) return "marketing campaign";
    if (lowerInput.includes("data") || lowerInput.includes("analytics")) return "data analytics";
    if (lowerInput.includes("mobile") || lowerInput.includes("app")) return "mobile app";
    return "mobile app";
  },

  getRoles(input: string): string[] {
    const lowerInput = input.toLowerCase();
    const fallbacks: Record<string, string[]> = {
      "mobile app": ["Product Manager", "Backend Engineer", "Frontend Engineer", "QA Lead", "DevOps Engineer"],
      "web redesign": ["Product Manager", "UX Designer", "Frontend Engineer", "Backend Engineer", "QA Lead"],
      "crm migration": ["CRM Admin", "Data Analyst", "IT Manager", "Business Analyst", "Change Manager"],
      "marketing campaign": ["Marketing Manager", "Content Creator", "Designer", "Analytics Lead", "Product Manager"],
      "data analytics": ["Data Engineer", "Analytics Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"],
    };
    const key = Object.keys(fallbacks).find((k) => lowerInput.includes(k));
    if (!key) {
      if (lowerInput.includes("mobile") || lowerInput.includes("app")) return fallbacks["mobile app"];
      if (lowerInput.includes("website") || lowerInput.includes("web")) return fallbacks["web redesign"];
      if (lowerInput.includes("crm")) return fallbacks["crm migration"];
      if (lowerInput.includes("marketing") || lowerInput.includes("campaign")) return fallbacks["marketing campaign"];
      if (lowerInput.includes("data") || lowerInput.includes("analytics")) return fallbacks["data analytics"];
    }
    return fallbacks[key || "mobile app"];
  },

  getTasks(projectType: string): Array<{ name: string; description?: string }> {
    const fallbacks: Record<string, Array<{ name: string; description?: string }>> = {
      "mobile app": [
        { name: "Product Requirements & User Stories", description: "Define feature scope, acceptance criteria, and prioritized backlog so the team builds the right product." },
        { name: "System Architecture & API Design", description: "Design backend services, data models, and API contracts to establish a stable foundation before coding begins." },
        { name: "UI/UX Wireframes & Prototypes", description: "Create interactive mockups for key user flows so stakeholders can validate experience before development." },
        { name: "Core Feature Development", description: "Implement authentication, primary user flows, and business logic that form the backbone of the app." },
        { name: "Third-Party Integrations", description: "Connect payment providers, push notifications, and analytics SDKs required for the app to function end-to-end." },
        { name: "QA Testing & Bug Resolution", description: "Execute functional, regression, and device-compatibility tests to ship a stable, crash-free release." },
        { name: "App Store Submission & Launch", description: "Prepare store listings, submit builds for review, and coordinate a go-live rollout with monitoring in place." },
      ],
      "web redesign": [
        { name: "Stakeholder Discovery & Audit", description: "Interview stakeholders and audit the current site's content, performance, and UX gaps to align on redesign goals." },
        { name: "Information Architecture & Sitemap", description: "Define the new page hierarchy and navigation structure so users can find content intuitively." },
        { name: "Brand-Aligned Design System", description: "Build a component library with typography, color, and interaction patterns that reflects the updated brand." },
        { name: "High-Fidelity Page Design", description: "Design all key page templates in detail so developers have pixel-precise specs to build from." },
        { name: "Frontend Implementation", description: "Develop responsive, accessible pages using the new design system across all target devices and browsers." },
        { name: "CMS Migration & Content QA", description: "Migrate existing content to the new CMS structure and verify accuracy, SEO metadata, and broken-link resolution." },
        { name: "Staged Rollout & Performance Validation", description: "Launch behind a feature flag, validate Core Web Vitals and conversion metrics, then cut over fully." },
      ],
      "crm migration": [
        { name: "Current-State CRM Audit", description: "Document all existing data structures, custom fields, integrations, and workflows to uncover migration risks early." },
        { name: "Data Cleansing & Deduplication", description: "Remove duplicate contacts, fix corrupt records, and standardize formats so only clean data moves to the new system." },
        { name: "Field & Object Mapping", description: "Map every legacy field to its destination in the new CRM to ensure no data is lost or misclassified." },
        { name: "New CRM Configuration & Customization", description: "Set up pipelines, automation rules, roles, and custom objects in the target CRM to match business processes." },
        { name: "Integration Reconnection", description: "Reconnect email, marketing, ERP, and support tool integrations to the new CRM and validate data flow end-to-end." },
        { name: "User Acceptance Testing & Training", description: "Run UAT with key users across sales and support teams and deliver role-specific training before go-live." },
        { name: "Cutover & Hypercare Support", description: "Execute the final data migration, decommission the legacy system, and provide two-week hypercare to resolve blockers." },
      ],
      "marketing campaign": [
        { name: "Audience Research & Segmentation", description: "Analyze target personas, buying intent signals, and competitor positioning to sharpen campaign focus." },
        { name: "Campaign Strategy & Messaging Framework", description: "Define campaign goals, key messages per segment, channel mix, and KPIs to guide all downstream work." },
        { name: "Creative Asset Production", description: "Produce copy, visuals, video, and landing pages aligned to the messaging framework and brand guidelines." },
        { name: "Channel Configuration & Ad Setup", description: "Configure paid, email, and social channels with targeting rules, UTM tracking, and budget allocations." },
        { name: "Campaign Launch & QA", description: "Activate the campaign across all channels, verify tracking pixels fire correctly, and confirm assets render as expected." },
        { name: "Performance Monitoring & Optimization", description: "Monitor CTR, conversion rate, and CPL daily; reallocate budget and iterate creative based on early signals." },
        { name: "Post-Campaign Analysis & Reporting", description: "Compile final performance data against KPIs, extract learnings, and document recommendations for future campaigns." },
      ],
      "data analytics": [
        { name: "Analytics Requirements & KPI Definition", description: "Work with stakeholders to define the business questions, metrics, and success criteria the analytics platform must answer." },
        { name: "Data Source Inventory & Access Setup", description: "Catalog all source systems, negotiate data access agreements, and establish secure ingestion credentials." },
        { name: "Data Pipeline & Warehouse Build", description: "Develop ETL/ELT pipelines that reliably ingest, transform, and load data into the analytics warehouse on schedule." },
        { name: "Data Modeling & Semantic Layer", description: "Create dimensional models and a semantic layer so analysts query consistent, business-friendly metrics." },
        { name: "Dashboard & Report Development", description: "Build self-service dashboards for each stakeholder group with drill-down capability and scheduled delivery." },
        { name: "Data Quality Monitoring & Alerting", description: "Implement automated data quality checks and alerting so issues are caught before they reach business decisions." },
        { name: "Stakeholder Enablement & Documentation", description: "Run training sessions, publish a data catalog, and hand off runbooks so teams can self-serve analytics independently." },
      ],
    };
    const key = Object.keys(fallbacks).find((k) => projectType.toLowerCase().includes(k));
    return fallbacks[key || "mobile app"];
  },

  getRACIMatrix(roles: string[], tasks: string[]): Record<string, Record<string, RaciValue>> {
    const matrix: Record<string, Record<string, RaciValue>> = {};
    for (let i = 0; i < roles.length; i++) {
      matrix[roles[i]] = {};
      for (let j = 0; j < tasks.length; j++) {
        const taskIndex = j % roles.length;
        if (i === taskIndex) matrix[roles[i]][tasks[j]] = "A";
        else if (i === 0) matrix[roles[i]][tasks[j]] = "R";
        else matrix[roles[i]][tasks[j]] = "C";
      }
    }
    return matrix;
  },
};

export const aiService = new AIService();
