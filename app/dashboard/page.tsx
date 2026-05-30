"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  Users,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Siswa",
      value: "720",
      icon: Users,
    },
    {
      title: "Total Guru",
      value: "58",
      icon: GraduationCap,
    },
    {
      title: "Total Kelas",
      value: "24",
      icon: BookOpen,
    },
    {
      title: "Kehadiran Hari Ini",
      value: "94%",
      icon: ClipboardCheck,
    },
  ];

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">
            Selamat datang di sistem akademik MANDA Gate.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  <Icon size={20} className="text-emerald-700" />
                </CardHeader>

                <CardContent>
                  <p className="text-2xl font-bold">{item.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays size={20} />
                Jadwal Hari Ini
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="font-semibold">Matematika</p>
                <p className="text-sm text-slate-500">
                  07.00 - 08.30 | X IPA 1
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-semibold">Informatika</p>
                <p className="text-sm text-slate-500">
                  08.30 - 10.00 | XI IPA 1
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone size={20} />
                Pengumuman Terbaru
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="font-semibold">Ujian Tengah Semester</p>
                <p className="text-sm text-slate-500">
                  UTS akan dilaksanakan mulai minggu depan.
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <p className="font-semibold">Kegiatan Madrasah</p>
                <p className="text-sm text-slate-500">
                  Seluruh siswa mengikuti apel pagi hari Senin.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardLayout>
  );
}