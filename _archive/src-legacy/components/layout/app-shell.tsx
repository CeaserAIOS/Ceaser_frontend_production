import { ContentArea } from "./content-area";
import { PageContainer } from "./page-container";
import { Sidebar } from "./sidebar";
import { StatusBar } from "./status-bar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(30,167,255,0.10),_transparent_22%),radial-gradient(circle_at_85%_10%,_rgba(139,92,246,0.13),_transparent_18%),linear-gradient(180deg,#07111f_0%,#04070d_100%)]">
          <Topbar />
          <section className="flex-1 p-6">
            <PageContainer>
              <ContentArea>{children}</ContentArea>
            </PageContainer>
          </section>
          <StatusBar />
        </main>
      </div>
    </div>
  );
}
