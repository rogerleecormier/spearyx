/**
 * RACI Preview
 * Live preview component showing matrix with selected theme
 */

import { RaciChart } from "@/types/raci";
import themes from "../config/theming.json";

interface RaciPreviewProps {
  chart: RaciChart;
  maxRows?: number;
  maxCols?: number;
  highContrast?: boolean;
}

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    border: string;
    raci: {
      r: string;
      a: string;
      c: string;
      i: string;
    };
  };
}

/**
 * Darken a hex color for high-contrast mode
 * @param hexColor - Color in hex format (#RRGGBB)
 * @param amount - Percentage to darken (0-100), default 30%
 */
function darkenColor(hexColor: string, amount: number = 30): string {
  // Remove '#' if present
  const hex = hexColor.replace("#", "");

  // Parse hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Darken by reducing brightness
  const factor = (100 - amount) / 100;
  r = Math.max(0, Math.floor(r * factor));
  g = Math.max(0, Math.floor(g * factor));
  b = Math.max(0, Math.floor(b * factor));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export default function RaciPreview({
  chart,
  maxRows = 5,
  maxCols = 6,
  highContrast = false,
}: RaciPreviewProps) {
  const themeList = Object.values(themes) as Theme[];
  const currentTheme =
    themeList.find((t) => t.id === chart.theme) || themeList[0];

  // Limit preview to avoid oversized preview pane
  const previewRoles = chart.roles.slice(0, maxCols);
  const previewTasks = chart.tasks.slice(0, maxRows);

  // Apply high-contrast adjustments - darken theme colors for better accessibility
  const getContrastColor = (raciValue: string): string => {
    const colorMap: Record<string, string> = {
      R: currentTheme.colors.raci.r,
      A: currentTheme.colors.raci.a,
      C: currentTheme.colors.raci.c,
      I: currentTheme.colors.raci.i,
    };
    const baseColor = colorMap[raciValue] || currentTheme.colors.background;

    if (!highContrast) {
      return baseColor;
    }

    // Darken the color by 35% for high-contrast mode
    return darkenColor(baseColor, 35);
  };

  const getRaciColor = (value: string | null): string => {
    if (!value) return currentTheme.colors.background;
    return getContrastColor(value);
  };

  const getRaciLabel = (value: string | null): string => {
    if (!value) return "";
    const labelMap: Record<string, string> = {
      R: "R",
      A: "A",
      C: "C",
      I: "I",
    };
    return labelMap[value] || "";
  };

  return (
    <div
      className="flex flex-col gap-4 p-4 border rounded-lg"
      style={{
        backgroundColor: currentTheme.colors.background,
        borderColor: currentTheme.colors.border,
      }}
    >
      {/* Title */}
      <div>
        <h2
          className="text-base font-bold"
          style={{ color: currentTheme.colors.primary }}
        >
          {chart.title || "Untitled Chart"}
        </h2>
      </div>

      {/* Matrix Preview */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: currentTheme.colors.primary }}>
              <th
                className="px-2 py-1 text-left font-semibold border"
                style={{
                  color: "white",
                  borderColor: currentTheme.colors.border,
                }}
              >
                Task
              </th>
              {previewRoles.map((role) => (
                <th
                  key={role.id}
                  className="px-2 py-1 text-center font-semibold border whitespace-nowrap"
                  style={{
                    color: "white",
                    borderColor: currentTheme.colors.border,
                  }}
                  title={role.name}
                >
                  {role.name.substring(0, 8)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewTasks.map((task, taskIdx) => (
              <tr
                key={task.id}
                style={{
                  backgroundColor:
                    taskIdx % 2 === 0
                      ? currentTheme.colors.background
                      : "#f9fafb",
                }}
              >
                <td
                  className="px-2 py-1 font-medium border text-ellipsis overflow-hidden max-w-[120px]"
                  style={{
                    color: currentTheme.colors.text,
                    borderColor: currentTheme.colors.border,
                  }}
                  title={task.name}
                >
                  {task.name}
                </td>
                {previewRoles.map((role) => {
                  const value = chart.matrix[role.id]?.[task.id];
                  const cellColor = getRaciColor(value);
                  const label = getRaciLabel(value);

                  return (
                    <td
                      key={`${role.id}-${task.id}`}
                      className="px-2 py-1 text-center font-semibold border"
                      style={{
                        backgroundColor: cellColor,
                        borderColor: currentTheme.colors.border,
                        color: value ? "white" : currentTheme.colors.text,
                      }}
                    >
                      {label}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        className="grid grid-cols-4 gap-2 pt-2 border-t"
        style={{ borderTopColor: currentTheme.colors.border }}
      >
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: currentTheme.colors.raci.r }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: currentTheme.colors.text }}
          >
            R
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: currentTheme.colors.raci.a }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: currentTheme.colors.text }}
          >
            A
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: currentTheme.colors.raci.c }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: currentTheme.colors.text }}
          >
            C
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: currentTheme.colors.raci.i }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: currentTheme.colors.text }}
          >
            I
          </span>
        </div>
      </div>

      {/* Preview Info */}
      {(chart.roles.length > maxCols || chart.tasks.length > maxRows) && (
        <p
          className="text-xs italic"
          style={{ color: currentTheme.colors.text }}
        >
          Preview showing {previewRoles.length} of {chart.roles.length} roles
          and {previewTasks.length} of {chart.tasks.length} tasks
        </p>
      )}
    </div>
  );
}
