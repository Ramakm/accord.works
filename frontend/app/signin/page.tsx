"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-provider"
import { Github, Chrome } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"signin"|"signup">("signin")

  useEffect(() => {
    // If already signed in, go to dashboard
    const check = async () => {
      const { data } = await getSupabase().auth.getUser()
      if (data.user) router.replace("/dashboard")
    }
    check()
  }, [router, addToast])

  const submit = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      if (mode === "signup") {
        const { error } = await getSupabase().auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      addToast({ variant: "success", title: mode === "signup" ? "Account created" : "Signed in" })
      router.replace("/dashboard")
    } catch (e: any) {
      addToast({ variant: "error", title: "Authentication failed", description: e?.message || "" })
    } finally {
      setLoading(false)
    }
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true)
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : undefined
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: origin ? `${origin}/dashboard` : undefined,
        },
      })
      if (error) throw error
    } catch (e: any) {
      addToast({ variant: "error", title: "OAuth failed", description: e?.message || "" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="card-padded-lg">
        <CardHeader>
          <CardTitle>{mode === "signup" ? "Create your account" : "Sign in"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button className="btn-primary w-full" onClick={submit} disabled={loading}>
              {loading ? "Please wait…" : (mode === "signup" ? "Continue" : "Sign in")}
            </Button>
            <div className="my-4">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="shrink-0">or continue with</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" onClick={() => signInWithProvider('google')} disabled={loading}>
                <Chrome className="mr-2 h-4 w-4" /> Google
              </Button>
              <Button variant="outline" className="w-full" onClick={() => signInWithProvider('github')} disabled={loading}>
                <Github className="mr-2 h-4 w-4" /> GitHub
              </Button>
            </div>
            <div className="text-center text-sm text-slate-600">
              {mode === "signup" ? (
                <button className="underline" onClick={()=>setMode("signin")}>Have an account? Sign in</button>
              ) : (
                <button className="underline" onClick={()=>setMode("signup")}>No account? Sign up</button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
