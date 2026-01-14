import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../../components/Navbar'
import Footer from '../../../../components/Footer'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import {
  getTenants,
  addTenant,
  updateTenant,
  deactivateTenant,
  getRentRecords,
  addRentRecord,
  updateRentPayment,
  RENT_STATUS
} from '../../../../lib/firebase'
import styles from '../../../../styles/adminOverview.module.css'

const RENT_COLORS = {
  [RENT_STATUS.PAID]: { bg: '#d1fae5', color: '#059669' },
  [RENT_STATUS.PARTIAL]: { bg: '#fef3c7', color: '#d97706' },
  [RENT_STATUS.DUE]: { bg: '#fee2e2', color: '#dc2626' },
}

export default function TenantManagement() {
  const router = useRouter()
  const { id: propertyId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [tenants, setTenants] = useState([])
  const [rentRecords, setRentRecords] = useState([])
  const [activeView, setActiveView] = useState('tenants') // tenants | rent
  const [showAddTenantModal, setShowAddTenantModal] = useState(false)
  const [showAddRentModal, setShowAddRentModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  const [tenantForm, setTenantForm] = useState({
    tenantName: '',
    contactPhone: '',
    contactEmail: '',
    identificationNumber: '',
    identificationType: 'cnic',
    leaseStartDate: '',
    leaseEndDate: '',
    monthlyRent: '',
    securityDeposit: '',
    notes: ''
  })

  const [rentForm, setRentForm] = useState({
    tenantId: '',
    month: '',
    amountDue: '',
    dueDate: '',
    remarks: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    amountReceived: '',
    paymentDate: '',
    paymentMethod: 'bank',
    remarks: ''
  })

  const loadData = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    try {
      const [tenantsResult, rentResult] = await Promise.all([
        getTenants(propertyId),
        getRentRecords(propertyId)
      ])

      if (tenantsResult.success) setTenants(tenantsResult.tenants || [])
      if (rentResult.success) setRentRecords(rentResult.records || [])
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

  const handleAddTenant = async (e) => {
    e.preventDefault()
    try {
      const result = await addTenant({
        ...tenantForm,
        propertyId,
        userId: user?.uid,
        monthlyRent: parseFloat(tenantForm.monthlyRent),
        securityDeposit: parseFloat(tenantForm.securityDeposit) || 0
      })

      if (result.success) {
        setActionNotice({ type: 'success', message: 'Tenant added successfully!' })
        setShowAddTenantModal(false)
        setTenantForm({
          tenantName: '', contactPhone: '', contactEmail: '', identificationNumber: '',
          identificationType: 'cnic', leaseStartDate: '', leaseEndDate: '',
          monthlyRent: '', securityDeposit: '', notes: ''
        })
        loadData()
      } else {
        setActionNotice({ type: 'error', message: result.error || 'Failed to add tenant' })
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const handleDeactivateTenant = async (tenantId) => {
    if (!confirm('Are you sure you want to deactivate this tenant?')) return

    try {
      const result = await deactivateTenant(tenantId)
      if (result.success) {
        setActionNotice({ type: 'success', message: 'Tenant deactivated successfully!' })
        loadData()
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const handleAddRentRecord = async (e) => {
    e.preventDefault()
    try {
      const result = await addRentRecord({
        ...rentForm,
        propertyId,
        userId: user?.uid,
        amountDue: parseFloat(rentForm.amountDue)
      })

      if (result.success) {
        setActionNotice({ type: 'success', message: 'Rent record added successfully!' })
        setShowAddRentModal(false)
        setRentForm({ tenantId: '', month: '', amountDue: '', dueDate: '', remarks: '' })
        loadData()
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const handleUpdatePayment = async (e) => {
    e.preventDefault()
    if (!selectedRecord) return

    try {
      const amountReceived = parseFloat(paymentForm.amountReceived)
      let paymentStatus = RENT_STATUS.DUE
      if (amountReceived >= selectedRecord.amountDue) {
        paymentStatus = RENT_STATUS.PAID
      } else if (amountReceived > 0) {
        paymentStatus = RENT_STATUS.PARTIAL
      }

      const result = await updateRentPayment(selectedRecord.id, {
        ...paymentForm,
        amountReceived,
        paymentStatus
      })

      if (result.success) {
        setActionNotice({ type: 'success', message: 'Payment recorded successfully!' })
        setShowPaymentModal(false)
        setSelectedRecord(null)
        setPaymentForm({ amountReceived: '', paymentDate: '', paymentMethod: 'bank', remarks: '' })
        loadData()
      }
    } catch (error) {
      setActionNotice({ type: 'error', message: error.message })
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const activeTenants = tenants.filter(t => t.status === 'active')
  const inactiveTenants = tenants.filter(t => t.status === 'inactive')

  return (
    <>
      <Head>
        <title>Tenant & Rental Management | REMMIC</title>
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
            <h1 style={{ margin: 0, color: '#1f2937' }}>Tenant & Rental Management</h1>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowAddTenantModal(true)}
                className={styles.actionButtonPrimary}
                style={{ padding: '0.75rem 1.25rem' }}
              >
                + Add Tenant
              </button>
              <button
                onClick={() => setShowAddRentModal(true)}
                className={styles.actionButtonSecondary}
                style={{ padding: '0.75rem 1.25rem' }}
              >
                + Add Rent Record
              </button>
            </div>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className={actionNotice.type === 'success' ? styles.actionNoticeSuccess : styles.actionNoticeError} style={{ marginBottom: '1.5rem' }}>
            {actionNotice.message}
          </div>
        )}

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveView('tenants')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              background: activeView === 'tenants' ? 'linear-gradient(135deg, #f97316, #fb923c)' : '#f3f4f6',
              color: activeView === 'tenants' ? '#fff' : '#6b7280'
            }}
          >
            Tenants ({tenants.length})
          </button>
          <button
            onClick={() => setActiveView('rent')}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              background: activeView === 'rent' ? 'linear-gradient(135deg, #f97316, #fb923c)' : '#f3f4f6',
              color: activeView === 'rent' ? '#fff' : '#6b7280'
            }}
          >
            Rent Records ({rentRecords.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </div>
        ) : activeView === 'tenants' ? (
          /* Tenants View */
          <div>
            {/* Active Tenants */}
            <div className={styles.panel} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.panelHeader}>
                <h2>Active Tenants ({activeTenants.length})</h2>
              </div>
              <div className={styles.list}>
                {activeTenants.length === 0 ? (
                  <div className={styles.emptyState}>No active tenants</div>
                ) : (
                  activeTenants.map(tenant => (
                    <div key={tenant.id} className={styles.listItem}>
                      <span className={styles.badgeActive}>Active</span>
                      <div style={{ flex: 1 }}>
                        <strong>{tenant.tenantName}</strong>
                        <div className={styles.smallMeta}>
                          {tenant.contactPhone} | {tenant.contactEmail}
                        </div>
                        <div className={styles.smallMeta}>
                          Lease: {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                        </div>
                      </div>
                      <div className={styles.listItemMeta}>
                        <strong style={{ color: '#f97316' }}>{formatCurrency(tenant.monthlyRent)}/mo</strong>
                        <div className={styles.listActions}>
                          <button
                            onClick={() => handleDeactivateTenant(tenant.id)}
                            className={styles.actionButtonDanger}
                          >
                            Deactivate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Inactive Tenants */}
            {inactiveTenants.length > 0 && (
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>Past Tenants ({inactiveTenants.length})</h2>
                </div>
                <div className={styles.list}>
                  {inactiveTenants.map(tenant => (
                    <div key={tenant.id} className={styles.listItem} style={{ opacity: 0.7 }}>
                      <span className={styles.badge}>Inactive</span>
                      <div style={{ flex: 1 }}>
                        <strong>{tenant.tenantName}</strong>
                        <div className={styles.smallMeta}>
                          {tenant.contactPhone} | Deactivated: {formatDate(tenant.deactivatedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Rent Records View */
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Rent Records</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Month</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Tenant</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Due</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Received</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                        No rent records yet
                      </td>
                    </tr>
                  ) : (
                    rentRecords.map(record => {
                      const tenant = tenants.find(t => t.id === record.tenantId)
                      return (
                        <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '1rem' }}>
                            <strong>{record.month}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              Due: {formatDate(record.dueDate)}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: '#6b7280' }}>
                            {tenant?.tenantName || 'Unknown'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                            {formatCurrency(record.amountDue)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                            {formatCurrency(record.amountReceived || 0)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              ...RENT_COLORS[record.paymentStatus || RENT_STATUS.DUE]
                            }}>
                              {(record.paymentStatus || RENT_STATUS.DUE).toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {record.paymentStatus !== RENT_STATUS.PAID && (
                              <button
                                onClick={() => {
                                  setSelectedRecord(record)
                                  setShowPaymentModal(true)
                                }}
                                className={styles.actionButtonPrimary}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                              >
                                Record Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Tenant Modal */}
        {showAddTenantModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>Add New Tenant</h2>
                  <span>Fill in tenant details</span>
                </div>
                <button className={styles.modalClose} onClick={() => setShowAddTenantModal(false)}>Close</button>
              </div>
              <form onSubmit={handleAddTenant}>
                <div className={styles.modalBody}>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Tenant Name *</label>
                      <input
                        type="text"
                        className={styles.modalInput}
                        value={tenantForm.tenantName}
                        onChange={(e) => setTenantForm({ ...tenantForm, tenantName: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Phone *</label>
                      <input
                        type="tel"
                        className={styles.modalInput}
                        value={tenantForm.contactPhone}
                        onChange={(e) => setTenantForm({ ...tenantForm, contactPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Email</label>
                      <input
                        type="email"
                        className={styles.modalInput}
                        value={tenantForm.contactEmail}
                        onChange={(e) => setTenantForm({ ...tenantForm, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>ID Number (CNIC/Passport)</label>
                      <input
                        type="text"
                        className={styles.modalInput}
                        value={tenantForm.identificationNumber}
                        onChange={(e) => setTenantForm({ ...tenantForm, identificationNumber: e.target.value })}
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Lease Start Date *</label>
                      <input
                        type="date"
                        className={styles.modalInput}
                        value={tenantForm.leaseStartDate}
                        onChange={(e) => setTenantForm({ ...tenantForm, leaseStartDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Lease End Date *</label>
                      <input
                        type="date"
                        className={styles.modalInput}
                        value={tenantForm.leaseEndDate}
                        onChange={(e) => setTenantForm({ ...tenantForm, leaseEndDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Monthly Rent (PKR) *</label>
                      <input
                        type="number"
                        className={styles.modalInput}
                        value={tenantForm.monthlyRent}
                        onChange={(e) => setTenantForm({ ...tenantForm, monthlyRent: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Security Deposit (PKR)</label>
                      <input
                        type="number"
                        className={styles.modalInput}
                        value={tenantForm.securityDeposit}
                        onChange={(e) => setTenantForm({ ...tenantForm, securityDeposit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <label>Notes</label>
                    <textarea
                      className={styles.modalTextarea}
                      value={tenantForm.notes}
                      onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })}
                      placeholder="Additional notes about the tenant..."
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionButtonSecondary} onClick={() => setShowAddTenantModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.actionButtonPrimary}>
                    Add Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Rent Record Modal */}
        {showAddRentModal && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>Add Rent Record</h2>
                  <span>Create a new rent entry</span>
                </div>
                <button className={styles.modalClose} onClick={() => setShowAddRentModal(false)}>Close</button>
              </div>
              <form onSubmit={handleAddRentRecord}>
                <div className={styles.modalBody}>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Tenant *</label>
                      <select
                        className={styles.modalInput}
                        value={rentForm.tenantId}
                        onChange={(e) => {
                          const tenant = activeTenants.find(t => t.id === e.target.value)
                          setRentForm({
                            ...rentForm,
                            tenantId: e.target.value,
                            amountDue: tenant?.monthlyRent || rentForm.amountDue
                          })
                        }}
                        required
                      >
                        <option value="">Select Tenant</option>
                        {activeTenants.map(t => (
                          <option key={t.id} value={t.id}>{t.tenantName}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.modalField}>
                      <label>Month *</label>
                      <input
                        type="month"
                        className={styles.modalInput}
                        value={rentForm.month}
                        onChange={(e) => setRentForm({ ...rentForm, month: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Amount Due (PKR) *</label>
                      <input
                        type="number"
                        className={styles.modalInput}
                        value={rentForm.amountDue}
                        onChange={(e) => setRentForm({ ...rentForm, amountDue: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Due Date *</label>
                      <input
                        type="date"
                        className={styles.modalInput}
                        value={rentForm.dueDate}
                        onChange={(e) => setRentForm({ ...rentForm, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <label>Remarks</label>
                    <textarea
                      className={styles.modalTextarea}
                      value={rentForm.remarks}
                      onChange={(e) => setRentForm({ ...rentForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionButtonSecondary} onClick={() => setShowAddRentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.actionButtonPrimary}>
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showPaymentModal && selectedRecord && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <h2>Record Payment</h2>
                  <span>For {selectedRecord.month} - Due: {formatCurrency(selectedRecord.amountDue)}</span>
                </div>
                <button className={styles.modalClose} onClick={() => { setShowPaymentModal(false); setSelectedRecord(null) }}>Close</button>
              </div>
              <form onSubmit={handleUpdatePayment}>
                <div className={styles.modalBody}>
                  <div className={styles.modalGrid}>
                    <div className={styles.modalField}>
                      <label>Amount Received (PKR) *</label>
                      <input
                        type="number"
                        className={styles.modalInput}
                        value={paymentForm.amountReceived}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amountReceived: e.target.value })}
                        required
                        max={selectedRecord.amountDue - (selectedRecord.amountReceived || 0)}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Remaining: {formatCurrency(selectedRecord.amountDue - (selectedRecord.amountReceived || 0))}
                      </span>
                    </div>
                    <div className={styles.modalField}>
                      <label>Payment Date *</label>
                      <input
                        type="date"
                        className={styles.modalInput}
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className={styles.modalField}>
                      <label>Payment Method</label>
                      <select
                        className={styles.modalInput}
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      >
                        <option value="bank">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="transfer">Online Transfer</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.modalField}>
                    <label>Remarks</label>
                    <textarea
                      className={styles.modalTextarea}
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      placeholder="Transaction reference or notes..."
                    />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.actionButtonSecondary} onClick={() => { setShowPaymentModal(false); setSelectedRecord(null) }}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.actionButtonPrimary}>
                    Record Payment
                  </button>
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
