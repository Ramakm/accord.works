"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { setPlan } from "@/lib/credits"

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    const markPro = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (user) {
        setPlan(user.id, 'pro')
      }
      setTimeout(() => router.replace('/dashboard'), 800)
    }
    markPro()
  }, [router])

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="card-padded-lg glass-card">
        <h1 className="text-2xl font-bold">Thank you!</h1>
        <p className="mt-2 text-sm text-brand-text-secondary">Your account has been upgraded. Redirecting…</p>
      </div>
    </div>
  )
}
