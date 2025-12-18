/**
 * Jobicy Sync API Endpoint
 * Triggers manual Jobicy sync
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/v3/sync/jobicy')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        try {
          const ctx = context as any
          const env = ctx.cloudflare?.env

          if (!env?.JOBICY_SYNC) {
            return json({
              success: false,
              error: 'Jobicy sync worker not configured'
            }, { status: 500 })
          }

          // Trigger the Jobicy worker
          await env.JOBICY_SYNC.scheduled({
            scheduledTime: Date.now(),
            cron: '0 * * * *'
          })

          return json({
            success: true,
            message: 'Jobicy sync triggered'
          })

        } catch (error) {
          console.error('Jobicy sync trigger error:', error)
          return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }
    }
  }
})
