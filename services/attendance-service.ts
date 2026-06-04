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
