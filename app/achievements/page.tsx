import { ManagementPage } from "@/components/shared/management-page";

const rows = [
  {
    Kode: "PR001",
    Nama: "Ahmad Maulana",
    Kelas: "X IPA 1",
    Prestasi: "Juara 1 Olimpiade Matematika",
    Tingkat: "Kabupaten",
    Tanggal: "15 Mei 2026",
  },
  {
    Kode: "PR002",
    Nama: "Maryam Azzahra",
    Kelas: "XI Agama",
    Prestasi: "Juara 2 MTQ Pelajar",
    Tingkat: "Provinsi",
    Tanggal: "18 Mei 2026",
  },
  {
    Kode: "PR003",
    Nama: "Dinda Larasati",
    Kelas: "XII IPS 1",
    Prestasi: "Best Speaker English Debate",
    Tingkat: "Kabupaten",
    Tanggal: "21 Mei 2026",
  },
  {
    Kode: "PR004",
    Nama: "Aisyah Putri",
    Kelas: "XII Agama",
    Prestasi: "Juara 1 Lomba Karya Tulis",
    Tingkat: "Kabupaten",
    Tanggal: "27 Mei 2026",
  },
];

export default function AchievementsPage() {
  return (
    <ManagementPage
      title="Prestasi"
      description="Kelola data prestasi siswa di tingkat kabupaten, provinsi, dan nasional."
      actionLabel="Tambah Prestasi"
      searchPlaceholder="Cari nama siswa / prestasi..."
      filters={[
        { label: "Kelas", options: ["X IPA 1", "XI Agama", "XII IPS 1"] },
        { label: "Tingkat", options: ["Kabupaten", "Provinsi"] },
        { label: "Tanggal" },
      ]}
      tableTitle="Daftar Prestasi"
      tableDescription="Rekap prestasi siswa MANDA Gate"
      columns={["Kode", "Nama", "Kelas", "Prestasi", "Tingkat", "Tanggal"]}
      rows={rows}
    />
  );
}
