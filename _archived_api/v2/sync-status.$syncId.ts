import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDbFromContext, schema } from '../../../db/db'

export const Route = createFileRoute('/api/_archived/v2/sync-status/$syncId')({
  server: {
    handlers: {
      GET: async ({ params, context }) => {
        try {
          const { syncId } = params
          
          // Get DB connection
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Get sync history
          const syncs = await db.select().from(schema.syncHistory).where(eq(schema.syncHistory.id, syncId)).limit(1)
          
          if (syncs.length === 0) {
            return json({ success: false, error: 'Sync not found' }, { status: 404 })
          }

          const sync = syncs[0]

          // Debug: log what we found
          console.log('📊 Sync status:', {
            syncId: sync.id,
            status: sync.status,
            logCount: sync.logs?.length || 0,
            hasStats: !!sync.stats
          })

          // Calculate progress (rough estimate based on status)
          let progress = 0
          if (sync.status === 'running') {
            // Estimate progress based on number of logs
            const logCount = sync.logs?.length || 0
            progress = Math.min(90, logCount * 2) // Cap at 90% while running
          } else if (sync.status === 'completed') {
            progress = 100
          } else if (sync.status === 'failed') {
            progress = 0
          }

          return json({
            success: true,
            syncId: sync.id,
            status: sync.status,
            startedAt: sync.startedAt,
            completedAt: sync.completedAt,
            logs: sync.logs || [],
            stats: sync.stats || {
              jobsAdded: 0,
              jobsUpdated: 0,
              jobsDeleted: 0,
              companiesAdded: 0,
              companiesDeleted: 0
            },
            progress
          })
        } catch (error) {
          console.error('Sync status fetch failed:', error)
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
