/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F5F0E6",
        paper: "#EFE8D8",
        navy: "#263A4E",
        navyDark: "#1B2B3B",
        mustard: "#D9A441",
        rust: "#B5533C",
        sage: "#7A8B69",
        ink: "#2B2620",
        inkSoft: "#6b6255",
        line: "#DCD3BE",
      },
      fontFamily: {
        display: ["Chonburi", "serif"],
        body: ["Mitr", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
