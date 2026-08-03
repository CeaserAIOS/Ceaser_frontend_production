"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { integrationsApi, type IntegrationRecord } from "@/lib/api/integrations"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Check,
  Database,
  FileText,
  Github,
  KeyRound,
  Loader2,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from "lucide-react"

type Filter = "all" | "connected" | "available"

const liveProviders = new Set<string>(["notion", "github"])
const launchMessage = "Prepared for verified access after launch."

const fallbackProviders: IntegrationRecord[] = [
  providerStub("notion", "Notion", "Connect your pages, databases, and knowledge workspace.", "not_connected"),
  providerStub("github", "GitHub", "Connect repositories, READMEs, commits, issues, and pull requests.", "not_connected"),
  providerStub("gmail", "Gmail", "Email assistance prepared for verified Google Workspace access.", "coming_soon"),
  providerStub("google-calendar", "Google Calendar", "Calendar intelligence prepared for verified Google Workspace access.", "coming_soon"),
  providerStub("google-drive", "Google Drive", "Drive file context prepared for verified Google Workspace access.", "coming_soon"),
  providerStub("google-tasks", "Google Tasks", "Task sync prepared for verified Google Workspace access.", "coming_soon"),
  providerStub("google-classroom", "Google Classroom", "Academic workspace sync prepared for verified Google access.", "coming_soon"),
  providerStub("microsoft-outlook", "Microsoft Outlook", "Sync emails, contacts and calendar.", "coming_soon"),
  providerStub("microsoft-teams", "Microsoft Teams", "Collaborate and get updates in Teams.", "coming_soon"),
]

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>(fallbackProviders)
  const [optimisticConnected, setOptimisticConnected] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState("notion")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [busyProvider, setBusyProvider] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const integrationsRef = useRef<IntegrationRecord[]>(fallbackProviders)
  const busyProviderRef = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const provider = params.get("integration")
    const status = params.get("status")

    if (provider && status === "connected" && liveProviders.has(provider)) {
      setSelectedId(provider)
      setOptimisticConnected((current) => new Set([...Array.from(current), provider]))
      setIntegrations((current) =>
        upsertIntegration(current, provider, { connected: true, status: "connected", last_sync_at: new Date().toISOString() }),
      )
      window.history.replaceState({}, "", `${window.location.pathname}?view=integrations`)
    }

    void loadIntegrations({ showLoading: true, showErrors: false })
  }, [])

  useEffect(() => {
    integrationsRef.current = integrations
  }, [integrations])

  useEffect(() => {
    busyProviderRef.current = busyProvider
  }, [busyProvider])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void syncConnectedIntegrations()
    }, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function loadIntegrations(options: { showLoading?: boolean; showErrors?: boolean } = {}) {
    if (options.showLoading) setIsLoading(true)
    if (options.showErrors) setMessage("")
    try {
      const records = await integrationsApi.list()
      setIntegrations(mergeFallbacks(records, optimisticConnected))
      if (!records.some((item) => item.id === selectedId)) setSelectedId(records[0]?.id || "notion")
    } catch (error) {
      if (options.showErrors) setMessage(error instanceof Error ? error.message : "Could not load integrations.")
    } finally {
      if (options.showLoading) setIsLoading(false)
    }
  }

  async function connect(provider: string) {
    setBusyProvider(provider)
    setMessage("")
    try {
      const result = await integrationsApi.connect(provider)
      if (result.auth_url) {
        window.location.href = result.auth_url
        return
      }
      await loadIntegrations({ showErrors: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not connect integration.")
    } finally {
      setBusyProvider(null)
    }
  }

  async function disconnect(provider: string) {
    setBusyProvider(provider)
    setMessage("")
    setOptimisticConnected((current) => {
      const next = new Set(current)
      next.delete(provider)
      return next
    })
    setIntegrations((current) =>
      current.map((item) =>
        item.id === provider
          ? { ...item, connected: false, status: "not_connected", account_email: null, last_sync_at: null, provider_account_id: null, metadata: {} }
          : item,
      ),
    )
    try {
      await integrationsApi.disconnect(provider)
      await loadIntegrations({ showErrors: false })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not disconnect integration.")
      await loadIntegrations({ showErrors: true })
    } finally {
      setBusyProvider(null)
    }
  }

  async function sync(provider: string) {
    setBusyProvider(provider)
    setMessage("")
    try {
      await integrationsApi.sync(provider)
      await loadIntegrations({ showErrors: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sync integration.")
    } finally {
      setBusyProvider(null)
    }
  }

  async function syncConnectedIntegrations() {
    if (busyProviderRef.current) return
    const connected = integrationsRef.current.filter((item) => item.connected && liveProviders.has(item.id))
    if (!connected.length) return
    await Promise.allSettled(connected.map((item) => integrationsApi.sync(item.id)))
    await loadIntegrations({ showErrors: false })
  }

  const allIntegrations = useMemo(() => {
    return mergeFallbacks(integrations, optimisticConnected)
  }, [integrations, optimisticConnected])

  const orderedIntegrations = useMemo(() => sortIntegrations(allIntegrations), [allIntegrations])
  const selected = orderedIntegrations.find((item) => item.id === selectedId) || orderedIntegrations[0]
  const connectedCount = allIntegrations.filter((item) => item.connected).length
  const availableCount = allIntegrations.filter((item) => !item.connected).length

  const filtered = orderedIntegrations.filter((item) => {
    const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "connected" && item.connected) ||
      (filter === "available" && !item.connected)
    return matchesQuery && matchesFilter
  })

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.16),transparent_32%),linear-gradient(135deg,#f7faff,#eef4ff_54%,#f8fbff)] p-6 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.13),transparent_34%),linear-gradient(135deg,#050812,#0b1020_52%,#070912)] dark:text-white">
      <div className="mx-auto grid max-w-[1400px] gap-5 xl:grid-cols-[1fr_360px]">
        <main className="min-w-0">
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Integrations</h1>
              <p className="mt-2 text-muted-foreground">Connect approved tools and let CEASER work with your knowledge workspace.</p>
            </div>
            <div className="flex gap-3">
              <label className="flex h-12 w-[360px] max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white/85 px-4 text-sm shadow-sm dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search integrations..." className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
              </label>
              <button onClick={() => void loadIntegrations({ showLoading: true, showErrors: true })} disabled={isLoading} className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-5 text-sm font-semibold shadow-sm transition hover:bg-white disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/10">
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Refresh All
              </button>
            </div>
          </header>

          <div className="mb-7 flex gap-7 border-b border-slate-200 text-sm font-medium dark:border-white/10">
            <Tab label="All Integrations" active={filter === "all"} onClick={() => setFilter("all")} />
            <Tab label={`Connected (${connectedCount})`} active={filter === "connected"} onClick={() => setFilter("connected")} />
            <Tab label={`Prepared (${availableCount})`} active={filter === "available"} onClick={() => setFilter("available")} />
          </div>

          {message && <p className="mb-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">{message}</p>}

          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading integrations...
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  selected={selected?.id === integration.id}
                  busy={busyProvider === integration.id}
                  onSelect={() => setSelectedId(integration.id)}
                  onConnect={() => void connect(integration.id)}
                  onDisconnect={() => void disconnect(integration.id)}
                  onSync={() => void sync(integration.id)}
                />
              ))}
            </div>
          )}

          <p className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Your data is encrypted and secure. CEASER never shares your data with third parties.
          </p>
        </main>

        <aside className="sticky top-4 h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          {selected && (
            <>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <IntegrationLogo id={selected.id} large />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    <StatusPill integration={selected} />
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{selected.description}</p>
                <div className="mt-5">
                  <p className="text-sm text-muted-foreground">Connected account</p>
                  <p className="mt-1 font-medium">{selected.account_email || (selected.connected ? "Connected account" : "Not connected")}</p>
                </div>
                <div className="mt-6 flex gap-2">
                  {selected.connected ? (
                    <>
                      <button onClick={() => void sync(selected.id)} disabled={busyProvider === selected.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/10">
                        {busyProvider === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Sync
                      </button>
                      <button onClick={() => void disconnect(selected.id)} disabled={busyProvider === selected.id} className="rounded-xl border border-red-500/70 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button onClick={() => void connect(selected.id)} disabled={!liveProviders.has(selected.id) || busyProvider === selected.id} className={cn("rounded-xl px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70", liveProviders.has(selected.id) ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-95" : "bg-slate-100 text-muted-foreground dark:bg-white/10")}>
                      {liveProviders.has(selected.id) ? "Connect" : "Prepared"}
                    </button>
                  )}
                </div>
              </div>

              <PanelSection title="Permissions">
                {permissionLabels(selected).map((permission) => (
                  <DetailRow key={permission} icon={<Check className="h-3.5 w-3.5" />} text={permission} />
                ))}
              </PanelSection>

              <PanelSection title="Features">
                {featureLabels(selected).map((feature) => (
                  <DetailRow key={feature.title} icon={feature.icon} text={feature.title} subtext={feature.detail} />
                ))}
              </PanelSection>

              <div className="border-t border-slate-200 p-6 text-sm dark:border-white/10">
                <p className="text-muted-foreground">Last sync</p>
                <p className="mt-1 font-medium">{selected.last_sync_at ? formatDate(selected.last_sync_at) : selected.connected ? "Ready to sync" : "Not connected"}</p>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}

