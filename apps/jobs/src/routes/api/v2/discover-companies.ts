import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'
import { searchCompany } from '../../../lib/company-search'

export const Route = createFileRoute('/api/v2/discover-companies')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        // Create a sync history record for this discovery run
        const syncId = crypto.randomUUID();
        const syncStartTime = new Date();
        const logs: Array<{ timestamp: string; type: 'info' | 'success' | 'error' | 'warning'; message: string }> = [];
        
        try {
          logs.push({
            timestamp: syncStartTime.toISOString(),
            type: 'info',
            message: '🔍 Company discovery started'
          });
          
          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Create initial sync history record
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'discovery',
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

          const COMPANIES_PER_BATCH = 5;
          
          // Get all potential companies
          const potentialCompanies = await db.select().from(schema.potentialCompanies)
            .where(sql`status IN ('pending', 'not_found')`)
            .orderBy(schema.potentialCompanies.addedAt);
          
          if (potentialCompanies.length === 0) {
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'info',
              message: 'No potential companies to discover'
            });
            
            await db.update(schema.syncHistory).set({
              status: 'completed',
              completedAt: new Date(),
              logs: logs
            }).where(sql`id = ${syncId}`);
            
            return json({
              success: true,
              message: 'No potential companies to discover',
              discovered: [],
              notFound: []
            });
          }
          
          // Get or create discovery state
          let state = await db.select().from(schema.discoveryState)
            .where(sql`status = 'active'`)
            .limit(1);
          
          let currentIndex = 0;
          let stateId = '';
          
          if (state.length > 0) {
            currentIndex = state[0].lastProcessedIndex || 0;
            stateId = state[0].id;
          } else {
            // Create initial state
            stateId = crypto.randomUUID();
            await db.insert(schema.discoveryState).values({
              id: stateId,
              lastProcessedIndex: 0,
              totalPotential: potentialCompanies.length,
              status: 'active'
            });
          }
          
          // Calculate which companies to check this batch
          const startIndex = currentIndex;
          const endIndex = Math.min(startIndex + COMPANIES_PER_BATCH, potentialCompanies.length);
          const companiesToCheck = potentialCompanies.slice(startIndex, endIndex);
          
          // Wrap around if we've reached the end
          const nextIndex = endIndex >= potentialCompanies.length ? 0 : endIndex;
          
          logs.push({
            timestamp: new Date().toISOString(),
            type: 'info',
            message: `📊 Checking companies ${startIndex}-${endIndex-1} of ${potentialCompanies.length}`
          });
          
          const discovered = [];
          const notFound = [];
          
          // Check each company
          for (const company of companiesToCheck) {
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'info',
              message: `🔎 Checking: ${company.slug}`
            });
            
            // Update status to 'checking'
            await db.update(schema.potentialCompanies).set({
              status: 'checking',
              lastCheckedAt: new Date(),
              checkCount: (company.checkCount || 0) + 1
            }).where(sql`id = ${company.id}`);
            
            // Try all sources to find the company
            let result = await searchCompany('all', company.slug);
            
            if (result.found && result.company) {
              // Company found! Add to discovered companies
              try {
                await db.insert(schema.discoveredCompanies).values({
                  slug: company.slug,
                  name: result.company.name,
                  jobCount: result.company.jobCount,
                  remoteJobCount: result.company.remoteJobCount,
                  source: result.company.slug.includes('-') ? 'greenhouse' : 'lever',
                  status: 'new',
                  departments: [],
                  sampleJobs: result.jobs?.slice(0, 3).map(j => j.title) || []
                });
                
                // Update potential company status
                await db.update(schema.potentialCompanies).set({
                  status: 'discovered'
                }).where(sql`id = ${company.id}`);
                
                discovered.push({
                  slug: company.slug,
                  name: result.company.name,
                  remoteJobCount: result.company.remoteJobCount,
                  source: result.company.slug.includes('-') ? 'greenhouse' : 'lever'
                });
                
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: 'success',
                  message: `✅ Discovered: ${company.slug} (${result.company.remoteJobCount} remote jobs)`
                });
              } catch (error: any) {
                if (error.message?.includes('UNIQUE constraint')) {
                  // Already exists, just update status
                  await db.update(schema.potentialCompanies).set({
                    status: 'discovered'
                  }).where(sql`id = ${company.id}`);
                  
                  logs.push({
                    timestamp: new Date().toISOString(),
                    type: 'info',
                    message: `ℹ️  ${company.slug} already in discovered companies`
                  });
                } else {
                  throw error;
                }
              }
            } else {
              // Not found
              await db.update(schema.potentialCompanies).set({
                status: 'not_found'
              }).where(sql`id = ${company.id}`);
              
              notFound.push(company.slug);
              logs.push({
                timestamp: new Date().toISOString(),
                type: 'warning',
                message: `❌ Not found: ${company.slug}`
              });
            }
          }
          
          // Update discovery state
          await db.update(schema.discoveryState).set({
            lastProcessedIndex: nextIndex,
            totalPotential: potentialCompanies.length
          }).where(sql`id = ${stateId}`);
          
          // Update sync history record with completion
          await db.update(schema.syncHistory).set({
            status: 'completed',
            completedAt: new Date(),
            logs: logs,
            stats: {
              jobsAdded: 0,
              jobsUpdated: 0,
              jobsDeleted: 0,
              companiesAdded: discovered.length,
              companiesDeleted: 0
            },
            totalCompanies: potentialCompanies.length,
            processedCompanies: companiesToCheck.length
          }).where(sql`id = ${syncId}`);
          
          return json({
            success: true,
            syncId,
            batch: {
              startIndex,
              endIndex,
              companiesChecked: companiesToCheck.length,
              nextIndex,
              wrappedAround: nextIndex === 0
            },
            discovered,
            notFound,
            message: `Checked ${companiesToCheck.length} companies. Found: ${discovered.length}, Not found: ${notFound.length}`
          });
          
        } catch (error) {
          console.error('Discovery failed:', error)
          
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
