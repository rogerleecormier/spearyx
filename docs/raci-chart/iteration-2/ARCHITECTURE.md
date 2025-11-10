# Iteration 2: Architecture & Data Flows

**Version**: 2.0.0  
**Date**: 2025-11-10  
**Focus**: State Management, Editors, Validation

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RaciGeneratorPage (Client)                      │
│                      (SSR-rendered, Client-interactive)                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       useRaciState Hook                         │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │  Chart State (in React memory)                         │    │   │
│  │  │  ├─ id: UUID                                           │    │   │
│  │  │  ├─ title: string                                      │    │   │
│  │  │  ├─ roles: RaciRole[]                                  │    │   │
│  │  │  ├─ tasks: RaciTask[]                                  │    │   │
│  │  │  ├─ matrix: Record<string, Record<string, RaciValue>>  │    │   │
│  │  │  ├─ logo?: string (Base64)                             │    │   │
│  │  │  └─ theme: string                                      │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                                                                  │   │
│  │  Reducer & Actions:                                            │   │
│  │  ├─ useReducer(raciReducer, initialChart)                      │   │
│  │  ├─ dispatch(action) → state updates                           │   │
│  │  └─ Convenience methods (addRole, editRole, etc.)              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────┬──────────────────┬──────────────────────────┐    │
│  │                  │                  │                          │    │
│  ▼                  ▼                  ▼                          ▼    │
│ ┌────────────────┐ ┌────────────────┐ ┌──────────────────┐ ┌──────┐   │
│ │useAutoSave     │ │ useValidation  │ │ useKeyboardNav  │ │ UI   │   │
│ │  Hook          │ │   Hook         │ │   Hook (prep)   │ │Components
│ ├────────────────┤ ├────────────────┤ ├──────────────────┤ ├──────┤   │
│ │• Detects state │ │• Validates all │ │• Event handlers │ │Header │   │
│ │  changes       │ │  fields        │ │  (Esc, Enter)  │ │Roles  │   │
│ │• Debounces     │ │• Real-time     │ │• Focus mngt    │ │Tasks  │   │
│ │  5s            │ │• Error msgs    │ │• Shortcuts     │ │Modal  │   │
│ │• Saves to      │ │• Field-level   │ │  (prep Iter 3) │ │Reset  │   │
│ │  localStorage  │ │  errors        │ │                │ │       │   │
│ │• IndexedDB     │ │• Warnings      │ └──────────────────┘ └──────┘   │
│ │  fallback      │ │• getSeverity   │                                  │
│ └────────────────┘ └────────────────┘                                  │
│        ↓                   ↓                                            │
│    Storage          Validation Result                                  │
│  localStorage       {isValid, errors}                                  │
│  IndexedDB                                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management Flow

### State Initialization

```
Page Mount
    ↓
[useRaciState initializes]
    ├─ Check localStorage for persisted chart
    ├─ Validate version (must be current version)
    ├─ If valid: Load from localStorage
    └─ If invalid: Use default template
    ↓
State Ready
    ↓
[useAutoSave starts watching]
    └─ Ready to save on next state change
    ↓
[useValidation computes initial validation]
    └─ Validation result available
    ↓
Components Render with initial state
```

### State Update Flow (CRUD Example: Add Role)

```
User clicks "Add Role" button
    ↓
RolesEditor: handleAddRole(roleName) called
    ↓
Validates locally (basic check)
    ├─ Not empty?
    └─ Not duplicate?
    ↓
Calls dispatch({ type: "addRole", payload: { name: roleName } })
    ↓
useRaciState reducer:
    ├─ Validates again (server-side check)
    ├─ Generates UUID for new role
    ├─ Appends to roles array (order preserved)
    ├─ Returns new state (immutable)
    └─ Returns to caller
    ↓
State Updated in React memory
    ↓
Components re-render with new state
    ├─ RolesEditor shows new role in list
    └─ RaciGeneratorPage passes updated state to children
    ↓
useValidation runs:
    ├─ Validates entire chart
    ├─ Checks role uniqueness
    ├─ Returns validation result
    └─ Passes to ErrorModal (if needed)
    ↓
useAutoSave detects state change:
    ├─ Debounces (5 seconds)
    ├─ Saves chart to localStorage
    ├─ Catches errors (quota exceeded)
    ├─ Updates lastSaved timestamp
    └─ Silent on auto-save errors (not user-facing)
    ↓
State Persisted to localStorage
    ↓
User can reload page → state restored
```

### Delete Flow (with Confirmation)

