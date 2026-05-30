"use client";

import { FormEvent, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/shared/status-badge";
import { students as initialStudents } from "@/data/students";
import { Student } from "@/types/student";

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

function studentToForm(student: Student): StudentForm {
  return {
    nis: student.nis,
    nisn: student.nisn,
    fullName: student.fullName,
    gender: student.gender,
    birthPlace: student.birthPlace || "",
    birthDate: student.birthDate || "",
    address: student.address || "",
    phone: student.phone || "",
    email: student.email || "",
    className: student.className,
    major: student.major,
    admissionYear: String(student.admissionYear),
    status: student.status,
  };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
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
        student.className.toLowerCase().includes(keyword)
      );
    });
  }, [search, students]);

  const handleChange = (field: keyof StudentForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.nis || !form.nisn || !form.fullName || !form.email) {
      alert("NIS, NISN, nama lengkap, dan email wajib diisi.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newStudent: Student = {
      id: Date.now().toString(),
      nis: form.nis,
      nisn: form.nisn,
      fullName: form.fullName,
      gender: form.gender,
      birthPlace: form.birthPlace,
      birthDate: form.birthDate,
      address: form.address,
      phone: form.phone,
      email: form.email,
      className: form.className,
      major: form.major,
      admissionYear: Number(form.admissionYear),
      status: form.status,
      photo: "",
    };

    setStudents((previous) => [newStudent, ...previous]);
    setForm(defaultForm);
    setAddOpen(false);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedStudent) return;
    if (!validateForm()) return;

    const updatedStudent: Student = {
      ...selectedStudent,
      nis: form.nis,
      nisn: form.nisn,
      fullName: form.fullName,
      gender: form.gender,
      birthPlace: form.birthPlace,
      birthDate: form.birthDate,
      address: form.address,
      phone: form.phone,
      email: form.email,
      className: form.className,
      major: form.major,
      admissionYear: Number(form.admissionYear),
      status: form.status,
    };

    setStudents((previous) =>
      previous.map((student) =>
        student.id === selectedStudent.id ? updatedStudent : student
      )
    );

    setSelectedStudent(null);
    setForm(defaultForm);
    setEditOpen(false);
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

  const handleDelete = (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus data siswa ini?");

    if (!confirmed) return;

    setStudents((previous) => previous.filter((student) => student.id !== id));
  };

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
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell>{student.major}</TableCell>
                      <TableCell>
                        <StatusBadge status={student.status} />
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
  onChange,
  onSubmit,
  submitLabel,
}: StudentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Contoh: siswa@student.manda.sch.id"
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
      value: student.gender,
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
      value: student.email || "-",
    },
    {
      label: "Kelas",
      value: student.className,
    },
    {
      label: "Jurusan",
      value: student.major,
    },
    {
      label: "Tahun Masuk",
      value: student.admissionYear,
    },
    {
      label: "Status",
      value: student.status,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
              {student.className} • {student.major}
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