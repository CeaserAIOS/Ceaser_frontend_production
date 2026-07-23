import { AppShell } from "@/components/layout/app-shell";

export default function HomePage() {
  return (
    <AppShell>
      <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">CEASER</p>
        <h1 className="text-2xl font-semibold text-white">Architecture scaffold initialized.</h1>
        <p className="max-w-2xl text-sm text-zinc-300">This is the placeholder home page for the CEASER frontend. The feature folders, stores, types, and route skeleton are now in place.</p>
      </section>
    </AppShell>
  );
}
