/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ["class", ".dark"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // Blue-600
          light: "#3b82f6",   // Blue-500
          dark: "#1d4ed8",    // Blue-700
        },
        accent: {
          DEFAULT: "#0f172a", // Slate-900
          light: "#334155",   // Slate-700
          dark: "#020617",    // Slate-950
        },
        dark: {
          bg: "#0f172a",      // Slate-900
          card: "#1e293b",    // Slate-800
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 400ms ease-out both",
        "slide-in-down": "slideInDown 500ms ease-out forwards",
        "marquee": "marquee 25s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      fontFamily: {
        sans: ["'Manrope'", "system-ui", "-apple-system", "sans-serif"],
      },
      transitionTimingFunction: {
        smooth: "ease-out",
        "smooth-ease": "ease-in-out",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
