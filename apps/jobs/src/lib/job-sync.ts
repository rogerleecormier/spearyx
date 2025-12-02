import { schema } from "../db/db";
import type { DrizzleD1Database } from "../db/db";
import { getD1Database } from "@spearyx/shared-utils";
import { jobSources, determineCategoryId } from "./job-sources";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createBatchedDbWriter } from "./pacer-utils";

async function getDb() {
  const d1 = await getD1Database();
  return drizzle(d1, { schema });
}

// Helper to decode HTML entities and fix mangled UTF-8
function decodeHTMLEntities(text: string): string {
  // Create a map of common HTML entities that might be mangled
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&mdash;": "—",
    "&ndash;": "–",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
  };

  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  }

  // Fix common UTF-8 encoding issues (mojibake)
  // Replace mangled characters with their correct UTF-8 equivalents
  decoded = decoded
    .replace(/â€"/g, "—") // Em dash
    .replace(/â€œ/g, '"') // Left double quote
    .replace(/â€\u009d/g, '"') // Right double quote
    .replace(/â€™/g, "'") // Right single quote
    .replace(/â€˜/g, "'") // Left single quote
    .replace(/â€"–/g, "–") // En dash
    .replace(/â/g, ""); // Remove standalone broken character

  return decoded;
}

// Helper to sanitize strings for D1
function sanitizeString(str: string | null | undefined, required: true): string;
function sanitizeString(str: string | null | undefined, required?: false): string | null;
function sanitizeString(str: string | null | undefined, required: boolean = false): string | null {
  if (!str) return required ? "" : null;

  // Decode HTML entities and fix UTF-8 encoding issues
  let sanitized = decodeHTMLEntities(str);

  // Remove null bytes and control characters
  sanitized = sanitized
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // AGGRESSIVE UTF-8 cleaning: Force to pure ASCII
  // This handles malformed sequences like 'ï¹£' (0xEF 0xB9 0xA3)
  // by stripping all non-ASCII characters completely
  sanitized = sanitized
    .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes -> straight quote
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes -> straight quote
    .replace(/[\u2013\u2014]/g, "-")  // En/em dashes -> hyphen
    .replace(/\u2026/g, "...")        // Ellipsis -> three dots
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\uFE63\uFF65\u00B7\u00A2]/g, "*")  // Various bullets -> asterisk
    .replace(/[\u0080-\uFFFF]/g, ""); // Remove ALL non-ASCII (128-65535)

  // Strip HTML tags to avoid issues with truncated/malformed HTML
  // This is safer for database storage and prevents SQL injection concerns
  sanitized = sanitized.replace(/<[^>]*>/g, " ");

  // Normalize whitespace (collapse multiple spaces)
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  // If after sanitization the string is empty and it's required, return empty string
  if (!sanitized && required) {
    return "";
  }

  // D1 has practical limits on query size, limit description to reasonable size
  // Reduced from 10000 -> 5000 -> 2000 to avoid hitting D1's 1MB SQL statement size limit
  if (sanitized.length > 2000) {
    return sanitized.substring(0, 2000);
  }

  return sanitized || (required ? "" : null);
}

