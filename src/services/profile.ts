import api from "./api";

export type UserRole = "patient" | "doctor";

export type CurrentUserProfile = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  specialty?: string | null;
  work_shift?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years?: number;
  consultation_fee?: number;
};

export type UpdateProfilePayload = {
  name?: string;
  specialty?: string | null;
  work_shift?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years?: number;
  consultation_fee?: number;
};

type ApiResponse = {
  success?: boolean;
  data?: unknown;
  user?: unknown;
};

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidRole(
  value: unknown
): value is UserRole {
  return value === "patient" || value === "doctor";
}

function isCurrentUserProfile(
  value: unknown
): value is CurrentUserProfile {
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

function extractProfile(
  responseData: unknown
): CurrentUserProfile {
  if (isCurrentUserProfile(responseData)) {
    return responseData;
  }

  if (isObject(responseData)) {
    if (isCurrentUserProfile(responseData.data)) {
      return responseData.data;
    }

    if (isCurrentUserProfile(responseData.user)) {
      return responseData.user;
    }
  }

  throw new Error(
    `Invalid profile response: ${JSON.stringify(responseData)}`
  );
}

export async function getMyProfile(): Promise<CurrentUserProfile> {
  const response = await api.get<ApiResponse | CurrentUserProfile>(
    "/auth/me"
  );

  return extractProfile(response.data);
}

export async function updateMyProfile(
  payload: UpdateProfilePayload
): Promise<CurrentUserProfile> {
  const currentProfile = await getMyProfile();

  if (currentProfile.role === "doctor") {
    const response = await api.patch<
      ApiResponse | CurrentUserProfile
    >("/doctors/me", payload);

    return extractProfile(response.data);
  }

  const response = await api.patch<
    ApiResponse | CurrentUserProfile
  >("/users/me", payload);

  return extractProfile(response.data);
}
