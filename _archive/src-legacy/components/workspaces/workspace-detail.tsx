import { mockMemories } from "@/mock/memories";
import { mockProjects } from "@/mock/projects";
import { workspaceRegistry } from "@/constants/workspaces-registry";

export function WorkspaceDetail({ workspaceId }: { workspaceId: string }) {
  const workspace = workspaceRegistry.find((item) => item.id === workspaceId);

  if (!workspace) return null;

  return (
    <article className="glass-panel rounded-3xl p-6">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">Workspace overview</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{workspace.name}</h2>
      <p className="mt-3 text-sm text-slate-300">{workspace.description}</p>

      <div className="mt-6 grid gap-4">
        <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Active agents</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
            {['Bolt', 'Alex', 'Friday'].map((item) => (
              <span key={item} className="rounded-full border border-white/8 bg-white/5 px-3 py-1">{item}</span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Recent memories</p>
          <div className="mt-3 space-y-3 text-sm text-slate-100">
            {mockMemories.slice(0, 2).map((memory) => (
              <div key={memory.id} className="rounded-2xl border border-white/8 bg-white/5 p-3">{memory.title}</div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Active projects</p>
          <div className="mt-3 space-y-3 text-sm text-slate-100">
            {mockProjects.slice(0, 2).map((project) => (
              <div key={project.id} className="rounded-2xl border border-white/8 bg-white/5 p-3">{project.name}</div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/8 bg-slate-950/60 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">Workspace objectives</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-100">
            <li>Keep the operating signal synchronized across agents.</li>
            <li>Prioritize high-leverage projects and memory recall.</li>
            <li>Maintain a calm, focused operating rhythm.</li>
          </ul>
        </div>
      </div>
    </article>
  );
}
