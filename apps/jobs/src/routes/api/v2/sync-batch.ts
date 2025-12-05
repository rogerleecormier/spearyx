import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

interface SyncItem {
  name: string;      // Company slug or Source name
  source: string;    // 'Greenhouse', 'Lever', 'RemoteOK', 'Himalayas'
  isPseudo: boolean; // True for aggregators like RemoteOK
}

let cachedSyncItems: SyncItem[] | null = null;

export const Route = createFileRoute('/api/v2/sync-batch')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        // Create a sync history record for this run
        const syncId = crypto.randomUUID();
        const syncStartTime = new Date();
        const logs: Array<{ timestamp: string; type: 'info' | 'success' | 'error' | 'warning'; message: string }> = [];
        
        // Setup execution context for timeout handling
        const ctx = context as any;
        
        // Ensure we catch timeouts and mark sync as failed
        if (ctx.executionCtx && ctx.executionCtx.waitUntil) {
          // This doesn't actually stop execution but allows us to run cleanup
          // Real timeout handling needs to be inside the logic loop
        }
        
        try {
          logs.push({
            timestamp: syncStartTime.toISOString(),
            type: 'info',
            message: '🔄 Batch sync started'
          });
          
          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Create initial sync history record
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'job_sync',
            status: 'running',
            startedAt: syncStartTime,
            logs: logs,
            stats: {
              jobsAdded: 0,
              jobsUpdated: 0,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            }
          });

          // Removed aggressive stale sync cleanup that was killing active syncs
          // Syncs will clean themselves up when they complete or timeout naturally

          // Get list of all companies/sources to sync
          // We unify everything into a single list of "SyncItems" to ensure fair scheduling
          
          if (!cachedSyncItems) {
            const allItems: SyncItem[] = [];

            // 1. Add Greenhouse Companies
            const { default: ghData } = await import('../../../lib/job-sources/greenhouse-companies.json');
            Object.values((ghData as any).categories).forEach((category: any) => {
              category.companies.forEach((slug: string) => {
                allItems.push({ name: slug, source: 'Greenhouse', isPseudo: false });
              });
            });

            // 2. Add Lever Companies
            const { default: leverData } = await import('../../../lib/job-sources/lever-companies.json');
            Object.values((leverData as any).categories).forEach((category: any) => {
              category.companies.forEach((slug: string) => {
                allItems.push({ name: slug, source: 'Lever', isPseudo: false });
              });
            });

            // 3. Add Aggregators (Pseudo-companies)
            // We treat them as single items in the batch loop
            allItems.push({ name: 'remoteok', source: 'RemoteOK', isPseudo: true });
            allItems.push({ name: 'himalayas', source: 'Himalayas', isPseudo: true });
            
            // Deduplicate based on name+source (though unlikely to collide)
            const uniqueItems = Array.from(new Map(allItems.map(item => [`${item.source}:${item.name}`, item])).values());
            
            // Sort for consistent ordering (optional, but good for debugging)
            uniqueItems.sort((a, b) => a.name.localeCompare(b.name));
            
            cachedSyncItems = uniqueItems;
          }
          
          const companies = cachedSyncItems; // Renaming for compatibility with existing code structure, though it's now "items"
          
          const COMPANIES_PER_BATCH = 5; // Reduced from 10 to avoid CPU timeout
          
          // Get or create batch state
          let batchState = await db.select().from(schema.syncHistory)
            .where(sql`status = 'batch_state'`)
            .limit(1);
          
          let currentBatchIndex = 0;
          let stateId = '';
          
          if (batchState.length > 0) {
            currentBatchIndex = batchState[0].lastProcessedIndex || 0;
            stateId = batchState[0].id;
          } else {
            // Create initial state
            stateId = crypto.randomUUID();
            await db.insert(schema.syncHistory).values({
              id: stateId,
              status: 'batch_state',
              lastProcessedIndex: 0,
              totalCompanies: companies.length,
              stats: {
                jobsAdded: 0,
                jobsUpdated: 0,
                jobsDeleted: 0,
                companiesAdded: 0,
                companiesDeleted: 0
              },
              logs: []
            });
          }
          
          // Calculate which companies to process this batch
          const startIndex = currentBatchIndex;
          const endIndex = Math.min(startIndex + COMPANIES_PER_BATCH, companies.length);
          const companiesToProcess = companies.slice(startIndex, endIndex);
          
          // If we've reached the end, wrap around to the beginning
          const nextIndex = endIndex >= companies.length ? 0 : endIndex;
          
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: `📊 Processing batch: companies ${startIndex}-${endIndex-1} of ${companies.length}`
          });
          
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: `📋 Items: ${companiesToProcess.map(c => `${c.name} (${c.source})`).join(', ')}`
          });
          
          // Process companies one by one to ensure progress is saved
          const { syncJobs } = await import('../../../lib/job-sync');
          
          let totalAdded = 0;
          let totalUpdated = 0;
          let totalSkipped = 0;
          let companiesProcessedCount = 0;
          let hasError = false;
          
          // Check execution time to prevent timeout
          const MAX_EXECUTION_TIME_MS = 25000; // 25 seconds (leaving 5s buffer)
          const MAX_JOBS_PER_BATCH = 20; // Process max 20 jobs per company to stay under timeout
          
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: `⚙️  Job batching enabled: Max ${MAX_JOBS_PER_BATCH} jobs per company per sync run`
          });
          
          for (const item of companiesToProcess) {
            // Check if we're running out of time
            if (new Date().getTime() - syncStartTime.getTime() > MAX_EXECUTION_TIME_MS) {
              logs.push({
                timestamp: new Date().toISOString(),
                type: 'warning',
                message: '⚠️ Execution time limit approaching, stopping batch early'
              });
              
              // Save final state before exiting
              await db.update(schema.syncHistory).set({
                logs: logs,
                stats: {
                  jobsAdded: totalAdded,
                  jobsUpdated: totalUpdated,
                  jobsDeleted: 0,
                  companiesAdded: 0,
                  companiesDeleted: 0
                },
                processedCompanies: companiesProcessedCount
              }).where(sql`id = ${syncId}`);
              
              break;
            }

            try {
              logs.push({
                timestamp: new Date().toISOString(),
                type: 'info',
                message: `Processing ${item.name} (${item.source})...`
              });

              // Force save logs immediately
              await db.update(schema.syncHistory).set({
                logs: logs
              }).where(sql`id = ${syncId}`);

              let lastLogSave = Date.now();
              
              // Get current job offset for this item
              // For aggregators, we use their name as the slug
              const companySlug = item.name;
              
              const companyProgress = await db.select().from(schema.companyJobProgress)
                .where(sql`company_slug = ${companySlug}`)
                .limit(1);
              
              const currentOffset = companyProgress.length > 0 ? (companyProgress[0].lastJobOffset || 0) : 0;
              
              if (currentOffset > 0) {
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'info',
                  message: `  📍 Resuming from job offset ${currentOffset}`
                });
              }

              // Configure sync options based on item type
              const syncOptions: any = {
                updateExisting: true,
                addNew: true,
                sources: [item.source],
                maxJobsPerCompany: MAX_JOBS_PER_BATCH,
                jobOffset: currentOffset,
                db,
                onLog: (message: string, level: string = 'info') => {
                  console.log(`[${level}] ${message}`);
                  logs.push({
                    timestamp: new Date().toISOString(),
                    type: level as 'info' | 'success' | 'error' | 'warning',
                    message
                  });

                  // Periodically save logs
                  if (Date.now() - lastLogSave > 2000) {
                    lastLogSave = Date.now();
                    const savePromise = db.update(schema.syncHistory).set({
                      logs: logs
                    }).where(sql`id = ${syncId}`);
                    
                    if (ctx.executionCtx && ctx.executionCtx.waitUntil) {
                      ctx.executionCtx.waitUntil(savePromise);
                    } else {
                      savePromise.catch(e => console.error('Failed to save logs:', e));
                    }
                  }
                }
              };

              // Only apply company filter for non-pseudo companies (Greenhouse/Lever)
              // Aggregators (RemoteOK/Himalayas) fetch everything, so no company filter
              if (!item.isPseudo) {
                syncOptions.companyFilter = [item.name];
              }

              const result = await syncJobs(syncOptions);
              
              totalAdded += result.added;
              totalUpdated += result.updated;
              totalSkipped += result.skipped;
              companiesProcessedCount++;
              
              // Calculate next job offset
              const jobsProcessed = result.added + result.updated + result.skipped;
              const newOffset = currentOffset + jobsProcessed;
              
              // Determine if we've processed all jobs
              const allJobsProcessed = jobsProcessed < MAX_JOBS_PER_BATCH;
              const nextOffset = allJobsProcessed ? 0 : newOffset;
              
              // Update or insert progress
              const existingProgress = await db.select().from(schema.companyJobProgress)
                .where(sql`company_slug = ${companySlug}`)
                .limit(1);
              
              if (existingProgress.length > 0) {
                await db.update(schema.companyJobProgress).set({
                  lastJobOffset: nextOffset,
                  lastSyncedAt: new Date(),
                  updatedAt: new Date()
                }).where(sql`company_slug = ${companySlug}`);
              } else {
                await db.insert(schema.companyJobProgress).values({
                  companySlug: companySlug,
                  source: item.source,
                  lastJobOffset: nextOffset,
                  totalJobsDiscovered: 0,
                  lastSyncedAt: new Date(),
                  updatedAt: new Date()
                });
              }

              // Ensure company is in discovered_companies table (only for real companies)
              if (!item.isPseudo) {
                try {
                  await db.insert(schema.discoveredCompanies).values({
                    slug: item.name,
                    name: item.name,
                    source: item.source.toLowerCase(),
                    status: 'added',
                    jobCount: 0,
                    remoteJobCount: 0
                  }).onConflictDoNothing();
                } catch (err) {
                  console.error(`Failed to add ${item.name} to discovered_companies:`, err);
                }
              }
              
              if (nextOffset === 0 && currentOffset > 0) {
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `  ✅ ${item.name}: All jobs processed, offset reset to 0`
                });
              } else if (nextOffset > 0) {
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'info',
                  message: `  💾 ${item.name}: Next offset saved as ${nextOffset}`
                });
              }
              
              // Update DB with progress after EACH item
              await db.update(schema.syncHistory).set({
                logs: logs,
                stats: {
                  jobsAdded: totalAdded,
                  jobsUpdated: totalUpdated,
                  jobsDeleted: 0,
                  companiesAdded: 0,
                  companiesDeleted: 0
                },
                processedCompanies: companiesProcessedCount
              }).where(sql`id = ${syncId}`);

              // Update batch state incrementally
              let newIndex = startIndex + companiesProcessedCount;
              if (newIndex >= companies.length) newIndex = 0; // Wrap around

              await db.update(schema.syncHistory).set({
                lastProcessedIndex: newIndex,
                processedCompanies: newIndex,
              }).where(sql`id = ${stateId}`);

            } catch (error) {
              hasError = true;
              console.error(`Error processing ${item.name}:`, error);
              logs.push({
                timestamp: new Date().toISOString(),
                type: 'error',
                message: `❌ Error processing ${item.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
              });
              
              await db.update(schema.syncHistory).set({
                logs: logs
              }).where(sql`id = ${syncId}`);
            }
          }
            
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'success',
            message: `✅ Batch completed: ${totalAdded} added, ${totalUpdated} updated`
          });
          
          // Final update
          await db.update(schema.syncHistory).set({
            status: hasError ? 'failed' : 'completed',
            completedAt: new Date(),
            logs: logs,
            stats: {
              jobsAdded: totalAdded,
              jobsUpdated: totalUpdated,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            },
            processedCompanies: companiesProcessedCount,
            failedCompanies: [] // We could track specific failed companies here if needed
          }).where(sql`id = ${syncId}`);
          
          // Final update
          await db.update(schema.syncHistory).set({
            status: hasError ? 'failed' : 'completed',
            completedAt: new Date(),
            logs: logs,
            stats: {
              jobsAdded: totalAdded,
              jobsUpdated: totalUpdated,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            },
            processedCompanies: companiesProcessedCount,
            failedCompanies: [] // We could track specific failed companies here if needed
          }).where(sql`id = ${syncId}`);
          
          return json({
            success: true,
            syncId,
            batch: {
              startIndex,
              endIndex,
              companiesProcessed: companiesToProcess.length,
              companies: companiesToProcess,
              nextIndex,
              wrappedAround: nextIndex === 0
            },
            stats: {
              jobsAdded: totalAdded,
              jobsUpdated: totalUpdated
            },
            message: `Processed ${companiesToProcess.length} companies (${startIndex}-${endIndex-1}). Next batch starts at ${nextIndex}.`
          });
          
        } catch (error) {
          console.error('Batch sync failed:', error)
          
          // Try to update sync history with error
          try {
            const ctx = context as any
            const db = await getDbFromContext(ctx)
            
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'error',
              message: `❌ Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
            
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date(),
              logs: logs
            }).where(sql`id = ${syncId}`);
          } catch (dbError) {
            console.error('Failed to update sync history:', dbError);
          }
          
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
