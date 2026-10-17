/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          bg: '#F5F5F7',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E5E5EA',
          subtle: '#D1D1D6',
          muted: '#86868B',
          text: '#1D1D1F',
        },
        sage: {
          50: '#F5F5F7',
          100: '#E5E5EA',
          200: '#D1D1D6',
          500: '#636366',
          700: '#1D1D1F',
          800: '#151516',
          900: '#000000',
          accent: '#1D1D1F',
          light: '#F5F5F7',
        },
        sand: {
          light: '#F5F5F7',
          accent: '#636366',
          calendar: '#F2F2F7',
          calendarText: '#3A3A3C',
        },
        apple: {
          canvas: '#F5F5F7',
          surface: '#FFFFFF',
          subtle: '#E5E5EA',
          border: '#D1D1D6',
          muted: '#86868B',
          secondary: '#636366',
          primary: '#1D1D1F',
          darkBg: '#000000',
          darkCard: '#1C1C1E',
          darkSurface: '#2C2C2E',
          darkBorder: '#3A3A3C',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.04)',
        'soft-card': '0 4px 20px -2px rgba(28, 27, 24, 0.05)',
        'soft-lg': '0 12px 36px -4px rgba(28, 27, 24, 0.08)',
        'composer': '0 10px 40px -6px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
