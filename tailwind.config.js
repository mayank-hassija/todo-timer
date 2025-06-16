/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9ca3af',
          300: '#d1d5db',
        },
        blue: {
          600: '#2563eb',
          500: '#3b82f6',
        },
      },
      fontFamily: {
        'sans': ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      minHeight: {
        '5-tasks': '20rem', // Assuming each task item is roughly 4rem high
      }
    },
  },
  plugins: [],
} 