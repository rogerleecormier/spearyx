"use client";

/**
 * Configuration Panel Component
 * Unified interface for template selection and quick presets
 * Combines template loading and preset patterns in a single streamlined card
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  RaciTemplate,
  getTemplates,
  QUICK_PRESETS,
  getQuickPresetInfo,
} from "@/lib/raci/templates";
import { RaciChart, RaciRole, RaciTask } from "@/types/raci";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label, Caption } from "@/components/Typography";

interface ConfigurationPanelProps {
  roles: RaciRole[];
  tasks: RaciTask[];
  onLoadTemplate: (template: RaciTemplate) => void;
  onApplyPreset: (matrix: RaciChart["matrix"]) => void;
}

export function ConfigurationPanel({
  roles,
  tasks,
  onLoadTemplate,
  onApplyPreset,
}: ConfigurationPanelProps) {
  const templates = getTemplates();
  const presetKeys = Object.keys(QUICK_PRESETS) as Array<
    keyof typeof QUICK_PRESETS
  >;

  const [templateOpen, setTemplateOpen] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RaciTemplate | null>(
    null
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [previewMatrix, setPreviewMatrix] = useState<
    RaciChart["matrix"] | null
  >(null);

  const isPresetsDisabled = roles.length === 0 || tasks.length === 0;

  const handleLoadTemplate = (template: RaciTemplate) => {
    onLoadTemplate(template);
    setTemplateOpen(false);
    setSelectedTemplate(template);
  };

  const handlePresetSelect = (presetKey: string) => {
    if (isPresetsDisabled) return;

    setSelectedPreset(presetKey);

    // Generate and immediately apply the preset matrix
    const preset = QUICK_PRESETS[presetKey as keyof typeof QUICK_PRESETS];
    const roleIds = roles.map((r) => r.id);
    const taskIds = tasks.map((t) => t.id);
    const matrix = preset(roleIds, taskIds);

    // Automatically apply the preset
    onApplyPreset(matrix);
    setPreviewMatrix(matrix);
    setPresetOpen(false);
  };

  const selectedPresetInfo = selectedPreset
    ? getQuickPresetInfo(selectedPreset)
    : null;

  return (
    <Card className="w-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <Label className="text-base font-semibold text-slate-900">
          Configuration
        </Label>
        <Caption className="text-slate-600">
          Set up your chart with templates or preset patterns
        </Caption>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Templates Section */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">Load Template</Label>
            <div className="relative">
              <button
                onClick={() => setTemplateOpen(!templateOpen)}
                className="w-full p-3 flex items-center justify-between bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors text-left"
              >
                <span className="text-sm text-slate-700">
                  {selectedTemplate
                    ? selectedTemplate.name
                    : "Select a template..."}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform flex-shrink-0 ${
                    templateOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Templates Dropdown */}
              {templateOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-lg z-10">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleLoadTemplate(template)}
                      className="w-full p-3 text-left hover:bg-slate-50 transition-colors border-l-4 border-transparent hover:border-red-500 focus:outline-none focus:bg-slate-50"
                    >
                      <div className="font-medium text-sm text-slate-900">
                        {template.name}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {template.roles.length} roles × {template.tasks.length}{" "}
                        tasks
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Template Details */}
            {selectedTemplate && (
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase">
                    Description
                  </div>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase">
                    Roles
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase">
                    Tasks
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    {selectedTemplate.tasks.length} tasks included
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-slate-200" />

          {/* Quick Presets Section */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-700">Quick Presets</Label>
            <div className="relative">
              <button
                onClick={() => setPresetOpen(!presetOpen)}
                disabled={isPresetsDisabled}
                className={`w-full p-3 flex items-center justify-between bg-white border border-slate-200 rounded-lg transition-colors text-left ${
                  isPresetsDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-slate-300"
                }`}
              >
                <span className="text-sm text-slate-700">
                  {selectedPresetInfo
                    ? selectedPresetInfo.name
                    : "Select a preset..."}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition-transform flex-shrink-0 ${
                    presetOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Presets Dropdown */}
              {presetOpen && !isPresetsDisabled && (
                <div className="absolute top-full left-0 right-0 mt-1 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-lg z-10">
                  {presetKeys.map((presetKey) => {
                    const info = getQuickPresetInfo(presetKey);

                    return (
                      <button
                        key={presetKey}
                        onClick={() => handlePresetSelect(presetKey)}
                        className="w-full p-3 text-left hover:bg-slate-50 transition-colors border-l-4 border-transparent hover:border-red-500 focus:outline-none focus:bg-slate-50"
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
              )}
            </div>

            {isPresetsDisabled && (
              <p className="text-xs text-slate-600">
                Add roles and tasks to use preset patterns
              </p>
            )}

            {/* Selected Preset Details */}
            {selectedPresetInfo && previewMatrix && (
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <div>
                  <div className="text-xs font-semibold text-slate-600 uppercase">
                    Description
                  </div>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedPresetInfo.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries({
                    R: "Responsible",
                    A: "Accountable",
                    C: "Consulted",
                    I: "Informed",
                  }).map(([key, label]) => {
                    const count = Object.values(previewMatrix).reduce(
                      (sum, roleMap) =>
                        sum +
                        Object.values(roleMap).filter((v) => v === key).length,
                      0
                    );
                    if (count === 0) return null;
                    return (
                      <div
                        key={key}
                        className="px-2 py-1 bg-white border border-slate-200 rounded"
                      >
                        <span className="font-semibold text-slate-900">
                          {count}
                        </span>{" "}
                        <span className="text-slate-600">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
