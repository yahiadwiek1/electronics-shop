/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // هنا يبحث في جميع الملفات داخل src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
