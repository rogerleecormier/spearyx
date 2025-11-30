import { drizzle } from "drizzle-orm/d1";
import { schema } from "./src/db/db";
import { getCloudflareContext } from "./src/lib/cloudflare-dev";

// Simple test data - clean, no special characters or encoding issues
const testJobs = [
  {
    title: "Senior Software Engineer",
    company: "TechCorp",
    description:
      "Build scalable backend systems. 5+ years required. Strong in Java or Go.",
    payRange: "$150,000 - $200,000",
    sourceUrl: "https://test.example.com/job-1",
    sourceName: "TestSource",
  },
  {
    title: "Product Manager",
    company: "StartupInc",
    description: "Lead product strategy and roadmap for our B2B SaaS platform.",
    payRange: "$120,000 - $160,000",
    sourceUrl: "https://test.example.com/job-2",
    sourceName: "TestSource",
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech",
    description: "Manage Kubernetes clusters and CI/CD pipelines on AWS.",
    payRange: "$130,000 - $180,000",
    sourceUrl: "https://test.example.com/job-3",
    sourceName: "TestSource",
  },
  {
    title: "Data Analyst",
    company: "AnalyticsPlus",
    description: "Analyze data and create insights using SQL and Python.",
    payRange: "$90,000 - $130,000",
    sourceUrl: "https://test.example.com/job-4",
    sourceName: "TestSource",
  },
  {
    title: "UX Designer",
    company: "DesignStudio",
    description: "Create user experiences using Figma and user research.",
    payRange: "$100,000 - $140,000",
    sourceUrl: "https://test.example.com/job-5",
    sourceName: "TestSource",
  },
];

async function testInsert() {
  try {
    const context = await getCloudflareContext();
    const db = drizzle((context.env as any).DB, { schema });

    console.log("Testing insert of", testJobs.length, "test jobs...\n");

    let added = 0;
    let errors = 0;

    for (const job of testJobs) {
      try {
        await db.insert(schema.jobs).values({
          ...job,
          categoryId: 1, // Default category
          remoteType: "fully_remote",
          postDate: new Date(),
        });
        console.log("✅ Inserted:", job.title);
        added++;
      } catch (err) {
        console.error("❌ Failed:", job.title, "-", (err as Error).message);
        errors++;
      }
    }

    console.log(`\nResults: ${added} inserted, ${errors} failed`);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

// Run the test
testInsert();
