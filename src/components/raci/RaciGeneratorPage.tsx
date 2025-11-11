"use client";

/**
 * Main RACI Generator Page
 * Integrates all RACI editor components with state management
 */

import { useEffect, useState, useCallback } from "react";
import { useRaciState } from "@/lib/raci/hooks";
import { useValidation } from "@/lib/raci/hooks";
import { useAutoSave } from "@/lib/raci/hooks";
import { loadChartFromStorage } from "@/lib/raci/hooks";
import { loadTemplate as loadTemplateUtil } from "@/lib/raci/templates";
import RaciHeaderBar from "./RaciHeaderBar";
import RolesEditor from "./RolesEditor";
import TasksEditor from "./TasksEditor";
import ThemeSelector from "./ThemeSelector";
import ExportButtons from "./ExportButtons";
import ResetControls from "./ResetControls";
import RaciMatrixEditor from "./RaciMatrixEditor";
import ErrorModal from "./ErrorModal";
import { TemplateSelector, QuickPresets, PresetManager } from ".";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Hero,
  Headline,
  Body,
  Label,
  Overline,
  Caption,
} from "@/components/Typography";
import { RaciChart } from "@/types/raci";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default function RaciGeneratorPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  // Initialize state
  const {
    state: chart,
    updateTitle,
    updateLogo,
    updateDescription,
    updateMatrix,
    updateTheme,
    loadTemplate,
    loadPreset,
    reset,
    setState: setChart,
  } = useRaciState();

  // Validation
  const validation = useValidation(chart);

  // Auto-save
  const { isSaving, lastSaved } = useAutoSave(chart);

  // Load from storage on mount
  useEffect(() => {
    const initializeChart = async () => {
      try {
        const storedChart = await loadChartFromStorage();
        if (storedChart) {
          setChart(storedChart);
        }
      } catch (err) {
        console.error("Failed to load chart:", err);
        // Continue with default chart
      } finally {
        setIsInitialized(true);
      }
    };

    initializeChart();
  }, [setChart]);

  // Close error modal on Esc
  useEffect(() => {
    if (!showErrorModal) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowErrorModal(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showErrorModal]);

  // Handlers
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleResetTheme = useCallback(() => {
    updateTheme("default");
  }, [updateTheme]);

  const handleLoadTemplate = useCallback(
    (template: Parameters<typeof loadTemplateUtil>[0]) => {
      setIsLoadingTemplate(true);
      try {
        const newChart = loadTemplateUtil(template);
        loadTemplate(
          newChart.roles,
          newChart.tasks,
          newChart.matrix,
          newChart.title,
          newChart.description
        );
      } finally {
        setIsLoadingTemplate(false);
      }
    },
    [loadTemplate]
  );

  const handleApplyPreset = useCallback(
    (matrix: RaciChart["matrix"]) => {
      loadPreset(matrix);
    },
    [loadPreset]
  );

  const handleLoadPreset = useCallback(
    (matrix: RaciChart["matrix"]) => {
      loadPreset(matrix);
    },
    [loadPreset]
  );

  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <Body size="sm" className="mt-4 text-slate-600">
            Loading chart...
          </Body>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <Overline className="text-red-600 mb-2">Project Tools</Overline>
              <Hero className="text-black mb-2">RACI Matrix Generator</Hero>
              <Body size="sm" className="text-slate-600">
                Define roles and responsibilities with crystal clarity
              </Body>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {!validation.isValid && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">
                    {validation.errors.length} issue
                    {validation.errors.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {validation.isValid && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Valid</span>
                </div>
              )}
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2 text-slate-600">
                {isSaving && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span>Saving...</span>
                  </>
                )}
                {!isSaving && lastSaved && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>
                      Saved {new Date(lastSaved).toLocaleTimeString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Configuration Tools */}
          <div className="lg:col-span-3">
            <div className="space-y-6 sticky top-32">
              {/* Quick Access Section */}
              <div className="space-y-4">
                <div>
                  <Overline className="text-red-600 mb-2">Quick Setup</Overline>
                  <Headline as="h3" className="text-black text-lg">
                    Configuration
                  </Headline>
                </div>

                {/* Template Loader */}
                <TemplateSelector
                  onLoadTemplate={handleLoadTemplate}
                  isLoading={isLoadingTemplate}
                />

                {/* Quick Presets */}
                <QuickPresets
                  roles={chart.roles}
                  tasks={chart.tasks}
                  onApplyPreset={handleApplyPreset}
                  isLoading={isLoadingTemplate}
                />

                {/* Custom Presets Manager */}
                <PresetManager
                  currentMatrix={chart.matrix}
                  onLoadPreset={handleLoadPreset}
                  isLoading={isLoadingTemplate}
                />
              </div>

              {/* Core Settings Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div>
                  <Overline className="text-red-600 mb-2">Settings</Overline>
                </div>

                {/* Controls Row */}
                <div className="space-y-3">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <Label className="text-slate-700 font-semibold text-xs">
                        Theme
                      </Label>
                    </CardHeader>
                    <CardContent>
                      <ThemeSelector
                        theme={chart.theme}
                        onChange={updateTheme}
                      />
                    </CardContent>
                  </Card>

                  {/* Export Card - Enhanced Design */}
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4 border-b border-emerald-200">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⬇️</span>
                        <div>
                          <Label className="text-emerald-700 font-semibold text-sm block">
                            Export & Download
                          </Label>
                          <p className="text-xs text-emerald-600">
                            Save your RACI chart in any format
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ExportButtons chart={chart} />
                    </CardContent>
                  </Card>
                </div>

                {/* Danger Zone */}
                <Card className="border-red-200 bg-red-50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xs text-red-600">
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResetControls
                      onReset={handleReset}
                      onResetTheme={handleResetTheme}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Right Content: Roles, Tasks, and Matrix */}
          <div className="lg:col-span-9 space-y-8">
            {/* Step 1: Chart Details */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-black">Chart Details</CardTitle>
                    <Caption className="text-slate-600 mt-1">
                      Configure project metadata
                    </Caption>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RaciHeaderBar
                  title={chart.title}
                  logo={chart.logo}
                  onTitleChange={updateTitle}
                  onLogoChange={updateLogo}
                  validation={validation}
                />
              </CardContent>
            </Card>

            {/* Step 2: Description */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-black">Description</CardTitle>
                    <Caption className="text-slate-600 mt-1">
                      Add optional context
                    </Caption>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={chart.description}
                  onChange={(e) => updateDescription(e.target.value)}
                  placeholder="Add an optional description..."
                  maxLength={500}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                  rows={3}
                  aria-label="Chart description"
                />
                <Body size="sm" className="text-slate-500">
                  {chart.description?.length || 0} / 500
                </Body>
              </CardContent>
            </Card>

            {/* Step 3: Roles */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-black">Roles</CardTitle>
                    <Caption className="text-slate-600 mt-1">
                      Define team members and positions
                    </Caption>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RolesEditor
                  roles={chart.roles}
                  onChange={(updatedRoles) => {
                    setChart({ ...chart, roles: updatedRoles });
                  }}
                />
              </CardContent>
            </Card>

            {/* Step 4: Tasks */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-black">Tasks</CardTitle>
                    <Caption className="text-slate-600 mt-1">
                      List activities and deliverables
                    </Caption>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TasksEditor
                  tasks={chart.tasks}
                  onChange={(updatedTasks) => {
                    setChart({ ...chart, tasks: updatedTasks });
                  }}
                />
              </CardContent>
            </Card>

            {/* Step 5: RACI Matrix */}

            {/* Matrix Section */}
            <div>
              {/* Step 5: Matrix Editor */}
              {chart.roles.length > 0 && chart.tasks.length > 0 ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        5
                      </div>
                      <div>
                        <CardTitle className="text-black">
                          RACI Matrix
                        </CardTitle>
                        <Caption className="text-slate-600 mt-1">
                          Assign responsibilities
                        </Caption>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <RaciMatrixEditor
                      chart={chart}
                      onMatrixChange={updateMatrix}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-5xl mb-4">📊</div>
                    <Headline as="h3" className="text-black text-lg">
                      Matrix Preview
                    </Headline>
                    <Body size="sm" className="text-slate-600 mt-2 max-w-sm">
                      Add at least one role and one task to see your RACI matrix
                      in action.
                    </Body>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tips Card */}
            <Card className="border-slate-200 bg-emerald-50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-base text-slate-900">
                    Tips for Success
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Auto-saves every 5 seconds to your browser</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      Use keyboard navigation:{" "}
                      <kbd className="px-2 py-0.5 bg-slate-100 text-xs border border-slate-200 rounded text-slate-900 font-mono">
                        Tab
                      </kbd>{" "}
                      to move,{" "}
                      <kbd className="px-2 py-0.5 bg-slate-100 text-xs border border-slate-200 rounded text-slate-900 font-mono">
                        Esc
                      </kbd>{" "}
                      to cancel
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>
                      Click the up/down arrows or drag to reorder items
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Click matrix cells to assign RACI values</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ErrorModal />
    </main>
  );
}
