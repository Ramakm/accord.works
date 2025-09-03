"use client"

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
import { CheckCircle2, Copy, AlertTriangle, Send, Sparkles, Download, RefreshCw, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/toast-provider'

interface ContractAnalysis {
  summary: string
  key_clauses: Array<{ type: string; content: string; importance: string }>
  risks: Array<{ risk_type: string; description: string; severity: string; clause_reference: string }>
  risk_score: number
}

interface UploadResponse {
  message: string
  filename: string
  analysis: ContractAnalysis
  extracted_text: string
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [activeTab, setActiveTab] = useState('summary')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [emailTone, setEmailTone] = useState('professional')
  const [generatedEmail, setGeneratedEmail] = useState<{subject: string, body: string} | null>(null)
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([])
  const [loadingQA, setLoadingQA] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleReset = () => {
    setAnalysis(null)
    setExtractedText('')
    setQaHistory([])
    setGeneratedEmail(null)
    setQuestion('')
    setAnswer('')
    setActiveTab('summary')
  }

  const buildMarkdown = (): string => {
    if (!analysis) return ''
    const clauses = analysis.key_clauses.map(c => `- [${c.importance.toUpperCase()}] ${c.type}: ${c.content}`).join('\n')
    const risks = analysis.risks.map(r => `- (${r.severity.toUpperCase()}) ${r.risk_type}: ${r.description}${r.clause_reference ? ` [Clause: ${r.clause_reference}]` : ''}`).join('\n')
    return `# ContractAI Analysis\n\n## TL;DR Summary\n${analysis.summary}\n\n## Key Clauses\n${clauses}\n\n## Risks (Score: ${analysis.risk_score})\n${risks}\n\n---\nGenerated with ContractAI.`
  }

  const handleExportMarkdown = () => {
    if (!analysis) return
    const md = buildMarkdown()
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contractai-analysis.md'
    a.click()
    URL.revokeObjectURL(url)
    addToast({ variant: 'success', title: 'Exported', description: 'Markdown downloaded' })
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const data: UploadResponse = response.data
      setAnalysis(data.analysis)
      setExtractedText(data.extracted_text)
      setActiveTab('summary')
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      setFile(null)
      addToast({ variant: 'success', title: 'Upload complete', description: data.filename })
      // Notify listeners (e.g., dashboard) that an analysis has completed
      try {
        window.dispatchEvent(new CustomEvent('contractai:analysis-complete'))
      } catch {}
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Error uploading contract. Please try again.'
      setError(msg)
      addToast({ variant: 'error', title: 'Upload failed', description: msg })
    } finally {
      setUploading(false)
    }
  }

  const handleQuestion = async () => {
    if (!question || !extractedText) return
    setLoadingQA(true)
    setError(null)
    try {
      const response = await axios.post(`/api/ask-question`, {
        question,
        contract_text: extractedText
      })
      const a = response.data.answer as string
      setAnswer(a)
      setQaHistory((prev) => [{ q: question, a }, ...prev])
      setQuestion('')
      addToast({ variant: 'success', title: 'Answer ready' })
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to get answer.'
      setError(msg)
      addToast({ variant: 'error', title: 'Q&A failed', description: msg })
    } finally {
      setLoadingQA(false)
    }
  }

  const generateEmail = async () => {
    if (!extractedText) return
    setLoadingEmail(true)
    setError(null)
    try {
      const response = await axios.post(`/api/generate-email`, {
        contract_text: extractedText,
        tone: emailTone
      })
      setGeneratedEmail(response.data)
      addToast({ variant: 'success', title: 'Email drafted' })
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to generate email.'
      setError(msg)
      addToast({ variant: 'error', title: 'Email generation failed', description: msg })
    } finally {
      setLoadingEmail(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast({ variant: 'success', title: 'Copied to clipboard' })
  }

  const getRiskBadge = (severity: string) => {
    const light = severity === 'high'
      ? 'bg-red-100 text-red-700 border-red-200'
      : severity === 'medium'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
      : 'bg-green-100 text-green-700 border-green-200'
    const dark = severity === 'high'
      ? 'dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      : severity === 'medium'
      ? 'dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      : 'dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
    return <Badge className={`${light} ${dark} border capitalize`}>{severity}</Badge>
  }

  const riskStroke = (score: number) => {
    if (score >= 70) return '#ef4444' // red-500
    if (score >= 40) return '#f59e0b' // amber-500
    return '#10b981' // emerald-500
  }

  const RiskGauge = ({ score }: { score: number }) => {
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const progress = Math.min(Math.max(score, 0), 100) / 100
    const dash = circumference * progress
    return (
      <div className="flex items-center gap-3">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke={riskStroke(score)}
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            transform="rotate(-90 36 36)"
          />
          <text x="36" y="40" textAnchor="middle" fontSize="14" className="fill-slate-700 dark:fill-slate-200">{score}</text>
        </svg>
        <div className="text-sm">
          <div className="font-semibold">Risk Score</div>
          <div className="text-slate-600 dark:text-slate-300">0 (safe) – 100 (high)</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-indigo-50 p-6 dark:border-slate-800 dark:from-orange-950/20 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-orange-200/40 blur-2xl dark:bg-orange-500/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-500/10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-accent">
            <Sparkles className="h-4 w-4" /> AI Contract Analysis
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">Upload a contract. Get instant insights.</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">Drag and drop a PDF/DOCX or select a file. We’ll summarize key clauses, surface risks with a score, and generate a negotiation email in your tone.</p>
        </div>
      </motion.div>

      {/* Upload Card */}
      <Card className="card-padded-lg">
        <CardHeader className="pb-2">
          <CardTitle>Upload Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FileDropzone onFiles={(files) => {
              const f = files[0]
              if (f) setFile(f)
            }} />
            {file && (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Selected: <span className="font-medium">{file.name}</span> <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button className="btn-primary" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? (<><Spinner className="mr-2" /> Uploading...</>) : 'Analyze'}
              </Button>
            </div>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-text-secondary">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Supports PDF/DOCX/TXT up to 10MB • Encrypted in transit • No data resale
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="clauses">Clauses</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="email">Email Draft</TabsTrigger>
            <TabsTrigger value="qa">Ask Questions</TabsTrigger>
          </TabsList>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(buildMarkdown())}>
              <FileText className="mr-2 h-4 w-4" /> Copy Full Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportMarkdown}>
              <Download className="mr-2 h-4 w-4" /> Export Markdown
            </Button>
            <Button size="sm" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" /> New Analysis
            </Button>
          </div>

          <TabsContent value="summary" className="tab-pane">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Summary</CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysis.summary)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{analysis.summary}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clauses" className="tab-pane">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Key Clauses</CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(analysis.key_clauses, null, 2))}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid max-h-96 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
                  {analysis.key_clauses.map((c, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{c.type}</div>
                        <Badge color={c.importance === 'high' ? 'red' : c.importance === 'medium' ? 'yellow' : 'green'} className="capitalize">{c.importance}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="tab-pane">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-4">
                  <CardTitle>Risks</CardTitle>
                  <RiskGauge score={analysis.risk_score} />
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(analysis.risks, null, 2))}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {analysis.risks.map((r, i) => (
                    <div key={i} className={`rounded-lg border p-4 ${r.severity === 'high' ? 'border-red-300 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'} `}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {r.severity === 'high' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {r.risk_type}
                        </div>
                        {getRiskBadge(r.severity)}
                      </div>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{r.description}</p>
                      {r.clause_reference && (
                        <div className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <span className="font-medium">Clause:</span> {r.clause_reference}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="tab-pane">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Email Draft</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="tone" className="text-xs">Tone</Label>
                  <select id="tone" className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900" value={emailTone} onChange={(e) => setEmailTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="concise">Concise</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={() => generatedEmail && copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`)}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Email
                  </Button>
                  <Button size="sm" onClick={generateEmail} disabled={loadingEmail}>
                    {loadingEmail ? (<><Spinner className="mr-2" /> Generating…</>) : (<><Send className="mr-2 h-4 w-4" /> Generate</>)}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-4 font-mono text-sm dark:border-slate-700 dark:bg-slate-900">
                  {loadingEmail && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Spinner /> Thinking…</div>
                  )}
                  {error && (
                    <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</div>
                  )}
                  {generatedEmail ? (
                    <div>
                      <div className="mb-2 font-semibold">Subject: {generatedEmail.subject}</div>
                      <pre className="whitespace-pre-wrap">{generatedEmail.body}</pre>
                    </div>
                  ) : (
                    <div className="text-slate-500">No draft yet. Click Generate.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa" className="tab-pane">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Ask Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
                  {loadingQA && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Spinner /> Thinking…</div>
                  )}
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</div>
                  )}
                  {qaHistory.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">{item.q}</div>
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100">{item.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Input
                    placeholder="Type your question…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuestion()}
                  />
                  <Button onClick={handleQuestion}>Ask</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* FAQ Section */}
      <section id="faq" className="space-y-5">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          <details className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-slate-800 dark:text-slate-100">
              <span>Which file types are supported?</span>
              <span className="text-slate-500 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">We currently support PDF, DOC, and DOCX files up to 10MB.</p>
          </details>
          <details className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-slate-800 dark:text-slate-100">
              <span>Is my data secure?</span>
              <span className="text-slate-500 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Your files are transmitted over HTTPS and not stored after processing. We plan to add org workspaces with encryption at rest.</p>
          </details>
          <details className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-slate-800 dark:text-slate-100">
              <span>What does the risk score mean?</span>
              <span className="text-slate-500 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Risk is scored 0–100 based on clause patterns and severity heuristics. Higher scores indicate more attention needed.</p>
          </details>
          <details className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-slate-800 dark:text-slate-100">
              <span>Can I export the results?</span>
              <span className="text-slate-500 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Yes. Use the Copy buttons in each tab to export summaries, clauses, risks, and email drafts.</p>
          </details>
        </div>
      </section>
    </div>
  )
}
