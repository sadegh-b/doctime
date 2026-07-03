import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: {
      name: string;
      phone: string;
      password: string;
      email?: string;
    } = {
      name: name.trim(),
      phone: phone.trim(),
      password,
    };

    if (email.trim() !== "") {
      payload.email = email.trim();
    }

    console.log(
      "REGISTER PAYLOAD =>",
      JSON.stringify(payload, null, 2)
    );

    try {
      setLoading(true);

      await register(payload);

      alert("ثبت‌نام با موفقیت انجام شد");
      navigate("/login");
    } catch (error: any) {
      console.error("REGISTER ERROR =>", error);

      const backendData = error?.response?.data;

      console.log(
        "BACKEND RESPONSE =>",
        JSON.stringify(backendData, null, 2)
      );

      const message =
        backendData?.detail ||
        "ثبت‌نام ناموفق بود. لطفاً دوباره تلاش کنید.";

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">ثبت‌نام</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="نام و نام خانوادگی"
          className="border p-2 w-full mb-4 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          autoComplete="name"
        />

        <input
          type="tel"
          placeholder="شماره موبایل"
          className="border p-2 w-full mb-4 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          pattern="09[0-9]{9}"
          autoComplete="tel"
        />

        <input
          type="text"
          placeholder="ایمیل (اختیاری)"
          className="border p-2 w-full mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="رمز عبور"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        حساب دارید؟{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          ورود
        </Link>
      </p>
    </div>
  );
}
