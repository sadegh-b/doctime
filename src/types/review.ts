export interface Review {
  id: number;
  doctorId: number;
  patientName: string;
  rating: number;
  comment: string;
  date?: string; // اختیاری در صورتی که سرور تاریخ ثبت نظر را برگرداند
}
