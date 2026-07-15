# filepath: src/api/appointmentService.js
import axiosClient from './axiosClient';

const appointmentService = {
  // دریافت لیست تمام نوبت‌های کاربر (بیمار یا پزشک)
  getAllAppointments: () => {
    return axiosClient.get('/appointments');
  },

  // رزرو نوبت بر اساس ID اسلات زمانی (از متغیر مسیر استفاده می‌کند)
  bookAppointment: (slotId) => {
    return axiosClient.post(`/appointments/book/${slotId}`);
  },

  // لغو نرم نوبت (تغییر وضعیت به cancelled به جای حذف)
  cancelAppointment: (appointmentId) => {
    return axiosClient.put(`/appointments/${appointmentId}/cancel`);
  },

  // اتمام نوبت توسط پزشک
  completeAppointment: (appointmentId) => {
    return axiosClient.put(`/appointments/${appointmentId}/complete`);
  }
};

export default appointmentService;
