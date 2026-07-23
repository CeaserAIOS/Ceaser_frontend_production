import { workspaceRegistry } from "@/constants/workspaces-registry";
import { mockWorkspaces } from "@/mock/workspaces";

export function WorkspaceCard({ workspaceId }: { workspaceId: string }) {
  const workspace = workspaceRegistry.find((item) => item.id === workspaceId);
  const detail = mockWorkspaces.find((item) => item.id === workspaceId);

  if (!workspace || !detail) return null;

  return (
    <article className="glass-panel rounded-3xl p-5 transition hover:-translate-y-1 hover:border-cyan-400/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">{workspace.id}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{workspace.name}</h3>
          <p className="mt-2 text-sm text-slate-300">{workspace.description}</p>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-emerald-200">{detail.status}</span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-100">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">Focus: {workspace.focus}</div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">Audience: {detail.audience}</div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/60 p-4 text-xs text-slate-200">
        <p className="uppercase tracking-[0.35em] text-slate-400">Workspace health</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span>Signal integrity</span>
          <span className="text-cyan-200">High</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-800">
          <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400" style={{ width: "82%" }} />
        </div>
      </div>
    </article>
  );
}
