"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trophy,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GradeBadge } from "@/components/shared/grade-badge";
import { grades as initialGrades } from "@/data/grades";
import { Grade } from "@/types/grade";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GradeForm = {
  studentName: string;
  className: string;
  subject: string;
  teacher: string;
  assignmentScore: string;
  dailyScore: string;
  midtermScore: string;
  finalExamScore: string;
  note: string;
};

const defaultForm: GradeForm = {
  studentName: "Ahmad Fauzi",
  className: "X IPA 1",
  subject: "Matematika",
  teacher: "Drs. Ahmad Zainuddin",
  assignmentScore: "0",
  dailyScore: "0",
  midtermScore: "0",
  finalExamScore: "0",
  note: "",
};

const classOptions = [
  "X IPA 1",
  "X IPS 1",
  "XI IPA 1",
  "XI IPS 1",
  "XI Agama",
  "XII IPA 1",
  "XII IPS 1",
  "XII Agama",
];

const subjectOptions = [
  "Al-Qur'an Hadis",
  "Fikih",
  "Bahasa Arab",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Matematika",
  "Biologi",
  "Fisika",
  "Kimia",
  "Ekonomi",
  "Sosiologi",
  "Informatika",
];

function gradeToForm(grade: Grade): GradeForm {
  return {
    studentName: grade.studentName,
    className: grade.className,
    subject: grade.subject,
    teacher: grade.teacher,
    assignmentScore: String(grade.assignmentScore),
    dailyScore: String(grade.dailyScore),
    midtermScore: String(grade.midtermScore),
    finalExamScore: String(grade.finalExamScore),
    note: grade.note || "",
  };
}

function calculateFinalScore(
  assignmentScore: number,
  dailyScore: number,
  midtermScore: number,
  finalExamScore: number
) {
  return (
    assignmentScore * 0.2 +
    dailyScore * 0.2 +
    midtermScore * 0.25 +
    finalExamScore * 0.35
  );
}

function getPredicate(score: number): Grade["predicate"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

function normalizeScore(value: string) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 0;
  if (numberValue < 0) return 0;
  if (numberValue > 100) return 100;

  return numberValue;
}

function formatScore(value: number) {
  return Number(value.toFixed(2)).toString();
}

function getGradeFromClass(className: string) {
  if (className.startsWith("XII")) return "XII";
  if (className.startsWith("XI")) return "XI";
  return "X";
}

function groupGradesByClass(grades: Grade[]) {
  return grades.reduce<Record<string, Grade[]>>((groups, item) => {
    if (!groups[item.className]) {
      groups[item.className] = [];
    }

    groups[item.className].push(item);
    return groups;
  }, {});
}

