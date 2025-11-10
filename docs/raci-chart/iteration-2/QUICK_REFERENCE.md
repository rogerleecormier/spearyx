# Iteration 2: Quick Reference Guide

**Version**: 2.0.0  
**Date**: 2025-11-10  
**Purpose**: Quick lookup while coding

---

## 🎯 Implementation Checklist Quick View

### Phase 1: State Management

```
lib/raci/state.ts
├─ RaciAction type
├─ RaciReducer function
└─ createInitialChart function

useRaciState hook
├─ Uses useReducer internally
├─ Returns {state, dispatch, addRole, editRole, ...}
└─ Located in lib/raci/hooks.ts (or state.ts)

lib/raci/persistence.ts
├─ saveToLocalStorage()
├─ loadFromLocalStorage()
├─ saveToIndexedDB()
├─ loadFromIndexedDB()
└─ getStorageSize()

useAutoSave hook
├─ Takes chart, optional key
├─ Debounces 5 seconds
└─ Returns {isSaving, lastSaved, error}
```

### Phase 2: Validation

```
lib/raci/validation.ts
├─ validateRoleName()
├─ validateTaskName()
├─ validateTitle()
├─ validateLogo()
├─ validateChart()
└─ getErrorMessage()

useValidation hook
├─ Takes chart
└─ Returns ValidationResult

ValidationError type
├─ field: string
├─ message: string
├─ severity: "error" | "warning"
└─ code: string
```

### Phase 3: Components

```
RaciHeaderBar - Title + Logo
├─ Props: {title, logo, onTitleChange, onLogoChange, validation}
└─ New: Logo upload with preview

RolesEditor - CRUD roles
├─ Props: {roles, onAddRole, onEditRole, onDeleteRole, onReorderRoles, validation}
└─ New: Full implementation

TasksEditor - CRUD tasks
├─ Props: {tasks, onAddTask, onEditTask, onDeleteTask, onReorderTasks, validation}
└─ New: Full implementation

ErrorModal - Error display
├─ Props: {isOpen, errors, onDismiss, recoveryAction}
└─ Enhanced: Connect to validation

ResetControls - Reset with confirmation
├─ Props: {onReset, onCancel}
└─ Enhanced: Dialog handling

RaciGeneratorPage - Main integration
├─ Uses all hooks
├─ Integrates all components
└─ Handles global state
```

### Phase 4: Keyboard Navigation

```
useKeyboardNav hook
├─ handleEsc(callback)
├─ handleEnter(callback)
└─ handleShiftTab(callback)

Focus management
├─ Focus trap in modals
├─ Visible focus indicators
└─ Logical tab order
```

---

## 💻 Code Patterns

### Reducer Pattern

```typescript
// Define action type
type MyAction =
  | { type: "add"; payload: { name: string } }
  | { type: "delete"; payload: { id: string } };

// Implement reducer
function reducer(state: State, action: MyAction): State {
  switch (action.type) {
    case "add":
      return { ...state, items: [...state.items, newItem] };
    case "delete":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.id),
      };
    default:
      return state;
  }
}

// Use in hook
function useMyHook() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    state,
    add: (name) => dispatch({ type: "add", payload: { name } }),
    delete: (id) => dispatch({ type: "delete", payload: { id } }),
  };
}
```

### Form Submission Pattern

```typescript
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const value = inputRef.current?.value.trim();

  // Validate
  if (!value) return; // Error shown by validation hook

  // Call handler
  onAdd(value);

  // Clear
  inputRef.current!.value = "";
}
```

### Confirmation Dialog Pattern

```typescript
function handleDelete(id: string) {
  // Show confirmation
  setConfirmId(id);
}

function handleConfirm(id: string) {
  // User confirmed
  onDelete(id);
  setConfirmId(null);
}

function handleCancel() {
  // User cancelled
  setConfirmId(null);
}
```

### localStorage Pattern

```typescript
// Save
localStorage.setItem("key", JSON.stringify(data));

// Load
const data = localStorage.getItem("key");
const parsed = data ? JSON.parse(data) : null;

// Check version
if (parsed?.version === CURRENT_VERSION) {
  // Use data
} else {
  // Discard or migrate
}
```

