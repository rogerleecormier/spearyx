import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getCloudflareEnv } from "@/lib/cloudflare";

const MODEL = "@cf/meta/llama-3.2-3b-instruct";

export const Route = createFileRoute("/api/ai/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const env = getCloudflareEnv();

          if (!env.AI) {
            return json(
              { success: false, error: "AI binding not available" },
              { status: 503 }
            );
          }

          const body = (await request.json()) as {
            prompt: string;
            maxTokens?: number;
            temperature?: number;
          };

          if (!body.prompt) {
            return json(
              { success: false, error: "prompt is required" },
              { status: 400 }
            );
          }

          const result = (await env.AI.run(MODEL as Parameters<Ai["run"]>[0], {
            messages: [{ role: "user", content: body.prompt }],
            max_tokens: body.maxTokens ?? 500,
          } as any)) as any;

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
              error:
                error instanceof Error ? error.message : "AI request failed",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
