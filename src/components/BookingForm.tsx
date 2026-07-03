import { useState } from "react";
import { createAppointment } from "../services/appointments";

type Props = {
  doctorId: number;
  doctorName?: string;
  availableTimes: string[];
};

export default function BookingForm({
  doctorId,
  doctorName = "پزشک",
  availableTimes
}: Props) {

  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!selectedTime || !patientName) {

      alert("لطفا اطلاعات را کامل کنید");
      return;

    }

    try {

      setLoading(true);

      await createAppointment({
        doctorId: doctorId,
        doctorName: doctorName,
        patientName: patientName,
        date: new Date().toISOString(),
        time: selectedTime
      });

      setSuccess(true);

    } catch (error) {

      console.error(error);

      alert("خطا در ثبت نوبت");

    } finally {

      setLoading(false);

    }

  }

  if (success) {

    return (
      <div className="p-6 bg-green-50 rounded-xl text-green-700">
        ✅ نوبت شما با موفقیت ثبت شد
      </div>
    );

  }

  return (

    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >

      <h3 className="text-lg font-bold">
        رزرو نوبت
      </h3>

      <div>

        <label className="block text-sm mb-1">
          نام بیمار
        </label>

        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="نام خود را وارد کنید"
        />

      </div>

      <div>

        <label className="block text-sm mb-1">
          انتخاب زمان
        </label>

        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >

          <option value="">
            انتخاب کنید
          </option>

          {availableTimes.map((time) => (

            <option key={time} value={time}>
              {time}
            </option>

          ))}

        </select>

      </div>

      <button
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >

        {loading ? "در حال ثبت..." : "ثبت نوبت"}

      </button>

    </form>

  );
}
