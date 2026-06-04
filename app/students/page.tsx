"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuthStore } from "@/store/auth-store";
import {
  StudentItem as Student,
  getStudents,
  createStudent,
  createStudentAccount,
  updateStudent,
  deleteStudent,
} from "@/services/student-service";
import { ClassItem, getClasses } from "@/services/class-service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StudentForm = {
  nis: string;
  nisn: string;
  fullName: string;
  gender: "Laki-laki" | "Perempuan";
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  className: string;
  major: string;
  admissionYear: string;
  status: "Aktif" | "Tidak Aktif" | "Lulus";
};

const defaultForm: StudentForm = {
  nis: "",
  nisn: "",
  fullName: "",
  gender: "Laki-laki",
  birthPlace: "",
  birthDate: "",
  address: "",
  phone: "",
  email: "",
  className: "X IPA 1",
  major: "IPA",
  admissionYear: "2026",
  status: "Aktif",
};

function fromApiGender(gender: string): StudentForm["gender"] {
  if (gender === "MALE") return "Laki-laki";
  if (gender === "FEMALE") return "Perempuan";
  return gender as StudentForm["gender"];
}

function toApiGender(gender: StudentForm["gender"]) {
  return gender === "Laki-laki" ? "MALE" : "FEMALE";
}

function fromApiStatus(status: string): StudentForm["status"] {
  if (status === "ACTIVE") return "Aktif";
  if (status === "INACTIVE") return "Tidak Aktif";
  if (status === "GRADUATED") return "Lulus";
  return status as StudentForm["status"];
}

function toApiStatus(status: StudentForm["status"]) {
  if (status === "Tidak Aktif") return "INACTIVE";
  if (status === "Lulus") return "GRADUATED";
  return "ACTIVE";
}

function getStudentClass(student: Student) {
  return student.currentClass ?? student.class ?? null;
}

function getStudentClassName(student: Student) {
  return getStudentClass(student)?.name ?? student.className ?? "-";
}

function getStudentMajor(student: Student) {
  return getStudentClass(student)?.major ?? student.major ?? "-";
}

function getStudentAcademicYear(student: Student) {
  return getStudentClass(student)?.academicYear ?? String(student.admissionYear ?? "-");
}

function getStudentEmail(student: Student) {
  return student.account?.email ?? student.email ?? "-";
}

function formatDateInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function studentToForm(student: Student): StudentForm {
  const studentClass = getStudentClass(student);

  return {
    nis: student.nis,
    nisn: student.nisn,
    fullName: student.fullName,
    gender: fromApiGender(student.gender),
    birthPlace: student.birthPlace || "",
    birthDate: formatDateInput(student.birthDate),
    address: student.address || "",
    phone: student.phone || "",
    email: getStudentEmail(student) === "-" ? "" : getStudentEmail(student),
    className: studentClass?.name || student.className || "X IPA 1",
    major: studentClass?.major || student.major || "IPA",
    admissionYear: getStudentAcademicYear(student),
    status: fromApiStatus(student.status),
  };
}

