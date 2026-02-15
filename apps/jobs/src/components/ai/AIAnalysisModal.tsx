import { useState, useEffect, useCallback } from "react";
import {
    X,
    Target,
    TrendingUp,
    BarChart3,
    Info,
    Sparkles,
    Loader2,
    Check,
    AlertCircle,
    DollarSign,
    AlertTriangle,
} from "lucide-react";
import type { JobWithCategory } from "../../lib/search-utils";
import type { JobScoreResult } from "../../routes/api/ai/score-all";
import type { JobInsights } from "../../lib/ai";
import { getBarColor, getMasterScoreGradient } from "../../lib/scoreUtils";
import { loadUserProfile } from "./SkillsModal";

// --- Match types ---
interface MatchResult {
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    summary: string;
}

// --- Combined analysis state ---
interface AnalysisData {
    match?: MatchResult;
    insights?: JobInsights;
}

type AnalysisStatus = "idle" | "loading" | "success" | "error";

// --- Score detail bar ---
function ScoreDetailBar({
    score,
    label,
    reason,
    icon: Icon,
}: {
    score: number;
    label: string;
    reason: string;
    icon: any;
}) {
    return (
        <div className="group space-y-2 p-4 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
                        <Icon size={16} className="text-primary-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                        {label}
                    </span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-800">{score}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/100</span>
                </div>
            </div>

            <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-100 p-0.5 shadow-inner">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            <div className="flex gap-2">
                <Info size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {reason}
                </p>
            </div>
        </div>
    );
}

// --- Skeleton block ---
function AnalysisSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Match skeleton */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-32" />
                </div>
                <div className="p-4 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="flex gap-2 mt-3">
                        <div className="h-6 w-16 bg-slate-100 rounded-full" />
                        <div className="h-6 w-20 bg-slate-100 rounded-full" />
                        <div className="h-6 w-14 bg-slate-100 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Insights skeleton */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100">
                    <div className="h-4 bg-slate-200 rounded w-24" />
                </div>
                <div className="p-4 space-y-3">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                    <div className="flex flex-wrap gap-2 mt-3">
                        <div className="h-6 w-24 bg-slate-100 rounded-full" />
                        <div className="h-6 w-20 bg-slate-100 rounded-full" />
                        <div className="h-6 w-28 bg-slate-100 rounded-full" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        <div className="h-5 w-16 bg-slate-100 rounded" />
                        <div className="h-5 w-20 bg-slate-100 rounded" />
                        <div className="h-5 w-14 bg-slate-100 rounded" />
                        <div className="h-5 w-18 bg-slate-100 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Score color helpers ---
function getScoreColor(score: number) {
    if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
}

function getScoreLabel(score: number) {
    if (score >= 75) return "Great Match";
    if (score >= 50) return "Good Match";
    return "Partial Match";
}



interface AIAnalysisModalProps {
    job: JobWithCategory;
    score?: JobScoreResult;
    isOpen: boolean;
    onClose: () => void;
}

