# Adding More Job Board Sources

This guide shows you how to add additional job boards to your Remote Job Manager.

## Quick Start: Adding a New Source

### 1. Create Source File

Create a new file in `src/lib/job-sources/` for your job board:

```typescript
// src/lib/job-sources/example-board.ts
import type { RawJobListing } from './types'

export async function fetchExampleBoardJobs(): Promise<RawJobListing[]> {
  try {
    // Fetch from API or scrape
    const response = await fetch('https://api.example-board.com/jobs')
    const data = await response.json()
    
    // Transform to RawJobListing format
    return data.jobs.map((job: any) => ({
      externalId: `example-${job.id}`,
      title: job.title,
      company: job.company,
      description: job.description,
      location: 'Remote',
      salary: job.salary,
      postedDate: new Date(job.posted_at),
      sourceUrl: job.url,
      sourceName: 'ExampleBoard',
      tags: job.skills || []
    }))
  } catch (error) {
    console.error('Error fetching from ExampleBoard:', error)
    return []
  }
}
```

### 2. Register Source

Add to `src/lib/job-sources/index.ts`:

```typescript
import { fetchExampleBoardJobs } from './example-board'

export const jobSources: JobSource[] = [
  {
    name: 'RemoteOK',
    fetch: fetchRemoteOKJobs
  },
  {
    name: 'ExampleBoard',
    fetch: fetchExampleBoardJobs
  }
]
```

### 3. Run Sync

```bash
npm run sync-jobs
```

That's it! New jobs will be automatically categorized and added to your database.

---

## Specific Job Board Implementations

### Indeed (Free API - Requires Approval)

1. **Apply for Publisher ID**: https://www.indeed.com/publisher
2. **Add to environment**: Create `.env` file with `INDEED_PUBLISHER_ID=your_id`
3. **Create source file**:

```typescript
// src/lib/job-sources/indeed.ts
export async function fetchIndeedJobs(): Promise<RawJobListing[]> {
  const publisherId = process.env.INDEED_PUBLISHER_ID
  const url = `http://api.indeed.com/ads/apisearch?publisher=${publisherId}&q=remote&format=json&v=2&limit=100`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return data.results.map((job: any) => ({
    externalId: `indeed-${job.jobkey}`,
    title: job.jobtitle,
    company: job.company,
    description: job.snippet,
    location: job.formattedLocation,
    salary: null, // Indeed doesn't always provide salary
    postedDate: new Date(job.date),
    sourceUrl: job.url,
    sourceName: 'Indeed',
    tags: []
  }))
}
```

### LinkedIn (via RapidAPI)

1. **Get API Key**: Sign up at https://rapidapi.com
2. **Subscribe to** "LinkedIn Jobs Search" API
3. **Install axios**: `npm install axios`
4. **Create source file**:

```typescript
// src/lib/job-sources/linkedin.ts
import axios from 'axios'

export async function fetchLinkedInJobs(): Promise<RawJobListing[]> {
  const options = {
    method: 'GET',
    url: 'https://linkedin-jobs-search.p.rapidapi.com/jobs',
    params: {
      keywords: 'software engineer',
      locationId: '92000000', // Remote
      datePosted: 'anyTime',
      sort: 'mostRecent',
      limit: '100'
    },
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
      'X-RapidAPI-Host': 'linkedin-jobs-search.p.rapidapi.com'
    }
  }

  const response = await axios.request(options)
  
  return response.data.jobs.map((job: any) => ({
    externalId: `linkedin-${job.id}`,
    title: job.title,
    company: job.company,
    description: job.description,
    location: 'Remote',
    salary: job.salary,
    postedDate: new Date(job.postedAt),
    sourceUrl: job.url,
    sourceName: 'LinkedIn',
    tags: job.skills || []
  }))
}
```

### Greenhouse (Free - Company-Specific)

Greenhouse has public job board APIs for each company:

```typescript
// src/lib/job-sources/greenhouse.ts
const REMOTE_COMPANIES = [
  'auth0', 'gitlab', 'automattic', 'shopify',
  'stripe', 'github', 'notion', 'figma'
]

