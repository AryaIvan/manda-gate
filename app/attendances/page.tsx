"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AttendanceBadge } from "@/components/shared/attendance-badge";
import { getAttendances } from "@/services/attendance-service";
import { useAuthStore } from "@/store/auth-store";
import { Attendance, AttendanceStatus } from "@/types/attendance";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AttendanceForm = {
  studentName: string;
  className: string;
  subject: string;
  teacher: string;
  date: string;
  status: AttendanceStatus;
  note: string;
};

const defaultForm: AttendanceForm = {
  studentName: "Ahmad Fauzi",
  className: "X IPA 1",
  subject: "Matematika",
  teacher: "Drs. Ahmad Zainuddin",
  date: "2026-05-30",
  status: "PRESENT",
  note: "",
};

const classOptions = [
  "X IPA 1",
  "X IPS 1",
  "XI IPA 1",
  "XI IPS 1",
  "XI Agama",
  "XII IPA 1",
  "XII IPS 1",
  "XII Agama",
];

function attendanceToForm(attendance: Attendance): AttendanceForm {
  return {
    studentName: attendance.studentName,
    className: attendance.className,
    subject: attendance.subject,
    teacher: attendance.teacher,
    date: attendance.date,
    status: attendance.status,
    note: attendance.note || "",
  };
}

function getStatusText(status: AttendanceStatus) {
  if (status === "PRESENT") return "Hadir";
  if (status === "PERMISSION") return "Izin";
  if (status === "SICK") return "Sakit";
  if (status === "ABSENT") return "Alfa";
  if (status === "LATE") return "Terlambat";
  return status;
}

function getGradeFromClass(className: string) {
  if (className.startsWith("XII")) return "XII";
  if (className.startsWith("XI")) return "XI";
  return "X";
}

function groupAttendancesByClass(attendances: Attendance[]) {
  return attendances.reduce<Record<string, Attendance[]>>((groups, item) => {
    if (!groups[item.className]) {
      groups[item.className] = [];
    }

    groups[item.className].push(item);
    return groups;
  }, {});
}

function groupAttendancesByStudent(attendances: Attendance[]) {
  return attendances.reduce<Record<string, Attendance[]>>((groups, item) => {
    if (!groups[item.studentName]) {
      groups[item.studentName] = [];
    }

    groups[item.studentName].push(item);
    return groups;
  }, {});
}

function getAttendanceSummary(items: Attendance[]) {
  const present = items.filter((item) => item.status === "PRESENT").length;
  const permission = items.filter((item) => item.status === "PERMISSION").length;
  const sick = items.filter((item) => item.status === "SICK").length;
  const absent = items.filter((item) => item.status === "ABSENT").length;
  const late = items.filter((item) => item.status === "LATE").length;

  const attendanceRate =
    items.length === 0 ? 0 : Math.round((present / items.length) * 100);

  return {
    present,
    permission,
    sick,
    absent,
    late,
    attendanceRate,
  };
}

function getDominantStatus(items: Attendance[]) {
  const counts = items.reduce<Record<AttendanceStatus, number>>(
    (result, item) => ({
      ...result,
      [item.status]: result[item.status] + 1,
    }),
    {
      PRESENT: 0,
      PERMISSION: 0,
      SICK: 0,
      ABSENT: 0,
      LATE: 0,
    },
  );

  return (Object.entries(counts) as Array<[AttendanceStatus, number]>).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}

