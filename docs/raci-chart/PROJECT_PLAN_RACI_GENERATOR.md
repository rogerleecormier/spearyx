# RACI Chart Generator – Developer-Ready Project Plan

**Status**: Production (Iterations 1-9 Complete)  
**Framework**: React 18 + TypeScript + TanStack Start (SSR)  
**Last Updated**: 2025-11-19  
**Version**: 1.9.0

---

## 📊 Project Status

**Current State**: Iterations 1-9 Complete and Deployed

| Phase | Iterations | Status | Completion |
|-------|------------|--------|------------|
| **Phase 1: Foundation** | 1-4 | ✅ Complete | Nov 2024 |
| **Phase 2: Core Features** | 5-8 | ✅ Complete | Nov 2024 |
| **Phase 3: UX & Polish** | 9 | ✅ Complete | Nov 2024 |
| **Phase 4: Quality** | 10-14 | 📋 Planned | TBD |

**Completed Iterations:**
- ✅ Iteration 1: Navigation & Setup
- ✅ Iteration 2: Editors & State Management
- ✅ Iteration 3: RACI Matrix Editor
- ✅ Iteration 4: Templates & Presets
- ✅ Iteration 5: Export Formats (PDF, XLSX, CSV, PNG, PPTX)
- ✅ Iteration 6: Theming & Live Preview
- ✅ Iteration 7: Encoding & Public Links
- ✅ Iteration 8: AI Integration & Prompts
- ✅ Iteration 9: Error Handling, Undo & Keyboard Shortcuts (integrated throughout)

**Features Implemented:**
- Interactive RACI matrix with keyboard navigation
- AI-powered role & task generation (Cloudflare Workers AI)
- 5 export formats with theme support
- Public share links with import
- Auto-save & undo functionality
- 3 theme presets + high-contrast mode
- Comprehensive error handling
- Full WCAG 2.1 AA accessibility

