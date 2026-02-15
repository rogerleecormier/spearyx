import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Briefcase, Loader2, X, Sparkles, Info, Target } from "lucide-react";
import { Overline, Hero, Body } from "@spearyx/ui-kit";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import JobCard from "../components/JobCard";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import SortControls from "../components/SortControls";
import type { JobWithCategory } from "../lib/search-utils";
import SkillsModal, { hasUserProfile } from "../components/ai/SkillsModal";

import { getDbFromContext, schema } from "../db/db";
import { desc, sql } from "drizzle-orm";

// SSR Loader - fetches initial data on server
export const Route = createFileRoute("/")({
  loader: async ({ context }: { context: any }) => {
    try {
      const db = await getDbFromContext(context as any);

      // Get total job count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.jobs);
      const totalCount = countResult[0]?.count || 0;

      // Fetch first batch of jobs sorted by newest
      const jobsData = await db
        .select()
        .from(schema.jobs)
        .orderBy(desc(schema.jobs.postDate))
        .limit(30);

      // Fetch categories
      const categoriesData = await db.select().from(schema.categories);
      const categoriesMap = new Map(categoriesData.map((c: any) => [c.id, c]));

      // Transform jobs with category data
      const jobs = jobsData.map((job: any) => ({
        ...job,
        category: categoriesMap.get(job.categoryId) || categoriesData[0],
      }));

      return {
        initialJobs: jobs,
        categories: categoriesData,
        totalCount,
        hasMore: jobsData.length >= 30,
      };
    } catch (error) {
      console.error("Loader error:", error);
      return { initialJobs: [], categories: [], totalCount: 0, hasMore: false };
    }
  },
  component: HomePage,
});

