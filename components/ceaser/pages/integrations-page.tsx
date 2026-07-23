"use client"

import { useEffect, useState } from "react"
import { integrationsApi, type IntegrationRecord } from "@/lib/api/integrations"
import { GlowCard } from "../glow-card"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, CheckCircle2, Database, FileText, Inbox, KeyRound, Loader2, Plug, RefreshCw, Unplug, ClipboardList } from "lucide-react"

const icons: Record<string, typeof Plug> = {
  "google-calendar": Calendar,
  gmail: Inbox,
  "google-drive": FileText,
  "google-tasks": ClipboardList,
  "google-classroom": BookOpen,
  notion: Database,
}

const liveProviders = new Set(["google-calendar", "gmail", "google-drive", "google-tasks", "google-classroom"])

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyProvider, setBusyProvider] = useState<string | null>(null)

  useEffect(() => {
    void loadIntegrations()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void syncConnectedIntegrations()
    }, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [integrations, busyProvider])

  async function loadIntegrations() {
    setIsLoading(true)
    try {
      setIntegrations(await integrationsApi.list())
    } finally {
      setIsLoading(false)
    }
  }

  async function connect(provider: string) {
    setBusyProvider(provider)
    try {
      const result = await integrationsApi.connect(provider)
      if (result.auth_url) {
        window.location.href = result.auth_url
        return
      }
      await loadIntegrations()
    } finally {
      setBusyProvider(null)
    }
  }

  async function disconnect(provider: string) {
    setBusyProvider(provider)
    setIntegrations((current) =>
      current.map((integration) =>
        integration.id === provider
          ? { ...integration, connected: false, status: "not_connected", account_email: null, last_sync_at: null }
          : integration,
      ),
    )
    try {
      await integrationsApi.disconnect(provider)
      await loadIntegrations()
    } finally {
      setBusyProvider(null)
    }
  }

  async function sync(provider: string) {
    setBusyProvider(provider)
    try {
      await integrationsApi.sync(provider)
      await loadIntegrations()
    } finally {
      setBusyProvider(null)
    }
  }

  async function syncConnectedIntegrations() {
    if (busyProvider) return
    const connected = integrations.filter((integration) => integration.connected && liveProviders.has(integration.id))
    if (!connected.length) return
    await Promise.allSettled(connected.map((integration) => integrationsApi.sync(integration.id)))
    await loadIntegrations()
  }

  const connectedCount = integrations.filter((integration) => integration.connected).length

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">System Configuration</p>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Connect read-only data sources for CEASER agents. V1 never sends emails, edits calendars, uploads Drive files, or modifies Notion/Classroom.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm">
          <p className="text-muted-foreground">Connected Providers</p>
          <p className="mt-1 text-2xl font-bold">{connectedCount}/{integrations.length || 6}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading integrations...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = icons[integration.id] ?? Plug
            const busy = busyProvider === integration.id
            const credentialsRequired = integration.status === "credentials_required"
            const isLive = liveProviders.has(integration.id)
            return (
              <GlowCard key={integration.id} hover glowColor={integration.connected ? "#34f5a3" : "#4f8cff"}>
                <div className="flex min-h-[190px] flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", integration.connected ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{integration.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Status status={isLive ? integration.status : "coming_soon"} connected={isLive && integration.connected} />
                  </div>

                  {(integration.account_email || !isLive || (isLive && credentialsRequired)) && (
                    <div className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3 text-xs text-muted-foreground">
                      {integration.account_email && <p className="text-foreground">{integration.account_email}</p>}
                      {!isLive && <p className="text-amber-400">Coming soon after Google integrations are validated.</p>}
                      {isLive && credentialsRequired && <p className="text-amber-400">OAuth credentials are missing in backend `.env`.</p>}
                    </div>
                  )}

                  {isLive && integration.connected && (
                    <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
                      Synced{integration.last_sync_at ? ` - ${formatDate(integration.last_sync_at)}` : ""}
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2">
                    {!isLive ? (
                      <button disabled className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground opacity-70">
                        Coming Soon
                      </button>
                    ) : integration.connected ? (
                      <>
                        <button onClick={() => void sync(integration.id)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50">
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          Sync
                        </button>
                        <button onClick={() => void disconnect(integration.id)} disabled={busy} className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50">
                          <Unplug className="h-3.5 w-3.5" />
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button onClick={() => void connect(integration.id)} disabled={busy} className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </GlowCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Status({ status, connected }: { status: string; connected: boolean }) {
  return (
    <span className={cn("flex items-center gap-1 rounded-full px-2 py-1 text-xs capitalize", connected ? "bg-emerald-500/10 text-emerald-400" : status === "credentials_required" ? "bg-amber-500/10 text-amber-400" : "bg-secondary text-muted-foreground")}>
      {connected && <CheckCircle2 className="h-3 w-3" />}
      {status.replace(/_/g, " ")}
    </span>
  )
}

function formatDate(value?: string | null) {
  if (!value) return "Never"
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}
