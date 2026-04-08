/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brex neutral scale
        neutral: {
          50: '#fefbfa',
          100: '#fdf8f6',
          200: '#f9f0ed',
          300: '#f2e4dd',
          400: '#e7cfc1',
          500: '#d8b4a0',
          600: '#c99076',
          700: '#b36e51',
          800: '#8d5138',
          900: '#643f2f',
          950: '#2c2523',
        },
        // Brex gray scale
        gray: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e7e7e7',
          300: '#d1d1d1',
          400: '#b4b4b4',
          500: '#9b9b9b',
          600: '#6f6f6f',
          700: '#525252',
          800: '#3d3d3d',
          900: '#292929',
          950: '#121212',
        },
        // Brex orange (brand)
        orange: {
          50: '#fffaf5',
          100: '#fff4eb',
          200: '#ffe6d1',
          300: '#ffd2ad',
          400: '#ffb380',
          500: '#ff914d',
          600: '#ff6f1a',
          700: '#ff5900',
          800: '#cc4700',
          900: '#993600',
          950: '#661e00',
        },
        // Brex cerulean (info blue)
        cerulean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e5fe',
          300: '#7dd3fc',
          400: '#3dbdfa',
          500: '#3293ff',
          600: '#0079db',
          700: '#0061b5',
          800: '#004d8f',
          900: '#003a6b',
          950: '#002347',
        },
        // Semantic colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        normal: '420',
        medium: '500',
        semibold: '600',
      },
    },
  },
  plugins: [],
}
