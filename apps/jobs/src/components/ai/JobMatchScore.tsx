import { useState } from "react";
import { Target, Check, AlertCircle, Loader2 } from "lucide-react";
import { loadUserProfile } from "./SkillsModal";

interface MatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
}

interface JobMatchScoreProps {
  jobTitle: string;
  jobDescription: string;
  onNoProfile?: () => void; // Called when user has no profile set up
  compact?: boolean; // For card badge vs full display
}

export default function JobMatchScore({
  jobTitle,
  jobDescription,
  onNoProfile,
  compact = false,
}: JobMatchScoreProps) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: MatchResult }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const fetchMatchScore = async () => {
    const profile = loadUserProfile();
    
    if (!profile || (!profile.resume && profile.skills.length === 0)) {
      onNoProfile?.();
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: profile.resume,
          skills: profile.skills,
          jobTitle,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze match");
      }

      const result = await response.json() as { success: boolean; data: MatchResult; error?: string };

      if (result.success && result.data) {
        setState({ status: "success", data: result.data });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to analyze",
      });
    }
  };

  // Color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Great Match";
    if (score >= 50) return "Good Match";
    return "Partial Match";
  };

  // Compact badge for job cards
  if (compact) {
    if (state.status === "success") {
      return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getScoreColor(state.data.matchScore)}`}>
          <Target size={12} />
          {state.data.matchScore}%
        </div>
      );
    }
    return null;
  }

  // Idle state - show button
  if (state.status === "idle") {
    return (
      <button
        onClick={fetchMatchScore}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-all text-sm"
      >
        <Target size={16} />
        Check My Match
      </button>
    );
  }

  // Loading state
  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 py-4 text-slate-500">
        <Loader2 className="animate-spin" size={18} />
        <span className="text-sm">Analyzing your fit...</span>
      </div>
    );
  }

  // Error state
  if (state.status === "error") {
    return (
      <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-sm">
        <p className="text-red-600 font-medium">Match analysis failed</p>
        <p className="text-red-500 text-xs">{state.message}</p>
        <button
          onClick={fetchMatchScore}
          className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  // Success state - full display
  const { data } = state;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      {/* Header with score */}
      <div className={`px-4 py-3 flex items-center justify-between ${getScoreColor(data.matchScore)}`}>
        <div className="flex items-center gap-2">
          <Target size={18} />
          <span className="font-semibold">{getScoreLabel(data.matchScore)}</span>
        </div>
        <span className="text-2xl font-bold">{data.matchScore}%</span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 text-sm">
        {/* Summary */}
        <p className="text-slate-700">{data.summary}</p>

        {/* Matching Skills */}
        {data.matchingSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Check size={12} />
              Your Matching Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.matchingSkills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {data.missingSkills.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <AlertCircle size={12} />
              Skills to Learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.missingSkills.map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
