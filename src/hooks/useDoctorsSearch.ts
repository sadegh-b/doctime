import { useQuery } from "@tanstack/react-query";
import { searchDoctors } from "../services/searchDoctors";
import type { SearchParams } from "../services/searchDoctors";

export function useDoctorsSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => searchDoctors(params),
    placeholderData: (previousData) => previousData
  });
}
