/**
 * Validation logic for RACI Chart
 * Centralized validation rules with helpful error messages
 */

import {
  RaciChart,
  RaciRole,
  RaciTask,
  ValidationError,
  ValidationResult,
} from "@/types/raci";

/**
 * Validate a single role name
 * Checks for empty, duplicates, and length
 */
export function validateRoleName(
  name: string,
  existingRoles: RaciRole[] = [],
  excludeId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = name.trim();

  if (!trimmed) {
    errors.push({
      field: "roleName",
      message: "Role name cannot be empty",
      severity: "error",
      code: "ROLE_EMPTY",
    });
    return errors;
  }

  if (trimmed.length > 50) {
    errors.push({
      field: "roleName",
      message: "Role name too long (max 50 characters)",
      severity: "error",
      code: "ROLE_TOO_LONG",
    });
  }

  const duplicate = existingRoles.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase() && r.id !== excludeId
  );

  if (duplicate) {
    errors.push({
      field: "roleName",
      message: "Role name already exists",
      severity: "error",
      code: "ROLE_DUPLICATE",
    });
  }

  return errors;
}

/**
 * Validate a single task name
 */
export function validateTaskName(
  name: string,
  existingTasks: RaciTask[] = [],
  excludeId?: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = name.trim();

  if (!trimmed) {
    errors.push({
      field: "taskName",
      message: "Task name cannot be empty",
      severity: "error",
      code: "TASK_EMPTY",
    });
    return errors;
  }

  if (trimmed.length > 100) {
    errors.push({
      field: "taskName",
      message: "Task name too long (max 100 characters)",
      severity: "error",
      code: "TASK_TOO_LONG",
    });
  }

  const duplicate = existingTasks.some(
    (t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== excludeId
  );

  if (duplicate) {
    errors.push({
      field: "taskName",
      message: "Task name already exists",
      severity: "error",
      code: "TASK_DUPLICATE",
    });
  }

  return errors;
}

/**
 * Validate task description
 */
export function validateTaskDescription(
  description?: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (description && description.length > 500) {
    errors.push({
      field: "taskDescription",
      message: "Task description too long (max 500 characters)",
      severity: "error",
      code: "TASK_DESC_TOO_LONG",
    });
  }

  return errors;
}

/**
 * Validate chart title
 */
export function validateTitle(title: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = title.trim();

  if (!trimmed) {
    errors.push({
      field: "title",
      message: "Project title cannot be empty",
      severity: "error",
      code: "TITLE_EMPTY",
    });
    return errors;
  }

  if (trimmed.length > 100) {
    errors.push({
      field: "title",
      message: "Project title too long (max 100 characters)",
      severity: "error",
      code: "TITLE_TOO_LONG",
    });
  }

  return errors;
}

/**
 * Validate logo file
 */
export function validateLogoFile(file: File): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check file type
  const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: "logo",
      message: "Invalid file type (only PNG, JPG, SVG allowed)",
      severity: "error",
      code: "LOGO_INVALID_TYPE",
    });
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push({
      field: "logo",
      message: "File too large (max 5MB)",
      severity: "error",
      code: "LOGO_TOO_LARGE",
    });
  }

  return errors;
}

/**
 * Validate entire chart
 * Performs comprehensive validation
 */
export function validateChart(chart: RaciChart): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate title
  errors.push(...validateTitle(chart.title));

  // Validate all roles
  chart.roles.forEach((role) => {
    errors.push(...validateRoleName(role.name, chart.roles, role.id));
  });

  // Validate all tasks
  chart.tasks.forEach((task) => {
    errors.push(...validateTaskName(task.name, chart.tasks, task.id));
    errors.push(...validateTaskDescription(task.description));

    // Check if task has at least one Accountable
    const hasAccountable = chart.roles.some(
      (role) => chart.matrix[role.id]?.[task.id] === "A"
    );

    if (!hasAccountable && chart.roles.length > 0) {
      errors.push({
        field: "matrix",
        message: `Task "${task.name}" must have at least one Accountable (A)`,
        severity: "error",
        code: "TASK_NO_ACCOUNTABLE",
      });
    }
  });

  // Separate errors and warnings
  const chartErrors = errors.filter((e) => e.severity === "error");
  const warnings = errors.filter((e) => e.severity === "warning");

  const isValid = chartErrors.length === 0;

  return {
    isValid,
    errors: chartErrors,
    warnings: warnings,
    getFieldError: (field: string) =>
      chartErrors.find((e) => e.field === field),
  };
}

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    ROLE_EMPTY: "Role name cannot be empty",
    ROLE_DUPLICATE: "Role name already exists",
    ROLE_TOO_LONG: "Role name too long (max 50 characters)",
    TASK_EMPTY: "Task name cannot be empty",
    TASK_DUPLICATE: "Task name already exists",
    TASK_TOO_LONG: "Task name too long (max 100 characters)",
    TASK_DESC_TOO_LONG: "Task description too long (max 500 characters)",
    TASK_NO_ACCOUNTABLE: "Task must have at least one Accountable (A)",
    TITLE_EMPTY: "Project title cannot be empty",
    TITLE_TOO_LONG: "Project title too long (max 100 characters)",
    LOGO_INVALID_TYPE: "Invalid file type (only PNG, JPG, SVG allowed)",
    LOGO_TOO_LARGE: "File too large (max 5MB)",
  };

  return messages[code] || "Invalid input";
}
