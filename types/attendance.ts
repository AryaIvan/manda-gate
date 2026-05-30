export type AttendanceStatus =
  | "PRESENT"
  | "PERMISSION"
  | "SICK"
  | "ABSENT"
  | "LATE";

export type Attendance = {
  id: string;
  studentName: string;
  className: string;
  subject: string;
  teacher: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
};