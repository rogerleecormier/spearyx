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

          // Get list of all companies
          const { default: companiesData } = await import('../../../lib/job-sources/greenhouse-companies.json');
          const allCompanies: string[] = [];
          Object.values((companiesData as any).categories).forEach((category: any) => {
            allCompanies.push(...category.companies);
          });
          const companies = [...new Set(allCompanies)]; // 151 companies
          
          const COMPANIES_PER_BATCH = 10;
          
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
          
          // Process this batch - ONLY the companies in companiesToProcess
          const { syncJobs } = await import('../../../lib/job-sync');
          
          let totalAdded = 0;
          let totalUpdated = 0;
          let hasError = false;
          
          try {
            const result = await syncJobs({
              updateExisting: true,
              addNew: true,
              sources: ['Greenhouse'],
              companyFilter: companiesToProcess, // CRITICAL: Only process these companies
              db,
              onLog: (message, level = 'info') => {
                console.log(`[${level}] ${message}`);
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: level as 'info' | 'success' | 'error' | 'warning',
                  message
                });
              }
            });
            
            totalAdded = result.added;
            totalUpdated = result.updated;
            
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'success',
              message: `✅ Batch complete: +${totalAdded} added, ${totalUpdated} updated`
            });
            
          } catch (error: any) {
            hasError = true;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Batch sync error:', error);
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'error',
              message: `❌ Batch sync error: ${errorMessage}`
            });
          }
          
          // Update batch state for next run
          await db.update(schema.syncHistory).set({
            lastProcessedIndex: nextIndex,
            processedCompanies: endIndex,
          }).where(sql`id = ${stateId}`);
          
          // Update sync history record with completion
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
            totalCompanies: companies.length,
            processedCompanies: companiesToProcess.length
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
