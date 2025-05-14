/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      fontWeight: {
        normal: 700,
        medium: 700,
        semibold: 800,
        bold: 900,
      },
    },
  },
  plugins: [],
}
