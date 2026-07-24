import { rest } from 'msw';

export const handlers = [
  // دریافت پزشکان برتر
  rest.get('http://localhost:8000/api/doctors/top', (req, res, ctx) => {
    const limit = req.url.searchParams.get('limit') || '3';

    const doctors = [
      {
        id: 1,
        name: "دکتر علی محمدی",
        specialty_name: "قلب و عروق",
        rate: 4.9,
        reviews: 128,
        nextTime: "امروز ساعت ۱۸:۳۰",
        city: "تهران",
        image: "ع م",
        experience: "۱۵ سال سابقه",
        medicalCode: "۱۲۳۴۵۶",
        fee: 150000,
        insurance: ["تأمین اجتماعی", "بیمه سلامت"],
        visitType: "حضوری و آنلاین",
        province: "تهران",
        availableDates: ["1403/02/15", "1403/02/16", "1403/02/17"],
        education: ["دکترای پزشکی عمومی از دانشگاه تهران", "فوق تخصص قلب و عروق از دانشگاه علوم پزشکی شهید بهشتی"],
        languages: ["فارسی", "انگلیسی"]
      },
      {
        id: 2,
        name: "دکتر فاطمه کریمی",
        specialty_name: "پوست و مو",
        rate: 4.8,
        reviews: 94,
        nextTime: "فردا ساعت ۱۰:۰۰",
        city: "مشهد",
        image: "ف ک",
        experience: "۱۲ سال سابقه",
        medicalCode: "۳۴۵۶۷۸",
        fee: 180000,
        insurance: ["بیمه آسیا", "بیمه سلامت"],
        visitType: "حضوری",
        province: "خراسان رضوی",
        availableDates: ["1403/02/16", "1403/02/17"],
        education: ["دکترای پزشکی عمومی از دانشگاه مشهد", "فوق تخصص پوست و مو از دانشگاه علوم پزشکی تهران"],
        languages: ["فارسی"]
      },
      {
        id: 3,
        name: "دکتر رضا احمدی",
        specialty_name: "مغز و اعصاب",
        rate: 4.7,
        reviews: 76,
        nextTime: "شنبه ساعت ۱۶:۰۰",
        city: "اصفهان",
        image: "ر ا",
        experience: "۱۰ سال سابقه",
        medicalCode: "۵۶۷۸۹۰",
        fee: 200000,
        insurance: ["تأمین اجتماعی"],
        visitType: "آنلاین و حضوری",
        province: "اصفهان",
        availableDates: ["1403/02/17", "1403/02/18"],
        education: ["دکترای پزشکی عمومی از دانشگاه اصفهان", "فلوشیپ مغز و اعصاب از دانشگاه علوم پزشکی ایران"],
        languages: ["فارسی", "انگلیسی", "آلمانی"]
      }
    ];

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: doctors.slice(0, parseInt(limit)),
        message: "پزشکان برتر با موفقیت دریافت شدند"
      })
    );
  }),

  // دریافت تخصص‌ها
  rest.get('http://localhost:8000/api/specialties', (req, res, ctx) => {
    const specialties = [
      { id: 1, title: "قلب و عروق", icon: "❤️", doctors: 128 },
      { id: 2, title: "مغز و اعصاب", icon: "🧠", doctors: 96 },
      { id: 3, title: "ارتوپدی", icon: "🦴", doctors: 84 },
      { id: 4, title: "زنان و زایمان", icon: "👩‍⚕️", doctors: 142 },
      { id: 5, title: "کودکان", icon: "🧸", doctors: 73 },
      { id: 6, title: "پوست و مو", icon: "✨", doctors: 118 },
      { id: 7, title: "چشم پزشکی", icon: "👁️", doctors: 64 },
      { id: 8, title: "گوش، حلق و بینی", icon: "👂", doctors: 58 },
      { id: 9, title: "دندانپزشکی", icon: "🦷", doctors: 155 },
      { id: 10, title: "روانشناسی", icon: "🧩", doctors: 91 },
      { id: 11, title: "اورولوژی", icon: "🧪", doctors: 47 },
      { id: 12, title: "داخلی", icon: "🩺", doctors: 133 }
    ];

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: specialties,
        message: "تخصص‌ها با موفقیت دریافت شدند"
      })
    );
  }),

  // دریافت آمار
  rest.get('http://localhost:8000/api/stats/home', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          activeDoctors: 1200,
          totalPatients: 45000,
          totalAppointments: 80000,
          specialtiesCount: 40,
          satisfactionRate: 96
        },
        message: "آمار با موفقیت دریافت شد"
      })
    );
  }),

  // جستجوی پزشکان
  rest.get('http://localhost:8000/api/doctors/search', (req, res, ctx) => {
    const search = req.url.searchParams.get('search') || '';
    const specialty = req.url.searchParams.get('specialty') || '';

    // داده‌های نمونه منطبق با ساختار جدید دیتابیس داک‌تایم
    const allDoctors = [
      {
        id: 1,
        name: "دکتر علی محمدی",
        specialty_name: "قلب و عروق",
        rate: 4.9,
        reviews: 128,
        nextTime: "امروز ساعت ۱۸:۳۰",
        city: "تهران",
        image: "ع م",
        experience: "۱۵ سال سابقه",
        medicalCode: "۱۲۳۴۵۶",
        fee: 150000,
        insurance: ["تأمین اجتماعی", "بیمه سلامت"],
        visitType: "حضوری و آنلاین",
        province: "تهران",
        availableDates: ["1403/02/15", "1403/02/16", "1403/02/17"],
        education: ["دکترای پزشکی عمومی از دانشگاه تهران", "فوق تخصص قلب و عروق از دانشگاه علوم پزشکی شهید بهشتی"],
        languages: ["فارسی", "انگلیسی"]
      },
      {
        id: 2,
        name: "دکتر فاطمه کریمی",
        specialty_name: "پوست و مو",
        rate: 4.8,
        reviews: 94,
        nextTime: "فردا ساعت ۱۰:۰۰",
        city: "مشهد",
        image: "ف ک",
        experience: "۱۲ سال سابقه",
        medicalCode: "۳۴۵۶۷۸",
        fee: 180000,
        insurance: ["بیمه آسیا", "بیمه سلامت"],
        visitType: "حضوری",
        province: "خراسان رضوی",
        availableDates: ["1403/02/16", "1403/02/17"],
        education: ["دکترای پزشکی عمومی از دانشگاه مشهد", "فوق تخصص پوست و مو از دانشگاه علوم پزشکی تهران"],
        languages: ["فارسی"]
      },
      {
        id: 3,
        name: "دکتر رضا احمدی",
        specialty_name: "مغز و اعصاب",
        rate: 4.7,
        reviews: 76,
        nextTime: "شنبه ساعت ۱۶:۰۰",
        city: "اصفهان",
        image: "ر ا",
        experience: "۱۰ سال سابقه",
        medicalCode: "۵۶۷۸۹۰",
        fee: 200000,
        insurance: ["تأمین اجتماعی"],
        visitType: "آنلاین و حضوری",
        province: "اصفهان",
        availableDates: ["1403/02/17", "1403/02/18"],
        education: ["دکترای پزشکی عمومی از دانشگاه اصفهان", "فلوشیپ مغز و اعصاب از دانشگاه علوم پزشکی ایران"],
        languages: ["فارسی", "انگلیسی", "آلمانی"]
      }
    ];

    let filteredDoctors = allDoctors;

    // فیلتر بر اساس جستجو
    if (search) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.name.includes(search) ||
        (doctor.specialty_name && doctor.specialty_name.includes(search)) ||
        doctor.city.includes(search)
      );
    }

    // فیلتر بر اساس تخصص
    if (specialty) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.specialty_name && doctor.specialty_name.includes(specialty)
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: filteredDoctors,
        total: filteredDoctors.length,
        page: 1,
        limit: 10,
        message: "جستجو با موفقیت انجام شد"
      })
    );
  }),

  // دریافت یک پزشک خاص
  rest.get('http://localhost:8000/api/doctors/:id', (req, res, ctx) => {
    const { id } = req.params;

    const doctors = [
      {
        id: 1,
        name: "دکتر علی محمدی",
        specialty_name: "قلب و عروق",
        rate: 4.9,
        reviews: 128,
        nextTime: "امروز ساعت ۱۸:۳۰",
        city: "تهران",
        image: "ع م",
        experience: "۱۵ سال سابقه",
        medicalCode: "۱۲۳۴۵۶",
        fee: 150000,
        insurance: ["تأمین اجتماعی", "بیمه سلامت"],
        visitType: "حضوری و آنلاین",
        province: "تهران",
        availableDates: ["1403/02/15", "1403/02/16", "1403/02/17"],
        education: ["دکترای پزشکی عمومی از دانشگاه تهران", "فوق تخصص قلب و عروق از دانشگاه علوم پزشکی شهید بهشتی"],
        languages: ["فارسی", "انگلیسی"]
      },
      {
        id: 2,
        name: "دکتر فاطمه کریمی",
        specialty_name: "پوست و مو",
        rate: 4.8,
        reviews: 94,
        nextTime: "فردا ساعت ۱۰:۰۰",
        city: "مشهد",
        image: "ف ک",
        experience: "۱۲ سال سابقه",
        medicalCode: "۳۴۵۶۷۸",
        fee: 180000,
        insurance: ["بیمه آسیا", "بیمه سلامت"],
        visitType: "حضوری",
        province: "خراسان رضوی",
        availableDates: ["1403/02/16", "1403/02/17"],
        education: ["دکترای پزشکی عمومی از دانشگاه مشهد", "فوق تخصص پوست و مو از دانشگاه علوم پزشکی تهران"],
        languages: ["فارسی"]
      },
      {
        id: 3,
        name: "دکتر رضا احمدی",
        specialty_name: "مغز و اعصاب",
        rate: 4.7,
        reviews: 76,
        nextTime: "شنبه ساعت ۱۶:۰۰",
        city: "اصفهان",
        image: "ر ا",
        experience: "۱۰ سال سابقه",
        medicalCode: "۵۶۷۸۹۰",
        fee: 200000,
        insurance: ["تأمین اجتماعی"],
        visitType: "آنلاین و حضوری",
        province: "اصفهان",
        availableDates: ["1403/02/17", "1403/02/18"],
        education: ["دکترای پزشکی عمومی از دانشگاه اصفهان", "فلوشیپ مغز و اعصاب از دانشگاه علوم پزشکی ایران"],
        languages: ["فارسی", "انگلیسی", "آلمانی"]
      }
    ];

    const doctor = doctors.find(d => d.id === parseInt(id));

    if (doctor) {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: doctor,
          message: "پزشک با موفقیت دریافت شد"
        })
      );
    } else {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          data: null,
          message: "پزشک یافت نشد"
        })
      );
    }
  }),

  // لاگین
  rest.post('http://localhost:8000/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();

    if (email === "test@example.com" && password === "123456") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            token: "mock-jwt-token-123456",
            user: {
              id: 1,
              name: "کاربر تست",
              email: "test@example.com",
              phone: "09123456789"
            }
          },
          message: "ورود موفقیت‌آمیز بود"
        })
      );
    } else {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          data: null,
          message: "ایمیل یا رمز عبور اشتباه است"
        })
      );
    }
  }),

  // دریافت اطلاعات کاربر
  rest.get('http://localhost:8000/api/auth/me', (req, res, ctx) => {
    const token = req.headers.get('Authorization');

    if (token === "Bearer mock-jwt-token-123456") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            id: 1,
            name: "کاربر تست",
            email: "test@example.com",
            phone: "09123456789",
            avatar: "👤"
          },
          message: "اطلاعات کاربر دریافت شد"
        })
      );
    } else {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          data: null,
          message: "توکن معتبر نیست"
        })
      );
    }
  })
];
