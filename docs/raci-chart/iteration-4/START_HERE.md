# Iteration 4: Templates & Presets – Quick Start Guide

**Duration:** 5-10 minutes  
**Last Updated:** 2024  
**Status:** ✅ Complete & Production-Ready

---

## What's New in Iteration 4?

Iteration 4 introduces **template loading**, **quick presets**, and **custom preset management** to dramatically accelerate RACI chart creation.

### Key Features Added

1. **Template Loader** – Load pre-configured demo templates
2. **Quick Presets** – Apply common RACI assignment patterns instantly
3. **Custom Presets** – Save, load, and manage your own matrix presets
4. **Template Preview** – See what you're loading before applying

---

## Getting Started in 5 Minutes

### Step 1: Load a Demo Template (30 seconds)

1. Open the RACI Matrix Generator
2. Look at the **Load Template** card in the left sidebar
3. Select a template:
   - **Mobile App Development** – E-commerce mobile project
   - **Web Redesign Project** – Marketing & design project
   - **CRM Migration** – Enterprise system migration
4. Click "Show Preview" to see roles, tasks, and matrix coverage
5. Click **Load Template** to apply it

→ Your chart is now pre-filled with roles, tasks, and initial assignments!

### Step 2: Apply a Quick Preset (15 seconds)

1. After adding roles and tasks to your chart, see the **Quick Presets** card
2. Select a preset pattern:
   - **All Responsible** – Everyone does everything
   - **All Accountable** – Everyone is accountable
   - **One Accountable per Task** – Each task has one owner
   - **Leader Accountable** – CEO/Lead owns all tasks
   - **Distributed Accountability** – Spread responsibility
   - **Execution Model** – Strict R+A+C+I pattern
3. Click **Apply Preset**

→ Your matrix is instantly filled with the pattern!

### Step 3: Save a Custom Preset (30 seconds)

1. Build your matrix however you like
2. Find the **Custom Presets** card at the bottom of the sidebar
3. Click **Save Current Matrix as Preset**
4. Enter a name (e.g., "Mobile App Standard")
5. Optionally add a description
6. Click **Save Preset**

→ Your preset is saved to browser storage and appears in the list below!

### Step 4: Load Your Custom Preset (10 seconds)

1. Click the **Load** button on any saved preset
2. Your matrix updates instantly!

---

## Template Architecture

### Three Components

```
TemplateSelector          → Load demo templates from config
    ↓
RaciGeneratorPage        → Orchestrates all three components
    ↑ ↑
QuickPresets   +   PresetManager
    ↓                      ↓
Apply patterns             Save/load custom presets
to existing chart          to localStorage
```

### Data Flow

```
User selects template
         ↓
TemplateSelector.onLoadTemplate()
         ↓
RaciGeneratorPage.handleLoadTemplate()
         ↓
loadTemplate utility creates new chart
         ↓
loadTemplate reducer action
         ↓
Chart state updated with new roles/tasks/matrix
         ↓
RaciMatrixEditor re-renders with new data
```

---

## File Structure

```
src/
├── lib/raci/
│   └── templates.ts              # Template utilities & quick presets
├── components/raci/
│   ├── TemplateSelector.tsx       # Template loader UI
│   ├── QuickPresets.tsx           # Quick preset patterns
│   ├── PresetManager.tsx          # Custom preset manager
│   └── RaciGeneratorPage.tsx      # Main integration point
└── types/
    └── raci.ts                    # Updated with loadTemplate/loadPreset actions

src/config/
└── templates.json                 # Demo templates
```

---

## Core Functions (lib/raci/templates.ts)

### Template Loading

```typescript
// Get all available templates
getTemplates(): RaciTemplate[]

// Get single template by ID
getTemplateById(id: string): RaciTemplate | null

// Validate template structure
validateTemplate(template): { isValid, errors }

// Apply template to create chart
loadTemplate(template, partial?): RaciChart

// Apply preset matrix to existing chart
loadPresetMatrix(chart, preset): RaciChart
```

### Custom Presets (localStorage)

```typescript
// Get all saved presets
getCustomPresets(): RaciPreset[]

// Save new preset
saveCustomPreset(preset): RaciPreset

// Delete preset by ID
deleteCustomPreset(id: string): boolean

// Update existing preset
updateCustomPreset(id, updates): RaciPreset | null
```

### Quick Preset Patterns

```typescript
QUICK_PRESETS = {
  allResponsible,          // All R
  allAccountable,          // All A
  oneAccountablePerTask,   // Rotate A per task
  leaderAccountable,       // CEO A, others R/C
  distributed,             // Spread A across roles
  executionModel           // Strict R+A+C+I
}
```

---

## Component APIs

### TemplateSelector

```typescript
<TemplateSelector
  onLoadTemplate={(template) => {}}  // Called when user clicks Load
  isLoading={boolean}                 // Show loading state
/>
```

**Features:**
- Grid display of all templates
- Preview panel showing roles, tasks, coverage
- Select/deselect templates
- Responsive grid layout

