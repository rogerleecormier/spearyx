/**
 * State management for RACI Chart Generator
 * Reducer pattern for immutable state updates
 */

import { RaciChart, RaciRole, RaciTask, RaciAction } from "@/types/raci";

const CURRENT_VERSION = "2.0.0";

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return (
    crypto.randomUUID?.() ||
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
  );
}

/**
 * Create initial chart with default values
 */
export function createInitialChart(partial?: Partial<RaciChart>): RaciChart {
  return {
    id: generateUUID(),
    version: "1.0.0" as const,
    title: "Untitled Project",
    description: "",
    roles: [],
    tasks: [],
    matrix: {},
    theme: "default",
    logo: undefined,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

/**
 * Main reducer function for chart state
 * All state mutations go through here to ensure immutability
 */
export function raciReducer(state: RaciChart, action: RaciAction): RaciChart {
  switch (action.type) {
    case "addRole": {
      const newRole: RaciRole = {
        id: generateUUID(),
        name: action.payload.name,
        order: state.roles.length,
      };

      return {
        ...state,
        roles: [...state.roles, newRole],
        updatedAt: new Date().toISOString(),
      };
    }

    case "editRole": {
      return {
        ...state,
        roles: state.roles.map((r) =>
          r.id === action.payload.id ? { ...r, name: action.payload.name } : r
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case "deleteRole": {
      const roleId = action.payload.id;

      return {
        ...state,
        roles: state.roles.filter((r) => r.id !== roleId),
        matrix: Object.fromEntries(
          Object.entries(state.matrix).filter(([key]) => key !== roleId)
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case "reorderRoles": {
      return {
        ...state,
        roles: action.payload.roles,
        updatedAt: new Date().toISOString(),
      };
    }

    case "addTask": {
      const newTask: RaciTask = {
        id: generateUUID(),
        name: action.payload.name,
        description: action.payload.description,
        order: state.tasks.length,
      };

      return {
        ...state,
        tasks: [...state.tasks, newTask],
        updatedAt: new Date().toISOString(),
      };
    }

    case "editTask": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                name: action.payload.name,
                description: action.payload.description,
              }
            : t
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case "deleteTask": {
      const taskId = action.payload.id;

      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== taskId),
        matrix: Object.fromEntries(
          Object.entries(state.matrix).map(([roleId, taskMap]) => [
            roleId,
            Object.fromEntries(
              Object.entries(taskMap).filter(([key]) => key !== taskId)
            ),
          ])
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case "reorderTasks": {
      return {
        ...state,
        tasks: action.payload.tasks,
        updatedAt: new Date().toISOString(),
      };
    }

    case "updateTitle": {
      return {
        ...state,
        title: action.payload.title,
        updatedAt: new Date().toISOString(),
      };
    }

    case "updateLogo": {
      return {
        ...state,
        logo: action.payload.logo,
        updatedAt: new Date().toISOString(),
      };
    }

    case "updateDescription": {
      return {
        ...state,
        description: action.payload.description,
        updatedAt: new Date().toISOString(),
      };
    }

    case "updateMatrix": {
      return {
        ...state,
        matrix: action.payload.matrix,
        updatedAt: new Date().toISOString(),
      };
    }

    case "updateTheme": {
      return {
        ...state,
        theme: action.payload.theme,
        updatedAt: new Date().toISOString(),
      };
    }

    case "reset": {
      return createInitialChart();
    }

    case "setState": {
      return action.payload.chart;
    }

    default:
      return state;
  }
}

export { CURRENT_VERSION };
