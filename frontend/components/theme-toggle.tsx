"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains("dark")
    setDark(isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {}
  }

  useEffect(() => {
    // Load stored preference on mount
    try {
      const saved = localStorage.getItem("theme")
      if (saved === "dark") {
        document.documentElement.classList.add("dark")
        setDark(true)
      }
    } catch {}
  }, [])

  if (!mounted) return null

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggle}
      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="ml-2 hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </button>
  )
}
