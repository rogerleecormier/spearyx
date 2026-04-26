import { ScoreBadge } from "./score-badge";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@spearyx/ui-kit";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Tag,
  TrendingUp,
  Shield,
  Target,
  DollarSign,
  Sparkles,
  MapPin,
  BarChart3,
} from "lucide-react";

interface GapItem {
  requirement?: string;
  area?: string;
  status?: "covered" | "partial" | "missing";
  requirementType?: "required" | "preferred";
  suggestion?: string;
  detail?: string;
}

interface CultureSignal {
  signal: string;
  interpretation: string;
  sentiment: "positive" | "neutral" | "warning";
}

interface RedFlag {
  flag: string;
  reason: string;
}

interface JobInsightsSection {
  workLifeBalance?: "excellent" | "good" | "moderate" | "demanding" | "unknown";
  remoteFlexibility?: "fully_remote" | "hybrid" | "office" | "unknown";
  seniorityLevel?: "entry" | "mid" | "senior" | "lead" | "executive" | "unknown";
  cultureSignals?: CultureSignal[];
  redFlags?: RedFlag[];
}

interface SalaryAssessment {
  listed: string | null;
  projectedRange: string;
  assessment: string;
}

interface CareerAnalysis {
  trajectory: string;
  recommendation: "pursue" | "consider" | "pass";
  reasoning: string;
  salaryAssessment?: SalaryAssessment;
}

interface AnalysisResultProps {
  analysis: {
    jobTitle: string;
    company: string;
    industry?: string;
    location?: string;
    matchScore: number;
    pursue: boolean;
    pursueJustification: string;
    gapAnalysis: GapItem[];
    recommendations: string[];
    keywords: string[];
    strategyNote?: string;
    personalInterest?: string;
    careerAnalysis?: CareerAnalysis | null;
    insights?: JobInsightsSection | null;
  };
}

