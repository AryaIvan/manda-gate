import { ManagementPage } from "@/components/shared/management-page";

const rows = [
  {
    "Nama Laporan": "Laporan Absensi Bulanan",
    Periode: "Mei 2026",
    Pembuat: "Admin",
    Format: "PDF",
    Status: "Siap",
  },
  {
    "Nama Laporan": "Rekap Nilai Semester",
    Periode: "Ganjil 2026/2027",
    Pembuat: "Waka Kurikulum",
    Format: "Excel",
    Status: "Siap",
  },
  {
    "Nama Laporan": "Laporan Prestasi Siswa",
    Periode: "Semester Ganjil",
    Pembuat: "Kesiswaan",
    Format: "PDF",
    Status: "Siap",
  },
  {
    "Nama Laporan": "Laporan Pengumuman",
    Periode: "Mei 2026",
    Pembuat: "TU",
    Format: "PDF",
    Status: "Draft",
  },
];

export default function ReportsPage() {
  return (
    <ManagementPage
      title="Laporan"
      description="Kelola dan unduh laporan akademik, absensi, nilai, prestasi, dan pengumuman."
      actionLabel="Generate Laporan"
      searchPlaceholder="Cari nama laporan..."
      filters={[
        { label: "Periode", options: ["Mei 2026", "Ganjil 2026/2027"] },
        { label: "Pembuat", options: ["Admin", "Waka Kurikulum", "TU"] },
        { label: "Status", options: ["Siap", "Draft"] },
      ]}
      tableTitle="Daftar Laporan"
      tableDescription="Arsip laporan sistem"
      columns={["Nama Laporan", "Periode", "Pembuat", "Format", "Status"]}
      rows={rows}
    />
  );
}
