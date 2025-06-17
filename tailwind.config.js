/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a1a1a',
        'dark-surface': '#2d2d2d',
        'dark-primary': '#0078d4',
        'dark-secondary': '#3c3c3c',
        'win11': {
          'bg': '#202020',
          'surface': '#2d2d2d',
          'text': '#ffffff',
          'text-secondary': '#a0a0a0',
          'accent': '#0078d4',
          'accent-hover': '#106ebe',
        }
      },
      fontFamily: {
        'sans': ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 