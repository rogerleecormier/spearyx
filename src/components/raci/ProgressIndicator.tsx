import React from "react";
import { Body, Caption } from "@/components/Typography";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  status: "idle" | "processing" | "complete" | "error";
  message?: string;
  format?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  status,
  message,
  format,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const getStatusColor = (): string => {
    switch (status) {
      case "processing":
        return "#059669"; // emerald-600
      case "complete":
        return "#059669"; // emerald-600
      case "error":
        return "#dc2626"; // red-600
      default:
        return "#e2e8f0"; // slate-200
    }
  };

  const getStatusIcon = (): string => {
    switch (status) {
      case "processing":
        return "⏳";
      case "complete":
        return "✓";
      case "error":
        return "✕";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            {message && (
              <Body className="font-semibold text-slate-900">{message}</Body>
            )}
            {format && (
              <Caption className="text-slate-600">
                Exporting as {format.toUpperCase()}
              </Caption>
            )}
          </div>
        </div>
        <span className="text-sm font-medium text-slate-600">
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: getStatusColor(),
          }}
        />
      </div>

      {/* Status text */}
      {status === "processing" && (
        <Caption className="text-slate-600 italic">
          Processing {current} of {total}...
        </Caption>
      )}

      {status === "complete" && (
        <Caption className="text-emerald-600 font-medium">
          ✓ Export complete
        </Caption>
      )}

      {status === "error" && (
        <Caption className="text-red-600 font-medium">
          ✕ Export failed. Please try again.
        </Caption>
      )}
    </div>
  );
};

export default ProgressIndicator;
