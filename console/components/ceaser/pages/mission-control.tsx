"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import type { AppPage } from "@/lib/ceaser"
import { useApp } from "@/lib/app-context"
import { getUserDisplayName, readUserProfile } from "@/lib/user-profile"
import { chatApi, type ConversationRecord } from "@/lib/api/chat"
import { integrationsApi, type IntegrationRecord } from "@/lib/api/integrations"
import { memoryApi, type MemoryRecord } from "@/lib/api/memory"
import { projectsApi, type ProjectRecord } from "@/lib/api/projects"
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  Database,
  FileText,
  Github,
  GitPullRequest,
  Layers3,
  Loader2,
  MessageSquareText,
  NotebookText,
  Search,
  ShieldCheck,
  Sparkles,
  SquareCheckBig,
} from "lucide-react"

type AnyRecord = Record<string, unknown>
type IntegrationWithProvider = IntegrationRecord & { provider?: string }

type KnowledgeSegment = {
  label: string
  value: number
  color: string
  page: AppPage
}

const MAX_ACTIVITY_ITEMS = 5
const MISSION_CACHE_KEY = "ceaser_mission_control_cache_v1"
const LIVE_DATA_TIMEOUT_MS = 5000

type MissionCache = {
  projects: ProjectRecord[]
  memories: MemoryRecord[]
  conversations: ConversationRecord[]
  integrations: IntegrationRecord[]
}

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : {}
}

function asArray(value: unknown): AnyRecord[] {
  return Array.isArray(value) ? value.filter((item): item is AnyRecord => Boolean(item) && typeof item === "object") : []
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function getIntegrationPayload(integration?: IntegrationRecord | null) {
  const metadata = asRecord(integration?.metadata)
  return {
    ...metadata,
    ...asRecord(metadata.last_metadata),
    ...asRecord(metadata.last_sync),
    ...asRecord(metadata.cache),
  }
}

function getProviderItems(integration?: IntegrationRecord | null) {
  const payload = getIntegrationPayload(integration)
  return [
    ...asArray(payload.items),
    ...asArray(payload.repositories),
    ...asArray(payload.repos),
    ...asArray(payload.pages),
    ...asArray(payload.databases),
  ]
}

function providerKey(integration: IntegrationRecord | IntegrationWithProvider) {
  const provider = readString((integration as IntegrationWithProvider).provider)
  const id = readString(integration.id).toLowerCase()
  const name = readString(integration.name)
  const candidate = provider || (["github", "notion"].includes(id) ? id : name || id)
  return candidate.toLowerCase().replace(/\s+/g, "-")
}

function findIntegration(records: IntegrationRecord[], provider: string) {
  return records.find((item) => providerKey(item) === provider || item.id === provider || item.name.toLowerCase() === provider)
}

function getRepoName(repo: AnyRecord) {
  return readString(repo.full_name) || readString(repo.name) || readString(repo.repository) || "Repository"
}

function getItemTitle(item: AnyRecord) {
  return (
    readString(item.title) ||
    readString(item.name) ||
    readString(item.full_name) ||
    readString(item.display_name) ||
    readString(item.path) ||
    "Workspace item"
  )
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "Not synced yet"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.round(diffMs / 60000))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return days === 1 ? "Yesterday" : `${days} days ago`
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

function getMemoryTitle(memory: MemoryRecord) {
  const metadata = asRecord(memory.metadata ?? memory.extra_metadata)
  return readString(metadata.title) || memory.content.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 72) || "Memory"
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

function buildConicGradient(segments: KnowledgeSegment[]) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  if (total <= 0) return "conic-gradient(from 180deg, rgba(59,130,246,.35), rgba(168,85,247,.35), rgba(20,184,166,.35), rgba(59,130,246,.35))"
  let cursor = 0
  const stops = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const start = cursor
      const size = (segment.value / total) * 360
      cursor += size
      return `${segment.color} ${start.toFixed(2)}deg ${cursor.toFixed(2)}deg`
    })
  return `conic-gradient(from 180deg, ${stops.join(", ")})`
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 220
      const y = 76 - (value / max) * 58
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox="0 0 220 88" className="h-24 w-full overflow-visible">
      <defs>
        <linearGradient id="healthLine" x1="0" x2="1" y1="0" y2="0">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="healthFill" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#10b981" stopOpacity=".28" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M0,86 L${points} L220,86 Z`} fill="url(#healthFill)" opacity=".85" />
      <polyline points={points} fill="none" stroke="url(#healthLine)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
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

function GithubBrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path fill="#181717" d="M24 5.5c-10.5 0-19 8.5-19 19 0 8.4 5.4 15.5 12.9 18 .9.2 1.2-.4 1.2-.9v-3.2c-5.2 1.1-6.3-2.2-6.3-2.2-.9-2.1-2.1-2.7-2.1-2.7-1.7-1.2.1-1.2.1-1.2 1.9.1 2.9 2 2.9 2 1.7 2.9 4.5 2.1 5.5 1.6.2-1.2.7-2.1 1.2-2.5-4.2-.5-8.6-2.1-8.6-9.3 0-2.1.7-3.8 2-5.1-.2-.5-.8-2.5.2-5 0 0 1.6-.5 5.2 2 1.5-.4 3.1-.6 4.8-.6s3.3.2 4.8.6c3.6-2.5 5.2-2 5.2-2 1 2.5.4 4.5.2 5 1.2 1.3 2 3 2 5.1 0 7.2-4.4 8.8-8.6 9.3.7.6 1.3 1.8 1.3 3.6v5.3c0 .5.3 1.1 1.3.9C37.6 40 43 32.9 43 24.5c0-10.5-8.5-19-19-19Z" />
    </svg>
  )
}

function AnimatedKnowledgeDonut({ loading, total, segments, onClick }: { loading: boolean; total: number; segments: KnowledgeSegment[]; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative mx-auto grid h-52 w-52 place-items-center rounded-full transition ${loading ? "animate-[spin_2.4s_linear_infinite]" : ""}`}
      style={{ background: loading ? "conic-gradient(from 0deg, #22d3ee, #a855f7, #f97316, #22d3ee)" : buildConicGradient(segments) }}
    >
      <div className="absolute inset-4 rounded-full bg-[#081427] shadow-[inset_0_0_40px_rgba(0,0,0,.75)]" />
      <div className={loading ? "relative animate-[spin_2.4s_linear_infinite_reverse] text-center" : "relative text-center"}>
        <p className="text-4xl font-semibold text-white">{total}</p>
        <p className="text-sm text-slate-400">{loading ? "Loading items" : "Total Items"}</p>
      </div>
    </button>
  )
}

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-cyan-300/10 bg-[#071323]/78 shadow-[0_20px_80px_rgba(0,0,0,.22),inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl ${className}`}>
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-100">
          <span className="mr-2 text-emerald-400">+</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function ViewAllButton({ page }: { page: AppPage }) {
  const { setCurrentPage } = useApp()
  return (
    <button onClick={() => setCurrentPage(page)} className="rounded-full border border-blue-400/15 px-3 py-1 text-xs font-medium text-blue-300 transition hover:border-blue-300/40 hover:text-blue-100">
      View All
    </button>
  )
}

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), LIVE_DATA_TIMEOUT_MS)
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => window.clearTimeout(timer))
  })
}

function readMissionCache(): MissionCache | null {
  try {
    const cached = window.localStorage.getItem(MISSION_CACHE_KEY)
    return cached ? (JSON.parse(cached) as MissionCache) : null
  } catch {
    return null
  }
}

