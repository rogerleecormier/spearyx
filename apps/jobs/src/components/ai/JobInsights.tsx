import { useState } from "react";
import {
  Sparkles,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { JobInsights } from "../../lib/ai";

interface JobInsightsProps {
  jobId: number;
  jobTitle: string;
  jobDescription: string;
}

type InsightsState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: JobInsights }
  | { status: "error"; message: string };

export default function JobInsightsPanel({
  jobId,
  jobTitle,
  jobDescription,
}: JobInsightsProps) {
  const [state, setState] = useState<InsightsState>({ status: "idle" });
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchInsights = async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          description: jobDescription,
          title: jobTitle 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job");
      }

      const result = await response.json() as { success: boolean; data: JobInsights; error?: string };
      
      if (result.success && result.data) {
        setState({ status: "success", data: result.data });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      setState({ 
        status: "error", 
        message: error instanceof Error ? error.message : "Failed to analyze" 
      });
    }
  };

  // Badge colors for sentiment
  const sentimentColors = {
    positive: "bg-green-100 text-green-700",
    neutral: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-700",
  };

  // Work-life balance colors
  const wlbColors = {
    excellent: "text-green-600",
    good: "text-green-500",
    moderate: "text-amber-500",
    demanding: "text-red-500",
    unknown: "text-slate-400",
  };

  if (state.status === "idle") {
    return (
      <button
        onClick={fetchInsights}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-all"
      >
        <Sparkles size={18} className="text-amber-500" />
        Analyze with AI
      </button>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 py-6 text-slate-500">
        <Loader2 className="animate-spin" size={20} />
        <span>Analyzing job posting...</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 font-medium mb-2">Analysis failed</p>
        <p className="text-sm text-red-500 mb-3">{state.message}</p>
        <button
          onClick={fetchInsights}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const insights = state.data;

  return (
    <div className="bg-amber-50/50 rounded-lg border border-amber-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-amber-100/50 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" />
          <span className="font-medium text-sm text-amber-800">AI Insights</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-amber-600" />
        ) : (
          <ChevronDown size={16} className="text-amber-600" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 text-xs">
          {/* Summary */}
          <p className="text-slate-700 leading-relaxed">{insights.summary}</p>

          {/* Salary + Quick Stats Row */}
          <div className="flex flex-wrap items-center gap-2">
            {(insights.estimatedSalary.min || insights.estimatedSalary.max) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 font-medium">
                <DollarSign size={12} />
                {insights.estimatedSalary.min && insights.estimatedSalary.max
                  ? `$${(insights.estimatedSalary.min / 1000).toFixed(0)}K-${(insights.estimatedSalary.max / 1000).toFixed(0)}K`
                  : insights.estimatedSalary.max
                  ? `≤$${(insights.estimatedSalary.max / 1000).toFixed(0)}K`
                  : `≥$${(insights.estimatedSalary.min! / 1000).toFixed(0)}K`}
              </span>
            )}
            {insights.seniorityLevel && insights.seniorityLevel !== "unknown" && (
              <span className="px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                <span className="text-slate-400">Level:</span> <span className="capitalize">{insights.seniorityLevel}</span>
              </span>
            )}
            {insights.workLifeBalance && insights.workLifeBalance !== "unknown" && (
              <span className={`px-2 py-1 rounded-full ${
                insights.workLifeBalance === "excellent" || insights.workLifeBalance === "good" 
                  ? "bg-green-50 text-green-700" 
                  : insights.workLifeBalance === "demanding" 
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                <span className="opacity-70">WLB:</span> <span className="capitalize">{insights.workLifeBalance}</span>
              </span>
            )}
            {insights.remoteFlexibility && insights.remoteFlexibility !== "unknown" && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                📍 {insights.remoteFlexibility === "fully_remote" ? "Fully Remote" 
                   : insights.remoteFlexibility === "hybrid" ? "Hybrid" 
                   : insights.remoteFlexibility === "on_site" ? "On-site"
                   : insights.remoteFlexibility.replace("_", " ")}
              </span>
            )}
          </div>

          {/* Culture Signals - inline chips */}
          {insights.cultureSignals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {insights.cultureSignals.slice(0, 4).map((signal, i) => (
                <span 
                  key={i} 
                  className={`px-2 py-0.5 rounded-full ${sentimentColors[signal.sentiment]}`}
                  title={signal.interpretation}
                >
                  {signal.signal}
                </span>
              ))}
            </div>
          )}

          {/* Red Flags - condensed */}
          {insights.redFlags.length > 0 && (
            <div className="flex items-start gap-1.5 p-2 bg-red-50 rounded border border-red-100">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-red-700">
                {insights.redFlags.map((flag, i) => (
                  <span key={i}>
                    {flag.flag}{i < insights.redFlags.length - 1 ? " • " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Requirements - simpler */}
          {insights.keyRequirements.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {insights.keyRequirements.slice(0, 6).map((req, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                  {req}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
