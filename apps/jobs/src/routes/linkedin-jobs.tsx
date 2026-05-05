import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Button, Input, PageActionBar, PageHero, PageSection, Pagination } from "@spearyx/ui-kit";
import { Archive, Briefcase, ExternalLink, History, Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { requireLinkedInSearchOwner } from "@/lib/private-features";
import { getMasterScoreGradient, getScoreBorderColor } from "@/lib/scoreUtils";
import {
  archiveLinkedinJobs,
  deleteLinkedinJobs,
  getLinkedinJobHistory,
  setLinkedinJobStatus,
} from "@/server/functions/linkedin-searches";

type SortOption = "posted-date" | "title" | "score" | "company" | "location";
type LinkedinJobStatus = "Saved" | "Applied" | "Interviewing" | "Rejected" | "Archived";

type SearchParams = {
  page: number;
  query: string;
  remote: boolean;
  green: boolean;
  sortBy: SortOption;
};

const PAGE_SIZE = 20;
const VALID_SORT_OPTIONS: SortOption[] = ["posted-date", "title", "score", "company", "location"];
const LINKEDIN_JOB_STATUSES: LinkedinJobStatus[] = [
  "Saved",
  "Applied",
  "Interviewing",
  "Rejected",
  "Archived",
];

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
  const router = useRouter();
  const [inputValue, setInputValue] = useState(query);
  const [jobs, setJobs] = useState(rows);
  const [localTotal, setLocalTotal] = useState(total);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);
  const [pendingBulkAction, setPendingBulkAction] = useState<"archive" | "delete" | null>(null);
  const didMount = useRef(false);
  const totalPages = Math.ceil(localTotal / PAGE_SIZE);
  const selectedCount = selectedIds.size;
  const allVisibleSelected = jobs.length > 0 && jobs.every((job) => selectedIds.has(job.id));

  useEffect(() => {
    setJobs(rows);
    setLocalTotal(total);
    setSelectedIds(new Set());
  }, [rows, total]);

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

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const job of jobs) next.delete(job.id);
      } else {
        for (const job of jobs) next.add(job.id);
      }
      return next;
    });
  }

  async function handleStatusChange(id: number, status: LinkedinJobStatus) {
    const previousRows = jobs;
    setPendingStatusId(id);
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, status } : job)));
    try {
      await setLinkedinJobStatus({ data: { id, status } });
      await router.invalidate();
    } catch (error) {
      setJobs(previousRows);
      alert(error instanceof Error ? error.message : "Unable to update LinkedIn job status.");
    } finally {
      setPendingStatusId(null);
    }
  }

  async function handleBulkArchive() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const previousRows = jobs;
    setPendingBulkAction("archive");
    setJobs((prev) =>
      prev.map((job) => (selectedIds.has(job.id) ? { ...job, status: "Archived" as const } : job)),
    );
    try {
      await archiveLinkedinJobs({ data: { ids } });
      setSelectedIds(new Set());
      await router.invalidate();
    } catch (error) {
      setJobs(previousRows);
      alert(error instanceof Error ? error.message : "Unable to archive selected LinkedIn jobs.");
    } finally {
      setPendingBulkAction(null);
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected LinkedIn job${ids.length === 1 ? "" : "s"}?`)) {
      return;
    }

    setPendingBulkAction("delete");
    try {
      const result = await deleteLinkedinJobs({ data: { ids } });
      const deleted = result.deleted ?? ids.length;
      const nextTotal = Math.max(0, localTotal - deleted);
      setJobs((prev) => prev.filter((job) => !selectedIds.has(job.id)));
      setLocalTotal(nextTotal);
      setSelectedIds(new Set());

      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      if (page > nextTotalPages) {
        await navigate({ search: (prev) => ({ ...prev, page: nextTotalPages }) });
      } else {
        await router.invalidate();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete selected LinkedIn jobs.");
    } finally {
      setPendingBulkAction(null);
    }
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
                {hasActiveFilters ? `${localTotal} matching` : "Currently saved"}
              </p>
              <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                {localTotal}
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

        {selectedCount > 0 && (
          <PageActionBar tone="primary" className="mb-5">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                className="h-4 w-4 rounded border-slate-300 text-primary-600"
                aria-label="Select all visible LinkedIn jobs"
              />
              <span className="font-semibold text-slate-700">
                {selectedCount} selected
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBulkArchive}
                disabled={pendingBulkAction !== null}
              >
                {pendingBulkAction === "archive" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                Archive
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={pendingBulkAction !== null}
              >
                {pendingBulkAction === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </PageActionBar>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job.id}
              className={`rounded-2xl border bg-white/80 p-5 shadow-sm ${selectedIds.has(job.id) ? "ring-2 ring-primary-300" : ""} ${getScoreBorderColor(job.masterScore ?? 0)}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <label className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(job.id)}
                      onChange={() => toggleSelected(job.id)}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600"
                      aria-label={`Select ${job.title} at ${job.company}`}
                    />
                    Select
                  </label>
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
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  Status
                  <select
                    value={(job.status ?? "Saved") as LinkedinJobStatus}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      handleStatusChange(job.id, event.target.value as LinkedinJobStatus)
                    }
                    disabled={pendingStatusId === job.id}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                    aria-label={`Status for ${job.title}`}
                  >
                    {LINKEDIN_JOB_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
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

        {jobs.length === 0 && (
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
