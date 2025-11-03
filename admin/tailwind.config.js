/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#F43F5E",
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-sm': 'repeat(auto-fill, minmax(150px, 1fr))', // ✅ Mobile grid
      },
      screens: {
        'xs': '375px',   // ✅ Small phones
        'sm': '640px',   // ✅ Large phones
        'md': '768px',   // ✅ Tablets
        'lg': '1024px',  // ✅ Laptops
        'xl': '1280px',  // ✅ Desktops
        '2xl': '1536px', // ✅ Large screens
      },
    },
  },
  plugins: [],
}