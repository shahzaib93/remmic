import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'
import overviewStyles from '../../styles/adminOverview.module.css'

const formatDate = (input) => {
  if (!input) return null
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const formatDateTime = (input) => {
  const date = formatDate(input)
  if (!date) return '—'
  return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

const createInitialEvent = () => ({
  title: '',
  type: 'Property review',
  date: '',
  time: '',
})

export default function AdminCalendarPage() {
  const {
    loading,
    pendingProperties,
    pendingInvestments,
    contactMessages,
    refresh,
  } = useAdminDashboardData()

  const { createCalendarEvent, getCalendarEvents, deleteCalendarEvent } = useFirebase()
  const [customEvents, setCustomEvents] = useState([])

  const events = [
    ...pendingProperties.map((property) => ({
      id: `property-${property.id}`,
      type: 'Property review',
      title: property.title || property.name || 'Property submission',
      timestamp: property.createdAt || property.submittedAt,
      meta: property.location || property.address || 'Unspecified location',
    })),
    ...pendingInvestments.map((investment) => ({
      id: `investment-${investment.id}`,
      type: 'Investment review',
      title: investment.propertyTitle || investment.propertyName || 'Investment submission',
      timestamp: investment.investmentDate || investment.createdAt,
      meta: `PKR ${Number(investment.amount || investment.currentValue || 0).toLocaleString()}`,
    })),
    ...contactMessages.map((message) => ({
      id: `message-${message.id}`,
      type: 'Support ticket',
      title: message.subject || message.name || message.email || 'Contact message',
      timestamp: message.createdAt,
      meta: message.email || 'No email provided',
    })),
    ...customEvents.map((event) => ({
      id: event.id,
      type: event.type,
      title: event.title,
      timestamp: event.timestamp,
      meta: event.meta || 'Custom event',
      removable: true,
    })),
  ]
    .filter((event) => event.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  const processedEvents = useMemo(() => {
    const grouped = new Map()
    events.forEach((event) => {
      const dateKey = formatDate(event.timestamp)
      if (!dateKey) return
      const key = dateKey.toISOString().split('T')[0]
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key).push(event)
    })

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDay = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startDay; i += 1) {
      cells.push({ label: '', dateKey: null, events: [] })
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      const key = date.toISOString().split('T')[0]
      cells.push({
        label: day,
        dateKey: key,
        events: grouped.get(key) || [],
      })
    }
    return cells
  }, [events])

  const [eventForm, setEventForm] = useState(createInitialEvent())
  const [status, setStatus] = useState(null)

  const loadCustomEvents = async () => {
    const result = await getCalendarEvents()
    if (result.success) {
      setCustomEvents(result.events || [])
    }
  }

  useEffect(() => {
    loadCustomEvents()
  }, [])

  const handleEventSubmit = async (ev) => {
    ev.preventDefault()
    const { title, type, date, time } = eventForm
    if (!title || !date) {
      setStatus('Title and date are required.')
      return
    }

    const timestamp = new Date(`${date}T${time || '09:00'}`).toISOString()

    try {
      await createCalendarEvent({
        title,
        type,
        timestamp,
        meta: time ? `Starts at ${time}` : null,
      })
      setStatus('Event created. Refreshing…')
      setEventForm(createInitialEvent())
      await loadCustomEvents()
      await refresh()
    } catch (error) {
      setStatus(error.message || 'Failed to create event')
    }
  }

  const handleDeleteEvent = async (eventId) => {
    setStatus('Removing event…')
    const result = await deleteCalendarEvent(eventId)
    setStatus(result.success ? 'Event removed.' : result.error || 'Failed to remove event.')
    await loadCustomEvents()
    await refresh()
  }

  return (
    <AdminLayout
      title="Calendar"
      description="Track submission dates and priority follow-ups."
      metaTitle="Admin Calendar"
      onRefresh={refresh}
    >
      <div className={overviewStyles.section}>
        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Schedule an event</h2>
              <span>Create a reminder that will appear on the timeline</span>
            </div>
          </header>

          <form onSubmit={handleEventSubmit} className={overviewStyles.list}>
            <label className={overviewStyles.listItem} style={{ gap: '0.75rem' }}>
              <span className={overviewStyles.badge}>Title</span>
              <input
                required
                value={eventForm.title}
                onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Inspection at Maple Avenue"
                style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
              />
            </label>
            <label className={overviewStyles.listItem} style={{ gap: '0.75rem' }}>
              <span className={overviewStyles.badge}>Type</span>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value }))}
                style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
              >
                <option value="Property review">Property review</option>
                <option value="Investment review">Investment review</option>
                <option value="Support ticket">Support ticket</option>
              </select>
            </label>
            <label className={overviewStyles.listItem} style={{ gap: '0.75rem' }}>
              <span className={overviewStyles.badge}>Date</span>
              <input
                required
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
              />
            </label>
            <label className={overviewStyles.listItem} style={{ gap: '0.75rem' }}>
              <span className={overviewStyles.badge}>Time</span>
              <input
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))}
                style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
              />
            </label>
            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                background: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add event
            </button>
          </form>
        </section>

        <section className={overviewStyles.panel}>
          <header className={overviewStyles.panelHeader}>
            <div>
              <h2>Upcoming items</h2>
              <span>{events.length ? `${events.length} events queued` : 'No dated events'}</span>
            </div>
          </header>

          {loading ? (
            <div className={overviewStyles.emptyState}>Building calendar…</div>
          ) : processedEvents.length ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: '0.5rem',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: '0.5rem',
                }}
              >
                {processedEvents.map((cell, index) => (
                  <div
                    key={`${cell.dateKey || 'blank'}-${index}`}
                    style={{
                      minHeight: '90px',
                      borderRadius: '1rem',
                      border: cell.dateKey ? '1px solid #e5e7eb' : 'transparent',
                      background: '#fff',
                      boxShadow: cell.events.length ? '0 10px 24px rgba(15, 23, 42, 0.05)' : 'none',
                      padding: '0.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#475569' }}>{cell.label}</div>
                    <div style={{ display: 'grid', gap: '0.25rem' }}>
                    {cell.events.slice(0, 3).map((calendarEvent) => (
                      <div key={calendarEvent.id} style={{ display: 'grid', gap: '0.25rem' }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            padding: '0.3rem 0.45rem',
                            borderRadius: '0.6rem',
                            background: 'rgba(249, 115, 22, 0.12)',
                            color: '#b45309',
                            textAlign: 'left',
                          }}
                        >
                          {calendarEvent.title}
                        </span>
                        {calendarEvent.removable ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(calendarEvent.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#f97316',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                      {cell.events.length > 3 ? (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          +{cell.events.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={overviewStyles.emptyState}>No calendar events at the moment.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
