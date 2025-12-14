import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { analyzeJobInsights, type AIEnv } from "../../../lib/ai";

// Helper to get AI binding from context (mirrors getDbFromContext pattern)
function getAIFromContext(context: any): AIEnv['AI'] | null {
  // 1. Standard Cloudflare context
  let ai = context?.cloudflare?.env?.AI;
  
  // 2. Direct env access
  if (!ai) {
    ai = context?.env?.AI;
  }
  
  // 3. Check global __CF_ENV__ (set by custom worker entry)
  if (!ai && typeof globalThis !== 'undefined') {
    const cfEnv = (globalThis as any).__CF_ENV__;
    if (cfEnv) {
      ai = cfEnv.AI;
    }
  }
  
  // 4. Direct on globalThis
  if (!ai && typeof globalThis !== 'undefined') {
    ai = (globalThis as any).AI;
  }

  return ai || null;
}

export const Route = createFileRoute("/api/ai/insights")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const ai = getAIFromContext(context);
          
          if (!ai) {
            console.error("AI binding not found. Context keys:", Object.keys(context || {}));
            console.error("globalThis.__CF_ENV__:", (globalThis as any).__CF_ENV__ ? 'exists' : 'undefined');
            return json(
              { success: false, error: "AI not available - binding not found" },
              { status: 503 }
            );
          }

          const body = await request.json() as { 
            description: string; 
            title?: string;
          };

          if (!body.description) {
            return json(
              { success: false, error: "Job description is required" },
              { status: 400 }
            );
          }

          // Create an env-like object for our AI functions
          const env: AIEnv = { AI: ai };

          const insights = await analyzeJobInsights(
            env,
            body.description,
            body.title
          );

          return json({
            success: true,
            data: insights,
          });
        } catch (error) {
          console.error("Error analyzing job:", error);
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Failed to analyze job",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});

