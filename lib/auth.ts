"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ADMIN_USERNAME = "SSP";
export const ADMIN_PASSWORD = "SSP";

type AuthState = {
  isAuthed: boolean;
  username: string | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      username: null,
      login: (u, p) => {
        if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
          set({ isAuthed: true, username: u });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthed: false, username: null }),
    }),
    { name: "chomp-auth" },
  ),
);
