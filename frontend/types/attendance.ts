export type AttendanceStatus =
  | "PRESENT"
  | "PERMISSION"
  | "SICK"
  | "ABSENT"
  | "LATE";

export type Attendance = {
  id: string;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string | null;
  studentName: string;
  className: string;
  subject: string;
  teacher: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
};
