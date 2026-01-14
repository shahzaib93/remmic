import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import { getActivityLogs, logActivity } from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

const ACTION_TYPES = {
  TENANT_ADDED: 'tenant_added',
  TENANT_UPDATED: 'tenant_updated',
  TENANT_DEACTIVATED: 'tenant_deactivated',
  RENT_RECORDED: 'rent_recorded',
  RENT_UPDATED: 'rent_updated',
  MAINTENANCE_SUBMITTED: 'maintenance_submitted',
  MAINTENANCE_ASSIGNED: 'maintenance_assigned',
  MAINTENANCE_COMPLETED: 'maintenance_completed',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DELETED: 'document_deleted',
  PROPERTY_UPDATED: 'property_updated',
  NOTE_ADDED: 'note_added',
  STATUS_CHANGED: 'status_changed'
}

const ACTION_LABELS = {
  tenant_added: 'Tenant Added',
  tenant_updated: 'Tenant Updated',
  tenant_deactivated: 'Tenant Deactivated',
  rent_recorded: 'Rent Recorded',
  rent_updated: 'Rent Updated',
  maintenance_submitted: 'Maintenance Request',
  maintenance_assigned: 'Maintenance Assigned',
  maintenance_completed: 'Maintenance Completed',
  document_uploaded: 'Document Uploaded',
  document_deleted: 'Document Deleted',
  property_updated: 'Property Updated',
  note_added: 'Note Added',
  status_changed: 'Status Changed'
}

const ACTION_ICONS = {
  tenant_added: '👤',
  tenant_updated: '✏️',
  tenant_deactivated: '🚫',
  rent_recorded: '💰',
  rent_updated: '💵',
  maintenance_submitted: '🔧',
  maintenance_assigned: '👷',
  maintenance_completed: '✅',
  document_uploaded: '📄',
  document_deleted: '🗑️',
  property_updated: '🏠',
  note_added: '📝',
  status_changed: '🔄'
}

const ACTION_COLORS = {
  tenant_added: { bg: '#d1fae5', color: '#059669' },
  tenant_updated: { bg: '#dbeafe', color: '#2563eb' },
  tenant_deactivated: { bg: '#fee2e2', color: '#dc2626' },
  rent_recorded: { bg: '#d1fae5', color: '#059669' },
  rent_updated: { bg: '#fef3c7', color: '#d97706' },
  maintenance_submitted: { bg: '#fef3c7', color: '#d97706' },
  maintenance_assigned: { bg: '#e0e7ff', color: '#4f46e5' },
  maintenance_completed: { bg: '#d1fae5', color: '#059669' },
  document_uploaded: { bg: '#dbeafe', color: '#2563eb' },
  document_deleted: { bg: '#fee2e2', color: '#dc2626' },
  property_updated: { bg: '#e0e7ff', color: '#4f46e5' },
  note_added: { bg: '#f3e8ff', color: '#9333ea' },
  status_changed: { bg: '#fef3c7', color: '#d97706' }
}

