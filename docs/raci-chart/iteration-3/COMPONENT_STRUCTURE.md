# Iteration 3 – Component Structure

**Version**: 3.0.0  
**Date**: 2025-11-10

---

## Component Hierarchy

```
RaciGeneratorPage (Parent)
│
├── State Management
│   └── useRaciState()
│       ├── state: RaciChart
│       ├── updateMatrix: (matrix) => void
│       ├── updateTitle: (title) => void
│       ├── addRole: (name) => void
│       ├── editRole: (id, name) => void
│       ├── deleteRole: (id) => void
│       ├── addTask: (name) => void
│       ├── editTask: (id, name, description) => void
│       └── deleteTask: (id) => void
│
├── Validation
│   └── useValidation(chart)
│       └── ValidationResult
│           ├── isValid: boolean
│           ├── errors: ValidationError[]
│           └── warnings: ValidationWarning[]
│
├── Auto-save
│   └── useAutoSave(chart)
│       ├── isSaving: boolean
│       ├── lastSaved: Date | null
│       └── error: Error | null
│
└── Components
    ├── RaciHeaderBar
    │   ├── title: string
    │   ├── logo: string | undefined
    │   ├── onTitleChange: (title) => void
    │   └── onLogoChange: (logo) => void
    │
    ├── DescriptionPanel
    │   ├── description: string
    │   └── onChange: (description) => void
    │
    ├── RolesEditor ⬅️ Iteration 2
    │   ├── roles: RaciRole[]
    │   └── onChange: (roles) => void
    │
    ├── TasksEditor ⬅️ Iteration 2
    │   ├── tasks: RaciTask[]
    │   └── onChange: (tasks) => void
    │
    ├── RaciMatrixEditor ⭐ Iteration 3 ENHANCED
    │   ├── chart: RaciChart
    │   ├── onMatrixChange: (matrix) => void
    │   ├── State
    │   │   ├── focusedCell: { roleId, taskId } | null
    │   │   └── cellRefs: Map<string, CellRef>
    │   ├── UI Sections
    │   │   ├── Matrix Table
    │   │   │   ├── thead (task headers with validation badges)
    │   │   │   └── tbody (role rows with cells)
    │   │   ├── Keyboard Help Panel
    │   │   └── Validation Status Panel
    │   └── Event Handlers
    │       ├── handleCellKeyDown
    │       ├── cycleCellForward
    │       ├── cycleCellBackward
    │       └── updateCell
    │
    ├── ThemeSelector
    │   ├── theme: string
    │   └── onChange: (theme) => void
    │
    ├── ExportButtons
    │   └── (no props)
    │
    ├── ResetControls
    │   ├── onReset: () => void
    │   └── onResetTheme: () => void
    │
    ├── ErrorModal
    │   └── (no props, uses context)
    │
    └── Toaster
        └── (global toast notifications)
```

---

## RaciMatrixEditor Component Detail

### Props Interface

```typescript
interface RaciMatrixEditorProps {
  chart: RaciChart;
  onMatrixChange: (matrix: Record<string, Record<string, RaciValue>>) => void;
}
```

### State

```typescript
// Focused cell for keyboard navigation
const [focusedCell, setFocusedCell] = useState<{
  roleId: string;
  taskId: string;
} | null>(null);

// References to cell button elements for focus management
const cellRefs = useRef<Map<string, CellRef>>(new Map());

// RACI value cycle for Space key cycling
const raciCycle: (RaciValue | null)[] = ["R", "A", "C", "I", null];
```

### Internal Types

```typescript
interface CellRef {
  roleId: string;
  taskId: string;
  element: HTMLButtonElement | null;
}

interface CellColor {
  background: string; // Tailwind class
  border: string; // Tailwind class
  text: string; // Tailwind class
  label: string; // "Responsible", "Accountable", etc.
}
```

### Hooks Used

