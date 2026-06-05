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

type AnnouncementSingleResponse = {
  message: string;
  status: string;
  data: AnnouncementItem;
};

export type AnnouncementPayload = {
  title: string;
  content: string;
  category: string;
  targetRole: string;
  status: "ACTIVE" | "INACTIVE";
};

export async function getAnnouncements(token: string) {
  return apiRequest<AnnouncementListResponse>("/announcements", {
    method: "GET",
    token,
  });
}

export async function createAnnouncement(token: string, body: AnnouncementPayload) {
  return apiRequest<AnnouncementSingleResponse>("/announcements", {
    method: "POST",
    token,
    body,
  });
}

export async function updateAnnouncement(token: string, id: string, body: AnnouncementPayload) {
  return apiRequest<AnnouncementSingleResponse>(`/announcements/${id}`, {
    method: "PUT",
    token,
    body,
  });
}

export async function deleteAnnouncement(token: string, id: string) {
  return apiRequest<{ message: string; status: string }>(`/announcements/${id}`, {
    method: "DELETE",
    token,
  });
}
