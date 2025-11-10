# Iteration 2: Component Structure & Props

**Version**: 2.0.0  
**Date**: 2025-11-10  
**Focus**: Component interfaces, event handlers, accessibility

---

## 📐 RaciHeaderBar Component

### Purpose
Display and edit the chart title and logo.

### File Location
`src/components/raci/RaciHeaderBar.tsx`

### Props Interface
```typescript
interface RaciHeaderBarProps {
  title: string;
  logo?: string;  // Base64 encoded
  onTitleChange: (title: string) => void;
  onLogoChange: (logo: string) => void;
  validation: ValidationResult;
}
```

### Sub-Components
```
RaciHeaderBar
├─ Title Section
│  ├─ Label: "Chart Title"
│  ├─ Input field (max 100 chars)
│  ├─ Character counter (current/max)
│  └─ Error message (if title validation fails)
│
└─ Logo Section
   ├─ Label: "Logo"
   ├─ File input (PNG, JPG, SVG)
   ├─ Preview image (if logo exists)
   ├─ Remove button (if logo exists)
   └─ Error message (if logo validation fails)
```

### Event Handlers

#### Title Input
```typescript
function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const newTitle = e.target.value;
  
  // Optional: validate locally
  if (newTitle.length <= 100) {
    onTitleChange(newTitle);
  }
}
```

#### Logo File Input
```typescript
function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  
  if (!file) return;
  
  // Validate file
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64 = event.target?.result as string;
    onLogoChange(base64);  // Pass base64 to parent
  };
  reader.readAsDataURL(file);
}
```

### Accessibility

**ARIA Labels**
```typescript
<input
  aria-label="Chart title"
  aria-describedby="title-counter"
  aria-invalid={!!validation.getFieldError("title")}
/>

<input
  type="file"
  aria-label="Upload logo"
  aria-describedby="logo-error"
  accept=".png,.jpg,.jpeg,.svg"
/>
```

**Keyboard Navigation**
- Tab: Focus title input
- Tab: Focus logo input
- Tab: Focus remove button (if logo present)
- Tab: Loop back to start

**Focus Indicators**
- All inputs show focus ring
- Remove button shows focus ring

---

## 📐 RolesEditor Component

### Purpose
CRUD operations for roles (Add, Edit, Delete, Reorder).

### File Location
`src/components/raci/RolesEditor.tsx`

### Props Interface
```typescript
interface RolesEditorProps {
  roles: RaciRole[];
  onAddRole: (name: string) => void;
  onEditRole: (id: string, name: string) => void;
  onDeleteRole: (id: string) => void;
  onReorderRoles: (roles: RaciRole[]) => void;
  validation: ValidationResult;
}
```

### Sub-Components
```
RolesEditor
├─ Add Role Section
│  ├─ Label: "Add New Role"
│  ├─ Text input (placeholder: "Role name")
│  ├─ "Add" button
│  └─ Error message (if validation fails)
│
├─ Roles List (if roles exist)
│  └─ RoleItem[] (repeated for each role)
│     ├─ Drag handle (for reordering)
│     ├─ Role name (display or input in edit mode)
│     ├─ Edit button / input (save/cancel in edit mode)
│     ├─ Delete button
│     └─ Order indicators (arrow buttons or drag)
│
└─ Empty State (if no roles)
   └─ Message: "No roles yet. Add one to get started."
```

### Event Handlers

#### Add Role
```typescript
function handleAddRole(e: React.FormEvent) {
  e.preventDefault();
  
  const name = inputRef.current?.value.trim();
  
  if (!name) {
    // Component shows error from validation
    return;
  }
  
  onAddRole(name);
  inputRef.current!.value = "";  // Clear input
}
```

#### Edit Role
```typescript
function handleEditRole(id: string, newName: string) {
  if (!newName.trim()) return;
  
  onEditRole(id, newName.trim());
  setEditingId(null);  // Exit edit mode
}

function handleEditKeyDown(e: React.KeyboardEvent, id: string) {
  if (e.key === "Enter") {
    handleEditRole(id, e.currentTarget.value);
  } else if (e.key === "Escape") {
    setEditingId(null);  // Cancel edit
  }
}
```

#### Delete Role
```typescript
function handleDeleteRole(id: string) {
  setConfirmDelete(id);  // Show confirmation
}

function handleConfirmDelete(id: string) {
  onDeleteRole(id);
  setConfirmDelete(null);  // Close confirmation
}

function handleCancelDelete() {
  setConfirmDelete(null);  // Close without deleting
}
```

