# Iteration 4: Component Structure & Component Tree

**Status:** ✅ Complete  
**Updated:** 2024

---

## Component Hierarchy

```
RaciGeneratorPage (Main orchestrator, state management)
│
├─ Header Section
│  ├─ Title: "RACI Matrix Generator"
│  ├─ Status: Validation indicator
│  └─ Auto-save status
│
├─ Left Sidebar (lg:col-span-4, sticky)
│  │
│  ├─ TemplateSelector (NEW)
│  │  ├─ Label: "Load Template"
│  │  ├─ Caption: Subtitle text
│  │  ├─ Template Grid
│  │  │  └─ Template Cards (3 items)
│  │  ├─ Show/Hide Preview Toggle
│  │  ├─ Preview Panel
│  │  │  ├─ Description
│  │  │  ├─ Roles Badges
│  │  │  ├─ Tasks List
│  │  │  └─ Coverage Stats
│  │  └─ Load Button
│  │
│  ├─ QuickPresets (NEW)
│  │  ├─ Label: "Quick Presets"
│  │  ├─ Caption: Subtitle text
│  │  ├─ Preset Grid
│  │  │  └─ Pattern Cards (6 items)
│  │  ├─ Selected Pattern Display
│  │  ├─ Apply Button
│  │  └─ Clear Button
│  │
│  ├─ PresetManager (NEW)
│  │  ├─ Label: "Custom Presets"
│  │  ├─ Caption: Subtitle text
│  │  ├─ Save Form (conditional)
│  │  │  ├─ Name Input
│  │  │  ├─ Description Textarea
│  │  │  ├─ Save Button
│  │  │  └─ Cancel Button
│  │  ├─ Save Trigger Button
│  │  └─ Presets List
│  │     └─ Preset Items (N items)
│  │        ├─ Name
│  │        ├─ Description
│  │        ├─ Created Date
│  │        ├─ Load Button
│  │        └─ Delete Button
│  │
│  ├─ Chart Details (Existing)
│  ├─ Description (Existing)
│  ├─ Roles Editor (Existing)
│  ├─ Tasks Editor (Existing)
│  ├─ Theme + Export (Existing)
│  └─ Reset Controls (Existing)
│
└─ Right Content (lg:col-span-8)
   ├─ Matrix Section (Existing)
   │  ├─ Headline
   │  ├─ RaciMatrixEditor
   │  └─ Status
   │
   └─ Tips Card (Existing)
```

---

## Component APIs

### TemplateSelector

**Location:** `src/components/raci/TemplateSelector.tsx`

**Props:**
```typescript
interface TemplateSelectorProps {
  onLoadTemplate: (template: RaciTemplate) => void
  isLoading?: boolean
}
```

**State:**
```typescript
const [selectedId, setSelectedId] = useState<string | null>()
const [showPreview, setShowPreview] = useState(false)
```

**Key Methods:**
- `handleLoad()` – Calls onLoadTemplate and closes
- `getTemplates()` – Loads all templates from config

**Rendered Elements:**
- Card wrapper
- Label + Caption
- Template grid (1-3 columns responsive)
- Template cards (clickable, selectable)
- Preview toggle button
- Preview panel (conditional)
  - Description
  - Roles badges
  - Tasks list
  - Coverage stats
- Load button (disabled if no selection)
- Info message

