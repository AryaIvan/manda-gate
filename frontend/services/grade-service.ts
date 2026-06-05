import { apiRequest } from "@/lib/api";

export type GradeItem = {
  id: string;
  assignmentScore: number;
  dailyScore: number;
  midtermScore: number;
  finalExamScore: number;
  finalScore: number;
  predicate: "A" | "B" | "C" | "D" | "E";
  note?: string | null;
  student?: {
    id: string;
    fullName: string;
    nis?: string;
  } | null;
  class?: {
    id: string;
    name: string;
  } | null;
  subject?: {
    id: string;
    name: string;
  } | null;
  teacher?: {
    id: string;
    fullName: string;
  } | null;
};

type GradeListResponse = {
  message: string;
  status: string;
  data: GradeItem[];
};

type GradeSingleResponse = {
  message: string;
  status: string;
  data: GradeItem;
};

export type GradePayload = {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string | null;
  assignmentScore?: number;
  dailyScore?: number;
  midtermScore?: number;
  finalExamScore?: number;
  note?: string;
};

export async function getGrades(token: string) {
  return apiRequest<GradeListResponse>("/grades", {
    method: "GET",
    token,
  });
}

export async function getGrade(token: string, id: string) {
  return apiRequest<GradeSingleResponse>(`/grades/${id}`, {
    method: "GET",
    token,
  });
}

export async function createGrade(token: string, body: GradePayload) {
  return apiRequest<GradeSingleResponse>("/grades", {
    method: "POST",
    token,
    body,
  });
}

export async function updateGrade(token: string, id: string, body: GradePayload) {
  return apiRequest<GradeSingleResponse>(`/grades/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteGrade(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/grades/${id}`, {
    method: "DELETE",
    token,
  });
}
