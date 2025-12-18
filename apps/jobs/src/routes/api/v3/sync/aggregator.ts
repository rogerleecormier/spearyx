import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../../db/db'
import { sql, eq, inArray } from 'drizzle-orm'
import { syncQueue, sourceFetchers, withRetry, getNextAggregatorSource, type SyncResult } from '../../../../lib/sync-queue'
import { determineCategoryId } from '../../../../lib/job-sources'

// RemoteOK tags to cycle through for better job coverage
const REMOTEOK_TAGS = [
  'dev',        // ~100 jobs - Development
  'engineer',   // ~99 jobs - Engineering
  'devops',     // ~44 jobs - DevOps
  'design',     // ~99 jobs - Design
  'marketing',  // ~99 jobs - Marketing
  'developer',  // ~68 jobs - Developer
  'frontend',   // Frontend development
  'backend',    // Backend development
  'fullstack',  // Full stack
  'product',    // Product management
  'project',    // Project management
  'data',       // Data roles
  'support',    // Customer support
]

// Jobicy industries (from their API docs)
const JOBICY_INDUSTRIES = [
  'dev',              // Development
  'marketing',        // Marketing
  'design-multimedia', // Design & Multimedia
  'business',         // Business
  'engineering',      // Engineering
  'hr',               // Human Resources
  'copywriting',      // Writing/Copywriting
  'data-science',     // Data Science
  'accounting-finance', // Finance/Accounting
  'management',       // Management/Product
  'technical-support', // Technical Support
  'seo'               // SEO
]

// 3-way source rotation
const AGGREGATOR_SOURCES = ['remoteok', 'himalayas', 'jobicy'] as const
type AggregatorSource = typeof AGGREGATOR_SOURCES[number]

function getNextSource(lastSource: AggregatorSource): AggregatorSource {
  const currentIndex = AGGREGATOR_SOURCES.indexOf(lastSource)
  const nextIndex = (currentIndex + 1) % AGGREGATOR_SOURCES.length
  return AGGREGATOR_SOURCES[nextIndex]
}

