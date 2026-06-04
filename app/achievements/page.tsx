"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AchievementItem, getAchievements } from "@/services/achievement-service";
import { useAuthStore } from "@/store/auth-store";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function AchievementsPage() {
  const { token } = useAuthStore();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAchievements() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getAchievements(token);
        setAchievements(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat prestasi dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, [token]);

  const filteredAchievements = useMemo(() => {
    const keyword = search.toLowerCase();
    return achievements.filter((item) =>
      [
        item.code,
        item.title,
        item.level,
        item.student?.fullName ?? "",
        item.class?.name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [achievements, search]);

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <p className="text-sm text-slate-500">
            Dashboard / Kesiswaan / Prestasi
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Prestasi</h1>
          <p className="mt-1 text-slate-500">
            Data prestasi siswa diambil langsung dari backend.
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
                placeholder="Cari siswa, kode, prestasi, atau kelas..."
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
            Memuat prestasi dari backend...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredAchievements.map((item) => (
              <Card key={item.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                      <Trophy size={21} />
                    </div>
                    <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {item.level}
                    </Badge>
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase text-slate-400">
                    {item.code}
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {item.student?.fullName ?? "-"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.class?.name ?? "-"} • {formatDate(item.date)}
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
