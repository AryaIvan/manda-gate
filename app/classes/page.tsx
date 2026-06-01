"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { classes as initialClasses } from "@/data/classes";
import { students } from "@/data/students";
import { SchoolClass } from "@/types/class";

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

type ClassForm = {
  name: string;
  grade: "X" | "XI" | "XII";
  major: "IPA" | "IPS" | "Agama";
  homeroomTeacher: string;
  academicYear: string;
  totalStudents: string;
};

const defaultForm: ClassForm = {
  name: "X IPA 1",
  grade: "X",
  major: "IPA",
  homeroomTeacher: "",
  academicYear: "2026/2027",
  totalStudents: "30",
};

function classToForm(schoolClass: SchoolClass): ClassForm {
  return {
    name: schoolClass.name,
    grade: schoolClass.grade,
    major: schoolClass.major,
    homeroomTeacher: schoolClass.homeroomTeacher,
    academicYear: schoolClass.academicYear,
    totalStudents: String(schoolClass.totalStudents),
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses);
  const [studentClassMap, setStudentClassMap] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        students.map((student) => [
          student.id,
          student.id === "6" || student.id === "7"
            ? "X IPA 1"
            : student.className,
        ]),
      ),
  );
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Semua");
  const [majorFilter, setMajorFilter] = useState("Semua");
  const [yearFilter, setYearFilter] = useState("Semua");

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [form, setForm] = useState<ClassForm>(defaultForm);

  const filteredClasses = useMemo(() => {
    return classes.filter((schoolClass) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        schoolClass.name.toLowerCase().includes(keyword) ||
        schoolClass.homeroomTeacher.toLowerCase().includes(keyword) ||
        schoolClass.major.toLowerCase().includes(keyword) ||
        schoolClass.academicYear.toLowerCase().includes(keyword);

      const matchGrade =
        gradeFilter === "Semua" || schoolClass.grade === gradeFilter;

      const matchMajor =
        majorFilter === "Semua" || schoolClass.major === majorFilter;

      const matchYear =
        yearFilter === "Semua" || schoolClass.academicYear === yearFilter;

      return matchSearch && matchGrade && matchMajor && matchYear;
    });
  }, [search, gradeFilter, majorFilter, yearFilter, classes]);

  const handleChange = (field: keyof ClassForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name || !form.homeroomTeacher || !form.academicYear) {
      alert("Nama kelas, wali kelas, dan tahun ajaran wajib diisi.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newClass: SchoolClass = {
      id: Date.now().toString(),
      name: form.name,
      grade: form.grade,
      major: form.major,
      homeroomTeacher: form.homeroomTeacher,
      academicYear: form.academicYear,
      totalStudents: Number(form.totalStudents),
    };

    setClasses((previous) => [newClass, ...previous]);
    setForm(defaultForm);
    setAddOpen(false);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedClass) return;
    if (!validateForm()) return;

    const updatedClass: SchoolClass = {
      ...selectedClass,
      name: form.name,
      grade: form.grade,
      major: form.major,
      homeroomTeacher: form.homeroomTeacher,
      academicYear: form.academicYear,
      totalStudents: Number(form.totalStudents),
    };

    setClasses((previous) =>
      previous.map((schoolClass) =>
        schoolClass.id === selectedClass.id ? updatedClass : schoolClass,
      ),
    );

    setSelectedClass(null);
    setForm(defaultForm);
    setEditOpen(false);
  };

  const handleDetail = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass);
    setDetailOpen(true);
  };

  const handleEdit = (schoolClass: SchoolClass) => {
    setSelectedClass(schoolClass);
    setForm(classToForm(schoolClass));
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus data kelas ini?");

    if (!confirmed) return;

    setClasses((previous) =>
      previous.filter((schoolClass) => schoolClass.id !== id),
    );
  };

  const getRegisteredStudents = (className: string) =>
    students.filter((student) => studentClassMap[student.id] === className);

  const handleAssignStudent = (studentId: string, className: string) => {
    setStudentClassMap((previous) => ({
      ...previous,
      [studentId]: className,
    }));
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudentClassMap((previous) => ({
      ...previous,
      [studentId]: "",
    }));
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
              Atur wali kelas, tahun ajaran, status kelas, dan penempatan siswa
              di setiap kelas.
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
                <option value="Agama">Agama</option>
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
              >
                <option value="Semua">Tahun Ajaran</option>
                <option value="2026/2027">2026/2027</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
              </select>

              <Button variant="outline" className="h-11 rounded-2xl">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((schoolClass) => (
            <ClassCard
              key={schoolClass.id}
              schoolClass={schoolClass}
              studentCount={getRegisteredStudents(schoolClass.name).length}
              onDetail={() => handleDetail(schoolClass)}
              onEdit={() => handleEdit(schoolClass)}
              onDelete={() => handleDelete(schoolClass.id)}
            />
          ))}

          {filteredClasses.length === 0 && (
            <div className="col-span-full rounded-3xl border bg-white p-10 text-center text-slate-500">
              Data kelas tidak ditemukan.
            </div>
          )}
        </div>

        <ClassFormDialog
          title="Tambah Data Kelas"
          description="Masukkan data kelas baru ke sistem MANDA Gate."
          open={addOpen}
          onOpenChange={setAddOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleAddSubmit}
          submitLabel="Simpan Kelas"
        />

        <ClassFormDialog
          title="Edit Data Kelas"
          description="Ubah data kelas yang sudah terdaftar."
          open={editOpen}
          onOpenChange={setEditOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleEditSubmit}
          submitLabel="Simpan Perubahan"
        />

        <ClassDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          schoolClass={selectedClass}
          classes={classes}
          registeredStudents={
            selectedClass ? getRegisteredStudents(selectedClass.name) : []
          }
          availableStudents={students.filter(
            (student) =>
              !studentClassMap[student.id] ||
              studentClassMap[student.id] !== selectedClass?.name,
          )}
          onAssignStudent={handleAssignStudent}
          onRemoveStudent={handleRemoveStudent}
        />
      </section>
    </DashboardLayout>
  );
}

