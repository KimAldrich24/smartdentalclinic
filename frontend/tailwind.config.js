/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF", // blue-800
        secondary: "#F43F5E", // rose-500
        accent: "#2563EB", // blue-600
        background: "#F9FAFB",
        textDark: "#1F2937",
        textLight: "#6B7280",
      },
      gridTemplateColumns: {
        auto: "repeat(auto-fill, minmax(200px, 1fr))",
      },
      boxShadow: {
        soft: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      transitionProperty: {
        height: "height",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideDown: "slideDown 0.3s ease-in-out",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // ✅ for styled form inputs
    require("@tailwindcss/typography"), // ✅ for better text layouts
  ],
};
