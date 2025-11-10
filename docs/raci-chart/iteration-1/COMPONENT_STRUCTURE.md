# 🧩 Component Structure – Detailed Reference

**Version**: 1.0.0  
**Scope**: Iteration 1 Components  
**Status**: ✅ COMPLETE

---

## 📑 Table of Contents

1. Page Component
2. Orchestrator Component
3. Input Components (4)
4. Display Components (2)
5. Control Components (3)
6. Modal Components (2)
7. UI Components (1)

**Total**: 13 components

---

## 🔵 RaciGeneratorPage (Page Component)

**Location**: `src/components/raci/RaciGeneratorPage.tsx`  
**Type**: Functional Component  
**Purpose**: SSR entry point, state initialization  
**Line Count**: ~100 lines

### Props Interface

```typescript
// No props – entry point
```

### Internal State

```typescript
const [state, setState] = useState<RaciSessionState>({
  chart: {
    id: generateId(),
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    title: "New RACI Chart",
    roles: [],
    tasks: [],
    matrix: {},
    theme: "default",
  },
  undoStack: [],
  uiState: {
    editingMode: true,
    sidebarOpen: true,
    activeTheme: "default",
  },
  validation: { isValid: true, errors: [] },
  notifications: [],
});
```

### Key Methods

```typescript
// State management
const handleStateChange = (newState: RaciSessionState) => {
  setState(newState);
  // Push to undo stack
  // Trigger validation
};
```

### Children

- `<RaciEditor state={state} onChange={handleStateChange} />`
- `<ErrorModal />`
- `<Toaster />`

### Accessibility

- ✅ Main landmark (`role="main"`)
- ✅ Error boundary ready
- ✅ Focus management

---

## 🟠 RaciEditor (Orchestrator Component)

**Location**: `src/components/raci/RaciEditor.tsx`  
**Type**: Functional Component  
**Purpose**: Main layout orchestrator, child rendering  
**Line Count**: ~80 lines

### Props Interface

```typescript
interface RaciEditorProps {
  state: RaciSessionState;
  onChange: (state: RaciSessionState) => void;
}
```

### Layout Structure

```typescript
<div className="raci-editor-layout">
  {/* Left Sidebar */}
  <div className="raci-sidebar">
    <RaciHeaderBar ... />
    <DescriptionPanel ... />
    <RolesEditor ... />
    <TasksEditor ... />
    <ThemeSelector ... />
  </div>

  {/* Main Content */}
  <div className="raci-main-content">
    <RaciMatrixEditor ... />
    <ExportButtons ... />
    <ResetControls ... />
  </div>

  {/* Fixed Controls */}
  <UndoButton ... />
</div>
```

### Responsive Breakpoints

```css
/* Desktop: 2 columns */
.raci-editor-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

/* Tablet: 1 column */
@media (max-width: 1024px) {
  grid-template-columns: 1fr;
}

/* Mobile: Stack */
@media (max-width: 768px) {
  gap: 1rem;
}
```

### Child Communication

```typescript
// Data flows down via props
<RaciHeaderBar
  title={state.chart.title}
  onChange={(title) => {
    const newState = { ...state }
    newState.chart.title = title
    onChange(newState)
  }}
/>
```

### Accessibility

- ✅ Semantic structure
- ✅ Proper heading hierarchy
- ✅ Landmark regions

---

## 🟡 Input Components

### 1. RaciHeaderBar

**Location**: `src/components/raci/RaciHeaderBar.tsx`  
**Purpose**: Title input, logo upload  
**Line Count**: ~70 lines

```typescript
interface RaciHeaderBarProps {
  title: string;
  logo?: string;
  onTitleChange: (title: string) => void;
  onLogoUpload: (file: File) => Promise<void>;
}
```

**UI Elements**:

- Text input (max 100 chars)
- Logo upload button
- Preview area
- Character counter

**Accessibility**:

- ✅ Label + input association
- ✅ Type hints
- ✅ Error messages

---

### 2. DescriptionPanel

**Location**: `src/components/raci/DescriptionPanel.tsx`  
**Purpose**: Project description input  
**Line Count**: ~60 lines