export const Route = createFileRoute('/api/v3/sync/aggregator')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        const syncId = crypto.randomUUID()
        const startTime = Date.now()
        
        try {
          const ctx = context as any
          let db;
          
          // Try to get DB connection with explicit error handling
          try {
            db = await getDbFromContext(ctx)
          } catch (dbError) {
            const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError)
            console.error('[Aggregator Sync] DB connection failed:', dbErrorMsg)
            return json({
              success: false,
              error: `Database connection failed: ${dbErrorMsg}`,
              duration: Date.now() - startTime
            }, { status: 500 })
          }
          
          // Get batch state to determine which aggregator to sync and tag index
          let batchState = await db.select()
            .from(schema.syncHistory)
            .where(sql`status = 'batch_state' AND sync_type = 'aggregator'`)
            .limit(1)
          
          let lastSource: AggregatorSource = 'jobicy' // Start with jobicy so first run goes to remoteok
          let remoteokTagIndex = 0
          let jobicyIndustryIndex = 0
          let himalayasOffset = 0
          
          if (batchState.length > 0 && batchState[0].stats) {
            const state = batchState[0].stats as any
            lastSource = state.lastSource || 'jobicy'
            remoteokTagIndex = state.remoteokTagIndex || 0
            jobicyIndustryIndex = state.jobicyIndustryIndex || 0
            himalayasOffset = state.himalayasOffset || 0
          }
          
          const source = getNextSource(lastSource)
          const sourceNameMap: Record<AggregatorSource, string> = {
            remoteok: 'RemoteOK',
            himalayas: 'Himalayas',
            jobicy: 'Jobicy'
          }
          const sourceName = sourceNameMap[source]
          
          // For RemoteOK/Jobicy, use tag/industry-based queries
          let currentTag = ''
          let apiUrl = ''
          
          // Clear logs for this sync run
          syncQueue.clearLogs()
          
          if (source === 'remoteok') {
            currentTag = REMOTEOK_TAGS[remoteokTagIndex % REMOTEOK_TAGS.length]
            apiUrl = `https://remoteok.com/api?tag=${currentTag}`
            syncQueue.log('info', source, `Syncing ${sourceName} tag: ${currentTag} (index ${remoteokTagIndex}/${REMOTEOK_TAGS.length})`)
          } else if (source === 'himalayas') {
            apiUrl = `https://himalayas.app/jobs/api?limit=50&offset=${himalayasOffset}`
            syncQueue.log('info', source, `Starting ${sourceName} sync (offset: ${himalayasOffset})`)
          } else {
            // Jobicy with industry rotation
            const industry = JOBICY_INDUSTRIES[jobicyIndustryIndex % JOBICY_INDUSTRIES.length]
            currentTag = industry
            apiUrl = `https://jobicy.com/api/v2/remote-jobs?count=50&industry=${industry}`
            syncQueue.log('info', source, `Syncing ${sourceName} industry: ${industry} (index ${jobicyIndustryIndex}/${JOBICY_INDUSTRIES.length})`)
          }
          
          syncQueue.log('info', source, `API: ${apiUrl}`)
          
          // Create sync history record with enhanced stats
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'job_sync',
            source: source,
            status: 'running',
            startedAt: new Date(),
            logs: [{ timestamp: new Date().toISOString(), type: 'info', message: `Syncing ${sourceName}${currentTag ? ` (${currentTag})` : ''}` }],
            stats: { 
              jobsAdded: 0, 
              jobsUpdated: 0, 
              jobsDeleted: 0, 
              tag: currentTag || null,
              tagIndex: source === 'remoteok' ? remoteokTagIndex : (source === 'jobicy' ? jobicyIndustryIndex : null),
              totalTags: source === 'remoteok' ? REMOTEOK_TAGS.length : (source === 'jobicy' ? JOBICY_INDUSTRIES.length : null)
            }
          })
          
          let jobsAdded = 0
          let jobsUpdated = 0
          let jobs: any[] = []
          
          try {
            const fetcher = sourceFetchers[source]
            const response = await withRetry(
              () => fetcher(apiUrl),
              {
                maxRetries: 2,
                baseDelayMs: 2000,
                onRetry: (attempt, error) => {
                  syncQueue.log('warning', source, `Retry ${attempt}: ${error.message}`)
                }
              }
            )
            
            syncQueue.log('info', source, `HTTP ${response.status} ${response.statusText}`)
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            // Check content-type to avoid parsing HTML as JSON
            const contentType = response.headers.get('content-type') || ''
            if (!contentType.includes('application/json')) {
              throw new Error(`Invalid response type: ${contentType.substring(0, 50)} (expected JSON)`)
            }
            
            const data = await response.json() as any
            
            // Parse jobs based on source
            if (source === 'remoteok') {
              // RemoteOK returns array with first element being metadata
              jobs = Array.isArray(data) ? data.filter((j: any) => j.id && j.position) : []
            } else if (source === 'himalayas') {
              // Himalayas returns { jobs: [] }
              jobs = data.jobs || []
            } else {
              // Jobicy returns { jobs: [] }
              jobs = data.jobs || []
            }
            
            syncQueue.log('info', source, `Total jobs from API: ${jobs.length}`)
            
            // Limit to first 100 for performance
            const jobsToProcess = jobs.slice(0, 100)
            syncQueue.log('info', source, `Processing ${jobsToProcess.length} jobs`)
            
            for (const job of jobsToProcess) {
              try {
                let sourceUrl: string
                let title: string
                let company: string
                let description: string
                let postDate: Date | null = null
                
                if (source === 'remoteok') {
                  sourceUrl = `https://remoteok.com/l/${job.id}`
                  title = job.position
                  company = job.company
                  description = job.description || ''
                } else if (source === 'himalayas') {
                  sourceUrl = job.applicationLink || job.url
                  title = job.title
                  company = job.companyName
                  description = job.description || ''
                } else {
                  // Jobicy
                  sourceUrl = job.url || `https://jobicy.com/jobs/${job.id}`
                  title = job.jobTitle
                  company = job.companyName
                  description = job.jobDescription || ''
                  if (job.pubDate) postDate = new Date(job.pubDate * 1000)
                }
                
                if (!sourceUrl) continue
                
                // Check if exists
                const existing = await db.select()
                  .from(schema.jobs)
                  .where(eq(schema.jobs.sourceUrl, sourceUrl))
                  .limit(1)
                
                const categoryId = determineCategoryId(title, description, job.tags || [])
                
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
                    sourceName,
                    categoryId,
                    remoteType: 'fully_remote'
                  })
                  jobsAdded++
                }
              } catch (jobError) {
                // Skip individual job errors
                if (!(jobError instanceof Error && jobError.message.includes('UNIQUE'))) {
                  console.error('Job processing error:', jobError)
                }
              }
            }
            
            syncQueue.log('success', source, `${jobsAdded} added, ${jobsUpdated} updated`)
            
          } catch (fetchError) {
            const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError)
            syncQueue.log('error', source, `Sync failed: ${errorMsg}`)
            
            // Update sync history with failure
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date(),
              logs: syncQueue.getLogs().slice(0, 20),
              stats: { jobsAdded, jobsUpdated, jobsDeleted: 0, error: errorMsg }
            }).where(eq(schema.syncHistory.id, syncId))
            
            // Still update batch state
            await updateBatchState(db, source, remoteokTagIndex, jobicyIndustryIndex, himalayasOffset, 0)
            
            return json({
              success: false,
              source,
              error: errorMsg,
              duration: Date.now() - startTime
            })
          }
          
          // Update sync history success
          await db.update(schema.syncHistory).set({
            status: 'completed',
            completedAt: new Date(),
            logs: syncQueue.getLogs().slice(0, 20),
            stats: { jobsAdded, jobsUpdated, jobsDeleted: 0 }
          }).where(eq(schema.syncHistory.id, syncId))
          
          // Update batch state
          await updateBatchState(db, source, remoteokTagIndex, jobicyIndustryIndex, himalayasOffset, jobs.length)
          
          const result: SyncResult = {
            success: true,
            source,
            jobsAdded,
            jobsUpdated,
            jobsDeleted: 0,
            duration: Date.now() - startTime
          }
          
          return json(result)
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          syncQueue.log('error', 'aggregator', `Fatal error: ${errorMsg}`)
          
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

