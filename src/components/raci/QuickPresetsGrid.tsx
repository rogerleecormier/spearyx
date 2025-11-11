"use client";

/**
 * Quick Presets Grid Component
 * Displays RACI pattern presets as horizontal grid buttons
 * Allows applying preset patterns to the RACI matrix after roles and tasks exist
 */

import { useCallback } from "react";
import { Info } from "lucide-react";
import { QUICK_PRESETS, getQuickPresetInfo } from "@/lib/raci/templates";
import { RaciChart, RaciRole, RaciTask } from "@/types/raci";
import { Label } from "@/components/Typography";

interface QuickPresetsGridProps {
  roles: RaciRole[];
  tasks: RaciTask[];
  onApplyPreset: (matrix: RaciChart["matrix"]) => void;
}

export function QuickPresetsGrid({
  roles,
  tasks,
  onApplyPreset,
}: QuickPresetsGridProps) {
  const presetKeys = Object.keys(QUICK_PRESETS) as Array<
    keyof typeof QUICK_PRESETS
  >;

  const isDisabled = roles.length === 0 || tasks.length === 0;

  const handlePresetSelect = useCallback(
    (presetKey: string) => {
      if (isDisabled) return;

      // Get the preset function and apply it
      const preset = QUICK_PRESETS[presetKey as keyof typeof QUICK_PRESETS];
      const roleIds = roles.map((r) => r.id);
      const taskIds = tasks.map((t) => t.id);
      const matrix = preset(roleIds, taskIds);

      // Apply the preset matrix
      onApplyPreset(matrix);
    },
    [roles, tasks, onApplyPreset, isDisabled]
  );

  if (isDisabled) {
    return (
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-600 uppercase">
          Pattern Presets
        </Label>
        <p className="text-xs text-slate-500">
          Add roles and tasks to use preset patterns
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs font-semibold text-slate-600 uppercase">
          Pattern Presets
        </Label>
        <div className="group relative">
          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
            Pre-fill your matrix with common RACI patterns
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
          </div>
        </div>
      </div>

      {/* Presets Grid - Compact horizontal layout */}
      <div className="grid grid-cols-4 gap-2">
        {presetKeys.map((presetKey) => {
          const info = getQuickPresetInfo(presetKey);

          return (
            <button
              key={presetKey}
              onClick={() => handlePresetSelect(presetKey)}
              className="group relative px-2 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 rounded transition-colors flex items-center justify-center"
              title={info.description}
            >
              {/* Button content with icon and name - compact */}
              <div className="flex items-center gap-1 text-center min-w-0">
                <span className="text-emerald-600 flex-shrink-0">🎯</span>
                <span className="text-slate-900 truncate">{info.name}</span>
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                {info.description}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-slate-900" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
