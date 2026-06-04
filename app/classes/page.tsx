"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
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
import { Label } from "@/components/ui/label";
import {
  ClassPayload,
  ClassDetail,
  ClassItem,
  ClassStudent,
  createClass,
  deleteClass,
  getClassById,
  getClasses,
  updateClass,
} from "@/services/class-service";
import { useAuthStore } from "@/store/auth-store";

const majorLabels: Record<ClassItem["major"], string> = {
  IPA: "IPA",
  IPS: "IPS",
  AGAMA: "Agama",
};

const statusLabels: Record<ClassItem["status"], string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
};

const genderLabels: Record<ClassStudent["gender"], string> = {
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
};

const studentStatusLabels: Record<ClassStudent["status"], string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Tidak Aktif",
  GRADUATED: "Lulus",
};

type ClassForm = ClassPayload;

const defaultClassForm: ClassForm = {
  name: "",
  grade: "X",
  major: "IPA",
  academicYear: "2026/2027",
  homeroomTeacherId: null,
  status: "ACTIVE",
};

function classToForm(schoolClass: ClassItem): ClassForm {
  return {
    name: schoolClass.name,
    grade: schoolClass.grade,
    major: schoolClass.major,
    academicYear: schoolClass.academicYear,
    homeroomTeacherId: schoolClass.homeroomTeacher?.id ?? null,
    status: schoolClass.status,
  };
}

export default function ClassesPage() {
  const { token } = useAuthStore();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Semua");
  const [majorFilter, setMajorFilter] = useState("Semua");
  const [yearFilter, setYearFilter] = useState("Semua");
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<ClassForm>(defaultClassForm);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDetail | null>(null);

  const refreshClasses = useCallback(async () => {
    if (!token) return;

    const response = await getClasses(token);
    setClasses(response.data);
  }, [token]);

  useEffect(() => {
    async function fetchClasses() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        await refreshClasses();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Data kelas gagal diambil dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [refreshClasses, token]);

  const academicYears = useMemo(
    () => Array.from(new Set(classes.map((item) => item.academicYear))),
    [classes],
  );

  const filteredClasses = useMemo(() => {
    const keyword = search.toLowerCase();

    return classes.filter((schoolClass) => {
      const homeroomName =
        schoolClass.homeroomTeacher?.fullName.toLowerCase() ?? "";
      const matchSearch =
        schoolClass.name.toLowerCase().includes(keyword) ||
        homeroomName.includes(keyword) ||
        schoolClass.academicYear.toLowerCase().includes(keyword);
      const matchGrade =
        gradeFilter === "Semua" || schoolClass.grade === gradeFilter;
      const matchMajor =
        majorFilter === "Semua" || schoolClass.major === majorFilter;
      const matchYear =
        yearFilter === "Semua" || schoolClass.academicYear === yearFilter;

      return matchSearch && matchGrade && matchMajor && matchYear;
    });
  }, [classes, gradeFilter, majorFilter, search, yearFilter]);

  const handleDetail = async (schoolClass: ClassItem) => {
    if (!token) return;

    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setSelectedClass(null);

      const response = await getClassById(schoolClass.id, token);
      setSelectedClass(response.data);
    } catch (error) {
      setSelectedClass({
        ...schoolClass,
        students: [],
      });
      setError(
        error instanceof Error
          ? error.message
          : "Detail kelas gagal diambil dari backend.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleChange = (field: keyof ClassForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value || (field === "homeroomTeacherId" ? null : value),
    }));
  };

  const handleAdd = () => {
    setEditingClass(null);
    setForm(defaultClassForm);
    setFormOpen(true);
  };

  const handleEdit = (schoolClass: ClassItem) => {
    setEditingClass(schoolClass);
    setForm(classToForm(schoolClass));
    setFormOpen(true);
  };

  const handleDelete = async (schoolClass: ClassItem) => {
    if (!token) return;
    const confirmed = confirm(`Hapus kelas ${schoolClass.name}?`);
    if (!confirmed) return;

    try {
      setError("");
      await deleteClass(token, schoolClass.id);
      await refreshClasses();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kelas gagal dihapus.");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!form.name || !form.grade || !form.major || !form.academicYear) {
      alert("Nama kelas, tingkat, jurusan, dan tahun ajaran wajib diisi.");
      return;
    }

    try {
      setError("");
      if (editingClass) {
        await updateClass(token, editingClass.id, form);
      } else {
        await createClass(token, form);
      }
      await refreshClasses();
      setFormOpen(false);
      setEditingClass(null);
      setForm(defaultClassForm);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Data kelas gagal disimpan.");
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Master Data / Kelas
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Manajemen Kelas
            </h1>
            <p className="mt-1 text-slate-500">
              Data kelas, wali kelas, dan jumlah siswa diambil langsung dari
              backend MySQL.
            </p>
          </div>

          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAdd}>
            <Plus size={16} className="mr-2" />
            Tambah Kelas
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_140px_150px_180px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari kelas atau wali kelas..."
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

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
              >
                <option value="Semua">Tahun Ajaran</option>
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <Button variant="outline" className="h-11 rounded-2xl">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500">
            Memuat data kelas dari backend...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredClasses.map((schoolClass) => (
              <ClassCard
                key={schoolClass.id}
                schoolClass={schoolClass}
                onDetail={() => handleDetail(schoolClass)}
                onEdit={() => handleEdit(schoolClass)}
                onDelete={() => handleDelete(schoolClass)}
              />
            ))}

            {filteredClasses.length === 0 && (
              <div className="col-span-full rounded-3xl border bg-white p-10 text-center text-slate-500">
                Data kelas tidak ditemukan.
              </div>
            )}
          </div>
        )}

        <ClassDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          schoolClass={selectedClass}
          loading={detailLoading}
        />

        <ClassFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editingClass ? "Edit Kelas" : "Tambah Kelas"}
          description={
            editingClass
              ? "Ubah informasi kelas yang tersimpan di backend."
              : "Tambahkan kelas baru ke database MANDA Gate."
          }
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={editingClass ? "Simpan Perubahan" : "Simpan Kelas"}
        />
      </section>
    </DashboardLayout>
  );
}

