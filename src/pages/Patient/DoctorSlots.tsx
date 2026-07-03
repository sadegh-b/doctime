// src/pages/Patient/DoctorSlots.tsx

import { useEffect, useState } from "react";
import { getAvailableSlots } from "../../services/availability";
import { bookAppointment } from "../../services/appointment";

export default function DoctorSlots({ doctorId }: { doctorId: number }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    try {
      const res = await getAvailableSlots(doctorId);
      setSlots(res.items);
    } catch (err) {
      console.error("Error fetching slots", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId: number) => {
    try {
      await bookAppointment(slotId);
      alert("نوبت با موفقیت رزرو شد!");
      fetchSlots(); // reload slots
    } catch (err) {
      alert("خطا در رزرو نوبت");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>نوبت‌های پزشک</h2>

      {slots.length === 0 && <p>هیچ نوبتی موجود نیست.</p>}

      {slots.map((slot: any) => (
        <div
          key={slot.id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          <p>تاریخ: {slot.slot_date}</p>
          <p>
            زمان: {slot.slot_start_time} تا {slot.slot_end_time}
          </p>

          <button
            onClick={() => handleBook(slot.id)}
            style={{
              backgroundColor: "green",
              color: "white",
              padding: "8px 18px",
              borderRadius: 6,
            }}
          >
            رزرو نوبت
          </button>
        </div>
      ))}
    </div>
  );
}
