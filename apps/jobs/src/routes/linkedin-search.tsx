import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, Input } from "@spearyx/ui-kit";
import { Briefcase, ExternalLink, Loader2, Search, Sparkles, Target, Wand2 } from "lucide-react";
import { PageHero, PageSection } from "@spearyx/ui-kit";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { getResume } from "@/server/functions/manage-resume";
import { getMasterScoreGradient } from "@/lib/scoreUtils";
import { requireLinkedInSearchOwner } from "@/lib/private-features";
import type { LinkedInScrapedJob, LinkedInSearchParams } from "@/lib/linkedin-search";

type SearchResponse = {
  success: boolean;
  error?: string;
  data?: {
    searchUrl: string;
    jobs: LinkedInScrapedJob[];
    total: number;
    warnings: string[];
  };
};

type FormState = {
  keywords: string;
  location: string;
  company: string;
  workplaceTypes: string[];
  experienceLevels: string[];
  jobTypes: string[];
  postedWithin: LinkedInSearchParams["postedWithin"];
  salaryMin: string;
  easyApply: boolean;
  sortBy: LinkedInSearchParams["sortBy"];
  page: number;
  limit: number;
};

const defaultForm: FormState = {
  keywords: "",
  location: "United States",
  company: "",
  workplaceTypes: ["remote"],
  experienceLevels: [],
  jobTypes: ["full-time"],
  postedWithin: "7d",
  salaryMin: "",
  easyApply: false,
  sortBy: "recent",
  page: 1,
  limit: 10,
};

const workplaceOptions = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "on-site", label: "On-site" },
];

const experienceOptions = [
  { value: "internship", label: "Internship" },
  { value: "entry", label: "Entry" },
  { value: "associate", label: "Associate" },
  { value: "mid-senior", label: "Mid-Senior" },
  { value: "director", label: "Director" },
  { value: "executive", label: "Executive" },
];

const jobTypeOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
];

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function ScorePill({ score }: { score: NonNullable<LinkedInScrapedJob["score"]> }) {
  const gradient = getMasterScoreGradient(score.masterScore);
  return (
    <div className="flex items-center gap-2">
      {score.isUnicorn ? <span title={score.unicornReason || "Unicorn opportunity"}>🦄</span> : null}
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}
        title={`Match score ${score.masterScore}`}
      >
        {score.masterScore}
      </div>
    </div>
  );
}

