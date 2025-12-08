import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/_archived/v2/sync-logs')({
  server: {
    handlers: {
      GET: async ({ context }) => {
        try {
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Get recent sync history (last 20 runs, excluding batch_state)
          const syncHistory = await db.select()
            .from(schema.syncHistory)
            .where(sql`status != 'batch_state'`)
            .orderBy(sql`started_at DESC`)
            .limit(20)

          return json({
            success: true,
            syncs: syncHistory.map(sync => ({
              id: sync.id,
              syncType: sync.syncType,
              source: sync.source || null, // greenhouse, lever, remoteok, himalayas
              startedAt: sync.startedAt ? new Date(sync.startedAt).toISOString() : null,
              completedAt: sync.completedAt ? new Date(sync.completedAt).toISOString() : null,
              status: sync.status,
              stats: sync.stats || {
                jobsAdded: 0,
                jobsUpdated: 0,
                jobsDeleted: 0,
                companiesAdded: 0,
                companiesDeleted: 0
              },
              logs: sync.logs || [],
              totalCompanies: sync.totalCompanies || 0,
              processedCompanies: sync.processedCompanies || 0
            }))
          })
        } catch (error) {
          console.error('Sync logs API error:', error)
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
