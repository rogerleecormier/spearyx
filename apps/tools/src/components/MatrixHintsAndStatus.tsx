"use client";

/**
 * Matrix Status Component - Ultra-Minimal Design
 * Single line status display with all critical info
 * Progressive disclosure: hover for details
 */

import { AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { RaciChart } from "@/types/raci";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@spearyx/ui-kit";

interface MatrixHintsAndStatusProps {
  chart: RaciChart;
  validation: {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
  };
}

export function MatrixHintsAndStatus({
  chart,
  validation,
}: MatrixHintsAndStatusProps) {
  // Check if matrix is fully populated
  const totalCells = chart.roles.length * chart.tasks.length;
  const populatedCells = Object.values(chart.matrix).reduce(
    (sum, taskMap) =>
      sum + Object.values(taskMap).filter((v) => v !== null).length,
    0
  );
  const fillPercentage =
    totalCells > 0 ? (populatedCells / totalCells) * 100 : 0;
  const isFullyPopulated = fillPercentage === 100;

  // Get error details for tooltip
  const errorDetails = validation.errors
    .slice(0, 3)
    .map((e) => `${e.field}: ${e.message}`);
  const hasMoreErrors = validation.errors.length > 3;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-50 rounded border border-slate-200">
      {/* Status Badge - Compact */}
      <div className="flex items-center gap-2 min-w-0">
        {validation.isValid ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
              {isFullyPopulated ? "Complete & Valid" : "Valid"}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              • {populatedCells}/{totalCells}
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-error-700 whitespace-nowrap">
              {validation.errors.length} Issue
              {validation.errors.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              • {populatedCells}/{totalCells}
            </span>
          </>
        )}
      </div>

      {/* Visual Progress Bar - Subtle */}
      <div className="hidden xs:flex items-center gap-2 flex-shrink-0">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              fillPercentage === 100
                ? "bg-emerald-500"
                : fillPercentage >= 50
                  ? "bg-amber-500"
                  : "bg-slate-300"
            }`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
        <span className="text-xs text-slate-600 font-medium w-8 text-right">
          {Math.round(fillPercentage)}%
        </span>
      </div>

      {/* Help Button - Discovery of Tips & Shortcuts */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-1.5 hover:bg-slate-200 rounded-md transition-colors"
            aria-label="Matrix help"
          >
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-3">
            {/* Quick Tips Section */}
            <div>
              <p className="font-semibold mb-2 text-foreground">
                Tips & Navigation
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Click cells to cycle RACI values</li>
                <li>• Use presets to auto-fill patterns</li>
                <li>• Drag to reorder roles & tasks</li>
                <li>• Column/row headers stay visible</li>
                <li>• Use scroll bars to navigate</li>
              </ul>
            </div>

            <div className="border-t border-border" />

            {/* Keyboard Shortcuts */}
            <div>
              <p className="font-semibold mb-2 text-foreground">Shortcuts</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono flex-shrink-0">
                    Space
                  </kbd>
                  <span className="text-sm text-muted-foreground">Cycle</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono flex-shrink-0">
                    Tab
                  </kbd>
                  <span className="text-sm text-muted-foreground">Next</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono flex-shrink-0">
                    Esc
                  </kbd>
                  <span className="text-sm text-muted-foreground">Cancel</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[9px] font-mono flex-shrink-0">
                    ↑↓
                  </kbd>
                  <span className="text-sm text-muted-foreground">Move</span>
                </div>
              </div>
            </div>

            {/* Error Details (only if invalid) */}
            {!validation.isValid && validation.errors.length > 0 && (
              <>
                <div className="border-t border-border" />
                <div>
                  <p className="font-semibold mb-2 text-destructive">Issues</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {errorDetails.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {hasMoreErrors && (
                      <li className="text-muted-foreground">
                        • +{validation.errors.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
