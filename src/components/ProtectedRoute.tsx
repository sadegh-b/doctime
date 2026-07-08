import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../services/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"doctor" | "patient">;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");
  const role = getRole() as "doctor" | "patient" | null;

  // اگر لاگین نیست
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // اگر مسیر نقش خاص می‌خواهد و نقش کاربر مجاز نیست
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}