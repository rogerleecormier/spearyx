import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { db, schema } from '../../db/db'
import { searchJobs } from '../../lib/search-utils'
import { eq } from 'drizzle-orm'
import type { JobWithCategory } from '../../lib/search-utils'

export const Route = createFileRoute('/api/jobs')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const query = url.searchParams.get('search') || undefined
        const categoryId = url.searchParams.get('category')
          ? parseInt(url.searchParams.get('category')!)
          : undefined
        const source = url.searchParams.get('source') || undefined
        const salaryRange = url.searchParams.get('salaryRange') || undefined
        const includeNoSalary = url.searchParams.get('includeNoSalary') === 'true'
        const sortBy =
          (url.searchParams.get('sortBy') as
            | 'newest'
            | 'oldest'
            | 'title-asc'
            | 'title-desc') || 'newest'
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        try {
          // Fetch all jobs with their categories
          const jobsData = await db.query.jobs.findMany()

          // Transform to include category data
          const jobsWithCategories: JobWithCategory[] = await Promise.all(
            jobsData.map(async (job) => {
              const category = await db.query.categories.findFirst({
                where: eq(schema.categories.id, job.categoryId),
              })
              return {
                ...job,
                category: category!,
              }
            })
          )

          // Apply search, filtering, and sorting
          const results = searchJobs(jobsWithCategories, {
            query,
            categoryId,
            source,
            salaryRange,
            includeNoSalary,
            sortBy,
            limit,
            offset,
          })

          return json({
            success: true,
            data: results,
          })
        } catch (error) {
          console.error('Error fetching jobs:', error)
          return json(
            {
              success: false,
              error: 'Failed to fetch jobs',
            },
            { status: 500 }
          )
        }
      },
    },
  },
})
