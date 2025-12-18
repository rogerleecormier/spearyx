/**
 * RemoteOK Sync API Endpoint
 * Triggers manual RemoteOK sync
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/v3/sync/remoteok')({
  server: {
    handlers: {
      POST: async ({ context }) => {
        try {
          const ctx = context as any
          const env = ctx.cloudflare?.env

          if (!env?.REMOTEOK_SYNC) {
            return json({
              success: false,
              error: 'RemoteOK sync worker not configured'
            }, { status: 500 })
          }

          // Trigger the RemoteOK worker
          await env.REMOTEOK_SYNC.scheduled({
            scheduledTime: Date.now(),
            cron: '1-56/5 * * * *'
          })

          return json({
            success: true,
            message: 'RemoteOK sync triggered'
          })

        } catch (error) {
          console.error('RemoteOK sync trigger error:', error)
          return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }
    }
  }
})
