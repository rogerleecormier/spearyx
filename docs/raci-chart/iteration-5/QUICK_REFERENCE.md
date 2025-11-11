# Iteration 5: Export – Quick Reference & API Documentation

**Status:** ✅ Complete  
**Updated:** 2025-11-10

---

## Table of Contents

1. [Core Export Functions](#core-export-functions)
2. [Component APIs](#component-apis)
3. [Data Structures](#data-structures)
4. [Configuration](#configuration)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

---

## Core Export Functions

### lib/raci/export-utils.ts

#### Validation

```typescript
/**
 * Validate chart is ready for export
 * @param chart - RACI chart to validate
 * @returns { valid: boolean, errors: string[] }
 */
function validateChart(chart: RaciChart): ValidationResult;

// Example
const result = validateChart(myChart);
if (!result.valid) {
  console.error("Validation errors:", result.errors);
  // → ['At least one role required', 'At least one task required']
}
```

#### Theme Resolution

```typescript
/**
 * Get active theme from state
 * @returns Current theme configuration
 */
function getActiveTheme(): Theme;

// Example
const theme = getActiveTheme();
// → {
//   id: 'default',
//   colors: { primary: '#DC2626', raci: {...} }
// }
```

#### Filename Generation

```typescript
/**
 * Generate filename for export
 * @param chartTitle - Chart title
 * @param format - Export format (pdf, xlsx, csv, png, pptx)
 * @returns Generated filename
 */
function generateFilename(chartTitle: string, format: ExportFormat): string;

// Example
const filename = generateFilename("Mobile App Dev", "pdf");
// → 'Mobile App Dev - RACI Matrix.pdf'
```

#### Download Trigger

```typescript
/**
 * Trigger browser download
 * @param blob - File blob
 * @param filename - Download filename
 */
function triggerDownload(blob: Blob, filename: string): void;

// Example
const blob = new Blob([data], { type: "application/pdf" });
triggerDownload(blob, "chart.pdf");
// → Browser downloads file automatically
```

#### Size Validation

```typescript
/**
 * Check if file size within limits
 * @param blob - File blob
 * @param format - Export format
 * @returns { withinLimit: boolean, sizeLimit: string }
 */
function checkSizeLimit(blob: Blob, format: ExportFormat): SizeCheckResult;

// Example
const check = checkSizeLimit(pdfBlob, "pdf");
if (!check.withinLimit) {
  console.warn(`Exceeds ${check.sizeLimit} limit`);
}
```

---

### lib/raci/exporters/pdf.ts

```typescript
/**
 * Export chart to PDF
 * @param chart - RACI chart data
 * @param theme - Active theme
 * @returns Promise<Blob>
 */
async function exportToPdf(chart: RaciChart, theme: Theme): Promise<Blob>;

// Example
const pdfBlob = await exportToPdf(myChart, activeTheme);
triggerDownload(pdfBlob, generateFilename(myChart.title, "pdf"));
```

---

### lib/raci/exporters/xlsx.ts

```typescript
/**
 * Export chart to Excel
 * @param chart - RACI chart data
 * @param theme - Active theme
 * @returns Promise<Blob>
 */
async function exportToXlsx(chart: RaciChart, theme: Theme): Promise<Blob>;

// Example
const xlsxBlob = await exportToXlsx(myChart, activeTheme);
triggerDownload(xlsxBlob, generateFilename(myChart.title, "xlsx"));
```

---

### lib/raci/exporters/csv.ts

```typescript
/**
 * Export chart to CSV
 * @param chart - RACI chart data
 * @returns Promise<Blob>
 */
async function exportToCsv(chart: RaciChart): Promise<Blob>;

// Example
const csvBlob = await exportToCsv(myChart);
triggerDownload(csvBlob, generateFilename(myChart.title, "csv"));
```

---

### lib/raci/exporters/png.ts

```typescript
/**
 * Export chart to PNG
 * @param chart - RACI chart data
 * @param theme - Active theme
 * @returns Promise<Blob>
 */
async function exportToPng(chart: RaciChart, theme: Theme): Promise<Blob>;

// Example
const pngBlob = await exportToPng(myChart, activeTheme);
triggerDownload(pngBlob, generateFilename(myChart.title, "png"));
```

---

### lib/raci/exporters/pptx.ts

```typescript
/**
 * Export chart to PowerPoint
 * @param chart - RACI chart data
 * @param theme - Active theme
 * @returns Promise<Blob>
 */
async function exportToPptx(chart: RaciChart, theme: Theme): Promise<Blob>;

// Example
const pptxBlob = await exportToPptx(myChart, activeTheme);
triggerDownload(pptxBlob, generateFilename(myChart.title, "pptx"));
```

---

## Component APIs

### ExportButtons Component

```typescript
interface ExportButtonsProps {
  chart: RaciChart;
  theme: Theme;
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
}

// Usage
<ExportButtons
  chart={myChart}
  theme={activeTheme}
  onExportStart={() => console.log('Exporting...')}
  onExportComplete={() => console.log('Done!')}
  onExportError={(err) => console.error(err)}
/>
```

**Props:**

- `chart` (required): RACI chart data
- `theme` (required): Active theme
- `disabled` (optional): Disable export button
- `onExportStart` (optional): Callback when export starts
- `onExportComplete` (optional): Callback when export finishes
- `onExportError` (optional): Callback on export error

**States:**

- Normal (ready to export)
- Loading (export in progress)
- Error (export failed)
- Success (export completed)

---

### FormatSelector Component

```typescript
interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
  disabled?: boolean;
}

// Usage
<FormatSelector
  value={selectedFormat}
  onChange={(fmt) => setFormat(fmt)}
  disabled={isExporting}
/>
```

**Formats:**

- `pdf` – PDF Document
- `xlsx` – Excel Spreadsheet
- `csv` – CSV Data
- `png` – PNG Image
- `pptx` – PowerPoint

---

### ProgressIndicator Component

```typescript
interface ProgressIndicatorProps {
  visible: boolean;
  progress: number; // 0-100
  status: 'preparing' | 'rendering' | 'finalizing' | 'complete';
  onCancel?: () => void;
}

// Usage
<ProgressIndicator
  visible={isExporting}
  progress={exportProgress}
  status={exportStatus}
  onCancel={() => cancelExport()}
/>
```

---

## Data Structures

### ExportFormat Type

```typescript
type ExportFormat = "pdf" | "xlsx" | "csv" | "png" | "pptx";
```

### ExportOptions Interface

```typescript
interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includeLogo: boolean;
  resolution?: number; // For PNG, in dpi
  theme?: Theme;
}
```

### ExportResult Interface

```typescript
interface ExportResult {
  success: boolean;
  blob?: Blob;
  filename: string;
  format: ExportFormat;
  fileSize: number;
  exportTime: number; // in milliseconds
  error?: string;
}
```

### SizeCheckResult Interface

```typescript
interface SizeCheckResult {
  withinLimit: boolean;
  sizeLimit: string;
  actualSize: string;
  format: ExportFormat;
}
```

---

## Configuration

### src/config/exportConfig.json

```json
{
  "formats": {
    "pdf": {
      "name": "PDF Document",
      "description": "Professional documents for printing and email",
      "mimeType": "application/pdf",
      "sizeLimit": "10MB",
      "extension": ".pdf",
      "enabled": true
    },
    "xlsx": {
      "name": "Excel Spreadsheet",
      "description": "Styled spreadsheets for data analysis",
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "sizeLimit": "5MB",
      "extension": ".xlsx",
      "enabled": true
    },
    "csv": {
      "name": "CSV Data",
      "description": "Raw data for universal import",
      "mimeType": "text/csv",
      "extension": ".csv",
      "enabled": true
    },
    "png": {
      "name": "PNG Image",
      "description": "High-resolution images (300dpi)",
      "mimeType": "image/png",
      "sizeLimit": "20MB",
      "extension": ".png",
      "resolution": 300,
      "enabled": true
    },
    "pptx": {
      "name": "PowerPoint",
      "description": "Multi-slide presentations",
      "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "sizeLimit": "8MB",
      "extension": ".pptx",
      "enabled": true
    }
  },
  "defaults": {
    "format": "pdf",
    "includeMetadata": true,
    "includeLogo": true
  }
}
```

---

## Common Tasks

### Task 1: Basic Export (PDF)

```typescript
import {
  exportToPdf,
  triggerDownload,
  generateFilename,
} from "@/lib/raci/exporters";

const chart = myChart; // Your RACI chart
const theme = getActiveTheme();

// Export to PDF
const pdfBlob = await exportToPdf(chart, theme);

// Download
const filename = generateFilename(chart.title, "pdf");
triggerDownload(pdfBlob, filename);
```

### Task 2: Export with Progress Tracking

```typescript
const handleExport = async (format: ExportFormat) => {
  try {
    setIsExporting(true);
    setExportProgress(0);

    // Validate chart
    const validation = validateChart(chart);
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }

    setExportProgress(25);

    // Get theme
    const theme = getActiveTheme();

    setExportProgress(50);

    // Export based on format
    let blob: Blob;
    switch (format) {
      case "pdf":
        blob = await exportToPdf(chart, theme);
        break;
      case "xlsx":
        blob = await exportToXlsx(chart, theme);
        break;
      // ... etc
    }

    setExportProgress(75);

    // Check size
    const sizeCheck = checkSizeLimit(blob, format);
    if (!sizeCheck.withinLimit) {
      throw new Error(`File exceeds ${sizeCheck.sizeLimit} limit`);
    }

    setExportProgress(100);

    // Download
    const filename = generateFilename(chart.title, format);
    triggerDownload(blob, filename);

    setIsExporting(false);
  } catch (error) {
    setExportError(error.message);
    setIsExporting(false);
  }
};
```

### Task 3: Export All Formats

```typescript
const exportAllFormats = async (chart: RaciChart) => {
  const theme = getActiveTheme();

  const exports = await Promise.allSettled([
    exportToPdf(chart, theme),
    exportToXlsx(chart, theme),
    exportToCsv(chart),
    exportToPng(chart, theme),
    exportToPptx(chart, theme),
  ]);

  const formats: ExportFormat[] = ["pdf", "xlsx", "csv", "png", "pptx"];

  exports.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const filename = generateFilename(chart.title, formats[index]);
      triggerDownload(result.value, filename);
    } else {
      console.error(`${formats[index]} export failed:`, result.reason);
    }
  });
};
```

### Task 4: Custom Export Wrapper

```typescript
class RaciExporter {
  constructor(
    private chart: RaciChart,
    private theme: Theme
  ) {}

  async exportToPdf(): Promise<Blob> {
    const validation = validateChart(this.chart);
    if (!validation.valid) throw new Error(validation.errors[0]);
    return exportToPdf(this.chart, this.theme);
  }

  async exportToXlsx(): Promise<Blob> {
    const validation = validateChart(this.chart);
    if (!validation.valid) throw new Error(validation.errors[0]);
    return exportToXlsx(this.chart, this.theme);
  }

  async download(format: ExportFormat): Promise<void> {
    const blob = await this.exportMethod(format);
    const filename = generateFilename(this.chart.title, format);
    triggerDownload(blob, filename);
  }

  private async exportMethod(format: ExportFormat): Promise<Blob> {
    switch (format) {
      case "pdf":
        return this.exportToPdf();
      case "xlsx":
        return this.exportToXlsx();
      case "csv":
        return exportToCsv(this.chart);
      case "png":
        return exportToPng(this.chart, this.theme);
      case "pptx":
        return exportToPptx(this.chart, this.theme);
    }
  }
}

// Usage
const exporter = new RaciExporter(myChart, activeTheme);
await exporter.download("pdf");
```

---

## Troubleshooting

### Export Button Disabled?

**Reason:** Chart validation failed  
**Check:**

```typescript
const validation = validateChart(chart);
console.log(validation.errors); // See what's wrong
```

**Common Issues:**

- No roles defined
- No tasks defined
- No RACI assignments
- Empty matrix

---

### File Not Downloading?

**Reason 1:** Browser blocked download  
**Solution:** Check browser settings, allow popups for this site

**Reason 2:** Export function failed  
**Check:**

```typescript
try {
  const blob = await exportToPdf(chart, theme);
  console.log("Blob created:", blob.size, "bytes");
} catch (error) {
  console.error("Export error:", error);
}
```

---

### File Too Large?

**Check Size:**

```typescript
const sizeCheck = checkSizeLimit(blob, "pdf");
console.log(sizeCheck);
// { withinLimit: false, sizeLimit: '10MB', actualSize: '12.5MB' }
```

**Solutions:**

- Reduce number of roles/tasks
- Use CSV format (smaller)
- Compress logo image
- Try different format

---

### Colors Wrong in Export?

**Check Theme:**

```typescript
const theme = getActiveTheme();
console.log(theme.colors);
// Verify colors are correct
```

**Check Exporter:**

```typescript
// Make sure theme is passed
const blob = await exportToPdf(chart, activeTheme);
```

---

### Export Timeout?

**For large charts:**

- CSV is fastest (~100ms)
- XLSX is second (~1s)
- PDF takes ~2s
- PNG takes ~3s (300dpi rendering)
- PPTX takes ~2s

**If timing out:**

- Try CSV format first
- Check browser console for errors
- Reduce chart complexity

---

**For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [START_HERE.md](./START_HERE.md)**
