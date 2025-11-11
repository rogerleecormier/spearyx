# Iteration 5: Export – Component Structure & Hierarchy

**Status:** ✅ Complete  
**Updated:** 2025-11-10

---

## Component Hierarchy

```
RaciGeneratorPage
├── (Left Sidebar - Settings)
│   └── ExportButtons
│       ├── FormatSelector (dropdown)
│       ├── ProgressIndicator (overlay)
│       └── ErrorModal (overlay)
│
└── (State Management)
    ├── exportState: { format, progress, status, error }
    ├── isExporting: boolean
    └── lastExport: ExportResult | null
```

---

## ExportButtons Component

### Props

```typescript
interface ExportButtonsProps {
  chart: RaciChart;
  theme: Theme;
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onExportError?: (error: Error) => void;
}
```

### State

```typescript
const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
const [isExporting, setIsExporting] = useState(false);
const [exportProgress, setExportProgress] = useState(0);
const [exportError, setExportError] = useState<string | null>(null);
```

### Features

- ✅ Format selection dropdown
- ✅ Export button with loading state
- ✅ Progress indicator during export
- ✅ Error modal on failure
- ✅ File size preview (1.2 MB)
- ✅ Estimated time display
- ✅ Keyboard shortcuts (E, Tab, Enter)

### Render Structure

```jsx
<div className="space-y-3">
  {/* Format Selector */}
  <FormatSelector
    value={selectedFormat}
    onChange={setSelectedFormat}
    disabled={isExporting}
  />

  {/* Export Button */}
  <button
    onClick={handleExport}
    disabled={isExporting || chart.roles.length === 0}
    className="w-full bg-red-600 hover:bg-red-700..."
  >
    {isExporting ? (
      <>
        <Loader className="animate-spin" />
        Exporting...
      </>
    ) : (
      <>
        <Download className="mr-2" />
        Export
      </>
    )}
  </button>

  {/* File Size Preview */}
  {estimatedSize && (
    <Body className="text-xs text-slate-600">
      Estimated size: {formatFileSize(estimatedSize)}
    </Body>
  )}

  {/* Progress Indicator */}
  {isExporting && (
    <ProgressIndicator
      progress={exportProgress}
      status={exportStatus}
      onCancel={handleCancel}
    />
  )}

  {/* Error Modal */}
  {exportError && (
    <ErrorModal
      title="Export Failed"
      message={exportError}
      onClose={() => setExportError(null)}
    />
  )}
</div>
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `E` | Focus export button |
| `Tab` | Navigate format options |
| `Enter` | Confirm export |
| `Esc` | Close error modal |

### Accessibility

- ✅ ARIA labels on all buttons
- ✅ ARIA labels on dropdown
- ✅ Role="button" for custom buttons
- ✅ aria-busy during export
- ✅ aria-disabled when not available
- ✅ Live region for progress updates

---

## FormatSelector Component

### Props

```typescript
interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
  disabled?: boolean;
  showDescriptions?: boolean;
}
```

### Available Formats

```typescript
const FORMATS: FormatOption[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Professional documents for printing and email',
    icon: FileText,
    estimatedSize: '450 KB'
  },
  {
    id: 'xlsx',
    name: 'Excel Spreadsheet',
    description: 'Styled spreadsheets for data analysis',
    icon: Sheet,
    estimatedSize: '180 KB'
  },
  {
    id: 'csv',
    name: 'CSV Data',
    description: 'Raw data for universal import',
    icon: Table,
    estimatedSize: '35 KB'
  },
  {
    id: 'png',
    name: 'PNG Image',
    description: 'High-resolution images (300dpi)',
    icon: Image,
    estimatedSize: '2.8 MB'
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    description: 'Multi-slide presentations',
    icon: Presentation,
    estimatedSize: '350 KB'
  }
];
```

### Render Structure

```jsx
<select
  value={value}
  onChange={(e) => onChange(e.target.value as ExportFormat)}
  disabled={disabled}
  className="w-full px-3 py-2 border border-input rounded-md..."
  aria-label="Choose export format"
>
  {FORMATS.map((format) => (
    <option key={format.id} value={format.id}>
      {format.name}
      {showDescriptions && ` - ${format.description}`}
    </option>
  ))}
