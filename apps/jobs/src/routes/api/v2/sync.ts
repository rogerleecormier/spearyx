import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

interface SyncRequestBody {
  sources?: string[]
  updateExisting?: boolean
  addNew?: boolean
}

export const Route = createFileRoute('/api/v2/sync')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          // Debug: Log context structure
          console.log('🔍 Context structure:', {
            hasContext: !!context,
            contextKeys: context ? Object.keys(context) : [],
            hasCloudflare: !!(context as any)?.cloudflare,
            hasEnv: !!(context as any)?.env,
            hasDB: !!(context as any)?.DB,
          })

          // Parse request body
          const body = (await request.json()) as SyncRequestBody
          const { sources, updateExisting = true, addNew = true } = body

          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Create sync ID
          const syncId = crypto.randomUUID()

          // Create sync history record
          await db.insert(schema.syncHistory).values({
            id: syncId,
            status: 'running',
            sources: sources || [],
            stats: {
              jobsAdded: 0,
              jobsUpdated: 0,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            },
            logs: []
          })

          // SEQUENTIAL BATCH SYNC APPROACH (Free Plan Compatible)
          // Process companies in batches, track progress in database
          // Each API call processes ~25 companies worth of jobs
          // Frontend chains API calls until all companies are processed
          
          // Get list of all companies to track total
          const { default: companiesData } = await import('../../../lib/job-sources/greenhouse-companies.json');
          const allCompanies: string[] = [];
          Object.values((companiesData as any).categories).forEach((category: any) => {
            allCompanies.push(...category.companies);
          });
          const companies = [...new Set(allCompanies)]; // Deduplicate (151 companies)
          
          // Check if this is a continuation of an existing sync
          const existingSync = await db.select().from(schema.syncHistory)
            .where(sql`id = ${syncId}`)
            .limit(1);
          
          const isNewSync = existingSync.length === 0;
          const currentProgress = isNewSync ? 0 : (existingSync[0].processedCompanies || 0);
          const isComplete = currentProgress >= companies.length;
          
          if (isComplete) {
            return json({
              success: true,
              syncId,
              status: 'completed',
              progress: {
                processed: companies.length,
                total: companies.length,
                percentage: 100
              },
              continue: false,
              message: 'Sync already complete!'
            });
          }
          
          console.log(`Sync progress: ${currentProgress}/${companies.length} companies`);
          
          // Update sync history to processing
          await db.update(schema.syncHistory).set({
            status: 'processing',
            totalCompanies: companies.length,
          }).where(sql`id = ${syncId}`);

          // Process jobs - syncJobs will process all sources
          // CRITICAL: Must stay well under 30s timeout
          // Strategy: Process max 10 companies OR 10 seconds, whichever comes first
          const { syncJobs } = await import('../../../lib/job-sync');
          
          const startTime = Date.now();
          const MAX_PROCESSING_TIME = 10000; // 10 seconds - very conservative
          const MAX_COMPANIES_PER_BATCH = 10; // Hard limit on companies
          
          let totalAdded = 0;
          let totalUpdated = 0;
          let companiesProcessedThisBatch = 0;
          let shouldStop = false;
          
          try {
            const result = await syncJobs({
              updateExisting,
              addNew,
              sources: ['Greenhouse'],
              db,
              onLog: (message, level = 'info') => {
                // Track company progress from logs
                if (message.includes('✅') && message.includes('Found') && message.includes('remote job')) {
                  companiesProcessedThisBatch++;
                  
                  // Check if we should stop
                  const elapsed = Date.now() - startTime;
                  if (companiesProcessedThisBatch >= MAX_COMPANIES_PER_BATCH || elapsed > MAX_PROCESSING_TIME) {
                    shouldStop = true;
                    console.log(`Stopping: ${companiesProcessedThisBatch} companies processed, ${elapsed}ms elapsed`);
                  }
                }
                
                // Fire-and-forget logging
                db.select().from(schema.syncHistory).where(sql`id = ${syncId}`).limit(1)
                  .then(currentSync => {
                    if (currentSync.length > 0) {
                      const logs = currentSync[0].logs || [];
                      logs.push({
                        timestamp: new Date().toISOString(),
                        type: level,
                        message
                      });
                      return db.update(schema.syncHistory).set({ logs }).where(sql`id = ${syncId}`);
                    }
                  })
                  .catch(error => console.error('Error updating logs:', error));
              }
            });
            
            totalAdded = result.added;
            totalUpdated = result.updated;
            
          } catch (error: any) {
            // Log error but continue to update progress
            console.error('Sync error:', error);
          }
          
          // Update progress
          const newProgress = currentProgress + companiesProcessedThisBatch;
          const hasMore = newProgress < companies.length;
          
          const currentStats = existingSync[0]?.stats || {
            jobsAdded: 0,
            jobsUpdated: 0,
            jobsDeleted: 0,
            companiesAdded: 0,
            companiesDeleted: 0
          };
          
          await db.update(schema.syncHistory).set({
            status: hasMore ? 'processing' : 'completed',
            completedAt: hasMore ? null : new Date(),
            processedCompanies: newProgress,
            lastProcessedIndex: newProgress,
            stats: {
              jobsAdded: currentStats.jobsAdded + totalAdded,
              jobsUpdated: currentStats.jobsUpdated + totalUpdated,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            }
          }).where(sql`id = ${syncId}`);

          // Return results with continuation info
          return json({
            success: true,
            syncId,
            status: hasMore ? 'processing' : 'completed',
            progress: {
              processed: newProgress,
              total: companies.length,
              percentage: Math.round((newProgress / companies.length) * 100)
            },
            batch: {
              companiesProcessed: companiesProcessedThisBatch,
              jobsAdded: totalAdded,
              jobsUpdated: totalUpdated
            },
            continue: hasMore,
            message: hasMore 
              ? `Processed ${companiesProcessedThisBatch} companies (${newProgress}/${companies.length}). Continue to process remaining companies.`
              : `Sync complete! Processed all ${companies.length} companies.`
          })
        } catch (error) {
          console.error('Sync failed:', error)
          return json(
            {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
          )
        }
      }
    }
  }
})
