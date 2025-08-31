"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast-provider"

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
      const { data } = await supabase.auth.getUser()
      if (data.user) router.replace("/dashboard")
    }
    check()
  }, [router])

  const submit = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
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

  return (
    <div className="mx-auto max-w-md">
      <Card className="card-padded-lg">
        <CardHeader>
          <CardTitle>{mode === "signup" ? "Create your account" : "Sign in"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button className="btn-primary w-full" onClick={submit} disabled={loading}>
              {loading ? "Please wait…" : (mode === "signup" ? "Continue" : "Sign in")}
            </Button>
            <div className="text-center text-sm text-slate-600 dark:text-slate-300">
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