```typescript
interface DescriptionPanelProps {
  description: string;
  onChange: (description: string) => void;
}
```

**UI Elements**:

- Textarea (multi-line)
- Placeholder text
- Character count
- Word count

**Accessibility**:

- ✅ Label for textarea
- ✅ Placeholder guidance
- ✅ Live character count

---

### 3. RolesEditor

**Location**: `src/components/raci/RolesEditor.tsx`  
**Purpose**: Add, view, delete roles  
**Line Count**: ~90 lines

```typescript
interface RolesEditorProps {
  roles: RaciRole[];
  onChange: (roles: RaciRole[]) => void;
}
```

**UI Elements**:

- "Add Role" button
- Roles list
- Delete button per role
- Edit button per role (future)

**Features**:

- Add: Generate new role object
- Edit: Show inline edit (Iteration 2)
- Delete: Confirmation dialog (Iteration 2)
- Sort: Drag-drop ready (Iteration 3)

**Accessibility**:

- ✅ Button labels
- ✅ Keyboard support
- ✅ List semantics

---

### 4. TasksEditor

**Location**: `src/components/raci/TasksEditor.tsx`  
**Purpose**: Add, view, delete tasks  
**Line Count**: ~90 lines

```typescript
interface TasksEditorProps {
  tasks: RaciTask[];
  onChange: (tasks: RaciTask[]) => void;
}
```

**UI Elements**:

- "Add Task" button
- Tasks list
- Delete button per task
- Edit button per task (future)

**Features**:

- Add: Generate new task object
- Edit: Show inline edit (Iteration 2)
- Delete: Confirmation dialog (Iteration 2)
- Sort: Drag-drop ready (Iteration 3)

**Accessibility**:

- ✅ Button labels
- ✅ Keyboard support
- ✅ List semantics

---

## 🟢 Display Components

### 1. RaciMatrixEditor

**Location**: `src/components/raci/RaciMatrixEditor.tsx`  
**Purpose**: Interactive RACI grid display  
**Line Count**: ~120 lines

```typescript
interface RaciMatrixEditorProps {
  chart: RaciChart;
  onChange: (chart: RaciChart) => void;
}
```

**UI Structure**:

```
        Role1   Role2   Role3  ...
Task1   [R]     [A]     [C]
Task2   [A]     [R]     [I]
Task3   [ ]     [A]     [ ]
...
```

**Cell Values**:

- R (Responsible) = 🟢 Green
- A (Accountable) = 🟡 Amber
- C (Consulted) = 🔵 Blue
- I (Informed) = ⚫ Gray
- Empty = No color

**Features**:

- Click cell to cycle: R → A → C → I → empty → R
- Color-coded display
- Keyboard navigation (Arrow keys)
- Scroll container on mobile

**Data Structure**:

```typescript
matrix: {
  "role-1": {
    "task-1": "R",
    "task-2": "A",
    "task-3": null,
  },
  "role-2": {
    "task-1": "A",
    "task-2": "R",
    "task-3": "I",
  }
}
```

**Accessibility**:

- ✅ ARIA labels on cells
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode

---

### 2. ThemeSelector

**Location**: `src/components/raci/ThemeSelector.tsx`  
**Purpose**: Theme selection dropdown  
**Line Count**: ~60 lines

```typescript
interface ThemeSelectorProps {
  activeTheme: string;
  onChange: (theme: string) => void;
}
```

**UI Elements**:

- Dropdown select
- 4 theme options:
  - Default (Blue)
  - Corporate (Dark Blue)
  - Minimal (Grayscale)
  - Vibrant (Purple)
- Theme preview
- Color swatches

**Theme Configuration**:

```json
{
  "default": {
    "name": "Website Default",
    "primary": "#0066cc",
    "roleColors": {
      "r": "#22c55e",
      "a": "#eab308",
      "c": "#3b82f6",
      "i": "#9ca3af"
    }
  }
}
```

**Accessibility**:

- ✅ Native select element
- ✅ Clear labels
- ✅ Keyboard support

---

## 🔴 Control Components

### 1. ExportButtons

**Location**: `src/components/raci/ExportButtons.tsx`  
**Purpose**: Export format selection  
**Line Count**: ~70 lines