export default function ActivityLogs() {
  const router = useRouter()
  const { id: propertyId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [selectedAction, setSelectedAction] = useState('all')
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [adding, setAdding] = useState(false)

  const loadData = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    try {
      // Load property
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []
      const foundProperty = storedProperties.find(p => p.id === propertyId)
      setProperty(foundProperty || { id: propertyId, title: 'Property' })

      // Load activity logs
      const logsResult = await getActivityLogs('property', propertyId)
      if (logsResult.success) {
        // Sort by date descending
        const sortedLogs = (logsResult.logs || []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setLogs(sortedLogs)
        setFilteredLogs(sortedLogs)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let filtered = [...logs]

    // Filter by action type
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction)
    }

    // Filter by date range
    if (dateFilter.start) {
      const startDate = new Date(dateFilter.start)
      startDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter(log => new Date(log.createdAt) >= startDate)
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(log => new Date(log.createdAt) <= endDate)
    }

    setFilteredLogs(filtered)
  }, [logs, selectedAction, dateFilter])

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return

    setAdding(true)
    try {
      const result = await logActivity({
        entityType: 'property',
        entityId: propertyId,
        action: ACTION_TYPES.NOTE_ADDED,
        description: noteText.trim(),
        changedBy: user?.uid || 'anonymous',
        changedByName: user?.displayName || user?.email || 'Admin'
      })

      if (result.success) {
        setLogs(prev => [result.log, ...prev])
        setNoteText('')
        setShowAddNoteModal(false)
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setAdding(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateStr)
  }

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = formatDate(log.createdAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  const actionCounts = Object.values(ACTION_TYPES).reduce((acc, action) => {
    acc[action] = logs.filter(l => l.action === action).length
    return acc
  }, {})

  return (
    <>
      <Head>
        <title>Activity Logs | REMMIC</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href={`/management/property/${propertyId}`} style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            Back to Property Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#1f2937' }}>Activity Logs</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                {logs.length} total activities recorded
              </p>
            </div>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className={styles.actionButtonPrimary}
              style={{ padding: '0.75rem 1.25rem' }}
            >
              + Add Note
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Filters</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Action Type</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', minWidth: 180 }}
              >
                <option value="all">All Actions ({logs.length})</option>
                {Object.entries(ACTION_TYPES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {ACTION_LABELS[value]} ({actionCounts[value] || 0})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Start Date</label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>End Date</label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
              />
            </div>
            <button
              onClick={() => {
                setSelectedAction('all')
                setDateFilter({ start: '', end: '' })
              }}
              className={styles.actionButtonSecondary}
              style={{ padding: '0.5rem 1rem' }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className={styles.panel} style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {logs.length === 0 ? 'No activity recorded yet' : 'No activities match your filters'}
            </p>
            {logs.length > 0 && (
              <button
                onClick={() => {
                  setSelectedAction('all')
                  setDateFilter({ start: '', end: '' })
                }}
                className={styles.actionButtonSecondary}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.panel}>
            {Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <div key={date} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  margin: '0 0 1rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #e5e7eb',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  position: 'sticky',
                  top: 0,
                  background: 'white'
                }}>
                  {date}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dayLogs.map((log, index) => (
                    <div
                      key={log.id || index}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: '#fafafa',
                        borderRadius: '0.75rem',
                        borderLeft: `4px solid ${ACTION_COLORS[log.action]?.color || '#6b7280'}`
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: ACTION_COLORS[log.action]?.bg || '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {ACTION_ICONS[log.action] || '📌'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: ACTION_COLORS[log.action]?.bg || '#f3f4f6',
                            color: ACTION_COLORS[log.action]?.color || '#6b7280'
                          }}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {formatTime(log.createdAt)} ({formatRelativeTime(log.createdAt)})
                          </span>
                        </div>
                        <p style={{ margin: '0.5rem 0', color: '#374151', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {log.description || 'No description'}
                        </p>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                            {log.metadata.tenantName && <span>Tenant: {log.metadata.tenantName} | </span>}
                            {log.metadata.amount && <span>Amount: PKR {log.metadata.amount.toLocaleString()} | </span>}
                            {log.metadata.status && <span>Status: {log.metadata.status}</span>}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                          By: {log.changedByName || log.changedBy || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(249, 115, 22, 0.05)',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          Activity logs are immutable and cannot be edited or deleted. REMMIC provides coordination and reporting services only.
        </div>
      </main>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: 500,
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 1.5rem' }}>Add Admin Note</h2>
            <form onSubmit={handleAddNote}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Note *</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your note or observation..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                  required
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  This note will be permanently recorded in the activity log.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddNoteModal(false)
                    setNoteText('')
                  }}
                  className={styles.actionButtonSecondary}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !noteText.trim()}
                  className={styles.actionButtonPrimary}
                  style={{ flex: 1 }}
                >
                  {adding ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
