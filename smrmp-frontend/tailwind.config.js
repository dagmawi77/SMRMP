/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'smrmp-navy': '#0A1628',
        'smrmp-navy-light': '#152238',
        'smrmp-brown': '#4A2C1B',
        'smrmp-dark-brown': '#2B1B12',
        'smrmp-earth': '#7C4A2D',
        'smrmp-green': '#374B07',
        'smrmp-deep-green': '#243205',
        'smrmp-gold': '#D4A017',
        'smrmp-parchment': '#F5EFE6',
        'smrmp-warm-card': '#FAF6F0',
        'smrmp-border': '#E2D6C5',
        'smrmp-subtle': '#6E5445',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
