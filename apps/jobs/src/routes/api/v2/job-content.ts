import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { eq } from 'drizzle-orm'
import { sanitizeHtml, decodeHtmlEntities } from '../../../lib/html-utils'

export const Route = createFileRoute('/api/v2/job-content')({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const url = new URL(request.url)
        const sourceUrl = url.searchParams.get('url')
        const company = url.searchParams.get('company')

        if (!sourceUrl || !company) {
          return json({ error: 'Missing url or company' }, { status: 400 })
        }

        try {
          const ctx = context as any
          const db = await getDbFromContext(ctx)

          // Check if we already have the full description in the DB
          // This applies to sources like Himalayas and RemoteOK where we store it upfront
          const existingJob = await db.select()
            .from(schema.jobs)
            .where(eq(schema.jobs.sourceUrl, sourceUrl))
            .get()

          if (existingJob && existingJob.fullDescription) {
            return json({ content: existingJob.fullDescription })
          }

          let content = ''
          
          // Greenhouse Logic
          // URL format: https://boards.greenhouse.io/company/jobs/12345
          if (sourceUrl.includes('greenhouse.io')) {
            const match = sourceUrl.match(/\/jobs\/(\d+)/)
            if (match && match[1]) {
              const id = match[1]
              // Use the board API to get job details including content
              const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs/${id}`
              
              const response = await fetch(apiUrl)
              if (!response.ok) {
                throw new Error(`Failed to fetch from Greenhouse: ${response.statusText}`)
              }
              
              const data = await response.json() as any
              // Greenhouse returns content in 'content' field, HTML encoded
              const rawContent = data.content || ''
              content = sanitizeHtml(decodeHtmlEntities(rawContent))
            } else {
               return json({ error: 'Could not extract ID from Greenhouse URL' }, { status: 400 })
            }
          } 
          // Lever Logic
          // URL format: https://jobs.lever.co/company/jobId or .../apply
          else if (sourceUrl.includes('lever.co')) {
             // Extract ID: usually after the company name
             // https://jobs.lever.co/company/ID
             const match = sourceUrl.match(/lever\.co\/[^\/]+\/([a-zA-Z0-9-]+)/)
             if (match && match[1]) {
               const id = match[1]
               const apiUrl = `https://api.lever.co/v0/postings/${company}/${id}`
               
               const response = await fetch(apiUrl)
               if (!response.ok) {
                 throw new Error(`Failed to fetch from Lever: ${response.statusText}`)
               }
               
               const data = await response.json() as any
               // Lever returns content in 'description' (HTML) and 'lists' (requirements)
               // We'll combine them
               let rawContent = data.description || ''
               if (data.lists && Array.isArray(data.lists)) {
                 for (const list of data.lists) {
                   rawContent += `<h3>${list.text}</h3><ul>`
                   if (list.content) {
                     rawContent += list.content
                   }
                   rawContent += '</ul>'
                 }
               }
               if (data.additional) {
                 rawContent += `<p>${data.additional}</p>`
               }
               
               content = sanitizeHtml(rawContent)
             } else {
                return json({ error: 'Could not extract ID from Lever URL' }, { status: 400 })
             }
          }
          else {
             return json({ error: 'Unsupported source' }, { status: 400 })
          }

          // Create 200-word summary
          // Strip tags for word counting/summary
          const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          const words = textOnly.split(' ')
          const summaryText = words.slice(0, 200).join(' ') + (words.length > 200 ? '...' : '')
          
          // Update DB with full description (cache it) and summary
          // ctx and db are already declared at the top of the try block
          
          await db.update(schema.jobs)
            .set({ 
              fullDescription: content,
              description: summaryText, // Always update summary to ensure it's fresh and formatted correctly
              updatedAt: new Date()
            })
            .where(eq(schema.jobs.sourceUrl, sourceUrl))

          return json({ content })
        } catch (error) {
          console.error('Error fetching job content:', error)
          return json({ error: 'Failed to fetch content' }, { status: 500 })
        }
      }
    }
  }
})