export default function StudentsPage() {
  const { token } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [studentsResponse, classesResponse] = await Promise.all([
          getStudents(token),
          getClasses(token),
        ]);
        setStudents(studentsResponse.data);
        setClasses(classesResponse.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Gagal memuat data siswa.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(defaultForm);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const keyword = search.toLowerCase();

      return (
        student.fullName.toLowerCase().includes(keyword) ||
        student.nis.toLowerCase().includes(keyword) ||
        student.nisn.toLowerCase().includes(keyword) ||
        getStudentClassName(student).toLowerCase().includes(keyword)
      );
    });
  }, [search, students]);

  const selectedClass = useMemo(() => {
    return classes.find((item) => item.name === form.className) ?? null;
  }, [classes, form.className]);

  const handleChange = (field: keyof StudentForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.nis || !form.fullName || !form.gender) {
      alert("NIS, nama lengkap, dan jenis kelamin wajib diisi.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || !token) return;

    try {
      const res = await createStudent(token, {
        nis: form.nis,
        nisn: form.nisn,
        fullName: form.fullName,
        gender: toApiGender(form.gender),
        birthDate: form.birthDate,
        address: form.address,
        phone: form.phone,
        status: toApiStatus(form.status),
        classId: selectedClass?.id,
        academicYear: selectedClass?.academicYear || form.admissionYear,
      });

      if (form.email) {
        await createStudentAccount(token, res.data.id, {
          email: form.email,
        });
      }

      const refreshed = await getStudents(token);
      setStudents(refreshed.data);
      setForm(defaultForm);
      setAddOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal menambah data siswa.");
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent || !token) return;
    if (!validateForm()) return;

    try {
      const res = await updateStudent(token, selectedStudent.id, {
        nis: form.nis,
        nisn: form.nisn,
        fullName: form.fullName,
        gender: toApiGender(form.gender),
        birthDate: form.birthDate,
        address: form.address,
        phone: form.phone,
        status: toApiStatus(form.status),
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudent.id ? res.data : s))
      );
      setSelectedStudent(null);
      setForm(defaultForm);
      setEditOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal memperbarui data siswa.");
    }
  };

  const handleDetail = (student: Student) => {
    setSelectedStudent(student);
    setDetailOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setForm(studentToForm(student));
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus data siswa ini?");
    if (!confirmed || !token) return;

    try {
      await deleteStudent(token, id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal menghapus data siswa.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">
          Memuat data siswa...
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
            <h1 className="text-2xl font-bold text-slate-900">Data Siswa</h1>
            <p className="text-slate-500">
              Kelola data siswa MAN 2 Gresik.
            </p>
          </div>

          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            onClick={() => {
              setForm(defaultForm);
              setAddOpen(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Tambah Siswa
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Daftar Siswa</CardTitle>

              <div className="relative w-full md:w-80">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  className="pl-9"
                  placeholder="Cari nama, NIS, NISN, kelas..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>NIS</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {student.nis}
                      </TableCell>
                      <TableCell>{student.nisn}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{fromApiGender(student.gender)}</TableCell>
                      <TableCell>{getStudentClassName(student)}</TableCell>
                      <TableCell>{getStudentMajor(student)}</TableCell>
                      <TableCell>
                        <StatusBadge status={fromApiStatus(student.status)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDetail(student)}
                          >
                            <Eye size={15} />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil size={15} />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-32 text-center text-slate-500"
                      >
                        Data siswa tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <StudentFormDialog
          title="Tambah Data Siswa"
          description="Masukkan data siswa baru ke sistem MANDA Gate."
          open={addOpen}
          onOpenChange={setAddOpen}
          form={form}
          classes={classes}
          onChange={handleChange}
          onSubmit={handleAddSubmit}
          submitLabel="Simpan Siswa"
        />

        <StudentFormDialog
          title="Edit Data Siswa"
          description="Ubah data siswa yang sudah terdaftar."
          open={editOpen}
          onOpenChange={setEditOpen}
          form={form}
          classes={classes}
          onChange={handleChange}
          onSubmit={handleEditSubmit}
          submitLabel="Simpan Perubahan"
        />

        <StudentDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          student={selectedStudent}
        />
      </section>
    </DashboardLayout>
  );
}

type StudentFormDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: StudentForm;
  classes: ClassItem[];
  onChange: (field: keyof StudentForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
};

function StudentFormDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  classes,
  onChange,
  onSubmit,
  submitLabel,
}: StudentFormDialogProps) {
  const classOptions = classes.length
    ? classes
    : [
        {
          id: "fallback-x-ipa-1",
          name: "X IPA 1",
          grade: "X" as const,
          major: "IPA" as const,
          academicYear: "2026/2027",
          status: "ACTIVE" as const,
          totalStudents: 0,
        },
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(920px,calc(100vw-32px))]! max-w-none! max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>NIS</Label>
              <Input
                placeholder="Contoh: 2026009"
                value={form.nis}
                onChange={(event) => onChange("nis", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>NISN</Label>
              <Input
                placeholder="Contoh: 0061234575"
                value={form.nisn}
                onChange={(event) => onChange("nisn", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Nama Lengkap</Label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={form.fullName}
                onChange={(event) =>
                  onChange("fullName", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.gender}
                onChange={(event) => onChange("gender", event.target.value)}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  onChange("birthDate", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tempat Lahir</Label>
              <Input
                placeholder="Contoh: Gresik"
                value={form.birthPlace}
                onChange={(event) =>
                  onChange("birthPlace", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>No. HP</Label>
              <Input
                placeholder="Contoh: 081234567890"
                value={form.phone}
                onChange={(event) => onChange("phone", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Email Akun Siswa</Label>
              <Input
                type="email"
                placeholder="Opsional, untuk membuat akun login siswa"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Alamat</Label>
              <Input
                placeholder="Masukkan alamat siswa"
                value={form.address}
                onChange={(event) => onChange("address", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.className}
                onChange={(event) =>
                  onChange("className", event.target.value)
                }
              >
                {classOptions.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Jurusan</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.major}
                onChange={(event) => onChange("major", event.target.value)}
              >
                <option value="IPA">IPA</option>
                <option value="IPS">IPS</option>
                <option value="Agama">Agama</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tahun Masuk</Label>
              <Input
                type="number"
                value={form.admissionYear}
                onChange={(event) =>
                  onChange("admissionYear", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(event) => onChange("status", event.target.value)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
                <option value="Lulus">Lulus</option>
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
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type StudentDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
};

function StudentDetailDialog({
  open,
  onOpenChange,
  student,
}: StudentDetailDialogProps) {
  if (!student) return null;

  const detailItems = [
    {
      label: "NIS",
      value: student.nis,
    },
    {
      label: "NISN",
      value: student.nisn,
    },
    {
      label: "Nama Lengkap",
      value: student.fullName,
    },
    {
      label: "Jenis Kelamin",
      value: fromApiGender(student.gender),
    },
    {
      label: "Tempat Lahir",
      value: student.birthPlace || "-",
    },
    {
      label: "Tanggal Lahir",
      value: student.birthDate || "-",
    },
    {
      label: "Alamat",
      value: student.address || "-",
    },
    {
      label: "No. HP",
      value: student.phone || "-",
    },
    {
      label: "Email",
      value: getStudentEmail(student),
    },
    {
      label: "Kelas",
      value: getStudentClassName(student),
    },
    {
      label: "Jurusan",
      value: getStudentMajor(student),
    },
    {
      label: "Tahun Ajaran",
      value: getStudentAcademicYear(student),
    },
    {
      label: "Status",
      value: fromApiStatus(student.status),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(760px,calc(100vw-32px))]! max-w-none! max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Siswa</DialogTitle>
          <DialogDescription>
            Informasi lengkap data siswa MAN 2 Gresik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-slate-50 p-4">
            <h3 className="font-bold text-lg text-slate-900">
              {student.fullName}
            </h3>
            <p className="text-sm text-slate-500">
              {getStudentClassName(student)} • {getStudentMajor(student)}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {detailItems.map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-medium text-slate-900">{item.value}</p>
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
