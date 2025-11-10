/**
 * RACI Chart Type Definitions
 * Core interfaces for the RACI Chart Generator
 */

/**
 * RACI value type - exactly one per (role, task) cell
 */
export type RaciValue = "R" | "A" | "C" | "I" | null;

/**
 * Represents a single role in the RACI chart
 */
export interface RaciRole {
  id: string; // UUID
  name: string;
  order: number;
}

/**
 * Represents a single task in the RACI chart
 */
export interface RaciTask {
  id: string; // UUID
  name: string;
  description?: string;
  order: number;
}

/**
 * Main RACI chart data structure
 * Persistent, shareable, and exportable
 */
export interface RaciChart {
  id: string; // UUID
  version: "1.0.0";
  timestamp: string; // ISO 8601 UTC
  title: string;
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: Record<string, Record<string, RaciValue>>; // roles -> tasks -> {R|A|C|I|null}
  theme: string; // theme key from theming.json
  logo?: string; // Base64 encoded image
  createdAt: string; // ISO 8601 UTC
  updatedAt: string; // ISO 8601 UTC
}

/**
 * Undo/Redo state tracking
 */
export interface RaciUndoState {
  current: RaciChart;
  previous: RaciChart | null;
  canUndo: boolean;
  lastAction: string; // Action description for debugging
}

/**
 * Validation error details with error code
 */
export interface ValidationError {
  field: string; // e.g., "title", "roles", "matrix"
  message: string;
  severity: "error" | "warning";
  code: string; // e.g., "ROLE_EMPTY", "ROLE_DUPLICATE"
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

/**
 * Validation result with helper methods
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  getFieldError: (field: string) => ValidationError | undefined;
}

/**
 * Notification state for toasts
 */
export interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
  duration: number; // milliseconds
  dismissible: boolean;
}

/**
 * UI state for the RACI editor
 */
export interface RaciUIState {
  selectedTheme: string;
  showPreview: boolean;
  highContrastMode: boolean;
  notification: NotificationState | null;
  isLoading: boolean;
  lastSavedAt: string; // ISO 8601 UTC
}

/**
 * Complete session state for the RACI generator
 */
export interface RaciSessionState {
  chart: RaciChart;
  undo: RaciUndoState;
  ui: RaciUIState;
  validation: ValidationResult;
}

/**
 * Encoded payload for public links
 */
export interface RaciEncodedPayload {
  version: "1.0.0";
  timestamp: string;
  chart: RaciChart;
}

/**
 * AI suggestion result
 */
export interface RaciAISuggestion {
  roles?: string[];
  tasks?: Array<{ name: string; description?: string }>;
  matrix?: Record<string, Record<string, RaciValue>>;
  confidence: number; // 0-1
}

/**
 * File upload result
 */
export interface FileUploadResult {
  success: boolean;
  data?: string; // Base64 encoded
  error?: string;
  fileName?: string;
}

/**
 * Export options
 */
export interface ExportOptions {
  format: "pdf" | "xlsx" | "pptx" | "png" | "csv";
  filename: string;
  theme: string;
}

/**
 * Reducer action types for useRaciState
 * Union type for all possible state mutations
 */
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
  | { type: "updateMatrix"; payload: { matrix: Record<string, Record<string, RaciValue>> } }
  | { type: "updateTheme"; payload: { theme: string } }
  | { type: "reset" }
  | { type: "setState"; payload: { chart: RaciChart } };