interface Category {
  id: number;
  name: string;
  slug: string;
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

function HomePage() {
  // Get SSR data
  const loaderData = useLoaderData({ from: "/" });

  const [jobs, setJobs] = useState<JobWithCategory[]>(loaderData.initialJobs);
  const [categories] = useState<Category[]>(loaderData.categories);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title-asc" | "title-desc" | "recently-added"
  >("newest");
  const [totalJobs, setTotalJobs] = useState(loaderData.totalCount || 0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(loaderData.hasMore);

  const [showAIInfoModal, setShowAIInfoModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [userHasProfile, setUserHasProfile] = useState(false);

  // Check if user has profile on mount
  useEffect(() => {
    setUserHasProfile(hasUserProfile());
  }, []);

  // Ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Debounced search using TanStack react-pacer
  const debouncedFetchJobs = useDebouncedCallback(
    async (params: URLSearchParams) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/v3/jobs?${params.toString()}`);
        const data = (await response.json()) as JobsResponse;
        if (data.success) {
          setJobs(data.data.jobs);
          setTotalJobs(data.data.total);
          setHasMore(data.data.hasMore);
          setOffset(0);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    },
    { wait: 300 }  // 300ms debounce delay
  );

  // Fetch jobs when filters change
  useEffect(() => {
    // Skip on initial load since we have SSR data
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategoryId) params.set("category", selectedCategoryId.toString());
    if (selectedSource) params.set("source", selectedSource);
    if (selectedCompany) params.set("company", selectedCompany);
    params.set("sortBy", sortBy);
    params.set("limit", "30");
    params.set("offset", "0");

    debouncedFetchJobs(params);
  }, [searchQuery, selectedCategoryId, selectedSource, selectedCompany, sortBy]);

  // Load more jobs for infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextOffset = offset + 30;

    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategoryId) params.set("category", selectedCategoryId.toString());
    if (selectedSource) params.set("source", selectedSource);
    if (selectedCompany) params.set("company", selectedCompany);
    params.set("sortBy", sortBy);
    params.set("limit", "30");
    params.set("offset", nextOffset.toString());

    try {
      const response = await fetch(`/api/v3/jobs?${params.toString()}`);
      const data = (await response.json()) as JobsResponse;
      if (data.success) {
        setJobs((prev: JobWithCategory[]) => [...prev, ...data.data.jobs]);
        setOffset(nextOffset);
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error("Error loading more jobs:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [offset, hasMore, loadingMore, searchQuery, selectedCategoryId, selectedSource, selectedCompany, sortBy]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const handleSourceSelect = useCallback((source: string | null) => {
    setSelectedSource(source);
  }, []);

  // Company filter - clears other filters when selecting a company
  const handleCompanySelect = useCallback((company: string | null) => {
    if (company) {
      // Clear other filters when selecting a company
      setSelectedCategoryId(null);
      setSelectedSource(null);
      setSearchQuery("");
    }
    setSelectedCompany(company);
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: "newest" | "oldest" | "title-asc" | "title-desc" | "recently-added") => {
      setSortBy(newSortBy);
    },
    []
  );

  const clearCompanyFilter = useCallback(() => {
    setSelectedCompany(null);
  }, []);

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
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {/* My Profile Button */}
              <button
                onClick={() => setShowSkillsModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${userHasProfile
                  ? "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                  : "bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
              >
                <Target size={12} />
                My Profile
                {userHasProfile && <span className="text-green-500">✓</span>}
              </button>

              {/* AI Powered Badge */}
              <button
                onClick={() => setShowAIInfoModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <Sparkles size={12} className="text-amber-500" />
                AI Powered
                <Info size={12} className="text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            {/* Search Bar */}
            <div className="w-full lg:flex-[2] min-w-[350px]">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <FilterDropdown
                label="Categories"
                value={selectedCategoryId}
                options={categories.map((c: any) => ({
                  id: c.id,
                  label: c.name,
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
                  { id: "Workable", label: "Workable" },
                  { id: "Himalayas", label: "Himalayas" },
                  { id: "Jobicy", label: "Jobicy" },
                ]}
                onChange={handleSourceSelect}
              />
            </div>
          </div>

          {/* Active Company Filter Badge */}
          {
            selectedCompany && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-slate-600">Filtering by company:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                  {selectedCompany}
                  <button
                    onClick={clearCompanyFilter}
                    className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                    aria-label="Clear company filter"
                  >
                    <X size={14} />
                  </button>
                </span>
              </div>
            )
          }

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  <strong>{totalJobs || jobs.length}</strong> remote jobs found
                </span>
              )}
            </div>
            <SortControls sortBy={sortBy} onSortChange={handleSortChange} />
          </div>
        </div >


        {/* Job Listings */}
        < div className="min-h-[400px]" >
          {loading && jobs.length === 0 ? (
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job: JobWithCategory) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onCompanyClick={handleCompanySelect}
                  />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Loading more jobs...</span>
                  </div>
                )}
                {!hasMore && jobs.length > 0 && (
                  <p className="text-sm text-slate-400">You've seen all jobs</p>
                )}
              </div>
            </>
          )
          }
        </div >
      </main >

      {/* AI Info Modal */}
      {
        showAIInfoModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAIInfoModal(false)}>
            <div
              className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h2 className="font-semibold text-amber-800">How AI Works Here</h2>
                </div>
                <button
                  onClick={() => setShowAIInfoModal(false)}
                  className="p-1 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-amber-600" />
                </button>
              </div>
              <div className="p-5 space-y-4 text-sm text-slate-700">
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">✨ Intelligent Job Analysis</h3>
                  <p>Get a deep-dive evaluation of any role with a single click. Our AI models perform multi-dimensional checks to assess the role quality and your compatibility.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">🎯 Personalized Match Score</h3>
                  <p>Upload your resume via "My Profile" to see exactly how your background aligns with specific job requirements, highlighting key skill overlaps and gaps.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">🔍 Deep Insights</h3>
                  <p>Go beyond the job post to discover estimated salary ranges, work-life balance indicators, culture signals, and potential red flags.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">🛡️ Privacy First</h3>
                  <p>Analysis is performed only when requested. Your profile data is stored locally in your browser and used only for your own analysis.</p>
                </div>
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
                  <p>Powered by Cloudflare Workers AI. No search history or personal data is stored centrally.</p>
                </div>
              </div>
            </div>
          </div>
        )
      }



      {/* Skills Modal */}
      <SkillsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        onSave={() => setUserHasProfile(true)}
      />
    </div >
  );
}
