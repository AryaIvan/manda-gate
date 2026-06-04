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