```typescript
interface ExportButtonsProps {
  chart: RaciChart;
  onExport: (format: ExportFormat) => void;
}
```

**Export Formats** (Iteration 6+):

- PDF (print-friendly)
- XLSX (Excel spreadsheet)
- PPTX (PowerPoint slide)
- PNG (image export)
- CSV (data export)

**UI Elements**:

- 5 format buttons
- Disabled state (until Iteration 6)
- Tooltips with hints
- Loading state during export

**Accessibility**:

- ✅ Button labels
- ✅ Disabled state indicated
- ✅ Tooltips (aria-label)

---

### 2. ResetControls

**Location**: `src/components/raci/ResetControls.tsx`  
**Purpose**: Reset chart or theme  
**Line Count**: ~50 lines

```typescript
interface ResetControlsProps {
  onResetChart: () => void;
  onResetTheme: () => void;
}
```

**UI Elements**:

- "Reset Chart" button
- "Reset Theme" button
- Confirmation dialog (future)
- Warning text

**Behaviors**:

- Reset Chart: Clear all data, new blank chart
- Reset Theme: Restore default theme
- Confirmation dialog (Iteration 2)

**Accessibility**:

- ✅ Clear button labels
- ✅ Warning text
- ✅ Confirmation required

---

### 3. UndoButton

**Location**: `src/components/raci/UndoButton.tsx`  
**Purpose**: Undo last action  
**Line Count**: ~40 lines

```typescript
interface UndoButtonProps {
  canUndo: boolean;
  onUndo: () => void;
}
```

**UI Elements**:

- Undo button (fixed position)
- Icon (back arrow)
- Label: "Undo"
- Keyboard hint: "Ctrl+Z"

**States**:

- Enabled: When undoStack not empty
- Disabled: When at initial state
- Active: During undo operation

**Keyboard Support**:

- Ctrl+Z: Trigger undo
- Focus indicator
- Tooltip on hover

**Accessibility**:

- ✅ Button label
- ✅ Keyboard shortcut
- ✅ Disabled state

---

## 🟣 Modal Components

### 1. ErrorModal

**Location**: `src/components/raci/ErrorModal.tsx`  
**Purpose**: Display validation errors  
**Line Count**: ~80 lines

```typescript
interface ErrorModalProps {
  isOpen: boolean;
  errors: ValidationError[];
  onClose: () => void;
}
```

**UI Structure**:

```
┌─────────────────────────┐
│ ⚠ Error                 │
├─────────────────────────┤
│ • Error 1               │
│ • Error 2               │
│ • Error 3               │
├─────────────────────────┤
│         [Close]         │
└─────────────────────────┘
```

**Features**:

- Modal backdrop (click-to-close)
- Error list display
- Severity indicators
- Close button
- Escape to close

**Error Types**:

- Validation errors (field: string)
- Network errors
- File upload errors
- Export errors

**Accessibility**:

- ✅ Modal role (role="dialog")
- ✅ aria-modal="true"
- ✅ Focus trap
- ✅ Escape key support
- ✅ Screen reader announcement

---

### 2. Toaster

**Location**: `src/components/ui/Toaster.tsx`  
**Purpose**: Toast notifications  
**Line Count**: ~40 lines

```typescript
// No props – uses context or portal
export default function Toaster() {
  // Renders toast notifications
}
```

**Toast Types**:

- Success (✓ green)
- Error (✗ red)
- Info (ℹ blue)
- Warning (⚠ amber)

**Features**:

- Auto-dismiss (configurable duration)
- Multiple toasts support
- Stack vertically (bottom-right)
- Click to dismiss
- Close button

**Notification State**:

```typescript
interface NotificationState {
  id: string; // UUID
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number; // ms (default 3000)
}
```

**Accessibility**:

- ✅ aria-live="polite"
- ✅ aria-role="alert"
- ✅ Keyboard dismissible
- ✅ High contrast

---

## 📤 Component Exports

**Location**: `src/components/raci/index.ts`  
**Purpose**: Centralized component exports

