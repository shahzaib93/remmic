import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAllBiddingPayments, updateBiddingPaymentStatus } from '../../lib/firebase'

const STATUS_META = {
  pending: { label: 'Pending Review', color: '#b45309', background: '#fef3c7' },
  approved: { label: 'Approved', color: '#047857', background: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#b91c1c', background: '#fee2e2' },
}

const formatDateTime = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
}

const normalizeStatus = (status) => (status ? String(status).toLowerCase() : 'pending')

export default function BiddingFeesAdmin() {
  const router = useRouter()
  const [adminInfo, setAdminInfo] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getAllBiddingPayments()
      if (!result.success) {
        throw new Error(result.error || 'Failed to load bidding payments')
      }
      const normalized = (result.payments || [])
        .map((payment) => ({
          ...payment,
          status: normalizeStatus(payment.status),
          createdAt: payment.createdAt || payment.paidAt || payment.submittedAt || null,
        }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      setPayments(normalized)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load bidding fee submissions right now.')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const isAdmin = window.localStorage.getItem('isAdmin')
    if (isAdmin !== 'true') {
      router.replace('/admin')
      return
    }

    try {
      const stored = window.localStorage.getItem('adminUser')
      if (stored) {
        setAdminInfo(JSON.parse(stored))
      }
    } catch (parseError) {
      console.warn('Failed to parse stored admin user:', parseError)
    }

    loadPayments()

    const handleStorage = (event) => {
      if (!event || !event.key || event.key === 'biddingFeePayments') {
        loadPayments()
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('biddingFeePaymentsUpdated', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('biddingFeePaymentsUpdated', handleStorage)
    }
  }, [loadPayments, router])

  const filteredPayments = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase()

    return payments.filter((payment) => {
      const status = normalizeStatus(payment.status)
      if (filter !== 'all' && status !== filter) {
        return false
      }
      if (!trimmedSearch) {
        return true
      }

      const haystack = [
        payment.fullName,
        payment.email,
        payment.phone,
        payment.cnic,
        payment.propertyId,
        payment.transactionReference,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(trimmedSearch)
    })
  }, [filter, payments, search])

  useEffect(() => {
    if (!filteredPayments.length) {
      setSelectedPayment(null)
      setNoteDraft('')
      return
    }

    setSelectedPayment((current) => {
      if (!current) {
        return filteredPayments[0]
      }
      const stillVisible = filteredPayments.find((payment) => payment.id === current.id)
      return stillVisible || filteredPayments[0]
    })
  }, [filteredPayments])

  useEffect(() => {
    if (!selectedPayment) {
      setNoteDraft('')
      return
    }
    setNoteDraft(selectedPayment.adminNote || '')
  }, [selectedPayment?.adminNote, selectedPayment?.id])

  const stats = useMemo(() => {
    return payments.reduce((acc, payment) => {
      const status = normalizeStatus(payment.status)
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, { pending: 0, approved: 0, rejected: 0 })
  }, [payments])

  const handleStatusChange = async (payment, nextStatus) => {
    if (!payment || normalizeStatus(payment.status) === nextStatus) {
      return
    }

    try {
      setActionLoading(true)
      setError('')
      const adminName = adminInfo?.name || adminInfo?.fullName || 'Admin'
      const adminId = adminInfo?.id || adminInfo?.uid || adminInfo?.email || null
      const trimmedNote = noteDraft.trim()

      const result = await updateBiddingPaymentStatus(payment.id, nextStatus, {
        adminNote: trimmedNote,
        reviewedBy: adminName,
        reviewedById: adminId,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update status')
      }

      const timestamp = new Date().toISOString()
      setPayments((prev) => prev.map((item) => {
        if (item.id !== payment.id) {
          return item
        }
        return {
          ...item,
          status: nextStatus,
          adminNote: trimmedNote || undefined,
          reviewedBy: adminName,
          reviewedById: adminId,
          reviewedAt: timestamp,
          updatedAt: timestamp,
          approvedAt: nextStatus === 'approved' ? timestamp : null,
          rejectedAt: nextStatus === 'rejected' ? timestamp : null,
        }
      }))

      setSelectedPayment((current) => {
        if (!current || current.id !== payment.id) {
          return current
        }
        return {
          ...current,
          status: nextStatus,
          adminNote: trimmedNote || undefined,
          reviewedBy: adminName,
          reviewedById: adminId,
          reviewedAt: timestamp,
          updatedAt: timestamp,
          approvedAt: nextStatus === 'approved' ? timestamp : null,
          rejectedAt: nextStatus === 'rejected' ? timestamp : null,
        }
      })
    } catch (err) {
      setError(err.message || 'Failed to update submission status.')
    } finally {
      setActionLoading(false)
    }
  }

  const renderStatusChip = (status) => {
    const meta = STATUS_META[normalizeStatus(status)] || STATUS_META.pending
    return (
      <span
        style={{
          background: meta.background,
          color: meta.color,
          borderRadius: '999px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}
      >
        {meta.label}
      </span>
    )
  }

  return (
    <AdminLayout
      title="Bidding Fee Approvals"
      description="Review bidding fee submissions and unlock bidding access once verified."
      onRefresh={loadPayments}
    >
      <div style={{ display: 'grid', gap: '24px' }}>
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          <div style={{ background: '#111827', color: 'white', borderRadius: '16px', padding: '20px' }}>
            <div style={{ opacity: 0.7, fontSize: '13px' }}>Total Submissions</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{payments.length}</div>
          </div>
          <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '20px', color: '#92400e' }}>
            <div style={{ opacity: 0.7, fontSize: '13px' }}>Awaiting Review</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.pending || 0}</div>
          </div>
          <div style={{ background: '#dcfce7', borderRadius: '16px', padding: '20px', color: '#047857' }}>
            <div style={{ opacity: 0.7, fontSize: '13px' }}>Approved</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.approved || 0}</div>
          </div>
          <div style={{ background: '#fee2e2', borderRadius: '16px', padding: '20px', color: '#b91c1c' }}>
            <div style={{ opacity: 0.7, fontSize: '13px' }}>Rejected</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{stats.rejected || 0}</div>
          </div>
        </section>

        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 40px rgba(15, 23, 42, 0.08)' }}>
          <header style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Fee Submissions</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
                {['all', 'pending', 'approved', 'rejected'].map((option) => {
                  const active = filter === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        border: 'none',
                        background: active ? '#111827' : 'transparent',
                        color: active ? 'white' : '#4b5563',
                        cursor: 'pointer',
                      }}
                    >
                      {option === 'all' ? 'All' : STATUS_META[option].label}
                    </button>
                  )
                })}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="search"
                  placeholder="Search bidder, CNIC, or reference"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{
                    padding: '10px 38px 10px 16px',
                    borderRadius: '999px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                  }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                  &#128269;
                </span>
              </div>
            </div>
          </header>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#b91c1c',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(260px, 360px) 1fr' }}>
            <div
              style={{
                borderRight: '1px solid #f3f4f6',
                paddingRight: '20px',
                maxHeight: '520px',
                overflowY: 'auto',
              }}
            >
              {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>Loading submissions...</div>
              ) : filteredPayments.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280' }}>
                  No submissions found for the selected filters.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {filteredPayments.map((payment) => {
                    const status = normalizeStatus(payment.status)
                    const isSelected = selectedPayment?.id === payment.id
                    return (
                      <button
                        key={payment.id}
                        type="button"
                        onClick={() => setSelectedPayment(payment)}
                        style={{
                          textAlign: 'left',
                          border: '1px solid ' + (isSelected ? '#111827' : '#e5e7eb'),
                          background: isSelected ? '#111827' : 'white',
                          color: isSelected ? 'white' : '#111827',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '15px' }}>{payment.fullName || 'Unnamed Bidder'}</strong>
                          {renderStatusChip(status)}
                        </div>
                        <div style={{ fontSize: '12px', opacity: isSelected ? 0.8 : 0.6 }}>
                          Ref: {payment.transactionReference || '--'}
                        </div>
                        <div style={{ fontSize: '12px', opacity: isSelected ? 0.8 : 0.6 }}>
                          Submitted: {formatDateTime(payment.createdAt || payment.paidAt)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ minHeight: '360px', display: 'grid', gap: '16px' }}>
              {!selectedPayment ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '16px' }}>
                  Select a submission to review the bidder details.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{selectedPayment.fullName || 'Unnamed Bidder'}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                        {(selectedPayment.email || 'No email provided') + ' | ' + (selectedPayment.phone || 'No phone provided')}
                      </p>
                    </div>
                    {renderStatusChip(selectedPayment.status)}
                  </div>

                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'grid',
                      gap: '16px',
                      background: '#f9fafb',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Property ID</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedPayment.propertyId || '--'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Transaction Ref</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedPayment.transactionReference || '--'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Payment Method</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedPayment.paymentMethod || '--'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Sender Account</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedPayment.senderAccount || '--'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>CNIC</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedPayment.cnic || '--'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Fee Amount</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedPayment.feeAmount ? 'Rs ' + Number(selectedPayment.feeAmount).toLocaleString() : '--'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Submitted At</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{formatDateTime(selectedPayment.createdAt || selectedPayment.paidAt)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Reviewed At</div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{formatDateTime(selectedPayment.reviewedAt || selectedPayment.updatedAt)}</div>
                      </div>
                    </div>

                    {selectedPayment.paymentNotes && (
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Payment Notes</div>
                        <div style={{ fontSize: '14px', marginTop: '6px', color: '#374151' }}>{selectedPayment.paymentNotes}</div>
                      </div>
                    )}

                    {selectedPayment.paymentSlipName && (
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.08em' }}>Upload</div>
                        <div style={{ fontSize: '14px', marginTop: '6px', color: '#374151' }}>{selectedPayment.paymentSlipName}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }} htmlFor="admin-note">
                      Admin note (visible to internal team only)
                    </label>
                    <textarea
                      id="admin-note"
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      rows={3}
                      placeholder="Add a short note about the verification outcome"
                      style={{
                        resize: 'vertical',
                        minHeight: '90px',
                        borderRadius: '12px',
                        border: '1px solid #d1d5db',
                        padding: '12px',
                        fontSize: '14px',
                        color: '#111827',
                      }}
                    />

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedPayment, 'approved')}
                        disabled={actionLoading || normalizeStatus(selectedPayment.status) === 'approved'}
                        style={{
                          padding: '10px 18px',
                          background: '#111827',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          fontWeight: 600,
                          cursor: actionLoading ? 'wait' : 'pointer',
                          opacity: actionLoading || normalizeStatus(selectedPayment.status) === 'approved' ? 0.6 : 1,
                        }}
                      >
                        Approve & Unlock Bidding
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedPayment, 'rejected')}
                        disabled={actionLoading || normalizeStatus(selectedPayment.status) === 'rejected'}
                        style={{
                          padding: '10px 18px',
                          background: 'white',
                          color: '#b91c1c',
                          borderRadius: '12px',
                          border: '1px solid #fca5a5',
                          fontWeight: 600,
                          cursor: actionLoading ? 'wait' : 'pointer',
                          opacity: actionLoading || normalizeStatus(selectedPayment.status) === 'rejected' ? 0.6 : 1,
                        }}
                      >
                        Reject Submission
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedPayment, 'pending')}
                        disabled={actionLoading || normalizeStatus(selectedPayment.status) === 'pending'}
                        style={{
                          padding: '10px 18px',
                          background: 'white',
                          color: '#6b7280',
                          borderRadius: '12px',
                          border: '1px solid #d1d5db',
                          fontWeight: 600,
                          cursor: actionLoading ? 'wait' : 'pointer',
                          opacity: actionLoading || normalizeStatus(selectedPayment.status) === 'pending' ? 0.6 : 1,
                        }}
                      >
                        Mark Pending
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
