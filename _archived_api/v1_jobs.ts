import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDbFromContext, schema } from "../../db/db";
import { searchJobs } from "../../lib/search-utils";

import type { JobWithCategory } from "../../lib/search-utils";

export const Route = createFileRoute("/api/_archived/v1_jobs")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        try {
          const ctx = context as any;
          // console.log('API /jobs context keys:', ctx ? Object.keys(ctx) : 'context is null')
          const db = await getDbFromContext(ctx);

          const url = new URL(request.url);
          const query = url.searchParams.get("search") || undefined;
          const categoryId = url.searchParams.get("category")
            ? parseInt(url.searchParams.get("category")!)
            : undefined;
          const source = url.searchParams.get("source") || undefined;
          const salaryRange = url.searchParams.get("salaryRange") || undefined;
          const includeNoSalary =
            url.searchParams.get("includeNoSalary") === "true";
          const sortBy =
            (url.searchParams.get("sortBy") as
              | "newest"
              | "oldest"
              | "title-asc"
              | "title-desc") || "newest";
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "20");
          const offset = (page - 1) * limit;

          // Fetch all jobs
          const jobsData = await db.select().from(schema.jobs);

          // Fetch all categories once
          const categoriesData = await db.select().from(schema.categories);
          const categoriesMap = new Map(categoriesData.map((c) => [c.id, c]));

          // Transform to include category data
          const jobsWithCategories: JobWithCategory[] = jobsData.map((job) => {
            const category = categoriesMap.get(job.categoryId);
            // Fallback for orphaned jobs (shouldn't happen given our check, but safe)
            const defaultCategory = categoriesData[0] || {
              id: 0,
              name: "Unknown",
              slug: "unknown",
              jobCount: 0,
            };

            return {
              ...job,
              category: category || defaultCategory,
            };
          });

          // Apply search, filtering, and sorting
          const results = searchJobs(jobsWithCategories, {
            query,
            categoryId,
            source,
            salaryRange,
            includeNoSalary,
            sortBy,
            limit,
            offset,
          });

          return json({
            success: true,
            data: results,
          });
        } catch (error) {
          console.error("Error fetching jobs:", error);
          return json(
            {
              success: false,
              error:
                error instanceof Error ? error.message : "Failed to fetch jobs",
              details: String(error),
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
