# Iteration 6 Component Reference Guide

## ThemeSelector Component

### Import
```tsx
import { ThemeSelector } from '@/components/raci';
```

### Usage
```tsx
import { useState } from 'react';
import { ThemeSelector } from '@/components/raci';

export function MyComponent() {
  const [theme, setTheme] = useState('default');

  return (
    <ThemeSelector 
      theme={theme}
      onChange={setTheme}
    />
  );
}
```

### Visual Layout
```
┌─────────────────────────────────┐
│ Theme                           │
├─────────────────────────────────┤
│ [▼] Website Default             │
└─────────────────────────────────┘
    │
    └─ Color Preview:
       [■ Green] [■ Amber] [■ Blue] [■ Gray]
    
    └─ Description:
       Clean, professional theme...
```

### Props
```typescript
interface ThemeSelectorProps {
  theme: string;                    // Current theme ID
  onChange: (theme: string) => void;  // Callback on change
}
```

### Themes
- `"default"` - Website Default
- `"corporate"` - Corporate Blue  
- `"minimal"` - Minimal Grayscale

---

## RaciPreview Component

### Import
```tsx
import { RaciPreview } from '@/components/raci';
```

### Usage
```tsx
import { RaciPreview } from '@/components/raci';
import type { RaciChart } from '@/types/raci';

interface Props {
  chart: RaciChart;
}

export function MyComponent({ chart }: Props) {
  return (
    <RaciPreview 
      chart={chart}
      maxRows={5}
      maxCols={6}
    />
  );
}
```

### Visual Layout
```
┌─────────────────────────────────────────┐
│ Mobile App RACI Chart                   │
│ Assign responsibilities for app launch  │
├─────────────────────────────────────────┤
│     │ PM    │ Dev   │ QA    │           │
├─────┼───────┼───────┼───────┤           │
│ Req │ [A]   │ [R]   │       │           │
│ Arch│ [R]   │ [A]   │ [C]   │           │
│ Dev │       │ [A]   │ [R]   │           │
│ Test│ [C]   │       │ [A]   │           │
└─────┴───────┴───────┴───────┘           │
                                           │
Legend: [R] [A] [C] [I]                    │
                                           │
Showing 4 of 5 roles and 4 of 8 tasks      │
└─────────────────────────────────────────┘
```

### Props
```typescript
interface RaciPreviewProps {
  chart: RaciChart;        // Chart data
  maxRows?: number;        // Max preview rows (default: 5)
  maxCols?: number;        // Max preview columns (default: 6)
}
```

### Features
- Live theme colors applied
- Responsive horizontal scroll
- RACI legend
- Preview indicator if chart larger

---

## HighContrastToggle Component

### Import
```tsx
import { HighContrastToggle } from '@/components/raci';
```

### Usage
```tsx
import { useState } from 'react';
import { HighContrastToggle } from '@/components/raci';

export function MyComponent() {
  const [isHC, setIsHC] = useState(false);

  return (
    <HighContrastToggle 
      enabled={isHC}
      onChange={setIsHC}
    />
  );
}
```

### Visual Layout
```
┌─────────────────────────────────┐
│ Accessibility                   │
├─────────────────────────────────┤
│                          ✓       │
│ High Contrast Mode  [●····]     │
│ Enhanced colors for visibility  │
├─────────────────────────────────┤
│ ✓ High contrast is ENABLED      │
└─────────────────────────────────┘
```

### Props
```typescript
interface HighContrastToggleProps {
  enabled: boolean;                    // Current state
  onChange: (enabled: boolean) => void;  // Callback on toggle
}
```

### Persistence
- Saves to `localStorage.raci-high-contrast`
- Persists across page reloads
- Auto-restores on mount

---

## useTheme Hook

### Import
```tsx
import { useTheme } from '@/lib/raci/hooks';
```

