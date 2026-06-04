export type UserRole =
  | "STUDENT"
  | "TEACHER"
  | "HOMEROOM_TEACHER"
  | "BK"
  | "ADMIN"
  | "HEADMASTER";

export type AccountStatus = "ACTIVE" | "INACTIVE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: AccountStatus;
};

export type User = AuthUser;