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

  // Title
  const title = document.createElement("h1");
  title.textContent = chart.title;
  title.style.cssText = `
    color: ${theme.colors.primary};
    margin: 0 0 10px 0;
    font-size: 28px;
    font-weight: 700;
  `;
  container.appendChild(title);

  // Description
  if (chart.description) {
    const desc = document.createElement("p");
    desc.textContent = chart.description;
    desc.style.cssText = `
      color: #666;
      margin: 0 0 30px 0;
      font-size: 14px;
    `;
    container.appendChild(desc);
  }

  // Matrix table
  const table = document.createElement("table");
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    border: 1px solid ${theme.colors.border};
    margin-bottom: 30px;
  `;

  // Header row
  const headerRow = table.insertRow();
  headerRow.style.backgroundColor = theme.colors.primary;

  const headerCell = headerRow.insertCell();
  headerCell.textContent = "Task";
  headerCell.style.cssText = `
    padding: 12px;
    color: white;
    font-weight: 700;
    text-align: left;
    border: 1px solid ${theme.colors.border};
  `;

  for (const role of chart.roles) {
    const cell = headerRow.insertCell();
    cell.textContent = role.name;
    cell.style.cssText = `
      padding: 12px;
      color: white;
      font-weight: 700;
      text-align: center;
      border: 1px solid ${theme.colors.border};
    `;
  }

  // Data rows
  for (const task of chart.tasks) {
    const row = table.insertRow();
    row.style.backgroundColor =
      table.rows.length % 2 === 0 ? "#f9fafb" : theme.colors.background;

    const taskCell = row.insertCell();
    taskCell.textContent = task.name;
    taskCell.style.cssText = `
      padding: 12px;
      color: ${theme.colors.text};
      font-weight: 500;
      border: 1px solid ${theme.colors.border};
    `;

    for (const role of chart.roles) {
      const value = chart.matrix[role.id]?.[task.id];
      const label = value
        ? value === "R"
          ? "R"
          : value === "A"
            ? "A"
            : value === "C"
              ? "C"
              : "I"
        : "";

      const cell = row.insertCell();
      cell.textContent = label;
      cell.style.cssText = `
        padding: 12px;
        text-align: center;
        font-weight: 600;
        border: 1px solid ${theme.colors.border};
        color: white;
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
        cell.style.backgroundColor = theme.colors.background;
        cell.style.color = theme.colors.text;
      }
    }
  }

  container.appendChild(table);

  // Legend
  const legend = document.createElement("div");
  legend.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;
  `;

  const legendItems = [
    { label: "R - Responsible", color: theme.colors.raci.r },
    { label: "A - Accountable", color: theme.colors.raci.a },
    { label: "C - Consulted", color: theme.colors.raci.c },
    { label: "I - Informed", color: theme.colors.raci.i },
  ];

  for (const item of legendItems) {
    const legendItem = document.createElement("div");
    legendItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const colorBox = document.createElement("div");
    colorBox.style.cssText = `
      width: 24px;
      height: 24px;
      background-color: ${item.color};
      border-radius: 4px;
    `;

    const label = document.createElement("span");
    label.textContent = item.label;
    label.style.cssText = `
      font-size: 13px;
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
