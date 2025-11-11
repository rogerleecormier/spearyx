"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RaciChart } from "@/types/raci";
import { validateChart, getActiveTheme } from "@/lib/raci/export-utils";

export interface PdfExportOptions {
  themeId?: string;
  includeLogo?: boolean;
  includeMetadata?: boolean;
  pageSize?: "a4" | "letter";
}

interface PdfTheme {
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
  fonts: {
    title: number;
    heading: number;
    body: number;
    caption: number;
  };
}

const RACI_LABELS: Record<string, string> = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed",
  null: "-",
};

function getPdfTheme(themeId?: string): PdfTheme {
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
    fonts: {
      title: 24,
      heading: 14,
      body: 11,
      caption: 9,
    },
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

function buildMatrixRows(chart: RaciChart): Array<Array<string>> {
  const rows: Array<Array<string>> = [];
  const roleIds = Object.keys(chart.matrix);

  for (const roleId of roleIds) {
    const role = chart.roles.find((r: any) => r.id === roleId);
    const roleName = role?.name || roleId;

    for (const taskId in chart.matrix[roleId]) {
      const task = chart.tasks.find((t: any) => t.id === taskId);
      const taskName = task?.name || taskId;
      const value = chart.matrix[roleId][taskId];
      const label = RACI_LABELS[value || "null"];

      rows.push([taskName, roleName, label]);
    }
  }

  return rows;
}

function addTitlePage(doc: jsPDF, chart: RaciChart, theme: PdfTheme): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  const primaryRgb = hexToRgb(theme.colors.primary);
  doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
  doc.rect(0, 0, pageWidth, 100, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(theme.fonts.title);
  doc.setFont("helvetica", "bold");
  doc.text(chart.title, 20, 50, { maxWidth: pageWidth - 40 });

  doc.setTextColor(...hexToRgb(theme.colors.text));
  doc.setFontSize(theme.fonts.body);
  doc.setFont("helvetica", "normal");
  doc.text(`Roles: ${chart.roles.length}`, 20, 120);
  doc.text(`Tasks: ${chart.tasks.length}`, 20, 135);

  const description = chart.description || "RACI Chart";
  doc.setFontSize(theme.fonts.caption);
  doc.text(description, 20, 160, { maxWidth: pageWidth - 40 });

  doc.addPage();
  return 1;
}

function addMatrixPage(doc: jsPDF, chart: RaciChart, theme: PdfTheme): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  doc.setTextColor(...hexToRgb(theme.colors.text));
  doc.setFontSize(theme.fonts.heading);
  doc.setFont("helvetica", "bold");
  doc.text("RACI Matrix", margin, 20);

  const rows = buildMatrixRows(chart);
  const columns = ["Task", "Role", "Assignment"];

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    margin: margin,
    didDrawPage: (data: any) => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();

      doc.setTextColor(128, 128, 128);
      doc.setFontSize(9);
      const pageCount = (doc as any).internal.pages.length - 1;
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    },
    headStyles: {
      fillColor: hexToRgb(theme.colors.primary),
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: theme.fonts.body,
    },
    bodyStyles: {
      fontSize: theme.fonts.body - 1,
      textColor: hexToRgb(theme.colors.text),
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 80 },
      1: { halign: "left", cellWidth: 60 },
      2: { halign: "center", cellWidth: 40 },
    },
    didDrawCell: (data: any) => {
      if (data.section === "body" && data.column.index === 2) {
        const value = data.cell.text[0];
        let cellColor = theme.colors.background;

        switch (value) {
          case "Responsible":
            cellColor = theme.colors.raci.r;
            break;
          case "Accountable":
            cellColor = theme.colors.raci.a;
            break;
          case "Consulted":
            cellColor = theme.colors.raci.c;
            break;
          case "Informed":
            cellColor = theme.colors.raci.i;
            break;
        }

        const rgb = hexToRgb(cellColor);
        data.cell.fillColor = rgb;
      }
    },
  });
}

function addLegendPage(doc: jsPDF, theme: PdfTheme): void {
  const margin = 20;

  doc.addPage();
  doc.setTextColor(...hexToRgb(theme.colors.text));
  doc.setFontSize(theme.fonts.heading);
  doc.setFont("helvetica", "bold");
  doc.text("RACI Legend", margin, 20);

  const legendItems = [
    { label: "R - Responsible", color: theme.colors.raci.r },
    { label: "A - Accountable", color: theme.colors.raci.a },
    { label: "C - Consulted", color: theme.colors.raci.c },
    { label: "I - Informed", color: theme.colors.raci.i },
  ];

  let yPosition = 40;
  doc.setFontSize(theme.fonts.body);
  doc.setFont("helvetica", "normal");

  for (const item of legendItems) {
    const rgb = hexToRgb(item.color);
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margin, yPosition - 3, 10, 10, "F");
    doc.setTextColor(...hexToRgb(theme.colors.text));
    doc.text(item.label, margin + 15, yPosition + 2);
    yPosition += 15;
  }
}

export async function exportToPdf(
  chart: RaciChart,
  options: PdfExportOptions = {}
): Promise<Blob> {
  const validation = validateChart(chart);
  if (!validation.valid) {
    throw new Error(`Invalid RACI chart: ${validation.errors.join(", ")}`);
  }

  const theme = getPdfTheme(options.themeId);
  const pageSize = options.pageSize === "letter" ? "letter" : "a4";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: pageSize,
  });

  addTitlePage(doc, chart, theme);
  addMatrixPage(doc, chart, theme);

  if (options.includeLogo !== false) {
    addLegendPage(doc, theme);
  }

  const pdfBlob = doc.output("blob");
  return pdfBlob;
}

export async function generatePdfPreview(
  chart: RaciChart,
  options: PdfExportOptions = {}
): Promise<string> {
  const pdfBlob = await exportToPdf(chart, options);
  return URL.createObjectURL(pdfBlob);
}
