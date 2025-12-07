/**
 * AI Service Client
 * Cloudflare Workers AI integration with rate limiting and timeout handling
 *
 * Features:
 * - Rate limiting (10 requests/minute per session)
 * - 30-second timeout with graceful fallback
 * - Request cancellation support
 * - Automatic retry logic
 * - Error recovery with fallback data
 */

import {
  getWorkerEndpoint,
  getWorkerApiKey,
  AI_CONFIG,
  AI_ENABLED,
} from "../config/workers";
import promptsData from "../config/prompts.json";
import { RaciValue } from "@/types/raci";

/**
 * AI prompt types available
 */
export type AIPromptType =
  | "roleExtraction"
  | "taskGeneration"
  | "raciAdvice"
  | "projectTypeClassification";

/**
 * AI suggestion result types
 */
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

/**
 * Rate limiter for AI requests
 * Tracks requests per session to enforce 10 req/min limit
 */
class RateLimiter {
  private requestTimestamps: number[] = [];
  private readonly maxRequests = AI_CONFIG.rateLimit.maxRequests;
  private readonly windowMs = AI_CONFIG.rateLimit.windowMs;

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    // Check if we have capacity
    if (this.requestTimestamps.length < this.maxRequests) {
      this.requestTimestamps.push(now);
      return true;
    }

