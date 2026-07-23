import { create } from "zustand";

interface VoiceState {
  isListening: boolean;
  setListening: (value: boolean) => void;
}

export const useVoiceStore = create<VoiceState>((set) => ({
  isListening: false,
  setListening: (value) => set({ isListening: value }),
}));
