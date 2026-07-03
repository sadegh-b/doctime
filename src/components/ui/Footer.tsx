import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ستون ۱: برند + اطلاعات سازنده */}
          <div>
            <h3 className="text-xl font-bold mb-4">DocTime</h3>
            <p className="text-blue-100 leading-relaxed mb-2">
              پلتفرم هوشمند رزرو نوبت پزشک. سلامت شما اولویت ماست.
            </p>
            <p className="text-blue-100 text-sm">
              ساخته شده توسط صادق بلوچ
            </p>
          </div>

          {/* ستون ۲: لینک‌ها */}
          <div>
            <h4 className="text-lg font-semibold mb-4">لینک‌های سریع</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/doctors" className="text-blue-100 hover:text-white transition-colors">
                  جستجوی پزشک
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-blue-100 hover:text-white transition-colors">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-100 hover:text-white transition-colors">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* ستون ۳: اطلاعات تماس با آدرس چابهار */}
          <div>
            <h4 className="text-lg font-semibold mb-4">اطلاعات تماس</h4>
            <p className="text-blue-100">📞 021-12345678</p>
            <p className="text-blue-100">✉️ info@doctime.ir</p>
            <p className="text-blue-100">📍 چابهار، بلوار آزادی، پلاک ۱۲</p>
          </div>
        </div>

        <hr className="border-blue-400 my-8" />
        <p className="text-center text-blue-100 text-sm">
          © {new Date().getFullYear()} DocTime. تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
