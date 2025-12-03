import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

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

          // Get list of all companies
          const { default: companiesData } = await import('../../../lib/job-sources/greenhouse-companies.json');
          const allCompanies: string[] = [];
          Object.values((companiesData as any).categories).forEach((category: any) => {
            allCompanies.push(...category.companies);
          });
          const companies = [...new Set(allCompanies)]; // 151 companies
          
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
            message: `📋 Companies: ${companiesToProcess.join(', ')}`
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
          
          for (const company of companiesToProcess) {
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
                message: `Processing ${company}...`
              });

              // Force save logs immediately to ensure we know which company is being processed
              await db.update(schema.syncHistory).set({
                logs: logs
              }).where(sql`id = ${syncId}`);

              let lastLogSave = Date.now();
              
              // Get current job offset for this company
              const companyProgress = await db.select().from(schema.companyJobProgress)
                .where(sql`company_slug = ${company}`)
                .limit(1);
              
              const currentOffset = companyProgress.length > 0 ? (companyProgress[0].lastJobOffset || 0) : 0;
              
              if (currentOffset > 0) {
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'info',
                  message: `  📍 Resuming from job offset ${currentOffset}`
                });
              }

              const result = await syncJobs({
                updateExisting: true,
                addNew: true,
                sources: ['Greenhouse'],
                companyFilter: [company], // Process one company at a time
                maxJobsPerCompany: MAX_JOBS_PER_BATCH, // Limit jobs to prevent timeout
                jobOffset: currentOffset, // Start from saved offset
                db,
                onLog: (message, level = 'info') => {
                  console.log(`[${level}] ${message}`);
                  logs.push({
                    timestamp: new Date().toISOString(),
                    type: level as 'info' | 'success' | 'error' | 'warning',
                    message
                  });

                  // Periodically save logs to DB (every 2 seconds) to ensure visibility if it crashes
                  if (Date.now() - lastLogSave > 2000) {
                    lastLogSave = Date.now();
                    const savePromise = db.update(schema.syncHistory).set({
                      logs: logs
                    }).where(sql`id = ${syncId}`);
                    
                    if (ctx.executionCtx && ctx.executionCtx.waitUntil) {
                      ctx.executionCtx.waitUntil(savePromise);
                    } else {
                      // Fire and forget if no waitUntil
                      savePromise.catch(e => console.error('Failed to save logs:', e));
                    }
                  }
                }
              });
              
              totalAdded += result.added;
              totalUpdated += result.updated;
              totalSkipped += result.skipped;
              companiesProcessedCount++;
              
              // Calculate next job offset for this company
              // Extract total jobs from result (we'll need to modify syncJobs to return this)
              const jobsProcessed = result.added + result.updated + result.skipped;
              const newOffset = currentOffset + jobsProcessed;
              
              // Determine if we've processed all jobs (need total jobs count)
              // For now, if we processed fewer than MAX_JOBS_PER_BATCH, we're done
              const allJobsProcessed = jobsProcessed < MAX_JOBS_PER_BATCH;
              const nextOffset = allJobsProcessed ? 0 : newOffset;
              
              // Update or insert company job progress
              const existingProgress = await db.select().from(schema.companyJobProgress)
                .where(sql`company_slug = ${company}`)
                .limit(1);
              
              if (existingProgress.length > 0) {
                await db.update(schema.companyJobProgress).set({
                  lastJobOffset: nextOffset,
                  lastSyncedAt: new Date(),
                  updatedAt: new Date()
                }).where(sql`company_slug = ${company}`);
              } else {
                await db.insert(schema.companyJobProgress).values({
                  companySlug: company,
                  source: 'Greenhouse',
                  lastJobOffset: nextOffset,
                  totalJobsDiscovered: 0, // We'll update this when we have the info
                  lastSyncedAt: new Date(),
                  updatedAt: new Date()
                });
              }

              // Ensure company is in discovered_companies table so it shows up in dashboard
              try {
                await db.insert(schema.discoveredCompanies).values({
                  slug: company,
                  name: company, // Use slug as name initially
                  source: 'greenhouse',
                  status: 'added',
                  jobCount: 0,
                  remoteJobCount: 0
                }).onConflictDoNothing();
              } catch (err) {
                // Ignore error if insert fails, it's not critical
                console.error(`Failed to add ${company} to discovered_companies:`, err);
              }
              
              if (nextOffset === 0 && currentOffset > 0) {
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `  ✅ ${company}: All jobs processed, offset reset to 0`
                });
              } else if (nextOffset > 0) {
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'info',
                  message: `  💾 ${company}: Next offset saved as ${nextOffset}`
                });
              }
              
              // Update DB with progress after EACH company
              // This ensures that if the worker crashes/times out, we still have the logs for processed companies
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

              // Update batch state incrementally!
              // This ensures we don't repeat companies if the worker crashes
              let newIndex = startIndex + companiesProcessedCount;
              if (newIndex >= companies.length) newIndex = 0; // Wrap around

              await db.update(schema.syncHistory).set({
                lastProcessedIndex: newIndex,
                processedCompanies: newIndex,
              }).where(sql`id = ${stateId}`);

            } catch (error) {
              hasError = true;
              console.error(`Error processing ${company}:`, error);
              logs.push({
                timestamp: new Date().toISOString(),
                type: 'error',
                message: `❌ Error processing ${company}: ${error instanceof Error ? error.message : 'Unknown error'}`
              });
              
              // Save error state
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
