/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'neon-green': '#39ff14',
        'zeyera-dark': '#050505',
        'zeyera-gray': '#1a1a1a',
      },
      boxShadow: {
        'neon': '0 0 10px #39ff14, 0 0 20px #39ff14',
      }
    }
  },
  plugins: [],
}

