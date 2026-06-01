"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Printer,
  Search,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { attendances } from "@/data/attendances";
import { classes } from "@/data/classes";
import { grades } from "@/data/grades";
import { students } from "@/data/students";
import { teachers } from "@/data/teachers";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ReportType =
  | "Akademik"
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
}> = [
  {
    title: "Laporan Akademik",
    type: "Akademik",
    description: "Ringkasan kelas, mapel, jadwal, dan aktivitas akademik.",
  },
  {
    title: "Laporan Absensi",
    type: "Absensi",
    description: "Rekap kehadiran siswa berdasarkan kelas dan periode.",
  },
  {
    title: "Laporan Nilai",
    type: "Nilai",
    description: "Rekap nilai, rata-rata, dan predikat per kelas.",
  },
  {
    title: "Laporan Surat Izin",
    type: "Surat Izin",
    description: "Rekap izin, sakit, dan status persetujuan siswa.",
  },
  {
    title: "Laporan Prestasi",
    type: "Prestasi",
    description: "Rekap capaian siswa berdasarkan periode dan tingkat.",
  },
  {
    title: "Laporan Data Siswa",
    type: "Data Siswa",
    description: "Data siswa aktif berdasarkan kelas dan jurusan.",
  },
  {
    title: "Laporan Data Guru",
    type: "Data Guru",
    description: "Data guru, jabatan, mata pelajaran, dan status.",
  },
];

const leaveSummaryRows = [
  ["X IPA 1", "4 surat", "2 menunggu", "2 disetujui"],
  ["X IPS 1", "2 surat", "1 menunggu", "1 disetujui"],
  ["XI IPA 1", "1 surat", "0 menunggu", "1 disetujui"],
];

const achievementRows = [
  ["Ahmad Maulana", "X IPA 1", "Olimpiade Matematika", "Kabupaten"],
  ["Maryam Azzahra", "XI Agama", "MTQ Pelajar", "Provinsi"],
  ["Dinda Larasati", "XII IPS 1", "English Debate", "Kabupaten"],
];

function getReportRows(type: ReportType, className: string) {
  if (type === "Absensi") {
    return attendances
      .filter((item) => className === "Semua" || item.className === className)
      .map((item) => [
        item.studentName,
        item.className,
        item.subject,
        item.date,
        item.status,
      ]);
  }

  if (type === "Nilai") {
    return grades
      .filter((item) => className === "Semua" || item.className === className)
      .map((item) => [
        item.studentName,
        item.className,
        item.subject,
        item.finalScore.toString(),
        item.predicate,
      ]);
  }

  if (type === "Data Siswa") {
    return students
      .filter((item) => className === "Semua" || item.className === className)
      .map((item) => [
        item.nis,
        item.fullName,
        item.className,
        item.major,
        item.status,
      ]);
  }

  if (type === "Data Guru") {
    return teachers.map((item) => [
      item.nip,
      item.fullName,
      item.subject,
      item.position,
      item.status,
    ]);
  }

  if (type === "Surat Izin") {
    return leaveSummaryRows;
  }

  if (type === "Prestasi") {
    return achievementRows;
  }

  return classes.map((item) => [
    item.name,
    item.grade,
    item.major,
    item.homeroomTeacher,
    `${item.totalStudents} siswa`,
  ]);
}

function getReportColumns(type: ReportType) {
  if (type === "Absensi") return ["Siswa", "Kelas", "Mapel", "Tanggal", "Status"];
  if (type === "Nilai") return ["Siswa", "Kelas", "Mapel", "Nilai", "Predikat"];
  if (type === "Data Siswa") return ["NIS", "Nama", "Kelas", "Jurusan", "Status"];
  if (type === "Data Guru") return ["NIP", "Nama", "Mapel", "Jabatan", "Status"];
  if (type === "Surat Izin") return ["Kelas", "Total", "Menunggu", "Disetujui"];
  if (type === "Prestasi") return ["Siswa", "Kelas", "Prestasi", "Tingkat"];
  return ["Kelas", "Tingkat", "Jurusan", "Wali Kelas", "Siswa"];
}

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>("Absensi");
  const [selectedClass, setSelectedClass] = useState("X IPA 1");
  const [period, setPeriod] = useState("Mei 2026");
  const [search, setSearch] = useState("");

  const reportRows = useMemo(() => {
    const keyword = search.toLowerCase();

    return getReportRows(selectedType, selectedClass).filter((row) =>
      row.join(" ").toLowerCase().includes(keyword),
    );
  }, [selectedType, selectedClass, search]);

  const columns = getReportColumns(selectedType);

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
              Laporan dibuat otomatis dari data siswa, guru, kelas, absensi,
              nilai, surat izin, dan prestasi.
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
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
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

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={selectedClass}
                onChange={(event) => setSelectedClass(event.target.value)}
              >
                <option value="Semua">Semua Kelas</option>
                {classes.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option value="Mei 2026">Mei 2026</option>
                <option value="Semester Ganjil">Semester Ganjil</option>
                <option value="2026/2027">2026/2027</option>
              </select>

              <Button variant="outline" className="h-11 rounded-2xl">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b bg-white px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Laporan {selectedType}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Kelas: {selectedClass} • Periode: {period} • Data otomatis
                    dari sistem
                  </p>
                </div>

                <Button variant="outline">
                  <Eye size={16} className="mr-2" />
                  Lihat Detail
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {columns.map((column, index) => (
                      <th
                        key={column}
                        className={`px-4 py-4 text-left text-xs font-extrabold text-slate-500 ${
                          index === 0 ? "rounded-l-2xl" : ""
                        } ${
                          index === columns.length - 1 ? "rounded-r-2xl" : ""
                        }`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row, rowIndex) => (
                    <tr
                      key={`${rowIndex}-${row.join("-")}`}
                      className={rowIndex % 2 === 1 ? "bg-slate-50/70" : ""}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          className={`px-4 py-4 font-semibold text-slate-700 ${
                            rowIndex % 2 === 1 && cellIndex === 0
                              ? "rounded-l-xl"
                              : ""
                          } ${
                            rowIndex % 2 === 1 && cellIndex === row.length - 1
                              ? "rounded-r-xl"
                              : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
}
