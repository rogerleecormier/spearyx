import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Input, PageHero, PageSection } from "@spearyx/ui-kit";
import { Briefcase, ExternalLink, History, LoaderCircle, Search, Sparkles } from "lucide-react";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { requireLinkedInSearchOwner } from "@/lib/private-features";
import { getMasterScoreGradient, getScoreBorderColor } from "@/lib/scoreUtils";
import { getLinkedinJobHistory } from "@/server/functions/linkedin-searches";

const PAGE_SIZE = 24;

export const Route = createFileRoute("/linkedin-jobs")({
  beforeLoad: ({ context, location }) => {
    const ctx = context as { user?: { id: number; role: string } | null };
    if (!ctx.user) requireLoginRedirect(location, "LinkedIn job history");
    requireLinkedInSearchOwner(context.user as any);
  },
  loader: async () => getLinkedinJobHistory({ data: { page: 1, pageSize: PAGE_SIZE } }),
  component: LinkedinJobsPage,
});

function LinkedinJobsPage() {
  const initialData = Route.useLoaderData();
  const [allRows, setAllRows] = useState(initialData.rows);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingAllRows, setLoadingAllRows] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [greenOnly, setGreenOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const deferredTitleQuery = useDeferredValue(titleQuery);

  useEffect(() => {
    setAllRows(initialData.rows);
    setPage(1);
    setLoadingMore(false);
    setLoadingAllRows(false);
    setLoadError("");
  }, [initialData]);

  const hasMore = useMemo(() => allRows.length < initialData.total, [allRows.length, initialData.total]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadError("");
    try {
      const nextPage = page + 1;
      const next = await getLinkedinJobHistory({ data: { page: nextPage, pageSize: PAGE_SIZE } });
      setAllRows((prev) => {
        const seen = new Set(prev.map((job) => job.id));
        return [...prev, ...next.rows.filter((job) => !seen.has(job.id))];
      });
      setPage(nextPage);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load more LinkedIn jobs");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page]);

  useEffect(() => {
    if (initialData.total <= initialData.rows.length || loadingAllRows) return;

    let cancelled = false;

    async function loadAllRows() {
      setLoadingAllRows(true);
      try {
        const fullHistory = await getLinkedinJobHistory({
          data: {
            page: 1,
            pageSize: initialData.total,
          },
        });
        if (!cancelled) {
          setAllRows(fullHistory.rows);
          setPage(Math.max(1, Math.ceil(fullHistory.rows.length / PAGE_SIZE)));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Failed to load LinkedIn jobs");
        }
      } finally {
        if (!cancelled) {
          setLoadingAllRows(false);
        }
      }
    }

    void loadAllRows();

    return () => {
      cancelled = true;
    };
  }, [initialData.rows.length, initialData.total, loadingAllRows]);

  const fuse = useMemo(
    () =>
      new Fuse(allRows, {
        keys: [{ name: "title", weight: 2 }],
        threshold: 0.4,
        includeScore: true,
      }),
    [allRows],
  );

  const filteredRows = useMemo(() => {
    const titleFiltered = deferredTitleQuery.trim()
      ? fuse.search(deferredTitleQuery.trim()).map((result) => result.item)
      : allRows;

    return titleFiltered.filter((job) => {
      const matchesGreen = !greenOnly || (job.masterScore ?? 0) >= 80;
      const workplace = job.workplaceType?.toLowerCase() ?? "";
      const location = job.location.toLowerCase();
      const matchesRemote = !remoteOnly || workplace.includes("remote") || location.includes("remote");
      return matchesGreen && matchesRemote;
    });
  }, [allRows, deferredTitleQuery, fuse, greenOnly, remoteOnly]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !titleQuery.trim() && !greenOnly && !remoteOnly) {
          void loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const node = loadMoreRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [greenOnly, hasMore, loadMore, loadingMore, remoteOnly, titleQuery]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <PageHero
        eyebrow="LinkedIn History"
        icon={<History className="h-3.5 w-3.5" />}
        title="Historical LinkedIn Jobs"
        description={
          initialData.canViewAllUsers
            ? "Browse previously found LinkedIn roles and jump back into the openings that still look worth pursuing."
            : "Review the LinkedIn jobs you have already found, revisit strong matches, and continue with a full analysis whenever you are ready."
        }
      />

      <PageSection
        title="Job Listings"
        description={
          "Persisted LinkedIn jobs are pruned according to admin retention settings."
        }
      >
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {initialData.canViewAllUsers ? "Total Stored Jobs" : "Your Stored Jobs"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {initialData.canViewAllUsers
                ? "Currently available across visible LinkedIn history."
                : "Currently saved in your LinkedIn history."}
            </p>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            {initialData.total}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={titleQuery}
              onChange={(event) => setTitleQuery(event.target.value)}
              placeholder="Search saved jobs by title"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={greenOnly}
              onClick={() => setGreenOnly((prev) => !prev)}
              className={`inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium transition ${
                greenOnly
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Green jobs only
            </button>
            <button
              type="button"
              aria-pressed={remoteOnly}
              onClick={() => setRemoteOnly((prev) => !prev)}
              className={`inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium transition ${
                remoteOnly
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Remote only
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((job) => (
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
              {job.ownerEmail ? <p className="mb-2 text-[11px] text-slate-500">Owner: {job.ownerEmail}</p> : null}
              {job.salary ? <p className="mb-2 text-xs font-medium text-emerald-700">{job.salary}</p> : null}
              {job.snippet ? <p className="line-clamp-3 text-sm text-slate-600">{job.snippet}</p> : null}
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

        {loadError ? <p className="mt-5 text-sm text-destructive">{loadError}</p> : null}

        {loadingAllRows ? (
          <div className="mt-6 flex justify-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading full saved history for search...
            </div>
          </div>
        ) : !titleQuery.trim() && !greenOnly && !remoteOnly && hasMore ? (
          <div ref={loadMoreRef} className="mt-6 flex justify-center py-4">
            {loadingMore ? (
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading more jobs...
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void loadMore()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Load more jobs
              </button>
            )}
          </div>
        ) : filteredRows.length > 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">All saved LinkedIn jobs are loaded.</p>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-500">
            {allRows.length > 0 ? "No saved LinkedIn jobs match the current filters." : "No saved LinkedIn jobs yet."}
          </p>
        )}
      </PageSection>
    </div>
  );
}
