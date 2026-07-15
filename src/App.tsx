import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

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

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
