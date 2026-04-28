import { Link, createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHero, PageSection } from "@spearyx/ui-kit";
import { Briefcase, ExternalLink, History, LoaderCircle, Sparkles } from "lucide-react";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { requireLinkedInSearchOwner } from "@/lib/private-features";
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
  const [rows, setRows] = useState(initialData.rows);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRows(initialData.rows);
    setPage(1);
    setLoadingMore(false);
    setLoadError("");
  }, [initialData]);

  const hasMore = useMemo(() => rows.length < initialData.total, [rows.length, initialData.total]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadError("");
    try {
      const nextPage = page + 1;
      const next = await getLinkedinJobHistory({ data: { page: nextPage, pageSize: PAGE_SIZE } });
      setRows((prev) => [...prev, ...next.rows]);
      setPage(nextPage);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load more LinkedIn jobs");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          void loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    const node = loadMoreRef.current;
    if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

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

      <PageSection title="Job Listings" description="Persisted LinkedIn jobs are pruned according to admin retention settings.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-700">{job.company}</p>
                  <p className="mt-1 text-xs text-slate-500">{job.location}</p>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
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

        {hasMore ? (
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
        ) : rows.length > 0 ? (
          <p className="mt-6 text-center text-sm text-slate-500">All saved LinkedIn jobs are loaded.</p>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-500">No saved LinkedIn jobs yet.</p>
        )}
      </PageSection>
    </div>
  );
}
