import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeToggle } from '@/components/theme-toggle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Contract AI - Smart Contract Analysis',
  description: 'AI-powered contract analysis, risk detection, and negotiation assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-white to-indigo-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100`}>
        <Providers>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3">
            <a href="#hero" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-indigo-600 shadow-sm" />
              <span className="text-lg font-semibold tracking-tight">Contract AI</span>
            </a>
            <div className="hidden items-center gap-2 sm:flex">
              <a href="#features" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Features</a>
              <a href="#pricing" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Pricing</a>
              <a href="#contact" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Contact</a>
              <a href="#upload" className="ml-1 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">Try Now</a>
              <ThemeToggle />
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-[1200px] px-4 py-8">
          {children}
        </main>
        <footer id="contact" className="mt-16 bg-slate-900 text-slate-200 dark:bg-slate-950 dark:text-slate-200">
          <div className="mx-auto max-w-[1200px] px-4 py-10">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-indigo-500" />
                  <span className="text-lg font-semibold">Contract AI</span>
                </div>
                <p className="mt-3 max-w-md text-sm text-slate-400">AI assistant for contracts: upload, summarize, extract clauses, detect risks, and draft negotiation emails in seconds.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:justify-items-end">
                <div>
                  <div className="text-sm font-semibold text-white">Product</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li><a className="hover:text-white" href="#features">Features</a></li>
                    <li><a className="hover:text-white" href="#pricing">Pricing</a></li>
                    <li><a className="hover:text-white" href="#upload">Try Now</a></li>
                  </ul>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Resources</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li><a className="hover:text-white" href="#">About</a></li>
                    <li><a className="hover:text-white" href="#">Docs</a></li>
                    <li><a className="hover:text-white" href="#">Twitter</a></li>
                    <li><a className="hover:text-white" href="#">GitHub</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800">
            <div className="mx-auto max-w-[1200px] px-4 py-4 text-center text-xs text-slate-400">© 2025 Contract AI. All rights reserved.</div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  )
}
