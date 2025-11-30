import type { RawJobListing } from './types'
import { sanitizeHtml, decodeHtmlEntities } from '../html-utils'
import companiesData from './greenhouse-companies.json'

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
  notes: {
    usage: string
    maintenance: string
    discovery: string
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
  
  // Remove duplicates (in case a company appears in multiple categories)
  return [...new Set(allCompanies)]
}


// Helper function to add delay between requests (rate limiting)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function* fetchGreenhouseJobs(): AsyncGenerator<RawJobListing[]> {
  // const allJobs: RawJobListing[] = [] // No longer needed
  const companies = getCompanyList()
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏢 Fetching jobs from Greenhouse job boards')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Total companies to check: ${companies.length}`)
  console.log(`📅 Database last updated: ${(companiesData as CompanyDatabase).lastUpdated}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  let successCount = 0
  let failCount = 0
  let noJobsCount = 0
  let remoteJobsFound = 0
  
  for (const company of companies) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`
      const response = await fetch(url)
      
      if (!response.ok) {
        // Some companies may not have active job boards or may have moved
        if (response.status === 404) {
          console.log(`  ℹ️  ${company}: No job board found (404)`)
          failCount++
        } else {
          console.warn(`  ⚠️  ${company}: API returned ${response.status}`)
          failCount++
        }
        continue
      }
      
      const data = await response.json()
      
      if (!data.jobs || !Array.isArray(data.jobs)) {
        console.log(`  ℹ️  ${company}: No jobs array in response`)
        noJobsCount++
        continue
      }
      
      // Filter for remote positions
      const remoteJobs = data.jobs
        .filter((job: any) => {
          // Check if location name includes 'remote' (case insensitive)
          const locationName = job.location?.name?.toLowerCase() || ''
          return locationName.includes('remote')
        })
        .map((job: any) => {
          // Sanitize HTML from description and decode entities from title
          // The content from Greenhouse API is often double-encoded
          const rawContent = job.content ? decodeHtmlEntities(job.content) : ''
          const cleanDescription = rawContent 
            ? sanitizeHtml(rawContent)
            : ''
          const cleanTitle = decodeHtmlEntities(job.title || '')
          
          // Get the company name with proper capitalization
          // Some Greenhouse boards use lowercase company identifiers
          const companyName = job.company_name || 
            company.charAt(0).toUpperCase() + company.slice(1)
          
          // Try to extract salary from metadata if available
          let salaryRange = null
          if (job.metadata && Array.isArray(job.metadata)) {
            const salaryField = job.metadata.find((meta: any) => 
              meta.name?.toLowerCase().includes('salary') || 
              meta.name?.toLowerCase().includes('compensation')
            )
            if (salaryField && salaryField.value) {
              salaryRange = salaryField.value
            }
          }

          // If no salary in metadata, try to scrape from description
          if (!salaryRange && cleanDescription) {
            // Strip all HTML tags to make regex matching easier
            const textOnlyDescription = cleanDescription.replace(/<[^>]*>/g, ' ')
            salaryRange = extractSalaryFromDescription(textOnlyDescription)
          }
          
          return {
            externalId: `greenhouse-${job.id}`,
            title: cleanTitle,
            company: companyName,
            description: cleanDescription,
            location: job.location?.name || 'Remote',
            salary: salaryRange,
            postedDate: new Date(job.updated_at),
            sourceUrl: job.absolute_url,
            sourceName: 'Greenhouse',
            tags: job.departments?.map((d: any) => d.name) || []
          }
        })
      
      if (remoteJobs.length > 0) {
        yield remoteJobs
        // allJobs.push(...remoteJobs) // No longer needed
        remoteJobsFound += remoteJobs.length
        console.log(`  ✅ ${company}: Found ${remoteJobs.length} remote job(s)`)
        successCount++
      } else {
        console.log(`  ➖ ${company}: No remote positions`)
        noJobsCount++
      }
      
      // Rate limiting: wait 500ms between requests to be respectful
      await sleep(500)
      
    } catch (error) {
      console.error(`  ❌ ${company}: Error -`, error instanceof Error ? error.message : error)
      failCount++
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📈 Greenhouse Sync Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🎯 Total remote jobs found: ${remoteJobsFound}`)
  console.log(`✅ Companies with remote jobs: ${successCount}`)
  console.log(`➖ Companies with no remote jobs: ${noJobsCount}`)
  console.log(`❌ Failed/Not found: ${failCount}`)
  console.log(`📊 Success rate: ${((successCount / companies.length) * 100).toFixed(1)}%`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // return allJobs // No longer needed
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

