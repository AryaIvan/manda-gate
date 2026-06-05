export type ScheduleDay =
  | "Senin"
  | "Selasa"
  | "Rabu"
  | "Kamis"
  | "Jumat"
  | "Sabtu";

export type ScheduleSemester = "Ganjil" | "Genap";

export type Schedule = {
  id: string;
  day: ScheduleDay;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  className: string;
  room: string;
  semester: ScheduleSemester;
  academicYear: string;
  isActive: boolean;
};