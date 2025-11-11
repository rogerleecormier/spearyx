/**
 * RACI Matrix Editor - Iteration 3 Enhanced
 * Interactive color-coded matrix with:
 * - Exclusive cell assignment (R, A, C, I)
 * - Keyboard navigation (Tab, Arrow keys, Space)
 * - Cell cycling (Space to cycle through R→A→C→I→null)
 * - Real-time validation (at least one A per task)
 * - Responsive design for large matrices
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { RaciChart, RaciValue } from "@/types/raci";
import { Label, Caption } from "@/components/Typography";

interface RaciMatrixEditorProps {
  chart: RaciChart;
  onMatrixChange: (matrix: Record<string, Record<string, RaciValue>>) => void;
}

interface CellRef {
  roleId: string;
  taskId: string;
  element: HTMLButtonElement | null;
}

export default function RaciMatrixEditor({
  chart,
  onMatrixChange,
}: RaciMatrixEditorProps) {
  const cellRefs = useRef<Map<string, CellRef>>(new Map());
  const [focusedCell, setFocusedCell] = useState<{
    roleId: string;
    taskId: string;
  } | null>(null);

  // RACI value cycle: R → A → C → I → null
  const raciCycle: (RaciValue | null)[] = ["R", "A", "C", "I", null];

  /**
   * Get next value in RACI cycle
   */
  const getNextRaciValue = (current: RaciValue | null): RaciValue | null => {
    const currentIndex = raciCycle.indexOf(current);
    const nextIndex = (currentIndex + 1) % raciCycle.length;
    return raciCycle[nextIndex];
  };

  /**
   * Get previous value in RACI cycle
   */
  const getPreviousRaciValue = (
    current: RaciValue | null
  ): RaciValue | null => {
    const currentIndex = raciCycle.indexOf(current);
    const prevIndex =
      currentIndex === 0 ? raciCycle.length - 1 : currentIndex - 1;
    return raciCycle[prevIndex];
  };

  /**
   * Update a cell value
   */
  const updateCell = useCallback(
    (roleId: string, taskId: string, value: RaciValue) => {
      const newMatrix = { ...chart.matrix };
      if (!newMatrix[roleId]) {
        newMatrix[roleId] = {};
      }
      newMatrix[roleId][taskId] = value;
      onMatrixChange(newMatrix);
    },
    [chart.matrix, onMatrixChange]
  );

  /**
   * Cycle cell value forward (Space key)
   */
  const cycleCellForward = useCallback(
    (roleId: string, taskId: string) => {
      const currentValue = chart.matrix[roleId]?.[taskId] || null;
      const nextValue = getNextRaciValue(currentValue);
      updateCell(roleId, taskId, nextValue);
    },
    [chart.matrix, updateCell]
  );

  /**
   * Cycle cell value backward (Shift+Space)
   */
  const cycleCellBackward = useCallback(
    (roleId: string, taskId: string) => {
      const currentValue = chart.matrix[roleId]?.[taskId] || null;
      const prevValue = getPreviousRaciValue(currentValue);
      updateCell(roleId, taskId, prevValue);
    },
    [chart.matrix, updateCell]
  );

  /**
   * Navigate to cell and handle keyboard input
   */
  const handleCellKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      roleIndex: number,
      taskIndex: number,
      roleId: string,
      taskId: string
    ) => {
      const totalRoles = chart.roles.length;
      const totalTasks = chart.tasks.length;

      // Space: cycle forward
      if (e.code === "Space") {
        e.preventDefault();
        cycleCellForward(roleId, taskId);
        return;
      }

      // Shift+Space: cycle backward
      if (e.shiftKey && e.code === "Space") {
        e.preventDefault();
        cycleCellBackward(roleId, taskId);
        return;
      }

      // Arrow Up
      if (e.key === "ArrowUp" && roleIndex > 0) {
        e.preventDefault();
        const newRoleIndex = roleIndex - 1;
        const nextRoleId = chart.roles[newRoleIndex].id;
        setFocusedCell({ roleId: nextRoleId, taskId });
        const cellKey = `${nextRoleId}-${taskId}`;
        setTimeout(() => {
          cellRefs.current.get(cellKey)?.element?.focus();
        }, 0);
        return;
      }

      // Arrow Down
      if (e.key === "ArrowDown" && roleIndex < totalRoles - 1) {
        e.preventDefault();
        const newRoleIndex = roleIndex + 1;
        const nextRoleId = chart.roles[newRoleIndex].id;
        setFocusedCell({ roleId: nextRoleId, taskId });
        const cellKey = `${nextRoleId}-${taskId}`;
        setTimeout(() => {
          cellRefs.current.get(cellKey)?.element?.focus();
        }, 0);
        return;
      }

      // Arrow Left
      if (e.key === "ArrowLeft" && taskIndex > 0) {
        e.preventDefault();
        const newTaskIndex = taskIndex - 1;
        const nextTaskId = chart.tasks[newTaskIndex].id;
        setFocusedCell({ roleId, taskId: nextTaskId });
        const cellKey = `${roleId}-${nextTaskId}`;
        setTimeout(() => {
          cellRefs.current.get(cellKey)?.element?.focus();
        }, 0);
        return;
      }

      // Arrow Right
      if (e.key === "ArrowRight" && taskIndex < totalTasks - 1) {
        e.preventDefault();
        const newTaskIndex = taskIndex + 1;
        const nextTaskId = chart.tasks[newTaskIndex].id;
        setFocusedCell({ roleId, taskId: nextTaskId });
        const cellKey = `${roleId}-${nextTaskId}`;
        setTimeout(() => {
          cellRefs.current.get(cellKey)?.element?.focus();
        }, 0);
        return;
      }
    },
    [
      chart.roles,
      chart.tasks,
      chart.matrix,
      cycleCellForward,
      cycleCellBackward,
    ]
  );

  /**
   * Get RACI value color styling
   */
  const getCellColor = (
    value: RaciValue,
    _isFocused: boolean
  ): {
    background: string;
    border: string;
    text: string;
    label: string;
  } => {
    switch (value) {
      case "R":
        return {
          background: "bg-success-50 dark:bg-success-950",
          border: "border-success-300 dark:border-success-700",
          text: "text-success-700 dark:text-success-300",
          label: "Responsible",
        };
      case "A":
        return {
          background: "bg-error-50 dark:bg-error-950",
          border: "border-error-300 dark:border-error-700",
          text: "text-error-700 dark:text-error-300",
          label: "Accountable",
        };
      case "C":
        return {
          background: "bg-info-50 dark:bg-info-950",
          border: "border-info-300 dark:border-info-700",
          text: "text-info-700 dark:text-info-300",
          label: "Consulted",
        };
      case "I":
        return {
          background: "bg-warning-50 dark:bg-warning-950",
          border: "border-warning-300 dark:border-warning-700",
          text: "text-warning-700 dark:text-warning-300",
          label: "Informed",
        };
      default:
        return {
          background: "bg-white dark:bg-slate-900",
          border: "border-slate-200 dark:border-slate-700",
          text: "text-slate-600 dark:text-slate-400",
          label: "Unassigned",
        };
    }
  };

  /**
   * Check if task has at least one Accountable
   */
  const hasAccountable = (taskId: string): boolean => {
    return chart.roles.some((role) => chart.matrix[role.id]?.[taskId] === "A");
  };

  /**
   * Get validation status for task
   */
  const getTaskValidationStatus = (taskId: string): boolean => {
    return hasAccountable(taskId);
  };

  if (chart.roles.length === 0 || chart.tasks.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-card p-12 text-center">
        <Caption className="text-muted-foreground">
          {chart.roles.length === 0 && chart.tasks.length === 0
            ? "Add roles and tasks to create the matrix"
            : chart.roles.length === 0
              ? "Add roles to create the matrix"
              : "Add tasks to create the matrix"}
        </Caption>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Matrix Container */}
      <div className="border border-border rounded-lg overflow-x-auto bg-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-foreground min-w-[150px] border-r border-border">
                Role / Task
              </th>
              {chart.tasks.map((task) => {
                const isValid = getTaskValidationStatus(task.id);
                return (
                  <th
                    key={task.id}
                    className={`px-3 py-2 text-center text-xs font-semibold min-w-[90px] border-r border-border last:border-r-0 ${
                      !isValid ? "bg-error-50 dark:bg-error-950" : ""
                    }`}
                  >
                    <div className="break-words">
                      <div className="font-medium text-foreground">
                        {task.name}
                      </div>
                      {task.description && (
                        <Caption className="text-muted-foreground mt-1">
                          {task.description.substring(0, 30)}
                          {task.description.length > 30 ? "..." : ""}
                        </Caption>
                      )}
                      {!isValid && (
                        <div className="text-xs text-error-600 dark:text-error-400 font-semibold mt-1">
                          ⚠️ Missing A
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {chart.roles.map((role, roleIndex) => (
              <tr
                key={role.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground border-r border-border bg-muted/50 sticky left-0 z-10">
                  {role.name}
                </td>
                {chart.tasks.map((task, taskIndex) => {
                  const value = chart.matrix[role.id]?.[task.id] || null;
                  const isFocused =
                    focusedCell?.roleId === role.id &&
                    focusedCell?.taskId === task.id;
                  const colors = getCellColor(value, isFocused);
                  const cellKey = `${role.id}-${task.id}`;

                  return (
                    <td
                      key={cellKey}
                      className="px-1 py-1 text-center border-r border-border last:border-r-0"
                    >
                      <button
                        ref={(el) => {
                          if (el) {
                            cellRefs.current.set(cellKey, {
                              roleId: role.id,
                              taskId: task.id,
                              element: el,
                            });
                          }
                        }}
                        onFocus={() =>
                          setFocusedCell({ roleId: role.id, taskId: task.id })
                        }
                        onBlur={() => setFocusedCell(null)}
                        onKeyDown={(e) =>
                          handleCellKeyDown(
                            e,
                            roleIndex,
                            taskIndex,
                            role.id,
                            task.id
                          )
                        }
                        onClick={() => cycleCellForward(role.id, task.id)}
                        className={`w-full h-12 flex items-center justify-center border-2 rounded font-bold text-lg transition-all ${colors.background} ${colors.border} ${colors.text} hover:shadow-md active:scale-95 focus:outline-none ${
                          isFocused
                            ? "ring-2 ring-primary-500 ring-offset-2"
                            : ""
                        }`}
                        aria-label={`RACI cell for ${role.name} and ${task.name}. Current: ${value || "unassigned"}. Press Space to cycle (${raciCycle.join("→")})`}
                        title={`${role.name} - ${task.name}: ${value || "-"}`}
                      >
                        {value || "-"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Keyboard Navigation Help */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <Label className="text-blue-900 dark:text-blue-100 font-semibold block mb-2">
          ⌨️ Keyboard Navigation
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-800 dark:text-blue-200">
          <div>
            <strong>Space</strong> - Cycle forward
          </div>
          <div>
            <strong>Shift+Space</strong> - Cycle backward
          </div>
          <div>
            <strong>Arrow keys</strong> - Navigate
          </div>
          <div>
            <strong>Click</strong> - Cycle value
          </div>
        </div>
      </div>

      {/* Validation Status */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <Label className="font-semibold block mb-2">Validation Status</Label>
        <div className="space-y-2">
          {chart.tasks.map((task) => {
            const isValid = getTaskValidationStatus(task.id);
            return (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    isValid ? "bg-success-500" : "bg-error-500"
                  }`}
                >
                  {isValid ? "✓" : "!"}
                </div>
                <span className="text-foreground">
                  {task.name}:{" "}
                  {isValid ? "Has Accountable" : "Missing Accountable (A)"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
