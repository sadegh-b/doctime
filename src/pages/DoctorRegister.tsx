// Path: src/pages/DoctorRegister.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestRegisterOtp, getError } from "../services/auth";

const DoctorRegister: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    password: "",
    medical_council_number: "",
    specialty_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestRegisterOtp(formData.phone);

      // داده‌ها را به صفحه تایید می‌فرستیم
      navigate("/verify-otp", {
        state: {
          userData: {
            ...formData,
            role: "doctor",
            specialty_id: parseInt(formData.specialty_id)
          }
        }
      });
    } catch (error: unknown) {
      alert(getError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">ثبت‌نام پزشک</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="نام و نام خانوادگی"
            required
            className="w-full border rounded-xl px-4 py-2"
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="شماره موبایل"
            required
            className="w-full border rounded-xl px-4 py-2 text-left"
            onChange={handleChange}
          />
          <input
            name="medical_council_number"
            placeholder="شماره نظام پزشکی"
            required
            className="w-full border rounded-xl px-4 py-2 text-left"
            onChange={handleChange}
          />
          <select
            name="specialty_id"
            required
            className="w-full border rounded-xl px-4 py-2"
            onChange={handleChange}
          >
            <option value="">انتخاب تخصص</option>
            <option value="1">قلب و عروق</option>
            <option value="2">داخلی</option>
          </select>
          <input
            name="password"
            type="password"
            placeholder="رمز عبور"
            required
            className="w-full border rounded-xl px-4 py-2"
            onChange={handleChange}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white rounded-xl py-3 font-semibold transition-colors disabled:bg-gray-400"
          >
            {loading ? "در حال ارسال..." : "مرحله بعد (تایید موبایل)"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegister;
