// مسیر فایل: src/App.tsx

import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import PatientDashboard from "./pages/Patient/PatientDashboard";
import PatientAppointments from "./pages/Patient/PatientAppointments";
import BookAppointment from "./pages/Patient/BookAppointment";

const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DoctorLogin = lazy(() => import("./pages/DoctorLogin"));

const DoctorDashboard = lazy(
  () => import("./pages/Doctor/DoctorDashboard")
);
const DoctorAppointments = lazy(
  () => import("./pages/Doctor/DoctorAppointments")
);
const DoctorSchedule = lazy(
  () => import("./pages/Doctor/DoctorSchedule")
);

// صفحات پروفایل واقعی
const PatientProfile = lazy(
  () => import("./pages/Patient/PatientProfile")
);
const DoctorProfile = lazy(
  () => import("./pages/Doctor/DoctorProfile")
);

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function ProfileRedirect() {
  const role = localStorage.getItem("role");

  if (role === "doctor") {
    return <Navigate to="/doctor-profile" replace />;
  }

  if (role === "patient") {
    return <Navigate to="/patient-profile" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const [refreshHeader, setRefreshHeader] = useState(0);

  useEffect(() => {
    const updateHeader = () => {
      setRefreshHeader((value) => value + 1);
    };

    window.addEventListener("storage", updateHeader);
    window.addEventListener("auth-change", updateHeader);

    return () => {
      window.removeEventListener("storage", updateHeader);
      window.removeEventListener("auth-change", updateHeader);
    };
  }, []);

  const isHome = location.pathname === "/";

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Header key={refreshHeader} />

      <main
        className={
          isHome
            ? ""
            : "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        }
      >
        <Suspense
          fallback={
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                <p className="mt-4 font-bold text-slate-500">
                  در حال بارگذاری...
                </p>
              </div>
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctor-register" element={<Register />} />

            {/* Shared Profile Entry */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                  <ProfileRedirect />
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient-profile"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient-appointments"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/book-appointment"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-appointments"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientAppointments />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor-dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor-profile"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorProfile />
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

            <Route
              path="/doctor-schedule"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorSchedule />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
