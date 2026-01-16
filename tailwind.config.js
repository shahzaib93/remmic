/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c9a227',
          600: '#a88a1f',
          700: '#876e19',
          800: '#5c4b11',
          900: '#3d320b',
        },
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(201, 162, 39, 0.3)',
        'glow-lg': '0 0 60px -15px rgba(201, 162, 39, 0.4)',
      },
    },
  },
  plugins: [],
}