```typescript
// Page
export { RaciGeneratorPage } from "./RaciGeneratorPage";

// Orchestrator
export { RaciEditor } from "./RaciEditor";

// Input Components
export { RaciHeaderBar } from "./RaciHeaderBar";
export { DescriptionPanel } from "./DescriptionPanel";
export { RolesEditor } from "./RolesEditor";
export { TasksEditor } from "./TasksEditor";

// Display Components
export { RaciMatrixEditor } from "./RaciMatrixEditor";
export { ThemeSelector } from "./ThemeSelector";

// Control Components
export { ExportButtons } from "./ExportButtons";
export { ResetControls } from "./ResetControls";
export { UndoButton } from "./UndoButton";

// Modal Components
export { ErrorModal } from "./ErrorModal";

// Re-export types
export type { RaciEditorProps } from "./RaciEditor";
export * from "../types/raci";
```

---

## 🔄 Component Interaction Patterns

### Pattern 1: Input Component

```typescript
// User types in input
<input
  value={state.chart.title}
  onChange={(e) => {
    const newState = { ...state }
    newState.chart.title = e.target.value
    onChange(newState)
  }}
/>
```

### Pattern 2: List Component

```typescript
// User clicks add
const handleAddRole = () => {
  const newRole: RaciRole = {
    id: generateId(),
    name: `Role ${roles.length + 1}`,
    color: getNextColor(),
  };
  onChange([...roles, newRole]);
};
```

### Pattern 3: Matrix Component

```typescript
// User clicks cell
const handleCellClick = (roleId: string, taskId: string) => {
  const newValue = cycleValue(matrix[roleId]?.[taskId]);
  const newChart = { ...chart };
  newChart.matrix[roleId] = {
    ...newChart.matrix[roleId],
    [taskId]: newValue,
  };
  onChange(newChart);
};
```

### Pattern 4: Dropdown Component

```typescript
// User selects theme
<select
  value={activeTheme}
  onChange={(e) => onChange(e.target.value)}
>
  <option value="default">Default</option>
  <option value="corporate">Corporate</option>
  {/* ... */}
</select>
```

---

## 📊 Component Summary Table

| Component         | Type         | Props                      | Status | Lines   |
| ----------------- | ------------ | -------------------------- | ------ | ------- |
| RaciGeneratorPage | Page         | None                       | ✅     | 100     |
| RaciEditor        | Orchestrator | state, onChange            | ✅     | 80      |
| RaciHeaderBar     | Input        | title, logo, onChange      | ✅     | 70      |
| DescriptionPanel  | Input        | description, onChange      | ✅     | 60      |
| RolesEditor       | Input        | roles, onChange            | ✅     | 90      |
| TasksEditor       | Input        | tasks, onChange            | ✅     | 90      |
| RaciMatrixEditor  | Display      | chart, onChange            | ✅     | 120     |
| ThemeSelector     | Display      | activeTheme, onChange      | ✅     | 60      |
| ExportButtons     | Control      | chart, onExport            | ✅     | 70      |
| ResetControls     | Control      | onResetChart, onResetTheme | ✅     | 50      |
| UndoButton        | Control      | canUndo, onUndo            | ✅     | 40      |
| ErrorModal        | Modal        | isOpen, errors, onClose    | ✅     | 80      |
| Toaster           | UI           | None                       | ✅     | 40      |
| **Total**         |              |                            | **✅** | **880** |

---

## 🎯 Component Usage Example

```typescript
import {
  RaciGeneratorPage,
  RaciEditor,
  RaciHeaderBar,
  RaciMatrixEditor,
  ErrorModal,
  type RaciSessionState,
} from '@/components/raci'

// In your route
export function RaciGeneratorRoute() {
  const [state, setState] = useState<RaciSessionState>({
    chart: { /* ... */ },
    undoStack: [],
    uiState: { /* ... */ },
    validation: { isValid: true, errors: [] },
    notifications: [],
  })

  return <RaciGeneratorPage />
}
```

---

## 🔗 Related Documentation

- **ARCHITECTURE.md** – System design
- **QUICK_REFERENCE.md** – Quick lookup
- **START_HERE.md** – Getting started

---

**Version**: 1.0.0  
**Status**: ✅ Complete  
**Date**: 2025-11-10
