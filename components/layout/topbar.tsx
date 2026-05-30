"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  onMenuClick?: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const pageMap: Record<string, { title: string; breadcrumb: string }> = {
    "/dashboard": { title: "Dashboard", breadcrumb: "Dashboard" },
    "/students": { title: "Data Siswa", breadcrumb: "Dashboard / Master Data / Data Siswa" },
    "/teachers": { title: "Data Guru", breadcrumb: "Dashboard / Master Data / Data Guru" },
    "/classes": { title: "Data Kelas", breadcrumb: "Dashboard / Master Data / Data Kelas" },
    "/subjects": { title: "Mata Pelajaran", breadcrumb: "Dashboard / Master Data / Mata Pelajaran" },
    "/schedules": { title: "Jadwal", breadcrumb: "Dashboard / Akademik / Jadwal" },
    "/attendances": { title: "Absensi", breadcrumb: "Dashboard / Akademik / Absensi" },
    "/grades": { title: "Nilai", breadcrumb: "Dashboard / Akademik / Nilai" },
    "/assignments": { title: "Tugas", breadcrumb: "Dashboard / Akademik / Tugas" },
    "/announcements": { title: "Pengumuman", breadcrumb: "Dashboard / Informasi / Pengumuman" },
    "/leave-requests": { title: "Surat Izin", breadcrumb: "Dashboard / Administrasi / Surat Izin" },
    "/reports": { title: "Laporan", breadcrumb: "Dashboard / Laporan" },
    "/achievements": { title: "Prestasi", breadcrumb: "Dashboard / Kesiswaan / Prestasi" },
    "/settings": { title: "Pengaturan", breadcrumb: "Dashboard / Sistem / Pengaturan" },
  };

  const page = pageMap[pathname] || {
    title: "MANDA Gate",
    breadcrumb: "Dashboard",
  };

  return (
    <header className="h-[72px] bg-white border-b px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </Button>

        <div>
          <p className="text-xs font-medium text-slate-400">
            {page.breadcrumb}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {page.title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden h-10 w-[300px] items-center gap-3 rounded-[14px] bg-slate-100 px-4 text-sm text-slate-500 lg:flex">
          <Search size={16} />
          Cari data...
        </div>

        <button
          type="button"
          className="hidden items-center gap-3 rounded-2xl border bg-white px-4 py-2 text-left sm:flex"
          onClick={() => router.push("/settings")}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {user?.name?.charAt(0) || "A"}
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">
              {user?.name || "Admin MANDA"}
            </span>
            <span className="block text-[10px] font-medium text-slate-500">
              {user?.email || "admin@manda.sch.id"}
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
