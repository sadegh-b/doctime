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

    const response = await api.patch<MeApiResponse>("/auth/me", data);
    const profile = extractProfile(response.data);

    if (!profile) {
      throw new Error(
        `Invalid updated profile response shape: ${JSON.stringify(response.data)}`
      );
    }

    return profile;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && import.meta.env.DEV) {
      console.error("UPDATE PROFILE ERROR STATUS:", error.response?.status);
      console.error("UPDATE PROFILE ERROR DATA:", error.response?.data);
    }
    throw error;
  }
}
