import { create } from "zustand";

interface CaesarState {
  status: "idle" | "thinking" | "responding";
  setStatus: (value: CaesarState["status"]) => void;
}

export const useCeaserStore = create<CaesarState>((set) => ({
  status: "idle",
  setStatus: (value) => set({ status: value }),
}));
