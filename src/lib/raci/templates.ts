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
  const data = templatesData[id as keyof typeof templatesData];

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
 * Quick preset patterns for common RACI assignments
 * These generate matrix templates based on standard patterns
 * 
 * Following RACI best practices:
 * - Exactly ONE Accountable (A) per task
 * - Avoid "All Responsible" or "All Accountable" (creates confusion)
 * - Avoid single bottleneck patterns (poor for distributed teams)
 * - Focus on realistic technical project structures
 */
export const QUICK_PRESETS = {
  /**
   * One Accountable per Task: Rotate accountable role per task
   * BEST PRACTICE: Ensures single accountable per task, others responsible/consulted
   * Realistic for balanced team structures where accountability rotates by domain
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
   * Execution Model: One R, one A, all others C or I
   * BEST PRACTICE: Strict RACI implementation with clear ownership and support roles
   * One executor, one decision-maker, others provide input or stay informed
   */
  executionModel: (
    roleIds: string[],
    taskIds: string[]
  ): RaciChart["matrix"] => {
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

  /**
   * Functional Team Model: Role-specific accountability by domain
   * RECOMMENDED: First role (subject matter expert) responsible, second role (lead/manager) accountable
   * Ideal for cross-functional teams where domain experts execute and leads approve
   */
  functionalTeamModel: (
    roleIds: string[],
    taskIds: string[]
  ): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};

    if (roleIds.length < 2) {
      // Fallback: Use executionModel if insufficient roles
      return QUICK_PRESETS.executionModel(roleIds, taskIds);
    }

    for (const roleId of roleIds) {
      matrix[roleId] = {};
    }

    for (const taskId of taskIds) {
      for (let i = 0; i < roleIds.length; i++) {
        const roleId = roleIds[i];
        if (i === 0) {
          // First role: Responsible (executes the work)
          matrix[roleId][taskId] = "R";
        } else if (i === 1) {
          // Second role: Accountable (approves/owns outcome)
          matrix[roleId][taskId] = "A";
        } else {
          // Others: Consulted for broader perspective
          matrix[roleId][taskId] = "C";
        }
      }
    }

    return matrix;
  },

  /**
   * Reviewer/Approval Model: Task owner executes, reviewer approves
   * RECOMMENDED: Strong for code review, QA approval workflows in tech teams
   * First role responsible, second role accountable with mandatory review, others informed of completion
   */
  reviewerApprovalModel: (
    roleIds: string[],
    taskIds: string[]
  ): RaciChart["matrix"] => {
    const matrix: RaciChart["matrix"] = {};

    if (roleIds.length < 2) {
      // Fallback: Use executionModel if insufficient roles
      return QUICK_PRESETS.executionModel(roleIds, taskIds);
    }

    for (const roleId of roleIds) {
      matrix[roleId] = {};
    }

    for (const taskId of taskIds) {
      for (let i = 0; i < roleIds.length; i++) {
        const roleId = roleIds[i];
        if (i === 0) {
          // First role: Responsible (implements/executes)
          matrix[roleId][taskId] = "R";
        } else if (i === 1) {
          // Second role: Accountable (mandatory reviewer/approver)
          matrix[roleId][taskId] = "A";
        } else {
          // Others: Informed of task completion
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
    oneAccountablePerTask: {
      name: "One Accountable per Task",
      description: "Each task has exactly one accountable role, rotating accountability",
    },
    executionModel: {
      name: "Execution Model",
      description: "One executor, one decision-maker, others consulted or informed",
    },
    functionalTeamModel: {
      name: "Functional Team Model",
      description: "Domain expert responsible, team lead accountable, others consulted",
    },
    reviewerApprovalModel: {
      name: "Reviewer/Approval Model",
      description: "Task owner executes, reviewer approves, others informed",
    },
  };

  return info[presetKey] || { name: "Unknown", description: "Unknown preset" };
}
