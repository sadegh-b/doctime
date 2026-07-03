import { Link } from "react-router-dom";
import type { Doctor } from "../services/doctors";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {

  return (
    <article className="rounded-2xl bg-white border p-6 shadow-sm hover:shadow-lg transition">

      <div className="flex items-center gap-4">

        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div>

          <h3 className="font-bold text-lg">
            {doctor.name}
          </h3>

          <p className="text-blue-600 text-sm">
            {doctor.specialty}
          </p>

          <p className="text-gray-500 text-sm">
            📍 {doctor.city}
          </p>

        </div>

      </div>

      <div className="mt-4 text-sm text-gray-600">

        ⭐ امتیاز: {doctor.rating}

      </div>

      <div className="mt-2 text-green-600 text-sm">

        🕒 {doctor.nextAvailable}

      </div>

      <Link
        to={`/doctors/${doctor.id}`}
        className="mt-5 block text-center bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
      >
        مشاهده پروفایل
      </Link>

    </article>
  );
}
