import api from "./api";

export type UserRole = "doctor" | "patient" | "admin";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  email?: string;
  role: "patient" | "doctor";
}

function decodeToken(token: string) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export async function login(phone: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", phone.trim());
  formData.append("password", password.trim());

  const response = await api.post<LoginResponse>("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  const token = response.data.access_token;

  if (!token) {
    throw new Error("Token دریافت نشد");
  }

  localStorage.setItem("access_token", token);

  const decoded = decodeToken(token);
  if (decoded?.role && isValidRole(decoded.role)) {
    saveRole(decoded.role);
  }

  window.dispatchEvent(new Event("auth-change"));

  return response.data;
}

export async function register(data: RegisterPayload) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  window.dispatchEvent(new Event("auth-change"));
}

export function saveRole(role: UserRole) {
  localStorage.setItem("role", role);
}

export function getRole(): UserRole | null {
  const role = localStorage.getItem("role");
  return isValidRole(role) ? role : null;
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function isLoggedIn() {
  return Boolean(getToken());
}

function isValidRole(role: unknown): role is UserRole {
  return role === "doctor" || role === "patient" || role === "admin";
}