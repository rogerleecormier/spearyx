import { schema } from "../db/db";
import { getD1Database } from "@spearyx/shared-utils";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

async function cleanDatabase() {
  const d1 = await getD1Database();
  const db = drizzle(d1, { schema });

  console.log("🧹 Cleaning database...");

  // Delete all jobs from RemoteOK (which have HTML)
  const deleted = await db
    .delete(schema.jobs)
    .where(eq(schema.jobs.sourceName, "RemoteOK"));

  console.log("✅ Deleted RemoteOK jobs with HTML");
  console.log("💡 Now run: npm run sync-jobs");
  process.exit(0);
}

cleanDatabase().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
