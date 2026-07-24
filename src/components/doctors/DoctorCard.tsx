import { Link } from "react-router-dom"

type Doctor = {
  id: number
  name: string
  specialty_name: string | null
  city: string
  rating: number
  nextAvailable?: string
}

export default function DoctorCard({
  doctor,
}: {
  doctor: Doctor
}) {
  if (!doctor.specialty_name || !doctor.specialty_name.trim()) {
    console.error("DoctorCard received invalid specialty_name:", doctor)

    return (
      <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
            {doctor.name.charAt(0)}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
            <p className="text-red-600 text-sm font-medium">
              خطای داده: تخصص پزشک ثبت نشده است
            </p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-gray-500 text-sm">📍 {doctor.city}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-yellow-500 font-semibold">⭐ {doctor.rating}</span>
          <span className="text-sm text-green-600 font-medium">
            {doctor.nextAvailable || "امروز نوبت دارد"}
          </span>
        </div>

        <Link
          to={`/doctor/${doctor.id}`}
          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition"
        >
          بررسی پروفایل
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
          {doctor.name.charAt(0)}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>

          <p className="text-blue-600 text-sm font-medium">
            {doctor.specialty_name}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-gray-500 text-sm">📍 {doctor.city}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-yellow-500 font-semibold">⭐ {doctor.rating}</span>

        <span className="text-sm text-green-600 font-medium">
          {doctor.nextAvailable || "امروز نوبت دارد"}
        </span>
      </div>

      <Link
        to={`/doctor/${doctor.id}`}
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition"
      >
        مشاهده پروفایل
      </Link>
    </div>
  )
}
