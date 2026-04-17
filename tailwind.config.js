/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "sans-serif"], // default font = Roboto
    },
    fontSize: {
      base: "16px", // default base font-size = 16px
    },
    extend: {
      screens: {
        "custom-lg": "980px",
      },
    },
  },
  plugins: [],
};
