import { apiRequest } from "@/lib/api";

export type ScheduleItem = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  academicYear: string;
  status: "ACTIVE" | "INACTIVE";
  class?: {
    id: string;
    name: string;
    grade?: string;
    major?: string;
    academicYear?: string;
  } | null;
  teacher?: {
    id: string;
    fullName: string;
    nip?: string | null;
  } | null;
  subject?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
};

type ScheduleListResponse = {
  message: string;
  status: string;
  data: ScheduleItem[];
};

type ScheduleSingleResponse = {
  message: string;
  status: string;
  data: ScheduleItem;
};

export async function getSchedules(token: string) {
  return apiRequest<ScheduleListResponse>("/schedules", {
    method: "GET",
    token,
  });
}

export async function getSchedule(token: string, id: string) {
  return apiRequest<ScheduleSingleResponse>(`/schedules/${id}`, {
    method: "GET",
    token,
  });
}
