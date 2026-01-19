// src/store/alertStore.ts
import { create } from "zustand";
import { AlertState } from "../interfaces/AlertState";

export const useAlertStore = create<AlertState>((set) => ({
  open: false,
  message: "",
  type: "info",
  showAlert: (type, message) => set({ open: true, type, message }),
  closeAlert: () => set({ open: false }),
}));
