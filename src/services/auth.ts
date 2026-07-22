import axios from "axios";
import api from "./api";

export type UserRole = "patient" | "doctor";
export type RegisterRole = "patient" | "doctor";
export type WorkShift = "morning" | "afternoon" | "both";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
  role: UserRole;
  email?: string | null;
  national_id?: string | null;
  specialty?: string | null;
  sub_specialty?: string | null;
  province?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years?: number | null;
  consultation_fee?: number | null;
  medical_council_number?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  message?: string;
  user: AuthUser;
  token: AuthToken;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  role: RegisterRole;

  national_id?: string | null;
  email?: string | null;

  medical_council_number?: string | null;
  specialty?: string | null;
  sub_specialty?: string | null;

  province?: string | null;
  city?: string | null;
  address?: string | null;

  bio?: string | null;
  experience_years?: number | null;
  consultation_fee?: number | null;

  work_shift?: WorkShift | null;
  work_days?: string[] | null;

  schedule_start_date?: string | null;

  morning_start?: string | null;
  morning_end?: string | null;

  afternoon_start?: string | null;
  afternoon_end?: string | null;
}

export interface RegisterResponse {
  message?: string;
  user?: AuthUser;
  token?: AuthToken;
}

const ACCESS_TOKEN_KEY = "access_token";
const ROLE_KEY = "role";
const USER_KEY = "user";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

// Backward-compatible alias for older imports such as AuthContext.tsx
export const getToken = getAccessToken;

export function getRole(): UserRole | null {
  const role = localStorage.getItem(ROLE_KEY);

  if (role === "patient" || role === "doctor") {
    return role;
  }

  return null;
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function saveAuth(data: AuthResponse | RegisterResponse): void {
  const token = data.token?.access_token;
  const user = data.user;

  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  if (user?.role) {
    localStorage.setItem(ROLE_KEY, user.role);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new Event("auth-change"));
}

export function logout(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event("auth-change"));
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

function stringifyObjectError(obj: unknown): string {
  if (!obj || typeof obj !== "object") {
    return "";
  }

  const record = obj as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    const parts: string[] = [record.message];

    if (
      Array.isArray(record.missing_fields) &&
      record.missing_fields.length > 0
    ) {
      parts.push(`فیلدهای ناقص: ${record.missing_fields.join(", ")}`);
    }

    if (
      Array.isArray(record.invalid_fields) &&
      record.invalid_fields.length > 0
    ) {
      parts.push(`فیلدهای نامعتبر: ${record.invalid_fields.join(", ")}`);
    }

    return parts.join(" | ");
  }

  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "خطای ساختاری از سمت سرور دریافت شد.";
  }
}

function extractValidationArray(detail: unknown[]): string {
  return detail
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        const row = item as {
          loc?: unknown;
          msg?: unknown;
        };

        const loc = Array.isArray(row.loc)
          ? row.loc.join(" -> ")
          : "";

        const msg =
          typeof row.msg === "string"
            ? row.msg
            : "Validation error";

        return loc ? `${loc}: ${msg}` : msg;
      }

      return "Validation error";
    })
    .join(" | ");
}

export function getError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          detail?: unknown;
          message?: string;
        }
      | undefined;

    if (responseData?.detail !== undefined) {
      const detail = responseData.detail;

      if (typeof detail === "string") {
        return detail;
      }

      if (Array.isArray(detail)) {
        return extractValidationArray(detail);
      }

      if (detail && typeof detail === "object") {
        return stringifyObjectError(detail);
      }
    }

    if (
      typeof responseData?.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }

    return "خطا در ارتباط با سرور";
  }

  if (error instanceof Error) {
    return error.message || "خطا در ارتباط با سرور";
  }

  return "خطا در ارتباط با سرور";
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      phone: payload.phone.trim(),
      password: payload.password,
    });

    saveAuth(response.data);
    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const response = await api.post<RegisterResponse>("/auth/register", payload);

    if (response.data?.token || response.data?.user) {
      saveAuth(response.data);
    }

    return response.data;
  } catch (error) {
    throw new Error(getError(error));
  }
}

export async function getMe(): Promise<AuthUser> {
  try {
    const response = await api.get<AuthUser | { user: AuthUser }>("/auth/me");
    const user = "user" in response.data ? response.data.user : response.data;

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    if (user?.role) {
      localStorage.setItem(ROLE_KEY, user.role);
    }

    return user;
  } catch (error) {
    throw new Error(getError(error));
  }
}
