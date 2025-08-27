import * as React from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, color = "slate", ...props }: React.HTMLAttributes<HTMLSpanElement> & { color?: "red"|"yellow"|"green"|"slate" }) {
  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    slate: "bg-slate-100 text-slate-800",
  }
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-medium", colorMap[color], className)} {...props} />
  )
}
