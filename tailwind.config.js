/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      xs: "415px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        ui: ["Montserrat", "system-ui", "Arial", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
