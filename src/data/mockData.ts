// src/data/mockData.ts

export type Center = {
  id: number;
  name: string;
  city: string;
  address: string;
  rating: number;
};

export type Specialty = {
  id: string;
  title: string;
  icon: string;
  doctorCount: number;
  description: string;
  gradient: string;
};

export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  image: string;
  nextAvailable: string;
  slots: string[];
  about: string;
  experience: string;
  patients: number;
  clinic: string;
  isOnlineBookable: boolean;
  isTopDoctor?: boolean;
};

export type Testimonial = {
  id: number;
  user: string;
  rate: string;
  text: string;
  doctor: string;
};

export type Article = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
};

export type HomeStat = {
  id: string;
  value: string;
  label: string;
  description: string;
};

// تصاویر پیش‌فرض SVG کدگذاری‌شده (بدون نیاز به اینترنت)
const DEFAULT_DOCTOR_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
const DEFAULT_ARTICLE_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e2e8f0'><rect width='24' height='24' rx='2' fill='%23cbd5e1'/><path d='M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 12H5v-2h5v2zm0-4H5v-2h5v2zm0-4H5V7h5v2zm9 8h-7V7h7v10z' fill='%2394a3b8'/></svg>";

export const centers: Center[] = [
  {
    id: 1,
    name: "بیمارستان عرفان",
    city: "تهران",
    address: "سعادت‌آباد، بلوار دریا",
    rating: 4.6,
  },
  {
    id: 2,
    name: "بیمارستان پارسیان",
    city: "تهران",
    address: "سعادت‌آباد، میدان کاج",
    rating: 4.5,
  },
  {
    id: 3,
    name: "کلینیک دی",
    city: "تهران",
    address: "خیابان ولیعصر، بالاتر از پارک‌وی",
    rating: 4.3,
  },
  {
    id: 4,
    name: "کلینیک نور",
    city: "تهران",
    address: "ونک، خیابان ملاصدرا",
    rating: 4.4,
  },
];

export const SPECIALTIES: Specialty[] = [
  {
    id: "cardiology",
    title: "قلب و عروق",
    icon: "🫀",
    doctorCount: 124,
    description: "ویزیت، نوار قلب، اکو و پیگیری بیماری‌های قلبی",
    gradient: "from-rose-500/15 via-rose-50 to-white",
  },
  {
    id: "dentistry",
    title: "دندانپزشکی",
    icon: "🦷",
    doctorCount: 98,
    description: "ترمیم، عصب‌کشی، جرم‌گیری و درمان‌های زیبایی",
    gradient: "from-amber-500/15 via-amber-50 to-white",
  },
  {
    id: "dermatology",
    title: "پوست و مو",
    icon: "🧴",
    doctorCount: 86,
    description: "درمان ریزش مو، آکنه، لک و خدمات پوست",
    gradient: "from-fuchsia-500/15 via-fuchsia-50 to-white",
  },
  {
    id: "neurology",
    title: "مغز و اعصاب",
    icon: "🧠",
    doctorCount: 64,
    description: "سردرد، میگرن، صرع و بیماری‌های عصبی",
    gradient: "from-violet-500/15 via-violet-50 to-white",
  },
  {
    id: "pediatrics",
    title: "کودکان",
    icon: "👶",
    doctorCount: 72,
    description: "ویزیت کودکان، رشد، تغذیه و بیماری‌های شایع",
    gradient: "from-sky-500/15 via-sky-50 to-white",
  },
  {
    id: "orthopedics",
    title: "ارتوپدی",
    icon: "🦴",
    doctorCount: 59,
    description: "درد مفاصل، آسیب‌های ورزشی و مشکلات استخوان",
    gradient: "from-emerald-500/15 via-emerald-50 to-white",
  },
];

