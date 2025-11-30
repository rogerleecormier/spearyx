import type { RawJobListing } from './types'
import { sanitizeHtml, decodeHtmlEntities } from '../html-utils'

export async function* fetchRemoteOKJobs(): AsyncGenerator<RawJobListing[]> {
  try {
    console.log('Fetching jobs from RemoteOK...')
    const response = await fetch('https://remoteok.com/api')
    
    if (!response.ok) {
      throw new Error(`RemoteOK API returned ${response.status}`)
    }

    // Get the response as text first to ensure proper UTF-8 decoding
    const text = await response.text()
    
    // Parse JSON from the UTF-8 text
    const data = JSON.parse(text)
    
    // RemoteOK API returns metadata as first item, skip it
    const jobs = data.slice(1)
    
    console.log(`Found ${jobs.length} jobs from RemoteOK`)
    
    const processedJobs = jobs
      .filter((job: any) => {
        // Filter out jobs that aren't actually remote or are expired
        return job.position && job.url && !job.expired
      })
      .map((job: any) => {
        // Sanitize HTML from description (preserves formatting)
        const cleanDescription = job.description 
          ? sanitizeHtml(job.description)
          : ''
        
        // Clean HTML entities from title and company
        const cleanTitle = decodeHtmlEntities(job.position || '')
        const cleanCompany = decodeHtmlEntities(job.company || 'Unknown Company')
        
        return {
          externalId: `remoteok-${job.id}`,
          title: cleanTitle,
          company: cleanCompany,
          description: cleanDescription,
          location: 'Remote',
          salary: job.salary_max 
            ? `$${job.salary_min?.toLocaleString() || '?'} - $${job.salary_max.toLocaleString()}`
            : null,
          postedDate: new Date(job.date),
          sourceUrl: job.url,
          sourceName: 'RemoteOK',
          tags: job.tags || []
        }
      })

    yield processedJobs

  } catch (error) {
    console.error('Error fetching from RemoteOK:', error)
    yield []
  }
}
