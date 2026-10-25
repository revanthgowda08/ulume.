/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
      },
      colors: {
        primary: "#1A3C34",
        primaryMid: "#2E7D52",
        primaryLight: "#E8F5E9",
        accent: "#F5A623",
        accentDark: "#D4891C",
        errorRed: "#C62828",
        // Warm-tinted neutrals (replace raw Tailwind gray-*, which reads cool/
        // blue against the green+gold brand palette) for a cohesive page.
        ink: "#2B2824",
        inkMuted: "#6B6459",
        inkFaint: "#9B9488",
        line: "#E6E1D8",
        surface: "#FFFFFF",
        surfaceMuted: "#F7F5F0",
        page: "#FAF8F4",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 40, 36, 0.04), 0 2px 8px rgba(43, 40, 36, 0.06)",
        cardHover: "0 2px 4px rgba(43, 40, 36, 0.06), 0 8px 20px rgba(43, 40, 36, 0.08)",
      },
    },
  },
  plugins: [],
};
