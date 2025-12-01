import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext } from '../../../db/db'
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
          // Parse request body
          const body = (await request.json()) as PruneRequestBody
          const { dryRun = true, sources } = body

          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

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
