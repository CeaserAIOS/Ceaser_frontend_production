import { agentRegistry } from "@/constants/agents-registry";

export function AgentDetail({ agentId }: { agentId: string }) {
  const agent = agentRegistry.find((item) => item.id === agentId);

  if (!agent) return null;

  const Icon = agent.icon;

  return (
    <article className="glass-panel rounded-3xl p-6">
      <div className="flex items-center gap-4">
        <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.color} shadow-lg shadow-cyan-500/10`}>
          <Icon className="h-6 w-6 text-white" />
        </span>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">Focused configuration</p>
          <h2 className="text-2xl font-semibold text-white">{agent.name}</h2>
          <p className="text-sm text-slate-300">{agent.description}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/8 bg-slate-950/60 p-5">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Selectable modules</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {agent.modules.map((module) => (
            <button
              key={module}
              type="button"
              className="rounded-2xl border border-white/8 bg-white/5 p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            >
              <p className="text-sm font-medium text-white">{module}</p>
              <p className="mt-1 text-xs text-slate-300">Department-ready orchestration card</p>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}
