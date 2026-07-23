export function StatusBar() {
  return (
    <footer className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(5,8,16,0.98),rgba(4,7,16,0.98))] px-6 py-3 text-xs text-slate-300 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-emerald-100">Signal status: synchronized</span>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-cyan-100">Mock data: active</span>
        <span className="rounded-full border border-violet-400/20 bg-violet-400/8 px-3 py-1 text-violet-100">Theme: Deep Space Intelligence</span>
      </div>
    </footer>
  );
}
