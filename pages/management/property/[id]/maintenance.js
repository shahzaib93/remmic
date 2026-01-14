import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import {
  getMaintenanceRequests,
  addMaintenanceRequest,
  assignMaintenance,
  completeMaintenance,
  MAINTENANCE_STATUS,
  MAINTENANCE_URGENCY
} from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

const STATUS_COLORS = {
  [MAINTENANCE_STATUS.SUBMITTED]: { bg: '#e0e7ff', color: '#4338ca' },
  [MAINTENANCE_STATUS.ASSIGNED]: { bg: '#fef3c7', color: '#d97706' },
  [MAINTENANCE_STATUS.IN_PROGRESS]: { bg: '#dbeafe', color: '#2563eb' },
  [MAINTENANCE_STATUS.COMPLETED]: { bg: '#d1fae5', color: '#059669' },
}

const URGENCY_COLORS = {
  [MAINTENANCE_URGENCY.LOW]: { bg: '#d1fae5', color: '#059669' },
  [MAINTENANCE_URGENCY.MEDIUM]: { bg: '#fef3c7', color: '#d97706' },
  [MAINTENANCE_URGENCY.HIGH]: { bg: '#fee2e2', color: '#dc2626' },
}

const REQUEST_TYPES = ['plumbing', 'electrical', 'general', 'hvac', 'painting', 'roofing', 'other']

