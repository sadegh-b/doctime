import { getDoctors } from "./doctors";
import type { Doctor } from "./doctors";
import { cityToBackendValue } from "../data/cityTranslations";

export interface SearchParams {
  name?: string;
  specialty?: string; // مقدار انگلیسی (نگاه کنید به data/specialties.ts)
  city?: string; // نام فارسی شهر انتخاب‌شده از سلکتور استان/شهر
  _page?: number;
  _limit?: number;
  _sort?: "rating" | "visit_fee";
  _order?: "asc" | "desc";
}

export interface SearchDoctorsResponse {
  data: Doctor[];
  totalCount: number;
}

function normalize(value: string | number | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

// بک‌اند هیچ endpoint فیلتر/صفحه‌بندی‌ای نداره (فقط GET /api/doctors که همه رو
// یک‌جا برمی‌گردونه)، پس فیلتر، مرتب‌سازی و صفحه‌بندی رو سمت کلاینت انجام می‌دیم.
export async function searchDoctors(
  params: SearchParams
): Promise<SearchDoctorsResponse> {
  const allDoctors = await getDoctors();

  const nameQuery = normalize(params.name);
  const specialtyQuery = normalize(params.specialty);
  const cityQueryRaw = params.city ?? "";
  const cityQueryBackend = normalize(cityToBackendValue(cityQueryRaw));
  const cityQueryOriginal = normalize(cityQueryRaw);

  const filtered = allDoctors.filter((doctor) => {
    const matchesName = nameQuery
      ? normalize(doctor.name).includes(nameQuery)
      : true;

    const matchesSpecialty = specialtyQuery
      ? normalize(doctor.specialty).includes(specialtyQuery)
      : true;

    const doctorCity = normalize(doctor.city);
    const matchesCity =
      cityQueryRaw.length > 0
        ? doctorCity.includes(cityQueryBackend) ||
          doctorCity.includes(cityQueryOriginal)
        : true;

    return matchesName && matchesSpecialty && matchesCity;
  });

  let sorted = filtered;
  if (params._sort) {
    const key = params._sort;
    const order = params._order === "asc" ? 1 : -1;
    sorted = [...filtered].sort((a, b) => {
      const aVal = Number((a as Doctor)[key] ?? 0);
      const bVal = Number((b as Doctor)[key] ?? 0);
      return (aVal - bVal) * order;
    });
  }

  const totalCount = sorted.length;
  const page = params._page && params._page > 0 ? params._page : 1;
  const limit = params._limit && params._limit > 0 ? params._limit : 6;
  const start = (page - 1) * limit;
  const pageItems = sorted.slice(start, start + limit);

  return {
    data: pageItems,
    totalCount,
  };
}