export const doctors: Doctor[] = [
  {
    id: 1,
    name: "دکتر سارا نوری",
    specialty: "متخصص بیماری‌های داخلی",
    city: "شیراز",
    rating: 4.8,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "فردا ۱۰:۳۰",
    slots: ["فردا ۱۰:۳۰", "فردا ۱۱:۳۰", "فردا ۱۲:۰۰", "پس‌فردا ۱۵:۰۰"],
    about:
      "متخصص بیماری‌های داخلی با تمرکز بر دیابت، فشار خون و مشکلات غدد. تجربه درمان بیماران مزمن و پیگیری درمان طولانی‌مدت.",
    experience: "۱۰ سال سابقه",
    patients: 2300,
    clinic: "کلینیک نارون",
    isOnlineBookable: true,
    isTopDoctor: true,
  },
  {
    id: 2,
    name: "دکتر لیلا بهادرزاده",
    specialty: "فلوشیپ جراحی پستان",
    city: "یزد",
    rating: 3.8,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "امروز ۱۶:۰۰",
    slots: ["امروز ۱۶:۰۰", "امروز ۱۷:۰۰", "فردا ۰۹:۰۰"],
    about:
      "فلوشیپ جراحی پستان و عضو هیئت علمی دانشگاه علوم پزشکی با تمرکز بر درمان‌های تخصصی و پیگیری بعد از عمل.",
    experience: "۸ سال سابقه",
    patients: 1200,
    clinic: "مرکز تخصصی مهر",
    isOnlineBookable: true,
  },
  {
    id: 3,
    name: "دکتر علی احمدی",
    specialty: "متخصص قلب و عروق",
    city: "تهران",
    rating: 4.7,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "امروز ۱۸:۰۰",
    slots: ["امروز ۱۸:۰۰", "امروز ۱۹:۰۰", "فردا ۱۶:۰۰", "فردا ۱۷:۳۰"],
    about:
      "متخصص قلب و عروق، دارای بورد تخصصی و تجربه در درمان فشار خون، آریتمی و بیماری‌های عروق کرونر.",
    experience: "۱۲ سال سابقه",
    patients: 3100,
    clinic: "کلینیک قلب آریا",
    isOnlineBookable: true,
    isTopDoctor: true,
  },
  {
    id: 4,
    name: "دکتر محمد رضایی",
    specialty: "چشم‌پزشکی",
    city: "اصفهان",
    rating: 4.9,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "فردا ۰۹:۰۰",
    slots: ["فردا ۰۹:۰۰", "فردا ۱۰:۰۰", "پس‌فردا ۱۱:۳۰"],
    about:
      "متخصص چشم‌پزشکی و جراحی لیزیک، آب‌مروارید و بررسی بیماری‌های شبکیه با سابقه درمانی گسترده.",
    experience: "۱۴ سال سابقه",
    patients: 4100,
    clinic: "مرکز چشم سپهر",
    isOnlineBookable: true,
    isTopDoctor: true,
  },
  {
    id: 5,
    name: "دکتر نرگس کریمی",
    specialty: "روانپزشکی",
    city: "تهران",
    rating: 4.6,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "امروز ۲۰:۰۰",
    slots: ["امروز ۲۰:۰۰", "امروز ۲۱:۰۰", "فردا ۱۸:۰۰"],
    about:
      "روانپزشک و درمانگر اختلالات اضطرابی، افسردگی و اختلالات خواب با رویکرد درمان دارویی و پیگیری منظم.",
    experience: "۹ سال سابقه",
    patients: 1700,
    clinic: "مرکز سلامت روان آرام",
    isOnlineBookable: true,
  },
  {
    id: 6,
    name: "دکتر امیر حسینی",
    specialty: "ارتوپدی",
    city: "مشهد",
    rating: 4.5,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "فردا ۱۴:۰۰",
    slots: ["فردا ۱۴:۰۰", "فردا ۱۵:۳۰", "پس‌فردا ۱۰:۰۰"],
    about:
      "متخصص جراحی استخوان و مفاصل و درمان آسیب‌های ورزشی، درد زانو، کمر و شانه.",
    experience: "۱۱ سال سابقه",
    patients: 2600,
    clinic: "کلینیک ارتوپدی بهار",
    isOnlineBookable: true,
  },
  {
    id: 7,
    name: "دکتر الهام صادقی",
    specialty: "پوست و مو",
    city: "تبریز",
    rating: 4.4,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "امروز ۱۷:۳۰",
    slots: ["امروز ۱۷:۳۰", "امروز ۱۸:۳۰", "فردا ۱۲:۰۰"],
    about:
      "متخصص پوست، مو و زیبایی با تمرکز بر درمان آکنه، لک، ریزش مو و خدمات جوان‌سازی.",
    experience: "۷ سال سابقه",
    patients: 1450,
    clinic: "کلینیک پوست و موی آوینا",
    isOnlineBookable: true,
    isTopDoctor: true,
  },
  {
    id: 8,
    name: "دکتر رضا موسوی",
    specialty: "فوق تخصص گوارش و کبد",
    city: "کرج",
    rating: 4.3,
    image: DEFAULT_DOCTOR_IMAGE,
    nextAvailable: "فردا ۱۱:۰۰",
    slots: ["فردا ۱۱:۰۰", "فردا ۱۲:۰۰", "پس‌فردا ۱۵:۰۰"],
    about:
      "فوق تخصص گوارش، کبد و آندوسکوپی با تجربه درمان رفلاکس، زخم معده و بیماری‌های کبدی.",
    experience: "۱۳ سال سابقه",
    patients: 2800,
    clinic: "مرکز گوارش پارس",
    isOnlineBookable: true,
  },
];

