import { agentRegistry } from "@/constants/agents-registry";
import { mockAgents } from "@/mock/agents";

export function AgentCard({ agentId }: { agentId: string }) {
  const agent = agentRegistry.find((item) => item.id === agentId);
  const status = mockAgents.find((item) => item.id === agentId);

  if (!agent || !status) return null;

  const Icon = agent.icon;

  return (
    <article className="glass-panel rounded-3xl p-5 transition hover:-translate-y-1 hover:border-cyan-400/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.color} shadow-lg shadow-cyan-500/10`}>
            <Icon className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">{agent.id}</p>
            <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
          </div>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-emerald-200">{status.status}</span>
      </div>

      <p className="mt-4 text-sm text-slate-300">{agent.description}</p>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-4">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Enabled modules</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {agent.modules.map((module) => (
            <span key={module} className="rounded-full border border-white/8 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">{module}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-cyan-100">Activity indicator</span>
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
      </div>
    </article>
  );
}
