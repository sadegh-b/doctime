import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      await login(phone, password);
      navigate("/");
    } catch (error) {
      alert("شماره موبایل یا رمز عبور اشتباه است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center mt-20" dir="rtl">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-xl shadow w-96"
      >
        <h1 className="text-xl font-bold mb-6 text-center">
          ورود
        </h1>

        <input
          type="text"
          placeholder="شماره موبایل"
          className="border p-2 w-full mb-4 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="رمز عبور"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded disabled:opacity-60"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>

        <p className="text-center mt-6 text-sm">
          حساب ندارید؟{" "}
          <Link to="/register" className="text-blue-600 font-semibold">
            ثبت نام
          </Link>
        </p>
      </form>
    </div>
  );
}
