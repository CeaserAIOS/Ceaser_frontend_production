import { AppShell } from "@/components/layout/app-shell";

export default function VoicePage() {
  return (
    <AppShell>
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="text-xl font-semibold text-white">Voice</h1>
        <p className="mt-2 text-sm text-zinc-300">Placeholder route for voice capture, transcription, and synthesis workflows.</p>
      </section>
    </AppShell>
  );
}
