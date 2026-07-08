import api from "./api";
import type { Doctor } from "./doctors";

export interface SearchParams {
  name?: string;
  specialty?: string;
  city?: string;
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: "asc" | "desc";
}

export interface SearchDoctorsResponse {
  data: Doctor[];
  totalCount: number;
}

export async function searchDoctors(
  params: SearchParams
): Promise<SearchDoctorsResponse> {
  const response = await api.get("/doctors/", { params });

  const totalCountHeader = response.headers["x-total-count"];
  const totalCount = totalCountHeader
    ? Number(totalCountHeader)
    : response.data.length;

  return {
    data: response.data,
    totalCount,
  };
}