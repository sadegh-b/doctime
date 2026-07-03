import { ReactNode } from "react";
import {
  Heart,
  Baby,
  Eye,
  Activity,
  Brain,
  Smile,
  ArrowLeft
} from "lucide-react";

interface Specialty {
  id: string;
  name: string;
  count: string;
  icon: ReactNode;
  color: string;
  bgColor: string;
}

const SPECIALTIES: Specialty[] = [
  { id: "1", name: "قلب و عروق", count: "+۱۲۰ پزشک", icon: <Heart className="w-8 h-8" />, color: "text-rose-500", bgColor: "bg-rose-50" },
  { id: "2", name: "کودکان و اطفال", count: "+۹۵ پزشک", icon: <Baby className="w-8 h-8" />, color: "text-amber-500", bgColor: "bg-amber-50" },
  { id: "3", name: "چشم‌پزشکی", count: "+۸۰ پزشک", icon: <Eye className="w-8 h-8" />, color: "text-teal-500", bgColor: "bg-teal-50" },
  { id: "4", name: "داخلی و عمومی", count: "+۱۵۰ پزشک", icon: <Activity className="w-8 h-8" />, color: "text-blue-500", bgColor: "bg-blue-50" },
  { id: "5", name: "مغز و اعصاب", count: "+۶۰ پزشک", icon: <Brain className="w-8 h-8" />, color: "text-purple-500", bgColor: "bg-purple-50" },
  { id: "6", name: "روان‌پزشکی", count: "+۷۰ پزشک", icon: <Smile className="w-8 h-8" />, color: "text-indigo-500", bgColor: "bg-indigo-50" },
];

export default function SpecialtiesGrid() {
  return (
    <div dir="rtl" className="w-full">
      {/* سربرگ بخش دسته‌بندی‌ها */}
      <div className="flex justify-between items-end mb-8">
        <div className="text-right">
          <span className="text-blue-600 text-xs font-black tracking-wider uppercase mb-1 block">دسته‌بندی‌ها</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">تخصص‌های پرمخاطب</h2>
        </div>
        <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-sm transition-all group cursor-pointer">
          <span>مشاهده همه تخصص‌ها</span>
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      {/* گرید دسته‌بندی‌ها */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {SPECIALTIES.map((spec) => (
          <div
            key={spec.id}
            className="group bg-white border border-slate-100 p-6 rounded-3xl text-center hover:shadow-xl hover:shadow-slate-100 hover:border-blue-100 transition-all duration-300 cursor-pointer flex flex-col items-center"
          >
            <div className={`p-4 rounded-2xl ${spec.bgColor} ${spec.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {spec.icon}
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-600 transition-colors">
              {spec.name}
            </h3>
            <span className="text-xs text-slate-400 font-bold">{spec.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