export const TOP_DOCTORS: Doctor[] = doctors.filter((doctor) => doctor.isTopDoctor);

export const HOME_FEATURES = [
  {
    id: "fast-booking",
    title: "نوبت‌گیری سریع",
    description:
      "در چند دقیقه پزشک مناسب را پیدا کنید، زمان خالی را ببینید و آنلاین نوبت بگیرید.",
    icon: "⚡",
  },
  {
    id: "verified-doctors",
    title: "پزشکان معتبر",
    description:
      "پروفایل پزشکان همراه با تخصص، امتیاز، سابقه، شهر و اطلاعات نوبت‌دهی نمایش داده می‌شود.",
    icon: "🩺",
  },
  {
    id: "24-7-booking",
    title: "رزرو ۲۴ ساعته",
    description:
      "در هر ساعت از شبانه‌روز بدون تماس تلفنی، نوبت خود را ثبت و پیگیری کنید.",
    icon: "📅",
  },
];

export const HOME_STATS: HomeStat[] = [
  {
    id: "doctors",
    value: "۲۰۰+",
    label: "پزشک فعال",
    description: "پزشکان متخصص با امکان رزرو آنلاین",
  },
  {
    id: "appointments",
    value: "۵۰,۰۰۰+",
    label: "نوبت ثبت‌شده",
    description: "رزروهای موفق انجام‌شده در پلتفرم",
  },
  {
    id: "satisfaction",
    value: "۹۸٪",
    label: "رضایت کاربران",
    description: "براساس امتیاز و بازخورد کاربران",
  },
  {
    id: "cities",
    value: "۳۱ استان",
    label: "پوشش سراسری",
    description: "جستجوی پزشک در شهرها و استان‌های مختلف",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    user: "مریم رضایی",
    rate: "۵",
    text: "خیلی سریع توانستم پزشک موردنظرم را پیدا کنم و بدون تماس تلفنی نوبت بگیرم.",
    doctor: "دکتر علی احمدی",
  },
  {
    id: 2,
    user: "حسین عباسی",
    rate: "۴.۸",
    text: "رابط کاربری تمیز بود و پیدا کردن زمان خالی پزشک واقعاً راحت انجام شد.",
    doctor: "دکتر سارا نوری",
  },
  {
    id: 3,
    user: "سارا کریمی",
    rate: "۵",
    text: "برای نوبت آنلاین پوست و مو استفاده کردم و تجربه رزرو خیلی سریع و واضح بود.",
    doctor: "دکتر الهام صادقی",
  },
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    title: "چطور پزشک مناسب را برای مشکل خود انتخاب کنیم؟",
    excerpt:
      "اگر بین چند تخصص یا چند پزشک مردد هستید، این راهنما کمک می‌کند انتخاب دقیق‌تر و سریع‌تری داشته باشید.",
    category: "راهنمای نوبت‌گیری",
    date: "۱۴۰۴/۰۱/۱۵",
    readTime: "۵ دقیقه مطالعه",
    image: DEFAULT_ARTICLE_IMAGE,
  },
  {
    id: 2,
    title: "علائم هشداردهنده بیماری‌های قلبی که نباید نادیده بگیرید",
    excerpt:
      "برخی نشانه‌ها مثل درد قفسه سینه، تنگی نفس یا خستگی غیرعادی می‌توانند نیاز به بررسی فوری داشته باشند.",
    category: "قلب و عروق",
    date: "۱۴۰۴/۰۲/۰۳",
    readTime: "۴ دقیقه مطالعه",
    image: DEFAULT_ARTICLE_IMAGE,
  },
  {
    id: 3,
    title: "مراقبت‌های ساده برای سلامت پوست در هوای گرم و خشک",
    excerpt:
      "با چند نکته ساده می‌توانید از خشکی پوست، آفتاب‌سوختگی و تشدید لک‌های پوستی پیشگیری کنید.",
    category: "پوست و مو",
    date: "۱۴۰۴/۰۲/۲۰",
    readTime: "۶ دقیقه مطالعه",
    image: DEFAULT_ARTICLE_IMAGE,
  },
];
