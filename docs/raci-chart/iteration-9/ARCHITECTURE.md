# Iteration 9: Architecture & Implementation Guide

## System Overview

```
Iteration 9 Components
├── Error Handling
│   ├── ErrorModal.tsx (accessible dialog)
│   ├── Error categorization logic
│   └── Recovery action suggestions
├── Undo System
│   ├── useUndo hook (state management)
│   ├── UndoButton.tsx (UI control)
│   └── Undo history persistence
├── Reset Controls
│   ├── ResetControls.tsx (buttons)
│   ├── Confirmation dialogs
│   └── Template/theme reset logic
└── Keyboard Shortcuts
    ├── useKeyboardNav hook (handlers)
    ├── Ctrl+Z / Cmd+Z support
    └── Focus management
```

---

## Component Details

### 1. ErrorModal Component

**Location**: `src/components/raci/ErrorModal.tsx`

**Props**:
```typescript
interface ErrorModalProps {
  isOpen: boolean;
  error: {
    type: 'validation' | 'upload' | 'import' | 'network' | 'export';
    title: string;
    message: string;
    details?: string;
    recoveryActions?: Array<{
      label: string;
      action: () => void;
      isPrimary?: boolean;
    }>;
  };
  onClose: () => void;
  onContactAdmin?: () => void;
}
```

**Features**:
- Accessible dialog with `role="alertdialog"`
- ARIA labels and descriptions
- Keyboard support (Esc to close)
- Recovery action buttons
- "Contact Admin" fallback link

**Error Type Handling**:

| Type | Title | Recovery |
|------|-------|----------|
| validation | Validation Error | Highlight field, suggest fix |
| upload | Upload Failed | Retry, check file type/size |
| import | Import Error | Load backup, try again |
| network | Network Error | Retry, use fallback |
| export | Export Failed | Retry, switch format |

### 2. ResetControls Component

**Location**: `src/components/raci/ResetControls.tsx`

**Props**:
```typescript
interface ResetControlsProps {
  onReset: () => void;
  onResetTheme: () => void;
  disabled?: boolean;
}
```

**Features**:
- "Reset Chart Contents" button with confirmation
- "Reset Theme" button (no confirmation)
- Both support undo
- Danger zone styling (red background)

**Confirmation Dialog**:
```
┌─────────────────────────────────┐
│ Reset Chart Contents?           │
├─────────────────────────────────┤
│ Are you sure? This cannot be    │
│ undone. (Undo is available)     │
│                                 │
│ [Cancel] [Reset]                │
└─────────────────────────────────┘
```

### 3. UndoButton Component

**Location**: `src/components/raci/UndoButton.tsx`

**Props**:
```typescript
interface UndoButtonProps {
  canUndo: boolean;
  onUndo: () => void;
  lastAction?: string;
}
```

**Features**:
- Disabled when `canUndo` is false
- Shows last action in tooltip
- Keyboard hint: "Ctrl+Z"
- Accessible button with ARIA label

### 4. useUndo Hook

**Location**: `src/lib/raci/hooks.ts` (or separate file)

**Usage**:
```typescript
const { canUndo, undo, saveState } = useUndo(chart);

// Save state before mutation
saveState(currentChart);

// Undo to previous state
undo();
```

**State Structure**:
```typescript
interface UndoState {
  current: RaciChart;
  previous: RaciChart | null;
  canUndo: boolean;
  lastAction: string;
}
```

**Persistence**:
- Stored in localStorage under `raci-undo-state`
- Restored on page reload
- Cleared after export/import

---

## Integration Points

### 1. RaciGeneratorPage Integration

```typescript
// In RaciGeneratorPage.tsx
const { state: chart, ...actions } = useRaciState();
const { canUndo, undo, saveState } = useUndo(chart);

// Before any state mutation
const handleEditRole = (id: string, name: string) => {
  saveState(chart); // Save current state
  editRole(id, name); // Perform mutation
};

// Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo]);
```

### 2. Error Handling Integration

```typescript
// In components that can error
const [error, setError] = useState<ErrorState | null>(null);

const handleExport = async (format: ExportFormat) => {
  try {
    // Export logic
  } catch (err) {
    setError({
      type: 'export',
      title: 'Export Failed',
      message: err.message,
      recoveryActions: [
        {
          label: 'Retry',
          action: () => handleExport(format),
          isPrimary: true,
        },
        {
          label: 'Try Different Format',
          action: () => setError(null),
        },
      ],
    });
  }
};

// Render error modal
<ErrorModal
  isOpen={!!error}
  error={error}
  onClose={() => setError(null)}
/>
```

### 3. Reset Controls Integration

```typescript
// In RaciGeneratorPage.tsx
const handleReset = () => {
  saveState(chart); // Save for undo
  reset(); // Reset to template
};

const handleResetTheme = () => {
  saveState(chart); // Save for undo
  updateTheme('default'); // Reset theme
};

<ResetControls
  onReset={handleReset}
  onResetTheme={handleResetTheme}
/>
```

---

## Keyboard Navigation Map

```
Global Shortcuts:
├── Ctrl+Z / Cmd+Z     → Undo last action
├── Esc                → Close modal/cancel action
└── Tab / Shift+Tab    → Navigate focusable elements

Matrix Navigation:
├── Tab                → Next cell
├── Shift+Tab          → Previous cell
├── Arrow Keys         → Move within matrix
├── Space              → Toggle cell value
└── Enter              → Confirm action

Form Navigation:
├── Tab                → Next field
├── Shift+Tab          → Previous field
├── Enter              → Submit form
└── Esc                → Cancel/close
```

