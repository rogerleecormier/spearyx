# Iteration 3 Architecture – RACI Matrix Editor

**Version**: 3.0.0  
**Date**: 2025-11-10  
**Focus**: Interactive matrix, keyboard navigation, validation

---

## Overview

Iteration 3 transforms the static matrix display into a **fully interactive, keyboard-accessible editor** with real-time validation and color-coded RACI assignments.

### Key Design Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|-------------------------|
| **Button-based cells** | More accessible than select dropdowns; better touch support | Select elements, custom checkbox groups |
| **Space key for cycling** | Standard for toggles/cycling; intuitive; non-invasive | Enter key, context menu, dedicated buttons |
| **Arrow keys for navigation** | Standard UI pattern; familiar to users; works with Tab | Only Tab navigation; mouse only |
| **Real-time validation** | Immediate feedback; prevents invalid exports | Validation only on export; manual check button |
| **Sticky role header** | Better UX for large matrices; standard table pattern | No sticky header; horizontal scroll only |
| **useRef for cell refs** | Efficient focus management; minimal re-renders | Context API, Redux for cell state |

---

## Component Architecture

### RaciMatrixEditor Component

```
RaciMatrixEditor
├── State Management
│   ├── focusedCell: {roleId, taskId} | null
│   ├── cellRefs: Map<string, CellRef>
│   └── raciCycle: ["R", "A", "C", "I", null]
│
├── Hooks
│   ├── useCallback (all handlers)
│   ├── useRef (cell references)
│   ├── useCallback (keyboard handlers)
│   └── useState (focus state)
│
├── Rendering
│   ├── Matrix Table (thead + tbody)
│   │   ├── Task headers with validation badges
│   │   ├── Role rows with sticky left column
│   │   └── Interactive cells (buttons)
│   │
│   ├── Keyboard Help Panel
│   │ └── Key combinations guide
│   │
│   └── Validation Status Panel
│       └── Task checklist (✓ or !)
│
└── Event Handlers
    ├── handleCellKeyDown (Space, Arrow, Tab)
    ├── cycleCellForward (Space key)
    ├── cycleCellBackward (Shift+Space)
    └── updateCell (state dispatch)
```

### Props Interface

```typescript
interface RaciMatrixEditorProps {
  chart: RaciChart;
  onMatrixChange: (matrix: Record<string, Record<string, RaciValue>>) => void;
}
```

### Internal Types

```typescript
interface CellRef {
  roleId: string;
  taskId: string;
  element: HTMLButtonElement | null;
}

interface CellColor {
  background: string;
  border: string;
  text: string;
  label: string;
}
```

---

## Keyboard Navigation System

### Navigation Matrix

```
        ← Arrow Left     Arrow Right →
           ↑ Arrow Up    Arrow Down ↓
           │             │
    ┌──────┴─────────────┴──────┐
    │                           │
    │    ┌──────────────────┐  │
    │    │  Cell (focused)  │◄─┼─ Focus Ring
    │    └──────────────────┘  │
    │                           │
    └───────────────────────────┘
           Space: Cycle
      Shift+Space: Reverse
           Tab: Browser Default
```

### Key Bindings

| Key | Behavior | Code Path |
|-----|----------|-----------|
| `Space` | Cycle forward (R→A→C→I→null) | `cycleCellForward()` → `updateCell()` |
| `Shift+Space` | Cycle backward (null→I→C→A→R) | `cycleCellBackward()` → `updateCell()` |
| `Arrow Up` | Move to previous role | Set focused cell, scroll into view |
| `Arrow Down` | Move to next role | Set focused cell, scroll into view |
| `Arrow Left` | Move to previous task | Set focused cell, scroll into view |
| `Arrow Right` | Move to next task | Set focused cell, scroll into view |
| `Tab` | Move to next cell (browser default) | Native browser behavior |
| `Shift+Tab` | Move to previous cell | Native browser behavior |
| `Click` | Cycle forward | `cycleCellForward()` on click |

### Focus Management

```typescript
// When navigating with arrow keys
1. Calculate new role/task index
2. Check bounds (prevent wrap-around)
3. Get new role/task ID from chart
4. Update focusedCell state
5. setTimeout(() => { cellRef.focus() }, 0)
   // Ensures focus after render
```

---

## Color-Coding System

### Mapping: RACI → Tailwind Colors

```typescript
const raciColorMap = {
  "R": {
    background: "bg-success-50 dark:bg-success-950",
    border: "border-success-300 dark:border-success-700",
    text: "text-success-700 dark:text-success-300",
  },
  "A": {
    background: "bg-error-50 dark:bg-error-950",
    border: "border-error-300 dark:border-error-700",
    text: "text-error-700 dark:text-error-300",
  },
  "C": {
    background: "bg-info-50 dark:bg-info-950",
    border: "border-info-300 dark:border-info-700",
    text: "text-info-700 dark:text-info-300",
  },
  "I": {
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
```

