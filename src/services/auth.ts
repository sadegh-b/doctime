import api from "./api";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(
  phone: string,
  password: string
) {
  const formData = new URLSearchParams();

  // FastAPI OAuth expects username
  formData.append("username", phone);

  formData.append("password", password);

  const response = await api.post<LoginResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    }
  );

  const token = response.data.access_token;

  if (!token) {
    throw new Error("No access token returned");
  }

  localStorage.setItem("access_token", token);

  return response.data;
}

export async function register(data: {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: "patient" | "doctor";
}) {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
}

export function logout() {
  localStorage.removeItem("access_token");
}
