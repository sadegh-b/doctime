type Doctor = {
  id: number
  name: string
  specialty: string
  city: string
  rating: number
  nextAvailable?: string
}

export default function DoctorCard({
  doctor,
}: {
  doctor: Doctor
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">

        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
          {doctor.name.charAt(0)}
        </div>

        {/* Doctor Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {doctor.name}
          </h3>

          <p className="text-blue-600 text-sm font-medium">
            {doctor.specialty}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="mb-3">
        <p className="text-gray-500 text-sm">
          📍 {doctor.city}
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-yellow-500 font-semibold">
          ⭐ {doctor.rating}
        </span>

        <span className="text-sm text-green-600 font-medium">
          {doctor.nextAvailable || "امروز نوبت دارد"}
        </span>
      </div>

      {/* CTA */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition">
        مشاهده پروفایل
      </button>
    </div>
  )
}
