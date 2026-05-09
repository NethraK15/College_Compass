"use client";

import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
  bio?: string | null;
  university?: string | null;
  academicYear?: string | null;
  major?: string | null;
  location?: string | null;
  profileImage?: string | null;
  awards?: any[] | null;
};

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
  hydrate: () => {
    if (typeof window === "undefined") {
      return;
    }
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) {
      set({ token: null, user: null });
      return;
    }

    try {
      const parsedUser = JSON.parse(userRaw) as Partial<User>;
      const user = parsedUser.id && parsedUser.email && parsedUser.name ? (parsedUser as User) : null;

      if (!user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
        return;
      }

      set({ token, user });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null });
    }
  }
}));
