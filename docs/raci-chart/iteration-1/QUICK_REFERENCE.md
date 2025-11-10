# ⚡ Quick Reference – Iteration 1

**Category**: Lookup  
**Purpose**: Fast reference for developers  
**Version**: 1.0.0

---

## 🎯 Component Quick Lookup

### Main Components

```typescript
// Entry Point
RaciGeneratorPage
└─ location: src/components/raci/RaciGeneratorPage.tsx
└─ imports Toaster from ../ui/Toaster
└─ route: /tools/raci-generator

// Orchestrator
RaciEditor
└─ location: src/components/raci/RaciEditor.tsx
└─ props: state, setState
└─ renders: all child components

// Layout Sections
RaciHeaderBar → Title + logo upload
DescriptionPanel → Project description
RolesEditor → Add/edit/delete roles
TasksEditor → Add/edit/delete tasks
ThemeSelector → 4-theme dropdown
RaciMatrixEditor → Interactive grid
ExportButtons → 5 export formats
ResetControls → Reset chart/theme
UndoButton → Undo last change
ErrorModal → Error display
Toaster → Toast notifications
```

---

## 🧬 Type System – 15 Interfaces

### Core Types

```typescript
// src/types/raci.ts

type RaciValue = "R" | "A" | "C" | "I" | null;

interface RaciChart {
  id: string;
  version: "1.0.0";
  timestamp: string;
  title: string;
  roles: RaciRole[];
  tasks: RaciTask[];
  matrix: Record<string, Record<string, RaciValue>>;
  theme: string;
  logo?: string;
}

interface RaciRole {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface RaciTask {
  id: string;
  name: string;
  description?: string;
}

interface RaciSessionState {
  chart: RaciChart;
  undoStack: RaciUndoState[];
  uiState: RaciUIState;
  validation: ValidationResult;
  notifications: NotificationState[];
}

interface RaciUIState {
  selectedRoleId?: string;
  selectedTaskId?: string;
  editingMode: boolean;
  sidebarOpen: boolean;
  activeTheme: string;
}

interface RaciUndoState {
  chart: RaciChart;
  timestamp: number;
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

interface NotificationState {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface RaciEncodedPayload {
  version: string;
  data: string;
  checksum: string;
}

interface RaciAISuggestion {
  id: string;
  type: "role" | "task" | "assignment";
  content: string;
  confidence: number;
}

interface FileUploadResult {
  success: boolean;
  fileName: string;
  size: number;
  logo: string;
}

interface ExportOptions {
  format: "pdf" | "xlsx" | "pptx" | "png" | "csv";
  filename: string;
  includeTimestamp: boolean;
  theme: string;
}
```

---

## 🎨 Themes – 4 Presets

### Theme Configuration

```json
// src/config/theming.json

{
  "default": {
    "name": "Website Default",
    "primary": "#0066cc",
    "secondary": "#004499",
    "accent": "#ff9900",
    "roleColors": {
      "r": "#22c55e",
      "a": "#eab308",
      "c": "#3b82f6",
      "i": "#9ca3af"
    }
  },
  "corporate": {
    "name": "Corporate Blue",
    "primary": "#003d82",
    "secondary": "#002147",
    "accent": "#d97706"
  },
  "minimal": {
    "name": "Minimal Grayscale",
    "primary": "#000000",
    "secondary": "#374151",
    "accent": "#ffffff"
  },
  "vibrant": {
    "name": "Vibrant Gradient",
    "primary": "#7c3aed",
    "secondary": "#2563eb",
    "accent": "#06b6d4"
  }
}
```

---

## 📦 Templates – 3 Demos

### Template Configuration

```json
// src/config/templates.json

{
  "mobile-app": {
    "title": "Mobile App Launch",
    "description": "Cross-platform mobile application launch",
    "roles": 5,
    "tasks": 5
  },
  "web-redesign": {
    "title": "Website Redesign",
    "description": "Complete website visual overhaul",
    "roles": 5,
    "tasks": 6
  },
  "crm-migration": {
    "title": "CRM Migration",
    "description": "Salesforce implementation",
    "roles": 5,
    "tasks": 6
  }
}
```

---

## 🤖 AI Prompts – 4 Templates

### Prompt Configuration

```json
// src/config/prompts.json

{
  "extract-roles": "Extract key project roles from: {{projectDescription}}",
  "generate-tasks": "Generate tasks for roles: {{roles}}",
  "assign-raci": "Suggest RACI assignments for task: {{taskName}}",
  "classify-project": "Project type: {{projectDescription}}"
}
```

