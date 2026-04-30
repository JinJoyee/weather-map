/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",     // Vibrant Blue
        secondary: "#312E81",   // Deep Indigo
        tertiary: "#F59E0B",    // Warm Amber
        neutral: "#F8FAFC",     // Clean Slate
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'lvl2': '12px', // 명세서의 Level 2 둥글기 (12px)
      }
    },
  },
  plugins: [],
}