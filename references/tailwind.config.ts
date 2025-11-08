import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    fontSize: {
      // Professional Typography Scale
      'hero': [
        '4.5rem',
        {
          lineHeight: '1',
          letterSpacing: '-0.025em',
          fontWeight: '700'
        }
      ],
      'display': [
        '3rem',
        {
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          fontWeight: '600'
        }
      ],
      'headline': [
        '2.25rem',
        {
          lineHeight: '1.2',
          letterSpacing: '-0.015em',
          fontWeight: '600'
        }
      ],
      'title': [
        '1.5rem',
        {
          lineHeight: '1.3',
          letterSpacing: '-0.01em',
          fontWeight: '600'
        }
      ],
      'body-lg': [
        '1.25rem',
        {
          lineHeight: '1.7',
          fontWeight: '400'
        }
      ],
      'body': [
        '1rem',
        {
          lineHeight: '1.6',
          fontWeight: '400'
        }
      ],
      'caption': [
        '0.875rem',
        {
          lineHeight: '1.4',
          fontWeight: '400'
        }
      ],
      'label': [
        '0.75rem',
        {
          lineHeight: '1.3',
          letterSpacing: '0.05em',
          fontWeight: '500'
        }
      ],
      // Standard Tailwind sizes
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },
    extend: {
      colors: {
        // Primary Brand Colors - Red from spearhead
        primary: {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444', // Main brand red
          '600': '#dc2626',
          '700': '#b91c1c',
          '800': '#991b1b',
          '900': '#7f1d1d',
          '950': '#450a0a'
        },
        // Professional Grays - Precision focused
        precision: {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
          '950': '#020617'
        },
        // Accent Blue - Professional contrast
        accent: {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
          '950': '#172554'
        },
        // Success Green
        success: {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#14532d',
          '950': '#052e16'
        },
        // Warning Yellow
        warning: {
          '50': '#fffbeb',
          '100': '#fef3c7',
          '200': '#fde68a',
          '300': '#fcd34d',
          '400': '#fbbf24',
          '500': '#f59e0b',
          '600': '#d97706',
          '700': '#b45309',
          '800': '#92400e',
          '900': '#78350f',
          '950': '#451a03'
        },
        // Shadcn compatibility
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace'
        ],
        display: [
          'Inter',
          'system-ui',
          'sans-serif'
        ]
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900'
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      spacing: {
        // Professional spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        // Micro spacing for precision
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem'
      },
      borderRadius: {
        none: '0px',
        xs: '0.125rem',
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
        'shadcn-lg': 'var(--radius)',
        'shadcn-md': 'calc(var(--radius) - 2px)',
        'shadcn-sm': 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        // Professional shadows
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
        // Brand-specific shadows
        'precision': '0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)',
        'precision-lg': '0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)',
        'primary-glow': '0 0 20px rgb(239 68 68 / 0.3)',
        'accent-glow': '0 0 20px rgb(59 130 246 / 0.3)',
        'card-hover': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      },
      keyframes: {
        // Professional animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgb(239 68 68 / 0.3)' },
          '50%': { boxShadow: '0 0 30px rgb(239 68 68 / 0.5)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.5s ease-out',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.6s ease-out'
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px'
      },
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        auto: 'auto',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
        toast: '1080'
      }
    }
  },
  plugins: [
    tailwindcssAnimate,
    // Professional Component System
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function({ addUtilities }: { addUtilities: (utilities: any) => void }) {
      const newUtilities = {
        // === PROFESSIONAL TYPOGRAPHY ===
        // Note: Typography classes are defined in fontSize theme config above

        // === PROFESSIONAL CARDS ===
        '.card-precision': {
          borderRadius: '1rem',
          border: '1px solid rgb(51 65 85 / 0.2)',
          background: 'rgb(255 255 255 / 0.8)',
          padding: '2rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            borderColor: 'rgb(239 68 68 / 0.3)',
          },
        },
        '.card-elevated': {
          '@apply card-precision': {},
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          },
        },
        '.card-glass': {
          borderRadius: '1rem',
          border: '1px solid rgb(51 65 85 / 0.2)',
          background: 'rgb(255 255 255 / 0.1)',
          backdropFilter: 'blur(16px)',
          padding: '2rem',
          transition: 'all 0.3s ease',
        },

        // === PROFESSIONAL BUTTONS ===
        '.btn-primary': {
          borderRadius: '0.5rem',
          background: '#ef4444',
          padding: '0.75rem 1.5rem',
          fontWeight: '600',
          color: 'white',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            background: '#dc2626',
            boxShadow: '0 4px 6px -1px rgb(239 68 68 / 0.3)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgb(239 68 68 / 0.3)',
          },
        },
        '.btn-secondary': {
          borderRadius: '0.5rem',
          background: 'rgb(241 245 249)',
          padding: '0.75rem 1.5rem',
          fontWeight: '600',
          color: 'rgb(15 23 42)',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            background: 'rgb(226 232 240)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgb(59 130 246 / 0.3)',
          },
        },
        '.btn-accent': {
          borderRadius: '0.5rem',
          background: '#3b82f6',
          padding: '0.75rem 1.5rem',
          fontWeight: '600',
          color: 'white',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            background: '#2563eb',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgb(59 130 246 / 0.3)',
          },
        },
        '.btn-ghost': {
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontWeight: '600',
          color: '#ef4444',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            background: 'rgb(239 68 68 / 0.1)',
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgb(239 68 68 / 0.3)',
          },
        },

        // === PROFESSIONAL INPUTS ===
        '.input-precision': {
          width: '100%',
          borderRadius: '0.5rem',
          border: '1px solid rgb(100 116 139)',
          background: 'rgb(255 255 255)',
          padding: '0.75rem 1rem',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:focus': {
            borderColor: '#ef4444',
            boxShadow: '0 0 0 2px rgb(239 68 68 / 0.2)',
            outline: 'none',
          },
        },
        '.input-error': {
          '@apply input-precision': {},
          borderColor: '#ef4444',
          '&:focus': {
            borderColor: '#ef4444',
            boxShadow: '0 0 0 2px rgb(239 68 68 / 0.2)',
          },
        },

        // === PROFESSIONAL BADGES ===
        '.badge-precision': {
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: '9999px',
          padding: '0.25rem 0.75rem',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
        '.badge-primary': {
          '@apply badge-precision': {},
          border: '1px solid rgb(239 68 68 / 0.2)',
          background: 'rgb(239 68 68 / 0.1)',
          color: '#ef4444',
        },
        '.badge-accent': {
          '@apply badge-precision': {},
          border: '1px solid rgb(59 130 246 / 0.2)',
          background: 'rgb(59 130 246 / 0.1)',
          color: '#3b82f6',
        },
        '.badge-success': {
          '@apply badge-precision': {},
          border: '1px solid rgb(34 197 94 / 0.2)',
          background: 'rgb(34 197 94 / 0.1)',
          color: '#22c55e',
        },
        '.badge-warning': {
          '@apply badge-precision': {},
          border: '1px solid rgb(251 191 36 / 0.2)',
          background: 'rgb(251 191 36 / 0.1)',
          color: '#fbbf24',
        },
        '.badge-neutral': {
          '@apply badge-precision': {},
          background: 'rgb(241 245 249)',
          color: 'rgb(30 41 59)',
        },

        // === PROFESSIONAL EFFECTS ===
        '.hover-lift': {
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
        },
        '.hover-glow': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgb(239 68 68 / 0.3)',
          },
        },
        '.glass-effect': {
          background: 'rgb(255 255 255 / 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgb(255 255 255 / 0.2)',
        },

        // === PROFESSIONAL UTILITIES ===
        '.precision-blur': {
          backdropFilter: 'blur(12px)',
        },
        '.primary-glow': {
          boxShadow: '0 0 20px rgb(239 68 68 / 0.3)',
        },
        '.accent-glow': {
          boxShadow: '0 0 20px rgb(59 130 246 / 0.3)',
        },
        '.text-gradient-primary': {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-accent': {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config