"use client"

import { useToast } from "./toast-provider"

export function Toaster() {
  const { toasts, removeToast } = useToast()
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`pointer-events-auto cursor-pointer rounded-lg border px-4 py-3 shadow-lg transition hover:opacity-95 dark:border-slate-700 ${
            t.variant === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-200"
              : t.variant === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-200"
              : "border-slate-200 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          }`}
        >
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
