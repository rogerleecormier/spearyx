# Spearyx Brand Stylesheet Guide

## Overview

This comprehensive brand stylesheet documents the Spearyx design system built on Tailwind CSS, shadcn/ui, and custom brand components. It provides a complete design system for building consistent, professional interfaces that reflect the precision and power of the Spearyx brand.

## When to Use shadcn vs Brand Components vs Tailwind

### Use shadcn/ui components for

- **Interactive components**: Buttons, forms, modals, dropdowns, tooltips
- **Complex UI patterns**: Data tables, charts, navigation menus
- **Accessibility**: Components with built-in ARIA support
- **Consistency**: Pre-built components that work together seamlessly

### Use Brand Components for

- **Typography**: Pre-styled text components with consistent hierarchy
- **Cards**: Specialized card layouts for different content types
- **Brand-specific elements**: Components that embody Spearyx identity
- **Consistent styling**: When you need guaranteed brand compliance

### Use Tailwind directly for

- **Layout**: Spacing, positioning, responsive design
- **Custom effects**: One-off animations, gradients, effects
- **Rapid prototyping**: Quick styling that doesn't need reusability
- **Component customization**: Extending existing components

## Brand Color System

### Primary Colors

```css
/* Spearhead Red - Primary brand color */
primary-500: #ef4444 (main brand red)
primary-400: #f87171 (light)
primary-600: #dc2626 (dark)

/* Professional Blue - Accent color */
accent-500: #3b82f6 (professional blue)
accent-400: #60a5fa (light)
accent-600: #2563eb (dark)

/* Precision Grays - Neutral colors */
precision-900: #0f172a (darkest)
precision-700: #334155 (dark)
precision-500: #64748b (medium)
precision-300: #cbd5e1 (light)
precision-100: #f1f5f9 (lightest)
```

### Status Colors

```css
/* Success Green */
success-500: #22c55e
success-400: #4ade80 (light)
success-600: #16a34a (dark)

/* Warning Yellow */
warning-500: #f59e0b
warning-400: #fbbf24 (light)
warning-600: #d97706 (dark)
```

### Usage Examples

```tsx
// Primary button
<button className="bg-primary-500 hover:bg-primary-600 text-white">
  Primary Action
</button>

// Accent element
<div className="bg-accent-500 text-white">
  Call to Action
</div>

// Text hierarchy
<h1 className="text-precision-900 dark:text-precision-50">Main Heading</h1>
<p className="text-precision-700 dark:text-precision-300">Body text</p>
```

## Typography System

### Font Sizes (Tailwind Config)

```css
/* Professional Typography Scale */
text-hero: 4.5rem (72px) - Hero headlines
text-display: 3rem (48px) - Display text  
text-headline: 2.25rem (36px) - Section headers
text-title: 1.5rem (24px) - Card titles
text-body-lg: 1.25rem (20px) - Large body text
text-body: 1rem (16px) - Standard body text
text-caption: 0.875rem (14px) - Captions
text-label: 0.75rem (12px) - Labels
```

### Brand Typography Components

Use these pre-styled components for consistent typography:

```tsx
import { 
  Hero, Display, Headline, Title, BodyLarge, Body, 
  Caption, Label, PrimaryAccent, AccentText, 
  SuccessText, WarningText, MutedText, GradientText 
} from '@/components/brand';

// Hero headlines
<Hero>SPEARYX SUITE</Hero>

// Section headers
<Headline>Tactical Arsenal</Headline>

// Card titles
<Title>Project Dashboard</Title>

// Body text
<BodyLarge>Important information that needs emphasis</BodyLarge>
<Body>Standard body text for most content</Body>

// Accent text
<PrimaryAccent>Critical information</PrimaryAccent>
<AccentText>Informational content</AccentText>

// Status text
<SuccessText>Success message</SuccessText>
<WarningText>Warning message</WarningText>
<MutedText>Subtle supporting text</MutedText>

// Special effects
<GradientText>Gradient heading</GradientText>
```

### Font Weights

```css
font-thin: 100
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
font-extrabold: 800
font-black: 900
```

## Brand Components

### Card Components

Use these specialized card components for different content types:

```tsx
import { 
  Card, ElevatedCard, GlassCard, PrimaryCard, AccentCard,
  FeatureCard, ToolCard, ComingSoonCard, HeroCard, StatsCard,
  InfoCard, SuccessCard, WarningCard, CompactCard, InteractiveCard
} from '@/components/brand';

// Standard precision card
<Card>
  <Title>Standard Card</Title>
  <Body>Clean and minimal card design</Body>
</Card>

// Elevated card with stronger shadow
<ElevatedCard>
  <Title>Elevated Card</Title>
  <Body>More prominent with enhanced shadow</Body>
</ElevatedCard>

// Glass effect card
<GlassCard>
  <Title>Glass Card</Title>
  <Body>Translucent with backdrop blur</Body>
</GlassCard>

// Brand-specific cards
<PrimaryCard>
  <Title>Primary Card</Title>
  <Body>With brand red accent border</Body>
</PrimaryCard>

<AccentCard>
  <Title>Accent Card</Title>
  <Body>With professional blue accent</Body>
</AccentCard>

// Specialized cards
<FeatureCard>
  <Title>Feature Showcase</Title>
  <Body>Perfect for highlighting features</Body>
</FeatureCard>

<ToolCard>
  <Title>Project Management Tool</Title>
  <Body>Specialized for tool presentations</Body>
</ToolCard>

<ComingSoonCard>
  <Title>Upcoming Feature</Title>
  <Body>Shows "Coming Soon" badge automatically</Body>
</ComingSoonCard>

<HeroCard>
  <Title>Hero Content</Title>
  <Body>Large prominent card for main content</Body>
</HeroCard>

<StatsCard>
  <Title>Statistics</Title>
  <Body>Designed for metrics and data</Body>
</StatsCard>
```

### Button Classes (Tailwind Utilities)

```tsx
// Primary button
<button className="btn-primary">
  Primary Action
</button>

// Secondary button
<button className="btn-secondary">
  Secondary Action
</button>

// Accent button
<button className="btn-accent">
  Call to Action
</button>

// Ghost button
<button className="btn-ghost">
  Ghost Action
</button>
```

### Form Inputs

```tsx
// Standard input
<input className="input-precision" placeholder="Enter text..." />

// Error state input
<input className="input-error" placeholder="Error state..." />
```

### Badges

```tsx
// Primary badge
<span className="badge-primary">Primary</span>

// Accent badge
<span className="badge-accent">Accent</span>

// Status badges
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-neutral">Neutral</span>
```

## Utility Classes

### Gradients

```tsx
// Brand gradient text
<h1 className="text-gradient-primary">Gradient Text</h1>

// Accent gradient text
<h1 className="text-gradient-accent">Accent Gradient</h1>

// Custom gradient backgrounds
<div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6">
  Primary Gradient Background
</div>

<div className="bg-gradient-to-br from-accent-50 to-accent-100 p-6">
  Accent Gradient Background
</div>

<div className="bg-gradient-to-br from-precision-50 via-white to-precision-100 p-6">
  Subtle Precision Gradient
</div>
```

### Effects

```tsx
// Hover lift effect
<div className="hover-lift p-4 rounded-lg cursor-pointer">
  Hover to Lift
</div>

// Hover glow effect
<div className="hover-glow p-4 rounded-lg cursor-pointer">
  Hover to Glow
</div>

// Glass effect
<div className="glass-effect p-4 rounded-lg">
  Glass Effect
</div>

// Precision blur
<div className="precision-blur p-4 rounded-lg">
  Precision Blur
</div>

// Glow effects
<div className="primary-glow p-4 rounded-lg">
  Primary Glow
</div>

<div className="accent-glow p-4 rounded-lg">
  Accent Glow
</div>
```

### Focus States

```tsx
// Focus rings are built into button and input classes
<button className="btn-primary">
  Focusable Button
</button>

<input className="input-precision" />
```

## Spacing System

The spacing system is based on an 8px grid:

```css
space-1: 4px    (0.25rem)
space-2: 8px    (0.5rem)
space-4: 16px   (1rem)
space-6: 24px   (1.5rem)
space-8: 32px   (2rem)
space-12: 48px  (3rem)
space-16: 64px  (4rem)
space-20: 80px  (5rem)
space-24: 96px  (6rem)
```

## Animation Classes

```tsx
// Fade in animation
<div className="animate-fade-in">
  Fade In Content
</div>

// Slide in animation
<div className="animate-slide-in">
  Slide In Content
</div>

// Scale in animation
<div className="animate-scale-in">
  Scale In Content
</div>

// Slide up animation
<div className="animate-slide-up">
  Slide Up Content
</div>

// Subtle pulse animation
<div className="animate-pulse-subtle">
  Pulsing Element
</div>

// Glow animation
<div className="animate-glow">
  Glowing Element
</div>
```

