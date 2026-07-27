"use client"

import { useEffect, useRef, useState } from "react"
import { useApp } from "@/lib/app-context"
import { agents, type Agent } from "@/lib/data"
import { getUserDisplayName, readUserProfile } from "@/lib/user-profile"
import { useAgentStore } from "@/lib/stores/agent-store"
import { chatApi, type ConversationRecord } from "@/lib/api/chat"
import { memoryApi, type MemoryRecord } from "@/lib/api/memory"
import { projectsApi, type ProjectRecord } from "@/lib/api/projects"
import { AgentAvatar } from "../agent-avatar"
import { GlowCard, StatCard } from "../glow-card"
import { OrbitalVisualization } from "../orbital-visualization"
import { motion } from "framer-motion"
import { 
  Play, 
  FolderKanban, 
  CheckSquare, 
  Target, 
  Users,
  FileText,
  Loader2,
  Search
} from "lucide-react"

function getMemoryTitle(memory: MemoryRecord) {
  const metadata = (memory.metadata ?? memory.extra_metadata ?? {}) as { title?: string }
  return metadata.title || memory.content.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 72) || "Memory"
}

function getMemoryDescription(memory: MemoryRecord) {
  const date = memory.created_at ? new Date(memory.created_at) : null
  const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "recently"
  return `${memory.memory_type} memory saved ${dateLabel}`
}

