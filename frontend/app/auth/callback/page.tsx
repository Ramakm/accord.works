"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabaseClient"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Initialize Supabase client; this will parse the URL hash and store the session if present
    const supabase = getSupabase()
    const handle = async () => {
      try {
        // Trigger a user fetch to ensure session is available after hash parsing
        await supabase.auth.getUser()
      } catch {
        // ignore
      } finally {
        router.replace("/dashboard")
      }
    }
    handle()
  }, [router])

  return <div>Signing you in…</div>
}
