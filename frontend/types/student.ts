export type Student = {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  gender: "Laki-laki" | "Perempuan";
  birthPlace?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  email?: string;
  className: string;
  major: string;
  admissionYear: number;
  status: "Aktif" | "Tidak Aktif" | "Lulus";
  photo?: string;
};