import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDbFromContext, schema } from "../../db/db";

export const Route = createFileRoute("/api/_archived/test-db")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        try {
          console.log("🔍 Test DB endpoint called");

          const db = await getDbFromContext(context);
          console.log("✅ DB connection successful");

          // Try a simple query
          const result = await db.select().from(schema.jobs).limit(1);

          return json({
            success: true,
            message: "DB connection successful",
            jobCount: result.length,
          });
        } catch (error) {
          console.error("❌ Test DB failed:", error);
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
