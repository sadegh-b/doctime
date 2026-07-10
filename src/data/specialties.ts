// src/data/specialties.ts

// نکته مهم: value باید دقیقاً همون رشته‌ای باشه که در ستون specialty دیتابیس ذخیره شده.
// فقط "قلب و عروق" -> "Cardiologist" و "پزشک عمومی" -> "General Medicine"
// از روی تست واقعی API تأیید شدن. بقیه حدس منطقی هستن — با داده‌ی واقعی
// دیتابیستون چک و در صورت نیاز اصلاح کنید (این تنها جایی است که باید عوض بشه).

export interface SpecialtyOption {
  label: string; // نمایش فارسی
  value: string; // مقدار انگلیسی مورد انتظار بک‌اند
}

export const specialties: SpecialtyOption[] = [
  { label: "قلب و عروق", value: "Cardiologist" },
  { label: "کودکان و اطفال", value: "Pediatrician" },
  { label: "چشم‌پزشکی", value: "Ophthalmologist" },
  { label: "داخلی و عمومی", value: "Internal Medicine" },
  { label: "مغز و اعصاب", value: "Neurologist" },
  { label: "روان‌پزشکی", value: "Psychiatrist" },
  { label: "ارتوپدی", value: "Orthopedist" },
  { label: "پزشک عمومی", value: "General Medicine" },
];

export function specialtyValueToLabel(value: string): string {
  return specialties.find((s) => s.value === value)?.label ?? value;
}