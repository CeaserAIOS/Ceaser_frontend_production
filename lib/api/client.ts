type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_CEASER_API_URL ??
  "https://ceaser-backend-production.onrender.com"

const ACCESS_TOKEN_KEY = "ceaser_access_token"
const REFRESH_TOKEN_KEY = "ceaser_refresh_token"
let refreshPromise: Promise<string | null> | null = null

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(accessToken?: string | null, refreshToken?: string | null) {
  if (typeof window === "undefined") return
  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(10000),
    })
      .then(async (response) => {
        if (!response.ok) return null
        const session = await response.json()
        setAuthTokens(session.access_token, session.refresh_token)
        return session.access_token || null
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function shouldRefresh(path: string) {
  return !["/auth/login", "/auth/signup", "/auth/refresh", "/auth/password/recover", "/auth/email/resend-verification"].some(
    (authPath) => path.startsWith(authPath),
  )
}

async function request<T>(path: string, options: RequestOptions, accessToken: string | null): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    signal: options.signal ?? (path.startsWith("/auth/") ? AbortSignal.timeout(10000) : undefined),
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const accessToken = getAccessToken()
  let response = await request<T>(path, options, accessToken)

  if (response.status === 401 && shouldRefresh(path)) {
    const refreshedToken = await refreshAccessToken()
    if (refreshedToken) {
      response = await request<T>(path, options, refreshedToken)
    }
  }

  if (!response.ok) {
    let message = `CEASER API request failed: ${path}`
    try {
      const payload = await response.json()
      if (payload?.detail) message = typeof payload.detail === "string" ? payload.detail : JSON.stringify(payload.detail)
    } catch {
      // Keep default message when the API does not return JSON.
    }
    if (response.status === 401) {
      clearAuthTokens()
      if (typeof window !== "undefined" && !path.startsWith("/auth/")) {
        window.dispatchEvent(new CustomEvent("ceaser:session-expired"))
      }
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
