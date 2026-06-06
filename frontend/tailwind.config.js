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
        // ── 라이트 모드 토큰 (기존 유지) ─────────────────────────
        primary:   "#2542C8",
        cta:       "#1B1C22",
        secondary: "#312E81",
        weather:   "#D6831C",
        custom:    "#2C8A57",
        bg:        "#F3F1EB",
        card:      "#FFFFFF",
        ink:       "#1A1A1F",
        muted:     "#5E5A50",
        faint:     "#9A9488",
        line:      "#E7E2D6",
        line2:     "#D5CEBF",
        chip:      "#EEEAE0",
        // ── 다크 모드 서피스 토큰 ──────────────────────────────────
        'dark-bg':    '#0F172A',
        'dark-card':  '#1E293B',
        'dark-ink':   '#F1F5F9',
        'dark-muted': '#94A3B8',
        'dark-faint': '#64748B',
        'dark-line':  '#334155',
        'dark-line2': '#475569',
        'dark-chip':  '#273449',
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lvl2:  "12px",
        card:  "18px",
        sheet: "22px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(40,33,20,.05), 0 1px 1px rgba(40,33,20,.04)",
        md: "0 1px 3px rgba(40,33,20,.06), 0 6px 16px -10px rgba(40,33,20,.18)",
        lg: "0 2px 8px -4px rgba(40,33,20,.12), 0 18px 38px -20px rgba(40,33,20,.26)",
      },
    },
  },
  plugins: [],
}