export async function fetchGreenhouseJobs(): Promise<RawJobListing[]> {
  const allJobs: RawJobListing[] = []
  
  for (const company of REMOTE_COMPANIES) {
    try {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${company}/jobs`
      )
      const data = await response.json()
      
      // Filter for remote positions
      const remoteJobs = data.jobs
        .filter((job: any) => 
          job.location.name.toLowerCase().includes('remote')
        )
        .map((job: any) => ({
          externalId: `greenhouse-${job.id}`,
          title: job.title,
          company: company,
          description: job.content || '',
          location: job.location.name,
          salary: null,
          postedDate: new Date(job.updated_at),
          sourceUrl: job.absolute_url,
          sourceName: 'Greenhouse',
          tags: []
        }))
      
      allJobs.push(...remoteJobs)
    } catch (error) {
      console.error(`Error fetching ${company}:`, error)
    }
  }
  
  return allJobs
}
```

### We Work Remotely (Web Scraping)

**⚠️ Check robots.txt and Terms of Service before scraping!**

```typescript
// src/lib/job-sources/weworkremotely.ts
import axios from 'axios'
import * as cheerio from 'cheerio'

export async function fetchWWRJobs(): Promise<RawJobListing[]> {
  const categories = ['programming', 'devops', 'design', 'marketing']
  const allJobs: RawJobListing[] = []
  
  for (const category of categories) {
    try {
      const url = `https://weworkremotely.com/categories/remote-${category}-jobs`
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'RemoteJobManager/1.0'
        }
      })
      
      const $ = cheerio.load(data)
      
      $('li.feature').each((i, el) => {
        const title = $(el).find('.title').text().trim()
        const company = $(el).find('.company').text().trim()
        const jobUrl = 'https://weworkremotely.com' + $(el).find('a').attr('href')
        
        if (title && jobUrl) {
          allJobs.push({
            externalId: `wwr-${jobUrl.split('/').pop()}`,
            title,
            company,
            description: '',
            location: 'Remote',
            salary: null,
            postedDate: new Date(),
            sourceUrl: jobUrl,
            sourceName: 'WeWorkRemotely',
            tags: [category]
          })
        }
      })
      
      // Be respectful - add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Error scraping WWR ${category}:`, error)
    }
  }
  
  return allJobs
}
```

---

## Scheduling Automatic Syncs

### Option 1: Cron Job (Linux/Mac)

```bash
# Run sync every 6 hours
crontab -e
```

Add line:
```
0 */6 * * * cd /path/to/remote-job-app && npm run sync-jobs
```

### Option 2: Node-Cron (Cross-platform)

```bash
npm install node-cron @types/node-cron
```

Create `src/lib/scheduler.ts`:

```typescript
import cron from 'node-cron'
import { syncJobs } from './job-sync'

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled job sync...')
  await syncJobs()
})

console.log('Job sync scheduler started')
```

Add to your server startup or create dedicated command.

### Option 3: GitHub Actions

`.github/workflows/sync-jobs.yml`:

```yaml
name: Sync Jobs

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd remote-job-app && npm ci
      - run: cd remote-job-app && npm run sync-jobs
      - name: Commit updated database
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add remote-job-app/sqlite.db
          git commit -m "Update jobs database" || echo "No changes"
          git push
```

---

## Rate Limiting & Best Practices

### Add Rate Limiting

```typescript
// src/lib/job-sources/rate-limiter.ts
export async function rateLimit(delayMs: number = 1000) {
  await new Promise(resolve => setTimeout(resolve, delayMs))
}

// Usage in your source:
export async function fetchWithRateLimit() {
  const jobs = []
  for (const page of pages) {
    const pageJobs = await fetchPage(page)
    jobs.push(...pageJobs)
    await rateLimit(1000) // Wait 1 second between requests
  }
  return jobs
}
```

### Caching

```typescript
// Cache API responses for 1 hour
const CACHE_DURATION = 60 * 60 * 1000
const cache = new Map<string, { data: any; timestamp: number }>()

export async function fetchWithCache(url: string) {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const response = await fetch(url)
  const data = await response.json()
  cache.set(url, { data, timestamp: Date.now() })
  return data
}
```

### Error Handling

```typescript
export async function fetchJobsWithRetry(
  url: string,
  maxRetries: number = 3
): Promise<RawJobListing[]> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return transformJobs(data)
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error(`Failed after ${maxRetries} retries:`, error)
        return []
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return []
}
```

---

## Testing New Sources

Before adding to production:

```typescript
// test-source.ts
import { fetchExampleBoardJobs } from './src/lib/job-sources/example-board'

async function test() {
  console.log('Testing ExampleBoard source...')
  const jobs = await fetchExampleBoardJobs()
  console.log(`Found ${jobs.length} jobs`)
  console.log('Sample job:', jobs[0])
}

test()
```

Run: `npx tsx test-source.ts`

---

## Current Status

✅ **RemoteOK** - Fully integrated and working
- Free API
- ~100 jobs per sync
- No authentication required
- Updates frequently

### Ready to Add (Easy)

✅ **Greenhouse** - Free, no auth
✅ **We Work Remotely** - Scraping (respect robots.txt)

### Medium Difficulty (API Keys Required)

⚠️ **Indeed** - Free but needs approval
⚠️ **LinkedIn** - RapidAPI subscription (~$10-50/month)
⚠️ **ZipRecruiter** - RapidAPI or partner API

---

## Commands Reference

```bash
# Sync jobs once
npm run sync-jobs

# View database (optional)
npm run db:studio

# Clear all jobs and re-sync
# (delete sqlite.db, then run migrations and sync)
rm sqlite.db
npm run db:migrate
npm run sync-jobs
```