function IntegrationCard({ integration, selected, busy, onSelect, onConnect, onDisconnect, onSync }: {
  integration: IntegrationRecord
  selected: boolean
  busy: boolean
  onSelect: () => void
  onConnect: () => void
  onDisconnect: () => void
  onSync: () => void
}) {
  const live = liveProviders.has(integration.id)
  return (
    <article
      onClick={onSelect}
      className={cn(
        "group flex min-h-[150px] cursor-pointer flex-col justify-between rounded-xl border bg-white/82 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:bg-white/[0.045] dark:hover:bg-white/[0.07]",
        selected ? "border-violet-500/70 shadow-[0_18px_46px_rgba(124,58,237,0.16)] dark:shadow-[0_0_35px_rgba(124,58,237,0.16)]" : "border-slate-200 dark:border-white/10",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <IntegrationLogo id={integration.id} />
          <div className="min-w-0">
            <p className="font-semibold">{integration.name}</p>
            <p className="mt-1 max-w-[240px] text-sm leading-relaxed text-muted-foreground">{integration.description}</p>
          </div>
        </div>
        <StatusPill integration={integration} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 truncate text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          <span className="truncate">{integration.account_email || (integration.connected ? "Connected account" : live ? "Available to connect" : "Coming soon")}</span>
        </p>
        <div className="flex items-center gap-2">
          {integration.connected ? (
            <>
              <button onClick={(event) => { event.stopPropagation(); onSync() }} disabled={busy} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/10">
                {busy ? "Syncing" : "Sync"}
              </button>
              <button onClick={(event) => { event.stopPropagation(); onDisconnect() }} disabled={busy} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-60">
                Disconnect
              </button>
            </>
          ) : (
            <button onClick={(event) => { event.stopPropagation(); onConnect() }} disabled={!live || busy} className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">
              {busy ? "Opening" : live ? "Connect" : "Soon"}
            </button>
          )}
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </article>
  )
}

function IntegrationLogo({ id, large = false }: { id: string; large?: boolean }) {
  const size = large ? "h-16 w-16" : "h-12 w-12"
  const logoSize = large ? "h-10 w-10" : "h-8 w-8"
  const base = "flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/10"
  const logos: Record<string, ReactNode> = {
    gmail: <GmailLogo className={logoSize} />,
    "google-calendar": <GoogleCalendarLogo className={logoSize} />,
    "google-drive": <GoogleDriveLogo className={logoSize} />,
    "google-tasks": <GoogleTasksLogo className={logoSize} />,
    "google-classroom": <GoogleClassroomLogo className={logoSize} />,
    notion: <NotionLogo className={logoSize} />,
    "microsoft-outlook": <OutlookLogo className={logoSize} />,
    github: <GithubLogo className={logoSize} />,
    "microsoft-teams": <TeamsLogo className={logoSize} />,
  }
  return <div className={cn(base, size)}>{logos[id] || <KeyRound className={logoSize} />}</div>
}

function GmailLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#EA4335" d="M8 14.5 24 26.4 40 14.5v21.2a3.8 3.8 0 0 1-3.8 3.8H11.8A3.8 3.8 0 0 1 8 35.7V14.5Z" />
      <path fill="#FBBC04" d="M40 12.3v2.2L24 26.4 8 14.5v-2.2c0-2.8 3.2-4.4 5.4-2.7L24 17.5l10.6-7.9c2.2-1.7 5.4-.1 5.4 2.7Z" />
      <path fill="#4285F4" d="M8 14.5v21.2a3.8 3.8 0 0 0 3.8 3.8h3V19.6L8 14.5Z" />
      <path fill="#34A853" d="M33.2 39.5h3a3.8 3.8 0 0 0 3.8-3.8V14.5l-6.8 5.1v19.9Z" />
    </svg>
  )
}

function GoogleCalendarLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#fff" d="M9 8h30a3 3 0 0 1 3 3v26a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3Z" />
      <path fill="#4285F4" d="M6 16h36v21a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V16Z" />
      <path fill="#1A73E8" d="M9 8h30a3 3 0 0 1 3 3v5H6v-5a3 3 0 0 1 3-3Z" />
      <path fill="#fff" d="M17.5 31.9c2.1 0 3.6-1.1 3.6-2.8 0-1.3-.9-2.2-2.2-2.5v-.1c1.1-.4 1.8-1.2 1.8-2.3 0-1.6-1.3-2.6-3.2-2.6-1.6 0-2.9.8-3.5 2.1l1.7.8c.4-.8 1-1.2 1.8-1.2.8 0 1.4.4 1.4 1.1 0 .8-.7 1.2-1.8 1.2h-1v1.6h1.1c1.3 0 2 .5 2 1.4 0 .8-.7 1.4-1.8 1.4-1 0-1.8-.5-2.2-1.4l-1.8.8c.7 1.6 2.1 2.5 4.1 2.5Zm8.8-.2h2V21.9h-1.7l-3.1 2.2 1 1.5 1.8-1.2v7.3Z" />
    </svg>
  )
}

function GoogleDriveLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#0F9D58" d="M18 6h12l12 21H30L18 6Z" />
      <path fill="#4285F4" d="M18 42h24L30 21H18L6 42h12Z" />
      <path fill="#F4B400" d="M6 42 18 21 30 6H18L6 27l-6 15h6Z" />
    </svg>
  )
}

function GoogleTasksLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#2684FC" />
      <path fill="#fff" d="m20.8 29.2-6-6 2.5-2.5 3.5 3.5 9.9-9.9 2.5 2.5-12.4 12.4Z" />
      <path fill="#fff" opacity=".55" d="M17 34h17v3H17z" />
    </svg>
  )
}

function GoogleClassroomLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#25A667" d="M6 10h36v28H6z" />
      <path fill="#F6C343" d="M6 34h36v4H6z" />
      <circle cx="24" cy="21" r="5" fill="#fff" />
      <path fill="#fff" d="M15 31c1.3-4.3 4.8-6.3 9-6.3s7.7 2 9 6.3H15Z" opacity=".9" />
    </svg>
  )
}

function NotionLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#fff" stroke="#111827" strokeWidth="2.4" d="M10 7.5 35.8 5l5.2 4.2v29.6L15.2 43 7 37.1V12.3l3-4.8Z" />
      <path fill="#111827" d="M17 17.5h3.9l9.9 15.6V17.5h3.3v18.9h-3.8L20.3 20.8v15.6H17V17.5Z" />
    </svg>
  )
}

function OutlookLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#0078D4" d="M18 9h21a3 3 0 0 1 3 3v24a3 3 0 0 1-3 3H18V9Z" />
      <path fill="#50A7F2" d="M29 14h13v8H29z" />
      <path fill="#0A63B0" d="M29 26h13v8H29z" />
      <path fill="#106EBE" d="M6 15 23 12v24L6 33V15Z" />
      <path fill="#fff" d="M14.7 28.9c-3.2 0-5.2-2.4-5.2-5.2s2-5.3 5.2-5.3 5.2 2.4 5.2 5.3-2 5.2-5.2 5.2Zm0-2.4c1.5 0 2.4-1.2 2.4-2.8s-.9-2.9-2.4-2.9-2.4 1.2-2.4 2.9.9 2.8 2.4 2.8Z" />
    </svg>
  )
}

function GithubLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#181717" d="M24 5.5c-10.5 0-19 8.5-19 19 0 8.4 5.4 15.5 12.9 18 .9.2 1.2-.4 1.2-.9v-3.2c-5.2 1.1-6.3-2.2-6.3-2.2-.9-2.1-2.1-2.7-2.1-2.7-1.7-1.2.1-1.2.1-1.2 1.9.1 2.9 2 2.9 2 1.7 2.9 4.5 2.1 5.5 1.6.2-1.2.7-2.1 1.2-2.5-4.2-.5-8.6-2.1-8.6-9.3 0-2.1.7-3.8 2-5.1-.2-.5-.8-2.5.2-5 0 0 1.6-.5 5.2 2 1.5-.4 3.1-.6 4.8-.6s3.3.2 4.8.6c3.6-2.5 5.2-2 5.2-2 1 2.5.4 4.5.2 5 1.2 1.3 2 3 2 5.1 0 7.2-4.4 8.8-8.6 9.3.7.6 1.3 1.8 1.3 3.6v5.3c0 .5.3 1.1 1.3.9C37.6 40 43 32.9 43 24.5c0-10.5-8.5-19-19-19Z" />
    </svg>
  )
}

function TeamsLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#5059C9" d="M19 14h17a5 5 0 0 1 5 5v11a8 8 0 0 1-8 8H19V14Z" />
      <path fill="#7B83EB" d="M26 10h11a4 4 0 0 1 4 4v3H26v-7Z" />
      <circle cx="34" cy="9" r="5" fill="#7B83EB" />
      <circle cx="24" cy="11" r="6" fill="#5059C9" />
      <path fill="#4B53BC" d="M7 16h22v22H7z" />
      <path fill="#fff" d="M13 21h11v3.1h-3.8V34h-3.4v-9.9H13V21Z" />
    </svg>
  )
}

function StatusPill({ integration }: { integration: IntegrationRecord }) {
  const live = liveProviders.has(integration.id)
  const label = !live ? "Prepared" : integration.connected ? "Connected" : integration.status === "credentials_required" ? "Setup needed" : "Available"
  return (
    <span className={cn(
      "shrink-0 rounded-lg px-3 py-1 text-xs font-semibold",
      integration.connected ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-300" : integration.status === "credentials_required" ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-muted-foreground",
    )}>
      {label}
    </span>
  )
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("relative pb-4 text-muted-foreground transition hover:text-foreground", active && "text-violet-600 dark:text-violet-300")}>
      {label}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-violet-500" />}
    </button>
  )
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 p-6 dark:border-white/10">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function DetailRow({ icon, text, subtext }: { icon: ReactNode; text: string; subtext?: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">{icon}</span>
      <span>
        <span className="block text-foreground">{text}</span>
        {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
      </span>
    </div>
  )
}

function permissionLabels(integration: IntegrationRecord) {
  if (!liveProviders.has(integration.id)) return ["Verified access preparation", "Privacy review in progress", "Google sign-in remains active"]
  if (integration.id === "gmail") return ["Read emails", "Read labels", "Access profile info"]
  if (integration.id === "google-calendar") return ["Read calendars", "Read calendar events", "Access profile info"]
  if (integration.id === "google-drive") return ["Read Drive metadata", "Read supported document content", "Access profile info"]
  if (integration.id === "google-tasks") return ["Read task lists", "Read tasks and due dates", "Access profile info"]
  if (integration.id === "google-classroom") return ["Read courses", "Read coursework", "Read assignments and due dates"]
  if (integration.id === "notion") return ["Read pages", "Read databases", "Read workspace metadata"]
  if (integration.id === "github") return ["Read repository metadata", "Read repository contents", "Read issues and pull requests"]
  return ["Read account metadata", "Use connection status", "Access profile info"]
}

