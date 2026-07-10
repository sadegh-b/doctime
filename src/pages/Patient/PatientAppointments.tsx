 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, RefreshCw, XCircle } from "lucide-react";

import {
  getMyAppointments,
  cancelAppointment,
  type AppointmentItem,
} from "../../services/appointments";

function toPersianDigits(value: string | number) {
  return String(value).replace(
    /\d/g,
    (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]
  );
}

function statusText(status?: string) {
  switch (status) {
    case "cancelled":
      return "لغو شده";
    case "completed":
      return "انجام شده";
    default:
      return "رزرو شده";
  }
}

export default function PatientAppointments() {
  const queryClient = useQueryClient();

  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useQuery<AppointmentItem[]>({
    queryKey: ["patient-appointments"],
    queryFn: getMyAppointments,
  });


  const cancelMutation = useMutation({
    mutationFn: (id: number) =>
      cancelAppointment(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["patient-appointments"],
      });
    },
  });


  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 p-5"
    >
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex items-center justify-between rounded-3xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-white">

          <div>
            <h1 className="text-3xl font-black">
              نوبت‌های من
            </h1>

            <p className="mt-2 text-slate-300">
              لیست نوبت‌های ثبت شده بیمار
            </p>
          </div>


          <button
            onClick={() => refetch()}
            className="rounded-2xl bg-white/10 p-3"
          >
            <RefreshCw size={20}/>
          </button>

        </div>


        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center font-black">
            در حال دریافت اطلاعات...
          </div>
        ) : appointments.length === 0 ? (

          <div className="rounded-3xl bg-white p-8 text-center font-black">
            هنوز نوبتی ثبت نشده است
          </div>

        ) : (

          <div className="space-y-4">

            {appointments.map((item) => (

              <div
                key={item.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >

                <div className="flex justify-between">

                  <div>
                    <h2 className="text-xl font-black">
                      {item.doctor_name ?? "پزشک"}
                    </h2>

                    <p className="mt-2 text-slate-500">
                      {item.specialty ?? "تخصص نامشخص"}
                    </p>
                  </div>


                  <div className="rounded-full bg-emerald-100 px-4 py-2 font-black text-emerald-700">
                    {statusText(item.status)}
                  </div>

                </div>


                <div className="mt-5 grid gap-3 md:grid-cols-2">

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <CalendarDays size={18}/>
                    <p className="mt-2 font-bold">
                      {item.date}
                    </p>
                  </div>


                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Clock3 size={18}/>
                    <p className="mt-2 font-bold">
                      {toPersianDigits(item.start_time ?? "")}
                      {" تا "}
                      {toPersianDigits(item.end_time ?? "")}
                    </p>
                  </div>

                </div>


                {item.status !== "cancelled" &&
                 item.status !== "completed" && (

                  <button
                    onClick={() =>
                      cancelMutation.mutate(item.id)
                    }
                    className="mt-5 flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-black text-white"
                  >
                    <XCircle size={18}/>
                    لغو نوبت
                  </button>

                )}

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}