import { useState } from "react";
import { Link } from "react-router-dom";


interface ScheduleDay {

  day:string;

  isActive:boolean;

  startTime:string;

  endTime:string;

}



const defaultSchedule:ScheduleDay[]=[

{
day:"شنبه",
isActive:true,
startTime:"09:00",
endTime:"17:00"
},

{
day:"یکشنبه",
isActive:true,
startTime:"09:00",
endTime:"17:00"
},

{
day:"دوشنبه",
isActive:true,
startTime:"09:00",
endTime:"17:00"
},

{
day:"سه‌شنبه",
isActive:true,
startTime:"09:00",
endTime:"17:00"
},

{
day:"چهارشنبه",
isActive:true,
startTime:"09:00",
endTime:"17:00"
},

{
day:"پنج‌شنبه",
isActive:false,
startTime:"09:00",
endTime:"13:00"
},

{
day:"جمعه",
isActive:false,
startTime:"00:00",
endTime:"00:00"
}

];



export default function DoctorSchedule(){


const [schedule,setSchedule]=
useState(defaultSchedule);


const [saving,setSaving]=
useState(false);


const [message,setMessage]=
useState("");



function toggleDay(index:number){

const copy=[...schedule];

copy[index].isActive =
!copy[index].isActive;


setSchedule(copy);

}



function changeTime(
index:number,
field:"startTime"|"endTime",
value:string
){

const copy=[...schedule];

copy[index][field]=value;


setSchedule(copy);

}




async function save(
e:React.FormEvent
){

e.preventDefault();


setSaving(true);


setMessage("");


try{


/*
اینجا بعداً وصل می‌کنیم:

POST /doctor/schedule

*/


await new Promise(
resolve=>setTimeout(resolve,700)
);



setMessage(
"برنامه کاری با موفقیت ذخیره شد"
);



}catch{


setMessage(
"خطا در ذخیره برنامه"
);


}finally{

setSaving(false);

}


}



return (

<div
className="
min-h-screen
bg-slate-50
p-6
"
dir="rtl"
>


<div
className="
max-w-4xl
mx-auto
"
>


<div
className="
flex
justify-between
items-center
mb-8
"
>

<h1
className="
text-3xl
font-black
text-slate-800
"
>
برنامه کاری پزشک
</h1>


<Link
to="/doctor-dashboard"
className="
text-emerald-600
font-bold
"
>
داشبورد
</Link>


</div>



{
message &&
<div
className="
mb-5
rounded-xl
bg-emerald-50
p-4
font-bold
text-emerald-700
"
>
{message}
</div>
}



<form
onSubmit={save}
className="
bg-white
rounded-3xl
shadow
p-6
space-y-4
"
>


{
schedule.map(
(item,index)=>(

<div
key={item.day}
className="
flex
items-center
justify-between
border
rounded-2xl
p-4
"
>


<div
className="flex gap-3 items-center"
>


<input

type="checkbox"

checked={item.isActive}

onChange={()=>
toggleDay(index)
}

/>


<span
className="font-black"
>
{item.day}
</span>


</div>



{
item.isActive &&

<div
className="flex gap-2 items-center"
>

<input

type="time"

value={item.startTime}

onChange={
e=>
changeTime(
index,
"startTime",
e.target.value
)
}

/>


تا


<input

type="time"

value={item.endTime}

onChange={
e=>
changeTime(
index,
"endTime",
e.target.value
)
}

/>


</div>

}



</div>

)

)

}



<button

disabled={saving}

className="
w-full
rounded-2xl
bg-emerald-600
py-3
font-black
text-white
disabled:opacity-50
"

>

{
saving
?
"در حال ذخیره..."
:
"ذخیره برنامه"
}

</button>



</form>



</div>


</div>

);


}