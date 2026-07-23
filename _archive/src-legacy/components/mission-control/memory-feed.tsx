import { mockMemories } from "@/mock/memories";

export function MemoryFeed() {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.35)]">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Memory Feed</p>
      <h3 className="mt-2 text-xl font-semibold text-white">Context memory snapshots</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-200">
        {mockMemories.map((memory) => (
          <div key={memory.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <p className="font-medium text-white">{memory.title}</p>
            <p className="mt-1 text-xs text-slate-400">{memory.summary}</p>
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.25em] text-violet-300">{memory.scope}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
