# 🏗️ Architecture – System Design

**Version**: 1.0.0  
**Scope**: Iteration 1 Foundation  
**Status**: ✅ COMPLETE

---

## 🎯 Architecture Overview

RACI Chart Generator follows a modular, component-driven architecture with clear separation of concerns. Built with React 18, TypeScript, and TanStack Start for SSR support.

---

## 📐 Component Hierarchy

```
App (TanStack Start)
│
└── Root Layout
    └── Header (with Tools dropdown)
        └── Link: /tools/raci-generator
            │
            └── routes/tools/raci-generator.tsx (SSR Route)
                │
                └── RaciGeneratorPage (Client Boundary)
                    │
                    ├── State: useState(initialState)
                    │
                    ├── RaciEditor (Orchestrator)
                    │   ├── Grid Layout (CSS Grid)
                    │   │
                    │   ├── Left Sidebar
                    │   │   ├── RaciHeaderBar
                    │   │   ├── DescriptionPanel
                    │   │   ├── RolesEditor
                    │   │   ├── TasksEditor
                    │   │   └── ThemeSelector
                    │   │
                    │   └── Main Content
                    │       ├── RaciMatrixEditor
                    │       ├── ExportButtons
                    │       └── ResetControls
                    │
                    ├── UndoButton (Fixed)
                    │
                    ├── ErrorModal (Portal)
                    │
                    └── Toaster (Portal)
                        └── Toast Notifications
```

---

## 🔄 Data Flow Architecture

### Top-Down Props Flow

```typescript
RaciGeneratorPage
  ├── state: RaciSessionState (from useState)
  ├── setState: (state: RaciSessionState) => void
  │
  └── RaciEditor
      ├── props: { state, setState }
      │
      ├── RaciHeaderBar
      │   ├── receives: chart title, logo
      │   └── onChange: title/logo updates
      │
      ├── DescriptionPanel
      │   ├── receives: description text
      │   └── onChange: updates text
      │
      ├── RolesEditor
      │   ├── receives: roles array
      │   └── onChange: role CRUD
      │
      ├── TasksEditor
      │   ├── receives: tasks array
      │   └── onChange: task CRUD
      │
      ├── RaciMatrixEditor
      │   ├── receives: matrix data
      │   └── onChange: cell value updates
      │
      └── ThemeSelector
          ├── receives: active theme
          └── onChange: theme selection
```

### Data Flow Pattern

```
User Action
    ↓
Component Handler (onClick, onChange)
    ↓
Callback Function (onChange, onDelete, etc.)
    ↓
Parent State Update (setState)
    ↓
Props Update (children receive new props)
    ↓
Re-render (only affected components)
```

---

## 📦 Component Responsibilities

### Page Components

**RaciGeneratorPage**

- ✅ Entry point for SSR route
- ✅ State initialization (useState)
- ✅ Client boundary definition
- ✅ Toaster integration
- ✅ Children rendering

### Orchestrator Components

**RaciEditor**

- ✅ Main layout structure (CSS Grid)
- ✅ Child component rendering
- ✅ Props distribution
- ✅ Event delegation
- ✅ Responsive breakpoints

### Input Components

**RaciHeaderBar**

- Title input field
- Logo upload button
- Visual header section

**DescriptionPanel**

- Multi-line description input
- Placeholder text
- Accessible textarea

**RolesEditor**

- Add role button
- Roles list display
- Delete action triggers

**TasksEditor**

- Add task button
- Tasks list display
- Delete action triggers

### Display Components

**RaciMatrixEditor**

- Interactive grid
- Roles × Tasks cells
- Value cycling (R→A→C→I→null)
- Color-coded display
- Click handlers

**ThemeSelector**

- 4-theme dropdown
- Theme preview
- onChange callback

### Control Components

**ExportButtons**

- 5 export format buttons
- Disabled until Iteration 6
- Tooltips with hints

**ResetControls**

- Reset chart button
- Reset theme button
- Confirmation dialogs (future)

**UndoButton**

- Undo button (fixed position)
- Keyboard hint display
- Disabled when stack empty

### Modal Components

**ErrorModal**

- Modal backdrop
- Error message display
- Close button
- Portal rendering

**Toaster**

- Toast notification system
- Multiple toast support
- Auto-dismiss with duration
- Portal rendering

---

## 💾 State Architecture

### RaciSessionState Structure

```typescript
{
  chart: {
    id: string                          // UUID
    version: "1.0.0"
    timestamp: string                   // ISO 8601
    title: string                       // Chart title
    roles: RaciRole[]                   // Role definitions
    tasks: RaciTask[]                   // Task definitions
    matrix: Record<string, Record<string, RaciValue>>  // Role→Task→Value
    theme: string                       // Active theme key
    logo?: string                       // Base64 encoded logo
  },

  undoStack: RaciUndoState[]           // History (LIFO)

  uiState: {
    selectedRoleId?: string             // Currently selected role
    selectedTaskId?: string             // Currently selected task
    editingMode: boolean                // Editing vs viewing
    sidebarOpen: boolean                // Sidebar visibility
    activeTheme: string                 // Current theme
  },

  validation: {
    isValid: boolean                    // Overall validity
    errors: ValidationError[]           // Error list
  },

  notifications: NotificationState[]    // Active toasts
}
```

