import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDbFromContext, schema } from "../../db/db";

// Test UTF-8 encoding and sanitization
export const Route = createFileRoute("/api/test-encoding")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as any;
        const db = await getDbFromContext(ctx);

        try {
          // Test data with mangled UTF-8
          const testData = {
            title: "Test Job â€ with Em-Dash",
            company: "Test Company â€œQuoted",
            description:
              "This has â€™ right single quote and â€œ left double quote and â character",
            payRange: "$100,000 - $150,000",
            sourceUrl: "https://example.com/test-encoding",
            sourceName: "TestSource",
            categoryId: 1,
            remoteType: "fully_remote",
          };

          // Try to insert
          const result = await db.insert(schema.jobs).values(testData);

          return json({
            success: true,
            message: "Test insert successful!",
            data: testData,
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          return json(
            {
              success: false,
              error: "Test insert failed",
              details: errorMsg,
              errorFull: String(error),
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
