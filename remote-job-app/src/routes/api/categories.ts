import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { db, schema } from '../../db/db'
import { sql } from 'drizzle-orm'

export const Route = createFileRoute('/api/categories')({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Fetch all categories with job counts
          const categoriesWithCounts = await db.query.categories.findMany()

          // Get job counts for each category
          const categoriesData = await Promise.all(
            categoriesWithCounts.map(async (category) => {
              const jobCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(schema.jobs)
                .where(sql`category_id = ${category.id}`)

              return {
                ...category,
                jobCount: Number(jobCount[0]?.count || 0),
              }
            })
          )

          return json({
            success: true,
            data: categoriesData,
          })
        } catch (error) {
          console.error('Error fetching categories:', error)
          return json(
            {
              success: false,
              error: 'Failed to fetch categories',
            },
            { status: 500 }
          )
        }
      },
    },
  },
})
