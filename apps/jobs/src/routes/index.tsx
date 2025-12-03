import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { Overline, Hero, Body } from "@spearyx/ui-kit";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import SourceFilter from "../components/SourceFilter";
import SalaryFilter from "../components/SalaryFilter";
import SortControls from "../components/SortControls";
import type { JobWithCategory } from "../lib/jobs/search-utils";

export const Route = createFileRoute("/")({ component: HomePage });

interface Category {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

interface JobsResponse {
  success: boolean;
  data: {
    jobs: JobWithCategory[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
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
    "newest" | "oldest" | "title-asc" | "title-desc"
  >("newest");
  const [totalJobs, setTotalJobs] = useState(0);

  // Fetch categories on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json() as unknown)
      .then((data) => {
        const typedData = data as CategoriesResponse;
        if (typedData.success) {
          setCategories(typedData.data);
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch jobs whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategoryId)
      params.set("category", selectedCategoryId.toString());
    if (selectedSource) params.set("source", selectedSource);
    if (selectedSalaryRange) params.set("salaryRange", selectedSalaryRange);
    if (includeNoSalary) params.set("includeNoSalary", "true");
    params.set("sortBy", sortBy);
    params.set("limit", "50");

    fetch(`/api/jobs?${params.toString()}`)
      .then((res) => res.json() as unknown)
      .then((data) => {
        const typedData = data as JobsResponse;
        if (typedData.success) {
          setJobs(typedData.data.jobs);
          setTotalJobs(typedData.data.total);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      });
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
        <div className="mb-8 space-y-6">
          <SearchBar onSearch={handleSearch} />

          <div className="space-y-4">
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
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
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
