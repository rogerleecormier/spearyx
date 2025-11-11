"use client";

import { Workbook, Worksheet } from "exceljs";
import { RaciChart } from "@/types/raci";
import { validateChart, getActiveTheme } from "@/lib/raci/export-utils";

export interface XlsxExportOptions {
  themeId?: string;
  includeMetadata?: boolean;
  includeLegend?: boolean;
}

interface XlsxTheme {
  colors: {
    primary: string;
    accent: string;
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

function getXlsxTheme(themeId?: string): XlsxTheme {
  const baseTheme = getActiveTheme(themeId || "default");
  return {
    colors: {
      primary: baseTheme.colors.primary.replace("#", ""),
      accent: baseTheme.colors.accent.replace("#", ""),
      background: baseTheme.colors.background.replace("#", ""),
      text: baseTheme.colors.text.replace("#", ""),
      border: "e2e8f0",
      raci: {
        r: baseTheme.colors.raci.r.replace("#", ""),
        a: baseTheme.colors.raci.a.replace("#", ""),
        c: baseTheme.colors.raci.c.replace("#", ""),
        i: baseTheme.colors.raci.i.replace("#", ""),
      },
    },
  };
}

function createMatrixSheet(
  workbook: Workbook,
  chart: RaciChart,
  theme: XlsxTheme
): Worksheet {
  const sheet = workbook.addWorksheet("RACI Matrix");

  // Header row with roles
  const headerValues = ["Task"];
  chart.roles.forEach((role) => {
    headerValues.push(role.name);
  });
  const headerRow = sheet.addRow(headerValues);

  // Style header row
  const headerFont = { bold: true, color: { argb: "FFFFFFFF" } };

  headerRow.font = headerFont;
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${theme.colors.primary}` },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // Data rows
  for (const task of chart.tasks) {
    const rowValues: string[] = [task.name];

    chart.roles.forEach((role) => {
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

      rowValues.push(label);
    });

    const dataRow = sheet.addRow(rowValues);

    // Apply styling to each cell
    chart.roles.forEach((role, roleIndex) => {
      const cellIndex = roleIndex + 2; // +2 because Excel is 1-indexed and first column is task name
      const cell = dataRow.getCell(cellIndex);
      const value = chart.matrix[role.id]?.[task.id];

      if (value) {
        const colorMap: Record<string, string> = {
          R: theme.colors.raci.r,
          A: theme.colors.raci.a,
          C: theme.colors.raci.c,
          I: theme.colors.raci.i,
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${colorMap[value]}` },
        };
      }

      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  }

  // Set column widths
  sheet.getColumn(1).width = 30;
  chart.roles.forEach((_, index) => {
    sheet.getColumn(index + 2).width = 20;
  });

  return sheet;
}

function createLegendSheet(workbook: Workbook, theme: XlsxTheme): Worksheet {
  const sheet = workbook.addWorksheet("Legend");

  const titleRow = sheet.addRow(["RACI Legend"]);
  titleRow.font = {
    bold: true,
    size: 14,
    color: { argb: `FF${theme.colors.text}` },
  };

  sheet.addRow([]);

  const legendItems = [
    { label: "R - Responsible", color: theme.colors.raci.r },
    { label: "A - Accountable", color: theme.colors.raci.a },
    { label: "C - Consulted", color: theme.colors.raci.c },
    { label: "I - Informed", color: theme.colors.raci.i },
  ];

  for (const item of legendItems) {
    const row = sheet.addRow([item.label]);
    const cell = row.getCell(1);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${item.color}` },
    };
    cell.font = { bold: true, size: 11 };
    cell.alignment = { vertical: "middle", wrapText: true };
  }

  sheet.getColumn(1).width = 40;

  return sheet;
}

function createMetadataSheet(workbook: Workbook, chart: RaciChart): Worksheet {
  const sheet = workbook.addWorksheet("Metadata");

  const data = [
    ["Title", chart.title],
    ["Description", chart.description || "-"],
    ["Total Roles", chart.roles.length],
    ["Total Tasks", chart.tasks.length],
    ["Created", new Date(chart.createdAt).toLocaleString()],
    ["Updated", new Date(chart.updatedAt).toLocaleString()],
    ["Version", chart.version],
  ];

  for (const [key, value] of data) {
    const row = sheet.addRow([key, value]);
    row.getCell(1).font = { bold: true };
  }

  sheet.getColumn(1).width = 20;
  sheet.getColumn(2).width = 40;

  return sheet;
}

export async function exportToXlsx(
  chart: RaciChart,
  options: XlsxExportOptions = {}
): Promise<Blob> {
  const validation = validateChart(chart);
  if (!validation.valid) {
    throw new Error(`Invalid RACI chart: ${validation.errors.join(", ")}`);
  }

  const theme = getXlsxTheme(options.themeId);
  const workbook = new Workbook();

  // Create sheets
  createMatrixSheet(workbook, chart, theme);

  if (options.includeLegend !== false) {
    createLegendSheet(workbook, theme);
  }

  if (options.includeMetadata !== false) {
    createMetadataSheet(workbook, chart);
  }

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function generateXlsxPreview(chart: RaciChart): Promise<string> {
  const xlsxBlob = await exportToXlsx(chart);
  return URL.createObjectURL(xlsxBlob);
}
