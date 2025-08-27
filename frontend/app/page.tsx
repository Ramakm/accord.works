'use client'

import { useState } from 'react'
import axios from 'axios'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { FileDropzone } from '@/components/dropzone'
import { CheckCircle2, Copy, AlertTriangle, Send, FileText, ListChecks, ShieldAlert, Mail, UploadCloud, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/toast-provider'

interface ContractAnalysis {
  summary: string
  key_clauses: Array<{
    type: string
    content: string
    importance: string
  }>
  risks: Array<{
    risk_type: string
    description: string
    severity: string
    clause_reference: string
  }>
  risk_score: number
}

interface UploadResponse {
  message: string
  filename: string
  analysis: ContractAnalysis
  extracted_text: string
}

function PricingCards() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const price = billing === 'monthly' ? { pro: 19, suffix: '/mo' } : { pro: 190, suffix: '/yr' }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="inline-flex rounded-md border border-slate-300 bg-white p-1 shadow-sm">
          <button
            className={`px-3 py-1 text-sm font-medium rounded ${billing === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setBilling('monthly')}
          >Monthly</button>
          <button
            className={`px-3 py-1 text-sm font-medium rounded ${billing === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setBilling('yearly')}
          >Yearly</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-indigo-600">Free Trial</div>
          <div className="mt-2 flex items-baseline gap-1">
            <div className="text-3xl font-extrabold">$0</div>
            <div className="text-sm text-slate-500">/mo</div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Limited uploads</li>
            <li>• Summaries & clauses</li>
            <li>• Basic risk detection</li>
          </ul>
          <a href="#upload" className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50">Start Free</a>
        </div>
        {/* Pro */}
        <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-md ring-1 ring-indigo-100">
          <div className="text-sm font-semibold text-indigo-700">Pro</div>
          <div className="mt-2 flex items-baseline gap-1">
            <div className="text-3xl font-extrabold">${price.pro}</div>
            <div className="text-sm text-slate-500">{price.suffix}</div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Unlimited uploads</li>
            <li>• Advanced risk detection</li>
            <li>• Gmail integration for drafts</li>
            <li>• Priority support</li>
          </ul>
          <a href="#upload" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">Upgrade</a>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('summary')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [emailTone, setEmailTone] = useState('professional')
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string} | null>(null)
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([])
  const [loadingQA, setLoadingQA] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage('')
      setAnalysis(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a contract file first')
      return
    }

    setUploading(true)
    setMessage('')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data: UploadResponse = response.data
      setAnalysis(data.analysis)
      setExtractedText(data.extracted_text)
      setMessage(`Contract analyzed successfully: ${data.filename}`)
      try { addToast({ variant: 'success', title: 'Upload complete', description: data.filename }) } catch {}
      setActiveTab('summary')
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      setFile(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      const msg = error.response?.data?.detail || 'Error uploading contract. Please try again.'
      setError(msg)
      try { addToast({ variant: 'error', title: 'Upload failed', description: msg }) } catch {}
    } finally {
      setUploading(false)
    }
  }

  const handleQuestion = async () => {
    if (!question || !extractedText) return

    setLoadingQA(true)
    setError(null)
    try {
      const response = await axios.post('/api/ask-question', {
        question,
        contract_text: extractedText
      })
      const a = response.data.answer as string
      setAnswer(a)
      setQaHistory((prev) => [{ q: question, a }, ...prev])
      setQuestion('')
      try { addToast({ variant: 'success', title: 'Answer ready' }) } catch {}
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to get answer.'
      setError(msg)
      try { addToast({ variant: 'error', title: 'Q&A failed', description: msg }) } catch {}
    } finally {
      setLoadingQA(false)
    }
  }

  const generateEmail = async () => {
    if (!extractedText) return

    setLoadingEmail(true)
    setError(null)
    try {
      const response = await axios.post('/api/generate-email', {
        contract_text: extractedText,
        tone: emailTone
      })
      setGeneratedEmail(response.data)
      try { addToast({ variant: 'success', title: 'Email drafted' }) } catch {}
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate email.'
      setError(msg)
      try { addToast({ variant: 'error', title: 'Email generation failed', description: msg }) } catch {}
    } finally {
      setLoadingEmail(false)
    }
  }

  const { addToast } = useToast()
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    try { addToast({ variant: 'success', title: 'Copied to clipboard' }) } catch {}
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section id="hero" className="">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-4xl font-extrabold tracking-tight md:text-5xl">
              AI Contract Assistant
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className="mt-3 text-lg text-slate-600">
              Summarize, review risks, and draft emails from your contracts in seconds.
            </motion.p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#upload" className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700">
                <UploadCloud className="mr-2 h-4 w-4" /> Upload a Contract
              </a>
              <a href="#features" className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                <Sparkles className="mr-2 h-4 w-4" /> See Demo
              </a>
            </div>
          </div>
          <div>
            <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="aspect-[4/3] w-full rounded-lg bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Everything you need to understand your contracts</h2>
          <p className="mt-2 text-slate-600">Fast, accurate, and practical outputs for busy teams.</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { icon: FileText, title: 'Summarize Contracts', desc: 'Get an instant TL;DR with key points and obligations.' },
            { icon: ListChecks, title: 'Extract Key Clauses', desc: 'Structured clauses to review and compare quickly.' },
            { icon: ShieldAlert, title: 'Detect Risks', desc: 'Flag risky terms and highlight what to negotiate.' },
            { icon: Mail, title: 'Draft Emails', desc: 'Generate negotiation-ready emails in your preferred tone.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <f.icon className="h-5 w-5 text-indigo-600" />
                <div className="font-semibold">{f.title}</div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <p className="mt-2 text-slate-600">Three simple steps to move from upload to action.</p>
        </div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
          className="grid gap-6 md:grid-cols-3"
        >
          {[{
            icon: UploadCloud,
            title: '1. Upload your PDF/DOCX',
            desc: 'Drag & drop your contract or click to upload from your device.'
          }, {
            icon: Sparkles,
            title: '2. AI summarizes & flags risks',
            desc: 'Get a clear summary, clauses list, and a prioritized risk assessment.'
          }, {
            icon: Mail,
            title: '3. Export or send email drafts',
            desc: 'Copy results to clipboard or send a Gmail draft in one click.'
          }].map((s, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }} className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-indigo-600" />
                <div className="font-semibold">{s.title}</div>
              </div>
              <p className="text-sm text-slate-600">{s.desc}</p>
              {i < 2 && <div className="hidden md:block absolute right-[-12px] top-8 h-8 w-6 border-t border-r border-slate-200 dark:border-slate-700" />}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Loved by teams and founders</h2>
          <p className="mt-2 text-slate-600">Real stories from early users.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { quote: 'Cut our contract review time by 70%. Game changer for our sales ops.', name: 'Ava M.', role: 'Head of Ops' },
            { quote: 'Risk flags are on point and the email drafts save so much back-and-forth.', name: 'Daniel K.', role: 'Founder' },
            { quote: 'A clean UI that gets out of the way. We finally ship contracts faster.', name: 'Priya S.', role: 'COO' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-slate-800 dark:text-slate-100">“{t.quote}”</p>
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">— {t.name}, {t.role}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Simple, transparent pricing</h2>
          <p className="mt-2 text-slate-600">Start free, upgrade when you need more.</p>
        </div>
        <PricingCards />
      </section>

      {/* Upload Section (shown first). After parsing, user uses Tabs below */}
      {!analysis && (
        <Card id="upload">
          <CardHeader className="pb-2">
            <CardTitle>Upload Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FileDropzone onFiles={(files) => {
                const f = files?.[0]
                if (f) setFile(f)
              }} />
              <div className="grid gap-2">
                <Label htmlFor="file-input">Or select a file</Label>
                <Input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
              </div>
              {file && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div className="text-sm text-slate-700">
                    <span className="font-medium">Selected:</span> {file.name}
                  </div>
                </div>
              )}
              <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
                {uploading ? (
                  <span className="inline-flex items-center gap-2"><Spinner size={18} /> Analyzing contract…</span>
                ) : (
                  'Upload & Analyze Contract'
                )}
              </Button>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={handleUpload}>Retry</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs visible after analysis */}
      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="clauses">Clauses</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="email">Email Draft</TabsTrigger>
            <TabsTrigger value="questions">Ask Questions</TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent value="summary">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="w-full flex items-center justify-between">
                    <span>Contract Summary</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(analysis.summary)}>
                      <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-80 overflow-y-auto pr-1">
                    <p className="whitespace-pre-line leading-relaxed text-slate-700">{analysis.summary}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getRiskColor(analysis.risk_score)}`}>
                    Risk Score: {analysis.risk_score}/100
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clauses */}
          <TabsContent value="clauses">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Key Clauses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {analysis.key_clauses.map((clause, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">{clause.type}</h4>
                        <Badge color={clause.importance === 'high' ? 'red' : clause.importance === 'medium' ? 'yellow' : 'green'}>
                          {clause.importance}
                        </Badge>
                      </div>
                      <div className="my-2 h-px bg-slate-100" />
                      <p className="mt-1 text-slate-700">{clause.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(
                    analysis.key_clauses.map(c => `- [${c.importance}] ${c.type}: ${c.content}`).join('\n')
                  )}>
                    <Copy className="mr-2 h-4 w-4" /> Copy All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risks */}
          <TabsContent value="risks">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Identified Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {analysis.risks.map((risk, idx) => (
                    <div key={idx} className={`rounded-lg border p-4 ${risk.severity === 'high' ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-white'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {risk.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          <h4 className="font-medium text-slate-900">{risk.risk_type}</h4>
                        </div>
                        <Badge color={risk.severity === 'high' ? 'red' : risk.severity === 'medium' ? 'yellow' : 'green'}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <div className="my-2 h-px bg-slate-100" />
                      <p className="text-slate-800">{risk.clause_reference}</p>
                      <p className="mt-1 text-slate-700 text-sm">{risk.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(
                    analysis.risks.map(r => `- (${r.severity}) ${r.risk_type}: ${r.description} [${r.clause_reference}]`).join('\n')
                  )}>
                    <Copy className="mr-2 h-4 w-4" /> Copy All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Draft */}
          <TabsContent value="email">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Generate Negotiation Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tone">Email Tone</Label>
                    <select
                      id="tone"
                      value={emailTone}
                      onChange={(e) => setEmailTone(e.target.value)}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="assertive">Assertive</option>
                      <option value="collaborative">Collaborative</option>
                    </select>
                  </div>
                  <Button onClick={generateEmail} className="w-full" disabled={loadingEmail}>
                    {loadingEmail ? (<span className="inline-flex items-center gap-2"><Spinner size={18} /> Thinking…</span>) : 'Generate Email'}
                  </Button>
                  {generatedEmail && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700">Draft</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`)}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Email
                          </Button>
                          <Button size="sm" onClick={() => {
                            const su = encodeURIComponent(generatedEmail.subject)
                            const body = encodeURIComponent(generatedEmail.body)
                            const url = `https://mail.google.com/mail/?view=cm&fs=1&su=${su}&body=${body}`
                            window.open(url, '_blank')
                          }}>
                            <Send className="mr-2 h-4 w-4" /> Send via Gmail
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-md border bg-slate-50 p-4 font-mono leading-6">
                        <div className="mb-2 text-sm font-semibold text-slate-600">Subject</div>
                        <div className="rounded border bg-white p-3">{generatedEmail.subject}</div>
                        <div className="my-3 h-px bg-slate-200" />
                        <div className="mb-2 text-sm font-semibold text-slate-600">Body</div>
                        <div className="rounded border bg-white p-4 whitespace-pre-wrap">{generatedEmail.body}</div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                      <div className="mt-2">
                        <Button size="sm" variant="outline" onClick={generateEmail}>Retry</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ask Questions */}
          <TabsContent value="questions">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ask Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-[28rem] flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {qaHistory.length === 0 && (
                      <p className="text-sm text-slate-500">Ask anything about the uploaded contract.</p>
                    )}
                    {qaHistory.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white shadow">
                            {item.q}
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800 shadow">
                            {item.a}
                          </div>
                        </div>
                      </div>
                    ))}
                    {loadingQA && (
                      <div className="flex items-center gap-2 text-sm text-slate-500"><Spinner size={16} /> Thinking…</div>
                    )}
                    {error && (
                      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={handleQuestion}>Retry</Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <Input
                      id="question"
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleQuestion()
                        }
                      }}
                      placeholder="Type your question..."
                    />
                    <Button onClick={handleQuestion}>Ask</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Removed inline message toast; using Toaster via Providers */}
    </div>
  )
}
