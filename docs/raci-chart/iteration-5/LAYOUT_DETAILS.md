# Iteration 5: Export – UI/UX Layout & Styling Details

**Status:** ✅ Complete  
**Updated:** 2025-11-10

---

## Export Button Placement

### Current Layout

The Export button is placed in the **left sidebar** under the **Settings** section:

```
Left Sidebar (3 columns)
├── Quick Setup
│   ├── Templates
│   ├── Presets
│   └── Custom Presets
│
└── Settings (space-y-3)
    ├── Theme (Card)
    │   └── ThemeSelector dropdown
    │
    ├── Export (Card) ← NEW
    │   └── ExportButtons component
    │
    └── Danger Zone (Card)
        └── ResetControls
```

### Card Structure

```
┌─────────────────────────────────────┐
│ Export                              │ (CardHeader)
├─────────────────────────────────────┤
│ [Format Dropdown ▼]                 │ (CardContent)
│ [Export Button]                     │
│ Estimated size: 450 KB              │
│ ┌─────────────────────────────────┐ │
│ │ █████░░░░░░░░░░ 45%            │ │ (Progress overlay)
│ │ Rendering matrix...             │ │
│ │         [Cancel]                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Component Styling

### Theme Colors Applied

**Brand Theme: Website Default**
```
Primary:   #DC2626 (Red)
Accent:    #059669 (Emerald)
Background: #ffffff (White)
Text:      #0f172a (Slate)
Border:    #e2e8f0 (Light Slate)
```

### Card Styling

```css
.export-card {
  border: 1px solid #e2e8f0;           /* border-slate-200 */
  border-radius: 0.5rem;                /* rounded-lg */
  background: #ffffff;                  /* white */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* shadow-sm */
  transition: box-shadow 0.2s;           /* transition-shadow */
}

.export-card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* shadow-md */
}
```

### CardHeader Styling

```css
.card-header {
  padding: 1rem 1.5rem 0.75rem;         /* pb-3 */
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-size: 0.875rem;                  /* text-xs */
  font-weight: 600;                     /* font-semibold */
  color: #0f172a;                       /* text-slate-700 */
}
```

### CardContent Styling

```css
.card-content {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;                         /* space-y-3 */
}
```

---

## Format Selector Styling

### Dropdown Select Element

```css
.format-selector {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;            /* border-slate-300 */
  border-radius: 0.375rem;              /* rounded-md */
  background: #ffffff;
  color: #0f172a;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.format-selector:hover:not(:disabled) {
  border-color: #94a3b8;                /* border-slate-400 */
  background: #f8fafc;                  /* bg-slate-50 */
}

.format-selector:focus {
  outline: none;
  ring: 2px;
  ring-color: #DC2626;                  /* ring-red-600 */
  border-color: transparent;
}

.format-selector:disabled {
  background: #f1f5f9;                  /* bg-slate-100 */
  color: #94a3b8;                       /* text-slate-400 */
  cursor: not-allowed;
}
```

### Options

```
Choose export format...
├── PDF Document (professional)
├── Excel Spreadsheet (data)
├── CSV Data (raw)
├── PNG Image (presentation)
└── PowerPoint (slides)
```

---

## Export Button Styling

### Button Element

```css
.export-button {
  width: 100%;
  padding: 0.5rem 1rem;
  background: #DC2626;                  /* bg-red-600 */
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.export-button:hover:not(:disabled) {
  background: #B91C1C;                  /* bg-red-700 */
  box-shadow: 0 4px 6px rgba(220,38,38,0.2);
}

.export-button:active:not(:disabled) {
  background: #991B1B;                  /* bg-red-800 */
}

.export-button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  ring: 2px;
  ring-color: #DC2626;
  ring-offset: 2px;
}

