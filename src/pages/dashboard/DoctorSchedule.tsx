// src/pages/dashboard/DoctorSchedule.tsx
import { useState } from "react";
import { createDoctorSchedule } from "../../services/schedules";

export default function DoctorSchedule() {
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  async function addSlot() {
    if (!day || !time) {
      alert("روز و ساعت را وارد کنید");
      return;
    }

    try {
      setLoading(true);

      await createDoctorSchedule({
        doctorId: 1,
        day,
        slots: [time],
      });

      alert("زمان با موفقیت اضافه شد");
      setTime("");
    } catch (error) {
      console.error(error);
      alert("خطا در ثبت زمان");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-2xl font-black">تنظیم ساعات کاری</h1>

      <div className="flex flex-col gap-4 md:flex-row">
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="rounded border px-4 py-2"
        />

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="rounded border px-4 py-2"
        />

        <button
          onClick={addSlot}
          disabled={loading}
          className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-60"
        >
          {loading ? "در حال ثبت..." : "افزودن"}
        </button>
      </div>
    </div>
  );
}