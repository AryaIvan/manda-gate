export type Grade = {
  id: string;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string | null;
  studentName: string;
  className: string;
  subject: string;
  teacher: string;
  assignmentScore: number;
  dailyScore: number;
  midtermScore: number;
  finalExamScore: number;
  finalScore: number;
  predicate: "A" | "B" | "C" | "D" | "E";
  note?: string;
};
