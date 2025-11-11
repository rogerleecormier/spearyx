"use client";

import { useState } from "react";
import { QUICK_PRESETS, getQuickPresetInfo } from "@/lib/raci/templates";
import { RaciChart } from "@/types/raci";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Caption } from "@/components/Typography";

interface QuickPresetsProps {
  roles: RaciChart["roles"];
  tasks: RaciChart["tasks"];
  onApplyPreset: (matrix: RaciChart["matrix"]) => void;
  isLoading?: boolean;
}

export function QuickPresets({
  roles,
  tasks,
  onApplyPreset,
  isLoading = false,
}: QuickPresetsProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const roleIds = roles.map((r) => r.id);
  const taskIds = tasks.map((t) => t.id);

  const presetEntries = Object.entries(QUICK_PRESETS);

  const handleApply = (presetKey: string) => {
    const presetFn = QUICK_PRESETS[presetKey as keyof typeof QUICK_PRESETS];
    if (presetFn && roleIds.length > 0 && taskIds.length > 0) {
      const matrix = presetFn(roleIds, taskIds);
      onApplyPreset(matrix);
      setSelectedPreset(null);
    }
  };

  if (roles.length === 0 || tasks.length === 0) {
    return (
      <Card className="w-full p-6 bg-slate-50 border border-slate-200">
        <div className="text-center space-y-2">
          <Label className="text-base font-semibold text-slate-900">
            Quick Presets
          </Label>
          <Caption className="text-slate-600">
            Add roles and tasks to your chart to use quick presets
          </Caption>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold text-slate-900">
            Quick Presets
          </Label>
          <Caption className="text-slate-600">
            Apply common RACI assignment patterns to your chart
          </Caption>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {presetEntries.map(([key, _]) => {
            const info = getQuickPresetInfo(key);
            return (
              <button
                key={key}
                onClick={() => setSelectedPreset(key)}
                className={`p-3 text-left rounded-lg border-2 transition-all ${
                  selectedPreset === key
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className="font-medium text-sm text-slate-900">
                  {info.name}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {info.description}
                </div>
              </button>
            );
          })}
        </div>

        {selectedPreset && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-sm text-emerald-800">
            <div className="font-medium">
              {getQuickPresetInfo(selectedPreset).name}
            </div>
            <div className="text-xs mt-1 opacity-90">
              {getQuickPresetInfo(selectedPreset).description}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleApply(selectedPreset!)}
            disabled={!selectedPreset || isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? "Applying..." : "Apply Preset"}
          </Button>
          {selectedPreset && (
            <Button
              variant="outline"
              onClick={() => setSelectedPreset(null)}
              className="px-4"
            >
              Clear
            </Button>
          )}
        </div>

        {!selectedPreset && (
          <div className="text-xs text-slate-500 text-center">
            Select a preset pattern to apply it to your chart
          </div>
        )}
      </div>
    </Card>
  );
}
