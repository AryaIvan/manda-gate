"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, Trophy } from "lucide-react";

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
  AchievementItem,
  createAchievement,
  deleteAchievement,
  getAchievements,
  updateAchievement,
} from "@/services/achievement-service";
import { getClasses, ClassItem } from "@/services/class-service";
import { getStudents, StudentItem } from "@/services/student-service";
import { useAuthStore } from "@/store/auth-store";

type AchievementForm = {
  code: string;
  studentName: string;
  className: string;
  title: string;
  level: string;
  date: string;
};

const defaultForm: AchievementForm = {
  code: "",
  studentName: "",
  className: "",
  title: "",
  level: "Sekolah",
  date: new Date().toISOString().slice(0, 10),
};

const levels = ["Sekolah", "Kecamatan", "Kabupaten", "Provinsi", "Nasional", "Internasional"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function toForm(item: AchievementItem): AchievementForm {
  return {
    code: item.code,
    studentName: item.student?.fullName ?? "",
    className: item.class?.name ?? "",
    title: item.title,
    level: item.level,
    date: item.date.slice(0, 10),
  };
}

export default function AchievementsPage() {
  const { token } = useAuthStore();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementItem | null>(null);
  const [selected, setSelected] = useState<AchievementItem | null>(null);
  const [form, setForm] = useState<AchievementForm>(defaultForm);

  const refreshAchievements = useCallback(async (showLoading = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");
      const response = await getAchievements(token);
      setAchievements(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memuat prestasi dari backend.");
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
        const [studentResponse, classResponse] = await Promise.all([
          getStudents(token),
          getClasses(token),
        ]);
        setStudents(studentResponse.data);
        setClasses(classResponse.data);
        await refreshAchievements(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Gagal memuat pilihan prestasi.");
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, [refreshAchievements, token]);

  const filteredAchievements = useMemo(() => {
    const keyword = search.toLowerCase();
    return achievements.filter((item) =>
      [item.code, item.title, item.level, item.student?.fullName ?? "", item.class?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [achievements, search]);

  const selectedStudent = students.find((student) => student.fullName === form.studentName) ?? null;
  const selectedClass = classes.find((item) => item.name === form.className) ?? null;

  const handleChange = (field: keyof AchievementForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      ...defaultForm,
      studentName: students[0]?.fullName ?? "",
      className: classes[0]?.name ?? "",
    });
    setFormOpen(true);
  };

  const openEdit = (item: AchievementItem) => {
    setEditing(item);
    setForm(toForm(item));
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    if (!selectedStudent || !selectedClass || !form.title || !form.level || !form.date) {
      alert("Siswa, kelas, judul, tingkat, dan tanggal wajib diisi.");
      return;
    }

    try {
      const payload = {
        studentId: selectedStudent.id,
        classId: selectedClass.id,
        title: form.title,
        level: form.level,
        date: form.date,
        code: form.code || undefined,
      };

      if (editing) {
        await updateAchievement(token, editing.id, payload);
      } else {
        await createAchievement(token, payload);
      }
      await refreshAchievements(false);
      setFormOpen(false);
      setEditing(null);
      setForm(defaultForm);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Prestasi gagal disimpan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Yakin ingin menghapus prestasi ini?")) return;

    try {
      await deleteAchievement(token, id);
      await refreshAchievements(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Prestasi gagal dihapus.");
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Dashboard / Kesiswaan / Prestasi</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Prestasi</h1>
            <p className="mt-1 text-slate-500">Kelola prestasi siswa dari database.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openAdd}>
            <Plus size={16} className="mr-2" />
            Tambah Prestasi
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 rounded-2xl bg-slate-50 pl-9"
                placeholder="Cari siswa, kode, prestasi, tingkat, atau kelas..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500">Memuat prestasi dari backend...</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                      <Trophy size={21} />
                    </div>
                    <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50">{item.level}</Badge>
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase text-slate-400">{item.code}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">{item.title}</h2>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{item.student?.fullName ?? "-"}</p>
                  <p className="text-sm text-slate-500">{item.class?.name ?? "-"} • {formatDate(item.date)}</p>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => { setSelected(item); setDetailOpen(true); }}>
                      <Eye size={16} />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => openEdit(item)}>
                      <Pencil size={16} />
                    </Button>
                    <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AchievementFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? "Edit Prestasi" : "Tambah Prestasi"}
          description="Isi data prestasi siswa."
          form={form}
          students={students}
          classes={classes}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={editing ? "Simpan Perubahan" : "Simpan Prestasi"}
        />

        <AchievementDetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={selected} />
      </section>
    </DashboardLayout>
  );
}

function AchievementFormDialog({
  open,
  onOpenChange,
  title,
  description,
  form,
  students,
  classes,
  onChange,
  onSubmit,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: AchievementForm;
  students: StudentItem[];
  classes: ClassItem[];
  onChange: (field: keyof AchievementForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(820px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kode</Label>
              <Input placeholder="Opsional, otomatis jika kosong" value={form.code} onChange={(event) => onChange("code", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={form.date} onChange={(event) => onChange("date", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Siswa</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.studentName} onChange={(event) => onChange("studentName", event.target.value)}>
                {students.map((student) => <option key={student.id} value={student.fullName}>{student.fullName}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.className} onChange={(event) => onChange("className", event.target.value)}>
                {classes.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Nama Prestasi</Label>
              <Input value={form.title} onChange={(event) => onChange("title", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tingkat</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.level} onChange={(event) => onChange("level", event.target.value)}>
                {levels.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{submitLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AchievementDetailDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AchievementItem | null;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(720px,calc(100vw-32px))] !max-w-none rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Prestasi</DialogTitle>
          <DialogDescription>{item.code} • {item.level}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Nama Prestasi" value={item.title} />
          <Info label="Tanggal" value={formatDate(item.date)} />
          <Info label="Siswa" value={item.student?.fullName ?? "-"} />
          <Info label="Kelas" value={item.class?.name ?? "-"} />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}