function ClassCard({
  schoolClass,
  studentCount,
  onDetail,
  onEdit,
  onDelete,
}: {
  schoolClass: SchoolClass;
  studentCount: number;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      className="overflow-hidden border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md cursor-pointer"
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
                  {schoolClass.major}
                </Badge>
              </div>

              <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Aktif
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 pb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500">Wali Kelas</p>
            <p className="mt-1 font-bold text-slate-900">
              {schoolClass.homeroomTeacher}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-600">
              <Users size={17} />
              <span className="font-semibold">
                {studentCount} siswa terdaftar
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

type ClassFormDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ClassForm;
  onChange: (field: keyof ClassForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
};

function ClassFormDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  submitLabel,
}: ClassFormDialogProps) {
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
                <option value="Agama">Agama</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Wali Kelas</Label>
              <Input
                placeholder="Contoh: Siti Aminah, S.Pd"
                value={form.homeroomTeacher}
                onChange={(event) =>
                  onChange("homeroomTeacher", event.target.value)
                }
              />
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
              <Label>Jumlah Siswa</Label>
              <Input
                type="number"
                placeholder="Contoh: 32"
                value={form.totalStudents}
                onChange={(event) =>
                  onChange("totalStudents", event.target.value)
                }
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

type ClassDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolClass: SchoolClass | null;
  classes: SchoolClass[];
  registeredStudents: typeof students;
  availableStudents: typeof students;
  onAssignStudent: (studentId: string, className: string) => void;
  onRemoveStudent: (studentId: string) => void;
};

