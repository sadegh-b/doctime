import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/user";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  async function loadData() {
    const data = await getProfile();
    setProfile(data);
    setFullName(data.full_name || "");
    setEmail(data.email || "");
  }

  async function saveChanges() {
    const updated = await updateProfile({
      full_name: fullName,
      email: email,
    });

    setProfile(updated);
    alert("اطلاعات با موفقیت ذخیره شد");
  }

  useEffect(() => {
    loadData();
  }, []);

  if (!profile) return <div className="p-10">در حال بارگذاری...</div>;

  return (
    <div className="p-10 max-w-xl mx-auto" dir="rtl">
      <h1 className="text-xl font-bold mb-6">پروفایل</h1>

      <div className="mb-4">
        <label>نام و نام خانوادگی</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label>ایمیل</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        onClick={saveChanges}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        ذخیره تغییرات
      </button>
    </div>
  );
}
