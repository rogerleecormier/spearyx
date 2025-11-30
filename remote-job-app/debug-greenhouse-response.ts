import { decodeHtmlEntities } from './src/lib/html-utils'

async function debugGreenhouseResponse() {
  const company = 'canonical' // Known to have jobs
  const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`
  
  console.log(`Fetching from ${url}...`)
  const response = await fetch(url)
  const data = await response.json()
  
  if (data.jobs && data.jobs.length > 0) {
    const job = data.jobs[0]
    console.log('Job Keys:', Object.keys(job))
    console.log('Job Content Field:', job.content ? 'Present' : 'Missing')
    if (job.content) {
      console.log('Content Preview:', job.content.substring(0, 100))
      console.log('Decoded Content Preview:', decodeHtmlEntities(job.content).substring(0, 100))
    }
    
    // Check for other potential description fields
    console.log('Job Notes:', job.notes)
    console.log('Job Metadata:', JSON.stringify(job.metadata, null, 2))
    
    // Check if there's a 'content' field nested somewhere else or named differently
    // Some endpoints return 'content' only on individual job details, not list?
    // But boards-api usually returns it in the list if using the content=true param? 
    // Wait, boards-api v1/boards/{board_token}/jobs usually returns:
    // id, internal_job_id, title, updated_at, absolute_url, metadata, location, data_compliance
    // It does NOT return 'content' by default!
    
    // We might need to fetch individual job details?
    // Or use the `?content=true` query param if supported?
    
    // Let's try fetching with ?content=true
    const urlWithContent = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`
    console.log(`\nFetching from ${urlWithContent}...`)
    const response2 = await fetch(urlWithContent)
    const data2 = await response2.json()
    if (data2.jobs && data2.jobs.length > 0) {
       const job2 = data2.jobs[0]
       console.log('Job 2 Content Field:', job2.content ? 'Present' : 'Missing')
    }
    
  } else {
    console.log('No jobs found for debugging.')
  }
}

debugGreenhouseResponse().catch(console.error)
