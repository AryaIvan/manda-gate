"use client";

import { useMemo, useState } from "react";
import { BookOpen, Eye, Filter, Search } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { classes } from "@/data/classes";

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

type ClassSubject = {
  id: string;
  code: string;
  name: string;
  group: string;
  className: string;
  teacher: string;
  isActive: boolean;
};

const classSubjects: ClassSubject[] = [
  {
    id: "xipa1-mtk",
    code: "MTK-XIPA1",
    name: "Matematika",
    group: "Umum",
    className: "X IPA 1",
    teacher: "Drs. Ahmad Zainuddin",
    isActive: true,
  },
  {
    id: "xipa1-bio",
    code: "BIO-XIPA1",
    name: "Biologi",
    group: "Peminatan",
    className: "X IPA 1",
    teacher: "Aisyah Fitriani, S.Pd",
    isActive: true,
  },
  {
    id: "xipa1-fis",
    code: "FIS-XIPA1",
    name: "Fisika",
    group: "Peminatan",
    className: "X IPA 1",
    teacher: "Dewi Lestari, S.Pd",
    isActive: true,
  },
  {
    id: "xipa1-kim",
    code: "KIM-XIPA1",
    name: "Kimia",
    group: "Peminatan",
    className: "X IPA 1",
    teacher: "Rina Marlina, S.Pd",
    isActive: true,
  },
  {
    id: "xipa1-bin",
    code: "BIN-XIPA1",
    name: "Bahasa Indonesia",
    group: "Bahasa",
    className: "X IPA 1",
    teacher: "Siti Rahmawati, S.Pd",
    isActive: true,
  },
  {
    id: "xipa1-big",
    code: "BIG-XIPA1",
    name: "Bahasa Inggris",
    group: "Bahasa",
    className: "X IPA 1",
    teacher: "Nurul Hidayah, S.Pd",
    isActive: true,
  },
  {
    id: "xipa1-qh",
    code: "QH-XIPA1",
    name: "Al-Qur'an Hadis",
    group: "Keagamaan",
    className: "X IPA 1",
    teacher: "Muhammad Hasan, S.Ag",
    isActive: true,
  },
  {
    id: "xips1-bin",
    code: "BIN-XIPS1",
    name: "Bahasa Indonesia",
    group: "Bahasa",
    className: "X IPS 1",
    teacher: "Siti Rahmawati, S.Pd",
    isActive: true,
  },
  {
    id: "xips1-eko",
    code: "EKO-XIPS1",
    name: "Ekonomi",
    group: "Peminatan",
    className: "X IPS 1",
    teacher: "Agus Prasetyo, S.Pd",
    isActive: true,
  },
  {
    id: "xips1-geo",
    code: "GEO-XIPS1",
    name: "Geografi",
    group: "Peminatan",
    className: "X IPS 1",
    teacher: "Dwi Kurniawan, S.Pd",
    isActive: true,
  },
  {
    id: "xips1-sos",
    code: "SOS-XIPS1",
    name: "Sosiologi",
    group: "Peminatan",
    className: "X IPS 1",
    teacher: "Budi Santoso, S.Pd",
    isActive: true,
  },
  {
    id: "xiipa1-inf",
    code: "INF-XIIPA1",
    name: "Informatika",
    group: "Umum",
    className: "XI IPA 1",
    teacher: "Budi Santoso, S.Kom",
    isActive: true,
  },
  {
    id: "xiipa1-bio",
    code: "BIO-XIIPA1",
    name: "Biologi",
    group: "Peminatan",
    className: "XI IPA 1",
    teacher: "Aisyah Fitriani, S.Pd",
    isActive: true,
  },
  {
    id: "xiipa1-fis",
    code: "FIS-XIIPA1",
    name: "Fisika",
    group: "Peminatan",
    className: "XI IPA 1",
    teacher: "Dewi Lestari, S.Pd",
    isActive: true,
  },
  {
    id: "xiipa1-kim",
    code: "KIM-XIIPA1",
    name: "Kimia",
    group: "Peminatan",
    className: "XI IPA 1",
    teacher: "Rina Marlina, S.Pd",
    isActive: true,
  },
  {
    id: "xiipa1-mtk",
    code: "MTK-XIIPA1",
    name: "Matematika",
    group: "Umum",
    className: "XI IPA 1",
    teacher: "Drs. Ahmad Zainuddin",
    isActive: true,
  },
  {
    id: "xiips1-eko",
    code: "EKO-XIIPS1",
    name: "Ekonomi",
    group: "Peminatan",
    className: "XI IPS 1",
    teacher: "Agus Prasetyo, S.Pd",
    isActive: true,
  },
  {
    id: "xiips1-geo",
    code: "GEO-XIIPS1",
    name: "Geografi",
    group: "Peminatan",
    className: "XI IPS 1",
    teacher: "Dwi Kurniawan, S.Pd",
    isActive: true,
  },
  {
    id: "xiips1-sos",
    code: "SOS-XIIPS1",
    name: "Sosiologi",
    group: "Peminatan",
    className: "XI IPS 1",
    teacher: "Budi Santoso, S.Pd",
    isActive: true,
  },
  {
    id: "xiips1-bin",
    code: "BIN-XIIPS1",
    name: "Bahasa Indonesia",
    group: "Bahasa",
    className: "XI IPS 1",
    teacher: "Siti Rahmawati, S.Pd",
    isActive: true,
  },
  {
    id: "xiips1-big",
    code: "BIG-XIIPS1",
    name: "Bahasa Inggris",
    group: "Bahasa",
    className: "XI IPS 1",
    teacher: "Nurul Hidayah, S.Pd",
    isActive: true,
  },
  {
    id: "xiiipa1-mtk",
    code: "MTK-XIIIPA1",
    name: "Matematika",
    group: "Umum",
    className: "XII IPA 1",
    teacher: "Drs. Ahmad Zainuddin",
    isActive: true,
  },
  {
    id: "xiiipa1-bio",
    code: "BIO-XIIIPA1",
    name: "Biologi",
    group: "Peminatan",
    className: "XII IPA 1",
    teacher: "Aisyah Fitriani, S.Pd",
    isActive: true,
  },
  {
    id: "xiiipa1-fis",
    code: "FIS-XIIIPA1",
    name: "Fisika",
    group: "Peminatan",
    className: "XII IPA 1",
    teacher: "Dewi Lestari, S.Pd",
    isActive: true,
  },
  {
    id: "xiiipa1-kim",
    code: "KIM-XIIIPA1",
    name: "Kimia",
    group: "Peminatan",
    className: "XII IPA 1",
    teacher: "Rina Marlina, S.Pd",
    isActive: true,
  },
  {
    id: "xiiipa1-inf",
    code: "INF-XIIIPA1",
    name: "Informatika",
    group: "Umum",
    className: "XII IPA 1",
    teacher: "Budi Santoso, S.Kom",
    isActive: true,
  },
  {
    id: "xiiipa1-big",
    code: "BIG-XIIIPA1",
    name: "Bahasa Inggris",
    group: "Bahasa",
    className: "XII IPA 1",
    teacher: "Nurul Hidayah, S.Pd",
    isActive: true,
  },
];

