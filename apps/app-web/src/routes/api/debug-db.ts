import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDbFromContext, schema } from "../../db/db";

export const Route = createFileRoute("/api/debug-db")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as any;
        const db = await getDbFromContext(ctx);

        try {
          // Check categories
          const categories = await db.select().from(schema.categories);

          // Check jobs count
          const jobs = await db.select().from(schema.jobs);

          return json({
            categories: {
              count: categories.length,
              data: categories,
            },
            jobs: {
              count: jobs.length,
              sample: jobs.slice(0, 3),
            },
            testStatus: {
              categoriesExist: categories.length > 0,
              hasCategory1: categories.some((c) => c.id === 1),
              hasCategory4: categories.some((c) => c.id === 4),
              hasCategory5: categories.some((c) => c.id === 5),
            },
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          return json(
            {
              error: "Debug query failed",
              details: errorMsg,
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
