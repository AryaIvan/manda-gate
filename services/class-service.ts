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

type ClassSingleResponse = {
  message: string;
  status: string;
  data: ClassItem;
};

export type ClassPayload = {
  name: string;
  grade: "X" | "XI" | "XII";
  major: "IPA" | "IPS" | "AGAMA";
  academicYear: string;
  homeroomTeacherId?: string | null;
  status: "ACTIVE" | "INACTIVE";
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

export async function createClass(token: string, body: ClassPayload) {
  return apiRequest<ClassSingleResponse>("/classes", {
    method: "POST",
    token,
    body,
  });
}

export async function updateClass(token: string, id: string, body: ClassPayload) {
  return apiRequest<ClassSingleResponse>(`/classes/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteClass(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/classes/${id}`, {
    method: "DELETE",
    token,
  });
}
