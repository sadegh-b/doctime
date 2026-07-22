import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getDoctorAvailability,
  type AvailabilitySlot,
} from "../services/availability";

import { createAppointment } from "../services/appointments";
import { getAccessToken } from "../services/auth";


interface Props {
  doctorId: number;
  doctorName?: string;
  specialty?: string;
}


const toPersianDigits = (value: string) =>
  value.replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);



function formatTime(time:string){

  return toPersianDigits(
    time.substring(0,5)
  );

}



function persianDate(date:string){

  const d = new Date(date + "T12:00:00");


  return {
    weekday:
      new Intl.DateTimeFormat(
        "fa-IR",
        {weekday:"long"}
      ).format(d),

    day:
      new Intl.DateTimeFormat(
        "fa-IR",
        {day:"numeric"}
      ).format(d),

    month:
      new Intl.DateTimeFormat(
        "fa-IR",
        {month:"long"}
      ).format(d)
  };

}



export default function BookingCalendar({
  doctorId,
  doctorName,
  specialty
}:Props){


const navigate = useNavigate();

const queryClient = useQueryClient();



const [selectedDate,setSelectedDate] =
useState<string>("");


const [selectedSlotId,setSelectedSlotId] =
useState<number | null>(null);



const [message,setMessage] =
useState<string>("");





const {
data:slots=[],
isLoading
}=useQuery<AvailabilitySlot[]>({

queryKey:[
 "availability",
 doctorId
],

queryFn:()=>getDoctorAvailability(doctorId),

enabled:!!doctorId

});





// فقط نوبت های آزاد

const freeSlots =
useMemo(()=>{

return slots.filter(
slot =>
slot.is_available &&
!slot.is_booked
);

},[slots]);






const dates =
useMemo(()=>{

return [
...new Set(
freeSlots.map(
s=>s.date
)
)
].sort();

},[freeSlots]);







const activeDate =
selectedDate ||
dates[0] ||
"";






const todaySlots =
useMemo(()=>{


return freeSlots.filter(
s=>s.date===activeDate
)
.sort(
(a,b)=>
a.start_time.localeCompare(
b.start_time
)
);


},[
freeSlots,
activeDate
]);







const bookingMutation =
useMutation({

mutationFn:createAppointment,


onSuccess:()=>{


queryClient.invalidateQueries({
queryKey:[
"availability",
doctorId
]
});


setSelectedSlotId(null);


setMessage(
"نوبت شما با موفقیت ثبت شد."
);


},



onError:(error:any)=>{


setMessage(
error?.response?.data?.detail ||
"خطا در ثبت نوبت"
);


}

});






function handleBooking(){


const token=getAccessToken();


if(!token){

navigate("/login");

return;

}



if(!selectedSlotId){

return;

}



console.log("selectedSlotId =", selectedSlotId);

bookingMutation.mutate({

availability_id: selectedSlotId,

});


}






if(isLoading){

return (

<div className="p-8 text-center">

در حال دریافت زمان‌ها...

</div>

)

}






if(freeSlots.length===0){

return (

<div className="
p-6
bg-yellow-50
rounded-2xl
text-yellow-700
flex
gap-2
">

<AlertCircle/>

نوبت آزادی وجود ندارد

</div>

)

}






return (

<div
className="
bg-white
rounded-3xl
shadow-xl
p-6
"
dir="rtl"
>


<div className="
bg-blue-600
text-white
rounded-2xl
p-5
mb-6
">

<div className="flex gap-2 items-center">

<Calendar size={20}/>

<span>
رزرو آنلاین نوبت
</span>

</div>


<h2 className="
text-xl
font-black
mt-3
">

{doctorName}

</h2>


<p>
{specialty}
</p>


</div>








<div className="
flex
gap-3
overflow-x-auto
mb-6
">


{
dates.map(date=>{


const p=persianDate(date);


return (

<button

key={date}

onClick={()=>{

setSelectedDate(date);

setSelectedSlotId(null);

}}

className={`
min-w-[100px]
p-3
rounded-2xl
border
font-bold

${
activeDate===date

?

"bg-blue-600 text-white"

:

"bg-white"
}

`}

>


<div>
{p.weekday}
</div>

<div>
{p.day}
</div>

<div>
{p.month}
</div>


</button>

)

})

}



</div>






<div className="
flex
items-center
gap-2
mb-4
font-bold
">


<Clock size={18}/>


زمان‌های آزاد


</div>





<div className="
grid
grid-cols-3
gap-3
">


{

todaySlots.map(slot=>(


<button

key={slot.id}


onClick={()=>setSelectedSlotId(slot.id)}


className={`

p-4

rounded-xl

border

font-black


${
selectedSlotId===slot.id

?

"bg-blue-600 text-white"

:

"bg-white"

}

`}


>


{formatTime(slot.start_time)}


</button>


))


}



</div>






<button

disabled={
!selectedSlotId ||
bookingMutation.isPending
}


onClick={handleBooking}


className="
mt-8
w-full
bg-blue-600
disabled:bg-gray-300
text-white
p-5
rounded-full
font-black
text-lg
"


>


{
bookingMutation.isPending

?

"در حال ثبت..."

:

"تایید و ثبت نوبت"

}


</button>





{
message &&

<div className="
mt-5
bg-green-50
text-green-700
p-4
rounded-xl
flex
gap-2
">

<CheckCircle2 size={20}/>

{message}

</div>

}




</div>


)


}
