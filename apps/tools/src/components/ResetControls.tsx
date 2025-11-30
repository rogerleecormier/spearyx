"use client";

/**
 * Reset Controls
 * Reset chart with confirmation dialog
 */

import { useEffect, useState } from "react";
import { Button } from "@spearyx/ui-kit";
import { RotateCcw, AlertTriangle } from "lucide-react";

interface ResetControlsProps {
  onReset: () => void;
  onResetTheme?: () => void;
}

export default function ResetControls({
  onReset,
  onResetTheme,
}: ResetControlsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!showConfirm) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowConfirm(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showConfirm]);

  const handleConfirmReset = () => {
    onReset();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={() => setShowConfirm(true)}
          className="w-full gap-2 transition-all duration-200 hover:shadow-md text-white font-semibold"
          style={{
            backgroundColor: "#dc2626",
            borderColor: "#991b1b",
            borderWidth: "2px",
          }}
          aria-label="Reset chart contents"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Chart
        </Button>
        {onResetTheme && (
          <Button
            onClick={onResetTheme}
            className="w-full gap-2 transition-all duration-200 hover:shadow-md text-white font-semibold"
            style={{
              backgroundColor: "#dc2626",
              borderColor: "#991b1b",
              borderWidth: "2px",
            }}
            aria-label="Reset theme to default"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Theme
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reset-confirm-title"
          aria-describedby="reset-confirm-description"
        >
          <div
            className="bg-white border-2 border-error-600 rounded-lg max-w-sm w-full space-y-4 p-6 shadow-lg"
            style={{ backgroundColor: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
              <h3
                id="reset-confirm-title"
                className="font-semibold text-slate-900"
              >
                Reset Chart?
              </h3>
            </div>

            {/* Description */}
            <div
              id="reset-confirm-description"
              className="text-sm text-slate-700 space-y-2"
            >
              <p>This will delete all current chart data including:</p>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                <li>All roles and tasks</li>
                <li>All matrix assignments</li>
                <li>All custom settings</li>
              </ul>
              <p className="font-semibold text-error-700">
                This cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                aria-label="Cancel reset"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmReset}
                variant="destructive"
                size="sm"
                className="bg-error-600 hover:bg-error-700 text-white"
                aria-label="Confirm reset"
              >
                Reset
              </Button>
            </div>

            {/* Close Hint */}
            <div className="text-xs text-slate-500 text-center">
              Press Esc to cancel
            </div>
          </div>
        </div>
      )}
    </>
  );
}