### Usage
```tsx
import { useTheme } from '@/lib/raci/hooks';

export function MyComponent() {
  const { 
    theme, 
    setTheme, 
    highContrast, 
    setHighContrast 
  } = useTheme('default');

  // Use theme...
  console.log(theme);  // 'default' | 'corporate' | 'minimal'
  
  // Update theme
  setTheme('corporate');
  
  // Toggle high-contrast
  setHighContrast(true);
}
```

### Return Type
```typescript
{
  theme: string;                        // Current theme ID
  setTheme: (theme: string) => void;   // Update theme
  highContrast: boolean;                // High-contrast enabled
  setHighContrast: (hc: boolean) => void;  // Update high-contrast
}
```

### Persistence
- Automatically saves to localStorage
- Automatically loads on mount
- No manual restoration needed
- SSR-safe (checks `typeof window`)

### localStorage Keys
```
raci-theme              // Theme ID string
raci-high-contrast      // Boolean as string ("true" or "false")
```

---

## CSS Variables

### Available Variables
```css
--raci-primary          /* Primary brand color */
--raci-accent           /* Accent brand color */
--raci-background       /* Background color */
--raci-surface          /* Surface/card color */
--raci-text             /* Primary text */
--raci-text-secondary   /* Secondary text */
--raci-border           /* Border color */
--raci-r                /* Responsible (green) */
--raci-a                /* Accountable (amber) */
--raci-c                /* Consulted (blue) */
--raci-i                /* Informed (gray) */
```

### Usage in CSS
```css
.my-element {
  color: var(--raci-text);
  background: var(--raci-background);
  border: 1px solid var(--raci-border);
}

.responsible-badge {
  background: var(--raci-r);
  color: white;
}
```

### Theme Application
```css
/* Default theme (automatic) */
:root {
  --raci-primary: #0066cc;
  /* ... all variables ... */
}

/* Corporate theme (when data-theme="corporate") */
[data-theme="corporate"] {
  --raci-primary: #003d82;
  /* ... all variables ... */
}

/* Minimal theme (when data-theme="minimal") */
[data-theme="minimal"] {
  --raci-primary: #2d3748;
  /* ... all variables ... */
}

/* High contrast mode (when data-high-contrast="true") */
[data-high-contrast="true"] {
  --raci-primary: #000080;
  /* WCAG AAA colors */
}
```

---

## Integration Example

### Full Page Integration
```tsx
import { useState } from 'react';
import { 
  ThemeSelector, 
  RaciPreview, 
  HighContrastToggle 
} from '@/components/raci';
import { useTheme } from '@/lib/raci/hooks';
import { useRaciState } from '@/lib/raci/hooks';
import type { RaciChart } from '@/types/raci';

export function RaciEditorPage() {
  const { chart, dispatch } = useRaciState();
  const { theme, setTheme, highContrast, setHighContrast } = useTheme(chart.theme);

  const handleThemeChange = (newTheme: string) => {
    // Update chart state
    dispatch({ 
      type: 'updateChart', 
      payload: { ...chart, theme: newTheme } 
    });
    // Sync theme hook
    setTheme(newTheme);
  };

  return (
    <div className="raci-editor-container">
      {/* Sidebar */}
      <aside className="raci-sidebar">
        <ThemeSelector 
          theme={theme}
          onChange={handleThemeChange}
        />
        
        <HighContrastToggle
          enabled={highContrast}
          onChange={setHighContrast}
        />
      </aside>

      {/* Main Content */}
      <main className="raci-main">
        {/* Editors go here */}
        
        {/* Preview */}
        <RaciPreview 
          chart={chart}
          maxRows={5}
          maxCols={6}
        />
      </main>
    </div>
  );
}
```

---

## Accessibility Checklist

- [x] All buttons have aria-labels
- [x] Dropdown has role="listbox" and role="option"
- [x] Toggle has role="switch" and aria-checked
- [x] Keyboard navigation works (Tab, Enter, Space, Esc)
- [x] Focus indicators visible on all elements
- [x] High-contrast mode WCAG AAA compliant
- [x] Color is not the only indicator (letters: R, A, C, I)
- [x] Screen reader announces all labels
- [x] SSR-safe (no window references in render)

---

**All components ready for production use** ✅
