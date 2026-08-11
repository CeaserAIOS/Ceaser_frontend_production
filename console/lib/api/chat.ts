import { apiRequest, apiStreamRequest, invalidateApiCache } from "./client"

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agentIds?: string[]
  conversation_id: string
  created_at: string
  metadata?: MessageMetadata
}

export interface ConversationRecord {
  id: string
  user_id: string
  title: string
  pinned: boolean
  archived: boolean
  created_at: string
}

export interface RankedMemory {
  id: string
  user_id: string
  memory_type: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
  score: number
}

export interface CeaserChatResponse {
  scope: string
  conversation_id?: string | null
  selected_agents: string[]
  contributions: AgentContribution[]
  contribution_summary: string
  memories_used: RankedMemory[]
  research?: ResearchResult | null
  workflow?: WorkflowResult | null
  context_summary: Record<string, unknown>
  suggestions?: SuggestionItem[]
  response: string
}

export interface MessageMetadata {
  scope?: string
  selected_agents?: string[]
  contributions?: AgentContribution[]
  contribution_summary?: string
  memories_used?: RankedMemory[]
  research?: ResearchResult | null
  workflow?: WorkflowResult | null
  context_summary?: Record<string, unknown>
  suggestions?: SuggestionItem[]
}

export interface SuggestionItem {
  text: string
  action_type: string
  category: string
  confidence: number
}

export interface WorkflowResult {
  id: string
  type: string
  status: string
  steps: WorkflowStep[]
  summary: string
}

export interface WorkflowStep {
  id: string
  agent_name: string
  status: string
  output_summary?: string | null
  started_at?: string | null
  completed_at?: string | null
}

export interface AgentContribution {
  agent: string
  domain: string
  analysis: string
  recommendations: string[]
  frameworks_used: string[]
  confidence: number
}

export interface ResearchSource {
  title: string
  url: string
  source: string
  snippet: string
  excerpt?: string | null
  publisher?: string | null
  retrieved_at?: string | null
  image_url?: string | null
  score: number
}

export interface ResearchImage {
  title: string
  url: string
  image_url: string
  source: string
}

export interface ResearchResult {
  query: string
  summary: string
  key_findings: string[]
  sources: ResearchSource[]
  citations: { title: string; url: string }[]
  images?: ResearchImage[]
}

export const chatApi = {
  listConversations: (archived = false) => {
    const params = new URLSearchParams()
    if (archived) params.set("archived", "true")
    const query = params.toString() ? `?${params.toString()}` : ""
    return apiRequest<ConversationRecord[]>(`/conversations${query}`, { cacheTtlMs: 300000 })
  },
  createConversation: (title?: string) =>
    apiRequest<ConversationRecord>("/conversations", {
      method: "POST",
      body: { title },
    }).then((response) => {
      invalidateApiCache(["/conversations", "/chat/conversations"])
      return response
    }),
  updateConversation: (conversationId: string, updates: Partial<Pick<ConversationRecord, "title" | "pinned" | "archived">>) =>
    apiRequest<ConversationRecord>(`/conversations/${conversationId}`, {
      method: "PATCH",
      body: updates,
    }).then((response) => {
      invalidateApiCache([`/conversations/${conversationId}`, "/conversations", `/chat/conversations/${conversationId}/messages`])
      return response
    }),
  deleteConversation: (conversationId: string) =>
    apiRequest<void>(`/conversations/${conversationId}`, {
      method: "DELETE",
    }).then((response) => {
      invalidateApiCache([`/conversations/${conversationId}`, "/conversations", `/chat/conversations/${conversationId}/messages`])
      return response
    }),
  listMessages: (conversationId: string, limit = 60) =>
    apiRequest<ChatMessage[]>(`/chat/conversations/${conversationId}/messages?limit=${limit}`, { cacheTtlMs: 300000 }),
  sendMessage: (conversationId: string, content: string, role: "user" | "assistant" | "system" = "user", metadata: Record<string, unknown> = {}) =>
    apiRequest<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      body: { content, role, metadata },
    }).then((response) => {
      invalidateApiCache(["/conversations", `/chat/conversations/${conversationId}/messages`])
      return response
    }),
  sendCeaserMessage: (message: string, conversationId?: string, fileIds?: string[]) =>
    apiRequest<CeaserChatResponse>("/ceaser/chat", {
      method: "POST",
      body: {
        message,
        conversation_id: conversationId,
        file_ids: fileIds ?? [],
      },
    }).then((response) => {
      invalidateApiCache(["/conversations", conversationId ? `/chat/conversations/${conversationId}/messages` : "/chat/conversations"])
      return response
    }),
  sendCeaserMessageStream: (
    message: string,
    conversationId: string | undefined,
    fileIds: string[] | undefined,
    handlers: {
      onStatus?: (payload: Record<string, unknown>) => void
      onToken?: (text: string) => void
      onComplete?: (response: CeaserChatResponse) => void
      onError?: (message: string) => void
    },
    options?: { signal?: AbortSignal },
  ) =>
    apiStreamRequest(
      "/ceaser/chat/stream",
      {
        method: "POST",
        signal: options?.signal,
        body: {
          message,
          conversation_id: conversationId,
          file_ids: fileIds ?? [],
        },
      },
      {
        onStatus: handlers.onStatus,
        onToken: handlers.onToken,
        onComplete: (payload) => handlers.onComplete?.(payload as unknown as CeaserChatResponse),
        onError: handlers.onError,
      },
    ),
}
