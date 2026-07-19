import api from "./api";

export interface Doctor {
  id: number;
  user_id: number;
  name?: string | null;
  specialty: string;
  work_shift?: string | null;
  city?: string | null;
  address?: string | null;
  bio?: string | null;
  experience_years: number;
  consultation_fee: number;
  phone?: string | null;
  image?: string | null;
}

interface DoctorListResponse {
  success?: boolean;
  count?: number;
  items?: unknown[];
  data?: unknown[];
}

interface DoctorDetailsResponse {
  success?: boolean;
  data?: unknown;
  item?: unknown;
}

function normalizeDoctor(item: any): Doctor {
  return {
    id: Number(item?.id ?? 0),
    user_id: Number(item?.user_id ?? item?.user?.id ?? 0),
    name: item?.name ?? item?.user_name ?? item?.full_name ?? null,
    specialty: item?.specialty ?? "تخصص ثبت نشده",
    work_shift: item?.work_shift ?? null,
    city: item?.city ?? null,
    address: item?.address ?? null,
    bio: item?.bio ?? item?.about ?? null,
    experience_years: Number(item?.experience_years ?? item?.experience ?? 0),
    consultation_fee: Number(item?.consultation_fee ?? item?.visit_fee ?? 0),
    phone: item?.phone ?? item?.phone_number ?? null,
    image: item?.image ?? item?.avatar ?? item?.profile_image ?? null,
  };
}

function normalizeDoctorsResponse(data: any): Doctor[] {
  if (Array.isArray(data)) {
    return data.map(normalizeDoctor);
  }

  if (data && Array.isArray(data.items)) {
    return data.items.map(normalizeDoctor);
  }

  if (data && Array.isArray(data.data)) {
    return data.data.map(normalizeDoctor);
  }

  return [];
}

function normalizeSingleDoctorResponse(data: any): Doctor {
  if (data?.data) {
    return normalizeDoctor(data.data);
  }

  if (data?.item) {
    return normalizeDoctor(data.item);
  }

  return normalizeDoctor(data);
}

export async function getDoctors(): Promise<Doctor[]> {
  const response = await api.get<DoctorListResponse | Doctor[]>("/doctors");
  return normalizeDoctorsResponse(response.data);
}

export async function getDoctorById(id: number): Promise<Doctor> {
  const response = await api.get<DoctorDetailsResponse | Doctor>(`/doctors/${id}`);
  const doctor = normalizeSingleDoctorResponse(response.data);

  if (!doctor.id) {
    throw new Error("اطلاعات پزشک معتبر نیست یا پزشک پیدا نشد.");
  }

  return doctor;
}

export async function searchDoctors(
  params?: Record<string, string | number>
): Promise<Doctor[]> {
  const response = await api.get<DoctorListResponse | Doctor[]>("/doctors/search", {
    params,
  });

  return normalizeDoctorsResponse(response.data);
}
