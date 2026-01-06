/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixy: ['PIXY', 'sans-serif'],
        'press-start': ['"Press Start 2P"', 'cursive'],
      }
    },
  },
  plugins: [],
}