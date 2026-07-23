"use client";

import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { AgentDock } from "@/components/mission-control/agent-dock";
import { AgentOrbit } from "@/components/mission-control/agent-orbit";
import { ImportantContext } from "@/components/mission-control/important-context";
import { LiveActivityStream } from "@/components/mission-control/live-activity-stream";
import { MissionIntelligence } from "@/components/mission-control/mission-intelligence";
import { MemoryFeed } from "@/components/mission-control/memory-feed";
import { WorkspaceSummary } from "@/components/mission-control/workspace-summary";

export default function MissionControlPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(9,14,27,0.92),rgba(5,8,16,0.98))] p-6 shadow-[0_22px_60px_rgba(5,8,18,0.65)]"
        >
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-200/90">Mission Control</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">AI workforce operating in real time</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-200">A spatial intelligence interface for the CEASER organization: agents, memory, activity, and goals orchestrated in one immersive environment.</p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr_340px]">
          <aside className="space-y-6">
            <AgentDock />
            <WorkspaceSummary />
          </aside>

          <main className="space-y-6">
            <MissionIntelligence />
            <div className="grid gap-6 lg:grid-cols-2">
              <AgentOrbit />
              <MemoryFeed />
            </div>
          </main>

          <aside className="space-y-6">
            <ImportantContext />
            <article className="glass-panel rounded-3xl p-5">
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Active Goals</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Current objectives</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-100">
                <li className="rounded-2xl border border-white/8 bg-white/5 p-3">Coordinate launch-critical system decisions.</li>
                <li className="rounded-2xl border border-white/8 bg-white/5 p-3">Maintain coherent memory across all agents.</li>
                <li className="rounded-2xl border border-white/8 bg-white/5 p-3">Surface real-time operational clarity.</li>
              </ul>
            </article>
          </aside>
        </div>

        <LiveActivityStream />
      </section>
    </AppShell>
  );
}
