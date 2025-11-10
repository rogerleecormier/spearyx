# Iteration 2: Editors & State Management – Summary

**Version**: 2.0.0  
**Date**: 2025-11-10  
**Status**: 🚀 READY TO START  
**Duration**: 1 week (estimated)  
**Dependencies**: Iteration 1 (Complete)

---

## 📊 Executive Summary

Iteration 2 transforms the Iteration 1 component shells into **fully functional CRUD editors** with real-time validation and state persistence. This iteration focuses on **editor logic**, **state management**, and **user interaction**, laying the groundwork for the RACI matrix implementation in Iteration 3.

### Key Outcomes

✅ All CRUD operations (Add/Edit/Delete/Reorder)  
✅ Real-time validation with error feedback  
✅ State management hook with localStorage persistence  
✅ Keyboard navigation support  
✅ Logo upload with preview  
✅ Title editor with live updates

---

## 📋 Deliverables Breakdown

### 1. Enhanced Components (6 total)

#### RaciHeaderBar (ENHANCED)

**Purpose**: Title editor + Logo upload  
**Status**: To be implemented

**Features**:

- [ ] Editable title field (max 100 chars)
- [ ] Real-time character counter
- [ ] Logo file input (PNG, JPG, SVG)
- [ ] Image preview (max 5MB)
- [ ] Base64 encoding/decoding
- [ ] Error handling (file type, size)
- [ ] Accessibility: ARIA labels, keyboard focus

**Props**:

```typescript
interface RaciHeaderBarProps {
  title: string;
  logo?: string; // Base64
  onTitleChange: (title: string) => void;
  onLogoChange: (logo: string) => void;
  validation: ValidationResult;
}
```

**Lines of Code**: ~150 lines

---

#### RolesEditor (NEW)

**Purpose**: CRUD operations for roles  
**Status**: To be implemented

**Features**:

- [ ] Add role form (input + button)
- [ ] Editable list of roles
- [ ] Inline edit mode (double-click or edit button)
- [ ] Delete confirmation dialog
- [ ] Reorder (drag-and-drop or arrow buttons)
- [ ] Validation (no duplicates, required)
- [ ] Empty state message
- [ ] Keyboard navigation (Tab, Shift+Tab, Esc)

**Props**:

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

**Lines of Code**: ~250 lines

---

#### TasksEditor (NEW)

**Purpose**: CRUD operations for tasks  
**Status**: To be implemented

**Features**:

- [ ] Add task form (inputs + button)
- [ ] Editable list of tasks with descriptions
- [ ] Inline edit mode (multi-line textarea)
- [ ] Delete confirmation dialog
- [ ] Reorder (drag-and-drop or arrow buttons)
- [ ] Validation (no duplicates, required, max 500 chars)
- [ ] Empty state message
- [ ] Keyboard navigation (Tab, Shift+Tab, Esc)

**Props**:

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

**Lines of Code**: ~280 lines

---

#### ErrorModal (ENHANCED)

**Purpose**: Display validation errors and recovery options  
**Status**: To be implemented

**Features**:

- [ ] Error title and description
- [ ] Error list (multiple errors)
- [ ] Recovery suggestions
- [ ] "Got it" dismiss button
- [ ] Esc key to close
- [ ] Trap focus (accessible modal)
- [ ] ARIA attributes

**Props**:

```typescript
interface ErrorModalProps {
  isOpen: boolean;
  errors: ValidationError[];
  onDismiss: () => void;
  recoveryAction?: () => void;
}
```

**Lines of Code**: ~100 lines

---

#### ResetControls (ENHANCED)

**Purpose**: Reset chart with confirmation  
**Status**: To be implemented

**Features**:

- [ ] Reset button
- [ ] Confirmation dialog
- [ ] Cancel/Confirm options
- [ ] Clear state on confirm
- [ ] Undo capability prepared for Iteration 3
- [ ] Keyboard navigation

**Props**:

```typescript
interface ResetControlsProps {
  onReset: () => void;
  onCancel: () => void;
}
```

**Lines of Code**: ~80 lines

---

#### RaciGeneratorPage (ENHANCED)

**Purpose**: Main component integrating state management  
**Status**: To be implemented

