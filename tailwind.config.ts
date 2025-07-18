import type {Config} from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0A0903',
        foreground: '#E2FDFF',
        card: '#151417',
        border: '#262933',
        input: '#1F2129',
        primary: {
          DEFAULT: '#00807E', // Flow Teal
          foreground: '#E2FDFF',
        },
        secondary: {
          DEFAULT: '#0282F2', // Flow Blue
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FFD430', // Flow Yellow
          foreground: '#332A00',
        },
        impact: {
          DEFAULT: '#F46036', // Flow Orange
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#28A745', // Functional Green
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // Keep HSL for ShadCN compatibility if needed
          foreground: '#9CA3AF',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