function writeMissionCache(data: MissionCache) {
  try {
    window.localStorage.setItem(MISSION_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Cache is optional; ignore storage quota/private mode failures.
  }
}

export function MissionControl() {
  const { setCurrentPage, setIsSearchOpen, startNewChatWithPrompt } = useApp()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [integrations, setIntegrations] = useState<IntegrationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isIntegrationRefreshing, setIsIntegrationRefreshing] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadMissionData() {
      const cached = readMissionCache()
      if (cached) {
        setProjects(cached.projects)
        setMemories(cached.memories)
        setConversations(cached.conversations)
        setIntegrations(cached.integrations)
        setIsLoading(false)
      }

      setIsLoading(true)
      setIsIntegrationRefreshing(true)
      const [projectValue, memoryValue, conversationValue, integrationValue] = await Promise.all([
        withTimeout(projectsApi.list(), cached?.projects ?? []),
        withTimeout(memoryApi.list(), cached?.memories ?? []),
        withTimeout(chatApi.listConversations(false), cached?.conversations ?? []),
        withTimeout(integrationsApi.list(), cached?.integrations ?? []),
      ])
      if (!mounted) return
      setProjects(projectValue)
      setMemories(memoryValue)
      setConversations(conversationValue)
      setIntegrations(integrationValue)
      setIsLoading(false)
      writeMissionCache({ projects: projectValue, memories: memoryValue, conversations: conversationValue, integrations: integrationValue })

      const connectedWorkspaceProviders = integrationValue
        .filter((item) => item.connected && ["github", "notion"].includes(providerKey(item)))
        .filter((item) => getProviderItems(item).length === 0)
      if (connectedWorkspaceProviders.length) {
        void Promise.allSettled(connectedWorkspaceProviders.map((item) => integrationsApi.sync(providerKey(item))))
          .then(() => integrationsApi.list())
          .then((refreshed) => {
            if (!mounted) return
            setIntegrations(refreshed)
            writeMissionCache({ projects: projectValue, memories: memoryValue, conversations: conversationValue, integrations: refreshed })
          })
          .catch(() => undefined)
          .finally(() => {
            if (mounted) setIsIntegrationRefreshing(false)
          })
      } else {
        setIsIntegrationRefreshing(false)
      }
    }
    void loadMissionData()
    return () => {
      mounted = false
    }
  }, [])

  const profile = readUserProfile()
  const displayName = getUserDisplayName(profile)
  const firstName = displayName.split(" ")[0] || "Akshay"
  const github = findIntegration(integrations, "github")
  const notion = findIntegration(integrations, "notion")
  const githubItems = getProviderItems(github)
  const notionItems = getProviderItems(notion)
  const repoItems = githubItems.filter((item) => readString(item.full_name) || readString(item.name))
  const notionPages = notionItems.filter((item) => readString(item.object) === "page" || !readString(item.object))
  const notionDatabases = notionItems.filter((item) => readString(item.object) === "database")
  const commits = repoItems.reduce((sum, repo) => sum + asArray(repo.commits).length + readNumber(repo.commit_count), 0)
  const issues = repoItems.reduce((sum, repo) => sum + asArray(repo.issues).length + readNumber(repo.open_issues_count), 0)
  const pullRequests = repoItems.reduce((sum, repo) => sum + asArray(repo.pull_requests).length + readNumber(repo.pull_request_count), 0)
  const notes = memories.length + notionPages.length
  const allConnected = Boolean(github?.connected) && Boolean(notion?.connected)

  const knowledgeSegments: KnowledgeSegment[] = [
    { label: "Repositories", value: repoItems.length, color: "#2563eb", page: "integrations" },
    { label: "Pages", value: notionPages.length, color: "#14b8a6", page: "integrations" },
    { label: "Notes", value: notes, color: "#a855f7", page: "memory" },
    { label: "Databases", value: notionDatabases.length, color: "#22d3ee", page: "integrations" },
    { label: "Commits", value: commits, color: "#f97316", page: "integrations" },
    { label: "Issues", value: issues, color: "#f59e0b", page: "integrations" },
    { label: "Pull Requests", value: pullRequests, color: "#3b82f6", page: "integrations" },
  ]
  const totalKnowledgeItems = knowledgeSegments.reduce((sum, segment) => sum + segment.value, 0)

  const metricCards = [
    { label: "GitHub", title: "Repositories", value: repoItems.length, delta: repoItems.length ? `+${Math.min(repoItems.length, 9)}` : "0", icon: <Github className="h-7 w-7" />, page: "integrations" as AppPage },
    { label: "Commits", title: "Recent", value: commits, delta: commits ? `+${Math.min(commits, 18)}` : "0", icon: <Code2 className="h-7 w-7" />, page: "integrations" as AppPage },
    { label: "Issues", title: "Open", value: issues, delta: issues ? `${issues}` : "0", icon: <CircleDot className="h-7 w-7" />, page: "integrations" as AppPage },
    { label: "Pull Requests", title: "Open", value: pullRequests, delta: pullRequests ? `+${pullRequests}` : "0", icon: <GitPullRequest className="h-7 w-7" />, page: "integrations" as AppPage },
    { label: "Notion", title: "Pages", value: notionPages.length, delta: notionPages.length ? `+${Math.min(notionPages.length, 9)}` : "0", icon: <NotebookText className="h-7 w-7" />, page: "integrations" as AppPage },
    { label: "Databases", title: "Databases", value: notionDatabases.length, delta: notionDatabases.length ? `+${notionDatabases.length}` : "0", icon: <Database className="h-7 w-7" />, page: "integrations" as AppPage },
    { label: "Notes", title: "Knowledge", value: notes, delta: notes ? `+${Math.min(notes, 12)}` : "0", icon: <FileText className="h-7 w-7" />, page: "memory" as AppPage },
  ]

  const recentActivity = useMemo(() => {
    const githubActivity = repoItems.slice(0, 3).map((repo) => ({
      id: `github-${getRepoName(repo)}`,
      icon: <Github className="h-5 w-5" />,
      title: getRepoName(repo),
      subtitle: github?.last_sync_at ? `Updated ${formatRelativeDate(github.last_sync_at)}` : "Visible GitHub repository",
      badge: "Updated",
      page: "integrations" as AppPage,
    }))
    const notionActivity = notionItems.slice(0, 3).map((item) => ({
      id: `notion-${getItemTitle(item)}`,
      icon: <NotebookText className="h-5 w-5" />,
      title: getItemTitle(item),
      subtitle: notion?.last_sync_at ? `Synced ${formatRelativeDate(notion.last_sync_at)}` : readString(item.object, "Notion item"),
      badge: readString(item.object) === "database" ? "Database" : "Page",
      page: "integrations" as AppPage,
    }))
    const memoryActivity = memories.slice(0, 2).map((memory) => ({
      id: `memory-${memory.id}`,
      icon: <BookOpen className="h-5 w-5" />,
      title: getMemoryTitle(memory),
      subtitle: formatRelativeDate(memory.created_at),
      badge: "Memory",
      page: "memory" as AppPage,
    }))
    return [...githubActivity, ...notionActivity, ...memoryActivity].slice(0, MAX_ACTIVITY_ITEMS)
  }, [github?.last_sync_at, memories, notion?.last_sync_at, notionItems, repoItems])

  const insights = memories.slice(0, 4).map((memory) => ({
    id: memory.id,
    title: getMemoryTitle(memory),
    time: formatRelativeDate(memory.created_at),
  }))

  const healthValues = [
    projects.length,
    projects.length + conversations.length,
    conversations.length + memories.length,
    totalKnowledgeItems,
    totalKnowledgeItems + integrations.filter((item) => item.connected).length,
    totalKnowledgeItems + notes,
    totalKnowledgeItems + notes + conversations.length,
  ].map((value) => Math.max(value, 1))

  const suggestions = [
    repoItems.length ? { title: "Review Recent Repositories", text: `${repoItems.length} repositories are available`, prompt: "Summarize my GitHub repositories." } : { title: "Connect GitHub", text: "Repository context is not connected", prompt: "Help me connect GitHub." },
    notionItems.length ? { title: "Summarize Notion Workspace", text: `${notionItems.length} Notion items are visible`, prompt: "Use my Notion context and summarize my workspace structure." } : { title: "Connect Notion", text: "Workspace context is not connected", prompt: "Help me connect Notion." },
    conversations.length ? { title: "Continue Recent Chat", text: conversations[0]?.title || "Recent conversation ready", prompt: "Continue my latest conversation." } : { title: "Ask CEASER", text: "Start a focused workspace chat", prompt: "Help me plan today's work." },
    memories.length ? { title: "Search Memory", text: `${memories.length} memories available`, prompt: "Summarize my recent memory insights." } : { title: "Create Memory", text: "Save useful context from chat", prompt: "Create a memory for my current priorities." },
  ]

  return (
    <div className="min-h-full overflow-y-auto bg-[#020817] text-slate-100">
      <div className="mx-auto grid max-w-[1740px] gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="space-y-5">
          <section className="relative overflow-hidden rounded-3xl border border-cyan-300/10 bg-[#071323]/88 p-7 shadow-[0_30px_120px_rgba(15,23,42,.45)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_0%,rgba(124,58,237,.28),transparent_36%),radial-gradient(circle_at_82%_38%,rgba(14,165,233,.16),transparent_32%)]" />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.9)]" />
                    {getGreeting()}, {firstName}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Your AI. Your Projects. Your Edge.</h1>
                  <p className="mt-3 max-w-3xl text-sm text-slate-400">CEASER is processing, organizing and thinking ahead so you can focus on what matters.</p>
                </div>
                <button onClick={() => setCurrentPage("integrations")} className="rounded-2xl border border-cyan-300/10 bg-black/25 px-5 py-3 text-sm text-slate-200 shadow-inner transition hover:border-emerald-300/40">
                  <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-400" />
                  {allConnected ? "All Systems Active" : "Systems Ready"}
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
                {metricCards.map((card) => (
                  <button key={card.label} onClick={() => setCurrentPage(card.page)} className="group rounded-2xl border border-cyan-300/12 bg-[#07111f]/80 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,.05)] transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[#0a1a2d]">
                    <div className="mb-4 flex items-center justify-between text-slate-100">
                      <span className="text-slate-300">{card.icon}</span>
                      <span className="text-xs text-emerald-400">{card.delta}</span>
                    </div>
                    <p className="text-xs text-slate-400">{card.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{card.value}</p>
                    <p className="text-xs text-slate-500">{card.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[.86fr_1.14fr]">
            <Panel title="Recent Activity" action={<ViewAllButton page="integrations" />}>
              <div className="space-y-1 p-4">
                {isLoading && (
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[.03] p-4 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading live workspace activity...
                  </div>
                )}
                {!isLoading && recentActivity.length === 0 && (
                  <button onClick={() => setCurrentPage("integrations")} className="w-full rounded-xl border border-white/5 bg-white/[.03] p-4 text-left text-sm text-slate-400">
                    Connect GitHub or Notion to see workspace activity here.
                  </button>
                )}
                {recentActivity.map((item) => (
                  <button key={item.id} onClick={() => setCurrentPage(item.page)} className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-white/[.04]">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[.04] text-slate-200">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-100">{item.title}</span>
                      <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>
                    </span>
                    <span className="rounded-full border border-emerald-400/20 px-2 py-1 text-xs text-emerald-300">+ {item.badge}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <div className="space-y-5">
              <Panel title="Knowledge Overview">
                <div className="grid gap-6 p-5 md:grid-cols-[220px_1fr]">
                  <AnimatedKnowledgeDonut loading={isIntegrationRefreshing} total={totalKnowledgeItems} segments={knowledgeSegments} onClick={() => setCurrentPage("memory")} />
                  <div className="grid content-center gap-3">
                    {knowledgeSegments.map((segment) => (
                      <button key={segment.label} onClick={() => setCurrentPage(segment.page)} className="flex items-center justify-between rounded-xl px-2 py-1 text-left transition hover:bg-white/[.04]">
                        <span className="flex items-center gap-3 text-sm text-slate-300">
                          <span className="h-3 w-3 rounded" style={{ backgroundColor: segment.color }} />
                          {segment.label}
                        </span>
                        <span className="text-sm text-slate-400">
                          {segment.value} ({totalKnowledgeItems ? Math.round((segment.value / totalKnowledgeItems) * 100) : 0}%)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </Panel>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Connections" action={<ViewAllButton page="integrations" />}>
                  <div className="space-y-3 p-5">
                    {[
                      { name: "GitHub", icon: <GithubBrandLogo className="h-10 w-10" />, record: github },
                      { name: "Notion", icon: <NotionLogo className="h-10 w-10" />, record: notion },
                    ].map((item) => (
                      <button key={item.name} onClick={() => setCurrentPage("integrations")} className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/[.025] p-4 text-left transition hover:border-cyan-300/30">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-950">{item.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-white">{item.name}</span>
                          <span className={`block text-xs ${item.record?.connected ? "text-emerald-400" : "text-slate-500"}`}>{item.record?.connected ? "Connected" : "Not connected"}</span>
                          <span className="block text-xs text-slate-500">Last sync: {formatRelativeDate(item.record?.last_sync_at)}</span>
                        </span>
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </Panel>

                <Panel title="AI Suggestions">
                  <div className="grid gap-3 p-5 sm:grid-cols-2">
                    {suggestions.map((suggestion) => (
                      <button key={suggestion.title} onClick={() => startNewChatWithPrompt(suggestion.prompt)} className="rounded-2xl border border-white/5 bg-white/[.025] p-4 text-left transition hover:border-purple-300/35 hover:bg-white/[.05]">
                        <p className="text-sm font-semibold text-slate-100">{suggestion.title}</p>
                        <p className="mt-2 line-clamp-2 text-xs text-slate-400">{suggestion.text}</p>
                        <ChevronRight className="mt-3 h-4 w-4 text-blue-300" />
                      </button>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </div>

          <Panel title="Quick Actions">
            <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "Search Knowledge", icon: <Search className="h-5 w-5" />, action: () => setCurrentPage("memory") },
                { label: "Explain Repository", icon: <Github className="h-5 w-5" />, action: () => startNewChatWithPrompt("Explain my most active GitHub repository.") },
                { label: "Create Notes", icon: <NotebookText className="h-5 w-5" />, action: () => setCurrentPage("memory") },
                { label: "Generate Study Plan", icon: <CalendarDays className="h-5 w-5" />, action: () => startNewChatWithPrompt("Generate a study plan from my current workspace context.") },
                { label: "Summarize Commits", icon: <Code2 className="h-5 w-5" />, action: () => startNewChatWithPrompt("Summarize my recent GitHub commits.") },
                { label: "Ask CEASER", icon: <Sparkles className="h-5 w-5" />, action: () => setIsSearchOpen(true) },
              ].map((action) => (
                <button key={action.label} onClick={action.action} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/10 bg-[#091627] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-300/35 hover:bg-[#0c1d32]">
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </Panel>

          <p className="pb-2 text-center text-sm text-slate-500">
            <span className="text-cyan-400">Connecting knowledge.</span> Empowering ideas. Building the future.
          </p>
        </main>

        <aside className="space-y-4">
          <Panel title="Memory Insights" action={<ViewAllButton page="memory" />}>
            <div className="space-y-1 p-4">
              {isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />}
              {!isLoading && insights.length === 0 && <p className="rounded-xl border border-white/5 bg-white/[.03] p-4 text-sm text-slate-400">No memory insights yet.</p>}
              {insights.map((insight) => (
                <button key={insight.id} onClick={() => setCurrentPage("memory")} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/[.04]">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{insight.title}</span>
                    <span className="text-xs text-slate-500">{insight.time}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Recent Chats" action={<ViewAllButton page="chat" />}>
            <div className="space-y-1 p-4">
              {!isLoading && conversations.length === 0 && <p className="rounded-xl border border-white/5 bg-white/[.03] p-4 text-sm text-slate-400">No recent chats yet.</p>}
              {conversations.slice(0, 4).map((conversation) => (
                <button key={conversation.id} onClick={() => setCurrentPage("chat")} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/[.04]">
                  <MessageSquareText className="h-4 w-4 text-blue-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{conversation.title}</span>
                    <span className="text-xs text-slate-500">{formatRelativeDate(conversation.created_at)}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="System Health">
            <div className="space-y-3 p-5">
              {[
                { label: "Integrations", value: allConnected ? "All Connected" : `${integrations.filter((item) => item.connected).length} Connected`, icon: <ShieldCheck className="h-4 w-4" />, good: allConnected },
                { label: "Memory Usage", value: memories.length ? "Optimal" : "Ready", icon: <Layers3 className="h-4 w-4" />, good: true },
                { label: "Sync Status", value: integrations.some((item) => item.last_sync_at) ? "Up to date" : "Ready to sync", icon: <SquareCheckBig className="h-4 w-4" />, good: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">{row.icon}{row.label}</span>
                  <span className={row.good ? "text-emerald-400" : "text-amber-300"}>{row.value}</span>
                </div>
              ))}
              <Sparkline values={healthValues} />
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>24h</span>
                <span>12h</span>
                <span>Now</span>
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
