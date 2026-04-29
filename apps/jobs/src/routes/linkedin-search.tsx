import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button, Input, PageHero, PageSection, Tooltip, TooltipContent, TooltipTrigger } from "@spearyx/ui-kit";
import { Briefcase, ChevronDown, CircleHelp, ExternalLink, Loader2, Search, Sparkles, Target, Wand2 } from "lucide-react";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { getResume } from "@/server/functions/manage-resume";
import { getMasterScoreGradient } from "@/lib/scoreUtils";
import { requireLinkedInSearchOwner } from "@/lib/private-features";
import {
  getSavedLinkedinSearches,
  removeLinkedinSearch,
  saveLinkedinSearch,
  toggleLinkedinSearchCron,
} from "@/server/functions/linkedin-searches";
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
  pagesToScan: number;
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
  pagesToScan: 1,
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

function formatWorkplaceSummary(values: string[]) {
  if (values.length === 0) return "Any workplace";
  return values
    .map((value) => workplaceOptions.find((option) => option.value === value)?.label || value)
    .join(" + ");
}

function formatPostedSummary(value: FormState["postedWithin"]) {
  if (value === "any") return "Any time";
  if (value === "24h") return "Posted in 24h";
  if (value === "7d") return "Posted in 7d";
  return "Posted in 30d";
}

function formatSortSummary(value: FormState["sortBy"]) {
  return value === "recent" ? "Most recent" : "Most relevant";
}

