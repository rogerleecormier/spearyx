import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { syncJobs } from '../../lib/job-sync'
import { getD1Database } from '@spearyx/shared-utils'
import { drizzle } from 'drizzle-orm/d1'
import { schema } from '../../db/db'

import type { AppLoadContext } from '../../../app/ssr'

export const Route = createFileRoute('/api/sync')({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        try {
          // Check for authorization
          const authHeader = request.headers.get('Authorization')
          const appContext = context as unknown as AppLoadContext
          const cronSecret = appContext?.cloudflare?.env?.CRON_SECRET
          
          // Only check secret if it's set (recommended for production)
          if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
             return json({ success: false, error: 'Unauthorized' }, { status: 401 })
          }

          const startTime = Date.now()
          const logs: string[] = []
          
          const log = (message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') => {
            const prefix = level === 'error' ? '❌ ' : level === 'success' ? '✅ ' : level === 'warning' ? '⚠️ ' : 'ℹ️ '
            logs.push(`${prefix}${message}`)
            console.log(`${prefix}${message}`)
          }

          // Get DB instance
          const d1 = await getD1Database()
          const db = drizzle(d1, { schema })

          // Run sync
          const result = await syncJobs({
            updateExisting: true,
            addNew: true,
            db,
            onLog: log
          })

          const totalDuration = Date.now() - startTime

          return json({
            success: true,
            data: {
              result,
              logs,
              totalDuration,
              timestamp: new Date().toISOString()
            }
          })
        } catch (error) {
          console.error('Sync failed:', error)
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
