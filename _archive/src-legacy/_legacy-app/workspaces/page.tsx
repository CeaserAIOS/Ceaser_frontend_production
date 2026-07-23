import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceCard } from "@/components/workspaces/workspace-card";
import { WorkspaceDetail } from "@/components/workspaces/workspace-detail";
import { workspaceRegistry } from "@/constants/workspaces-registry";

export default function WorkspacesPage() {
  return (
    <AppShell>
      <section className="space-y-6">
        <article className="glass-panel rounded-3xl p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-cyan-300/80">Workspace Hub</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">AI operating environments</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-200">Three premium workspace modes for personal, creator, and startup organizations, each built with the same futuristic foundation and mock data.</p>
        </article>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            {workspaceRegistry.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspaceId={workspace.id} />
            ))}
          </div>

          <WorkspaceDetail workspaceId="startup" />
        </div>
      </section>
    </AppShell>
  );
}
