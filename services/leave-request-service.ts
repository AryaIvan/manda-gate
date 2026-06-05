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

type LeaveRequestSingleResponse = {
  message: string;
  status: string;
  data: LeaveRequestItem;
};

export type LeaveRequestPayload = {
  studentId?: string;
  classId?: string;
  type?: string;
  date?: string;
  description?: string;
  status?: LeaveRequestItem["status"];
};

export async function getLeaveRequests(token: string) {
  return apiRequest<LeaveRequestListResponse>("/leave-requests", {
    method: "GET",
    token,
  });
}

export async function createLeaveRequest(token: string, body: LeaveRequestPayload) {
  return apiRequest<LeaveRequestSingleResponse>("/leave-requests", {
    method: "POST",
    token,
    body,
  });
}

export async function updateLeaveRequest(token: string, id: string, body: LeaveRequestPayload) {
  return apiRequest<LeaveRequestSingleResponse>(`/leave-requests/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteLeaveRequest(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/leave-requests/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function approveLeaveRequest(token: string, id: string) {
  return apiRequest<LeaveRequestSingleResponse>(`/leave-requests/${id}/approve`, {
    method: "PATCH",
    token,
  });
}

export async function rejectLeaveRequest(token: string, id: string) {
  return apiRequest<LeaveRequestSingleResponse>(`/leave-requests/${id}/reject`, {
    method: "PATCH",
    token,
  });
}