**Remaining Work** (Iterations 10-14):
- Accessibility audit & compliance certification
- Performance optimization & bundle analysis
- Comprehensive testing suite
- Production deployment & monitoring

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Specification](#feature-specification)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [File Structure](#file-structure)
5. [State Management & Persistence](#state-management--persistence)
6. [Build Plan – Modular Iterations](#build-plan--modular-iterations)
7. [Error Handling & Accessibility](#error-handling--accessibility)
8. [Compliance & Performance](#compliance--performance)

---

## Overview

### Purpose

Create an interactive, server-side-rendered RACI Chart Generator that empowers teams to define responsibilities using:

- **Intelligent AI suggestions** (via Cloudflare Workers AI)
- **Multi-theme support** with live preview
- **Professional exports** (PDF, XLSX, PPTX, PNG, CSV)
- **Permanent public links** for chart sharing and import
- **Session-persistent undo & auto-save**

### Key Principles

- **Accessibility first**: WCAG 2.1 AA compliance, keyboard navigation, ARIA labels
- **User-centric UX**: Color-coded matrix, instant validation, graceful error handling
- **Developer velocity**: Modular routing, isolated components, clear separation of concerns
- **Admin-driven configuration**: `prompts.json` and `theming.json` for non-code changes

---

## Feature Specification

### 1. Core Generator (SSR, Tools Menu, Accessibility)

#### 1.1 Navigation & SSR

- **Route**: `/tools/raci-generator`
- **Entry point**: Server-rendered via TanStack Start
- **Navigation**: Tools dropdown on index with RACI entry
- **Code splitting**: Lazy-load RACI components to optimize main bundle

#### 1.2 Interactive RACI Matrix Editor

- **Color-coded assignments**: Green (R), Amber (A), Blue (C), Gray (I)
- **Exclusive cells**: Each (role, task) cell has ≤1 RACI value
- **Real-time validation**:
  - ✅ At least one "A" (Accountable) per task
  - ✅ Unique role & task names (case-insensitive)
  - ✅ Invalid state blocks export/import
- **Matrix dimensions**: Up to 20 roles × 50 tasks (configurable)

#### 1.3 Chart Editors

- **Chart Title Editor**: Editable header, persisted in state
- **Roles Editor**: CRUD (add, edit, delete, reorder), inline validation
- **Tasks Editor**: CRUD, supports multi-line descriptions, inline validation
- **Logo Upload**: Max 5MB, PNG/JPG/SVG, preview on upload
- **Demo Templates**: Pre-loaded templates (Mobile App, Web Redesign, CRM Migration)

#### 1.4 Accessibility Requirements

- **ARIA Labels**: All form fields, buttons, matrix cells labeled
- **Keyboard Navigation**:
  - `Tab` through editors and matrix cells
  - `Space`/`Enter` to toggle cell values
  - `Shift+Tab` to navigate backward
  - `Ctrl+Z` / `Cmd+Z` for undo
  - `Esc` to close modals/popovers
- **High-Contrast Mode**: Fixed toggle (CSS custom properties override)
- **Screen Reader Support**: Semantic HTML, live regions for validation errors

---

### 2. Templates & AI Prompts

#### 2.1 Demo Templates

**File**: `src/config/templates.json`

Three pre-configured templates:

1. **Mobile App Development**
   - Roles: Product Manager, Backend Dev, Frontend Dev, QA Lead, Designer
   - Tasks: Requirements, Architecture, Implementation, Testing, Deployment
2. **Web Redesign Project**
   - Roles: Marketing Lead, Design Lead, Frontend Dev, Content Strategist, Project Manager
   - Tasks: Strategy, Design, Prototyping, Build, Content, Launch
3. **CRM Migration**
   - Roles: CRM Admin, Data Analyst, Change Manager, Business User, IT Support
   - Tasks: Assessment, Planning, Data Mapping, Training, Cutover, Support

#### 2.2 Prompts Configuration

**File**: `src/config/prompts.json`

Dynamic prompt templates with variable substitution:

```json
{
  "roleExtraction": {
    "prompt": "Extract key roles from: {{projectDescription}}. Return JSON array of role names.",
    "variables": ["projectDescription"]
  },
  "taskGeneration": {
    "prompt": "For a {{projectType}} project with roles {{roles}}, suggest tasks...",
    "variables": ["projectType", "roles"]
  },
  "raciAdvice": {
    "prompt": "Suggest RACI assignments for task {{task}} with roles {{roles}}...",
    "variables": ["task", "roles"]
  }
}
```

**Admin Updates**: Direct file edits in version control; no runtime UI for prompt changes.

#### 2.3 Cloudflare Workers AI Integration

- **Endpoint**: Configured in `src/config/workers.ts`
- **Fallback behavior**: If AI unavailable, suggest templates or user-provided data
- **Rate limiting**: 10 requests/minute per session
- **Timeout**: 30 seconds; gracefully degrade if exceeded

---

### 3. Theming & Chart Styling

#### 3.1 Theme Presets

**File**: `src/config/theming.json`

Predefined themes with color, typography, and export styling:

```json
{
  "default": {
    "name": "Website Default",
    "colors": {
      "primary": "#0066cc",
      "accent": "#ff9500",
      "raci": {
        "r": "#00cc00",
        "a": "#ffb300",
        "c": "#0099ff",
        "i": "#cccccc"
      }
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    }
  },
  "corporate": {
    "name": "Corporate Blue",
    "colors": {
      /* ... */
    }
  },
  "minimal": {
    "name": "Minimal Grayscale",
    "colors": {
      /* ... */
    }
  }
}
```

#### 3.2 Theme Selection & Preview

- **Chart theme selector**: Dropdown in editor with live preview
- **Preview pane**: Real-time rendering of matrix + sample export with selected theme
- **Persistence**: Theme choice stored per chart in state
- **Default**: "Website Default" on new chart

#### 3.3 Styled Exports

All export formats (PDF, XLSX, PPTX, PNG) inherit active theme:

- Color palette applied to matrix cells, headers, and branding
- Logo embedded (sized for visibility)
- Typography matches selected theme
- CSV exports: No styling (RACI columns only)

---

### 4. Export & Import via Permanent Public Link

#### 4.1 Chart Encoding & Public Links

- **Payload structure**:
  ```json
  {
    "version": "1.0.0",
    "timestamp": "2025-11-10T14:30:00Z",
    "chart": {
      "title": "Mobile App RACI",
      "roles": ["PM", "Backend Dev", ...],
      "tasks": [{"name": "...", "description": "..."}, ...],
      "matrix": { "PM": {"Requirements": "A"}, ... },
      "theme": "default",
      "logo": "<base64-encoded-image>"
    }
  }
  ```
- **Encoding**: URL-safe base64 with optional gzip compression
- **Public URL format**: `/tools/raci-generator/import?data=<encoded-payload>`
- **One chart per link**: Each edit generates a new unique link
- **Link stability**: Permanent until explicitly regenerated

#### 4.2 Export Formats

| Format   | Styling             | Use Case           | Size Limit     |
| -------- | ------------------- | ------------------ | -------------- |
| **PDF**  | ✅ Full theme       | Print & share      | 10 MB          |
| **XLSX** | ✅ Theme + formulas | Analysis & editing | 5 MB           |
| **PPTX** | ✅ Theme slides     | Presentations      | 8 MB           |
| **PNG**  | ✅ Chart snapshot   | Web embedding      | 2 MB per image |
| **CSV**  | ❌ None             | Data export        | 1 MB           |

#### 4.3 Import Workflow

1. User receives `/import?data=...` link
2. Frontend decodes payload, validates structure
3. **If valid**: Load chart into editor, display "Imported from shared link"
4. **If invalid**: Show error modal with recovery options (see Section 5)
5. **Last good state**: Auto-restored from localStorage if import fails

#### 4.4 Version & Timestamp

- Visible in UI: "Chart version: 1.0.0 (Updated 2025-11-10 14:30 UTC)"
- Included in all exports as metadata/footer
- Tracked in undo history

---

### 5. Error Feedback, Undo, and Reset Controls

#### 5.1 Error Handling

- **Error modal**: Accessible dialog with clear error message + recovery actions
- **Error types**:
  - Validation: Duplicate role/task names, missing Accountable, file size exceeded
  - Upload: Unsupported file type, image corruption, logo too large
  - Import: Malformed payload, version mismatch, corrupted data
  - Network: Cloudflare Worker timeout, CORS error
  - Export: Browser memory limit, unsupported format

**Error Modal Structure**:

```
┌─────────────────────────────────┐
│ ⚠️  Error Title                 │
├─────────────────────────────────┤
│ Error message & details         │
│                                 │
│ [Next Steps] [Contact Admin]    │
└─────────────────────────────────┘
```

#### 5.2 Reset Controls

- **"Reset Chart Contents"**: Revert to currently selected template
  - User confirmation: "Are you sure? This cannot be undone."
  - Undo available after reset
- **"Reset Theme"**: Revert to "Website Default" preset
  - Immediate action, no confirmation
  - Undo available after reset

#### 5.3 Undo System

- **Scope**: Single-step reversal only (applies to in-app edits, resets)
- **Excluded**: Exports, imports (final states)
- **Trigger**: `Ctrl+Z` / `Cmd+Z` or UI button
- **Behavior**: No confirmation popup; immediate reversal
- **Disabled states**:
  - First load (no prior state)
  - After export
  - After successful import
- **Undo history**: Session-persistent in state, auto-saved to localStorage

#### 5.4 Undo State Structure

```json
{
  "current": {
    /* current chart state */
  },
  "previous": {
    /* prior state */
  },
  "canUndo": true,
  "lastAction": "edit_role"
}
```

---

### 6. State Persistence & Notifications

#### 6.1 Client Auto-Save

- **Strategy**: localStorage with IndexedDB fallback
- **Interval**: Every 5 seconds (debounced)
- **Scope**: All edits, theme changes, undo state
- **Payload**: Full chart object + undo state + session metadata

#### 6.2 Auto-Restore on Reload

- Load chart from localStorage on component mount
- Display toast: "Chart restored (last auto-saved at 14:30)"
- If corrupted or missing, load default template
- Undo state fully restored

#### 6.3 Notifications

- **Success**: Brief green toast (auto-dismiss 3s): "Chart auto-saved ✓"
- **Error**: Red alert banner with retry option
- **Import**: Blue info toast with chart title: "Imported: Mobile App RACI (v1.0.0)"
- **Export**: Confirmation toast: "Downloaded as PDF ✓"

**Toast positioning**: Bottom-right, non-intrusive, accessible (ARIA live region)

---

### 7. Compliance, Architecture & Iteration

#### 7.1 Architecture Overview

```
TanStack Start (SSR)
├── Server Layout: __root.tsx
├── Route: /tools/raci-generator.tsx (Server Component)
│   └── Client Boundary: RaciGeneratorPage (Client Component)
│       ├── RaciEditor (Client)
│       │   ├── RaciHeaderBar
│       │   ├── DescriptionPanel
│       │   ├── RolesEditor
│       │   ├── TasksEditor
│       │   ├── RaciMatrixEditor
│       │   ├── ThemeSelector
│       │   └── ExportButtons
│       ├── RaciPreview (Client)
│       │   └── ChartPreview (theme-aware)
│       └── ErrorModal (Client)
└── Hooks & Utils
    ├── useRaciState (state management)
    ├── useAutoSave (persistence)
    ├── useUndo (undo/redo)
    ├── useAccessibility (keyboard nav, ARIA)
    └── exporters/*.ts (PDF, XLSX, PPTX, PNG, CSV)
```

#### 7.2 Separation of Concerns

- **Components**: Pure UI, no business logic
- **Hooks**: State management, side effects, persistence
- **Utils**: Encoding/decoding, export logic, validation
- **Config**: Prompts, themes, templates (JSON)
- **Types**: TypeScript interfaces (no enums, use string literals)

#### 7.3 Responsive & Accessible

- Mobile-first CSS Grid layout
- Touch-friendly (48px minimum hit targets)
- Collapsible editors on small screens
- High-contrast mode toggle (localStorage-persisted)
- WCAG 2.1 AA compliance

#### 7.4 Code Splitting

- RACI route lazy-loaded
- Export formatters: Dynamic imports
- AI integration: Cloudflare Worker (separate domain)
- Preview: Renders only on demand

---

## File Structure

```
src/
├── routes/
│   ├── __root.tsx                    # Server root layout
│   ├── tools/
│   │   └── raci-generator.tsx        # SSR entry, server boundary
│   └── tools/raci-generator/
│       └── import.tsx                # Import handler route
│
├── components/
│   ├── raci/
│   │   ├── RaciGeneratorPage.tsx     # Main client component
│   │   ├── RaciEditor.tsx            # Editor container
│   │   ├── RaciHeaderBar.tsx         # Title + logo upload
│   │   ├── DescriptionPanel.tsx      # Project description + AI input
│   │   ├── RolesEditor.tsx           # CRUD roles
│   │   ├── TasksEditor.tsx           # CRUD tasks
│   │   ├── RaciMatrixEditor.tsx      # Interactive matrix cells
│   │   ├── ThemeSelector.tsx         # Theme dropdown + preview
│   │   ├── RaciPreview.tsx           # Live theme preview
│   │   ├── ExportButtons.tsx         # PDF, XLSX, PPTX, PNG, CSV
│   │   ├── ResetControls.tsx         # Reset chart & theme buttons
│   │   ├── UndoButton.tsx            # Undo control + keyboard hint
│   │   └── ErrorModal.tsx            # Error dialog + recovery
│   │
│   └── ui/
│       ├── Toaster.tsx               # Toast notifications
│       ├── Modal.tsx                 # Accessible dialog
│       ├── Button.tsx                # Accessible button
│       ├── Select.tsx                # Accessible dropdown
│       └── Input.tsx                 # Accessible text input
│
├── lib/
│   ├── raci/
│   │   ├── state.ts                  # useRaciState hook
│   │   ├── persistence.ts            # useAutoSave, localStorage/IndexedDB
│   │   ├── undo.ts                   # useUndo hook
│   │   ├── validation.ts             # Validation logic
│   │   ├── encoding.ts               # Base64 encode/decode for links
│   │   ├── ai.ts                     # Cloudflare Worker client
│   │   ├── templates.ts              # Template preloading
│   │   └── accessibility.ts          # Keyboard nav, ARIA utilities
│   │
│   ├── exporters/
│   │   ├── pdf.ts                    # React-PDF export
│   │   ├── xlsx.ts                   # ExcelJS export
│   │   ├── pptx.ts                   # PptxGenJS export
│   │   ├── png.ts                    # Canvas/html2canvas export
│   │   └── csv.ts                    # CSV export (data only)
│   │
│   └── utils.ts                      # Shared utilities
│
├── config/
│   ├── templates.json                # Demo templates
│   ├── prompts.json                  # AI prompt templates
│   ├── theming.json                  # Theme presets
│   └── workers.ts                    # Cloudflare Worker endpoint
│
├── types/
│   ├── raci.ts                       # TypeScript interfaces
│   └── theme.ts                      # Theme types
│
├── styles/
│   ├── raci.css                      # RACI-specific styles
│   └── accessibility.css             # High-contrast overrides
│
└── public/
    └── demos/                        # Demo chart templates
```

---

## State Management & Persistence

### 7.1 Chart State Interface

```typescript
interface RaciChart {
  id: string; // UUID
  version: "1.0.0"; // Semantic version
  timestamp: string; // ISO 8601 UTC
  title: string;
  description: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: Record<string, Record<string, RaciValue>>; // roles -> tasks -> {R|A|C|I}
  theme: string; // theme key from theming.json
  logo?: string; // Base64 encoded image
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

### 7.2 Session State Structure

```typescript
interface RaciSessionState {
  chart: RaciChart;
  undo: {
    current: RaciChart;
    previous: RaciChart | null;
    canUndo: boolean;
    lastAction: string;
  };
  ui: {
    selectedTheme: string;
    showPreview: boolean;
    highContrastMode: boolean;
    notification: NotificationState | null;
  };
  validation: ValidationResult;
}

interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
  duration: number;
  dismissible: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}
```

### 7.3 Persistence Layers

- **Layer 1**: Memory (React state, instant)
- **Layer 2**: Session storage (auto-save every 5s, debounced)
- **Layer 3**: localStorage (backup, 5MB limit)
- **Layer 4**: IndexedDB (fallback, unlimited size)

**Recovery priority**: Memory → Session → localStorage → IndexedDB → Template

---

## Build Plan – Modular Iterations

### Iteration 1: Navigation & Setup (Week 1) ✅

**Goal**: SSR page, basic layout, component scaffolding  
**Status**: ✅ Complete (Nov 2024)

- [x] Create `/tools/raci-generator.tsx` server route
- [x] Add Tools dropdown to index navigation
- [x] Build `RaciGeneratorPage` client boundary component
- [x] Scaffold all UI components (empty, no logic)
- [x] Set up TypeScript interfaces in `types/raci.ts`
- [x] Configure TailwindCSS for RACI layout
- [x] Test SSR rendering, lazy loading, route activation

**Deliverables**:

- ✅ Accessible page structure with ARIA landmarks
- ✅ CSS Grid layout (responsive, mobile-first)
- ✅ All component shells in place

---

### Iteration 2: Editors – Roles, Tasks, Title, Logo (Week 2) ✅

**Goal**: CRUD operations, inline validation, UX polish  
**Status**: ✅ Complete (Nov 2024)

- [x] Implement `RaciHeaderBar`: Title editor, logo upload (Max 5MB, preview)
- [x] Implement `RolesEditor`: Add/edit/delete roles, reorder (drag-and-drop)
- [x] Implement `TasksEditor`: Add/edit/delete tasks, reorder, multi-line descriptions
- [x] Build validation layer in `lib/raci/validation.ts`
- [x] Integrate state management via `useRaciState` hook
- [x] Add error modal for validation failures
- [x] Test keyboard navigation (Tab, Shift+Tab, Esc)

**Deliverables**:

- ✅ Fully functional editors with CRUD
- ✅ Real-time validation feedback
- ✅ WCAG 2.1 AA keyboard support

---

### Iteration 3: RACI Matrix Editor (Week 2.5) ✅

**Goal**: Interactive color-coded matrix, exclusive assignments  
**Status**: ✅ Complete (Nov 2024)

- [x] Build `RaciMatrixEditor`: Grid of cells with R/A/C/I toggles
- [x] Implement exclusive cell logic (one RACI value per cell)
- [x] Add color coding: Green (R), Amber (A), Blue (C), Gray (I)
- [x] Implement cell keyboard navigation (Tab, Space, Arrow keys)
- [x] Add live validation: At least one "A" per task
- [x] Create matrix preview component
- [x] Test large matrix performance (20 roles × 50 tasks)

**Deliverables**:

- ✅ Fully interactive RACI matrix
- ✅ Color-coded, accessible cell selection
- ✅ Real-time validation feedback

---

### Iteration 4: Demo Templates & State Hooks (Week 3) ✅

**Goal**: Template loading, state management, persistence setup  
**Status**: ✅ Complete (Nov 2024)

- [x] Create `src/config/templates.json` with 3 demo templates
- [x] Build `lib/raci/templates.ts` for template loading
- [x] Implement `useRaciState` hook (Redux/Zustand-like pattern)
- [x] Implement `useAutoSave` hook (localStorage + debounce)
- [x] Add "Reset Chart Contents" button with confirmation
- [x] Load default template on app load
- [x] Test template switching and state preservation

**Deliverables**:

- ✅ Demo templates fully integrated
- ✅ State persists across page reloads
- ✅ Auto-save visible feedback

---

### Iteration 5: Export Formats (Week 3.5) ✅

**Goal**: PDF, XLSX, PPTX, PNG, CSV exporters (styled except CSV)  
**Status**: ✅ Complete (Nov 2024)

- [x] Implement `lib/exporters/pdf.ts` (jsPDF)
  - Theme-aware color palette
  - Logo embedding
  - Matrix table + metadata
- [x] Implement `lib/exporters/xlsx.ts` (ExcelJS)
  - Styled cells, formulas
  - Logo embedding
  - Chart metadata sheet
- [x] Implement `lib/exporters/pptx.ts` (PptxGenJS)
  - Multi-slide format (overview, matrix, details)
  - Theme colors applied
  - Logo on each slide
- [x] Implement `lib/exporters/png.ts` (html2canvas)
  - Export full matrix as image
  - Theme-aware rendering
  - High-res output (300dpi for print)
- [x] Implement `lib/exporters/csv.ts` (unstyled data export)
  - RACI columns only
  - Unicode support
- [x] Build `ExportButtons` component with format selection
- [x] Add download progress feedback
- [x] Test file size limits (PDF 10MB, XLSX 5MB, etc.)

**Deliverables**:

- ✅ All 5 export formats fully functional
- ✅ Styled exports inherit active theme
- ✅ CSV export unstyled as per spec

---

### Iteration 6: Theming & Live Preview (Week 4) ✅

**Goal**: Theme configuration, selector, live preview  
**Status**: ✅ Complete (Nov 2024)

- [x] Create `src/config/theming.json` with 3+ theme presets
- [x] Implement `ThemeSelector` dropdown component
- [x] Build `RaciPreview` component with live theme rendering
- [x] Add CSS custom properties for theme switching
- [x] Implement theme persistence in state
- [x] Add high-contrast mode toggle (localStorage-persisted)
- [x] Test theme switching in preview and matrix

**Deliverables**:

- ✅ Dropdown theme selection with live preview
- ✅ Multiple complete theme presets
- ✅ High-contrast accessibility mode

---

### Iteration 7: Encoding & Public Links (Week 4.5) ✅

**Goal**: Chart encoding, permanent public links, import  
**Status**: ✅ Complete (Nov 2024)

- [x] Implement `lib/raci/encoding.ts`:
  - Chart → base64 URL encoding
  - Optional gzip compression
  - Version + timestamp embedding
- [x] Create "Get Public Link" button in `ExportButtons`
- [x] Create `/tools/raci-generator/import.tsx` route
- [x] Implement import payload validation & error recovery
- [x] Add last-good-state restoration on import failure
- [x] Build import notification feedback
- [x] Test link regeneration on every edit
- [x] Test one chart per link guarantee

**Deliverables**:

- ✅ Permanent public links for every chart
- ✅ Full import workflow with validation
- ✅ Error recovery with last-good-state

---

### Iteration 8: AI Integration & Prompts (Week 5) ✅

**Goal**: Cloudflare Workers AI, prompt templates, context-aware suggestions  
**Status**: ✅ Complete (Nov 2024)

- [x] Create `src/config/prompts.json` with dynamic templates
- [x] Implement `lib/raci/ai.ts` client
  - Cloudflare Worker endpoint configuration
  - Rate limiting (10 req/min)
  - Timeout handling (30s)
- [x] Build `DescriptionPanel` component:
  - Project description input
  - "Generate from Description" button
  - AI suggestion polling
  - Fallback to templates if AI unavailable
- [x] Implement role extraction AI prompt
- [x] Implement task generation AI prompt
- [x] Implement RACI advice AI prompt
- [x] Add loading states and cancellation
- [x] Test AI graceful degradation

**Deliverables**:

- ✅ DescriptionPanel with AI integration
- ✅ All 3 AI prompt types functional
- ✅ Graceful fallback if AI unavailable

---

### Iteration 9: Error Handling, Undo, Reset (Week 5.5) ✅

**Goal**: Error modal, undo system, reset controls, keyboard shortcuts  
**Status**: ✅ Complete (Nov 2024)

_Note: Features from this iteration were integrated throughout previous iterations._

- [x] Implement `useUndo` hook:
  - Single-step reversal only
  - Session-persistent state
  - No confirmation popup
- [x] Build `ErrorModal` component:
  - Accessible dialog
  - Error categorization
  - Recovery action suggestions
  - "Contact Admin" fallback link
- [x] Implement keyboard shortcuts:
  - `Ctrl+Z` / `Cmd+Z` for undo
  - `Esc` to close modals
  - Test accessibility (focus restoration, ARIA)
- [x] Add reset controls:
  - "Reset Chart Contents" with confirmation
  - "Reset Theme" without confirmation
  - Both support undo
- [x] Implement undo exclusions (exports, imports)
- [x] Test undo history persistence and restoration

**Deliverables**:

- ✅ Full error handling workflow
- ✅ Single-step undo with keyboard support
- ✅ Reset controls with proper confirmations

---

### Iteration 10: Accessibility & Compliance (Week 6)

**Goal**: WCAG 2.1 AA compliance, keyboard navigation, screen reader testing

- [ ] Audit all components for ARIA labels, roles, live regions
- [ ] Test keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Implement `lib/raci/accessibility.ts`:
  - Keyboard event handlers
  - Focus management
  - Semantic HTML templates
- [ ] Add skip links for keyboard users
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Ensure high-contrast mode works across all components
- [ ] Add visual focus indicators (2px outline, 3:1 contrast ratio)
- [ ] Run Lighthouse accessibility audit
- [ ] Fix all WCAG 2.1 AA violations

**Deliverables**:

- WCAG 2.1 AA certification
- Full keyboard navigation
- Screen reader compatibility verified

---

### Iteration 11: Notifications & Auto-Save (Week 6.5)

**Goal**: Toast notifications, auto-save feedback, session persistence

- [ ] Implement `Toaster` component:
  - Bottom-right positioning
  - Auto-dismiss (3s for success)
  - ARIA live region
  - Accessible close button
- [ ] Build notification types:
  - Success (green): "Chart auto-saved ✓"
  - Error (red): With retry option
  - Import (blue): Chart title + version
  - Export (blue): Format + timestamp
- [ ] Enhance `useAutoSave`:
  - Show success toast every 5s
  - Error handling with retry
  - IndexedDB fallback logging
- [ ] Test notification stacking
- [ ] Test auto-save reliability under slow network
- [ ] Test session restoration after reload

**Deliverables**:

- All notification types functional
- Auto-save feedback visible
- Full session persistence working

---

### Iteration 12: Performance & Polish (Week 7)

**Goal**: Code splitting, bundle optimization, UX refinements

- [ ] Implement lazy loading for export modules
- [ ] Optimize matrix rendering (React.memo, useCallback)
- [ ] Profile bundle size (target: <200KB RACI code)
- [ ] Test performance with large matrix (20×50)
- [ ] Add loading skeletons for AI requests
- [ ] Polish animations (smooth transitions, no jank)
- [ ] Test on low-bandwidth networks (throttle to 2G)
- [ ] Final responsive testing (mobile, tablet, desktop)
- [ ] Run Lighthouse performance audit (target: >80)

**Deliverables**:

- Optimized bundle size
- Lighthouse score >80
- Smooth performance on large datasets

---

### Iteration 13: Testing & Documentation (Week 7.5)

**Goal**: Unit tests, integration tests, developer docs

- [ ] Unit tests for validation, encoding, export logic (target: >80% coverage)
- [ ] Integration tests for state management and persistence
- [ ] E2E tests for critical workflows (create → edit → export → import)
- [ ] Accessibility testing with axe-core
- [ ] Write component documentation with examples
- [ ] Create API docs for hooks (useRaciState, useAutoSave, useUndo)
- [ ] Document config files (prompts.json, theming.json)

**Deliverables**:

- > 80% test coverage
- E2E tests for all critical paths
- Complete developer documentation

---

### Iteration 14: Deployment & Monitoring (Week 8)

**Goal**: Build optimization, deployment pipeline, monitoring setup

- [ ] Optimize build output (tree-shaking, minification)
- [ ] Set up CI/CD for automated testing
- [ ] Configure deployment to production (Vercel/Cloudflare)
- [ ] Set up error tracking (Sentry)
- [ ] Monitor auto-save success rates
- [ ] Monitor export success rates
- [ ] Monitor AI latency and errors
- [ ] Set up performance monitoring (Core Web Vitals)

**Deliverables**:

- Production-ready build
- Monitoring dashboard active
- CI/CD pipeline operational

---

## Error Handling & Accessibility

### Error Categories & Recovery

#### Validation Errors

- **Duplicate role/task names**: Highlight offending field, suggest unique name
- **Missing Accountable**: Red banner, show tasks without "A", suggest assignment
- **File size exceeded**: Modal with size limit, suggest removing logo

#### Upload Errors

- **Unsupported file type**: Modal + retry, accepted types listed
- **Image corruption**: Modal + fallback (use placeholder or skip logo)
- **Quota exceeded**: Modal + guidance to clear storage

#### Import Errors

- **Malformed payload**: Modal with error details, "Load from backup" button
- **Version mismatch**: Suggest updating to latest version
- **Corrupted data**: Restore last-good-state from localStorage

#### Network Errors

- **AI timeout (>30s)**: Retry button, use template fallback
- **CORS error**: Contact admin (backend issue)
- **Export fails**: Retry or switch format

### Keyboard Navigation Map

```
Ctrl+Z / Cmd+Z       → Undo last action
Tab                  → Next focusable element
Shift+Tab            → Previous focusable element
Enter / Space        → Activate button or toggle cell
Arrow Keys           → Navigate matrix cells, adjust order
Esc                  → Close modal or cancel action
Alt+1                → Focus roles editor (optional)
Alt+2                → Focus tasks editor (optional)
```

### ARIA Implementation

- `role="main"` on RaciGeneratorPage
- `role="region"` on editors with `aria-label`
- `aria-live="polite"` on notification toasts
- `aria-invalid="true"` on fields with validation errors
- `aria-label` on all icon buttons
- `aria-expanded` on collapsible sections
- `aria-describedby` linking fields to error messages

---

## Compliance & Performance

### Performance Targets

- **Lighthouse Score**: >80 (Performance, Accessibility, Best Practices)
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **Bundle Size**: <200KB (RACI code)
- **First Contentful Paint**: <1.5s (SSR)
- **Matrix render**: <500ms for 20×50 cells

### Browser Support

- Chrome/Edge ≥90
- Firefox ≥88
- Safari ≥14
- Mobile Safari (iOS ≥14)

### Security Considerations

- **XSS Prevention**: Sanitize user input (title, role, task names)
- **CSRF Protection**: Use SameSite cookies + CSRF tokens
- **File Upload**: Validate MIME type + file extension, virus scan if applicable
- **Data Encoding**: Use standard base64, optional gzip (no compression vulnerabilities)
- **API Rate Limiting**: 10 AI requests/minute per session

### WCAG 2.1 Compliance

- **AA level** (minimum requirement)
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 2px outline, visible on all interactive elements
- Form labels: Associated with inputs via `<label htmlFor>` or ARIA
- Error messages: Associated with fields, announced to screen readers
- Skip links: Keyboard users can skip to main content

### Data Privacy

- **Client-side storage only**: No data sent to backend unless AI requested
- **localStorage/IndexedDB**: User controls persistence
- **No cookies for tracking**: Session cookies only (CSRF tokens)
- **Logo handling**: Base64 embedded, not uploaded to server

---

## Deployment & Maintenance

### Prerequisites

- Node.js ≥18 LTS
- pnpm ≥8
- Cloudflare account (for Workers AI integration)

### Build & Deploy

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build

# Test locally
pnpm run dev

# Deploy to Vercel/Cloudflare
pnpm run deploy
```

### Admin Tasks (No Code Changes)

1. **Update templates**: Edit `src/config/templates.json`
2. **Add AI prompts**: Edit `src/config/prompts.json`
3. **Create themes**: Edit `src/config/theming.json`
4. **Adjust Worker endpoint**: Edit `src/config/workers.ts`

### Monitoring Checklist

- [ ] Auto-save success rate >99%
- [ ] Export success rate >98%
- [ ] Error modal display accuracy
- [ ] AI suggestion quality feedback
- [ ] Import validation effectiveness
- [ ] Performance (Core Web Vitals)
- [ ] No console errors in production

---

## Next Steps

1. **Approve architecture & file structure**
2. **Allocate 8-week sprint** (Iterations 1–14)
3. **Set up Cloudflare Workers AI account & endpoint**
4. **Initialize git repository & CI/CD pipeline**
5. **Begin Iteration 1: Navigation & Setup**

---

## References

- [RACI_GENERATOR.md](../references/RACI_GENERATOR.md) – Feature specification
- [TanStack Start Docs](https://tanstack.com/router/latest) – SSR framework
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) – Accessibility
- [ExcelJS Docs](https://github.com/exceljs/exceljs) – Excel export
- [React-PDF Docs](https://react-pdf.org/) – PDF export
- [html2canvas Docs](https://html2canvas.hertzen.com/) – PNG export

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-10  
**Status**: Ready for Development
