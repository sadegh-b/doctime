import { Link } from "react-router-dom";
import {
  CalendarDays,
  UserRound,
  Search,
} from "lucide-react";

export default function PatientDashboard() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 p-5">
      <div className="mx-auto max-w-6xl">

        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-8 text-white">
          <h1 className="text-3xl font-black">
            داشبورد بیمار
          </h1>

          <p className="mt-3 text-slate-300">
            مدیریت نوبت‌های پزشکی و جستجوی پزشکان
          </p>
        </div>


        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <Link
            to="/doctors"
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <Search className="text-cyan-600"/>
            <h2 className="mt-4 font-black">
              جستجوی پزشک
            </h2>
          </Link>


          <Link
            to="/patient-appointments"
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <CalendarDays className="text-emerald-600"/>
            <h2 className="mt-4 font-black">
              نوبت‌های من
            </h2>
          </Link>


          <Link
            to="/profile"
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <UserRound className="text-purple-600"/>
            <h2 className="mt-4 font-black">
              پروفایل
            </h2>
          </Link>

        </div>

      </div>
    </div>
  );
}