# Typography Component Library

A comprehensive, reusable typography system built with React and Tailwind CSS. This library provides semantic, composable text components that handle font sizing, weight, spacing, and color management automatically.

## Table of Contents

- [Quick Start](#quick-start)
- [Components](#components)
- [Font Sizes](#font-sizes)
- [Colors](#colors)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Component Reference](#component-reference)

## Quick Start

### Import Components

```tsx
import {
  Hero,
  Display,
  Headline,
  Title,
  Subtitle,
  Body,
  Caption,
  Label,
  Overline,
} from '@/components/Typography';
```

### Basic Usage

```tsx
// Headings
<Hero>Large Display Heading</Hero>
<Display>Prominent Heading</Display>
<Headline>Section Heading</Headline>
<Title>Card Title</Title>
<Subtitle>Supporting Heading</Subtitle>

// Body Text
<Body>Standard paragraph text</Body>
<Body size="lg">Large body text</Body>
<Body size="sm">Small body text</Body>

// Metadata
<Caption>Supporting text</Caption>
<Label>UPPERCASE LABEL</Label>
<Overline>SECTION MARKER</Overline>
```

## Components

All typography components are built using pure **Tailwind CSS utility classes**, making them fully composable and easy to customize.

### Hero
**Purpose**: Large display heading for main page titles and hero sections.

**Default Size**: `text-7xl` (56px)  
**Line Height**: `tight` (1.25)  
**Letter Spacing**: `-tracking-wider` (-0.05em)

```tsx
<Hero>Main Heading</Hero>
<Hero variant="semibold">Semibold Variant</Hero>
<Hero className="text-red-500">Colored Hero</Hero>
```

**Props:**
- `variant?: "bold" | "semibold"` — Font weight (default: "bold")
- `as?: React.ElementType` — HTML element (default: "h1")
- `className?: string` — Additional Tailwind classes

---

### Display
**Purpose**: Prominent heading for major sections and feature titles.

**Default Size**: `text-5xl` (48px)  
**Line Height**: `snug` (1.375)  
**Letter Spacing**: `tracking-tight` (-0.025em)

```tsx
<Display>Display Heading</Display>
<Display variant="semibold">Semibold Display</Display>
<Display className="text-primary">Primary Color</Display>
```

**Props:**
- `variant?: "bold" | "semibold"` — Font weight (default: "bold")
- `as?: React.ElementType` — HTML element (default: "h2")
- `className?: string` — Additional Tailwind classes

---

### Headline
**Purpose**: Medium heading for section titles and subsections.

**Default Size**: `text-4xl` (36px)  
**Line Height**: `snug` (1.375)  
**Letter Spacing**: `tracking-tight` (-0.025em)

```tsx
<Headline>Section Heading</Headline>
<Headline variant="semibold">Semibold Section</Headline>
<Headline as="h2">Override HTML Element</Headline>
```

**Props:**
- `variant?: "bold" | "semibold"` — Font weight (default: "bold")
- `as?: React.ElementType` — HTML element (default: "h3")
- `className?: string` — Additional Tailwind classes

---

### Title
**Purpose**: Standard heading size for card titles and component headers.

**Default Size**: `text-2xl` (24px)  
**Line Height**: `tight` (1.25)

```tsx
<Title>Card Title</Title>
<Title variant="semibold">Semibold Title</Title>
<Title className="text-slate-900">Dark Text</Title>
```

**Props:**
- `variant?: "bold" | "semibold"` — Font weight (default: "bold")
- `as?: React.ElementType` — HTML element (default: "h4")
- `className?: string` — Additional Tailwind classes

---

### Subtitle
**Purpose**: Smaller heading for supporting titles and subsections.

**Default Size**: `text-lg` (18px)  
**Line Height**: `snug` (1.375)

```tsx
<Subtitle>Subtitle Text</Subtitle>
<Subtitle variant="regular">Regular Subtitle</Subtitle>
```

**Props:**
- `variant?: "semibold" | "regular"` — Font weight (default: "semibold")
- `as?: React.ElementType` — HTML element (default: "h5")
- `className?: string` — Additional Tailwind classes

---

### Body
**Purpose**: Main body text with flexible sizing and weight options.

**Sizes**:
- `lg` — `text-xl` (20px), `leading-relaxed` (1.65)
- `base` — `text-base` (16px), `leading-relaxed` (1.65) — Default
- `sm` — `text-sm` (14px), `leading-relaxed` (1.65)

**Weights**: `normal` | `medium` | `semibold`

```tsx
<Body>Standard body text</Body>
<Body size="lg">Large body text</Body>
<Body size="sm">Small body text</Body>
<Body weight="semibold">Bold body text</Body>
<Body size="lg" weight="medium">Large medium weight</Body>
<Body className="text-neutral">Custom color</Body>
```

**Props:**
- `size?: "lg" | "base" | "sm"` — Text size (default: "base")
- `weight?: "normal" | "medium" | "semibold"` — Font weight (default: "normal")
- `as?: React.ElementType` — HTML element (default: "p")
- `className?: string` — Additional Tailwind classes

---

### Caption
**Purpose**: Small supporting text for metadata, descriptions, and notes.

**Default Size**: `text-sm` (14px)  
**Line Height**: `snug` (1.375)

```tsx
<Caption>Supporting text</Caption>
<Caption variant="semibold">Bold caption</Caption>
<Caption className="text-neutral-light">Subtle text</Caption>
```

**Props:**
- `variant?: "normal" | "semibold"` — Font weight (default: "normal")
- `as?: React.ElementType` — HTML element (default: "span")
- `className?: string` — Additional Tailwind classes

---

### Label
**Purpose**: Uppercase labels for form fields, tags, and metadata.

**Default Size**: `text-xs` (12px)  
**Line Height**: N/A (implicit)  
**Text Transform**: `uppercase`  
**Letter Spacing**: `tracking-wider` (0.05em)

```tsx
<Label>Field Label</Label>
<Label variant="semibold">Bold Label</Label>
<Label className="text-red-500">Error Label</Label>
```

**Props:**
- `variant?: "medium" | "semibold"` — Font weight (default: "medium")
- `as?: React.ElementType` — HTML element (default: "label")
- `className?: string` — Additional Tailwind classes

---

### Overline
**Purpose**: Small uppercase text for section markers and category labels.

**Default Size**: `text-xs` (12px)  
**Text Transform**: `uppercase`  
**Letter Spacing**: `tracking-widest` (0.1em)  
**Font Weight**: `semibold` (600)

```tsx
<Overline>Section Marker</Overline>
<Overline className="text-red-500">Category</Overline>
```

**Props:**
- `as?: React.ElementType` — HTML element (default: "span")
- `className?: string` — Additional Tailwind classes

---

## Font Sizes

The typography system uses Tailwind's default font scale:

| Component | Size | Pixels | HTML Element |
|-----------|------|--------|--------------|
| **Hero** | `text-7xl` | 56px | h1 |
| **Display** | `text-5xl` | 48px | h2 |
| **Headline** | `text-4xl` | 36px | h3 |
| **Title** | `text-2xl` | 24px | h4 |
| **Subtitle** | `text-lg` | 18px | h5 |
| **Body Large** | `text-xl` | 20px | p |
| **Body** | `text-base` | 16px | p |
| **Body Small** | `text-sm` | 14px | p |
| **Caption** | `text-sm` | 14px | span |
| **Label** | `text-xs` | 12px | label |
| **Overline** | `text-xs` | 12px | span |

## Colors

All typography components accept Tailwind color classes. Use semantic color utilities for consistent theming:

```tsx
<Body className="text-slate-900">Primary text</Body>
<Body className="text-slate-600">Secondary text</Body>
<Body className="text-slate-500">Tertiary text</Body>

<Display className="text-red-500">Brand color</Display>
<Title className="text-emerald-600">Success color</Title>
<Caption className="text-orange-500">Warning color</Caption>
```

### Semantic Colors (Custom CSS Classes)

The following custom color classes are available in the component library:

```tsx
<Body className="text-primary">Primary brand color</Body>
<Body className="text-primary-light">Primary light variant</Body>
<Body className="text-primary-muted">Primary muted variant</Body>

<Body className="text-accent">Accent color</Body>
<Body className="text-accent-light">Accent light variant</Body>
<Body className="text-accent-muted">Accent muted variant</Body>

<Body className="text-neutral-dark">Dark neutral</Body>
<Body className="text-neutral">Medium neutral</Body>
<Body className="text-neutral-light">Light neutral</Body>
<Body className="text-neutral-lighter">Lighter neutral</Body>
```

## Usage Examples

### Page Header

```tsx
<section className="py-16">
  <Overline className="text-red-500 mb-4">Documentation</Overline>
  <Display className="mb-4">Getting Started</Display>
  <Body size="lg" className="text-neutral max-w-2xl">
    Learn how to use the component library in your projects.
  </Body>
</section>
```

### Card Header

```tsx
<div className="bg-white rounded-lg p-6 border border-slate-200">
  <Overline className="text-slate-500 mb-2">Feature</Overline>
  <Title className="mb-2">Beautiful Components</Title>
  <Body className="text-neutral mb-6">
    Pre-styled components that work out of the box.
  </Body>
  <Label className="text-slate-600">LEARN MORE</Label>
</div>
```

### Form Field

```tsx
<div className="mb-4">
  <Label htmlFor="email">Email Address</Label>
  <input
    id="email"
    type="email"
    placeholder="Enter your email"
    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded"
  />
  <Caption className="text-slate-500 mt-1">
    We'll never share your email address.
  </Caption>
</div>
```

### Text Hierarchy

```tsx
<article>
  <Headline className="mb-4">Article Title</Headline>
  <Body className="text-neutral mb-6">
    Introduction paragraph with standard body text size.
  </Body>

  <Subtitle className="mb-3 mt-8">Section Heading</Subtitle>
  <Body className="text-neutral mb-6">
    Content paragraph describing the section in detail.
  </Body>

  <div className="bg-slate-50 p-4 rounded-lg mt-8">
    <Caption className="text-slate-600">
      💡 Pro Tip: Use Caption for callouts and side notes.
    </Caption>
  </div>

  <Body size="sm" className="text-slate-500 mt-8">
    Footer note with smaller text size.
  </Body>
</article>
```

## Best Practices

### 1. Maintain Visual Hierarchy

Use components in their intended order: Hero → Display → Headline → Title → Subtitle → Body

```tsx
// ✅ Good
<Hero>Main Page Title</Hero>
<Display>Feature Section</Display>
<Headline>Subsection</Headline>
<Body>Description</Body>

// ❌ Avoid skipping levels
<Hero>Main Page Title</Hero>
<Body>This jumps hierarchy</Body>
```

### 2. Combine Components Meaningfully

```tsx
// ✅ Good - Clear hierarchy
<Title>Settings</Title>
<Body className="text-neutral">Manage your account preferences</Body>

// ❌ Avoid redundancy
<Title>Settings</Title>
<Title>Manage your account preferences</Title>
```

### 3. Use Size and Weight Variants

```tsx
// ✅ Good - Appropriate size for context
<Body size="lg">Important announcement</Body>
<Body size="sm">Metadata and timestamps</Body>

// ❌ Avoid overusing variants
<Body weight="semibold">
  <Body weight="semibold">Too much bold text</Body>
</Body>
```

### 4. Apply Colors Consistently

```tsx
// ✅ Good - Semantic color usage
<Body className="text-neutral">Default text</Body>
<Caption className="text-neutral-light">Supporting text</Caption>
<Body className="text-red-500">Error message</Body>

// ❌ Avoid random colors
<Body className="text-purple-700">Random color</Body>
<Body className="text-yellow-200">Poor contrast</Body>
```

### 5. Leverage Custom Classes

```tsx
// ✅ Good - Reusable component combinations
const SectionHeader = ({ title, description }) => (
  <>
    <Overline className="text-red-500 mb-2">Section</Overline>
    <Headline className="mb-3">{title}</Headline>
    <Body className="text-neutral">{description}</Body>
  </>
);

// Then use it anywhere
<SectionHeader
  title="Getting Started"
  description="Learn how to implement our components"
/>
```

### 6. Compose for Specific Use Cases

```tsx
// Form label
<Label htmlFor="name">Full Name</Label>

// Card metadata
<Caption className="text-neutral-light">Published 2 days ago</Caption>

// Status indicator
<Overline className="text-emerald-600">Active</Overline>

// Feature callout
<Subtitle className="text-red-500">Premium Feature</Subtitle>
```

## Component Reference

### Import All Components

```tsx
import {
  Hero,
  Display,
  Headline,
  Title,
  Subtitle,
  Body,
  Caption,
  Label,
  Overline,
} from '@/components/Typography';
```

### TypeScript Props

```tsx
interface CommonProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

interface HeroProps extends CommonProps {
  variant?: "bold" | "semibold";
}

interface DisplayProps extends CommonProps {
  variant?: "bold" | "semibold";
}

interface HeadlineProps extends CommonProps {
  variant?: "bold" | "semibold";
}

interface TitleProps extends CommonProps {
  variant?: "bold" | "semibold";
}

interface SubtitleProps extends CommonProps {
  variant?: "semibold" | "regular";
}

interface BodyProps extends CommonProps {
  size?: "lg" | "base" | "sm";
  weight?: "normal" | "medium" | "semibold";
}

interface CaptionProps extends CommonProps {
  variant?: "normal" | "semibold";
}

interface LabelProps extends CommonProps {
  variant?: "medium" | "semibold";
}

interface OverlineProps extends CommonProps {
  // No variants
}
```

## File Structure

```
src/
├── components/
│   └── Typography/
│       ├── Hero.tsx
│       ├── Display.tsx
│       ├── Headline.tsx
│       ├── Title.tsx
│       ├── Subtitle.tsx
│       ├── Body.tsx
│       ├── Caption.tsx
│       ├── Label.tsx
│       ├── Overline.tsx
│       └── index.ts
└── styles.css (Tailwind configuration)
```

## View the Showcase

Visit `/typography` route to see all typography components in action with interactive examples and comprehensive documentation.

## Troubleshooting

### Text not displaying correct size?
- Ensure you're using the component, not a plain `<p>` or `<h*>` tag
- Check that Tailwind CSS is properly imported and compiled
- Verify no conflicting CSS classes are overriding the typography styles

### Colors not applying?
- Use valid Tailwind color classes (e.g., `text-red-500`, `text-slate-700`)
- For custom colors, ensure they're defined in `tailwind.config.ts`
- Check CSS specificity if colors aren't overriding

### Component not found?
- Verify the import path matches your project structure
- Ensure components are exported from `index.ts`
- Check that TypeScript paths are configured correctly in `tsconfig.json`

---

For more examples, visit the [Typography Showcase](/typography) or check the [Component Library Overview](README.md).
