// Path: src/hooks/useSpecialties.ts

import { useQuery } from "@tanstack/react-query";
import { getSpecialties } from "../services/api";
import type { Specialty } from "../services/api";

/**
 * هوک اختصاصی برای دریافت لیست تخصص‌ها با مدیریت کشینگ توسط TanStack Query
 * این هوک مانع از ارسال درخواست‌های تکراری به بک‌اند در رندرهای مجدد می‌شود.
 */
export function useSpecialties() {
  return useQuery<Specialty[], Error>({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
    staleTime: 10 * 60 * 1000, // داده‌ها تا ۱۰ دقیقه معتبر (Fresh) فرض می‌شوند
    gcTime: 15 * 60 * 1000,    // نگهداری داده‌ها در کش تا ۱۵ دقیقه
    retry: 2,                  // در صورت شکست، حداکثر ۲ بار تلاش مجدد انجام شود
  });
}
