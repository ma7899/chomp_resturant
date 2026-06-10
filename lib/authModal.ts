"use client";

import { create } from "zustand";

/** Controls the global auth modal. */
type AuthModalState = {
  isOpen: boolean;
  /** Where to send the user after a successful auth. */
  redirectTo?: string;
  open: (redirectTo?: string) => void;
  close: () => void;
};

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  redirectTo: undefined,
  open: (redirectTo) => set({ isOpen: true, redirectTo }),
  close: () => set({ isOpen: false }),
}));