---

## 🧬 Type System Architecture

### Type Hierarchy

```
RaciSessionState (complete state)
├── chart: RaciChart
│   ├── roles: RaciRole[]
│   │   └── id, name, color, description
│   ├── tasks: RaciTask[]
│   │   └── id, name, description
│   └── matrix: Record<string, Record<string, RaciValue>>
│       └── RaciValue: "R" | "A" | "C" | "I" | null
│
├── undoStack: RaciUndoState[]
│   └── chart, timestamp
│
├── uiState: RaciUIState
│   └── selectedRoleId, selectedTaskId, editingMode, sidebarOpen, activeTheme
│
├── validation: ValidationResult
│   ├── isValid: boolean
│   └── errors: ValidationError[]
│       └── field, message, severity
│
└── notifications: NotificationState[]
    └── id, type, message, duration
```

---

## 🎨 Styling Architecture

### CSS Organization

```
src/styles/raci.css
├── Layout System (CSS Grid)
│   ├── .raci-editor-layout (main grid)
│   ├── .raci-sidebar (left column)
│   ├── .raci-main-content (right column)
│   └── Media queries (responsive)
│
├── Component Styling
│   ├── .raci-header-bar
│   ├── .raci-description-panel
│   ├── .raci-roles-editor
│   ├── .raci-tasks-editor
│   ├── .raci-matrix
│   ├── .raci-theme-selector
│   ├── .raci-export-buttons
│   ├── .raci-reset-controls
│   ├── .raci-undo-button
│   └── .raci-error-modal
│
├── Color System (RACI Values)
│   ├── .raci-value-r (Green #22c55e)
│   ├── .raci-value-a (Amber #eab308)
│   ├── .raci-value-c (Blue #3b82f6)
│   └── .raci-value-i (Gray #9ca3af)
│
├── Responsive Breakpoints
│   ├── Desktop (>1024px): 2-column
│   ├── Tablet (768-1024px): 1-column
│   └── Mobile (<768px): Full-width
│
├── Accessibility Features
│   ├── Focus indicators (2px outline)
│   ├── High-contrast mode
│   ├── Color contrast (4.5:1)
│   └── Semantic color usage (not just color)
│
├── Interactive States
│   ├── :hover styles
│   ├── :focus styles
│   ├── :active styles
│   └── :disabled styles
│
└── Print Styles
    ├── Print-friendly layout
    ├── Hide buttons/controls
    └── Optimize for paper
```

---

## ⚙️ Configuration Architecture

### Configuration Files

```
src/config/
├── templates.json (Template presets)
│   └── 3 demo templates
│       ├── Mobile App
│       ├── Web Redesign
│       └── CRM Migration
│
├── theming.json (Theme presets)
│   └── 4 complete themes
│       ├── Default
│       ├── Corporate
│       ├── Minimal
│       └── Vibrant
│
├── prompts.json (AI prompts)
│   └── 4 prompt templates
│       ├── Extract roles
│       ├── Generate tasks
│       ├── Assign RACI
│       └── Classify project
│
└── workers.ts (Cloudflare Workers)
    ├── Dev endpoint
    ├── Prod endpoint
    ├── API keys (env)
    └── Rate limits
```

### Admin Customization

No code changes needed for:

- Theme customization
- Template presets
- AI prompts
- Worker endpoints

Simply edit JSON files!

---

## 🔌 Integration Points

### SSR Route Integration

```typescript
// src/routes/tools/raci-generator.tsx

export const Route = createFileRoute('/tools/raci-generator')({
  component: () => <RaciGeneratorPage />
})
```

### Header Navigation Integration

```typescript
// src/components/Header.tsx

<ToolsDropdown>
  <Link to="/tools/raci-generator">
    RACI Chart Generator
  </Link>
</ToolsDropdown>
```

### Component Import Pattern

```typescript
// src/components/raci/index.ts

export { RaciGeneratorPage } from "./RaciGeneratorPage";
export { RaciEditor } from "./RaciEditor";
export { RaciHeaderBar } from "./RaciHeaderBar";
// ... 9 more components
```

---

## 🏃 Interaction Flow

### User Creates RACI Chart

```
1. User clicks "Tools" → "RACI Generator"
   └─ Route: /tools/raci-generator

2. RaciGeneratorPage loads
   └─ state = initialState

3. User enters project title
   └─ RaciHeaderBar onChange
   └─ setState updates chart.title
   └─ RaciEditor receives new props
   └─ Re-renders title display

4. User adds roles
   └─ RolesEditor "Add Role" click
   └─ setState adds role to chart.roles
   └─ RaciMatrixEditor receives new roles
   └─ Matrix columns update

5. User adds tasks
   └─ TasksEditor "Add Task" click
   └─ setState adds task to chart.tasks
   └─ RaciMatrixEditor receives new tasks
   └─ Matrix rows update

6. User assigns RACI values
   └─ RaciMatrixEditor cell click
   └─ setState updates matrix[roleId][taskId]
   └─ Cell color updates

7. User selects theme
   └─ ThemeSelector onChange
   └─ setState updates theme
   └─ CSS classes update colors

8. User clicks Undo (Ctrl+Z)
   └─ UndoButton onClick
   └─ setState pops from undoStack
   └─ Chart reverts to previous state

9. User clicks Export (future)
   └─ ExportButtons click
   └─ Iteration 6: Export logic
   └─ Download file
```

