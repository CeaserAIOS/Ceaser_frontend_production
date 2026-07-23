import { AppShell } from "@/components/layout/app-shell";

export default function MemoryPage() {
  return (
    <AppShell>
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="text-xl font-semibold text-white">Memory</h1>
        <p className="mt-2 text-sm text-zinc-300">Placeholder route for conversation, project, goal, and workspace memory.</p>
      </section>
    </AppShell>
  );
}
