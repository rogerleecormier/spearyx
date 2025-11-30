"use client";

/**
 * RACI Header Bar
 * Top status bar with validation status, save time, and undo action
 */

import { ValidationResult } from "@/types/raci";
import { Button, Title } from "@spearyx/ui-kit";
import { CheckCircle, RotateCcw } from "lucide-react";

interface RaciHeaderBarProps {
  validation: ValidationResult;
  lastSaved?: Date;
  onUndo?: () => void;
  canUndo?: boolean;
}

export default function RaciHeaderBar({
  validation,
  lastSaved = new Date(),
  onUndo,
  canUndo = false,
}: RaciHeaderBarProps) {
  const isValid = validation.isValid;

  return (
    <div className="flex items-center justify-between py-2">
      <Title as="h2" className="text-xl font-bold text-slate-900">
        Define Roles & Tasks
      </Title>

      <div className="flex items-center gap-4">
        {/* Validation Status */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            isValid
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {isValid ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Valid</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Incomplete</span>
            </>
          )}
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Saved {lastSaved.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* Undo Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Undo</span>
          <span className="text-xs text-slate-400 font-normal ml-1">(Ctrl+Z)</span>
        </Button>
      </div>
    </div>
  );
}