function featureLabels(integration: IntegrationRecord) {
  if (!liveProviders.has(integration.id)) {
    return [
      { title: "Launch Safe", detail: launchMessage, icon: <ShieldCheck className="h-3.5 w-3.5" /> },
      { title: "Account Identity", detail: "Google login continues with profile access only", icon: <Users className="h-3.5 w-3.5" /> },
    ]
  }
  if (integration.id === "gmail") {
    return [
      { title: "AI Email Assistant", detail: "Summaries and important inbox signals", icon: <Sparkles className="h-3.5 w-3.5" /> },
      { title: "Email Search", detail: "Search across your inbox", icon: <Search className="h-3.5 w-3.5" /> },
      { title: "Label Awareness", detail: "Understand inbox organization", icon: <Tag className="h-3.5 w-3.5" /> },
    ]
  }
  if (integration.id === "google-calendar") {
    return [
      { title: "Daily Agenda", detail: "Ask CEASER what is on your schedule", icon: <Calendar className="h-3.5 w-3.5" /> },
      { title: "Meeting Context", detail: "Use events in briefings and planning", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ]
  }
  if (integration.id === "notion") {
    return [
      { title: "Knowledge Search", detail: "Use Notion pages as workspace context", icon: <Search className="h-3.5 w-3.5" /> },
      { title: "Database Awareness", detail: "Read shared databases and page metadata", icon: <Database className="h-3.5 w-3.5" /> },
      { title: "Secure Read Mode", detail: "CEASER reads approved content only", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    ]
  }
  if (integration.id === "github") {
    return [
      { title: "Repository Overview", detail: "List visible repositories and metadata", icon: <Github className="h-3.5 w-3.5" /> },
      { title: "README Analysis", detail: "Explain connected repository READMEs", icon: <FileText className="h-3.5 w-3.5" /> },
      { title: "Issues and PRs", detail: "Summarize open work from GitHub", icon: <Sparkles className="h-3.5 w-3.5" /> },
    ]
  }
  return [
    { title: "Agent Context", detail: "Let CEASER use this source when relevant", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { title: "Secure Read Mode", detail: "V1 reads data only, no destructive writes", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  ]
}

function providerStub(id: string, name: string, description: string, status: string): IntegrationRecord {
  return {
    id,
    name,
    category: "productivity",
    description,
    scopes: [],
    permissions: [],
    read_only: true,
    status,
    connected: false,
    metadata: {},
  }
}

function mergeFallbacks(records: IntegrationRecord[], connectedOverrides = new Set<string>()) {
  const byId = new Map<string, IntegrationRecord>()
  for (const item of fallbackProviders) byId.set(item.id, item)
  for (const item of records) byId.set(item.id, item)
  for (const id of connectedOverrides) {
    byId.set(id, {
      ...(byId.get(id) || providerStub(id, providerName(id), "Connected integration.", "connected")),
      connected: true,
      status: "connected",
    })
  }
  return sortIntegrations(Array.from(byId.values()))
}

function upsertIntegration(records: IntegrationRecord[], id: string, updates: Partial<IntegrationRecord>) {
  const existing = records.find((item) => item.id === id) || fallbackProviders.find((item) => item.id === id) || providerStub(id, providerName(id), "Connected integration.", "connected")
  const next = { ...existing, ...updates }
  const without = records.filter((item) => item.id !== id)
  return [...without, next]
}

function providerName(id: string) {
  return fallbackProviders.find((item) => item.id === id)?.name || id
}

function sortIntegrations(records: IntegrationRecord[]) {
  return [...records]
    .filter((item) => !["slack", "dropbox", "linear"].includes(item.id))
    .sort((a, b) => {
      const rank = (item: IntegrationRecord) => item.connected ? 0 : liveProviders.has(item.id) ? 1 : 2
      const rankDelta = rank(a) - rank(b)
      return rankDelta || a.name.localeCompare(b.name)
    })
}

function formatDate(value?: string | null) {
  if (!value) return "Never"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}
