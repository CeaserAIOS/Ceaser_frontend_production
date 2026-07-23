import { mockActivities } from "@/mock/activities";

export function LiveActivityStream() {
  return (
    <article className="glass-panel rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Live Activity Stream</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Real-time command feed</h3>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-emerald-200">Live</span>
      </div>
      <div className="mt-5 space-y-3">
        {mockActivities.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
              <div className="flex-1">
                <p className="text-sm text-white">{item.label}</p>
                <p className="mt-1 text-xs text-slate-300">{item.actor} • {item.time}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-2 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-slate-300">#{index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
