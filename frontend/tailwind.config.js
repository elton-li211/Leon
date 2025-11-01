/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'leon-primary': '#2563eb',
        'leon-secondary': '#1e40af',
        'leon-accent': '#10b981',
        'leon-danger': '#ef4444',
      }
    },
  },
  plugins: [],
}
