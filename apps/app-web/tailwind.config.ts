import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui-kit/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    colors: {
      // Primary Brand Colors - Bold Red (matches logo)
      primary: {
        "50": "#fef2f2",
        "100": "#fee2e2",
        "200": "#fecaca",
        "300": "#fca5a5",
        "400": "#f87171",
        "500": "#ef4444", // Main brand red
        "600": "#dc2626",
        "700": "#b91c1c",
        "800": "#991b1b",
        "900": "#7f1d1d",
        "950": "#450a0a",
      },
      // Sophisticated Slate - Modern foundation
      slate: {
        "50": "#f9fafb",
        "100": "#f3f4f6",
        "200": "#e5e7eb",
        "300": "#d1d5db",
        "400": "#9ca3af",
        "500": "#6b7280",
        "600": "#4b5563",
        "700": "#374151",
        "800": "#1f2937",
        "900": "#111827",
        "950": "#030712",
      },
      // Accent Emerald - Growth and energy
      accent: {
        "50": "#f0fdf4",
        "100": "#dcfce7",
        "200": "#bbf7d0",
        "300": "#86efac",
        "400": "#4ade80",
        "500": "#22c55e",
        "600": "#16a34a",
        "700": "#15803d",
        "800": "#166534",
        "900": "#14532d",
        "950": "#052e16",
      },
      // Warning Amber - Attention and caution
      warning: {
        "50": "#fffbeb",
        "100": "#fef3c7",
        "200": "#fde68a",
        "300": "#fcd34d",
        "400": "#fbbf24",
        "500": "#f59e0b",
        "600": "#d97706",
        "700": "#b45309",
        "800": "#92400e",
        "900": "#78350f",
        "950": "#451a03",
      },
      // Error Rose - Destructive actions
      error: {
        "50": "#fff5f7",
        "100": "#ffe4e9",
        "200": "#ffd4db",
        "300": "#ffb3c1",
        "400": "#ff8fa3",
        "500": "#ff6b85",
        "600": "#f85577",
        "700": "#e63f5a",
        "800": "#d12a45",
        "900": "#a01a31",
        "950": "#5f0a1a",
      },
      // Success Teal - Positive outcomes
      success: {
        "50": "#f0fdfa",
        "100": "#ccfbf1",
        "200": "#99f6e4",
        "300": "#5eead4",
        "400": "#2dd4bf",
        "500": "#14b8a6",
        "600": "#0d9488",
        "700": "#0f766e",
        "800": "#115e59",
        "900": "#134e4a",
        "950": "#051f1b",
      },
      // Secondary Indigo - Professional hierarchy
      indigo: {
        "50": "#eef2ff",
        "100": "#e0e7ff",
        "200": "#c7d2fe",
        "300": "#a5b4fc",
        "400": "#818cf8",
        "500": "#6366f1", // Main secondary indigo
        "600": "#4f46e5",
        "700": "#4338ca",
        "800": "#3730a3",
        "900": "#312e81",
        "950": "#1e1b4b",
      },
      // Info Blue - Informational content
      info: {
        "50": "#eff6ff",
        "100": "#dbeafe",
        "200": "#bfdbfe",
        "300": "#93c5fd",
        "400": "#60a5fa",
        "500": "#3b82f6",
        "600": "#2563eb",
        "700": "#1d4ed8",
        "800": "#1e40af",
        "900": "#1e3a8a",
        "950": "#172554",
      },
      // Shadcn compatibility
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "#ef4444", // error-500
        foreground: "#ffffff",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      sidebar: {
        DEFAULT: "hsl(var(--sidebar-background))",
        foreground: "hsl(var(--sidebar-foreground))",
        primary: "hsl(var(--sidebar-primary))",
        "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
        accent: "hsl(var(--sidebar-accent))",
        "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        border: "hsl(var(--sidebar-border))",
        ring: "hsl(var(--sidebar-ring))",
      },
      white: "#ffffff",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontSize: {
      // Modern Typography Scale
      hero: [
        "4.5rem",
        {
          lineHeight: "1",
          letterSpacing: "-0.025em",
          fontWeight: "700",
        },
      ],
      display: [
        "3rem",
        {
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
          fontWeight: "600",
        },
      ],
      headline: [
        "2.25rem",
        {
          lineHeight: "1.2",
          letterSpacing: "-0.015em",
          fontWeight: "600",
        },
      ],
      title: [
        "1.5rem",
        {
          lineHeight: "1.3",
          letterSpacing: "-0.01em",
          fontWeight: "600",
        },
      ],
      "body-lg": [
        "1.25rem",
        {
          lineHeight: "1.7",
          fontWeight: "400",
        },
      ],
      body: [
        "1rem",
        {
          lineHeight: "1.6",
          fontWeight: "400",
        },
      ],
      caption: [
        "0.875rem",
        {
          lineHeight: "1.4",
          fontWeight: "400",
        },
      ],
      label: [
        "0.75rem",
        {
          lineHeight: "1.3",
          letterSpacing: "0.05em",
          fontWeight: "500",
        },
      ],
      // Standard Tailwind sizes
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
    extend: {
      colors: {
        // Primary Brand Colors - Bold Red (matches logo)
        primary: {
          "50": "#fef2f2",
          "100": "#fee2e2",
          "200": "#fecaca",
          "300": "#fca5a5",
          "400": "#f87171",
          "500": "#ef4444", // Main brand red
          "600": "#dc2626",
          "700": "#b91c1c",
          "800": "#991b1b",
          "900": "#7f1d1d",
          "950": "#450a0a",
        },
        // Sophisticated Slate - Modern foundation
        slate: {
          "50": "#f9fafb",
          "100": "#f3f4f6",
          "200": "#e5e7eb",
          "300": "#d1d5db",
          "400": "#9ca3af",
          "500": "#6b7280",
          "600": "#4b5563",
          "700": "#374151",
          "800": "#1f2937",
          "900": "#111827",
          "950": "#030712",
        },
        // Accent Emerald - Growth and energy
        accent: {
          "50": "#f0fdf4",
          "100": "#dcfce7",
          "200": "#bbf7d0",
          "300": "#86efac",
          "400": "#4ade80",
          "500": "#22c55e",
          "600": "#16a34a",
          "700": "#15803d",
          "800": "#166534",
          "900": "#14532d",
          "950": "#052e16",
        },
        // Warning Amber - Attention and caution
        warning: {
          "50": "#fffbeb",
          "100": "#fef3c7",
          "200": "#fde68a",
          "300": "#fcd34d",
          "400": "#fbbf24",
          "500": "#f59e0b",
          "600": "#d97706",
          "700": "#b45309",
          "800": "#92400e",
          "900": "#78350f",
          "950": "#451a03",
        },
        // Error Rose - Destructive actions
        error: {
          "50": "#fff5f7",
          "100": "#ffe4e9",
          "200": "#ffd4db",
          "300": "#ffb3c1",
          "400": "#ff8fa3",
          "500": "#ff6b85",
          "600": "#f85577",
          "700": "#e63f5a",
          "800": "#d12a45",
          "900": "#a01a31",
          "950": "#5f0a1a",
        },
        // Success Teal - Positive outcomes
        success: {
          "50": "#f0fdfa",
          "100": "#ccfbf1",
          "200": "#99f6e4",
          "300": "#5eead4",
          "400": "#2dd4bf",
          "500": "#14b8a6",
          "600": "#0d9488",
          "700": "#0f766e",
          "800": "#115e59",
          "900": "#134e4a",
          "950": "#051f1b",
        },
        // Shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      spacing: {
        // Professional spacing scale
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
        // Micro spacing for precision
        "0.5": "0.125rem",
        "1.5": "0.375rem",
        "2.5": "0.625rem",
        "3.5": "0.875rem",
      },
      borderRadius: {
        none: "0px",
        xs: "0.125rem",
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        full: "9999px",
        "shadcn-lg": "var(--radius)",
        "shadcn-md": "calc(var(--radius) - 2px)",
        "shadcn-sm": "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Professional shadows
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        DEFAULT:
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        none: "none",
        // Brand-specific shadows
        modern:
          "0 4px 6px -1px rgb(17 24 39 / 0.1), 0 2px 4px -2px rgb(17 24 39 / 0.1)",
        "modern-lg":
          "0 10px 15px -3px rgb(17 24 39 / 0.1), 0 4px 6px -4px rgb(17 24 39 / 0.1)",
        "primary-glow": "0 0 20px rgb(106 157 255 / 0.3)",
        "accent-glow": "0 0 20px rgb(34 197 94 / 0.3)",
        "card-hover":
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
      },
      keyframes: {
        // Modern animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgb(106 157 255 / 0.3)" },
          "50%": { boxShadow: "0 0 30px rgb(106 157 255 / 0.5)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "40px",
        "3xl": "64px",
      },
      zIndex: {
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        auto: "auto",
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        "modal-backdrop": "1040",
        modal: "1050",
        popover: "1060",
        tooltip: "1070",
        toast: "1080",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    // Modern Component System
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function ({ addUtilities }: { addUtilities: (utilities: any) => void }) {
      const newUtilities = {
        // === MODERN TYPOGRAPHY ===
        // Note: Typography classes are defined in fontSize theme config above

        // === MODERN CARDS ===
        ".card-modern": {
          borderRadius: "1rem",
          border: "1px solid rgb(209 213 219 / 0.3)",
          background: "rgb(255 255 255 / 0.85)",
          padding: "2rem",
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
          backdropFilter: "blur(8px)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow:
              "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            borderColor: "rgb(106 157 255 / 0.3)",
          },
        },
        ".card-elevated": {
          "@apply card-modern": {},
          boxShadow:
            "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          "&:hover": {
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          },
        },
        ".card-glass": {
          borderRadius: "1rem",
          border: "1px solid rgb(209 213 219 / 0.2)",
          background: "rgb(255 255 255 / 0.1)",
          backdropFilter: "blur(16px)",
          padding: "2rem",
          transition: "all 0.3s ease",
        },

        // === MODERN BUTTONS ===
        ".btn-primary": {
          borderRadius: "0.5rem",
          background: "#6a9dff",
          padding: "0.75rem 1.5rem",
          fontWeight: "600",
          color: "white",
          transition: "background-color 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            background: "#5585e6",
            boxShadow: "0 4px 6px -1px rgb(106 157 255 / 0.3)",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "0 0 0 3px rgb(106 157 255 / 0.3)",
          },
        },
        ".btn-secondary": {
          borderRadius: "0.5rem",
          background: "rgb(243 244 246)",
          padding: "0.75rem 1.5rem",
          fontWeight: "600",
          color: "rgb(17 24 39)",
          transition: "background-color 0.2s ease",
          "&:hover": {
            background: "rgb(229 231 235)",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "0 0 0 3px rgb(106 157 255 / 0.3)",
          },
        },
        ".btn-accent": {
          borderRadius: "0.5rem",
          background: "#22c55e",
          padding: "0.75rem 1.5rem",
          fontWeight: "600",
          color: "white",
          transition: "background-color 0.2s ease",
          "&:hover": {
            background: "#16a34a",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "0 0 0 3px rgb(34 197 94 / 0.3)",
          },
        },
        ".btn-ghost": {
          borderRadius: "0.5rem",
          padding: "0.75rem 1.5rem",
          fontWeight: "600",
          color: "#6a9dff",
          transition: "background-color 0.2s ease",
          "&:hover": {
            background: "rgb(106 157 255 / 0.1)",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "0 0 0 3px rgb(106 157 255 / 0.3)",
          },
        },

        // === MODERN INPUTS ===
        ".input-modern": {
          width: "100%",
          borderRadius: "0.5rem",
          border: "1px solid rgb(209 213 219)",
          background: "rgb(255 255 255)",
          padding: "0.75rem 1rem",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          "&:focus": {
            borderColor: "#6a9dff",
            boxShadow: "0 0 0 2px rgb(106 157 255 / 0.2)",
            outline: "none",
          },
        },
        ".input-error": {
          "@apply input-modern": {},
          borderColor: "#ff6b85",
          "&:focus": {
            borderColor: "#ff6b85",
            boxShadow: "0 0 0 2px rgb(255 107 133 / 0.2)",
          },
        },

        // === MODERN BADGES ===
        ".badge-modern": {
          display: "inline-flex",
          alignItems: "center",
          borderRadius: "9999px",
          padding: "0.25rem 0.75rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        },
        ".badge-primary": {
          "@apply badge-modern": {},
          border: "1px solid rgb(106 157 255 / 0.2)",
          background: "rgb(106 157 255 / 0.1)",
          color: "#6a9dff",
        },
        ".badge-accent": {
          "@apply badge-modern": {},
          border: "1px solid rgb(34 197 94 / 0.2)",
          background: "rgb(34 197 94 / 0.1)",
          color: "#22c55e",
        },
        ".badge-success": {
          "@apply badge-modern": {},
          border: "1px solid rgb(20 184 166 / 0.2)",
          background: "rgb(20 184 166 / 0.1)",
          color: "#14b8a6",
        },
        ".badge-warning": {
          "@apply badge-modern": {},
          border: "1px solid rgb(245 158 11 / 0.2)",
          background: "rgb(245 158 11 / 0.1)",
          color: "#f59e0b",
        },
        ".badge-neutral": {
          "@apply badge-modern": {},
          background: "rgb(243 244 246)",
          color: "rgb(17 24 39)",
        },

        // === MODERN EFFECTS ===
        ".hover-lift": {
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          },
        },
        ".hover-glow": {
          transition: "box-shadow 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 0 20px rgb(106 157 255 / 0.3)",
          },
        },
        ".glass-effect": {
          background: "rgb(255 255 255 / 0.1)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgb(255 255 255 / 0.2)",
        },

        // === MODERN UTILITIES ===
        ".modern-blur": {
          backdropFilter: "blur(12px)",
        },
        ".primary-glow": {
          boxShadow: "0 0 20px rgb(239 68 68 / 0.3)",
        },
        ".secondary-glow": {
          boxShadow: "0 0 20px rgb(99 102 241 / 0.3)",
        },
        ".accent-glow": {
          boxShadow: "0 0 20px rgb(34 197 94 / 0.3)",
        },
        ".text-gradient-primary": {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".text-gradient-secondary": {
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".text-gradient-accent": {
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },

        // === MODERN TYPOGRAPHY VARIANTS ===
        // Hero
        ".text-hero": {
          fontSize: "4.5rem",
          fontWeight: "700",
          lineHeight: "1",
          letterSpacing: "-0.025em",
        },
        ".text-hero-semibold": {
          fontSize: "4.5rem",
          fontWeight: "600",
          lineHeight: "1",
          letterSpacing: "-0.025em",
        },

        // Display
        ".text-display": {
          fontSize: "3rem",
          fontWeight: "700",
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
        },
        ".text-display-semibold": {
          fontSize: "3rem",
          fontWeight: "600",
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
        },

        // Headline
        ".text-headline": {
          fontSize: "2.25rem",
          fontWeight: "700",
          lineHeight: "1.2",
          letterSpacing: "-0.015em",
        },
        ".text-headline-semibold": {
          fontSize: "2.25rem",
          fontWeight: "600",
          lineHeight: "1.2",
          letterSpacing: "-0.015em",
        },

        // Title
        ".text-title": {
          fontSize: "1.5rem",
          fontWeight: "700",
          lineHeight: "1.3",
        },
        ".text-title-semibold": {
          fontSize: "1.5rem",
          fontWeight: "600",
          lineHeight: "1.3",
        },

        // Subtitle
        ".text-subtitle": {
          fontSize: "1.125rem",
          fontWeight: "600",
          lineHeight: "1.35",
        },
        ".text-subtitle-regular": {
          fontSize: "1.125rem",
          fontWeight: "400",
          lineHeight: "1.35",
        },

        // Body Large
        ".text-body-lg": {
          fontSize: "1.25rem",
          fontWeight: "400",
          lineHeight: "1.7",
        },
        ".text-body-lg-semibold": {
          fontSize: "1.25rem",
          fontWeight: "600",
          lineHeight: "1.7",
        },

        // Body Regular
        ".text-body": {
          fontSize: "1rem",
          fontWeight: "400",
          lineHeight: "1.6",
        },
        ".text-body-semibold": {
          fontSize: "1rem",
          fontWeight: "600",
          lineHeight: "1.6",
        },
        ".text-body-medium": {
          fontSize: "1rem",
          fontWeight: "500",
          lineHeight: "1.6",
        },

        // Body Small
        ".text-body-sm": {
          fontSize: "0.875rem",
          fontWeight: "400",
          lineHeight: "1.6",
        },
        ".text-body-sm-semibold": {
          fontSize: "0.875rem",
          fontWeight: "600",
          lineHeight: "1.6",
        },

        // Caption
        ".text-caption": {
          fontSize: "0.875rem",
          fontWeight: "400",
          lineHeight: "1.4",
        },
        ".text-caption-semibold": {
          fontSize: "0.875rem",
          fontWeight: "600",
          lineHeight: "1.4",
        },

        // Label
        ".text-label": {
          fontSize: "0.75rem",
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
        ".text-label-semibold": {
          fontSize: "0.75rem",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },

        // Overline
        ".text-overline": {
          fontSize: "0.75rem",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        },

        // === CARD COLOR VARIANTS ===
        ".card-primary": {
          borderLeft: "4px solid #ef4444",
          background: "rgb(255 255 255)",
          borderRadius: "0.75rem",
          border: "1px solid rgb(209 213 219 / 0.5)",
        },
        ".card-secondary": {
          borderLeft: "4px solid #6366f1",
          background: "rgb(255 255 255)",
          borderRadius: "0.75rem",
          border: "1px solid rgb(209 213 219 / 0.5)",
        },
        ".card-accent": {
          borderLeft: "4px solid #22c55e",
          background: "rgb(255 255 255)",
          borderRadius: "0.75rem",
          border: "1px solid rgb(209 213 219 / 0.5)",
        },
        ".card-success": {
          borderLeft: "4px solid #14b8a6",
          background: "rgb(255 255 255)",
          borderRadius: "0.75rem",
          border: "1px solid rgb(209 213 219 / 0.5)",
        },
        ".card-warning": {
          borderLeft: "4px solid #f59e0b",
          background: "rgb(255 255 255)",
          borderRadius: "0.75rem",
          border: "1px solid rgb(209 213 219 / 0.5)",
        },
        ".card-error": {
          borderLeft: "4px solid #ff6b85",
          background: "rgb(255 255 255)",
          borderRadius: "0.75rem",
          border: "1px solid rgb(209 213 219 / 0.5)",
        },

        // === TEXT COLOR VARIANTS ===
        // Primary text colors
        ".text-primary-light": {
          color: "rgb(239 68 68 / 0.7)",
        },
        ".text-primary-muted": {
          color: "rgb(239 68 68 / 0.5)",
        },

        // Secondary text colors
        ".text-secondary-light": {
          color: "rgb(99 102 241 / 0.7)",
        },
        ".text-secondary-muted": {
          color: "rgb(99 102 241 / 0.5)",
        },

        // Accent text colors
        ".text-accent-light": {
          color: "rgb(34 197 94 / 0.7)",
        },
        ".text-accent-muted": {
          color: "rgb(34 197 94 / 0.5)",
        },

        // Semantic text colors
        ".text-success": {
          color: "#14b8a6",
        },
        ".text-success-light": {
          color: "rgb(20 184 166 / 0.7)",
        },
        ".text-warning": {
          color: "#f59e0b",
        },
        ".text-warning-light": {
          color: "rgb(245 158 11 / 0.7)",
        },
        ".text-error": {
          color: "#ff6b85",
        },
        ".text-error-light": {
          color: "rgb(255 107 133 / 0.7)",
        },

        // Neutral text colors
        ".text-neutral-dark": {
          color: "rgb(17 24 39)",
        },
        ".text-neutral": {
          color: "rgb(107 114 128)",
        },
        ".text-neutral-light": {
          color: "rgb(156 163 175)",
        },
        ".text-neutral-lighter": {
          color: "rgb(209 213 219)",
        },

        // === FONT WEIGHT SHORTCUTS ===
        ".font-thin": {
          fontWeight: "100",
        },
        ".font-extralight": {
          fontWeight: "200",
        },
        ".font-light": {
          fontWeight: "300",
        },
        ".font-normal": {
          fontWeight: "400",
        },
        ".font-medium": {
          fontWeight: "500",
        },
        ".font-semibold": {
          fontWeight: "600",
        },
        ".font-bold": {
          fontWeight: "700",
        },
        ".font-extrabold": {
          fontWeight: "800",
        },
        ".font-black": {
          fontWeight: "900",
        },

        // === LETTER SPACING VARIANTS ===
        ".tracking-ultra-tight": {
          letterSpacing: "-0.1em",
        },
        ".tracking-tighter": {
          letterSpacing: "-0.05em",
        },
        ".tracking-tight": {
          letterSpacing: "-0.025em",
        },
        ".tracking-normal": {
          letterSpacing: "0em",
        },
        ".tracking-wide": {
          letterSpacing: "0.025em",
        },
        ".tracking-wider": {
          letterSpacing: "0.05em",
        },
        ".tracking-widest": {
          letterSpacing: "0.1em",
        },

        // === LINE HEIGHT VARIANTS ===
        ".leading-tight-xs": {
          lineHeight: "1",
        },
        ".leading-tight": {
          lineHeight: "1.2",
        },
        ".leading-snug": {
          lineHeight: "1.35",
        },
        ".leading-normal": {
          lineHeight: "1.5",
        },
        ".leading-relaxed": {
          lineHeight: "1.65",
        },
        ".leading-loose": {
          lineHeight: "2",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
