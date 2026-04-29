import { Link, createFileRoute } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
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

type SearchPreset = "title-variants" | "location-spread" | "remote-expansion" | "workplace-split";

type SearchVariant = {
  label: string;
  params: LinkedInSearchParams;
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

const defaultSearchPresets: SearchPreset[] = ["title-variants", "location-spread", "remote-expansion"];

const discoveryPresetOptions: Array<{ value: SearchPreset; label: string; description: string }> = [
  {
    value: "title-variants",
    label: "Similar job titles",
    description: "Searches for closely related title wording like project manager versus program manager so relevant jobs are less likely to be missed.",
  },
  {
    value: "location-spread",
    label: "Wider location search",
    description: "Broadens a narrow city search into wider location variants so LinkedIn can surface more jobs from nearby or national result pools.",
  },
  {
    value: "remote-expansion",
    label: "Nationwide remote search",
    description: "Adds a broader United States remote search when you want remote work, which can uncover jobs hidden by a tight local query.",
  },
  {
    value: "workplace-split",
    label: "Search each work style separately",
    description: "Runs separate searches for remote, hybrid, and on-site instead of combining them, which can surface more results when LinkedIn compresses mixed filters.",
  },
];

const seniorityTokens = new Set(["senior", "sr", "sr.", "lead", "principal", "staff"]);

const stateNameByCode: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

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

function buildCanonicalLinkedinJobUrl(sourceUrl: string, externalJobId?: string) {
  try {
    const url = new URL(sourceUrl);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    if (normalizedPath.includes("/jobs/view/")) {
      return `https://www.linkedin.com${normalizedPath}/`;
    }
    const currentJobId = url.searchParams.get("currentJobId");
    if (currentJobId) {
      return `https://www.linkedin.com/jobs/view/${currentJobId}/`;
    }
  } catch {
    if (externalJobId && /^\d+$/.test(externalJobId)) {
      return `https://www.linkedin.com/jobs/view/${externalJobId}/`;
    }
  }
  if (externalJobId && /^\d+$/.test(externalJobId)) {
    return `https://www.linkedin.com/jobs/view/${externalJobId}/`;
  }
  return sourceUrl;
}

function dedupeMergedResults(jobs: LinkedInScrapedJob[]) {
  const deduped = new Map<string, LinkedInScrapedJob>();
  for (const job of jobs) {
    const key = buildCanonicalLinkedinJobUrl(job.sourceUrl, job.id);
    const existing = deduped.get(key);
    if (!existing || (job.score?.masterScore || 0) > (existing.score?.masterScore || 0)) {
      deduped.set(key, {
        ...job,
        sourceUrl: key,
      });
    }
  }
  return Array.from(deduped.values()).sort((a, b) => (b.score?.masterScore || 0) - (a.score?.masterScore || 0));
}

function isRemoteJob(job: LinkedInScrapedJob) {
  const workplaceType = job.workplaceType?.toLowerCase() || "";
  const location = job.location.toLowerCase();
  return workplaceType.includes("remote") || location.includes("remote");
}

function buildKeywordVariants(keywords: string) {
  const normalized = keywords.trim().replace(/\s+/g, " ");
  const variants = new Set<string>();
  if (!normalized) return [];

  const lowered = normalized.toLowerCase();
  if (lowered.includes("technical project manager")) {
    variants.add(normalized.replace(/technical project manager/i, "technical program manager"));
  }
  if (lowered.includes("project manager")) {
    variants.add(normalized.replace(/project manager/i, "program manager"));
  }
  if (lowered.includes("program manager")) {
    variants.add(normalized.replace(/program manager/i, "project manager"));
  }

  const stripped = normalized
    .split(" ")
    .filter((token) => !seniorityTokens.has(token.toLowerCase()))
    .join(" ")
    .trim();
  if (stripped && stripped.toLowerCase() !== lowered) {
    variants.add(stripped);
  }

  return Array.from(variants).filter((variant) => variant.toLowerCase() !== lowered).slice(0, 3);
}

function buildLocationVariants(location: string) {
  const normalized = location.trim();
  if (!normalized) return [];

  const variants = new Set<string>();
  const parts = normalized.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const statePart = parts[parts.length - 1].toUpperCase();
    const stateName = stateNameByCode[statePart];
    if (stateName) {
      variants.add(`${stateName}, United States`);
    } else {
      variants.add(parts.slice(1).join(", "));
    }
  }
  if (!/united states/i.test(normalized)) {
    variants.add("United States");
  }

  return Array.from(variants).filter((variant) => variant && variant.toLowerCase() !== normalized.toLowerCase()).slice(0, 2);
}

