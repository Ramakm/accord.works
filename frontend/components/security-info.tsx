"use client"

import { ShieldCheck, Lock, Database, Trash2, KeyRound, Globe, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function SecurityInfo() {
  return (
    <section id="security" className="section">
      <div className="text-center">
        <div className="eyebrow">Security & Privacy</div>
        <h2 className="mt-2 h2">Your data stays private and secure</h2>
        <p className="mt-2 text-sm text-brand-text-secondary">
          We designed AccordWorks with privacy-first principles. Clear policies. No surprises.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Left Column: Policy Summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35 }}
          className="card-padded-lg glass-card h-full"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-accent" />
            <div className="text-base font-semibold">Privacy-first by design</div>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-brand-text-secondary">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-accent" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Local processing</span> — User-uploaded files are processed within our environment and not stored in any external database.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-accent" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">No prompt retention</span> — We do not store your prompts, conversations, or analysis results beyond the active session unless you explicitly export them.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-accent" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Secure webhooks</span> — Payment webhooks are verified using the Standard Webhooks HMAC signature scheme.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-accent" />
              <div>
                <span className="font-medium text-slate-800 dark:text-slate-200">Config isolation</span> — Secrets are kept in environment variables and never committed to source control.
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Right Column: Technical Controls */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="card-padded-lg glass-card h-full"
        >
          <div className="grid gap-4">
            <div className="rounded-lg border border-slate-200/60 dark:border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-accent" />
                <div className="text-sm font-semibold">Transport Security</div>
              </div>
              <p className="mt-1 text-xs text-brand-text-secondary">All traffic is served over HTTPS with modern TLS.</p>
            </div>
            <div className="rounded-lg border border-slate-200/60 dark:border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-brand-accent" />
                <div className="text-sm font-semibold">No External DB</div>
              </div>
              <p className="mt-1 text-xs text-brand-text-secondary">We avoid third-party data storage. Minimal data is kept only as needed for payment credits.</p>
            </div>
            <div className="rounded-lg border border-slate-200/60 dark:border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-brand-accent" />
                <div className="text-sm font-semibold">User Control</div>
              </div>
              <p className="mt-1 text-xs text-brand-text-secondary">Delete uploads anytime by refreshing or leaving the session. We don’t retain your documents.</p>
            </div>
            <div className="rounded-lg border border-slate-200/60 dark:border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-brand-accent" />
                <div className="text-sm font-semibold">GDPR-friendly</div>
              </div>
              <p className="mt-1 text-xs text-brand-text-secondary">Clear data practices designed to align with GDPR principles.</p>
            </div>
            <div className="rounded-lg border border-slate-200/60 dark:border-white/10 p-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-brand-accent" />
                <div className="text-sm font-semibold">Verified Webhooks</div>
              </div>
              <p className="mt-1 text-xs text-brand-text-secondary">Signatures are validated per the Standard Webhooks spec before any action is taken.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
