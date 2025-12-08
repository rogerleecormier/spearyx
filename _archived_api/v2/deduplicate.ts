import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext } from '../../../db/db'
import { deduplicateJobs } from '../../../lib/job-deduplicate'

interface DeduplicateRequestBody {
  dryRun?: boolean
  criteria?: ('title' | 'company' | 'salary' | 'description')[]
}

export const Route = createFileRoute('/api/_archived/v2/deduplicate')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          // Parse request body
          const body = (await request.json()) as DeduplicateRequestBody
          const { dryRun = true, criteria = ['title', 'company'] } = body

          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Create dedupe ID
          const dedupeId = crypto.randomUUID()
          
          const logs: Array<{ timestamp: string; type: string; message: string }> = []
          
          // Run deduplication
          const result = await deduplicateJobs({
            dryRun,
            criteria,
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
            dedupeId,
            dryRun,
            result: {
              duplicatesFound: result.duplicatesFound,
              duplicatesRemoved: result.duplicatesRemoved,
              duplicateGroups: result.duplicateGroups
            },
            logs
          })
        } catch (error) {
          console.error('Deduplication failed:', error)
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
