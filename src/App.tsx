// مسیر: src/App.tsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));

const DoctorDashboard = lazy(() => import("./pages/dashboard/DoctorDashboard"));
const DoctorAppointments = lazy(() => import("./pages/dashboard/DoctorAppointments"));

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <div
      className="flex flex-col min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100"
      dir="rtl"
    >
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4" />
              <div className="text-gray-500 dark:text-zinc-400 font-medium">
                در حال بارگذاری صفحات...
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/doctor/:id" element={<DoctorProfilePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <MyAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor-appointments"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorAppointments />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
