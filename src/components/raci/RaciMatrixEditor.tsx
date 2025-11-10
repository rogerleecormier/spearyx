/**
 * RACI Matrix Editor
 * Interactive color-coded matrix with exclusive cell assignment
 */

import { RaciChart, RaciValue } from "@/types/raci";

interface RaciMatrixEditorProps {
  chart: RaciChart;
  onChange: (chart: RaciChart) => void;
}

export default function RaciMatrixEditor({
  chart,
  onChange,
}: RaciMatrixEditorProps) {
  const raciOptions: RaciValue[] = ["R", "A", "C", "I"];

  const toggleCell = (roleId: string, taskId: string, value: RaciValue) => {
    const currentValue = chart.matrix[roleId]?.[taskId] || null;
    const newValue = currentValue === value ? null : value;

    const newMatrix = { ...chart.matrix };
    if (!newMatrix[roleId]) {
      newMatrix[roleId] = {};
    }
    newMatrix[roleId][taskId] = newValue;

    onChange({ ...chart, matrix: newMatrix });
  };

  const getCellColor = (value: RaciValue): string => {
    switch (value) {
      case "R":
        return "bg-green-50 border-green-300 text-green-700";
      case "A":
        return "bg-red-50 border-red-300 text-red-700";
      case "C":
        return "bg-accent-50 border-accent-300 text-accent-700";
      case "I":
        return "bg-gray-50 border-gray-300 text-gray-700";
      default:
        return "bg-white border-gray-200 text-gray-600";
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-auto bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground min-w-[150px] border-r border-border">
              Role
            </th>
            {chart.tasks.map((task) => (
              <th
                key={task.id}
                className="px-3 py-3 text-center text-sm font-semibold text-foreground min-w-[100px] border-r border-border last:border-r-0"
              >
                <div className="text-xs font-medium break-words">
                  {task.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.roles.map((role) => (
            <tr
              key={role.id}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-3 text-sm font-medium text-foreground border-r border-border bg-muted/50">
                {role.name}
              </td>
              {chart.tasks.map((task) => {
                const value = chart.matrix[role.id]?.[task.id] || null;
                return (
                  <td
                    key={`${role.id}-${task.id}`}
                    className="px-2 py-2 text-center border-r border-border last:border-r-0"
                  >
                    <div
                      className={`h-12 flex items-center justify-center border-2 rounded transition-all cursor-pointer ${getCellColor(value)}`}
                    >
                      <select
                        value={value || ""}
                        onChange={(e) =>
                          toggleCell(
                            role.id,
                            task.id,
                            (e.target.value as RaciValue) || null
                          )
                        }
                        className="w-full h-full bg-transparent text-center font-bold appearance-none focus:outline-none cursor-pointer"
                        aria-label={`RACI assignment for ${role.name} - ${task.name}`}
                      >
                        <option value="">-</option>
                        {raciOptions.map((opt) => (
                          <option key={opt} value={opt as string}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
