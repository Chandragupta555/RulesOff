/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#121414",
        "surface-dim": "#121414",
        "surface-bright": "#38393a",
        "surface-container-lowest": "#0d0e0f",
        "surface-container-low": "#1a1c1c",
        "surface-container": "#1e2020",
        "surface-container-high": "#282a2b",
        "surface-container-highest": "#333535",
        "on-surface": "#e2e2e2",
        "on-surface-variant": "#e3bfb3",
        "inverse-surface": "#e2e2e2",
        "inverse-on-surface": "#2f3131",
        "outline": "#aa897f",
        "outline-variant": "#5b4138",
        "surface-tint": "#ffb59c",
        "primary": "#ffb59c",
        "on-primary": "#5c1900",
        "primary-container": "#ff5f1f",
        "on-primary-container": "#561700",
        "inverse-primary": "#ab3600",
        "secondary": "#c8c6c5",
        "on-secondary": "#313030",
        "secondary-container": "#4a4949",
        "on-secondary-container": "#bab8b7",
        "tertiary": "#c9c6c5",
        "on-tertiary": "#313030",
        "tertiary-container": "#959393",
        "on-tertiary-container": "#2d2c2c",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "background": "#121414",
        "on-background": "#e2e2e2",
        "surface-variant": "#333535"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "container-padding": "20px",
        "section-gap": "32px",
        "base": "8px",
        "element-gap": "16px"
      },
      fontFamily: {
        sans: ["Lexend", "sans-serif"],
        body: ["Lexend", "sans-serif"],
        headline: ["Lexend", "sans-serif"]
      }
    },
  },
  plugins: [],
}