---

## Error Recovery Flows

### Validation Error Flow

```
User Action
    ↓
Validation Check
    ↓
Error Detected
    ↓
ErrorModal Shows
├── Error message
├── Affected field highlighted
└── Recovery: Fix field, retry
    ↓
User Fixes & Retries
    ↓
Success
```

### Upload Error Flow

```
User Uploads File
    ↓
File Validation
    ↓
Error Detected (type/size/corruption)
    ↓
ErrorModal Shows
├── Error type
├── File requirements
└── Recovery: Retry with valid file
    ↓
User Retries
    ↓
Success or Fallback
```

### Import Error Flow

```
User Imports Chart
    ↓
Payload Validation
    ↓
Error Detected (malformed/version/corrupted)
    ↓
ErrorModal Shows
├── Error details
└── Recovery: Load backup, try again
    ↓
User Chooses Action
    ↓
Load Backup or Retry
    ↓
Success
```

### Network Error Flow

```
AI Request / Export
    ↓
Network Error
    ↓
ErrorModal Shows
├── Error type (timeout/CORS/etc)
└── Recovery: Retry, use fallback
    ↓
User Chooses Action
    ↓
Retry or Use Fallback
    ↓
Success
```

---

## State Management

### Undo State Lifecycle

```
1. Initial Load
   └── canUndo = false (no prior state)

2. User Makes Edit
   └── saveState(chart) → canUndo = true

3. User Clicks Undo
   └── undo() → restore previous state

4. User Exports
   └── canUndo = false (export is final)

5. User Imports
   └── canUndo = false (import is final)

6. Page Reload
   └── Restore undo state from localStorage
```

### Error State Lifecycle

```
1. Error Occurs
   └── setError({ type, title, message, recoveryActions })

2. ErrorModal Displays
   └── User sees error + recovery options

3. User Chooses Action
   ├── Retry → Attempt action again
   ├── Fix & Retry → User fixes issue, retries
   └── Load Backup → Restore from localStorage

4. Success or New Error
   └── Close modal or show new error
```

---

## Accessibility Considerations

### ARIA Implementation

```typescript
// ErrorModal
<div
  role="alertdialog"
  aria-labelledby="error-title"
  aria-describedby="error-message"
  aria-modal="true"
>
  <h2 id="error-title">{error.title}</h2>
  <p id="error-message">{error.message}</p>
</div>

// UndoButton
<button
  disabled={!canUndo}
  aria-label="Undo last action (Ctrl+Z)"
  title={`Undo: ${lastAction}`}
>
  ↶ Undo
</button>

// ResetControls
<button
  aria-label="Reset chart contents"
  aria-describedby="reset-warning"
>
  Reset Chart
</button>
```

### Keyboard Support

- All buttons accessible via Tab
- Modals closable with Esc
- Focus restored after modal close
- Keyboard shortcuts announced in tooltips
- ARIA live regions for status updates

---

## Testing Strategy

### Unit Tests

```typescript
// useUndo hook
test('saveState enables undo', () => {
  const { saveState, canUndo } = useUndo(initialChart);
  saveState(modifiedChart);
  expect(canUndo).toBe(true);
});

test('undo restores previous state', () => {
  const { saveState, undo, current } = useUndo(initialChart);
  saveState(modifiedChart);
  undo();
  expect(current).toEqual(initialChart);
});

// ErrorModal
test('displays error message', () => {
  render(<ErrorModal isOpen error={mockError} />);
  expect(screen.getByText(mockError.message)).toBeInTheDocument();
});

test('calls recovery action', () => {
  const mockAction = jest.fn();
  render(
    <ErrorModal
      isOpen
      error={{
        ...mockError,
        recoveryActions: [{ label: 'Retry', action: mockAction }],
      }}
    />
  );
  fireEvent.click(screen.getByText('Retry'));
  expect(mockAction).toHaveBeenCalled();
});
```

### Integration Tests

```typescript
// Undo workflow
test('undo works after edit', async () => {
  const { getByText, getByDisplayValue } = render(<RaciGeneratorPage />);
  
  // Edit role
  fireEvent.change(getByDisplayValue('Product Manager'), {
    target: { value: 'PM' },
  });
  
  // Undo
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
  
  // Verify restored
  expect(getByDisplayValue('Product Manager')).toBeInTheDocument();
});

// Error recovery
test('error modal shows and recovers', async () => {
  const { getByText } = render(<RaciGeneratorPage />);
  
  // Trigger error
  fireEvent.click(getByText('Export as PDF'));
  
  // Wait for error
  await waitFor(() => {
    expect(getByText(/Export Failed/)).toBeInTheDocument();
  });
  
  // Click recovery
  fireEvent.click(getByText('Retry'));
  
  // Verify retry
  expect(getByText(/Exporting/)).toBeInTheDocument();
});
```

---

## Performance Considerations

- Undo state stored in localStorage (5MB limit)
- Error modals use React.memo to prevent re-renders
- Keyboard handlers debounced to prevent rapid firing
- Focus management optimized for accessibility

---

## Browser Compatibility

- Chrome/Edge ≥90
- Firefox ≥88
- Safari ≥14
- Mobile Safari (iOS ≥14)

All keyboard shortcuts and ARIA features tested across browsers.
