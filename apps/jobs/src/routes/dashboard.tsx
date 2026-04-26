import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { getAnalytics } from "@/server/functions/get-analytics";
import { manuallyAggregateAnalytics } from "@/server/functions/manually-aggregate-analytics";
import {
  BarChart3,
  Briefcase,
  CircleDashed,
  FileText,
  Gauge,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { requireLoginRedirect } from "@/lib/auth-redirect";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { id: number } | null };
    if (!ctx.user) requireLoginRedirect("/dashboard", "search insights");
  },
  loader: async () => getAnalytics({ data: { period: "all_time" } }),
  component: DashboardPage,
  pendingComponent: DashboardLoading,
});

function DashboardPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  const derived = useMemo(() => {
    const analyses = data?.totalAnalyses ?? 0;
    const resumes = data?.totalResumesGenerated ?? 0;
    const applied = data?.totalApplied ?? 0;
    const avgMatch = data?.averageMatchScore ?? 0;

    const applicationRate = analyses > 0 ? Math.round((applied / analyses) * 100) : 0;
    const resumeCoverage = analyses > 0 ? Math.round((resumes / analyses) * 100) : 0;
    const analysisGap = Math.max(analyses - applied, 0);

    let matchLabel = "Needs attention";
    let matchTone = "text-amber-700 bg-amber-50 border-amber-100";
    if (avgMatch >= 75) {
      matchLabel = "Strong alignment";
      matchTone = "text-emerald-700 bg-emerald-50 border-emerald-100";
    } else if (avgMatch >= 60) {
      matchLabel = "Solid base";
      matchTone = "text-sky-700 bg-sky-50 border-sky-100";
    }

    const topRole = data?.topJobTitles?.[0];
    const topIndustry = data?.topIndustries?.[0];
    const topJdKeyword = data?.topJdKeywords?.[0];
    const topResumeKeyword = data?.topResumeKeywords?.[0];

    return {
      applicationRate,
      resumeCoverage,
      analysisGap,
      matchLabel,
      matchTone,
      topRole,
      topIndustry,
      topJdKeyword,
      topResumeKeyword,
    };
  }, [data]);

  async function handleResync() {
    setSyncing(true);
    try {
      await manuallyAggregateAnalytics();
      await router.invalidate();
    } finally {
      setSyncing(false);
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-muted-foreground">
        No analytics data yet. Analyze some job postings to get started.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white shadow-sm sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              <BarChart3 className="h-3.5 w-3.5" />
              Search Insights
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Search Insights</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Monitor match quality, application momentum, and where your strongest positioning is emerging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat label="Analyses" value={String(data.totalAnalyses)} />
            <HeroStat label="Applied" value={String(data.totalApplied)} />
            <HeroStat label="Avg Match" value={`${data.averageMatchScore.toFixed(1)}%`} />
            <HeroStat label="Resume Coverage" value={`${derived.resumeCoverage}%`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Gauge className="h-5 w-5 text-violet-600" />}
          label="Average Match"
          value={`${data.averageMatchScore.toFixed(1)}%`}
          note={derived.matchLabel}
          accent="bg-violet-50 border-violet-100"
        />
        <MetricCard
          icon={<Target className="h-5 w-5 text-emerald-600" />}
          label="Application Rate"
          value={`${derived.applicationRate}%`}
          note={`${data.totalApplied} of ${data.totalAnalyses} analyzed roles pursued`}
          accent="bg-emerald-50 border-emerald-100"
        />
        <MetricCard
          icon={<FileText className="h-5 w-5 text-sky-600" />}
          label="Resumes Generated"
          value={String(data.totalResumesGenerated)}
          note={`${derived.resumeCoverage}% of analyses turned into tailored resumes`}
          accent="bg-sky-50 border-sky-100"
        />
        <MetricCard
          icon={<CircleDashed className="h-5 w-5 text-amber-600" />}
          label="Open Follow-Up"
          value={String(derived.analysisGap)}
          note="Analyzed roles that have not been marked applied"
          accent="bg-amber-50 border-amber-100"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Performance Snapshot</h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick read on momentum and alignment across your saved analyses.
              </p>
            </div>
            <button
              onClick={handleResync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Resync"}
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <InsightPanel
              title="Match Quality"
              subtitle="How close your analyzed roles are to your current profile."
              value={`${data.averageMatchScore.toFixed(1)}%`}
              toneClass={derived.matchTone}
              bars={[
                { label: "Average alignment", value: data.averageMatchScore },
                { label: "Resume coverage", value: derived.resumeCoverage },
                { label: "Application rate", value: derived.applicationRate },
              ]}
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">What stands out</h3>
              </div>
              <div className="mt-4 space-y-3">
                <HighlightRow
                  label="Primary role focus"
                  value={derived.topRole ? `${derived.topRole.title} (${derived.topRole.count})` : "No dominant title yet"}
                />
                <HighlightRow
                  label="Top industry"
                  value={derived.topIndustry ? `${derived.topIndustry.industry} (${derived.topIndustry.count})` : "Not enough data yet"}
                />
                <HighlightRow
                  label="Top JD keyword"
                  value={derived.topJdKeyword ? `${derived.topJdKeyword.keyword} (${derived.topJdKeyword.count})` : "Not enough data yet"}
                />
                <HighlightRow
                  label="Top resume keyword"
                  value={derived.topResumeKeyword ? `${derived.topResumeKeyword.keyword} (${derived.topResumeKeyword.count})` : "No resume keyword data yet"}
                />
              </div>

              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">Recommended next move</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {derived.analysisGap > 0
                    ? `Review ${derived.analysisGap} analyzed role${derived.analysisGap === 1 ? "" : "s"} that have not been marked applied yet and prioritize the strongest matches first.`
                    : "Your analyzed roles are well progressed. Keep feeding strong postings into analysis to sharpen trend quality."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Focus Areas</h2>
          <p className="mt-1 text-sm text-slate-500">
            The titles and industries appearing most often in your search activity.
          </p>

          <div className="mt-6 space-y-6">
            <RankedList
              title="Top Applied Job Titles"
              emptyLabel="Applied titles will appear here after you start marking roles as applied."
              items={data.topJobTitles.map((item) => ({
                label: item.title,
                count: item.count,
                total: Math.max(data.totalApplied, 1),
              }))}
            />

            <RankedList
              title="Top Industries"
              emptyLabel="Industries will appear here once your analysis history grows."
              items={data.topIndustries.map((item) => ({
                label: item.industry,
                count: item.count,
                total: Math.max(data.totalAnalyses, 1),
              }))}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <KeywordSection
          title="Top JD Keywords"
          subtitle="Terms most common in the roles you analyze."
          icon={<Briefcase className="h-4 w-4 text-primary" />}
          items={data.topJdKeywords}
          emptyLabel="Analyze a few more jobs to surface hiring language patterns."
          toneClass="bg-primary/10 text-primary"
        />

        <KeywordSection
          title="Top Resume Keywords"
          subtitle="Terms reinforced through your tailored resume output."
          icon={<TrendingUp className="h-4 w-4 text-sky-600" />}
          items={data.topResumeKeywords}
          emptyLabel="Generate tailored resumes to see which strengths are showing up most often."
          toneClass="bg-sky-100 text-sky-700"
        />
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Last updated: {data.updatedAt?.slice(0, 16).replace("T", " ")} UTC
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/history"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            View History
          </Link>
          <Link
            to="/analyze"
            className="inline-flex items-center rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Analyze a Job
          </Link>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accent}`}>
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

function InsightPanel({
  title,
  subtitle,
  value,
  toneClass,
  bars,
}: {
  title: string;
  subtitle: string;
  value: string;
  toneClass: string;
  bars: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClass}`}>
          {value}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-slate-600">{bar.label}</span>
              <span className="font-medium text-slate-900">{Math.round(bar.value)}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-red-400"
                style={{ width: `${Math.max(6, Math.min(bar.value, 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HighlightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function RankedList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: Array<{ label: string; count: number; total: number }>;
  emptyLabel: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((item, index) => {
            const width = Math.max(10, Math.round((item.count / item.total) * 100));
            return (
              <div key={`${title}-${item.label}`} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-slate-900">{item.label}</span>
                  </div>
                  <span className="shrink-0 text-slate-500">x{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${Math.min(width, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KeywordSection({
  title,
  subtitle,
  icon,
  items,
  emptyLabel,
  toneClass,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: Array<{ keyword: string; count: number }>;
  emptyLabel: string;
  toneClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      {items.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {items.slice(0, 16).map((item) => (
            <span
              key={`${title}-${item.keyword}`}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${toneClass}`}
            >
              {item.keyword}
              <span className="opacity-70">x{item.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 animate-pulse">
      <div className="h-44 rounded-2xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 rounded-2xl bg-muted" />
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
