/**
 * V3 ATS Sync Endpoint
 * Syncs jobs from Greenhouse and Lever (one company per call)
 * Uses TanStack Pacer for throttling
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../../db/db'
import { sql, eq, inArray } from 'drizzle-orm'
import { syncQueue, sourceFetchers, withRetry, getNextAtsSource, type SyncResult } from '../../../../lib/sync-queue'
import { determineCategoryId } from '../../../../lib/job-sources'

// Import company lists
import greenhouseCompanies from '../../../../lib/job-sources/greenhouse-companies.json'
import leverCompanies from '../../../../lib/job-sources/lever-companies.json'

interface CompanyDatabase {
  categories: { [key: string]: { companies: string[] } }
}

function getGreenhouseCompanies(): string[] {
  const data = greenhouseCompanies as CompanyDatabase
  const all: string[] = []
  Object.values(data.categories).forEach(cat => all.push(...cat.companies))
  return [...new Set(all)]
}

function getLeverCompanies(): string[] {
  const data = leverCompanies as CompanyDatabase
  const all: string[] = []
  Object.values(data.categories).forEach(cat => all.push(...cat.companies))
  return [...new Set(all)]
}

export const Route = createFileRoute('/api/v3/sync/ats')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        const syncId = crypto.randomUUID()
        const startTime = Date.now()
        
        try {
          const ctx = context as any
          const db = await getDbFromContext(ctx)
          
          // Get or create batch state
          let batchState = await db.select()
            .from(schema.syncHistory)
            .where(sql`status = 'batch_state' AND sync_type = 'ats'`)
            .limit(1)
          
          let atsIndex = 0
          let lastSource: 'greenhouse' | 'lever' = 'lever' // Will flip to greenhouse
          
          if (batchState.length > 0 && batchState[0].stats) {
            const state = batchState[0].stats as any
            atsIndex = state.atsIndex || 0
            lastSource = state.lastSource || 'lever'
          }
          
          // Alternate between sources
          const source = getNextAtsSource(lastSource)
          const companies = source === 'greenhouse' ? getGreenhouseCompanies() : getLeverCompanies()
          
          // Get next company
          if (atsIndex >= companies.length) {
            atsIndex = 0 // Reset to start
          }
          
          const company = companies[atsIndex]
          const nextIndex = atsIndex + 1
          
          // Clear logs for this sync run
          syncQueue.clearLogs()
          syncQueue.log('info', source, `Starting sync for ${company}`)
          syncQueue.log('info', source, `Company index: ${atsIndex}/${companies.length}`)
          
          // Create sync history record with enhanced stats
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'job_sync',
            source: source,
            status: 'running',
            startedAt: new Date(),
            logs: [{ timestamp: new Date().toISOString(), type: 'info', message: `Syncing ${company}` }],
            stats: { 
              jobsAdded: 0, 
              jobsUpdated: 0, 
              jobsDeleted: 0, 
              company,
              companyIndex: atsIndex,
              totalCompanies: companies.length
            }
          })
          
          // Fetch jobs from source
          let jobsAdded = 0
          let jobsUpdated = 0
          
          try {
            const fetcher = sourceFetchers[source]
            const apiUrl = source === 'greenhouse'
              ? `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`
              : `https://api.lever.co/v0/postings/${company}`
            
            const response = await withRetry(
              () => fetcher(apiUrl),
              {
                maxRetries: 2,
                baseDelayMs: 1000,
                onRetry: (attempt, error) => {
                  syncQueue.log('warning', source, `Retry ${attempt} for ${company}: ${error.message}`)
                }
              }
            )
            
            syncQueue.log('info', source, `API: ${apiUrl}`)
            syncQueue.log('info', source, `HTTP ${response.status} ${response.statusText}`)
            
            if (!response.ok) {
              if (response.status === 404) {
                syncQueue.log('warning', source, `${company}: No job board found (HTTP 404)`)
                // Continue to update batch state below
              } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }
            } else {
              // Check content-type to avoid parsing HTML as JSON
              const contentType = response.headers.get('content-type') || ''
              if (!contentType.includes('application/json')) {
                syncQueue.log('warning', source, `${company}: Invalid content-type: ${contentType.substring(0, 50)}`)
                // Continue to update batch state below
              } else {
                const data = await response.json() as any
                const jobs = source === 'greenhouse' ? (data.jobs || []) : (data || [])
                
                syncQueue.log('info', source, `Total jobs from API: ${jobs.length}`)
                
                // Filter for remote jobs
                const remoteJobs = jobs.filter((job: any) => {
                  if (source === 'greenhouse') {
                    const loc = job.location?.name?.toLowerCase() || ''
                    return loc.includes('remote') || loc.includes('anywhere')
                  } else {
                    const cats = job.categories || {}
                    const loc = cats.location?.toLowerCase() || ''
                    const commitment = cats.commitment?.toLowerCase() || ''
                    return loc.includes('remote') || commitment.includes('remote')
                  }
                })
                
                syncQueue.log('info', source, `Remote jobs filtered: ${remoteJobs.length}/${jobs.length}`)
                
                // Process jobs
                for (const job of remoteJobs) {
                  const sourceUrl = source === 'greenhouse'
                    ? job.absolute_url
                    : job.hostedUrl
                  
                  if (!sourceUrl) continue
                  
                  // Check if exists
                  const existing = await db.select()
                    .from(schema.jobs)
                    .where(eq(schema.jobs.sourceUrl, sourceUrl))
                    .limit(1)
                  
                  const title = source === 'greenhouse' ? job.title : job.text
                  const description = source === 'greenhouse'
                    ? job.content || ''
                    : job.descriptionPlain || job.description || ''
                  
                  const categoryId = determineCategoryId(title, description, [])
                  
                  if (existing.length > 0) {
                    await db.update(schema.jobs).set({
                      title,
                      company,
                      descriptionRaw: description,
                      isCleansed: 0,
                      updatedAt: new Date(),
                      categoryId
                    }).where(eq(schema.jobs.id, existing[0].id))
                    jobsUpdated++
                  } else {
                    await db.insert(schema.jobs).values({
                      title,
                      company,
                      descriptionRaw: description,
                      isCleansed: 0,
                      sourceUrl,
                      sourceName: source === 'greenhouse' ? 'Greenhouse' : 'Lever',
                      categoryId,
                      remoteType: 'fully_remote'
                    })
                    jobsAdded++
                  }
                }
                
                syncQueue.log('success', source, `${company}: ${jobsAdded} added, ${jobsUpdated} updated`)
              }
            }
          } catch (fetchError) {
            const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError)
            syncQueue.log('error', source, `${company} failed: ${errorMsg}`)
            
            // Update sync history with failure
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date(),
              logs: syncQueue.getLogs().slice(0, 20),
              stats: { jobsAdded, jobsUpdated, jobsDeleted: 0, company, error: errorMsg }
            }).where(sql`id = ${syncId}`)
            
            // Still update batch state to move forward
            await updateBatchState(db, source, nextIndex)
            
            return json({
              success: false,
              source,
              company,
              error: errorMsg,
              duration: Date.now() - startTime
            })
          }
          
          // Update sync history success with enhanced stats
          await db.update(schema.syncHistory).set({
            status: 'completed',
            completedAt: new Date(),
            logs: syncQueue.getLogs().slice(0, 30),
            stats: { 
              jobsAdded, 
              jobsUpdated, 
              jobsDeleted: 0, 
              company,
              companyIndex: atsIndex,
              totalCompanies: companies.length,
              durationMs: Date.now() - startTime
            }
          }).where(sql`id = ${syncId}`)
          
          // Update batch state
          await updateBatchState(db, source, nextIndex)
          
          const result: SyncResult = {
            success: true,
            source,
            company,
            jobsAdded,
            jobsUpdated,
            jobsDeleted: 0,
            duration: Date.now() - startTime
          }
          
          return json(result)
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          syncQueue.log('error', 'ats', `Fatal error: ${errorMsg}`)
          
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

async function updateBatchState(db: any, source: string, nextIndex: number) {
  const existing = await db.select()
    .from(schema.syncHistory)
    .where(sql`status = 'batch_state' AND sync_type = 'ats'`)
    .limit(1)
  
  const state = {
    atsIndex: nextIndex,
    lastSource: source,
    lastUpdated: new Date().toISOString()
  }
  
  if (existing.length > 0) {
    await db.update(schema.syncHistory).set({
      stats: state,
      completedAt: new Date()
    }).where(sql`id = ${existing[0].id}`)
  } else {
    await db.insert(schema.syncHistory).values({
      id: crypto.randomUUID(),
      syncType: 'ats',
      status: 'batch_state',
      startedAt: new Date(),
      completedAt: new Date(),
      stats: state
    })
  }
}