</select>
```

---

## ProgressIndicator Component

### Props

```typescript
interface ProgressIndicatorProps {
  visible: boolean;
  progress: number; // 0-100
  status: 'preparing' | 'rendering' | 'finalizing' | 'complete';
  onCancel?: () => void;
}
```

### Status Messages

```typescript
const STATUS_MESSAGES = {
  preparing: 'Preparing chart data...',
  rendering: 'Rendering matrix...',
  finalizing: 'Finalizing export...',
  complete: 'Export complete!'
};
```

### Render Structure

```jsx
{visible && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
      <Label className="block text-sm font-semibold mb-2">
        {STATUS_MESSAGES[status]}
      </Label>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
        <div
          className="bg-red-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="text-right mb-4">
        <Caption>{progress}%</Caption>
      </div>

      {/* Cancel Button */}
      {status !== 'complete' && (
        <button
          onClick={onCancel}
          className="w-full px-4 py-2 border border-slate-300 rounded hover:bg-slate-50"
        >
          Cancel
        </button>
      )}
    </div>
  </div>
)}
```

---

## Export Error Handling

### Error Modal Component

```typescript
interface ErrorModalProps {
  title: string;
  message: string;
  details?: string;
  onClose: () => void;
  onRetry?: () => void;
}
```

### Common Errors

| Error | Message | Action |
|-------|---------|--------|
| Validation Failed | "Chart is incomplete" | Fix errors and retry |
| Size Exceeded | "File exceeds 10MB limit" | Try different format |
| Browser Unsupported | "Export not supported" | Use different browser |
| Network Error | "Export failed" | Check connection, retry |

### Render

```jsx
<ErrorModal
  title="Export Failed"
  message={error.message}
  details={error.details}
  onClose={handleClose}
  onRetry={handleRetry}
/>
```

---

## Re-render Triggers

### ExportButtons

Triggers re-render when:
- ✅ `chart` prop changes
- ✅ `theme` prop changes
- ✅ `selectedFormat` state changes
- ✅ `isExporting` state changes
- ✅ `exportProgress` state changes
- ✅ `exportError` state changes

### Optimization

```typescript
// Use React.memo to prevent unnecessary re-renders
export default React.memo(function ExportButtons(props) {
  // Component code
});

// Use useCallback for handlers
const handleExport = useCallback(async () => {
  // Export logic
}, [chart, theme]);
```

---

## Performance Optimizations

### 1. Lazy Loading

```typescript
// Load export libraries only when needed
const handleExport = async (format: ExportFormat) => {
  if (format === 'pdf') {
    const { exportToPdf } = await import('@/lib/raci/exporters/pdf');
    // Use exportToPdf
  }
};
```

### 2. Memoization

```typescript
// Memoize expensive computations
const estimatedSize = useMemo(() => {
  return calculateEstimatedSize(chart, selectedFormat);
}, [chart, selectedFormat]);
```

### 3. Cancellation

```typescript
// Allow cancelling long-running exports
const abortController = new AbortController();

const handleCancel = () => {
  abortController.abort();
  setIsExporting(false);
};
```

---

## Testing Checklist

### Unit Tests
- ✅ Format selection changes value
- ✅ Export button disabled when chart empty
- ✅ Error message displays on failure
- ✅ Progress bar updates correctly
- ✅ File size calculation correct

### Integration Tests
- ✅ PDF export end-to-end
- ✅ XLSX export end-to-end
- ✅ CSV export end-to-end
- ✅ PNG export end-to-end
- ✅ PPTX export end-to-end

### Accessibility Tests
- ✅ Keyboard navigation works
- ✅ Screen reader announces status
- ✅ Focus indicators visible
- ✅ Error messages accessible
- ✅ Progress updates announced

### Browser Tests
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

---

## Integration with RaciGeneratorPage

### Import

```typescript
import ExportButtons from '@/components/raci/ExportButtons';
```

### Usage

```tsx
<Card className="border-slate-200 shadow-sm">
  <CardHeader className="pb-3">
    <Label className="text-slate-700 font-semibold text-xs">
      Export
    </Label>
  </CardHeader>
  <CardContent>
    <ExportButtons
      chart={chart}
      theme={chart.theme}
      onExportStart={() => setIsExporting(true)}
      onExportComplete={() => setIsExporting(false)}
      onExportError={(error) => showErrorModal(error.message)}
    />
  </CardContent>
</Card>
```

---

## File Locations

```
src/components/raci/
├── ExportButtons.tsx          Main export UI component
├── FormatSelector.tsx         Format dropdown
├── ProgressIndicator.tsx      Export progress display
├── ErrorModal.tsx             Error display (shared)
└── index.ts                   Export statement

src/lib/raci/exporters/
├── pdf.ts                     PDF export engine
├── xlsx.ts                    XLSX export engine
├── csv.ts                     CSV export engine
├── png.ts                     PNG export engine
├── pptx.ts                    PPTX export engine
└── export-utils.ts            Shared utilities
```

---

## Dependencies

### Internal
- `@/components/ui/card` - Card component
- `@/components/Typography` - Typography components
- `@/types/raci` - Type definitions
- `@/lib/raci/export-utils` - Export utilities
- `@/lib/raci/exporters/*` - Format-specific exporters

### External
- `react` - UI framework
- `react-pdf` - PDF generation
- `exceljs` - XLSX generation
- `html2canvas` - PNG rendering
- `pptxgenjs` - PPTX generation
- `lucide-react` - Icons

---

**Status:** ✅ Component structure complete and documented