### Semantic Meaning

| Value | Color | Meaning | Example |
|-------|-------|---------|---------|
| **R** | Green | **Responsible** - Does the work | Developer implements feature |
| **A** | Red | **Accountable** - Final decision maker | Project manager approves |
| **C** | Blue | **Consulted** - Provides input | Designer gives feedback |
| **I** | Amber | **Informed** - Kept in loop | Stakeholder gets updates |
| **-** | Gray | Unassigned | Not involved in task |

---

## Validation Architecture

### Validation Flow

```
Matrix Update
    ↓
onMatrixChange(newMatrix)
    ↓
updateMatrix(newMatrix) [Hook callback]
    ↓
Dispatch updateMatrix action
    ↓
raciReducer returns new state
    ↓
useValidation hook runs validateChart()
    ↓
validateChart(chart):
  - Check title
  - Check roles (no duplicates, empty)
  - Check tasks (no duplicates, empty, descriptions)
  - Check matrix: At least one A per task
    ↓
Return ValidationResult
    ↓
Component renders validation status
```

### Validation Rules

```typescript
// Rule 1: At least one Accountable per task
for (const task of chart.tasks) {
  const hasAccountable = chart.roles.some(
    (role) => chart.matrix[role.id]?.[task.id] === "A"
  );
  if (!hasAccountable) {
    errors.push({
      field: "matrix",
      code: "TASK_NO_ACCOUNTABLE",
      message: `Task "${task.name}" must have at least one Accountable (A)`,
    });
  }
}

// Rule 2: Exclusive assignments (built-in by UI)
// Only one RACI value per cell; clicking cycles through
```

### Validation UI

```
Task Header:
  │ Task Name
  │ ✓ Valid (green dot)  or  ⚠️ Missing A (red exclamation)

Below Matrix:
  │ ✓ Task 1: Has Accountable
  │ ! Task 2: Missing Accountable (A)
  │ ✓ Task 3: Has Accountable
```

---

## Performance Optimization

### Matrix Size Handling

| Size | Cells | Status | Notes |
|------|-------|--------|-------|
| 5×10 | 50 | ✅ Optimal | Instant response |
| 10×20 | 200 | ✅ Good | Smooth interaction |
| 20×50 | 1,000 | ✅ Acceptable | Minor scroll lag on initial render |
| 50×100 | 5,000 | ⚠️ Slow | Not recommended; consider pagination |

### Optimization Techniques

1. **useCallback for all handlers**: Prevents unnecessary re-renders
2. **useRef for cell references**: No state updates for each ref assignment
3. **Map for cellRefs**: O(1) lookup for focus management
4. **Sticky positioning**: Hardware-accelerated; no re-layout on scroll
5. **CSS transforms**: Smooth animations without blocking

### Rendering Strategy

```typescript
// Each cell is a simple button with aria-label
// Matrix table uses native HTML (fast rendering)
// Focus ring via CSS (no JS animation)

<button
  // Minimal props to avoid re-render triggers
  onKeyDown={handleCellKeyDown}
  onClick={() => cycleCellForward(roleId, taskId)}
  className={`... ${getCellColor(value).background}`}
  aria-label={`RACI cell for ${role.name} and ${task.name}...`}
>
  {value || "-"}
</button>
```

---

## Accessibility (WCAG 2.1 AA)

### ARIA Labels

```tsx
aria-label={`RACI cell for ${role.name} and ${task.name}. 
            Current: ${value || "unassigned"}. 
            Press Space to cycle (R→A→C→I→empty)`}
```

### Keyboard Support

- ✅ Full keyboard navigation (arrow keys, Tab)
- ✅ No keyboard traps
- ✅ Focus indicators visible
- ✅ Semantic HTML (buttons, not divs)

### Color Independence

- ✅ Text labels ("R", "A", "C", "I", "-")
- ✅ Color not sole indicator of meaning
- ✅ Validation badges use icons (✓, !) plus color

### High-Contrast Mode