function LinkedInResultCard({ job }: { job: LinkedInScrapedJob }) {
  const score = job.score;

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                LinkedIn
              </span>
              {job.postDateText ? (
                <span className="text-[11px] font-medium text-slate-500">{job.postDateText}</span>
              ) : null}
            </div>
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">{job.title}</h3>
            <p className="mt-1 text-sm font-medium text-slate-700">{job.company}</p>
            <p className="mt-1 text-xs text-slate-500">{job.location}</p>
          </div>
          {score ? <ScorePill score={score} /> : null}
        </div>

        {job.salary ? <p className="mb-2 text-xs font-medium text-emerald-700">{job.salary}</p> : null}
        {job.snippet ? <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{job.snippet}</p> : null}

        {score ? (
          <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50/70 p-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="font-semibold text-slate-500">ATS</p>
                <p className="text-sm font-bold text-slate-900">{score.atsScore}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Career</p>
                <p className="text-sm font-bold text-slate-900">{score.careerScore}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-500">Outlook</p>
                <p className="text-sm font-bold text-slate-900">{score.outlookScore}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">{score.atsReason}</p>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
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
            className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
          >
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export const Route = createFileRoute("/linkedin-search")({
  beforeLoad: ({ context, location }) => {
    const ctx = context as { user?: { id: number } | null };
    if (!ctx.user) requireLoginRedirect(location, "LinkedIn job search");
    requireLinkedInSearchOwner(context.user as any);
  },
  loader: async () => {
    const resume = await getResume();
    return {
      hasResume: !!resume?.rawText,
      fullName: resume?.fullName || null,
    };
  },
  component: LinkedInSearchPage,
});

function LinkedInSearchPage() {
  const loaderData = Route.useLoaderData();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [results, setResults] = useState<LinkedInScrapedJob[]>([]);
  const [searchUrl, setSearchUrl] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const topScore = results[0]?.score?.masterScore ?? 0;
    return `${results.length} LinkedIn jobs scored against ${loaderData.fullName || "your saved resume"} · top score ${topScore}`;
  }, [loaderData.fullName, results]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setWarnings([]);

    try {
      const payload: LinkedInSearchParams = {
        keywords: form.keywords,
        location: form.location,
        company: form.company || undefined,
        workplaceTypes: form.workplaceTypes as LinkedInSearchParams["workplaceTypes"],
        experienceLevels: form.experienceLevels as LinkedInSearchParams["experienceLevels"],
        jobTypes: form.jobTypes as LinkedInSearchParams["jobTypes"],
        postedWithin: form.postedWithin,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
        easyApply: form.easyApply,
        sortBy: form.sortBy,
        page: form.page,
        limit: form.limit,
      };

      const response = await fetch("/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as SearchResponse;
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error || "LinkedIn search failed.");
      }

      setResults(data.data.jobs);
      setSearchUrl(data.data.searchUrl);
      setWarnings(data.data.warnings || []);
    } catch (err) {
      setResults([]);
      setSearchUrl("");
      setWarnings([]);
      setError(err instanceof Error ? err.message : "LinkedIn search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <PageHero
        eyebrow="LinkedIn Search"
        icon={<Target className="h-3.5 w-3.5" />}
        title="Search LinkedIn Jobs With Resume Scoring"
        description="Build a LinkedIn search, scrape the result page through Cloudflare Browser Rendering, and rank the jobs with the same resume-aware AI logic used across Spearyx."
        stats={[
          { label: "Resume Ready", value: loaderData.hasResume ? "Yes" : "No" },
          { label: "Browser Powered", value: "Cloudflare" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              <Wand2 className="h-4 w-4" />
              Manage Resume
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <Briefcase className="h-4 w-4" />
              Browse Internal Board
            </Link>
          </div>
        }
      />

      {!loaderData.hasResume ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Upload a master resume on your profile first. This page scores LinkedIn results against that saved resume.
        </div>
      ) : null}

      <PageSection
        title="Search Controls"
        description="Choose the LinkedIn filters you want to send, then score the extracted jobs against your saved resume."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2 xl:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="keywords">Keywords</label>
              <Input
                id="keywords"
                value={form.keywords}
                onChange={(e) => update("keywords", e.target.value)}
                placeholder="Senior project manager, PMO, operations, Agile"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="location">Location</label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="United States, Boston, Remote"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="company">Company</label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Optional company filter"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Workplace Type</p>
              <div className="space-y-2">
                {workplaceOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.workplaceTypes.includes(option.value)}
                      onChange={() => update("workplaceTypes", toggleValue(form.workplaceTypes, option.value))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Experience</p>
              <div className="space-y-2">
                {experienceOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.experienceLevels.includes(option.value)}
                      onChange={() => update("experienceLevels", toggleValue(form.experienceLevels, option.value))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Job Type</p>
              <div className="space-y-2">
                {jobTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.jobTypes.includes(option.value)}
                      onChange={() => update("jobTypes", toggleValue(form.jobTypes, option.value))}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Additional Filters</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="postedWithin">Posted Within</label>
                  <select
                    id="postedWithin"
                    value={form.postedWithin}
                    onChange={(e) => update("postedWithin", e.target.value as FormState["postedWithin"])}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="any">Any time</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="salaryMin">Minimum Salary</label>
                  <Input
                    id="salaryMin"
                    type="number"
                    min="0"
                    step="5000"
                    value={form.salaryMin}
                    onChange={(e) => update("salaryMin", e.target.value)}
                    placeholder="120000"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.easyApply}
                    onChange={(e) => update("easyApply", e.target.checked)}
                  />
                  Easy Apply only
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="sortBy">Sort</label>
              <select
                id="sortBy"
                value={form.sortBy}
                onChange={(e) => update("sortBy", e.target.value as FormState["sortBy"])}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="recent">Most recent</option>
                <option value="relevant">Most relevant</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="page">Page</label>
              <Input
                id="page"
                type="number"
                min="1"
                max="20"
                value={String(form.page)}
                onChange={(e) => update("page", Math.max(1, Number(e.target.value || 1)))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="limit">Results to score</label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="15"
                value={String(form.limit)}
                onChange={(e) => update("limit", Math.max(1, Math.min(15, Number(e.target.value || 10))))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading || !loaderData.hasResume} className="w-full">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching LinkedIn
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search and Score
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </PageSection>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {searchUrl ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Generated LinkedIn Search URL</p>
            <p className="truncate text-xs text-slate-500">{searchUrl}</p>
          </div>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Open on LinkedIn
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : null}

      {summary ? (
        <PageSection title="Scored Results" description={summary}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((job) => (
              <LinkedInResultCard key={job.id} job={job} />
            ))}
          </div>
        </PageSection>
      ) : null}
    </div>
  );
}
