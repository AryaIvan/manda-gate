"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnnouncements, AnnouncementItem } from "@/services/announcement-service";
import { getAttendances } from "@/services/attendance-service";
import { getGrades } from "@/services/grade-service";
import { getLeaveRequests } from "@/services/leave-request-service";
import { getSummaryReport, SummaryReport } from "@/services/report-service";
import { getSchedules, ScheduleItem } from "@/services/schedule-service";
import { useAuthStore } from "@/store/auth-store";
import { UserRole } from "@/types/auth";

type DashboardStat = {
  title: string;
  value: string;
  icon: typeof Users;
};

const roleDescriptions: Record<UserRole, string> = {
  ADMIN: "Ringkasan seluruh data akademik dan administrasi madrasah.",
  TEACHER: "Fokus pada jadwal mengajar, absensi, nilai, dan pengumuman.",
  HOMEROOM_TEACHER: "Pantau siswa kelas, absensi, nilai, surat izin, dan laporan kelas.",
  STUDENT: "Lihat jadwal, nilai, absensi, surat izin, dan pengumuman milik sendiri.",
  BK: "Pantau data siswa, surat izin, prestasi, dan laporan kesiswaan.",
  HEADMASTER: "Lihat ringkasan sistem, statistik akademik, dan laporan madrasah.",
};

function formatNumber(value?: number) {
  return String(value ?? 0);
}

function getTodayName() {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date());
}

function buildStats(role: UserRole, summary: SummaryReport | null, counts: {
  schedulesToday: number;
  attendancesToday: number;
  grades: number;
  pendingLeaves: number;
  announcements: number;
}) {
  if (role === "STUDENT") {
    return [
      { title: "Jadwal Hari Ini", value: formatNumber(counts.schedulesToday), icon: CalendarDays },
      { title: "Absensi Tercatat", value: formatNumber(counts.attendancesToday), icon: ClipboardCheck },
      { title: "Nilai Tersedia", value: formatNumber(counts.grades), icon: FileText },
      { title: "Status Surat Izin", value: formatNumber(counts.pendingLeaves), icon: UserCheck },
    ];
  }

  if (role === "TEACHER") {
    return [
      { title: "Jadwal Mengajar", value: formatNumber(counts.schedulesToday), icon: CalendarDays },
      { title: "Absensi Hari Ini", value: formatNumber(counts.attendancesToday), icon: ClipboardCheck },
      { title: "Nilai Diinput", value: formatNumber(counts.grades), icon: FileText },
      { title: "Pengumuman Aktif", value: formatNumber(counts.announcements), icon: Megaphone },
    ];
  }

  if (role === "HOMEROOM_TEACHER") {
    return [
      { title: "Total Siswa", value: formatNumber(summary?.studentCount), icon: Users },
      { title: "Absensi Hari Ini", value: formatNumber(counts.attendancesToday), icon: ClipboardCheck },
      { title: "Surat Izin Menunggu", value: formatNumber(counts.pendingLeaves), icon: UserCheck },
      { title: "Laporan Kelas", value: formatNumber(summary?.classCount), icon: FileText },
    ];
  }

  if (role === "BK") {
    return [
      { title: "Total Siswa", value: formatNumber(summary?.studentCount), icon: Users },
      { title: "Surat Izin Menunggu", value: formatNumber(counts.pendingLeaves), icon: UserCheck },
      { title: "Prestasi Tercatat", value: formatNumber(summary?.achievementsCount), icon: ShieldCheck },
      { title: "Pengumuman Aktif", value: formatNumber(counts.announcements), icon: Megaphone },
    ];
  }

  return [
    { title: "Total Siswa", value: formatNumber(summary?.studentCount), icon: Users },
    { title: "Total Guru", value: formatNumber(summary?.teacherCount), icon: GraduationCap },
    { title: "Total Kelas", value: formatNumber(summary?.classCount), icon: BookOpen },
    { title: "Absensi Hari Ini", value: formatNumber(counts.attendancesToday), icon: ClipboardCheck },
  ];
}

export default function DashboardPage() {
  const { token, user } = useAuthStore();
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [counts, setCounts] = useState({
    schedulesToday: 0,
    attendancesToday: 0,
    grades: 0,
    pendingLeaves: 0,
    announcements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const role = user?.role ?? "ADMIN";

  const fetchDashboard = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      const [
        summaryResponse,
        schedulesResponse,
        attendanceResponse,
        gradeResponse,
        leaveResponse,
        announcementResponse,
      ] = await Promise.all([
        getSummaryReport(token),
        getSchedules(token),
        getAttendances(token),
        getGrades(token),
        getLeaveRequests(token),
        getAnnouncements(token),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const todayName = getTodayName().toLowerCase();
      const activeAnnouncements = announcementResponse.data.filter(
        (item) => item.status === "ACTIVE" && (item.targetRole === "ALL" || item.targetRole === role),
      );

      setSummary(summaryResponse.data);
      setSchedules(
        schedulesResponse.data.filter((item) => item.day.toLowerCase() === todayName).slice(0, 5),
      );
      setAnnouncements(activeAnnouncements.slice(0, 5));
      setCounts({
        schedulesToday: schedulesResponse.data.filter(
          (item) => item.day.toLowerCase() === todayName,
        ).length,
        attendancesToday: attendanceResponse.data.filter((item) =>
          item.date.startsWith(today),
        ).length,
        grades: gradeResponse.data.length,
        pendingLeaves: leaveResponse.data.filter((item) => item.status === "Menunggu").length,
        announcements: activeAnnouncements.length,
      });
      setLastUpdated(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Dashboard gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [role, token]);

  useEffect(() => {
    const initialRefreshId = window.setTimeout(fetchDashboard, 0);
    const intervalId = window.setInterval(fetchDashboard, 30000);

    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
    };
  }, [fetchDashboard]);

  const stats = useMemo(
    () => buildStats(role, summary, counts) as DashboardStat[],
    [counts, role, summary],
  );

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">{roleDescriptions[role]}</p>
          {lastUpdated && (
            <p className="mt-1 text-xs font-semibold text-emerald-700">
              Auto-refresh aktif. Terakhir sinkron:{" "}
              {lastUpdated.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {item.title}
                  </CardTitle>
                  <Icon size={20} className="text-emerald-700" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {loading ? "-" : item.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays size={20} />
                Jadwal Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {schedules.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <p className="font-bold text-slate-900">
                    {item.subject?.name ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.startTime} - {item.endTime} | {item.class?.name ?? "-"} |{" "}
                    {item.teacher?.fullName ?? "-"}
                  </p>
                </div>
              ))}

              {!loading && schedules.length === 0 && (
                <div className="rounded-2xl border p-6 text-center text-slate-500">
                  Tidak ada jadwal hari ini.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone size={20} />
                Pengumuman Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {item.content}
                  </p>
                </div>
              ))}

              {!loading && announcements.length === 0 && (
                <div className="rounded-2xl border p-6 text-center text-slate-500">
                  Belum ada pengumuman aktif untuk role ini.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardLayout>
  );
}
