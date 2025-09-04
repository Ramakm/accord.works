export default function PrivacyPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-1 text-sm text-brand-text-secondary">Effective date: 2025-08-29</p>
      <div className="mt-6 space-y-6 max-w-3xl">
        <p>
          AccordWorks respects your privacy. We only process documents you upload to provide
          AI-powered analysis. We do not sell your data. We use industry-standard
          encryption in transit (TLS/SSL) and at rest (cloud provider defaults).
        </p>
        <div>
          <h2 className="text-xl font-semibold">Data We Collect</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-brand-text-secondary">
            <li>Account information (email, name)</li>
            <li>Uploaded documents and derived metadata</li>
            <li>Usage analytics to improve the product</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">How We Use Data</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-brand-text-secondary">
            <li>Provide summaries, clause extraction, risk detection, and drafts</li>
            <li>Troubleshoot and improve system performance</li>
            <li>Billing and fraud prevention</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Retention & Deletion</h2>
          <p className="mt-2 text-sm text-brand-text-secondary">You can request deletion of your account and documents at any time.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2 text-sm text-brand-text-secondary">Questions? Email us at <a className="text-brand-accent underline" href="mailto:privacy@clausewise.ai">privacy@clausewise.ai</a>.</p>
        </div>
      </div>
    </div>
  )
}
