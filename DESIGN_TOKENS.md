# Spearyx Enhanced Brand Design System

## Overview

This document outlines all improvements to the Spearyx design system, including the new secondary indigo color, expanded utility classes, and specialized card components.

---

## Color System Enhancements

### Primary Colors

**Primary Red** - Main brand color (#ef4444)
```css
--primary-50: #fef2f2;
--primary-100: #fee2e2;
--primary-200: #fecaca;
--primary-300: #fca5a5;
--primary-400: #f87171;
--primary-500: #ef4444; /* Main */
--primary-600: #dc2626;
--primary-700: #b91c1c;
--primary-800: #991b1b;
--primary-900: #7f1d1d;
--primary-950: #450a0a;
```

### Secondary Colors (NEW!)

**Secondary Indigo** - Professional hierarchy and secondary actions (#6366f1)
```css
--secondary-50: #eef2ff;
--secondary-100: #e0e7ff;
--secondary-200: #c7d2fe;
--secondary-300: #a5b4fc;
--secondary-400: #818cf8;
--secondary-500: #6366f1; /* Main */
--secondary-600: #4f46e5;
--secondary-700: #4338ca;
--secondary-800: #3730a3;
--secondary-900: #312e81;
--secondary-950: #1e1b4b;
```

**Use for:**
- Secondary action buttons
- Alternative accent elements
- Secondary card borders
- Supporting UI elements

### Accent Colors

**Accent Emerald** - Growth and energy (#22c55e)
```css
--accent-50: #f0fdf4;
--accent-100: #dcfce7;
--accent-200: #bbf7d0;
--accent-300: #86efac;
--accent-400: #4ade80;
--accent-500: #22c55e; /* Main */
--accent-600: #16a34a;
--accent-700: #15803d;
--accent-800: #166534;
--accent-900: #14532d;
--accent-950: #052e16;
```

### Status Colors

**Info Blue** - Informational content (NEW!)
```css
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-200: #bfdbfe;
--info-300: #93c5fd;
--info-400: #60a5fa;
--info-500: #3b82f6; /* Main */
--info-600: #2563eb;
--info-700: #1d4ed8;
--info-800: #1e40af;
--info-900: #1e3a8a;
--info-950: #172554;
```

**Success Teal** - Positive outcomes
```css
--success-500: #14b8a6;
--success-600: #0d9488;
```

**Warning Amber** - Attention and caution
```css
--warning-500: #f59e0b;
--warning-600: #d97706;
```

**Error Rose** - Destructive actions
```css
--error-500: #ff6b85;
--error-600: #f85577;
```

---

## Gradient System

### Brand Gradients

**Primary Gradient** - Bold red to dark red
```css
--gradient-primary: linear-gradient(to right, #ef4444, #dc2626);
```

**Text Gradients** (CSS utilities)
```css
.text-gradient-primary   /* Red gradient text */
.text-gradient-secondary /* Indigo gradient text (NEW!) */
.text-gradient-accent    /* Emerald gradient text */
```

---

## Micro-Interactions & Effects (NEW!)

### Elevation & Movement

**Hover Lift Effect**
```html
<div class="hover-lift">Content that lifts on hover</div>
```
Transitions element up 2px with enhanced shadow on hover.

**Hover Glow Effect**
```html
<div class="hover-glow">Content with glow on hover</div>
```
Adds soft primary glow when hovering.

### Glow Effects

**Primary Glow**
```html
<div class="primary-glow">Content with primary brand glow</div>
```

**Secondary Glow** (NEW!)
```html
<div class="secondary-glow">Content with secondary indigo glow</div>
```

**Accent Glow**
```html
<div class="accent-glow">Content with emerald glow</div>
```

### Glass Morphism

**Glass Effect**
```html
<div class="glass-effect">Translucent blurred background</div>
```
Creates frosted glass appearance with backdrop blur and transparency.

### Blur Utilities

**Modern Blur**
```html
<div class="modern-blur">Content with backdrop blur</div>
```

---

## Card Components

### Existing Cards

- `BasicCard` - Simple card container
- `FeaturedCard` - Featured content with icon
- `StatCard` - Statistics display
- `PricingCard` - Pricing information
- `ProductCard` - Product showcase
- And many more...

### New Specialized Cards

#### Primary Card
Highlights primary actions or content
```tsx
<PrimaryCard
  title="Primary Action"
  description="This is primary content"
  icon="📊"
/>
```

**Features:**
- Red left border accent
- Primary color title
- Icon support
- Optional content slot

#### Secondary Card (NEW!)
Showcases secondary actions or supporting content
```tsx
<SecondaryCard
  title="Secondary Action"
  description="Supporting content"
  icon="💡"
/>
```

**Features:**
- Indigo left border accent
- Secondary color title
- Icon support
- Optional content slot

#### Tool Card (NEW!)
Perfect for showcasing project management tools
```tsx
<ToolCard
  title="RACI Chart Generator"
  description="Define roles and responsibilities with clarity"
  icon="📊"
  status="coming-soon"
/>
```

**Features:**
- Customizable status badge (available, coming-soon, beta)
- Dynamic color coding
- Icon support
- Compact, feature-rich layout

**Status Options:**
- `available` - Green badge
- `coming-soon` - Red badge (default)
- `beta` - Indigo badge

#### Coming Soon Card (NEW!)
Elevated presentation for upcoming features
```tsx
<ComingSoonCard
  title="Advanced Analytics"
  subtitle="Game-changing insights"
  description="Track project health with real-time metrics"
  icon="📈"
  eta="Q2 2026"
/>
```

**Features:**
- Dashed border design
- Gradient background
- "Coming Soon" badge
- ETA/timeline support
- Elegant, anticipatory design

#### Stats Card (NEW!)
Display metrics and KPIs
```tsx
<StatsCard
  label="Active Projects"
  value="24"
  unit="projects"
  trend="up"
  trendValue="+12% from last month"
  icon="📊"
  accentColor="accent"
/>
```

**Features:**
- Large readable values
- Trend indicators (up/down/neutral)
- Icon support
- Customizable accent colors
- Compact metric display

**Accent Color Options:**
- `primary` - Red
- `secondary` - Indigo
- `accent` - Emerald
- `success` - Teal
- `warning` - Amber

#### Interactive Card (NEW!)
Cards with hover effects and interactivity
```tsx
<InteractiveCard
  title="Explore Feature"
  description="Hover to see more"
  icon="✨"
  accentColor="secondary"
  onHover={true}
>
  <button>Learn More</button>
</InteractiveCard>
```

**Features:**
- Hover lift effect
- Glow effect on hover
- Icon animation on hover
- Optional content slot
- Customizable accent colors

---

## Card Utility Classes

### Card Color Variants (NEW!)

**Primary Card Styling**
```html
<div class="card-primary">Primary content card</div>
```

**Secondary Card Styling** (NEW!)
```html
<div class="card-secondary">Secondary content card</div>
```

**Accent Card Styling**
```html
<div class="card-accent">Accent content card</div>
```

**Success Card Styling**
```html
<div class="card-success">Success content card</div>
```

**Warning Card Styling**
```html
<div class="card-warning">Warning content card</div>
```

**Error Card Styling**
```html
<div class="card-error">Error content card</div>
```

All card utilities include:
- 4px left border with appropriate color
- Rounded corners (0.75rem)
- Light border for definition
- Clean white background

---

## Text Color Utilities

### Primary Text Colors

```html
<span class="text-primary-light">70% opacity primary text</span>
<span class="text-primary-muted">50% opacity primary text</span>
```

### Secondary Text Colors (NEW!)

```html
<span class="text-secondary-light">70% opacity secondary text</span>
<span class="text-secondary-muted">50% opacity secondary text</span>
```

### Accent Text Colors

```html
<span class="text-accent-light">70% opacity accent text</span>
<span class="text-accent-muted">50% opacity accent text</span>
```

### Status Text Colors

```html
<span class="text-success">Success/teal text</span>
<span class="text-success-light">Lighter teal text</span>

<span class="text-warning">Warning/amber text</span>
<span class="text-warning-light">Lighter amber text</span>

<span class="text-error">Error/rose text</span>
<span class="text-error-light">Lighter rose text</span>

<span class="text-info">Info/blue text</span>
<span class="text-info-light">Lighter blue text</span>
```

### Neutral Text Colors

```html
<span class="text-neutral-dark">Darkest neutral</span>
<span class="text-neutral">Standard neutral</span>
<span class="text-neutral-light">Light neutral</span>
<span class="text-neutral-lighter">Lightest neutral</span>
```

---

## Typography Components

### Available Typography Components

**Hero** - Largest headlines (4.5rem)
```tsx
<Hero className="text-primary-500">SPEARYX</Hero>
```

**Display** - Large display text (3rem)
```tsx
<Display>Precision Project Management</Display>
```

**Headline** - Section headers (2.25rem)
```tsx
<Headline>Key Features</Headline>
```

**Title** - Card/section titles (1.5rem)
```tsx
<Title>Feature Title</Title>
```

**Subtitle** - Supporting headings (1.125rem)
```tsx
<Subtitle>Supporting text</Subtitle>
```

**Body** - Standard body text (1rem)
```tsx
<Body>Regular paragraph text with normal weight</Body>
<Body weight="semibold">Emphasized paragraph text</Body>
<Body size="lg">Larger body text for emphasis</Body>
```

**Caption** - Small descriptive text (0.875rem)
```tsx
<Caption>Small supporting text</Caption>
```

**Label** - Form labels and tags (0.75rem)
```tsx
<Label>Form Label</Label>
```

---

## Animation System

### Available Animations

**Fade In** - Smooth fade with slight downward movement
```html
<div class="animate-fade-in">Content fades in</div>
```

**Slide In** - Content slides from left
```html
<div class="animate-slide-in">Content slides in</div>
```

**Slide Up** - Content slides up from bottom
```html
<div class="animate-slide-up">Content slides up</div>
```

**Scale In** - Content scales up with fade
```html
<div class="animate-scale-in">Content scales in</div>
```

**Pulse Subtle** - Gentle opacity pulsing
```html
<div class="animate-pulse-subtle">Subtly pulsing content</div>
```

**Glow** - Glowing box-shadow animation
```html
<div class="animate-glow">Content with glow animation</div>
```

---

## Implementation Examples

### Example 1: Coming Soon Feature Showcase

```tsx
import { ComingSoonCard } from "@/components/Cards";

export function ToolsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ComingSoonCard
        title="RACI Chart Generator"
        subtitle="Role Definition"
        description="Define responsibilities with crystal clarity"
        icon="📊"
        eta="Q1 2026"
      />
      <ComingSoonCard
        title="Project Charter Generator"
        subtitle="Project Foundation"
        description="Establish project scope and alignment"
        icon="📋"
        eta="Q1 2026"
      />
      {/* More cards... */}
    </div>
  );
}
```

### Example 2: Dashboard Stats

```tsx
import { StatsCard } from "@/components/Cards";

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        label="Total Projects"
        value="42"
        icon="📊"
        accentColor="primary"
      />
      <StatsCard
        label="In Progress"
        value="8"
        icon="⏳"
        accentColor="secondary"
        trend="up"
        trendValue="+2"
      />
      <StatsCard
        label="Completed"
        value="34"
        icon="✓"
        accentColor="accent"
        trend="up"
        trendValue="+5"
      />
      <StatsCard
        label="At Risk"
        value="3"
        icon="⚠️"
        accentColor="warning"
      />
    </div>
  );
}
```

### Example 3: Feature Cards with Hover

```tsx
import { InteractiveCard, SecondaryCard } from "@/components/Cards";

export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InteractiveCard
        title="Real-time Collaboration"
        description="Work together seamlessly"
        icon="👥"
        accentColor="secondary"
      >
        <p className="text-sm text-slate-600">
          Collaborate with your team in real-time
        </p>
      </InteractiveCard>

      <SecondaryCard
        title="Advanced Analytics"
        description="Deep insights into your projects"
        icon="📈"
      >
        <p className="text-sm text-slate-600">
          Track metrics that matter
        </p>
      </SecondaryCard>
    </div>
  );
}
```

---

## Dark Mode Support

All new colors and utilities support dark mode automatically through CSS variables. The system uses OKLch color space for better light/dark mode consistency.

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode overrides automatically applied */
  }
}
```

Or use the `.dark` class:
```html
<html class="dark">
  <!-- Dark mode applied -->
</html>
```

---

## Accessibility Considerations

### Color Contrast

All color combinations maintain WCAG AA contrast ratios:
- Text on backgrounds: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Focus States

All interactive components include visible focus indicators:
```css
&:focus {
  outline: none;
  box-shadow: 0 0 0 3px [color / 0.3];
}
```

### Animation Respect

Subtle animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

---

## Usage Guidelines

### When to Use Each Color

**Primary Red** (#ef4444)
- Main actions and CTAs
- Primary borders and accents
- Danger states
- Main brand presence

**Secondary Indigo** (#6366f1)
- Secondary actions
- Alternative CTAs
- Supporting content highlights
- Professional, calming hierarchy

**Accent Emerald** (#22c55e)
- Success states
- Positive outcomes
- Growth indicators
- Secondary actions

**Info Blue** (#3b82f6)
- Informational messages
- Help tooltips
- Non-critical alerts
- Educational content

### Card Component Selection

| Use | Component |
|-----|-----------|
| Main feature showcase | `InteractiveCard` |
| Supporting information | `SecondaryCard` |
| Upcoming features | `ComingSoonCard` |
| Project tools | `ToolCard` |
| Metrics display | `StatsCard` |
| Primary content | `PrimaryCard` |

---

## Migration Guide

### From Old Brand System

Old utilities and classes still work but are deprecated:
- `.bg-primary-500` → Use color classes from theme
- Custom button styles → Use `.btn-primary`, `.btn-secondary`
- Custom card styles → Use specialized card components

### Breaking Changes

None. All new additions are backward compatible.

---

## Future Enhancements

Potential additions planned for future releases:
- Icon library integration
- Toast/notification components
- Modal dialog improvements
- Form component refinements
- Accessibility audit automation

---

## Support

For questions or suggestions about the design system:
1. Check the BRAND_STYLESHEET.md for original documentation
2. Review component examples in the components directory
3. Test in the demo routes

Last Updated: November 8, 2025
