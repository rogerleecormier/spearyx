import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHero, PageSection } from "@spearyx/ui-kit";
import { Briefcase, ExternalLink, History, Sparkles } from "lucide-react";
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
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => getLinkedinJobHistory({ data: { page: deps.page, pageSize: PAGE_SIZE } }),
  component: LinkedinJobsPage,
});

function LinkedinJobsPage() {
  const data = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <PageHero
        eyebrow="LinkedIn History"
        icon={<History className="h-3.5 w-3.5" />}
        title="Historical LinkedIn Jobs"
        description={
          data.canViewAllUsers
            ? "Browse previously found LinkedIn roles and jump back into the openings that still look worth pursuing."
            : "Review the LinkedIn jobs you have already found, revisit strong matches, and continue with a full analysis whenever you are ready."
        }
      />

      <PageSection title="Job Listings" description="Persisted LinkedIn jobs are pruned according to admin retention settings.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.rows.map((job) => (
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
      </PageSection>
    </div>
  );
}
