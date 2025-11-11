/**
 * Export Utilities
 * Shared functions for all export formats
 */

import { RaciChart } from "@/types/raci";

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Size check result type
 */
export interface SizeCheckResult {
  withinLimit: boolean;
  sizeLimit: string;
  actualSize: string;
  format: string;
}

/**
 * Validate chart is ready for export
 */
export function validateChart(chart: RaciChart): ValidationResult {
  const errors: string[] = [];

  if (!chart.title || chart.title.trim() === "") {
    errors.push("Chart title is required");
  }

  if (!chart.roles || chart.roles.length === 0) {
    errors.push("At least one role is required");
  }

  if (!chart.tasks || chart.tasks.length === 0) {
    errors.push("At least one task is required");
  }

  if (!chart.matrix || Object.keys(chart.matrix).length === 0) {
    errors.push("Matrix is empty");
  }

  // Check if matrix has at least one assignment
  let hasAssignments = false;
  for (const role in chart.matrix) {
    for (const task in chart.matrix[role]) {
      const value = chart.matrix[role][task];
      if (value) {
        // value is 'R' | 'A' | 'C' | 'I' | null
        hasAssignments = true;
        break;
      }
    }
    if (hasAssignments) break;
  }

  if (!hasAssignments) {
    errors.push("At least one RACI assignment is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get active theme from chart
 */
export function getActiveTheme(themeId: string) {
  // Import theme config
  const themes: Record<string, any> = {
    default: {
      id: "default",
      name: "Website Default",
      colors: {
        primary: "#DC2626",
        accent: "#059669",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textSecondary: "#64748b",
        border: "#e2e8f0",
        raci: {
          r: "#22c55e",
          a: "#fb923c",
          c: "#3b82f6",
          i: "#9ca3af",
        },
      },
    },
    corporate: {
      id: "corporate",
      name: "Corporate Blue",
      colors: {
        primary: "#003d82",
        accent: "#d4a574",
        background: "#ffffff",
        surface: "#f0f4f8",
        text: "#1a1a1a",
        textSecondary: "#666666",
        border: "#d0d0d0",
        raci: {
          r: "#0fb338",
          a: "#e8b923",
          c: "#0066ff",
          i: "#a0a0a0",
        },
      },
    },
    minimal: {
      id: "minimal",
      name: "Minimal Grayscale",
      colors: {
        primary: "#000000",
        accent: "#666666",
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#000000",
        textSecondary: "#666666",
        border: "#cccccc",
        raci: {
          r: "#333333",
          a: "#666666",
          c: "#999999",
          i: "#cccccc",
        },
      },
    },
  };

  return themes[themeId] || themes.default;
}

/**
 * Generate filename for export
 */
export function generateFilename(chartTitle: string, format: string): string {
  const sanitized = chartTitle
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .substring(0, 50);

  const extension =
    {
      pdf: ".pdf",
      xlsx: ".xlsx",
      csv: ".csv",
      png: ".png",
      pptx: ".pptx",
    }[format] || ".bin";

  return `${sanitized} - RACI Matrix${extension}`;
}

/**
 * Trigger browser download
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Check if file size within limits
 */
export function checkSizeLimit(blob: Blob, format: string): SizeCheckResult {
  const limits: Record<string, number> = {
    pdf: 10 * 1024 * 1024, // 10MB
    xlsx: 5 * 1024 * 1024, // 5MB
    csv: 0, // No limit
    png: 20 * 1024 * 1024, // 20MB
    pptx: 8 * 1024 * 1024, // 8MB
  };

  const limit = limits[format] || 10 * 1024 * 1024;
  const withinLimit = limit === 0 || blob.size <= limit;

  return {
    withinLimit,
    sizeLimit: formatFileSize(limit),
    actualSize: formatFileSize(blob.size),
    format,
  };
}

/**
 * Calculate estimated file size
 */
export function calculateEstimatedSize(
  chart: RaciChart,
  format: string
): number {
  // Base size per cell in matrix
  const baseSize = chart.roles.length * chart.tasks.length * 20; // 20 bytes per cell

  // Format multipliers
  const multipliers: Record<string, number> = {
    pdf: 0.5, // ~450KB for typical
    xlsx: 0.2, // ~180KB for typical
    csv: 0.05, // ~35KB for typical
    png: 2.8, // ~2.8MB for typical (300dpi)
    pptx: 0.3, // ~350KB for typical
  };

  const multiplier = multipliers[format] || 0.5;
  return Math.round(baseSize * multiplier * 1000); // Estimate in bytes
}

/**
 * Handle export error with user-friendly message
 */
export function handleExportError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("Size exceeded")) {
      return "File size exceeds limit. Try a different format or reduce chart complexity.";
    }
    if (error.message.includes("Browser")) {
      return "Your browser does not support this export format. Please try a different one.";
    }
    return error.message;
  }
  return "An unexpected error occurred during export.";
}