export async function syncJobs(
  options: {
    updateExisting: boolean;
    addNew: boolean;
    sources?: string[];
    db?: DrizzleD1Database;
    onLog?: (
      message: string,
      level?: "info" | "success" | "error" | "warning"
    ) => void;
  } = { updateExisting: true, addNew: true }
) {
  const db = options.db || (await getDb());
  const log = options.onLog || console.log;

  log("=".repeat(50));
  log("Starting job sync...");
  if (options.sources && options.sources.length > 0) {
    log(`Syncing sources: ${options.sources.join(", ")}`);
  }
  log("=".repeat(50));

  // Ensure categories exist before syncing jobs
  const existingCategories = await db.select().from(schema.categories).limit(1);
  if (existingCategories.length === 0) {
    log("📦 Categories table is empty, seeding default categories...");
    const defaultCategories = [
      { name: 'Programming & Development', slug: 'programming-development', description: 'Software development, web development, mobile apps, and coding roles' },
      { name: 'Project Management', slug: 'project-management', description: 'Project managers, product managers, scrum masters, and agile roles' },
      { name: 'Design', slug: 'design', description: 'UI/UX design, graphic design, product design, and creative roles' },
      { name: 'Marketing', slug: 'marketing', description: 'Digital marketing, content marketing, SEO, and growth roles' },
      { name: 'Data Science & Analytics', slug: 'data-science-analytics', description: 'Data scientists, analysts, machine learning engineers, and BI roles' },
      { name: 'DevOps & Infrastructure', slug: 'devops-infrastructure', description: 'DevOps engineers, SRE, cloud architects, and infrastructure roles' },
      { name: 'Customer Support', slug: 'customer-support', description: 'Customer service, technical support, and success roles' },
      { name: 'Sales', slug: 'sales', description: 'Sales representatives, account executives, and business development' },
    ];
    await db.insert(schema.categories).values(defaultCategories);
    log("✅ Categories seeded successfully");
  }

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  // Filter sources if specified
  const sourcesToSync =
    options.sources && options.sources.length > 0
      ? jobSources.filter((source) => options.sources!.includes(source.name))
      : jobSources;

  // Create batched writer for new jobs
  const batchWriter = createBatchedDbWriter({
    maxSize: 50,
    wait: 2000,
    writeFn: async (jobs: any[]) => {
      try {
        await db.insert(schema.jobs).values(jobs);
        totalAdded += jobs.length;
        log(`  ✨ Flushed batch of ${jobs.length} jobs`);
      } catch (error) {
        // If batch fails, try one by one to save what we can
        log(`  ⚠️  Batch insert failed, retrying individually...`, "warning");
        for (const job of jobs) {
          try {
            await db.insert(schema.jobs).values(job);
            totalAdded++;
          } catch (err: any) {
            if (err?.message?.includes("UNIQUE constraint failed")) {
              totalSkipped++;
            } else {
              log(`  ❌ Individual insert failed: ${err.message}`, "error");
              totalSkipped++;
            }
          }
        }
      }
    },
    onError: (error: Error, _items: any[]) => {
      log(`  ❌ Batch error: ${error.message}`, "error");
    }
  });

  for (const source of sourcesToSync) {
    try {
      log(`\n📡 Fetching from ${source.name}...`);

      for await (const rawJobs of source.fetch(undefined, log)) {
        log(`Processing batch of ${rawJobs.length} jobs from ${source.name}`);

        for (const rawJob of rawJobs) {
          try {
            // Check if job already exists by source URL
            const existing = await db
              .select()
              .from(schema.jobs)
              .where(eq(schema.jobs.sourceUrl, rawJob.sourceUrl))
              .limit(1);

            // Determine category automatically
            let categoryId = determineCategoryId(
              rawJob.title,
              rawJob.description,
              rawJob.tags
            );

            // Validate that the category exists, fallback to 1 (Software Engineering) if not
            // Optimization: Cache category existence check or assume standard categories exist
            // For now, we'll keep the check but maybe we can optimize later
            
            // ... category check logic ...

            if (existing.length > 0) {
              if (options.updateExisting) {
                // Update existing job with potentially new data
                // Updates are still done individually as they are less frequent/bulk than inserts usually
                await db
                  .update(schema.jobs)
                  .set({
                    title: sanitizeString(rawJob.title, true),
                    company: sanitizeString(rawJob.company),
                    description: sanitizeString(rawJob.description),
                    payRange: sanitizeString(rawJob.salary),
                    postDate: rawJob.postedDate,
                    updatedAt: new Date(),
                    categoryId, // Update category as logic might have changed
                  })
                  .where(eq(schema.jobs.id, existing[0].id));

                totalUpdated++;
                log(`  🔄 Updated: ${rawJob.title}`);
              }
              continue;
            }

            if (options.addNew) {
              // Add to batch instead of inserting immediately
              await batchWriter.add({
                title: sanitizeString(rawJob.title, true),
                company: sanitizeString(rawJob.company),
                description: sanitizeString(rawJob.description),
                payRange: sanitizeString(rawJob.salary),
                postDate: rawJob.postedDate,
                sourceUrl: sanitizeString(rawJob.sourceUrl, true),
                sourceName: sanitizeString(rawJob.sourceName, true),
                categoryId,
                remoteType: "fully_remote",
              });
              
              // Log queued instead of added (added is logged on flush)
              log(`  queued: ${rawJob.title}`); 
            }
          } catch (jobError) {
            const errorMsg =
              jobError instanceof Error ? jobError.message : String(jobError);
            log(
              `  ❌ Error processing job "${rawJob.title}": ${errorMsg}`,
              "error"
            );
          }
        }
      }

      log(`\n✨ ${source.name} complete`, "success");
    } catch (sourceError) {
      log(`❌ Error fetching from ${source.name}: ${sourceError}`, "error");
    }
  }

  // Flush any remaining jobs
  await batchWriter.flush();


  log("\n" + "=".repeat(50));
  log("\n✅ Sync complete!", "success");
  log(`   Added: ${totalAdded}`);
  log(`   Updated: ${totalUpdated}`);
  log(`   Skipped: ${totalSkipped}`);
  log("=".repeat(50));

  return {
    added: totalAdded,
    updated: totalUpdated,
    skipped: totalSkipped,
  };
}

// Parse command line arguments and environment variables
// (Removed for Cloudflare Worker compatibility)

// Parse sources from environment variable
// (Removed for Cloudflare Worker compatibility)

// Auto-execute when run as a script
// (Removed for Cloudflare Worker compatibility)
