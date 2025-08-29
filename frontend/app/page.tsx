'use client'

import { Mail, ShieldCheck, Sparkles, UploadCloud, CheckCircle2, AlertTriangle, CreditCard, ArrowRight, Lock, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section id="hero" className="section-tight">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="h1">
              Understand Contracts in Seconds, Not Hours.
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08, duration: 0.35 }} className="mt-4 text-lg text-brand-text-secondary">
              ContractAI uses AI to summarize, extract clauses, highlight risks, and even draft responses – saving you time and money.
            </motion.p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/upload" className="btn-primary">
                <UploadCloud className="mr-2 h-4 w-4" /> Try Free – 1 Free Analysis
              </a>
              <a href="#how" className="btn-secondary">
                <Sparkles className="mr-2 h-4 w-4" /> See How it Works
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm text-brand-text-secondary">
              <ShieldCheck className="h-4 w-4 text-brand-accent" /> GDPR & SSL secure
              <Lock className="h-4 w-4 text-brand-accent" /> Your data is private
            </div>
          </div>
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card-padded-lg glass-card">
              <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="mt-3 text-xs text-brand-text-secondary">Product screenshot placeholder</div>
            </motion.div>
          </div>
        </div>
        <div className="mt-10 text-sm text-brand-text-secondary">Trusted by startups, lawyers, and businesses worldwide.</div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["Acme", "FoundersHub", "LexCorp", "SaaSly"].map((logo) => (
            <div key={logo} className="flex items-center justify-center rounded-md border border-slate-200 glass-card py-3 text-xs">{logo}</div>
          ))}
        </div>
      </section>

      {/* Pain Points */}
      <section id="pain" className="section bg-[color:var(--section-bg,#FAFAFA)] rounded-2xl">
        <div className="text-center">
          <div className="eyebrow">The problem</div>
          <h2 className="mt-2 h2">Still spending hours reading legal contracts?</h2>
        </div>
        <div className="container-page mt-8 grid gap-6 md:grid-cols-3">
          {[{
            t: 'Hard-to-read legal jargon', s: 'Dense language makes it easy to miss what actually matters.'
          },{
            t: 'Missing hidden risks', s: 'Buried clauses and obligations can cost you time and money.'
          },{
            t: 'No quick way to draft replies', s: 'Context switching to write emails slows down deal cycles.'
          }].map(({t,s}, i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card-padded-lg glass-card">
              <AlertTriangle className="h-5 w-5 text-brand-warning" />
              <div className="mt-2 text-base font-semibold">{t}</div>
              <div className="mt-1 text-sm text-brand-text-secondary">{s}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Value / Features */}
      <section id="features" className="section">
        <div className="text-center">
          <div className="eyebrow">Solution</div>
          <h2 className="mt-2 h2">AI-Powered Legal Clarity</h2>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Smart Summaries', desc: '1-page digest of any contract', icon: CheckCircle2 },
            { title: 'Clause Extraction', desc: 'Find key obligations instantly', icon: Sparkles },
            { title: 'Risk Detection', desc: 'Spot hidden risks before signing', icon: AlertTriangle },
            { title: 'Draft Assistance', desc: 'Generate professional email responses', icon: Mail },
          ].map(({ title, desc, icon: Icon }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card-padded-lg glass-card">
              <Icon className="h-5 w-5 text-brand-accent" />
              <div className="mt-2 text-base font-semibold">{title}</div>
              <p className="mt-1 text-sm text-brand-text-secondary">{desc}</p>
              <ul className="mt-3 list-inside list-disc text-xs text-brand-text-secondary">
                <li>Fast, accurate, and human-readable</li>
                <li>Works with PDF/DOCX</li>
                <li>Export to Markdown</li>
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="/upload" className="btn-primary">Try Free Now</a>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="section">
        <div className="text-center">
          <div className="eyebrow">Process</div>
          <h2 className="mt-2 h2">How It Works</h2>
          <div className="mt-2 text-sm text-brand-text-secondary">Bonus: 1 free credit included on signup</div>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-4">
          {[
            { step: '1', title: 'Upload your contract' },
            { step: '2', title: 'AI analyzes instantly' },
            { step: '3', title: 'View summary, risks & clauses' },
            { step: '4', title: 'Export insights or draft response' },
          ].map((p, i) => (
            <motion.div key={p.step} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card-padded-lg glass-card">
              <div className="text-xs font-mono text-slate-500">Step {p.step}</div>
              <div className="mt-1 text-base font-semibold">{p.title}</div>
              <p className="mt-1 text-sm text-brand-text-secondary">No setup. Works in your browser.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section">
        <div className="text-center">
          <div className="eyebrow">Simple, Transparent Pricing</div>
          <h2 className="mt-2 h2">Choose a plan</h2>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Free', credits: '1 credit', price: '$0' },
            { name: 'Starter', credits: '5 credits', price: '$9' },
            { name: 'Pro', credits: '10 credits', price: '$15' },
            { name: 'Team', credits: '20 credits', price: '$25' },
          ].map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card-padded-lg glass-card">
              <div className="text-base font-semibold">{p.name}</div>
              <div className="mt-1 text-sm text-brand-text-secondary">{p.credits}</div>
              <div className="mt-4 text-2xl font-bold">{p.price}</div>
              <ul className="mt-3 list-inside list-disc text-xs text-brand-text-secondary">
                <li>AI summary, clauses, risks</li>
                <li>Export to Markdown</li>
                <li>Email draft assistant</li>
              </ul>
              <button
                className="mt-6 btn-primary w-full justify-center"
                onClick={() => {
                  const map: Record<string, string | undefined> = {
                    Free: process.env.NEXT_PUBLIC_DODO_CHECKOUT_FREE,
                    Starter: process.env.NEXT_PUBLIC_DODO_CHECKOUT_STARTER,
                    Pro: process.env.NEXT_PUBLIC_DODO_CHECKOUT_PRO,
                    Team: process.env.NEXT_PUBLIC_DODO_CHECKOUT_TEAM,
                  }
                  const url = map[p.name]
                  if (url) {
                    window.location.href = url
                  } else {
                    alert('Checkout link not configured. Please set NEXT_PUBLIC_DODO_CHECKOUT_* in your env.')
                  }
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Buy Now
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section id="testimonials" className="section-tight">
        <div className="text-center">
          <div className="eyebrow">Social Proof</div>
          <h2 className="mt-2 h2">Loved by professionals</h2>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-brand-accent">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
          <span className="ml-2 text-sm text-brand-text-secondary">4.9/5 average user rating</span>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            { quote: 'ContractAI saved me hours of legal work. Game changer!', name: 'Startup Founder' },
            { quote: 'Great for quick reviews before client calls.', name: 'Lawyer' },
            { quote: 'Clean summaries and clear risk flags. Super helpful.', name: 'Operations Lead' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card-padded-lg glass-card">
              <p className="text-slate-800">“{t.quote}”</p>
              <div className="mt-3 text-sm text-slate-600">— {t.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section id="trust" className="section-tight">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Your data is secure', desc: 'GDPR + SSL badge' },
            { icon: Sparkles, title: 'Trusted by 500+ professionals', desc: 'Growing daily' },
            { icon: Star, title: '4.9/5 average user rating', desc: 'Based on user feedback' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card-padded-lg glass-card">
              <Icon className="h-5 w-5 text-brand-accent" />
              <div className="mt-2 text-base font-semibold">{title}</div>
              <div className="text-sm text-brand-text-secondary">{desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="section-tight">
        <div className="card-padded glass-card flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="eyebrow">Start now</div>
            <h3 className="mt-2 text-2xl font-bold">Start Analyzing Contracts Smarter Today</h3>
            <p className="mt-1 text-sm text-brand-text-secondary">Get 1 free credit on signup. Upgrade anytime.</p>
          </div>
          <div className="flex gap-3">
            <a href="/upload" className="btn-primary">
              <UploadCloud className="mr-2 h-4 w-4" /> Sign Up Free
            </a>
            <a href="#pricing" className="btn-secondary">
              See Pricing <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
