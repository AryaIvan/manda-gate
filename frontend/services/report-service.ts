import { apiRequest } from "@/lib/api";

type ApiResponse<T> = {
  message: string;
  status: string;
  data: T;
};

export type SummaryReport = {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  subjectCount: number;
  scheduleCount: number;
  activeLeaveRequests: number;
  achievementsCount: number;
};

export async function getSummaryReport(token: string) {
  return apiRequest<ApiResponse<SummaryReport>>("/reports/summary", {
    method: "GET",
    token,
  });
}

export async function getReportData<T>(token: string, endpoint: string) {
  return apiRequest<ApiResponse<T>>(endpoint, {
    method: "GET",
    token,
  });
}