function ClassDetailDialog({
  open,
  onOpenChange,
  schoolClass,
  classes,
  registeredStudents,
  availableStudents,
  onAssignStudent,
  onRemoveStudent,
}: ClassDetailDialogProps) {
  const [newStudentId, setNewStudentId] = useState("");
  const [moveStudentId, setMoveStudentId] = useState("");
  const [targetClassName, setTargetClassName] = useState("");

  if (!schoolClass) return null;

  const detailItems = [
    {
      label: "Nama Kelas",
      value: schoolClass.name,
    },
    {
      label: "Tingkat",
      value: schoolClass.grade,
    },
    {
      label: "Jurusan",
      value: schoolClass.major,
    },
    {
      label: "Wali Kelas",
      value: schoolClass.homeroomTeacher,
    },
    {
      label: "Tahun Ajaran",
      value: schoolClass.academicYear,
    },
    {
      label: "Jumlah Siswa",
      value: `${registeredStudents.length} siswa`,
    },
    {
      label: "Status",
      value: "Aktif",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(1120px,calc(100vw-32px))] !max-w-none h-[85vh] overflow-hidden rounded-3xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Detail Kelas</DialogTitle>
          <DialogDescription>
            Informasi lengkap kelas dan daftar siswa yang terdaftar.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[calc(85vh-88px)] overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="rounded-2xl border bg-emerald-50 p-5">
              <h3 className="text-xl font-extrabold text-slate-900">
                {schoolClass.name}
              </h3>
            <p className="mt-1 text-sm text-slate-600">
                {schoolClass.major} • {schoolClass.academicYear} • Status aktif
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <Button
                className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  if (!newStudentId) return;
                  onAssignStudent(newStudentId, schoolClass.name);
                  setNewStudentId("");
                }}
              >
                <UserPlus size={16} className="mr-2" />
                Tambah Siswa
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl"
                onClick={() => {
                  if (!moveStudentId || !targetClassName) return;
                  onAssignStudent(moveStudentId, targetClassName);
                  setMoveStudentId("");
                  setTargetClassName("");
                }}
              >
                <ArrowRightLeft size={16} className="mr-2" />
                Pindahkan Siswa
              </Button>
              <Button variant="outline" className="h-12 rounded-2xl">
                <Pencil size={16} className="mr-2" />
                Ubah Wali Kelas
              </Button>
              <Button variant="outline" className="h-12 rounded-2xl">
                <Filter size={16} className="mr-2" />
                Status Kelas
              </Button>
            </div>

            <div className="grid gap-3 rounded-2xl border bg-slate-50 p-4 lg:grid-cols-[1fr_1fr_1fr]">
              <select
                className="h-11 rounded-2xl border bg-white px-4 text-sm text-slate-700"
                value={newStudentId}
                onChange={(event) => setNewStudentId(event.target.value)}
              >
                <option value="">Pilih siswa untuk ditambahkan</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} - {student.nis}
                  </option>
                ))}
              </select>

              <select
                className="h-11 rounded-2xl border bg-white px-4 text-sm text-slate-700"
                value={moveStudentId}
                onChange={(event) => setMoveStudentId(event.target.value)}
              >
                <option value="">Pilih siswa untuk dipindahkan</option>
                {registeredStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.fullName}
                  </option>
                ))}
              </select>

              <select
                className="h-11 rounded-2xl border bg-white px-4 text-sm text-slate-700"
                value={targetClassName}
                onChange={(event) => setTargetClassName(event.target.value)}
              >
                <option value="">Pindah ke kelas</option>
                {classes
                  .filter((item) => item.name !== schoolClass.name)
                  .map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} - {item.academicYear}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {detailItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border bg-white p-3"
                >
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border bg-white">
              <div className="border-b p-4">
                <h4 className="font-bold text-slate-900">Siswa Terdaftar</h4>
                <p className="text-sm text-slate-500">
                  Daftar siswa yang masuk dalam kelas {schoolClass.name}.
                </p>
              </div>

              <div className="max-h-80 overflow-auto">
                <table className="w-full min-w-180 text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        No
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        NIS
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        NISN
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Nama Siswa
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Gender
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600">
                        Aksi Kelas
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {registeredStudents.map((student, index) => (
                      <tr key={student.id} className="border-t">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{student.nis}</td>
                        <td className="px-4 py-3">{student.nisn}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-3">{student.gender}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            {student.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full"
                              onClick={() => {
                                setMoveStudentId(student.id);
                                setTargetClassName("");
                              }}
                            >
                              <ArrowRightLeft size={13} className="mr-1" />
                              Pindah
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full text-red-600 hover:text-red-700"
                              onClick={() => onRemoveStudent(student.id)}
                            >
                              <UserMinus size={13} className="mr-1" />
                              Keluarkan
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {registeredStudents.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          Belum ada siswa yang terdaftar di kelas ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Alur pindah kelas
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Pilih siswa, tentukan kelas tujuan, lalu data jadwal, mapel,
                  absensi, dan nilai berikutnya mengikuti kelas baru.
                </p>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Tahun ajaran
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {schoolClass.academicYear} bisa diubah untuk menjaga riwayat
                  penempatan siswa tetap rapi.
                </p>
              </div>
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Status kelas
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Kelas aktif dipakai untuk jadwal, mapel, absensi, nilai, dan
                  laporan real-time.
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end border-t bg-white py-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
