export type SchoolClass = {
  id: string;
  name: string;
  grade: "X" | "XI" | "XII";
  major: "IPA" | "IPS" | "Agama";
  homeroomTeacher: string;
  academicYear: string;
  totalStudents: number;
};