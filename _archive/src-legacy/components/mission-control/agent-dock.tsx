import { agentRegistry } from "@/constants/agents-registry";

export function AgentDock() {
  return (
    <article className="glass-panel rounded-3xl p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Agent Dock</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Operational network</h3>
      <div className="mt-5 space-y-3">
        {agentRegistry.map((agent) => {
          const Icon = agent.icon;
          return (
            <button
              key={agent.id}
              type="button"
              className="w-full rounded-2xl border border-white/8 bg-white/5 p-3 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/8"
            >
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.color} shadow-lg shadow-cyan-500/10`}>
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <p className="text-xs text-slate-300">{agent.description}</p>
                </div>
              </div>
              <p className="mt-3 text-[0.68rem] uppercase tracking-[0.25em] text-cyan-200/90">Modules: {agent.modules.join(" • ")}</p>
            </button>
          );
        })}
      </div>
    </article>
  );
}
