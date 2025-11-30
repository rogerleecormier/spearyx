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
  slide.background = { color: "ffffff" };

  let xPos = 0.5;

  // Logo if available - placed inline with title
  if (chart.logo) {
    try {
      slide.addImage({
        data: chart.logo,
        x: xPos,
        y: 1,
        w: 0.8,
        h: 0.8,
      });
      xPos += 1;
    } catch (e) {
      console.error("Failed to add logo to PPTX:", e);
    }
  }

  // Title with primary color - positioned to right of logo
  slide.addText(chart.title, {
    x: xPos,
    y: 1,
    w: 9 - xPos,
    h: 0.8,
    fontSize: 44,
    bold: true,
    color: theme.colors.primary,
    align: "left",
    valign: "middle",
  });

  // Description
  let yPos = 2;
  if (chart.description) {
    slide.addText(chart.description, {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.8,
      fontSize: 18,
      color: theme.colors.text,
      align: "left",
    });
    yPos += 1;
  }

  // Metadata
  slide.addText(
    `Roles: ${chart.roles.length}  •  Tasks: ${chart.tasks.length}`,
    {
      x: 0.5,
      y: yPos,
      w: 9,
      h: 0.4,
      fontSize: 14,
      color: "#999999",
      align: "left",
    }
  );

  slide.addText(`Created: ${new Date(chart.createdAt).toLocaleDateString()}`, {
    x: 0.5,
    y: yPos + 0.5,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: "#999999",
    align: "left",
  });
}

function addMatrixSlide(
  prs: PptxGenJS,
  chart: RaciChart,
  theme: PptxTheme
): void {
  const slide = prs.addSlide();
  slide.background = { color: "ffffff" };

  // Title with primary color
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
    { text: "Task", options: { bold: true, color: "ffffff", fontSize: 10 } },
  ];

  for (const role of chart.roles) {
    headerRow.push({
      text: role.name,
      options: { bold: true, color: "ffffff", fontSize: 9 },
    });
  }

  tableData.push(headerRow);

  // Data rows
  for (const task of chart.tasks) {
    const row: Array<{ text: string; options?: any }> = [
      {
        text: task.name,
        options: { bold: true, color: theme.colors.text, fontSize: 10 },
      },
    ];

    for (const role of chart.roles) {
      const value = chart.matrix[role.id]?.[task.id];

      const cellOptions: any = { align: "center", fontSize: 10 };

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
      } else {
        cellOptions.color = theme.colors.text;
      }

      row.push({ text: value || "", options: cellOptions });
    }

    tableData.push(row);
  }

  // Add table
  slide.addTable(tableData, {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 5.2,
    colW: [2.5, 1.25],
    border: { pt: 0.5, color: theme.colors.border },
    fill: { color: theme.colors.background },
    color: theme.colors.text,
    fontSize: 10,
    rowH: [0.35],
  });
}

function addLegendSlide(prs: PptxGenJS, theme: PptxTheme): void {
  const slide = prs.addSlide();
  slide.background = { color: "ffffff" };

  // Title with primary color
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
    { code: "R", label: "Responsible", color: theme.colors.raci.r },
    { code: "A", label: "Accountable", color: theme.colors.raci.a },
    { code: "C", label: "Consulted", color: theme.colors.raci.c },
    { code: "I", label: "Informed", color: theme.colors.raci.i },
  ];

  // 4 column layout like RaciPreview
  const colWidth = 2.1;
  const colHeight = 1.2;
  let xPos = 0.5;
  let yPos = 1.3;

  for (let i = 0; i < legendItems.length; i++) {
    const item = legendItems[i];

    // Color box with code
    slide.addShape(prs.ShapeType.rect, {
      x: xPos,
      y: yPos,
      w: 0.4,
      h: 0.4,
      fill: { color: item.color },
      line: { type: "none" },
    });

    // Code text
    slide.addText(item.code, {
      x: xPos,
      y: yPos,
      w: 0.4,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: "ffffff",
      align: "center",
      valign: "middle",
    });

    // Label text
    slide.addText(item.label, {
      x: xPos + 0.5,
      y: yPos,
      w: colWidth - 0.5,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: theme.colors.text,
      align: "left",
      valign: "middle",
    });

    xPos += colWidth;
    if ((i + 1) % 4 === 0) {
      xPos = 0.5;
      yPos += colHeight;
    }
  }
}

function addBreakdownSlide(
  prs: PptxGenJS,
  chart: RaciChart,
  theme: PptxTheme
): void {
  const slide = prs.addSlide();

  // White background
  slide.background = { color: "ffffff" };

  // Title with primary color
  slide.addText("Role Assignments", {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: theme.colors.primary,
  });

  // Subtitle line
  slide.addShape(prs.ShapeType.rect, {
    x: 0.5,
    y: 0.85,
    w: 1.3,
    h: 0.05,
    fill: { color: theme.colors.primary },
    line: { type: "none" },
  });

  let yPosition = 1.3;

  for (const role of chart.roles) {
    // Role name with background
    slide.addShape(prs.ShapeType.rect, {
      x: 0.5,
      y: yPosition,
      w: 9,
      h: 0.35,
      fill: { color: theme.colors.primary },
      line: { type: "none" },
    });

    slide.addText(role.name, {
      x: 0.7,
      y: yPosition,
      w: 8.6,
      h: 0.35,
      fontSize: 16,
      bold: true,
      color: "ffffff",
      valign: "middle",
    });

    yPosition += 0.45;

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

    // Stats row with colors
    const stats = [
      { label: `R: ${responsible}`, color: theme.colors.raci.r },
      { label: `A: ${accountable}`, color: theme.colors.raci.a },
      { label: `C: ${consulted}`, color: theme.colors.raci.c },
      { label: `I: ${informed}`, color: theme.colors.raci.i },
    ];

    const statWidth = 2;
    const statHeight = 0.5;
    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      const xPos = 0.7 + i * 2.1;

      slide.addShape(prs.ShapeType.rect, {
        x: xPos,
        y: yPosition,
        w: statWidth,
        h: statHeight,
        fill: { color: stat.color },
        line: { type: "none" },
      });

      slide.addText(stat.label, {
        x: xPos,
        y: yPosition,
        w: statWidth,
        h: statHeight,
        fontSize: 11,
        bold: true,
        color: "ffffff",
        align: "center",
        valign: "middle",
      });
    }

    yPosition += 0.7;
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
