// frontend/src/utils/timeSlots.ts

export interface TimeSlot {
  startTime: string; // فرمت "HH:MM" (مثال: "09:00")
  endTime: string;   // فرمت "HH:MM" (مثال: "09:30")
}

/**
 * تبدیل رشته ساعت به دقیقه از شروع روز (جهت انجام محاسبات ریاضی راحت‌تر)
 * مثال: "08:30" تبدیل می‌شود به (8 * 60) + 30 = 510 دقیقه
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`فرمت زمان نامعتبر است: ${timeStr}`);
  }
  return hours * 60 + minutes;
}

/**
 * تبدیل دقیقه به رشته استاندارد زمان با فرمت "HH:MM"
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMins = String(mins).padStart(2, "0");
  return `${formattedHours}:${formattedMins}`;
}

/**
 * تولید خودکار بازه‌های زمانی بین ساعت شروع و پایان شیفت بر اساس مدت زمان هر نوبت
 * @param shiftStart ساعت شروع شیفت (مثال: "08:00")
 * @param shiftEnd ساعت پایان شیفت (مثال: "14:00")
 * @param durationMinutes مدت زمان هر نوبت به دقیقه (مثال: 30)
 */
export function generateTimeSlots(
  shiftStart: string,
  shiftEnd: string,
  durationMinutes: number
): TimeSlot[] {
  try {
    const slots: TimeSlot[] = [];
    const startMinutes = timeToMinutes(shiftStart);
    const endMinutes = timeToMinutes(shiftEnd);

    if (startMinutes >= endMinutes) {
      console.warn("ساعت شروع نمی‌تواند مساوی یا بعد از ساعت پایان باشد.");
      return [];
    }

    if (durationMinutes <= 0) {
      console.warn("مدت زمان نوبت باید بزرگتر از صفر باشد.");
      return [];
    }

    let current = startMinutes;
    while (current + durationMinutes <= endMinutes) {
      slots.push({
        startTime: minutesToTime(current),
        endTime: minutesToTime(current + durationMinutes),
      });
      current += durationMinutes;
    }

    return slots;
  } catch (error) {
    console.error("خطا در تولید بازه‌های زمانی:", error);
    return [];
  }
}

/**
 * بررسی اینکه آیا یک نوبت جدید با نوبت‌های رزرو شده قبلی تداخل دارد یا خیر
 * @param newSlot نوبت جدید پیشنهادی
 * @param bookedSlots لیست نوبت‌هایی که قبلاً رزرو شده‌اند
 */
export function hasTimeConflict(newSlot: TimeSlot, bookedSlots: TimeSlot[]): boolean {
  try {
    const newStart = timeToMinutes(newSlot.startTime);
    const newEnd = timeToMinutes(newSlot.endTime);

    for (const booked of bookedSlots) {
      const bookedStart = timeToMinutes(booked.startTime);
      const bookedEnd = timeToMinutes(booked.endTime);

      // فرمول ریاضی بررسی تداخل بازه‌های زمانی:
      // اگر شروع نوبت جدید قبل از پایان نوبت رزرو شده باشد و پایان نوبت جدید بعد از شروع نوبت رزرو شده باشد.
      if (newStart < bookedEnd && newEnd > bookedStart) {
        return true; // تداخل وجود دارد
      }
    }

    return false; // تداخلی وجود ندارد
  } catch (error) {
    console.error("خطا در بررسی تداخل نوبت‌ها:", error);
    return true; // برای امنیت بیشتر در صورت بروز خطا فرض را بر تداخل می‌گذاریم
  }
}
