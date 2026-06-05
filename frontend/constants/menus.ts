import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Megaphone,
  Settings,
  ClipboardList,
  UserCheck,
  BarChart3,
  Trophy,
} from "lucide-react";

import { UserRole } from "@/types/auth";

export type SidebarMenu = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
};

export const sidebarMenus: SidebarMenu[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "STUDENT", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"],
  },
  {
    label: "Data Siswa",
    href: "/students",
    icon: Users,
    roles: ["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"],
  },
  {
    label: "Data Guru",
    href: "/teachers",
    icon: GraduationCap,
    roles: ["ADMIN", "HEADMASTER"],
  },
  {
    label: "Data Kelas",
    href: "/classes",
    icon: BookOpen,
    roles: ["ADMIN", "HOMEROOM_TEACHER", "BK", "HEADMASTER"],
  },
  {
    label: "Mata Pelajaran",
    href: "/subjects",
    icon: BookOpen,
    roles: ["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "HEADMASTER"],
  },
  {
    label: "Jadwal",
    href: "/schedules",
    icon: CalendarDays,
    roles: ["ADMIN", "STUDENT", "TEACHER", "HOMEROOM_TEACHER", "HEADMASTER"],
  },
  {
    label: "Absensi",
    href: "/attendances",
    icon: ClipboardCheck,
    roles: ["ADMIN", "STUDENT", "TEACHER", "HOMEROOM_TEACHER"],
  },
  {
    label: "Nilai",
    href: "/grades",
    icon: FileText,
    roles: ["ADMIN", "STUDENT", "TEACHER", "HOMEROOM_TEACHER"],
  },
  {
    label: "Tugas",
    href: "/assignments",
    icon: ClipboardList,
    roles: ["STUDENT", "TEACHER"],
  },
  {
    label: "Pengumuman",
    href: "/announcements",
    icon: Megaphone,
    roles: ["ADMIN", "STUDENT", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"],
  },
  {
    label: "Surat Izin",
    href: "/leave-requests",
    icon: UserCheck,
    roles: ["STUDENT", "HOMEROOM_TEACHER", "ADMIN", "BK", "HEADMASTER"],
  },
  {
    label: "Laporan",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"],
  },
  {
    label: "Prestasi",
    href: "/achievements",
    icon: Trophy,
    roles: ["BK", "HEADMASTER", "ADMIN"],
  },
  {
    label: "Pengaturan",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN", "STUDENT", "TEACHER", "HOMEROOM_TEACHER", "BK", "HEADMASTER"],
  },
];