#### Reorder Roles
```typescript
function handleReorderRoles(newRoles: RaciRole[]) {
  // Update order property if using arrow buttons
  const reorderedRoles = newRoles.map((role, idx) => ({
    ...role,
    order: idx
  }));
  
  onReorderRoles(reorderedRoles);
}
```

### Accessibility

**ARIA Labels**
```typescript
<input
  aria-label="New role name"
  aria-describedby="add-role-help"
  aria-invalid={!!validation.getFieldError("roles")}
/>

<button aria-label={`Edit ${role.name}`} />
<button aria-label={`Delete ${role.name}`} />
<button aria-label={`Drag to reorder ${role.name}`} />
```

**Keyboard Navigation**
- Tab: Focus add input
- Tab: Focus add button
- Tab: Focus each role's edit button
- Tab: Focus each role's delete button
- Tab: Focus drag handle (optional)
- Enter: Submit form or save edit
- Esc: Cancel edit or close confirmation

**Confirmation Dialog**
- Trap focus inside dialog
- Cancel button gets focus first (safer)
- Esc key closes
- "Are you sure?" message clear

---

## 📐 TasksEditor Component

### Purpose
CRUD operations for tasks (Add, Edit, Delete, Reorder).

### File Location
`src/components/raci/TasksEditor.tsx`

### Props Interface
```typescript
interface TasksEditorProps {
  tasks: RaciTask[];
  onAddTask: (name: string, description?: string) => void;
  onEditTask: (id: string, name: string, description?: string) => void;
  onDeleteTask: (id: string) => void;
  onReorderTasks: (tasks: RaciTask[]) => void;
  validation: ValidationResult;
}
```

### Sub-Components
```
TasksEditor
├─ Add Task Section
│  ├─ Label: "Add New Task"
│  ├─ Text input (placeholder: "Task name")
│  ├─ Textarea (placeholder: "Description (optional)")
│  ├─ "Add" button
│  └─ Error message (if validation fails)
│
├─ Tasks List (if tasks exist)
│  └─ TaskItem[] (repeated for each task)
│     ├─ Drag handle (for reordering)
│     ├─ Task name (display or input in edit mode)
│     ├─ Task description (display or textarea in edit mode)
│     ├─ Edit button / inputs (save/cancel in edit mode)
│     ├─ Delete button
│     └─ Order indicators (arrow buttons or drag)
│
└─ Empty State (if no tasks)
   └─ Message: "No tasks yet. Add one to get started."
```

### Event Handlers

#### Add Task
```typescript
function handleAddTask(e: React.FormEvent) {
  e.preventDefault();
  
  const name = nameInputRef.current?.value.trim();
  const description = descInputRef.current?.value.trim();
  
  if (!name) return;  // Validation handles error display
  
  onAddTask(name, description || undefined);
  nameInputRef.current!.value = "";
  descInputRef.current!.value = "";
}
```

#### Edit Task
```typescript
function handleEditTask(id: string, name: string, description?: string) {
  if (!name.trim()) return;
  
  onEditTask(id, name.trim(), description?.trim() || undefined);
  setEditingId(null);
}

function handleEditKeyDown(e: React.KeyboardEvent, id: string) {
  // Enter: save (Ctrl+Enter in textarea)
  if (e.key === "Enter" && (e.ctrlKey || e.target.tagName !== "TEXTAREA")) {
    handleEditTask(id, nameValue, descValue);
  }
  // Escape: cancel
  else if (e.key === "Escape") {
    setEditingId(null);
  }
}
```

#### Delete Task
```typescript
function handleDeleteTask(id: string) {
  setConfirmDelete(id);
}

function handleConfirmDelete(id: string) {
  onDeleteTask(id);
  setConfirmDelete(null);
}
```

#### Reorder Tasks
```typescript
function handleReorderTasks(newTasks: RaciTask[]) {
  const reorderedTasks = newTasks.map((task, idx) => ({
    ...task,
    order: idx
  }));
  
  onReorderTasks(reorderedTasks);
}
```

### Accessibility

**ARIA Labels**
```typescript
<input
  aria-label="New task name"
  aria-describedby="task-name-help"
  aria-invalid={!!validation.getFieldError("tasks")}
/>

<textarea
  aria-label="Task description (optional)"
  aria-describedby="task-desc-help"
  maxLength={500}
/>

<button aria-label={`Edit ${task.name}`} />
<button aria-label={`Delete ${task.name}`} />
```

