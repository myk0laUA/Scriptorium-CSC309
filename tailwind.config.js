/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: { gray: require('tailwindcss/colors').slate },
      borderRadius: { DEFAULT: '0.5rem', lg: '0.75rem' },
      boxShadow: {
        lg: '0 4px 16px -4px rgb(15 23 42 / 0.10)',
        xl: '0 8px 24px -8px rgb(15 23 42 / 0.16)',
      },
    },
  },
  plugins: [],
}