- ✅ Tailwind dark: variants for dark mode
- ✅ Border and text colors adjust in high-contrast
- ✅ Sufficient color contrast ratios (WCAG AA)

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ RaciMatrixEditor                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ State:                                              │
│  - focusedCell: {roleId, taskId} | null            │
│  - cellRefs: Map<string, CellRef>                   │
│                                                     │
│ Props:                                              │
│  - chart: RaciChart                                 │
│  - onMatrixChange: (matrix) => void                 │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─ User clicks cell
                 │  ↓
                 ├─ cycleCellForward()
                 │  ↓
                 ├─ updateCell(roleId, taskId, newValue)
                 │  ↓
                 ├─ onMatrixChange(newMatrix)
                 │  ↓
                 ├─ updateMatrix() [useRaciState hook]
                 │  ↓
                 ├─ raciReducer (dispatch action)
                 │  ↓
                 ├─ Chart state updated
                 │  ↓
                 ├─ useValidation hook runs
                 │  ↓
                 └─ Validation status renders

┌─────────────────────────────────────────────────────┐
│ RaciGeneratorPage                                   │
├─────────────────────────────────────────────────────┤
│ - Receives updated chart with new matrix            │
│ - useAutoSave triggers (5s debounce)                │
│ - localStorage updated                              │
└─────────────────────────────────────────────────────┘
```

---

## Edge Cases & Error Handling

### Case: No Roles or Tasks

```tsx
if (chart.roles.length === 0 || chart.tasks.length === 0) {
  return (
    <div className="...">
      <Caption>Add roles and tasks to create the matrix</Caption>
    </div>
  );
}
```

### Case: Navigation at Boundaries

```typescript
// Arrow Up at first role: Disable (no wrap)
if (roleIndex === 0) {
  e.preventDefault();
  return; // Stay at current cell
}

// Arrow Down at last role: Disable (no wrap)
if (roleIndex === totalRoles - 1) {
  e.preventDefault();
  return; // Stay at current cell
}
```

### Case: Focus Lost After Add/Delete

```typescript
// When roles/tasks change, focusedCell may reference deleted IDs
// Solution: Clear focusedCell state when chart structure changes
useEffect(() => {
  // Reset focus if focused role/task no longer exists
  if (focusedCell) {
    const roleExists = chart.roles.some(r => r.id === focusedCell.roleId);
    const taskExists = chart.tasks.some(t => t.id === focusedCell.taskId);
    
    if (!roleExists || !taskExists) {
      setFocusedCell(null);
    }
  }
}, [chart.roles, chart.tasks, focusedCell]);
```

---

## Integration with RaciGeneratorPage

### Before Iteration 3

```tsx
// Old: onChange handler received entire chart
<RaciMatrixEditor
  chart={chart}
  onChange={(newChart) => setChart(newChart)}
/>
```

### After Iteration 3

```tsx
// New: onMatrixChange handler receives only matrix
const { state: chart, updateMatrix, ... } = useRaciState();

<RaciMatrixEditor
  chart={chart}
  onMatrixChange={(newMatrix) => updateMatrix(newMatrix)}
/>
```

### Benefits

- ✅ Cleaner API
- ✅ Better separation of concerns
- ✅ Easier to compose components
- ✅ Matrix updates don't trigger full chart re-validation

---

## Testing Strategy

### Unit Tests

```typescript
// cycleCellForward
expect(cycleCellForward(roleId, taskId))
  .toChangeMatrix({ [roleId]: { [taskId]: nextValue } });

// getCellColor
expect(getCellColor("R")).toBe({
  background: "bg-success-50 dark:bg-success-950",
  ...
});

// Validation
expect(validateChart(chartWithNoAccountable))
  .toHaveError("TASK_NO_ACCOUNTABLE");
```

### Integration Tests

```typescript
// Keyboard navigation
userEvent.keyboard("{ArrowDown}");
expect(focusedCell.roleId).toBe(nextRole.id);

// Cell cycling
userEvent.keyboard(" "); // Space
expect(cellValue).toBe("A");
userEvent.keyboard(" "); // Space again
expect(cellValue).toBe("C");
```

### E2E Tests

```typescript
// User workflow
1. Navigate to /tools/raci-generator
2. Add 3 roles, 3 tasks
3. Use arrow keys to navigate to first cell
4. Press Space 4 times to cycle through all values
5. Verify validation status updates
6. Verify matrix persists on reload
```

---

## Notes for Future Optimization

### Iteration 5+: Performance

- Virtual scrolling for matrices > 100×100
- Web Workers for validation (off-main-thread)
- Memoization of cell color calculations
- Cell pooling for very large matrices

### Iteration 5+: Features

- Drag-to-fill (copy RACI value across multiple cells)
- Multi-select cells (Ctrl+click)
- Undo/redo for matrix changes
- Import matrix from CSV
- Pattern detection (suggest missing Accountables)

---

## Conclusion

Iteration 3 establishes the RACI matrix as a **first-class interactive editor** with keyboard support, real-time validation, and accessibility. The architecture is simple, performant, and extensible for future features.
