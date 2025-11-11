"use client";

import PptxGenJS from "pptxgenjs";
import { RaciChart } from "@/types/raci";
import { validateChart, getActiveTheme } from "@/lib/raci/export-utils";

export interface PptxExportOptions {
  themeId?: string;
  includeMetadata?: boolean;
  includeBreakdown?: boolean;
}

interface PptxTheme {
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

function getPptxTheme(themeId?: string): PptxTheme {
  const baseTheme = getActiveTheme(themeId || "default");
  return {
    colors: {
      primary: baseTheme.colors.primary,
      accent: baseTheme.colors.accent,
      background: baseTheme.colors.background,
      text: baseTheme.colors.text,
      border: "#e2e8f0",
      raci: baseTheme.colors.raci,
    },
  };
}

function addTitleSlide(
  prs: PptxGenJS,
  chart: RaciChart,
  theme: PptxTheme
): void {
  const slide = prs.addSlide();

  // Background
  slide.background = { color: theme.colors.primary };

  // Title
  slide.addText(chart.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 54,
    bold: true,
    color: "ffffff",
    align: "left",
  });

  // Description
  if (chart.description) {
    slide.addText(chart.description, {
      x: 0.5,
      y: 4.2,
      w: 9,
      h: 1,
      fontSize: 24,
      color: "f0f0f0",
      align: "left",
    });
  }

  // Footer stats
  const stats = `${chart.roles.length} Roles  •  ${chart.tasks.length} Tasks`;
  slide.addText(stats, {
    x: 0.5,
    y: 5.8,
    w: 9,
    h: 0.5,
    fontSize: 16,
    color: "e0e0e0",
    align: "left",
  });
}

function addMatrixSlide(
  prs: PptxGenJS,
  chart: RaciChart,
  theme: PptxTheme
): void {
  const slide = prs.addSlide();

  // Title
  slide.addText("RACI Matrix", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.colors.primary,
  });

  // Create table data
  const tableData: Array<Array<{ text: string; options?: any }>> = [];

  // Header row
  const headerRow: Array<{ text: string; options?: any }> = [
    { text: "Task", options: { bold: true, color: "ffffff" } },
  ];

  for (const role of chart.roles) {
    headerRow.push({
      text: role.name,
      options: { bold: true, color: "ffffff" },
    });
  }

  tableData.push(headerRow);

  // Data rows
  for (const task of chart.tasks) {
    const row: Array<{ text: string; options?: any }> = [{ text: task.name }];

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

      const cellOptions: any = { align: "center" };

      if (value) {
        const colorMap: Record<string, string> = {
          R: theme.colors.raci.r,
          A: theme.colors.raci.a,
          C: theme.colors.raci.c,
          I: theme.colors.raci.i,
        };
        cellOptions.fill = { color: colorMap[value] };
        cellOptions.color = "ffffff";
        cellOptions.bold = true;
      }

      row.push({ text: label, options: cellOptions });
    }

    tableData.push(row);
  }

  // Add table
  slide.addTable(tableData, {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 4.5,
    colW: [2.5, 1.25],
    border: { pt: 1, color: theme.colors.border },
    fill: { color: theme.colors.background },
    color: theme.colors.text,
    fontSize: 11,
    rowH: [0.35],
  });
}

function addLegendSlide(prs: PptxGenJS, theme: PptxTheme): void {
  const slide = prs.addSlide();

  // Title
  slide.addText("RACI Legend", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.colors.primary,
  });

  const legendItems = [
    { label: "R - Responsible", color: theme.colors.raci.r },
    { label: "A - Accountable", color: theme.colors.raci.a },
    { label: "C - Consulted", color: theme.colors.raci.c },
    { label: "I - Informed", color: theme.colors.raci.i },
  ];

  let yPosition = 1.5;
  for (const item of legendItems) {
    // Color box
    slide.addShape(prs.ShapeType.rect, {
      x: 1,
      y: yPosition,
      w: 0.4,
      h: 0.4,
      fill: { color: item.color },
      line: { color: theme.colors.border },
    });

    // Label
    slide.addText(item.label, {
      x: 1.7,
      y: yPosition,
      w: 7,
      h: 0.4,
      fontSize: 18,
      color: theme.colors.text,
      align: "left",
      valign: "middle",
    });

    yPosition += 0.8;
  }
}

function addBreakdownSlide(
  prs: PptxGenJS,
  chart: RaciChart,
  theme: PptxTheme
): void {
  const slide = prs.addSlide();

  // Title
  slide.addText("Role Assignments", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.colors.primary,
  });

  let yPosition = 1.3;

  for (const role of chart.roles) {
    // Role name
    slide.addText(role.name, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: 0.35,
      fontSize: 16,
      bold: true,
      color: theme.colors.primary,
    });

    yPosition += 0.4;

    // Count each RACI value for this role
    let responsible = 0,
      accountable = 0,
      consulted = 0,
      informed = 0;

    for (const taskId in chart.matrix[role.id] || {}) {
      const value = chart.matrix[role.id][taskId];
      switch (value) {
        case "R":
          responsible++;
          break;
        case "A":
          accountable++;
          break;
        case "C":
          consulted++;
          break;
        case "I":
          informed++;
          break;
      }
    }

    const stats = `R: ${responsible}  •  A: ${accountable}  •  C: ${consulted}  •  I: ${informed}`;
    slide.addText(stats, {
      x: 1,
      y: yPosition,
      w: 8,
      h: 0.3,
      fontSize: 12,
      color: "#666666",
    });

    yPosition += 0.6;
  }
}

export async function exportToPptx(
  chart: RaciChart,
  options: PptxExportOptions = {}
): Promise<Blob> {
  const validation = validateChart(chart);
  if (!validation.valid) {
    throw new Error(`Invalid RACI chart: ${validation.errors.join(", ")}`);
  }

  const theme = getPptxTheme(options.themeId);

  const prs = new PptxGenJS();
  prs.defineLayout({ name: "LAYOUT1", width: 10, height: 7.5 });
  prs.layout = "LAYOUT1";

  // Add slides
  addTitleSlide(prs, chart, theme);
  addMatrixSlide(prs, chart, theme);

  if (options.includeBreakdown !== false) {
    addBreakdownSlide(prs, chart, theme);
  }

  addLegendSlide(prs, theme);

  // Generate blob
  const pptxBlob = await prs.write({ outputType: "blob" });
  return pptxBlob as Blob;
}

export async function generatePptxPreview(chart: RaciChart): Promise<string> {
  const pptxBlob = await exportToPptx(chart);
  return URL.createObjectURL(pptxBlob);
}
