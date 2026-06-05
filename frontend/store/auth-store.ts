import { create } from "zustand";

type UserRole =
  | "ADMIN"
  | "TEACHER"
  | "HOMEROOM_TEACHER"
  | "STUDENT"
  | "BK"
  | "HEADMASTER";
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

function persistAuth(user: AuthUser, token: string) {
  localStorage.setItem("manda_token", token);
  localStorage.setItem("manda_user", JSON.stringify(user));
}

function clearPersistedAuth() {
  localStorage.removeItem("manda_token");
  localStorage.removeItem("manda_user");
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    persistAuth(user, token);

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  login: (user, token) => {
    persistAuth(user, token);

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearPersistedAuth();

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
      try {
        set({
          token,
          user: JSON.parse(user) as AuthUser,
          isAuthenticated: true,
        });
      } catch {
        clearPersistedAuth();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    }
  },
}));
