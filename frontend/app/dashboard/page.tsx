"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPlan, getCredits, consumeCredit, type Plan, PRO_CREDITS } from "@/lib/credits"
import Upload from "../upload/page"
import { useToast } from "@/components/ui/toast-provider"
import { Menu, X } from "lucide-react"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await getSupabase().auth.getUser()
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
    const onAnalysisComplete = () => {
      if (!userId) return
      // Don't deduct here. Only update recent list; credits are deducted at user actions.
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
    const onCreditsUpdated = () => {
      if (!userId) return
      setCreditsState(getCredits(userId))
    }
    window.addEventListener('contractai:analysis-complete', onAnalysisComplete)
    window.addEventListener('contractai:credits-updated', onCreditsUpdated)
    return () => {
      window.removeEventListener('contractai:analysis-complete', onAnalysisComplete)
      window.removeEventListener('contractai:credits-updated', onCreditsUpdated)
    }
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

  // Upgrade flow kept but not emphasized in UI (available within sidebar)
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
    await getSupabase().auth.signOut()
    router.replace("/signin")
  }

  if (loading) return <div>Loading…</div>

  const isPro = plan === 'pro'

  return (
    <div className="relative">
      {/* Sidebar overlay / drawer */}
      <div className={`fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl ring-1 ring-slate-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="font-semibold">Menu</div>
            <button onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" className="p-2 rounded hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-3 space-y-1 text-sm">
            <a className="block rounded px-3 py-2 bg-slate-100 font-medium" href="#">Dashboard</a>
            <a className="block rounded px-3 py-2 hover:bg-slate-50" href="#account">Profile & Account</a>
            <button className="block w-full text-left rounded px-3 py-2 hover:bg-slate-50" onClick={upgrade}>Billing / Upgrade Plan</button>
            <a className="block rounded px-3 py-2 hover:bg-slate-50" href="/support">Support / Help</a>
            <button className="block w-full text-left rounded px-3 py-2 hover:bg-slate-50" onClick={signOut}>Logout</button>
          </nav>
          <div className="mt-auto p-3 text-xs text-slate-500">
            <div>Plan: <span className="font-medium">{isPro ? 'Pro' : 'Free'}</span></div>
            <div>Credits: <span className="font-medium">{credits}</span></div>
          </div>
        </aside>
      </div>

      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-md border border-slate-200 hover:bg-white/60" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-slate-600">Welcome back{email ? `, ${email}` : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge>{isPro ? 'Pro' : 'Free'}</Badge>
          <Button variant="outline" onClick={signOut}>Sign out</Button>
        </div>
      </div>

      {/* Main focus: Upload */}
      <section id="upload" className="space-y-4">
        {credits <= 0 ? (
          <Card className="card-padded-lg">
            <CardHeader className="pb-2">
              <CardTitle>Out of credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-slate-600">You&apos;re out of credits. Upgrade to Pro to get {PRO_CREDITS} credits.</div>
                <Button className="btn-primary" onClick={upgrade}>Upgrade to Pro</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Upload />
        )}
      </section>

      {/* Optional: Recent uploads */}
      {recent.length > 0 && (
        <section id="recent" className="mt-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>Recent Analyses</CardTitle>
              <Button variant="ghost" onClick={() => {
                if (!userId) return
                localStorage.removeItem(`contractai:recent:${userId}`)
                setRecent([])
              }}>Clear</Button>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-200">
                {recent.map((r) => (
                  <li key={r.id} className="py-2 text-sm flex items-center justify-between">
                    <span>Analysis on {new Date(r.at).toLocaleString()}</span>
                    <span className="text-xs text-slate-500">#{r.id.slice(-6)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* FAQ is rendered by the Upload component below the upload card. */}
    </div>
  )
}