**Features**:

- [ ] Initialize state from localStorage
- [ ] Connect all sub-components
- [ ] Manage validation state
- [ ] Handle error modal display
- [ ] Keyboard shortcuts (Ctrl+Z for undo - prepared)
- [ ] Global error boundary

**Lines of Code**: ~150 lines

---

### 2. New Hooks (4 total)

#### useRaciState

**Purpose**: Central state management hook  
**Status**: To be implemented

**Features**:

- [ ] Reducer pattern for state management
- [ ] Actions: `addRole`, `editRole`, `deleteRole`, `reorderRoles`
- [ ] Actions: `addTask`, `editTask`, `deleteTask`, `reorderTasks`
- [ ] Actions: `updateTitle`, `updateLogo`, `reset`
- [ ] State initialization with default template
- [ ] Immutable state updates
- [ ] Consistent action patterns

**Hook Signature**:

```typescript
function useRaciState(initialChart?: RaciChart): {
  state: RaciChart;
  dispatch: (action: RaciAction) => void;
  // Convenience methods:
  addRole: (name: string) => void;
  editRole: (id: string, name: string) => void;
  deleteRole: (id: string) => void;
  // ... etc for tasks, title, logo
};
```

**Lines of Code**: ~200 lines

---

#### useAutoSave

**Purpose**: Auto-save to localStorage with debounce  
**Status**: To be implemented

**Features**:

