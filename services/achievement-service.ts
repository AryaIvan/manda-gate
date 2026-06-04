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

export async function getAchievements(token: string) {
  return apiRequest<AchievementListResponse>("/achievements", {
    method: "GET",
    token,
  });
}