### Debounce Pattern

```typescript
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedChart = useDebounce(chart, 5000);

useEffect(() => {
  // This runs after 5s of no chart changes
  saveToLocalStorage(debouncedChart);
}, [debouncedChart]);
```

---

## 🔑 Key Keyboard Shortcuts

```
Tab                → Next control
Shift+Tab          → Previous control
Esc                → Close dialog/exit edit
Enter              → Submit form / Save edit
Ctrl+Z / Cmd+Z     → Undo (Iteration 3)
Space (on button)  → Click
```

---

## 🎨 Component Props Quick Lookup

### RaciHeaderBar

```typescript
{
  title: string;
  logo?: string;  // Base64
  onTitleChange: (title: string) => void;
  onLogoChange: (logo: string) => void;
  validation: ValidationResult;
}
```

### RolesEditor

```typescript
{
  roles: RaciRole[];
  onAddRole: (name: string) => void;
  onEditRole: (id: string, name: string) => void;
  onDeleteRole: (id: string) => void;
  onReorderRoles: (roles: RaciRole[]) => void;
  validation: ValidationResult;
}
```

### TasksEditor

```typescript
{
  tasks: RaciTask[];
  onAddTask: (name: string, description?: string) => void;
  onEditTask: (id: string, name: string, description?: string) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: RaciTask[]) => void;
  validation: ValidationResult;
}
```

### ErrorModal

```typescript
{
  isOpen: boolean;
  errors: ValidationError[];
  onDismiss: () => void;
  recoveryAction?: {
    label: string;
    callback: () => void;
  };
}
```

### ResetControls

```typescript
{
  onReset: () => void;
  onCancel: () => void;
}
```

---

## ✅ Validation Error Codes

```
ROLE_EMPTY           → "Role name cannot be empty"
ROLE_DUPLICATE       → "Role name already exists"
ROLE_TOO_LONG        → "Role name too long (max 50)"

TASK_EMPTY           → "Task name cannot be empty"
TASK_DUPLICATE       → "Task name already exists"
TASK_TOO_LONG        → "Task name too long (max 100)"
TASK_DESC_TOO_LONG   → "Description too long (max 500)"

TITLE_EMPTY          → "Title cannot be empty"
TITLE_TOO_LONG       → "Title too long (max 100)"

LOGO_INVALID_TYPE    → "Invalid file type (only PNG, JPG, SVG)"
LOGO_TOO_LARGE       → "File too large (max 5MB)"

STORAGE_QUOTA        → "Storage quota exceeded"
```

---

## 📊 Type Definitions Cheatsheet

### RaciRole

```typescript
{
  id: string; // UUID
  name: string; // e.g., "Product Manager"
  order: number; // 0, 1, 2, ... (for positioning)
}
```

### RaciTask

```typescript
{
  id: string;        // UUID
  name: string;      // e.g., "Requirements"
  description?: string;  // Optional details
  order: number;     // 0, 1, 2, ... (for positioning)
}
```

### RaciChart

```typescript
{
  id: string;
  title: string;
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: Record<string, Record<string, RaciValue>>;
  theme: string;
  logo?: string;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
  version: string;    // "2.0.0"
}
```

### ValidationResult

```typescript
{
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  getFieldError: (field: string) => ValidationError | undefined;
}
```

### ValidationError

```typescript
{
  field: string; // e.g., "title", "roles"
  message: string; // User-friendly text
  severity: "error" | "warning";
  code: string; // e.g., "ROLE_EMPTY"
}
```

---

## 🔄 Reducer Actions Quick Reference

```typescript
// Roles
dispatch({ type: "addRole", payload: { name: "PM" } });
dispatch({ type: "editRole", payload: { id: "uuid", name: "Product Manager" } });
dispatch({ type: "deleteRole", payload: { id: "uuid" } });
dispatch({ type: "reorderRoles", payload: { roles: [...] } });

// Tasks
dispatch({ type: "addTask", payload: { name: "Design", description: "..." } });
dispatch({ type: "editTask", payload: { id: "uuid", name: "Design", description: "..." } });
dispatch({ type: "deleteTask", payload: { id: "uuid" } });
dispatch({ type: "reorderTasks", payload: { tasks: [...] } });

// Header
dispatch({ type: "updateTitle", payload: { title: "My Project" } });
dispatch({ type: "updateLogo", payload: { logo: "data:image/..." } });

// Bulk
dispatch({ type: "reset" });
dispatch({ type: "setState", payload: { chart: fullChartObject } });
```

