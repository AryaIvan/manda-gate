import { apiRequest } from "@/lib/api";

export type SystemSetting = {
  id: string;
  schoolName: string;
  academicYear: string;
  semester: string;
};

export type UserAccountItem = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "ADMIN" | "TEACHER" | "HOMEROOM_TEACHER" | "STUDENT" | "BK" | "HEADMASTER";
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string | null;
  createdAt: string;
};

type SettingResponse = {
  message: string;
  status: string;
  data: SystemSetting;
};

type UserListResponse = {
  message: string;
  status: string;
  data: UserAccountItem[];
};

type UserSingleResponse = {
  message: string;
  status: string;
  data: UserAccountItem;
};

export type UpdateUserPayload = Partial<
  Pick<UserAccountItem, "name" | "email" | "username" | "role" | "status">
>;

export async function getSettings(token: string) {
  return apiRequest<SettingResponse>("/settings", {
    method: "GET",
    token,
  });
}

export async function getUsers(token: string) {
  return apiRequest<UserListResponse>("/users", {
    method: "GET",
    token,
  });
}

export async function updateUser(token: string, id: string, body: UpdateUserPayload) {
  return apiRequest<UserSingleResponse>(`/users/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function resetUserPassword(token: string, id: string, password = "password123") {
  return apiRequest<{ message: string; status: string }>(`/users/${id}/reset-password`, {
    method: "PATCH",
    token,
    body: { password },
  });
}

export async function changeUserStatus(
  token: string,
  id: string,
  status: UserAccountItem["status"],
) {
  return apiRequest<UserSingleResponse>(`/users/${id}/change-status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}
