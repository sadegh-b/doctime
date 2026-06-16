import { useState } from 'react'

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('رمز عبور با تکرارش مطابقت نداره!')
      return
    }
    console.log('Register data:', formData)
    // بعداً با axios به بک‌اند وصل میشه
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* هدر */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ثبت‌نام در DocTime</h1>
            <p className="text-gray-600">همین حالا عضو شو و از خدمات استفاده کن</p>
          </div>

          {/* فرم */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="firstName">
                  نام
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="علی"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="lastName">
                  نام خانوادگی
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="رضایی"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
                ایمیل
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="phone">
                شماره موبایل
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
                رمز عبور
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="حداقل ۸ کاراکتر"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="confirmPassword">
                تکرار رمز عبور
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" className="rounded border-gray-300" required id="terms" />
              <label htmlFor="terms">
                با{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  شرایط و قوانین
                </a>{' '}
                DocTime موافقم
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg cursor-pointer"
            >
              ثبت‌نام
            </button>
          </form>

          {/* لینک ورود */}
          <div className="mt-6 text-center text-gray-600">
            قبلاً عضو شدی؟{' '}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              وارد شو
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
