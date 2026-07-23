import { AppShell } from "@/components/layout/app-shell";

export default function BillingPage() {
  return (
    <AppShell>
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h1 className="text-xl font-semibold text-white">Billing</h1>
        <p className="mt-2 text-sm text-zinc-300">Placeholder route for subscriptions, usage, and billing controls.</p>
      </section>
    </AppShell>
  );
}
