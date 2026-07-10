// src/data/cityTranslations.ts

// نگاشت حدسی فارسی -> انگلیسی برای مچ کردن با ستون city دیتابیس.
// فقط "Tehran" (پزشک id=1) از API واقعی تأیید شده؛ بقیه حدس هستن.
// شهرهایی که اینجا نباشن، اگه بک‌اند املای متفاوتی داشته باشه match نمی‌شن —
// هر بار که یک ناهماهنگی پیدا کردید، همینجا اضافه‌اش کنید.

export const CITY_TRANSLATIONS: Record<string, string> = {
  "تهران": "Tehran",
  "کرج": "Karaj",
  "اصفهان": "Isfahan",
  "شیراز": "Shiraz",
  "مشهد": "Mashhad",
  "بجنورد": "Bojnourd",
  "بیرجند": "Birjand",
  "تبریز": "Tabriz",
  "ارومیه": "Urmia",
  "اردبیل": "Ardabil",
  "کرمان": "Kerman",
  "کرمانشاه": "Kermanshah",
  "سنندج": "Sanandaj",
  "همدان": "Hamadan",
  "خرم‌آباد": "Khorramabad",
  "اراک": "Arak",
  "قم": "Qom",
  "قزوین": "Qazvin",
  "زنجان": "Zanjan",
  "رشت": "Rasht",
  "ساری": "Sari",
  "گرگان": "Gorgan",
  "بوشهر": "Bushehr",
  "بندرعباس": "Bandar Abbas",
  "اهواز": "Ahvaz",
  "شهرکرد": "Shahrekord",
  "یاسوج": "Yasuj",
  "ایلام": "Ilam",
  "زاهدان": "Zahedan",
  "سمنان": "Semnan",
  "یزد": "Yazd",
  "چابهار": "Chabahar",
};

export function cityToBackendValue(city: string): string {
  return CITY_TRANSLATIONS[city] ?? city;
}