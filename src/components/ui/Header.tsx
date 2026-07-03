import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  const navLinks = [
    { name: "صفحه اصلی", path: "/" },
    { name: "پزشکان", path: "/doctors" },
    { name: "درباره ما", path: "/about" },
    { name: "تماس با ما", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/75 backdrop-blur-xl border-b border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            : isHome
            ? "bg-white/55 backdrop-blur-lg border-b border-slate-200/70"
            : "bg-white/70 backdrop-blur-lg border-b border-slate-200"
        }`}
      >
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 md:h-20 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-3-3v6m8-3A9 9 0 1112 3a9 9 0 019 9z"
                    />
                  </svg>
                </div>

                <div className="flex flex-col leading-none">
                  <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    DocTime
                  </span>
                  <span className="text-[10px] md:text-xs text-slate-600 mt-1">
                    نوبت‌دهی آنلاین پزشکان
                  </span>
                </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-2">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        active
                          ? "text-slate-900 bg-white/70 border border-slate-200"
                          : "text-slate-800 hover:text-slate-950 hover:bg-white/40"
                      }`}
                    >
                      {link.name}
                      {active && (
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Actions */}
              <div className="hidden lg:flex items-center gap-3">
                <a
                  href="tel:02112345678"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-slate-200 text-slate-900 hover:bg-white/60 transition-all"
                >
                  <svg
                    className="w-4 h-4 text-cyan-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a2 2 0 011.9 1.37l.7 2.11a2 2 0 01-.45 2.05l-1.27 1.27a16 16 0 006.36 6.36l1.27-1.27a2 2 0 012.05-.45l2.11.7A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>

                </a>

                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full border border-slate-200 bg-white/40 text-slate-900 font-medium hover:bg-white/60 transition-all"
                >
                  ورود پزشک / بیمار
                </Link>

                <Link
                  to="/doctors"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                >
                  رزرو نوبت
                </Link>
              </div>

              {/* Mobile Button */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden w-11 h-11 rounded-xl bg-white/50 border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-white/70 transition"
                aria-label="باز کردن منو"
              >
                {mobileOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-4 mb-4 rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-2xl p-4 shadow-2xl">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition ${
                      active
                        ? "bg-cyan-50 text-slate-900 border border-cyan-200"
                        : "text-slate-800 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
              <a
                href="tel:02112345678"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900"
              >
                021-12345678
              </a>

              <Link
                to="/login"
                className="w-full text-center px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-900 font-medium hover:bg-slate-50 transition"
              >
                ورود پزشک / بیمار
              </Link>

              <Link
                to="/doctors"
                className="w-full text-center px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold shadow-lg"
              >
                رزرو نوبت آنلاین
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="h-16 md:h-20" />
    </>
  );
};

export default Header;