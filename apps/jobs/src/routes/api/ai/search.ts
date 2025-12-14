import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseSearchQuery, type AIEnv } from "../../../lib/ai";

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

export const Route = createFileRoute("/api/ai/search")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const ai = getAIFromContext(context);
          
          if (!ai) {
            return json(
              { success: false, error: "AI not available" },
              { status: 503 }
            );
          }

          const body = await request.json() as { query: string };

          if (!body.query) {
            return json(
              { success: false, error: "Search query is required" },
              { status: 400 }
            );
          }

          const env: AIEnv = { AI: ai };
          const parsed = await parseSearchQuery(env, body.query);

          return json({
            success: true,
            data: parsed,
          });
        } catch (error) {
          console.error("Error parsing search:", error);
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : "Failed to parse search",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});

