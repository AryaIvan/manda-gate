import { apiRequest } from "@/lib/api";

export type LeaveRequestItem = {
  id: string;
  type: string;
  date: string;
  description: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  student?: {
    id: string;
    fullName: string;
    nis?: string;
  } | null;
  class?: {
    id: string;
    name: string;
  } | null;
};

type LeaveRequestListResponse = {
  message: string;
  status: string;
  data: LeaveRequestItem[];
};

export async function getLeaveRequests(token: string) {
  return apiRequest<LeaveRequestListResponse>("/leave-requests", {
    method: "GET",
    token,
  });
}