## Logo Component

The Logo component provides consistent brand representation across the application:

```tsx
import { Logo } from '@/components/brand';

// Default logo with text
<Logo />

// Logo without text
<Logo showText={false} />

// Different sizes
<Logo size="sm" />   // Small
<Logo size="md" />   // Medium (default)
<Logo size="lg" />   // Large
<Logo size="xl" />   // Extra large

// Different variants
<Logo variant="default" />    // Default colors
<Logo variant="monochrome" /> // Black/white
<Logo variant="inverted" />   // Inverted colors

// Combined with custom styling
<Logo size="xl" showText={false} className="hover:opacity-80" />
```

## Integration with shadcn/ui

The brand system is fully compatible with shadcn/ui components. The CSS variables are mapped to your brand colors:

```tsx
// shadcn Button with brand colors
<Button className="bg-primary hover:bg-primary/90">
  shadcn Button
</Button>

// shadcn Card with brand styling
<Card className="card-precision">
  <CardHeader>
    <CardTitle className="text-title">Card Title</CardTitle>
  </CardHeader>
  <CardContent className="text-body">
    Card content with brand styling
  </CardContent>
</Card>

// Combining shadcn with brand components
<Card className="hover-lift">
  <CardHeader>
    <CardTitle>
      <Title>Brand Typography in shadcn Card</Title>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Body>Content using brand typography components</Body>
    <PrimaryAccent>Accent text for emphasis</PrimaryAccent>
  </CardContent>
</Card>
```

## Best Practices

1. **Use brand components first**: Prefer `Title`, `Body`, `Card` over custom classes
2. **Maintain consistency**: Use the same spacing and typography scales throughout
3. **Leverage utility classes**: Use `.card-precision`, `.btn-primary` for consistency
4. **Combine with shadcn**: Use shadcn for complex components, brand components for styling
5. **Test accessibility**: Ensure proper contrast ratios and focus states
6. **Use gradients sparingly**: Reserve gradient text for hero elements and CTAs
7. **Follow the hierarchy**: Use Hero → Display → Headline → Title for proper visual hierarchy

## Dark Mode Support

The system includes full dark mode support through CSS variables and automatic color adaptation:

```tsx
// Dark mode is automatically handled by brand components
<Title>This automatically adapts to dark/light mode</Title>
<Card>Card backgrounds and borders adapt automatically</Card>

// Manual dark mode classes
<div className="bg-background text-foreground">
  Automatically adapts to dark/light mode
</div>

<div className="text-precision-900 dark:text-precision-50">
  Manual dark mode text color
</div>
```

## Component Architecture

### File Structure

```text
src/components/brand/
├── index.ts              # Exports all brand components
├── Logo.tsx              # Logo component
├── BrandTypography.tsx   # All typography components
└── BrandCards.tsx        # All card components
```

### Usage Patterns

```tsx
// Import what you need
import { Title, Body, Card, PrimaryAccent } from '@/components/brand';

// Combine components
<Card>
  <Title>Card Title</Title>
  <Body>Card content with <PrimaryAccent>accent text</PrimaryAccent></Body>
</Card>

// Use with shadcn
import { Button } from '@/components/ui/button';
import { Title, Body } from '@/components/brand';

<Button className="btn-primary">
  <Title>Button with brand typography</Title>
</Button>
```

## Customization

To extend the brand system:

1. **Add new colors**: Update the color palette in `tailwind.config.ts`
2. **Create new components**: Add to the appropriate brand component file
3. **Add utilities**: Extend the utilities section in `tailwind.config.ts`
4. **Update CSS variables**: Modify the `:root` and `.dark` selectors in `src/index.css`

### Adding New Components

```tsx
// In BrandCards.tsx
export const NewCard = ({ children, className }: CardProps) => {
  return (
    <div className={cn('card-precision border-new-color-200', className)}>
      {children}
    </div>
  );
};

// In BrandTypography.tsx
export const NewText = ({ children, className }: TypographyProps) => {
  return (
    <span className={cn('text-new-size font-new-weight text-new-color', className)}>
      {children}
    </span>
  );
};
```

This brand stylesheet provides everything you need to build consistent, professional interfaces that reflect the Spearyx brand identity while leveraging the power of Tailwind CSS, shadcn/ui, and custom brand components.
