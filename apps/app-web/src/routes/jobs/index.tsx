import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Briefcase, Loader2 } from 'lucide-react'
import JobCard from '../../components/jobs/JobCard'
import SearchBar from '../../components/jobs/SearchBar'
import CategoryFilter from '../../components/jobs/CategoryFilter'
import SourceFilter from '../../components/jobs/SourceFilter'
import SalaryFilter from '../../components/jobs/SalaryFilter'
import SortControls from '../../components/jobs/SortControls'
import type { JobWithCategory } from '../../lib/jobs/search-utils'
import '../../styles/jobs.css'

export const Route = createFileRoute('/jobs/')({ component: HomePage })

interface Category {
  id: number
  name: string
  slug: string
  jobCount: number
}

interface JobsResponse {
  success: boolean
  data: {
    jobs: JobWithCategory[]
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface CategoriesResponse {
  success: boolean
  data: Category[]
}

function HomePage() {
  const [jobs, setJobs] = useState<JobWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  )
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string | null>(
    null
  )
  const [includeNoSalary, setIncludeNoSalary] = useState(false)
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'title-asc' | 'title-desc'
  >('newest')
  const [totalJobs, setTotalJobs] = useState(0)

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json() as unknown)
      .then((data) => {
        const typedData = data as CategoriesResponse
        if (typedData.success) {
          setCategories(typedData.data)
        }
      })
      .catch((error) => console.error('Error fetching categories:', error))
  }, [])

  // Fetch jobs whenever filters change
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategoryId) params.set('category', selectedCategoryId.toString())
    if (selectedSource) params.set('source', selectedSource)
    if (selectedSalaryRange) params.set('salaryRange', selectedSalaryRange)
    if (includeNoSalary) params.set('includeNoSalary', 'true')
    params.set('sortBy', sortBy)
    params.set('limit', '50')

    fetch(`/api/jobs?${params.toString()}`)
      .then((res) => res.json() as unknown)
      .then((data) => {
        const typedData = data as JobsResponse
        if (typedData.success) {
          setJobs(typedData.data.jobs)
          setTotalJobs(typedData.data.total)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching jobs:', error)
        setLoading(false)
      })
  }, [searchQuery, selectedCategoryId, selectedSource, selectedSalaryRange, includeNoSalary, sortBy])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId)
  }, [])

  const handleSourceSelect = useCallback((source: string | null) => {
    setSelectedSource(source)
  }, [])

  const handleSalaryRangeSelect = useCallback((range: string | null) => {
    setSelectedSalaryRange(range)
  }, [])

  const handleIncludeNoSalaryChange = useCallback((include: boolean) => {
    setIncludeNoSalary(include)
  }, [])

  const handleSortChange = useCallback(
    (newSortBy: 'newest' | 'oldest' | 'title-asc' | 'title-desc') => {
      setSortBy(newSortBy)
    },
    []
  )

  return (
    <div className="app-container">
      {/* Main Content */}
      <main className="main-content">
        {/* Search and Filters */}
        <div className="controls-section">
          <SearchBar onSearch={handleSearch} />

          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
          />

          <SourceFilter
            selectedSource={selectedSource}
            onSelectSource={handleSourceSelect}
          />

          <SalaryFilter
            selectedRange={selectedSalaryRange}
            onSelectRange={handleSalaryRangeSelect}
            includeNoSalary={includeNoSalary}
            onIncludeNoSalaryChange={handleIncludeNoSalaryChange}
          />

          <div className="results-bar">
            <div className="results-count">
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  <strong>{totalJobs}</strong> remote jobs found
                </span>
              )}
            </div>
            <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
          </div>
        </div>

        {/* Job Listings */}
        <div className="jobs-section">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={48} />
              <p>Finding the best remote jobs for you...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={64} className="empty-icon" />
              <h2>No jobs found</h2>
              <p>
                Try adjusting your search or filters to find more opportunities.
              </p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
