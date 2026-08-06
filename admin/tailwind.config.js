/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A3C34",
        primaryMid: "#2E7D52",
        primaryLight: "#E8F5E9",
        accent: "#F5A623",
        accentDark: "#D4891C",
        errorRed: "#C62828",
      },
    },
  },
  plugins: [],
};
