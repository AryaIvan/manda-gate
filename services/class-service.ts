import { apiRequest } from "@/lib/api";

export type ClassItem = {
  id: string;
  name: string;
  grade: "X" | "XI" | "XII";
  major: "IPA" | "IPS" | "AGAMA";
  academicYear: string;
  status: "ACTIVE" | "INACTIVE";
  totalStudents: number;
  homeroomTeacher?: {
    id: string;
    fullName: string;
    nip?: string | null;
    subject?: string | null;
  } | null;
};

type ClassResponse = {
  message: string;
  status: string;
  data: ClassItem[];
};

export type ClassStudent = {
  id: string;
  nis: string;
  nisn?: string | null;
  fullName: string;
  gender: "MALE" | "FEMALE";
  phone?: string | null;
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
};

export type ClassDetail = ClassItem & {
  students: ClassStudent[];
};

type ClassDetailResponse = {
  message: string;
  status: string;
  data: ClassDetail;
};

export async function getClasses(token: string) {
  return apiRequest<ClassResponse>("/classes", {
    method: "GET",
    token,
  });
}

export async function getClassById(id: string, token: string) {
  return apiRequest<ClassDetailResponse>(`/classes/${id}`, {
    method: "GET",
    token,
  });
}
