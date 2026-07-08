// Path: src/App.tsx

import {
  lazy,
  Suspense,
  useEffect,
  useState
} from "react";

import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";


import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import ProtectedRoute from "./components/ProtectedRoute";


const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const DoctorProfilePage = lazy(() => import("./pages/DoctorProfilePage"));

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const DoctorLogin = lazy(() => import("./pages/DoctorLogin"));

const MyAppointments =
lazy(() => import("./pages/Patient/MyAppointments"));


const DoctorDashboard =
lazy(() => import("./pages/dashboard/DoctorDashboard"));

const DoctorAppointments =
lazy(() => import("./pages/dashboard/DoctorAppointments"));

const DoctorSchedule =
lazy(() => import("./pages/dashboard/DoctorSchedule"));


const NotFoundPage =
lazy(() => import("./pages/NotFoundPage"));



export default function App(){


 const location = useLocation();


 const [refreshHeader,setRefreshHeader]=useState(0);



 useEffect(()=>{


   const update=()=>{

     setRefreshHeader(
       v=>v+1
     );

   };


   window.addEventListener(
    "storage",
    update
   );


   window.addEventListener(
    "auth-change",
    update
   );


   return()=>{

    window.removeEventListener(
      "storage",
      update
    );


    window.removeEventListener(
      "auth-change",
      update
    );


   };


 },[]);




 const isHome =
 location.pathname === "/";



 return (

<div
dir="rtl"
className="
min-h-screen
bg-[#f8fafc]
text-slate-900
"
>


<Header key={refreshHeader}/>



<main
className={
isHome
?
""
:
"mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
}
>


<Suspense

fallback={

<div className="
flex
min-h-[320px]
items-center
justify-center
flex-col
">


<div className="
h-12
w-12
animate-spin
rounded-full
border-b-2
border-t-2
border-emerald-500
"
/>


<p className="
mt-4
text-sm
font-bold
text-slate-500
">

در حال بارگذاری صفحه...

</p>


</div>

}


>


<Routes>


<Route
path="/"
element={<Home/>}
/>


<Route
path="/doctors"
element={<Doctors/>}
/>


<Route
path="/search"
element={<SearchResults/>}
/>


<Route
path="/doctor/:id"
element={<DoctorProfilePage/>}
/>


<Route
path="/login"
element={<Login/>}
/>


<Route
path="/doctor-login"
element={<DoctorLogin/>}
/>


<Route
path="/register"
element={<Register/>}
/>



<Route

path="/my-appointments"

element={

<ProtectedRoute allowedRoles={["patient"]}>

<MyAppointments/>

</ProtectedRoute>

}

/>



<Route

path="/doctor-dashboard"

element={

<ProtectedRoute allowedRoles={["doctor"]}>

<DoctorDashboard/>

</ProtectedRoute>

}

/>



<Route

path="/doctor-appointments"

element={

<ProtectedRoute allowedRoles={["doctor"]}>

<DoctorAppointments/>

</ProtectedRoute>

}

/>



<Route

path="/doctor-schedule"

element={

<ProtectedRoute allowedRoles={["doctor"]}>

<DoctorSchedule/>

</ProtectedRoute>

}

/>



<Route

path="*"

element={<NotFoundPage/>}

/>


</Routes>


</Suspense>


</main>



<Footer/>


</div>


 );


}