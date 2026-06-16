import { Link, Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            DocTime
          </Link>
          <nav className="flex gap-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              خانه
            </Link>
            <Link to="/doctors" className="text-gray-700 hover:text-blue-600 transition">
              پزشکان
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">
              ورود
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
              ثبت‌نام
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} DocTime. تمامی حقوق محفوظ است.
      </footer>
    </div>
  );
};

export default MainLayout;
