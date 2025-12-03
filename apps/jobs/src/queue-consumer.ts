import { getDbFromContext, schema } from './db/db';
import { jobSources, determineCategoryId } from './lib/job-sources';
import { eq, inArray, sql } from 'drizzle-orm';

export interface Env {
  DB: D1Database;
}

interface SyncJobMessage {
  syncId: string;
  source: string;
  company: string;
  updateExisting: boolean;
  addNew: boolean;
}

// Helper to sanitize strings (copied from job-sync.ts)
function sanitizeString(str: string | null | undefined, required: true): string;
function sanitizeString(str: string | null | undefined, required?: false): string | null;
function sanitizeString(str: string | null | undefined, required: boolean = false): string | null {
  if (!str) return required ? "" : null;

  let sanitized = str
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u0080-\uFFFF]/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (sanitized.length > 2000) {
    return sanitized.substring(0, 2000);
  }

  return sanitized || (required ? "" : null);
}

async function updateSyncLog(db: any, syncId: string, message: string, level: string = 'info') {
  try {
    const currentSync = await db.select().from(schema.syncHistory).where(sql`id = ${syncId}`).limit(1);
    if (currentSync.length > 0) {
      const logs = currentSync[0].logs || [];
      logs.push({
        timestamp: new Date().toISOString(),
        type: level,
        message
      });
      await db.update(schema.syncHistory).set({ logs }).where(sql`id = ${syncId}`);
    }
  } catch (error) {
    console.error('Error updating sync log:', error);
  }
}

async function updateSyncProgress(db: any, syncId: string, company: string, success: boolean) {
  try {
    const currentSync = await db.select().from(schema.syncHistory).where(sql`id = ${syncId}`).limit(1);
    if (currentSync.length > 0) {
      const processedCompanies = (currentSync[0].processedCompanies || 0) + 1;
      const failedCompanies = currentSync[0].failedCompanies || [];
      
      if (!success) {
        failedCompanies.push(company);
      }
      
      await db.update(schema.syncHistory).set({
        processedCompanies,
        failedCompanies,
        status: processedCompanies >= (currentSync[0].totalCompanies || 0) ? 'completed' : 'processing'
      }).where(sql`id = ${syncId}`);
    }
  } catch (error) {
    console.error('Error updating sync progress:', error);
  }
}

async function processCompany(
  db: any,
  sourceName: string,
  company: string,
  syncId: string,
  updateExisting: boolean,
  addNew: boolean
) {
  const log = (msg: string, level: string = 'info') => {
    console.log(`[${company}] ${msg}`);
    updateSyncLog(db, syncId, msg, level);
  };

  try {
    // Find the source
    const source = jobSources.find(s => s.name === sourceName);
    if (!source) {
      throw new Error(`Unknown source: ${sourceName}`);
    }

    log(`Processing ${company}...`);

    let totalAdded = 0;
    let totalUpdated = 0;

    // Fetch jobs for this company
    for await (const rawJobs of source.fetch(undefined, log)) {
      // Filter jobs for this specific company (for sources that return multiple companies)
      const companyJobs = rawJobs.filter(job => 
        job.company?.toLowerCase().includes(company.toLowerCase()) ||
        job.sourceUrl?.toLowerCase().includes(company.toLowerCase())
      );

      if (companyJobs.length === 0) continue;

      log(`Processing batch of ${companyJobs.length} jobs`);

      // Batch-load existing jobs
      const sourceUrls = companyJobs.map(j => j.sourceUrl).filter(Boolean);
      const existingJobs = await db
        .select()
        .from(schema.jobs)
        .where(inArray(schema.jobs.sourceUrl, sourceUrls));

      const existingJobsMap = new Map(
        existingJobs.map((job: any) => [job.sourceUrl, job])
      );

      // Process each job
      for (const rawJob of companyJobs) {
        const existing = existingJobsMap.get(rawJob.sourceUrl);
        const categoryId = determineCategoryId(
          rawJob.title,
          rawJob.description,
          rawJob.tags
        );

        if (existing && updateExisting) {
          await db
            .update(schema.jobs)
            .set({
              title: sanitizeString(rawJob.title, true),
              company: sanitizeString(rawJob.company),
              description: sanitizeString(rawJob.description),
              payRange: sanitizeString(rawJob.salary),
              postDate: rawJob.postedDate,
              updatedAt: new Date(),
              categoryId,
            })
            .where(eq(schema.jobs.id, (existing as any).id));
          totalUpdated++;
        } else if (!existing && addNew) {
          await db.insert(schema.jobs).values({
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
          totalAdded++;
        }
      }
    }

    log(`Completed: ${totalAdded} added, ${totalUpdated} updated`, 'success');
    return true;
  } catch (error) {
    log(`Failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
    return false;
  }
}

export default {
  async queue(batch: MessageBatch<SyncJobMessage>, env: Env): Promise<void> {
    const db = await getDbFromContext({ env } as any);

    for (const message of batch.messages) {
      try {
        const { syncId, source, company, updateExisting, addNew } = message.body;

        console.log(`Processing queue message: ${source} - ${company}`);

        const success = await processCompany(
          db,
          source,
          company,
          syncId,
          updateExisting,
          addNew
        );

        await updateSyncProgress(db, syncId, company, success);

        message.ack();
      } catch (error) {
        console.error(`Failed to process message:`, error);
        message.retry();
      }
    }
  }
};