**Styles:**
- Card: `border border-slate-200 dark:border-slate-700 p-6`
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`
- Selected: `border-blue-500 bg-blue-50 dark:bg-blue-900/20`
- Template card: `p-4 rounded-lg transition-all`
- Preview: `bg-slate-50 dark:bg-slate-800 p-4`

**Dark Mode:** ✅ Supported with `dark:` variants

**Responsive:** ✅ Mobile-first design

**Accessibility:**
- ARIA labels on buttons
- Keyboard navigation: Tab, Enter, Escape
- Semantic HTML (button, div)

---

### QuickPresets

**Location:** `src/components/raci/QuickPresets.tsx`

**Props:**
```typescript
interface QuickPresetsProps {
  roles: RaciChart["roles"]
  tasks: RaciChart["tasks"]
  onApplyPreset: (matrix: RaciChart["matrix"]) => void
  isLoading?: boolean
}
```

**State:**
```typescript
const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
```

**Key Methods:**
- `handleApply(presetKey)` – Gets preset function, generates matrix, calls onApplyPreset
- `getQuickPresetInfo(key)` – Gets display name and description

**Rendered Elements:**
- Card wrapper (or disabled state card)
- Label + Caption
- Preset grid (1-2 columns responsive)
- Preset cards (clickable, selectable) x 6
  - Name
  - Description
- Selected preset info box (conditional)
- Apply button (disabled if no selection or no roles/tasks)
- Clear button (conditional)
- Help text

**Styles:**
- Disabled: `bg-slate-50 dark:bg-slate-800`
- Selected: `border-green-500 bg-green-50 dark:bg-green-900/20`
- Preset card: `p-4 rounded-lg border-2 transition-all`
- Info box: `p-3 bg-green-50 dark:bg-green-900/20 border border-green-200`

**Dark Mode:** ✅ Supported

**Responsive:** ✅ 1-2 columns

**Accessibility:**
- Disabled state when no roles/tasks
- Keyboard navigation
- ARIA labels

---

### PresetManager

**Location:** `src/components/raci/PresetManager.tsx`

**Props:**
```typescript
interface PresetManagerProps {
  currentMatrix: RaciChart["matrix"]
  onLoadPreset: (matrix: RaciChart["matrix"]) => void
  isLoading?: boolean
}
```

**State:**
```typescript
const [presets, setPresets] = useState<RaciPreset[]>([])
const [showSave, setShowSave] = useState(false)
const [presetName, setPresetName] = useState("")
const [presetDescription, setPresetDescription] = useState("")
const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
const [isSaving, setIsSaving] = useState(false)
```

**Effects:**
- Load presets on mount: `useEffect(() => { const saved = getCustomPresets() }, [])`

**Key Methods:**
- `handleSavePreset()` – Validates name, saves to localStorage, updates state
- `handleLoadPreset(preset)` – Calls onLoadPreset with preset matrix
- `handleDeletePreset(id)` – Confirms delete, removes from localStorage

**Rendered Elements:**
- Card wrapper
- Label + Caption
- Save form (conditional)
  - Preset Name input
  - Preset Description textarea
  - Save button
  - Cancel button
- Save trigger button (when form hidden)
- Presets list (scrollable)
  - Each preset item
    - Name (bold)
    - Description (gray)
    - Created date (small)
    - Load button
    - Delete button
- Empty state message

**Styles:**
- Card: `border border-slate-200 dark:border-slate-700 p-6`
- Input: `px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500`
- Preset item: `p-3 rounded-lg border-2 transition-all`
- Selected: `border-purple-500 bg-purple-50 dark:bg-purple-900/20`
- List: `max-h-64 overflow-y-auto`
- Button (Load): `text-xs px-2 py-1`
- Button (Delete): `text-red-600 dark:text-red-400`

**Dark Mode:** ✅ Supported

**Responsive:** ✅ Full width, scrollable list

**Accessibility:**
- Form validation
- Confirmation dialog on delete
- Clear error messages
- Keyboard navigation

---

## Component Properties Summary

| Component | Type | Lines | Props | State | Effects |
|-----------|------|-------|-------|-------|---------|
| TemplateSelector | FC | 200+ | 2 | 2 | 0 |
| QuickPresets | FC | 150+ | 4 | 1 | 0 |
| PresetManager | FC | 250+ | 3 | 7 | 1 |

---

## Data Flow Between Components

```
RaciGeneratorPage
│
├─ Manages state via useRaciState
│
├─ Handlers:
│  ├─ handleLoadTemplate(template)
│  │  └─ Calls: loadTemplate(roles, tasks, matrix, title, desc)
│  │
│  ├─ handleApplyPreset(matrix)
│  │  └─ Calls: loadPreset(matrix)
│  │
│  └─ handleLoadPreset(matrix)
│     └─ Calls: loadPreset(matrix)
│
└─ Props passed to components:
   ├─ TemplateSelector
   │  ├─ onLoadTemplate={handleLoadTemplate}
   │  └─ isLoading={isLoadingTemplate}
   │
   ├─ QuickPresets
   │  ├─ roles={chart.roles}
   │  ├─ tasks={chart.tasks}
   │  ├─ onApplyPreset={handleApplyPreset}
   │  └─ isLoading={isLoadingTemplate}
   │
   └─ PresetManager
      ├─ currentMatrix={chart.matrix}
      ├─ onLoadPreset={handleLoadPreset}
      └─ isLoading={isLoadingTemplate}
