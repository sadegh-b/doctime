// Path: doctime-frontend/src/data/specialties.ts

// نکته مهم: value باید دقیقاً همون رشته‌ای باشه که در ستون specialty دیتابیس ذخیره شده.
// این مقادیر بر اساس نام پزشک متخصص (-ist) یا فیلد درمانی در بک‌اندهای استاندارد تنظیم شده‌اند.

export interface SpecialtyOption {
  label: string; // نمایش فارسی
  value: string; // مقدار انگلیسی مورد انتظار بک‌اند
}

export const specialties: SpecialtyOption[] = [
  // ۸ مورد اولیه تایید شده با بک‌اند
  { label: "قلب و عروق", value: "Cardiologist" },
  { label: "کودکان و اطفال", value: "Pediatrician" },
  { label: "چشم‌پزشکی", value: "Ophthalmologist" },
  { label: "داخلی و عمومی", value: "Internal Medicine" },
  { label: "مغز و اعصاب", value: "Neurologist" },
  { label: "روان‌پزشکی", value: "Psychiatrist" },
  { label: "ارتوپدی", value: "Orthopedist" },
  { label: "پزشک عمومی", value: "General Medicine" },

  // ۴۲ مورد تکمیلی برای رسیدن به ۵۰ تخصص کامل
  { label: "زنان، زایمان و نازایی", value: "Gynecologist" },
  { label: "پوست، مو و زیبایی", value: "Dermatologist" },
  { label: "جراحی مغز و اعصاب", value: "Neurosurgeon" },
  { label: "گوش، حلق و بینی", value: "Otolaryngologist" },
  { label: "کلیه و مجاری ادراری (اورولوژی)", value: "Urologist" },
  { label: "غدد و متابولیسم (بزرگسالان)", value: "Endocrinologist" },
  { label: "گوارش و کبد (بزرگسالان)", value: "Gastroenterologist" },
  { label: "ریه و دستگاه تنفسی (بزرگسالان)", value: "Pulmonologist" },
  { label: "روماتولوژی (بزرگسالان)", value: "Rheumatologist" },
  { label: "خون و سرطان (انکولوژی)", value: "Oncologist" },
  { label: "بیماری‌های عفونی و گرمسیری", value: "Infectious Diseases" },
  { label: "جراحی عمومی", value: "General Surgeon" },
  { label: "جراحی پلاستیک و زیبایی", value: "Plastic Surgeon" },
  { label: "بیهوشی و مراقبت‌های ویژه", value: "Anesthesiologist" },
  { label: "فوق تخصص درد (فلوشیپ درد)", value: "Pain Medicine Specialist" },
  { label: "غدد و متابولیسم کودکان", value: "Pediatric Endocrinologist" },
  { label: "کلیه کودکان (نفرولوژی اطفال)", value: "Pediatric Nephrologist" },
  { label: "قلب کودکان", value: "Pediatric Cardiologist" },
  { label: "مغز و اعصاب کودکان", value: "Pediatric Neurologist" },
  { label: "گوارش و کبد کودکان", value: "Pediatric Gastroenterologist" },
  { label: "تغذیه و رژیم‌درمانی", value: "Nutritionist" },
  { label: "فیزیوتراپی و توانبخشی", value: "Physiotherapist" },
  { label: "شنوایی‌سنجی", value: "Audiologist" },
  { label: "بینایی‌سنجی", value: "Optometrist" },
  { label: "روانشناسی و مشاوره", value: "Psychologist" },
  { label: "پزشکی هسته‌ای", value: "Nuclear Medicine Specialist" },
  { label: "رادیولوژی و تصویربرداری", value: "Radiologist" },
  { label: "آسیب‌شناسی (پاتولوژی)", value: "Pathologist" },
  { label: "آلرژی و ایمونولوژی بالینی", value: "Allergist Immunologist" },
  { label: "پزشکی ورزشی", value: "Sports Medicine Specialist" },
  { label: "پزشکی قانونی", value: "Forensic Pathologist" },
  { label: "ژنتیک پزشکی", value: "Medical Geneticist" },
  { label: "طب سنتی", value: "Traditional Medicine Specialist" },
  { label: "دندانپزشکی", value: "Dentist" },
  { label: "ارتودنسی دندان", value: "Orthodontist" },
  { label: "جراحی دهان، فک و صورت", value: "Maxillofacial Surgeon" },
  { label: "پزشکی کار و طب کار", value: "Occupational Medicine Specialist" },
  { label: "جراحی عروق", value: "Vascular Surgeon" },
  { label: "طب سالمندان", value: "Geriatrician" },
  { label: "پزشکی خانواده", value: "Family Physician" },
  { label: "طب اورژانس", value: "Emergency Physician" },
  { label: "انکولوژی رادیوتراپی (پرتودرمانی)", value: "Radiation Oncologist" }
];

export function specialtyValueToLabel(value: string): string {
  return specialties.find((s) => s.value === value)?.label ?? value;
}
