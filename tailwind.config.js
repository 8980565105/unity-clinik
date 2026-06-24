/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "sans-serif"], 
    },
    fontSize: {
      base: "16px", 
    },
    extend: {
      screens: {
        "custom-lg": "980px",
      },

      colors: {
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",

      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
