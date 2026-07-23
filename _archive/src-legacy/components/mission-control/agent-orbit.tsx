import { agentRegistry } from "@/constants/agents-registry";

export function AgentOrbit() {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Agent Orbit</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Agent registry foundation</h3>
      <div className="mt-4 grid gap-3">
        {agentRegistry.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color} text-white`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-white">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
