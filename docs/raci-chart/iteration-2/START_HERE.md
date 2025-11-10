# 🎯 Iteration 2: Editors & State Management – START HERE

**Status**: 🚀 READY TO START  
**Date**: 2025-11-10  
**Version**: 2.0.0  
**Duration**: Week 2 (estimated 1 week)

---

## 🚀 Quick Start (2 minutes)

### What You'll Build
Transform the Iteration 1 component shells into **fully functional editors** with real-time validation and state management.

```bash
# Continue from Iteration 1 dev server
cd /home/rogerleecormier/Development/spearyx
pnpm run dev

# Visit in browser (same URL as before)
http://localhost:3000/tools/raci-generator
```

After Iteration 2, you'll see:
- ✅ **Editable title** with live updates
- ✅ **Logo upload** with preview
- ✅ **CRUD Roles editor** (Add/Edit/Delete/Reorder)
- ✅ **CRUD Tasks editor** (Add/Edit/Delete/Reorder, multi-line descriptions)
- ✅ **Real-time validation** with error feedback
- ✅ **State management** (hooks + localStorage persistence)
- ✅ **Keyboard navigation** (Tab, Shift+Tab, Esc, etc.)

---

## 📦 What You're Building

### 6 New/Enhanced Components
1. **RaciHeaderBar** - Title + Logo editor (ENHANCED)
2. **RolesEditor** - CRUD roles with reordering (NEW)
3. **TasksEditor** - CRUD tasks with multi-line descriptions (NEW)
4. **ErrorModal** - Error display & recovery (ENHANCED)
5. **ResetControls** - State reset with confirmation (ENHANCED)
6. **RaciGeneratorPage** - State integration (ENHANCED)

### 4 New Hooks/Utils
1. **useRaciState** - Central state management hook
2. **useAutoSave** - Auto-save to localStorage with debounce
3. **useValidation** - Real-time validation logic
4. **useKeyboardNav** - Keyboard navigation utilities

### 3 New Utility Modules
1. **lib/raci/state.ts** - State reducer and initialization
2. **lib/raci/validation.ts** - Validation logic and error messages
3. **lib/raci/persistence.ts** - LocalStorage + IndexedDB helpers

### ~800 Lines of Code
```
✅ Components: 300+ lines (handlers, event listeners)
✅ Hooks: 250+ lines (state, persistence, validation)
✅ Utils: 250+ lines (validation, encoding, error handling)
```

---

## 🎯 Main Objectives

### 1. Title Editor
- [ ] Editable text field in `RaciHeaderBar`
- [ ] Real-time state updates
- [ ] Auto-save to localStorage
- [ ] Character limit validation (max 100 chars)

### 2. Logo Upload
- [ ] File input (PNG, JPG, SVG)
- [ ] Size validation (max 5MB)
- [ ] Image preview
- [ ] Base64 encoding for state storage
- [ ] Error handling (unsupported types, size exceeded)

### 3. Roles Editor (CRUD)
- [ ] **Add**: Input field + "Add Role" button
- [ ] **View**: List of roles with display names
- [ ] **Edit**: Inline edit mode for each role
- [ ] **Delete**: Confirmation dialog before removing
- [ ] **Reorder**: Drag-and-drop or arrow buttons
- [ ] **Validation**: No duplicate names (case-insensitive), required fields

### 4. Tasks Editor (CRUD)
- [ ] **Add**: Input field + "Add Task" button
- [ ] **View**: List of tasks with descriptions
- [ ] **Edit**: Inline edit mode (multi-line textarea)
- [ ] **Delete**: Confirmation dialog before removing
- [ ] **Reorder**: Drag-and-drop or arrow buttons
- [ ] **Validation**: No duplicate names, required fields, max 500 chars per task

### 5. State Management
- [ ] Create `useRaciState` hook with reducer pattern
- [ ] Actions: `addRole`, `editRole`, `deleteRole`, `reorderRoles`, etc.
- [ ] Store chart state in React Context or custom hook
- [ ] Auto-save state to localStorage every 5 seconds
- [ ] Load persisted state on page load (with version check)

### 6. Validation Layer
- [ ] Real-time validation for each field
- [ ] Display inline error messages
- [ ] Disable/enable export buttons based on validation state
- [ ] Block form submission on validation errors
- [ ] Provide helpful error recovery suggestions

### 7. Keyboard Navigation
- [ ] Tab through editors in logical order
- [ ] Shift+Tab to navigate backward
- [ ] Esc to close delete confirmation dialogs
- [ ] Ctrl+Z / Cmd+Z for undo (prepared for Iteration 3)
- [ ] Enter to submit inline edits

---

## 🎨 Implementation Order

### Phase 1: State Management (Day 1)
1. Define `RaciChart` and related types in `types/raci.ts` (if not done)
2. Create `lib/raci/state.ts` with reducer pattern
3. Create `useRaciState` hook in a new file
4. Create `lib/raci/persistence.ts` for localStorage helpers