export default function AttendancesPage() {
  const { token } = useAuthStore();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [classFilter, setClassFilter] = useState("Semua");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [addOpen, setAddOpen] = useState(false);
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentClass, setSelectedStudentClass] = useState("");
  const [form, setForm] = useState<AttendanceForm>(defaultForm);

  useEffect(() => {
    async function fetchAttendances() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getAttendances(token);
        setAttendances(
          response.data.map((item) => ({
            id: item.id,
            studentName: item.student?.fullName ?? "-",
            className: item.class?.name ?? "-",
            subject: item.subject?.name ?? "-",
            teacher: item.teacher?.fullName ?? "-",
            date: item.date.slice(0, 10),
            status: item.status,
            note: item.note ?? "",
          })),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat data absensi dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAttendances();
  }, [token]);

  const filteredAttendances = useMemo(() => {
    return attendances.filter((attendance) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        attendance.studentName.toLowerCase().includes(keyword) ||
        attendance.className.toLowerCase().includes(keyword) ||
        attendance.subject.toLowerCase().includes(keyword) ||
        attendance.teacher.toLowerCase().includes(keyword) ||
        getStatusText(attendance.status).toLowerCase().includes(keyword);

      const matchClass =
        classFilter === "Semua" || attendance.className === classFilter;

      const matchDate = !dateFilter || attendance.date === dateFilter;

      const matchStatus =
        statusFilter === "Semua" || attendance.status === statusFilter;

      return matchSearch && matchClass && matchDate && matchStatus;
    });
  }, [attendances, search, classFilter, dateFilter, statusFilter]);

  const groupedAttendances = useMemo(() => {
    return groupAttendancesByClass(filteredAttendances);
  }, [filteredAttendances]);

  const classNames = Object.keys(groupedAttendances);

  const selectedStudentAttendances = attendances
    .filter(
      (attendance) =>
        attendance.studentName === selectedStudentName &&
        attendance.className === selectedStudentClass,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const handleChange = (field: keyof AttendanceForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value as AttendanceForm[keyof AttendanceForm],
    }));
  };

  const validateForm = () => {
    if (
      !form.studentName ||
      !form.className ||
      !form.subject ||
      !form.teacher ||
      !form.date
    ) {
      alert("Siswa, kelas, mapel, guru, dan tanggal wajib diisi.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newAttendance: Attendance = {
      id: Date.now().toString(),
      studentName: form.studentName,
      className: form.className,
      subject: form.subject,
      teacher: form.teacher,
      date: form.date,
      status: form.status,
      note: form.note,
    };

    setAttendances((previous) => [newAttendance, ...previous]);
    setForm(defaultForm);
    setAddOpen(false);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAttendance) return;
    if (!validateForm()) return;

    const updatedAttendance: Attendance = {
      ...selectedAttendance,
      studentName: form.studentName,
      className: form.className,
      subject: form.subject,
      teacher: form.teacher,
      date: form.date,
      status: form.status,
      note: form.note,
    };

    setAttendances((previous) =>
      previous.map((attendance) =>
        attendance.id === selectedAttendance.id ? updatedAttendance : attendance
      )
    );

    setSelectedAttendance(null);
    setForm(defaultForm);
    setEditOpen(false);
  };

  const handleStudentDetail = (studentName: string, className: string) => {
    setSelectedStudentName(studentName);
    setSelectedStudentClass(className);
    setStudentDetailOpen(true);
  };

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setForm(attendanceToForm(attendance));
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus data absensi ini?");

    if (!confirmed) return;

    setAttendances((previous) =>
      previous.filter((attendance) => attendance.id !== id)
    );
  };

  const resetFilter = () => {
    setSearch("");
    setClassFilter("Semua");
    setStatusFilter("Semua");
    setDateFilter("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">
          Memuat data absensi dari backend...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <section className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Akademik / Absensi
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Rekap Absensi Per Kelas
            </h1>
            <p className="mt-1 text-slate-500">
              Card kelas menampilkan daftar siswa. Klik nama siswa untuk
              melihat semua riwayat absensinya.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Rekap
            </Button>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setForm(defaultForm);
                setAddOpen(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Input Absensi
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_160px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari siswa, kelas, mapel, guru..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option value="Semua">Kelas</option>
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <Input
                className="h-11 rounded-2xl bg-slate-50"
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Semua">Status</option>
                <option value="PRESENT">Hadir</option>
                <option value="PERMISSION">Izin</option>
                <option value="SICK">Sakit</option>
                <option value="ABSENT">Alfa</option>
                <option value="LATE">Terlambat</option>
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

        <div className="grid gap-5">
          {classNames.map((className) => {
            const classAttendances = groupedAttendances[className];
            const summary = getAttendanceSummary(classAttendances);

            return (
              <AttendanceClassCard
                key={className}
                classNameText={className}
                attendances={classAttendances}
                summary={summary}
                onStudentDetail={handleStudentDetail}
              />
            );
          })}

          {classNames.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-10 text-center text-slate-500">
                Data absensi tidak ditemukan.
              </CardContent>
            </Card>
          )}
        </div>

        <AttendanceFormDialog
          title="Input Absensi Siswa"
          description="Masukkan data kehadiran siswa."
          open={addOpen}
          onOpenChange={setAddOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleAddSubmit}
          submitLabel="Simpan Absensi"
        />

        <AttendanceFormDialog
          title="Edit Absensi Siswa"
          description="Ubah data kehadiran siswa."
          open={editOpen}
          onOpenChange={setEditOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleEditSubmit}
          submitLabel="Simpan Perubahan"
        />

        <StudentAttendanceDetailDialog
          open={studentDetailOpen}
          onOpenChange={setStudentDetailOpen}
          studentName={selectedStudentName}
          classNameText={selectedStudentClass}
          attendances={selectedStudentAttendances}
          onEdit={(attendance) => {
            setStudentDetailOpen(false);
            handleEdit(attendance);
          }}
          onDelete={handleDelete}
        />
      </section>
    </DashboardLayout>
  );
}

