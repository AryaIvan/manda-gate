import { apiRequest } from "@/lib/api";

export type AchievementItem = {
  id: string;
  code: string;
  title: string;
  level: string;
  date: string;
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

type AchievementListResponse = {
  message: string;
  status: string;
  data: AchievementItem[];
};

type AchievementSingleResponse = {
  message: string;
  status: string;
  data: AchievementItem;
};

export type AchievementPayload = {
  studentId: string;
  classId: string;
  title: string;
  level: string;
  date: string;
  code?: string;
};

export async function getAchievements(token: string) {
  return apiRequest<AchievementListResponse>("/achievements", {
    method: "GET",
    token,
  });
}

export async function createAchievement(token: string, body: AchievementPayload) {
  return apiRequest<AchievementSingleResponse>("/achievements", {
    method: "POST",
    token,
    body,
  });
}

export async function updateAchievement(token: string, id: string, body: AchievementPayload) {
  return apiRequest<AchievementSingleResponse>(`/achievements/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteAchievement(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/achievements/${id}`, {
    method: "DELETE",
    token,
  });
}
