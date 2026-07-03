/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // اینجا رنگ‌های اختصاصی پروژه DocTime را تعریف می‌کنیم
        brand: {
          blue: "#3b82f6",
          dark: "#1a1a1a",
          surface: "#f8fafc"
        }
      },
      fontFamily: {
        // تنظیم فونت پیش‌فرض روی وزیر متن
        vazir: ["Vazirmatn", "sans-serif"],
      },
    },
  },
  plugins: [],
}
@tailwind base;
@tailwind components;
@tailwind utilities;
