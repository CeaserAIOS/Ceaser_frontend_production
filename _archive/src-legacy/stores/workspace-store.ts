import { create } from "zustand";

interface WorkspaceState {
  activeWorkspace: string;
  setActiveWorkspace: (value: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: "personal",
  setActiveWorkspace: (value) => set({ activeWorkspace: value }),
}));
