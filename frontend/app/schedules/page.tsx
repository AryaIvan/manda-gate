"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "@/services/schedule-service";
import { ClassItem, getClasses } from "@/services/class-service";
import { getSubjects, SubjectItem } from "@/services/subject-service";
import { getTeachers, TeacherItem } from "@/services/teacher-service";
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

function mapScheduleItem(item: Awaited<ReturnType<typeof getSchedules>>["data"][number]): Schedule {
  return {
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
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
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

  const refreshSchedules = useCallback(async (showLoading = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");
      const response = await getSchedules(token);
      setSchedules(response.data.map(mapScheduleItem));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal memuat data jadwal dari backend.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    async function fetchPageData() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [classResponse, subjectResponse, teacherResponse] =
          await Promise.all([
            getClasses(token),
            getSubjects(token),
            getTeachers(token),
          ]);
        setClasses(classResponse.data);
        setSubjects(subjectResponse.data);
        setTeachers(teacherResponse.data);
        await refreshSchedules(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat pilihan jadwal dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, [refreshSchedules, token]);

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

  const selectedClass = useMemo(() => {
    return classes.find((item) => item.name === form.className) ?? null;
  }, [classes, form.className]);

  const selectedSubject = useMemo(() => {
    return subjects.find((item) => item.name === form.subject) ?? null;
  }, [subjects, form.subject]);

  const selectedTeacher = useMemo(() => {
    return teachers.find((item) => item.fullName === form.teacher) ?? null;
  }, [teachers, form.teacher]);

  const classOptions = classes.length ? classes.map((item) => item.name) : [defaultForm.className];

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

  const handleAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm() || !token) return;
    if (!selectedClass || !selectedSubject) {
      alert("Pastikan kelas dan mata pelajaran dipilih dari data backend.");
      return;
    }

    try {
      await createSchedule(token, {
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        subjectId: selectedSubject.id,
        teacherId: selectedTeacher?.id ?? null,
        classId: selectedClass.id,
        room: form.room,
        semester: form.semester,
        academicYear: form.academicYear,
        status: form.isActive === "Aktif" ? "ACTIVE" : "INACTIVE",
      });
      await refreshSchedules(false);
      setForm(defaultForm);
      setAddOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan jadwal.");
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedSchedule || !token) return;
    if (!validateForm()) return;
    if (!selectedClass || !selectedSubject) {
      alert("Pastikan kelas dan mata pelajaran dipilih dari data backend.");
      return;
    }

    try {
      await updateSchedule(token, selectedSchedule.id, {
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        subjectId: selectedSubject.id,
        teacherId: selectedTeacher?.id ?? null,
        classId: selectedClass.id,
        room: form.room,
        semester: form.semester,
        academicYear: form.academicYear,
        status: form.isActive === "Aktif" ? "ACTIVE" : "INACTIVE",
      });
      await refreshSchedules(false);
      setSelectedSchedule(null);
      setForm(defaultForm);
      setEditOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memperbarui jadwal.");
    }
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

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus jadwal ini?");

    if (!confirmed || !token) return;

    try {
      await deleteSchedule(token, id);
      await refreshSchedules(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus jadwal.");
    }
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
              setForm({
                ...defaultForm,
                className: classes[0]?.name ?? defaultForm.className,
                subject: subjects[0]?.name ?? defaultForm.subject,
                teacher: teachers[0]?.fullName ?? defaultForm.teacher,
                academicYear: classes[0]?.academicYear ?? defaultForm.academicYear,
              });
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
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
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
          classOptions={classOptions}
          subjects={subjects}
          teachers={teachers}
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
          classOptions={classOptions}
          subjects={subjects}
          teachers={teachers}
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
  classOptions: string[];
  subjects: SubjectItem[];
  teachers: TeacherItem[];
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
  classOptions,
  subjects,
  teachers,
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
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
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
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.fullName}>
                    {teacher.fullName}
                  </option>
                ))}
              </select>
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