```typescript
import { useCallback, useRef, useState } from "react";

// useCallback: All event handlers
const cycleCellForward = useCallback((roleId, taskId) => { ... }, []);
const cycleCellBackward = useCallback((roleId, taskId) => { ... }, []);
const handleCellKeyDown = useCallback((e, roleIndex, taskIndex, ...) => { ... }, []);
const updateCell = useCallback((roleId, taskId, value) => { ... }, []);

// useRef: Cell references for focus management
const cellRefs = useRef<Map<string, CellRef>>(new Map());

// useState: Focused cell tracking
const [focusedCell, setFocusedCell] = useState<{ roleId, taskId } | null>(null);
```

### Exported Methods

```typescript
// No exported methods; all state is internal
// Communication via onMatrixChange callback
```

---

## Data Flow

### Initial Mount

```
1. RaciGeneratorPage mounts
2. useRaciState initializes with default chart
3. useAutoSave loads persisted chart from storage
4. Chart state updated with loaded data
5. RaciMatrixEditor renders with populated chart
```

### User Interaction: Click Cell

```
1. User clicks cell button
2. onClick handler fires
3. cycleCellForward(roleId, taskId) called
4. getNextRaciValue() calculates new value
5. updateCell() creates new matrix object
6. onMatrixChange(newMatrix) called
7. updateMatrix hook in RaciGeneratorPage fires
8. Reducer action dispatched: { type: "updateMatrix", payload: { matrix } }
9. Chart state updated with new matrix
10. useAutoSave triggers (debounced 5s)
11. useValidation runs validateChart()
12. RaciMatrixEditor re-renders with new colors
13. Validation badges update
```

### User Interaction: Press Arrow Key

```
1. User presses arrow key while cell is focused
2. handleCellKeyDown(e, roleIndex, taskIndex, roleId, taskId) called
3. Calculate new role/task indices
4. Check boundaries (prevent wrap)
5. Get new role/task ID from chart
6. setFocusedCell({ roleId: newId, taskId: newId })
7. setTimeout(() => { cellRef.focus() }, 0)
   - Ensures focus happens after render cycle
8. Focus ring appears on new cell
9. ARIA label announces new cell to screen readers
```

### User Interaction: Press Space Key

```
1. User presses Space while cell is focused
2. handleCellKeyDown(e, ...) checks e.code === "Space"
3. e.preventDefault() (prevent page scroll)
4. cycleCellForward(roleId, taskId) called
   - Same as click flow (steps 4-13 above)
```

---

## Props Propagation

### From RaciGeneratorPage to RaciMatrixEditor

```typescript
// Before Iteration 3
<RaciMatrixEditor
  chart={chart}
  onChange={(newChart) => setChart(newChart)}
/>

// After Iteration 3 (BETTER)
const { state: chart, updateMatrix, ... } = useRaciState();

<RaciMatrixEditor
  chart={chart}
  onMatrixChange={updateMatrix}
/>
```

### Props Comparison

| Prop               | Before                       | After              | Benefit                |
| ------------------ | ---------------------------- | ------------------ | ---------------------- |
| **chart**          | RaciChart                    | RaciChart          | Same (no change)       |
| **onChange**       | `(chart: RaciChart) => void` | ❌ Removed         | -                      |
| **onMatrixChange** | ❌ N/A                       | `(matrix) => void` | Cleaner API, less data |

---

## Component Responsibility

### RaciMatrixEditor

**Single Responsibility**: Render and handle matrix interactions

**Handles**:

- ✅ Render matrix table with cells
- ✅ Handle keyboard input (arrow keys, space)
- ✅ Handle mouse click input
- ✅ Manage focused cell state
- ✅ Manage cell references
- ✅ Call parent onMatrixChange when matrix updates
- ✅ Display validation status
- ✅ Display keyboard help

**Does NOT Handle**:

