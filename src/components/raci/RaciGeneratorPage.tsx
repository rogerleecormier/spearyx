"use client";

/**
 * Main RACI Generator Page
 * Integrates all RACI editor components with state management
 */

import { useEffect, useState, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import { useRaciState } from "@/lib/raci/hooks";
import { useValidation } from "@/lib/raci/hooks";
import { useAutoSave } from "@/lib/raci/hooks";
import { useTheme } from "@/lib/raci/hooks";
import { loadChartFromStorage } from "@/lib/raci/hooks";
import { decodeChart } from "@/lib/raci/encoding";
import RaciHeaderBar from "./RaciHeaderBar";
import DescriptionPanel from "./DescriptionPanel";
import RolesEditor from "./RolesEditor";
import TasksEditor from "./TasksEditor";
import ThemeSelector from "./ThemeSelector";
import PreviewModal from "./PreviewModal";
import ExportButtons from "./ExportButtons";
import ResetControls from "./ResetControls";
import RaciMatrixEditor from "./RaciMatrixEditor";
import ErrorModal from "./ErrorModal";
import { QuickPresetsGrid } from "./QuickPresetsGrid";
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
  const search = useSearch({ strict: false }) as { importData?: string };
  const [isInitialized, setIsInitialized] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isFallbackActive, setIsFallbackActive] = useState(false);
  const [importNotification, setImportNotification] = useState<{
    chartTitle: string;
    timestamp: string;
  } | null>(null);

  // Initialize state
  const {
    state: chart,
    updateTitle,
    updateLogo,
    updateDescription,
    updateMatrix,
    updateTheme,
    reset,
    setState: setChart,
  } = useRaciState();

  // Validation
  const validation = useValidation(chart);

  // Auto-save
  const { isSaving, lastSaved } = useAutoSave(chart);

  // Theme management
  const { highContrast, setHighContrast } = useTheme(chart.theme);

  // Load from storage on mount
  useEffect(() => {
    const initializeChart = async () => {
      try {
        // 1. Check for import data in URL search params (highest priority)
        if (search.importData) {
          try {
            const importedChart = decodeChart(search.importData);
            setChart(importedChart);
            setImportNotification({
              chartTitle: importedChart.title,
              timestamp: new Date().toISOString(),
            });
            return;
          } catch (err) {
            console.error("Failed to decode chart from URL:", err);
            // Fall through to other options
          }
        }

        // 2. Check for imported chart from sessionStorage (cross-tab import)
        const importedChartJson = sessionStorage.getItem("raci:importedChart");
        if (importedChartJson) {
          try {
            const importedChart = JSON.parse(importedChartJson) as RaciChart;
            setChart(importedChart);
            // Clear so it's only used once
            sessionStorage.removeItem("raci:importedChart");

            // Check for notification
            const importNotifJson = sessionStorage.getItem(
              "raci:importNotification"
            );
            if (importNotifJson) {
              try {
                const notif = JSON.parse(importNotifJson);
                setImportNotification(notif);
                sessionStorage.removeItem("raci:importNotification");
              } catch (err) {
                console.warn("Failed to parse import notification:", err);
              }
            }
            return;
          } catch (err) {
            console.warn(
              "Failed to parse imported chart from sessionStorage:",
              err
            );
          }
        }

        // 3. Fall back to stored chart from localStorage
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
  }, [setChart, search.importData]);

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
      {/* Import Notification */}
      {importNotification && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Imported:{" "}
                <span className="font-semibold">
                  {importNotification.chartTitle}
                </span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Loaded from public link •{" "}
                {new Date(importNotification.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setImportNotification(null)}
              className="text-blue-600 hover:text-blue-900 font-medium text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
              {isFallbackActive && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-xs">
                    Using template data
                  </span>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Content: Steps 1-5 and Matrix */}
          <div className="lg:col-span-9 space-y-6 order-1 lg:order-1">
            {/* Header */}
            <div className="space-y-2">
              <Overline className="text-red-600 mb-2">
                Build Your Chart
              </Overline>
              <Headline as="h3" className="text-black text-lg">
                Define Roles & Tasks
              </Headline>
            </div>

            {/* Step 1: Chart Details */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-black">
                        Chart Details
                      </CardTitle>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                          Set your project name and upload a logo
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </div>
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

            {/* Step 2: Description & AI Generation */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-black">
                        Description & AI Generation
                      </CardTitle>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                          Describe your project and use AI to generate initial
                          roles and tasks
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </div>
                    <Caption className="text-slate-600 mt-1">
                      Add context and let AI suggest roles & tasks
                    </Caption>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DescriptionPanel
                  description={chart.description}
                  onChange={(desc: string) => updateDescription(desc)}
                  onGenerateRoles={(roles) => {
                    console.log("RaciGeneratorPage received roles:", roles);
                    console.log("Current chart before update:", chart);
                    const newChart = { ...chart, roles };
                    console.log("New chart after spread:", newChart);
                    setChart(newChart);
                  }}
                  onGenerateTasks={(tasks) => {
                    console.log("RaciGeneratorPage received tasks:", tasks);
                    // Merge tasks with current chart (which should now have the roles from the previous setState)
                    // But since setState is async, we need to use the current rendered chart
                    setChart({ ...chart, tasks });
                  }}
                  onGenerateComplete={(roles, tasks) => {
                    console.log(
                      "RaciGeneratorPage received roles and tasks:",
                      roles,
                      tasks
                    );
                    console.log("Current chart before update:", chart);
                    // Single setState call with both roles and tasks to avoid race condition
                    const newChart = { ...chart, roles, tasks };
                    console.log("New chart after spread:", newChart);
                    setChart(newChart);
                  }}
                  onFallbackStatusChange={setIsFallbackActive}
                />
              </CardContent>
            </Card>

            {/* Step 3: Roles */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-black">
                        Roles{" "}
                        {chart.roles.length > 0 && (
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            ({chart.roles.length})
                          </span>
                        )}
                      </CardTitle>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                          Add team members and their positions/titles
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </div>
                    <Caption className="text-slate-600 mt-1">
                      Define team members and positions{" "}
                      {chart.roles.length > 0 && (
                        <span className="text-green-600">
                          ✓ {chart.roles.length} role
                          {chart.roles.length !== 1 ? "s" : ""} added
                        </span>
                      )}
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
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-black">
                        Tasks{" "}
                        {chart.tasks.length > 0 && (
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            ({chart.tasks.length})
                          </span>
                        )}
                      </CardTitle>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                          Define activities, deliverables, and work items
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </div>
                    <Caption className="text-slate-600 mt-1">
                      List activities and deliverables{" "}
                      {chart.tasks.length > 0 && (
                        <span className="text-green-600">
                          ✓ {chart.tasks.length} task
                          {chart.tasks.length !== 1 ? "s" : ""} added
                        </span>
                      )}
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
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        5
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-black">
                            RACI Matrix
                          </CardTitle>
                          <div className="group relative">
                            <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                              Apply patterns or assign R, A, C, I values to each
                              role-task combination
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
                            </div>
                          </div>
                        </div>
                        <Caption className="text-slate-600 mt-1">
                          Assign responsibilities
                        </Caption>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Quick Presets Section - Before the matrix */}
                    <div>
                      <QuickPresetsGrid
                        roles={chart.roles}
                        tasks={chart.tasks}
                        onApplyPreset={(matrix) => updateMatrix(matrix)}
                      />
                    </div>

                    {/* Separator */}
                    <div className="border-t border-slate-200" />

                    {/* Matrix Editor */}
                    <RaciMatrixEditor
                      chart={chart}
                      onMatrixChange={updateMatrix}
                      theme={chart.theme}
                      highContrast={highContrast}
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
              <CardHeader>
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

          {/* Right Sidebar: Controls, Export, and Danger Zone */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-2">
            {/* Controls Row */}
            <div className="space-y-3">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-200">
                  <Label className="text-slate-700 font-semibold text-xs">
                    Theme
                  </Label>
                </CardHeader>
                <CardContent className="pt-4 pb-4 space-y-4">
                  {/* Theme Selector */}
                  <ThemeSelector
                    theme={chart.theme}
                    onChange={updateTheme}
                    highContrast={highContrast}
                    onHighContrastChange={setHighContrast}
                  />

                  {/* Divider */}
                  <div className="border-t border-slate-200" />

                  {/* Live Preview Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👁️</span>
                      <div>
                        <Label className="text-slate-700 font-semibold text-xs block">
                          Live Preview
                        </Label>
                        <p className="text-xs text-slate-600">
                          See your matrix with theme
                        </p>
                      </div>
                    </div>
                    {chart.roles.length > 0 && chart.tasks.length > 0 ? (
                      <button
                        onClick={() => setShowPreviewModal(true)}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                      >
                        Open Preview
                      </button>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-slate-600 font-medium">
                          Add roles & tasks to preview
                        </p>
                      </div>
                    )}
                  </div>
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

      {/* Modals */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        chart={chart}
        highContrast={highContrast}
      />
      <ErrorModal />
    </main>
  );
}
