import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { drizzle } from 'drizzle-orm/d1'
import { schema } from '../../../db/db'
import type { AppLoadContext } from '../../../../app/ssr'
import { deduplicateJobs } from '../../../lib/job-deduplicate'

interface DeduplicateRequestBody {
  dryRun?: boolean
  criteria?: ('title' | 'company' | 'salary' | 'description')[]
}

export const Route = createFileRoute('/api/v2/deduplicate')({
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
          const body = (await request.json()) as DeduplicateRequestBody
          const { dryRun = true, criteria = ['title', 'company'] } = body

          // Get environment from context
          const env = appContext?.cloudflare?.env
          if (!env?.DB) {
            return json({ success: false, error: 'Database not available' }, { status: 500 })
          }

          // Create DB connection
          const db = drizzle(env.DB, { schema })

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