export function MissionControl() {
  const { selectedAgentId, setSelectedAgentId, setCurrentPage, setIsVoiceModalOpen } = useApp()
  const { isAgentEnabled } = useAgentStore()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [isRailLoading, setIsRailLoading] = useState(true)
  const [openingAgentId, setOpeningAgentId] = useState<string | null>(null)
  const openAgentTimerRef = useRef<number | null>(null)
  
  const activeAgents = agents.filter((agent) => agent.status === "active" && isAgentEnabled(agent.id))
  const enabledAgentsCount = agents.filter((agent) => isAgentEnabled(agent.id)).length
  useEffect(() => {
    let mounted = true
    async function loadMissionData() {
      setIsRailLoading(true)
      const [projectResult, memoryResult, conversationResult] = await Promise.allSettled([
        projectsApi.list(),
        memoryApi.list(),
        chatApi.listConversations(false),
      ])
      if (!mounted) return
      if (projectResult.status === "fulfilled") setProjects(projectResult.value)
      if (memoryResult.status === "fulfilled") setMemories(memoryResult.value)
      if (conversationResult.status === "fulfilled") setConversations(conversationResult.value)
      setIsRailLoading(false)
    }
    void loadMissionData()
    return () => {
      mounted = false
    }
  }, [])

  const handleAgentClick = (agent: Agent) => {
    if (openAgentTimerRef.current) {
      window.clearTimeout(openAgentTimerRef.current)
    }
    setSelectedAgentId(agent.id)
    setOpeningAgentId(agent.id)
    openAgentTimerRef.current = window.setTimeout(() => {
      setCurrentPage("agents")
      setOpeningAgentId(null)
    }, 180)
  }

  useEffect(() => {
    return () => {
      if (openAgentTimerRef.current) {
        window.clearTimeout(openAgentTimerRef.current)
      }
    }
  }, [])

  const stats = {
    projects: projects.length,
    tasks: conversations.length,
    goals: memories.filter((memory) => memory.memory_type === "goal").length || conversations.length,
    agentsActive: activeAgents.length,
    agentsTotal: enabledAgentsCount
  }

  return (
    <div className="flex h-full spatial-shell">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="spatial-panel-elevated mb-7 rounded-3xl p-6">
          <p className="text-sm text-muted-foreground">Mission Control / {getUserDisplayName(readUserProfile())}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your AI workforce is operational.</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Agents, memory, files, and workflows are arranged as one live operating layer.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Listen to Briefing Button */}
            <button 
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-[0_0_24px_rgba(79,140,255,0.12)] transition-colors hover:bg-primary/20"
            >
              <Play className="h-4 w-4" />
              Listen to Briefing
            </button>

            {/* Stats Grid */}
            <GlowCard>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setCurrentPage("projects")} className="text-left">
                  <StatCard
                    icon={<FolderKanban className="h-5 w-5 text-primary" />}
                    label="Projects"
                    value={stats.projects}
                  />
                </button>
                <button onClick={() => setCurrentPage("mission-control")} className="text-left">
                  <StatCard
                    icon={<CheckSquare className="h-5 w-5 text-primary" />}
                    label="Tasks"
                    value={stats.tasks}
                  />
                </button>
                <button onClick={() => setCurrentPage("memory")} className="text-left">
                  <StatCard
                    icon={<Target className="h-5 w-5 text-primary" />}
                    label="Goal Memories"
                    value={stats.goals}
                  />
                </button>
                <button onClick={() => setCurrentPage("agents")} className="text-left">
                  <StatCard
                    icon={<Users className="h-5 w-5 text-primary" />}
                    label="Agents Active"
                    value={`${stats.agentsActive}/${stats.agentsTotal}`}
                  />
                </button>
              </div>
            </GlowCard>

            {/* Active Agents Section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Active Agents
                </h2>
                <button 
                  onClick={() => setCurrentPage("agents")}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeAgents.slice(0, 4).map((agent) => {
                  return (
                    <GlowCard 
                      key={agent.id} 
                      hover 
                      glowColor={agent.color}
                      onClick={() => handleAgentClick(agent)}
                    >
                      <div className="flex items-start gap-3">
                        <AgentAvatar agent={agent} size="lg" showStatus showGlow enabled={isAgentEnabled(agent.id)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{agent.name}</p>
                            <span className="text-xs text-emerald-500">Active</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {agent.currentTask}
                          </p>
                        </div>
                      </div>
                    </GlowCard>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Orbital Visualization */}
          <div className="relative min-h-[400px]">
            <OrbitalVisualization
              className="h-full w-full"
              selectedAgentId={selectedAgentId}
              onAgentClick={handleAgentClick}
            />
            {openingAgentId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center"
              >
                {(() => {
                  const popupAgent = agents.find((agent) => agent.id === openingAgentId)
                  if (!popupAgent) return null
                  return (
                    <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-[#0b1224]/92 px-6 py-5 shadow-[0_30px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl">
                      <AgentAvatar agent={popupAgent} size="lg" showStatus showGlow enabled={isAgentEnabled(popupAgent.id)} />
                      <div className="text-center">
                        <p className="text-sm font-semibold">{popupAgent.name}</p>
                        <p className="text-xs text-muted-foreground">Opening agent screen...</p>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="spatial-panel m-4 ml-0 hidden max-h-[calc(100vh-2rem)] w-80 flex-shrink-0 overflow-y-auto rounded-3xl p-4 xl:block">
        {/* Memory Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Memory
            </h2>
            <button 
              onClick={() => setCurrentPage("memory")}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {isRailLoading && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading live memory...
              </div>
            )}
            {!isRailLoading && memories.slice(0, 4).map((memory) => (
              <button 
                key={memory.id} 
                onClick={() => setCurrentPage("memory")}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50">
                  {memory.memory_type === "goal" && <Target className="h-5 w-5 text-primary" />}
                  {memory.memory_type === "conversation" && <Users className="h-5 w-5 text-muted-foreground" />}
                  {memory.memory_type === "file" && <FileText className="h-5 w-5 text-muted-foreground" />}
                  {memory.memory_type === "research" && <Search className="h-5 w-5 text-muted-foreground" />}
                  {!["goal", "conversation", "file", "research"].includes(memory.memory_type) && (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-sm font-medium">{getMemoryTitle(memory)}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{getMemoryDescription(memory)}</p>
                </div>
              </button>
            ))}
            {!isRailLoading && memories.length === 0 && (
              <button onClick={() => setCurrentPage("memory")} className="w-full rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm text-muted-foreground transition hover:bg-secondary/70">
                No memories yet. Create one from chat or the Memory screen.
              </button>
            )}
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Recent Projects
            </h2>
            <button 
              onClick={() => setCurrentPage("projects")}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 4).map((project) => (
              <button 
                key={project.id}
                onClick={() => setCurrentPage("projects")}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/50"
              >
                <FolderKanban className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 text-sm font-medium">{project.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{project.status}</p>
                </div>
                <span className="text-xs text-primary whitespace-nowrap">
                  {project.updated_at ? new Date(project.updated_at).toLocaleDateString([], { month: "short", day: "numeric" }) : "Project"}
                </span>
              </button>
            ))}
            {!isRailLoading && projects.length === 0 && (
              <button onClick={() => setCurrentPage("projects")} className="w-full rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm text-muted-foreground transition hover:bg-secondary/70">
                No projects yet. Create one to organize your work.
              </button>
            )}
          </div>
        </div>

        {/* Recent Chats Section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Recent Chats
            </h2>
            <button 
              onClick={() => setCurrentPage("chat")}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {conversations.slice(0, 3).map((conversation) => (
              <button 
                key={conversation.id}
                onClick={() => setCurrentPage("chat")} 
                className="flex w-full items-start gap-3 rounded-lg bg-secondary/30 p-3 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 font-medium">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {conversation.created_at ? new Date(conversation.created_at).toLocaleDateString([], { month: "short", day: "numeric" }) : "recently"}
                  </p>
                </div>
              </button>
            ))}
            {!isRailLoading && conversations.length === 0 && (
              <button onClick={() => setCurrentPage("chat")} className="w-full rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm text-muted-foreground transition hover:bg-secondary/70">
                No chats yet. Start a conversation with CEASER.
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}












