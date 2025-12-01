import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { drizzle } from 'drizzle-orm/d1'
import { schema } from '../../../db/db'
import type { AppLoadContext } from '../../../../app/ssr'
import { pruneJobs } from '../../../lib/job-prune'

interface PruneRequestBody {
  dryRun?: boolean
  sources?: string[]
}

export const Route = createFileRoute('/api/v2/prune')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          // Check for authorization
          const authHeader = request.headers.get('Authorization')
          const appContext = context as unknown as AppLoadContext
          const cronSecret = appContext?.cloudflare?.env?.CRON_SECRET
          
          // Only check secret if it's set
          if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 })
          }

          // Parse request body
          const body = (await request.json()) as PruneRequestBody
          const { dryRun = true, sources } = body

          // Get environment from context
          const env = appContext?.cloudflare?.env
          if (!env?.DB) {
            return json({ success: false, error: 'Database  not available' }, { status: 500 })
          }

          // Create DB connection
          const db = drizzle(env.DB, { schema })

          // Create prune ID
          const pruneId = crypto.randomUUID()
          
          const logs: Array<{ timestamp: string; type: string; message: string }> = []
          
          // Run prune
          const result = await pruneJobs({
            dryRun,
            sources,
            db,
            onLog: (message, level = 'info') => {
              logs.push({
                timestamp: new Date().toISOString(),
                type: level,
                message
              })
            }
          })

          return json({
            success: true,
            pruneId,
            dryRun,
            result: {
              jobsToDelete: result.jobsToDelete,
              jobsDeleted: result.jobsDeleted,
              orphanedJobs: result.orphanedJobs
            },
            logs
          })
        } catch (error) {
          console.error('Prune failed:', error)
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
