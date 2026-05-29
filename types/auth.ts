export type UserRole =
  | "STUDENT"
  | "TEACHER"
  | "HOMEROOM"
  | "BK"
  | "ADMIN"
  | "HEADMASTER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};