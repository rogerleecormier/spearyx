import { schema } from "../../db/db";
import type { DrizzleD1Database } from "../../db/db";
import { getD1Database } from "../cloudflare-dev";
import { jobSources, determineCategoryId } from "./job-sources";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

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
function sanitizeString(str: string | null | undefined): string | null {
  if (!str) return null;

  // Decode HTML entities and fix UTF-8 encoding issues
  let sanitized = decodeHTMLEntities(str);

  // Remove null bytes and control characters
  sanitized = sanitized
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize whitespace
  sanitized = sanitized.trim();

  // D1 has practical limits on query size, limit description to reasonable size
  if (sanitized.length > 10000) {
    return sanitized.substring(0, 10000);
  }

  return sanitized;
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

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  // Filter sources if specified
  const sourcesToSync =
    options.sources && options.sources.length > 0
      ? jobSources.filter((source) => options.sources!.includes(source.name))
      : jobSources;

  for (const source of sourcesToSync) {
    try {
      log(`\n📡 Fetching from ${source.name}...`);

      for await (const rawJobs of source.fetch()) {
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
            const categoryId = determineCategoryId(
              rawJob.title,
              rawJob.description,
              rawJob.tags
            );

            if (existing.length > 0) {
              if (options.updateExisting) {
                // Update existing job with potentially new data
                await db
                  .update(schema.jobs)
                  .set({
                    title: sanitizeString(rawJob.title),
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
              // Insert new job
              try {
                await db.insert(schema.jobs).values({
                  title: sanitizeString(rawJob.title),
                  company: sanitizeString(rawJob.company),
                  description: sanitizeString(rawJob.description),
                  payRange: sanitizeString(rawJob.salary),
                  postDate: rawJob.postedDate,
                  sourceUrl: sanitizeString(rawJob.sourceUrl),
                  sourceName: sanitizeString(rawJob.sourceName),
                  categoryId,
                  remoteType: "fully_remote",
                });

                totalAdded++;
                log(`  ✅ Added: ${rawJob.title} (Category: ${categoryId})`);
              } catch (insertError: any) {
                // Check if it's a unique constraint error
                if (
                  insertError?.message?.includes("UNIQUE constraint failed")
                ) {
                  log(`  ⏭️  Skipped (duplicate): ${rawJob.title}`);
                  totalSkipped++;
                } else {
                  // Log full error details for debugging
                  const errorDetails = {
                    message: insertError?.message,
                    cause: insertError?.cause,
                    code: insertError?.code,
                  };
                  log(
                    `  ❌ Insert failed for "${rawJob.title}": ${JSON.stringify(errorDetails)}`,
                    "error"
                  );
                  totalSkipped++;
                }
              }
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
const args = process.argv.slice(2);
const updateExisting =
  process.env.UPDATE_EXISTING !== "false" && !args.includes("--no-update");
const addNew = process.env.ADD_NEW !== "false" && !args.includes("--no-new");

// Parse sources from environment variable
const sourcesEnv = process.env.SOURCES;
const sources =
  sourcesEnv && sourcesEnv.trim() !== ""
    ? sourcesEnv.split(",").map((s) => s.trim())
    : undefined;

// Auto-execute when run as a script
// if (import.meta.url === `file://${process.argv[1]}`) {
//   syncJobs({ updateExisting, addNew, sources })
//     .then(() => {
//       console.log("\n✅ Sync finished successfully!");
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error("\n❌ Sync failed:", error);
//       process.exit(1);
//     });
// }
