// مسیر فایل: src/pages/DoctorProfilePage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getDoctorById } from "../services/doctors";
import { createAppointment } from "../services/appointments";
import { getDoctorAvailability, type AvailabilitySlot } from "../services/availability";

import ReviewsList from "../components/ReviewsList";
import AddReviewForm from "../components/AddReviewForm";

import doctorPlaceholder from "../assets/images/doctor-placeholder.jpg";

import {
  MapPin,
  Info,
  ChevronLeft,
} from "lucide-react";


// تبدیل تاریخ میلادی به نمایش فارسی
const getPersianDateParts = (dateStr: string) => {
  try {
    const date = new Date(`${dateStr}T12:00:00`);

    return {
      weekday: new Intl.DateTimeFormat("fa-IR", {
        weekday: "long",
      }).format(date),

      dayMonth: new Intl.DateTimeFormat("fa-IR", {
        day: "numeric",
        month: "long",
      }).format(date),
    };

  } catch {

    return {
      weekday: "",
      dayMonth: dateStr,
    };
  }
};


export default function DoctorProfilePage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const doctorId = Number(id);

  const queryClient = useQueryClient();


  const [selectedDate, setSelectedDate] = useState("");

  const [selectedSlotId, setSelectedSlotId] =
    useState<number | null>(null);



  // دریافت پزشک
  const {
    data: doctor,
    isLoading,
    isError,

  } = useQuery({

    queryKey: [
      "doctor",
      doctorId
    ],

    queryFn: () =>
      getDoctorById(doctorId),

    enabled:
      Number.isInteger(doctorId)

  });



  // دریافت زمان‌های آزاد
  const {
    data: availabilitySlots = [],
    isLoading: availabilityLoading,

  } = useQuery<AvailabilitySlot[]>({

    queryKey:[
      "availability",
      doctorId
    ],

    queryFn:() =>
      getDoctorAvailability(doctorId),

    enabled:
      Number.isInteger(doctorId)

  });



  // گروه‌بندی بر اساس روز

  const groupedByDate = useMemo(()=>{

    const groups:
      Record<string, AvailabilitySlot[]> = {};


    availabilitySlots.forEach(slot=>{

      if(!slot.date)
        return;


      if(!groups[slot.date])
        groups[slot.date]=[];


      groups[slot.date].push(slot);

    });


    return Object.entries(groups)
      .sort((a,b)=>
        a[0].localeCompare(b[0])
      );


  },[availabilitySlots]);



  const activeDate =
    selectedDate ||
    groupedByDate[0]?.[0] ||
    "";



  const visibleSlots = useMemo(()=>{


    const current =
      groupedByDate.find(
        ([date]) =>
          date === activeDate
      );


    if(!current)
      return [];


    return [...current[1]]
      .sort((a,b)=>
        a.start_time.localeCompare(
          b.start_time
        )
      );


  },[
    groupedByDate,
    activeDate
  ]);



  // رزرو نوبت

  const bookingMutation =
    useMutation({

      mutationFn:(availability_id:number)=>
        createAppointment({
          availability_id
        }),


      onSuccess:()=>{


        queryClient.invalidateQueries({

          queryKey:[
            "availability",
            doctorId
          ]

        });


        setSelectedSlotId(null);


        alert(
          "✅ نوبت با موفقیت ثبت شد"
        );


      },


      onError:(error:any)=>{

        alert(
          error?.response?.data?.detail ||
          "خطا در ثبت نوبت"
        );

      }


    });



  const handleBooking = ()=>{


    const token =
      localStorage.getItem(
        "access_token"
      );


    if(!token){

      alert(
        "ابتدا وارد حساب شوید"
      );

      navigate("/login");

      return;

    }



    if(!selectedSlotId){

      alert(
        "یک ساعت انتخاب کنید"
      );

      return;

    }



    bookingMutation.mutate(
      selectedSlotId
    );


  };



  if(isLoading)
    return (
      <div className="p-10 text-center">
        در حال دریافت اطلاعات پزشک...
      </div>
    );


  if(isError || !doctor)
    return (
      <div className="p-10 text-center">
        پزشک پیدا نشد
      </div>
    );
  return (

    <div
      className="min-h-screen bg-[#4f86ff] pb-16 font-sans"
      dir="rtl"
    >


      {/* هدر */}

      <div className="text-center text-white py-12">

        <h1 className="text-4xl font-black">
          زمان نوبت‌دهی
        </h1>


        <p className="mt-3 text-lg opacity-90">
          زمان مناسب خود را انتخاب کنید
        </p>

      </div>




      <div className="max-w-2xl mx-auto px-4">


        <div className="
          bg-white
          rounded-[3rem]
          shadow-2xl
          overflow-hidden
          pb-12
        ">



          {/* اطلاعات پزشک */}

          <div className="p-8 border-b">


            <div className="
              flex
              items-center
              justify-between
              mb-8
            ">


              <ChevronLeft
                className="
                cursor-pointer
                text-gray-500
                "
                onClick={() =>
                  navigate(-1)
                }
              />


              <span className="
                font-black
                text-xl
                text-gray-800
              ">
                انتخاب نوبت مطب
              </span>


              <div className="w-7"/>


            </div>




            <div className="
              flex
              gap-6
              items-center
            ">


              <img

                src={
                  doctor.image ||
                  doctorPlaceholder
                }

                className="
                  w-24
                  h-24
                  rounded-2xl
                  object-cover
                "

                alt=""
              />



              <div>


                <h2 className="
                  text-3xl
                  font-black
                  text-gray-900
                ">
                  {doctor.name}
                </h2>



                <p className="
                  text-blue-600
                  font-bold
                  mt-2
                ">
                  {doctor.specialty}
                </p>



                <p className="
                  text-gray-500
                  flex
                  items-center
                  gap-2
                  mt-2
                ">

                  <MapPin size={18}/>

                  {doctor.city}

                </p>


              </div>


            </div>


          </div>





          {/* توضیحات مطب */}

          <div className="px-8 mt-6">


            <div className="
              bg-blue-50
              border
              border-blue-100
              rounded-2xl
              p-5
              flex
              gap-3
            ">


              <Info
                className="text-blue-500"
              />

              <p className="
                text-blue-900
                leading-8
              ">

                <b>
                  ملاحظات مطب:
                </b>

                <br/>

                لطفاً قبل از مراجعه زمان رزرو شده را بررسی کنید.

              </p>


            </div>


          </div>





          {/* انتخاب تاریخ */}


          <div className="mt-8 px-6">


            <div className="
              flex
              gap-4
              overflow-x-auto
            ">



            {
              groupedByDate.map(
                ([date,slots])=>{


                  const {
                    weekday,
                    dayMonth

                  } =
                  getPersianDateParts(
                    date
                  );


                  const active =
                    activeDate === date;



                  return (

                    <button

                      key={date}

                      type="button"

                      onClick={()=>{

                        setSelectedDate(date);

                        setSelectedSlotId(null);

                      }}

                      className={`
                      flex-shrink-0
                      w-32
                      p-4
                      rounded-2xl
                      border-2

                      ${
                        active
                        ?
                        "border-blue-500 bg-blue-50"
                        :
                        "border-gray-200"
                      }

                      `}

                    >


                      <div className="
                        text-xs
                        text-gray-500
                      ">
                        {weekday}
                      </div>



                      <div className="
                        font-black
                        mt-2
                      ">
                        {dayMonth}
                      </div>



                      <div className="
                        text-xs
                        text-green-600
                        mt-2
                      ">
                        {
                          slots.filter(
                            s=>!s.is_booked
                          ).length
                        }

                        {" "}
                        نوبت
                      </div>


                    </button>

                  );


                }
              )
            }


            </div>


          </div>





          {/* ساعت‌ها */}


          <div className="px-8 mt-8">


            <h3 className="
              font-black
              text-lg
              mb-5
            ">

              نوبت‌های
              {" "}
              {
                getPersianDateParts(
                  activeDate
                ).dayMonth
              }

            </h3>



            {
              availabilityLoading ?

              (

                <p className="
                  text-center
                ">
                  در حال دریافت زمان‌ها...
                </p>

              )

              :

              visibleSlots.length > 0 ?

              (

                <div className="
                  grid
                  grid-cols-3
                  gap-4
                ">


                {
                  visibleSlots.map(slot=>{


                    const selected =
                      selectedSlotId === slot.id;



                    return (

                      <button

                        key={slot.id}

                        disabled={
                          slot.is_booked
                        }

                        onClick={()=>{

                          setSelectedSlotId(
                            slot.id
                          );

                        }}

                        className={`
                          py-5
                          rounded-2xl
                          font-black
                          border

                          ${
                            selected
                            ?
                            "bg-blue-600 text-white"
                            :
                            "bg-white"
                          }

                          ${
                            slot.is_booked
                            ?
                            "opacity-40"
                            :
                            ""
                          }

                        `}

                      >

                        {
                          slot.start_time.slice(0,5)
                        }


                      </button>

                    );


                  })
                }


                </div>

              )

              :

              (

                <p className="
                  bg-yellow-50
                  p-5
                  rounded-xl
                  text-center
                ">
                  نوبتی موجود نیست
                </p>

              )

            }


          </div>
                    {/* دکمه ثبت نهایی */}

          <div className="px-8 mt-10">

            <button

              type="button"

              onClick={handleBooking}

              disabled={
                bookingMutation.isPending ||
                !selectedSlotId
              }


              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                disabled:bg-gray-300
                text-white
                py-6
                rounded-full
                font-black
                text-xl
                shadow-xl
                transition
              "

            >

              {
                bookingMutation.isPending

                ?

                "در حال ثبت..."

                :

                "تأیید و ثبت نوبت"

              }


            </button>


          </div>



        </div>


      </div>





      {/* نظرات بیماران */}


      <div className="
        max-w-2xl
        mx-auto
        px-4
        mt-8
      ">


        <div className="
          bg-white
          rounded-[3rem]
          p-8
        ">


          <h2 className="
            text-2xl
            font-black
            mb-6
            border-b
            pb-4
          ">

            نظرات بیماران

          </h2>



          <ReviewsList

            doctorId={
              doctorId
            }

          />



          <AddReviewForm

            doctorId={
              doctorId
            }

          />


        </div>


      </div>



    </div>

  );

}