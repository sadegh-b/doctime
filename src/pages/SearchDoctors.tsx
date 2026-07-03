import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import { searchDoctors } from "../services/searchDoctors";
import type { Doctor } from "../services/doctors";

export default function SearchDoctors() {

  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  const name = searchParams.get("name") || "";
  const specialty = searchParams.get("specialty") || "";
  const city = searchParams.get("city") || "";

  async function handleSearch() {

    setLoading(true);

    try {

      const result = await searchDoctors({
        name,
        specialty,
        city
      });

      setDoctors(result.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  }

  useEffect(() => {

    handleSearch();

  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">

      <div className="max-w-6xl mx-auto px-4 space-y-8">

        <h1 className="text-3xl font-bold text-center">
          جستجوی پزشکان
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm grid md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="نام پزشک"
            value={name}
            onChange={(e) =>
              setSearchParams({
                name: e.target.value,
                specialty,
                city
              })
            }
            className="border rounded-xl px-4 py-2"
          />

          <input
            type="text"
            placeholder="تخصص"
            value={specialty}
            onChange={(e) =>
              setSearchParams({
                name,
                specialty: e.target.value,
                city
              })
            }
            className="border rounded-xl px-4 py-2"
          />

          <input
            type="text"
            placeholder="شهر"
            value={city}
            onChange={(e) =>
              setSearchParams({
                name,
                specialty,
                city: e.target.value
              })
            }
            className="border rounded-xl px-4 py-2"
          />

        </div>

        {loading ? (

          <p className="text-center">در حال جستجو...</p>

        ) : doctors.length === 0 ? (

          <p className="text-center text-gray-500">
            پزشکی یافت نشد
          </p>

        ) : (

          <div className="grid gap-6">

            {doctors.map((doctor) => (

              <DoctorCard
                key={doctor.id}
                doctor={doctor}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  );
}
