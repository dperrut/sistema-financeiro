/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- VOCÊ VAI ADICIONAR APENAS ESSA LINHA
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}