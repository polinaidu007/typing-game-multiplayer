/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'press-start': ['"Press Start 2P"', 'cursive'],
        'space-mono': ['"Space Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}


