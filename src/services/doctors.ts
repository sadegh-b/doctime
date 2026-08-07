import api from "./api";

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  specialty_id: number;
  specialty: string; // slug/value used by filters
  specialty_name: string;
  work_shift: string | null;
  province: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bio: string | null;
  experience_years: number;
  consultation_fee: number;
  waiting_time_estimate: number | null;
  phone: string | null;
  image: string | null;
  rating: number | null;
  next_available: string | null;
  in_person_visit: boolean;
  online_visit: boolean;
  gender: "male" | "female" | null;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : null;
};

const readString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return "";
};

const readNullableString = (...values: unknown[]): string | null => {
  const value = readString(...values);
  return value || null;
};

const readNumber = (...values: unknown[]): number => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
};

const readNullableNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
};

const readBoolean = (...values: unknown[]): boolean => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
      if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
    }
  }
  return false;
};

const buildNameFromUser = (user: UnknownRecord | null): string => {
  if (!user) return "";

  const firstName = readString(
    user.first_name,
    user.firstName,
    user.firstname,
    user.given_name
  );

  const lastName = readString(
    user.last_name,
    user.lastName,
    user.lastname,
    user.family_name
  );

  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (full) return full;

  return readString(
    user.name,
    user.full_name,
    user.fullName,
    user.display_name,
    user.displayName,
    user.username
  );
};

const SPECIALTY_LABELS: Record<string, string> = {
  general: "پزشک عمومی",
  cardiology: "قلب و عروق",
  orthopedics: "ارتوپدی",
  dermatology: "پوست و مو",
  pediatrics: "اطفال",
  neurology: "مغز و اعصاب",
  gynecology: "زنان و زایمان",
  urology: "اورولوژی",
  ent: "گوش، حلق و بینی",
  ophthalmology: "چشم پزشکی",
  psychiatry: "روان‌پزشکی",
  dentistry: "دندان‌پزشکی",
  internal_medicine: "داخلی",
  surgery: "جراحی",
  radiology: "رادیولوژی",
  gastroenterology: "گوارش و کبد",
  endocrinology: "غدد",
  nephrology: "کلیه",
  oncology: "انکولوژی",
  pulmonology: "ریه",
  infectious_disease: "عفونی",
  family_medicine: "پزشک خانواده",
};

export const specialtyValueToLabel = (value: unknown): string => {
  const raw = readString(value);
  if (!raw) return "";
  const normalized = raw.trim().toLowerCase();
  return SPECIALTY_LABELS[normalized] || raw;
};

function normalizeDoctor(item: unknown): Doctor {
  const source = asRecord(item);

  if (!source) {
    console.error("DATA INTEGRITY ERROR: invalid doctor payload", item);
    throw new Error("ساختار اطلاعات پزشک معتبر نیست.");
  }

  const user = asRecord(source.user);
  const specialtyRelation = asRecord(source.specialty_relation) || asRecord(source.specialty);

  const id = readNumber(source.id, source.doctor_id, source.doctorId);
  const userId = readNumber(
    source.user_id,
    source.userId,
    user?.id,
    user?.user_id,
    user?.userId
  );

  const specialtyId = readNumber(
    source.specialty_id,
    source.specialtyId,
    specialtyRelation?.id
  );

  const name = readString(
    source.name,
    source.doctor_name,
    source.doctorName,
    source.user_name,
    source.userName,
    source.full_name,
    source.fullName,
    buildNameFromUser(user)
  );

  const specialtySlug = readString(
    source.specialty_slug,
    source.specialtySlug,
    specialtyRelation?.slug,
    typeof source.specialty === "string" ? source.specialty : ""
  );

  const specialtyNameFromPayload = readString(
    source.specialty_name,
    source.specialtyName,
    specialtyRelation?.name,
    specialtyRelation?.title
  );

  const specialtyName =
    specialtyNameFromPayload || specialtyValueToLabel(specialtySlug) || "پزشک عمومی";

  const specialtyFinal = specialtySlug || "general";

  if (!Number.isInteger(id) || id <= 0 || !name) {
    console.error("DOCTOR DETAILS RAW PAYLOAD:", item);
    console.error("DATA INTEGRITY ERROR: incomplete doctor payload", {
      id,
      userId,
      name,
      specialtyId,
      specialtyFinal,
      specialtyName,
      user,
      specialtyRelation,
      payload: item,
    });

    throw new Error("اطلاعات ضروری پزشک ناقص است.");
  }

  const ratingValue = readNumber(source.rating, source.rate, source.score);
  const experienceYears = readNumber(
    source.experience_years,
    source.experienceYears,
    source.experience,
    source.years_of_experience
  );

  const consultationFee = readNumber(
    source.consultation_fee,
    source.consultationFee,
    source.visit_fee,
    source.visitFee,
    source.fee,
    source.price
  );

  return {
    id,
    user_id: userId,
    name,
    specialty_id: specialtyId || 1,
    specialty: specialtyFinal,
    specialty_name: specialtyName,
    work_shift: readNullableString(
      source.work_shift,
      source.workShift,
      source.shift
    ),
    province: readNullableString(source.province),
    city: readNullableString(source.city),
    address: readNullableString(source.address, source.location),
    latitude: readNullableNumber(source.latitude, source.lat),
    longitude: readNullableNumber(source.longitude, source.lng, source.lon),
    bio: readNullableString(
      source.bio,
      source.about,
      source.description,
      source.summary
    ),
    experience_years: experienceYears,
    consultation_fee: consultationFee,
    waiting_time_estimate: readNullableNumber(
      source.waiting_time_estimate,
      source.waitingTimeEstimate
    ),
    phone: readNullableString(
      source.phone,
      source.phone_number,
      source.phoneNumber,
      user?.phone,
      user?.phone_number
    ),
    image: readNullableString(
      source.image,
      source.avatar,
      source.profile_image,
      source.profileImage,
      user?.image,
      user?.avatar,
      user?.profile_image
    ),
    rating: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : null,
    next_available: readNullableString(
      source.next_available,
      source.nextAvailable
    ),
    in_person_visit: readBoolean(
      source.in_person_visit,
      source.inPersonVisit,
      source.in_person,
      source.inPerson
    ),
    online_visit: readBoolean(
      source.online_visit,
      source.onlineVisit,
      source.telemedicine,
      source.tele_medicine
    ),
    gender: readNullableString(source.gender) as "male" | "female" | null,
  };
}

function extractDoctorsArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const source = asRecord(payload);
  if (!source) {
    return [];
  }

  const candidates = [
    source.results,
    source.data,
    source.items,
    source.doctors,
    source.records,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizeDoctorsListResponse(payload: unknown): Doctor[] {
  return extractDoctorsArray(payload).map(normalizeDoctor);
}

function normalizeSingleDoctorResponse(payload: unknown): Doctor {
  const source = asRecord(payload);

  if (!source) {
    return normalizeDoctor(payload);
  }

  const nestedCandidates = [source.data, source.doctor, source.result, source.item];

  for (const candidate of nestedCandidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      return normalizeDoctor(candidate);
    }
  }

  return normalizeDoctor(payload);
}

export async function getDoctors(): Promise<Doctor[]> {
  const response = await api.get("/doctors/");
  return normalizeDoctorsListResponse(response.data);
}

export async function getDoctorById(id: number): Promise<Doctor> {
  const response = await api.get(`/doctors/${id}/`);
  return normalizeSingleDoctorResponse(response.data);
}
