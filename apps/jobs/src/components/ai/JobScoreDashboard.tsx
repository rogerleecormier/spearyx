import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Target,
    TrendingUp,
    BarChart3,
    Loader2,
    ChevronDown,
    ChevronUp,
    X,
    ArrowUpDown,
    ExternalLink,
    Eye,
    RefreshCw,
} from "lucide-react";
import { loadUserProfile } from "./SkillsModal";
import type { JobWithCategory } from "../../lib/search-utils";
import type { JobScoreResult } from "../../routes/api/ai/score-all";

// --- Cache ---
const CACHE_KEY = "spearyx_score_dashboard_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface ScoreCache {
    timestamp: number;
    resumeHash: string;
    scores: JobScoreResult[];
}

function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString(36);
}

function loadCache(resumeHash: string): JobScoreResult[] | null {
    if (typeof window === "undefined") return null;
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached) as ScoreCache;
        if (Date.now() - data.timestamp > CACHE_DURATION_MS) return null;
        if (data.resumeHash !== resumeHash) return null;
        return data.scores;
    } catch {
        return null;
    }
}

function saveCache(resumeHash: string, scores: JobScoreResult[]) {
    if (typeof window === "undefined") return;
    const cache: ScoreCache = {
        timestamp: Date.now(),
        resumeHash,
        scores,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// --- Score color helpers ---
function getScoreColor(score: number): string {
    if (score >= 80) return "text-emerald-700 bg-emerald-50";
    if (score >= 65) return "text-green-700 bg-green-50";
    if (score >= 50) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
}

function getBarColor(score: number): string {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-400";
}

function getMasterScoreGradient(score: number): string {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 65) return "from-green-500 to-emerald-600";
    if (score >= 50) return "from-amber-400 to-amber-600";
    return "from-red-400 to-red-500";
}

// --- Types ---
type SortField = "masterScore" | "atsScore" | "careerScore" | "outlookScore";
type FilterMode = "all" | "unicorns" | "top";

interface JobScoreDashboardProps {
    jobs: JobWithCategory[];
    onJobClick?: (job: JobWithCategory) => void;
    onClose: () => void;
}

// --- Score Bar Component ---
function ScoreBar({ score, label }: { score: number; label: string }) {
    return (
        <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] text-slate-500 w-8 text-right shrink-0 font-medium">
                {label}
            </span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${getBarColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={`text-xs font-bold w-8 text-right shrink-0 ${score >= 65 ? "text-slate-700" : "text-slate-500"}`}>
                {score}
            </span>
        </div>
    );
}

// --- Main Dashboard ---
export default function JobScoreDashboard({
    jobs,
    onJobClick,
    onClose,
}: JobScoreDashboardProps) {
    const [scores, setScores] = useState<JobScoreResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>("masterScore");
    const [sortAsc, setSortAsc] = useState(false);
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

    // Build a lookup: jobId → JobWithCategory
    const jobMap = useMemo(() => {
        const map = new Map<number, JobWithCategory>();
        jobs.forEach((j: JobWithCategory) => {
            if (j.id) map.set(j.id, j);
        });
        return map;
    }, [jobs]);

    // Auto-score on mount
    useEffect(() => {
        scoreAllJobs(false);
    }, []);

    const scoreAllJobs = useCallback(
        async (forceRefresh = false) => {
            const profile = loadUserProfile();
            if (!profile || (!profile.resume && profile.skills.length === 0)) {
                setError("Add your resume in 'My Skills' first.");
                return;
            }

            const resumeHash = hashString(
                (profile.resume || "") + profile.skills.join(",")
            );

            // Check cache unless forcing refresh
            if (!forceRefresh) {
                const cached = loadCache(resumeHash);
                if (cached && cached.length > 0) {
                    setScores(cached);
                    return;
                }
            }

            setLoading(true);
            setError(null);
            setProgress({ current: 0, total: jobs.length });

            try {
                // Prepare jobs payload (trim descriptions for payload size)
                const jobsPayload = jobs.map((j: JobWithCategory) => ({
                    id: j.id,
                    title: j.title,
                    description: (j.description || "").substring(0, 2000),
                }));

                const response = await fetch("/api/ai/score-all", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resume: profile.resume,
                        skills: profile.skills,
                        jobs: jobsPayload,
                    }),
                });

                if (!response.ok) {
                    const errData = (await response.json()) as { error?: string };
                    throw new Error(errData.error || `Request failed (${response.status})`);
                }

                const result = (await response.json()) as {
                    success: boolean;
                    data?: { scores: JobScoreResult[]; totalScored: number };
                    error?: string;
                };

                if (result.success && result.data) {
                    setScores(result.data.scores);
                    saveCache(resumeHash, result.data.scores);
                    setProgress({ current: result.data.totalScored, total: jobs.length });
                } else {
                    throw new Error(result.error || "Unknown error");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Scoring failed");
            } finally {
                setLoading(false);
            }
        },
        [jobs]
    );

    // Sort and filter
    const sortedScores = useMemo(() => {
        let filtered = [...scores];

        // Filter
        if (filterMode === "unicorns") {
            filtered = filtered.filter((s: JobScoreResult) => s.isUnicorn);
        } else if (filterMode === "top") {
            filtered = filtered.filter((s: JobScoreResult) => s.masterScore >= 75);
        }

        // Sort
        filtered.sort((a, b) => {
            const diff = sortAsc
                ? a[sortField] - b[sortField]
                : b[sortField] - a[sortField];
            return diff;
        });

        return filtered;
    }, [scores, sortField, sortAsc, filterMode]);

    const unicornCount = scores.filter((s: JobScoreResult) => s.isUnicorn).length;
    const topCount = scores.filter((s: JobScoreResult) => s.masterScore >= 75).length;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const SortButton = ({
        field,
        label,
        className = "",
    }: {
        field: SortField;
        label: string;
        className?: string;
    }) => (
        <button
            onClick={() => handleSort(field)}
            className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors ${sortField === field
                ? "text-amber-700"
                : "text-slate-500 hover:text-slate-700"
                } ${className}`}
        >
            {label}
            {sortField === field && (
                <span className="text-amber-500">
                    {sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </span>
            )}
            {sortField !== field && (
                <ArrowUpDown size={10} className="text-slate-400" />
            )}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <BarChart3 size={22} className="text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Job Score Dashboard</h2>
                                <p className="text-sm text-slate-400">
                                    {scores.length > 0
                                        ? `${scores.length} jobs scored · ${unicornCount} unicorns · ${topCount} top matches`
                                        : "Score all visible jobs against your resume"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {scores.length > 0 && (
                                <button
                                    onClick={() => scoreAllJobs(true)}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                                    Re-score
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Score weights legend */}
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                        <span>Master Score = </span>
                        <span className="text-amber-400 font-medium">40% ATS</span>
                        <span>+</span>
                        <span className="text-blue-400 font-medium">30% Career</span>
                        <span>+</span>
                        <span className="text-purple-400 font-medium">30% Outlook</span>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="px-6 py-12 flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                            <Loader2 size={40} className="animate-spin text-amber-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-slate-800">
                                Scoring {progress.total} jobs...
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                Using AI to evaluate ATS fit, career growth, and market outlook
                            </p>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 animate-pulse"
                                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div className="px-6 py-8 flex flex-col items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-full">
                            <X size={24} className="text-red-500" />
                        </div>
                        <p className="font-medium text-red-700">{error}</p>
                        <button
                            onClick={() => scoreAllJobs(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Results */}
                {!loading && !error && scores.length > 0 && (
                    <>
                        {/* Filter tabs */}
                        <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-slate-200">
                            <button
                                onClick={() => setFilterMode("all")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterMode === "all"
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                All ({scores.length})
                            </button>
                            <button
                                onClick={() => setFilterMode("top")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterMode === "top"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                            >
                                🏆 Top Matches ({topCount})
                            </button>
                            <button
                                onClick={() => setFilterMode("unicorns")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterMode === "unicorns"
                                    ? "bg-amber-500 text-white"
                                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    }`}
                            >
                                🦄 Unicorns ({unicornCount})
                            </button>
                        </div>

                        {/* Table header */}
                        <div className="hidden md:grid grid-cols-[48px_1fr_100px_100px_100px_90px] gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 items-center">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                #
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                Role
                            </span>
                            <SortButton field="atsScore" label="ATS" />
                            <SortButton field="careerScore" label="Career" />
                            <SortButton field="outlookScore" label="Outlook" />
                            <SortButton field="masterScore" label="Score" />
                        </div>

                        {/* Job rows */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {sortedScores.length === 0 && (
                                <div className="px-6 py-12 text-center text-slate-500">
                                    <p className="font-medium">No jobs match this filter</p>
                                    <p className="text-sm mt-1">Try a different filter above</p>
                                </div>
                            )}

                            {sortedScores.map((score: JobScoreResult, index: number) => {
                                const job = jobMap.get(score.jobId);
                                if (!job) return null;
                                const isExpanded = expandedJobId === score.jobId;

                                return (
                                    <div
                                        key={score.jobId}
                                        className={`border-b border-slate-100 transition-colors ${score.isUnicorn
                                            ? "bg-gradient-to-r from-amber-50/50 to-orange-50/30"
                                            : "hover:bg-slate-50/80"
                                            }`}
                                    >
                                        {/* Main row */}
                                        <div
                                            className="grid grid-cols-1 md:grid-cols-[48px_1fr_100px_100px_100px_90px] gap-3 px-6 py-4 items-center cursor-pointer"
                                            onClick={() =>
                                                setExpandedJobId(isExpanded ? null : score.jobId)
                                            }
                                        >
                                            {/* Rank */}
                                            <span className="hidden md:block text-sm font-bold text-slate-400">
                                                {index + 1}
                                            </span>

                                            {/* Title + company */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <p className="font-semibold text-slate-900 text-sm truncate">
                                                        {job.title}
                                                    </p>
                                                    {score.isUnicorn && (
                                                        <span className="shrink-0 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                                                            🦄
                                                        </span>
                                                    )}
                                                </div>
                                                {job.company && (
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                                        {job.company}
                                                        {job.payRange && (
                                                            <span className="ml-2 text-slate-400">
                                                                · {job.payRange}
                                                            </span>
                                                        )}
                                                    </p>
                                                )}
                                                {/* Mobile scores */}
                                                <div className="md:hidden mt-2 space-y-1">
                                                    <ScoreBar score={score.atsScore} label="ATS" />
                                                    <ScoreBar score={score.careerScore} label="CRR" />
                                                    <ScoreBar score={score.outlookScore} label="MKT" />
                                                </div>
                                            </div>

                                            {/* Desktop score bars */}
                                            <div className="hidden md:block">
                                                <ScoreBar score={score.atsScore} label="" />
                                            </div>
                                            <div className="hidden md:block">
                                                <ScoreBar score={score.careerScore} label="" />
                                            </div>
                                            <div className="hidden md:block">
                                                <ScoreBar score={score.outlookScore} label="" />
                                            </div>

                                            {/* Master score */}
                                            <div className="hidden md:flex items-center justify-end">
                                                <span
                                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg text-white bg-gradient-to-br ${getMasterScoreGradient(
                                                        score.masterScore
                                                    )} shadow-sm`}
                                                >
                                                    {score.masterScore}
                                                </span>
                                            </div>

                                            {/* Mobile master score */}
                                            <div className="md:hidden flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500">
                                                    Master Score
                                                </span>
                                                <span
                                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-base text-white bg-gradient-to-br ${getMasterScoreGradient(
                                                        score.masterScore
                                                    )}`}
                                                >
                                                    {score.masterScore}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="px-6 pb-4 pt-0">
                                                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                                    {/* Reasons */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="p-3 bg-slate-50 rounded-lg">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <Target size={14} className="text-slate-600" />
                                                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                                                    ATS Fit
                                                                </span>
                                                                <span
                                                                    className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(
                                                                        score.atsScore
                                                                    )}`}
                                                                >
                                                                    {score.atsScore}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                {score.atsReason}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-slate-50 rounded-lg">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <TrendingUp
                                                                    size={14}
                                                                    className="text-blue-600"
                                                                />
                                                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                                                    Career Growth
                                                                </span>
                                                                <span
                                                                    className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(
                                                                        score.careerScore
                                                                    )}`}
                                                                >
                                                                    {score.careerScore}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                {score.careerReason}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-slate-50 rounded-lg">
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <BarChart3
                                                                    size={14}
                                                                    className="text-purple-600"
                                                                />
                                                                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                                                    Market Outlook
                                                                </span>
                                                                <span
                                                                    className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded ${getScoreColor(
                                                                        score.outlookScore
                                                                    )}`}
                                                                >
                                                                    {score.outlookScore}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                {score.outlookReason}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Unicorn reason */}
                                                    {score.isUnicorn && score.unicornReason && (
                                                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                            <span className="text-lg shrink-0">🦄</span>
                                                            <div>
                                                                <p className="text-xs font-semibold text-amber-800">
                                                                    Unicorn Discovery
                                                                </p>
                                                                <p className="text-xs text-amber-700 mt-0.5">
                                                                    {score.unicornReason}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 pt-1">
                                                        {onJobClick && (
                                                            <button
                                                                onClick={(e: React.MouseEvent) => {
                                                                    e.stopPropagation();
                                                                    onJobClick(job);
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                                                            >
                                                                <Eye size={14} />
                                                                Quick View
                                                            </button>
                                                        )}
                                                        <a
                                                            href={job.sourceUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                                                        >
                                                            <ExternalLink size={14} />
                                                            View Job
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Powered by Cloudflare Workers AI · Qwen3-30B</span>
                    <span>Scores cached for 24 hours</span>
                </div>
            </div>
        </div>
    );
}
