import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// مسیر فایل: vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
});
