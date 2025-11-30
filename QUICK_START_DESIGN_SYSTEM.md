# Quick Start: Unified Design System

**TL;DR**: All three apps now use a consolidated design system. Same colors, typography, components everywhere.

---

## 🎨 Color Palette

### Primary Actions

```
bg-primary-500      # Main button background (#ef4444)
bg-primary-600      # Hover/active state (#dc2626)
text-primary-600    # Primary text color
```

### Secondary

```
bg-indigo-500       # Secondary buttons (#6366f1)
text-indigo-600     # Secondary text
```

### Accent (Success/Growth)

```
bg-accent-500       # Accent color (#22c55e)
text-accent-600     # Accent text
```

### Status Colors

```
success-500         # ✅ Positive (#14b8a6)
warning-500         # ⚠️ Caution (#f59e0b)
error-500           # ❌ Error (#ff6b85)
info-500            # ℹ️ Information (#3b82f6)
```

---

## 📝 Typography

### Component Usage (Recommended)

```tsx
import { Hero, Display, Headline, Title, Body, Caption, Label } from '@spearyx/ui-kit';

<Hero>Page Title</Hero>
<Headline>Section</Headline>
<Title>Card Title</Title>
<Body>Regular text</Body>
<Caption>Small text</Caption>
<Label>LABELS & METADATA</Label>
```

### Sizes

| Component | Size            | Use Case              |
| --------- | --------------- | --------------------- |
| Hero      | 4.5rem (72px)   | Page headers          |
| Display   | 3rem (60px)     | Major headings        |
| Headline  | 2.25rem (36px)  | Section titles        |
| Title     | 1.5rem (24px)   | Card/component titles |
| Subtitle  | 1.125rem (18px) | Supporting headings   |
| Body-LG   | 1.25rem (20px)  | Large text            |
| Body      | 1rem (16px)     | Default text          |
| Caption   | 0.875rem (14px) | Supporting text       |
| Label     | 0.75rem (12px)  | Labels & metadata     |

---

## 🧩 Components

### Button

```tsx
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outlined</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Danger</Button>
```

### Badge

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outlined</Badge>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Cards (21 Specialized Variants)

```tsx
<BasicCard title="..." description="..." />
<StatCard label="Revenue" value="$45K" trend="up" />
<CTACard title="..." buttonText="..." onButtonClick={() => {}} />
<AlertCard type="warning" title="..." message="..." />
<PricingCard price="$99" features={[...]} />
```

---

## 🎯 Common Patterns

### Alert Box

```tsx
<div className="p-4 rounded-lg border border-success-300 bg-success-50 text-success-700">
  <p className="font-semibold">Success!</p>
  <p className="text-sm">Your action completed.</p>
</div>
```

### Form Field

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <input id="email" className="input-modern w-full" />
</div>
```

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Button Group

```tsx
<div className="flex gap-2">
  <Button variant="secondary">Cancel</Button>
  <Button>Submit</Button>
</div>
```

---

## 🌙 Dark Mode

All components automatically support dark mode. Just add the `dark` class to the root HTML element:

```tsx
<html className={isDarkMode ? "dark" : ""}>
  {/* Content automatically adapts */}
</html>
```

---

## 📦 Importing

### From UI Kit

```tsx
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  Tooltip,
  Dropdown,
  Hero,
  Display,
  Headline,
  Title,
  Body,
  Caption,
  Label,
  BasicCard,
  FeaturedCard,
  StatCard,
} from "@spearyx/ui-kit";
```

### Styles

```tsx
import "@spearyx/shared-config/styles";
```

---

## ✅ Do's and Don'ts

### ✅ DO

- Use component APIs first (Button props, Badge variants)
- Stick to the defined color palette
- Use Typography components for all text
- Test in dark mode
- Design mobile-first

### ❌ DON'T

- Hardcode hex colors (#ef4444)
- Create new color palettes
- Mix styling approaches
- Use `<h1>`, `<p>` instead of Typography components
- Disable focus states

---

## 🔍 Reference

Full documentation: `/docs/DESIGN_SYSTEM.md`

Implementation details: `/DESIGN_SYSTEM_IMPLEMENTATION.md`

---

## 📝 Examples

```tsx
// Complete page example
import { Hero, Body, Button, Card, BasicCard, Badge } from "@spearyx/ui-kit";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Hero className="text-primary-600">Dashboard</Hero>
      <Body className="text-slate-600 mt-2">Welcome back</Body>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <BasicCard title="Quick Stats" description="Your recent activity" />
          <div className="mt-4 flex gap-2">
            <Badge>Active</Badge>
            <Badge variant="secondary">Pending</Badge>
          </div>
        </Card>

        <Card>
          <BasicCard title="Actions" description="What you can do" />
          <div className="mt-4 space-y-2">
            <Button className="w-full">Primary Action</Button>
            <Button className="w-full" variant="secondary">
              Secondary Action
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8 p-4 rounded-lg border border-success-300 bg-success-50 text-success-700">
        ✅ System is ready to use
      </div>
    </div>
  );
}
```

---

**Questions?** Check `/docs/DESIGN_SYSTEM.md` for comprehensive guidance.
