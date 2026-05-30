export type Teacher = {
  id: string;
  nip: string;
  fullName: string;
  gender: "Laki-laki" | "Perempuan";
  email: string;
  phone?: string;
  address?: string;
  subject: string;
  position: string;
  status: "Aktif" | "Tidak Aktif";
  photo?: string;
};