function groupGradesByStudent(grades: Grade[]) {
  return grades.reduce<Record<string, Grade[]>>((groups, grade) => {
    if (!groups[grade.studentName]) {
      groups[grade.studentName] = [];
    }

    groups[grade.studentName].push(grade);
    return groups;
  }, {});
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [search, setSearch] = useState("");

  const [classFilter, setClassFilter] = useState("Semua");
  const [subjectFilter, setSubjectFilter] = useState("Semua");
  const [predicateFilter, setPredicateFilter] = useState("Semua");

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentClass, setSelectedStudentClass] = useState("");
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);

  const [form, setForm] = useState<GradeForm>(defaultForm);

  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        grade.studentName.toLowerCase().includes(keyword) ||
        grade.className.toLowerCase().includes(keyword) ||
        grade.subject.toLowerCase().includes(keyword) ||
        grade.teacher.toLowerCase().includes(keyword) ||
        grade.predicate.toLowerCase().includes(keyword);

      const matchClass =
        classFilter === "Semua" || grade.className === classFilter;

      const matchSubject =
        subjectFilter === "Semua" || grade.subject === subjectFilter;

      const matchPredicate =
        predicateFilter === "Semua" || grade.predicate === predicateFilter;

      return matchSearch && matchClass && matchSubject && matchPredicate;
    });
  }, [grades, search, classFilter, subjectFilter, predicateFilter]);

  const groupedGrades = useMemo(() => {
    return groupGradesByClass(filteredGrades);
  }, [filteredGrades]);

  const classNames = Object.keys(groupedGrades);

  const selectedStudentGrades = grades.filter(
    (grade) =>
      grade.studentName === selectedStudentName &&
      grade.className === selectedStudentClass
  );

  const handleChange = (field: keyof GradeForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const buildGradeFromForm = (id: string): Grade => {
    const assignmentScore = normalizeScore(form.assignmentScore);
    const dailyScore = normalizeScore(form.dailyScore);
    const midtermScore = normalizeScore(form.midtermScore);
    const finalExamScore = normalizeScore(form.finalExamScore);

    const finalScore = Number(
      calculateFinalScore(
        assignmentScore,
        dailyScore,
        midtermScore,
        finalExamScore
      ).toFixed(2)
    );

    const predicate = getPredicate(finalScore);

    return {
      id,
      studentName: form.studentName,
      className: form.className,
      subject: form.subject,
      teacher: form.teacher,
      assignmentScore,
      dailyScore,
      midtermScore,
      finalExamScore,
      finalScore,
      predicate,
      note: form.note,
    };
  };

  const validateForm = () => {
    if (!form.studentName || !form.className || !form.subject || !form.teacher) {
      alert("Siswa, kelas, mata pelajaran, dan guru wajib diisi.");
      return false;
    }

    return true;
  };

  const handleAddSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    const newGrade = buildGradeFromForm(Date.now().toString());

    setGrades((previous) => [newGrade, ...previous]);
    setForm(defaultForm);
    setAddOpen(false);
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedGrade) return;
    if (!validateForm()) return;

    const updatedGrade = buildGradeFromForm(selectedGrade.id);

    setGrades((previous) =>
      previous.map((grade) =>
        grade.id === selectedGrade.id ? updatedGrade : grade
      )
    );

    setSelectedGrade(null);
    setForm(defaultForm);
    setEditOpen(false);
  };

  const handleDetail = (grade: Grade) => {
    setSelectedGrade(grade);
    setDetailOpen(true);
  };

  const handleStudentDetail = (studentName: string, className: string) => {
    setSelectedStudentName(studentName);
    setSelectedStudentClass(className);
    setStudentDetailOpen(true);
  };

  const handleEdit = (grade: Grade) => {
    setSelectedGrade(grade);
    setForm(gradeToForm(grade));
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    const confirmed = confirm("Yakin ingin menghapus data nilai ini?");

    if (!confirmed) return;

    setGrades((previous) => previous.filter((grade) => grade.id !== id));
  };

  const resetFilter = () => {
    setSearch("");
    setClassFilter("Semua");
    setSubjectFilter("Semua");
    setPredicateFilter("Semua");
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Akademik / Nilai
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Rekap Nilai Per Kelas
            </h1>
            <p className="mt-1 text-slate-500">
              Card kelas menampilkan nama siswa/siswi. Klik siswa untuk melihat
              semua nilai mata pelajarannya.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Export Nilai
            </Button>

            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setForm(defaultForm);
                setAddOpen(true);
              }}
            >
              <Plus size={16} className="mr-2" />
              Input Nilai
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_180px_150px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari siswa, kelas, mapel, guru..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option value="Semua">Kelas</option>
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
              >
                <option value="Semua">Mata Pelajaran</option>
                {subjectOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={predicateFilter}
                onChange={(event) => setPredicateFilter(event.target.value)}
              >
                <option value="Semua">Predikat</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
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

        <div className="grid gap-5 xl:grid-cols-2">
          {classNames.map((className) => {
            const classGrades = groupedGrades[className];

            return (
              <GradeClassCard
                key={className}
                classNameText={className}
                grades={classGrades}
                onStudentDetail={handleStudentDetail}
              />
            );
          })}

          {classNames.length === 0 && (
            <Card className="border-0 shadow-sm xl:col-span-2">
              <CardContent className="p-10 text-center text-slate-500">
                Data nilai tidak ditemukan.
              </CardContent>
            </Card>
          )}
        </div>

        <GradeFormDialog
          title="Input Nilai Siswa"
          description="Masukkan nilai siswa. Nilai akhir dan predikat dihitung otomatis."
          open={addOpen}
          onOpenChange={setAddOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleAddSubmit}
          submitLabel="Simpan Nilai"
        />

        <StudentGradeDetailDialog
          open={studentDetailOpen}
          onOpenChange={setStudentDetailOpen}
          studentName={selectedStudentName}
          classNameText={selectedStudentClass}
          grades={selectedStudentGrades}
          onDetail={(grade) => {
            setStudentDetailOpen(false);
            handleDetail(grade);
          }}
          onEdit={(grade) => {
            setStudentDetailOpen(false);
            handleEdit(grade);
          }}
          onDelete={handleDelete}
        />

        <GradeFormDialog
          title="Edit Nilai Siswa"
          description="Ubah nilai siswa. Nilai akhir dan predikat dihitung ulang otomatis."
          open={editOpen}
          onOpenChange={setEditOpen}
          form={form}
          onChange={handleChange}
          onSubmit={handleEditSubmit}
          submitLabel="Simpan Perubahan"
        />

        <GradeDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          grade={selectedGrade}
        />
      </section>
    </DashboardLayout>
  );
}