async function updateBatchState(
  db: any, 
  source: string, 
  remoteokTagIndex?: number, 
  jobicyIndustryIndex?: number,
  currentHimalayasOffset?: number,
  himalayasJobsReturned?: number
) {
  const existing = await db.select()
    .from(schema.syncHistory)
    .where(sql`status = 'batch_state' AND sync_type = 'aggregator'`)
    .limit(1)
  
  const existingState = existing[0]?.stats as any || {}
  
  // Increment tag index if this was a RemoteOK sync
  const nextRemoteokTagIndex = source === 'remoteok' && remoteokTagIndex !== undefined 
    ? (remoteokTagIndex + 1) % REMOTEOK_TAGS.length 
    : existingState.remoteokTagIndex || 0
  
  // Increment industry index if this was a Jobicy sync
  const nextJobicyIndustryIndex = source === 'jobicy' && jobicyIndustryIndex !== undefined
    ? (jobicyIndustryIndex + 1) % JOBICY_INDUSTRIES.length
    : existingState.jobicyIndustryIndex || 0
  
  // Update Himalayas offset: increment by jobs returned, reset to 0 if 0 jobs returned
  let nextHimalayasOffset = existingState.himalayasOffset || 0
  if (source === 'himalayas' && currentHimalayasOffset !== undefined && himalayasJobsReturned !== undefined) {
    if (himalayasJobsReturned === 0) {
      // Pagination exhausted, reset to 0
      nextHimalayasOffset = 0
    } else {
      // Increment offset by number of jobs processed
      nextHimalayasOffset = currentHimalayasOffset + himalayasJobsReturned
    }
  }
  
  const state = {
    lastSource: source,
    remoteokTagIndex: nextRemoteokTagIndex,
    jobicyIndustryIndex: nextJobicyIndustryIndex,
    himalayasOffset: nextHimalayasOffset,
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
      syncType: 'aggregator',
      status: 'batch_state',
      startedAt: new Date(),
      completedAt: new Date(),
      stats: state
    })
  }
}
