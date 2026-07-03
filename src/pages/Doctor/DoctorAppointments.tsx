// مسیر: src/pages/Doctor/DoctorAppointments.tsx

import { useEffect, useState, useCallback } from "react";
import { getDoctorAppointments } from "../../services/appointment";

interface Appointment {
  id: number;
  user_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function DoctorAppointments({ doctorId }: { doctorId: number }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await getDoctorAppointments(doctorId);
      setAppointments(res);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت نوبت‌ها");
    }
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ padding: 20 }}>
      <h2>نوبت‌های رزرو شده</h2>

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {appointments.length === 0 && !error && (
        <p style={{ marginTop: 15 }}>هیچ نوبتی یافت نشد.</p>
      )}

      {appointments.map((ap) => (
        <div
          key={ap.id}
          style={{ border: "1px solid #ddd", padding: 15, marginTop: 15 }}
        >
          <p>بیمار: {ap.user_id}</p>
          <p>تاریخ: {ap.appointment_date}</p>
          <p>
            زمان: {ap.start_time} تا {ap.end_time}
          </p>
          <p>وضعیت: {ap.status}</p>
        </div>
      ))}
    </div>
  );
}
