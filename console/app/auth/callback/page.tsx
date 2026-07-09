"use client"

import { useEffect } from "react"
import { authApi } from "@/lib/api/auth"

export default function AuthCallbackPage() {
  useEffect(() => {
    try {
      authApi.consumeOAuthRedirect()
      window.location.replace("/")
    } catch {
      window.location.replace("/")
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="rounded-2xl border border-border/70 bg-card/80 px-6 py-5 text-center shadow-2xl">
        <p className="text-sm font-semibold">Signing you in...</p>
        <p className="mt-1 text-xs text-muted-foreground">Returning to CEASER.</p>
      </div>
    </main>
  )
}
