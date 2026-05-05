import { Link, createFileRoute } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Input, PageHero, PageSection, Pagination } from "@spearyx/ui-kit";
import { Briefcase, ExternalLink, History, Search, Sparkles } from "lucide-react";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { requireLinkedInSearchOwner } from "@/lib/private-features";
import { getMasterScoreGradient, getScoreBorderColor } from "@/lib/scoreUtils";
import { getLinkedinJobHistory } from "@/server/functions/linkedin-searches";

type SortOption = "posted-date" | "title" | "score" | "company" | "location";

type SearchParams = {
  page: number;
  query: string;
  remote: boolean;
  green: boolean;
  sortBy: SortOption;
};

const PAGE_SIZE = 20;
const VALID_SORT_OPTIONS: SortOption[] = ["posted-date", "title", "score", "company", "location"];

export const Route = createFileRoute("/linkedin-jobs")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Math.max(1, Number(search.page) || 1),
    query: String(search.query ?? ""),
    remote: search.remote === true || search.remote === "true",
    green: search.green === true || search.green === "true",
    sortBy: (VALID_SORT_OPTIONS.includes(search.sortBy as SortOption)
      ? search.sortBy
      : "posted-date") as SortOption,
  }),
  loaderDeps: ({ search }: { search: SearchParams }) => search,
  beforeLoad: ({ context, location }) => {
    const ctx = context as { user?: { id: number; role: string } | null };
    if (!ctx.user) requireLoginRedirect(location, "LinkedIn job history");
    requireLinkedInSearchOwner(context.user as any);
  },
  loader: async ({ deps }: { deps: SearchParams }) =>
    getLinkedinJobHistory({ data: { ...deps, pageSize: PAGE_SIZE } }),
  component: LinkedinJobsPage,
});

function LinkedinJobsPage() {
  const { page, query, remote, green, sortBy } = Route.useSearch();
  const { rows, total, canViewAllUsers } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [inputValue, setInputValue] = useState(query);
  const didMount = useRef(false);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Debounce search input → URL; skip first render to avoid spurious navigation
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const timer = setTimeout(() => {
      if (inputValue.trim() !== query) {
        navigate({ search: (prev) => ({ ...prev, query: inputValue.trim(), page: 1 }) });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue, navigate, query]);

  function handlePageChange(newPage: number) {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  }

  const hasActiveFilters = query || green || remote;

  return (
    <div className="spx-page spx-stack">
      <PageHero
        eyebrow="LinkedIn History"
        icon={<History className="h-3.5 w-3.5" />}
        title="Historical LinkedIn Jobs"
        description={
          canViewAllUsers
            ? "Browse previously found LinkedIn roles and jump back into the openings that still look worth pursuing."
            : "Review the LinkedIn jobs you have already found, revisit strong matches, and continue with a full analysis whenever you are ready."
        }
      />

      <PageSection
        title="Job Listings"
        description="Persisted LinkedIn jobs are pruned according to admin retention settings."
        actions={
          <div className="min-w-[220px] rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {hasActiveFilters
                ? canViewAllUsers
                  ? "Filtered Stored Jobs"
                  : "Your Filtered Jobs"
                : canViewAllUsers
                  ? "Total Stored Jobs"
                  : "Your Stored Jobs"}
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                {hasActiveFilters ? `${total} matching` : "Currently saved"}
              </p>
              <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                {total}
              </div>
            </div>
          </div>
        }
      >
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring lg:flex-1">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <Input
              value={inputValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              placeholder="Search saved jobs by title or company"
              className="h-auto border-0 bg-transparent px-2 py-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    sortBy: e.target.value as SortOption,
                    page: 1,
                  }),
                })
              }
              className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm"
              aria-label="Sort saved jobs"
            >
              <option value="posted-date">Sort: Posted date</option>
              <option value="title">Sort: Job title</option>
              <option value="score">Sort: Score</option>
              <option value="company">Sort: Company</option>
              <option value="location">Sort: Location</option>
            </select>
            <button
              type="button"
              aria-pressed={green}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, green: !green, page: 1 }) })
              }
              className={`inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium transition ${
                green
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Green jobs only
            </button>
            <button
              type="button"
              aria-pressed={remote}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, remote: !remote, page: 1 }) })
              }
              className={`inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium transition ${
                remote
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Remote only
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((job) => (
            <article
              key={job.id}
              className={`rounded-2xl border bg-white/80 p-5 shadow-sm ${getScoreBorderColor(job.masterScore ?? 0)}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-700">{job.company}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.location}</p>
                </div>
                <div
                  className={`inline-flex min-w-10 items-center justify-center rounded-full bg-gradient-to-br px-3 py-1 text-xs font-bold text-white shadow-sm ${getMasterScoreGradient(job.masterScore ?? 0)}`}
                  title={`Match score ${job.masterScore ?? 0}`}
                >
                  {job.masterScore ?? 0}
                </div>
              </div>
              {job.ownerEmail ? (
                <p className="mb-2 text-[11px] text-slate-500">Owner: {job.ownerEmail}</p>
              ) : null}
              {job.salary ? (
                <p className="mb-2 text-xs font-medium text-emerald-700">{job.salary}</p>
              ) : null}
              {job.snippet ? (
                <p className="line-clamp-3 text-sm text-slate-600">{job.snippet}</p>
              ) : null}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="h-3.5 w-3.5" />
                  {job.postDateText || "Saved result"}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to="/analyze"
                    search={{ url: job.sourceUrl }}
                    className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Analyze
                  </Link>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Open <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="mt-6 text-center text-sm text-slate-500">
            {hasActiveFilters
              ? "No saved LinkedIn jobs match the current filters."
              : "No saved LinkedIn jobs yet."}
          </p>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      </PageSection>
    </div>
  );
}