.export-button:disabled {
  background: #d1d5db;                  /* bg-gray-300 */
  color: #9ca3af;                       /* text-gray-400 */
  cursor: not-allowed;
}
```

### Button States

**Normal:**
```
[⬇️  Export]  (bg-red-600, text-white)
```

**Hover:**
```
[⬇️  Export]  (bg-red-700, shadow-md)
```

**Loading:**
```
[⏳ Exporting...]  (bg-red-600, spinner animated)
```

**Disabled:**
```
[⬇️  Export]  (bg-gray-300, text-gray-400, cursor: not-allowed)
```

---

## File Size Estimate Styling

### Size Text

```css
.size-estimate {
  font-size: 0.75rem;                   /* text-xs */
  color: #64748b;                       /* text-slate-600 */
  font-weight: 400;
  line-height: 1.5;
}
```

### Display

```
Estimated size: 450 KB
```

---

## Progress Indicator Styling

### Overlay Container

```css
.progress-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);       /* bg-black/50 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
```

### Progress Card

```css
.progress-card {
  background: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 448px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
```

### Progress Bar

```css
.progress-bar-container {
  width: 100%;
  background: #e2e8f0;                  /* bg-slate-200 */
  border-radius: 9999px;
  height: 0.5rem;                       /* h-2 */
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-bar-fill {
  background: #DC2626;                  /* bg-red-600 */
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}
```

### Status Message

```css
.status-message {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.5rem;
}
```

### Percentage

```css
.percentage {
  text-align: right;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 1rem;
}
```

### Progress Display

```
Rendering matrix...
├─ ▓▓▓▓▓░░░░░░░░░░  45%
├─ [Cancel Button]
└─ (Overlay centered on screen)
```

---

## Error Modal Styling

### Modal Container

```css
.error-modal {
  background: #ffffff;
  border: 1px solid #fee2e2;            /* border-red-100 */
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
```

### Title

```css
.error-title {
  font-size: 1.125rem;                  /* text-lg */
  font-weight: 600;
  color: #7F1D1D;                       /* text-red-900 */
  margin-bottom: 0.5rem;
}
```

### Message

```css
.error-message {
  font-size: 0.875rem;
  color: #DC2626;                       /* text-red-600 */
  margin-bottom: 1rem;
  line-height: 1.5;
}
```

### Action Buttons

```css
.error-button-group {
  display: flex;
  gap: 0.5rem;
}

.button-close {
  flex: 1;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  border-radius: 0.375rem;
  cursor: pointer;
}

.button-retry {
  flex: 1;
  padding: 0.5rem 1rem;
  background: #DC2626;
  color: #ffffff;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
```

---

## Responsive Behavior

### Mobile (< 768px)

**Layout:**
- Full-width export card
- Dropdown takes full width
- Button takes full width
- Progress overlay scales to fit

**Styling:**
```css
.export-card {
  max-width: 100%;
  margin: 0;
}

.format-selector,
.export-button {
  width: 100%;
  font-size: 0.875rem;
}
```

### Tablet (768px - 1024px)

**Layout:**
- Card width constrained
- All elements full width within card
- Similar to mobile

### Desktop (> 1024px)

**Layout:**
- Card in fixed width sidebar (3 columns)
- All elements full width within card
- Standard padding and spacing

---

## Typography

### Headings

**Label (Export):**
- Font: Inter, sans-serif
- Size: 0.75rem (12px)
- Weight: 600 (semibold)
- Color: #0f172a (slate-700)
- Line height: 1.5

### Body Text

**Size estimate:**
- Font: Inter, sans-serif
- Size: 0.75rem (12px)
- Weight: 400 (normal)
- Color: #64748b (slate-600)
- Line height: 1.5

**Option labels:**
- Font: Inter, sans-serif
- Size: 0.875rem (14px)
- Weight: 400 (normal)
- Color: #0f172a (slate-900)

**Status message:**
- Font: Inter, sans-serif
- Size: 0.875rem (14px)
- Weight: 500 (medium)
- Color: #0f172a (slate-900)

---

## Spacing

### Vertical Spacing (space-y-3)

```
[Format Selector]
     ↓ 0.75rem
[Export Button]
     ↓ 0.75rem
[Size Estimate]
```

### Padding

**Card Header:** `pb-3` (0.75rem bottom)
**Card Content:** `p-4` (1rem)
**Button:** `px-4 py-2` (1rem horiz, 0.5rem vert)
**Progress Card:** `p-6` (1.5rem)

### Margins

**Between sections:** 1rem (space-y-4)
**Between steps:** 2rem (space-y-8)

---

## Color Scheme

### Primary Colors (Export UI)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Button background | Red-600 | #DC2626 | Export button |
| Button hover | Red-700 | #B91C1C | Hover state |
| Button active | Red-800 | #991B1B | Active state |
| Progress bar | Red-600 | #DC2626 | Progress fill |

### Secondary Colors

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Border | Slate-200 | #e2e8f0 | Card border |
| Background | White | #ffffff | Card background |
| Text | Slate-900 | #0f172a | Primary text |
| Text secondary | Slate-600 | #64748b | Secondary text |
| Disabled | Gray-300 | #d1d5db | Disabled state |

### Feedback Colors

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Error | Red-600 | #DC2626 | Error messages |
| Success | Green-600 | #16a34a | Success feedback |
| Warning | Amber-500 | #f59e0b | Warning messages |
| Info | Blue-600 | #2563eb | Information |

---

## Accessibility Features

### Focus Indicators

```css
/* Red ring on focus */
.export-button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.5);
}
```

### High Contrast

All text meets WCAG AA standard:
- **Normal text:** 7:1 contrast ratio
- **Large text:** 4.5:1 contrast ratio

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between fields |
| `Shift+Tab` | Move backward |
| `Space` | Open dropdown |
| `Enter` | Activate button |
| `Esc` | Close modal/dropdown |
| `E` | Focus export button |

---

## Animation & Transitions

### Smooth Transitions

```css
.export-button {
  transition: all 0.2s ease-in-out;
}

.progress-bar-fill {
  transition: width 0.3s ease;
}

.export-card {
  transition: box-shadow 0.2s ease;
}
```

### Loading Animation

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

## Dark Mode Considerations

**Note:** Current implementation uses light theme only (matches site theme)

If dark mode is added in future:
```css
@media (prefers-color-scheme: dark) {
  .export-card {
    background: #1e293b;                /* slate-800 */
    border-color: #334155;              /* slate-700 */
  }
  
  .format-selector {
    background: #0f172a;                /* slate-900 */
    color: #f1f5f9;                     /* slate-100 */
  }
}
```

---

## Print Styling

```css
@media print {
  .export-card {
    display: none;                      /* Hide export UI when printing */
  }
}
```

---

**Status:** ✅ UI/UX Layout Documentation Complete
