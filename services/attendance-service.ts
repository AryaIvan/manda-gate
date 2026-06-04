import { apiRequest } from "@/lib/api";

export type AttendanceItem = {
  id: string;
  date: string;
  status: "PRESENT" | "PERMISSION" | "SICK" | "ABSENT" | "LATE";
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

type AttendanceListResponse = {
  message: string;
  status: string;
  data: AttendanceItem[];
};

type AttendanceSingleResponse = {
  message: string;
  status: string;
  data: AttendanceItem;
};

type AttendancePayload = {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string | null;
  date?: string;
  status?: AttendanceItem["status"];
  note?: string;
};

export async function getAttendances(token: string) {
  return apiRequest<AttendanceListResponse>("/attendances", {
    method: "GET",
    token,
  });
}

export async function getAttendance(token: string, id: string) {
  return apiRequest<AttendanceSingleResponse>(`/attendances/${id}`, {
    method: "GET",
    token,
  });
}

export async function createAttendance(token: string, body: AttendancePayload) {
  return apiRequest<AttendanceSingleResponse>("/attendances", {
    method: "POST",
    token,
    body,
  });
}

export async function updateAttendance(token: string, id: string, body: AttendancePayload) {
  return apiRequest<AttendanceSingleResponse>(`/attendances/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteAttendance(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/attendances/${id}`, {
    method: "DELETE",
    token,
  });
}
