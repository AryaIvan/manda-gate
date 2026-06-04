"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuthStore } from "@/store/auth-store";
import {
  TeacherItem as Teacher,
  getTeachers,
  createTeacher,
  createTeacherAccount,
  updateTeacher,
  deleteTeacher,
} from "@/services/teacher-service";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TeacherForm = {
  nip: string;
  fullName: string;
  gender: "Laki-laki" | "Perempuan";
  email: string;
  phone: string;
  address: string;
  subject: string;
  position: string;
  status: "Aktif" | "Tidak Aktif";
};

const defaultForm: TeacherForm = {
  nip: "",
  fullName: "",
  gender: "Laki-laki",
  email: "",
  phone: "",
  address: "",
  subject: "Matematika",
  position: "Guru Mata Pelajaran",
  status: "Aktif",
};

function teacherToForm(teacher: Teacher): TeacherForm {
  return {
    nip: teacher.nip || "",
    fullName: teacher.fullName,
    gender: fromApiGender(teacher.gender),
    email: getTeacherEmail(teacher) === "-" ? "" : getTeacherEmail(teacher),
    phone: teacher.phone || "",
    address: teacher.address || "",
    subject: teacher.subject || "Matematika",
    position: getTeacherPosition(teacher),
    status: fromApiStatus(teacher.status),
  };
}

function fromApiGender(gender: string): TeacherForm["gender"] {
  if (gender === "MALE") return "Laki-laki";
  if (gender === "FEMALE") return "Perempuan";
  return gender as TeacherForm["gender"];
}

function toApiGender(gender: TeacherForm["gender"]) {
  return gender === "Laki-laki" ? "MALE" : "FEMALE";
}

function fromApiStatus(status: string): TeacherForm["status"] {
  if (status === "ACTIVE") return "Aktif";
  if (status === "INACTIVE") return "Tidak Aktif";
  return status as TeacherForm["status"];
}

function toApiStatus(status: TeacherForm["status"]) {
  return status === "Aktif" ? "ACTIVE" : "INACTIVE";
}

function getTeacherEmail(teacher: Teacher) {
  return teacher.account?.email ?? teacher.email ?? "-";
}

function getTeacherPosition(teacher: Teacher) {
  if (teacher.account?.role === "HOMEROOM_TEACHER") return "Wali Kelas";
  return teacher.position ?? "Guru Mata Pelajaran";
}

