#!/usr/bin/env node
/**
 * Greenhouse Companies Discovery Script
 * 
 * Discovers new SaaS and tech companies using Greenhouse ATS
 * by testing curated lists and pattern variations.
 * 
 * Filters for companies with remote jobs and suggests categories.
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { getAllCompanies } from './company-sources.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const JSON_PATH = path.join(__dirname, 'greenhouse-companies.json')

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

interface DiscoveredCompany {
  slug: string
  jobCount: number
  remoteJobCount: number
  departments: string[]
  suggestedCategory: string
  sampleJobs: string[]
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function testCompany(slug: string): Promise<DiscoveredCompany | null> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) {
      return null
    }
    
    // Filter for remote positions
    const remoteJobs = data.jobs.filter((job: any) => {
      const locationName = job.location?.name?.toLowerCase() || ''
      return locationName.includes('remote')
    })
    
    if (remoteJobs.length === 0) {
      return null // Only interested in companies with remote jobs
    }
    
    // Extract departments
    const departments = new Set<string>()
    remoteJobs.forEach((job: any) => {
      job.departments?.forEach((dept: any) => {
        if (dept.name) departments.add(dept.name)
      })
    })
    
    // Get sample job titles (up to 5)
    const sampleJobs = remoteJobs.slice(0, 5).map((job: any) => job.title)
    
    // Suggest category based on job titles and departments
    const suggestedCategory = suggestCategory(sampleJobs, Array.from(departments))
    
    return {
      slug,
      jobCount: data.jobs.length,
      remoteJobCount: remoteJobs.length,
      departments: Array.from(departments),
      suggestedCategory,
      sampleJobs
    }
    
  } catch (error) {
    return null
  }
}

function suggestCategory(jobTitles: string[], departments: string[]): string {
  const allText = [...jobTitles, ...departments].join(' ').toLowerCase()
  
  // Category detection keywords
  const categories = {
    'tech-giants': ['enterprise', 'global', 'director', 'vp', 'principal'],
    'established-tech': ['senior', 'staff', 'lead', 'manager'],
    'remote-first': ['remote', 'distributed', 'anywhere'],
    'startups-scaleups': ['founding', 'startup', 'early', 'growth'],
    'fintech': ['fintech', 'payment', 'banking', 'crypto', 'blockchain', 'financial'],
    'security-devops': ['security', 'devops', 'infrastructure', 'sre', 'platform'],
    'developer-tools': ['developer', 'api', 'sdk', 'platform', 'tools', 'engineering'],
    'data-analytics': ['data', 'analytics', 'bi', 'analyst', 'data science', 'ml'],
    'saas-products': ['product', 'saas', 'software', 'application'],
    'design-creative': ['design', 'creative', 'ux', 'ui', 'brand', 'visual'],
    'healthcare-biotech': ['health', 'medical', 'bio', 'clinical', 'patient'],
    'education-learning': ['education', 'learning', 'teaching', 'training', 'course'],
    'communication': ['communication', 'messaging', 'chat', 'collaboration'],
    'yc-companies': [] // Will be manually categorized
  }
  
  let maxScore = 0
  let bestCategory = 'saas-products' // default
  
  Object.entries(categories).forEach(([category, keywords]) => {
    const score = keywords.reduce((sum, keyword) => {
      return sum + (allText.includes(keyword) ? 1 : 0)
    }, 0)
    
    if (score > maxScore) {
      maxScore = score
      bestCategory = category
    }
  })
  
  return bestCategory
}

function generateSlugVariations(company: string): string[] {
  const variations: string[] = []
  
  // Clean the company name
  const cleaned = company.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
  
  // Only generate the most common variations:
  
  // 1. Replace spaces with hyphens (most common)
  const hyphenated = cleaned.replace(/\s+/g, '-')
  variations.push(hyphenated)
  
  // 2. Remove spaces entirely (second most common)
  const nospaces = cleaned.replace(/\s+/g, '')
  if (nospaces !== hyphenated) {
    variations.push(nospaces)
  }
  
  // 3. Original with spaces (rare but some use it)
  if (cleaned !== hyphenated && cleaned !== nospaces) {
    variations.push(cleaned)
  }
  
  // Remove duplicates and return
  return [...new Set(variations)]
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 Greenhouse Companies Discovery Script')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // Load existing database
  const existingData: CompanyDatabase = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  
  // Get existing companies
  const existingCompanies = new Set<string>()
  Object.values(existingData.categories).forEach(category => {
    category.companies.forEach(c => existingCompanies.add(c))
  })
  
  console.log(`📊 Current database has ${existingCompanies.size} companies`)
  
  // Get potential companies to test
  const potentialCompanies = getAllCompanies()
  console.log(`🎯 Testing ${potentialCompanies.length} potential companies from curated lists\n`)
  
  // Generate variations for each company
  const allVariations = new Set<string>()
  potentialCompanies.forEach(company => {
    const variations = generateSlugVariations(company)
    variations.forEach(v => allVariations.add(v))
  })
  
  // Filter out already existing companies
  const companySlugsToTest = new Set<string>()
  allVariations.forEach(slug => {
    if (!existingCompanies.has(slug)) {
      companySlugsToTest.add(slug)
    }
  })
  
  const totalVariations = allVariations.size
  const alreadyInDb = totalVariations - companySlugsToTest.size
  
  console.log(`🔬 Generated ${totalVariations} slug variations to test`)
  console.log(`⏭️  Skipping ${alreadyInDb} already in database`)
  console.log(`🎯 Will test ${companySlugsToTest.size} new companies\n`)
  
  const discovered: DiscoveredCompany[] = []
  let tested = 0
  const total = companySlugsToTest.size
  
  console.log('🔍 Testing companies (this may take a while)...\n')
  
  for (const slug of companySlugsToTest) {
    tested++
    
    // Show progress every 5 companies or on first/last
    if (tested === 1 || tested % 5 === 0 || tested === total) {
      console.log(`   Progress: ${tested}/${total} (${((tested/total)*100).toFixed(1)}%)`)
    }
    
    const result = await testCompany(slug)
    
    if (result) {
      discovered.push(result)
      console.log(`✅ ${slug}: ${result.remoteJobCount} remote jobs`)
    }
    
    // Rate limiting - 500ms = 2 requests/second (respectful)
    await sleep(500)
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📈 Discovery Results')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log(`🔬 Companies tested: ${tested}`)
  console.log(`✅ Companies discovered: ${discovered.length}`)
  console.log(`🎯 Success rate: ${((discovered.length / tested) * 100).toFixed(1)}%`)
  
  if (discovered.length === 0) {
    console.log('\n😔 No new companies discovered. Try:')
    console.log('   - Adding more companies to company-sources.ts')
    console.log('   - Running cleanup first to remove duplicates')
    console.log('   - Checking if database is already comprehensive\n')
    return
  }
  
  const totalRemoteJobs = discovered.reduce((sum, c) => sum + c.remoteJobCount, 0)
  console.log(`💼 Total remote jobs available: ${totalRemoteJobs}`)
  console.log(`📊 Average remote jobs per company: ${(totalRemoteJobs / discovered.length).toFixed(1)}`)
  
  // Group by suggested category
  const byCategory = new Map<string, DiscoveredCompany[]>()
  discovered.forEach(company => {
    if (!byCategory.has(company.suggestedCategory)) {
      byCategory.set(company.suggestedCategory, [])
    }
    byCategory.get(company.suggestedCategory)!.push(company)
  })
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 Discovered Companies by Category')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  byCategory.forEach((companies, category) => {
    console.log(`\n${existingData.categories[category]?.name || category} (${companies.length} companies):`)
    companies.forEach(c => {
      console.log(`  📌 ${c.slug}`)
      console.log(`     ${c.remoteJobCount} remote jobs`)
      if (c.departments.length > 0) {
        console.log(`     Departments: ${c.departments.slice(0, 3).join(', ')}${c.departments.length > 3 ? '...' : ''}`)
      }
      console.log(`     Sample: ${c.sampleJobs[0] || 'N/A'}`)
    })
  })
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💾 Saving Results')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  // Add discovered companies to database
  discovered.forEach(company => {
    const category = company.suggestedCategory
    if (!existingData.categories[category]) {
      console.warn(`⚠️  Category ${category} not found, using 'saas-products'`)
      existingData.categories['saas-products'].companies.push(company.slug)
    } else {
      existingData.categories[category].companies.push(company.slug)
    }
  })
  
  // Sort companies in each category
  Object.values(existingData.categories).forEach(category => {
    category.companies.sort()
  })
  
  // Update metadata
  existingData.lastUpdated = new Date().toISOString().split('T')[0]
  
  // Save
  fs.writeFileSync(JSON_PATH, JSON.stringify(existingData, null, 2))
  
  console.log(`✅ Added ${discovered.length} companies to database`)
  console.log(`📄 Updated: ${JSON_PATH}`)
  console.log(`\n🎯 Database now has ${existingCompanies.size + discovered.length} companies total`)
  console.log(`📈 Increased by ${discovered.length} companies (+${((discovered.length / existingCompanies.size) * 100).toFixed(1)}%)\n`)
  
  console.log('💡 Next steps:')
  console.log('   1. Review the additions in greenhouse-companies.json')
  console.log('   2. Run: npm run sync-jobs to fetch jobs from new companies')
  console.log('   3. Run discovery again periodically to find more companies\n')
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
