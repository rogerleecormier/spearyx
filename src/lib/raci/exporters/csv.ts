import { RaciChart } from "@/types/raci";
import { validateChart } from "@/lib/raci/export-utils";

export interface CsvExportOptions {
  includeMetadata?: boolean;
  delimiter?: "," | ";" | "\t";
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCsvContent(
  chart: RaciChart,
  options: CsvExportOptions = {}
): string {
  const delimiter = options.delimiter || ",";
  const lines: string[] = [];

  // Metadata section (optional)
  if (options.includeMetadata !== false) {
    lines.push(`Title${delimiter}${escapeCSV(chart.title)}`);
    lines.push(`Description${delimiter}${escapeCSV(chart.description || "-")}`);
    lines.push(`Total Roles${delimiter}${chart.roles.length}`);
    lines.push(`Total Tasks${delimiter}${chart.tasks.length}`);
    lines.push(`Created${delimiter}${new Date(chart.createdAt).toISOString()}`);
    lines.push(`Updated${delimiter}${new Date(chart.updatedAt).toISOString()}`);
    lines.push("");
  }

  // Header row with roles
  const header = ["Task", ...chart.roles.map((r) => r.name)];
  lines.push(header.map(escapeCSV).join(delimiter));

  // Data rows
  for (const task of chart.tasks) {
    const row = [task.name];

    for (const role of chart.roles) {
      const value = chart.matrix[role.id]?.[task.id];
      const label = value
        ? value === "R"
          ? "Responsible"
          : value === "A"
            ? "Accountable"
            : value === "C"
              ? "Consulted"
              : "Informed"
        : "";

      row.push(label);
    }

    lines.push(row.map(escapeCSV).join(delimiter));
  }

  // Legend section
  lines.push("");
  lines.push("Legend");
  lines.push(`R${delimiter}Responsible`);
  lines.push(`A${delimiter}Accountable`);
  lines.push(`C${delimiter}Consulted`);
  lines.push(`I${delimiter}Informed`);

  return lines.join("\n");
}

export async function exportToCsv(
  chart: RaciChart,
  options: CsvExportOptions = {}
): Promise<Blob> {
  const validation = validateChart(chart);
  if (!validation.valid) {
    throw new Error(`Invalid RACI chart: ${validation.errors.join(", ")}`);
  }

  const csvContent = generateCsvContent(chart, options);
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

export async function generateCsvPreview(
  chart: RaciChart,
  options: CsvExportOptions = {}
): Promise<string> {
  const csvBlob = await exportToCsv(chart, options);
  return URL.createObjectURL(csvBlob);
}