```

---

## Styled Components

All components use:
- **Tailwind CSS** classes
- **Dark mode** support via `dark:` variants
- **Responsive** design with `sm:`, `md:`, `lg:` prefixes
- **Accessibility** colors meeting WCAG AA

### Common Classes Used

**Cards:**
```
bg-white dark:bg-slate-900
border border-slate-200 dark:border-slate-700
rounded-lg
p-4 sm:p-6
```

**Buttons:**
```
px-3 py-2
rounded-lg
border
transition-all
focus:outline-none focus:ring-2 focus:ring-blue-500
```

**Text:**
```
text-slate-900 dark:text-slate-100
text-slate-600 dark:text-slate-400
text-slate-500 dark:text-slate-500
```

**States:**
```
Hover: hover:border-blue-300 dark:hover:border-blue-600
Active: border-blue-500 bg-blue-50 dark:bg-blue-900/20
Disabled: opacity-50 cursor-not-allowed
```

---

## Imports and Dependencies

### TemplateSelector Imports
```typescript
"use client"
import { useState } from "react"
import { RaciTemplate, getTemplates } from "@/lib/raci/templates"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label, Caption } from "@/components/Typography"
```

### QuickPresets Imports
```typescript
"use client"
import { useState } from "react"
import { QUICK_PRESETS, getQuickPresetInfo } from "@/lib/raci/templates"
import { RaciChart } from "@/types/raci"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label, Caption } from "@/components/Typography"
```

### PresetManager Imports
```typescript
"use client"
import { useState, useEffect } from "react"
import {
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  RaciPreset,
} from "@/lib/raci/templates"
import { RaciChart } from "@/types/raci"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label, Caption } from "@/components/Typography"
```

---

## Re-render Triggers

### TemplateSelector
- Selection changes → `selectedId` updates
- Preview toggle → `showPreview` updates
- Template load → calls `onLoadTemplate` (parent re-renders)

### QuickPresets
- Preset selection → `selectedPreset` updates
- Apply preset → calls `onApplyPreset` (parent re-renders)

### PresetManager
- Presets load → `presets` updates (mount)
- Show/hide form → `showSave` updates
- Save preset → `presets` updates, shows in list
- Load preset → calls `onLoadPreset` (parent re-renders)

---

## Error States

### TemplateSelector
- No templates available → Empty grid
- Preview fails → Still show template card

### QuickPresets
- No roles/tasks → Show disabled state with message
- Pattern generation fails → Console log, disable apply

### PresetManager
- localStorage fails → Show alert
- Preset corruption → Show error message
- Save fails → Show alert, don't add to list

---

## Performance Optimizations

```typescript
// useCallback memoization
const handleLoadTemplate = useCallback(
  (template) => { ... },
  [loadTemplate]  // dependencies
)

// Conditional rendering (expensive only if needed)
{showPreview && <PreviewPanel />}

// Scrollable list (not rendered if empty)
{presets.length > 0 && (
  <div className="max-h-64 overflow-y-auto">
    {presets.map(...)}
  </div>
)}
```

---

## Testing Checklist

- [ ] TemplateSelector loads all 3 templates
- [ ] Template preview shows correct data
- [ ] Load template button calls handler
- [ ] QuickPresets disabled without roles/tasks
- [ ] Quick preset selection works
- [ ] Apply preset calls handler with matrix
- [ ] Save preset form validates name
- [ ] Preset saves to localStorage
- [ ] Preset appears in list
- [ ] Load preset calls handler
- [ ] Delete preset removes from list
- [ ] All components responsive on mobile
- [ ] Dark mode colors correct
- [ ] Keyboard navigation works
- [ ] No console errors

---

**Next:** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for API details.
