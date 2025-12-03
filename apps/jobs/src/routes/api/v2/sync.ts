import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

interface SyncRequestBody {
  sources?: string[]
  updateExisting?: boolean
  addNew?: boolean
}

export const Route = createFileRoute('/api/v2/sync')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          // Manual syncs are not supported on Cloudflare Workers free plan
          // due to 30-second CPU timeout limit.
          // 
          // Full syncs (151 companies) take 2-3 minutes and will always timeout.
          // 
          // Use the cron worker instead, which runs every 4 hours automatically
          // and doesn't have the same timeout constraints.
          
          return json({
            success: false,
            error: 'Manual syncs are not supported on the free plan due to Cloudflare Workers 30-second timeout limit. Full syncs run automatically every 4 hours via cron worker.',
            info: {
              cronSchedule: 'Every 4 hours',
              totalCompanies: 151,
              estimatedSyncTime: '2-3 minutes',
              workerTimeout: '30 seconds',
              recommendation: 'Wait for the next automatic sync, or upgrade to a paid Cloudflare plan for manual sync support.'
            }
          }, { status: 503 })
        } catch (error) {
          console.error('Sync API error:', error)
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