**Keyboard Navigation**
- Tab: Focus name input
- Tab: Focus description textarea
- Tab: Focus add button
- Ctrl+Enter: Submit (in textarea)
- Esc: Cancel edit
- Tab through task list items

---

## 📐 ErrorModal Component

### Purpose
Display validation errors and recovery options.

### File Location
`src/components/raci/ErrorModal.tsx`

### Props Interface
```typescript
interface ErrorModalProps {
  isOpen: boolean;
  errors: ValidationError[];
  onDismiss: () => void;
  recoveryAction?: {
    label: string;
    callback: () => void;
  };
}
```

### Sub-Components
```
ErrorModal (if isOpen)
├─ Backdrop (dark overlay)
├─ Dialog Box
│  ├─ Title: "Validation Error"
│  ├─ Error List
│  │  └─ ErrorItem[] (for each error)
│  │     ├─ Icon (⚠️ or ❌)
│  │     ├─ Error message
│  │     └─ Severity indicator
│  │
│  └─ Button Group
│     ├─ "Got It" button
│     └─ Optional recovery button (if recoveryAction)
│
└─ (if closed)
   └─ Nothing rendered
```

### Event Handlers

#### Dismiss Modal
```typescript
function handleDismiss() {
  onDismiss();  // Close modal
}

function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === "Escape") {
    onDismiss();  // Esc closes
  }
}
```

#### Recovery Action
```typescript
function handleRecovery() {
  recoveryAction?.callback();  // Call provided callback
  onDismiss();  // Close modal
}
```

### Accessibility

**Focus Management**
```typescript
useEffect(() => {
  if (isOpen) {
    dismissButtonRef.current?.focus();  // Focus dismiss button
  }
}, [isOpen]);
```

**ARIA Attributes**
```typescript
<div
  role="dialog"
  aria-modal={true}
  aria-labelledby="error-title"
  aria-describedby="error-list"
  onKeyDown={handleKeyDown}
>
  <h2 id="error-title">Validation Error</h2>
  <ul id="error-list" role="alert">
    {errors.map(error => (
      <li key={error.code} role="listitem">
        {error.message}
      </li>
    ))}
  </ul>
</div>
```

**Keyboard Navigation**
- Tab: Focus dismiss button
- Tab: Focus recovery button (if exists)
- Esc: Dismiss modal
- Enter: Click focused button

---

## 📐 ResetControls Component

### Purpose
Reset chart state with confirmation.

### File Location
`src/components/raci/ResetControls.tsx`

### Props Interface
```typescript
interface ResetControlsProps {
  onReset: () => void;
  onCancel: () => void;
}
```

### Sub-Components
```
ResetControls
├─ Reset Button (warning color)
│  └─ Label: "Reset Chart"
│
└─ Confirmation Dialog (if confirming)
   ├─ Title: "Reset Chart?"
   ├─ Message: "This will clear all roles, tasks, and settings."
   ├─ Warning: "This cannot be undone."
   └─ Button Group
      ├─ Cancel (primary, gets focus)
      └─ Reset Confirm (danger, red)
```

### Event Handlers

#### Open Confirmation
```typescript
function handleResetClick() {
  setShowConfirmation(true);
}
```

#### Confirm Reset
```typescript
function handleConfirmReset() {
  onReset();  // Call parent reset handler
  setShowConfirmation(false);
}

function handleCancelReset() {
  setShowConfirmation(false);
}

function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === "Escape") {
    setShowConfirmation(false);
  }
}
```

### Accessibility

**ARIA Attributes**
```typescript
<button
  aria-label="Reset chart contents"
  className="bg-red-500 text-white"
/>

<div
  role="dialog"
  aria-modal={true}
  aria-labelledby="reset-title"
>
  <h2 id="reset-title">Reset Chart?</h2>
</div>
```

**Keyboard Navigation**
- Tab: Focus reset button
- Tab: Focus cancel button (in dialog)
- Tab: Focus confirm button
- Esc: Cancel (close dialog)
- Enter: Confirm action

---

## 📐 RaciGeneratorPage Component

### Purpose
Main page component integrating all editors and state management.

### File Location
`src/components/raci/RaciGeneratorPage.tsx`

### State Management
```typescript
// Initialize state management
const raciState = useRaciState();  // Hook
const validation = useValidation(raciState.state);
const autoSave = useAutoSave(raciState.state);

// Expose convenience methods
const {
  state,
  addRole,
  editRole,
  deleteRole,
  addTask,
  editTask,
  deleteTask,
  updateTitle,
  updateLogo,
  reset
} = raciState;
```