---

## 🔐 Accessibility Architecture

### Keyboard Navigation

```
Tab         → Navigate through focusable elements
Shift+Tab   → Navigate backwards
Escape      → Close modals/dialogs
Enter       → Activate buttons/inputs
Space       → Activate buttons
Ctrl+Z      → Undo last action
```

### ARIA Implementation

```html
<!-- Roles -->
<div role="main">
  <div role="dialog" aria-modal="true">
    <div role="group" aria-labelledby="id">
      <!-- Labels -->
      <label for="title">Chart Title</label>
      <input id="title" aria-label="Chart Title" />

      <!-- States -->
      <button aria-disabled="true">
        <input aria-invalid="false" />
        <div aria-live="polite">
          <!-- Descriptions -->
          <button aria-describedby="tooltip">
            <div id="tooltip">Help text</div>
          </button>
        </div>
      </button>
    </div>
  </div>
</div>
```

### Visual Indicators

- Focus: 2px outline (color: #0066cc)
- Error: Red border + icon
- Success: Green checkmark
- Warning: Amber icon
- Disabled: Opacity 0.5

---

## 📊 Responsive Design Architecture

### Breakpoints

```
Desktop  >1024px
  ├── 2-column layout
  ├── Sidebar 30%
  ├── Main 70%
  └── Full features

Tablet   768-1024px
  ├── Single column
  ├── Sidebar full-width
  ├── Stack vertically
  └── Touch-friendly

Mobile   <768px
  ├── Single column
  ├── Full-width stacked
  ├── Buttons 48px × 48px
  └── Optimized for touch
```

### Responsive Features

```css
/* Grid adjusts automatically */
@media (max-width: 1024px) {
  .raci-editor-layout {
    grid-template-columns: 1fr;
  }
}

/* Font sizes responsive */
@media (max-width: 768px) {
  .raci-header-bar h1 {
    font-size: 1.5rem;
  }
}

/* Touch-friendly buttons */
button {
  min-height: 44px;
  min-width: 44px;
}

/* Scrollable matrix on mobile */
@media (max-width: 768px) {
  .raci-matrix {
    overflow-x: auto;
  }
}
```

---

## 🔄 Future Architecture (Iterations 2-14)

### Iteration 2: State Management

```
useRaciState hook
  ├── State initialization
  ├── CRUD operations
  ├── Logo upload handling
  ├── Real-time validation
  └── Auto-save mechanism
```

### Iteration 3-7: Features

```
Persistence
AI Integration
Export Formats
Advanced UI
Admin Panel
```

### Iteration 8-14: Advanced

```
Advanced Features
Performance
Deployment
Monitoring
```

---

## 📋 Architecture Decisions

### Decision 1: SSR with TanStack Start

**Rationale**: SEO benefits, faster initial load, server-side rendering  
**Trade-off**: Slightly more complex setup  
**Alternative**: Client-side React only (rejected)

### Decision 2: Props-Down, Callbacks-Up

**Rationale**: Clear data flow, easier debugging, TypeScript safety  
**Trade-off**: More boilerplate than Context API  
**Alternative**: Context API (rejected for Iteration 1)

### Decision 3: CSS Grid Layout

**Rationale**: Native responsive, minimal CSS, flexible  
**Trade-off**: Requires browser support (modern only)  
**Alternative**: Flexbox (less flexible)

### Decision 4: TypeScript Strict Mode

**Rationale**: Maximum type safety, catch bugs early  
**Trade-off**: More verbose type definitions  
**Alternative**: Loose TypeScript (rejected)

### Decision 5: Admin-Editable JSON Config

**Rationale**: No code changes for customization  
**Trade-off**: Runtime configuration parsing  
**Alternative**: Hardcoded configuration (rejected)

---

## ✅ Architecture Validation

- [x] Component separation of concerns
- [x] Data flow patterns (props down, callbacks up)
- [x] Type safety (TypeScript strict)
- [x] Responsive design (3 breakpoints)
- [x] Accessibility (WCAG 2.1 AA)
- [x] Configuration flexibility
- [x] SSR integration
- [x] Future scalability

---

## 📚 Related Documentation

- **START_HERE.md** – Quick start guide
- **QUICK_REFERENCE.md** – Lookup tables
- **COMPONENT_STRUCTURE.md** – Component details
- **PROJECT_PLAN.md** – Full roadmap

---

**Version**: 1.0.0  
**Status**: ✅ Complete  
**Date**: 2025-11-10
