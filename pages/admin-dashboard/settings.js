import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'
import overviewStyles from '../../styles/adminOverview.module.css'
import settingsStyles from '../../styles/adminSettings.module.css'

const createInitialProperty = () => ({
  title: '',
  location: '',
  type: 'residential',
  price: '',
})

const createInitialInvestment = () => ({
  propertyName: '',
  amount: '',
})

const createInitialMessage = () => ({
  name: '',
  email: '',
  message: '',
})

const formatDate = (input) => {
  if (!input) return '—'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatCurrency = (value) =>
  `PKR ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`

export default function AdminSettingsPage() {
  const {
    user,
    loading,
    refresh,
    pendingProperties,
    allProperties,
    allInvestments,
    contactMessages,
  } = useAdminDashboardData()

  const {
    addProperty,
    updatePropertyStatus,
    deleteProperty,
    addInvestment,
    deleteInvestment,
    submitContactMessage,
    deleteContactMessage,
    updateProfile,
  } = useFirebase()

  const [propertyForm, setPropertyForm] = useState(createInitialProperty())
  const [investmentForm, setInvestmentForm] = useState(createInitialInvestment())
  const [messageForm, setMessageForm] = useState(createInitialMessage())
  const [status, setStatus] = useState(null)
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)

  const handlePropertySubmit = async (event) => {
    event.preventDefault()
    setStatus('Adding property…')

    const payload = {
      ...propertyForm,
      price: Number(propertyForm.price) || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const result = await addProperty(payload)
    if (result.success) {
      setStatus('Property submitted for approval.')
      setPropertyForm(createInitialProperty())
      await refresh()
    } else {
      setStatus(result.error || 'Failed to add property.')
    }
  }

  const handleApproveProperty = async (propertyId) => {
    setStatus('Approving property…')
    const result = await updatePropertyStatus(propertyId, 'approved')
    setStatus(result.success ? 'Property approved.' : result.error || 'Failed to approve property.')
    await refresh()
  }

  const handleDeleteProperty = async (propertyId) => {
    setStatus('Deleting property…')
    const result = await deleteProperty(propertyId)
    setStatus(result.success ? 'Property deleted.' : result.error || 'Failed to delete property.')
    await refresh()
  }

  const handleInvestmentSubmit = async (event) => {
    event.preventDefault()
    setStatus('Recording investment…')

    const payload = {
      propertyName: investmentForm.propertyName || 'Untitled property',
      amount: Number(investmentForm.amount) || 0,
      createdAt: new Date().toISOString(),
      investmentDate: new Date().toISOString(),
      status: 'pending',
    }

    const result = await addInvestment(payload)
    if (result.success) {
      setStatus('Investment recorded.')
      setInvestmentForm(createInitialInvestment())
      await refresh()
    } else {
      setStatus(result.error || 'Failed to save investment.')
    }
  }

  const handleDeleteInvestment = async (investmentId) => {
    setStatus('Deleting investment…')
    const result = await deleteInvestment(investmentId)
    setStatus(result.success ? 'Investment deleted.' : result.error || 'Failed to delete investment.')
    await refresh()
  }

  const handleMessageSubmit = async (event) => {
    event.preventDefault()
    setStatus('Sending message…')

    const result = await submitContactMessage({ ...messageForm })
    if (result.success) {
      setStatus('Message stored in inbox.')
      setMessageForm(createInitialMessage())
      await refresh()
    } else {
      setStatus(result.error || 'Failed to submit message.')
    }
  }

  const handleDeleteMessage = async (messageId) => {
    setStatus('Removing message…')
    const result = await deleteContactMessage(messageId)
    setStatus(result.success ? 'Message removed.' : result.error || 'Failed to remove message.')
    await refresh()
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setProfileSaving(true)
    setStatus('Updating profile…')

    try {
      const response = await updateProfile({
        fullName: profileForm.fullName,
        email: profileForm.email,
        phone: profileForm.phone,
        role: 'admin',
      })
      if (response.success) {
        setStatus('Profile updated successfully.')
        await refresh()
      } else {
        setStatus(response.error || 'Failed to update profile.')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setStatus(error.message || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <AdminLayout
      title="Admin Settings"
      description="Manage demo data across the dashboard."
      metaTitle="Admin Settings"
      onRefresh={refresh}
    >
      <div className={settingsStyles.section}>
        {status ? <div className={settingsStyles.statusNotice}>{status}</div> : null}

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Admin Profile</h2>
              <span>Update your admin contact information</span>
            </div>
          </header>

          <form onSubmit={handleProfileSubmit} className={settingsStyles.list}>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Full Name</span>
              <input
                className={settingsStyles.input}
                value={profileForm.fullName}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Email</span>
              <input
                className={settingsStyles.input}
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Phone</span>
              <input
                className={settingsStyles.input}
                value={profileForm.phone}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </label>
            <button type="submit" className={settingsStyles.btnPrimary} disabled={profileSaving}>
              {profileSaving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Add Property</h2>
              <span>Capture a new property submission for approval</span>
            </div>
          </header>

          <form onSubmit={handlePropertySubmit} className={settingsStyles.list}>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Title</span>
              <input
                required
                value={propertyForm.title}
                onChange={(event) => setPropertyForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Property title"
                className={settingsStyles.input}
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Location</span>
              <input
                required
                value={propertyForm.location}
                onChange={(event) => setPropertyForm((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="City"
                className={settingsStyles.input}
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Type</span>
              <input
                value={propertyForm.type}
                onChange={(event) => setPropertyForm((prev) => ({ ...prev, type: event.target.value }))}
                placeholder="residential / commercial"
                className={settingsStyles.input}
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Price</span>
              <input
                required
                type="number"
                min="0"
                value={propertyForm.price}
                onChange={(event) => setPropertyForm((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="2500000"
                className={settingsStyles.input}
              />
            </label>
            <button type="submit" className={settingsStyles.btnPrimary}>
              Submit property
            </button>
          </form>
        </section>

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Pending approvals</h2>
              <span>Approve or delete property submissions</span>
            </div>
          </header>

          {loading ? (
            <div className={settingsStyles.emptyState}>Loading properties…</div>
          ) : pendingProperties.length ? (
            <div className={settingsStyles.list}>
              {pendingProperties.map((property) => (
                <div key={property.id} className={settingsStyles.listItem}>
                  <div>
                    <strong>{property.title || property.name || 'Untitled property'}</strong>
                    <div className={overviewStyles.smallMeta}>{property.location || property.address || 'Location not set'}</div>
                  </div>
                  <div className={settingsStyles.actions}>
                    <button
                      type="button"
                      onClick={() => handleApproveProperty(property.id)}
                      className={settingsStyles.btnPrimary}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProperty(property.id)}
                      className={settingsStyles.btnDanger}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={settingsStyles.emptyState}>No properties awaiting action.</div>
          )}
        </section>

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Add Investment</h2>
              <span>Record a manual investment for testing</span>
            </div>
          </header>

          <form onSubmit={handleInvestmentSubmit} className={settingsStyles.list}>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Property</span>
              <input
                required
                value={investmentForm.propertyName}
                onChange={(event) => setInvestmentForm((prev) => ({ ...prev, propertyName: event.target.value }))}
                placeholder="Property name"
                className={settingsStyles.input}
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Amount</span>
              <input
                required
                type="number"
                min="0"
                value={investmentForm.amount}
                onChange={(event) => setInvestmentForm((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="150000"
                className={settingsStyles.input}
              />
            </label>
            <button type="submit" className={settingsStyles.btnPrimary}>
              Save investment
            </button>
          </form>
        </section>

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Recorded investments</h2>
              <span>Remove test entries from the ledger</span>
            </div>
          </header>

          {loading ? (
            <div className={settingsStyles.emptyState}>Loading investments…</div>
          ) : allInvestments.length ? (
            <div className={settingsStyles.list}>
              {allInvestments.map((investment) => (
                <div key={investment.id} className={settingsStyles.listItem}>
                  <div>
                    <strong>{investment.propertyTitle || investment.propertyName || 'Investment'}</strong>
                    <div className={overviewStyles.smallMeta}>{formatCurrency(investment.amount || investment.currentValue || 0)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteInvestment(investment.id)}
                    className={settingsStyles.btnDanger}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={settingsStyles.emptyState}>No investments recorded yet.</div>
          )}
        </section>

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Add inbox message</h2>
              <span>Seed the contact inbox with a demo entry</span>
            </div>
          </header>

          <form onSubmit={handleMessageSubmit} className={settingsStyles.list}>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Name</span>
              <input
                required
                value={messageForm.name}
                onChange={(event) => setMessageForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Visitor name"
                className={settingsStyles.input}
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Email</span>
              <input
                required
                type="email"
                value={messageForm.email}
                onChange={(event) => setMessageForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="visitor@example.com"
                className={settingsStyles.input}
              />
            </label>
            <label className={settingsStyles.fieldRow}>
              <span className={settingsStyles.badge}>Message</span>
              <textarea
                required
                rows={3}
                value={messageForm.message}
                onChange={(event) => setMessageForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="I would like more information…"
                className={settingsStyles.textarea}
              />
            </label>
            <button type="submit" className={settingsStyles.btnPrimary}>
              Add message
            </button>
          </form>
        </section>

        <section className={settingsStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Inbox</h2>
              <span>Remove or archive submitted messages</span>
            </div>
          </header>

          {loading ? (
            <div className={settingsStyles.emptyState}>Loading messages…</div>
          ) : contactMessages.length ? (
            <div className={settingsStyles.list}>
              {contactMessages.map((message) => (
                <article key={message.id} className={settingsStyles.messageCard}>
                  <div className={overviewStyles.messageHeader}>
                    <strong>{message.name || message.email || 'Anonymous contact'}</strong>
                    <span className={overviewStyles.badge}>{message.status || 'new'}</span>
                  </div>
                  <div className={overviewStyles.messageBody}>{message.message || message.content || 'No message body provided.'}</div>
                  <div className={settingsStyles.messageFooter}>
                    <span>{message.email || 'No email provided'}</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  <div className={settingsStyles.actions}>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(message.id)}
                      className={settingsStyles.btnDanger}
                    >
                      Delete message
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={settingsStyles.emptyState}>No messages yet. Messages will appear here when users contact you.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
