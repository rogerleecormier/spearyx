"use client";

/**
 * Quick Presets Component
 * Provides common RACI assignment patterns that can be applied to existing charts
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { QUICK_PRESETS, getQuickPresetInfo } from "@/lib/raci/templates";
import { RaciChart, RaciRole, RaciTask } from "@/types/raci";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label, Caption } from "@/components/Typography";

interface QuickPresetsProps {
  roles: RaciRole[];
  tasks: RaciTask[];
  onApplyPreset: (matrix: RaciChart["matrix"]) => void;
  isLoading?: boolean;
}

export function QuickPresets({
  roles,
  tasks,
  onApplyPreset,
  isLoading = false,
}: QuickPresetsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previewMatrix, setPreviewMatrix] = useState<
    RaciChart["matrix"] | null
  >(null);

  const presetKeys = Object.keys(QUICK_PRESETS) as Array<
    keyof typeof QUICK_PRESETS
  >;

  const isDisabled = roles.length === 0 || tasks.length === 0;

  const handlePresetSelect = (presetKey: string) => {
    if (isDisabled) return;

    setSelectedPreset(presetKey);

    // Generate preview matrix
    const preset = QUICK_PRESETS[presetKey as keyof typeof QUICK_PRESETS];
    const roleIds = roles.map((r) => r.id);
    const taskIds = tasks.map((t) => t.id);
    const matrix = preset(roleIds, taskIds);
    setPreviewMatrix(matrix);
  };

  const handleApply = () => {
    if (selectedPreset && previewMatrix) {
      onApplyPreset(previewMatrix);
      setIsOpen(false);
      setSelectedPreset(null);
      setPreviewMatrix(null);
    }
  };

  const handleClear = () => {
    setSelectedPreset(null);
    setPreviewMatrix(null);
  };

  const getMatrixStats = (matrix: RaciChart["matrix"]) => {
    const stats = { R: 0, A: 0, C: 0, I: 0 };
    Object.values(matrix).forEach((roleMap) => {
      Object.values(roleMap).forEach((value) => {
        if (value && value in stats) {
          stats[value as keyof typeof stats]++;
        }
      });
    });
    return stats;
  };

  const selectedPresetInfo = selectedPreset
    ? getQuickPresetInfo(selectedPreset)
    : null;

  return (
    <Card className="w-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <Label className="text-base font-semibold text-slate-900">
          Quick Presets
        </Label>
        <Caption className="text-slate-600">
          {isDisabled
            ? "Add roles and tasks to use preset patterns"
            : "Apply common assignment patterns"}
        </Caption>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isDisabled}
            className={`w-full p-3 flex items-center justify-between bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors text-left ${
              isDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-sm text-slate-700">
              {selectedPresetInfo
                ? selectedPresetInfo.name
                : "Select a preset..."}
            </span>
            <ChevronDown
              size={20}
              className={`text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown List */}
          {isOpen && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              {presetKeys.map((presetKey, index) => {
                const info = getQuickPresetInfo(presetKey);
                const isSelected = selectedPreset === presetKey;

                return (
                  <div key={presetKey}>
                    <button
                      onClick={() => handlePresetSelect(presetKey)}
                      className={`w-full p-3 text-left hover:bg-slate-50 transition-colors border-l-4 ${
                        isSelected
                          ? "border-red-500 bg-red-50"
                          : "border-transparent hover:border-red-500"
                      }`}
                    >
                      <div className="font-medium text-sm text-slate-900">
                        {info.name}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {info.description}
                      </div>
                    </button>
                    {index < presetKeys.length - 1 && (
                      <div className="border-t border-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Preview */}
          {selectedPreset && previewMatrix && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600 uppercase">
                  Assignment Distribution
                </div>
                <div className="flex gap-4 mt-2">
                  {Object.entries(getMatrixStats(previewMatrix)).map(
                    ([key, count]) => (
                      <div key={key} className="flex items-center gap-1">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            key === "R"
                              ? "bg-green-100 text-green-700"
                              : key === "A"
                                ? "bg-red-100 text-red-700"
                                : key === "C"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {key}
                        </span>
                        <span className="text-xs text-slate-600">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">
                  Roles: {roles.length} | Tasks: {tasks.length} | Cells:{" "}
                  {roles.length * tasks.length}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? "Applying..." : "Apply Preset"}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