export default function SubjectsPage() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Semua");
  const [majorFilter, setMajorFilter] = useState("Semua");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<ClassSubject | null>(
    null,
  );
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);

  const filteredClasses = useMemo(() => {
    const keyword = search.toLowerCase();

    return classes.filter((schoolClass) => {
      const matchesSearch =
        schoolClass.name.toLowerCase().includes(keyword) ||
        schoolClass.major.toLowerCase().includes(keyword) ||
        schoolClass.grade.toLowerCase().includes(keyword);

      const matchesGrade =
        gradeFilter === "Semua" || schoolClass.grade === gradeFilter;

      const matchesMajor =
        majorFilter === "Semua" || schoolClass.major === majorFilter;

      return matchesSearch && matchesGrade && matchesMajor;
    });
  }, [search, gradeFilter, majorFilter]);

  const selectedClassSubjects = classSubjects.filter(
    (subject) => subject.className === selectedClassName,
  );

  const openClassSubjects = (className: string) => {
    setSelectedClassName(className);
    setClassDialogOpen(true);
  };

  const openSubjectDetail = (subject: ClassSubject) => {
    setSelectedSubject(subject);
    setSubjectDialogOpen(true);
  };

  const resetFilter = () => {
    setSearch("");
    setGradeFilter("Semua");
    setMajorFilter("Semua");
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Master Data / Mata Pelajaran
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Data Mata Pelajaran
            </h1>
            <p className="mt-1 text-slate-500">
              Pilih kelas untuk melihat daftar mata pelajaran yang diajarkan.
            </p>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_150px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari kelas atau jurusan..."
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

              <Button
                variant="outline"
                className="h-11 rounded-2xl"
                onClick={resetFilter}
              >
                <Filter size={16} className="mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((schoolClass) => {
            const subjectsInClass = classSubjects.filter(
              (subject) => subject.className === schoolClass.name,
            );
            const activeSubjects = subjectsInClass.filter(
              (subject) => subject.isActive,
            );

            return (
              <button
                key={schoolClass.id}
                type="button"
                onClick={() => openClassSubjects(schoolClass.name)}
                className="rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {schoolClass.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Jurusan {schoolClass.major}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 font-extrabold text-white">
                    {schoolClass.grade}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Tingkat
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">
                      {schoolClass.grade}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold text-emerald-700">
                      Mapel Aktif
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-emerald-700">
                      {activeSubjects.length}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">
                    Lihat Mata Pelajaran
                  </span>
                  <Eye size={17} className="text-emerald-700" />
                </div>
              </button>
            );
          })}
        </div>

        <ClassSubjectsDialog
          open={classDialogOpen}
          onOpenChange={setClassDialogOpen}
          classNameText={selectedClassName}
          subjects={selectedClassSubjects}
          onSubjectClick={openSubjectDetail}
        />

        <SubjectDetailDialog
          open={subjectDialogOpen}
          onOpenChange={setSubjectDialogOpen}
          subject={selectedSubject}
        />
      </section>
    </DashboardLayout>
  );
}

