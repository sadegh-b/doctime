// Path: src/App.tsx

import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// =========================
// Patient Pages
// =========================
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import BookAppointment from "./pages/patient/BookAppointment";

// =========================
// Public Pages
// =========================
const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DoctorLogin = lazy(() => import("./pages/DoctorLogin"));

// =========================
// Doctor Pages
// =========================
const DoctorDashboard = lazy(
  () => import("./pages/doctor/DoctorDashboard")
);

const DoctorAppointments = lazy(
  () => import("./pages/doctor/DoctorAppointments")
);

const DoctorSchedule = lazy(
  () => import("./pages/doctor/DoctorSchedule")
);

// =========================
// 404
// =========================
const NotFoundPage = lazy(
  () => import("./pages/NotFoundPage")
);


export default function App() {
  const location = useLocation();

  const [refreshHeader, setRefreshHeader] = useState(0);

  useEffect(() => {
    const updateHeader = () => {
      setRefreshHeader((v) => v + 1);
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
    <div
      dir="rtl"
      className="min-h-screen bg-[#f8fafc] text-slate-900"
    >

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

            {/* Public */}

            <Route path="/" element={<Home />} />

            <Route path="/doctors" element={<Doctors />} />

            <Route
              path="/search"
              element={<SearchResults />}
            />

            <Route
              path="/doctor/:id"
              element={<DoctorProfilePage />}
            />


            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/doctor-login"
              element={<DoctorLogin />}
            />

            <Route
              path="/register"
              element={<Register />}
            />


            {/* Patient */}


            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientDashboard />
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



            {/* Doctor */}


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


            <Route
              path="/doctor-schedule"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorSchedule />
                </ProtectedRoute>
              }
            />



            {/* 404 */}

            <Route
              path="*"
              element={<NotFoundPage />}
            />


          </Routes>

        </Suspense>

      </main>


      <Footer />

    </div>
  );
}