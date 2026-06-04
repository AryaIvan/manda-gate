"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Eye,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getSchedules } from "@/services/schedule-service";
import { useAuthStore } from "@/store/auth-store";
import { Schedule } from "@/types/schedule";

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
import { Badge } from "@/components/ui/badge";

type ScheduleForm = {
  day: Schedule["day"];
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  className: string;
  room: string;
  semester: Schedule["semester"];
  academicYear: string;
  isActive: "Aktif" | "Tidak Aktif";
};

const defaultForm: ScheduleForm = {
  day: "Senin",
  startTime: "07:00",
  endTime: "08:30",
  subject: "Matematika",
  teacher: "Drs. Ahmad Zainuddin",
  className: "X IPA 1",
  room: "Ruang 101",
  semester: "Ganjil",
  academicYear: "2026/2027",
  isActive: "Aktif",
};

function scheduleToForm(schedule: Schedule): ScheduleForm {
  return {
    day: schedule.day,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    subject: schedule.subject,
    teacher: schedule.teacher,
    className: schedule.className,
    room: schedule.room,
    semester: schedule.semester,
    academicYear: schedule.academicYear,
    isActive: schedule.isActive ? "Aktif" : "Tidak Aktif",
  };
}

function groupSchedulesByClass(schedules: Schedule[]) {
  return schedules.reduce<Record<string, Schedule[]>>((groups, schedule) => {
    if (!groups[schedule.className]) {
      groups[schedule.className] = [];
    }

    groups[schedule.className].push(schedule);
    return groups;
  }, {});
}

const dayOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function sortSchedules(schedules: Schedule[]) {
  return [...schedules].sort((a, b) => {
    const dayCompare = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);

    if (dayCompare !== 0) return dayCompare;

    return a.startTime.localeCompare(b.startTime);
  });
}

