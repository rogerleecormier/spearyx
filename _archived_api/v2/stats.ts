import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/_archived/v2/stats')({
  server: {
    handlers: {
      GET: async ({ context }) => {
        try {
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Get total discovered companies from discoveredCompanies table (more accurate)
          const companiesResult = await db.select({
            count: sql<number>`count(*)`
          }).from(schema.discoveredCompanies)
          const totalDiscoveredCompanies = companiesResult[0]?.count || 0

          // Get total jobs
          const jobsResult = await db.select({
            count: sql<number>`count(*)`
          }).from(schema.jobs)
          const totalJobs = jobsResult[0]?.count || 0

          // Get pending companies (companies we haven't found yet)
          const pendingCompaniesResult = await db.select({
            count: sql<number>`count(*)`
          }).from(schema.potentialCompanies)
          .where(sql`status = 'pending'`)
          const pendingCompanies = pendingCompaniesResult[0]?.count || 0

          // Get not discovered companies (companies we tried but failed to find)
          const notDiscoveredResult = await db.select({
            count: sql<number>`count(*)`
          }).from(schema.potentialCompanies)
          .where(sql`status = 'not_found'`)
          const notDiscoveredCompanies = notDiscoveredResult[0]?.count || 0

          // Get jobs by source
          const jobsBySourceResult = await db.select({
            source: schema.jobs.sourceName,
            count: sql<number>`count(*)`
          }).from(schema.jobs)
          .groupBy(schema.jobs.sourceName)
          
          const jobsBySource = {
            greenhouse: 0,
            lever: 0,
            remoteok: 0,
            himalayas: 0
          }

          jobsBySourceResult.forEach(row => {
            const source = row.source.toLowerCase()
            if (source.includes('greenhouse')) jobsBySource.greenhouse += row.count
            else if (source.includes('lever')) jobsBySource.lever += row.count
            else if (source.includes('remoteok')) jobsBySource.remoteok += row.count
            else if (source.includes('himalayas')) jobsBySource.himalayas += row.count
          })

          // Get total active companies (companies with jobs)
          const activeCompaniesResult = await db.select({
            count: sql<number>`count(distinct company)`
          }).from(schema.jobs)
          const totalActiveCompanies = activeCompaniesResult[0]?.count || 0

          // Get last sync timestamp
          const lastSyncResult = await db.select({
            completedAt: schema.syncHistory.completedAt
          })
          .from(schema.syncHistory)
          .where(sql`status = 'completed'`)
          .orderBy(sql`completed_at DESC`)
          .limit(1)
          
          const lastSyncAt = lastSyncResult[0]?.completedAt || null

          // Get per-source sync status (for micro-cron dashboard)
          const sourceSyncStatus: Record<string, { lastSync: string | null; status: string; jobsAdded: number }> = {}
          const sources = ['greenhouse', 'lever', 'remoteok', 'himalayas']
          
          for (const source of sources) {
            // Get most recent sync (for current status)
            const lastSourceSync = await db.select({
              completedAt: schema.syncHistory.completedAt,
              status: schema.syncHistory.status,
              stats: schema.syncHistory.stats
            })
            .from(schema.syncHistory)
            .where(sql`source = ${source}`)
            .orderBy(sql`started_at DESC`)
            .limit(1)
            
            // Get last COMPLETED sync (for lastSync time)
            const lastCompletedSync = await db.select({
              completedAt: schema.syncHistory.completedAt,
              stats: schema.syncHistory.stats
            })
            .from(schema.syncHistory)
            .where(sql`source = ${source} AND status = 'completed'`)
            .orderBy(sql`completed_at DESC`)
            .limit(1)
            
            const currentStatus = lastSourceSync[0]?.status || 'never'
            const completedData = lastCompletedSync[0]
            
            sourceSyncStatus[source] = {
              lastSync: completedData?.completedAt ? new Date(completedData.completedAt).toISOString() : null,
              status: currentStatus,
              jobsAdded: (completedData?.stats as any)?.jobsAdded || 0
            }
          }

          // Get worker status (grouped by worker type)
          const workerStatus: Record<string, { name: string; sources: string[]; schedule: string; lastSync: string | null; status: string }> = {
            ats: {
              name: 'ATS Sync',
              sources: ['Greenhouse', 'Lever'],
              schedule: '*/2 min',
              lastSync: sourceSyncStatus.greenhouse?.lastSync && sourceSyncStatus.lever?.lastSync
                ? (new Date(sourceSyncStatus.greenhouse.lastSync) > new Date(sourceSyncStatus.lever.lastSync) 
                   ? sourceSyncStatus.greenhouse.lastSync 
                   : sourceSyncStatus.lever.lastSync)
                : (sourceSyncStatus.greenhouse?.lastSync || sourceSyncStatus.lever?.lastSync || null),
              status: sourceSyncStatus.greenhouse?.status === 'running' || sourceSyncStatus.lever?.status === 'running' 
                ? 'running' 
                : (sourceSyncStatus.greenhouse?.status === 'completed' || sourceSyncStatus.lever?.status === 'completed' ? 'completed' : 'never')
            },
            aggregator: {
              name: 'Aggregator Sync',
              sources: ['RemoteOK', 'Himalayas'],
              schedule: '*/5 min',
              lastSync: sourceSyncStatus.remoteok?.lastSync && sourceSyncStatus.himalayas?.lastSync
                ? (new Date(sourceSyncStatus.remoteok.lastSync) > new Date(sourceSyncStatus.himalayas.lastSync) 
                   ? sourceSyncStatus.remoteok.lastSync 
                   : sourceSyncStatus.himalayas.lastSync)
                : (sourceSyncStatus.remoteok?.lastSync || sourceSyncStatus.himalayas?.lastSync || null),
              status: sourceSyncStatus.remoteok?.status === 'running' || sourceSyncStatus.himalayas?.status === 'running' 
                ? 'running' 
                : (sourceSyncStatus.remoteok?.status === 'completed' || sourceSyncStatus.himalayas?.status === 'completed' ? 'completed' : 'never')
            }
          }

          // Get discovery status
          const lastDiscoverySync = await db.select({
            completedAt: schema.syncHistory.completedAt,
            status: schema.syncHistory.status
          })
          .from(schema.syncHistory)
          .where(sql`sync_type = 'discovery'`)
          .orderBy(sql`started_at DESC`)
          .limit(1)

          const discoveryData = lastDiscoverySync[0]
          workerStatus['discovery'] = {
            name: 'Discovery',
            sources: ['Company Discovery'],
            schedule: '*/5 min',
            lastSync: discoveryData?.completedAt ? new Date(discoveryData.completedAt).toISOString() : null,
            status: discoveryData?.status || 'never'
          }

          return json({
            success: true,
            stats: {
              totalDiscoveredCompanies,
              totalActiveCompanies,
              totalJobs,
              pendingCompanies,
              notDiscoveredCompanies,
              jobsBySource,
              lastSyncAt: lastSyncAt ? new Date(lastSyncAt).toISOString() : null,
              sourceSyncStatus,
              workerStatus
            }
          })
        } catch (error) {
          console.error('Stats API error:', error)
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
