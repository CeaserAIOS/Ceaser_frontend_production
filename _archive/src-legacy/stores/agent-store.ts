import { create } from "zustand";

interface AgentState {
  enabledAgents: string[];
  toggleAgent: (agentId: string) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  enabledAgents: ["zeus", "alex", "friday"],
  toggleAgent: (agentId) =>
    set((state) => ({
      enabledAgents: state.enabledAgents.includes(agentId)
        ? state.enabledAgents.filter((id) => id !== agentId)
        : [...state.enabledAgents, agentId],
    })),
}));
