# Iteration 2: Editors & State Management – Technical Guide

**Version**: 2.0.0  
**Date**: 2025-11-10  
**Duration**: 1 week (estimated)  
**Lines of Code**: ~2,180 (new code)

---

## Overview

Iteration 2 transforms the Iteration 1 component shells into a **fully functional CRUD system** with robust state management, real-time validation, and persistent storage. This iteration establishes the foundation for all future features in the RACI Chart Generator.

### What Gets Built

After Iteration 2, the application will have:

✅ **Full CRUD Operations**

- Add/Edit/Delete roles with reordering
- Add/Edit/Delete tasks with multi-line descriptions
- Edit title and upload logo

✅ **State Management**

- Central state hook using React's `useReducer`
- Automatic persistence to localStorage
- IndexedDB fallback for large datasets
- Page reload state recovery

✅ **Real-Time Validation**

- Field-level validation with helpful error messages
- Chart-level validation with error aggregation
- Validation prevents invalid operations
- Error modal for critical issues

✅ **Keyboard Navigation**

- Tab/Shift+Tab through all controls
- Esc to close dialogs
- Enter to submit forms
- Focus management and visual indicators

✅ **User Experience**

- Auto-save every 5 seconds (debounced)
- Clear error feedback
- Confirmation dialogs for destructive actions
- Responsive design (mobile to desktop)

---

## Architecture Decision Records

### State Management Approach

**Decision**: Use React's `useReducer` hook with custom hooks for state, validation, and persistence.

**Rationale**:

- ✅ No external dependency (useReducer built-in)
- ✅ Scales well as complexity grows
- ✅ Easy to debug with Redux DevTools
- ✅ Can migrate to Redux/Zustand later if needed
- ✅ Familiar pattern for most React developers

**Alternative Considered**:

- Context API alone (not performant for frequent updates)
- Redux (overkill for current scope)
- Zustand (lightweight but external dependency)

**Decision**: Use localStorage with IndexedDB fallback for persistence.

**Rationale**:

- ✅ No backend required (offline-first)
- ✅ localStorage is 5-10MB (sufficient for most charts)
- ✅ IndexedDB fallback handles larger datasets
- ✅ Auto-save without user intervention
- ✅ Version checking for schema evolution

**Alternative Considered**:

- Backend API (requires server, adds latency)
- Firestore (third-party dependency, privacy concerns)
- SQLite.js (WASM library, adds bundle size)

**Decision**: Validation in both reducer and hooks (belt and suspenders).

**Rationale**:

- ✅ Reducer validates before state changes (prevents invalid states)
- ✅ useValidation hook provides real-time feedback (UX)
- ✅ Two layers catch errors from different entry points
- ✅ Clear separation of concerns

**Alternative Considered**:

- Validation only in reducer (no real-time feedback)
- Validation only in component (allows invalid states)

---

## Detailed Implementation Guide

### Phase 1: State Management Foundation

#### 1.1 Create Types (types/raci.ts)

Add these interfaces if not already present:

```typescript
// Core entities
export interface RaciRole {
  id: string; // UUID from crypto.randomUUID()
  name: string; // e.g., "Product Manager"
  order: number; // 0-based position for sorting
}

export interface RaciTask {
  id: string;
  name: string;
  description?: string; // Optional multi-line text
  order: number;
}

export type RaciValue = "R" | "A" | "C" | "I" | null;

// Chart state
export interface RaciChart {
  id: string;
  title: string; // Default: "Untitled Project"
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: Record<string, Record<string, RaciValue>>;
  theme: string; // Default: "default"
  logo?: string; // Base64 encoded image
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string;
  version: string; // Current: "2.0.0"
}

// Reducer actions
export type RaciAction =
  | { type: "addRole"; payload: { name: string } }
  | { type: "editRole"; payload: { id: string; name: string } }
  | { type: "deleteRole"; payload: { id: string } }
  | { type: "reorderRoles"; payload: { roles: RaciRole[] } }
  | { type: "addTask"; payload: { name: string; description?: string } }
  | {
      type: "editTask";
      payload: { id: string; name: string; description?: string };
    }
  | { type: "deleteTask"; payload: { id: string } }
  | { type: "reorderTasks"; payload: { tasks: RaciTask[] } }
  | { type: "updateTitle"; payload: { title: string } }
  | { type: "updateLogo"; payload: { logo?: string } }
  | { type: "reset" }
  | { type: "setState"; payload: { chart: RaciChart } };

// Validation
export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  getFieldError: (field: string) => ValidationError | undefined;
}
```

