const Home = () => {
  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            نوبت‌دهی آنلاین پزشکان <span className="text-blue-600">DocTime</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            به راحتی پزشک مورد نظر خود را پیدا کنید، نوبت بگیرید و در زمان مقرر به مطب مراجعه کنید.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/doctors"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition"
            >
              مشاهده پزشکان
            </a>
            <a
              href="/register"
              className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-xl shadow transition"
            >
              ثبت‌نام رایگان
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">جستجوی هوشمند</h3>
            <p className="text-gray-600">پزشک مورد نظر خود را بر اساس تخصص، شهر و بیمه پیدا کنید.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">رزرو آنی</h3>
            <p className="text-gray-600">در کمتر از یک دقیقه نوبت خود را رزرو کنید و تاییدیه دریافت کنید.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">یادآوری هوشمند</h3>
            <p className="text-gray-600">یادآوری نوبت از طریق پیامک و اعلان در موبایل.</p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">آمار DocTime</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold text-blue-600">۵۰۰+</div>
              <div className="text-gray-600">پزشک فعال</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">۱۰۰۰۰+</div>
              <div className="text-gray-600">نوبت رزرو شده</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">۹۸٪</div>
              <div className="text-gray-600">رضایت کاربران</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">۲۴/۷</div>
              <div className="text-gray-600">پشتیبانی</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
