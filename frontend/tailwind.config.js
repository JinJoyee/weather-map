/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2542C8",
        cta: "#1B1C22",
        secondary: "#312E81",
        weather: "#D6831C",
        custom: "#2C8A57",
        bg: "#F3F1EB",
        card: "#FFFFFF",
        ink: "#1A1A1F",
        muted: "#5E5A50",
        faint: "#9A9488",
        line: "#E7E2D6",
        line2: "#D5CEBF",
        chip: "#EEEAE0",
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lvl2: "12px",
        card: "18px",
        sheet: "22px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(40,33,20,.05), 0 1px 1px rgba(40,33,20,.04)",
        md: "0 1px 3px rgba(40,33,20,.06), 0 6px 16px -10px rgba(40,33,20,.18)",
        lg: "0 2px 8px -4px rgba(40,33,20,.12), 0 18px 38px -20px rgba(40,33,20,.26)",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        fadeup: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        slideup: { from: { transform: "translateY(16px)" }, to: { transform: "none" } },
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".45" } },
      },
      animation: {
        shimmer: "shimmer 1.3s ease-in-out infinite",
        fadeup: "fadeup .45s ease both",
        slideup: "slideup .3s ease",
        pulse2: "pulse2 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