export default function AIAnalysisModal({
    job,
    score,
    isOpen,
    onClose,
}: AIAnalysisModalProps) {
    const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
    const [analysisData, setAnalysisData] = useState<AnalysisData>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasProfile, setHasProfile] = useState(false);

    const runAnalysis = useCallback(async () => {
        setAnalysisStatus("loading");
        setErrorMessage(null);
        setAnalysisData({});

        // Get job description (prefer full, fallback to summary)
        let descriptionForAI = job.fullDescription || job.description || "";

        // Try to fetch fresh full description
        if (job.sourceUrl && job.company) {
            try {
                const params = new URLSearchParams({
                    url: job.sourceUrl,
                    company: job.company || "",
                });
                const res = await fetch(`/api/v3/job-content?${params.toString()}`);
                if (res.ok) {
                    const data = (await res.json()) as { content?: string };
                    if (data.content) descriptionForAI = data.content;
                }
            } catch {
                // Use existing description
            }
        }

        if (!descriptionForAI) {
            setAnalysisStatus("error");
            setErrorMessage("No job description available for analysis.");
            return;
        }

        // Fire both requests in parallel
        const matchPromise = (async (): Promise<MatchResult | null> => {
            const profile = loadUserProfile();
            const profileExists = !!profile && (!!profile.resume || profile.skills.length > 0);
            setHasProfile(profileExists);
            if (!profileExists) return null;
            try {
                console.log("[AI Match] Sending request with profile:", {
                    hasResume: !!profile!.resume,
                    resumeLength: profile!.resume?.length || 0,
                    skillCount: profile!.skills?.length || 0,
                    jobTitle: job.title,
                    descLength: descriptionForAI.length,
                });
                const response = await fetch("/api/ai/match", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resume: profile!.resume,
                        skills: profile!.skills,
                        jobTitle: job.title,
                        jobDescription: descriptionForAI,
                    }),
                });
                console.log("[AI Match] Response status:", response.status);
                if (!response.ok) {
                    const errBody = await response.text();
                    console.error("[AI Match] Error body:", errBody);
                    return null;
                }
                const result = (await response.json()) as { success: boolean; data: MatchResult };
                console.log("[AI Match] Result:", result.success, result.data?.matchScore);
                return result.success ? result.data : null;
            } catch (err) {
                console.error("[AI Match] Fetch error:", err);
                return null;
            }
        })();

        const insightsPromise = (async (): Promise<JobInsights | null> => {
            try {
                const response = await fetch("/api/ai/insights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        description: descriptionForAI,
                        title: job.title,
                    }),
                });
                if (!response.ok) return null;
                const result = (await response.json()) as { success: boolean; data: JobInsights };
                return result.success ? result.data : null;
            } catch {
                return null;
            }
        })();

        try {
            const [matchResult, insightsResult] = await Promise.all([
                matchPromise,
                insightsPromise,
            ]);

            if (!matchResult && !insightsResult) {
                setAnalysisStatus("error");
                setErrorMessage("Both analyses failed. Please try again.");
                return;
            }

            setAnalysisData({
                match: matchResult || undefined,
                insights: insightsResult || undefined,
            });
            setAnalysisStatus("success");
        } catch {
            setAnalysisStatus("error");
            setErrorMessage("Analysis failed unexpectedly. Please try again.");
        }
    }, [job]);

    // Auto-trigger analysis when modal opens
    useEffect(() => {
        if (isOpen && analysisStatus === "idle") {
            runAnalysis();
        }
        if (!isOpen) {
            // Reset state when modal closes
            setAnalysisStatus("idle");
            setAnalysisData({});
            setErrorMessage(null);
            setHasProfile(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const { match, insights } = analysisData;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b-2 border-slate-200 gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-amber-500" />
                            <h2 className="text-xl font-bold text-slate-900">AI Analysis</h2>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">
                            {job.title}
                            {job.company && (
                                <span className="text-slate-400"> · {job.company}</span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Score Breakdown (if pre-scored) */}
                    {score && (
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div
                                className={`px-5 py-4 bg-gradient-to-r ${getMasterScoreGradient(score.masterScore)} text-white flex items-center justify-between`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-xl font-bold">
                                        {score.masterScore}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">Master Score</p>
                                        <p className="text-xs text-white/80">
                                            ATS compatibility, career growth, and career outlook
                                        </p>
                                    </div>
                                </div>
                                {score.isUnicorn && (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                                        🦄 Unicorn
                                    </div>
                                )}
                            </div>

                            <div className="p-5 space-y-4">
                                <ScoreDetailBar
                                    score={score.atsScore}
                                    label="ATS Compatibility"
                                    reason={score.atsReason}
                                    icon={Target}
                                />
                                <ScoreDetailBar
                                    score={score.careerScore}
                                    label="Career Enhancement"
                                    reason={score.careerReason}
                                    icon={TrendingUp}
                                />
                                <ScoreDetailBar
                                    score={score.outlookScore}
                                    label="Career Outlook"
                                    reason={score.outlookReason}
                                    icon={BarChart3}
                                />

                                {score.isUnicorn && score.unicornReason && (
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                                            🦄 Why This Is a Unicorn
                                        </p>
                                        <p className="text-xs text-purple-600 leading-relaxed">
                                            {score.unicornReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Loading state — skeleton + status text */}
                    {analysisStatus === "loading" && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <Loader2 size={20} className="animate-spin text-amber-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">
                                        AI analysis in progress…
                                    </p>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        Analyzing job requirements, matching your skills, and
                                        extracting insights. This may take a few seconds.
                                    </p>
                                </div>
                            </div>
                            <AnalysisSkeleton />
                        </div>
                    )}

                    {/* Error state */}
                    {analysisStatus === "error" && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <div className="p-3 bg-red-50 rounded-full">
                                <X size={24} className="text-red-500" />
                            </div>
                            <p className="font-medium text-red-700">
                                {errorMessage || "Analysis failed"}
                            </p>
                            <button
                                onClick={runAnalysis}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {analysisStatus === "success" && (
                        <div className="space-y-6">
                            {/* Match Score */}
                            {match && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div
                                        className={`px-4 py-3 flex items-center justify-between ${getScoreColor(match.matchScore)}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Target size={18} />
                                            <span className="font-semibold">
                                                {getScoreLabel(match.matchScore)}
                                            </span>
                                        </div>
                                        <span className="text-2xl font-bold">
                                            {match.matchScore}%
                                        </span>
                                    </div>

                                    <div className="p-4 space-y-3 text-sm">
                                        <p className="text-slate-700">{match.summary}</p>

                                        {match.matchingSkills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                    <Check size={12} />
                                                    Your Matching Skills
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {match.matchingSkills.map((skill, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {match.missingSkills.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    Skills to Learn
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {match.missingSkills.map((skill, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Job Insights */}
                            {insights && (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-amber-100/50 flex items-center gap-1.5">
                                        <Sparkles size={14} className="text-amber-500" />
                                        <span className="font-semibold text-sm text-amber-800">
                                            Job Insights
                                        </span>
                                    </div>

                                    <div className="p-5 space-y-5 text-sm">
                                        {/* Summary */}
                                        <p className="text-slate-700 leading-relaxed">
                                            {insights.summary}
                                        </p>

                                        {/* Key Info Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Estimated Salary */}
                                            {(insights.estimatedSalary.min || insights.estimatedSalary.max) && (
                                                <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <DollarSign size={14} className="text-green-600" />
                                                        <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">Estimated Salary</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-green-700">
                                                        {insights.estimatedSalary.min && insights.estimatedSalary.max
                                                            ? `$${(insights.estimatedSalary.min / 1000).toFixed(0)}K – $${(insights.estimatedSalary.max / 1000).toFixed(0)}K`
                                                            : insights.estimatedSalary.max
                                                                ? `Up to $${(insights.estimatedSalary.max / 1000).toFixed(0)}K`
                                                                : `From $${(insights.estimatedSalary.min! / 1000).toFixed(0)}K`}
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-0.5">
                                                        {insights.estimatedSalary.currency} · {insights.estimatedSalary.confidence} confidence
                                                    </p>
                                                </div>
                                            )}

                                            {/* Seniority Level */}
                                            {insights.seniorityLevel && insights.seniorityLevel !== "unknown" && (
                                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <TrendingUp size={14} className="text-blue-600" />
                                                        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Seniority Level</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-blue-700 capitalize">{insights.seniorityLevel}</p>
                                                </div>
                                            )}

                                            {/* Work-Life Balance */}
                                            {insights.workLifeBalance && insights.workLifeBalance !== "unknown" && (
                                                <div className={`p-3 rounded-lg border ${insights.workLifeBalance === "excellent" || insights.workLifeBalance === "good"
                                                    ? "bg-green-50 border-green-100"
                                                    : insights.workLifeBalance === "demanding"
                                                        ? "bg-red-50 border-red-100"
                                                        : "bg-amber-50 border-amber-100"
                                                    }`}>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-sm">⚖️</span>
                                                        <span className={`text-xs font-semibold uppercase tracking-wide ${insights.workLifeBalance === "excellent" || insights.workLifeBalance === "good"
                                                            ? "text-green-800"
                                                            : insights.workLifeBalance === "demanding" ? "text-red-800" : "text-amber-800"
                                                            }`}>Work-Life Balance</span>
                                                    </div>
                                                    <p className={`text-lg font-bold capitalize ${insights.workLifeBalance === "excellent" || insights.workLifeBalance === "good"
                                                        ? "text-green-700"
                                                        : insights.workLifeBalance === "demanding" ? "text-red-700" : "text-amber-700"
                                                        }`}>{insights.workLifeBalance}</p>
                                                </div>
                                            )}

                                            {/* Remote Flexibility */}
                                            {insights.remoteFlexibility && insights.remoteFlexibility !== "unknown" && (
                                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-sm">📍</span>
                                                        <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">Work Location</span>
                                                    </div>
                                                    <p className="text-lg font-bold text-indigo-700">
                                                        {insights.remoteFlexibility === "fully_remote"
                                                            ? "Fully Remote"
                                                            : insights.remoteFlexibility === "hybrid"
                                                                ? "Hybrid"
                                                                : insights.remoteFlexibility === "office"
                                                                    ? "On-site"
                                                                    : String(insights.remoteFlexibility)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Culture Signals */}
                                        {insights.cultureSignals.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                    <span>🏢</span> Culture Signals
                                                </h4>
                                                <div className="space-y-2">
                                                    {insights.cultureSignals.map((signal, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${signal.sentiment === "positive"
                                                                ? "bg-green-50/50 border-green-100"
                                                                : signal.sentiment === "warning"
                                                                    ? "bg-amber-50/50 border-amber-100"
                                                                    : "bg-slate-50 border-slate-100"
                                                                }`}
                                                        >
                                                            <span className="mt-0.5 text-xs">
                                                                {signal.sentiment === "positive" ? "✅" : signal.sentiment === "warning" ? "⚠️" : "ℹ️"}
                                                            </span>
                                                            <div>
                                                                <p className={`text-xs font-semibold ${signal.sentiment === "positive" ? "text-green-800"
                                                                    : signal.sentiment === "warning" ? "text-amber-800" : "text-slate-700"
                                                                    }`}>{signal.signal}</p>
                                                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                                                    {signal.interpretation}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Red Flags */}
                                        {insights.redFlags.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                    <AlertTriangle size={12} className="text-red-500" /> Red Flags
                                                </h4>
                                                <div className="space-y-2">
                                                    {insights.redFlags.map((flag, i) => (
                                                        <div key={i} className="flex items-start gap-2.5 p-2.5 bg-red-50 border border-red-100 rounded-lg">
                                                            <span className="text-xs mt-0.5">🚩</span>
                                                            <div>
                                                                <p className="text-xs font-semibold text-red-800">{flag.flag}</p>
                                                                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{flag.reason}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Key Requirements + Nice to Haves */}
                                        {(insights.keyRequirements.length > 0 || insights.niceToHaves.length > 0) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {insights.keyRequirements.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                            <span>📋</span> Must-Have Requirements
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {insights.keyRequirements.map((req, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                                                    <span className="text-slate-400 mt-0.5 flex-shrink-0">•</span>
                                                                    <span>{req}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {insights.niceToHaves.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                            <span>✨</span> Nice to Have
                                                        </h4>
                                                        <ul className="space-y-1">
                                                            {insights.niceToHaves.map((item, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                                                    <span className="text-slate-300 mt-0.5 flex-shrink-0">•</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* No match result prompt */}
                            {!match && !hasProfile && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                    <p className="text-sm text-slate-600">
                                        <Target
                                            size={14}
                                            className="inline mr-1 text-slate-400"
                                        />
                                        Add your resume in{" "}
                                        <span className="font-semibold">My Profile</span> to see your
                                        match score for this role.
                                    </p>
                                </div>
                            )}
                            {!match && hasProfile && (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                                    <p className="text-sm text-amber-700">
                                        <AlertCircle
                                            size={14}
                                            className="inline mr-1 text-amber-500"
                                        />
                                        Match analysis couldn't be completed. Try re-analyzing.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 rounded-b-2xl">
                    <span>Powered by Cloudflare Workers AI</span>
                    {analysisStatus === "success" && (
                        <button
                            onClick={runAnalysis}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Re-analyze
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
