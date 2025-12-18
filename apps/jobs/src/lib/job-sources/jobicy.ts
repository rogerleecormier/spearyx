/**
 * Jobicy Job Source
 * Fetches remote job listings from Jobicy API
 * API: https://jobicy.com/api/v2/remote-jobs
 */

import type { JobSource, RawJobListing } from './types.js'
import { sanitizeHtml, decodeHtmlEntities } from '../html-utils.js'
import { createThrottledRateLimitedFetcher } from '../pacer-utils.js'

// Create throttled and rate-limited fetcher for Jobicy API
// Throttle: 2000ms between requests (be respectful of free API)
// Rate limit: 20 requests per minute
const throttledFetch = createThrottledRateLimitedFetcher({
  throttle: {
    wait: 2000,
    trailing: true,
    maxRetries: 3,
    retryDelay: 2000,
  },
  rateLimit: {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
    sliding: true,
  },
})

interface JobicyJob {
  id: number
  url: string
  jobTitle: string
  companyName: string
  companyLogo?: string
  jobIndustry?: string[]
  jobType?: string[]
  jobGeo?: string
  jobLevel?: string
  jobExcerpt?: string
  jobDescription?: string
  pubDate: string
  annualSalaryMin?: number
  annualSalaryMax?: number
  salaryCurrency?: string
}

interface JobicyResponse {
  jobCount: number
  jobs: JobicyJob[]
}

export async function* fetchJobicyJobs(
  query?: string, 
  onLog?: (message: string) => void, 
  _companyFilter?: string[], 
  _jobOffset?: number, 
  jobLimit?: number
): AsyncGenerator<RawJobListing[]> {
  const baseUrl = 'https://jobicy.com/api/v2/remote-jobs'
  // Jobicy API supports max 100 jobs per request (default and max)
  const count = Math.min(jobLimit || 100, 100)
  
  const log = (msg: string) => {
    console.log(msg)
    onLog?.(msg)
  }
  
  try {
    log('\n🔍 Fetching jobs from Jobicy...')
    
    // Build URL with optional filters
    let url = `${baseUrl}?count=${count}`
    if (query) {
      url += `&tag=${encodeURIComponent(query)}`
    }
    
    const response = await throttledFetch(url, {
      headers: {
        'User-Agent': 'SpearyxJobBot/1.0 (https://jobs.spearyx.com)'
      }
    })
    
    if (!response.ok) {
      if (response.status === 429) {
        log('   ⚠️  Rate limited by Jobicy')
        yield []
        return
      }
      log(`❌ Jobicy API error: ${response.status}`)
      yield []
      return
    }
    
    const data: JobicyResponse = await response.json()
    const jobs = data.jobs || []
    
    if (!jobs || jobs.length === 0) {
      log('   No jobs returned from Jobicy')
      yield []
      return
    }
    
    log(`   Found ${jobs.length} jobs from Jobicy`)
    
    const processedJobs: RawJobListing[] = jobs.map((job: JobicyJob) => {
      // Build salary string if available
      let salary = null
      if (job.annualSalaryMin && job.annualSalaryMax && job.salaryCurrency) {
        salary = `${job.salaryCurrency} ${job.annualSalaryMin.toLocaleString()} - ${job.annualSalaryMax.toLocaleString()}/year`
      } else if (job.annualSalaryMin && job.salaryCurrency) {
        salary = `${job.salaryCurrency} ${job.annualSalaryMin.toLocaleString()}+/year`
      }
      
      return {
        id: `jobicy-${job.id}`,
        title: decodeHtmlEntities(job.jobTitle),
        company: decodeHtmlEntities(job.companyName),
        location: job.jobGeo || 'Remote',
        description: sanitizeHtml(job.jobExcerpt || ''), // Short description for search
        fullDescription: sanitizeHtml(job.jobDescription || ''), // Full HTML content
        sourceUrl: job.url,
        salary,
        postedDate: new Date(job.pubDate), // ISO date string
        sourceName: 'Jobicy'
      }
    })
    
    yield processedJobs
    
    log(`✅ Jobicy: ${processedJobs.length} remote jobs\n`)
    
  } catch (error) {
    log(`❌ Error fetching from Jobicy: ${error}`)
    yield []
  }
}

export const jobicySource: JobSource = {
  name: 'Jobicy',
  fetch: fetchJobicyJobs
}
