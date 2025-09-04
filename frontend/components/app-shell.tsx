"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
// Dark mode removed

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-site-gradient text-slate-900">
        <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:py-10">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-site-gradient text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-brand-primary" />
            <span className="text-[15px] font-semibold tracking-tight">AccordWorks</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            <a href="/#features" className="nav-link">Features</a>
            <a href="/#pricing" className="nav-link">Pricing</a>
            <a href="/#testimonials" className="nav-link">Testimonials</a>
            <a href="/#how" className="nav-link">How it Works</a>
            <a href="/signin" className="ml-2 btn-primary">Try Free</a>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
        {children}
      </main>
      <footer id="contact" className="mt-16 border-t border-slate-200 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-[1200px] px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-brand-primary" />
                <span className="text-base font-semibold">AccordWorks</span>
              </div>
              <p className="mt-3 max-w-md text-sm text-slate-600">Understand contracts in seconds, not hours. AI summaries, clause extraction, risk detection, and drafting.</p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:justify-items-end">
              <div>
                <div className="text-sm font-semibold">Explore</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li><a className="hover:text-slate-900" href="/#features">Features</a></li>
                  <li><a className="hover:text-slate-900" href="/#pricing">Pricing</a></li>
                  <li><a className="hover:text-slate-900" href="/#how">How it Works</a></li>
                  <li><a className="hover:text-slate-900" href="/support">Support</a></li>
                  <li><a className="hover:text-slate-900" href="/privacy">Privacy</a></li>
                  <li><a className="hover:text-slate-900" href="/terms">Terms</a></li>
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold">Get in touch</div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li><a className="hover:text-slate-900" href="mailto:hello@clausewise.ai">hello@clausewise.ai</a></li>
                  <li><a className="hover:text-slate-900" href="/signin">Try Free</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 text-center text-xs text-slate-500">© 2025 AccordWorks. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