- ❌ Chart state management (parent does)
- ❌ Validation logic (parent does via useValidation)
- ❌ Persistence/auto-save (parent does via useAutoSave)
- ❌ Role/task CRUD (separate editors handle)
- ❌ Export/import (separate components handle)

### RaciGeneratorPage

**Single Responsibility**: Orchestrate all components

**Handles**:

- ✅ Initialize state via useRaciState
- ✅ Manage chart state
- ✅ Load/save state (useAutoSave)
- ✅ Validate state (useValidation)
- ✅ Coordinate all sub-components
- ✅ Display overall page layout

---

## Validation Integration

### Flow

```
RaciMatrixEditor.onMatrixChange()
    ↓
RaciGeneratorPage.updateMatrix()
    ↓
useRaciState hook dispatches action
    ↓
raciReducer returns new state
    ↓
useValidation hook runs validateChart()
    ↓
validateChart() checks:
  - Title valid
  - Roles unique/not empty
  - Tasks unique/not empty
  - Matrix: Each task has at least one A
    ↓
Returns ValidationResult
    ↓
RaciGeneratorPage receives validation result
    ↓
RaciMatrixEditor receives via validation prop (if passed)
OR
useValidation(chart) runs independently in RaciMatrixEditor
    ↓
Component displays validation badges
```

### Validation in Component

```typescript
// Check if task has Accountable
const hasAccountable = (taskId: string): boolean => {
  return chart.roles.some((role) => chart.matrix[role.id]?.[taskId] === "A");
};

// Get validation status for task
const getTaskValidationStatus = (taskId: string): boolean => {
  return hasAccountable(taskId);
};

// Render validation badge
{!isValid && (
  <div className="text-xs text-error-600 font-semibold">
    ⚠️ Missing A
  </div>
)}
```

---

## Keyboard Navigation Implementation

### Cell Reference Management

```typescript
const cellRefs = useRef<Map<string, CellRef>>(new Map());

// Store reference when cell renders
ref={(el) => {
  if (el) {
    cellRefs.current.set(cellKey, {
      roleId,
      taskId,
      element: el,
    });
  }
}}

// Look up reference later for focus
const cellKey = `${nextRoleId}-${taskId}`;
setTimeout(() => {
  cellRefs.current.get(cellKey)?.element?.focus();
}, 0);
```

### Focus Management

```typescript
// When focused cell changes
const [focusedCell, setFocusedCell] = useState<{ roleId, taskId } | null>(null);

// On navigation
setFocusedCell({ roleId: newId, taskId: newId });
setTimeout(() => {
  // Focus after render completes
  cellRefs.current.get(cellKey)?.element?.focus();
}, 0);

// When cell is focused
onFocus={() => setFocusedCell({ roleId, taskId })}
onBlur={() => setFocusedCell(null)}
```

---

## Color Styling

### RACI to Tailwind Mapping

```typescript
const getCellColor = (value: RaciValue, isFocused: boolean) => {
  const colorMap = {
    R: {
      background: "bg-success-50 dark:bg-success-950",
      border: "border-success-300 dark:border-success-700",
      text: "text-success-700 dark:text-success-300",
    },
    A: {
      background: "bg-error-50 dark:bg-error-950",
      border: "border-error-300 dark:border-error-700",
      text: "text-error-700 dark:text-error-300",
    },
    C: {
      background: "bg-info-50 dark:bg-info-950",
      border: "border-info-300 dark:border-info-700",
      text: "text-info-700 dark:text-info-300",
    },
    I: {
      background: "bg-warning-50 dark:bg-warning-950",
      border: "border-warning-300 dark:border-warning-700",
      text: "text-warning-700 dark:text-warning-300",
    },
    null: {
      background: "bg-white dark:bg-slate-900",
      border: "border-slate-200 dark:border-slate-700",
      text: "text-slate-600 dark:text-slate-400",
    },
  };

  return colorMap[value] || colorMap[null];
};
```

### Applied to Button

