"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Eye, FileText, Filter, Search } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getLeaveRequests } from "@/services/leave-request-service";
import { useAuthStore } from "@/store/auth-store";
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

type LeaveStatus = "Menunggu" | "Disetujui" | "Ditolak";

type LeaveRequest = {
  id: string;
  studentName: string;
  className: string;
  type: string;
  date: string;
  status: LeaveStatus;
  description: string;
};

function groupByClass(items: LeaveRequest[]) {
  return items.reduce<Record<string, LeaveRequest[]>>((groups, item) => {
    if (!groups[item.className]) {
      groups[item.className] = [];
    }

    groups[item.className].push(item);
    return groups;
  }, {});
}

function groupByStudent(items: LeaveRequest[]) {
  return items.reduce<Record<string, LeaveRequest[]>>((groups, item) => {
    if (!groups[item.studentName]) {
      groups[item.studentName] = [];
    }

    groups[item.studentName].push(item);
    return groups;
  }, {});
}

function countStatus(items: LeaveRequest[], status: LeaveStatus) {
  return items.filter((item) => item.status === status).length;
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const className =
    status === "Disetujui"
      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
      : status === "Menunggu"
        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
        : "bg-red-100 text-red-700 hover:bg-red-100";

  return <Badge className={`rounded-full px-3 py-1 ${className}`}>{status}</Badge>;
}

export default function LeaveRequestsPage() {
  const { token } = useAuthStore();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchLeaveRequests() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getLeaveRequests(token);
        setLeaveRequests(
          response.data.map((item) => ({
            id: item.id,
            studentName: item.student?.fullName ?? "-",
            className: item.class?.name ?? "-",
            type: item.type,
            date: item.date.slice(0, 10),
            status: item.status,
            description: item.description,
          })),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat surat izin dari backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLeaveRequests();
  }, [token]);

  const filteredRequests = useMemo(() => {
    const keyword = search.toLowerCase();

    return leaveRequests.filter((request) => {
      const matchesSearch =
        request.className.toLowerCase().includes(keyword) ||
        request.studentName.toLowerCase().includes(keyword) ||
        request.type.toLowerCase().includes(keyword) ||
        request.description.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "Semua" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, search, statusFilter]);

  const groupedClasses = groupByClass(filteredRequests);
  const classNames = Object.keys(groupedClasses);

  const selectedClassRequests = leaveRequests.filter(
    (request) => request.className === selectedClassName,
  );
  const selectedStudentRequests = leaveRequests
    .filter(
      (request) =>
        request.className === selectedClassName &&
        request.studentName === selectedStudentName,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const openClass = (className: string) => {
    setSelectedClassName(className);
    setClassDialogOpen(true);
  };

  const openStudent = (studentName: string) => {
    setSelectedStudentName(studentName);
    setClassDialogOpen(false);
    setStudentDialogOpen(true);
  };

  const openLeave = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setLeaveDialogOpen(true);
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div>
          <p className="text-sm text-slate-500">
            Dashboard / Administrasi / Surat Izin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Surat Izin Per Kelas
          </h1>
          <p className="mt-1 text-slate-500">
            Pilih kelas untuk melihat siswa yang punya surat izin, lalu buka
            semua riwayat izin siswa tersebut.
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari kelas, siswa, jenis izin..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Semua">Status</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
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

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border bg-white p-10 text-center text-slate-500">
            Memuat surat izin dari backend...
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {classNames.map((className) => {
            const classRequests = groupedClasses[className];
            const studentCount = Object.keys(groupByStudent(classRequests)).length;

            return (
              <button
                key={className}
                type="button"
                onClick={() => openClass(className)}
                className="rounded-3xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {className}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {studentCount} siswa mengajukan
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <FileText size={22} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <StatCard label="Surat Izin" value={classRequests.length} />
                  <StatCard
                    label="Menunggu"
                    value={countStatus(classRequests, "Menunggu")}
                  />
                  <StatCard
                    label="Disetujui"
                    value={countStatus(classRequests, "Disetujui")}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between rounded-2xl border px-4 py-3">
                  <span className="text-sm font-bold text-slate-700">
                    Lihat Surat
                  </span>
                  <Eye size={17} className="text-emerald-700" />
                </div>
              </button>
            );
            })}
          </div>
        )}

        <ClassLeaveDialog
          open={classDialogOpen}
          onOpenChange={setClassDialogOpen}
          classNameText={selectedClassName}
          requests={selectedClassRequests}
          onStudentClick={openStudent}
        />

        <StudentLeaveDialog
          open={studentDialogOpen}
          onOpenChange={setStudentDialogOpen}
          studentName={selectedStudentName}
          classNameText={selectedClassName}
          requests={selectedStudentRequests}
          onLeaveClick={openLeave}
        />

        <LeaveDetailDialog
          open={leaveDialogOpen}
          onOpenChange={setLeaveDialogOpen}
          request={selectedLeave}
        />
      </section>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function ClassLeaveDialog({
  open,
  onOpenChange,
  classNameText,
  requests,
  onStudentClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classNameText: string;
  requests: LeaveRequest[];
  onStudentClick: (studentName: string) => void;
}) {
  const groupedStudents = groupByStudent(requests);
  const studentNames = Object.keys(groupedStudents);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(980px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Surat Izin {classNameText}</DialogTitle>
          <DialogDescription>
            Daftar siswa yang memiliki pengajuan surat izin di kelas ini.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          {studentNames.map((studentName) => {
            const studentRequests = groupedStudents[studentName];

            return (
              <button
                key={studentName}
                type="button"
                onClick={() => onStudentClick(studentName)}
                className="rounded-2xl border bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-extrabold text-slate-900">
                      {studentName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {studentRequests.length} surat izin
                    </p>
                  </div>
                  <Eye size={17} className="shrink-0 text-emerald-700" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                    {countStatus(studentRequests, "Menunggu")} Menunggu
                  </Badge>
                  <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {countStatus(studentRequests, "Disetujui")} Disetujui
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentLeaveDialog({
  open,
  onOpenChange,
  studentName,
  classNameText,
  requests,
  onLeaveClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  classNameText: string;
  requests: LeaveRequest[];
  onLeaveClick: (request: LeaveRequest) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(980px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Surat Izin {studentName}</DialogTitle>
          <DialogDescription>
            Semua surat izin milik siswa di kelas {classNameText}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {requests.map((request, index) => (
            <button
              key={request.id}
              type="button"
              onClick={() => onLeaveClick(request)}
              className="w-full rounded-2xl border bg-white p-5 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-700">
                      {index + 1}
                    </span>
                    <h3 className="font-extrabold text-slate-900">
                      {request.type}
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-slate-900">
                        Tanggal:
                      </span>{" "}
                      {request.date}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">
                        Keterangan:
                      </span>{" "}
                      {request.description}
                    </p>
                  </div>
                </div>

                <StatusBadge status={request.status} />
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LeaveDetailDialog({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest | null;
}) {
  if (!request) return null;

  const details = [
    { label: "Nama Siswa", value: request.studentName },
    { label: "Kelas", value: request.className },
    { label: "Jenis Surat", value: request.type },
    { label: "Tanggal", value: request.date },
    { label: "Status", value: request.status },
    { label: "Keterangan", value: request.description },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(760px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Detail Surat Izin</DialogTitle>
          <DialogDescription>
            Informasi lengkap surat izin yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <CalendarDays size={22} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {request.type}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {request.studentName} • {request.date}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {details.map((item) => (
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
