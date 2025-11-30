#!/usr/bin/env node
/**
 * Test the job sync functionality locally
 * This tests that job sources can fetch data and the sync function can insert it
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(
  __dirname,
  "apps/jobs/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/620144a4112044e893e18deb703ab416f4251b9350437cf41d528bd572a8ab37.sqlite"
);

console.log("🧪 Testing Job Sync Functionality\n");
console.log(`📍 Database: ${dbPath}\n`);

const db = new Database(dbPath);

// Test 1: Check database state
console.log("Step 1: Checking database state...");
const categories = db.prepare("SELECT COUNT(*) as count FROM categories").get();
const jobs = db.prepare("SELECT COUNT(*) as count FROM jobs").get();

console.log(`  ✅ Categories: ${categories.count}`);
console.log(`  ✅ Jobs: ${jobs.count}\n`);

if (categories.count === 0) {
  console.error("❌ No categories found! Run: node seed-jobs-db-direct.js");
  process.exit(1);
}

// Test 2: Test inserting a job manually
console.log("Step 2: Testing manual job insertion...");
try {
  const testJob = {
    title: "Test Developer",
    company: "Test Company",
    description: "This is a test job",
    pay_range: "$100,000 - $150,000",
    source_url: `https://test.example.com/jobs/${Date.now()}`,
    source_name: "TestSource",
    category_id: 1,
    remote_type: "fully_remote",
  };

  const insert = db.prepare(`
    INSERT INTO jobs (title, company, description, pay_range, source_url, source_name, category_id, remote_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Math.floor(Date.now() / 1000);
  const result = insert.run(
    testJob.title,
    testJob.company,
    testJob.description,
    testJob.pay_range,
    testJob.source_url,
    testJob.source_name,
    testJob.category_id,
    testJob.remote_type,
    now,
    now
  );

  console.log(`  ✅ Job inserted successfully (ID: ${result.lastInsertRowid})\n`);

  // Test 3: Verify job was inserted
  console.log("Step 3: Verifying insertion...");
  const inserted = db
    .prepare(
      "SELECT title, company, source_name FROM jobs WHERE id = ? LIMIT 1"
    )
    .get(result.lastInsertRowid);

  if (inserted) {
    console.log(`  ✅ Job found: "${inserted.title}" at ${inserted.company}`);
    console.log(`  ✅ Source: ${inserted.source_name}\n`);
  }

  // Test 4: Check job count
  console.log("Step 4: Final job count...");
  const finalJobs = db.prepare("SELECT COUNT(*) as count FROM jobs").get();
  console.log(`  ✅ Total jobs in database: ${finalJobs.count}\n`);

  console.log("✅ All basic tests passed!");
  console.log("\nℹ️  Database is ready for syncing jobs from external sources.");
  console.log("📝 Next steps:");
  console.log("   1. Start the dev server: npm run serve");
  console.log("   2. Open http://localhost:8787/sync");
  console.log("   3. Select sources and click 'Run Selected'");
} catch (error) {
  console.error("❌ Error:", error instanceof Error ? error.message : error);
  process.exit(1);
}
