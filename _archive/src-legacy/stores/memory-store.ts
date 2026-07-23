import { create } from "zustand";

interface MemoryState {
  activeMemoryView: "conversations" | "projects" | "goals";
  setActiveMemoryView: (value: MemoryState["activeMemoryView"]) => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  activeMemoryView: "conversations",
  setActiveMemoryView: (value) => set({ activeMemoryView: value }),
}));