function buildSearchVariants(base: LinkedInSearchParams, presets: SearchPreset[], broadenDiscovery: boolean): SearchVariant[] {
  const variants = new Map<string, SearchVariant>();
  const register = (label: string, params: LinkedInSearchParams) => {
    const key = JSON.stringify(params);
    if (!variants.has(key)) {
      variants.set(key, { label, params });
    }
  };

  register("Exact search", base);
  if (!broadenDiscovery) {
    return Array.from(variants.values());
  }

  if (presets.includes("title-variants")) {
    for (const keywordVariant of buildKeywordVariants(base.keywords)) {
      register(`Title variant: ${keywordVariant}`, { ...base, keywords: keywordVariant, page: 1 });
    }
  }

  if (presets.includes("location-spread")) {
    for (const locationVariant of buildLocationVariants(base.location || "")) {
      register(`Location spread: ${locationVariant}`, { ...base, location: locationVariant, page: 1 });
    }
  }

  if (presets.includes("remote-expansion") && base.workplaceTypes?.includes("remote")) {
    register("Remote expansion", {
      ...base,
      location: "United States",
      workplaceTypes: ["remote"],
      page: 1,
    });
  }

  if (presets.includes("workplace-split") && (base.workplaceTypes?.length || 0) > 1) {
    for (const workplaceType of base.workplaceTypes || []) {
      register(`Workplace split: ${workplaceType}`, {
        ...base,
        workplaceTypes: [workplaceType],
        page: 1,
      });
    }
  }

  return Array.from(variants.values());
}