function ClassCard({
  schoolClass,
  onDetail,
  onEdit,
  onDelete,
}: {
  schoolClass: ClassItem;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className="cursor-pointer overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      onClick={onDetail}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-500 text-xl font-extrabold text-white">
            {schoolClass.grade}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {schoolClass.name}
                </h2>

                <Badge className="mt-2 rounded-full bg-emerald-50 px-4 py-1 text-emerald-700 hover:bg-emerald-50">
                  Jurusan {majorLabels[schoolClass.major]}
                </Badge>
              </div>

              <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {statusLabels[schoolClass.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500">Wali Kelas</p>
            <p className="mt-1 font-bold text-slate-900">
              {schoolClass.homeroomTeacher?.fullName ?? "-"}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Users size={17} />
              <span className="font-semibold">
                {schoolClass.totalStudents} siswa
              </span>
            </div>

            <span className="font-semibold text-slate-600">
              {schoolClass.academicYear}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDetail();
              }}
            >
              <Eye size={14} className="mr-1" />
              Detail
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              <Pencil size={14} className="mr-1" />
              Edit
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={14} className="mr-1" />
              Hapus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClassFormDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  onChange,
  onSubmit,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: ClassForm;
  onChange: (field: keyof ClassForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(760px,calc(100vw-32px))] !max-w-none max-h-[88vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nama Kelas</Label>
              <Input
                placeholder="Contoh: X IPA 1"
                value={form.name}
                onChange={(event) => onChange("name", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tingkat</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.grade}
                onChange={(event) => onChange("grade", event.target.value)}
              >
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Jurusan</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.major}
                onChange={(event) => onChange("major", event.target.value)}
              >
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="AGAMA">Agama</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tahun Ajaran</Label>
              <Input
                placeholder="Contoh: 2026/2027"
                value={form.academicYear}
                onChange={(event) => onChange("academicYear", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(event) => onChange("status", event.target.value)}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
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
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClassDetailDialog({
  open,
  onOpenChange,
  schoolClass,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolClass: ClassDetail | null;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(1120px,calc(100vw-32px))] !max-w-none max-h-[88vh] overflow-y-auto rounded-3xl p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Detail Manajemen Kelas</DialogTitle>
          <DialogDescription>
            Daftar siswa dan informasi kelas diambil langsung dari backend.
          </DialogDescription>
        </DialogHeader>

        {loading || !schoolClass ? (
          <div className="p-8 text-center text-slate-500">
            Memuat detail kelas...
          </div>
        ) : (
          <div className="space-y-5 p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <p className="text-sm text-slate-300">Kelas</p>
                <h2 className="mt-2 text-3xl font-extrabold">
                  {schoolClass.name}
                </h2>
                <p className="mt-2 text-slate-300">
                  {schoolClass.grade} • {majorLabels[schoolClass.major]} •{" "}
                  {schoolClass.academicYear}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-white text-slate-950 hover:bg-white">
                    {statusLabels[schoolClass.status]}
                  </Badge>
                  <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {schoolClass.totalStudents} siswa aktif
                  </Badge>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5">
                <p className="text-xs font-semibold text-slate-500">
                  Wali Kelas
                </p>
                <p className="mt-2 text-lg font-extrabold text-slate-900">
                  {schoolClass.homeroomTeacher?.fullName ?? "-"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  NIP: {schoolClass.homeroomTeacher?.nip ?? "-"}
                </p>
                <p className="text-sm text-slate-500">
                  Mapel: {schoolClass.homeroomTeacher?.subject ?? "-"}
                </p>

                <div className="mt-5 grid gap-2">
                  <Button className="justify-start rounded-2xl bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus size={16} className="mr-2" />
                    Tambah siswa ke kelas
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl">
                    Pindahkan siswa
                  </Button>
                  <Button variant="outline" className="justify-start rounded-2xl">
                    Ubah wali kelas
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border bg-white">
              <div className="border-b p-5">
                <h3 className="font-extrabold text-slate-900">
                  Daftar Siswa
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Relasi siswa dan kelas berasal dari database backend.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        No
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        NIS
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        NISN
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Nama Siswa
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Gender
                      </th>
                      <th className="px-5 py-4 font-semibold text-slate-600">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {schoolClass.students.map((student, index) => (
                      <tr key={student.id} className="border-t">
                        <td className="px-5 py-4">{index + 1}</td>
                        <td className="px-5 py-4 font-semibold">
                          {student.nis}
                        </td>
                        <td className="px-5 py-4">{student.nisn ?? "-"}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="px-5 py-4">
                          {genderLabels[student.gender]}
                        </td>
                        <td className="px-5 py-4">
                          <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            {studentStatusLabels[student.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}

                    {schoolClass.students.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-slate-500"
                        >
                          Belum ada siswa aktif di kelas ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
