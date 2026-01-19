import { create } from "zustand";

interface ProfileState {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  uploading: boolean;
  setUploading: (value: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isEditing: false,
  setIsEditing: (value) => set({ isEditing: value }),
  uploading: false,
  setUploading: (value) => set({ uploading: value }),
}));
