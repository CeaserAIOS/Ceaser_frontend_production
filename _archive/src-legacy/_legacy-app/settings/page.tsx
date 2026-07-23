import { AppShell } from "@/components/layout/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-sm text-zinc-300">Placeholder route for CEASER configuration and environment settings.</p>
      </section>
    </AppShell>
  );
}
