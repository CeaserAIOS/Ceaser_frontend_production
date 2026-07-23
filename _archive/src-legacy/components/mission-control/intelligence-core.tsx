import { mockProjects } from "@/mock/projects";

export function IntelligenceCore() {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Intelligence Core</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Context synthesis layer</h3>
      <p className="mt-2 text-sm text-slate-300">This foundation block will eventually route the right agent and memory context into the main experience.</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-200">
        {mockProjects.map((project) => (
          <li key={project.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <span>{project.name}</span>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-400">{project.status}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" style={{ width: `${project.progress}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
