# Iteration 3 – Quick Reference

**Version**: 3.0.0  
**Date**: 2025-11-10

---

## 🎯 Quick Lookup Table

### Keyboard Shortcuts

| Shortcut          | Action                                  | Code                  |
| ----------------- | --------------------------------------- | --------------------- |
| **Space**         | Cycle cell value forward                | `cycleCellForward()`  |
| **Shift+Space**   | Cycle cell value backward               | `cycleCellBackward()` |
| **↑ Arrow Up**    | Move to previous role                   | `handleCellKeyDown()` |
| **↓ Arrow Down**  | Move to next role                       | `handleCellKeyDown()` |
| **← Arrow Left**  | Move to previous task                   | `handleCellKeyDown()` |
| **→ Arrow Right** | Move to next task                       | `handleCellKeyDown()` |
| **Tab**           | Move to next cell (browser default)     | Native                |
| **Shift+Tab**     | Move to previous cell (browser default) | Native                |
| **Click**         | Cycle cell value forward                | `onClick` handler     |

---

## 🎨 RACI Colors

### Tailwind Color Mapping

| Value | Color Name      | Hex     | CSS Class       | Meaning     |
| ----- | --------------- | ------- | --------------- | ----------- |
| **R** | Success (Green) | #22c55e | `bg-success-50` | Responsible |
| **A** | Error (Red)     | #dc2626 | `bg-error-50`   | Accountable |
| **C** | Info (Blue)     | #3b82f6 | `bg-info-50`    | Consulted   |
| **I** | Warning (Amber) | #f59e0b | `bg-warning-50` | Informed    |
| **-** | Slate (Gray)    | #f9fafb | `bg-white`      | Unassigned  |

### Dark Mode Classes

```
bg-success-950 (R dark)
bg-error-950 (A dark)
bg-info-950 (C dark)
bg-warning-950 (I dark)
bg-slate-900 (empty dark)
```

---

## 📊 Validation Rules

### Matrix Validation

| Rule                        | Condition                                     | Error Code            | Severity |
| --------------------------- | --------------------------------------------- | --------------------- | -------- |
| **At least one A per task** | Every task must have at least one Accountable | `TASK_NO_ACCOUNTABLE` | Error    |
| **Exclusive cell values**   | Max one RACI value per cell                   | Built-in UI           | Error    |
| **Roles not empty**         | Must have role names                          | `ROLE_EMPTY`          | Error    |
| **Tasks not empty**         | Must have task names                          | `TASK_EMPTY`          | Error    |

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
```

---

## 🧩 Component API

### RaciMatrixEditor Props

```typescript
interface RaciMatrixEditorProps {
  chart: RaciChart;
  onMatrixChange: (matrix: Record<string, Record<string, RaciValue>>) => void;
}
```

### Props Description

| Prop               | Type      | Required | Description                                   |
| ------------------ | --------- | -------- | --------------------------------------------- |
| **chart**          | RaciChart | Yes      | Complete chart data with roles, tasks, matrix |
| **onMatrixChange** | Function  | Yes      | Callback when matrix value changes            |

### Internal State

```typescript
const [focusedCell, setFocusedCell] = useState<{
  roleId: string;
  taskId: string;
} | null>(null);

const cellRefs = useRef<Map<string, CellRef>>(new Map());
```

---

## 🔄 State Flow

### When User Clicks Cell

```
Click cell
  ↓
onClick handler fires
  ↓
cycleCellForward(roleId, taskId)
  ↓
updateCell(roleId, taskId, nextValue)
  ↓
onMatrixChange(newMatrix)
  ↓
updateMatrix(newMatrix) [from useRaciState]
  ↓
dispatch({ type: "updateMatrix", payload: { matrix } })
  ↓
raciReducer handles action
  ↓
state.matrix updated
  ↓
useValidation runs
  ↓
Component re-renders with new colors/badges
```

### When User Presses Space

```
Space key pressed
  ↓
onKeyDown handler fires
  ↓
e.code === "Space" check passes
  ↓
e.preventDefault()
  ↓
cycleCellForward(roleId, taskId)
  ↓
(same as click flow above)
```

### When User Presses Arrow Key

```
Arrow key pressed
  ↓
onKeyDown handler fires
  ↓
