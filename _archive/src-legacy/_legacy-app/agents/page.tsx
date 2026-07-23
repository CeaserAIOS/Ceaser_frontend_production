import { AppShell } from "@/components/layout/app-shell";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentDetail } from "@/components/agents/agent-detail";
import { agentRegistry } from "@/constants/agents-registry";

export default function AgentsPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <article className="glass-panel rounded-3xl p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Agent Center</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Configure the six CEASER agents</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-200">A premium operations interface for managing executive, creative, learning, and infrastructure agents without backend logic.</p>
        </article>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-2">
            {agentRegistry.map((agent) => (
              <AgentCard key={agent.id} agentId={agent.id} />
            ))}
          </div>

          <AgentDetail agentId="zeus" />
        </div>
      </section>
    </AppShell>
  );
}
