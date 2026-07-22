// src/components/ui/Header.tsx

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Stethoscope, ChevronLeft } from "lucide-react";

import { getRole, logout } from "../../services/auth";

const navItems = [
  { label: "صفحه اصلی", to: "/" },
  { label: "پزشکان", to: "/doctors" },
  { label: "جستجوی پزشک", to: "/search" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  function updateAuth() {
    const currentRole = getRole();
    setRole(currentRole);
  }

  useEffect(() => {
    updateAuth();

    window.addEventListener("auth-change", updateAuth);

    return () => {
      window.removeEventListener("auth-change", updateAuth);
    };
  }, []);

  useEffect(() => {
    setMenu(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setRole(null);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-[120] px-3 pt-3 md:px-4 md:pt-4">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
          <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-7">
            {/* Brand */}
            <Link to="/" className="group flex min-w-0 items-center gap-3 md:gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 via-sky-600 to-cyan-500 text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition duration-300 group-hover:scale-[1.03] md:h-15 md:w-15">
                <div className="absolute inset-[1px] rounded-[19px] bg-white/10" />
                <Stethoscope
                  size={24}
                  strokeWidth={2.4}
                  className="relative z-10"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h1 className="truncate text-[1.2rem] font-black tracking-[-0.03em] text-slate-900 md:text-[1.4rem]">
                    DocTime
                  </h1>

                  <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-extrabold tracking-[0.08em] text-blue-700 sm:inline-flex md:text-xs">
                    HEALTHCARE
                  </span>
                </div>

                <p className="mt-1 truncate text-[12px] font-bold leading-5 text-slate-500 md:text-[13px]">
                  رزرو آنلاین نوبت پزشکان، کلینیک‌ها و مراکز درمانی
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "relative rounded-full px-5 py-2.5 text-[15px] font-extrabold tracking-[-0.01em] transition-all duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-2.5 lg:flex">
              {!role && (
                <>
                  <Link
                    to="/login"
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[15px] font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  >
                    ورود بیمار
                  </Link>

                  <Link
                    to="/doctor-login"
                    className="rounded-full border border-blue-100 bg-blue-50 px-5 py-2.5 text-[15px] font-extrabold text-blue-700 transition hover:bg-blue-100"
                  >
                    ورود پزشک
                  </Link>

                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-[15px] font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition duration-200 hover:translate-y-[-1px] hover:shadow-[0_14px_28px_rgba(37,99,235,0.28)]"
                  >
                    ثبت‌نام
                    <ChevronLeft
                      size={17}
                      className="transition group-hover:translate-x-[-2px]"
                    />
                  </Link>
                </>
              )}

              {role === "patient" && (
                <>
                  <Link
                    to="/patient-dashboard"
                    className="rounded-full border border-blue-100 bg-blue-50 px-5 py-2.5 text-[15px] font-extrabold text-blue-700 transition hover:bg-blue-100"
                  >
                    پنل بیمار
                  </Link>

                  <Link
                    to="/my-appointments"
                    className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-[15px] font-extrabold text-slate-800 transition hover:bg-slate-100"
                  >
                    نوبت‌های من
                  </Link>
                </>
              )}

              {role === "doctor" && (
                <Link
                  to="/doctor-dashboard"
                  className="rounded-full border border-blue-100 bg-blue-50 px-5 py-2.5 text-[15px] font-extrabold text-blue-700 transition hover:bg-blue-100"
                >
                  پنل پزشک
                </Link>
              )}

              {role && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-red-200 bg-white px-5 py-2.5 text-[15px] font-extrabold text-red-600 transition hover:bg-red-50"
                >
                  خروج
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMenu((prev) => !prev)}
              aria-label={menu ? "بستن منو" : "باز کردن منو"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              {menu ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {menu && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 lg:hidden">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block rounded-2xl px-4 py-3 text-[15px] font-extrabold text-slate-700 transition hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                ))}

                {!role && (
                  <>
                    <Link
                      to="/login"
                      className="block rounded-2xl px-4 py-3 text-[15px] font-extrabold text-slate-700 transition hover:bg-slate-100"
                    >
                      ورود بیمار
                    </Link>

                    <Link
                      to="/doctor-login"
                      className="block rounded-2xl px-4 py-3 text-[15px] font-extrabold text-blue-700 transition hover:bg-blue-50"
                    >
                      ورود پزشک
                    </Link>

                    <Link
                      to="/register"
                      className="block rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-[15px] font-black text-white shadow-sm transition hover:opacity-95"
                    >
                      ثبت‌نام
                    </Link>
                  </>
                )}

                {role === "doctor" && (
                  <Link
                    to="/doctor-dashboard"
                    className="block rounded-2xl px-4 py-3 text-[15px] font-extrabold text-blue-700 transition hover:bg-blue-50"
                  >
                    پنل پزشک
                  </Link>
                )}

                {role === "patient" && (
                  <>
                    <Link
                      to="/patient-dashboard"
                      className="block rounded-2xl px-4 py-3 text-[15px] font-extrabold text-blue-700 transition hover:bg-blue-50"
                    >
                      پنل بیمار
                    </Link>

                    <Link
                      to="/my-appointments"
                      className="block rounded-2xl px-4 py-3 text-[15px] font-extrabold text-slate-700 transition hover:bg-slate-100"
                    >
                      نوبت‌های من
                    </Link>
                  </>
                )}

                {role && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-2xl px-4 py-3 text-right text-[15px] font-extrabold text-red-600 transition hover:bg-red-50"
                  >
                    خروج
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
