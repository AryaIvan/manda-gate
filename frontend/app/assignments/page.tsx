"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Search,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const assignments = [
  {
    title: "Latihan Integral Dasar",
    subject: "Matematika",
    className: "XI IPA 1",
    teacher: "Drs. Ahmad Zainuddin",
    dueDate: "2026-06-03",
    status: "Aktif",
    submitted: 24,
    total: 32,
  },
  {
    title: "Resume Sejarah Peradaban Islam",
    subject: "SKI",
    className: "X Agama",
    teacher: "Dra. Siti Aminah",
    dueDate: "2026-06-05",
    status: "Draft",
    submitted: 0,
    total: 28,
  },
  {
    title: "Praktikum Jaringan Komputer",
    subject: "Informatika",
    className: "XII IPA 1",
    teacher: "Muhammad Rizky, S.Kom",
    dueDate: "2026-06-01",
    status: "Aktif",
    submitted: 29,
    total: 30,
  },
];

export default function AssignmentsPage() {
  const [search, setSearch] = useState("");

  const filteredAssignments = useMemo(() => {
    const keyword = search.toLowerCase();

    return assignments.filter((assignment) =>
      [
        assignment.title,
        assignment.subject,
        assignment.className,
        assignment.teacher,
        assignment.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [search]);

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Dashboard / Akademik / Tugas</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Tugas</h1>
            <p className="mt-1 text-slate-500">
              Pantau tugas, tenggat, dan progres pengumpulan siswa.
            </p>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus size={16} className="mr-2" />
            Buat Tugas
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={FileText} label="Total Tugas" value="18" />
          <SummaryCard icon={Clock3} label="Menunggu Nilai" value="7" />
          <SummaryCard icon={CheckCircle2} label="Selesai" value="11" />
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className="h-11 rounded-2xl bg-slate-50 pl-9"
                placeholder="Cari tugas, mapel, kelas, atau guru..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.title} className="border-0 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {assignment.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {assignment.subject} • {assignment.className}
                    </p>
                  </div>
                  <Badge
                    className={
                      assignment.status === "Aktif"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }
                  >
                    {assignment.status}
                  </Badge>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={16} />
                    Tenggat {assignment.dueDate}
                  </div>
                  <p className="mt-2">Pengampu: {assignment.teacher}</p>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
                    <span>Pengumpulan</span>
                    <span>
                      {assignment.submitted}/{assignment.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width: `${(assignment.submitted / assignment.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon size={22} />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
