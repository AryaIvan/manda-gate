import { User } from "@/types/auth";

export const mockUsers: Array<User & { password: string }> = [
  {
    id: "1",
    name: "Admin MANDA",
    email: "admin@manda.sch.id",
    password: "password123",
    role: "ADMIN",
  },
  {
    id: "2",
    name: "Siswa Demo",
    email: "siswa@manda.sch.id",
    password: "password123",
    role: "STUDENT",
  },
  {
    id: "3",
    name: "Guru Demo",
    email: "guru@manda.sch.id",
    password: "password123",
    role: "TEACHER",
  },
  {
    id: "4",
    name: "Wali Kelas Demo",
    email: "wali@manda.sch.id",
    password: "password123",
    role: "HOMEROOM",
  },
  {
    id: "5",
    name: "BK Demo",
    email: "bk@manda.sch.id",
    password: "password123",
    role: "BK",
  },
  {
    id: "6",
    name: "Kepala Madrasah",
    email: "kepala@manda.sch.id",
    password: "password123",
    role: "HEADMASTER",
  },
];