const verdictMap = {
  pursue: { Icon: CheckCircle2, label: "Pursue", bg: "bg-emerald-500/10 ring-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
  consider: { Icon: AlertTriangle, label: "Consider", bg: "bg-amber-500/10 ring-amber-500/20", text: "text-amber-700 dark:text-amber-400" },
  pass: { Icon: XCircle, label: "Pass", bg: "bg-red-500/10 ring-red-500/20", text: "text-red-700 dark:text-red-400" },
};

const statusMap = {
  covered: { Icon: CheckCircle2, className: "text-emerald-500" },
  partial: { Icon: AlertTriangle, className: "text-amber-500" },
  missing: { Icon: XCircle, className: "text-red-500" },
};

function StatusBadge({ status }: { status?: string }) {
  if (status === "covered") return <Badge variant="success" className="text-[10px] px-1.5 py-0">Match</Badge>;
  if (status === "partial") return <Badge variant="warning" className="text-[10px] px-1.5 py-0">Partial</Badge>;
  if (status === "missing") return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Gap</Badge>;
  return null;
}

function RequirementBadge({ type }: { type?: string }) {
  if (type === "required") return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>;
  if (type === "preferred") return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Preferred</Badge>;
  return null;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const rec = analysis.careerAnalysis?.recommendation ?? (analysis.pursue ? "pursue" : "pass");
  const verdict = verdictMap[rec];
  const VerdictIcon = verdict.Icon;

  const covered = analysis.gapAnalysis.filter((g) => g.status === "covered").length;
  const partial = analysis.gapAnalysis.filter((g) => g.status === "partial").length;
  const missing = analysis.gapAnalysis.filter((g) => g.status === "missing").length;

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className={`rounded-xl ring-1 p-5 ${verdict.bg}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight truncate">{analysis.jobTitle}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {analysis.company}
              {analysis.industry ? ` · ${analysis.industry}` : ""}
              {analysis.location ? ` · ${analysis.location}` : ""}
            </p>
          </div>
          <ScoreBadge score={analysis.matchScore} size="lg" />
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-current/10">
          <VerdictIcon className={`h-4 w-4 shrink-0 ${verdict.text}`} />
          <span className={`text-sm font-semibold uppercase tracking-wide ${verdict.text}`}>{verdict.label}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{analysis.pursueJustification}</p>

        {analysis.careerAnalysis && (
          <div className="mt-4 pt-3 border-t border-current/10 space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Career Impact</span>
            </div>
            <p className="text-sm text-muted-foreground">{analysis.careerAnalysis.trajectory}</p>
            {analysis.careerAnalysis.reasoning && (
              <p className="text-xs text-muted-foreground/70">{analysis.careerAnalysis.reasoning}</p>
            )}
            {analysis.careerAnalysis.salaryAssessment && (
              <div className="mt-3 pt-3 border-t border-current/10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Salary</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">
                    {analysis.careerAnalysis.salaryAssessment.listed ?? analysis.careerAnalysis.salaryAssessment.projectedRange}
                  </span>
                  {!analysis.careerAnalysis.salaryAssessment.listed && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Projected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/70">{analysis.careerAnalysis.salaryAssessment.assessment}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {analysis.personalInterest && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Why This Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.personalInterest}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Requirements Analysis
            </span>
            {analysis.gapAnalysis.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {covered} matched · {partial} partial · {missing} gaps
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.gapAnalysis.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requirements analyzed.</p>
          ) : (
            <div className="space-y-3">
              {analysis.gapAnalysis.map((gap, i) => {
                const s = statusMap[gap.status as keyof typeof statusMap] ?? statusMap.partial;
                const StatusIcon = s.Icon;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${s.className}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium">{gap.requirement ?? gap.area}</span>
                        <RequirementBadge type={gap.requirementType} />
                        <StatusBadge status={gap.status} />
                      </div>
                      {(gap.suggestion ?? gap.detail) && (
                        <p className="text-xs text-muted-foreground mt-0.5">{gap.suggestion ?? gap.detail}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {analysis.strategyNote && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-primary" />
              Strategic Positioning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.strategyNote}</p>
          </CardContent>
        </Card>
      )}

      {analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary font-bold shrink-0 mt-px">·</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {analysis.keywords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-primary" />
              ATS Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {analysis.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs font-mono">{kw}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analysis.insights && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              Role Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick facts grid */}
            <div className="grid grid-cols-2 gap-3">
              {analysis.insights.workLifeBalance && analysis.insights.workLifeBalance !== "unknown" && (
                <div className={`p-3 rounded-lg border ${
                  analysis.insights.workLifeBalance === "excellent" || analysis.insights.workLifeBalance === "good"
                    ? "bg-emerald-50 border-emerald-100"
                    : analysis.insights.workLifeBalance === "demanding"
                    ? "bg-red-50 border-red-100"
                    : "bg-amber-50 border-amber-100"
                }`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                    analysis.insights.workLifeBalance === "excellent" || analysis.insights.workLifeBalance === "good"
                      ? "text-emerald-700"
                      : analysis.insights.workLifeBalance === "demanding" ? "text-red-700" : "text-amber-700"
                  }`}>Work-Life Balance</p>
                  <p className={`text-sm font-bold capitalize ${
                    analysis.insights.workLifeBalance === "excellent" || analysis.insights.workLifeBalance === "good"
                      ? "text-emerald-800"
                      : analysis.insights.workLifeBalance === "demanding" ? "text-red-800" : "text-amber-800"
                  }`}>{analysis.insights.workLifeBalance}</p>
                </div>
              )}
              {analysis.insights.remoteFlexibility && analysis.insights.remoteFlexibility !== "unknown" && (
                <div className="p-3 rounded-lg border bg-blue-50 border-blue-100">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Work Location</p>
                  </div>
                  <p className="text-sm font-bold text-blue-800">
                    {analysis.insights.remoteFlexibility === "fully_remote" ? "Fully Remote"
                      : analysis.insights.remoteFlexibility === "hybrid" ? "Hybrid"
                      : "On-site"}
                  </p>
                </div>
              )}
              {analysis.insights.seniorityLevel && analysis.insights.seniorityLevel !== "unknown" && (
                <div className="p-3 rounded-lg border bg-violet-50 border-violet-100">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-violet-600" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Seniority</p>
                  </div>
                  <p className="text-sm font-bold text-violet-800 capitalize">{analysis.insights.seniorityLevel}</p>
                </div>
              )}
            </div>

            {/* Culture signals */}
            {analysis.insights.cultureSignals && analysis.insights.cultureSignals.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Culture Signals</p>
                <div className="space-y-2">
                  {analysis.insights.cultureSignals.map((s, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${
                      s.sentiment === "positive" ? "bg-emerald-50/60 border-emerald-100"
                        : s.sentiment === "warning" ? "bg-amber-50/60 border-amber-100"
                        : "bg-slate-50 border-slate-100"
                    }`}>
                      <span className="shrink-0 mt-px">
                        {s.sentiment === "positive" ? "✅" : s.sentiment === "warning" ? "⚠️" : "ℹ️"}
                      </span>
                      <div>
                        <p className={`font-semibold ${s.sentiment === "positive" ? "text-emerald-800" : s.sentiment === "warning" ? "text-amber-800" : "text-slate-700"}`}>{s.signal}</p>
                        <p className="text-muted-foreground mt-0.5">{s.interpretation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red flags */}
            {analysis.insights.redFlags && analysis.insights.redFlags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Red Flags
                </p>
                <div className="space-y-2">
                  {analysis.insights.redFlags.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs">
                      <span className="shrink-0 mt-px">🚩</span>
                      <div>
                        <p className="font-semibold text-red-800">{f.flag}</p>
                        <p className="text-red-600 mt-0.5">{f.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
