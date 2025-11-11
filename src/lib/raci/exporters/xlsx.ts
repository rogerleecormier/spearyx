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

  // Title row - will share row with logo
  const titleRowNum = 1;
  sheet.addRow([chart.title]);
  sheet.getRow(titleRowNum).font = {
    bold: true,
    size: 14,
    color: { argb: `FF${theme.colors.primary}` },
  };
  sheet.getRow(titleRowNum).alignment = {
    horizontal: "left",
    vertical: "middle",
  };
  sheet.mergeCells(
    `B${titleRowNum}:${String.fromCharCode(65 + chart.roles.length)}${titleRowNum}`
  );
  sheet.getRow(titleRowNum).height = 24;

  // Logo if available - placed in same row as title (column A)
  if (chart.logo) {
    try {
      // Convert base64 to buffer for exceljs
      const base64Data = chart.logo.split(",")[1] || chart.logo;
      const logoBuffer = Buffer.from(base64Data, "base64") as any;

      const imageId = workbook.addImage({
        buffer: logoBuffer,
        extension: "png",
      });

      // Place logo in column A, same row as title
      sheet.addImage(imageId, "A1:A1");
      sheet.getColumn("A").width = 5;
    } catch (e) {
      console.error("Failed to add logo to XLSX:", e);
    }
  }

  // Description row (if exists)
  let currentRow = 2;
  if (chart.description) {
    sheet.addRow([chart.description]);
    sheet.getRow(currentRow).font = {
      size: 11,
      italic: true,
      color: { argb: `FF${theme.colors.text}` },
    };
    sheet.getRow(currentRow).alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    sheet.mergeCells(
      `A${currentRow}:${String.fromCharCode(65 + chart.roles.length)}${currentRow}`
    );
    sheet.getRow(currentRow).height = 18;
    currentRow = currentRow + 1;
  }

  // Empty row for spacing
  currentRow++;

  // Header row with roles
  const headerValues = ["Task"];
  chart.roles.forEach((role) => {
    headerValues.push(role.name);
  });
  const headerRow = sheet.addRow(headerValues);
  sheet.getRow(currentRow).height = 18;

  // Style header row - primary color background with white text
  const headerFont = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  for (let i = 1; i <= chart.roles.length + 1; i++) {
    const cell = headerRow.getCell(i);
    cell.font = headerFont;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${theme.colors.primary}` },
    };
    cell.alignment = {
      horizontal: i === 1 ? "left" : "center",
      vertical: "middle",
    };
    cell.border = {
      top: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      bottom: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      left: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      right: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
    };
  }

  // Data rows
  let rowIndex = 0;
  for (const task of chart.tasks) {
    const rowValues: string[] = [task.name];

    chart.roles.forEach((role) => {
      const value = chart.matrix[role.id]?.[task.id];
      rowValues.push(value || "");
    });

    const dataRow = sheet.addRow(rowValues);
    sheet.getRow(currentRow + 1 + rowIndex).height = 16;

    // Alternate row background
    const isAlternate = rowIndex % 2 === 1;
    const bgColor = isAlternate ? "f9fafb" : "ffffff";

    // Style task name cell
    const taskCell = dataRow.getCell(1);
    taskCell.font = {
      bold: true,
      size: 11,
      color: { argb: `FF${theme.colors.text}` },
    };
    taskCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${bgColor}` },
    };
    taskCell.alignment = { horizontal: "left", vertical: "middle" };
    taskCell.border = {
      top: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      bottom: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      left: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      right: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
    };

    // Apply styling to each RACI cell
    chart.roles.forEach((role, roleIndex) => {
      const cellIndex = roleIndex + 2;
      const cell = dataRow.getCell(cellIndex);
      const value = chart.matrix[role.id]?.[task.id];

      cell.font = { bold: true, size: 11 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
        bottom: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
        left: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
        right: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      };

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
        cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
      } else {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${bgColor}` },
        };
        cell.font = { size: 11, color: { argb: `FF${theme.colors.text}` } };
      }
    });

    rowIndex++;
  }

  // Set column widths
  sheet.getColumn(1).width = 30;
  chart.roles.forEach((_, index) => {
    sheet.getColumn(index + 2).width = 16;
  });

  return sheet;
}

function createLegendSheet(workbook: Workbook, theme: XlsxTheme): Worksheet {
  const sheet = workbook.addWorksheet("Legend");

  // Title
  const titleRow = sheet.addRow(["RACI Legend"]);
  titleRow.font = {
    bold: true,
    size: 14,
    color: { argb: `FF${theme.colors.primary}` },
  };
  titleRow.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 18;

  sheet.addRow([]); // Spacing

  const legendItems = [
    { code: "R", label: "Responsible", color: theme.colors.raci.r },
    { code: "A", label: "Accountable", color: theme.colors.raci.a },
    { code: "C", label: "Consulted", color: theme.colors.raci.c },
    { code: "I", label: "Informed", color: theme.colors.raci.i },
  ];

  for (const item of legendItems) {
    const row = sheet.addRow([item.code, item.label]);
    const codeCell = row.getCell(1);
    const labelCell = row.getCell(2);

    // Code cell with RACI color
    codeCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${item.color}` },
    };
    codeCell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    codeCell.alignment = { horizontal: "center", vertical: "middle" };
    codeCell.border = {
      top: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      bottom: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      left: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      right: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
    };

    // Label cell
    labelCell.font = { size: 11, color: { argb: `FF${theme.colors.text}` } };
    labelCell.alignment = { horizontal: "left", vertical: "middle" };
    labelCell.border = {
      top: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      bottom: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      left: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
      right: { style: "thin", color: { argb: `FF${theme.colors.border}` } },
    };

    sheet.getRow(3 + legendItems.indexOf(item)).height = 16;
  }

  sheet.getColumn(1).width = 8;
  sheet.getColumn(2).width = 25;

  return sheet;
}

function createMetadataSheet(
  workbook: Workbook,
  chart: RaciChart,
  theme: XlsxTheme
): Worksheet {
  const sheet = workbook.addWorksheet("Metadata");

  // Title
  const titleRow = sheet.addRow(["Chart Information"]);
  titleRow.font = {
    bold: true,
    size: 14,
    color: { argb: `FF${theme.colors.primary}` },
  };
  titleRow.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 18;

  sheet.addRow([]); // Spacing

  const data = [
    ["Title", chart.title],
    ["Description", chart.description || "(No description provided)"],
    ["Total Roles", chart.roles.length.toString()],
    ["Total Tasks", chart.tasks.length.toString()],
    ["Created", new Date(chart.createdAt).toLocaleDateString()],
    ["Updated", new Date(chart.updatedAt).toLocaleDateString()],
  ];

  for (let i = 0; i < data.length; i++) {
    const [key, value] = data[i];
    const row = sheet.addRow([key, value]);

    const keyCell = row.getCell(1);
    const valueCell = row.getCell(2);

    // Key cell - styled
    keyCell.font = {
      bold: true,
      size: 11,
      color: { argb: `FF${theme.colors.primary}` },
    };
    keyCell.alignment = { horizontal: "left", vertical: "top" };

    // Value cell
    valueCell.font = { size: 11, color: { argb: `FF${theme.colors.text}` } };
    valueCell.alignment = {
      horizontal: "left",
      vertical: "top",
      wrapText: true,
    };

    sheet.getRow(3 + i).height = 18;
  }

  sheet.getColumn(1).width = 15;
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
    createMetadataSheet(workbook, chart, theme);
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
