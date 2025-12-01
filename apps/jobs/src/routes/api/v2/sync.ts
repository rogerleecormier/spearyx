import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { syncJobs } from '../../../lib/job-sync'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

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
          // Debug: Log context structure
          console.log('🔍 Context structure:', {
            hasContext: !!context,
            contextKeys: context ? Object.keys(context) : [],
            hasCloudflare: !!(context as any)?.cloudflare,
            hasEnv: !!(context as any)?.env,
            hasDB: !!(context as any)?.DB,
          })

          // Parse request body
          const body = (await request.json()) as SyncRequestBody
          const { sources, updateExisting = true, addNew = true } = body

          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Create sync ID
          const syncId = crypto.randomUUID()

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
          // Use waitUntil to ensure the sync completes even after response is sent
          const syncPromise = syncJobs({
            updateExisting,
            addNew,
            sources,
            db,
            onLog: async (message, level = 'info') => {
              // Update sync history with new log
              try {
                const currentSync = await db.select().from(schema.syncHistory).where(sql`id = ${syncId}`).limit(1)
                if (currentSync.length > 0) {
                  const logs = currentSync[0].logs || []
                  logs.push({
                    timestamp: new Date().toLocaleTimeString(),
                    type: level,
                    message
                  })
                  await db.update(schema.syncHistory).set({ logs }).where(sql`id = ${syncId}`)
                }
              } catch (error) {
                console.error('Error updating logs:', error)
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
            console.error('Sync error:', error)
            await db.update(schema.syncHistory).set({
              status: 'failed',
              completedAt: new Date()
            }).where(sql`id = ${syncId}`)
          })

          // Tell Cloudflare to keep the worker alive until sync completes
          const cfCtx = (globalThis as any).__CF_CTX__
          if (cfCtx?.waitUntil) {
            cfCtx.waitUntil(syncPromise)
          }

          // Return immediately with syncId
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
