import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { syncJobs } from '../../../lib/job-sync'
import { drizzle } from 'drizzle-orm/d1'
import { schema } from '../../../db/db'
import { sql } from 'drizzle-orm'
import type { AppLoadContext } from '../../../../app/ssr'

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
          // Check for authorization
          const authHeader = request.headers.get('Authorization')
          const appContext = context as unknown as AppLoadContext
          const cronSecret = appContext?.cloudflare?.env?.CRON_SECRET
          
          // Only check secret if it's set (recommended for production)
          if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 })
          }

          // Parse request body
          const body = (await request.json()) as SyncRequestBody
          const { sources, updateExisting = true, addNew = true } = body

          // Get environment from context
          const env = appContext?.cloudflare?.env
          if (!env?.DB) {
            return json({ success: false, error: 'Database not available' }, { status: 500 })
          }

          // Create sync ID
          const syncId = crypto.randomUUID()
          
          // Create DB connection
          const db = drizzle(env.DB, { schema })

          // Create sync history record
          await db.insert(schema.syncHistory).values({
            id: syncId,
            status: 'running',
            sources: sources || [],
            stats: {
              jobsAdded: 0,
              jobsUpdated: 0,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            },
            logs: []
          })

          // Start sync in background (non-blocking)
          // We return immediately with the syncId so the client can poll for status
          const syncPromise = syncJobs({
            updateExisting,
            addNew,
            sources,
            db,
            onLog: async (message, level = 'info') => {
              // Update sync history with new log
              const currentSync = await db.select().from(schema.syncHistory).where(sql`id = ${syncId}`).limit(1)
              if (currentSync.length > 0) {
                const logs = currentSync[0].logs || []
                logs.push({
                  timestamp: new Date().toISOString(),
                  type: level,
                  message
                })
                await db.update(schema.syncHistory).set({ logs }).where(sql`id = ${syncId}`)
              }
            }
          }).then(async (result) => {
            // Update sync history with final stats
            await db.update(schema.syncHistory).set({
              status: 'completed',
              completedAt: new Date(),
              stats: {
                jobsAdded: result.added,
                jobsUpdated: result.updated,
                jobsDeleted: 0,
                companiesAdded: 0,
                companiesDeleted: 0
              }
            }).where(sql`id = ${syncId}`)
          }).catch(async (error) => {
            // Update sync history with error
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date()
            }).where(sql`id = ${syncId}`)
          })

          // Don't await the sync, return immediately
          return json({
            success: true,
            syncId,
            status: 'running',
            message: 'Sync started successfully'
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