function summarizeSearchWarnings(rawWarnings: string[], variantCount: number) {
  if (rawWarnings.length === 0) return [];

  const reusedWarnings = rawWarnings.filter((warning) => /reused .*previously saved linkedin job/i.test(warning));
  const limitedWarnings = rawWarnings.filter((warning) => /only exposed about|redirected page|returned no cards/i.test(warning));
  const snippetWarnings = rawWarnings.filter((warning) => /scored from snippets/i.test(warning));
  const otherWarnings = rawWarnings.filter((warning) => (
    !reusedWarnings.includes(warning) &&
    !limitedWarnings.includes(warning) &&
    !snippetWarnings.includes(warning)
  ));

  const totalReused = reusedWarnings.reduce((sum, warning) => {
    const match = warning.match(/Reused\s+(\d+)/i);
    return sum + Number(match?.[1] || 0);
  }, 0);

  const variantLabels = new Set(
    limitedWarnings
      .map((warning) => warning.split(":")[0]?.trim())
      .filter(Boolean),
  );

  const summary: string[] = [];
  if (variantCount > 1) {
    summary.push(`Broader discovery ran ${variantCount} LinkedIn searches and merged the results into one scored list.`);
  }
  if (totalReused > 0) {
    summary.push(`Reused ${totalReused} previously saved LinkedIn jobs where exact matches already existed.`);
  }
  if (variantLabels.size > 0) {
    summary.push(`Some expanded searches hit LinkedIn public-result limits, so a few deeper pages were skipped automatically.`);
  }
  if (snippetWarnings.length > 0) {
    summary.push("Some jobs were scored from snippets because LinkedIn did not expose a full description.");
  }
  if (otherWarnings.length > 0 && summary.length === 0) {
    summary.push(...otherWarnings.slice(0, 2));
  }

  return summary;
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
  const [broadenDiscovery, setBroadenDiscovery] = useState(false);
  const [selectedPresets, setSelectedPresets] = useState<SearchPreset[]>(defaultSearchPresets);
  const [resultQuery, setResultQuery] = useState("");
  const [resultGreenOnly, setResultGreenOnly] = useState(false);
  const [resultRemoteOnly, setResultRemoteOnly] = useState(false);
  const deferredResultQuery = useDeferredValue(resultQuery);

  const filteredResults = useMemo(() => {
    let next = results;
    const trimmedQuery = deferredResultQuery.trim();
    if (trimmedQuery) {
      const fuse = new Fuse(results, {
        threshold: 0.3,
        keys: ["title", "company"],
      });
      next = fuse.search(trimmedQuery).map((entry) => entry.item);
    }
    if (resultGreenOnly) {
      next = next.filter((job) => (job.score?.masterScore || 0) >= 80);
    }
    if (resultRemoteOnly) {
      next = next.filter(isRemoteJob);
    }
    return next;
  }, [deferredResultQuery, resultGreenOnly, resultRemoteOnly, results]);

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const visibleCount = filteredResults.length;
    const topScore = filteredResults[0]?.score?.masterScore ?? results[0]?.score?.masterScore ?? 0;
    const prefix = visibleCount === results.length ? `${visibleCount}` : `${visibleCount} of ${results.length}`;
    return `${prefix} LinkedIn jobs scored against ${loaderData.fullName || "your saved resume"} · top score ${topScore}`;
  }, [filteredResults, loaderData.fullName, results]);

  useEffect(() => {
    if (results.length > 0) {
      setShowAdvanced(false);
    }
  }, [results.length]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePreset(preset: SearchPreset) {
    setSelectedPresets((prev) => (
      prev.includes(preset) ? prev.filter((item) => item !== preset) : [...prev, preset]
    ));
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

      const variants = buildSearchVariants(payload, selectedPresets, broadenDiscovery);
      const combinedWarnings: string[] = [];
      const combinedResults: LinkedInScrapedJob[] = [];
      let primarySearchUrl = "";

      for (const [index, variant] of variants.entries()) {
        const response = await fetch("/api/linkedin/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...variant.params, savedSearchId: index === 0 ? activeSavedSearchId : null }),
        });

        const data = (await response.json()) as SearchResponse;
        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.error || `LinkedIn search failed for ${variant.label}.`);
        }

        if (!primarySearchUrl) {
          primarySearchUrl = data.data.searchUrl;
        }

        combinedResults.push(...data.data.jobs);
        combinedWarnings.push(...(data.data.warnings || []).map((warning) => `${variant.label}: ${warning}`));
      }

      setResults(dedupeMergedResults(combinedResults));
      setSearchUrl(primarySearchUrl);
      setWarnings(summarizeSearchWarnings(Array.from(new Set(combinedWarnings)), variants.length));
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
    <div className="spx-page spx-stack">
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
                <div className="space-y-px overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {/* Targeting */}
                  <div className="border-b border-slate-100 p-5">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Targeting</p>
                    <p className="mb-3 text-sm text-slate-500">Filter to a specific company before scraping begins.</p>
                    <Input
                      id="company"
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      placeholder="Company name (optional)"
                    />
                  </div>

                  {/* Freshness & Ranking */}
                  <div className="border-b border-slate-100 p-5">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Freshness & Ranking</p>
                    <p className="mb-3 text-sm text-slate-500">Control how recent results must be and how LinkedIn orders them.</p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700" htmlFor="postedWithin">Posted Within</label>
                        <select
                          id="postedWithin"
                          value={form.postedWithin}
                          onChange={(e) => update("postedWithin", e.target.value as FormState["postedWithin"])}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <option value="any">Any time</option>
                          <option value="24h">Last 24 hours</option>
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700" htmlFor="sortBy">Sort Order</label>
                        <select
                          id="sortBy"
                          value={form.sortBy}
                          onChange={(e) => update("sortBy", e.target.value as FormState["sortBy"])}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        >
                          <option value="recent">Most recent</option>
                          <option value="relevant">Most relevant</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Salary & Application */}
                  <div className="border-b border-slate-100 p-5">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Salary & Application</p>
                    <p className="mb-3 text-sm text-slate-500">Set a salary floor and narrow to quick-apply listings.</p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700" htmlFor="salaryMin">Minimum Salary</label>
                        <Input
                          id="salaryMin"
                          type="number"
                          min="0"
                          step="5000"
                          value={form.salaryMin}
                          onChange={(e) => update("salaryMin", e.target.value)}
                          placeholder="e.g. 120000"
                        />
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                        <input
                          type="checkbox"
                          checked={form.easyApply}
                          onChange={(e) => update("easyApply", e.target.checked)}
                          className="h-4 w-4 rounded"
                        />
                        Easy Apply only
                      </label>
                    </div>
                  </div>

                  {/* Page Coverage */}
                  <div className="border-b border-slate-100 p-5">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Page Coverage</p>
                    <p className="mb-3 text-sm text-slate-500">Choose which result pages to harvest. More pages find more jobs but take longer.</p>
                    <div className="space-y-3">
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
                          max="100"
                          value={String(form.page)}
                          onChange={(e) => update("page", Math.max(1, Number(e.target.value || 1)))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <FieldLabelWithInfo
                          htmlFor="pagesToScan"
                          label="Pages to Scan"
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

                  {/* Role Preferences */}
                  <div className="border-b border-slate-100 p-5">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Role Preferences</p>
                    <p className="mb-3 text-sm text-slate-500">Narrow by work arrangement, seniority, and employment type.</p>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">Workplace Type</p>
                        <div className="space-y-2">
                          {workplaceOptions.map((option) => (
                            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded"
                                checked={form.workplaceTypes.includes(option.value)}
                                onChange={() => update("workplaceTypes", toggleValue(form.workplaceTypes, option.value))}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <p className="mb-2 text-sm font-medium text-slate-700">Experience Level</p>
                        <div className="space-y-2">
                          {experienceOptions.map((option) => (
                            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded"
                                checked={form.experienceLevels.includes(option.value)}
                                onChange={() => update("experienceLevels", toggleValue(form.experienceLevels, option.value))}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <p className="mb-2 text-sm font-medium text-slate-700">Job Type</p>
                        <div className="space-y-2">
                          {jobTypeOptions.map((option) => (
                            <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded"
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

                  {/* Discovery Strategy */}
                  <div className="p-5">
                    <div className="mb-0.5 flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Discovery Strategy</p>
                      <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                        Advanced
                      </span>
                    </div>
                    <p className="mb-1 text-sm text-slate-500">Run several broader LinkedIn searches, then merge and narrow the pool locally.</p>
                    <p className="mb-3 text-xs font-medium text-amber-600">Takes longer — runs multiple LinkedIn searches before combining results.</p>
                    <div className="space-y-3">
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded"
                          checked={broadenDiscovery}
                          onChange={(e) => setBroadenDiscovery(e.target.checked)}
                        />
                        Broaden search before local filtering
                      </label>
                      <div className="space-y-2">
                        {discoveryPresetOptions.map((preset) => {
                          const active = selectedPresets.includes(preset.value);
                          return (
                            <Tooltip key={preset.value}>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => togglePreset(preset.value)}
                                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                                    active
                                      ? "border-sky-200 bg-sky-50 text-sky-700"
                                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <span>{preset.label}</span>
                                  <CircleHelp className="h-4 w-4 shrink-0 opacity-50" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-xs leading-relaxed">
                                {preset.description}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
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
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input
                    value={resultQuery}
                    onChange={(e) => setResultQuery(e.target.value)}
                    placeholder="Filter merged results by title or company"
                    className="border-0 px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setResultGreenOnly((prev) => !prev)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      resultGreenOnly
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Green only
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultRemoteOnly((prev) => !prev)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      resultRemoteOnly
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Remote only
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredResults.map((job) => (
                  <LinkedInResultCard key={job.id} job={job} />
                ))}
              </div>
              {filteredResults.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                  No merged LinkedIn jobs match the current local filters.
                </div>
              ) : null}
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
