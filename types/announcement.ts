import { UserRole } from "./auth";

export type AnnouncementCategory =
  | "Akademik"
  | "Kesiswaan"
  | "Ujian"
  | "Libur"
  | "Kegiatan"
  | "Prestasi"
  | "Umum";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  targetRole: UserRole | "ALL";
  publishDate: string;
  isActive: boolean;
  createdBy: string;
};