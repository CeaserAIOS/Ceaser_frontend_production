import Link from "next/link";
import { NAV_ITEMS } from "@/constants/routes";

export function Sidebar() {
  return (
    <aside className="border-r border-white/8 bg-[linear-gradient(180deg,rgba(8,12,22,0.98),rgba(4,7,16,0.98))] p-5 backdrop-blur-xl">
      <div className="mb-6 rounded-3xl border border-cyan-400/10 bg-cyan-400/6 p-4 shadow-[0_0_24px_rgba(30,167,255,0.08)]">
        <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">CEASER</p>
        <h2 className="mt-2 text-xl font-semibold text-white">AI Operating System</h2>
        <p className="mt-1 text-xs text-slate-300">Mission control for the CEASER workforce.</p>
      </div>
      <nav className="space-y-1 text-sm">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl border border-transparent px-3 py-3 text-slate-200 transition hover:border-cyan-400/25 hover:bg-cyan-400/8 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 rounded-3xl border border-violet-400/10 bg-violet-400/6 p-4 text-xs text-slate-200 shadow-[0_0_24px_rgba(139,92,246,0.08)]">
        Core signal: high
      </div>
    </aside>
  );
}
