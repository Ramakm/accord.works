import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeToggle } from '@/components/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ContractAI — Understand Contracts in Seconds',
  description: 'ContractAI uses AI to summarize, extract clauses, highlight risks, and draft responses — saving you time and money.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-site-gradient text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        <Providers>
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4">
              <a href="/" className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-brand-primary" />
                <span className="text-[15px] font-semibold tracking-tight">ContractAI</span>
              </a>
              <div className="hidden items-center gap-1 md:flex">
                <a href="/#features" className="nav-link">Features</a>
                <a href="/#pricing" className="nav-link">Pricing</a>
                <a href="/#testimonials" className="nav-link">Testimonials</a>
                <a href="/#how" className="nav-link">How it Works</a>
                <a href="/upload" className="ml-2 btn-primary">Try Free</a>
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
            {children}
          </main>
          <footer id="contact" className="mt-16 border-t border-slate-200 bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mx-auto max-w-[1200px] px-4 py-12">
              <div className="grid gap-10 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded bg-brand-primary" />
                    <span className="text-base font-semibold">ContractAI</span>
                  </div>
                  <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-300">Understand contracts in seconds, not hours. AI summaries, clause extraction, risk detection, and drafting.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:justify-items-end">
                  <div>
                    <div className="text-sm font-semibold">Explore</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/#features">Features</a></li>
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/#pricing">Pricing</a></li>
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/#how">How it Works</a></li>
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/support">Support</a></li>
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/privacy">Privacy</a></li>
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/terms">Terms</a></li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Get in touch</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="mailto:hello@clausewise.ai">hello@clausewise.ai</a></li>
                      <li><a className="hover:text-slate-900 dark:hover:text-white" href="/upload">Try Free</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-10 text-center text-xs text-slate-500">© 2025 ContractAI. All rights reserved.</div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}

