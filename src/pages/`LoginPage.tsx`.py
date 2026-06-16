@"
const LoginPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-right" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ورود به حساب کاربری</h1>
      <form className="max-w-md space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">ایمیل</label>
          <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="example@email.com" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">رمز عبور</label>
          <input type="password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          ورود
        </button>
      </form>
    </div>
  )
}
export default LoginPage
"@ | Set-Content -Path "C:\PythonProject\PythonProject\doctime-frontend\src\pages\LoginPage.tsx" -Encoding UTF8