#### 1.2 Create State Reducer (lib/raci/state.ts)

```typescript
export function createInitialChart(partial?: Partial<RaciChart>): RaciChart {
  return {
    id: crypto.randomUUID(),
    title: "Untitled Project",
    description: "",
    roles: [],
    tasks: [],
    matrix: {},
    theme: "default",
    logo: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "2.0.0",
    ...partial,
  };
}

export function raciReducer(state: RaciChart, action: RaciAction): RaciChart {
  switch (action.type) {
    case "addRole": {
      const newRole: RaciRole = {
        id: crypto.randomUUID(),
        name: action.payload.name,
        order: state.roles.length,
      };
      return {
        ...state,
        roles: [...state.roles, newRole],
        updatedAt: new Date().toISOString(),
      };
    }

    case "editRole": {
      return {
        ...state,
        roles: state.roles.map((r) =>
          r.id === action.payload.id ? { ...r, name: action.payload.name } : r
        ),
        updatedAt: new Date().toISOString(),
      };
    }

    case "deleteRole": {
      return {
        ...state,
        roles: state.roles.filter((r) => r.id !== action.payload.id),
        updatedAt: new Date().toISOString(),
      };
    }

    case "reorderRoles": {
      return {
        ...state,
        roles: action.payload.roles,
        updatedAt: new Date().toISOString(),
      };
    }

    // Similar patterns for tasks...

    case "updateTitle": {
      return {
        ...state,
        title: action.payload.title,
        updatedAt: new Date().toISOString(),
      };
    }

    case "updateLogo": {
      return {
        ...state,
        logo: action.payload.logo,
        updatedAt: new Date().toISOString(),
      };
    }

    case "reset": {
      return createInitialChart();
    }

    case "setState": {
      return action.payload.chart;
    }

    default:
      return state;
  }
}
```

#### 1.3 Create useRaciState Hook

```typescript
export function useRaciState(initialChart?: RaciChart) {
  const [state, dispatch] = useReducer(
    raciReducer,
    initialChart || createInitialChart()
  );

  // Convenience methods
  const addRole = useCallback((name: string) => {
    dispatch({ type: "addRole", payload: { name } });
  }, []);

  const editRole = useCallback((id: string, name: string) => {
    dispatch({ type: "editRole", payload: { id, name } });
  }, []);

  const deleteRole = useCallback((id: string) => {
    dispatch({ type: "deleteRole", payload: { id } });
  }, []);

  // ... more convenience methods

  return {
    state,
    dispatch,
    addRole,
    editRole,
    deleteRole,
    // ... other methods
  };
}
```

#### 1.4 Create Persistence Helpers (lib/raci/persistence.ts)

```typescript
const STORAGE_KEY = "raciChart";
const CURRENT_VERSION = "2.0.0";

export function saveToLocalStorage(chart: RaciChart): void {
  try {
    const json = JSON.stringify(chart);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    // Quota exceeded - try IndexedDB
    if (error instanceof DOMException && error.code === 22) {
      saveToIndexedDB(chart);
    }
    // Silent failure for auto-save
  }
}

export function loadFromLocalStorage(): RaciChart | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    const chart = JSON.parse(json) as RaciChart;

    // Version check
    if (chart.version !== CURRENT_VERSION) {
      return null; // Discard if version mismatch
    }

    return chart;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// IndexedDB helpers (similar pattern)
export async function saveToIndexedDB(chart: RaciChart): Promise<void> {
  // Implementation...
}

export async function loadFromIndexedDB(): Promise<RaciChart | null> {
  // Implementation...
}
```