---

## 📁 File Locations

```
Components:
  src/components/raci/RaciHeaderBar.tsx
  src/components/raci/RolesEditor.tsx
  src/components/raci/TasksEditor.tsx
  src/components/raci/ErrorModal.tsx
  src/components/raci/ResetControls.tsx
  src/components/raci/RaciGeneratorPage.tsx

Hooks:
  src/lib/raci/hooks.ts (or individual files)
    - useRaciState
    - useAutoSave
    - useValidation
    - useKeyboardNav

Utils:
  src/lib/raci/state.ts
  src/lib/raci/validation.ts
  src/lib/raci/persistence.ts

Types:
  src/types/raci.ts (update with new types)

Styles:
  src/styles/raci.css
```

---

## 🧪 Testing Checklist Quick View

### CRUD Operations

- [ ] Add role: works
- [ ] Edit role: works
- [ ] Delete role: works
- [ ] Reorder roles: works
- [ ] Add task: works
- [ ] Edit task: works
- [ ] Delete task: works
- [ ] Reorder tasks: works

### Validation

- [ ] Role empty: error shown
- [ ] Role duplicate: error shown
- [ ] Task empty: error shown
- [ ] Task duplicate: error shown
- [ ] Logo too large: error shown
- [ ] Logo wrong type: error shown

### Persistence

- [ ] State saves to localStorage
- [ ] Page reload: state restored
- [ ] Clear localStorage: default template used
- [ ] Corruption: recovered gracefully

### Keyboard

- [ ] Tab: navigates forward
- [ ] Shift+Tab: navigates backward
- [ ] Esc: closes dialogs
- [ ] Enter: submits forms
- [ ] No keyboard traps

### Accessibility

- [ ] Screen reader announces form labels
- [ ] Focus visible on all inputs
- [ ] Error messages announced
- [ ] Touch targets ≥ 48px

---

## 🚀 Quick Start Sequence

1. Create `types/raci.ts` types
2. Create `lib/raci/state.ts` + reducer
3. Create `useRaciState` hook
4. Create `lib/raci/validation.ts`
5. Create `useValidation` hook
6. Create `lib/raci/persistence.ts`
7. Create `useAutoSave` hook
8. Implement RaciHeaderBar
9. Implement RolesEditor
10. Implement TasksEditor
11. Implement ErrorModal
12. Implement ResetControls
13. Integrate RaciGeneratorPage
14. Create `useKeyboardNav` hook
15. Test everything

---

## 🔗 External References

### React Hooks

- `useReducer` - State management
- `useEffect` - Side effects
- `useCallback` - Memoize callbacks
- `useMemo` - Memoize values
- `useRef` - Direct DOM access
- `useContext` - Shared state

### Web APIs

- `localStorage.getItem/setItem` - Persistence
- `JSON.stringify/parse` - Serialization
- `FileReader.readAsDataURL()` - File to base64
- `Array.filter/map/sort` - Array operations

### Accessibility

- WCAG 2.1 Level AA - Standards
- ARIA attributes - Semantic markup
- Focus management - Keyboard nav
- Color contrast - Visual access

---

## 💡 Pro Tips

1. **Immutable State**: Always use spread operator (`...state`)
2. **Debounce Save**: 5 second minimum to avoid thrashing storage
3. **Validation First**: Do it in reducer, not just components
4. **Clear Error Messages**: User-friendly, actionable text
5. **Focus Management**: Use `useRef` to focus after operations
6. **Memoize Callbacks**: `useCallback` for event handlers to avoid re-renders
7. **Test Accessibility**: Actually use keyboard and screen reader
8. **Version Your Data**: localStorage format may change
9. **Graceful Degradation**: If localStorage fails, gracefully degrade
10. **Component Pure**: No side effects in components, use effects instead

---

**Date Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Version**: 2.0.0
