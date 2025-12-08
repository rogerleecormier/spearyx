/**
 * Per-Source Sync API Endpoint
 * Called by micro-workers to sync a specific source only
 * Stores raw descriptions without CPU-intensive sanitization
 */
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql, eq, inArray } from 'drizzle-orm'
import { jobSources, determineCategoryId } from '../../../lib/job-sources'

export const Route = createFileRoute('/api/_archived/v2/sync-source')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const syncId = crypto.randomUUID()
        const syncStartTime = new Date()
        const logs: Array<{ timestamp: string; type: 'info' | 'success' | 'error' | 'warning'; message: string }> = []
        
        try {
          const body = await request.json() as { source?: string }
          const sourceName = body.source?.toLowerCase()
          
          if (!sourceName) {
            return json({ success: false, error: 'Missing source parameter' }, { status: 400 })
          }
          
          // Map source names
          const sourceMap: Record<string, string> = {
            'greenhouse': 'Greenhouse',
            'lever': 'Lever',
            'remoteok': 'RemoteOK',
            'himalayas': 'Himalayas'
          }
          
          const sourceDisplayName = sourceMap[sourceName]
          if (!sourceDisplayName) {
            return json({ success: false, error: `Unknown source: ${sourceName}` }, { status: 400 })
          }
          
          logs.push({
            timestamp: syncStartTime.toISOString(),
            type: 'info',
            message: `🔄 ${sourceDisplayName} sync started`
          })
          
          const ctx = context as any
          const db = await getDbFromContext(ctx)
          
          // Check for active syncs for this specific source
          const twoMinutesAgoSeconds = Math.floor((Date.now() - 2 * 60 * 1000) / 1000)
          const activeSyncs = await db.select().from(schema.syncHistory)
            .where(sql`status = 'running' AND source = ${sourceName} AND started_at > ${twoMinutesAgoSeconds}`)
            .limit(1)
          
          if (activeSyncs.length > 0) {
            return json({
              success: false,
              message: `${sourceDisplayName} sync already running`,
              skipped: true
            })
          }
          
          // Create sync history record for this source
          await db.insert(schema.syncHistory).values({
            id: syncId,
            syncType: 'job_sync',
            source: sourceName,
            status: 'running',
            startedAt: syncStartTime,
            logs: logs,
            stats: { jobsAdded: 0, jobsUpdated: 0, jobsDeleted: 0, companiesAdded: 0, companiesDeleted: 0 }
          })
          
          // Find the job source
          const jobSource = jobSources.find(s => s.name === sourceDisplayName)
          if (!jobSource) {
            throw new Error(`Job source not found: ${sourceDisplayName}`)
          }
          
          let totalAdded = 0
          let totalUpdated = 0
          let totalSkipped = 0
          let companiesProcessed = 0
          
          const log = (msg: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') => {
            console.log(`[${level}] ${msg}`)
            logs.push({ timestamp: new Date().toISOString(), type: level, message: msg })
          }
          
          log(`📡 Fetching from ${sourceDisplayName}...`)
          
          // Process jobs from this source
          for await (const rawJobs of jobSource.fetch(undefined, log)) {
            if (rawJobs.length === 0) continue
            
            const companyName = rawJobs[0]?.company || 'Unknown'
            companiesProcessed++
            
            // Pre-load existing jobs
            const sourceUrls = rawJobs.map(j => j.sourceUrl).filter(Boolean)
            let existingJobsMap = new Map<string, any>()
            
            if (sourceUrls.length > 0) {
              const existingJobs = await db.select()
                .from(schema.jobs)
                .where(inArray(schema.jobs.sourceUrl, sourceUrls))
              existingJobsMap = new Map(existingJobs.map(job => [job.sourceUrl, job]))
            }
            
            // Process each job - store RAW without sanitization
            for (const rawJob of rawJobs) {
              try {
                const existing = existingJobsMap.get(rawJob.sourceUrl)
                const categoryId = determineCategoryId(rawJob.title, rawJob.description, rawJob.tags)
                
                if (existing) {
                  // Update existing - keep raw, mark as uncleansed
                  await db.update(schema.jobs).set({
                    title: rawJob.title || '',
                    company: rawJob.company,
                    descriptionRaw: rawJob.description || null,
                    payRange: rawJob.salary,
                    postDate: rawJob.postedDate,
                    updatedAt: new Date(),
                    categoryId,
                    isCleansed: 0 // Mark for re-cleansing
                  }).where(eq(schema.jobs.id, existing.id))
                  totalUpdated++
                } else {
                  // Insert new - store raw, mark as uncleansed
                  await db.insert(schema.jobs).values({
                    title: rawJob.title || '',
                    company: rawJob.company,
                    descriptionRaw: rawJob.description || null,
                    description: null, // Will be cleansed on first read
                    fullDescription: rawJob.fullDescription || null,
                    isCleansed: 0,
                    payRange: rawJob.salary,
                    postDate: rawJob.postedDate,
                    sourceUrl: rawJob.sourceUrl || '',
                    sourceName: rawJob.sourceName || sourceDisplayName,
                    categoryId,
                    remoteType: 'fully_remote'
                  })
                  totalAdded++
                }
              } catch (jobError) {
                const msg = jobError instanceof Error ? jobError.message : String(jobError)
                if (msg.includes('UNIQUE constraint')) {
                  totalSkipped++
                } else {
                  log(`❌ Error processing job: ${msg}`, 'error')
                }
              }
            }
          }
          
          log(`✅ ${sourceDisplayName} complete: ${totalAdded} added, ${totalUpdated} updated`, 'success')
          
          // Update sync history
          await db.update(schema.syncHistory).set({
            status: 'completed',
            completedAt: new Date(),
            logs: logs,
            processedCompanies: companiesProcessed,
            stats: {
              jobsAdded: totalAdded,
              jobsUpdated: totalUpdated,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            }
          }).where(sql`id = ${syncId}`)
          
          return json({
            success: true,
            syncId,
            source: sourceName,
            companiesProcessed,
            stats: {
              jobsAdded: totalAdded,
              jobsUpdated: totalUpdated,
              jobsSkipped: totalSkipped
            }
          })
          
        } catch (error) {
          console.error('Source sync failed:', error)
          
          try {
            const ctx = context as any
            const db = await getDbFromContext(ctx)
            
            logs.push({
              timestamp: new Date().toISOString(),
              type: 'error',
              message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
            
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date(),
              logs: logs
            }).where(sql`id = ${syncId}`)
          } catch (dbError) {
            console.error('Failed to update sync history:', dbError)
          }
          
          return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }
    }
  }
})
