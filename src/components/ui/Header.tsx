import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getRole, logout } from "../../services/auth";


const navItems = [
  { label: "صفحه اصلی", to: "/" },
  { label: "پزشکان", to: "/doctors" },
  { label: "جستجوی پزشک", to: "/search" },
];


export default function Header() {

  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);


  useEffect(() => {

    setRole(getRole());

  }, [location.pathname]);



  function handleLogout(){

    logout();

    setRole(null);

    navigate("/");

  }



  return (

<header
className="
sticky top-0
z-50
px-4
pt-3
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
shadow-lg
"
>

<div
className="
flex
min-h-[82px]
items-center
justify-between
px-6
"
>


{/* Logo */}

<Link
to="/"
className="flex items-center gap-3"
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
text-2xl
font-black
"
>
+
</div>


<div>

<div
className="
font-black
text-xl
text-slate-900
"
>
DocTime
</div>


<div
className="
text-xs
font-bold
text-slate-500
"
>
سامانه نوبت‌دهی آنلاین پزشکان
</div>

</div>


</Link>



{/* Desktop menu */}

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
px-4
py-2
rounded-full
font-bold
text-sm
transition

${isActive
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
px-5
py-2
font-bold
"
>
ورود
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
font-bold
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
to="/my-appointments"
className="
rounded-full
bg-emerald-50
px-5
py-2
font-bold
text-emerald-700
"
>
نوبت‌های من
</Link>


<button
onClick={handleLogout}
className="
rounded-full
border
px-5
py-2
font-bold
"
>
خروج
</button>

</>

}




{
role==="doctor" &&

<>

<Link
to="/doctor-dashboard"
className="
rounded-full
bg-cyan-50
px-5
py-2
font-bold
text-cyan-700
"
>
پنل پزشک
</Link>


<button
onClick={handleLogout}
className="
rounded-full
border
px-5
py-2
font-bold
"
>
خروج
</button>


</>

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
font-bold
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
className="block p-3 font-bold"
>
ورود
</Link>

<Link
to="/register"
className="block p-3 font-bold"
>
ثبت‌نام
</Link>
</>

}



{
role==="doctor" &&

<Link
to="/doctor-dashboard"
className="block p-3 font-bold text-cyan-700"
>
پنل پزشک
</Link>

}


{
role==="patient" &&

<Link
to="/my-appointments"
className="block p-3 font-bold text-emerald-700"
>
نوبت‌های من
</Link>

}


</div>

}



</div>

</header>

);

}