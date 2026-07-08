import { useQuery } from "@tanstack/react-query";
import { getMyAppointments } from "../services/appointments";
import { Link } from "react-router-dom";


export default function MyAppointments() {

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey:["my-appointments"],
    queryFn:getMyAppointments,
  });


  if(isLoading){
    return (
      <div className="min-h-screen flex items-center justify-center">
        در حال دریافت نوبت‌ها...
      </div>
    );
  }


  if(isError){
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        خطا در دریافت نوبت‌ها
      </div>
    );
  }



  return (

<div
className="min-h-screen bg-slate-50 py-8"
dir="rtl"
>

<div
className="max-w-5xl mx-auto px-4"
>


<h1 className="text-3xl font-black mb-8">
نوبت‌های من
</h1>



{
appointments.length===0 ?


<div className="bg-white rounded-3xl p-8 text-center shadow">

<p>
هنوز نوبتی ثبت نکرده‌اید
</p>


<Link
to="/doctors"
className="inline-block mt-5 bg-cyan-600 text-white px-6 py-3 rounded-xl"
>
جستجوی پزشک
</Link>


</div>


:


<div className="space-y-5">


{
appointments.map((item)=>(
<div
key={item.id}
className="bg-white rounded-3xl p-6 shadow border"
>


<h2 className="font-black text-xl">
{item.doctor_name || "پزشک"}
</h2>


<p className="text-cyan-600 mt-2">
{item.specialty}
</p>


<div className="mt-4 space-y-2 text-slate-600">


<p>
📅 {item.date}
</p>


<p>
⏰ {item.start_time} - {item.end_time}
</p>


<p>
وضعیت:
<span className="font-bold mr-2">
{item.status}
</span>
</p>


</div>



<div className="mt-4 text-xs text-slate-400">
کد پیگیری: #{item.id}
</div>


</div>
))

}


</div>


}


</div>

</div>

  );
}