import api from "./api";

export async function getProfile() {
  const res = await api.get("/users/me");
  return res.data;
}

export async function updateProfile(data: { full_name?: string; email?: string }) {
  const res = await api.put("/users/update", data);
  return res.data;
}
