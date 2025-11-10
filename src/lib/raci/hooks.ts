/**
 * Custom hooks for RACI Chart state management
 * useRaciState, useAutoSave, useValidation, and useKeyboardNav
 */

"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { RaciChart, RaciRole, RaciTask, ValidationResult } from "@/types/raci";
import { raciReducer, createInitialChart } from "./state";
import { validateChart } from "./validation";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  saveToIndexedDB,
  loadFromIndexedDB,
} from "./persistence";

/**
 * useRaciState - Central state management hook
 * Uses useReducer for predictable state mutations
 */
export function useRaciState(initialChart?: RaciChart) {
  const [state, dispatch] = useReducer(
    raciReducer,
    initialChart || createInitialChart()
  );

  // Convenience methods to avoid direct dispatch calls in components
  const addRole = useCallback((name: string) => {
    dispatch({ type: "addRole", payload: { name } });
  }, []);

  const editRole = useCallback((id: string, name: string) => {
    dispatch({ type: "editRole", payload: { id, name } });
  }, []);

  const deleteRole = useCallback((id: string) => {
    dispatch({ type: "deleteRole", payload: { id } });
  }, []);

  const reorderRoles = useCallback((roles: RaciRole[]) => {
    dispatch({ type: "reorderRoles", payload: { roles } });
  }, []);

  const addTask = useCallback((name: string, description?: string) => {
    dispatch({ type: "addTask", payload: { name, description } });
  }, []);

  const editTask = useCallback((id: string, name: string, description?: string) => {
    dispatch({ type: "editTask", payload: { id, name, description } });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "deleteTask", payload: { id } });
  }, []);

  const reorderTasks = useCallback((tasks: RaciTask[]) => {
    dispatch({ type: "reorderTasks", payload: { tasks } });
  }, []);

  const updateTitle = useCallback((title: string) => {
    dispatch({ type: "updateTitle", payload: { title } });
  }, []);

  const updateLogo = useCallback((logo?: string) => {
    dispatch({ type: "updateLogo", payload: { logo } });
  }, []);

  const updateDescription = useCallback((description: string) => {
    dispatch({ type: "updateDescription", payload: { description } });
  }, []);

  const updateTheme = useCallback((theme: string) => {
    dispatch({ type: "updateTheme", payload: { theme } });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  const setState = useCallback((chart: RaciChart) => {
    dispatch({ type: "setState", payload: { chart } });
  }, []);

  return {
    state,
    dispatch,
    addRole,
    editRole,
    deleteRole,
    reorderRoles,
    addTask,
    editTask,
    deleteTask,
    reorderTasks,
    updateTitle,
    updateLogo,
    updateDescription,
    updateTheme,
    reset,
    setState,
  };
}

/**
 * useValidation - Real-time validation hook
 * Validates entire chart whenever it changes
 */
export function useValidation(chart: RaciChart): ValidationResult {
  const [validation, setValidation] = useState<ValidationResult>(() =>
    validateChart(chart)
  );

  useEffect(() => {
    setValidation(validateChart(chart));
  }, [chart]);

  return validation;
}

/**
 * useDebounce - Debounce values with delay
 * Utility hook used by useAutoSave
 */
function useDebounce<T>(value: T, delay: number = 5000): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useAutoSave - Auto-save to localStorage with debounce
 * Falls back to IndexedDB if localStorage quota exceeded
 */
export function useAutoSave(
  chart: RaciChart
): { isSaving: boolean; lastSaved: Date | null; error: Error | null } {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Debounce the chart to 5 seconds
  const debouncedChart = useDebounce(chart, 5000);

  useEffect(() => {
    setIsSaving(true);

    const saveChart = async () => {
      try {
        // Try localStorage first
        saveToLocalStorage(debouncedChart);
        setLastSaved(new Date());
        setError(null);
        setIsSaving(false);
      } catch (err) {
        // Try IndexedDB as fallback
        try {
          await saveToIndexedDB(debouncedChart);
          setLastSaved(new Date());
          setError(null);
        } catch (indexedDBError) {
          // Silent fail for auto-save - data is in memory
          const errorMsg = indexedDBError instanceof Error ? indexedDBError : new Error("Unknown error");
          setError(errorMsg);
          console.error("Auto-save failed:", errorMsg);
        }
        setIsSaving(false);
      }
    };

    saveChart();
  }, [debouncedChart]);

  return { isSaving, lastSaved, error };
}

/**
 * useKeyboardNav - Keyboard navigation utilities
 * Provides common keyboard event handlers
 */
export function useKeyboardNav() {
  const handleEsc = useCallback(
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        callback();
      }
    },
    []
  );

  const handleEnter = useCallback(
    (callback: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.stopPropagation();
        callback();
      }
    },
    []
  );

  const handleCtrlZ = useCallback(
    (callback: () => void) => (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        callback();
      }
    },
    []
  );

  return {
    handleEsc,
    handleEnter,
    handleCtrlZ,
  };
}

/**
 * useLoadChartFromStorage - Load chart from persistence on mount
 * Tries localStorage first, then IndexedDB
 */
export async function loadChartFromStorage(): Promise<RaciChart | null> {
  // Try localStorage first
  const storedChart = loadFromLocalStorage();
  if (storedChart) return storedChart;

  // Try IndexedDB as fallback
  try {
    const indexedDBChart = await loadFromIndexedDB();
    if (indexedDBChart) return indexedDBChart;
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
  }

  return null;
}
