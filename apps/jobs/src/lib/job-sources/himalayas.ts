/**
 * Himalayas Job Source
 * Fetches remote job listings from Himalayas.app API
 * API: https://himalayas.app/jobs/api
 */

import type { JobSource, RawJobListing } from './types.js'
import { sanitizeHtml } from '../html-utils.js'
import { createThrottledRateLimitedFetcher } from '../pacer-utils.js'

// Create throttled and rate-limited fetcher for Himalayas API
// Throttle: 2000ms between requests
// Rate limit: 30 requests per minute
const throttledFetch = createThrottledRateLimitedFetcher({
  throttle: {
    wait: 2000,
    trailing: true,
    maxRetries: 3,
    retryDelay: 2000,
  },
  rateLimit: {
    maxRequests: 30,
    windowMs: 60000, // 1 minute
    sliding: true,
  },
})

export async function* fetchHimalayasJobs() {
  const baseUrl = 'https://himalayas.app/jobs/api'
  const limit = 20 // API limit per request
  let offset = 0
  let totalJobs = 0
  
  try {
    console.log('\n🔍 Fetching jobs from Himalayas...')
    
    while (true) {
      const url = `${baseUrl}?limit=${limit}&offset=${offset}`
      
      const response = await throttledFetch(url, {
        headers: {
          'User-Agent': 'RemoteJobAggregator/1.0'
        }
      })

      
      if (!response.ok) {
        if (response.status === 429) {
          console.log('   ⚠️  Rate limited, stopping pagination')
          break
        }
        console.error(`❌ Himalayas API error: ${response.status}`)
        break
      }
      
      const data: any = await response.json()
      const jobs = data.jobs || []
      
      if (!jobs || jobs.length === 0) {
        break
      }
      
      // Filter for truly remote jobs (no location restrictions)
      const remoteJobs = jobs.filter((job: any) => {
        // Jobs with no location restrictions are fully remote
        // Jobs with location restrictions are limited to specific countries
        return !job.locationRestrictions || job.locationRestrictions.length === 0
      })
      
      if (remoteJobs.length === 0) {
        // If no remote jobs in this batch, continue to next page
        offset += limit
        continue
      }
      
      const processedJobs: RawJobListing[] = remoteJobs.map((job: any) => {
        // Build salary string if available
        let salary = null
        if (job.minSalary && job.maxSalary && job.currency) {
          salary = `${job.currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`
        }
        
        return {
          id: `himalayas-${job.guid}`,
          title: job.title,
          company: job.companyName,
          location: 'Remote',
          description: sanitizeHtml(job.description || job.excerpt || ''),
          sourceUrl: job.applicationLink,
          salary,
          postedDate: job.pubDate ? new Date(job.pubDate * 1000) : new Date(), // Unix timestamp in seconds
          sourceName: 'Himalayas'
        }
      })
      
      yield processedJobs
      
      totalJobs += processedJobs.length
      console.log(`   Fetched ${processedJobs.length} jobs (total: ${totalJobs})`)
      
      
      // If we got fewer jobs than the limit, we've reached the end
      if (jobs.length < limit) {
        break
      }
      
      offset += limit
      
      // Throttling handled by throttledFetch
    }
    
    console.log(`✅ Himalayas: ${totalJobs} remote jobs\n`)
    
  } catch (error) {
    console.error('❌ Error fetching from Himalayas:', error)
  }
}

export const himalayasSource: JobSource = {
  name: 'Himalayas',
  fetch: fetchHimalayasJobs
}
