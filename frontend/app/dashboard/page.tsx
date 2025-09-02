"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { setPlan, getPlan, getCredits, consumeCredit, setCredits, type Plan, PRO_CREDITS } from "@/lib/credits"
import Upload from "../upload/page"
import { useToast } from "@/components/ui/toast-provider"

export default function DashboardPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [name] = useState<string>("")
  const [plan, setPlanState] = useState<Plan>('free')
  const [credits, setCreditsState] = useState<number>(0)
  const [recent, setRecent] = useState<Array<{ id: string; at: number }>>([])

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
      try {
        const raw = localStorage.getItem(`contractai:recent:${u.id}`)
        if (raw) setRecent(JSON.parse(raw))
      } catch {}
      // Show upgrade success toast if coming back from payment
      try {
        const flag = localStorage.getItem('contractai:upgrade-success')
        if (flag === '1') {
          addToast({ variant: 'success', title: 'Upgrade successful', description: `Your plan is now Pro with ${PRO_CREDITS} credits.` })
          localStorage.removeItem('contractai:upgrade-success')
          // refresh plan/credits in case they changed during thank-you
          setPlanState(getPlan(u.id))
          setCreditsState(getCredits(u.id))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [router, addToast])

  useEffect(() => {
    const handler = () => {
      if (!userId) return
      consumeCredit(userId)
      setCreditsState(getCredits(userId))
      // Add a lightweight recent analysis record
      try {
        const entry = { id: `${Date.now()}`, at: Date.now() }
        const key = `contractai:recent:${userId}`
        const raw = localStorage.getItem(key)
        const arr: Array<{ id: string; at: number }> = raw ? JSON.parse(raw) : []
        const next = [entry, ...arr].slice(0, 10)
        localStorage.setItem(key, JSON.stringify(next))
        setRecent(next)
      } catch {}
    }
    window.addEventListener('contractai:analysis-complete', handler)
    return () => window.removeEventListener('contractai:analysis-complete', handler)
  }, [userId])

  // Consume credit for prompts as well
  useEffect(() => {
    const onPrompt = () => {
      if (!userId) return
      consumeCredit(userId)
      setCreditsState(getCredits(userId))
    }
    window.addEventListener('contractai:prompt-used', onPrompt)
    return () => window.removeEventListener('contractai:prompt-used', onPrompt)
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
      addToast({ variant: 'error', title: 'Checkout unavailable', description: 'Unable to start checkout. Please try again later.' })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace("/signin")
  }

  if (loading) return <div>Loading…</div>

  const isPro = plan === 'pro'

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:block">
        <nav className="sticky top-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-slate-500">Overview</div>
          <a className="block rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="#">Dashboard</a>
          <div className="text-xs uppercase tracking-wide text-slate-500 mt-4">Work</div>
          <a className="block rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="#upload">Upload</a>
          <a className="block rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="#recent">Recent</a>
          <div className="text-xs uppercase tracking-wide text-slate-500 mt-4">Account</div>
          <a className="block rounded px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" href="#account">Settings</a>
        </nav>
      </aside>

      {/* Main content */}
      <section className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-slate-600 dark:text-slate-300">Welcome back{email ? `, ${email}` : ''}</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge>{isPro ? 'Pro' : 'Free'}</Badge>
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        </div>

        {/* Stat cards */}
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
              <div className="text-slate-600 dark:text-slate-300">Credits remaining: {credits}</div>
              {isPro && (
                <div className="text-xs text-slate-500">Pro includes {PRO_CREDITS} credits.</div>
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
        <div id="upload">
          {credits <= 0 ? (
            <Card className="card-padded-lg">
              <CardHeader className="pb-2">
                <CardTitle>Out of credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-600 dark:text-slate-300">You&apos;re out of credits. Upgrade to Pro to get {PRO_CREDITS} credits.</div>
                  <Button className="btn-primary" onClick={upgrade}>Upgrade to Pro</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Upload />
          )}
        </div>

        {/* Recent Analyses */}
        <div id="recent">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>Recent Analyses</CardTitle>
              {recent.length > 0 && (
                <Button variant="ghost" onClick={() => {
                  if (!userId) return
                  localStorage.removeItem(`contractai:recent:${userId}`)
                  setRecent([])
                }}>Clear</Button>
              )}
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">No analyses yet. Upload a contract to get started.</div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {recent.map((r) => (
                    <li key={r.id} className="py-2 text-sm flex items-center justify-between">
                      <span>Analysis on {new Date(r.at).toLocaleString()}</span>
                      <span className="text-xs text-slate-500">#{r.id.slice(-6)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
