import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { searchCompany } from '../../../lib/company-search'

interface SearchRequestBody {
  source: string
  query: string
}

export const Route = createFileRoute('/api/_archived/v2/search-companies')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Parse request body
          const body = (await request.json()) as SearchRequestBody
          const { source, query } = body

          if (!source || !query) {
            return json({ success: false, error: 'Missing source or query' }, { status: 400 })
          }

          // Search for company
          const result = await searchCompany(source, query)

          if (!result.found) {
            return json({
              success: false,
              found: false,
              error: result.error
            })
          }

          return json({
            success: true,
            found: true,
            company: result.company,
            jobs: result.jobs
          })
        } catch (error) {
          console.error('Company search failed:', error)
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