export default function TeachersPage() {
  const { token } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeachers() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getTeachers(token);
        setTeachers(response.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Gagal memuat data guru.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTeachers();
  }, [token]);

  const [search, setSearch] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherForm>(defaultForm);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const keyword = search.toLowerCase();

      return (
        teacher.fullName.toLowerCase().includes(keyword) ||
        (teacher.nip ?? "").toLowerCase().includes(keyword) ||
        getTeacherEmail(teacher).toLowerCase().includes(keyword) ||
        (teacher.subject ?? "").toLowerCase().includes(keyword) ||
        getTeacherPosition(teacher).toLowerCase().includes(keyword)
      );
    });
  }, [search, teachers]);

  const handleChange = (field: keyof TeacherForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.nip || !form.fullName || !form.subject) {
      alert("NIP, nama lengkap, dan mata pelajaran wajib diisi.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || !token) return;

    try {
      const res = await createTeacher(token, {
        nip: form.nip,
        fullName: form.fullName,
        gender: toApiGender(form.gender),
        phone: form.phone,
        address: form.address,
        subject: form.subject,
        status: toApiStatus(form.status),
      });

      if (form.email) {
        await createTeacherAccount(token, res.data.id, {
          email: form.email,
          role:
            form.position === "Wali Kelas" ? "HOMEROOM_TEACHER" : "TEACHER",
        });
      }

      const refreshed = await getTeachers(token);
      setTeachers(refreshed.data);
      setForm(defaultForm);
      setAddOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal menambah data guru.");
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTeacher || !token) return;
    if (!validateForm()) return;

    try {
      const res = await updateTeacher(token, selectedTeacher.id, {
        nip: form.nip,
        fullName: form.fullName,
        gender: toApiGender(form.gender),
        phone: form.phone,
        address: form.address,
        subject: form.subject,
        status: toApiStatus(form.status),
      });
      setTeachers((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? res.data : t))
      );
      setSelectedTeacher(null);
      setForm(defaultForm);
      setEditOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal memperbarui data guru.");
    }
  };

  const handleDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailOpen(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setForm(teacherToForm(teacher));
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus data guru ini?");
    if (!confirmed || !token) return;

    try {
      await deleteTeacher(token, id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal menghapus data guru.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-slate-500">
          Memuat data guru...
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
            <h1 className="text-2xl font-bold text-slate-900">Data Guru</h1>
            <p className="text-slate-500">
              Kelola data guru dan tenaga pendidik MAN 2 Gresik.
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
            Tambah Guru
          </Button>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Daftar Guru</CardTitle>

              <div className="relative w-full md:w-80">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  className="pl-9"
                  placeholder="Cari nama, NIP, email, mapel..."
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
                    <TableHead>NIP</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mapel</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredTeachers.map((teacher, index) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {teacher.nip}
                      </TableCell>
                      <TableCell>{teacher.fullName}</TableCell>
                      <TableCell>{fromApiGender(teacher.gender)}</TableCell>
                      <TableCell>{getTeacherEmail(teacher)}</TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>{getTeacherPosition(teacher)}</TableCell>
                      <TableCell>
                        <StatusBadge status={fromApiStatus(teacher.status)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDetail(teacher)}
                          >
                            <Eye size={15} />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleEdit(teacher)}
                          >
                            <Pencil size={15} />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(teacher.id)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTeachers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-32 text-center text-slate-500"
                      >
                        Data guru tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <TeacherFormDialog
          title="Tambah Data Guru"
          description="Masukkan data guru baru ke sistem MANDA Gate."
          open={addOpen}
          onOpenChange={setAddOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleAddSubmit}
          submitLabel="Simpan Guru"
        />

        <TeacherFormDialog
          title="Edit Data Guru"
          description="Ubah data guru yang sudah terdaftar."
          open={editOpen}
          onOpenChange={setEditOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleEditSubmit}
          submitLabel="Simpan Perubahan"
        />

        <TeacherDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          teacher={selectedTeacher}
        />
      </section>
    </DashboardLayout>
  );
}

type TeacherFormDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TeacherForm;
  onChange: (field: keyof TeacherForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
};

function TeacherFormDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  submitLabel,
}: TeacherFormDialogProps) {
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
              <Label>NIP</Label>
              <Input
                placeholder="Contoh: 198001012010011001"
                value={form.nip}
                onChange={(event) => onChange("nip", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                placeholder="Masukkan nama lengkap"
                value={form.fullName}
                onChange={(event) => onChange("fullName", event.target.value)}
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
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="guru@manda.sch.id"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>No. HP</Label>
              <Input
                placeholder="081234567890"
                value={form.phone}
                onChange={(event) => onChange("phone", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
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
              <Label>Jabatan</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={form.position}
                onChange={(event) => onChange("position", event.target.value)}
              >
                <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                <option value="Wali Kelas">Wali Kelas</option>
                <option value="Guru BK">Guru BK</option>
                <option value="Kepala Madrasah">Kepala Madrasah</option>
                <option value="Admin TU">Admin TU</option>
              </select>
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
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Alamat</Label>
              <Input
                placeholder="Masukkan alamat guru"
                value={form.address}
                onChange={(event) => onChange("address", event.target.value)}
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

type TeacherDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
};

function TeacherDetailDialog({
  open,
  onOpenChange,
  teacher,
}: TeacherDetailDialogProps) {
  if (!teacher) return null;

  const detailItems = [
    {
      label: "NIP",
      value: teacher.nip,
    },
    {
      label: "Nama Lengkap",
      value: teacher.fullName,
    },
    {
      label: "Jenis Kelamin",
      value: fromApiGender(teacher.gender),
    },
    {
      label: "Email",
      value: getTeacherEmail(teacher),
    },
    {
      label: "No. HP",
      value: teacher.phone || "-",
    },
    {
      label: "Alamat",
      value: teacher.address || "-",
    },
    {
      label: "Mata Pelajaran",
      value: teacher.subject,
    },
    {
      label: "Jabatan",
      value: getTeacherPosition(teacher),
    },
    {
      label: "Status",
      value: fromApiStatus(teacher.status),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(760px,calc(100vw-32px))]! max-w-none! max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Guru</DialogTitle>
          <DialogDescription>
            Informasi lengkap data guru MAN 2 Gresik.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-slate-50 p-4">
            <h3 className="font-bold text-lg text-slate-900">
              {teacher.fullName}
            </h3>
            <p className="text-sm text-slate-500">
              {teacher.subject} • {getTeacherPosition(teacher)}
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
