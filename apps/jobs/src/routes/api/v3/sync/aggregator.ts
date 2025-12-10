import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../../db/db'
import { sql, eq } from 'drizzle-orm'
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
          
          let lastSource: 'remoteok' | 'himalayas' = 'himalayas'
          let remoteokTagIndex = 0
          
          if (batchState.length > 0 && batchState[0].stats) {
            const state = batchState[0].stats as any
            lastSource = state.lastSource || 'himalayas'
            remoteokTagIndex = state.remoteokTagIndex || 0
          }
          
          const source = getNextAggregatorSource(lastSource)
          const sourceName = source === 'remoteok' ? 'RemoteOK' : 'Himalayas'
          
          // For RemoteOK, use tag-based queries to get more variety
          let currentTag = ''
          let apiUrl = ''
          
          // Clear logs for this sync run
          syncQueue.clearLogs()
          
          if (source === 'remoteok') {
            currentTag = REMOTEOK_TAGS[remoteokTagIndex % REMOTEOK_TAGS.length]
            apiUrl = `https://remoteok.com/api?tag=${currentTag}`
            syncQueue.log('info', source, `Syncing ${sourceName} tag: ${currentTag} (index ${remoteokTagIndex}/${REMOTEOK_TAGS.length})`)
          } else {
            apiUrl = 'https://himalayas.app/jobs/api'
            syncQueue.log('info', source, `Starting ${sourceName} sync`)
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
              tagIndex: source === 'remoteok' ? remoteokTagIndex : null,
              totalTags: source === 'remoteok' ? REMOTEOK_TAGS.length : null
            }
          })
          
          let jobsAdded = 0
          let jobsUpdated = 0
          
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
            let jobs: any[] = []
            if (source === 'remoteok') {
              // RemoteOK returns array with first element being metadata
              jobs = Array.isArray(data) ? data.filter((j: any) => j.id && j.position) : []
            } else {
              // Himalayas returns { jobs: [] }
              jobs = data.jobs || []
            }
            
            syncQueue.log('info', source, `Total jobs from API: ${jobs.length}`)
            
            // Limit to first 100 for performance
            const jobsToProcess = jobs.slice(0, 100)
            syncQueue.log('info', source, `Processing ${jobsToProcess.length} jobs`)
            
            for (const job of jobsToProcess) {
              try {
                const sourceUrl = source === 'remoteok'
                  ? `https://remoteok.com/l/${job.id}`
                  : job.applicationLink || job.url
                
                if (!sourceUrl) continue
                
                const title = source === 'remoteok' ? job.position : job.title
                const company = source === 'remoteok' ? job.company : job.companyName
                const description = source === 'remoteok'
                  ? job.description || ''
                  : job.description || ''
                
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
            await updateBatchState(db, source, remoteokTagIndex)
            
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
          await updateBatchState(db, source, remoteokTagIndex)
          
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

async function updateBatchState(db: any, source: string, remoteokTagIndex?: number) {
  const existing = await db.select()
    .from(schema.syncHistory)
    .where(sql`status = 'batch_state' AND sync_type = 'aggregator'`)
    .limit(1)
  
  // Increment tag index if this was a RemoteOK sync
  const nextTagIndex = source === 'remoteok' && remoteokTagIndex !== undefined 
    ? (remoteokTagIndex + 1) % REMOTEOK_TAGS.length 
    : (existing[0]?.stats as any)?.remoteokTagIndex || 0
  
  const state = {
    lastSource: source,
    remoteokTagIndex: nextTagIndex,
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