#### 1.5 Create useAutoSave Hook

```typescript
export function useAutoSave(
  chart: RaciChart,
  key: string = "raciChart"
): { isSaving: boolean; lastSaved: Date | null; error: Error | null } {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const debouncedChart = useDebounce(chart, 5000); // 5 second debounce

  useEffect(() => {
    setIsSaving(true);

    try {
      saveToLocalStorage(debouncedChart);
      setLastSaved(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsSaving(false);
    }
  }, [debouncedChart]);

  return { isSaving, lastSaved, error };
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Phase 2: Validation Layer

#### 2.1 Create Validation Functions (lib/raci/validation.ts)

```typescript
export function validateRoleName(
  name: string,
  existingRoles: RaciRole[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!name.trim()) {
    errors.push({
      field: "roleName",
      message: "Role name cannot be empty",
      severity: "error",
      code: "ROLE_EMPTY",
    });
  }

  if (name.length > 50) {
    errors.push({
      field: "roleName",
      message: "Role name too long (max 50 characters)",
      severity: "error",
      code: "ROLE_TOO_LONG",
    });
  }

  const duplicate = existingRoles.some(
    (r) => r.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicate) {
    errors.push({
      field: "roleName",
      message: "Role name already exists",
      severity: "error",
      code: "ROLE_DUPLICATE",
    });
  }

  return errors;
}

export function validateChart(chart: RaciChart): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate all roles
  chart.roles.forEach((role) => {
    errors.push(...validateRoleName(role.name, chart.roles));
  });

  // Validate all tasks
  chart.tasks.forEach((task) => {
    errors.push(...validateTaskName(task.name, chart.tasks));
    if (task.description) {
      errors.push(...validateTaskDescription(task.description));
    }
  });

  // Validate title
  errors.push(...validateTitle(chart.title));

  const isValid = errors.filter((e) => e.severity === "error").length === 0;

  return {
    isValid,
    errors: errors.filter((e) => e.severity === "error"),
    warnings: errors.filter((e) => e.severity === "warning"),
    getFieldError: (field: string) => errors.find((e) => e.field === field),
  };
}
```

#### 2.2 Create useValidation Hook

```typescript
export function useValidation(chart: RaciChart): ValidationResult {
  const [validation, setValidation] = useState<ValidationResult>(() =>
    validateChart(chart)
  );

  useEffect(() => {
    setValidation(validateChart(chart));
  }, [chart]);

  return validation;
}
```

### Phase 3: Component Implementation

This phase implements the UI components using the state and validation infrastructure. Each component receives typed props and uses event handlers to call parent-provided callbacks.

**Key Pattern**:

```typescript
// Component receives data and callbacks
<RolesEditor
  roles={state.roles}
  onAddRole={(name) => dispatch(addRole(name))}
  onEditRole={(id, name) => dispatch(editRole(id, name))}
  // ... other handlers
  validation={validation}
/>

