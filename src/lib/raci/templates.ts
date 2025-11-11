/**
 * Template loading and management utilities
 * Provides functions to load, validate, and apply RACI templates
 */

import templatesData from "@/config/templates.json";
import { RaciChart, RaciRole, RaciTask } from "@/types/raci";
import { createInitialChart } from "./state";

export interface RaciTemplate {
  id: string;
  name: string;
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: RaciChart["matrix"];
}

export interface RaciPreset {
  id: string;
  name: string;
  description: string;
  matrix: RaciChart["matrix"];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all available templates
 */
export function getTemplates(): RaciTemplate[] {
  const templates: RaciTemplate[] = [];

  for (const [, templateData] of Object.entries(templatesData)) {
    const template: RaciTemplate = {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      roles: templateData.roles,
      tasks: templateData.tasks,
      matrix: templateData.matrix as RaciChart["matrix"],
    };
    templates.push(template);
  }

  return templates;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): RaciTemplate | null {
  const data =
    templatesData[id as keyof typeof templatesData];

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    roles: data.roles,
    tasks: data.tasks,
    matrix: data.matrix as RaciChart["matrix"],
  };
}

/**
 * Validate template structure
 */
export function validateTemplate(template: RaciTemplate): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.id) errors.push("Template must have an id");
  if (!template.name) errors.push("Template must have a name");
  if (!template.roles || template.roles.length === 0)
    errors.push("Template must have at least one role");
  if (!template.tasks || template.tasks.length === 0)
    errors.push("Template must have at least one task");
  if (!template.matrix || Object.keys(template.matrix).length === 0)
    errors.push("Template must have a matrix");

  // Validate matrix values
  for (const [roleId, taskMap] of Object.entries(template.matrix)) {
    if (!roleId) continue;
    for (const [taskId, value] of Object.entries(taskMap)) {
      if (!taskId) continue;
      if (value && !["R", "A", "C", "I"].includes(value as string)) {
        errors.push(
          `Invalid RACI value "${value}" for role "${roleId}" and task "${taskId}"`
        );
      }
    }
  }

  // Validate role IDs exist
  const roleIds = new Set(template.roles.map((r) => r.id));
  for (const roleId of Object.keys(template.matrix)) {
    if (!roleIds.has(roleId)) {
      errors.push(
        `Matrix references role ID "${roleId}" which doesn't exist in roles list`
      );
    }
  }

  // Validate task IDs exist
  const taskIds = new Set(template.tasks.map((t) => t.id));
  for (const roleTaskMap of Object.values(template.matrix)) {
    for (const taskId of Object.keys(roleTaskMap)) {
      if (!taskIds.has(taskId)) {
        errors.push(
          `Matrix references task ID "${taskId}" which doesn't exist in tasks list`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Load template into chart
 * Creates new chart with template data
 */
export function loadTemplate(
  template: RaciTemplate,
  partial?: Partial<RaciChart>
): RaciChart {
  const chart = createInitialChart({
    title: `${template.name} - New Project`,
    description: template.description,
    roles: template.roles,
    tasks: template.tasks,
    matrix: template.matrix,
    ...partial,
  });

  return chart;
}

/**
 * Load preset (custom matrix) into chart
 * Merges preset matrix with existing chart structure
 */
export function loadPresetMatrix(
  chart: RaciChart,
  preset: Partial<RaciChart["matrix"]>
): RaciChart {
  return {
    ...chart,
    matrix: {
      ...chart.matrix,
      ...preset,
    } as RaciChart["matrix"],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get custom presets from localStorage
 */
export function getCustomPresets(): RaciPreset[] {
  try {
    const stored = localStorage.getItem("raci_custom_presets");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load custom presets:", error);
    return [];
  }
}

/**
 * Save custom preset to localStorage
 */
export function saveCustomPreset(preset: Omit<RaciPreset, "id" | "createdAt" | "updatedAt">): RaciPreset {
  const newPreset: RaciPreset = {
    ...preset,
    id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const presets = getCustomPresets();
    presets.push(newPreset);
    localStorage.setItem("raci_custom_presets", JSON.stringify(presets));
    return newPreset;
  } catch (error) {
    console.error("Failed to save custom preset:", error);
    throw error;
  }
}

/**
 * Delete custom preset from localStorage
 */
export function deleteCustomPreset(id: string): boolean {
  try {
    const presets = getCustomPresets();
    const filtered = presets.filter((p) => p.id !== id);
    if (filtered.length === presets.length) return false; // Not found

    localStorage.setItem("raci_custom_presets", JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete custom preset:", error);
    return false;
  }
}

/**
 * Update custom preset
 */
export function updateCustomPreset(id: string, updates: Partial<RaciPreset>): RaciPreset | null {
  try {
    const presets = getCustomPresets();
    const index = presets.findIndex((p) => p.id === id);

    if (index === -1) return null;

    const updated: RaciPreset = {
      ...presets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    presets[index] = updated;
    localStorage.setItem("raci_custom_presets", JSON.stringify(presets));
    return updated;
  } catch (error) {
    console.error("Failed to update custom preset:", error);
    return null;
  }
}

/**
 * Quick preset patterns for common RACI assignments
 * These generate matrix templates based on standard patterns
 */

export const QUICK_PRESETS = {
  /**
   * All Responsible: All roles are Responsible
   * Common for broad collaborative tasks
   */
  allResponsible: (roleIds: string[], taskIds: string[]): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};
    for (const roleId of roleIds) {
      matrix[roleId] = {};
      for (const taskId of taskIds) {
        matrix[roleId][taskId] = "R";
      }
    }
    return matrix;
  },

  /**
   * All Accountable: All roles are Accountable
   * Common for accountability tracking
   */
  allAccountable: (roleIds: string[], taskIds: string[]): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};
    for (const roleId of roleIds) {
      matrix[roleId] = {};
      for (const taskId of taskIds) {
        matrix[roleId][taskId] = "A";
      }
    }
    return matrix;
  },

  /**
   * One Accountable per Task: Rotate accountable role per task
   * Ensures single accountable per task, others consulted/informed
   */
  oneAccountablePerTask: (
    roleIds: string[],
    taskIds: string[]
  ): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};

    for (const roleId of roleIds) {
      matrix[roleId] = {};
    }

    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const accountableIndex = i % roleIds.length;

      for (let j = 0; j < roleIds.length; j++) {
        const roleId = roleIds[j];
        if (j === accountableIndex) {
          matrix[roleId][taskId] = "A";
        } else if (j === 0) {
          matrix[roleId][taskId] = "R";
        } else {
          matrix[roleId][taskId] = "C";
        }
      }
    }

    return matrix;
  },

  /**
   * CEO/Lead Accountable: First role (CEO/Lead) accountable, others responsible/consulted
   * Classic hierarchical pattern
   */
  leaderAccountable: (roleIds: string[], taskIds: string[]): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};

    for (const roleId of roleIds) {
      matrix[roleId] = {};
    }

    for (const taskId of taskIds) {
      for (let i = 0; i < roleIds.length; i++) {
        const roleId = roleIds[i];
        if (i === 0) {
          matrix[roleId][taskId] = "A";
        } else if (i === 1) {
          matrix[roleId][taskId] = "R";
        } else {
          matrix[roleId][taskId] = "C";
        }
      }
    }

    return matrix;
  },

  /**
   * Distributed: Each role has one task as Accountable
   * Distributes accountability across roles
   */
  distributed: (roleIds: string[], taskIds: string[]): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};

    for (const roleId of roleIds) {
      matrix[roleId] = {};
    }

    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      for (let j = 0; j < roleIds.length; j++) {
        const roleId = roleIds[j];
        const isAccountable = j === (i % roleIds.length);

        if (isAccountable) {
          matrix[roleId][taskId] = "A";
        } else if (j < roleIds.length - 1) {
          matrix[roleId][taskId] = "R";
        } else {
          matrix[roleId][taskId] = "I";
        }
      }
    }

    return matrix;
  },

  /**
   * Execution Model: One R, one A, all others C or I
   * Follows strict RACI principles
   */
  executionModel: (roleIds: string[], taskIds: string[]): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};

    for (const roleId of roleIds) {
      matrix[roleId] = {};
    }

    for (const taskId of taskIds) {
      for (let i = 0; i < roleIds.length; i++) {
        const roleId = roleIds[i];
        if (i === 0) {
          matrix[roleId][taskId] = "R";
        } else if (i === 1) {
          matrix[roleId][taskId] = "A";
        } else if (i < roleIds.length - 1) {
          matrix[roleId][taskId] = "C";
        } else {
          matrix[roleId][taskId] = "I";
        }
      }
    }

    return matrix;
  },
};

/**
 * Generate quick preset name and description
 */
export function getQuickPresetInfo(presetKey: string): {
  name: string;
  description: string;
} {
  const info: Record<string, { name: string; description: string }> = {
    allResponsible: {
      name: "All Responsible",
      description: "All roles are responsible for all tasks",
    },
    allAccountable: {
      name: "All Accountable",
      description: "All roles are accountable for all tasks",
    },
    oneAccountablePerTask: {
      name: "One Accountable per Task",
      description: "Each task has exactly one accountable role",
    },
    leaderAccountable: {
      name: "Leader Accountable",
      description: "First role accountable, others responsible or consulted",
    },
    distributed: {
      name: "Distributed Accountability",
      description: "Accountability distributed across roles",
    },
    executionModel: {
      name: "Execution Model",
      description: "One R, one A, others C or I per task",
    },
  };

  return (
    info[presetKey] || { name: "Unknown", description: "Unknown preset" }
  );
}
