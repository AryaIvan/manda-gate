import { ManagementPage } from "@/components/shared/management-page";

const rows = [
  {
    Judul: "Simulasi Ujian Semester",
    Kategori: "Akademik",
    Tanggal: "30 Mei 2026",
    Status: "Aktif",
  },
  {
    Judul: "Kegiatan Literasi Madrasah",
    Kategori: "Kesiswaan",
    Tanggal: "31 Mei 2026",
    Status: "Aktif",
  },
  {
    Judul: "Libur Nasional Idul Adha",
    Kategori: "Umum",
    Tanggal: "6 Juni 2026",
    Status: "Aktif",
  },
  {
    Judul: "Pengumpulan Berkas PPDB",
    Kategori: "Administrasi",
    Tanggal: "10 Juni 2026",
    Status: "Draft",
  },
  {
    Judul: "Pelatihan OSIM",
    Kategori: "Kesiswaan",
    Tanggal: "12 Juni 2026",
    Status: "Aktif",
  },
];

export default function AnnouncementsPage() {
  return (
    <ManagementPage
      title="Pengumuman"
      description="Kelola pengumuman akademik, kesiswaan, administrasi, dan informasi umum."
      actionLabel="Buat Pengumuman"
      searchPlaceholder="Cari judul pengumuman..."
      filters={[
        { label: "Kategori", options: ["Akademik", "Kesiswaan", "Umum"] },
        { label: "Tanggal" },
        { label: "Status", options: ["Aktif", "Draft"] },
      ]}
      tableTitle="Daftar Pengumuman"
      tableDescription="Publikasi informasi resmi madrasah"
      columns={["Judul", "Kategori", "Tanggal", "Status"]}
      rows={rows}
    />
  );
}
