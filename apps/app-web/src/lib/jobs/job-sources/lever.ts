import type { RawJobListing } from './types'
import { sanitizeHtml, decodeHtmlEntities } from '../html-utils'
import companiesData from './lever-companies.json'

// Type definition for the JSON structure
interface CompanyDatabase {
  version: string
  lastUpdated: string
  description: string
  categories: {
    [key: string]: {
      name: string
      companies: string[]
    }
  }
}

// Load and flatten company list from all categories
function getCompanyList(): string[] {
  const data = companiesData as CompanyDatabase
  const allCompanies: string[] = []
  
  // Extract companies from all categories
  Object.values(data.categories).forEach(category => {
    allCompanies.push(...category.companies)
  })
  
  // Remove duplicates
  return [...new Set(allCompanies)]
}

// Helper function to add delay between requests (rate limiting)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function* fetchLeverJobs(): AsyncGenerator<RawJobListing[]> {
  const companies = getCompanyList()
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏢 Fetching jobs from Lever job boards')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Total companies to check: ${companies.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  let successCount = 0
  let failCount = 0
  let noJobsCount = 0
  let remoteJobsFound = 0
  
  for (const company of companies) {
    try {
      // Lever API endpoint: https://api.lever.co/v0/postings/{company}?mode=json
      const url = `https://api.lever.co/v0/postings/${company}?mode=json`
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`  ℹ️  ${company}: No job board found (404)`)
          failCount++
        } else {
          console.warn(`  ⚠️  ${company}: API returned ${response.status}`)
          failCount++
        }
        continue
      }
      
      const jobs = await response.json()
      
      if (!jobs || !Array.isArray(jobs)) {
        console.log(`  ℹ️  ${company}: No jobs array in response`)
        noJobsCount++
        continue
      }
      
      // Filter for remote positions
      const remoteJobs = jobs
        .filter((job: any) => {
          // Check categories.location and categories.commitment
          const location = job.categories?.location?.toLowerCase() || ''
          const commitment = job.categories?.commitment?.toLowerCase() || ''
          const description = job.descriptionPlain?.toLowerCase() || ''
          
          return location.includes('remote') || 
                 commitment.includes('remote') ||
                 description.includes('remote')
        })
        .map((job: any) => {
          // Sanitize HTML from description
          const cleanDescription = job.description 
            ? sanitizeHtml(job.description)
            : ''
            
          const cleanTitle = decodeHtmlEntities(job.text || '')
          
          // Try to extract salary
          let salaryRange = null
          
          // Lever sometimes has salaryRange field
          if (job.salaryRange) {
            const min = job.salaryRange.min
            const max = job.salaryRange.max
            const currency = job.salaryRange.currency || 'USD'
            if (min && max) {
              salaryRange = `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
            }
          }
          
          // If no explicit range, try to parse from description
          if (!salaryRange && cleanDescription) {
             const textOnlyDescription = cleanDescription.replace(/<[^>]*>/g, ' ')
             salaryRange = extractSalaryFromDescription(textOnlyDescription)
          }
          
          return {
            externalId: `lever-${job.id}`,
            title: cleanTitle,
            company: company.charAt(0).toUpperCase() + company.slice(1),
            description: cleanDescription,
            location: job.categories?.location || 'Remote',
            salary: salaryRange || undefined,
            postedDate: new Date(job.createdAt),
            sourceUrl: job.applyUrl || job.hostedUrl,
            sourceName: 'Lever',
            tags: [
              job.categories?.team,
              job.categories?.department,
              job.categories?.commitment
            ].filter(Boolean)
          }
        })
      
      if (remoteJobs.length > 0) {
        yield remoteJobs
        remoteJobsFound += remoteJobs.length
        console.log(`  ✅ ${company}: Found ${remoteJobs.length} remote job(s)`)
        successCount++
      } else {
        console.log(`  ➖ ${company}: No remote positions`)
        noJobsCount++
      }
      
      // Rate limiting
      await sleep(500)
      
    } catch (error) {
      console.error(`  ❌ ${company}: Error -`, error instanceof Error ? error.message : error)
      failCount++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📈 Lever Sync Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🎯 Total remote jobs found: ${remoteJobsFound}`)
  console.log(`✅ Companies with remote jobs: ${successCount}`)
  console.log(`➖ Companies with no remote jobs: ${noJobsCount}`)
  console.log(`❌ Failed/Not found: ${failCount}`)
  console.log(`📊 Success rate: ${((successCount / companies.length) * 100).toFixed(1)}%`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

function extractSalaryFromDescription(description: string): string | null {
  // Common salary patterns
  const patterns = [
    // $100k - $150k or $100k-$150k
    /\$(\d{2,3})k\s*-\s*\$(\d{2,3})k/i,
    // $100,000 - $150,000 (standard)
    /\$(\d{1,3}(?:,\d{3})+)\s*-\s*\$(\d{1,3}(?:,\d{3})+)/i,
    // $100,000 — $150,000 (em dash/en dash/hyphen) with optional USD
    /\$(\d{1,3}(?:,\d{3})+)\s*[—–-]\s*\$(\d{1,3}(?:,\d{3})+)(?:\s*USD)?/i,
    // USD 100k - 150k
    /USD\s*(\d{2,3})k\s*-\s*(\d{2,3})k/i,
    // £50k - £70k
    /£(\d{2,3})k\s*-\s*£(\d{2,3})k/i
  ]

  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match) {
      return match[0]
    }
  }

  return null
}