Calculate new role/task index
  ↓
Get new role/task ID from chart
  ↓
setFocusedCell({ roleId: newId, taskId: newId })
  ↓
setTimeout(() => { cellRef.focus() }, 0)
  ↓
Focus ring appears on new cell
```

---

## 📐 Component Structure

### Render Tree

```
RaciMatrixEditor
├── Empty state (if no roles/tasks)
│   └── Caption: "Add roles and tasks..."
│
├── Matrix container
│   └── <table>
│       ├── <thead>
│       │   └── <tr> (task headers)
│       │       ├── <th> "Role/Task"
│       │       └── <th> task.name (with validation badge)
│       │
│       └── <tbody>
│           └── <tr> for each role
│               ├── <td> (sticky role name)
│               └── <td> for each task
│                   └── <button> (RACI cell)
│
├── Keyboard help panel
│   ├── Label: "⌨️ Keyboard Navigation"
│   └── Grid of key combinations
│
└── Validation status panel
    ├── Label: "Validation Status"
    └── <div> for each task
        ├── Status icon (✓ or !)
        └── Status text
```

---

## 🎯 Key Functions

### Cell Cycling

```typescript
// Forward cycle
const getNextRaciValue = (current: RaciValue | null): RaciValue | null => {
  const raciCycle = ["R", "A", "C", "I", null];
  const currentIndex = raciCycle.indexOf(current);
  const nextIndex = (currentIndex + 1) % raciCycle.length;
  return raciCycle[nextIndex];
};

// Backward cycle
const getPreviousRaciValue = (current: RaciValue | null): RaciValue | null => {
  const raciCycle = ["R", "A", "C", "I", null];
  const currentIndex = raciCycle.indexOf(current);
  const prevIndex =
    currentIndex === 0 ? raciCycle.length - 1 : currentIndex - 1;
  return raciCycle[prevIndex];
};
```

### Update Cell

```typescript
const updateCell = useCallback(
  (roleId: string, taskId: string, value: RaciValue) => {
    const newMatrix = { ...chart.matrix };
    if (!newMatrix[roleId]) {
      newMatrix[roleId] = {};
    }
    newMatrix[roleId][taskId] = value;
    onMatrixChange(newMatrix);
  },
  [chart.matrix, onMatrixChange]
);
```

### Get Cell Colors

```typescript
const getCellColor = (value: RaciValue, isFocused: boolean) => {
  switch (value) {
    case "R": return { background: "bg-success-50 dark:bg-success-950", ... };
    case "A": return { background: "bg-error-50 dark:bg-error-950", ... };
    case "C": return { background: "bg-info-50 dark:bg-info-950", ... };
    case "I": return { background: "bg-warning-50 dark:bg-warning-950", ... };
    default: return { background: "bg-white dark:bg-slate-900", ... };
  }
};
```

---

## 🔧 Useful Code Snippets

### Check if Task Has Accountable

```typescript
const hasAccountable = (taskId: string): boolean => {
  return chart.roles.some((role) => chart.matrix[role.id]?.[taskId] === "A");
};
```

### Get Cell Value

```typescript
const cellValue = chart.matrix[roleId]?.[taskId] || null;
```

### Create New Matrix Entry

```typescript
const newMatrix = { ...chart.matrix };
if (!newMatrix[roleId]) {
  newMatrix[roleId] = {};
}
newMatrix[roleId][taskId] = "A";
```

### Clear Cell Value

```typescript
const newMatrix = { ...chart.matrix };
if (newMatrix[roleId]) {
  newMatrix[roleId][taskId] = null;
}
```

---

## 📦 Imports

### In RaciMatrixEditor.tsx

```typescript
import { useCallback, useRef, useState } from "react";
import { RaciChart, RaciValue } from "@/types/raci";
import { Label, Caption } from "@/components/Typography";
```

### In RaciGeneratorPage.tsx

```typescript
import { useRaciState } from "@/lib/raci/hooks";
import RaciMatrixEditor from "./RaciMatrixEditor";

