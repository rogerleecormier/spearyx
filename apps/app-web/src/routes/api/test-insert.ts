import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../db/db'
import { testJobs } from '../../lib/jobs/test-data'
import { determineCategoryId } from '../../lib/jobs/job-sources'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/api/test-insert')({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as any
        const db = await getDbFromContext(ctx)
        
        try {
          let added = 0
          let skipped = 0
          const errors: string[] = []
          
          for (const job of testJobs) {
            try {
              // Check if job already exists
              const existing = await db.select().from(schema.jobs)
                .where(eq(schema.jobs.sourceUrl, job.sourceUrl))
                .limit(1)
              
              if (existing.length > 0) {
                skipped++
                continue
              }
              
              // Determine category
              const categoryId = determineCategoryId(job.title, job.description, job.tags)
              
              // Insert the job
              await db.insert(schema.jobs).values({
                title: job.title,
                company: job.company,
                description: job.description,
                payRange: job.salary,
                postDate: job.postedDate,
                sourceUrl: job.sourceUrl,
                sourceName: job.sourceName,
                categoryId,
                remoteType: 'fully_remote'
              })
              
              added++
            } catch (jobError) {
              const errorMsg = jobError instanceof Error ? jobError.message : String(jobError)
              errors.push(`${job.title}: ${errorMsg}`)
            }
          }
          
          return json({
            success: true,
            message: `Test insert completed`,
            results: {
              added,
              skipped,
              total: testJobs.length
            },
            errors: errors.length > 0 ? errors : undefined
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          return json({
            success: false,
            error: 'Test insert failed',
            details: errorMsg
          }, { status: 500 })
        }
      }
    }
  }
})
