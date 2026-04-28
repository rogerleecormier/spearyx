import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

const MODEL = "@cf/meta/llama-3.2-3b-instruct";

async function getAI(context: any): Promise<any | null> {
  let ai = context?.cloudflare?.env?.AI;
  if (!ai) ai = context?.env?.AI;
  if (!ai) ai = context?.AI;
  if (!ai) ai = (globalThis as any).__CF_ENV__?.AI;
  if (!ai) ai = (globalThis as any).AI;
  return ai || null;
}

export const Route = createFileRoute("/api/ai/generate")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          const ai = await getAI(context);

          if (!ai) {
            return json(
              { success: false, error: "AI binding not available" },
              { status: 503 }
            );
          }

          const body = (await request.json()) as {
            prompt: string;
            maxTokens?: number;
          };

          if (!body.prompt) {
            return json(
              { success: false, error: "prompt is required" },
              { status: 400 }
            );
          }

          const result = (await ai.run(MODEL, {
            messages: [{ role: "user", content: body.prompt }],
            max_tokens: body.maxTokens ?? 500,
          })) as any;

          let text: string;
          if (typeof result === "string") {
            text = result;
          } else if (result?.response) {
            text = result.response;
          } else {
            text = JSON.stringify(result);
          }

          return json({ success: true, result: text });
        } catch (error) {
          console.error("AI generate error:", error);
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : "AI request failed",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
