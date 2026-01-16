import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import { useFirebase } from '../../contexts/FirebaseContext'

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
      <div className="grid gap-7">
        {/* Schedule Event Form */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5 max-h-[450px] overflow-hidden">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Schedule an event</h2>
              <span className="text-gray-400 text-sm">Create a reminder that will appear on the timeline</span>
            </div>
          </header>

          <form onSubmit={handleEventSubmit} className="grid gap-4">
            <label className="grid grid-cols-[auto_1fr] gap-3 items-center py-3.5 border-b border-slate-200/55">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-xs font-semibold uppercase tracking-wide border border-[rgba(201,162,39,0.2)]">Title</span>
              <input
                required
                value={eventForm.title}
                onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Inspection at Maple Avenue"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </label>
            <label className="grid grid-cols-[auto_1fr] gap-3 items-center py-3.5 border-b border-slate-200/55">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-xs font-semibold uppercase tracking-wide border border-[rgba(201,162,39,0.2)]">Type</span>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value }))}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="Property review">Property review</option>
                <option value="Investment review">Investment review</option>
                <option value="Support ticket">Support ticket</option>
              </select>
            </label>
            <label className="grid grid-cols-[auto_1fr] gap-3 items-center py-3.5 border-b border-slate-200/55">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-xs font-semibold uppercase tracking-wide border border-[rgba(201,162,39,0.2)]">Date</span>
              <input
                required
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </label>
            <label className="grid grid-cols-[auto_1fr] gap-3 items-center py-3.5 border-b border-slate-200/55">
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-xs font-semibold uppercase tracking-wide border border-[rgba(201,162,39,0.2)]">Time</span>
              <input
                type="time"
                value={eventForm.time}
                onChange={(e) => setEventForm((prev) => ({ ...prev, time: e.target.value }))}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </label>
            <button
              type="submit"
              className="self-start bg-orange-500 text-white border-none px-5 py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-orange-600 transition-colors"
            >
              Add event
            </button>
          </form>
        </section>

        {/* Calendar Section */}
        <section className="bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 flex flex-col gap-5">
          <header className="flex justify-between items-center gap-4">
            <div>
              <h2 className="m-0 text-lg font-semibold text-gray-900">Upcoming items</h2>
              <span className="text-gray-400 text-sm">{events.length ? `${events.length} events queued` : 'No dated events'}</span>
            </div>
          </header>

          {loading ? (
            <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">Building calendar…</div>
          ) : processedEvents.length ? (
            <div className="grid gap-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-slate-400 text-xs font-semibold">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-2">
                {processedEvents.map((cell, index) => (
                  <div
                    key={`${cell.dateKey || 'blank'}-${index}`}
                    className={`min-h-[90px] rounded-2xl bg-white p-2.5 flex flex-col gap-1 ${cell.dateKey ? 'border border-gray-200' : ''} ${cell.events.length ? 'shadow-[0_10px_24px_rgba(15,23,42,0.05)]' : ''}`}
                  >
                    <div className="font-semibold text-slate-600">{cell.label}</div>
                    <div className="grid gap-1">
                      {cell.events.slice(0, 3).map((calendarEvent) => (
                        <div key={calendarEvent.id} className="grid gap-1">
                          <span className="block text-xs px-1.5 py-1 rounded-lg bg-orange-500/10 text-amber-700 text-left">
                            {calendarEvent.title}
                          </span>
                          {calendarEvent.removable ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(calendarEvent.id)}
                              className="border-none bg-transparent text-orange-500 text-[0.7rem] text-left cursor-pointer hover:underline"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      ))}
                      {cell.events.length > 3 ? (
                        <span className="text-xs text-slate-400">
                          +{cell.events.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No calendar events at the moment.</div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
