/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- AGREGÁ ESTA LÍNEA PARA ARREGLAR EL MODO CLARO
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}