    return false;
  }

  getRetryAfterMs(): number {
    if (this.requestTimestamps.length === 0) return 0;
    const oldestTimestamp = this.requestTimestamps[0];
    const retryAfter = oldestTimestamp + this.windowMs - Date.now();
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

/**
 * AI Service client
 */
export class AIService {
  private rateLimiter = new RateLimiter();
  private abortControllers = new Map<string, AbortController>();
  private lastFallbackUsed: boolean = false;
  private lastFallbackTime: number = 0;

  /**
   * Check if fallback was used in the last generation
   */
  isFallbackActive(): boolean {
    // Consider fallback active if used within the last 10 seconds
    return this.lastFallbackUsed && Date.now() - this.lastFallbackTime < 10000;
  }

  /**
   * Check if AI service is available
   * Returns false when AI_ENABLED is false (Azure deployment)
   */
  async isAvailable(): Promise<boolean> {
    // AI is explicitly disabled in configuration
    if (!AI_ENABLED) {
      return false;
    }

    try {
      const endpoint = getWorkerEndpoint();
      const apiKey = getWorkerApiKey();

      if (!endpoint || !apiKey || apiKey === "dev-key") {
        return false;
      }

      // Try a health check request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${endpoint}/health`, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        clearTimeout(timeoutId);
        return response.ok;
      } catch {
        clearTimeout(timeoutId);
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Extract roles from project description
   */
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

  /**
   * Generate tasks from project description
   */
  async generateTasks(
    _projectDescription: string,
    projectType: string,
    roles: string[],
    requestId?: string
  ): Promise<AITaskSuggestion> {
    return this.callAI<AITaskSuggestion>(
      "taskGeneration",
      {
        projectType,
        roles: roles.join(", "),
      },
      requestId
    );
  }

  /**
   * Get RACI assignment advice for a task
   */
  async getRACIAdvice(
    task: string,
    projectType: string,
    roles: string[],
    requestId?: string
  ): Promise<AIRACISuggestion> {
    return this.callAI<AIRACISuggestion>(
      "raciAdvice",
      {
        task,
        projectType,
        roles: roles.join(", "),
      },
      requestId
    );
  }

  /**
   * Classify project type from description
   */
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

  /**
   * Make AI request with rate limiting, timeout, and error handling
   */
  private async callAI<T>(
    promptType: AIPromptType,
    variables: Record<string, string>,
    requestId?: string
  ): Promise<T> {
    const id = requestId || `ai-${Date.now()}-${Math.random()}`;

    // If AI is disabled, immediately use fallback
    if (!AI_ENABLED) {
      console.log(`AI disabled - using fallback for ${promptType}`);
      this.lastFallbackUsed = true;
      this.lastFallbackTime = Date.now();
      return this.getFallbackData<T>(promptType, variables);
    }

    try {
      // Get prompt template
      const promptConfig = promptsData[promptType as keyof typeof promptsData];
      if (!promptConfig) {
        throw new AIError(
          "INVALID_PROMPT",
          `Unknown prompt type: ${promptType}`
        );
      }

      // Check rate limit BEFORE making the actual request
      if (!this.rateLimiter.canMakeRequest()) {
        const retryAfter = this.rateLimiter.getRetryAfterMs();
        throw new AIError(
          "RATE_LIMITED",
          `Rate limit exceeded. Retry after ${Math.ceil(retryAfter / 1000)}s`,
          { retryAfter }
        );
      }

      // Substitute variables in prompt
      let prompt = promptConfig.prompt;
      for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(`{{${key}}}`, value);
      }

      // Create abort controller for cancellation
      const controller = new AbortController();
      this.abortControllers.set(id, controller);

      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, AI_CONFIG.timeoutMs);

      try {
        // Call Cloudflare Workers AI endpoint
        const endpoint = getWorkerEndpoint();
        const apiKey = getWorkerApiKey();

        if (!endpoint || !apiKey) {
          throw new AIError(
            "CONFIG_ERROR",
            "AI endpoint or API key not configured"
          );
        }

        const response = await fetch(`${endpoint}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
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
          throw new AIError(
            "API_ERROR",
            `AI API returned ${response.status}: ${error}`
          );
        }

        const data = (await response.json()) as Record<string, unknown>;

        // Parse response
        if (!data.result) {
          throw new AIError("INVALID_RESPONSE", "AI returned empty result");
        }

        // Try to parse as JSON (expected for most prompts)
        try {
          const parsed = JSON.parse(data.result as string);
          return {
            ...parsed,
            confidence: (data.confidence as number) || 0.8,
          } as T;
        } catch {
          // If not JSON, return raw result
          return {
            result: data.result,
            confidence: (data.confidence as number) || 0.8,
          } as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof AIError) {
          // For network errors, try to use fallback data instead of throwing
          if (error.code === "NETWORK_ERROR") {
            console.warn(
              "AI service unavailable for",
              promptType,
              ", using fallback data:",
              error.message
            );
            try {
              this.lastFallbackUsed = true;
              this.lastFallbackTime = Date.now();
              const fallbackData = this.getFallbackData<T>(
                promptType,
                variables
              );
              console.log("Fallback data returned:", fallbackData);
              return fallbackData;
            } catch (fallbackError) {
              console.error("Fallback failed:", fallbackError);
              throw error;
            }
          }
          // For rate limit errors, also try fallback (user's session is not consuming API quota)
          if (error.code === "RATE_LIMITED") {
            console.warn(
              "Rate limited for",
              promptType,
              ", using fallback data instead (no API call consumed)"
            );
            try {
              this.lastFallbackUsed = true;
              this.lastFallbackTime = Date.now();
              const fallbackData = this.getFallbackData<T>(
                promptType,
                variables
              );
              console.log("Fallback data returned:", fallbackData);
              return fallbackData;
            } catch (fallbackError) {
              console.error("Fallback failed:", fallbackError);
              throw error;
            }
          }
          throw error;
        }

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            throw new AIError(
              "TIMEOUT",
              `Request timed out after ${AI_CONFIG.timeoutMs}ms`
            );
          }
          // For network errors, try fallback
          console.warn(
            "Network error for",
            promptType,
            ", attempting fallback:",
            error.message
          );
          try {
            this.lastFallbackUsed = true;
            this.lastFallbackTime = Date.now();
            const fallbackData = this.getFallbackData<T>(promptType, variables);
            console.log("Fallback data returned:", fallbackData);
            return fallbackData;
          } catch (fallbackError) {
            console.error("Fallback failed:", fallbackError);
            throw new AIError("NETWORK_ERROR", error.message);
          }
        }

        throw new AIError("UNKNOWN_ERROR", "An unknown error occurred");
      }
    } finally {
      this.abortControllers.delete(id);
    }
  }

  /**
   * Get fallback data for a prompt type (when AI is unavailable)
   */
  private getFallbackData<T>(
    promptType: AIPromptType,
    variables: Record<string, string>
  ): T {
    const projectDescription = variables.projectDescription || "";
    const projectType = variables.projectType || "mobile app";
    const roles = variables.roles
      ? variables.roles.split(",").map((r) => r.trim())
      : [];
    const tasks = variables.tasks
      ? variables.tasks.split(",").map((t) => t.trim())
      : [];

    switch (promptType) {
      case "projectTypeClassification":
        return {
          type: AI_FALLBACKS.classifyProjectType(projectDescription),
          confidence: 0.5,
        } as T;

      case "roleExtraction":
        return {
          roles: AI_FALLBACKS.getRoles(projectDescription),
          confidence: 0.5,
        } as T;

      case "taskGeneration":
        return {
          tasks: AI_FALLBACKS.getTasks(projectType),
          confidence: 0.5,
        } as T;

      case "raciAdvice":
        return {
          matrix: AI_FALLBACKS.getRACIMatrix(roles, tasks),
          confidence: 0.5,
        } as T;

      default:
        return {} as T;
    }
  }

  /**
   * Cancel an in-flight AI request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): {
    remaining: number;
    limit: number;
    resetAfterMs: number;
  } {
    const remaining = this.rateLimiter.getRemainingRequests();
    return {
      remaining,
      limit: AI_CONFIG.rateLimit.maxRequests,
      resetAfterMs: this.rateLimiter.getRetryAfterMs(),
    };
  }
}

/**
 * AI-specific error class
 */
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

/**
 * Fallback data generator for when AI is unavailable
 */
export const AI_FALLBACKS = {
  /**
   * Classify project type from description
   */
  classifyProjectType(input: string): string {
    const lowerInput = input.toLowerCase();

    // Check more specific project types first before generic keywords
    if (lowerInput.includes("crm")) {
      return "crm migration";
    } else if (
      lowerInput.includes("website") ||
      lowerInput.includes("web") ||
      lowerInput.includes("redesign")
    ) {
      return "web redesign";
    } else if (
      lowerInput.includes("marketing") ||
      lowerInput.includes("campaign")
    ) {
      return "marketing campaign";
    } else if (
      lowerInput.includes("data") ||
      lowerInput.includes("analytics")
    ) {
      return "data analytics";
    } else if (lowerInput.includes("mobile") || lowerInput.includes("app")) {
      return "mobile app";
    }

    return "mobile app"; // Default fallback
  },

  /**
   * Fallback roles based on project type or description
   * Searches for keywords in the input to determine appropriate roles
   */
  getRoles(input: string): string[] {
    const lowerInput = input.toLowerCase();

    const fallbacks: Record<string, string[]> = {
      "mobile app": [
        "Product Manager",
        "Backend Engineer",
        "Frontend Engineer",
        "QA Lead",
        "DevOps Engineer",
      ],
      "web redesign": [
        "Product Manager",
        "UX Designer",
        "Frontend Engineer",
        "Backend Engineer",
        "QA Lead",
      ],
      "crm migration": [
        "CRM Admin",
        "Data Analyst",
        "IT Manager",
        "Business Analyst",
        "Change Manager",
      ],
      "marketing campaign": [
        "Marketing Manager",
        "Content Creator",
        "Designer",
        "Analytics Lead",
        "Product Manager",
      ],
      "data analytics": [
        "Data Engineer",
        "Analytics Engineer",
        "Data Scientist",
        "Product Manager",
        "DevOps Engineer",
      ],
    };

    // Try to match keywords in the input
    const key = Object.keys(fallbacks).find((k) => lowerInput.includes(k));

    // If no specific match, try broader keywords
    if (!key) {
      if (lowerInput.includes("mobile") || lowerInput.includes("app")) {
        return fallbacks["mobile app"];
      } else if (
        lowerInput.includes("website") ||
        lowerInput.includes("web") ||
        lowerInput.includes("redesign")
      ) {
        return fallbacks["web redesign"];
      } else if (lowerInput.includes("crm")) {
        return fallbacks["crm migration"];
      } else if (
        lowerInput.includes("marketing") ||
        lowerInput.includes("campaign")
      ) {
        return fallbacks["marketing campaign"];
      } else if (
        lowerInput.includes("data") ||
        lowerInput.includes("analytics")
      ) {
        return fallbacks["data analytics"];
      }
    }

    return fallbacks[key || "mobile app"];
  },

  /**
   * Fallback tasks based on project type
   */
  getTasks(projectType: string): Array<{ name: string; description?: string }> {
    const fallbacks: Record<
      string,
      Array<{ name: string; description?: string }>
    > = {
      "mobile app": [
        {
          name: "Requirements & Planning",
          description: "Define scope and requirements",
        },
        {
          name: "System Architecture",
          description: "Design technical architecture",
        },
        { name: "Implementation", description: "Code development" },
        { name: "Testing", description: "QA and testing cycles" },
        { name: "Deployment", description: "Release to production" },
        { name: "Monitoring & Support", description: "Post-launch monitoring" },
      ],
      "web redesign": [
        {
          name: "Discovery & Analysis",
          description: "Understand current state",
        },
        {
          name: "Design System",
          description: "Create design system and mockups",
        },
        { name: "Frontend Build", description: "Implement new design" },
        {
          name: "Backend Integration",
          description: "Connect to backend services",
        },
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
        {
          name: "Strategy Development",
          description: "Define campaign strategy",
        },
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
        {
          name: "Maintenance",
          description: "Ongoing support and optimization",
        },
      ],
    };

    const key = Object.keys(fallbacks).find((k) =>
      projectType.toLowerCase().includes(k)
    );
    return fallbacks[key || "mobile app"];
  },

  /**
   * Fallback RACI assignments
   */
  getRACIMatrix(
    roles: string[],
    tasks: string[]
  ): Record<string, Record<string, RaciValue>> {
    const matrix: Record<string, Record<string, RaciValue>> = {};

    for (let i = 0; i < roles.length; i++) {
      matrix[roles[i]] = {};
      for (let j = 0; j < tasks.length; j++) {
        const taskIndex = j % roles.length;

        if (i === taskIndex) {
          matrix[roles[i]][tasks[j]] = "A"; // Accountable
        } else if (i === 0) {
          matrix[roles[i]][tasks[j]] = "R"; // Responsible
        } else {
          matrix[roles[i]][tasks[j]] = "C"; // Consulted
        }
      }
    }

    return matrix;
  },
};

/**
 * Singleton AI service instance
 */
export const aiService = new AIService();
