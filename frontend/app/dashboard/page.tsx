"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { setPlan, getPlan, getCredits, consumeCredit, setCredits, type Plan } from "@/lib/credits"
import UploadPage from "../upload/page"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [name] = useState<string>("")
  const [plan, setPlanState] = useState<Plan>('free')
  const [credits, setCreditsState] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      if (!u) {
        router.replace("/signin")
        return
      }
      setUserId(u.id)
      setEmail(u.email || "")
      // Initialize state from localStorage
      setPlanState(getPlan(u.id))
      setCreditsState(getCredits(u.id))
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    const handler = () => {
      if (!userId) return
      consumeCredit(userId)
      setCreditsState(getCredits(userId))
    }
    window.addEventListener('contractai:analysis-complete', handler)
    return () => window.removeEventListener('contractai:analysis-complete', handler)
  }, [userId])

  // Reflect changes from other tabs/windows (storage) or potential in-app changes to plan/credits
  useEffect(() => {
    const onStorage = () => {
      if (!userId) return
      setPlanState(getPlan(userId))
      setCreditsState(getCredits(userId))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [userId])

  const upgrade = async () => {
    if (!userId) return
    try {
      const redirectUrl = `${window.location.origin}/thank-you`
      const params = new URLSearchParams()
      if (email) params.set('email', email)
      params.set('redirect_url', redirectUrl)
      const res = await fetch(`/api/payments/pro/link?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to get payment link')
      const data = await res.json()
      const link = data.paymentLink
      if (!link) throw new Error('Missing payment link')
      window.location.href = link
    } catch (e) {
      alert('Unable to start checkout. Please try again later.')
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace("/signin")
  }

  if (loading) return <div>Loading…</div>

  const isPro = plan === 'pro'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><span className="font-semibold">Name:</span> {name || '—'}</div>
            <div><span className="font-semibold">Email:</span> {email}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Plan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Badge>{isPro ? 'Pro' : 'Free'}</Badge>
            </div>
            {!isPro && (
              <div className="text-slate-600 dark:text-slate-300">You have {credits} free analysis left.</div>
            )}
            {isPro && (
              <div className="text-slate-600 dark:text-slate-300">Unlimited analyses.</div>
            )}
            {!isPro && (
              <Button className="btn-primary mt-2" onClick={upgrade}>Upgrade to Pro</Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Use the uploader below to analyze your contract.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      {!isPro && credits <= 0 ? (
        <Card className="card-padded-lg">
          <CardHeader className="pb-2">
            <CardTitle>Out of credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-300">You&amp;apos;ve used your free analysis. Upgrade for unlimited usage.</div>
              <Button className="btn-primary" onClick={upgrade}>Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <UploadPage />
      )}
    </div>
  )
}