// Component handles user interaction
function handleAdd(name: string) {
  const errors = validateRoleName(name, roles);
  if (errors.length === 0) {
    onAddRole(name);
  } else {
    showErrors(errors);  // Display in component
  }
}
```

### Phase 4: Integration & Testing

Connect all pieces in `RaciGeneratorPage`:

```typescript
export function RaciGeneratorPage() {
  const raciState = useRaciState();
  const validation = useValidation(raciState.state);
  const autoSave = useAutoSave(raciState.state);

  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    if (validation.errors.length > 0) {
      setShowErrorModal(true);
    }
  }, [validation.errors]);

  return (
    <div className="raci-generator">
      <RaciHeaderBar
        title={raciState.state.title}
        logo={raciState.state.logo}
        onTitleChange={(title) => raciState.updateTitle(title)}
        onLogoChange={(logo) => raciState.updateLogo(logo)}
        validation={validation}
      />

      <RolesEditor
        roles={raciState.state.roles}
        onAddRole={raciState.addRole}
        onEditRole={raciState.editRole}
        onDeleteRole={raciState.deleteRole}
        onReorderRoles={raciState.reorderRoles}
        validation={validation}
      />

      {/* ... other components */}

      <ErrorModal
        isOpen={showErrorModal}
        errors={validation.errors}
        onDismiss={() => setShowErrorModal(false)}
      />
    </div>
  );
}
```

---

## Performance Considerations

### 1. Avoid Unnecessary Re-renders

✅ **Do**: Use `useCallback` for event handlers

```typescript
const handleAddRole = useCallback(
  (name: string) => {
    onAddRole(name);
  },
  [onAddRole]
); // Only recreate if onAddRole changes
```

❌ **Don't**: Inline function definitions

```typescript
{/* Every render creates new function */}
<button onClick={() => onAddRole(name)} />
```

### 2. Debounce Auto-save

✅ **Do**: 5-second minimum between saves

```typescript
const debouncedChart = useDebounce(chart, 5000);

useEffect(() => {
  saveToLocalStorage(debouncedChart);
}, [debouncedChart]);
```

❌ **Don't**: Save on every keystroke

```typescript
onChange={(e) => saveToLocalStorage(chart)}  // Way too often
```

### 3. Memoize Expensive Computations

✅ **Do**: Cache validation results

```typescript
const validation = useMemo(() => validateChart(chart), [chart]);
```

❌ **Don't**: Recalculate validation in every render

```typescript
const validation = validateChart(chart); // Every render!
```

### 4. Limit Component Scope

✅ **Do**: Small focused components

- `RolesEditor` only handles roles
- `TasksEditor` only handles tasks

❌ **Don't**: One monolithic component for everything

---

## Error Handling Strategy

### Validation Errors (User-Caused)

```
User tries to add empty role name
    ↓
validateRoleName() returns error
    ↓
Component displays inline error message
    ↓
User corrects and retries
```

### Storage Errors (System-Caused)

```
localStorage quota exceeded
    ↓
Try IndexedDB
    ↓
If IndexedDB also fails: silent fail
    ↓
Data stays in memory
    ↓
User warned on page reload if needed
```

### Critical Errors (Unexpected)

```
Corrupted data in localStorage
    ↓
loadFromLocalStorage() returns null
    ↓
Fallback to default template
    ↓
