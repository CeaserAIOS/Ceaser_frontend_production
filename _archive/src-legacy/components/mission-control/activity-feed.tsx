import { mockActivities } from "@/mock/activities";

export function ActivityFeed() {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Activity Feed</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Recent system activity</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-200">
        {mockActivities.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <strong>{item.label}</strong>
              <span className="text-xs text-slate-400">{item.time}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">by {item.actor}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
