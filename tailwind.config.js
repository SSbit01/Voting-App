/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        bar: {
          from: {
            width: "0%"
          }
        }
      },
      animation: {
        bar: "bar .4s ease-out"
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms")
  ]
}