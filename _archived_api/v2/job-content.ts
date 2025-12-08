import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { getDbFromContext, schema } from '../../../db/db'
import { eq } from 'drizzle-orm'
import { sanitizeHtml, decodeHtmlEntities } from '../../../lib/html-utils'
import { extractSalaryFromDescription } from '../../../lib/job-sources/salary-utils'

export const Route = createFileRoute('/api/_archived/v2/job-content')({
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

          // LAZY CLEANSING: If job has raw description but hasn't been cleansed, do it now
          if (existingJob && existingJob.descriptionRaw && !existingJob.isCleansed) {
            const cleansedDescription = sanitizeHtml(existingJob.descriptionRaw)
            const textOnly = cleansedDescription.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
            const words = textOnly.split(' ')
            const summaryText = words.slice(0, 200).join(' ') + (words.length > 200 ? '...' : '')
            
            // Update with cleansed data
            await db.update(schema.jobs).set({
              description: summaryText,
              fullDescription: cleansedDescription,
              isCleansed: 1,
              updatedAt: new Date()
            }).where(eq(schema.jobs.id, existingJob.id))
            
            return json({ content: cleansedDescription }, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Worker-Version': 'v3-lazy-cleansing'
              }
            })
          }

          if (existingJob && existingJob.fullDescription) {
            // Re-process through sanitizeHtml to apply latest formatting improvements
            // This ensures existing jobs benefit from new formatting logic without re-syncing
            const reprocessed = sanitizeHtml(existingJob.fullDescription)
            return json({ content: reprocessed }, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Worker-Version': 'v3-lazy-cleansing'
              }
            })
          }


          let content = ''
          
          // Greenhouse Logic
          // URL format: https://boards.greenhouse.io/company/jobs/12345
          const lowerSourceUrl = sourceUrl.toLowerCase()
          
          if (lowerSourceUrl.includes('greenhouse.io') || lowerSourceUrl.includes('greenhouse')) {
            // Extract board token from URL (more reliable than company name which might be capitalized)
            // matches: boards.greenhouse.io/TOKEN/jobs/ID
            const tokenMatch = sourceUrl.match(/boards\.greenhouse\.io\/([^\/]+)\/jobs\/(\d+)/i)
            
            if (tokenMatch && tokenMatch[1] && tokenMatch[2]) {
              const boardToken = tokenMatch[1]
              const id = tokenMatch[2]
              
              // Use the board API to get job details including content
              const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${id}`
              
              const response = await fetch(apiUrl)
              if (!response.ok) {
                console.error(`Greenhouse API error for ${apiUrl}:`, response.status, response.statusText)
                throw new Error(`Failed to fetch from Greenhouse: ${response.statusText}`)
              }
              
              const data = await response.json() as any
              // Greenhouse returns content in 'content' field, HTML encoded
              const rawContent = data.content || ''
              content = sanitizeHtml(decodeHtmlEntities(rawContent))
            } else {
               // Fallback: try to match just ID if full URL structure isn't standard
               const idMatch = sourceUrl.match(/\/jobs\/(\d+)/i)
               if (idMatch && idMatch[1]) {
                  const id = idMatch[1]
                  // Fallback to company param, but ensure it's lowercase as board tokens usually are
                  const boardToken = company.toLowerCase() 
                  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs/${id}`
                  
                  console.log(`Using fallback Greenhouse URL: ${apiUrl}`)
                  const response = await fetch(apiUrl)
                  if (!response.ok) {
                     console.error(`Greenhouse fallback API error for ${apiUrl}:`, response.status, response.statusText)
                     throw new Error(`Failed to fetch from Greenhouse (fallback): ${response.statusText}`)
                  }
                  const data = await response.json() as any
                  const rawContent = data.content || ''
                  content = sanitizeHtml(decodeHtmlEntities(rawContent))
                } else {
                  console.error(`Could not extract ID from Greenhouse URL: ${sourceUrl}`)
                  return json({ error: 'Could not extract ID from Greenhouse URL', url: sourceUrl }, { status: 400 })
                }
             }
          } 
          // Lever Logic
          // URL format: https://jobs.lever.co/company/jobId or .../apply
          else if (lowerSourceUrl.includes('lever.co') || lowerSourceUrl.includes('lever')) {
              // Extract ID: usually after the company name
              // https://jobs.lever.co/company/ID
              const match = sourceUrl.match(/lever\.co\/([^\/]+)\/([a-zA-Z0-9-]+)/i)
              if (match && match[1] && match[2]) {
                const companySlug = match[1]
                const id = match[2]
                const apiUrl = `https://api.lever.co/v0/postings/${companySlug}/${id}`
                
                console.log(`Fetching Lever job from: ${apiUrl}`)
                const response = await fetch(apiUrl)
                if (!response.ok) {
                  console.error(`Lever API error for ${apiUrl}:`, response.status, response.statusText)
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
                 console.error(`Could not extract ID from Lever URL: ${sourceUrl}`)
                 return json({ error: 'Could not extract ID from Lever URL', url: sourceUrl }, { status: 400 })
              }
           }
          else {
              console.error(`Unsupported source URL: ${sourceUrl}, company: ${company}`)
              
              // Check if this might be a custom domain Greenhouse job
              const isLikelyCustomDomain = lowerSourceUrl.includes('jobs.') || 
                                          lowerSourceUrl.includes('careers.') ||
                                          lowerSourceUrl.includes('gh_jid=')
              
              return json({ 
                error: 'Unsupported source', 
                url: sourceUrl,
                company: company,
                isCustomDomain: isLikelyCustomDomain,
                hint: isLikelyCustomDomain 
                  ? 'This job is hosted on a custom domain. Please visit the job page directly to view the full description.'
                  : 'This job source does not support on-demand description fetching. The description should already be in the database.'
              }, { status: 400 })
          }

          // Create 200-word summary
          // Strip tags for word counting/summary
          const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
          const words = textOnly.split(' ')
          const summaryText = words.slice(0, 200).join(' ') + (words.length > 200 ? '...' : '')
          
          // Re-extract salary from full description if not already set
          const extractedSalary = extractSalaryFromDescription(textOnly)
          
          // Update DB with full description (cache it), summary, and salary if found
          const updateValues: any = {
            fullDescription: content,
            description: summaryText,
            updatedAt: new Date()
          }
          
          // Only update salary if we found one and the job doesn't already have one
          if (extractedSalary && existingJob && !existingJob.payRange) {
            updateValues.payRange = extractedSalary
          }
          
          await db.update(schema.jobs)
            .set(updateValues)
            .where(eq(schema.jobs.sourceUrl, sourceUrl))

          return json({ content }, { 
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
              'X-Worker-Version': 'v2-encoding-fix-robust'
            }
          })
        } catch (error) {
          console.error('Error fetching job content:', error)
          console.error('Details:', {
            sourceUrl,
            company,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          })
          return json({ 
            error: 'Failed to fetch content',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 })
        }
      }
    }
  }
})
