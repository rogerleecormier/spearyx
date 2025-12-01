export interface CompanySearchResult {
  found: boolean
  company?: {
    slug: string
    name: string
    jobCount: number
    remoteJobCount: number
  }
  jobs?: Array<{
    id: string
    title: string
    location: string
    departments: string[]
    url: string
  }>
  error?: string
}

/**
 * Search for a company on Greenhouse
 */
async function searchGreenhouseCompany(query: string): Promise<CompanySearchResult> {
  const slug = query.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  try {
    const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        return { found: false, error: 'Company not found on Greenhouse' }
      }
      return { found: false, error: `HTTP ${response.status}` }
    }

    const data = await response.json()

    if (!data.jobs || !Array.isArray(data.jobs)) {
      return { found: false, error: 'No jobs data in response' }
    }

    // Filter for remote positions
    const remoteJobs = data.jobs.filter((job: any) => {
      const locationName = job.location?.name?.toLowerCase() || ''
      return locationName.includes('remote')
    })

    return {
      found: true,
      company: {
        slug,
        name: data.jobs[0]?.company_name || slug,
        jobCount: data.jobs.length,
        remoteJobCount: remoteJobs.length
      },
      jobs: remoteJobs.slice(0, 10).map((job: any) => ({
        id: `greenhouse-${job.id}`,
        title: job.title,
        location: job.location?.name || 'Remote',
        departments: job.departments?.map((d: any) => d.name) || [],
        url: job.absolute_url
      }))
    }
  } catch (error) {
    return {
      found: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Search for a company on Lever
 */
async function searchLeverCompany(query: string): Promise<CompanySearchResult> {
  const slug = query.toLowerCase().trim().replace(/\s+/g, '')
  
  try {
    const url = `https://api.lever.co/v0/postings/${slug}?mode=json`
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        return { found: false, error: 'Company not found on Lever' }
      }
      return { found: false, error: `HTTP ${response.status}` }
    }

    const jobs = await response.json()

    if (!Array.isArray(jobs)) {
      return { found: false, error: 'Invalid response format' }
    }

    // Filter for remote positions
    const remoteJobs = jobs.filter((job: any) => {
      const location = job.categories?.location?.toLowerCase() || ''
      const commitment = job.categories?.commitment?.toLowerCase() || ''
      return location.includes('remote') || commitment.includes('remote')
    })

    return {
      found: true,
      company: {
        slug,
        name: jobs[0]?.companyName || slug,
        jobCount: jobs.length,
        remoteJobCount: remoteJobs.length
      },
      jobs: remoteJobs.slice(0, 10).map((job: any) => ({
        id: `lever-${job.id}`,
        title: job.text,
        location: job.categories?.location || job.workplaceType || 'Remote',
        departments: job.categories?.team ? [job.categories.team] : [],
        url: job.hostedUrl
      }))
    }
  } catch (error) {
    return {
      found: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Search for a company across all supported sources
 */
export async function searchCompany(
  source: string,
  query: string
): Promise<CompanySearchResult> {
  const sourceLower = source.toLowerCase()

  if (sourceLower === 'greenhouse') {
    return searchGreenhouseCompany(query)
  } else if (sourceLower === 'lever') {
    return searchLeverCompany(query)
  } else {
    return {
      found: false,
      error: `Unsupported source: ${source}. Supported sources: Greenhouse, Lever`
    }
  }
}
