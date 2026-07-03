// src/services/searchDoctors.ts

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

export interface SearchResponse {
  data: Doctor[];
  totalCount: number;
}

export async function searchDoctors(
  params: SearchParams
): Promise<SearchResponse> {
  const response = await api.get<Doctor[]>("/doctors", {
    params,
  });

  return {
    data: response.data,
    totalCount: Number(
      response.headers["x-total-count"] ?? response.data.length
    ),
  };
}