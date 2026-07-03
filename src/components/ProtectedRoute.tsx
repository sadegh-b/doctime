import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // بررسی وضعیت توکن کاربر از حافظه محلی مرورگر
  const token = localStorage.getItem("token");

  // صادق: برای تست اولیه برنامه، اگر توکن هم نبود موقتاً اجازه ورود می‌دهیم تا صفحه سفید نشود.
  // بعد از اتمام بخش لاگین، این شرط را فعال می‌کنیم.
  return <>{children}</>;
}
