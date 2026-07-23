// frontend/src/utils/calculateRating.ts

import type { Review } from "../services/reviews";

export interface RatingResult {
  rating: number; // میانگین امتیاز پزشک از 0 تا 5
  count: number;  // تعداد کل نظرات ثبت شده
}

/**
 * محاسبه میانگین امتیاز پزشکان به همراه تعداد کل نظرات
 * این تابع مقادیر نامعتبر را فیلتر کرده و جلوی کرش کردن برنامه را می‌گیرد.
 */
export function calculateRating(reviews: Review[] | null | undefined): RatingResult {
  // ۱. بررسی اینکه آیا آرایه ورودی معتبر و دارای عضو است
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return {
      rating: 0,
      count: 0
    };
  }

  let validRatingsCount = 0;

  // ۲. محاسبه مجموع امتیازهای معتبر با متد reduce
  const total = reviews.reduce((sum, review) => {
    // بررسی سخت‌گیرانه برای اطمینان از عدد بودن و معتبر بودن امتیاز (بین ۱ تا ۵)
    const ratingValue = Number(review.rating);
    if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
      validRatingsCount++;
      return sum + ratingValue;
    }
    return sum;
  }, 0);

  // ۳. اگر هیچ امتیاز معتبری پیدا نشد، خروجی صفر بازگردانده شود تا تقسیم بر صفر رخ ندهد
  if (validRatingsCount === 0) {
    return {
      rating: 0,
      count: 0
    };
  }

  // ۴. محاسبه میانگین و گرد کردن آن تا یک رقم اعشار
  const average = Number((total / validRatingsCount).toFixed(1));

  return {
    rating: average,
    count: validRatingsCount
  };
}
