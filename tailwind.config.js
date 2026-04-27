/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
      },
    },
  },
  plugins: [],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
};
