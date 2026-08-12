import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, LogOut, LayoutDashboard, Calendar } from "lucide-react";

export default function Navbar() {
  const { user, role, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-24 gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.jfif"
              alt="DocTime Logo"
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-black text-blue-700">داک تایم</span>
              <span className="text-xs font-semibold text-slate-500">
                سامانه نوبت‌دهی پزشکی
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center justify-center gap-2 flex-1">
            <Link
              to="/doctors"
              className="px-3 py-2 rounded-xl text-sm font-extrabold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition"
            >
              نوبت‌دهی مطب
            </Link>
            <Link
              to="/health-magazine"
              className="px-3 py-2 rounded-xl text-sm font-extrabold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition"
            >
              مجله سلامت
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-blue-700 border border-blue-200 hover:bg-blue-50 transition"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition"
                >
                  ثبت نام
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/wallet"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                >
                  <Wallet size={18} />
                  <span>کیف پول</span>
                </Link>

                {role === "patient" ? (
                  <Link
                    to="/my-appointments"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <Calendar size={18} />
                    نوبت‌های من
                  </Link>
                ) : (
                  <Link
                    to="/doctor-dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <LayoutDashboard size={18} />
                    پنل پزشک
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 transition"
                  title="خروج"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
