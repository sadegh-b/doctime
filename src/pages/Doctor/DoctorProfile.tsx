// src/pages/Doctor/DoctorProfile.tsx

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Edit2,
  MapPin,
  Stethoscope,
  User,
} from "lucide-react";

import {
  getMyProfile,
  updateMyProfile,
} from "../../services/profile";
import type {
  UpdateProfilePayload,
} from "../../services/profile";

export default function DoctorProfile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["doctor-profile-detail"],
    queryFn: getMyProfile,
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.name ?? "");
    setSpecialty(profile.specialty ?? "");
    setCity(profile.city ?? "");
    setAddress(profile.address ?? "");
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["doctor-profile-detail"],
      });

      setIsEditing(false);
    },

    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    detail?: string;
                  };
                };
              }
            ).response?.data?.detail
          : undefined;

      alert(message ?? "خطا در بروزرسانی اطلاعات رخ داد.");
    },
  });

  const handleCancel = () => {
    if (!profile) {
      return;
    }

    setName(profile.name ?? "");
    setSpecialty(profile.specialty ?? "");
    setCity(profile.city ?? "");
    setAddress(profile.address ?? "");
    setIsEditing(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updateData: UpdateProfilePayload = {
      name: name.trim(),
      specialty: specialty.trim() || undefined,
      city: city.trim() || undefined,
      address: address.trim() || undefined,
    };

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />

          <p className="font-bold text-slate-600">
            در حال دریافت اطلاعات پروفایل...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div
        className="flex min-h-[60vh] items-center justify-center"
        dir="rtl"
      >
        <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-black text-red-600">
            دریافت اطلاعات پروفایل با خطا مواجه شد.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 rounded-xl bg-cyan-600 px-6 py-2 font-bold text-white transition-colors hover:bg-cyan-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f8fafc] py-8"
      dir="rtl"
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/20 bg-white/10 text-3xl font-black">
                {profile.name?.[0] ?? "D"}
              </div>

              <div>
                <h1 className="text-2xl font-black">
                  {profile.name || "پزشک گرامی"}
                </h1>

                <p className="mt-2 text-sm text-cyan-200">
                  {profile.specialty || "تخصص ثبت نشده"}
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 self-start rounded-2xl border border-cyan-500/30 bg-cyan-600/30 px-5 py-3 text-sm font-bold text-cyan-400 transition-all duration-200 hover:bg-cyan-600/50 sm:self-center"
              >
                <Edit2 className="h-4 w-4" />
                ویرایش پروفایل
              </button>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {isEditing
                ? "ویرایش مشخصات و اطلاعات مطب"
                : "مشخصات و اطلاعات مطب"}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <User className="h-5 w-5" />
              </div>

              <div className="w-full">
                <label
                  htmlFor="doctor-name"
                  className="mb-1 block text-[10px] font-black uppercase text-slate-400"
                >
                  نام و نام خانوادگی
                </label>

                {isEditing ? (
                  <input
                    id="doctor-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    required
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700">
                    {profile.name || "ثبت نشده"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Stethoscope className="h-5 w-5" />
              </div>

              <div className="w-full">
                <label
                  htmlFor="doctor-specialty"
                  className="mb-1 block text-[10px] font-black uppercase text-slate-400"
                >
                  تخصص
                </label>

                {isEditing ? (
                  <input
                    id="doctor-specialty"
                    type="text"
                    value={specialty}
                    onChange={(event) =>
                      setSpecialty(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="مثال: زنان و زایمان"
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700">
                    {profile.specialty || "ثبت نشده"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="w-full">
                <label
                  htmlFor="doctor-city"
                  className="mb-1 block text-[10px] font-black uppercase text-slate-400"
                >
                  شهر
                </label>

                {isEditing ? (
                  <input
                    id="doctor-city"
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="مثال: زاهدان"
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold text-slate-700">
                    {profile.city || "ثبت نشده"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPin className="h-5 w-5" />
              </div>

              <div className="w-full">
                <label
                  htmlFor="doctor-address"
                  className="mb-1 block text-[10px] font-black uppercase text-slate-400"
                >
                  آدرس مطب
                </label>

                {isEditing ? (
                  <textarea
                    id="doctor-address"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    rows={3}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-cyan-500 focus:outline-none"
                    placeholder="آدرس دقیق مطب را وارد کنید"
                  />
                ) : (
                  <div className="mt-1 text-sm font-bold leading-6 text-slate-700">
                    {profile.address || "ثبت نشده"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 disabled:opacity-50"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={
                  updateMutation.isPending || name.trim().length === 0
                }
                className="rounded-2xl bg-cyan-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending
                  ? "در حال ذخیره تغییرات..."
                  : "ذخیره تغییرات"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