---

## 🎯 RACI Values

```
R = Responsible    (Does the work)
A = Accountable    (Has authority)
C = Consulted      (Provides input)
I = Informed       (Gets updates)
(empty) = Not involved
```

### Color Coding

| Value | Color    | Hex     |
| ----- | -------- | ------- |
| R     | 🟢 Green | #22c55e |
| A     | 🟡 Amber | #eab308 |
| C     | 🔵 Blue  | #3b82f6 |
| I     | ⚫ Gray  | #9ca3af |

---

## 📱 Responsive Breakpoints

```css
Desktop:  >1024px  → 2-column layout
Tablet:   768-1024px → Single column
Mobile:   <768px    → Full-width stacked
```

---

## 🗂️ File Organization

```
src/
├── routes/
│   └── tools/
│       └── raci-generator.tsx          (SSR route)
├── components/
│   ├── raci/                           (12 shells)
│   │   ├── RaciGeneratorPage.tsx       (entry)
│   │   ├── RaciEditor.tsx              (orchestrator)
│   │   ├── RaciHeaderBar.tsx
│   │   ├── DescriptionPanel.tsx
│   │   ├── RolesEditor.tsx
│   │   ├── TasksEditor.tsx
│   │   ├── RaciMatrixEditor.tsx
│   │   ├── ThemeSelector.tsx
│   │   ├── ExportButtons.tsx
│   │   ├── ResetControls.tsx
│   │   ├── UndoButton.tsx
│   │   ├── ErrorModal.tsx
│   │   └── index.ts
│   └── ui/
│       └── Toaster.tsx                 (notifications)
├── types/
│   └── raci.ts                         (15 interfaces)
├── styles/
│   └── raci.css                        (300+ lines)
└── config/
    ├── templates.json                  (3 templates)
    ├── prompts.json                    (4 prompts)
    ├── theming.json                    (4 themes)
    └── workers.ts                      (CF Worker config)
```

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action      |
| -------- | ----------- |
| `Ctrl+Z` | Undo        |
| `Tab`    | Navigate    |
| `Esc`    | Close modal |
| `Enter`  | Save        |

---

## 🎯 Props Pattern

All components follow consistent prop pattern:

```typescript
interface ComponentProps {
  chart: RaciChart;
  onChange: (chart: RaciChart) => void;
}

// Or with UI state:
interface UIComponentProps {
  state: RaciSessionState;
  setState: (state: RaciSessionState) => void;
}
```

---

## 📊 Data Flow

```
RaciGeneratorPage
  ↓ useState(initialState)
  ↓
RaciEditor (orchestrator)
  ↓ props down
  ├── Components receive: chart, onChange callbacks
  ├── User actions trigger callbacks
  └── setState propagates changes up
      ↓
    Parent re-renders
      ↓
    Children receive updated props
```

---

## 🐛 Bug Fixes Applied

### Toaster Import Fix

- **File**: `src/components/raci/RaciGeneratorPage.tsx`
- **Issue**: Named import vs default export mismatch
- **Before**: `import { Toaster } from "../ui/Toaster"`
- **After**: `import Toaster from "../ui/Toaster"`
- **Status**: ✅ Fixed

---

## 📚 Configuration Files

### templates.json

- 3 demo templates
- Pre-configured roles & tasks
- Project descriptions
- Used for quick start

### prompts.json

- 4 AI prompt templates
- Variable substitution support
- Ready for Iteration 8 (AI integration)

### theming.json

- 4 complete theme presets
- Color palettes
- Font/spacing config
- Used by ThemeSelector

### workers.ts

- Cloudflare Worker endpoint config
- API keys (from env)
- Rate limits
- Request/response types

---

## ✨ Export Formats

| Format | Status      | Iteration |
| ------ | ----------- | --------- |
| PDF    | Shell ready | 6         |
| XLSX   | Shell ready | 6         |
| PPTX   | Shell ready | 6         |
| PNG    | Shell ready | 6         |
| CSV    | Shell ready | 6         |

---

## 🔐 Accessibility Features

✅ WCAG 2.1 AA  
✅ Focus indicators  
✅ ARIA labels  
✅ Keyboard navigation  
✅ Semantic HTML  
✅ Color contrast 4.5:1  
✅ High-contrast mode

---

## 🚀 Next Steps

**Iteration 2**: State Management

- `useRaciState` hook
- Logo upload
- Full CRUD
- Real-time validation
- Auto-save

All shells ready – add logic in Iteration 2!

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-10  
**Status**: ✅ Complete
