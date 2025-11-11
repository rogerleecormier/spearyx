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

function addTitleSection(doc: jsPDF, chart: RaciChart, theme: PdfTheme, yPos: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  let currentY = yPos;
  let logoWidth = 0;

  // Logo if available - positioned to the left of title
  if (chart.logo) {
    try {
      doc.addImage(chart.logo, "PNG", 15, currentY - 6, 15, 15);
      logoWidth = 20; // Logo width + gap
    } catch (e) {
      console.error("Failed to add logo to PDF:", e);
    }
  }

  // Title - positioned to the right of logo at same height
  doc.setTextColor(...hexToRgb(theme.colors.primary));
  doc.setFontSize(theme.fonts.title);
  doc.setFont("helvetica", "bold");
  doc.text(chart.title, 15 + logoWidth, currentY + 5, { maxWidth: pageWidth - 30 - logoWidth });

  // Description
  currentY += 18;
  if (chart.description) {
    doc.setTextColor(...hexToRgb(theme.colors.text));
    doc.setFontSize(theme.fonts.body);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(chart.description, pageWidth - 30);
    doc.text(descLines, 15, currentY);
    currentY += descLines.length * 5 + 5;
  }

  // Metadata
  doc.setTextColor(...hexToRgb(theme.colors.text));
  doc.setFontSize(theme.fonts.body - 1);
  doc.setFont("helvetica", "normal");
  doc.text(`Roles: ${chart.roles.length}  •  Tasks: ${chart.tasks.length}`, 15, currentY);
  doc.text(`Created: ${new Date(chart.createdAt).toLocaleDateString()}`, 15, currentY + 6);

  return currentY + 12;
}

function addMatrix(doc: jsPDF, chart: RaciChart, theme: PdfTheme, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Build grid structure like PNG/XLSX - matching RaciPreview format
  const rows: Array<Array<string>> = [];
  
  // Header row with roles
  const headerRow: Array<string> = ["Task"];
  for (const role of chart.roles) {
    headerRow.push(role.name);
  }
  rows.push(headerRow);

  // Data rows - one per task
  for (const task of chart.tasks) {
    const row: Array<string> = [task.name];
    
    for (const role of chart.roles) {
      const value = chart.matrix[role.id]?.[task.id];
      row.push(value || "");
    }
    
    rows.push(row);
  }

  const columns = rows[0];
  const body = rows.slice(1);

  autoTable(doc, {
    head: [columns],
    body: body,
    startY: startY,
    margin: margin,
    didDrawPage: (data: any) => {
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();

      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
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
      cellPadding: 3,
      lineColor: hexToRgb(theme.colors.border),
      lineWidth: 0.5,
    },
    bodyStyles: {
      fontSize: theme.fonts.body - 1,
      textColor: hexToRgb(theme.colors.text),
      cellPadding: 3,
      lineColor: hexToRgb(theme.colors.border),
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
      lineColor: hexToRgb(theme.colors.border),
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { halign: "left" },
    },
    didDrawCell: (data: any) => {
      // Color RACI cells (skip first column which is task name)
      if (data.section === "body" && data.column.index > 0) {
        const cellText = data.cell.text;
        const value = Array.isArray(cellText) ? cellText[0] : cellText;

        let fillColor: [number, number, number] | null = null;

        if (value === "R") {
          fillColor = hexToRgb(theme.colors.raci.r);
        } else if (value === "A") {
          fillColor = hexToRgb(theme.colors.raci.a);
        } else if (value === "C") {
          fillColor = hexToRgb(theme.colors.raci.c);
        } else if (value === "I") {
          fillColor = hexToRgb(theme.colors.raci.i);
        }

        if (fillColor) {
          // Draw background rectangle with RACI color
          doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            "F"
          );

          // Draw border
          const borderColor = hexToRgb(theme.colors.border);
          doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          doc.setLineWidth(0.5);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);

          // Draw text in white
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text(value, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, {
            align: "center",
          });
        }
      }
    },
  });

  // Get final Y position from autoTable
  const finalY = (doc as any).lastAutoTable?.finalY ?? startY + 50;
  return finalY;
}

function addLegend(doc: jsPDF, theme: PdfTheme, startY: number): number {
  const margin = 15;

  doc.setTextColor(...hexToRgb(theme.colors.primary));
  doc.setFontSize(theme.fonts.heading);
  doc.setFont("helvetica", "bold");
  doc.text("RACI Legend", margin, startY);

  const legendItems = [
    { code: "R", label: "Responsible", color: theme.colors.raci.r },
    { code: "A", label: "Accountable", color: theme.colors.raci.a },
    { code: "C", label: "Consulted", color: theme.colors.raci.c },
    { code: "I", label: "Informed", color: theme.colors.raci.i },
  ];

  let yPosition = startY + 10;
  doc.setFontSize(theme.fonts.body);

  for (const item of legendItems) {
    const rgb = hexToRgb(item.color);
    
    // Color box
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margin, yPosition, 8, 8, "F");
    
    // Label
    doc.setTextColor(...hexToRgb(theme.colors.text));
    doc.setFont("helvetica", "normal");
    doc.text(`${item.code} - ${item.label}`, margin + 12, yPosition + 2);
    
    yPosition += 15;
  }

  return yPosition;
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

  // Calculate page height
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Add title section
  currentY = addTitleSection(doc, chart, theme, currentY);

  // Check if matrix will fit on current page
  const estimatedMatrixHeight = (chart.tasks.length + 2) * 8;
  const estimatedLegendHeight = 70;
  
  if (currentY + estimatedMatrixHeight + estimatedLegendHeight + 20 < pageHeight) {
    // Everything fits on one page
    currentY += 5;
    currentY = addMatrix(doc, chart, theme, currentY);
    currentY += 10;
    
    if (options.includeLogo !== false) {
      addLegend(doc, theme, currentY);
    }
  } else if (currentY + estimatedMatrixHeight + 20 < pageHeight) {
    // Matrix fits on first page, legend goes to second page
    currentY += 5;
    addMatrix(doc, chart, theme, currentY);
    
    doc.addPage();
    if (options.includeLogo !== false) {
      addLegend(doc, theme, 15);
    }
  } else {
    // Matrix doesn't fit on first page, both go to second page
    doc.addPage();
    let matrixY = addMatrix(doc, chart, theme, 15);
    matrixY += 10;
    
    if (currentY + estimatedLegendHeight < pageHeight) {
      addLegend(doc, theme, matrixY);
    } else if (options.includeLogo !== false) {
      doc.addPage();
      addLegend(doc, theme, 15);
    }
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
