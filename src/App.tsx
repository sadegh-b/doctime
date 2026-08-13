// src/App.tsx

import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";

// --- صفحات عمومی (Public Pages) ---
const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const DoctorLogin = lazy(() => import("./pages/DoctorLogin"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));

// --- مجله سلامت (Magazine) ---
const HealthMagazinePage = lazy(() => import("./pages/HealthMagazinePage"));
const AddictionArticlePage = lazy(() => import("./pages/magazine/AddictionArticlePage"));
const ConstipationArticlePage = lazy(() => import("./pages/magazine/ConstipationArticlePage"));
const DiabetesArticlePage = lazy(() => import("./pages/magazine/DiabetesArticlePage"));

// --- صفحات بیمار (Patient Pages) ---
const PatientProfile = lazy(() => import("./pages/Patient/PatientProfile"));
const MyAppointments = lazy(() => import("./pages/Patient/MyAppointments"));
const Wallet = lazy(() => import("./pages/Patient/Wallet"));
const PaymentVerify = lazy(() => import("./pages/PaymentVerify"));

// --- صفحات پزشک (Doctor Pages) ---
const DoctorDashboard = lazy(() => import("./pages/Doctor/DoctorDashboard"));
const DoctorAvailability = lazy(() => import("./pages/Doctor/DoctorAvailability"));
const DoctorAppointments = lazy(() => import("./pages/Doctor/DoctorAppointments"));
const DoctorAdminProfile = lazy(() => import("./pages/Doctor/DoctorProfile"));
const DoctorSchedule = lazy(() => import("./pages/Doctor/DoctorSchedule"));

// --- فرم‌های پزشکی ---
const AnamnesisForm = lazy(() => import("./pages/AnamnesisForm"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// کامپوننت بارگذاری
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" dir="rtl">
      <div className="animate-pulse text-center font-bold text-slate-500">
        در حال بارگذاری داک‌تایم...
      </div>
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
            {/* روت‌های عمومی */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* بخش مجله */}
            <Route path="/health-magazine" element={<HealthMagazinePage />} />
            <Route
              path="/health-magazine/addiction-recovery"
              element={<AddictionArticlePage />}
            />
            <Route
              path="/health-magazine/constipation"
              element={<ConstipationArticlePage />}
            />
            <Route
              path="/health-magazine/diabetes"
              element={<DiabetesArticlePage />}
            />

            {/* بخش پزشکان */}
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/doctor/:id" element={<DoctorProfilePage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />

            {/* احراز هویت */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />

            {/* روت‌های مستقیم بیمار */}
            <Route path="/patient-profile" element={<PatientProfile />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/verify" element={<PaymentVerify />} />

            {/* روت‌های مستقیم پزشک */}
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-availability" element={<DoctorAvailability />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route path="/doctor-profile" element={<DoctorAdminProfile />} />
            <Route path="/doctor-schedule" element={<DoctorSchedule />} />

            <Route path="/anamnesis" element={<AnamnesisForm />} />

            {/* ریدایرکت‌های بیمار */}
            <Route
              path="/patient/dashboard"
              element={<Navigate to="/patient-profile" replace />}
            />
            <Route
              path="/patient-dashboard"
              element={<Navigate to="/patient-profile" replace />}
            />
            <Route
              path="/patient/profile"
              element={<Navigate to="/patient-profile" replace />}
            />
            <Route
              path="/patient/appointments"
              element={<Navigate to="/my-appointments" replace />}
            />
            <Route
              path="/patient/wallet"
              element={<Navigate to="/wallet" replace />}
            />
            <Route
              path="/patient/wallet/verify"
              element={<Navigate to="/wallet/verify" replace />}
            />

            {/* ریدایرکت‌های پزشک */}
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

            {/* صفحه 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
