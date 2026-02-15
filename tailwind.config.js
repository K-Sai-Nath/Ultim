/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: "#FF9500",

        "background-light": "#F8FAFC",
        "card-light": "#FFFFFF",
        "border-light": "#E5E7EB",
        "text-primary-light": "#111827",
        "text-secondary-light": "#6B7280",

        "background-dark": "#0A0A0A", // deeper black
        "card-dark": "#1a1a1a", // slightly lifted card
        "border-dark": "#1F1F1F", // very subtle border
        "text-primary-dark": "#F5F5F5",
        "text-secondary-dark": "#9CA3AF",
      },

      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
      },

      borderRadius: {
        DEFAULT: "12px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
    },
  },

  plugins: [],
};
