/** @type {import('tailwindcss').Config} */
// To use this config, you need to install tailwindcss-animate:
// npm install -D tailwindcss-animate
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        rose: {
          500: '#f43f5e',
          600: '#e11d48',
        },
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        yellow: {
          300: '#fde047',
          400: '#facc15',
        },
        sky: {
          300: '#7dd3fc',
          400: '#38bdf8',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      minHeight: {
        '5-tasks': '20rem', // Assuming each task item is roughly 4rem high
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
} 