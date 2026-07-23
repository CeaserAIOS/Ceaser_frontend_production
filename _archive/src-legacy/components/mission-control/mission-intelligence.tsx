import { mockProjects } from "@/mock/projects";

export function MissionIntelligence() {
  return (
    <article className="glass-panel relative overflow-hidden rounded-3xl p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_20%),radial-gradient(circle_at_bottom,_rgba(139,92,246,0.18),_transparent_25%)]" />
      <div className="relative z-10">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Intelligence Core</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">CEASER operating in real time</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">Mission Control visualizes the orchestration layer, active projects, and high-value context without relying on backend logic.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/8 p-4 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">Active Projects</p>
            <div className="mt-3 space-y-2 text-sm text-slate-100">
              {mockProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-slate-950/60 p-3">
                  <span>{project.name}</span>
                  <span className="text-[0.65rem] uppercase tracking-[0.25em] text-cyan-200">{project.progress}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-violet-400/20 bg-violet-400/8 p-4 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-violet-200/90">Active Goals</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-100">
              <li className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">Prioritize launch-critical decisions.</li>
              <li className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">Sharpen content and signal quality.</li>
              <li className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">Maintain cross-agent memory continuity.</li>
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