- [ ] Debounced save (5 second delay)
- [ ] Detects state changes
- [ ] Stores in localStorage
- [ ] Loads persisted state on mount
- [ ] Version checking for backwards compatibility
- [ ] IndexedDB fallback if localStorage full
- [ ] Silent failures (user doesn't see errors)

**Hook Signature**:

```typescript
function useAutoSave(
  chart: RaciChart,
  key: string = "raciChart"
): {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
};
```

**Lines of Code**: ~120 lines

---

#### useValidation

**Purpose**: Real-time validation of chart state  
**Status**: To be implemented

**Features**:

- [ ] Validates roles (unique names, required)
- [ ] Validates tasks (unique names, required, max length)
- [ ] Validates title (required, max 100 chars)
- [ ] Validates logo (file size, type)
- [ ] Returns validation result object
- [ ] Generates helpful error messages
- [ ] Real-time updates as state changes

**Hook Signature**:

```typescript
function useValidation(chart: RaciChart): ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  getFieldError: (field: string) => ValidationError | undefined;
}
```

**Lines of Code**: ~150 lines

---

#### useKeyboardNav

**Purpose**: Keyboard navigation utilities  
**Status**: To be implemented (prepared, full implementation in Iteration 3)

**Features**:

- [ ] Tab/Shift+Tab navigation
- [ ] Esc to close modals/dialogs
- [ ] Enter to submit forms
- [ ] Arrow keys for list navigation (prepared for Iteration 3)
- [ ] Ctrl+Z / Cmd+Z for undo (prepared for Iteration 3)
- [ ] Visual focus indicators
- [ ] Accessibility announcements

**Hook Signature**:

```typescript
function useKeyboardNav(options?: KeyboardNavOptions): {
  handleEsc: (callback: () => void) => (e: KeyboardEvent) => void;
  handleEnter: (callback: () => void) => (e: KeyboardEvent) => void;
  // ... etc
};
```

**Lines of Code**: ~100 lines (basic), ~200 lines (full)

---

### 3. New Utility Modules (3 total)

#### lib/raci/state.ts

**Purpose**: State management reducer and initialization  
**Status**: To be implemented

**Exports**:

- [ ] `RaciAction` type (union of all actions)
- [ ] `RaciReducer` function
- [ ] `createInitialChart()` function
- [ ] `validateChart()` function (basic)
- [ ] `mergeCharts()` function (for undo)

**Lines of Code**: ~150 lines

---

#### lib/raci/validation.ts

**Purpose**: Validation logic and error messages  
**Status**: To be implemented

**Exports**:

- [ ] `validateRole()` - Single role validation
- [ ] `validateTask()` - Single task validation
- [ ] `validateTitle()` - Title validation
- [ ] `validateLogo()` - Logo file validation
- [ ] `validateChart()` - Full chart validation
- [ ] `getErrorMessage()` - Localized error text
- [ ] Error codes enum

**Lines of Code**: ~200 lines

---

#### lib/raci/persistence.ts

**Purpose**: LocalStorage and IndexedDB helpers  
**Status**: To be implemented

**Exports**:

- [ ] `saveToLocalStorage()` - Save chart
- [ ] `loadFromLocalStorage()` - Load chart with version check
- [ ] `clearLocalStorage()` - Clear all RACI data
- [ ] `saveToIndexedDB()` - Fallback storage
- [ ] `loadFromIndexedDB()` - Fallback load
- [ ] `getStorageSize()` - Check available space

**Lines of Code**: ~150 lines

---

### 4. Type Definitions

**Enhancements to `types/raci.ts`**:

- [ ] `ValidationResult` interface
- [ ] `ValidationError` interface
- [ ] `ValidationWarning` interface
- [ ] `RaciAction` union type
- [ ] `RaciState` interface
- [ ] Keyboard event types
- [ ] Error code enum

**Lines of Code**: ~100 lines (new)

---

## 📈 Code Statistics

### Total New Code

- **Components**: ~860 lines
- **Hooks**: ~570 lines
- **Utilities**: ~500 lines
- **Types**: ~100 lines
- **Total**: ~2,030 lines

### Breaking Down by Component

```
RaciHeaderBar:         ~150 lines
RolesEditor:           ~250 lines
TasksEditor:           ~280 lines
ErrorModal:            ~100 lines
ResetControls:         ~80 lines
RaciGeneratorPage:     ~150 lines
Subtotal Components:   ~860 lines

useRaciState:          ~200 lines
useAutoSave:           ~120 lines
useValidation:         ~150 lines
useKeyboardNav:        ~100 lines
Subtotal Hooks:        ~570 lines

lib/raci/state.ts:     ~150 lines
lib/raci/validation.ts: ~200 lines
lib/raci/persistence.ts: ~150 lines
Subtotal Utils:        ~500 lines

types/raci.ts (new):   ~100 lines

TOTAL:                 ~2,030 lines
```

---

## ✅ Feature Checklist

### Phase 1: State Management

- [ ] Create `lib/raci/state.ts` with reducer
- [ ] Create `useRaciState` hook
- [ ] Create `lib/raci/persistence.ts`
- [ ] Test state initialization and persistence

### Phase 2: Validation

- [ ] Create `lib/raci/validation.ts`
- [ ] Create `useValidation` hook
- [ ] Create validation error types
- [ ] Test all validation scenarios

### Phase 3: Components

- [ ] Implement RaciHeaderBar (title + logo)
- [ ] Implement RolesEditor (CRUD)
- [ ] Implement TasksEditor (CRUD)
- [ ] Implement ErrorModal
- [ ] Implement ResetControls
- [ ] Integrate RaciGeneratorPage

### Phase 4: Keyboard Navigation & Polish

- [ ] Create `useKeyboardNav` hook
- [ ] Test Tab/Shift+Tab navigation
- [ ] Test Esc key functionality
- [ ] Test Enter key submission
- [ ] Test on mobile (touch)

### Phase 5: Testing & QA

- [ ] Verify all CRUD operations
- [ ] Test state persistence
- [ ] Test validation feedback
- [ ] Test keyboard navigation
- [ ] Test accessibility (WCAG 2.1 AA)
- [ ] Test on multiple browsers/devices

---

## 🎯 Success Criteria

### Feature Completeness

- [x] State management hook working
- [x] Persistence to localStorage
- [x] All CRUD operations functional
- [x] Real-time validation
- [x] Keyboard navigation

### Code Quality

- [x] 0 TypeScript errors
- [x] 0 console errors/warnings
- [x] All functions have JSDoc comments
- [x] All components have proper prop types
- [x] No `any` types used

### User Experience

- [x] Smooth keyboard navigation
- [x] Clear validation error messages
- [x] Visual feedback for all actions
- [x] Auto-save without disruption
- [x] Mobile responsive

### Performance

- [x] No memory leaks
- [x] Efficient re-renders (no unnecessary updates)
- [x] Auto-save debounced (5s minimum)
- [x] Fast state updates (< 100ms)

### Accessibility

- [x] WCAG 2.1 AA compliance
- [x] ARIA labels on all inputs
- [x] Keyboard accessible (no mouse required)
- [x] Screen reader compatible
- [x] High contrast mode supported

---

## 🔗 Dependencies

### On Iteration 1

- Requires: SSR route `/tools/raci-generator`
- Requires: All component shells from Iteration 1
- Requires: TypeScript types from Iteration 1
- Requires: CSS structure from Iteration 1

### External Dependencies

- React 18 (hooks)
- TypeScript
- Tailwind CSS (styling)
- React Hot Toast (optional for notifications)

### Optional Enhancements

- React DnD (for drag-and-drop reordering)
- Zod (for schema validation)
- Zustand (if switching to external state management)

---

## 📊 Testing Checklist

### Unit Tests

- [ ] `validateRole()` with all cases
- [ ] `validateTask()` with all cases
- [ ] `validateChart()` complete validation
- [ ] State reducer all actions
- [ ] Persistence save/load

### Integration Tests

- [ ] RolesEditor CRUD workflow
- [ ] TasksEditor CRUD workflow
- [ ] RaciHeaderBar title + logo
- [ ] State sync across components
- [ ] Persistence on page reload

### E2E Tests

- [ ] Add role → displays → edit → delete
- [ ] Add task → displays → edit → delete
- [ ] Upload logo → preview → remove
- [ ] Edit title → auto-saves → reload
- [ ] Validation errors → user feedback

### Accessibility Tests

- [ ] Tab/Shift+Tab through all fields
- [ ] Esc closes all dialogs
- [ ] Screen reader announces errors
- [ ] Focus visible on all inputs
- [ ] High contrast mode works

### Performance Tests

- [ ] 100+ roles (no lag)
- [ ] 100+ tasks (no lag)
- [ ] Rapid CRUD operations (no delays)
- [ ] Large logo file (< 5MB handled)

---

## 🚀 Next Phase

### Iteration 3: RACI Matrix Editor

After completing Iteration 2, you'll be ready for:

- Interactive color-coded matrix
- Cell toggle logic (R/A/C/I)
- Exclusive cell assignments
- Matrix validation
- Performance optimization for large matrices

### Key Transition Points

- ✅ State management must be solid (all CRUD tested)
- ✅ Validation must be reliable (no false positives)
- ✅ Keyboard navigation foundation in place
- ✅ localStorage persistence confirmed

---

## 📝 Notes

### Implementation Strategy

1. Build state management first (foundation)
2. Build validation (used by components)
3. Build components (use hooks)
4. Integrate keyboard navigation
5. Polish and test

### Common Challenges

- **Challenge**: State not persisting
  - **Solution**: Use `useAutoSave` hook with localStorage
- **Challenge**: Validation feedback unclear
  - **Solution**: Centralize error messages in `validation.ts`
- **Challenge**: Keyboard navigation difficult
  - **Solution**: Use `useKeyboardNav` hook for consistency
- **Challenge**: TypeScript complexity
  - **Solution**: Define types carefully before implementing

### Performance Tips

- Use `useCallback` for event handlers
- Debounce `useAutoSave` (5 second minimum)
- Memoize validation results
- Lazy load components if needed

---

## 📞 Reference

### Key Files to Create

1. `src/components/raci/RaciHeaderBar.tsx` (enhanced)
2. `src/components/raci/RolesEditor.tsx` (new)
3. `src/components/raci/TasksEditor.tsx` (new)
4. `src/components/raci/ErrorModal.tsx` (enhanced)
5. `src/components/raci/ResetControls.tsx` (enhanced)
6. `src/components/raci/RaciGeneratorPage.tsx` (enhanced)
7. `src/lib/raci/state.ts` (new)
8. `src/lib/raci/validation.ts` (new)
9. `src/lib/raci/persistence.ts` (new)
10. Update `src/types/raci.ts` (new types)

### Key Hooks to Create

1. `useRaciState` - State management
2. `useAutoSave` - Persistence
3. `useValidation` - Validation
4. `useKeyboardNav` - Keyboard shortcuts

---

**Date Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Version**: 2.0.0
