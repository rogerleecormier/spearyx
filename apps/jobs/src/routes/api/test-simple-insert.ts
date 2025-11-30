import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDbFromContext, schema } from "../../db/db";

export const Route = createFileRoute("/api/test-simple-insert")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as any;

        try {
          const db = await getDbFromContext(ctx);

          // First, try a simple select to see if the DB is connected
          const categories = await db.select().from(schema.categories).limit(1);

          if (categories.length === 0) {
            return json({
              error: "No categories found - database may not be seeded",
              debug: "Try running `npm run seed` first",
            });
          }

          // Try inserting one simple job
          try {
            // Try without postDate
            const inserted = await db.insert(schema.jobs).values({
              title: "Test Job",
              company: "Test Company",
              description: "This is a test job",
              payRange: "$100,000 - $150,000",
              sourceUrl: "https://test.example.com/test-job-" + Date.now(),
              sourceName: "TestSource",
              categoryId: 1,
              remoteType: "fully_remote",
              // explicitly NOT including postDate
            });

            return json({
              success: true,
              message: "Simple insert succeeded",
              result: inserted,
            });
          } catch (insertErr) {
            return json({
              success: false,
              error: "Insert failed",
              message:
                insertErr instanceof Error
                  ? insertErr.message
                  : String(insertErr),
              stack: insertErr instanceof Error ? insertErr.stack : undefined,
              // Try to extract more context
              details: {
                inserted: insertErr,
                keys: Object.keys(insertErr || {}),
              },
            });
          }
        } catch (error) {
          return json(
            {
              error: "Database connection failed",
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
