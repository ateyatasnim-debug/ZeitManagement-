/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0f1c',
          900: '#0f172a',
          800: '#161f36',
          700: '#1f2b47',
          600: '#2a3856'
        },
        accent: {
          DEFAULT: '#f97316',
          soft: '#fb923c'
        },
        focus: {
          DEFAULT: '#6366f1'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
}
