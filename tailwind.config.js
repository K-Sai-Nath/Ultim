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
        // Main orange used for buttons, selected tabs, loaders, icons
        primary: "#FF7A00",

        // Optional lighter orange for gradients / highlights
        "primary-light": "#FF9D2E",

        // Light mode
        "background-light": "#FFFFFF",
        "card-light": "#FFFFFF",
        "border-light": "#F0DED0",
        "text-primary-light": "#1D1A18",
        "text-secondary-light": "#786D66",

        // Dark mode — matches the black
        "background-dark": "#0B0B0C",
        "card-dark": "#171719",
        "border-dark": "#29292D",
        "text-primary-dark": "#F8F8F8",
        "text-secondary-dark": "#A1A1AA",

        // Extra useful colors for this CourtHub-style UI
        "orange-dark": "#D95700",
        "orange-soft": "#FFE1C2",
        success: "#49B950",
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
