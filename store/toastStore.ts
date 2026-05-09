"use client";

import { create } from "zustand";

type Toast = {
  id: string;
  title?: string;
  message: string;
  type?: "info" | "success" | "error";
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    const toast = { id, ...t } as Toast;
    set((s) => ({ toasts: [...s.toasts, toast] }));
    window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000);
    return id;
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));
