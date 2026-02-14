/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // Expo Router
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: "#F97316",

        "background-light": "#ffffff",
        "card-light": "#ffffff",
        "border-light": "#e5e7eb",
        "text-primary-light": "#000000",
        "text-secondary-light": "#6b7280",

        "background-dark": "#0f0f0f",
        "card-dark": "#1a1a1a",
        "border-dark": "#22262B",
        "text-primary-dark": "#f5f5f5",
        "text-secondary-dark": "#a1a1aa",
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
