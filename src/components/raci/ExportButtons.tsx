"use client";

import React, { useState } from "react";
import { RaciChart } from "@/types/raci";
import { Body, Caption, Overline } from "@/components/Typography";
import {
  FileText,
  Sheet,
  File,
  Image as ImageIcon,
  Presentation,
} from "lucide-react";
import {
  exportToPdf,
  exportToXlsx,
  exportToCsv,
  exportToPng,
  exportToPptx,
} from "@/lib/raci/exporters";
import { triggerDownload, generateFilename } from "@/lib/raci/export-utils";

interface ExportButtonsProps {
  chart: RaciChart;
  themeId?: string;
  onExportStart?: () => void;
  onExportComplete?: (format: string) => void;
  onExportError?: (error: Error) => void;
}

type ExportFormat = "pdf" | "xlsx" | "csv" | "png" | "pptx";

interface ExportState {
  loading: boolean;
  format: ExportFormat | null;
  error: string | null;
  hoveredTooltip: ExportFormat | null;
}

// Organized in 3 rows:
// Row 1: PDF, Excel (high-priority formats)
// Row 2: CSV, PNG (data & visual)
// Row 3: PowerPoint (presentation)
const EXPORT_FORMATS = [
  {
    id: "pdf",
    label: "PDF Document",
    description: "Professional multi-page report with styling",
    shortLabel: "PDF",
    icon: FileText,
    color: "hover:border-red-400 hover:bg-red-50",
    row: 1,
  },
  {
    id: "xlsx",
    label: "Excel Spreadsheet",
    description: "Editable spreadsheet with multiple sheets",
    shortLabel: "Excel",
    icon: Sheet,
    color: "hover:border-emerald-400 hover:bg-emerald-50",
    row: 1,
  },
  {
    id: "csv",
    label: "CSV Export",
    description: "Comma-separated values for data processing",
    shortLabel: "CSV",
    icon: File,
    color: "hover:border-blue-400 hover:bg-blue-50",
    row: 2,
  },
  {
    id: "png",
    label: "PNG Image",
    description: "High-resolution image export (300 DPI)",
    shortLabel: "Image",
    icon: ImageIcon,
    color: "hover:border-purple-400 hover:bg-purple-50",
    row: 2,
  },
  {
    id: "pptx",
    label: "PowerPoint Presentation",
    description: "Multi-slide presentation with breakdown",
    shortLabel: "Slides",
    icon: Presentation,
    color: "hover:border-orange-400 hover:bg-orange-50",
    row: 3,
  },
] as const;

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  chart,
  themeId,
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const [state, setState] = useState<ExportState>({
    loading: false,
    format: null,
    error: null,
    hoveredTooltip: null,
  });

  const handleExport = async (format: ExportFormat) => {
    setState((prev) => ({ ...prev, loading: true, format, error: null }));
    onExportStart?.();

    try {
      let blob: Blob;

      switch (format) {
        case "pdf":
          blob = await exportToPdf(chart, { themeId });
          break;
        case "xlsx":
          blob = await exportToXlsx(chart, { themeId });
          break;
        case "csv":
          blob = await exportToCsv(chart);
          break;
        case "png":
          blob = await exportToPng(chart, { themeId });
          break;
        case "pptx":
          blob = await exportToPptx(chart, { themeId });
          break;
        default:
          throw new Error(`Unknown export format: ${format}`);
      }

      const filename = generateFilename(chart.title, format);
      triggerDownload(blob, filename);

      setState((prev) => ({
        ...prev,
        loading: false,
        format: null,
        error: null,
      }));
      onExportComplete?.(format);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        loading: false,
        format: null,
        error: err.message,
      }));
      onExportError?.(err);
    }
  };

  // Group formats by row
  const rows = [
    EXPORT_FORMATS.filter((f) => f.row === 1),
    EXPORT_FORMATS.filter((f) => f.row === 2),
    EXPORT_FORMATS.filter((f) => f.row === 3),
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <Body className="font-semibold text-slate-900">
          Download Your Chart
        </Body>
        <Caption className="text-slate-600 mt-1">
          Choose your preferred export format
        </Caption>
      </div>

      {/* Export Rows */}
      <div className="space-y-2.5">
        {rows.map((rowFormats, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-2 gap-2.5">
            {rowFormats.map((fmt) => {
              const IconComponent = fmt.icon;
              const isLoading = state.format === fmt.id && state.loading;
              const isHovered = state.hoveredTooltip === fmt.id;

              return (
                <div key={fmt.id} className="relative">
                  {/* Tooltip */}
                  {isHovered && !state.loading && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-slate-900 text-white rounded-lg text-xs whitespace-normal z-50 animate-in fade-in duration-200">
                      <p className="font-semibold">{fmt.label}</p>
                      <p className="text-slate-300 text-xs mt-1">
                        {fmt.description}
                      </p>
                      <div className="absolute top-full left-2 w-2 h-2 bg-slate-900 transform rotate-45" />
                    </div>
                  )}

                  {/* Button */}
                  <button
                    onClick={() => handleExport(fmt.id as ExportFormat)}
                    onMouseEnter={() =>
                      setState((prev) => ({ ...prev, hoveredTooltip: fmt.id }))
                    }
                    onMouseLeave={() =>
                      setState((prev) => ({ ...prev, hoveredTooltip: null }))
                    }
                    disabled={state.loading && state.format !== fmt.id}
                    className={`
                      w-full flex items-center gap-3 p-3 rounded-lg
                      border-2 border-slate-200 transition-all duration-200
                      ${fmt.color}
                      disabled:opacity-40 disabled:cursor-not-allowed
                      relative
                      ${
                        isLoading
                          ? "border-emerald-500 ring-2 ring-emerald-200"
                          : ""
                      }
                    `}
                  >
                    {/* Loading Spinner */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Icon - Left Side */}
                    <IconComponent
                      className={`w-6 h-6 flex-shrink-0 text-slate-600 ${
                        isLoading ? "opacity-0" : ""
                      }`}
                    />

                    {/* Text Content - Right Side */}
                    <div
                      className={`flex-1 text-left min-w-0 ${
                        isLoading ? "opacity-0" : ""
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-900 leading-tight">
                        {fmt.shortLabel}
                      </div>
                    </div>

                    {/* Chevron - Right */}
                    <span className="text-slate-400 transition-colors flex-shrink-0">
                      →
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 animate-in fade-in">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div className="flex-1 min-w-0">
            <Body className="text-xs font-semibold text-red-900">
              Export failed
            </Body>
            <Caption className="text-red-700 text-xs">{state.error}</Caption>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {state.format === null && !state.error && !state.loading && (
        <Overline className="text-slate-500 text-center text-xs">
          Hover over a format for details
        </Overline>
      )}
    </div>
  );
};

export default ExportButtons;