const { state: chart, updateMatrix, ... } = useRaciState();
```

---

## 🧪 Test Cases

### Happy Path

```
1. User navigates to /tools/raci-generator
2. User adds 3 roles (Role A, Role B, Role C)
3. User adds 3 tasks (Task 1, Task 2, Task 3)
4. User clicks Task 1 cell for Role A → cycles to "R"
5. User presses Space 2 times → cycles to "A"
6. Validation badge appears on Task 1 (✓ Has Accountable)
7. User presses Arrow Right → moves to Task 2 cell
8. User presses Shift+Space → cycles backward to "R"
9. User reloads page → matrix data persists
```

### Edge Cases

```
1. Matrix with no roles/tasks → shows placeholder
2. Matrix with 20×50 cells → handles smoothly
3. User presses Arrow Up on first role → stays at first role
4. User clicks same cell 5 times → cycles back to original value
5. User adds new role → focused cell may be invalidated
```

---

## 🐛 Debugging

### Check Focused Cell

```typescript
console.log("Focused cell:", focusedCell);
// { roleId: "uuid-123", taskId: "uuid-456" } or null
```

### Check Matrix State

```typescript
console.log("Matrix:", chart.matrix);
// { "role-id-1": { "task-id-1": "A", "task-id-2": "R" }, ... }
```

### Check Cell Reference

```typescript
console.log("Cell refs:", cellRefs.current.size);
// 150 (for 20 roles × 50 tasks)
```

### Check Validation

```typescript
const validation = useValidation(chart);
console.log("Valid?", validation.isValid);
console.log("Errors:", validation.errors);
```

---

## 📚 Related Files

| File                      | Purpose                  | Location                       |
| ------------------------- | ------------------------ | ------------------------------ |
| **RaciMatrixEditor.tsx**  | Component implementation | `src/components/raci/`         |
| **hooks.ts**              | State management         | `src/lib/raci/`                |
| **validation.ts**         | Validation logic         | `src/lib/raci/`                |
| **RaciGeneratorPage.tsx** | Main page                | `src/components/raci/`         |
| **raci.ts**               | Type definitions         | `src/types/`                   |
| **START_HERE.md**         | Quick start              | `docs/raci-chart/iteration-3/` |
| **ARCHITECTURE.md**       | Design details           | `docs/raci-chart/iteration-3/` |

---

## 🚀 Performance Tips

### For Large Matrices (> 100×100)

- Consider virtual scrolling
- Use Web Workers for validation
- Memoize color calculations
- Implement cell pooling

### For Smooth Interaction

- All callbacks use `useCallback`
- Cell refs use `useRef` (no re-renders)
- Focus uses `setTimeout` (ensures after render)
- No inline function definitions

---

## ✅ Checklist

Use this to verify implementation:

- [ ] Matrix renders correctly
- [ ] Cells change color on click
- [ ] Space key cycles values
- [ ] Arrow keys navigate cells
- [ ] Focus ring visible
- [ ] Validation badges appear
- [ ] Keyboard shortcuts display
- [ ] No console errors
- [ ] Dark mode works
- [ ] Mobile responsive

---

## 📞 Support

### Questions?

1. Check **START_HERE.md** for overview
2. Check **ARCHITECTURE.md** for design decisions
3. Check component code comments
4. Review test cases in this file

### Found a Bug?

1. Check browser console for errors
2. Verify chart structure is valid
3. Test with simple 2×2 matrix first
4. Check React DevTools for state

---

## 🎓 Learning Resources

### RACI Framework

- **R**esponsible: Does the work
- **A**ccountable: Final authority; must approve
- **C**onsulted: Provides input; gives advice
- **I**nformed: Kept in the loop; FYI only

### Keyboard Navigation Patterns

- **Arrow keys**: Navigate grid cells
- **Space**: Toggle or cycle values
- **Tab**: Move to next interactive element
- **Escape**: Close modals or cancel

### Tailwind Utilities

- **bg-**: Background color
- **border-**: Border color
- **text-**: Text color
- **dark:**: Dark mode variant
- **hover:**: Hover state
- **focus:**: Focus state

---

## 🎉 Success Criteria

✅ **You've mastered Iteration 3 when:**

1. You understand the RACI cycle (R→A→C→I→null)
2. You can navigate the matrix with keyboard only
3. You understand the validation rule (at least one A per task)
4. You can spot the color coding instantly
5. You can explain the focus management approach
6. You know how to add new RACI values to cells
7. You understand the accessibility features

**Ready to move to Iteration 4!** 🚀
