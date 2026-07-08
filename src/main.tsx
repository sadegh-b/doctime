// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import "./index.css";

// بهینه‌سازی: تنظیم staleTime پیش‌فرض برای جلوگیری از درخواست‌های مکرر و بیهوده به بک‌اند
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // جلوگیری از رفرش خودکار داده‌ها هنگام تغییر تب مرورگر
      retry: 1, // تعداد دفعات تلاش مجدد در صورت بروز خطا
      staleTime: 5 * 60 * 1000, // معتبر دانستن داده‌ها تا ۵ دقیقه برای کاهش لود پردازشی
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' was not found.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
