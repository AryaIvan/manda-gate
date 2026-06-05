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

export type SchedulePayload = {
  day: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId?: string | null;
  classId: string;
  room: string;
  semester: string;
  academicYear: string;
  status: "ACTIVE" | "INACTIVE";
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

export async function createSchedule(token: string, body: SchedulePayload) {
  return apiRequest<ScheduleSingleResponse>("/schedules", {
    method: "POST",
    token,
    body,
  });
}

export async function updateSchedule(token: string, id: string, body: SchedulePayload) {
  return apiRequest<ScheduleSingleResponse>(`/schedules/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteSchedule(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/schedules/${id}`, {
    method: "DELETE",
    token,
  });
}
