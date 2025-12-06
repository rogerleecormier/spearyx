import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { Overline, Hero, Body } from "@spearyx/ui-kit";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import SortControls from "../components/SortControls";
import type { JobWithCategory } from "../lib/search-utils";
import { getStaticCategories, getStaticJobs } from "../lib/static-data";

export const Route = createFileRoute("/")({ component: HomePage });

interface Category {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

function HomePage() {
  const [jobs, setJobs] = useState<JobWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string | null>(
    null
  );
  const [includeNoSalary, setIncludeNoSalary] = useState(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title-asc" | "title-desc" | "recently-added"
  >("newest");
  const [totalJobs, setTotalJobs] = useState(0);

  // Load categories on mount (static data for Azure SWA preview)
  useEffect(() => {
    setCategories(getStaticCategories());
  }, []);

  // Load jobs (static data for Azure SWA preview)
  useEffect(() => {
    setLoading(true);
    // Using static empty data for Azure SWA preview
    // This will be replaced with Azure Functions API calls later
    const staticData = getStaticJobs();
    setJobs(staticData.jobs);
    setTotalJobs(staticData.total);
    setLoading(false);
  }, [
    searchQuery,
    selectedCategoryId,
    selectedSource,
    selectedSalaryRange,
    includeNoSalary,
    sortBy,
  ]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleSourceSelect = useCallback((source: string | null) => {
    setSelectedSource(source);
  }, []);

  const handleSalaryRangeSelect = useCallback((range: string | null) => {
    setSelectedSalaryRange(range);
  }, []);

  const handleIncludeNoSalaryChange = useCallback((include: boolean) => {
    setIncludeNoSalary(include);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: "newest" | "oldest" | "title-asc" | "title-desc") => {
      setSortBy(newSortBy);
    },
    []
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <Overline className="text-primary-600 mb-2">
                Remote Opportunities
              </Overline>
              <Hero className="text-2xl md:text-3xl lg:text-4xl text-slate-950 mb-2">
                Find Your Next Role
              </Hero>
              <Body size="sm" className="text-slate-600">
                Curated remote jobs from top tech companies
              </Body>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            {/* Search Bar - Grows to fill space */}
            <div className="w-full lg:flex-[2] min-w-[350px]">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Filters - Wrap on mobile, single row on desktop */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <FilterDropdown
                label="Categories"
                value={selectedCategoryId}
                options={categories.map((c) => ({
                  id: c.id,
                  label: c.name,
                  count: c.jobCount,
                }))}
                onChange={handleCategorySelect}
              />

              <FilterDropdown
                label="Source"
                value={selectedSource}
                options={[
                  { id: "RemoteOK", label: "RemoteOK" },
                  { id: "Greenhouse", label: "Greenhouse" },
                  { id: "Lever", label: "Lever" },
                  { id: "Himalayas", label: "Himalayas" },
                ]}
                onChange={handleSourceSelect}
              />

              <FilterDropdown
                label="Salary"
                value={selectedSalaryRange}
                options={[
                  { id: "0-50000", label: "Under $50k" },
                  { id: "50000-100000", label: "$50k - $100k" },
                  { id: "100000-150000", label: "$100k - $150k" },
                  { id: "150000-200000", label: "$150k - $200k" },
                  { id: "200000+", label: "Over $200k" },
                ]}
                onChange={handleSalaryRangeSelect}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
            <div className="flex items-center gap-6">
              <div className="text-sm text-slate-600">
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    <strong>{totalJobs}</strong> remote jobs found
                  </span>
                )}
              </div>
              
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none hidden md:flex">
                <input
                  type="checkbox"
                  checked={includeNoSalary}
                  onChange={(e) => handleIncludeNoSalaryChange(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 accent-primary-600"
                />
                <span>Include jobs with no salary info</span>
              </label>
            </div>
            <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
          </div>
        </div>

        {/* Job Listings */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
              <p>Finding the best remote jobs for you...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <Briefcase size={64} className="text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h2>
              <p className="text-slate-600">
                Try adjusting your search or filters to find more opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
