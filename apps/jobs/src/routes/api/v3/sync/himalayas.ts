/**
 * Himalayas Sync API Endpoint
 * Triggers manual Himalayas sync
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/v3/sync/himalayas')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        try {
          const ctx = context as any
          const env = ctx.cloudflare?.env

          if (!env?.HIMALAYAS_SYNC) {
            return json({
              success: false,
              error: 'Himalayas sync worker not configured'
            }, { status: 500 })
          }

          // Trigger the Himalayas worker
          await env.HIMALAYAS_SYNC.scheduled({
            scheduledTime: Date.now(),
            cron: '3-58/5 * * * *'
          })

          return json({
            success: true,
            message: 'Himalayas sync triggered'
          })

        } catch (error) {
          console.error('Himalayas sync trigger error:', error)
          return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }
    }
  }
})
