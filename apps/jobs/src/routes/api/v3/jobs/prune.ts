/**
 * Job Pruning API Endpoint
 * Removes jobs that no longer exist on their source platforms
 * 
 * Usage:
 * - POST /api/v3/jobs/prune (prune all sources)
 * - POST /api/v3/jobs/prune?source=Greenhouse (prune specific source)
 * - POST /api/v3/jobs/prune?source=Lever,RemoteOK (prune multiple sources)
 * - POST /api/v3/jobs/prune?dryRun=true (preview what would be deleted)
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext } from '../../../../db/db'
import { pruneJobs } from '../../../../lib/job-prune'

export const Route = createFileRoute('/api/v3/jobs/prune')({
  server: {
    handlers: {
      POST: async ({ context, request }) => {
        const startTime = Date.now()
        
        try {
          const ctx = context as any
          let db;
          
          // Try to get DB connection with explicit error handling
          try {
            db = await getDbFromContext(ctx)
          } catch (dbError) {
            const dbErrorMsg = dbError instanceof Error ? dbError.message : String(dbError)
            console.error('[Job Prune] DB connection failed:', dbErrorMsg)
            return json({
              success: false,
              error: `Database connection failed: ${dbErrorMsg}`,
              duration: Date.now() - startTime
            }, { status: 500 })
          }
          
          // Parse query parameters
          const url = new URL(request.url)
          const sourceParam = url.searchParams.get('source')
          const dryRunParam = url.searchParams.get('dryRun')
          
          // Parse sources (comma-separated)
          const sources = sourceParam 
            ? sourceParam.split(',').map(s => s.trim()).filter(Boolean)
            : undefined
          
          const dryRun = dryRunParam === 'true' || dryRunParam === '1'
          
          console.log('[Job Prune] Starting prune operation', {
            sources: sources || 'all',
            dryRun,
            timestamp: new Date().toISOString()
          })
          
          // Collect logs
          const logs: string[] = []
          const onLog = (message: string, level?: 'info' | 'success' | 'error' | 'warning') => {
            const logEntry = `[${level || 'info'}] ${message}`
            logs.push(logEntry)
            console.log(`[Job Prune] ${logEntry}`)
          }
          
          // Run pruning
          const result = await pruneJobs({
            db,
            sources,
            dryRun,
            onLog
          })
          
          const duration = Date.now() - startTime
          
          console.log('[Job Prune] Completed', {
            jobsToDelete: result.jobsToDelete,
            jobsDeleted: result.jobsDeleted,
            dryRun,
            duration
          })
          
          return json({
            success: true,
            dryRun,
            sources: sources || 'all',
            jobsToDelete: result.jobsToDelete,
            jobsDeleted: result.jobsDeleted,
            orphanedJobs: result.orphanedJobs.map(job => ({
              id: job.id,
              title: job.title,
              company: job.company,
              source: job.sourceName,
              url: job.sourceUrl
            })),
            logs,
            duration
          })
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.error('[Job Prune] Fatal error:', errorMsg)
          
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
