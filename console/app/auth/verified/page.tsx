"use client"

import { useEffect } from "react"
import { CircleCheck, ArrowRight } from "lucide-react"

export default function VerifiedPage() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-lg rounded-[2rem] border border-border/70 bg-card/90 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
          <CircleCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">You are verified</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your email has been verified successfully. Return to CEASER and sign in to continue.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const origin = window.location.origin
              window.location.assign(`${origin}/console/`)
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Go back and sign in
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
