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
            <button onClick={() => setShowAddModal(true)} className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" style={{ padding: '0.75rem 1.25rem' }}>
              + New Request
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className={actionNotice.type === 'success' ? 'mt-4 px-4 py-2.5 rounded-[0.9rem] text-[0.82rem] font-medium flex items-center gap-2 bg-green-500/[0.12] text-emerald-700 border border-green-500/[0.18] mb-6' : 'mt-4 px-4 py-2.5 rounded-[0.9rem] text-[0.82rem] font-medium flex items-center gap-2 bg-red-300/[0.12] text-red-700 border border-red-300/20 mb-6'}>
            {actionNotice.message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-8">
          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)] cursor-pointer" onClick={() => setFilter('all')}>
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Total</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)] cursor-pointer" onClick={() => setFilter(MAINTENANCE_STATUS.SUBMITTED)}>
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Submitted</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-indigo-700">{stats.submitted}</div>
          </div>
          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)] cursor-pointer" onClick={() => setFilter(MAINTENANCE_STATUS.IN_PROGRESS)}>
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">In Progress</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-blue-600">{stats.assigned + stats.inProgress}</div>
          </div>
          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)] cursor-pointer" onClick={() => setFilter(MAINTENANCE_STATUS.COMPLETED)}>
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Completed</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-emerald-600">{stats.completed}</div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            {filteredRequests.length === 0 ? (
              <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]" style={{ gridColumn: '1 / -1' }}>
                No maintenance requests found
              </div>
            ) : (
              filteredRequests.map(request => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 style={{ textTransform: 'capitalize' }}>{request.requestType}</h3>
                    <div className="flex gap-2">
                      <span style={{ ...STATUS_COLORS[request.status], padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {request.status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ ...URGENCY_COLORS[request.urgency], padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {request.urgency?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="bg-gray-50 p-3 rounded-md text-[0.85rem] text-gray-600 mb-4 border border-gray-200">{request.description}</p>

                  <div className="grid gap-2 mb-4">
                    {request.assignedToName && (
                      <div className="text-[0.85rem] text-gray-500">
                        <strong>Assigned to:</strong> {request.assignedToName}
                      </div>
                    )}
                    {request.estimatedCost && (
                      <div className="text-[0.85rem] text-gray-500">
                        <strong>Estimated Cost:</strong> {formatCurrency(request.estimatedCost)}
                      </div>
                    )}
                    {request.finalCost && (
                      <div className="text-[0.85rem] text-gray-500">
                        <strong>Final Cost:</strong> {formatCurrency(request.finalCost)}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mb-4">
                    {request.status === MAINTENANCE_STATUS.SUBMITTED && (
                      <button
                        onClick={() => { setSelectedRequest(request); setShowAssignModal(true) }}
                        className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        Assign
                      </button>
                    )}
                    {(request.status === MAINTENANCE_STATUS.ASSIGNED || request.status === MAINTENANCE_STATUS.IN_PROGRESS) && (
                      <button
                        onClick={() => { setSelectedRequest(request); setCompleteForm({ finalCost: request.estimatedCost || '', notes: '' }); setShowCompleteModal(true) }}
                        className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3">
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
          <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-6 z-[1000]">
            <div className="bg-white rounded-3xl w-[min(640px,100%)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.35)] max-sm:w-full max-sm:max-h-[95vh] max-sm:rounded-2xl">
              <div className="p-5 border-b border-slate-300/20 flex justify-between gap-4 items-start">
                <div>
                  <h2>New Maintenance Request</h2>
                  <span>Submit a maintenance request</span>
                </div>
                <button className="border-none bg-transparent text-slate-600 text-[0.85rem] font-semibold cursor-pointer" onClick={() => setShowAddModal(false)}>Close</button>
              </div>
              <form onSubmit={handleAddRequest}>
                <div className="p-6 overflow-y-auto flex flex-col gap-4 max-sm:p-4">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Request Type *</label>
                      <select
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={requestForm.requestType}
                        onChange={(e) => setRequestForm({ ...requestForm, requestType: e.target.value })}
                        required
                      >
                        {REQUEST_TYPES.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Urgency *</label>
                      <select
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
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
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Description *</label>
                    <textarea
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all resize-y min-h-24 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={requestForm.reporterContact}
                      onChange={(e) => setRequestForm({ ...requestForm, reporterContact: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-300/20 bg-slate-50 max-sm:flex-col max-sm:items-stretch">
                  <button type="button" className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-6 z-[1000]">
            <div className="bg-white rounded-3xl w-[min(640px,100%)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.35)] max-sm:w-full max-sm:max-h-[95vh] max-sm:rounded-2xl">
              <div className="p-5 border-b border-slate-300/20 flex justify-between gap-4 items-start">
                <div>
                  <h2>Assign Request</h2>
                  <span>{selectedRequest.requestType}</span>
                </div>
                <button className="border-none bg-transparent text-slate-600 text-[0.85rem] font-semibold cursor-pointer" onClick={() => { setShowAssignModal(false); setSelectedRequest(null) }}>Close</button>
              </div>
              <form onSubmit={handleAssign}>
                <div className="p-6 overflow-y-auto flex flex-col gap-4 max-sm:p-4">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Assignee Name *</label>
                      <input
                        type="text"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={assignForm.assignedToName}
                        onChange={(e) => setAssignForm({ ...assignForm, assignedToName: e.target.value, assignedTo: e.target.value })}
                        placeholder="Contractor or technician name"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Estimated Cost (PKR)</label>
                      <input
                        type="number"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={assignForm.estimatedCost}
                        onChange={(e) => setAssignForm({ ...assignForm, estimatedCost: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-300/20 bg-slate-50 max-sm:flex-col max-sm:items-stretch">
                  <button type="button" className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]" onClick={() => { setShowAssignModal(false); setSelectedRequest(null) }}>Cancel</button>
                  <button type="submit" className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">Assign</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Complete Modal */}
        {showCompleteModal && selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-6 z-[1000]">
            <div className="bg-white rounded-3xl w-[min(640px,100%)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.35)] max-sm:w-full max-sm:max-h-[95vh] max-sm:rounded-2xl">
              <div className="p-5 border-b border-slate-300/20 flex justify-between gap-4 items-start">
                <div>
                  <h2>Complete Request</h2>
                  <span>{selectedRequest.requestType}</span>
                </div>
                <button className="border-none bg-transparent text-slate-600 text-[0.85rem] font-semibold cursor-pointer" onClick={() => { setShowCompleteModal(false); setSelectedRequest(null) }}>Close</button>
              </div>
              <form onSubmit={handleComplete}>
                <div className="p-6 overflow-y-auto flex flex-col gap-4 max-sm:p-4">
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Final Cost (PKR) *</label>
                    <input
                      type="number"
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={completeForm.finalCost}
                      onChange={(e) => setCompleteForm({ ...completeForm, finalCost: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Completion Notes</label>
                    <textarea
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all resize-y min-h-24 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={completeForm.notes}
                      onChange={(e) => setCompleteForm({ ...completeForm, notes: e.target.value })}
                      placeholder="Notes about the completed work..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-300/20 bg-slate-50 max-sm:flex-col max-sm:items-stretch">
                  <button type="button" className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]" onClick={() => { setShowCompleteModal(false); setSelectedRequest(null) }}>Cancel</button>
                  <button type="submit" className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">Mark Complete</button>
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
