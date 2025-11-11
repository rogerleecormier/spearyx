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

  // Header section with chart title
  lines.push(`RACI Matrix: ${chart.title}`);
  lines.push("");

  // Metadata section (optional)
  if (options.includeMetadata !== false) {
    lines.push("CHART INFORMATION");
    lines.push(`Title${delimiter}${escapeCSV(chart.title)}`);
    lines.push(`Description${delimiter}${escapeCSV(chart.description || "(No description)")}`);
    if (chart.logo) {
      lines.push(`Logo${delimiter}[Included in export]`);
    }
    lines.push(`Total Roles${delimiter}${chart.roles.length}`);
    lines.push(`Total Tasks${delimiter}${chart.tasks.length}`);
    lines.push(`Created${delimiter}${new Date(chart.createdAt).toLocaleDateString()}`);
    lines.push(`Updated${delimiter}${new Date(chart.updatedAt).toLocaleDateString()}`);
    lines.push("");
  }

  // RACI Matrix section
  lines.push("RACI MATRIX");
  lines.push("");

  // Header row with roles
  const header = ["Task", ...chart.roles.map((r) => r.name)];
  lines.push(header.map(escapeCSV).join(delimiter));

  // Data rows
  for (const task of chart.tasks) {
    const row = [task.name];

    for (const role of chart.roles) {
      const value = chart.matrix[role.id]?.[task.id];
      row.push(value || "");
    }

    lines.push(row.map(escapeCSV).join(delimiter));
  }

  // Legend section
  lines.push("");
  lines.push("LEGEND");
  lines.push("Code" + delimiter + "Title");
  lines.push(`R${delimiter}Responsible`);
  lines.push(`A${delimiter}Accountable`);
  lines.push(`C${delimiter}Consulted`);
  lines.push(`I${delimiter}Informed`);

  // Footer
  lines.push("");
  lines.push(`Generated${delimiter}${new Date().toLocaleString()}`);
  lines.push(`Format${delimiter}CSV (Comma-Separated Values)`);

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
