"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  Filter,
  KeyRound,
  Lock,
  Pencil,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

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
import {
  changeUserStatus,
  getSettings,
  getUsers,
  resetUserPassword,
  SystemSetting,
  updateUser,
  UserAccountItem,
} from "@/services/setting-service";
import { useAuthStore } from "@/store/auth-store";

type AccountRole = "Admin" | "Guru" | "Wali Kelas" | "Siswa" | "BK" | "Kepala Madrasah";
type AccountStatus = "Aktif" | "Nonaktif" | "Belum Dibuat";
type BackendRole = UserAccountItem["role"];
type BackendStatus = UserAccountItem["status"];

type Account = {
  id: string;
  name: string;
  identity: string;
  email: string;
  username: string;
  className: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt: string;
  lastLogin: string;
};

type AccountForm = {
  name: string;
  email: string;
  username: string;
  role: BackendRole;
  status: BackendStatus;
};

const roleTabs: AccountRole[] = ["Admin", "Guru", "Wali Kelas", "Siswa", "BK", "Kepala Madrasah"];

const roleToBackend: Record<AccountRole, BackendRole> = {
  Admin: "ADMIN",
  Guru: "TEACHER",
  "Wali Kelas": "HOMEROOM_TEACHER",
  Siswa: "STUDENT",
  BK: "BK",
  "Kepala Madrasah": "HEADMASTER",
};

const backendToStatus: Record<BackendStatus, AccountStatus> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
};

const statusToBackend: Record<AccountStatus, BackendStatus | null> = {
  Aktif: "ACTIVE",
  Nonaktif: "INACTIVE",
  "Belum Dibuat": null,
};

function toAccountForm(account: Account): AccountForm {
  return {
    name: account.name,
    email: account.email,
    username: account.username,
    role: roleToBackend[account.role],
    status: statusToBackend[account.status] ?? "ACTIVE",
  };
}

const rolePermissions: Record<AccountRole, string[]> = {
  Admin: [
    "Mengelola semua data",
    "Mengelola kelas",
    "Mengelola akun siswa/guru/admin",
    "Mengatur role",
    "Melihat laporan",
    "Export laporan",
  ],
  Guru: [
    "Melihat jadwal mengajar",
    "Menginput absensi",
    "Menginput nilai",
    "Melihat siswa pada kelas yang diajar",
  ],
  "Wali Kelas": [
    "Melihat siswa kelasnya",
    "Melihat absensi kelasnya",
    "Melihat nilai kelasnya",
    "Melihat surat izin kelasnya",
    "Melihat laporan kelasnya",
  ],
  Siswa: [
    "Melihat jadwal sendiri",
    "Melihat nilai sendiri",
    "Melihat absensi sendiri",
    "Mengajukan surat izin",
    "Melihat pengumuman",
    "Mengubah profil/password",
  ],
  BK: [
    "Melihat data siswa",
    "Melihat surat izin",
    "Melihat catatan siswa",
    "Melihat laporan kesiswaan",
  ],
  "Kepala Madrasah": [
    "Melihat dashboard ringkasan",
    "Melihat semua laporan",
    "Melihat statistik akademik",
    "Tidak wajib mengedit data teknis",
  ],
};

const restrictedStudentAccess = [
  "Menghapus data",
  "Mengedit data akademik",
  "Melihat nilai siswa lain",
  "Melihat absensi siswa lain",
  "Mengelola guru",
  "Mengelola kelas",
  "Mengelola akun user lain",
];

function mapRole(role: UserAccountItem["role"]): AccountRole | null {
  if (role === "ADMIN") return "Admin";
  if (role === "TEACHER") return "Guru";
  if (role === "HOMEROOM_TEACHER") return "Wali Kelas";
  if (role === "STUDENT") return "Siswa";
  if (role === "BK") return "BK";
  if (role === "HEADMASTER") return "Kepala Madrasah";
  return null;
}

function mapUserToAccount(user: UserAccountItem): Account | null {
  const role = mapRole(user.role);
  if (!role) return null;

  return {
    id: user.id,
    name: user.name,
    identity: user.username,
    email: user.email,
    username: user.username,
    className: "-",
    role,
    status: backendToStatus[user.status],
    createdAt: user.createdAt.slice(0, 10),
    lastLogin: user.lastLogin ? user.lastLogin.slice(0, 16).replace("T", " ") : "-",
  };
}