```
User clicks "Delete Role" button
    ↓
RolesEditor shows confirmation dialog
    ├─ "Are you sure?"
    ├─ Cancel button (default focus)
    └─ Confirm button (danger color)
    ↓
User clicks Confirm (or Esc to cancel)
    ↓
If Confirm:
    ├─ dispatch({ type: "deleteRole", payload: { id: roleId } })
    ├─ Reducer removes from array
    ├─ New state returned
    ├─ Components re-render (role removed from list)
    ├─ useValidation runs
    └─ useAutoSave saves changes
    ↓
If Esc/Cancel:
    └─ Dialog closes, no changes
```

### Edit Flow (Inline Editing)

```
User double-clicks role name → Edit mode
    ↓
Text input appears with current value
    ├─ Input focused
    ├─ Current text selected
    └─ Edit mode indicators shown
    ↓
User types new name
    ↓
User presses Enter (or clicks Save)
    ↓
Component validates:
    ├─ Not empty?
    ├─ Not duplicate?
    └─ < 50 chars?
    ↓
If valid:
    ├─ dispatch({ type: "editRole", payload: { id, name } })
    ├─ Reducer updates in place
    ├─ Components re-render
    ├─ Edit mode exits
    ├─ useValidation runs
    └─ useAutoSave saves
    ↓
If invalid:
    ├─ Show error message
    ├─ Keep edit mode open
    ├─ Input focused for retry
    └─ Don't call dispatch
    ↓
User presses Esc
    ├─ Edit mode closes
    ├─ Original value restored
    └─ No state change
```

---

## 🎯 Component Hierarchy & Props Flow

### Parent-Child Component Structure

```
RaciGeneratorPage (state provider)
│
├─ useRaciState() → {state, dispatch, convenience methods}
├─ useAutoSave(state) → {isSaving, lastSaved, error}
├─ useValidation(state) → {isValid, errors, warnings}
├─ useKeyboardNav() → {handlers}
│
├─ RaciHeaderBar
│  └─ Props: { title, logo, onTitleChange, onLogoChange, validation }
│
├─ DescriptionPanel
│  └─ Props: { description, onDescriptionChange, validation }
│
├─ RolesEditor
│  └─ Props: {
│      roles,
│      onAddRole,
│      onEditRole,
│      onDeleteRole,
│      onReorderRoles,
│      validation
│    }
│
├─ TasksEditor
│  └─ Props: {
│      tasks,
│      onAddTask,
│      onEditTask,
│      onDeleteTask,
│      onReorderTasks,
│      validation
│    }
│
├─ ThemeSelector
│  └─ Props: { selectedTheme, onThemeChange }
│
├─ ResetControls
│  └─ Props: { onReset, onCancel }
│
├─ RaciMatrixEditor
│  └─ Props: { matrix, roles, tasks, onMatrixChange, validation } (prepared)
│
├─ ExportButtons
│  └─ Props: { chart, validation } (prepared)
│
├─ ErrorModal
│  ├─ Props: { isOpen, errors, onDismiss, recoveryAction }
│  └─ Shows if validation errors exist
│
└─ RaciPreview (prepared for Iteration 5)
   └─ Props: { chart, theme }
```

### Props Data Types

#### From Parent to Child

```typescript
// RaciHeaderBar receives:
{
  title: string,           // current title
  logo?: string,           // base64 encoded image
  onTitleChange: (title: string) => void,
  onLogoChange: (logo: string) => void,
  validation: {
    isValid: boolean,
    errors: [{field: "title", message: "...", severity: "error"}],
    getFieldError: (field: string) => ValidationError | undefined
  }
}

// RolesEditor receives:
{
  roles: [{id: "uuid", name: "PM", order: 0}, ...],
  onAddRole: (name: string) => void,
  onEditRole: (id: string, name: string) => void,
  onDeleteRole: (id: string) => void,
  onReorderRoles: (roles: RaciRole[]) => void,
  validation: {...}
}
```

#### From Child to Parent (Event Handlers)

```typescript
// RolesEditor calls:
onAddRole("Product Manager")
  → RaciGeneratorPage calls dispatch(addRole(...))
  → State updates
  → Re-render with new role

onEditRole("uuid-123", "Project Manager")
  → dispatch(editRole(...))
  → State updates
  → Re-render

onDeleteRole("uuid-456")
  → Show confirmation
  → User confirms
  → dispatch(deleteRole(...))
  → State updates
  → Re-render (role removed)
```

---

## 🔐 Validation Pipeline

### Validation Flow