function ClassSubjectsDialog({
  open,
  onOpenChange,
  classNameText,
  subjects,
  onSubjectClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classNameText: string;
  subjects: ClassSubject[];
  onSubjectClick: (subject: ClassSubject) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(980px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Mata Pelajaran {classNameText}</DialogTitle>
          <DialogDescription>
            Pilih mata pelajaran untuk melihat detail kode, kelompok, guru, dan
            status.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => onSubjectClick(subject)}
              className="rounded-2xl border bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900">
                    {subject.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {subject.code} • {subject.teacher}
                  </p>
                </div>

                <Badge
                  className={
                    subject.isActive
                      ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "rounded-full bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {subject.isActive ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
            </button>
          ))}

          {subjects.length === 0 && (
            <div className="rounded-2xl border bg-slate-50 p-8 text-center text-slate-500 md:col-span-2">
              Belum ada mata pelajaran untuk kelas ini.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SubjectDetailDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: ClassSubject | null;
}) {
  if (!subject) return null;

  const detailItems = [
    {
      label: "Nama Mapel",
      value: subject.name,
    },
    {
      label: "Kode",
      value: subject.code,
    },
    {
      label: "Kelompok",
      value: subject.group,
    },
    {
      label: "Kelas",
      value: subject.className,
    },
    {
      label: "Guru Pengampu",
      value: subject.teacher,
    },
    {
      label: "Status",
      value: subject.isActive ? "Aktif" : "Tidak Aktif",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(760px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Informasi lengkap mata pelajaran pada kelas {subject.className}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <BookOpen size={22} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {subject.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {subject.code} • {subject.className}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {detailItems.map((item) => (
              <div key={item.label} className="rounded-xl border p-3">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="font-semibold text-slate-900">{item.value}</p>
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
