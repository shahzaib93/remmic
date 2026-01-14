import AdminLayout from '../../components/admin/AdminLayout'
import overviewStyles from '../../styles/adminOverview.module.css'

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
      answer: 'Head over to the Reports page and select “Export detailed ledger” to download a CSV snapshot of the current data.',
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
      <div className={overviewStyles.section}>
        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Frequently asked questions</h2>
              <span>Answers to the most common admin workflows</span>
            </div>
          </header>

          <div className={overviewStyles.list}>
            {faqs.map((faq) => (
              <div key={faq.question} className={overviewStyles.listItem}>
                <span className={`${overviewStyles.badge} ${overviewStyles.badgeSuccess}`}>?</span>
                <div>
                  <strong>{faq.question}</strong>
                  <div className={overviewStyles.smallMeta}>{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Contact the team</h2>
              <span>Direct lines for quick assistance</span>
            </div>
          </header>

          <div className={overviewStyles.messageList}>
            {contacts.map((contact) => (
              <article key={contact.title} className={overviewStyles.messageCard}>
                <div className={overviewStyles.messageHeader}>
                  <strong>{contact.title}</strong>
                  <span className={overviewStyles.badge}>{contact.email}</span>
                </div>
                <div className={overviewStyles.messageBody}>{contact.description}</div>
                <div className={overviewStyles.messageFooter}>
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