export default function MaintenanceManagement() {
  const router = useRouter()
  const { id: propertyId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  const [requestForm, setRequestForm] = useState({
    requestType: 'general',
    description: '',
    urgency: MAINTENANCE_URGENCY.MEDIUM,
    reporterContact: ''
  })

  const [assignForm, setAssignForm] = useState({
    assignedTo: '',
    assignedToName: '',
    estimatedCost: ''
  })

  const [completeForm, setCompleteForm] = useState({
    finalCost: '',
    notes: ''
  })

  const loadData = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    try {
      const result = await getMaintenanceRequests(propertyId)
      if (result.success) setRequests(result.requests || [])
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
    if (actionNotice) {
      const timer = setTimeout(() => setActionNotice(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [actionNotice])

  const handleAddRequest = async (e) => {
    e.preventDefault()
    try {
      const result = await addMaintenanceRequest({
        ...requestForm,
        propertyId,
        userId: user?.uid,
        reportedBy: user?.uid
      })

      if (result.success) {
        setActionNotice({ type: 'success', message: 'Maintenance request submitted!' })
        setShowAddModal(false)
        setRequestForm({ requestType: 'general', description: '', urgency: MAINTENANCE_URGENCY.MEDIUM, reporterContact: '' })
        loadData()
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    try {
      const result = await assignMaintenance(selectedRequest.id, {
        ...assignForm,
        estimatedCost: parseFloat(assignForm.estimatedCost) || 0
      })

      if (result.success) {
        setActionNotice({ type: 'success', message: 'Request assigned successfully!' })
        setShowAssignModal(false)
        setSelectedRequest(null)
        setAssignForm({ assignedTo: '', assignedToName: '', estimatedCost: '' })
        loadData()
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const handleComplete = async (e) => {
    e.preventDefault()
    if (!selectedRequest) return

    try {
      const result = await completeMaintenance(selectedRequest.id, {
        finalCost: parseFloat(completeForm.finalCost) || 0,
        notes: completeForm.notes
      })

      if (result.success) {
        setActionNotice({ type: 'success', message: 'Request marked as completed!' })
        setShowCompleteModal(false)
        setSelectedRequest(null)
        setCompleteForm({ finalCost: '', notes: '' })
        loadData()
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const stats = {
    total: requests.length,
    submitted: requests.filter(r => r.status === MAINTENANCE_STATUS.SUBMITTED).length,
    assigned: requests.filter(r => r.status === MAINTENANCE_STATUS.ASSIGNED).length,
    inProgress: requests.filter(r => r.status === MAINTENANCE_STATUS.IN_PROGRESS).length,
    completed: requests.filter(r => r.status === MAINTENANCE_STATUS.COMPLETED).length,
  }

  return (
    <>
      <Head>
        <title>Maintenance Management | REMMIC</title>
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
            <h1 style={{ margin: 0, color: '#1f2937' }}>Maintenance & Service Requests</h1>
            <button onClick={() => setShowAddModal(true)} className={styles.actionButtonPrimary} style={{ padding: '0.75rem 1.25rem' }}>
              + New Request
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className={actionNotice.type === 'success' ? styles.actionNoticeSuccess : styles.actionNoticeError} style={{ marginBottom: '1.5rem' }}>
            {actionNotice.message}
          </div>
        )}

        {/* Stats */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard} style={{ cursor: 'pointer' }} onClick={() => setFilter('all')}>
            <h3>Total</h3>
            <div className={styles.metricValue}>{stats.total}</div>
          </div>
          <div className={styles.metricCard} style={{ cursor: 'pointer' }} onClick={() => setFilter(MAINTENANCE_STATUS.SUBMITTED)}>
            <h3>Submitted</h3>
            <div className={styles.metricValue} style={{ color: '#4338ca' }}>{stats.submitted}</div>
          </div>
          <div className={styles.metricCard} style={{ cursor: 'pointer' }} onClick={() => setFilter(MAINTENANCE_STATUS.IN_PROGRESS)}>
            <h3>In Progress</h3>
            <div className={styles.metricValue} style={{ color: '#2563eb' }}>{stats.assigned + stats.inProgress}</div>
          </div>
          <div className={styles.metricCard} style={{ cursor: 'pointer' }} onClick={() => setFilter(MAINTENANCE_STATUS.COMPLETED)}>
            <h3>Completed</h3>
            <div className={styles.metricValue} style={{ color: '#059669' }}>{stats.completed}</div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {filteredRequests.length === 0 ? (
              <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                No maintenance requests found
              </div>
            ) : (
              filteredRequests.map(request => (
                <div key={request.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <h3 style={{ textTransform: 'capitalize' }}>{request.requestType}</h3>
                    <div className={styles.requestBadges}>
                      <span style={{ ...STATUS_COLORS[request.status], padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {request.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ ...URGENCY_COLORS[request.urgency], padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {request.urgency?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className={styles.requestDescription}>{request.description}</p>

                  <div className={styles.requestDetails}>
                    {request.assignedToName && (
                      <div className={styles.requestField}>
                        <strong>Assigned to:</strong> {request.assignedToName}
                      </div>
                    )}
                    {request.estimatedCost && (
                      <div className={styles.requestField}>
                        <strong>Estimated Cost:</strong> {formatCurrency(request.estimatedCost)}
                      </div>
                    )}
                    {request.finalCost && (
                      <div className={styles.requestField}>
                        <strong>Final Cost:</strong> {formatCurrency(request.finalCost)}
                      </div>
                    )}
                  </div>

                  <div className={styles.requestActions}>
                    {request.status === MAINTENANCE_STATUS.SUBMITTED && (
                      <button
                        onClick={() => { setSelectedRequest(request); setShowAssignModal(true) }}
                        className={styles.actionButtonPrimary}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        Assign
                      </button>
                    )}
                    {(request.status === MAINTENANCE_STATUS.ASSIGNED || request.status === MAINTENANCE_STATUS.IN_PROGRESS) && (
                      <button
                        onClick={() => { setSelectedRequest(request); setCompleteForm({ finalCost: request.estimatedCost || '', notes: '' }); setShowCompleteModal(true) }}
                        className={styles.actionButtonPrimary}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>

                  <div className={styles.requestMeta}>
                    <span>Created: {formatDate(request.createdAt)}</span>
                    {request.completedAt && <span>Completed: {formatDate(request.completedAt)}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Request Modal */}
        {showAddModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>New Maintenance Request</h2>
                  <span>Submit a maintenance request</span>
                </div>
                <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>Close</button>
              </div>
              <form onSubmit={handleAddRequest}>
                <div className={styles.modalBody}>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Request Type *</label>
                      <select
                        className={styles.modalInput}
                        value={requestForm.requestType}
                        onChange={(e) => setRequestForm({ ...requestForm, requestType: e.target.value })}
                        required
                      >
                        {REQUEST_TYPES.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.modalField}>
                      <label>Urgency *</label>
                      <select
                        className={styles.modalInput}
                        value={requestForm.urgency}
                        onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                        required
                      >
                        <option value={MAINTENANCE_URGENCY.LOW}>Low</option>
                        <option value={MAINTENANCE_URGENCY.MEDIUM}>Medium</option>
                        <option value={MAINTENANCE_URGENCY.HIGH}>High</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <label>Description *</label>
                    <textarea
                      className={styles.modalTextarea}
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </div>
                  <div className={styles.modalField}>
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      className={styles.modalInput}
                      value={requestForm.reporterContact}
                      onChange={(e) => setRequestForm({ ...requestForm, reporterContact: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionButtonSecondary} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className={styles.actionButtonPrimary}>Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && selectedRequest && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>Assign Request</h2>
                  <span>{selectedRequest.requestType}</span>
                </div>
                <button className={styles.modalClose} onClick={() => { setShowAssignModal(false); setSelectedRequest(null) }}>Close</button>
              </div>
              <form onSubmit={handleAssign}>
                <div className={styles.modalBody}>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Assignee Name *</label>
                      <input
                        type="text"
                        className={styles.modalInput}
                        value={assignForm.assignedToName}
                        onChange={(e) => setAssignForm({ ...assignForm, assignedToName: e.target.value, assignedTo: e.target.value })}
                        placeholder="Contractor or technician name"
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Estimated Cost (PKR)</label>
                      <input
                        type="number"
                        className={styles.modalInput}
                        value={assignForm.estimatedCost}
                        onChange={(e) => setAssignForm({ ...assignForm, estimatedCost: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionButtonSecondary} onClick={() => { setShowAssignModal(false); setSelectedRequest(null) }}>Cancel</button>
                  <button type="submit" className={styles.actionButtonPrimary}>Assign</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complete Modal */}
        {showCompleteModal && selectedRequest && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>Complete Request</h2>
                  <span>{selectedRequest.requestType}</span>
                </div>
                <button className={styles.modalClose} onClick={() => { setShowCompleteModal(false); setSelectedRequest(null) }}>Close</button>
              </div>
              <form onSubmit={handleComplete}>
                <div className={styles.modalBody}>
                  <div className={styles.modalField}>
                    <label>Final Cost (PKR) *</label>
                    <input
                      type="number"
                      className={styles.modalInput}
                      value={completeForm.finalCost}
                      onChange={(e) => setCompleteForm({ ...completeForm, finalCost: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.modalField}>
                    <label>Completion Notes</label>
                    <textarea
                      className={styles.modalTextarea}
                      value={completeForm.notes}
                      onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                      placeholder="Notes about the completed work..."
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionButtonSecondary} onClick={() => { setShowCompleteModal(false); setSelectedRequest(null) }}>Cancel</button>
                  <button type="submit" className={styles.actionButtonPrimary}>Mark Complete</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