export default function SchedulesPage() {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [dayFilter, setDayFilter] = useState("Semua");
  const [classFilter, setClassFilter] = useState("Semua");
  const [semesterFilter, setSemesterFilter] = useState("Semua");

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [form, setForm] = useState<ScheduleForm>(defaultForm);

  useEffect(() => {
    async function fetchSchedules() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getSchedules(token);
        setSchedules(
          response.data.map((item) => ({
            id: item.id,
            day: item.day as Schedule["day"],
            startTime: item.startTime,
            endTime: item.endTime,
            subject: item.subject?.name ?? "-",
            teacher: item.teacher?.fullName ?? "-",
            className: item.class?.name ?? "-",
            room: item.room,
            semester: item.semester as Schedule["semester"],
            academicYear: item.academicYear,
            isActive: item.status === "ACTIVE",
          })),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat data jadwal dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [token]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        schedule.day.toLowerCase().includes(keyword) ||
        schedule.subject.toLowerCase().includes(keyword) ||
        schedule.teacher.toLowerCase().includes(keyword) ||
        schedule.className.toLowerCase().includes(keyword) ||
        schedule.room.toLowerCase().includes(keyword) ||
        schedule.semester.toLowerCase().includes(keyword) ||
        schedule.academicYear.toLowerCase().includes(keyword);

      const matchDay = dayFilter === "Semua" || schedule.day === dayFilter;

      const matchClass =
        classFilter === "Semua" || schedule.className === classFilter;

      const matchSemester =
        semesterFilter === "Semua" || schedule.semester === semesterFilter;

      return matchSearch && matchDay && matchClass && matchSemester;
    });
  }, [schedules, search, dayFilter, classFilter, semesterFilter]);

  const groupedSchedules = useMemo(() => {
    return groupSchedulesByClass(sortSchedules(filteredSchedules));
  }, [filteredSchedules]);

  const classNames = Object.keys(groupedSchedules);

  const handleChange = (field: keyof ScheduleForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value as ScheduleForm[keyof ScheduleForm],
    }));
  };

  const validateForm = () => {
    if (
      !form.day ||
      !form.startTime ||
      !form.endTime ||
      !form.subject ||
      !form.teacher ||
      !form.className
    ) {
      alert("Hari, jam, mata pelajaran, guru, dan kelas wajib diisi.");
      return false;
    }

    if (form.startTime >= form.endTime) {
      alert("Jam mulai harus lebih awal dari jam selesai.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      subject: form.subject,
      teacher: form.teacher,
      className: form.className,
      room: form.room,
      semester: form.semester,
      academicYear: form.academicYear,
      isActive: form.isActive === "Aktif",
    };

    setSchedules((previous) => [newSchedule, ...previous]);
    setForm(defaultForm);
    setAddOpen(false);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSchedule) return;
    if (!validateForm()) return;

    const updatedSchedule: Schedule = {
      ...selectedSchedule,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      subject: form.subject,
      teacher: form.teacher,
      className: form.className,
      room: form.room,
      semester: form.semester,
      academicYear: form.academicYear,
      isActive: form.isActive === "Aktif",
    };

    setSchedules((previous) =>
      previous.map((schedule) =>
        schedule.id === selectedSchedule.id ? updatedSchedule : schedule
      )
    );

    setSelectedSchedule(null);
    setForm(defaultForm);
    setEditOpen(false);
  };

  const handleDetail = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setForm(scheduleToForm(schedule));
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus jadwal ini?");

    if (!confirmed) return;

    setSchedules((previous) =>
      previous.filter((schedule) => schedule.id !== id)
    );
  };

  const resetFilter = () => {
    setSearch("");
    setDayFilter("Semua");
    setClassFilter("Semua");
    setSemesterFilter("Semua");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">
          Memuat data jadwal dari backend...
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
              Dashboard / Akademik / Jadwal Pelajaran
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Jadwal Pelajaran Per Kelas
            </h1>
            <p className="mt-1 text-slate-500">
              Jadwal dikelompokkan berdasarkan kelas agar lebih mudah dibaca.
            </p>
          </div>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setForm(defaultForm);
              setAddOpen(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Tambah Jadwal
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_140px_160px_150px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari mapel, guru, kelas, ruang..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={dayFilter}
                onChange={(event) => setDayFilter(event.target.value)}
              >
                <option value="Semua">Hari</option>
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option value="Semua">Kelas</option>
                <option value="X IPA 1">X IPA 1</option>
                <option value="X IPS 1">X IPS 1</option>
                <option value="XI IPA 1">XI IPA 1</option>
                <option value="XI IPS 1">XI IPS 1</option>
                <option value="XII IPA 1">XII IPA 1</option>
                <option value="XII IPS 1">XII IPS 1</option>
                <option value="X Agama">X Agama</option>
                <option value="XI Agama">XI Agama</option>
                <option value="XII Agama">XII Agama</option>
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={semesterFilter}
                onChange={(event) => setSemesterFilter(event.target.value)}
              >
                <option value="Semua">Semester</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
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

        <div className="space-y-5">
          {classNames.map((className) => {
            const classSchedules = groupedSchedules[className];

            return (
              <Card key={className} className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-3 border-b bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <CalendarDays size={20} />
                        </div>

                        <div>
                          <h2 className="text-lg font-extrabold text-slate-900">
                            {className}
                          </h2>
                          <p className="text-sm text-slate-500">
                            {classSchedules.length} jadwal pelajaran
                          </p>
                        </div>
                      </div>
                    </div>

                    <Badge className="w-fit rounded-full bg-emerald-100 px-4 py-1 text-emerald-700 hover:bg-emerald-100">
                      2026/2027
                    </Badge>
                  </div>

                  <div className="divide-y">
                    {classSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="grid gap-4 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[140px_1fr_220px_140px_120px]"
                      >
                        <div>
                          <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                            {schedule.day}
                          </Badge>

                          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Clock size={15} />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {schedule.subject}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <User size={15} />
                            {schedule.teacher}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={15} />
                            {schedule.room}
                          </div>

                          <Badge variant="outline" className="rounded-full">
                            {schedule.semester}
                          </Badge>
                        </div>

                        <div>
                          {schedule.isActive ? (
                            <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-red-100 px-3 py-1 text-red-700 hover:bg-red-100">
                              Tidak Aktif
                            </Badge>
                          )}
                        </div>

                        <div className="flex justify-start gap-2 lg:justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDetail(schedule)}
                          >
                            <Eye size={16} />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Pencil size={16} />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {classNames.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-10 text-center text-slate-500">
                Data jadwal tidak ditemukan.
              </CardContent>
            </Card>
          )}
        </div>

        <ScheduleFormDialog
          title="Tambah Jadwal Pelajaran"
          description="Masukkan data jadwal pelajaran baru."
          open={addOpen}
          onOpenChange={setAddOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleAddSubmit}
          submitLabel="Simpan Jadwal"
        />

        <ScheduleFormDialog
          title="Edit Jadwal Pelajaran"
          description="Ubah data jadwal pelajaran yang sudah terdaftar."
          open={editOpen}
          onOpenChange={setEditOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleEditSubmit}
          submitLabel="Simpan Perubahan"
        />

        <ScheduleDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          schedule={selectedSchedule}
        />
      </section>
    </DashboardLayout>
  );
}

type ScheduleFormDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ScheduleForm;
  onChange: (field: keyof ScheduleForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
};

function ScheduleFormDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  submitLabel,
}: ScheduleFormDialogProps) {
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
              <Label>Hari</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.day}
                onChange={(event) => onChange("day", event.target.value)}
              >
                <option value="Senin">Senin</option>
                <option value="Selasa">Selasa</option>
                <option value="Rabu">Rabu</option>
                <option value="Kamis">Kamis</option>
                <option value="Jumat">Jumat</option>
                <option value="Sabtu">Sabtu</option>
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
              <Label>Jam Mulai</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(event) => onChange("startTime", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Jam Selesai</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(event) => onChange("endTime", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Guru Pengajar</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.teacher}
                onChange={(event) => onChange("teacher", event.target.value)}
              >
                <option value="Drs. Ahmad Zainuddin">
                  Drs. Ahmad Zainuddin
                </option>
                <option value="Siti Rahmawati, S.Pd">
                  Siti Rahmawati, S.Pd
                </option>
                <option value="Muhammad Hasan, S.Ag">
                  Muhammad Hasan, S.Ag
                </option>
                <option value="Nurul Hidayah, S.Pd">
                  Nurul Hidayah, S.Pd
                </option>
                <option value="Budi Santoso, S.Kom">
                  Budi Santoso, S.Kom
                </option>
                <option value="Aisyah Fitriani, S.Pd">
                  Aisyah Fitriani, S.Pd
                </option>
                <option value="Agus Prasetyo, S.Pd">
                  Agus Prasetyo, S.Pd
                </option>
                <option value="Dewi Lestari, S.Pd">
                  Dewi Lestari, S.Pd
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.className}
                onChange={(event) => onChange("className", event.target.value)}
              >
                <option value="X IPA 1">X IPA 1</option>
                <option value="X IPS 1">X IPS 1</option>
                <option value="XI IPA 1">XI IPA 1</option>
                <option value="XI IPS 1">XI IPS 1</option>
                <option value="XII IPA 1">XII IPA 1</option>
                <option value="XII IPS 1">XII IPS 1</option>
                <option value="X Agama">X Agama</option>
                <option value="XI Agama">XI Agama</option>
                <option value="XII Agama">XII Agama</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Ruang</Label>
              <Input
                placeholder="Contoh: Ruang 101"
                value={form.room}
                onChange={(event) => onChange("room", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.semester}
                onChange={(event) => onChange("semester", event.target.value)}
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tahun Ajaran</Label>
              <Input
                placeholder="Contoh: 2026/2027"
                value={form.academicYear}
                onChange={(event) =>
                  onChange("academicYear", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.isActive}
                onChange={(event) => onChange("isActive", event.target.value)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
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

type ScheduleDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
};

function ScheduleDetailDialog({
  open,
  onOpenChange,
  schedule,
}: ScheduleDetailDialogProps) {
  if (!schedule) return null;

  const detailItems = [
    {
      label: "Hari",
      value: schedule.day,
    },
    {
      label: "Jam",
      value: `${schedule.startTime} - ${schedule.endTime}`,
    },
    {
      label: "Mata Pelajaran",
      value: schedule.subject,
    },
    {
      label: "Guru Pengajar",
      value: schedule.teacher,
    },
    {
      label: "Kelas",
      value: schedule.className,
    },
    {
      label: "Ruang",
      value: schedule.room,
    },
    {
      label: "Semester",
      value: schedule.semester,
    },
    {
      label: "Tahun Ajaran",
      value: schedule.academicYear,
    },
    {
      label: "Status",
      value: schedule.isActive ? "Aktif" : "Tidak Aktif",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(760px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Jadwal Pelajaran</DialogTitle>
          <DialogDescription>
            Informasi lengkap jadwal pelajaran MAN 2 Gresik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-slate-50 p-5">
            <div className="flex items-center gap-2">
              <CalendarDays size={20} className="text-emerald-700" />
              <h3 className="text-xl font-extrabold text-slate-900">
                {schedule.subject}
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {schedule.className} • {schedule.day}, {schedule.startTime} -{" "}
              {schedule.endTime}
            </p>
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
