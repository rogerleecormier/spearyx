import { Link } from "@tanstack/react-router";
import type { ChangeEvent } from "react";
import { useState } from "react";
import {
  Badge,
  Body,
  Button,
  Caption,
  Label,
  PrimaryCard,
  Textarea,
  Title,
} from "@spearyx/ui-kit";
import {
  BarChart3,
  Briefcase,
  ChevronDown,
  Copy,
  DollarSign,
  ExternalLink,
  Loader2,
  MapPin,
  MessageSquareText,
  Sparkles,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";
import { getMasterScoreGradient, getScoreBorderColor } from "@/lib/scoreUtils";
import {
  generateLinkedinOutreach,
  getLinkedinInlineInsights,
} from "@/server/functions/linkedin-searches";

export type LinkedinJobStatus = "Saved" | "Applied" | "Interviewing" | "Rejected" | "Archived";

export type LinkedinResultCardJob = {
  id?: number;
  title: string;
  company: string;
  location: string;
  sourceUrl: string;
  salary?: string | null;
  snippet?: string | null;
  description?: string | null;
  postDateText?: string | null;
  resultSource?: string;
  ownerEmail?: string | null;
  status?: LinkedinJobStatus | null;
  score?: {
    atsScore: number;
    careerScore: number;
    outlookScore: number;
    masterScore: number;
    atsReason?: string;
    isUnicorn?: boolean;
    unicornReason?: string | null;
  };
  masterScore?: number | null;
  atsScore?: number | null;
  careerScore?: number | null;
  outlookScore?: number | null;
  atsReason?: string | null;
  isUnicorn?: number | boolean | null;
  unicornReason?: string | null;
};

type InlineInsights = Awaited<ReturnType<typeof getLinkedinInlineInsights>>;

interface LinkedinResultCardProps {
  job: LinkedinResultCardJob;
  selected?: boolean;
  showSelection?: boolean;
  onSelect?: () => void;
  statusOptions?: LinkedinJobStatus[];
  onStatusChange?: (status: LinkedinJobStatus) => void | Promise<void>;
  statusPending?: boolean;
}

function getScore(job: LinkedinResultCardJob) {
  if (job.score) return job.score;
  if (
    job.masterScore == null ||
    job.atsScore == null ||
    job.careerScore == null ||
    job.outlookScore == null
  ) {
    return null;
  }

  return {
    atsScore: job.atsScore,
    careerScore: job.careerScore,
    outlookScore: job.outlookScore,
    masterScore: job.masterScore,
    atsReason: job.atsReason ?? undefined,
    isUnicorn: job.isUnicorn === true || job.isUnicorn === 1,
    unicornReason: job.unicornReason ?? null,
  };
}

function formatSalary(insights?: InlineInsights | null, listedSalary?: string | null) {
  if (listedSalary) return listedSalary;
  const salary = insights?.estimatedSalary;
  if (!salary || salary.min == null || salary.max == null) return "Not detected";
  return `${salary.currency} ${salary.min.toLocaleString()}-${salary.max.toLocaleString()} (${salary.confidence})`;
}

function formatRemote(value?: InlineInsights["remoteFlexibility"]) {
  if (!value || value === "unknown") return "Unknown";
  if (value === "fully_remote") return "Fully remote";
  if (value === "office") return "On-site";
  return value;
}

function ScorePill({ score }: { score: NonNullable<ReturnType<typeof getScore>> }) {
  const gradient = getMasterScoreGradient(score.masterScore);
  return (
    <div className="flex items-center gap-2">
      {score.isUnicorn ? (
        <Badge variant="warning" title={score.unicornReason || "Unicorn opportunity"}>
          Unicorn
        </Badge>
      ) : null}
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-white shadow-sm`}
        title={`Match score ${score.masterScore}`}
      >
        {score.masterScore}
      </div>
    </div>
  );
}

function InsightTile({
  icon,
  label,
  value,
  tone = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "slate" | "emerald" | "sky" | "violet" | "amber" | "red";
}) {
  const tones = {
    slate: "border-slate-100 bg-slate-50 text-slate-800",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
    sky: "border-sky-100 bg-sky-50 text-sky-800",
    violet: "border-violet-100 bg-violet-50 text-violet-800",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
    red: "border-red-100 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <Caption variant="semibold" className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </Caption>
      </div>
      <Body size="sm" weight="semibold" className="capitalize leading-tight">
        {value}
      </Body>
    </div>
  );
}

export function LinkedinResultCard({
  job,
  selected = false,
  showSelection = false,
  onSelect,
  statusOptions,
  onStatusChange,
  statusPending = false,
}: LinkedinResultCardProps) {
  const score = getScore(job);
  const [insights, setInsights] = useState<InlineInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [outreach, setOutreach] = useState("");
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [outreachCopied, setOutreachCopied] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);

  async function loadInsights() {
    if (insights || insightsLoading) return;
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const result = await getLinkedinInlineInsights({ data: job });
      setInsights(result);
    } catch (error) {
      setInsightsError(error instanceof Error ? error.message : "Unable to generate insights.");
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleGenerateOutreach() {
    setOutreachLoading(true);
    setOutreachError(null);
    setOutreachCopied(false);
    try {
      const result = await generateLinkedinOutreach({ data: job });
      setOutreach(result.message);
    } catch (error) {
      setOutreachError(error instanceof Error ? error.message : "Unable to generate outreach.");
    } finally {
      setOutreachLoading(false);
    }
  }

  async function copyOutreach() {
    if (!outreach) return;
    await navigator.clipboard.writeText(outreach);
    setOutreachCopied(true);
  }

  const workLifeTone =
    insights?.workLifeBalance === "excellent" || insights?.workLifeBalance === "good"
      ? "emerald"
      : insights?.workLifeBalance === "demanding"
        ? "red"
        : "amber";

  return (
    <PrimaryCard
      title={job.title}
      description={`${job.company} · ${job.location}`}
      className={`flex h-full flex-col bg-white/85 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        selected ? "ring-2 ring-primary-300" : ""
      } ${getScoreBorderColor(score?.masterScore ?? 0)}`}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {showSelection ? (
                <Label className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={onSelect}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600"
                    aria-label={`Select ${job.title} at ${job.company}`}
                  />
                  Select
                </Label>
              ) : null}
              <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                LinkedIn
              </Badge>
              {job.resultSource === "history" ? (
                <Badge variant="success">Saved Score</Badge>
              ) : null}
              {job.postDateText ? (
                <Caption className="text-xs text-slate-500">{job.postDateText}</Caption>
              ) : null}
            </div>
            <Title as="h3" className="line-clamp-2 text-base text-slate-900">
              {job.title}
            </Title>
            <Body size="sm" weight="medium" className="mt-1 text-slate-700">
              {job.company}
            </Body>
            <Caption className="mt-1 block text-xs text-slate-500">{job.location}</Caption>
            {job.ownerEmail ? (
              <Caption className="mt-2 block text-[11px] text-slate-500">
                Owner: {job.ownerEmail}
              </Caption>
            ) : null}
          </div>
          {score ? <ScorePill score={score} /> : null}
        </div>

        {job.salary ? (
          <Body size="sm" weight="medium" className="text-emerald-700">
            {job.salary}
          </Body>
        ) : null}
        {job.snippet ? (
          <Body size="sm" className="line-clamp-3 leading-relaxed text-slate-600">
            {job.snippet}
          </Body>
        ) : null}

        {score ? (
          <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <Caption variant="semibold" className="text-xs text-slate-500">ATS</Caption>
                <Body size="sm" weight="semibold" className="text-slate-900">{score.atsScore}</Body>
              </div>
              <div>
                <Caption variant="semibold" className="text-xs text-slate-500">Career</Caption>
                <Body size="sm" weight="semibold" className="text-slate-900">{score.careerScore}</Body>
              </div>
              <div>
                <Caption variant="semibold" className="text-xs text-slate-500">Outlook</Caption>
                <Body size="sm" weight="semibold" className="text-slate-900">{score.outlookScore}</Body>
              </div>
            </div>
            {score.atsReason ? (
              <Caption className="mt-3 block line-clamp-3 text-xs leading-relaxed text-slate-600">
                {score.atsReason}
              </Caption>
            ) : null}
          </div>
        ) : null}

        <details
          className="rounded-xl border border-slate-200 bg-slate-50/70"
          onToggle={(event) => {
            if (event.currentTarget.open) void loadInsights();
          }}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
              <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
              Inline AI Insights
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </summary>
          <div className="space-y-3 border-t border-slate-200 px-3 py-3">
            {insightsLoading ? (
              <Body size="sm" className="inline-flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating insights
              </Body>
            ) : insightsError ? (
              <Body size="sm" className="text-red-600">{insightsError}</Body>
            ) : insights ? (
              <>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <InsightTile
                    icon={<DollarSign className="h-3.5 w-3.5 text-emerald-600" />}
                    label="Salary"
                    value={formatSalary(insights, job.salary)}
                    tone="emerald"
                  />
                  <InsightTile
                    icon={<Briefcase className="h-3.5 w-3.5 text-amber-600" />}
                    label="Work-Life"
                    value={insights.workLifeBalance ?? "Unknown"}
                    tone={workLifeTone}
                  />
                  <InsightTile
                    icon={<MapPin className="h-3.5 w-3.5 text-sky-600" />}
                    label="Flex"
                    value={formatRemote(insights.remoteFlexibility)}
                    tone="sky"
                  />
                  <InsightTile
                    icon={<TrendingUp className="h-3.5 w-3.5 text-violet-600" />}
                    label="Seniority"
                    value={insights.seniorityLevel ?? "Unknown"}
                    tone="violet"
                  />
                </div>
                {insights.redFlags?.length ? (
                  <div className="space-y-2">
                    <Caption variant="semibold" className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-red-600">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      Red Flags
                    </Caption>
                    {insights.redFlags.map((flag) => (
                      <div key={`${flag.flag}-${flag.reason}`} className="rounded-xl border border-red-100 bg-red-50 p-3">
                        <Body size="sm" weight="semibold" className="text-red-800">{flag.flag}</Body>
                        <Caption className="mt-1 block text-xs leading-relaxed text-red-600">
                          {flag.reason}
                        </Caption>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Caption className="block text-xs text-slate-500">No red flags detected.</Caption>
                )}
              </>
            ) : (
              <Body size="sm" className="text-slate-500">Open this panel to generate job insights.</Body>
            )}
          </div>
        </details>

        {statusOptions && onStatusChange ? (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <Caption className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Briefcase className="h-3.5 w-3.5" />
              {job.postDateText || "Saved result"}
            </Caption>
            <Label className="flex items-center gap-2 text-xs text-slate-500">
              Status
              <select
                value={(job.status ?? "Saved") as LinkedinJobStatus}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onStatusChange(event.target.value as LinkedinJobStatus)
                }
                disabled={statusPending}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                aria-label={`Status for ${job.title}`}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </Label>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateOutreach}
            disabled={outreachLoading}
            className="border-slate-200 text-slate-700"
          >
            {outreachLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MessageSquareText className="h-3.5 w-3.5" />
            )}
            Generate Outreach
          </Button>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
          >
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {outreachError ? (
          <Body size="sm" className="text-red-600">{outreachError}</Body>
        ) : null}
        {outreach ? (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Textarea
              value={outreach}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setOutreach(event.target.value)}
              className="min-h-24 bg-white text-sm"
              aria-label={`Generated outreach for ${job.title}`}
            />
            <div className="flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={copyOutreach}>
                <Copy className="h-3.5 w-3.5" />
                {outreachCopied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </PrimaryCard>
  );
}
