import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken, getRole, type UserRole } from "../services/auth";

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
  redirectTo?: string;
  children?: ReactNode;
};

export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const token = getAccessToken();
  const role = getRole();

  if (!token || !role) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const fallbackByRole: Record<UserRole, string> = {
      patient: "/patient-dashboard",
      doctor: "/doctor-dashboard",
    };

    return <Navigate to={fallbackByRole[role]} replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
