import { sidebarMenus } from "@/constants/menus";
import { UserRole } from "@/types/auth";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  TEACHER: "Guru",
  HOMEROOM_TEACHER: "Wali Kelas",
  STUDENT: "Siswa",
  BK: "BK",
  HEADMASTER: "Kepala Madrasah",
};

export function canAccessPath(role: UserRole | undefined, pathname: string) {
  if (!role) return false;

  const menu = sidebarMenus.find((item) => item.href === pathname);
  if (!menu) return true;

  return menu.roles.includes(role);
}

export function getDefaultPath(role: UserRole | undefined) {
  if (!role) return "/login";
  return "/dashboard";
}