```
User Action (e.g., add role)
    ↓
Component Local Validation (optional quick check)
    ├─ Empty string check?
    ├─ Length check?
    └─ Format check?
    ↓
Dispatch to State Reducer
    ↓
Reducer performs validation:
    ├─ Is this a valid action?
    ├─ Does the data exist?
    ├─ Can we perform this action?
    ├─ Return error if invalid
    └─ Return new state if valid
    ↓
Component receives new state (or error)
    ↓
useValidation hook runs:
    ├─ validateRoleName() on all roles
    ├─ validateTaskName() on all tasks
    ├─ validateTitle()
    ├─ validateLogo() (if provided)
    ├─ Collect all errors
    ├─ Determine severity
    └─ Return ValidationResult
    ↓
RaciGeneratorPage receives ValidationResult
    ↓
If errors exist:
    ├─ Show error details in console (dev only)
    ├─ Show ErrorModal if critical
    ├─ Disable export buttons
    └─ Show inline errors in editors
    ↓
If valid:
    ├─ Export buttons enabled
    ├─ No error modals
    └─ Ready for next iteration
```

### Validation Rules

#### Role Validation

```
Rule 1: Not empty
  - Error: "Role name cannot be empty"
  - Severity: "error"

Rule 2: Unique (case-insensitive)
  - Error: "Role name already exists"
  - Severity: "error"

Rule 3: Max 50 characters
  - Error: "Role name too long (max 50)"
  - Severity: "error"

Result: isValid = all rules pass
```

#### Task Validation

```
Rule 1: Name not empty
  - Error: "Task name cannot be empty"
  - Severity: "error"

Rule 2: Name unique (case-insensitive)
  - Error: "Task name already exists"
  - Severity: "error"

Rule 3: Name max 100 chars
  - Error: "Task name too long (max 100)"
  - Severity: "error"

Rule 4: Description max 500 chars
  - Error: "Description too long (max 500)"
  - Severity: "error"

Result: isValid = all rules pass
```

#### Logo Validation

```
Rule 1: File type allowed (PNG, JPG, SVG)
  - Error: "Invalid file type (only PNG, JPG, SVG)"
  - Severity: "error"

Rule 2: File size ≤ 5MB
  - Error: "File too large (max 5MB)"
  - Severity: "error"

Result: isValid = all rules pass
```

---

## 💾 Persistence Architecture

### Auto-Save Mechanism

```
User edits state
    ↓
useAutoSave hook detects change:
    ├─ Compare prevChart with newChart
    ├─ If different, mark as "dirty"
    └─ Start debounce timer (5 seconds)
    ↓
Debounce Timer:
    ├─ 5 seconds of no changes
    ├─ Timer completes
    └─ Trigger save
    ↓
Save Process:
    ├─ Try localStorage first
    │  ├─ Check available space
    │  ├─ Serialize chart to JSON
    │  ├─ Store in localStorage
    │  └─ Update lastSaved timestamp
    │
    ├─ If localStorage fails (quota exceeded):
    │  ├─ Try IndexedDB
    │  ├─ Store chart object
    │  └─ Update lastSaved timestamp
    │
    └─ If both fail:
       ├─ Log error (dev only)
       ├─ Set error state
       ├─ Don't show to user (silent fail)
       ├─ Chart still in memory
       └─ User can still edit (will lose on reload)
    ↓
Save Complete
    └─ Ready for next change
```

### State Recovery on Page Load

```
Page Mounts
    ↓
useRaciState initializes:
    ├─ Check localStorage for stored chart
    │  ├─ Key: "raciChart"
    │  ├─ Parse JSON
    │  ├─ Verify version matches current
    │  ├─ If valid: use stored state
    │  └─ If invalid or missing: continue to next
    │
    ├─ Check IndexedDB for stored chart
    │  ├─ Retrieve from object store
    │  ├─ Verify version
    │  ├─ If valid: use stored state
    │  └─ If invalid or missing: continue to next
    │
    ├─ If both storage layers empty:
    │  ├─ Check URL parameters (for import)
    │  ├─ If import data present: decode and validate
    │  └─ Otherwise: use default template
    │
    └─ State initialized with best available source
    ↓
Chart Ready to Edit
```

### Storage Hierarchy

```
Priority 1: localStorage (5-10MB limit)
  ├─ Key: "raciChart"
  ├─ Value: JSON serialized RaciChart
  ├─ Fast access
  └─ Automatic on every debounced save

Priority 2: IndexedDB (50MB+ limit)
  ├─ ObjectStore: "raciCharts"
  ├─ Key: "current"
  ├─ Value: Full RaciChart object
  ├─ Fallback if localStorage quota exceeded
  └─ Automatic on localStorage failure

Priority 3: Memory (lost on reload)
  ├─ React state in useRaciState
  ├─ Always available during session
  ├─ No persistence
  └─ User work lost if page closes without save

Priority 4: Default Template
  ├─ Template from templates.json
  ├─ Used only if all above fail
  └─ Starting point for new charts
```

---

