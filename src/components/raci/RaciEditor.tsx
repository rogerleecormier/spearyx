/**
 * RACI Editor
 * Main orchestrator component - manages layout and child coordination
 * Uses shadcn/ui components and site design system
 */

import { RaciSessionState, RaciRole, RaciTask } from "@/types/raci";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useValidation } from "@/lib/raci/hooks";
import RaciHeaderBar from "./RaciHeaderBar";
import DescriptionPanel from "./DescriptionPanel";
import RolesEditor from "./RolesEditor";
import TasksEditor from "./TasksEditor";
import RaciMatrixEditor from "./RaciMatrixEditor";
import ThemeSelector from "./ThemeSelector";
import ExportButtons from "./ExportButtons";
import ResetControls from "./ResetControls";
import UndoButton from "./UndoButton";

interface RaciEditorProps {
  state: RaciSessionState;
  setState: (state: RaciSessionState) => void;
}

export default function RaciEditor({ state, setState }: RaciEditorProps) {
  const validation = useValidation(state.chart);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <RaciHeaderBar
            title={state.chart.title}
            onTitleChange={(title) => {
              setState({
                ...state,
                chart: { ...state.chart, title },
              });
            }}
            validation={validation}
          />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Sidebar - Editors */}
        <aside className="w-80 space-y-4">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionPanel
                title={state.chart.title}
                description={state.chart.description}
                onTitleChange={(title) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, title },
                  });
                }}
                onChange={(desc: string) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, description: desc },
                  });
                }}
                onGenerateRoles={(roles: RaciRole[]) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, roles },
                  });
                }}
                onGenerateTasks={(tasks: RaciTask[]) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, tasks },
                  });
                }}
              />
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Roles</CardTitle>
              <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">
                {state.chart.roles.length}
              </span>
            </CardHeader>
            <CardContent>
              <RolesEditor
                roles={state.chart.roles}
                onChange={(roles: RaciRole[]) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, roles },
                  });
                }}
              />
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Tasks</CardTitle>
              <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">
                {state.chart.tasks.length}
              </span>
            </CardHeader>
            <CardContent>
              <TasksEditor
                tasks={state.chart.tasks}
                onChange={(tasks: RaciTask[]) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, tasks },
                  });
                }}
              />
            </CardContent>
          </Card>

          {/* Theme & Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ThemeSelector
                theme={state.ui.selectedTheme}
                onChange={(theme: string) => {
                  setState({
                    ...state,
                    ui: { ...state.ui, selectedTheme: theme },
                  });
                }}
              />
              <ResetControls onReset={function(): void {
                              throw new Error("Function not implemented.");
                          } } />
            </CardContent>
          </Card>
        </aside>

        {/* Right Content - Matrix & Controls */}
        <main className="flex-1 space-y-4">
          {/* Matrix Card */}
          <Card>
            <CardHeader>
              <CardTitle>RACI Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <RaciMatrixEditor
                chart={state.chart}
                onMatrixChange={(matrix) => {
                  setState({
                    ...state,
                    chart: { ...state.chart, matrix },
                  });
                }}
                theme={state.ui.selectedTheme}
              />
            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex gap-4 justify-between items-center pt-4 border-t border-border">
            <UndoButton canUndo={state.undo.canUndo} onUndo={() => {}} />
            <ExportButtons chart={state.chart} />
          </div>
        </main>
      </div>
    </div>
  );
}
