// مسیر: vite.config.ts (یا vite.config.js)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // اجبار سرور به استفاده از این IP به جای localhost
    port: 5173,        // تعیین پورت ثابت
    strictPort: true   // اگر پورت اشغال بود، به پورت دیگری نرود تا بتوانی پورت قبلی را ببندی
  }
})
