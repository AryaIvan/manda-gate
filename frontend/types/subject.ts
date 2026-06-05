export type Subject = {
  id: string;
  code: string;
  name: string;
  group: string;
  grade: "X" | "XI" | "XII" | "Semua";
  major: "IPA" | "IPS" | "Agama" | "Semua";
  isActive: boolean;
};