function GradeClassCard({
  classNameText,
  grades,
  onStudentDetail,
}: {
  classNameText: string;
  grades: Grade[];
  onStudentDetail: (studentName: string, className: string) => void;
}) {
  const groupedStudents = groupGradesByStudent(grades);
  const studentNames = Object.keys(groupedStudents);
  const totalSubjectGrades = grades.length;

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="border-b bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-500 text-xl font-extrabold text-white">
              {getGradeFromClass(classNameText)}
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {classNameText}
              </h2>
              <p className="text-sm text-slate-500">
                {studentNames.length} siswa/siswi • {totalSubjectGrades} nilai
                mapel tercatat
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {studentNames.map((studentName) => (
            <button
              key={studentName}
              type="button"
              onClick={() => onStudentDetail(studentName, classNameText)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                  {studentName.charAt(0)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold text-slate-900">
                    {studentName}
                  </span>
                  <span className="block text-xs font-medium text-slate-500">
                    Klik untuk lihat semua nilai mata pelajaran
                  </span>
                </span>
              </div>

              <Eye size={18} className="shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StudentGradeDetailDialog({
  open,
  onOpenChange,
  studentName,
  classNameText,
  grades,
  onDetail,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  classNameText: string;
  grades: Grade[];
  onDetail: (grade: Grade) => void;
  onEdit: (grade: Grade) => void;
  onDelete: (id: string) => void;
}) {
  const average =
    grades.length === 0
      ? 0
      : Number(
          (
            grades.reduce((sum, grade) => sum + grade.finalScore, 0) /
            grades.length
          ).toFixed(2)
        );

  const predicate = getPredicate(average);
  const bestGrade = grades.reduce<Grade | null>((best, grade) => {
    if (!best) return grade;
    return grade.finalScore > best.finalScore ? grade : best;
  }, null);
  const lowestGrade = grades.reduce<Grade | null>((lowest, grade) => {
    if (!lowest) return grade;
    return grade.finalScore < lowest.finalScore ? grade : lowest;
  }, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(1180px,calc(100vw-32px))] !max-w-none max-h-[92vh] overflow-hidden rounded-3xl p-0">
        <DialogHeader className="border-b bg-white px-6 py-5 pr-14">
          <DialogTitle className="text-xl font-extrabold text-slate-900">
            Detail Nilai Siswa
          </DialogTitle>
          <DialogDescription>
            Rekap semua nilai mata pelajaran siswa yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(92vh-92px)] overflow-y-auto bg-slate-50 p-5">
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="h-fit rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-0">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-extrabold text-white">
                  {studentName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-2xl font-extrabold text-slate-900">
                    {studentName}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {classNameText}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700">
                    Rata-rata
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-700">
                    {formatScore(average)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold text-slate-500">
                    Predikat
                  </p>
                  <GradeBadge predicate={predicate} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
              <MiniSummary
                label="Mapel Tercatat"
                value={`${grades.length} mapel`}
                helper="Semua nilai yang sudah diinput"
              />
              <MiniSummary
                label="Nilai Tertinggi"
                value={
                  bestGrade
                    ? `${bestGrade.subject} (${formatScore(bestGrade.finalScore)})`
                    : "-"
                }
                helper="Mapel dengan nilai terbaik"
              />
              <MiniSummary
                label="Perlu Perhatian"
                value={
                  lowestGrade
                    ? `${lowestGrade.subject} (${formatScore(lowestGrade.finalScore)})`
                    : "-"
                }
                helper="Mapel dengan nilai terendah"
              />
              </div>
            </aside>

            <section className="space-y-4">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="rounded-3xl border bg-white p-5 shadow-sm transition hover:border-emerald-200"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-slate-900">
                          {grade.subject}
                        </h4>
                        <GradeBadge predicate={grade.predicate} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {grade.teacher}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {grade.note || "Belum ada catatan guru."}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[130px_1fr] xl:min-w-[580px] xl:grid-cols-[130px_1fr_132px] xl:items-center">
                      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center">
                        <p className="text-xs font-semibold text-slate-500">
                          Nilai Akhir
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                          {formatScore(grade.finalScore)}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <ScorePill label="Tugas" value={grade.assignmentScore} />
                        <ScorePill label="Harian" value={grade.dailyScore} />
                        <ScorePill label="PTS" value={grade.midtermScore} />
                        <ScorePill label="PAS" value={grade.finalExamScore} />
                      </div>

                      <div className="flex justify-start gap-2 xl:justify-end">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onDetail(grade)}
                        >
                          <Eye size={16} />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => onEdit(grade)}
                        >
                          <Pencil size={16} />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDelete(grade.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {grades.length === 0 && (
                <div className="rounded-2xl border bg-white px-5 py-10 text-center text-slate-500">
                  Belum ada nilai mata pelajaran untuk siswa ini.
                </div>
              )}
            </section>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MiniSummary({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2">
      <p className="font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-slate-900">
        {formatScore(value)}
      </p>
    </div>
  );
}

type GradeFormDialogProps = {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: GradeForm;
  onChange: (field: keyof GradeForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
};

function GradeFormDialog({
  title,
  description,
  open,
  onOpenChange,
  form,
  onChange,
  onSubmit,
  submitLabel,
}: GradeFormDialogProps) {
  const previewAssignment = normalizeScore(form.assignmentScore);
  const previewDaily = normalizeScore(form.dailyScore);
  const previewMidterm = normalizeScore(form.midtermScore);
  const previewFinalExam = normalizeScore(form.finalExamScore);

  const previewFinalScore = Number(
    calculateFinalScore(
      previewAssignment,
      previewDaily,
      previewMidterm,
      previewFinalExam
    ).toFixed(2)
  );

  const previewPredicate = getPredicate(previewFinalScore);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(920px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Siswa</Label>
              <Input
                placeholder="Contoh: Ahmad Fauzi"
                value={form.studentName}
                onChange={(event) =>
                  onChange("studentName", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.className}
                onChange={(event) => onChange("className", event.target.value)}
              >
                {classOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.subject}
                onChange={(event) => onChange("subject", event.target.value)}
              >
                {subjectOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Guru Pengajar</Label>
              <Input
                placeholder="Contoh: Drs. Ahmad Zainuddin"
                value={form.teacher}
                onChange={(event) => onChange("teacher", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nilai Tugas</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.assignmentScore}
                onChange={(event) =>
                  onChange("assignmentScore", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Nilai Harian</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.dailyScore}
                onChange={(event) => onChange("dailyScore", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nilai PTS</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.midtermScore}
                onChange={(event) =>
                  onChange("midtermScore", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Nilai PAS</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.finalExamScore}
                onChange={(event) =>
                  onChange("finalExamScore", event.target.value)
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Catatan Guru</Label>
              <Input
                placeholder="Contoh: Aktif dalam pembelajaran"
                value={form.note}
                onChange={(event) => onChange("note", event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Preview Nilai Akhir</p>
                <p className="text-2xl font-bold text-slate-900">
                  {previewFinalScore}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-slate-500">Predikat</p>
                <GradeBadge predicate={previewPredicate} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Rumus: Tugas 20% + Harian 20% + PTS 25% + PAS 35%
            </p>
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
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type GradeDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade: Grade | null;
};

function GradeDetailDialog({
  open,
  onOpenChange,
  grade,
}: GradeDetailDialogProps) {
  if (!grade) return null;

  const scoreBreakdown = [
    {
      label: "Nilai Tugas",
      score: grade.assignmentScore,
      weight: 20,
      contribution: grade.assignmentScore * 0.2,
    },
    {
      label: "Nilai Harian",
      score: grade.dailyScore,
      weight: 20,
      contribution: grade.dailyScore * 0.2,
    },
    {
      label: "Nilai PTS",
      score: grade.midtermScore,
      weight: 25,
      contribution: grade.midtermScore * 0.25,
    },
    {
      label: "Nilai PAS",
      score: grade.finalExamScore,
      weight: 35,
      contribution: grade.finalExamScore * 0.35,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(960px,calc(100vw-32px))] !max-w-none max-h-[92vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Nilai Mata Pelajaran</DialogTitle>
          <DialogDescription>
            Rincian komponen nilai dan hasil perhitungan akhir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-emerald-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="shrink-0 text-emerald-700" />
                  <h3 className="break-words text-xl font-extrabold text-slate-900">
                    {grade.studentName}
                  </h3>
                </div>

                <p className="mt-2 break-words text-sm text-slate-600">
                  {grade.className} • {grade.subject}
                </p>

                <p className="mt-1 break-words text-sm text-slate-600">
                  Guru: {grade.teacher}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">
                    Nilai Akhir
                  </p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-600">
                    {formatScore(grade.finalScore)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    Predikat
                  </p>
                  <GradeBadge predicate={grade.predicate} />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border">
            <div className="grid grid-cols-[1fr_90px_90px_110px] gap-3 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
              <div>Komponen</div>
              <div>Nilai</div>
              <div>Bobot</div>
              <div>Kontribusi</div>
            </div>

            <div className="divide-y bg-white">
              {scoreBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[1fr_90px_90px_110px] gap-3 px-4 py-3 text-sm"
                >
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="text-slate-700">{formatScore(item.score)}</div>
                  <div className="text-slate-700">{item.weight}%</div>
                  <div className="font-semibold text-slate-900">
                    {formatScore(item.contribution)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-emerald-50 p-4">
            <div className="flex items-start gap-2">
              <BarChart3 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
              <div>
                <p className="font-semibold text-emerald-900">
                  Rumus: Tugas 20% + Harian 20% + PTS 25% + PAS 35%
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Total kontribusi: {scoreBreakdown
                    .reduce((sum, item) => sum + item.contribution, 0)
                    .toFixed(2)}{" "}
                  dan dibulatkan menjadi {formatScore(grade.finalScore)}.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs font-semibold text-slate-500">
              Catatan Guru
            </p>
            <p className="mt-2 leading-7 text-slate-700">
              {grade.note || "Belum ada catatan untuk nilai ini."}
            </p>
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
