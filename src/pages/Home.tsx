// Path: doctime-frontend/src/pages/Home.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Stethoscope,
  ChevronDown,
  Sparkles,
  HeartPulse,
  Brain,
  Baby,
  Activity,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";

import { PROVINCES_CITIES } from "../data/provinces";
import { specialties as fallbackSpecialties } from "../data/specialties";
import { getSpecialties } from "../services/api";

interface SpecialtyItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

const FEATURED_SPECIALTIES = [
  { id: 1, name: "قلب و عروق", slug: "cardiology", icon: <HeartPulse />, color: "bg-rose-100/70 text-rose-600 border border-rose-200" },
  { id: 2, name: "مغز و اعصاب", slug: "neurology", icon: <Brain />, color: "bg-indigo-100/70 text-indigo-600 border border-indigo-200" },
  { id: 3, name: "کودکان", slug: "pediatrics", icon: <Baby />, color: "bg-amber-100/70 text-amber-600 border border-amber-200" },
  { id: 4, name: "داخلی", slug: "internal", icon: <Activity />, color: "bg-emerald-100/70 text-emerald-600 border border-emerald-200" },
];

export default function Home() {
  const navigate = useNavigate();
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSpecialtyOpen, setIsSpecialtyOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtiesList, setSpecialtiesList] = useState<SpecialtyItem[]>([]);
  const [isSpecialtiesLoading, setIsSpecialtiesLoading] = useState(true);

  const locationRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSpecialties() {
      try {
        setIsSpecialtiesLoading(true);
        const data = await getSpecialties();
        setSpecialtiesList(data.map((s: any) => ({ value: s.slug || s.id.toString(), label: s.name })));
      } catch (error) {
        setSpecialtiesList(fallbackSpecialties);
      } finally {
        setIsSpecialtiesLoading(false);
      }
    }
    loadSpecialties();
  }, []);

  const availableCities = useMemo(() => {
    if (!selectedProvince) return [];
    return PROVINCES_CITIES.find((p) => p.name === selectedProvince)?.cities ?? [];
  }, [selectedProvince]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setIsLocationOpen(false);
      if (specialtyRef.current && !specialtyRef.current.contains(e.target as Node)) setIsSpecialtyOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (selectedProvince) p.set("province", selectedProvince);
    if (selectedCity) p.set("city", selectedCity);
    if (selectedSpecialty) p.set("specialty", selectedSpecialty);
    if (searchQuery.trim()) p.set("q", searchQuery.trim());
    navigate(`/search?${p.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">

      {/* 1. Optimized Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent pt-12 pb-24 px-4 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/80 border border-blue-200 px-4 py-1.5 text-xs sm:text-sm font-black text-blue-800 mb-6">
             <Sparkles size={14} className="animate-pulse" /> نوبت‌دهی آنلاین پزشکان
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 mb-6 leading-tight tracking-tight">
            سریع، مطمئن و بدون معطلی نوبت بگیرید
          </h1>

          <p className="text-slate-600 text-sm sm:text-base font-bold px-4 leading-relaxed max-w-2xl mx-auto">
            پزشک خود را جستجو کنید و در کمتر از یک دقیقه نوبت خود را آنلاین ثبت کنید.
          </p>
        </div>
      </section>

      {/* 2. Floating Search Box */}
      <section className="relative z-50 mx-auto -mt-12 max-w-6xl px-4">
        <form
          onSubmit={handleSearch}
          className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)] md:p-6"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1.2fr_1.8fr_auto]">
            {/* Location Selector */}
            <div ref={locationRef} className="relative">
              <button
                type="button"
                onClick={() => { setIsLocationOpen(!isLocationOpen); setIsSpecialtyOpen(false); }}
                className="flex min-h-[72px] w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 transition hover:bg-white hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <MapPin size={22} className="text-blue-600" />
                </div>
                <div className="flex flex-col text-right overflow-hidden">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">موقعیت شما</span>
                  <span className="truncate text-sm sm:text-base font-black text-slate-800 mt-0.5">
                    {selectedCity ? `${selectedProvince}، ${selectedCity}` : selectedProvince || "انتخاب شهر"}
                  </span>
                </div>
                <ChevronDown size={18} className="mr-auto text-slate-400" />
              </button>

              {isLocationOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-full md:w-[480px] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl grid grid-cols-2 h-[320px]">
                  <div className="overflow-y-auto border-l border-slate-100 p-3 space-y-1 text-right">
                    <span className="block p-2 text-xs font-black text-slate-400">استان‌ها</span>
                    {PROVINCES_CITIES.map((p) => (
                      <button key={p.name} type="button" onClick={() => { setSelectedProvince(p.name); setSelectedCity(null); }}
                        className={`w-full text-right rounded-lg px-4 py-2.5 text-sm font-bold transition ${selectedProvince === p.name ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-y-auto p-3 space-y-1 text-right">
                    <span className="block p-2 text-xs font-black text-slate-400">شهرها</span>
                    {selectedProvince ? availableCities.map((c) => (
                      <button key={c} type="button" onClick={() => { setSelectedCity(c); setIsLocationOpen(false); }}
                        className={`w-full text-right rounded-lg px-4 py-2.5 text-sm font-bold transition ${selectedCity === c ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}>
                        {c}
                      </button>
                    )) : <div className="p-8 text-center text-sm font-bold text-slate-400">ابتدا استان را انتخاب کنید</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Specialty Selector */}
            <div ref={specialtyRef} className="relative">
              <button
                type="button"
                onClick={() => { setIsSpecialtyOpen(!isSpecialtyOpen); setIsLocationOpen(false); }}
                className="flex min-h-[72px] w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 transition hover:bg-white hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Stethoscope size={22} className="text-blue-600" />
                </div>
                <div className="flex flex-col text-right overflow-hidden">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">تخصص پزشکی</span>
                  <span className="truncate text-sm sm:text-base font-black text-slate-800 mt-0.5">
                    {selectedSpecialty ? specialtiesList.find(s => s.value === selectedSpecialty)?.label : "همه تخصص‌ها"}
                  </span>
                </div>
                <ChevronDown size={18} className="mr-auto text-slate-400" />
              </button>

              {isSpecialtyOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-[100] max-h-[300px] w-full overflow-y-auto rounded-xl border border-slate-100 bg-white p-3 shadow-2xl">
                  {specialtiesList.map((s) => (
                    <button key={s.value} type="button" onClick={() => { setSelectedSpecialty(s.value); setIsSpecialtyOpen(false); }}
                      className={`w-full text-right rounded-lg px-4 py-2.5 text-sm font-bold transition mb-1 ${selectedSpecialty === s.value ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Keyword */}
            <div className="relative">
              <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="نام پزشک، بیماری..."
                className="min-h-[72px] w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pl-5 pr-14 text-sm sm:text-base font-bold text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 text-right placeholder-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="min-h-[72px] rounded-2xl bg-blue-600 px-10 text-sm sm:text-base font-black text-white shadow-md transition hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
            >
              جستجو
            </button>
          </div>
        </form>
      </section>

      {/* 3. Featured Specialties */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">تخصص‌های پرطرفدار</h2>
          <Link to="/specialties" className="flex items-center gap-2 text-sm font-black text-blue-600 hover:underline">
            مشاهده همه <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {FEATURED_SPECIALTIES.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/search?q=${item.name}`)}
              className="group cursor-pointer rounded-[24px] border border-slate-100 bg-white p-6 text-center transition hover:shadow-md hover:border-blue-100"
            >
              <div className={`mx-auto mb-4 flex h-14 w-16 items-center justify-center rounded-2xl ${item.color} transition group-hover:scale-105`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">{item.name}</h3>
            </div>
          ))}
        </div>

        {/* 4. Giant and Styled Pistachio Green Special Banner */}
        <div className="relative overflow-hidden rounded-[40px] bg-[#E8F5E9] border-2 border-[#C8E6C9] py-14 px-8 sm:px-14 mt-20 shadow-lg shadow-green-100">
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-[#C8E6C9]/40 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#C8E6C9]/85 text-[#2B5B2E] shadow-inner">
                <MessageSquare size={48} />
              </div>
              <div>
                <h4 className="text-2xl sm:text-4xl font-black text-[#1B4D22] leading-tight">
                  مشاوره تخصصی درمان یبوست و اعتیاد
                </h4>
                <p className="text-base sm:text-lg font-bold text-[#2E7D32] mt-3">
                  جهت ارتباط مستقیم با پزشک و شروع دوره درمان:
                </p>
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-3 justify-center md:justify-start text-base sm:text-lg font-black text-[#1B4D22]">
                  <span className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
                    واتس‌اپ: ۰۹۱۲۳۴۵۶۷۸۹
                  </span>
                  <span className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
                    تلگرام: ۰۹۱۲۳۴۵۶۷۸۹
                  </span>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/989123456789"
              target="_blank"
              rel="noreferrer"
              className="w-full lg:w-auto text-center rounded-2xl bg-[#2E7D32] px-12 py-6 text-base sm:text-lg font-black text-white transition hover:bg-[#1B5E20] hover:scale-[1.04] active:scale-[0.96] shadow-md shadow-green-900/30"
            >
              ارسال پیام مستقیم
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mx-auto max-w-6xl px-4 mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
          <p>© ۲۰۲۶ DocTime. تمامی حقوق این سامانه محفوظ است.</p>
          <p>طراح و توسعه‌دهنده: <span className="text-slate-600 font-black">محمدصادق بلوچ</span></p>
        </div>
      </section>

    </div>
  );
}
