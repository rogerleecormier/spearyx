import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getDbFromContext, schema } from "../../db/db";
import { eq } from "drizzle-orm";

// Test data - clean jobs without encoding issues
const testJobs = [
  {
    title: "Senior Software Engineer",
    company: "TechCorp",
    description:
      "Build scalable backend systems. 5+ years required. Strong in Java or Go.",
    payRange: "$150,000 - $200,000",
    sourceUrl: "https://test.example.com/job-1",
    sourceName: "TestSource",
    categoryId: 1,
  },
  {
    title: "Product Manager",
    company: "StartupInc",
    description: "Lead product strategy and roadmap for our B2B SaaS platform.",
    payRange: "$120,000 - $160,000",
    sourceUrl: "https://test.example.com/job-2",
    sourceName: "TestSource",
    categoryId: 1,
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech",
    description: "Manage Kubernetes clusters and CI/CD pipelines on AWS.",
    payRange: "$130,000 - $180,000",
    sourceUrl: "https://test.example.com/job-3",
    sourceName: "TestSource",
    categoryId: 1,
  },
  {
    title: "Data Analyst",
    company: "AnalyticsPlus",
    description: "Analyze data and create insights using SQL and Python.",
    payRange: "$90,000 - $130,000",
    sourceUrl: "https://test.example.com/job-4",
    sourceName: "TestSource",
    categoryId: 5,
  },
  {
    title: "UX Designer",
    company: "DesignStudio",
    description: "Create user experiences using Figma and user research.",
    payRange: "$100,000 - $140,000",
    sourceUrl: "https://test.example.com/job-5",
    sourceName: "TestSource",
    categoryId: 4,
  },
];

export const Route = createFileRoute("/api/test-jobs")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as any;
        const db = await getDbFromContext(ctx);

        try {
          let added = 0;
          const errors: Array<{ title: string; error: string; details?: any }> =
            [];

          for (const job of testJobs) {
            try {
              const existing = await db
                .select()
                .from(schema.jobs)
                .where(eq(schema.jobs.sourceUrl, job.sourceUrl))
                .limit(1);

              if (existing.length > 0) {
                continue;
              }

              // Don't set postDate - let the database handle it
              const jobData = {
                title: job.title,
                company: job.company,
                description: job.description,
                payRange: job.payRange,
                sourceUrl: job.sourceUrl,
                sourceName: job.sourceName,
                categoryId: job.categoryId,
                remoteType: "fully_remote",
              };

              await db.insert(schema.jobs).values(jobData);
              added++;
            } catch (err) {
              errors.push({
                title: job.title,
                error: err instanceof Error ? err.message : String(err),
                details: err instanceof Error ? err.stack : undefined,
              });
            }
          }

          return json({
            success: errors.length === 0,
            message:
              errors.length === 0
                ? "Test jobs inserted successfully"
                : "Some test jobs failed to insert",
            inserted: added,
            total: testJobs.length,
            errors: errors.length > 0 ? errors : undefined,
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          return json(
            {
              success: false,
              error: "Test insert failed",
              details: errorMsg,
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