User starts fresh
```

---

## Testing Strategy

### Unit Tests (lib/raci/validation.ts)

```typescript
describe("validateRoleName", () => {
  test("rejects empty string", () => {
    const errors = validateRoleName("", []);
    expect(errors).toContainEqual(
      expect.objectContaining({ code: "ROLE_EMPTY" })
    );
  });

  test("rejects duplicates", () => {
    const existing = [{ id: "1", name: "PM", order: 0 }];
    const errors = validateRoleName("PM", existing);
    expect(errors).toContainEqual(
      expect.objectContaining({ code: "ROLE_DUPLICATE" })
    );
  });

  test("rejects > 50 chars", () => {
    const errors = validateRoleName("x".repeat(51), []);
    expect(errors).toContainEqual(
      expect.objectContaining({ code: "ROLE_TOO_LONG" })
    );
  });
});
```

### Integration Tests

```typescript
describe("RolesEditor", () => {
  test("add role workflow", () => {
    const { getByLabelText, getByText } = render(
      <RolesEditor roles={[]} onAddRole={jest.fn()} {...props} />
    );

    const input = getByLabelText("New role name");
    const button = getByText("Add Role");

    fireEvent.change(input, { target: { value: "PM" } });
    fireEvent.click(button);

    expect(onAddRole).toHaveBeenCalledWith("PM");
  });
});
```

### E2E Tests (with Playwright or Cypress)

```typescript
test("full CRUD workflow", async ({ page }) => {
  await page.goto("/tools/raci-generator");

  // Add role
  await page.fill("input[aria-label='New role name']", "Product Manager");
  await page.click("button:has-text('Add Role')");
  await expect(page.locator("text=Product Manager")).toBeVisible();

  // Edit role
  await page.dblclick("text=Product Manager");
  await page.fill("input", "Project Manager");
  await page.press("input", "Enter");

  // Delete role
  // ... verification

  // Reload and verify persistence
  await page.reload();
  await expect(page.locator("text=Project Manager")).toBeVisible();
});
```

---

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements

**1.4.3 Contrast (Minimum)**

- Text: ≥ 4.5:1 contrast
- Large text: ≥ 3:1 contrast
- Icons: ≥ 3:1 contrast

**2.1.1 Keyboard**

- All functionality accessible via keyboard
- No keyboard traps
- Logical tab order

**2.4.7 Focus Visible**

- Focus indicator always visible
- ≥ 2px outline
- Distinct from surrounding content

**3.3.1 Error Identification**

- Errors identified
- Suggested correction provided
- Text alone not used for error indication

**3.3.4 Error Prevention**

- Reversible actions (can undo)
- Irreversible actions require confirmation

**4.1.2 Name, Role, Value**

- All components have proper ARIA labels
- ARIA roles correct
- States and properties communicated

### Testing for Accessibility

```bash
# Automated testing
npm install -D @testing-library/jest-dom @axe-core/react

# Manual testing
# 1. Keyboard only (no mouse)
# 2. Screen reader (VoiceOver, NVDA, JAWS)
# 3. Zoom 200%
# 4. High contrast mode
# 5. Color blind simulator
```

---

## Browser Support

### Minimum Requirements

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used

- `crypto.randomUUID()` - UUID generation
- `useReducer` - React 16.8+
- `localStorage` / `IndexedDB` - All modern browsers
- `FileReader.readAsDataURL()` - All modern browsers

### Polyfills (if needed)

```typescript
// UUID polyfill for older browsers
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto.randomUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}
```

---

## Next Steps (Iteration 3)

After Iteration 2 is complete, you'll be ready for:

### Iteration 3: RACI Matrix Editor

- Interactive color-coded grid
- Cell toggle logic (R/A/C/I)
- Exclusive assignment (one per cell)
- Real-time validation
- Performance optimization for large matrices

### Prerequisites Met

✅ Solid state management  
✅ Reliable persistence  
✅ Trustworthy validation  
✅ Good keyboard navigation foundation

---

## Troubleshooting

### State Not Persisting

**Issue**: Page reload doesn't restore state

**Solution**:

1. Check localStorage is enabled: `localStorage.setItem("test", "1")`
2. Check key name matches: `const STORAGE_KEY = "raciChart"`
3. Check version matches: `chart.version === "2.0.0"`
4. Check auto-save hook runs: Add console.log in useAutoSave

### Validation Always Fails

**Issue**: Error modal shows even for valid data

**Solution**:

1. Check validation logic: Add unit tests
2. Check field names: Match exactly (case-sensitive)
3. Check error severity: Only "error" blocks operations
4. Trace validation: console.log(validation) in component

### Keyboard Navigation Not Working

**Issue**: Tab doesn't move between fields

**Solution**:

1. Check tabIndex: Should be 0 for normal flow
2. Check focus trap: Don't trap outside modals
3. Check event handlers: `e.preventDefault()` can block Tab
4. Test manually: Tab key should work always

### Memory Leak Warnings

**Issue**: Console shows "memory leak" warnings

**Solution**:

1. Clean up listeners: `return () => removeEventListener(...)`
2. Clean up timers: `return () => clearTimeout(timer)`
3. Clean up subscriptions: Unsubscribe in cleanup
4. Memoize stable references: `useCallback` for callbacks

---

**Date Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Version**: 2.0.0
