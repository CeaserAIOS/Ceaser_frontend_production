import { mockMemories } from "@/mock/memories";

export function ImportantContext() {
  return (
    <article className="glass-panel rounded-3xl p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Important Context</p>
      <h3 className="mt-2 text-xl font-semibold text-white">High-signal directives</h3>
      <div className="mt-5 space-y-3 text-sm text-slate-100">
        {mockMemories.map((memory) => (
          <div key={memory.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="font-medium text-white">{memory.title}</p>
            <p className="mt-1 text-xs text-slate-300">{memory.summary}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
