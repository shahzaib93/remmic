import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminHelpPage() {
  const faqs = [
    {
      question: 'How do I approve a property?',
      answer: 'Open the Properties page, review the submission details, and change the status to APPROVED in the property management tool. A confirmation email is sent automatically.',
    },
    {
      question: 'Why are investments marked as pending?',
      answer: 'Investments remain pending until payment confirmation has been synced from the payment gateway or manually recorded by finance.',
    },
    {
      question: 'Where can I download monthly reports?',
      answer: 'Head over to the Reports page and select "Export detailed ledger" to download a CSV snapshot of the current data.',
    },
  ]

  const contacts = [
    {
      title: 'Technical support',
      description: 'Dashboard access issues, bugs, and feature requests.',
      email: 'support@remmic.com',
      phone: '+91 90000 00001',
    },
    {
      title: 'Compliance desk',
      description: 'KYC, AML reviews, and legal document queries.',
      email: 'compliance@remmic.com',
      phone: '+91 90000 00002',
    },
    {
      title: 'Product feedback',
      description: 'Suggest improvements or report UX friction.',
      email: 'product@remmic.com',
      phone: '+91 90000 00003',
    },
  ]

  return (
    <AdminLayout
      title="Help Center"
      description="Guides and contacts to support your admin operations."
      metaTitle="Admin Help"
    >
      <div className="grid gap-7">
        {/* FAQs Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Frequently asked questions</h2>
              <span className="text-gray-400 text-sm">Answers to the most common admin workflows</span>
            </div>
          </header>

          <div className="grid gap-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {faqs.map((faq) => (
              <div key={faq.question} className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/15 text-emerald-700 text-xs font-semibold uppercase tracking-wide border border-green-500/20">?</span>
                <div>
                  <strong className="font-semibold text-gray-800">{faq.question}</strong>
                  <div className="text-gray-400 text-sm mt-1">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contacts Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Contact the team</h2>
              <span className="text-gray-400 text-sm">Direct lines for quick assistance</span>
            </div>
          </header>

          <div className="grid gap-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {contacts.map((contact) => (
              <article key={contact.title} className="border border-slate-200/70 rounded-xl p-4 grid gap-2.5 bg-white shadow-[0_10px_24px_rgba(148,163,184,0.08)]">
                <div className="flex justify-between items-center">
                  <strong className="text-gray-800 text-[0.95rem]">{contact.title}</strong>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-xs font-semibold uppercase tracking-wide border border-[rgba(201,162,39,0.2)]">
                    {contact.email}
                  </span>
                </div>
                <div className="text-slate-600 text-sm">{contact.description}</div>
                <div className="flex justify-between items-center text-slate-400 text-xs">
                  <span>{contact.phone}</span>
                  <span>Available 9am – 6pm IST</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
