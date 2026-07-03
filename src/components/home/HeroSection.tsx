import { useState } from "react";
import { Search, MapPin, Stethoscope } from "lucide-react";
import { PROVINCES_CITIES, type Province } from "../../data/provinces";

export default function HeroSection() {
  // مقدار پیش‌فرض استان مطمئن برای جلوگیری از کرش
  const [selectedProvince, setSelectedProvince] = useState<string>("سیستان و بلوچستان");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  // پیدا کردن استان فعال با رعایت نکات ایمنی داده‌ها
  const activeProvince = PROVINCES_CITIES?.find(
    (p: Province) => p.name === selectedProvince
  );
  const cities = activeProvince ? activeProvince.cities : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search parameters sent:", {
      province: selectedProvince,
      city: selectedCity,
      query,
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden" dir="rtl">
      {/* دایره‌های دکوراتیو پس‌زمینه */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100/50 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100/40 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
          سریع‌ترین راه برای <span className="text-blue-600">نوبت‌دهی آنلاین</span>
        </h1>

        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 font-medium">
          جستجوی پزشکان معتبر، دریافت نوبت و خدمات درمانی تخصصی در کوتاه‌ترین زمان
        </p>

        {/* باکس جستجو */}
        <form
          onSubmit={handleSearch}
          className="bg-white shadow-xl shadow-blue-100/50 p-5 rounded-3xl border border-slate-100 max-w-4xl mx-auto flex flex-col lg:flex-row gap-4"
        >
          {/* انتخاب استان */}
          <div className="flex flex-col w-full lg:w-1/4">
            <label className="text-xs font-bold text-slate-500 mb-1.5 mr-1 text-right">
              استان
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <MapPin size={18} className="text-blue-500 shrink-0" />
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedCity("");
                }}
                className="w-full bg-transparent py-2.5 px-2 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {PROVINCES_CITIES?.map((province: Province) => (
                  <option key={province.name} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* انتخاب شهر */}
          <div className="flex flex-col w-full lg:w-1/4">
            <label className="text-xs font-bold text-slate-500 mb-1.5 mr-1 text-right">
              شهر
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <MapPin size={18} className="text-blue-500 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent py-2.5 px-2 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">انتخاب شهر...</option>
                {cities.map((city: string) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* فیلد متنی جستجو */}
          <div className="flex flex-col w-full lg:w-1/2">
            <label className="text-xs font-bold text-slate-500 mb-1.5 mr-1 text-right">
              پزشک، تخصص یا بیماری
            </label>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <Stethoscope size={18} className="text-blue-500 shrink-0" />
              <input
                type="text"
                placeholder="مثلاً: ارتوپدی، متخصص قلب..."
                className="w-full bg-transparent py-2.5 px-3 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none text-right"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* دکمه ارسال فرم */}
          <div className="flex items-end w-full lg:w-auto">
            <button
              type="submit"
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl text-sm shadow-lg shadow-blue-200 hover:shadow-none transition-all flex items-center gap-2 justify-center cursor-pointer"
            >
              <Search size={18} />
              <span>جستجو</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