## ⌨️ Keyboard Navigation Flow

### Navigation Priority Order

```
1. Title Editor
   ↓ Tab
2. Logo Upload
   ↓ Tab
3. Roles Editor (Add input)
   ↓ Tab
4. Roles Editor (List items: edit/delete buttons)
   ↓ Tab
5. Tasks Editor (Add input)
   ↓ Tab
6. Tasks Editor (List items: edit/delete buttons)
   ↓ Tab
7. Theme Selector
   ↓ Tab
8. Reset Button
   ↓ Tab
9. Export Buttons
   ↓ Tab (loops back to 1)
```

### Keyboard Actions

```
Tab
  └─ Move focus to next control

Shift+Tab
  └─ Move focus to previous control

Esc
  ├─ Close edit mode (revert changes)
  ├─ Close confirmation dialogs
  ├─ Close error modals
  └─ Exit inline edit (in RolesEditor/TasksEditor)

Enter
  ├─ Submit form (add role/task)
  ├─ Confirm deletion
  ├─ Save inline edit
  └─ In buttons: same as click

Ctrl+Z / Cmd+Z (prepared for Iteration 3)
  └─ Undo last action

Space (in modals)
  ├─ Activate button (if focused)
  └─ Toggle checkbox (if present)

Arrow Keys (prepared for Iteration 3)
  ├─ Up/Down: Navigate list items
  ├─ Left/Right: In matrix (horizontal navigation)
  └─ In reordering: move item up/down
```

### Focus Management

```
When opening confirmation dialog:
  └─ Set focus to Cancel button (safer default)

When opening error modal:
  └─ Set focus to first error message

When closing dialog:
  └─ Restore focus to button that opened it

Trap focus in modal:
  ├─ Tab from last item loops to first
  ├─ Shift+Tab from first item loops to last
  └─ Escape key also closes modal

Focus Visible Indicator:
  ├─ CSS outline or ring
  ├─ At least 2px
  ├─ 3:1 contrast ratio
  └─ Visible on all interactive elements
```

---

## 🔄 Reducer Action Types

### RaciAction Union Type

```typescript
type RaciAction =
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
  | {
      type: "updateMatrix";
      payload: { matrix: Record<string, Record<string, RaciValue>> };
    }
  | { type: "reset" }
  | { type: "setState"; payload: { chart: RaciChart } };
```

### Reducer Implementation Pattern

```typescript
function raciReducer(state: RaciChart, action: RaciAction): RaciChart {
  switch (action.type) {
    case "addRole": {
      const newRole: RaciRole = {
        id: generateUUID(),
        name: action.payload.name,
        order: state.roles.length,
      };

      return {
        ...state,
        roles: [...state.roles, newRole],
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

    case "reset": {
      return createInitialChart();
    }

    default:
      return state;
  }
}
```

---

## 🎨 Error Handling Strategy

### Error Categories

```
1. Validation Errors
   ├─ User-caused (empty field, duplicate)
   ├─ Show inline in component
   ├─ Not blocking (user can correct)
   └─ Example: "Role name already exists"

2. Storage Errors
   ├─ System-caused (quota exceeded)
   ├─ Silent (not shown to user)
   ├─ Fallback to next storage layer
   └─ User work still in memory

3. Critical Errors
   ├─ Unexpected state (corrupted data)
   ├─ Show error modal
   ├─ Offer recovery option
   └─ Example: "Cannot parse saved data"

4. Network Errors (Iteration 3+)
   ├─ AI/Export service down
   ├─ Show toast notification
   ├─ Graceful degradation
   └─ Example: "AI unavailable, using template"
```

### Error Recovery

```
Validation Error:
  └─ Show inline error message
  └─ Keep form open
  └─ User fixes and retries

Storage Error:
  └─ Try next storage layer silently
  └─ If all fail: data only in memory
  └─ User warned on reload if edits not saved

Critical Error:
  ├─ Show error modal
  ├─ Offer "Try Again" or "Clear & Start Over"
  └─ If "Try Again": reload chart from storage
  └─ If "Clear": use default template
```

---

## 🚀 Integration Checklist

### By End of Iteration 2

✅ State management working (add/edit/delete/reorder)  
✅ Auto-save to localStorage  
✅ Validation real-time with error messages  
✅ All components integrated with state  
✅ Keyboard navigation functional  
✅ Focus management correct  
✅ Error modal showing errors  
✅ Page reload preserves state  
✅ No TypeScript errors  
✅ No console errors

### Ready for Iteration 3

✅ Solid state foundation  
✅ Reliable persistence  
✅ Trustworthy validation  
✅ Good UX (keyboard nav, error handling)

---

**Date Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Version**: 2.0.0