### QuickPresets

```typescript
<QuickPresets
  roles={chart.roles}                  // Current roles
  tasks={chart.tasks}                  // Current tasks
  onApplyPreset={(matrix) => {}}       // Called when pattern selected
  isLoading={boolean}                  // Show loading state
/>
```

**Features:**
- 6 preset pattern options
- Disabled when no roles/tasks
- Preview of selected pattern
- Clear/cancel button

### PresetManager

```typescript
<PresetManager
  currentMatrix={chart.matrix}         // Matrix to save
  onLoadPreset={(matrix) => {}}        // Called when load button clicked
  isLoading={boolean}                  // Show loading state
/>
```

**Features:**
- Save current matrix as preset
- List all saved presets
- Load preset with one click
- Delete preset with confirmation
- Shows creation date
- Scrollable list for many presets

---

## State Management

### New Reducer Actions

**loadTemplate:**
```typescript
dispatch({
  type: "loadTemplate",
  payload: {
    roles: RaciRole[],
    tasks: RaciTask[],
    matrix: Record<string, Record<string, RaciValue>>,
    title?: string,
    description?: string
  }
})
```

**loadPreset:**
```typescript
dispatch({
  type: "loadPreset",
  payload: {
    matrix: Record<string, Record<string, RaciValue>>
  }
})
```

### New Hook Callbacks (useRaciState)

```typescript
const {
  loadTemplate,  // (roles, tasks, matrix, title?, desc?) => void
  loadPreset,    // (matrix) => void
  // ... existing callbacks
} = useRaciState()
```

---

## Persistence

### localStorage Structure

**Presets stored at:** `localStorage.raci_custom_presets`

**Format:**
```typescript
[
  {
    id: "preset-1234567890-abc123",
    name: "Mobile App Standard",
    description: "Common pattern for mobile development",
    matrix: { ... },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  // ... more presets
]
```

**Auto-synced on:**
- Save new preset
- Update preset
- Delete preset

**Loaded on:** `PresetManager` mount

---

## Common Use Cases

### Use Case 1: Quick Team Setup
1. Load "Mobile App Development" template
2. Adjust roles/tasks if needed
3. Click "Save as Preset"
4. Reuse for next sprint!

### Use Case 2: Multiple Project Types
1. Create matrix for "Project Type A"
2. Save as "Type A Standard"
3. Create matrix for "Project Type B"
4. Save as "Type B Standard"
5. Switch between projects instantly

### Use Case 3: Template Experimentation
1. Load "One Accountable per Task" preset
2. Compare with "Distributed Accountability"
3. Save the best one as custom preset
4. Use as team standard

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Templates | ✅ | ✅ | ✅ | ✅ |
| Quick Presets | ✅ | ✅ | ✅ | ✅ |
| Custom Presets | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |

**Note:** Custom presets use `localStorage`, which persists per domain/port.

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Select template | Click template card |
| Show preview | Click "Show Preview" |
| Load template | Click "Load Template" or press Enter |
| Apply preset | Click "Apply Preset" or press Enter |
| Save preset | Click "Save Preset" or press Enter |
| Cancel | Press Escape or click "Cancel" |

---

## Troubleshooting

### Templates not loading?
- Check `src/config/templates.json` exists
- Verify template IDs are unique
- Check browser console for errors

### Presets not saving?
- Check browser localStorage quota not exceeded
- Clear old presets if needed
- Try different browser if issue persists

### Matrix not updating?
- Verify roles/tasks exist
- Check console for reducer errors
- Try clearing and reloading

### Can't find custom preset?
- Check `localStorage.raci_custom_presets` in browser dev tools
- Presets are per domain (e.g., localhost:3000 ≠ localhost:3001)
- Delete and re-save preset if corrupted

---

## Next Steps

1. **[Read ARCHITECTURE.md](./ARCHITECTURE.md)** for design decisions
2. **[Check QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** for complete API docs
3. **[Review COMPONENT_STRUCTURE.md](./COMPONENT_STRUCTURE.md)** for component hierarchy
4. **[Run COMPLETION_CHECKLIST.md](./COMPLETION_CHECKLIST.md)** to verify setup

---

## Quick Links

- **Project Plan:** `/references/PROJECT_PLAN_RACI_GENERATOR.md`
- **Templates Config:** `/src/config/templates.json`
- **Template Utilities:** `/src/lib/raci/templates.ts`
- **Main Page:** `/src/components/raci/RaciGeneratorPage.tsx`
- **State Management:** `/src/lib/raci/state.ts`

---

## Support

Need help? Check these resources:

1. **START_HERE.md** ← You are here
2. ARCHITECTURE.md – Design decisions
3. QUICK_REFERENCE.md – Complete API reference
4. COMPLETION_CHECKLIST.md – Test scenarios
5. Browser console – Error messages and logs

**Time Estimate:** Setup should take 5-10 minutes total.

**Ready to get started?** Load a template and start building your RACI chart! 🚀
