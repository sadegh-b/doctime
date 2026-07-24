import api from "./api";

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  specialty_id: number;
  specialty_name: string;
  work_shift: string | null;
  city: string | null;
  address: string | null;
  bio: string | null;
  experience_years: number;
  consultation_fee: number;
  phone: string | null;
  image: string | null;
  rating: number | null;
  next_available: string | null;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null => {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : null;
};

const readString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
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
    if (Number.isFinite(num)) {
      return num;
    }
  }
  return 0;
};

const buildNameFromUser = (user: UnknownRecord | null): string => {
  if (!user) {
    return "";
  }

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
  if (full) {
    return full;
  }

  return readString(
    user.name,
    user.full_name,
    user.fullName,
    user.display_name,
    user.displayName,
    user.username
  );
};

function normalizeDoctor(item: unknown): Doctor {
  const source = asRecord(item);

  if (!source) {
    console.error("DATA INTEGRITY ERROR: invalid doctor payload", item);
    throw new Error("ساختار اطلاعات پزشک معتبر نیست.");
  }

  const user = asRecord(source.user);
  const specialty = asRecord(source.specialty);

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
    specialty?.id,
    specialty?.specialty_id,
    specialty?.specialtyId
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

  const specialtyName = readString(
    source.specialty_name,
    source.specialtyName,
    specialty?.name,
    specialty?.title,
    specialty?.specialty_name,
    specialty?.specialtyName
  );

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(specialtyId) ||
    specialtyId <= 0 ||
    !name ||
    !specialtyName
  ) {
    console.error("DOCTOR DETAILS RAW PAYLOAD:", item);
    console.error("DATA INTEGRITY ERROR: incomplete doctor payload", {
      id,
      userId,
      name,
      specialtyId,
      specialtyName,
      user,
      specialty,
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
    specialty_id: specialtyId,
    specialty_name: specialtyName,
    work_shift: readNullableString(
      source.work_shift,
      source.workShift,
      source.shift
    ),
    city: readNullableString(source.city),
    address: readNullableString(source.address, source.location),
    bio: readNullableString(
      source.bio,
      source.about,
      source.description,
      source.summary
    ),
    experience_years: experienceYears,
    consultation_fee: consultationFee,
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

  const nestedCandidates = [
    source.data,
    source.doctor,
    source.result,
    source.item,
  ];

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
