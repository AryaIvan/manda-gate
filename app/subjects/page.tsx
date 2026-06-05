"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, Filter, Search } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuthStore } from "@/store/auth-store";
import { getClasses, ClassItem } from "@/services/class-service";
import { SubjectItem } from "@/services/subject-service";
import { getSchedules, ScheduleItem } from "@/services/schedule-service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function SubjectsPage() {
  const { token } = useAuthStore();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Semua");
  const [majorFilter, setMajorFilter] = useState("Semua");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchSubjectsPageData() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [classResponse, scheduleResponse] = await Promise.all([
          getClasses(token),
          getSchedules(token),
        ]);
        setClasses(classResponse.data);
        setSchedules(scheduleResponse.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat data mata pelajaran.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSubjectsPageData();
  }, [token]);

  const filteredClasses = useMemo(() => {
    const keyword = search.toLowerCase();

    return classes.filter((schoolClass) => {
      const matchesSearch =
        schoolClass.name.toLowerCase().includes(keyword) ||
        schoolClass.major.toLowerCase().includes(keyword) ||
        schoolClass.grade.toLowerCase().includes(keyword);

      const matchesGrade =
        gradeFilter === "Semua" || schoolClass.grade === gradeFilter;

      const matchesMajor =
        majorFilter === "Semua" ||
        schoolClass.major.toUpperCase() === majorFilter.toUpperCase();

      return matchesSearch && matchesGrade && matchesMajor;
    });
  }, [search, gradeFilter, majorFilter, classes]);

  const subjectsByClass = useMemo(() => {
    return schedules.reduce<Record<string, SubjectItem[]>>((groups, schedule) => {
      const classId = schedule.class?.id;
      const subject = schedule.subject;
      if (!classId || !subject) return groups;

      if (!groups[classId]) groups[classId] = [];

      const alreadyExists = groups[classId].some((item) => item.id === subject.id);
      if (!alreadyExists) {
        groups[classId].push({
          id: subject.id,
          name: subject.name,
          code: subject.code ?? undefined,
          classId,
          status: schedule.status,
          class: schedule.class
            ? {
                id: schedule.class.id,
                name: schedule.class.name,
                grade: schedule.class.grade ?? "-",
                major: schedule.class.major ?? "-",
                academicYear: schedule.class.academicYear ?? schedule.academicYear,
              }
            : null,
          teacher: schedule.teacher
            ? {
                id: schedule.teacher.id,
                fullName: schedule.teacher.fullName,
                nip: schedule.teacher.nip ?? undefined,
              }
            : null,
        });
      }

      return groups;
    }, {});
  }, [schedules]);

  const selectedClassSubjects = selectedClassId
    ? subjectsByClass[selectedClassId] ?? []
    : [];

  const openClassSubjects = (schoolClass: ClassItem) => {
    setSelectedClassName(schoolClass.name);
    setSelectedClassId(schoolClass.id);
    setClassDialogOpen(true);
  };

  const openSubjectDetail = (subject: SubjectItem) => {
    setSelectedSubject(subject);
    setSubjectDialogOpen(true);
  };

  const resetFilter = () => {
    setSearch("");
    setGradeFilter("Semua");
    setMajorFilter("Semua");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">
          Memuat data mata pelajaran...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-red-500">
          Gagal memuat data: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Master Data / Mata Pelajaran
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Data Mata Pelajaran
            </h1>
            <p className="mt-1 text-slate-500">
              Pilih kelas untuk melihat mata pelajaran yang sudah masuk jadwal.
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_150px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari kelas atau jurusan..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
              >
                <option value="Semua">Tingkat</option>
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={majorFilter}
                onChange={(event) => setMajorFilter(event.target.value)}
              >
                <option value="Semua">Jurusan</option>
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="AGAMA">Agama</option>
              </select>

              <Button
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={resetFilter}
              >
                <Filter size={16} className="mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((schoolClass) => (
            <button
              key={schoolClass.id}
              type="button"
              onClick={() => openClassSubjects(schoolClass)}
              className="rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {schoolClass.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Jurusan {schoolClass.major}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 font-extrabold text-white">
                  {schoolClass.grade}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    Tingkat
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-900">
                    {schoolClass.grade}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700">
                    Total Mapel
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-emerald-700">
                    {subjectsByClass[schoolClass.id]?.length ?? 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border px-4 py-3">
                <span className="text-sm font-bold text-slate-700">
                  Lihat Mata Pelajaran
                </span>
                <Eye size={17} className="text-emerald-700" />
              </div>
            </button>
          ))}

          {filteredClasses.length === 0 && (
            <div className="col-span-full rounded-3xl border bg-white p-10 text-center text-slate-500">
              Data kelas tidak ditemukan.
            </div>
          )}
        </div>

        <ClassSubjectsDialog
          open={classDialogOpen}
          onOpenChange={setClassDialogOpen}
          classNameText={selectedClassName}
          subjects={selectedClassSubjects}
          onSubjectClick={openSubjectDetail}
        />

        <SubjectDetailDialog
          open={subjectDialogOpen}
          onOpenChange={setSubjectDialogOpen}
          subject={selectedSubject}
        />
      </section>
    </DashboardLayout>
  );
}

function ClassSubjectsDialog({
  open,
  onOpenChange,
  classNameText,
  subjects,
  onSubjectClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classNameText: string;
  subjects: SubjectItem[];
  onSubjectClick: (subject: SubjectItem) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(980px,calc(100vw-32px))]! max-w-none! max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Mata Pelajaran — {classNameText}</DialogTitle>
          <DialogDescription>
            Pilih mata pelajaran untuk melihat detail kode, guru pengampu, dan
            status berdasarkan data jadwal.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => onSubjectClick(subject)}
              className="rounded-2xl border bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900">
                    {subject.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {subject.code ?? "-"} •{" "}
                    {subject.teacher?.fullName ?? "Belum ada guru"}
                  </p>
                </div>

                <Badge
                  className={
                    subject.status === "ACTIVE" || !subject.status
                      ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "rounded-full bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {subject.status === "ACTIVE" || !subject.status
                    ? "Aktif"
                    : "Tidak Aktif"}
                </Badge>
              </div>
            </button>
          ))}

          {subjects.length === 0 && (
            <div className="rounded-2xl border bg-slate-50 p-8 text-center text-slate-500 md:col-span-2">
              Belum ada mata pelajaran di jadwal kelas ini.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubjectDetailDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: SubjectItem | null;
}) {
  if (!subject) return null;

  const detailItems = [
    { label: "Nama Mapel", value: subject.name },
    { label: "Kode", value: subject.code ?? "-" },
    { label: "Kelas", value: subject.class?.name ?? "-" },
    { label: "Tingkat", value: subject.class?.grade ?? subject.grade ?? "-" },
    { label: "Jurusan", value: subject.class?.major ?? subject.major ?? "-" },
    { label: "Tahun Ajaran", value: subject.class?.academicYear ?? "-" },
    { label: "Guru Pengampu", value: subject.teacher?.fullName ?? "-" },
    {
      label: "Status",
      value:
        subject.status === "ACTIVE" || !subject.status
          ? "Aktif"
          : "Tidak Aktif",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(760px,calc(100vw-32px))]! max-w-none! max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Informasi lengkap mata pelajaran di MANDA Gate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <BookOpen size={22} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {subject.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {subject.code ?? "-"} •{" "}
                  {subject.teacher?.fullName ?? "Belum ada guru"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {detailItems.map((item) => (
              <div key={item.label} className="rounded-xl border p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
