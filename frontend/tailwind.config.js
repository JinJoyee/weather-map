/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#312E81",
        tertiary: "#F59E0B",
        neutral: "#F8FAFC",
        'surface-dark':   '#0F172A',
        'surface-dark-2': '#1E293B',
        'surface-dark-3': '#334155',
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'lvl2': '12px',
      }
    },
  },
  plugins: [],
}