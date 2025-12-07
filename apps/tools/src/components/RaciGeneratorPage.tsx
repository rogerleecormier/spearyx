"use client";

/**
 * Main RACI Generator Page
 * Integrates all RACI editor components with state management
 */

import { useEffect, useState, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import { useRaciState } from "@/lib/hooks";
import { useValidation } from "@/lib/hooks";
import { useAutoSave } from "@/lib/hooks";
import { useTheme } from "@/lib/hooks";
import { useUndo } from "@/lib/hooks";
import { useKeyboardNav } from "@/lib/hooks";
import { loadChartFromStorage } from "@/lib/hooks";
import { decodeChart } from "@/lib/encoding";
import LogoUploader from "./LogoUploader";
import DescriptionPanel from "./DescriptionPanel";
import RolesEditor from "./RolesEditor";
import TasksEditor from "./TasksEditor";
import ThemeSelector from "./ThemeSelector";
import PreviewModal from "./PreviewModal";
import ExportButtons from "./ExportButtons";
import ResetControls from "./ResetControls";
import UndoButton from "./UndoButton";
import RaciMatrixEditor from "./RaciMatrixEditor";
import ErrorModal from "./ErrorModal";
import { QuickPresetsGrid } from "./QuickPresetsGrid";
import { MatrixHintsAndStatus } from "./MatrixHintsAndStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@spearyx/ui-kit";
import { Tooltip, TooltipTrigger, TooltipContent } from "@spearyx/ui-kit";
import {
  Hero,
  Headline,
  Body,
  Label,
  Overline,
  Caption,
} from "@spearyx/ui-kit";
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

  // Undo functionality
  const { canUndo, undo } = useUndo(chart, setChart);

  // Keyboard navigation
  const { handleCtrlZ } = useKeyboardNav();

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

  // Handle Ctrl+Z for undo
  useEffect(() => {
    const handleKeyDown = handleCtrlZ(() => {
      if (canUndo) {
        undo();
      }
    });

    window.addEventListener("keydown", handleKeyDown as EventListener);
    return () =>
      window.removeEventListener("keydown", handleKeyDown as EventListener);
  }, [canUndo, undo, handleCtrlZ]);

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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
        <div className="bg-indigo-50 border-b border-indigo-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900">
                Imported:{" "}
                <span className="font-semibold">
                  {importNotification.chartTitle}
                </span>
              </p>
              <p className="text-xs text-indigo-700 mt-1">
                Loaded from public link •{" "}
                {new Date(importNotification.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setImportNotification(null)}
              className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
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
              <Overline className="text-primary-600 mb-2">
                Project Tools
              </Overline>
              <Hero className="text-2xl md:text-3xl lg:text-4xl text-slate-950 mb-2">
                RACI Matrix Generator
              </Hero>
              <Body size="sm" className="text-slate-600">
                Define roles and responsibilities with crystal clarity
              </Body>
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
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Overline className="text-primary-600 mb-2">
                  Build Your Chart
                </Overline>
                <Headline as="h3" className="text-slate-950 text-lg">
                  Define Roles & Tasks
                </Headline>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {!validation.isValid && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error-50 text-error-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">
                      {validation.errors.length} issue
                      {validation.errors.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {validation.isValid && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success-50 text-success-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Valid</span>
                  </div>
                )}
                {isFallbackActive && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-xs">
                      Using smart templates
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  {isSaving && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                      <span>Saving...</span>
                    </>
                  )}
                  {!isSaving && lastSaved && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-success-500"></div>
                      <span>
                        Saved {new Date(lastSaved).toLocaleTimeString()}
                      </span>
                    </>
                  )}
                </div>
                <UndoButton canUndo={canUndo} onUndo={undo} />
              </div>
            </div>

            {/* Step 1: Project Details & AI Generation */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-slate-950">
                        Project Details & AI Generation
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg">
                          Describe your project and use AI to generate initial
                          roles and tasks
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Caption className="text-slate-600 mt-1">
                      Add context and let AI suggest roles & tasks
                    </Caption>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DescriptionPanel
                  title={chart.title}
                  description={chart.description}
                  onTitleChange={updateTitle}
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
                  onGenerateComplete={(roles, tasks, matrix) => {
                    console.log(
                      "RaciGeneratorPage received roles, tasks, and matrix:",
                      roles,
                      tasks,
                      matrix
                    );
                    console.log("Current chart before update:", chart);
                    // Single setState call with roles, tasks, and optional matrix
                    const newChart = { ...chart, roles, tasks };
                    // Apply matrix if provided (from fallback mode)
                    if (matrix) {
                      newChart.matrix = matrix;
                      console.log(
                        "Applied generated matrix from fallback:",
                        matrix
                      );
                    }
                    console.log("New chart after spread:", newChart);
                    setChart(newChart);
                  }}
                  onFallbackStatusChange={setIsFallbackActive}
                />
              </CardContent>
            </Card>

            {/* Step 2: Roles */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-slate-950">
                        Roles{" "}
                        {chart.roles.length > 0 && (
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            ({chart.roles.length})
                          </span>
                        )}
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg">
                          Add team members and their positions/titles
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Caption className="text-slate-600 mt-1">
                      Define team members and positions{" "}
                      {chart.roles.length > 0 && (
                        <span className="text-success-600">
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

            {/* Step 3: Tasks */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-slate-950">
                        Tasks{" "}
                        {chart.tasks.length > 0 && (
                          <span className="text-sm font-normal text-slate-500 ml-2">
                            ({chart.tasks.length})
                          </span>
                        )}
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg">
                          Define activities, deliverables, and work items
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Caption className="text-slate-600 mt-1">
                      List activities and deliverables{" "}
                      {chart.tasks.length > 0 && (
                        <span className="text-success-600">
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

            {/* Step 4: RACI Matrix */}

            {/* Matrix Section */}
            <div>
              {/* Step 4: Matrix Editor */}
              {chart.roles.length > 0 && chart.tasks.length > 0 ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        4
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-slate-950">
                            RACI Matrix
                          </CardTitle>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-white text-slate-900 border border-slate-200 rounded-lg shadow-lg">
                              Apply patterns or assign R, A, C, I values to each
                              role-task combination
                            </TooltipContent>
                          </Tooltip>
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

                    {/* Matrix Hints and Status - Tips & Keyboard Commands */}
                    <div className="pt-4 border-t border-slate-200">
                      <MatrixHintsAndStatus
                        chart={chart}
                        validation={validation}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-5xl mb-4">📊</div>
                    <Headline as="h3" className="text-slate-950 text-lg">
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
          </div>

          {/* Right Sidebar: Controls, Export, and Danger Zone */}
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-2">
            {/* Controls Row */}
            <div className="space-y-3">
              {/* Logo Uploader */}
              <LogoUploader
                logo={chart.logo}
                onLogoChange={updateLogo}
                validation={validation}
              />

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
              <Card
                className="shadow-md hover:shadow-lg transition-all overflow-hidden"
                style={{
                  backgroundColor: "#f0fdf4",
                  borderColor: "#86efac",
                  borderWidth: "2px",
                }}
              >
                <CardHeader
                  className="pb-3 pt-4 px-4"
                  style={{
                    borderBottomColor: "#86efac",
                    borderBottomWidth: "1px",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">📥</span>
                    <div className="min-w-0">
                      <Label
                        className="font-bold text-sm block text-green-700"
                      >
                        Export & Download
                      </Label>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#16a34a" }}
                      >
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
            <Card
              className="shadow-md hover:shadow-lg transition-all overflow-hidden"
              style={{
                backgroundColor: "#ffe4e9",
                borderColor: "#ff8fa3",
                borderWidth: "2px",
              }}
            >
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <CardTitle
                    className="text-sm font-bold"
                    style={{ color: "#dc2626" }}
                  >
                    Danger Zone
                  </CardTitle>
                </div>
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
