// Static data provider for Azure SWA preview
// This provides empty state data - backend API will be added later via Azure Functions

import type { JobWithCategory } from "./search-utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

// Empty categories for static preview
export const STATIC_CATEGORIES: Category[] = [];

// Empty jobs for static preview
export const STATIC_JOBS: JobWithCategory[] = [];

export function getStaticJobs() {
  return {
    jobs: STATIC_JOBS,
    total: STATIC_JOBS.length,
    limit: 50,
    offset: 0,
    hasMore: false,
  };
}

export function getStaticCategories() {
  return STATIC_CATEGORIES;
}
