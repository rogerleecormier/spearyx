# Iteration 4: Architecture & Design Decisions

**Status:** ✅ Complete  
**Last Updated:** 2024

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Component Hierarchy](#component-hierarchy)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Template System](#template-system)
7. [Preset System](#preset-system)
8. [Persistence Layer](#persistence-layer)
9. [Design Decisions](#design-decisions)
10. [Performance Considerations](#performance-considerations)

---

## Overview

**Goal:** Enable rapid RACI chart creation through templates, quick presets, and custom preset management.

**Scope:**

- Demo template loading (3 pre-configured templates)
- Quick preset patterns (6 common RACI assignment styles)
- Custom preset persistence (localStorage-based)
- Template validation and error handling

**Integration:** Builds on Iteration 3's matrix editor and keyboard navigation

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     RACI Generator Page                         │
│  (RaciGeneratorPage.tsx - Main orchestrator)                   │
└──────────────────────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────────┐
    │            │            │                 │
    ▼            ▼            ▼                 ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────────┐
│  Template   │ │ Quick    │ │ Preset       │ │ RaciMatrix  │
│  Selector   │ │ Presets  │ │ Manager      │ │ Editor      │
└─────────────┘ └──────────┘ └──────────────┘ └─────────────┘
    │                │              │              │
    └────────────────┴──────────────┴──────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │   useRaciState Hook      │
        │ (State + Callbacks)      │
        └──────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌──────────────┐      ┌──────────────┐
    │ raciReducer  │      │  Persistence │
    │              │      │  (localStorage│
    │              │      │   + IndexedDB)
    └──────────────┘      └──────────────┘
                │
                ▼
        ┌──────────────────┐
        │  RaciChart State │
        │  (Immutable)     │
        └──────────────────┘
```

### Key Components

| Component         | Purpose                                          | Status                  |
| ----------------- | ------------------------------------------------ | ----------------------- |
| RaciGeneratorPage | Main orchestrator, integrates all components     | ✅ Integration Complete |
| TemplateSelector  | Displays and loads demo templates                | ✅ Complete             |
| QuickPresets      | Applies preset patterns to existing chart        | ✅ Complete             |
| PresetManager     | Saves/loads custom presets                       | ✅ Complete             |
| templates.ts      | Template utilities and pattern generators        | ✅ Complete             |
| state.ts          | Reducer with new loadTemplate/loadPreset actions | ✅ Enhanced             |
| hooks.ts          | useRaciState with new callbacks                  | ✅ Enhanced             |

---

## Component Hierarchy

```
RaciGeneratorPage (State orchestrator)
├── Header
│   ├── Title
│   ├── Status Indicators
│   └── Auto-save Status
├── Left Sidebar (sticky)
│   ├── TemplateSelector (NEW)
│   │   └── Template Grid + Preview
│   ├── QuickPresets (NEW)
│   │   └── Pattern Selection + Apply
│   ├── PresetManager (NEW)
│   │   ├── Save Form
│   │   └── Preset List
│   ├── Chart Details
│   ├── Description
│   ├── Roles Editor
│   ├── Tasks Editor
│   ├── Theme Selector + Export
│   └── Reset Controls
└── Right Content
    ├── Matrix Section
    │   └── RaciMatrixEditor
    └── Tips Card
```

---

## Data Flow

### 1. Template Loading Flow

```
User clicks "Load Template"
        ↓
TemplateSelector.onLoadTemplate(template)
        ↓
RaciGeneratorPage.handleLoadTemplate(template)
        ↓
loadTemplateUtil(template) → creates new chart with template data
        ↓
loadTemplate(roles, tasks, matrix, title?, description?)
        ↓
Dispatch "loadTemplate" action to reducer
        ↓
raciReducer updates state with new roles/tasks/matrix
        ↓
useAutoSave triggers → saves to localStorage
        ↓
RaciMatrixEditor re-renders with new matrix
```

### 2. Quick Preset Flow

```
User selects pattern + clicks "Apply Preset"
        ↓
QuickPresets.onApplyPreset(matrix)
        ↓
RaciGeneratorPage.handleApplyPreset(matrix)
        ↓
loadPreset(matrix)
        ↓
Dispatch "loadPreset" action to reducer
        ↓
raciReducer updates matrix only (keeps roles/tasks)
        ↓
useAutoSave triggers
        ↓
RaciMatrixEditor updates with new assignments
```

### 3. Custom Preset Save Flow

```
User fills form + clicks "Save Preset"
        ↓
PresetManager.handleSavePreset()
        ↓
saveCustomPreset({ name, description, matrix })
        ↓
Generate ID + timestamps
        ↓
localStorage.setItem("raci_custom_presets", JSON.stringify([...]))
        ↓
Preset added to local state
        ↓
List updates to show new preset
```

### 4. Custom Preset Load Flow

```
User clicks "Load" on saved preset
        ↓
PresetManager.handleLoadPreset(preset)
        ↓
RaciGeneratorPage.handleLoadPreset(preset.matrix)
        ↓
loadPreset(preset.matrix)
        ↓
Same as Quick Preset flow →
```

---

## State Management

### Reducer Actions (New in Iteration 4)

#### loadTemplate Action

```typescript
type: "loadTemplate"
payload: {
  roles: RaciRole[],
  tasks: RaciTask[],
  matrix: Record<string, Record<string, RaciValue>>,
  title?: string,
  description?: string
}

// Effect on state:
- Replaces roles completely
- Replaces tasks completely
- Replaces matrix completely
- Updates title and description if provided
- Sets updatedAt timestamp
```

#### loadPreset Action

```typescript
type: "loadPreset"
payload: {
  matrix: Record<string, Record<string, RaciValue>>
}

// Effect on state:
- Merges new matrix values (preserves existing assignments)
- Keeps roles, tasks, title, description unchanged
- Sets updatedAt timestamp
- Does NOT reset validation
```

### Hook Callbacks (Enhanced)

```typescript
const {
  // Existing callbacks
  addRole, editRole, deleteRole, reorderRoles,
  addTask, editTask, deleteTask, reorderTasks,
  updateTitle, updateLogo, updateDescription,
  updateMatrix, updateTheme, reset, setState,

  // NEW callbacks
  loadTemplate: (roles, tasks, matrix, title?, desc?) => void,
  loadPreset: (matrix) => void
} = useRaciState()
```

---

## Template System

### Architecture

```
/src/config/templates.json (Config)
        ↓
getTemplates() → RaciTemplate[]
getTemplateById(id) → RaciTemplate | null
validateTemplate(template) → { isValid, errors }
        ↓
loadTemplate(template, partial) → RaciChart
        ↓
RaciGeneratorPage.handleLoadTemplate()
        ↓
State updated via loadTemplate reducer action
```

### Template Structure

```typescript
interface RaciTemplate {
  id: string; // Unique identifier
  name: string; // Display name
  description: string; // What this template is for
  roles: RaciRole[]; // Pre-configured roles
  tasks: RaciTask[]; // Pre-configured tasks
  matrix: RaciChart["matrix"]; // Pre-filled assignments
}
```

### Demo Templates (in templates.json)

1. **mobile-app**
   - 5 roles (PM, Backend, Frontend, QA, Designer)
   - 5 tasks (Requirements, Architecture, Implementation, Testing, Deployment)
   - Example: PM = Accountable for Requirements & Deployment

2. **web-redesign**
   - 5 roles (Marketing Lead, Design Lead, Frontend Dev, Content, PM)
   - 4 tasks (Strategy, Design, Development, Content, Launch)
   - Example: Design Lead = Accountable for Design

3. **crm-migration**
   - 6 roles (CIO, Systems Architect, BA, Dev Lead, Migration Lead, Support)
   - 5 tasks (Planning, Design, Development, Testing, Deployment)
   - Example: CIO = Accountable for Planning

---

## Preset System

### Quick Preset Architecture

```
getQuickPresets() → QUICK_PRESETS object
        ↓
QUICK_PRESETS[key](roleIds, taskIds) → matrix
        ↓
RaciMatrixEditor updates
```

### Available Patterns

1. **allResponsible(roleIds, taskIds)**
   - All cells = "R"
   - Use: Highly collaborative tasks

2. **allAccountable(roleIds, taskIds)**
   - All cells = "A"
   - Use: Full accountability

3. **oneAccountablePerTask(roleIds, taskIds)**
   - Rotates accountable role per task
   - Others get R or C based on position
   - Use: Clear single owner pattern

4. **leaderAccountable(roleIds, taskIds)**
   - First role (CEO/Lead) = "A" all tasks
   - Second role = "R" all tasks
   - Others = "C"
   - Use: Hierarchical structures

5. **distributed(roleIds, taskIds)**
   - Each role gets accountability for N tasks
   - Distributed fairly
   - Use: Load balancing

6. **executionModel(roleIds, taskIds)**
   - Role 0 = "R", Role 1 = "A", others = "C"/"I"
   - Use: Strict RACI principles

### Custom Preset Architecture

```
// localStorage structure
localStorage["raci_custom_presets"] = [
  {
    id: "preset-<timestamp>-<random>",
    name: string,
    description: string,
    matrix: RaciChart["matrix"],
    createdAt: ISO8601,
    updatedAt: ISO8601
  },
  ...
]

// Operations
getCustomPresets() → RaciPreset[]
saveCustomPreset(preset) → RaciPreset
updateCustomPreset(id, updates) → RaciPreset | null
deleteCustomPreset(id) → boolean
```

---

## Persistence Layer

### Storage Strategy

```
                    Try localStorage
                            ↓
                    Success? ─ Yes → Use it
                            │
                            No
                            ↓
                    Try IndexedDB
                            ↓
                    Success? ─ Yes → Use it
                            │
                            No
                            ↓
                    Silent fail (data in memory)
```

### Scope

- **Chart State:** Persisted via existing useAutoSave (5-second debounce)
- **Custom Presets:** Stored in `localStorage["raci_custom_presets"]`
- **Per-domain:** Presets are domain-specific (localhost:3000 ≠ localhost:3001)

### Data Size Considerations

- **Single preset:** ~500 bytes (typical)
- **10 presets:** ~5 KB
- **localStorage quota:** 5-10 MB per domain (plenty of space)

---

## Design Decisions

### 1. Why Separate Components?

**Decision:** Three separate components (TemplateSelector, QuickPresets, PresetManager)

**Rationale:**

- Clear separation of concerns
- Each component has single responsibility
- Easier to test and maintain
- Reusable patterns
- Better TypeScript typing

### 2. Why localStorage for Custom Presets?

**Decision:** Use localStorage instead of server

**Rationale:**

- No server required (static site compatible)
- Instant save/load
- No network latency
- User data stays client-side
- Easy to export/backup
- Works offline

### 3. Why Load Template Replaces Full Chart?

**Decision:** loadTemplate replaces all roles/tasks/matrix

**Alternatives Considered:**

- Merge with existing (would duplicate roles)
- Ask user which to keep (poor UX)
- Only load matrix (loses template context)

**Chosen:** Full replacement because:

- Templates are self-contained
- User typically wants clean slate
- Can merge manually if needed

### 4. Why Load Preset Only Updates Matrix?

**Decision:** loadPreset keeps roles/tasks, only updates matrix

**Rationale:**

- User already has roles/tasks
- Just wants different assignment pattern
- Preserves user customizations
- Faster than reloading template

### 5. Why Pattern Generator Functions?

**Decision:** QUICK_PRESETS uses generator functions, not static templates

**Rationale:**

- Adapts to any number of roles/tasks
- No hardcoded assumptions
- Flexible and composable
- Easy to add new patterns

---

## Performance Considerations

### Render Optimization

```typescript
// TemplateSelector
- Memoizes template list (getTemplates called once)
- useCallback for onLoadTemplate
- Conditional rendering of preview

// QuickPresets
- Disabled state when no roles/tasks
- useCallback for handlers
- No expensive computations

// PresetManager
- useEffect loads presets on mount only
- Debounced localStorage access
- Scrollable list for many presets
```

### Memory Usage

- **Template loading:** Creates new chart object (~1-2 KB)
- **Preset patterns:** Generated on-demand (~500 bytes each)
- **Custom presets:** Loaded once on mount (~100 bytes per preset)

### localStorage Impact

- **Read:** ~1 ms (negligible)
- **Write:** ~10 ms (debounced)
- **Parse/stringify:** ~5 ms for typical preset list

**Total impact:** Imperceptible to user

---

## Error Handling

### Template Loading Errors

```typescript
try {
  const newChart = loadTemplateUtil(template)
  loadTemplate(...)
} catch (error) {
  console.error("Failed to load template:", error)
  // Chart state remains unchanged
  // User sees "Failed to load template" message
}
```

### Preset Save Errors

```typescript
try {
  const preset = saveCustomPreset({...})
  // Update UI
} catch (error) {
  console.error("Failed to save preset:", error)
  alert("Failed to save preset")
  // Preset not added to state
}
```

### localStorage Full

```typescript
if (localStorage.setItem fails) {
  // Try to delete old presets
  // If still fails, show user message
  // Continue without saving
}
```

---

## Type Safety

### TypeScript Definitions

```typescript
// From types/raci.ts
export type RaciAction =
  | { type: "loadTemplate", payload: {...} }
  | { type: "loadPreset", payload: {...} }
  | // ... other actions

// From lib/raci/templates.ts
export interface RaciTemplate {
  id: string,
  name: string,
  description: string,
  roles: RaciRole[],
  tasks: RaciTask[],
  matrix: RaciChart["matrix"]
}

export interface RaciPreset {
  id: string,
  name: string,
  description: string,
  matrix: RaciChart["matrix"],
  createdAt: string,
  updatedAt: string
}
```

### Validation

```typescript
// Template validation
validateTemplate(template) → {
  isValid: boolean,
  errors: string[]  // [
                    //   "Template must have roles",
                    //   "Role 'xyz' not found in roles list"
                    // ]
}

// Pattern validation
- roleIds length > 0
- taskIds length > 0
- No null roleIds
- No null taskIds
```

---

## Testing Strategy

### Unit Tests (Recommended)

1. **templates.ts functions**
   - getTemplates() returns 3 items
   - getTemplateById() finds template
   - validateTemplate() catches errors
   - loadTemplate() creates valid chart
   - QUICK_PRESETS generators create valid matrices

2. **Reducer actions**
   - loadTemplate updates state correctly
   - loadPreset updates only matrix
   - Existing actions unaffected

3. **Component rendering**
   - TemplateSelector displays all 3 templates
   - QuickPresets disabled without roles/tasks
   - PresetManager shows empty state

### Integration Tests

1. **Template to Matrix flow**
   - User loads template → matrix updates

2. **Preset save/load flow**
   - Save preset → appears in list → load → updates matrix

3. **localStorage persistence**
   - Save preset → refresh page → preset still there

---

## Browser Support

| Feature        | Chrome | Firefox | Safari | Edge | IE 11 |
| -------------- | ------ | ------- | ------ | ---- | ----- |
| Templates      | ✅     | ✅      | ✅     | ✅   | ❌    |
| Quick Presets  | ✅     | ✅      | ✅     | ✅   | ❌    |
| Custom Presets | ✅     | ✅      | ✅     | ✅   | ⚠️    |
| localStorage   | ✅     | ✅      | ✅     | ✅   | ✅    |

**Note:** IE 11 not supported due to modern JavaScript features (const, arrow functions, template literals)

---

## Future Enhancements

1. **Cloud Presets** – Save presets to server
2. **Preset Sharing** – Share presets via URL
3. **Template Builder** – UI to create custom templates
4. **Preset Import/Export** – Download/upload preset files
5. **Template Categories** – Organize templates by industry
6. **AI Suggestions** – Suggest preset based on roles/tasks

---

## Related Files

- `src/config/templates.json` – Demo templates
- `src/lib/raci/templates.ts` – Core utilities
- `src/components/raci/TemplateSelector.tsx` – Component
- `src/components/raci/QuickPresets.tsx` – Component
- `src/components/raci/PresetManager.tsx` – Component
- `src/components/raci/RaciGeneratorPage.tsx` – Integration
- `src/types/raci.ts` – Updated type definitions

---

**Next:** Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for complete API documentation.
