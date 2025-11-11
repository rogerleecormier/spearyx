"use client";

import html2canvas from "html2canvas";
import { RaciChart } from "@/types/raci";
import { validateChart, getActiveTheme } from "@/lib/raci/export-utils";

export interface PngExportOptions {
  themeId?: string;
  dpi?: 96 | 150 | 300;
  includeMetadata?: boolean;
}

interface PngTheme {
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

function getPngTheme(themeId?: string): PngTheme {
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

function createMatrixHtml(chart: RaciChart, theme: PngTheme): HTMLElement {
  const container = document.createElement("div");
  container.style.cssText = `
    padding: 40px;
    background-color: ${theme.colors.background};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    max-width: 1200px;
  `;

  // Logo and title header
  const headerWrapper = document.createElement("div");
  headerWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  `;

  // Logo if available
  if (chart.logo) {
    const logo = document.createElement("img");
    logo.src = chart.logo;
    logo.style.cssText = `
      height: 40px;
      width: auto;
      object-fit: contain;
    `;
    headerWrapper.appendChild(logo);
  }

  // Title
  const title = document.createElement("h1");
  title.textContent = chart.title;
  title.style.cssText = `
    color: ${theme.colors.primary};
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    flex: 1;
  `;
  headerWrapper.appendChild(title);
  container.appendChild(headerWrapper);

  // Description
  if (chart.description) {
    const desc = document.createElement("p");
    desc.textContent = chart.description;
    desc.style.cssText = `
      color: ${theme.colors.text};
      margin: 0 0 24px 0;
      font-size: 13px;
      opacity: 0.7;
    `;
    container.appendChild(desc);
  } else {
    // Add spacing if no description
    const spacing = document.createElement("div");
    spacing.style.cssText = "margin-bottom: 16px;";
    container.appendChild(spacing);
  }

  // Matrix table - matching RaciPreview design
  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 13px;
  `;

  // Header row
  const headerRow = table.insertRow();
  headerRow.style.backgroundColor = theme.colors.primary;

  const headerCell = headerRow.insertCell();
  headerCell.textContent = "Task";
  headerCell.style.cssText = `
    padding: 8px 12px;
    color: white;
    font-weight: 600;
    text-align: left;
    border: 1px solid ${theme.colors.border};
    font-size: 13px;
  `;

  for (const role of chart.roles) {
    const cell = headerRow.insertCell();
    cell.textContent = role.name;
    cell.style.cssText = `
      padding: 8px 12px;
      color: white;
      font-weight: 600;
      text-align: center;
      border: 1px solid ${theme.colors.border};
      font-size: 12px;
    `;
  }

  // Data rows
  for (let rowIndex = 0; rowIndex < chart.tasks.length; rowIndex++) {
    const task = chart.tasks[rowIndex];
    const row = table.insertRow();
    
    // Alternating row colors - matching RaciPreview
    const bgColor = rowIndex % 2 === 0 ? theme.colors.background : "#f9fafb";
    row.style.backgroundColor = bgColor;

    const taskCell = row.insertCell();
    taskCell.textContent = task.name;
    taskCell.style.cssText = `
      padding: 8px 12px;
      color: ${theme.colors.text};
      font-weight: 500;
      border: 1px solid ${theme.colors.border};
      text-align: left;
      font-size: 13px;
    `;

    for (const role of chart.roles) {
      const value = chart.matrix[role.id]?.[task.id];
      const label = value || "";

      const cell = row.insertCell();
      cell.textContent = label;
      cell.style.cssText = `
        padding: 8px 12px;
        text-align: center;
        font-weight: 600;
        border: 1px solid ${theme.colors.border};
        color: white;
        font-size: 13px;
      `;

      if (value) {
        const colorMap: Record<string, string> = {
          R: theme.colors.raci.r,
          A: theme.colors.raci.a,
          C: theme.colors.raci.c,
          I: theme.colors.raci.i,
        };
        cell.style.backgroundColor = colorMap[value];
      } else {
        cell.style.backgroundColor = bgColor;
        cell.style.color = theme.colors.text;
        cell.style.fontWeight = "400";
      }
    }
  }

  container.appendChild(table);

  // Legend - 4 column layout matching RaciPreview
  const legend = document.createElement("div");
  legend.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid ${theme.colors.border};
  `;

  const legendItems = [
    { code: "R", color: theme.colors.raci.r },
    { code: "A", color: theme.colors.raci.a },
    { code: "C", color: theme.colors.raci.c },
    { code: "I", color: theme.colors.raci.i },
  ];

  for (const item of legendItems) {
    const legendItem = document.createElement("div");
    legendItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
    `;

    const colorBox = document.createElement("div");
    colorBox.style.cssText = `
      width: 12px;
      height: 12px;
      background-color: ${item.color};
      border-radius: 2px;
    `;

    const label = document.createElement("span");
    label.textContent = item.code;
    label.style.cssText = `
      font-size: 12px;
      font-weight: 600;
      color: ${theme.colors.text};
    `;

    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legend.appendChild(legendItem);
  }

  container.appendChild(legend);

  return container;
}

function getScale(dpi: number): number {
  // DPI to scale factor conversion
  // 96 DPI = 1x (default screen)
  // 150 DPI = ~1.56x
  // 300 DPI = 3.125x
  return dpi / 96;
}

export async function exportToPng(
  chart: RaciChart,
  options: PngExportOptions = {}
): Promise<Blob> {
  const validation = validateChart(chart);
  if (!validation.valid) {
    throw new Error(`Invalid RACI chart: ${validation.errors.join(", ")}`);
  }

  const theme = getPngTheme(options.themeId);
  const dpi = options.dpi || 96;
  const scale = getScale(dpi);

  // Create temporary container
  const htmlElement = createMatrixHtml(chart, theme);
  const tempContainer = document.createElement("div");
  tempContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    background: white;
  `;
  tempContainer.appendChild(htmlElement);
  document.body.appendChild(tempContainer);

  try {
    const canvas = await html2canvas(htmlElement, {
      scale: scale,
      backgroundColor: theme.colors.background,
      useCORS: true,
      logging: false,
      allowTaint: true,
      ignoreElements: (element: Element) => {
        // Ignore style and link elements to avoid OKLch parsing
        return element.tagName === "STYLE" || element.tagName === "LINK";
      },
    });

    const pngBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob: Blob | null) => {
          resolve(blob || new Blob());
        },
        "image/png",
        1.0
      );
    });

    return pngBlob;
  } finally {
    document.body.removeChild(tempContainer);
  }
}

export async function generatePngPreview(
  chart: RaciChart,
  options: PngExportOptions = {}
): Promise<string> {
  const pngBlob = await exportToPng(chart, options);
  return URL.createObjectURL(pngBlob);
}
