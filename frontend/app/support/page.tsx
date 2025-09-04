export default function SupportPage() {
  return (
    <div className="prose prose-slate max-w-3xl dark:prose-invert">
      <h1>Support</h1>
      <p>We’re here to help. Browse the FAQs below or reach out and we’ll get back as soon as possible.</p>

      <h2>Contact</h2>
      <ul>
        <li>Email: <a href="mailto:itsramakrushna@gmail.com">itsramakrushna@gmail.com</a></li>
        <li>X (Twitter): <a href="https://x.com/techwith_ram" target="_blank" rel="noopener noreferrer">@techwith_ram</a></li>
      </ul>

      <h2>Billing</h2>
      <p>
        Purchases are processed via our payment provider. For questions related to refunds, invoices, or charges,
        please email <a href="mailto:itsramakrushna@gmail.com">itsramakrushna@gmail.com</a>.
      </p>

      <h2>FAQ</h2>
      <ul>
        <li><strong>What file formats are supported?</strong> PDF, DOCX, and TXT.</li>
        <li><strong>What does the app do?</strong> Upload contracts, get AI summaries, extract key clauses, detect risks and draft negotiation emails. You can ask questions about the contract and export results in Markdown.</li>
        <li><strong>How do credits work?</strong> Credits are consumed for actions like file upload and analysis (−4) and email generation (−2). Dashboard credits update in real time.</li>
        <li><strong>Is my data secure?</strong> We use transport encryption and follow best practices. See the <a href="/privacy">Privacy Policy</a> for details.</li>
        <li><strong>How do I report a bug or request a feature?</strong> Email us or send a DM on X and include steps to reproduce or a brief description of the feature.</li>
      </ul>
    </div>
  )
}