type AttendanceSummary = {
  present: number;
  permission: number;
  sick: number;
  absent: number;
  late: number;
  attendanceRate: number;
};

function AttendanceClassCard({
  classNameText,
  attendances,
  summary,
  onStudentDetail,
}: {
  classNameText: string;
  attendances: Attendance[];
  summary: AttendanceSummary;
  onStudentDetail: (studentName: string, className: string) => void;
}) {
  const groupedStudents = groupAttendancesByStudent(attendances);
  const studentNames = Object.keys(groupedStudents);

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 border-b bg-slate-50 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-extrabold text-white sm:h-14 sm:w-14 sm:rounded-3xl sm:text-xl">
              {getGradeFromClass(classNameText)}
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-extrabold text-slate-900">
                {classNameText}
              </h2>
              <p className="text-sm leading-6 text-slate-500">
                {studentNames.length} siswa • {attendances.length} absensi
                tercatat
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Kehadiran</p>
            <p className="text-2xl font-extrabold text-emerald-600">
              {summary.attendanceRate}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b p-4 sm:grid-cols-3 xl:grid-cols-5">
          <SummaryBox label="Hadir" value={summary.present} />
          <SummaryBox label="Izin" value={summary.permission} />
          <SummaryBox label="Sakit" value={summary.sick} />
          <SummaryBox label="Alfa" value={summary.absent} />
          <SummaryBox label="Terlambat" value={summary.late} />
        </div>

        <div className="divide-y">
          {studentNames.map((studentName) => {
            const studentAttendances = groupedStudents[studentName];
            const studentSummary = getAttendanceSummary(studentAttendances);
            const dominantStatus = getDominantStatus(studentAttendances);

            return (
            <button
              key={studentName}
              type="button"
              onClick={() => onStudentDetail(studentName, classNameText)}
              className="flex w-full flex-col gap-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="min-w-0 xl:flex-1">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                    {studentName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="whitespace-normal break-words font-bold leading-6 text-slate-900">
                      {studentName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {studentAttendances.length} absensi tercatat
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                <div className="min-w-[120px] rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Kehadiran
                  </p>
                  <p className="text-lg font-extrabold text-emerald-600">
                    {studentSummary.attendanceRate}%
                  </p>
                </div>

                <div className="min-w-[150px] rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Status dominan
                  </p>
                  <AttendanceBadge status={dominantStatus} />
                </div>

                <div className="flex min-w-[100px] items-center justify-start gap-2 rounded-2xl bg-slate-50 px-4 py-3 xl:justify-center">
                  <Eye size={18} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-500">
                    Detail
                  </span>
                </div>
              </div>
            </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

type AttendanceFormDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: AttendanceForm;
  onChange: (field: keyof AttendanceForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
};

function AttendanceFormDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  submitLabel,
}: AttendanceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(920px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(event) => onChange("date", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status Kehadiran</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(event) =>
                  onChange("status", event.target.value as AttendanceStatus)
                }
              >
                <option value="PRESENT">Hadir</option>
                <option value="PERMISSION">Izin</option>
                <option value="SICK">Sakit</option>
                <option value="ABSENT">Alfa</option>
                <option value="LATE">Terlambat</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Nama Siswa</Label>
              <Input
                placeholder="Contoh: Ahmad Fauzi"
                value={form.studentName}
                onChange={(event) =>
                  onChange("studentName", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.className}
                onChange={(event) => onChange("className", event.target.value)}
              >
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.subject}
                onChange={(event) => onChange("subject", event.target.value)}
              >
                <option value="Al-Qur'an Hadis">Al-Qur&apos;an Hadis</option>
                <option value="Akidah Akhlak">Akidah Akhlak</option>
                <option value="Fikih">Fikih</option>
                <option value="Bahasa Arab">Bahasa Arab</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                <option value="Bahasa Inggris">Bahasa Inggris</option>
                <option value="Matematika">Matematika</option>
                <option value="Biologi">Biologi</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
                <option value="Ekonomi">Ekonomi</option>
                <option value="Geografi">Geografi</option>
                <option value="Sosiologi">Sosiologi</option>
                <option value="Informatika">Informatika</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Guru Pengajar</Label>
              <Input
                placeholder="Contoh: Drs. Ahmad Zainuddin"
                value={form.teacher}
                onChange={(event) => onChange("teacher", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Catatan</Label>
              <Input
                placeholder="Contoh: Hadir tepat waktu"
                value={form.note}
                onChange={(event) => onChange("note", event.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>

            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type StudentAttendanceDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  classNameText: string;
  attendances: Attendance[];
  onEdit: (attendance: Attendance) => void;
  onDelete: (id: string) => void;
};

function StudentAttendanceDetailDialog({
  open,
  onOpenChange,
  studentName,
  classNameText,
  attendances,
  onEdit,
  onDelete,
}: StudentAttendanceDetailDialogProps) {
  const summary = getAttendanceSummary(attendances);
  const dominantStatus =
    attendances.length > 0 ? getDominantStatus(attendances) : "PRESENT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(1180px,calc(100vw-32px))] !max-w-none max-h-[92vh] overflow-hidden rounded-3xl p-0">
        <DialogHeader className="border-b bg-white px-6 py-5 pr-14">
          <DialogTitle className="text-xl font-extrabold text-slate-900">
            Detail Absensi {studentName}
          </DialogTitle>
          <DialogDescription>
            Semua riwayat absensi berdasarkan tanggal, mata pelajaran, guru,
            status kehadiran, dan catatan.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-92px)] overflow-y-auto bg-slate-50 p-5">
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-0">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-extrabold text-white">
                  {studentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-extrabold text-slate-900">
                    {studentName}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {classNameText}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700">
                    Kehadiran
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-700">
                    {summary.attendanceRate}%
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold text-slate-500">
                    Status Dominan
                  </p>
                  <AttendanceBadge status={dominantStatus} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <AttendanceMiniStat label="Tercatat" value={attendances.length} />
                <AttendanceMiniStat label="Hadir" value={summary.present} />
                <AttendanceMiniStat label="Izin" value={summary.permission} />
                <AttendanceMiniStat label="Sakit" value={summary.sick} />
                <AttendanceMiniStat label="Alfa" value={summary.absent} />
                <AttendanceMiniStat label="Telat" value={summary.late} />
              </div>
            </aside>

            <section className="space-y-4">
              {attendances.map((attendance) => (
                <div
                  key={attendance.id}
                  className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-emerald-200"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CalendarCheck
                          size={18}
                          className="text-emerald-700"
                        />
                        <h4 className="font-extrabold text-slate-900">
                          {attendance.subject}
                        </h4>
                        <AttendanceBadge status={attendance.status} />
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p>
                          <span className="font-semibold text-slate-900">
                            Tanggal:
                          </span>{" "}
                          {attendance.date}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-900">
                            Guru:
                          </span>{" "}
                          {attendance.teacher}
                        </p>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        <span className="font-semibold text-slate-900">
                          Catatan:
                        </span>{" "}
                        {attendance.note || "-"}
                      </p>
                    </div>

                    <div className="flex justify-start gap-2 xl:justify-end">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onEdit(attendance)}
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDelete(attendance.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {attendances.length === 0 && (
                <div className="rounded-2xl border bg-white px-5 py-10 text-center text-slate-500">
                  Belum ada riwayat absensi untuk siswa ini.
                </div>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AttendanceMiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
