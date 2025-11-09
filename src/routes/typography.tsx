import { createFileRoute } from "@tanstack/react-router";
import { Type } from "lucide-react";
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
} from "../components/Typography";

export const Route = createFileRoute("/typography")({
  component: TypographyLibrary,
});

function TypographyLibrary() {
  const colors = {
    primary: { name: "Primary", class: "text-primary", hex: "#6a9dff" },
    "primary-light": {
      name: "Primary Light",
      class: "text-primary-light",
      hex: "rgba(106, 157, 255, 0.7)",
    },
    "primary-muted": {
      name: "Primary Muted",
      class: "text-primary-muted",
      hex: "rgba(106, 157, 255, 0.5)",
    },
    accent: { name: "Accent", class: "text-accent", hex: "#22c55e" },
    "accent-light": {
      name: "Accent Light",
      class: "text-accent-light",
      hex: "rgba(34, 197, 94, 0.7)",
    },
    "accent-muted": {
      name: "Accent Muted",
      class: "text-accent-muted",
      hex: "rgba(34, 197, 94, 0.5)",
    },
    success: { name: "Success", class: "text-success", hex: "#14b8a6" },
    "success-light": {
      name: "Success Light",
      class: "text-success-light",
      hex: "rgba(20, 184, 166, 0.7)",
    },
    warning: { name: "Warning", class: "text-warning", hex: "#f59e0b" },
    "warning-light": {
      name: "Warning Light",
      class: "text-warning-light",
      hex: "rgba(245, 158, 11, 0.7)",
    },
    error: { name: "Error", class: "text-error", hex: "#ff6b85" },
    "error-light": {
      name: "Error Light",
      class: "text-error-light",
      hex: "rgba(255, 107, 133, 0.7)",
    },
    "neutral-dark": {
      name: "Neutral Dark",
      class: "text-neutral-dark",
      hex: "rgb(17, 24, 39)",
    },
    neutral: {
      name: "Neutral",
      class: "text-neutral",
      hex: "rgb(107, 114, 128)",
    },
    "neutral-light": {
      name: "Neutral Light",
      class: "text-neutral-light",
      hex: "rgb(156, 163, 175)",
    },
    "neutral-lighter": {
      name: "Neutral Lighter",
      class: "text-neutral-lighter",
      hex: "rgb(209, 213, 219)",
    },
  };

  const fontWeights = [
    { name: "Thin", class: "font-thin", weight: "100" },
    { name: "Extra Light", class: "font-extralight", weight: "200" },
    { name: "Light", class: "font-light", weight: "300" },
    { name: "Normal", class: "font-normal", weight: "400" },
    { name: "Medium", class: "font-medium", weight: "500" },
    { name: "Semi Bold", class: "font-semibold", weight: "600" },
    { name: "Bold", class: "font-bold", weight: "700" },
    { name: "Extra Bold", class: "font-extrabold", weight: "800" },
    { name: "Black", class: "font-black", weight: "900" },
  ];

  const letterSpacings = [
    { name: "Ultra Tight", class: "tracking-ultra-tight", value: "-0.1em" },
    { name: "Tighter", class: "tracking-tighter", value: "-0.05em" },
    { name: "Tight", class: "tracking-tight", value: "-0.025em" },
    { name: "Normal", class: "tracking-normal", value: "0em" },
    { name: "Wide", class: "tracking-wide", value: "0.025em" },
    { name: "Wider", class: "tracking-wider", value: "0.05em" },
    { name: "Widest", class: "tracking-widest", value: "0.1em" },
  ];

  const lineHeights = [
    { name: "Tight XS", class: "leading-tight-xs", value: "1" },
    { name: "Tight", class: "leading-tight", value: "1.2" },
    { name: "Snug", class: "leading-snug", value: "1.35" },
    { name: "Normal", class: "leading-normal", value: "1.5" },
    { name: "Relaxed", class: "leading-relaxed", value: "1.65" },
    { name: "Loose", class: "leading-loose", value: "2" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="border-b bg-gradient-to-r from-slate-50 to-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-8 h-8 text-red-500" />
            <Overline className="text-red-500">Component Library</Overline>
          </div>
          <Display className="mb-3">Typography Styles</Display>
          <Body size="lg" className="text-neutral max-w-2xl">
            Comprehensive showcase of all typography styles, colors, and
            variations. Explore the complete typography system including sizes,
            weights, spacing, and semantic color options.
          </Body>
        </div>
      </section>

      {/* Typography Hierarchy Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Overline className="mb-8 text-red-500">
            Typography Hierarchy
          </Overline>
          <Headline className="mb-12">Text Styles & Variants</Headline>

          <div className="space-y-16">
            {/* Hero */}
            <div className="space-y-4">
              <Title>Hero</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Hero>Bold Hero Heading</Hero>
                <Hero variant="semibold">Semibold Hero Heading</Hero>
              </div>
            </div>

            {/* Display */}
            <div className="space-y-4">
              <Title>Display</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Display>Bold Display Heading</Display>
                <Display variant="semibold">Semibold Display Heading</Display>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <Title>Headline</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Headline>Bold Headline Heading</Headline>
                <Headline variant="semibold">
                  Semibold Headline Heading
                </Headline>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <Title>Title</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Title>Bold Title</Title>
                <Title variant="semibold">Semibold Title</Title>
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-4">
              <Title>Subtitle</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Subtitle>Semibold Subtitle</Subtitle>
                <Subtitle variant="regular">Regular Subtitle</Subtitle>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4">
              <Title>Body</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <div>
                  <Body size="lg">Body Large - Normal Weight</Body>
                  <Body size="lg" weight="semibold">
                    Body Large - Semibold Weight
                  </Body>
                </div>
                <div>
                  <Body size="base">Body Base - Normal Weight</Body>
                  <Body size="base" weight="medium">
                    Body Base - Medium Weight
                  </Body>
                  <Body size="base" weight="semibold">
                    Body Base - Semibold Weight
                  </Body>
                </div>
                <div>
                  <Body size="sm">Body Small - Normal Weight</Body>
                  <Body size="sm" weight="semibold">
                    Body Small - Semibold Weight
                  </Body>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="space-y-4">
              <Title>Caption</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Caption>Normal Caption</Caption>
                <Caption variant="semibold">Semibold Caption</Caption>
              </div>
            </div>

            {/* Label */}
            <div className="space-y-4">
              <Title>Label</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Label>Normal Label</Label>
                <Label variant="semibold">Semibold Label</Label>
              </div>
            </div>

            {/* Overline */}
            <div className="space-y-4">
              <Title>Overline</Title>
              <div className="space-y-3 bg-slate-50 p-8 rounded-lg border border-slate-200">
                <Overline>Overline Text</Overline>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Text Colors Section */}
      <section className="border-b py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Overline className="mb-8 text-red-500">Color System</Overline>
          <Headline className="mb-12">Text Colors</Headline>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(colors).map(([key, color]) => (
              <div
                key={key}
                className="bg-slate-50 rounded-lg border border-slate-200 p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded border border-slate-300"
                    style={{
                      backgroundColor: color.hex,
                    }}
                  />
                  <div>
                    <Caption className="text-neutral-light">{key}</Caption>
                    <Title>{color.name}</Title>
                    <Caption className="text-neutral">{color.hex}</Caption>
                  </div>
                </div>
                <Body className={color.class}>
                  The quick brown fox jumps over the lazy dog
                </Body>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Font Weights Section */}
      <section className="border-b py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Overline className="mb-8 text-red-500">Typography Settings</Overline>
          <Headline className="mb-12">Font Weights</Headline>

          <div className="space-y-4">
            {fontWeights.map((weight) => (
              <div
                key={weight.class}
                className="bg-slate-50 rounded-lg border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Caption className="text-neutral-light">
                      {weight.class}
                    </Caption>
                    <Title>{weight.name}</Title>
                  </div>
                  <span className="text-neutral-light text-sm font-medium">
                    Weight {weight.weight}
                  </span>
                </div>
                <p className={`text-lg mt-4 ${weight.class}`}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Letter Spacing Section */}
      <section className="border-b py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Overline className="mb-8 text-red-500">Spacing</Overline>
          <Headline className="mb-12">Letter Spacing</Headline>

          <div className="space-y-4">
            {letterSpacings.map((spacing) => (
              <div
                key={spacing.class}
                className="bg-slate-50 rounded-lg border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Caption className="text-neutral-light">
                      {spacing.class}
                    </Caption>
                    <Title>{spacing.name}</Title>
                  </div>
                  <span className="text-neutral-light text-sm font-medium">
                    {spacing.value}
                  </span>
                </div>
                <p className={`text-base ${spacing.class}`}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Line Height Section */}
      <section className="border-b py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Overline className="mb-8 text-red-500">Spacing</Overline>
          <Headline className="mb-12">Line Heights</Headline>

          <div className="space-y-4">
            {lineHeights.map((lineHeight) => (
              <div
                key={lineHeight.class}
                className="bg-slate-50 rounded-lg border border-slate-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Caption className="text-neutral-light">
                      {lineHeight.class}
                    </Caption>
                    <Title>{lineHeight.name}</Title>
                  </div>
                  <span className="text-neutral-light text-sm font-medium">
                    {lineHeight.value}
                  </span>
                </div>
                <p className={`${lineHeight.class}`}>
                  The quick brown fox jumps over the lazy dog. The quick brown
                  fox jumps over the lazy dog. The quick brown fox jumps over
                  the lazy dog.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Combined Examples Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <Overline className="mb-8 text-red-500">Examples</Overline>
          <Headline className="mb-12">Combined Typography Examples</Headline>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Example 1 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-8">
              <Overline className="text-red-500 mb-2">Example Card</Overline>
              <Headline className="mb-2">Professional Card Title</Headline>
              <Body className="text-neutral mb-4">
                This demonstrates how typography styles combine to create a
                complete card design.
              </Body>
              <Subtitle className="text-red-500">Learn more</Subtitle>
            </div>

            {/* Card Example 2 */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-8">
              <Overline className="text-emerald-600 mb-2">
                Feature Card
              </Overline>
              <Title className="mb-2">Bold Feature Title</Title>
              <Body size="sm" className="text-neutral mb-4">
                Smaller body text works great for supporting content and
                descriptions.
              </Body>
              <Label className="text-emerald-600">Premium Feature</Label>
            </div>

            {/* Card Example 3 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-8">
              <Label className="text-blue-600 mb-3 block">Section Label</Label>
              <Display variant="semibold" className="mb-3">
                Display Semibold
              </Display>
              <Body size="lg" className="text-slate-900 mb-4">
                Combine different typography sizes and weights for visual
                hierarchy.
              </Body>
            </div>

            {/* Card Example 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-8">
              <Caption className="text-orange-600 mb-2">
                Supporting Text
              </Caption>
              <Hero variant="semibold" className="text-4xl mb-2">
                Catchy Headline
              </Hero>
              <Caption className="text-neutral-light">
                Caption text provides additional context and information.
              </Caption>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="border-t bg-slate-50 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Body className="text-neutral mb-2">
            Explore these typography styles in your designs
          </Body>
          <Caption className="text-neutral-light">
            All components are available in the Typography library
          </Caption>
        </div>
      </section>
    </div>
  );
}
