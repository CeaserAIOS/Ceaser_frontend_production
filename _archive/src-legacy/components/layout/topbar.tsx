export function Topbar() {
  return (
    <header className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(8,12,22,0.95),rgba(4,7,16,0.95))] px-6 py-4 text-sm text-slate-200 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">Mission Control</p>
          <h2 className="text-base font-semibold text-white">Deep Space Intelligence Interface</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-3 py-2 text-xs text-cyan-100">Workspace: Startup</button>
          <button className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-100">Search</button>
          <button className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">Voice</button>
          <button className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-slate-100">Alerts</button>
          <button className="rounded-full border border-violet-400/25 bg-violet-400/8 px-3 py-2 text-xs text-violet-100">Profile</button>
        </div>
      </div>
    </header>
  );
}
