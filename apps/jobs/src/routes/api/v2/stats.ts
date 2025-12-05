import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/v2/stats')({
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

          return json({
            success: true,
            stats: {
              totalDiscoveredCompanies,
              totalActiveCompanies,
              totalJobs,
              pendingCompanies,
              notDiscoveredCompanies,
              jobsBySource,
              lastSyncAt: lastSyncAt ? new Date(lastSyncAt).toISOString() : null
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
