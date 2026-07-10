// src/components/ui/Header.tsx

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  getRole,
  logout,
} from "../../services/auth";


const navItems = [
  {
    label: "صفحه اصلی",
    to: "/",
  },
  {
    label: "پزشکان",
    to: "/doctors",
  },
  {
    label: "جستجوی پزشک",
    to: "/search",
  },
];


export default function Header() {


  const location = useLocation();
  const navigate = useNavigate();


  const [role, setRole] =
    useState<string | null>(null);


  const [menu, setMenu] =
    useState(false);



  function updateAuth(){

    const currentRole =
      getRole();

    setRole(currentRole);

  }



  useEffect(()=>{

    updateAuth();


    window.addEventListener(
      "auth-change",
      updateAuth
    );


    return ()=>{

      window.removeEventListener(
        "auth-change",
        updateAuth
      );

    };


  },[]);



  useEffect(()=>{

    setMenu(false);

  },[
    location.pathname
  ]);





  function handleLogout(){

    logout();

    setRole(null);

    navigate("/");

  }





  return (

<header
className="
sticky
top-0
z-50
px-4
pt-4
"
>

<div
className="
mx-auto
max-w-7xl
rounded-[30px]
border
border-slate-200
bg-white/90
backdrop-blur-xl
shadow-xl
"
>


<div
className="
flex
items-center
justify-between
px-6
py-4
"
>


{/* Logo */}

<Link
to="/"
className="
flex
items-center
gap-3
"
>


<div
className="
flex
h-14
w-14
items-center
justify-center
rounded-3xl
bg-gradient-to-br
from-emerald-500
to-cyan-600
text-white
text-3xl
font-black
shadow-lg
"
>
+
</div>


<div>

<h1
className="
text-xl
font-black
text-slate-900
"
>
DocTime
</h1>


<p
className="
text-xs
font-bold
text-slate-500
"
>
سامانه نوبت‌دهی آنلاین پزشکان
</p>

</div>

</Link>





{/* Menu */}

<nav
className="
hidden
lg:flex
items-center
gap-2
"
>


{
navItems.map(item=>(

<NavLink
key={item.to}
to={item.to}

className={({isActive})=>
`
px-5
py-2
rounded-full
text-sm
font-black
transition

${
isActive
?
"bg-emerald-50 text-emerald-700"
:
"text-slate-700 hover:bg-slate-100"
}

`
}

>

{item.label}

</NavLink>

))

}


</nav>





{/* Actions */}

<div
className="
hidden
lg:flex
items-center
gap-3
"
>


{
!role &&

<>


<Link
to="/login"

className="
rounded-full
border
border-slate-200
px-5
py-2
font-black
text-slate-700
hover:bg-slate-100
"
>
ورود بیمار
</Link>



<Link
to="/doctor-login"

className="
rounded-full
bg-cyan-50
px-5
py-2
font-black
text-cyan-700
"
>
ورود پزشک
</Link>



<Link
to="/register"

className="
rounded-full
bg-gradient-to-r
from-emerald-600
to-cyan-600
px-5
py-2
font-black
text-white
"
>
ثبت‌نام
</Link>


</>

}




{
role==="patient" &&

<>

<Link
to="/patient-dashboard"

className="
rounded-full
bg-emerald-50
px-5
py-2
font-black
text-emerald-700
"
>
پنل بیمار
</Link>


<Link
to="/my-appointments"

className="
rounded-full
bg-slate-100
px-5
py-2
font-black
"
>
نوبت‌های من
</Link>


</>

}





{
role==="doctor" &&

<Link
to="/doctor-dashboard"

className="
rounded-full
bg-cyan-50
px-5
py-2
font-black
text-cyan-700
"
>
پنل پزشک
</Link>

}




{
role &&

<button

onClick={handleLogout}

className="
rounded-full
border
border-red-200
px-5
py-2
font-black
text-red-600
hover:bg-red-50
"
>

خروج

</button>

}


</div>





<button

onClick={()=>setMenu(!menu)}

className="
lg:hidden
rounded-xl
border
px-3
py-2
font-black
"
>
☰
</button>



</div>





{
menu &&

<div
className="
lg:hidden
border-t
p-5
space-y-3
"
>


{
navItems.map(item=>(

<Link
key={item.to}
to={item.to}

className="
block
rounded-xl
p-3
font-black
hover:bg-slate-100
"
>

{item.label}

</Link>

))

}



{
!role &&

<>

<Link
to="/login"
className="
block
p-3
font-black
"
>
ورود بیمار
</Link>


<Link
to="/doctor-login"
className="
block
p-3
font-black
"
>
ورود پزشک
</Link>


<Link
to="/register"
className="
block
p-3
font-black
"
>
ثبت‌نام
</Link>

</>

}





{
role==="doctor" &&

<Link
to="/doctor-dashboard"

className="
block
p-3
font-black
text-cyan-700
"
>
پنل پزشک
</Link>

}




{
role==="patient" &&

<Link
to="/patient-dashboard"

className="
block
p-3
font-black
text-emerald-700
"
>
پنل بیمار
</Link>

}




{
role &&

<button

onClick={handleLogout}

className="
w-full
text-right
p-3
font-black
text-red-600
"
>
خروج
</button>

}



</div>

}


</div>

</header>

  );

}