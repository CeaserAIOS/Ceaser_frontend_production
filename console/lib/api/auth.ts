import { apiRequest } from "./client"
import { clearAuthTokens, setAuthTokens } from "./client"

export interface AuthSession {
  id?: string
  userId?: string
  email?: string
  access_token?: string
  refresh_token?: string
  user?: {
    id?: string
    email?: string
    name?: string | null
  } | null
}

export const authApi = {
  isDesktopLinkRequest: () => {
    if (typeof window === "undefined") return false
    const params = new URLSearchParams(window.location.search)
    return window.location.protocol === "ceaser-app:" || params.get("desktop_link") === "1" || params.get("desktop") === "1"
  },
  completeDesktopLink: (session?: { access_token?: string | null; refresh_token?: string | null } | null) => {
    if (typeof window === "undefined" || !session?.access_token) return false
    const params = new URLSearchParams(window.location.search)
    params.delete("desktop_link")
    const target = `/console/auth/desktop/${params.toString() ? `?${params.toString()}` : ""}`
    window.location.replace(target)
    return true
  },
  consumeOAuthRedirect: () => {
    if (typeof window === "undefined") return null
    const rawHash = window.location.hash.replace(/^#\/?/, "")
    const params = new URLSearchParams(rawHash)
    const accessToken = params.get("access_token")
    const refreshToken = params.get("refresh_token")
    const error = params.get("error_description") || params.get("error")
    if (error) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
      throw new Error(error)
    }
    if (!accessToken) return null
    setAuthTokens(accessToken, refreshToken)
    window.history.replaceState(null, "", window.location.pathname + window.location.search)
    return { access_token: accessToken, refresh_token: refreshToken }
  },
  signInWithGoogle: () => {
    const runtimeConfig = typeof window !== "undefined" ? (window as any).CEASER_CONFIG : undefined
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || runtimeConfig?.SUPABASE_URL || "https://rrfqqgxhmimffrcckxay.supabase.co"
    if (!supabaseUrl || typeof window === "undefined") {
      throw new Error("Google login is not configured.")
    }
    const isDesktop = authApi.isDesktopLinkRequest()
    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname)
    const appUrl = (isLocalhost
      ? `${window.location.origin}/console`
      : process.env.NEXT_PUBLIC_APP_URL || `${window.location.origin}/console`
    ).replace(/\/$/, "")
    const callbackUrl = isDesktop
      ? `${appUrl}/auth/callback/?desktop_link=1`
      : `${appUrl}/auth/callback/`
    const redirectTo = encodeURIComponent(callbackUrl)
    window.location.href = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
  },
  signup: async (email: string, password: string) => {
    clearAuthTokens()
    const session = await apiRequest<AuthSession>("/auth/signup", { method: "POST", body: { email, password } })
    setAuthTokens(session.access_token, session.refresh_token)
    return session
  },
  login: async (email: string, password: string) => {
    clearAuthTokens()
    const session = await apiRequest<AuthSession>("/auth/login", { method: "POST", body: { email, password } })
    setAuthTokens(session.access_token, session.refresh_token)
    return session
  },
  getSession: () => apiRequest<AuthSession>("/auth/session"),
  getCurrentUser: () => apiRequest<AuthSession>("/auth/me"),
  signOut: async () => {
    await apiRequest<void>("/auth/sign-out", { method: "POST" })
    clearAuthTokens()
  },
  recoverPassword: (email: string, redirect_to?: string) =>
    apiRequest<{ status: string; message: string }>("/auth/password/recover", {
      method: "POST",
      body: { email, redirect_to },
    }),
  updatePassword: (currentPassword: string, password: string) =>
    apiRequest<{ status: string; message: string }>("/auth/password/update", {
      method: "POST",
      body: { current_password: currentPassword, password },
    }),
  verifyPassword: (password: string) =>
    apiRequest<{ status: string; message: string }>("/auth/password/verify", {
      method: "POST",
      body: { password },
    }),
  resendVerification: (email: string) =>
    apiRequest<{ status: string; message: string }>("/auth/email/resend-verification", {
      method: "POST",
      body: { email, type: "signup" },
    }),
  enrollMfa: (friendly_name = "CEASER Authenticator") =>
    apiRequest<Record<string, unknown>>("/auth/mfa/enroll", {
      method: "POST",
      body: { friendly_name },
    }),
  listMfaFactors: () => apiRequest<Record<string, unknown>>("/auth/mfa/factors"),
  challengeMfa: (factor_id: string) =>
    apiRequest<Record<string, unknown>>("/auth/mfa/challenge", {
      method: "POST",
      body: { factor_id },
    }),
  verifyMfa: (factor_id: string, challenge_id: string, code: string) =>
    apiRequest<Record<string, unknown>>("/auth/mfa/verify", {
      method: "POST",
      body: { factor_id, challenge_id, code },
    }),
  unenrollMfa: (factor_id: string) =>
    apiRequest<Record<string, unknown>>("/auth/mfa/unenroll", {
      method: "POST",
      body: { factor_id },
    }),
}
