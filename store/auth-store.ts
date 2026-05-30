import { create } from "zustand";
import { User } from "@/types/auth";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loadUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem("manda_user", JSON.stringify(user));
    localStorage.setItem("manda_token", token);

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("manda_user");
    localStorage.removeItem("manda_token");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadUser: () => {
    const savedUser = localStorage.getItem("manda_user");
    const savedToken = localStorage.getItem("manda_token");

    if (savedUser && savedToken) {
      set({
        user: JSON.parse(savedUser),
        token: savedToken,
        isAuthenticated: true,
      });
    }
  },
}));