```tsx
<button
  className={`... ${colors.background} ${colors.border} ${colors.text} ...`}
  aria-label={`RACI cell for ${role.name} and ${task.name}...`}
>
  {value || "-"}
</button>
```

---

## Responsive Table Layout

### Table Structure

```tsx
<table className="w-full border-collapse">
  <thead>
    <tr className="bg-muted border-b border-border">
      <th className="px-4 py-3 min-w-[150px] border-r border-border">
        Role / Task
      </th>
      {/* Task headers */}
      {chart.tasks.map((task) => (
        <th
          key={task.id}
          className="px-3 py-2 min-w-[90px] border-r border-border"
        >
          {task.name}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {/* Row for each role */}
    {chart.roles.map((role) => (
      <tr key={role.id} className="border-b border-border">
        {/* Sticky role header */}
        <td className="px-4 py-3 sticky left-0 z-10 bg-muted/50 border-r border-border">
          {role.name}
        </td>
        {/* Cells for each task */}
        {chart.tasks.map((task) => (
          <td
            key={`${role.id}-${task.id}`}
            className="px-1 py-1 border-r border-border"
          >
            <button className="w-full h-12 ...">{value || "-"}</button>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

### Responsive Features

- ✅ **min-w-** classes: Prevent column collapse
- ✅ **overflow-x-auto**: Enable horizontal scroll
- ✅ **sticky left-0**: Sticky role column
- ✅ **z-10**: Sticky column above scroll
- ✅ **w-full**: Full width table
- ✅ **border-collapse**: Merge borders

---

## Performance Optimizations

### useCallback

```typescript
// Prevent function recreation on every render
const updateCell = useCallback(
  (roleId, taskId, value) => {
    // ...
  },
  [chart.matrix, onMatrixChange]
);

// Dependency array includes only required dependencies
```

### useRef

```typescript
// Don't cause re-renders when setting/reading
const cellRefs = useRef<Map<string, CellRef>>(new Map());

// Accessing cellRefs.current doesn't trigger re-render
cellRefs.current.get(cellKey)?.element?.focus();
```

### Conditional Rendering

```typescript
// Don't render matrix if no data
if (chart.roles.length === 0 || chart.tasks.length === 0) {
  return <div>Add roles and tasks...</div>;
}

// Only render validation section if needed
{!hasAccountable(task.id) && (
  <div className="text-error-600">⚠️ Missing A</div>
)}
```

---

## Accessibility Features

### ARIA Labels

```typescript
aria-label={`RACI cell for ${role.name} and ${task.name}.
             Current: ${value || "unassigned"}.
             Press Space to cycle (R→A→C→I→empty)`}
```

### Semantic HTML

```tsx
// Use button elements (not divs with click handlers)
<button
  onKeyDown={handleCellKeyDown}
  onClick={() => cycleCellForward(roleId, taskId)}
  aria-label="..."
>
  {value || "-"}
</button>
```

### Focus Indicators

```tsx
className={`... focus:outline-none ${
  isFocused ? "ring-2 ring-primary-500 ring-offset-2" : ""
}`}
```

### Color Independence

```tsx
// Display text label, not just color
<button>{value || "-"} // Shows "R", "A", "C", "I", or "-"</button>;

// Validation uses icon + color, not color alone
{
  !isValid && (
    <div className="text-error-600">⚠️ Missing A {/* Icon + text */}</div>
  );
}
```

---

## Summary

The **RaciMatrixEditor** component:

- ✅ Focuses on a single responsibility: render and interact with matrix
- ✅ Uses efficient hooks (useCallback, useRef, useState)
- ✅ Manages keyboard and mouse input
- ✅ Maintains focus state for navigation
- ✅ Delegates state management to parent
- ✅ Calls parent callback on changes
- ✅ Includes real-time validation feedback
- ✅ Supports full keyboard-only navigation
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Responsive (mobile to desktop)

This clean architecture makes the component reusable, testable, and maintainable.
