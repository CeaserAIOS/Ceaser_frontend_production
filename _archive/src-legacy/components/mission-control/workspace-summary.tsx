import { mockWorkspaces } from "@/mock/workspaces";

export function WorkspaceSummary() {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Workspace Summary</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Mode scaffolding</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-200">
        {mockWorkspaces.map((workspace) => (
          <div key={workspace.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <strong>{workspace.name}</strong>
              <span className="text-[0.65rem] uppercase tracking-[0.25em] text-slate-400">{workspace.status}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{workspace.audience}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
