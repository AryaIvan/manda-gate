import { apiRequest } from "@/lib/api";

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  targetRole: string;
  publishDate: string;
  status: "ACTIVE" | "INACTIVE";
  createdBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
};

type AnnouncementListResponse = {
  message: string;
  status: string;
  data: AnnouncementItem[];
};

export async function getAnnouncements(token: string) {
  return apiRequest<AnnouncementListResponse>("/announcements", {
    method: "GET",
    token,
  });
}
