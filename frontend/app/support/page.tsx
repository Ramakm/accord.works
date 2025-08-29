export default function SupportPage() {
  return (
    <div className="prose prose-slate max-w-3xl dark:prose-invert">
      <h1>Support</h1>
      <p>We’re here to help.</p>
      <h2>Contact</h2>
      <ul>
        <li>Email: <a href="mailto:support@clausewise.ai">support@clausewise.ai</a></li>
        <li>Sales: <a href="mailto:sales@clausewise.ai">sales@clausewise.ai</a></li>
      </ul>
      <h2>Billing</h2>
      <p>
        All purchases are processed via our payment provider. For refund or billing
        questions, email <a href="mailto:billing@clausewise.ai">billing@clausewise.ai</a>.
      </p>
      <h2>FAQ</h2>
      <ul>
        <li>Is my data private? Yes—GDPR and SSL in place; delete on request.</li>
        <li>What formats are supported? PDF and DOCX.</li>
        <li>Can I export results? Yes, Markdown export is available.</li>
      </ul>
    </div>
  )
}
