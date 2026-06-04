"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone, Search } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAnnouncements, AnnouncementItem } from "@/services/announcement-service";
import { useAuthStore } from "@/store/auth-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function AnnouncementsPage() {
  const { token } = useAuthStore();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getAnnouncements(token);
        setAnnouncements(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat pengumuman dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, [token]);

  const filteredAnnouncements = useMemo(() => {
    const keyword = search.toLowerCase();
    return announcements.filter((item) =>
      [item.title, item.content, item.category, item.targetRole]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [announcements, search]);

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <p className="text-sm text-slate-500">
            Dashboard / Informasi / Pengumuman
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Pengumuman
          </h1>
          <p className="mt-1 text-slate-500">
            Data pengumuman diambil langsung dari backend.
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className="h-11 rounded-2xl bg-slate-50 pl-9"
                placeholder="Cari judul, kategori, atau isi pengumuman..."
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
                    <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      {item.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <h2 className="mt-5 text-lg font-extrabold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {item.content}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="rounded-full">
                      {item.targetRole}
                    </Badge>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    {formatDate(item.publishDate)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
