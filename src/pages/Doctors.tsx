import React, { useState, useEffect } from 'react';
import { specialties } from '../data/specialties';
import { provinces } from '../data/provinces';

// داده‌های نمونه پزشکان (می‌تونی بعداً ببری تو یه فایل جدا)
const doctors = [
  {
    id: 1,
    name: 'دکتر مریم احمدی',
    specialty: 'متخصص قلب و عروق',
    city: 'تهران',
    province: 'تهران',
    rating: 4.9,
    image: '👩‍⚕️',
    available: true,
  },
  {
    id: 2,
    name: 'دکتر علی رضایی',
    specialty: 'متخصص مغز و اعصاب',
    city: 'مشهد',
    province: 'خراسان رضوی',
    rating: 4.7,
    image: '👨‍⚕️',
    available: true,
  },
  {
    id: 3,
    name: 'دکتر سارا محمدی',
    specialty: 'متخصص زنان و زایمان',
    city: 'اصفهان',
    province: 'اصفهان',
    rating: 4.8,
    image: '👩‍⚕️',
    available: false,
  },
  {
    id: 4,
    name: 'دکتر حسین کریمی',
    specialty: 'متخصص اطفال',
    city: 'شیراز',
    province: 'فارس',
    rating: 4.6,
    image: '👨‍⚕️',
    available: true,
  },
  {
    id: 5,
    name: 'دکتر فاطمه جعفری',
    specialty: 'متخصص پوست و مو',
    city: 'تبریز',
    province: 'آذربایجان شرقی',
    rating: 4.9,
    image: '👩‍⚕️',
    available: true,
  },
  {
    id: 6,
    name: 'دکتر محسن نظری',
    specialty: 'متخصص ارتوپدی',
    city: 'کرج',
    province: 'البرز',
    rating: 4.5,
    image: '👨‍⚕️',
    available: true,
  },
];

const Doctors = () => {
  // stateهای فیلتر
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filteredDoctors, setFilteredDoctors] = useState(doctors);

  // وقتی استان تغییر کرد، شهر رو خالی کن
  useEffect(() => {
    setSelectedCity('');
  }, [selectedProvince]);

  // اعمال فیلتر (هم با کلیک دکمه و هم می‌تونیم خودکار انجام بدیم)
  const handleFilter = () => {
    let result = doctors;

    if (selectedSpecialty) {
      result = result.filter((doc) => doc.specialty === selectedSpecialty);
    }

    if (selectedProvince) {
      result = result.filter((doc) => doc.province === selectedProvince);
      if (selectedCity) {
        result = result.filter((doc) => doc.city === selectedCity);
      }
    }

    setFilteredDoctors(result);
  };

  // آرایه شهرهای استان انتخاب‌شده
  const cities = provinces.find((p) => p.name === selectedProvince)?.cities || [];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20, textAlign: 'right' }} dir="rtl">
      <h1>پزشکان متخصص</h1>

      {/* بخش فیلترها */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30, flexWrap: 'wrap' }}>
        <div>
          <label>تخصص:</label><br />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            style={{ padding: 8, width: 200 }}
          >
            <option value="">همه تخصص‌ها</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label>استان:</label><br />
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            style={{ padding: 8, width: 200 }}
          >
            <option value="">همه استان‌ها</option>
            {provinces.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProvince && (
          <div>
            <label>شهر:</label><br />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: 8, width: 200 }}
            >
              <option value="">همه شهرها</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={handleFilter} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            اعمال فیلتر
          </button>
        </div>
      </div>

      {/* لیست پزشکان */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {filteredDoctors.length === 0 ? (
          <p>هیچ پزشکی با این مشخصات پیدا نشد.</p>
        ) : (
          filteredDoctors.map((doc) => (
            <div key={doc.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 48 }}>{doc.image}</div>
              <h3>{doc.name}</h3>
              <p style={{ color: '#666' }}>{doc.specialty}</p>
              <p>شهر: {doc.city} | استان: {doc.province}</p>
              <p>⭐ {doc.rating} | {doc.available ? '🟢 پذیرش دارد' : '🔴 تکمیل ظرفیت'}</p>
              <button style={{ padding: '8px 16px', marginTop: 10 }}>رزرو نوبت</button>
            </div>
          ))
        )}
      </div>

      {/* pagination ساده (اختیاری) */}
      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center', gap: 10 }}>
        <button>۱</button>
        <button>۲</button>
        <button>۳</button>
        <button>→</button>
      </div>
    </div>
  );
};

export default Doctors;
