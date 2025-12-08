/**
 * V3 Discovery Sync Endpoint
 * Discovers new companies from potential_companies table
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../../db/db'
import { sql, eq } from 'drizzle-orm'
import { syncQueue, withRetry } from '../../../../lib/sync-queue'

export const Route = createFileRoute('/api/v3/sync/discovery')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        const syncId = crypto.randomUUID()
        const startTime = Date.now()
        
        try {
          const ctx = context as any
          const db = await getDbFromContext(ctx)
          
          // Clear logs for this sync run
          syncQueue.clearLogs()
          syncQueue.log('info', 'discovery', 'Starting company discovery')
          
          // Create sync history record
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'discovery',
            source: null,
            status: 'running',
            startedAt: new Date(),
            logs: [{ timestamp: new Date().toISOString(), type: 'info', message: 'Starting discovery' }],
            stats: { companiesAdded: 0, companiesChecked: 0 }
          })
          
          // Get pending potential companies
          const potentialCompanies = await db.select()
            .from(schema.potentialCompanies)
            .where(sql`status = 'pending' OR status IS NULL`)
            .limit(5)  // Process 5 at a time
          
          let companiesChecked = 0
          let companiesAdded = 0
          const discovered: string[] = []
          const notFound: string[] = []
          
          for (const potential of potentialCompanies) {
            companiesChecked++
            const slug = potential.slug
            
            try {
              // Try Greenhouse first
              const ghUrl = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
              syncQueue.log('info', 'discovery', `Checking ${slug} - Greenhouse API`)
              const ghResponse = await fetch(ghUrl)
              
              if (ghResponse.ok) {
                const data = await ghResponse.json() as any
                const jobs = data.jobs || []
                syncQueue.log('info', 'discovery', `${slug}: Greenhouse HTTP ${ghResponse.status}, ${jobs.length} total jobs`)
                const remoteJobs = jobs.filter((j: any) => {
                  const loc = j.location?.name?.toLowerCase() || ''
                  return loc.includes('remote') || loc.includes('anywhere')
                })
                
                syncQueue.log('info', 'discovery', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
                
                if (remoteJobs.length > 0) {
                  // Add to discovered companies
                  await db.insert(schema.discoveredCompanies).values({
                    slug,
                    name: slug,
                    source: 'Greenhouse',
                    remoteJobCount: remoteJobs.length
                  }).onConflictDoNothing()
                  
                  companiesAdded++
                  discovered.push(slug)
                  syncQueue.log('success', 'discovery', `✓ Discovered ${slug} (Greenhouse, ${remoteJobs.length} remote jobs)`)
                }
              } else {
                syncQueue.log('info', 'discovery', `${slug}: Greenhouse HTTP ${ghResponse.status}`)
              }
              
              // Try Lever if Greenhouse didn't work
              if (!ghResponse.ok) {
                const lvUrl = `https://api.lever.co/v0/postings/${slug}`
                syncQueue.log('info', 'discovery', `Checking ${slug} - Lever API`)
                const lvResponse = await fetch(lvUrl)
                
                if (lvResponse.ok) {
                  const jobs = await lvResponse.json() as any[]
                  syncQueue.log('info', 'discovery', `${slug}: Lever HTTP ${lvResponse.status}, ${jobs.length} total jobs`)
                  const remoteJobs = jobs.filter((j: any) => {
                    const loc = j.categories?.location?.toLowerCase() || ''
                    return loc.includes('remote')
                  })
                  
                  syncQueue.log('info', 'discovery', `${slug}: ${remoteJobs.length}/${jobs.length} remote jobs`)
                  
                  if (remoteJobs.length > 0) {
                    await db.insert(schema.discoveredCompanies).values({
                      slug,
                      name: slug,
                      source: 'Lever',
                      remoteJobCount: remoteJobs.length
                    }).onConflictDoNothing()
                    
                    companiesAdded++
                    discovered.push(slug)
                    syncQueue.log('success', 'discovery', `✓ Discovered ${slug} (Lever, ${remoteJobs.length} remote jobs)`)
                  }
                } else {
                  syncQueue.log('info', 'discovery', `${slug}: Lever HTTP ${lvResponse.status}`)
                }
              }
              
              // Mark as checked
              await db.update(schema.potentialCompanies).set({
                status: discovered.includes(slug) ? 'discovered' : 'not_found',
                lastCheckedAt: new Date(),
                checkCount: (potential.checkCount || 0) + 1
              }).where(eq(schema.potentialCompanies.id, potential.id))
              
              if (!discovered.includes(slug)) {
                notFound.push(slug)
              }
              
            } catch (checkError) {
              syncQueue.log('warning', 'discovery', `Error checking ${slug}: ${checkError}`)
            }
          }
          
          syncQueue.log('success', 'discovery', `Checked ${companiesChecked}, discovered ${companiesAdded}`)
          
          // Update sync history
          await db.update(schema.syncHistory).set({
            status: 'completed',
            completedAt: new Date(),
            logs: syncQueue.getLogs().slice(0, 20),
            stats: { companiesAdded, companiesChecked }
          }).where(sql`id = ${syncId}`)
          
          return json({
            success: true,
            companiesChecked,
            companiesAdded,
            discovered,
            notFound,
            duration: Date.now() - startTime
          })
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          syncQueue.log('error', 'discovery', `Fatal error: ${errorMsg}`)
          
          try {
            const ctx = context as any
            const db = await getDbFromContext(ctx)
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date(),
              logs: syncQueue.getLogs().slice(0, 20)
            }).where(sql`id = ${syncId}`)
          } catch {}
          
          return json({
            success: false,
            error: errorMsg,
            duration: Date.now() - startTime
          }, { status: 500 })
        }
      }
    }
  }
})
