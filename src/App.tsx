import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";

const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DoctorLogin = lazy(() => import("./pages/DoctorLogin"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));

const PatientProfile = lazy(() => import("./pages/Patient/PatientProfile"));
const MyAppointments = lazy(() => import("./pages/Patient/MyAppointments"));

const DoctorDashboard = lazy(() => import("./pages/Doctor/DoctorDashboard"));
const DoctorAvailability = lazy(() => import("./pages/Doctor/DoctorAvailability"));
const DoctorAppointments = lazy(() => import("./pages/Doctor/DoctorAppointments"));
const DoctorAdminProfile = lazy(() => import("./pages/Doctor/DoctorProfile"));
const DoctorSchedule = lazy(() => import("./pages/Doctor/DoctorSchedule"));

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" dir="rtl">
      <div className="text-center font-bold text-slate-500">در حال بارگذاری...</div>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/doctor/:id" element={<DoctorProfilePage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />

            <Route path="/patient-profile" element={<PatientProfile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />

            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-availability" element={<DoctorAvailability />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route path="/doctor-profile" element={<DoctorAdminProfile />} />
            <Route path="/doctor-schedule" element={<DoctorSchedule />} />

            <Route
              path="/patient-dashboard"
              element={<Navigate to="/patient-profile" replace />}
            />
            <Route
              path="/patient/appointments"
              element={<Navigate to="/my-appointments" replace />}
            />

            <Route
              path="/doctor/dashboard"
              element={<Navigate to="/doctor-dashboard" replace />}
            />
            <Route
              path="/doctor/availability"
              element={<Navigate to="/doctor-availability" replace />}
            />
            <Route
              path="/doctor/appointments"
              element={<Navigate to="/doctor-appointments" replace />}
            />
            <Route
              path="/doctor/profile"
              element={<Navigate to="/doctor-profile" replace />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
