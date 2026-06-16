const Dashboard = () => {
  const appointments = [
    { id: 1, doctor: 'دکتر مریم احمدی', specialty: 'قلب و عروق', date: '۱۴۰۵/۰۴/۱۵', time: '۱۰:۳۰', status: 'تأیید شده' },
    { id: 2, doctor: 'دکتر علی رضایی', specialty: 'مغز و اعصاب', date: '۱۴۰۵/۰۴/۲۰', time: '۱۶:۰۰', status: 'در انتظار' },
    { id: 3, doctor: 'دکتر سارا محمدی', specialty: 'زنان و زایمان', date: '۱۴۰۵/۰۳/۲۸', time: '۰۹:۰۰', status: 'انجام شده' },
  ]

  return (
    <div className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* هدر داشبورد */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">داشبورد من</h1>
            <p className="text-gray-600 mt-1">خوش اومدی صادق جان! 👋</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition shadow">
            + نوبت جدید
          </button>
        </div>

        {/* کارت‌های آمار */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600">۳</div>
            <div className="text-gray-600 text-sm mt-1">نوبت‌های من</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600">۱</div>
            <div className="text-gray-600 text-sm mt-1">نوبت فعال</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-yellow-600">۱</div>
            <div className="text-gray-600 text-sm mt-1">در انتظار</div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 text-center">
            <div className="text-3xl font-bold text-gray-600">۱</div>
            <div className="text-gray-600 text-sm mt-1">انجام شده</div>
          </div>
        </div>

        {/* جدول نوبت‌ها */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">نوبت‌های اخیر</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-6 py-3 text-gray-600 font-semibold">پزشک</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-semibold">تخصص</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-semibold">تاریخ</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-semibold">ساعت</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-semibold">وضعیت</th>
                  <th className="text-right px-6 py-3 text-gray-600 font-semibold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{app.doctor}</td>
                    <td className="px-6 py-4 text-gray-600">{app.specialty}</td>
                    <td className="px-6 py-4 text-gray-600">{app.date}</td>
                    <td className="px-6 py-4 text-gray-600">{app.time}</td>
                    <td className="px-6 py-4">
                      {app.status === 'تأیید شده' && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          ✅ {app.status}
                        </span>
                      )}
                      {app.status === 'در انتظار' && (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          ⏳ {app.status}
                        </span>
                      )}
                      {app.status === 'انجام شده' && (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ {app.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline font-medium text-sm">
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
