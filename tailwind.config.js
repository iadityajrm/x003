/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          bg: '#F6F4F0',
          surface: '#FAF8F5',
          card: '#FFFFFF',
          border: '#ECE8E1',
          subtle: '#E2DCD3',
          muted: '#8E8B82',
          text: '#1C1B18',
        },
        sage: {
          50: '#F2F6F3',
          100: '#E5EDE7',
          200: '#C8DCCF',
          500: '#527D66',
          700: '#2A4436',
          800: '#20362B',
          900: '#17271E',
          accent: '#2A4436',
          light: '#EBF2EC',
        },
        sand: {
          light: '#F7EBE4',
          accent: '#9E5A3F',
          calendar: '#F4EFE6',
          calendarText: '#7A684D',
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
