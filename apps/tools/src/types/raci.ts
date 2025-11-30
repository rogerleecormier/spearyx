/**
 * RACI Chart Types
 * Definitions for data structures used in the RACI generator
 */

export type RaciRole = {
  id: string;
  name: string;
  order: number;
};

export type RaciTask = {
  id: string;
  name: string;
  description?: string;
  order: number;
};

// Matrix maps Role ID -> Task ID -> Value (R, A, C, I, or null)
export type RaciValue = "R" | "A" | "C" | "I" | null;
export type RaciMatrix = Record<string, Record<string, RaciValue>>;

export type RaciChart = {
  id: string;
  version: "1.0.0";
  title: string;
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: RaciMatrix;
  theme: string;
  logo?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

export type RaciAction =
  | { type: "addRole"; payload: { name: string } }
  | { type: "editRole"; payload: { id: string; name: string } }
  | { type: "deleteRole"; payload: { id: string } }
  | { type: "reorderRoles"; payload: { roles: RaciRole[] } }
  | { type: "addTask"; payload: { name: string; description?: string } }
  | { type: "editTask"; payload: { id: string; name: string; description?: string } }
  | { type: "deleteTask"; payload: { id: string } }
  | { type: "reorderTasks"; payload: { tasks: RaciTask[] } }
  | { type: "updateTitle"; payload: { title: string } }
  | { type: "updateLogo"; payload: { logo?: string } }
  | { type: "updateDescription"; payload: { description: string } }
  | { type: "updateMatrix"; payload: { matrix: RaciMatrix } }
  | { type: "updateTheme"; payload: { theme: string } }
  | {
      type: "loadTemplate";
      payload: {
        roles: RaciRole[];
        tasks: RaciTask[];
        matrix: RaciMatrix;
        title?: string;
        description?: string;
      };
    }
  | { type: "loadPreset"; payload: { matrix: RaciMatrix } }
  | { type: "reset" }
  | { type: "setState"; payload: { chart: RaciChart } };

export type ValidationError = {
  field: string;
  message: string;
  severity: "error" | "warning";
  code: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  getFieldError: (field: string) => ValidationError | undefined;
};

export type RaciSessionState = {
  chart: RaciChart;
  ui: {
    selectedTheme: string;
  };
  undo: {
    canUndo: boolean;
  };
};
