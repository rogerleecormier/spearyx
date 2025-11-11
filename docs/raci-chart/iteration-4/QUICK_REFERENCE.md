# Iteration 4: Quick Reference – Complete API Documentation

**Status:** ✅ Complete  
**Updated:** 2024

---

## Table of Contents

1. [Core Functions](#core-functions)
2. [Component APIs](#component-apis)
3. [State Management](#state-management)
4. [Data Structures](#data-structures)
5. [Quick Patterns](#quick-patterns)
6. [Configuration](#configuration)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Core Functions

### lib/raci/templates.ts

#### Template Retrieval

```typescript
/**
 * Get all available demo templates
 * @returns Array of 3 template objects (mobile-app, web-redesign, crm-migration)
 */
function getTemplates(): RaciTemplate[];

// Example
const templates = getTemplates();
// Returns: [
//   { id: "mobile-app", name: "Mobile App Development", ... },
//   { id: "web-redesign", name: "Web Redesign Project", ... },
//   { id: "crm-migration", name: "CRM Migration", ... }
// ]
```

```typescript
/**
 * Get single template by ID
 * @param id Template ID (e.g., "mobile-app")
 * @returns Template object or null if not found
 */
function getTemplateById(id: string): RaciTemplate | null;

// Example
const template = getTemplateById("mobile-app");
if (template) {
  console.log(template.name); // "Mobile App Development"
}
```

#### Template Validation

```typescript
/**
 * Validate template structure
 * @param template Template to validate
 * @returns { isValid: boolean, errors: string[] }
 */
function validateTemplate(template: RaciTemplate): {
  isValid: boolean;
  errors: string[];
};

// Example
const result = validateTemplate(template);
if (result.isValid) {
  console.log("Template is valid!");
} else {
  console.log("Errors:", result.errors);
  // ["Template must have roles", "Task 'xyz' not found"]
}
```

#### Template Loading

```typescript
/**
 * Load template and create new chart
 * @param template Template to load
 * @param partial Optional overrides for chart properties
 * @returns New RaciChart with template data
 */
function loadTemplate(
  template: RaciTemplate,
  partial?: Partial<RaciChart>
): RaciChart;

// Example
const template = getTemplateById("mobile-app")!;
const chart = loadTemplate(template, {
  title: "My Mobile App Project",
});
console.log(chart.roles.length); // 5
console.log(chart.tasks.length); // 5
console.log(chart.matrix["pm"]); // { req: "A", arch: "C", ... }
```

#### Preset Matrix Loading

```typescript
/**
 * Apply preset matrix to existing chart (keeps roles/tasks)
 * @param chart Current chart
 * @param preset Partial matrix to merge
 * @returns Updated chart with new matrix
 */
function loadPresetMatrix(
  chart: RaciChart,
  preset: Partial<RaciChart["matrix"]>
): RaciChart;

// Example
const preset = QUICK_PRESETS.allResponsible(roleIds, taskIds);
const updated = loadPresetMatrix(chart, preset);
```

---

### Custom Presets

#### Get Presets

```typescript
/**
 * Get all custom presets from localStorage
 * @returns Array of saved presets
 */
function getCustomPresets(): RaciPreset[];

// Example
const presets = getCustomPresets();
console.log(presets.length); // 2
console.log(presets[0].name); // "Mobile App Standard"
```

#### Save Preset

```typescript
/**
 * Save current matrix as custom preset
 * @param preset Preset data (name, description, matrix)
 * @returns Saved preset with id, timestamps
 * @throws Error if localStorage quota exceeded
 */
function saveCustomPreset(
  preset: Omit<RaciPreset, "id" | "createdAt" | "updatedAt">
): RaciPreset;

// Example
const saved = saveCustomPreset({
  name: "Mobile App Standard",
  description: "Our standard pattern for mobile projects",
  matrix: chart.matrix,
});
console.log(saved.id); // "preset-1234567890-abc123"
console.log(saved.createdAt); // "2024-01-15T10:30:00Z"
```

#### Update Preset

```typescript
/**
 * Update existing custom preset
 * @param id Preset ID
 * @param updates Partial preset updates
 * @returns Updated preset or null if not found
 */
function updateCustomPreset(
  id: string,
  updates: Partial<RaciPreset>
): RaciPreset | null;

// Example
const updated = updateCustomPreset(presetId, {
  name: "Updated Name",
  description: "New description",
});
if (updated) {
  console.log("Preset updated!");
}
```

#### Delete Preset

```typescript
/**
 * Delete custom preset from localStorage
 * @param id Preset ID
 * @returns true if deleted, false if not found
 */
function deleteCustomPreset(id: string): boolean;

// Example
const success = deleteCustomPreset(presetId);
if (success) {
  console.log("Preset deleted!");
} else {
  console.log("Preset not found");
}
```

---

### Quick Preset Patterns

```typescript
/**
 * Quick preset generator functions
 * All take (roleIds: string[], taskIds: string[]) => Record<...>
 */
QUICK_PRESETS = {
  // All roles responsible for all tasks
  allResponsible: (roleIds, taskIds) => ({...})

  // All roles accountable for all tasks
  allAccountable: (roleIds, taskIds) => ({...})

  // Each task has exactly one accountable role (rotated)
  oneAccountablePerTask: (roleIds, taskIds) => ({...})

  // First role (CEO/Lead) accountable, others R or C
  leaderAccountable: (roleIds, taskIds) => ({...})

  // Accountability distributed across roles
  distributed: (roleIds, taskIds) => ({...})

  // Strict model: Role 0 = R, Role 1 = A, others = C/I
  executionModel: (roleIds, taskIds) => ({...})
}

// Example
const matrix = QUICK_PRESETS.oneAccountablePerTask(
  ["role1", "role2", "role3"],
  ["task1", "task2"]
)
// Returns:
// {
//   role1: { task1: "A", task2: "R" },
//   role2: { task1: "R", task2: "A" },
//   role3: { task1: "C", task2: "C" }
// }
```

#### Get Preset Info

```typescript
/**
 * Get display name and description for preset key
 * @param presetKey Key from QUICK_PRESETS
 * @returns { name, description }
 */
function getQuickPresetInfo(presetKey: string): {
  name: string;
  description: string;
};

// Example
const info = getQuickPresetInfo("oneAccountablePerTask");
// { name: "One Accountable per Task", description: "Each task has exactly one accountable role" }
```

---

## Component APIs

### TemplateSelector

```typescript
<TemplateSelector
  onLoadTemplate: (template: RaciTemplate) => void
  isLoading?: boolean
/>
```

**Props:**

- `onLoadTemplate` – Called when user clicks "Load Template" button
- `isLoading` – Show loading state during template application

**Features:**

- Displays all 3 demo templates
- Grid layout with template cards
- Hover effects and active state
- "Show Preview" toggle
- Preview shows roles, tasks, coverage
- Responsive design

**Events:**

```typescript
// When user clicks "Load Template"
onLoadTemplate(template);
// { id, name, description, roles[], tasks[], matrix }
```

**Styling:**

- Uses Tailwind CSS
- Dark mode support with `dark:` variants
- Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
- Blue accent color (#3b82f6)

---

### QuickPresets

```typescript
<QuickPresets
  roles: RaciChart["roles"]
  tasks: RaciChart["tasks"]
  onApplyPreset: (matrix: RaciChart["matrix"]) => void
  isLoading?: boolean
/>
```

**Props:**

- `roles` – Current chart roles (disables if empty)
- `tasks` – Current chart tasks (disables if empty)
- `onApplyPreset` – Called with matrix when pattern selected
- `isLoading` – Show loading state

**Features:**

- 6 preset pattern options
- Grid layout
- Selection highlighting
- Description display
- Disabled state when no roles/tasks
- Clear/cancel button

**Events:**

```typescript
// When user clicks "Apply Preset"
onApplyPreset(matrix);
// Record<roleId, Record<taskId, RaciValue>>
```

**Disabled Conditions:**

- No roles defined
- No tasks defined
- Both must be present to enable

---

### PresetManager

```typescript
<PresetManager
  currentMatrix: RaciChart["matrix"]
  onLoadPreset: (matrix: RaciChart["matrix"]) => void
  isLoading?: boolean
/>
```

**Props:**

- `currentMatrix` – Current matrix (sent to save)
- `onLoadPreset` – Called when user clicks "Load" button
- `isLoading` – Show loading state

**Features:**

- Save current matrix as preset
- List all saved presets
- Load preset with click
- Delete preset with confirmation
- Shows creation date
- Scrollable list (max-height: 256px)
- Inline edit (future)

**Events:**

```typescript
// When user clicks "Load"
onLoadPreset(preset.matrix);

// When user clicks "Save"
// Automatically saves to localStorage
// onLoadPreset NOT called on save
```

**Save Form:**

- Text input for preset name (required)
- Textarea for description (optional)
- Save button (disabled if name empty)
- Cancel button

**Preset List:**

- Shows preset name (bold)
- Shows description (gray, smaller)
- Shows creation date (smallest)
- Load button (blue)
- Delete button (red)
- Confirmation dialog on delete

---

## State Management

### New Reducer Actions

#### loadTemplate Action

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

**Effect:**

- Sets `chart.roles = payload.roles`
- Sets `chart.tasks = payload.tasks`
- Sets `chart.matrix = payload.matrix`
- Sets `chart.title = payload.title || current title`
- Sets `chart.description = payload.description || current description`
- Updates `chart.updatedAt` to now

**Used by:**

- `RaciGeneratorPage.handleLoadTemplate()`

---

#### loadPreset Action

```typescript
dispatch({
  type: "loadPreset",
  payload: {
    matrix: Record<string, Record<string, RaciValue>>,
  },
});
```

**Effect:**

- Merges `chart.matrix` with payload matrix
- Keeps existing roles, tasks, title, description unchanged
- Updates `chart.updatedAt` to now

**Used by:**

- `RaciGeneratorPage.handleApplyPreset()`
- `RaciGeneratorPage.handleLoadPreset()`

---

### New Hook Callbacks

```typescript
const {
  // NEW
  loadTemplate: (roles, tasks, matrix, title?, desc?) => void
  loadPreset: (matrix) => void

  // Existing (unchanged)
  addRole, editRole, deleteRole, reorderRoles,
  addTask, editTask, deleteTask, reorderTasks,
  updateTitle, updateLogo, updateDescription,
  updateMatrix, updateTheme, reset, setState
} = useRaciState()
```

**loadTemplate:**

```typescript
loadTemplate(roles, tasks, matrix, "New Title", "New Description");
// Dispatches: { type: "loadTemplate", payload: {...} }
```

**loadPreset:**

```typescript
loadPreset(quickPresetMatrix);
// Dispatches: { type: "loadPreset", payload: { matrix } }
```

---

## Data Structures

### RaciTemplate

```typescript
interface RaciTemplate {
  id: string; // "mobile-app", "web-redesign", etc.
  name: string; // "Mobile App Development"
  description: string; // "E-commerce mobile project"
  roles: RaciRole[]; // [{ id, name, order }, ...]
  tasks: RaciTask[]; // [{ id, name, description, order }, ...]
  matrix: RaciChart["matrix"]; // { roleId: { taskId: "R"|"A"|"C"|"I"|null } }
}
```

### RaciPreset

```typescript
interface RaciPreset {
  id: string; // "preset-1234567890-abc123"
  name: string; // "Mobile App Standard"
  description: string; // "Our standard mobile project template"
  matrix: RaciChart["matrix"]; // { roleId: { taskId: "R"|"A"|"C"|"I" } }
  createdAt: string; // "2024-01-15T10:30:00Z"
  updatedAt: string; // "2024-01-15T10:30:00Z"
}
```

---

## Quick Patterns

### Pattern Examples

#### All Responsible

```
     Task1  Task2  Task3
Role1  R      R      R
Role2  R      R      R
Role3  R      R      R
```

**Use:** Highly collaborative tasks

#### One Accountable per Task

```
     Task1  Task2  Task3
Role1  A      R      C
Role2  R      A      C
Role3  C      C      A
```

**Use:** Clear single owner per task

#### Leader Accountable

```
     Task1  Task2  Task3
CEO    A      A      A
Mgr    R      R      R
Dev    C      C      C
```

**Use:** Hierarchical organizations

---

## Configuration

### templates.json Structure

```json
{
  "template-id": {
    "id": "template-id",
    "name": "Display Name",
    "description": "What this template is for",
    "roles": [{ "id": "role-1", "name": "Role Name", "order": 0 }],
    "tasks": [
      {
        "id": "task-1",
        "name": "Task Name",
        "description": "Details",
        "order": 0
      }
    ],
    "matrix": {
      "role-1": {
        "task-1": "R",
        "task-2": "A"
      }
    }
  }
}
```

### localStorage Schema

**Key:** `raci_custom_presets`

**Value:**

```json
[
  {
    "id": "preset-1234567890-abc123",
    "name": "Mobile App Standard",
    "description": "Our standard pattern",
    "matrix": { "roleId": { "taskId": "R" } },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Common Tasks

### Load a Template

```typescript
const template = getTemplateById("mobile-app");
if (template) {
  const newChart = loadTemplate(template);
  // Use newChart...
}
```

Or via component:

```typescript
<TemplateSelector
  onLoadTemplate={(template) => {
    // Apply template
  }}
/>
```

---

### Apply a Quick Preset

```typescript
const matrix = QUICK_PRESETS.oneAccountablePerTask(
  chart.roles.map((r) => r.id),
  chart.tasks.map((t) => t.id)
);
loadPreset(matrix);
```

Or via component:

```typescript
<QuickPresets
  roles={chart.roles}
  tasks={chart.tasks}
  onApplyPreset={(matrix) => {
    loadPreset(matrix)
  }}
/>
```

---

### Save Custom Preset

```typescript
const preset = saveCustomPreset({
  name: "My Pattern",
  description: "What it's for",
  matrix: chart.matrix,
});

console.log(preset.id); // Use this to load later
```

Or via component:

```typescript
<PresetManager
  currentMatrix={chart.matrix}
  onLoadPreset={(matrix) => {
    loadPreset(matrix)
  }}
/>
```

---

### Load Custom Preset

```typescript
const presets = getCustomPresets();
const preset = presets.find((p) => p.id === presetId);

if (preset) {
  loadPreset(preset.matrix);
}
```

---

### List All Presets

```typescript
const presets = getCustomPresets();

presets.forEach((preset) => {
  console.log(preset.name);
  console.log(preset.description);
  console.log(preset.createdAt);
});
```

---

### Validate Template

```typescript
const template = getTemplateById("mobile-app")!;
const validation = validateTemplate(template);

if (!validation.isValid) {
  console.error("Invalid template:", validation.errors);
} else {
  console.log("Template is valid!");
}
```

---

## Troubleshooting

### "Template not found"

```typescript
const template = getTemplateById("invalid-id");
if (!template) {
  console.error("Template not found");
  // Use getTemplates() to see valid IDs
  const available = getTemplates();
  console.log(available.map((t) => t.id));
}
```

### "localStorage quota exceeded"

```typescript
try {
  saveCustomPreset({...})
} catch (error) {
  console.error("Quota exceeded:", error)
  // Delete old presets and try again
  const presets = getCustomPresets()
  if (presets.length > 0) {
    deleteCustomPreset(presets[0].id)
  }
}
```

### "Preset not saving"

Check browser dev tools:

```javascript
// In browser console
localStorage.getItem("raci_custom_presets");
// Should return JSON string of presets
```

If empty or missing:

1. Check browser storage enabled
2. Check domain is same (localhost:3000 ≠ localhost:3001)
3. Try private/incognito mode
4. Check browser quota not full

### "Quick presets not appearing"

```typescript
// Check roles and tasks exist
if (chart.roles.length === 0 || chart.tasks.length === 0) {
  console.log("Add roles and tasks first");
}

// Check preset function returns matrix
const matrix = QUICK_PRESETS.allResponsible(["r1", "r2"], ["t1", "t2"]);
console.log(Object.keys(matrix)); // ["r1", "r2"]
```

### "Matrix not updating after load"

```typescript
// Verify action was dispatched
dispatch({
  type: "loadPreset",
  payload: { matrix: newMatrix },
});

// Check matrix structure
console.log(Object.entries(newMatrix));
// Should have entries like ["roleId", { taskId: "R", ... }]

// Check RaciMatrixEditor re-rendered
// Add console.log in component render
```

---

## Browser Support

```
Chrome:       ✅ Full support
Firefox:      ✅ Full support
Safari:       ✅ Full support
Edge:         ✅ Full support
IE 11:        ❌ Not supported
Mobile:       ✅ Full support (iOS Safari, Chrome Mobile)
```

---

**Tip:** For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md) or [START_HERE.md](./START_HERE.md).