function FieldLabelWithInfo({
  htmlFor,
  label,
  tooltip,
}: {
  htmlFor?: string;
  label: string;
  tooltip: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label className="text-sm font-medium text-slate-700" htmlFor={htmlFor}>{label}</label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
            aria-label={`${label} info`}
          >
            <CircleHelp className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  );
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
              {job.resultSource === "history" ? (
                <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                  Saved Score
                </span>
              ) : null}
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
    const savedSearches = await getSavedLinkedinSearches();
    return {
      hasResume: !!resume?.rawText,
      fullName: resume?.fullName || null,
      savedSearches,
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
  const [savedSearchName, setSavedSearchName] = useState("");
  const [savedSearches, setSavedSearches] = useState(loaderData.savedSearches);
  const [activeSavedSearchId, setActiveSavedSearchId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const topScore = results[0]?.score?.masterScore ?? 0;
    return `${results.length} LinkedIn jobs scored against ${loaderData.fullName || "your saved resume"} · top score ${topScore}`;
  }, [loaderData.fullName, results]);

  useEffect(() => {
    if (results.length > 0) {
      setShowAdvanced(false);
    }
  }, [results.length]);

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
        pagesToScan: form.pagesToScan,
        limit: form.limit,
      };

      const response = await fetch("/api/linkedin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, savedSearchId: activeSavedSearchId }),
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

  async function handleSaveSearch() {
    const criteria: LinkedInSearchParams = {
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
      pagesToScan: form.pagesToScan,
      limit: form.limit,
    };
    const name = savedSearchName.trim() || form.keywords.trim();
    if (!name) {
      setError("Enter a search name or keywords before saving.");
      return;
    }
    await saveLinkedinSearch({ data: { id: activeSavedSearchId ?? undefined, name, criteria, isActive: true } });
    const nextSavedSearches = await getSavedLinkedinSearches();
    setSavedSearches(nextSavedSearches);
    setSavedSearchName("");
  }

  async function handleDeleteSavedSearch(id: number) {
    await removeLinkedinSearch({ data: { id } });
    const nextSavedSearches = await getSavedLinkedinSearches();
    setSavedSearches(nextSavedSearches);
    if (activeSavedSearchId === id) setActiveSavedSearchId(null);
  }

  async function handleToggleSavedSearchCron(id: number, isActive: boolean) {
    await toggleLinkedinSearchCron({ data: { id, isActive } });
    const nextSavedSearches = await getSavedLinkedinSearches();
    setSavedSearches(nextSavedSearches);
  }

  function loadSavedSearch(id: number) {
    const saved = savedSearches.find((item) => item.id === id);
    if (!saved) return;
    setActiveSavedSearchId(saved.id);
    setSavedSearchName(saved.name);
    setForm({
      keywords: saved.criteria.keywords || "",
      location: saved.criteria.location || "",
      company: saved.criteria.company || "",
      workplaceTypes: (saved.criteria.workplaceTypes as string[]) || [],
      experienceLevels: (saved.criteria.experienceLevels as string[]) || [],
      jobTypes: (saved.criteria.jobTypes as string[]) || [],
      postedWithin: saved.criteria.postedWithin || "7d",
      salaryMin: saved.criteria.salaryMin ? String(saved.criteria.salaryMin) : "",
      easyApply: !!saved.criteria.easyApply,
      sortBy: saved.criteria.sortBy || "recent",
      page: saved.criteria.page || 1,
      pagesToScan: saved.criteria.pagesToScan || 1,
      limit: saved.criteria.limit || 10,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <PageHero
        eyebrow="LinkedIn Search"
        icon={<Target className="h-3.5 w-3.5" />}
        title="Search LinkedIn Jobs With Resume Scoring"
        description="Search for roles that fit what you want, then quickly see which openings look like the strongest match for your background before you spend time applying."
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="space-y-5">
          <PageSection
            title="Quick Search"
            description="Start with the essentials, then open advanced filters only when you need them."
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_160px]">
                <div className="space-y-2">
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
                  <FieldLabelWithInfo
                    htmlFor="limit"
                    label="Max cards"
                    tooltip="Maximum LinkedIn cards to extract per scanned results page. Already-saved jobs reuse historical scores, and only brand-new jobs consume AI scoring."
                  />
                  <Input
                    id="limit"
                    type="number"
                    min="1"
                    max="25"
                    value={String(form.limit)}
                    onChange={(e) => update("limit", Math.max(1, Math.min(25, Number(e.target.value || 10))))}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {formatWorkplaceSummary(form.workplaceTypes)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {formatPostedSummary(form.postedWithin)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {formatSortSummary(form.sortBy)}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {`Scan ${form.pagesToScan} page${form.pagesToScan === 1 ? "" : "s"} from page ${form.page}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Advanced Search
                    <ChevronDown className={`h-4 w-4 transition ${showAdvanced ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>

              {showAdvanced ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">Targeting</p>
                          <p className="text-xs text-slate-500">Narrow the search before scraping begins.</p>
                        </div>
                        <Input
                          id="company"
                          value={form.company}
                          onChange={(e) => update("company", e.target.value)}
                          placeholder="Optional company filter"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="mb-3 space-y-1">
                          <p className="text-sm font-semibold text-slate-900">Search Controls</p>
                          <p className="text-xs text-slate-500">Tune freshness, salary floor, and page coverage.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="sortBy">Sort</label>
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

                          <label className="flex items-center gap-2 self-end rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={form.easyApply}
                              onChange={(e) => update("easyApply", e.target.checked)}
                            />
                            Easy Apply only
                          </label>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <FieldLabelWithInfo
                              htmlFor="page"
                              label="Start Page"
                              tooltip="The first LinkedIn results page to scan. If you set Start Page to 5 and Pages To Scan to 3, the search will scan pages 5, 6, and 7."
                            />
                            <Input
                              id="page"
                              type="number"
                              min="1"
                              max="20"
                              value={String(form.page)}
                              onChange={(e) => update("page", Math.max(1, Number(e.target.value || 1)))}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <FieldLabelWithInfo
                              htmlFor="pagesToScan"
                              label="Pages To Scan"
                              tooltip="How many consecutive LinkedIn result pages to harvest starting from the Start Page. More pages can find more jobs, but they also take longer to scrape."
                            />
                            <Input
                              id="pagesToScan"
                              type="number"
                              min="1"
                              max="10"
                              value={String(form.pagesToScan)}
                              onChange={(e) => update("pagesToScan", Math.max(1, Math.min(10, Number(e.target.value || 1))))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                        <div className="mb-3 space-y-1">
                          <p className="text-sm font-semibold text-slate-900">Preference Filters</p>
                          <p className="text-xs text-slate-500">Pick the role shapes you want the scraper to prioritize.</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">Workplace Type</p>
                            <div className="grid gap-2 sm:grid-cols-2">
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

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">Experience</p>
                            <div className="grid gap-2 sm:grid-cols-2">
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

                          <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">Job Type</p>
                            <div className="grid gap-2 sm:grid-cols-2">
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={loading || !loaderData.hasResume}
                  className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300"
                >
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

        <aside className="space-y-4 xl:sticky xl:top-6">
          <PageSection
            title="Saved Searches"
            description="Keep reusable criteria handy and rerun them without expanding the full form."
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <Input
                  value={savedSearchName}
                  onChange={(e) => setSavedSearchName(e.target.value)}
                  placeholder="Save this search as..."
                />
                <Button type="button" onClick={handleSaveSearch} disabled={!loaderData.hasResume} className="w-full">
                  Save Search
                </Button>
              </div>

              <div className="space-y-3">
                {savedSearches.length === 0 ? (
                  <p className="text-sm text-slate-500">No saved LinkedIn searches yet.</p>
                ) : (
                  savedSearches.map((saved) => (
                    <div key={saved.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{saved.name}</p>
                        <p className="text-xs text-slate-500">
                          {saved.criteria.keywords} · {saved.criteria.location || "No location"} · p{saved.criteria.page || 1} x {saved.criteria.pagesToScan || 1}
                        </p>
                        <p className="text-[11px] text-slate-400">Last run {saved.lastRunAt || "never"}</p>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
                        <input
                          type="checkbox"
                          checked={saved.isActive}
                          onChange={(e) => handleToggleSavedSearchCron(saved.id, e.target.checked)}
                        />
                        Active in cron
                      </label>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => loadSavedSearch(saved.id)}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedSearch(saved.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PageSection>
        </aside>
      </div>
    </div>
  );
}
