"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
}

type ToastContextValue = {
  toasts: Toast[]
  addToast: (t: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const toast = { id, ...t }
    setToasts((prev) => [...prev, toast])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
