import axios from "axios";
import api from "./api";

export type CurrentUserProfile = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: "patient" | "doctor";
  specialty?: string | null;
  city?: string | null;
  address?: string | null;
};

export type UpdateProfilePayload = {
  name?: string;
  specialty?: string | null;
  city?: string | null;
  address?: string | null;
};

type MeApiResponse = unknown;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidRole(value: unknown): value is CurrentUserProfile["role"] {
  return value === "patient" || value === "doctor";
}

function isCurrentUserProfile(value: unknown): value is CurrentUserProfile {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.phone === "string" &&
    isValidRole(value.role)
  );
}

function extractProfile(data: unknown): CurrentUserProfile | null {
  if (isCurrentUserProfile(data)) {
    return data;
  }

  if (isObject(data) && isCurrentUserProfile(data.data)) {
    return data.data;
  }

  if (isObject(data) && isCurrentUserProfile(data.user)) {
    return data.user;
  }

  return null;
}

function isAxiosRetryable(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 404 || error.response?.status === 405)
  );
}

async function updateProfileWithRoute(
  method: "put" | "patch",
  path: string,
  data: UpdateProfilePayload
): Promise<CurrentUserProfile> {
  const response =
    method === "put"
      ? await api.put<MeApiResponse>(path, data)
      : await api.patch<MeApiResponse>(path, data);

  const profile = extractProfile(response.data);

  if (!profile) {
    throw new Error(
      `Invalid updated profile response shape: ${JSON.stringify(response.data)}`
    );
  }

  return profile;
}

export async function getMyProfile(): Promise<CurrentUserProfile> {
  try {
    const response = await api.get<MeApiResponse>("/auth/me");
    const profile = extractProfile(response.data);

    if (!profile) {
      throw new Error(
        `Invalid profile response shape: ${JSON.stringify(response.data)}`
      );
    }

    return profile;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("GET PROFILE ERROR:", error);
    }
    throw error;
  }
}

export async function updateMyProfile(
  data: UpdateProfilePayload
): Promise<CurrentUserProfile> {
  try {
    if (import.meta.env.DEV) {
      console.log("UPDATE PROFILE PAYLOAD:", data);
    }

    let currentRole: CurrentUserProfile["role"] | null = null;

    try {
      const currentProfile = await getMyProfile();
      currentRole = currentProfile.role;
    } catch {
      currentRole = null;
    }

    const routes: Array<{ method: "put" | "patch"; path: string }> =
      currentRole === "doctor"
        ? [
            { method: "patch", path: "/doctors/me" },
            { method: "put", path: "/doctors/me" },
            { method: "patch", path: "/auth/me" },
          ]
        : currentRole === "patient"
          ? [
              { method: "patch", path: "/users/me" },
              { method: "put", path: "/users/me" },
              { method: "patch", path: "/auth/me" },
            ]
          : [
              { method: "patch", path: "/doctors/me" },
              { method: "put", path: "/doctors/me" },
              { method: "patch", path: "/users/me" },
              { method: "put", path: "/users/me" },
              { method: "patch", path: "/auth/me" },
            ];

    let lastError: unknown = null;

    for (const route of routes) {
      try {
        return await updateProfileWithRoute(route.method, route.path, data);
      } catch (error) {
        lastError = error;

        if (!isAxiosRetryable(error)) {
          throw error;
        }

        if (import.meta.env.DEV) {
          console.warn(
            `UPDATE PROFILE RETRY: ${route.method.toUpperCase()} ${route.path}`
          );
        }
      }
    }

    throw lastError ?? new Error("Unable to update profile");
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && import.meta.env.DEV) {
      console.error("UPDATE PROFILE ERROR STATUS:", error.response?.status);
      console.error("UPDATE PROFILE ERROR DATA:", error.response?.data);
    }
    throw error;
  }
}