### Props (from Page Route)
```typescript
interface RaciGeneratorPageProps {
  // Optional: initial chart data (from import)
  initialChart?: RaciChart;
}
```

### Sub-Components Integration
```
RaciGeneratorPage
│
├─ useState hooks
│  ├─ showErrorModal
│  ├─ selectedTheme
│  └─ autoSaveStatus
│
├─ Custom hooks
│  ├─ useRaciState() → raciState
│  ├─ useAutoSave(raciState.state) → {isSaving, lastSaved, error}
│  └─ useValidation(raciState.state) → validation
│
├─ Effects
│  ├─ useEffect (handle validation errors)
│  ├─ useEffect (load initial data)
│  └─ useEffect (handle keyboard shortcuts)
│
└─ Render Structure
   ├─ RaciHeaderBar
   │  └─ Props: {title, logo, onTitleChange, onLogoChange, validation}
   │
   ├─ DescriptionPanel
   │  └─ Props: {description, onDescriptionChange, validation}
   │
   ├─ RolesEditor
   │  └─ Props: {roles, onAddRole, onEditRole, onDeleteRole, onReorderRoles, validation}
   │
   ├─ TasksEditor
   │  └─ Props: {tasks, onAddTask, onEditTask, onDeleteTask, onReorderTasks, validation}
   │
   ├─ ThemeSelector
   │  └─ Props: {selectedTheme, onThemeChange}
   │
   ├─ ResetControls
   │  └─ Props: {onReset: () => raciState.reset()}
   │
   ├─ RaciMatrixEditor (prepared for Iteration 3)
   │  └─ Props: {matrix, roles, tasks, onMatrixChange, validation}
   │
   ├─ ExportButtons (prepared for Iteration 3)
   │  └─ Props: {chart: state, validation}
   │
   ├─ ErrorModal
   │  └─ Props: {isOpen, errors: validation.errors, onDismiss}
   │
   └─ RaciPreview (prepared for Iteration 5)
      └─ Props: {chart: state, theme: selectedTheme}
```

### Event Handler Pattern
```typescript
// Pattern for all CRUD operations:

function handleAddRole(name: string) {
  try {
    raciState.addRole(name);
    // State updates automatically
    // useAutoSave triggers
    // useValidation runs
    // Components re-render with new state
  } catch (error) {
    setShowErrorModal(true);
  }
}

// Similar for: editRole, deleteRole, addTask, editTask, deleteTask, etc.
```

### Keyboard Shortcuts (Prepared)
```typescript
useEffect(() => {
  function handleGlobalKeydown(e: KeyboardEvent) {
    // Ctrl+Z / Cmd+Z for undo (prepared for Iteration 3)
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      // Undo handler here
    }
    
    // Other global shortcuts can go here
  }
  
  window.addEventListener("keydown", handleGlobalKeydown);
  return () => window.removeEventListener("keydown", handleGlobalKeydown);
}, []);
```

---

## 🎯 Type Definitions

### Interfaces Needed in types/raci.ts

```typescript
// Basic entities
interface RaciRole {
  id: string;
  name: string;
  order: number;
}

interface RaciTask {
  id: string;
  name: string;
  description?: string;
  order: number;
}

type RaciValue = "R" | "A" | "C" | "I" | null;

// State
interface RaciChart {
  id: string;
  title: string;
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: Record<string, Record<string, RaciValue>>;
  theme: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
}

// Validation
interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  getFieldError: (field: string) => ValidationError | undefined;
}

// Reducer
type RaciAction = 
  | { type: "addRole"; payload: { name: string } }
  | { type: "editRole"; payload: { id: string; name: string } }
  | { type: "deleteRole"; payload: { id: string } }
  | { type: "reorderRoles"; payload: { roles: RaciRole[] } }
  | { type: "addTask"; payload: { name: string; description?: string } }
  | { type: "editTask"; payload: { id: string; name: string; description?: string } }
  | { type: "deleteTask"; payload: { id: string } }
  | { type: "reorderTasks"; payload: { tasks: RaciTask[] } }
  | { type: "updateTitle"; payload: { title: string } }
  | { type: "updateLogo"; payload: { logo?: string } }
  | { type: "reset" }
  | { type: "setState"; payload: { chart: RaciChart } };
```

---

**Date Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Version**: 2.0.0