### Phase 2: Validation (Day 1-2)
1. Create `lib/raci/validation.ts` with all validation functions
2. Create `useValidation` hook
3. Add error types to `types/raci.ts`

### Phase 3: Component Implementation (Day 2-4)
1. **RaciHeaderBar**: Title editor + logo upload
2. **RolesEditor**: Full CRUD with validation
3. **TasksEditor**: Full CRUD with validation
4. **ErrorModal**: Error display with recovery actions
5. **ResetControls**: Reset with confirmation

### Phase 4: Integration & Testing (Day 5)
1. Connect all components to `useRaciState`
2. Wire up localStorage persistence
3. Test keyboard navigation
4. Test validation feedback
5. Test mobile responsiveness

---

## 📋 Acceptance Criteria

### Feature Completeness
- [ ] All CRUD operations work without errors
- [ ] State persists across page reloads
- [ ] Validation errors display clearly
- [ ] Export buttons respect validation state

### User Experience
- [ ] Keyboard navigation is smooth and intuitive
- [ ] Touch targets are ≥48px on mobile
- [ ] Error messages are helpful and actionable
- [ ] Loading states (auto-save) provide feedback

### Code Quality
- [ ] All TypeScript types are strict (no `any`)
- [ ] Components are pure functions where possible
- [ ] Hooks follow React best practices
- [ ] No console errors or warnings

### Accessibility
- [ ] WCAG 2.1 AA compliance for all components
- [ ] ARIA labels on all form inputs
- [ ] Live regions for validation errors
- [ ] Focus management in dialogs

### Performance
- [ ] Auto-save debounced (5s minimum between saves)
- [ ] No unnecessary re-renders
- [ ] Large role/task lists performant (100+ items)

---

## 🔧 Tech Stack & Tools

### Required Libraries (already installed)
- **React 18** - Components & hooks
- **TanStack Start** - SSR routing
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Form components
- **React Hot Toast** - Notifications (optional for Iteration 2)

### Optional Libraries (for consideration)
- **React DnD** or **React Beautiful DnD** - Drag-and-drop reordering
- **Zustand** or **Jotai** - State management (if needed)
- **Zod** - Schema validation

---

## 📚 Documentation Files

1. **START_HERE.md** (this file) – Overview & quick start
2. **INDEX.md** – Navigation hub for all Iteration 2 docs
3. **ITERATION_2_SUMMARY.md** – Complete deliverables & status
4. **COMPLETION_CHECKLIST.md** – Verification checklist
5. **ARCHITECTURE.md** – System diagrams & data flows
6. **COMPONENT_STRUCTURE.md** – Component hierarchy & props
7. **QUICK_REFERENCE.md** – Quick lookup guide
8. **DELIVERABLES.md** – Feature matrix
9. **README.md** – Comprehensive overview
10. **This file** – Getting started

---

## 🎯 Success Metrics

### By End of Iteration 2, You Should Have:
✅ Fully functional CRUD editors for roles and tasks  
✅ Real-time validation with helpful error messages  
✅ State management hook that persists to localStorage  
✅ Keyboard navigation support (Tab, Shift+Tab, Esc)  
✅ Logo upload with preview  
✅ Title editor with live updates  
✅ All Iteration 1 components enhanced with handlers  
✅ 0 console errors or warnings  

---

## 🚀 Next Steps

1. **Read [INDEX.md](./INDEX.md)** – Understand doc structure
2. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** – Understand data flow
3. **Read [COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md)** – Component details
4. **Start with Phase 1** – Build state management foundation
5. **Implement incrementally** – Test each component as you build

---

## ⚠️ Common Pitfalls to Avoid

### 1. **State Not Persisting**
- ❌ Forgetting to call localStorage on state changes
- ✅ Use auto-save hook with debounce

### 2. **Infinite Re-renders**
- ❌ Passing inline objects as dependencies
- ✅ Use `useCallback` and `useMemo` wisely

### 3. **Keyboard Navigation Not Working**
- ❌ Not stopping event propagation in handlers
- ✅ Always call `e.stopPropagation()` when needed

### 4. **Validation Logic Scattered**
- ❌ Mixing validation in components
- ✅ Centralize in `lib/raci/validation.ts`

### 5. **TypeScript Issues**
- ❌ Using `any` types
- ✅ Define proper interfaces first

---

## 📞 Quick Reference

### File Paths
- Components: `src/components/raci/`
- Hooks: `src/lib/raci/`
- Types: `src/types/raci.ts`
- Styles: `src/styles/raci.css`

### Key Types (define in `types/raci.ts`)
```typescript
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
}

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
```

---

## ✅ Ready to Begin?

1. ✅ Directory structure created
2. ✅ Documentation framework in place
3. ✅ Requirements clearly defined
4. ✅ You have all the tools you need

**Next**: Read [INDEX.md](./INDEX.md) → [ARCHITECTURE.md](./ARCHITECTURE.md) → Start coding!

---

**Date Created**: 2025-11-10  
**Last Updated**: 2025-11-10  
**Version**: 2.0.0
