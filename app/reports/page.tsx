"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Filter,
  Printer,
  Search,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getReportData, getSummaryReport, SummaryReport } from "@/services/report-service";
import { useAuthStore } from "@/store/auth-store";

type ReportType =
  | "Ringkasan"
  | "Absensi"
  | "Nilai"
  | "Surat Izin"
  | "Prestasi"
  | "Data Siswa"
  | "Data Guru";

const reportTypes: Array<{
  title: `Laporan ${ReportType}`;
  type: ReportType;
  description: string;
  endpoint: string;
}> = [
  {
    title: "Laporan Ringkasan",
    type: "Ringkasan",
    description: "Jumlah data utama dari seluruh sistem.",
    endpoint: "/reports/summary",
  },
  {
    title: "Laporan Absensi",
    type: "Absensi",
    description: "Rekap kehadiran siswa berdasarkan data absensi.",
    endpoint: "/reports/attendance",
  },
  {
    title: "Laporan Nilai",
    type: "Nilai",
    description: "Rata-rata, predikat, nilai tertinggi dan terendah.",
    endpoint: "/reports/grades",
  },
  {
    title: "Laporan Surat Izin",
    type: "Surat Izin",
    description: "Rekap status pengajuan surat izin siswa.",
    endpoint: "/reports/leave-requests",
  },
  {
    title: "Laporan Prestasi",
    type: "Prestasi",
    description: "Rekap capaian siswa berdasarkan tingkat prestasi.",
    endpoint: "/reports/achievements",
  },
  {
    title: "Laporan Data Siswa",
    type: "Data Siswa",
    description: "Daftar siswa dari database backend.",
    endpoint: "/reports/students",
  },
  {
    title: "Laporan Data Guru",
    type: "Data Guru",
    description: "Daftar guru dari database backend.",
    endpoint: "/reports/teachers",
  },
];

function objectToRows(data: unknown): string[][] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      Object.values(item as Record<string, unknown>).map((value) =>
        value === null || value === undefined ? "-" : String(value),
      ),
    );
  }

  return Object.entries(data as Record<string, unknown>).map(([key, value]) => [
    key,
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "-"),
  ]);
}

function objectToColumns(data: unknown): string[] {
  if (Array.isArray(data)) {
    const first = data[0] as Record<string, unknown> | undefined;
    return first ? Object.keys(first) : ["Data"];
  }

  return ["Metrik", "Nilai"];
}

export default function ReportsPage() {
  const { token } = useAuthStore();
  const [selectedType, setSelectedType] = useState<ReportType>("Ringkasan");
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [reportData, setReportData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeReport = reportTypes.find((item) => item.type === selectedType)!;

  useEffect(() => {
    async function fetchReport() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        if (selectedType === "Ringkasan") {
          const response = await getSummaryReport(token);
          setSummary(response.data);
          setReportData(response.data);
          return;
        }

        const response = await getReportData<unknown>(token, activeReport.endpoint);
        setReportData(response.data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat laporan dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [activeReport.endpoint, selectedType, token]);

  const columns = reportData ? objectToColumns(reportData) : [];
  const rows = useMemo(() => {
    const keyword = search.toLowerCase();
    return reportData
      ? objectToRows(reportData).filter((row) =>
          row.join(" ").toLowerCase().includes(keyword),
        )
      : [];
  }, [reportData, search]);

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Dashboard / Laporan</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Laporan Otomatis Sistem
            </h1>
            <p className="mt-1 text-slate-500">
              Semua laporan ditarik langsung dari endpoint backend.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <FileSpreadsheet size={16} className="mr-2" />
              Export Excel
            </Button>
            <Button className="bg-slate-950 hover:bg-slate-800">
              <Printer size={16} className="mr-2" />
              Cetak
            </Button>
          </div>
        </div>

        {summary && (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
            {Object.entries(summary).map(([key, value]) => (
              <Card key={key} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-500">{key}</p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-600">
                    {value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {reportTypes.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setSelectedType(item.type)}
              className={`rounded-3xl border p-5 text-left shadow-sm transition hover:border-emerald-200 ${
                selectedType === item.type
                  ? "border-emerald-300 bg-emerald-50"
                  : "bg-white"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <BarChart3 size={20} />
              </div>
              <h2 className="mt-4 font-extrabold text-slate-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </button>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari isi laporan..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(event.target.value as ReportType)
                }
              >
                {reportTypes.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.title}
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

        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b p-5">
              <h2 className="text-lg font-extrabold text-slate-900">
                {activeReport.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Data otomatis dari backend: {activeReport.endpoint}
              </p>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Memuat laporan dari backend...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-5 py-4 font-semibold text-slate-600"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {row.map((cell, cellIndex) => (
                          <td key={`${rowIndex}-${cellIndex}`} className="px-5 py-4">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}
