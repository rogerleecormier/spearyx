# Spearyx Unified Design System

Complete design guidance for all Spearyx applications: `@spearyx/app-web`, `@spearyx/corporate`, and `@spearyx/jobs`.

**Last Updated**: November 30, 2025  
**Version**: 1.0.0  
**Basis**: Tailwind CSS v4.0.6 + shadcn/ui components

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Color System](#color-system)
4. [Typography System](#typography-system)
5. [Components](#components)
6. [Usage Guidelines](#usage-guidelines)
7. [Dark Mode](#dark-mode)
8. [Spacing & Layout](#spacing--layout)
9. [Animations](#animations)
10. [Best Practices](#best-practices)

---

## Overview

The Spearyx design system provides a **unified, consistent experience** across all applications through:

- **Single source of truth**: All design tokens defined in `@spearyx/shared-config`
- **Three-tier architecture**: Shared config → UI Kit → Individual apps
- **Tailwind CSS**: All styling uses Tailwind utilities and custom plugins
- **shadcn/ui basis**: Components leverage Radix UI primitives and Tailwind
- **Dark mode support**: Automatic dark mode with CSS custom properties

### Design Philosophy

- **Modern & Professional**: Clean, contemporary aesthetics with a premium feel
- **Accessible**: WCAG AA compliant with proper contrast ratios
- **Performant**: Utility-first CSS with minimal unused styles
- **Scalable**: Easy to extend and customize per application
- **Consistent**: Uniform visual language across all three apps

---

## Architecture

### File Structure

```
packages/shared-config/
├── tailwind.config.ts      # Master design tokens & theme
├── styles.css              # Global styles foundation
└── src/
    └── index.ts            # Shared utilities export

packages/ui-kit/
├── src/
│   ├── ui/                 # Base shadcn-style components
│   ├── Cards/              # Card component variants (21 types)
│   ├── Typography/         # Typography components (9 types)
│   ├── lib/
│   │   └── utils.ts        # Shared utilities (cn, etc)
│   └── index.ts            # Public exports

apps/app-web/
apps/corporate/
apps/jobs/
├── tailwind.config.ts      # App-specific config (extends shared)
├── vite.config.ts          # App build config
└── src/
    ├── styles.css          # App styles (imports shared)
    └── ...
```

### How It Works

1. **Shared Config** defines all design tokens (colors, typography, spacing)
2. **UI Kit** provides reusable components using those tokens
3. **Each App** extends the shared config with app-specific content paths
4. **Each App** imports shared styles and adds any app-specific overrides

---

## Color System

### Brand Palette

#### Primary - Bold Red (#ef4444)

Main brand color used for CTAs, important UI elements, and brand identity.

```
primary-50:  #fef2f2   (lightest)
primary-100: #fee2e2
primary-200: #fecaca
primary-300: #fca5a5
primary-400: #f87171
primary-500: #ef4444   ⭐ Main brand red
primary-600: #dc2626   ← Use for text/hover states
primary-700: #b91c1c
primary-800: #991b1b
primary-900: #7f1d1d
primary-950: #450a0a   (darkest)
```

**Usage:**

```tsx
// Button with primary color
<button className="bg-primary-500 text-white hover:bg-primary-600">
  Click Me
</button>

// Text
<p className="text-primary-600">Important text</p>
```

---

#### Secondary - Indigo (#6366f1)

Professional secondary color for secondary actions and hierarchical emphasis.

```
indigo-50:  #eef2ff    (lightest)
indigo-100: #e0e7ff
indigo-200: #c7d2fe
indigo-300: #a5b4fc
indigo-400: #818cf8
indigo-500: #6366f1    ⭐ Main secondary
indigo-600: #4f46e5    ← Use for hover states
indigo-700: #4338ca
indigo-800: #3730a3
indigo-900: #312e81
indigo-950: #1e1b4b    (darkest)
```

---

#### Accent - Emerald (#22c55e)

Growth, success, and positive actions.

```
accent-50:  #f0fdf4    (lightest)
accent-100: #dcfce7
accent-200: #bbf7d0
accent-300: #86efac
accent-400: #4ade80
accent-500: #22c55e    ⭐ Main accent
accent-600: #16a34a    ← Use for hover
accent-700: #15803d
accent-800: #166534
accent-900: #14532d
accent-950: #052e16    (darkest)
```

---

#### Semantic Colors

**Success (Teal)** - Positive outcomes, confirmations

```
success-500: #14b8a6   ← Use this
```

**Warning (Amber)** - Caution, alerts, attention needed

```
warning-500: #f59e0b   ← Use this
```

**Error/Destructive (Rose)** - Errors, destructive actions

```
error-500: #ff6b85     ← Use this
```

**Info (Blue)** - Informational content, notifications

```
info-500: #3b82f6      ← Use this
```

**Neutral (Slate)** - Text, borders, backgrounds

```
slate-50:   #f9fafb   (light background)
slate-100:  #f3f4f6
slate-200:  #e5e7eb
slate-300:  #d1d5db   (light borders)
slate-500:  #6b7280
slate-600:  #4b5563   (secondary text)
slate-700:  #374151   (primary text on light)
slate-800:  #1f2937
slate-900:  #111827
slate-950:  #030712   (darkest)
```

### Color Usage Guidelines

| Element              | Color           | Example                               |
| -------------------- | --------------- | ------------------------------------- |
| **Primary Button**   | primary-500/600 | `bg-primary-500 hover:bg-primary-600` |
| **Secondary Button** | slate-100       | `bg-slate-100 text-slate-900`         |
| **Success Alert**    | success-500     | `border-success-500 text-success-700` |
| **Warning Alert**    | warning-500     | `border-warning-500 text-warning-700` |
| **Error Alert**      | error-500       | `border-error-500 text-error-700`     |
| **Info Alert**       | info-500        | `border-info-500 text-info-700`       |
| **Body Text**        | slate-900       | `text-slate-900`                      |
| **Secondary Text**   | slate-600       | `text-slate-600`                      |
| **Borders**          | slate-200/300   | `border border-slate-200`             |
| **Backgrounds**      | white/slate-50  | `bg-white or bg-slate-50`             |

---

## Typography System

### Type Scale

A complete 9-level semantic typography system from Hero (72px) to Overline (12px).

```
Hero      → 4.5rem  (72px)   - Page-level brand statements
Display   → 3rem    (60px)   - Major section headings
Headline  → 2.25rem (36px)   - Section titles
Title     → 1.5rem  (24px)   - Card/component titles
Subtitle  → 1.125rem(18px)   - Supporting headings
Body-LG   → 1.25rem (20px)   - Large body text
Body      → 1rem    (16px)   - Main content (default)
Caption   → 0.875rem(14px)   - Supporting text
Label     → 0.75rem (12px)   - Form labels, metadata
Overline  → 0.75rem (12px)   - Section markers
```

### Typography Components

All typography is implemented as React components in `@spearyx/ui-kit/Typography`.

```tsx
import {
  Hero, Display, Headline, Title, Subtitle,
  Body, Caption, Label, Overline
} from '@spearyx/ui-kit';

// Basic usage
<Hero>Large Brand Statement</Hero>
<Display>Section Heading</Display>
<Headline>Subsection</Headline>
<Title>Card Title</Title>
<Subtitle>Supporting Text</Subtitle>

// Variations (where applicable)
<Body size="lg">Large body text</Body>
<Body>Standard body text</Body>
<Body size="sm">Small body text</Body>

<Label>UPPERCASE LABEL</Label>
<Overline>SECTION MARKER</Overline>
```

### Font Weights

```
thin:       100
extralight: 200
light:      300
normal:     400  ← Default
medium:     500
semibold:   600  ← Titles & headings default
bold:       700
extrabold:  800
black:      900
```

### Typography Classes

Direct Tailwind class usage is also supported:

```tsx
// Direct classes
<h1 className="text-hero font-bold">Hero Heading</h1>
<h2 className="text-display font-semibold">Display Heading</h2>
<p className="text-body font-normal">Regular paragraph</p>
<span className="text-label font-medium">LABEL TEXT</span>

// Responsive typography
<p className="text-sm md:text-base lg:text-lg">
  Responsive text
</p>
```

### Letter Spacing

Predefined letter spacing utilities:

```
tracking-ultra-tight: -0.1em
tracking-tighter:     -0.05em
tracking-tight:       -0.025em
tracking-normal:      0em
tracking-wide:        0.025em
tracking-wider:       0.05em
tracking-widest:      0.1em
```

**Usage with Typography:**

```tsx
<Headline className="tracking-tight">Tightly tracked heading</Headline>
```

---

## Components

### Base Components (UI Kit)

Located in `packages/ui-kit/src/ui/`, extending shadcn/ui.

#### Button

```tsx
import { Button } from '@spearyx/ui-kit';

// Variants: default, destructive, outline, secondary, ghost, link
<Button>Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link Text</Button>

// Sizes: default, sm, lg, icon
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Badge

```tsx
import { Badge } from '@spearyx/ui-kit';

// Variants: default, secondary, destructive, outline
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outlined</Badge>
```

#### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@spearyx/ui-kit";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>{/* Card content */}</CardContent>
  <CardFooter>{/* Footer content */}</CardFooter>
</Card>;
```

#### Avatar, Tooltip, Sheet, Dropdown Menu

All available with standard shadcn/ui patterns and semantic colors.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@spearyx/ui-kit';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@spearyx/ui-kit';

<Avatar>
  <AvatarImage src="..." />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Card Components (21 variants)

Located in `packages/ui-kit/src/Cards/`.

**Core Cards:**

- `BasicCard` - Simple title + description
- `FeaturedCard` - Highlighted prominent content
- `StatCard` - Statistics/metrics display
- `TestimonialCard` - Quotes/testimonials
- `ImageCard` - Image-focused layout
- `CTACard` - Call-to-action focused
- `PricingCard` - Pricing tiers
- `AlertCard` - Alert/notification
- `ColorVariantCard` - Color-coded content
- `ProductCard` - Product showcase
- `ProfileCard` - User/team profiles
- `ProgressCard` - Progress tracking
- `TimelineCard` - Timeline entries
- `SkeletonCard` - Loading placeholder
- `EmptyStateCard` - Empty state messaging

**Specialized Cards:**

- `PrimaryCard`, `SecondaryCard`, `ToolCard`, `ComingSoonCard`, `StatsCard`, `InteractiveCard`

```tsx
import {
  BasicCard, FeaturedCard, StatCard, ImageCard, CTACard,
  PricingCard, AlertCard, ProductCard, ProfileCard
} from '@spearyx/ui-kit';

<BasicCard
  title="Card Title"
  description="Card description text"
/>

<StatCard
  label="Total Revenue"
  value="$45,231"
  change="+12%"
  trend="up"
/>

<CTACard
  title="Ready to get started?"
  description="Create an account to begin"
  buttonText="Sign Up"
  onButtonClick={() => {}}
/>
```

---

## Usage Guidelines

### Styling Hierarchy

Always follow this priority order:

1. **Component Props** - Most specific (e.g., Button's `variant` prop)
2. **Tailwind Utility Classes** - Override via `className`
3. **Component Defaults** - Fallback styling
4. **CSS Custom Properties** - Theme tokens for advanced users

```tsx
// ✅ Good: Use component API first
<Button variant="secondary">Click</Button>

// ✅ Good: Extend with Tailwind classes
<Button className="w-full">Full Width Button</Button>

// ⚠️ Acceptable: Direct styling for one-offs
<div className="bg-primary-500 text-white p-4 rounded">Custom</div>

// ❌ Avoid: Hardcoded colors outside components
<div style={{ backgroundColor: '#ef4444' }}>Bad</div>
```

### Application of Colors

#### For Primary Actions

```tsx
// ✅ Correct
<Button className="bg-primary-500 hover:bg-primary-600">
  Primary Action
</Button>

// Use primary-600 for hover/active states
<div className="text-primary-600">Active state</div>
```

#### For Warnings/Alerts

```tsx
// ✅ Correct
<div className="border border-warning-300 bg-warning-50 text-warning-700">
  Warning: Something needs attention
</div>
```

#### For Errors

```tsx
// ✅ Correct
<div className="border border-error-300 bg-error-50 text-error-700">
  Error: Something went wrong
</div>
```

#### For Success Messages

```tsx
// ✅ Correct
<div className="border border-success-300 bg-success-50 text-success-700">
  Success: Operation completed
</div>
```

### Responsive Design

Always design mobile-first and use Tailwind breakpoints:

```tsx
// Mobile → Tablet → Desktop
<div className="text-sm md:text-base lg:text-lg">
  Responsive text sizes
</div>

<div className="flex flex-col md:flex-row gap-4">
  <Card className="w-full md:w-1/2">Left</Card>
  <Card className="w-full md:w-1/2">Right</Card>
</div>

<Hero className="text-3xl md:text-4xl lg:text-5xl">
  Responsive heading
</Hero>
```

---

## Dark Mode

All components automatically support dark mode via `prefers-color-scheme` media query.

### Enabling Dark Mode

Add `dark` class to root HTML element:

```tsx
// App.tsx or Root layout
export function App() {
  return <html className={isDarkMode ? "dark" : ""}>{/* Content */}</html>;
}
```

### Dark Mode Colors

All colors automatically adapt. CSS custom properties handle the switch:

```tsx
// These automatically work in dark mode
<div className="bg-white text-slate-900">
  {/* Light mode: white bg, dark text */}
  {/* Dark mode: slate-950 bg, slate-50 text */}
</div>
```

### Forced Dark Mode Utilities

```tsx
// Force specific dark mode classes
<div className="dark:bg-slate-900 dark:text-white">
  Always dark even in light mode
</div>
```

---

## Spacing & Layout

### Spacing Scale

Tailwind's default 4px base unit with extended custom spacing:

```
p/m-0     (0px)
p/m-1     (4px)
p/m-2     (8px)
p/m-3     (12px)
p/m-4     (16px)
p/m-6     (24px)
p/m-8     (32px)
p/m-12    (48px)
p/m-16    (64px)
p/m-20    (80px)
p/m-24    (96px)

// Custom extended
p/m-18    (72px)
p/m-88    (352px)
p/m-128   (512px)
p/m-144   (576px)
```

### Layout Patterns

```tsx
// Container with padding
<div className="container mx-auto px-4 py-8">
  Content
</div>

// Flexbox grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// Stack with spacing
<div className="flex flex-col gap-4">
  <input />
  <input />
  <button>Submit</button>
</div>
```

---

## Animations

### Available Animations

```
animate-fade-in       - Fade in from transparent
animate-slide-in      - Slide in from left
animate-slide-up      - Slide up from bottom
animate-scale-in      - Scale from 95% to 100%
animate-pulse-subtle  - Subtle pulse loop
animate-glow          - Glow effect loop
```

### Usage

```tsx
<div className="animate-fade-in">
  Content fades in on mount
</div>

<button className="hover:animate-pulse-subtle">
  Hover to see pulse
</button>
```

---

## Best Practices

### ✅ DO

1. **Use component APIs first** - Leverage Button props, Badge variants, etc.
2. **Stick to the color palette** - Only use defined colors from the system
3. **Use semantic color names** - `success-500`, `warning-500`, not custom colors
4. **Maintain consistent spacing** - Use the defined spacing scale
5. **Test in dark mode** - Ensure all components work in both modes
6. **Be responsive** - Use mobile-first design approach
7. **Import from ui-kit** - Reuse packaged components
8. **Use Typography components** - Don't mix `<h1>`, `<p>`, `<span>` styles
9. **Document overrides** - Comment on any custom styling exceptions
10. **Check accessibility** - Ensure sufficient contrast and semantic HTML

### ❌ DON'T

1. **Hardcode colors** - Never use hex codes directly
2. **Create new color palettes** - Use existing semantic colors only
3. **Ignore dark mode** - Test both light and dark variants
4. **Use non-standard spacing** - Stick to 4px-based scale
5. **Mix component styles** - Don't apply conflicting classes
6. **Create custom animations** - Use predefined animations
7. **Override component APIs** - Extend via className, not styles
8. **Break typography hierarchy** - Use semantic components
9. **Disable focus states** - Keep keyboard accessibility
10. **Assume mobile patterns** - Design responsive from start

### Common Patterns

#### Button Group

```tsx
<div className="flex gap-2">
  <Button variant="secondary">Cancel</Button>
  <Button>Submit</Button>
</div>
```

#### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardContent>Content</CardContent>
  </Card>
</div>
```

#### Alert Box

```tsx
<AlertCard
  type="warning"
  title="Heads up!"
  message="This action cannot be undone."
/>

// Or custom:
<div className="p-4 rounded-lg border border-warning-300 bg-warning-50">
  <p className="text-warning-900 font-semibold">Warning</p>
  <p className="text-warning-700 text-sm">Message</p>
</div>
```

#### Form Layout

```tsx
<form className="space-y-6">
  <div>
    <Label htmlFor="name">Name</Label>
    <input id="name" className="input-modern w-full mt-2" />
  </div>
  <div>
    <Label htmlFor="email">Email</Label>
    <input id="email" type="email" className="input-modern w-full mt-2" />
  </div>
  <Button className="w-full">Submit</Button>
</form>
```

---

## Importing the Design System

### In Your App

```tsx
// Import from shared config
import "@spearyx/shared-config/styles";

// Import components
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  Hero,
  Display,
  Headline,
  Body,
  Caption,
  BasicCard,
  FeaturedCard,
  StatCard,
} from "@spearyx/ui-kit";

// Use design tokens via Tailwind classes
export function MyComponent() {
  return (
    <div className="bg-white text-slate-900 p-6 rounded-lg">
      <Hero className="text-primary-600">Welcome</Hero>
      <Body className="text-slate-600 mt-2">Introduction text</Body>
      <Button className="mt-6">Get Started</Button>
    </div>
  );
}
```

### Configuration

Each app's `tailwind.config.ts` extends the shared config:

```typescript
import sharedConfig from "@spearyx/shared-config/tailwind.config";

const config: Config = {
  ...sharedConfig,
  content: ["./src/**/*.{ts,tsx}"],
};

export default config;
```

---

## Support & Questions

For design system questions or to propose changes:

1. Check existing documentation in `/docs/Components/`
2. Review component examples in `packages/ui-kit/`
3. Test in storybook (when available)
4. Open an issue with detailed context

---

**Version Control**: This design system is versioned. All updates should maintain backward compatibility or be clearly documented in migration guides.
