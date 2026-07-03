// Location: src/data/mockData.ts

export type Center = {
  id: number;
  name: string;
  city: string;
  address: string;
  rating: number;
};

export const centers: Center[] = [
  {
    id: 1,
    name: "بیمارستان عرفان",
    city: "تهران",
    address: "سعادت آباد",
    rating: 4.6,
  },
  {
    id: 2,
    name: "بیمارستان پارسیان",
    city: "تهران",
    address: "سعادت آباد",
    rating: 4.5,
  },
  {
    id: 3,
    name: "کلینیک دی",
    city: "تهران",
    address: "خیابان ولیعصر",
    rating: 4.3,
  },
  {
    id: 4,
    name: "کلینیک نور",
    city: "تهران",
    address: "ونک",
    rating: 4.4,
  }
];

export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  city: string;
  rating: number;
  image?: string;
  nextAvailable: string;
  slots: string[]; // اسلات‌های زمانی در دسترس پزشک برای سیستم رزرو
  about?: string;
};

export const doctors: Doctor[] = [
  {
    id: 1,
    name: "دکتر سارا نوری",
    specialty: "تخصص بیماری‌های داخلی",
    city: "شیراز",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "فردا ۱۰:۳۰",
    slots: ["فردا ۱۰:۳۰", "فردا ۱۱:۳۰", "فردا ۱۲:۰۰", "پس‌فردا ۱۵:۰۰"],
    about: "دکتر سارا نوری متخصص بیماری‌های داخلی با بیش از ۱۰ سال سابقه در درمان دیابت و غدد."
  },
  {
    id: 2,
    name: "دکتر لیلا بهادرزاده",
    specialty: "فلوشیپ جراحی پستان",
    city: "یزد",
    rating: 3.8,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "امروز ۱۶:۰۰",
    slots: ["امروز ۱۶:۰۰", "امروز ۱۷:۰۰", "فردا ۰۹:۰۰"],
    about: "دکتر لیلا بهادرزاده فلوشیپ جراحی پستان و عضو هیئت علمی دانشگاه علوم پزشکی."
  },
  {
    id: 3,
    name: "دکتر علی احمدی",
    specialty: "متخصص قلب و عروق",
    city: "تهران",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "امروز ۱۸:۰۰",
    slots: ["امروز ۱۸:۰۰", "امروز ۱۹:۰۰", "فردا ۱۶:۰۰", "فردا ۱۷:۳۰"],
    about: "دکتر علی احمدی متخصص قلب و عروق، فارغ‌التحصیل از دانشگاه تهران و دارای بورد تخصصی."
  },
  {
    id: 4,
    name: "دکتر محمد رضایی",
    specialty: "چشم پزشکی",
    city: "اصفهان",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "فردا ۰۹:۰۰",
    slots: ["فردا ۰۹:۰۰", "فردا ۱۰:۰۰", "پس‌فردا ۱۱:۳۰"],
    about: "دکتر محمد رضایی متخصص چشم‌پزشکی و جراحی لیزیک و آب‌مروارید."
  },
  {
    id: 5,
    name: "دکتر نرگس کریمی",
    specialty: "روانپزشکی",
    city: "تهران",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "امروز ۲۰:۰۰",
    slots: ["امروز ۲۰:۰۰", "امروز ۲۱:۰۰", "فردا ۱۸:۰۰"],
    about: "دکتر نرگس کریمی روانپزشک و درمانگر اختلالات اضطرابی و افسردگی."
  },
  {
    id: 6,
    name: "دکتر امیر حسینی",
    specialty: "ارتوپدی",
    city: "مشهد",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "فردا ۱۴:۰۰",
    slots: ["فردا ۱۴:۰۰", "فردا ۱۵:۳۰", "پس‌فردا ۱۰:۰۰"],
    about: "دکتر امیر حسینی متخصص جراحی استخوان و مفاصل (ارتوپدی) و آسیب‌های ورزشی."
  },
  {
    id: 7,
    name: "دکتر الهام صادقی",
    specialty: "پوست و مو",
    city: "تبریز",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "امروز ۱۷:۳۰",
    slots: ["امروز ۱۷:۳۰", "امروز ۱۸:۳۰", "فردا ۱۲:۰۰"],
    about: "دکتر الهام صادقی متخصص پوست، مو و زیبایی و خدمات لیزر جوانسازی."
  },
  {
    id: 8,
    name: "دکتر رضا موسوی",
    specialty: "گوارش",
    city: "کرج",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "فردا ۱۱:۰۰",
    slots: ["فردا ۱۱:۰۰", "فردا ۱۲:۰۰", "پس‌فردا ۱۵:۰۰"],
    about: "دکتر رضا موسوی فوق تخصص گوارش، کبد و مجاری صفراوی و آندوسکوپی."
  }
];

export const SPECIALTIES = [
  { id: "cardiology", title: "قلب و عروق", icon: "🫀" },
  { id: "dentistry", title: "دندانپزشکی", icon: "🦷" },
  { id: "dermatology", title: "پوست و مو", icon: "🧴" },
  { id: "neurology", title: "مغز و اعصاب", icon: "🧠" },
  { id: "pediatrics", title: "کودکان", icon: "👶" },
  { id: "orthopedics", title: "ارتوپدی", icon: "🦴" },
];

export const TOP_DOCTORS = [
  {
    id: 1,
    name: "دکتر علی محمدی",
    specialty: "متخصص قلب و عروق",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "امروز ساعت ۱۸",
    city: "تهران",
    rating: 4.8,
  },
  {
    id: 2,
    name: "دکتر نرگس احمدی",
    specialty: "متخصص پوست و مو",
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "فردا ساعت ۱۰",
    city: "شیراز",
    rating: 4.7,
  },
  {
    id: 3,
    name: "دکتر رضا کریمی",
    specialty: "متخصص مغز و اعصاب",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=60",
    nextAvailable: "پس‌فردا ساعت ۱۶",
    city: "اصفهان",
    rating: 4.9,
  },
];

export const TESTIMONIALS = [
  {
    user: "مریم رضایی",
    rate: "۵",
    text: "خیلی سریع تونستم برای دکتر مورد نظرم نوبت بگیرم.",
    doctor: "دکتر علی محمدی",
  },
  {
    user: "حسین عباسی",
    rate: "۴.۸",
    text: "رابط کاربری ساده و تمیز بود.",
    doctor: "دکتر نرگس احمدی",
  },
  {
    user: "سارا کریمی",
    rate: "۵",
    text: "بهترین بخشش ثبت نوبت آنلاین بود.",
    doctor: "دکتر رضا کریمی",
  },
];

export const ARTICLES = [
  {
    id: 1,
    title: "چطور پزشک مناسب انتخاب کنیم؟",
    date: "۱۴۰۴/۰۱/۱۵",
    img: "🩺",
  },
  {
    id: 2,
    title: "علائم هشداردهنده بیماری قلبی",
    date: "۱۴۰۴/۰2/۰۳",
    img: "❤️",
  },
  {
    id: 3,
    title: "مراقبت‌های ساده برای سلامت پوست",
    date: "۱۴۰۴/۰۲/۲۰",
    img: "🧴",
  },
];
