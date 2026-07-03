// src/pages/Patient/MyAppointments.tsx

import { useEffect, useState } from "react";
import { getMyAppointments, cancelAppointment } from "../../services/appointment";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  const load = async () => {
    const res = await getMyAppointments();
    setAppointments(res);
  };

  const handleCancel = async (id: number) => {
    await cancelAppointment(id);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>نوبت‌های من</h2>

      {appointments.length === 0 && <p>نوبت فعال ندارید.</p>}

      {appointments.map((ap: any) => (
        <div key={ap.id} style={{ border: "1px solid #ccc", padding: 15, marginTop: 10 }}>
          <p>پزشک: {ap.doctor_id}</p>
          <p>تاریخ: {ap.appointment_date}</p>
          <p>
            زمان: {ap.start_time} تا {ap.end_time}
          </p>

          {ap.status === "booked" && (
            <button
              onClick={() => handleCancel(ap.id)}
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
              }}
            >
              لغو نوبت
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
