"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Megaphone, Pencil, Plus, Search, Trash2 } from "lucide-react";

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
  AnnouncementItem,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "@/services/announcement-service";
import { useAuthStore } from "@/store/auth-store";

type AnnouncementForm = {
  title: string;
  content: string;
  category: string;
  targetRole: string;
  status: "ACTIVE" | "INACTIVE";
};

const defaultForm: AnnouncementForm = {
  title: "",
  content: "",
  category: "Akademik",
  targetRole: "ALL",
  status: "ACTIVE",
};

const targetRoles = ["ALL", "ADMIN", "TEACHER", "HOMEROOM_TEACHER", "STUDENT", "BK", "HEADMASTER"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function toForm(item: AnnouncementItem): AnnouncementForm {
  return {
    title: item.title,
    content: item.content,
    category: item.category,
    targetRole: item.targetRole,
    status: item.status,
  };
}

export default function AnnouncementsPage() {
  const { token } = useAuthStore();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementItem | null>(null);
  const [selected, setSelected] = useState<AnnouncementItem | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);

  const refreshAnnouncements = useCallback(async (showLoading = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError("");
      const response = await getAnnouncements(token);
      setAnnouncements(response.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memuat pengumuman dari backend.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const refreshId = window.setTimeout(() => {
      refreshAnnouncements(true);
    }, 0);

    return () => window.clearTimeout(refreshId);
  }, [refreshAnnouncements]);

  const filteredAnnouncements = useMemo(() => {
    const keyword = search.toLowerCase();
    return announcements.filter((item) =>
      [item.title, item.content, item.category, item.targetRole]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [announcements, search]);

  const handleChange = (field: keyof AnnouncementForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormOpen(true);
  };

  const openEdit = (item: AnnouncementItem) => {
    setEditing(item);
    setForm(toForm(item));
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!form.title || !form.content || !form.category || !form.targetRole) {
      alert("Judul, isi, kategori, dan target wajib diisi.");
      return;
    }

    try {
      if (editing) {
        await updateAnnouncement(token, editing.id, form);
      } else {
        await createAnnouncement(token, form);
      }
      await refreshAnnouncements(false);
      setFormOpen(false);
      setEditing(null);
      setForm(defaultForm);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Pengumuman gagal disimpan.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Yakin ingin menghapus pengumuman ini?")) return;

    try {
      await deleteAnnouncement(token, id);
      await refreshAnnouncements(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Pengumuman gagal dihapus.");
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Dashboard / Informasi / Pengumuman</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Pengumuman</h1>
            <p className="mt-1 text-slate-500">Kelola pengumuman dan target penerima.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openAdd}>
            <Plus size={16} className="mr-2" />
            Tambah Pengumuman
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 rounded-2xl bg-slate-50 pl-9"
                placeholder="Cari judul, kategori, target, atau isi pengumuman..."
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
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500">
            Memuat pengumuman dari backend...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAnnouncements.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                      <Megaphone size={21} />
                    </div>
                    <Badge className={item.status === "ACTIVE" ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "rounded-full bg-red-100 text-red-700 hover:bg-red-100"}>
                      {item.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <h2 className="mt-5 text-lg font-extrabold text-slate-900">{item.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.content}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">{item.category}</Badge>
                    <Badge variant="outline" className="rounded-full">{item.targetRole}</Badge>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-500">{formatDate(item.publishDate)}</p>
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

        <AnnouncementFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? "Edit Pengumuman" : "Tambah Pengumuman"}
          description="Isi data pengumuman yang akan ditampilkan di sistem."
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel={editing ? "Simpan Perubahan" : "Simpan Pengumuman"}
        />

        <AnnouncementDetailDialog open={detailOpen} onOpenChange={setDetailOpen} item={selected} />
      </section>
    </DashboardLayout>
  );
}

function AnnouncementFormDialog({
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
  form: AnnouncementForm;
  onChange: (field: keyof AnnouncementForm, value: string) => void;
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
            <div className="space-y-2 md:col-span-2">
              <Label>Judul</Label>
              <Input value={form.title} onChange={(event) => onChange("title", event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Isi</Label>
              <textarea
                className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.content}
                onChange={(event) => onChange("content", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input value={form.category} onChange={(event) => onChange("category", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.targetRole} onChange={(event) => onChange("targetRole", event.target.value)}>
                {targetRoles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(event) => onChange("status", event.target.value)}>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
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

function AnnouncementDetailDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AnnouncementItem | null;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(760px,calc(100vw-32px))] !max-w-none rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>{item.category} • {item.targetRole} • {formatDate(item.publishDate)}</DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl border bg-slate-50 p-4 leading-7 text-slate-700">{item.content}</div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
