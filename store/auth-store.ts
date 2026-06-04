import { create } from "zustand";

type UserRole = "ADMIN" | "TEACHER" | "HOMEROOM_TEACHER" | "STUDENT";
type AccountStatus = "ACTIVE" | "INACTIVE";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: AccountStatus;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  loadAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    localStorage.setItem("manda_token", token);
    localStorage.setItem("manda_user", JSON.stringify(user));

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  login: (user, token) => {
    localStorage.setItem("manda_token", token);
    localStorage.setItem("manda_user", JSON.stringify(user));

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("manda_token");
    localStorage.removeItem("manda_user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadAuth: () => {
    const token = localStorage.getItem("manda_token");
    const user = localStorage.getItem("manda_user");

    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    }
  },
}));