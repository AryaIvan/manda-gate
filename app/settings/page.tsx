import { ManagementPage } from "@/components/shared/management-page";

const rows = [
  {
    Modul: "Profil Madrasah",
    Deskripsi: "Nama, logo, alamat, kontak resmi",
    Status: "Aktif",
  },
  {
    Modul: "Tahun Ajaran",
    Deskripsi: "2026/2027 Semester Ganjil",
    Status: "Aktif",
  },
  {
    Modul: "Manajemen Role",
    Deskripsi: "Admin, Guru, Siswa, Wali Kelas, BK",
    Status: "Aktif",
  },
  {
    Modul: "Integrasi Notifikasi",
    Deskripsi: "Email dan WhatsApp Broadcast",
    Status: "Aktif",
  },
  {
    Modul: "Keamanan Sistem",
    Deskripsi: "Reset password dan session timeout",
    Status: "Aktif",
  },
  {
    Modul: "Backup Data",
    Deskripsi: "Backup mingguan otomatis",
    Status: "Aktif",
  },
];

export default function SettingsPage() {
  return (
    <ManagementPage
      title="Pengaturan"
      description="Kelola konfigurasi sistem, role, identitas madrasah, keamanan, dan backup."
      actionLabel="Simpan Pengaturan"
      searchPlaceholder="Cari pengaturan..."
      filters={[
        { label: "Kategori", options: ["Sistem", "Keamanan", "Data"] },
        { label: "Status", options: ["Aktif", "Nonaktif"] },
        { label: "Aksi" },
      ]}
      tableTitle="Pengaturan Sistem"
      tableDescription="Konfigurasi utama MANDA Gate"
      columns={["Modul", "Deskripsi", "Status"]}
      rows={rows}
    />
  );
}
