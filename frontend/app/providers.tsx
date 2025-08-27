"use client"

import React from "react"
import { ToastProvider } from "@/components/ui/toast-provider"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  )
}