export default function SettingsPage() {
  const { token } = useAuthStore();
  const [activeRole, setActiveRole] = useState<AccountRole>("Siswa");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [settings, setSettings] = useState<SystemSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState<AccountForm>({
    name: "",
    email: "",
    username: "",
    role: "STUDENT",
    status: "ACTIVE",
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const refreshSettingsPage = useCallback(
    async (showLoading = false) => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (showLoading) setLoading(true);
        setError("");
        const [settingsResponse, usersResponse] = await Promise.all([
          getSettings(token),
          getUsers(token),
        ]);
        setSettings(settingsResponse.data);
        setAccounts(
          usersResponse.data
            .map(mapUserToAccount)
            .filter((item): item is Account => Boolean(item)),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat pengaturan dari backend.",
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    const refreshId = window.setTimeout(() => {
      refreshSettingsPage(true);
    }, 0);

    return () => window.clearTimeout(refreshId);
  }, [refreshSettingsPage]);

  const filteredAccounts = useMemo(() => {
    const keyword = search.toLowerCase();

    return accounts.filter((account) => {
      const matchRole = account.role === activeRole;
      const matchSearch =
        account.name.toLowerCase().includes(keyword) ||
        account.identity.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword) ||
        account.username.toLowerCase().includes(keyword);
      const matchClass =
        classFilter === "Semua" || account.className === classFilter;
      const matchStatus =
        statusFilter === "Semua" || account.status === statusFilter;

      return matchRole && matchSearch && matchClass && matchStatus;
    });
  }, [accounts, activeRole, classFilter, search, statusFilter]);

  const studentSummary = useMemo(() => {
    const studentAccounts = accounts.filter((account) => account.role === "Siswa");
    const active = studentAccounts.filter((account) => account.status === "Aktif").length;
    const missing = studentAccounts.filter((account) => account.status === "Belum Dibuat").length;

    return {
      active,
      missing,
      total: studentAccounts.length,
    };
  }, [accounts]);

  const openEditAccount = (account: Account) => {
    setEditingAccount(account);
    setAccountForm(toAccountForm(account));
    setActionMessage("");
  };

  const handleResetPassword = async (account: Account) => {
    if (!token) return;
    const confirmed = confirm(`Reset password akun ${account.name} ke password123?`);
    if (!confirmed) return;

    try {
      setActionMessage("");
      await resetUserPassword(token, account.id);
      setActionMessage(`Password ${account.name} berhasil di-reset ke password123.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal reset password akun.");
    }
  };

  const handleToggleStatus = async (account: Account) => {
    if (!token) return;
    const nextStatus: BackendStatus = account.status === "Aktif" ? "INACTIVE" : "ACTIVE";

    try {
      setActionMessage("");
      const response = await changeUserStatus(token, account.id, nextStatus);
      const updatedAccount = mapUserToAccount(response.data);

      if (updatedAccount) {
        setAccounts((items) =>
          items.map((item) => (item.id === account.id ? updatedAccount : item)),
        );
        setSelectedAccount(updatedAccount);
      }

      setActionMessage(
        `Status akun ${account.name} berhasil diubah menjadi ${backendToStatus[nextStatus]}.`,
      );
      await refreshSettingsPage();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal mengubah status akun.");
    }
  };

  const handleSubmitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !editingAccount) return;

    try {
      setSubmitting(true);
      setError("");
      setActionMessage("");
      const response = await updateUser(token, editingAccount.id, accountForm);
      const updatedAccount = mapUserToAccount(response.data);

      if (updatedAccount) {
        setAccounts((items) =>
          items.map((item) =>
            item.id === editingAccount.id ? updatedAccount : item,
          ),
        );
        setSelectedAccount(updatedAccount);
        setActiveRole(updatedAccount.role);
      }

      setEditingAccount(null);
      setActionMessage(`Akun ${accountForm.name} berhasil diperbarui.`);
      await refreshSettingsPage();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memperbarui akun.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Dashboard / Pengaturan / Manajemen Akun
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Manajemen Akun & Role
            </h1>
            <p className="mt-1 max-w-3xl text-slate-500">
              Atur akun login, role, status akses, dan batasan fitur untuk
              admin, guru, wali kelas, dan siswa.
            </p>
          </div>

          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => refreshSettingsPage(true)}
          >
            <UserCheck size={16} className="mr-2" />
            Sinkronkan Akun
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<Users size={18} />}
            label="Akun Siswa"
            value={`${studentSummary.active}/${studentSummary.total}`}
            description="Siswa aktif sudah punya akun login."
          />
          <SummaryCard
            icon={<Lock size={18} />}
            label="Belum Punya Akun"
            value={`${studentSummary.missing}`}
            description="Perlu dibuatkan username dan password awal."
          />
          <SummaryCard
            icon={<ShieldCheck size={18} />}
            label="Role Siswa"
            value={`${rolePermissions.Siswa.length} akses`}
            description="Hak akses siswa dibatasi untuk data milik sendiri."
          />
        </div>

        {settings && (
          <Card className="border-0 shadow-sm">
            <CardContent className="grid gap-4 p-5 md:grid-cols-3">
              <SummaryCard
                icon={<ShieldCheck size={18} />}
                label="Madrasah"
                value={settings.schoolName}
                description="Nama lembaga dari backend."
              />
              <SummaryCard
                icon={<Users size={18} />}
                label="Tahun Ajaran"
                value={settings.academicYear}
                description="Tahun ajaran aktif sistem."
              />
              <SummaryCard
                icon={<Lock size={18} />}
                label="Semester"
                value={settings.semester}
                description="Semester aktif sistem."
              />
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {actionMessage}
          </div>
        )}

        <Card className="border-0 shadow-sm">
          <CardContent className="space-y-4 p-4 md:p-5">
            <div className="flex flex-wrap gap-2">
              {roleTabs.map((role) => (
                <button
                  key={role}
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    activeRole === role
                      ? "bg-slate-950 text-white"
                      : "border bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => {
                    setActiveRole(role);
                    setClassFilter("Semua");
                  }}
                >
                  Akun {role}
                </button>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_120px]">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  className="h-11 rounded-2xl bg-slate-50 pl-9"
                  placeholder="Cari nama, NIS/NIP, email, atau username..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                disabled={activeRole !== "Siswa"}
              >
                <option value="Semua">Semua Kelas</option>
              </select>

              <select
                className="h-11 rounded-2xl border bg-slate-50 px-4 text-sm text-slate-700"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
                <option value="Belum Dibuat">Belum Dibuat</option>
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
            <div className="border-b p-5">
              <h2 className="text-lg font-extrabold text-slate-900">
                Manajemen Akun {activeRole}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Kelola detail akun, reset password, status aktif, role, dan
                akses fitur.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Nama
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Kelas
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Username
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Role
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-600">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Memuat akun dari backend...
                      </td>
                    </tr>
                  ) : filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-t">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {account.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {account.identity}
                        </p>
                      </td>
                      <td className="px-5 py-4">{account.className}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {account.email}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {account.username}
                      </td>
                      <td className="px-5 py-4">
                        <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50">
                          {account.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={account.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => setSelectedAccount(account)}
                          >
                            <Eye size={14} className="mr-1" />
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleResetPassword(account)}
                          >
                            <KeyRound size={14} className="mr-1" />
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <AccessPanel
            title={`Hak Akses Role ${activeRole}`}
            items={rolePermissions[activeRole]}
            tone="allowed"
          />
          <AccessPanel
            title={
              activeRole === "Siswa"
                ? "Akses yang Tidak Diizinkan"
                : "Batasan Akses Role"
            }
            items={
              activeRole === "Siswa"
                ? restrictedStudentAccess
                : [
                    "Tetap mengikuti batas data sesuai role",
                    "Tidak boleh memakai akun role lain",
                    "Perubahan role hanya dilakukan admin",
                    "Aktivitas akun tetap tercatat di sistem",
                  ]
            }
            tone="blocked"
          />
        </div>

        <AccountDetailDialog
          account={selectedAccount}
          permissions={
            selectedAccount ? rolePermissions[selectedAccount.role] : []
          }
          open={Boolean(selectedAccount)}
          onOpenChange={(open) => {
            if (!open) setSelectedAccount(null);
          }}
          onResetPassword={handleResetPassword}
          onToggleStatus={handleToggleStatus}
          onEdit={openEditAccount}
        />

        <AccountEditDialog
          open={Boolean(editingAccount)}
          onOpenChange={(open) => {
            if (!open) setEditingAccount(null);
          }}
          form={accountForm}
          setForm={setAccountForm}
          submitting={submitting}
          onSubmit={handleSubmitAccount}
        />
      </section>
    </DashboardLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="flex gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const className =
    status === "Aktif"
      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
      : status === "Belum Dibuat"
        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
        : "bg-slate-100 text-slate-600 hover:bg-slate-100";

  return <Badge className={`rounded-full ${className}`}>{status}</Badge>;
}

function AccessPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "allowed" | "blocked";
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-extrabold text-slate-900">{title}</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              className={`rounded-2xl border p-3 text-sm font-semibold ${
                tone === "allowed"
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AccountDetailDialog({
  account,
  permissions,
  open,
  onOpenChange,
  onResetPassword,
  onToggleStatus,
  onEdit,
}: {
  account: Account | null;
  permissions: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
  onEdit: (account: Account) => void;
}) {
  if (!account) return null;

  const detailItems = [
    ["Nama", account.name],
    [account.role === "Siswa" ? "NIS" : "ID", account.identity],
    ["Kelas", account.className],
    ["Email", account.email],
    ["Username", account.username],
    ["Role", account.role],
    ["Status", account.status],
    ["Tanggal Dibuat", account.createdAt],
    ["Terakhir Login", account.lastLogin],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(1040px,calc(100vw-32px))] !max-w-none max-h-[88vh] overflow-y-auto rounded-3xl p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Detail Akun {account.role}</DialogTitle>
          <DialogDescription>
            Data login, role, status akun, dan aksi pengelolaan akses.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-300">Akun</p>
              <h2 className="mt-2 text-3xl font-extrabold">{account.name}</h2>
              <p className="mt-2 text-slate-300">
                {account.className} • {account.email}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="rounded-full bg-white text-slate-950 hover:bg-white">
                  {account.role}
                </Badge>
                <StatusBadge status={account.status} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {detailItems.map(([label, value]) => (
                <div key={label} className="rounded-2xl border bg-white p-4">
                  <p className="text-xs font-semibold text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="h-12 w-full justify-start rounded-2xl bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onResetPassword(account)}
            >
              <KeyRound size={16} className="mr-2" />
              Reset Password
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full justify-start rounded-2xl"
              onClick={() => onToggleStatus(account)}
            >
              <Lock size={16} className="mr-2" />
              {account.status === "Aktif" ? "Nonaktifkan Akun" : "Aktifkan Akun"}
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full justify-start rounded-2xl"
              onClick={() => onEdit(account)}
            >
              <Pencil size={16} className="mr-2" />
              Ubah Data Akun
            </Button>

            {account.role === "Siswa" && (
              <div className="rounded-3xl border bg-slate-50 p-4">
                <p className="font-extrabold text-slate-900">
                  Dampak Pindah Kelas
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Jadwal, mata pelajaran, absensi berikutnya, dan nilai
                  berikutnya mengikuti kelas baru yang dipilih admin.
                </p>
              </div>
            )}

            <div className="rounded-3xl border bg-emerald-50 p-4">
              <p className="font-extrabold text-slate-900">
                Hak Akses Aktif
              </p>
              <div className="mt-3 space-y-2">
                {permissions.map((permission) => (
                  <div
                    key={permission}
                    className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-emerald-800"
                  >
                    {permission}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccountEditDialog({
  open,
  onOpenChange,
  form,
  setForm,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: AccountForm;
  setForm: (form: AccountForm) => void;
  submitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[min(820px,calc(100vw-32px))] !max-w-none max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Edit Akun</DialogTitle>
          <DialogDescription>
            Perbarui nama, email, username, role, dan status akun.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Nama
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Email
              <Input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Username
              <Input
                value={form.username}
                onChange={(event) =>
                  setForm({ ...form, username: event.target.value })
                }
                required
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-700">
              Role
              <select
                className="h-11 w-full rounded-2xl border bg-white px-4 text-sm text-slate-700"
                value={form.role}
                onChange={(event) =>
                  setForm({ ...form, role: event.target.value as BackendRole })
                }
              >
                {roleTabs.map((role) => (
                  <option key={role} value={roleToBackend[role]}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Status
            <select
              className="h-11 w-full rounded-2xl border bg-white px-4 text-sm text-slate-700"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value as BackendStatus })
              }
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </label>

          <div className="flex justify-end gap-2">
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
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
