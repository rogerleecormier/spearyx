import { AI_CONFIG } from "../config/workers";
import promptsData from "../config/prompts.json";
import { RaciValue } from "@/types/raci";

export type AIPromptType =
  | "roleExtraction"
  | "taskGeneration"
  | "raciAdvice"
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
          const parsed = JSON.parse(data.result);
          return { ...parsed, confidence: parsed.confidence ?? 0.8 } as T;
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
        { name: "Requirements & Planning", description: "Define scope and requirements" },
        { name: "System Architecture", description: "Design technical architecture" },
        { name: "Implementation", description: "Code development" },
        { name: "Testing", description: "QA and testing cycles" },
        { name: "Deployment", description: "Release to production" },
        { name: "Monitoring & Support", description: "Post-launch monitoring" },
      ],
      "web redesign": [
        { name: "Discovery & Analysis", description: "Understand current state" },
        { name: "Design System", description: "Create design system and mockups" },
        { name: "Frontend Build", description: "Implement new design" },
        { name: "Backend Integration", description: "Connect to backend services" },
        { name: "User Testing", description: "Conduct UAT" },
        { name: "Launch", description: "Rollout to production" },
      ],
      "crm migration": [
        { name: "Assessment", description: "Evaluate current system" },
        { name: "Planning", description: "Plan migration strategy" },
        { name: "Data Mapping", description: "Map legacy data to new system" },
        { name: "Configuration", description: "Set up new CRM" },
        { name: "Training", description: "Train users on new system" },
        { name: "Cutover", description: "Switch to new system" },
      ],
      "marketing campaign": [
        { name: "Strategy Development", description: "Define campaign strategy" },
        { name: "Content Creation", description: "Create marketing materials" },
        { name: "Channel Setup", description: "Set up marketing channels" },
        { name: "Campaign Launch", description: "Deploy campaign" },
        { name: "Monitoring", description: "Track performance metrics" },
        { name: "Analysis & Optimization", description: "Analyze and iterate" },
      ],
      "data analytics": [
        { name: "Requirements", description: "Define analytics requirements" },
        { name: "Data Pipeline", description: "Build data infrastructure" },
        { name: "Analytics Setup", description: "Configure analytics tools" },
        { name: "Dashboard Creation", description: "Build dashboards" },
        { name: "Training", description: "Train stakeholders" },
        { name: "Maintenance", description: "Ongoing support and optimization" },
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
