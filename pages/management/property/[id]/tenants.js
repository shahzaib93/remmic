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
                className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                + Add Tenant
              </button>
              <button
                onClick={() => setShowAddRentModal(true)}
                className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                + Add Rent Record
              </button>
            </div>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className={actionNotice.type === 'success' ? 'mt-4 px-4 py-2.5 rounded-[0.9rem] text-[0.82rem] font-medium flex items-center gap-2 bg-green-500/[0.12] text-emerald-700 border border-green-500/[0.18] mb-6' : 'mt-4 px-4 py-2.5 rounded-[0.9rem] text-[0.82rem] font-medium flex items-center gap-2 bg-red-300/[0.12] text-red-700 border border-red-300/20 mb-6'}>
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
            <div className="flex flex-col gap-5 bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]" style={{ marginBottom: '1.5rem' }}>
              <div className="flex justify-between items-center gap-4">
                <h2>Active Tenants ({activeTenants.length})</h2>
              </div>
              <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
                {activeTenants.length === 0 ? (
                  <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No active tenants</div>
                ) : (
                  activeTenants.map(tenant => (
                    <div key={tenant.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0 max-md:grid-cols-1 max-md:gap-y-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/[0.14] text-emerald-600 text-[clamp(0.6rem,2vw,0.72rem)] font-semibold whitespace-nowrap flex-shrink-0 max-w-[85px] overflow-hidden text-ellipsis">Active</span>
                      <div style={{ flex: 1 }}>
                        <strong>{tenant.tenantName}</strong>
                        <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
                          {tenant.contactPhone} | {tenant.contactEmail}
                        </div>
                        <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
                          Lease: {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px] w-full max-md:items-start max-md:min-w-0">
                        <strong style={{ color: '#f97316' }}>{formatCurrency(tenant.monthlyRent)}/mo</strong>
                        <div className="inline-flex gap-1.5 flex-wrap justify-end w-full max-w-full max-md:justify-start">
                          <button
                            onClick={() => handleDeactivateTenant(tenant.id)}
                            className="border border-red-300/40 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-red-500/[0.12] text-red-600 transition-colors hover:bg-red-500/[0.18]"
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
              <div className="flex flex-col gap-5 bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]">
                <div className="flex justify-between items-center gap-4">
                  <h2>Past Tenants ({inactiveTenants.length})</h2>
                </div>
                <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
                  {inactiveTenants.map(tenant => (
                    <div key={tenant.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0 max-md:grid-cols-1 max-md:gap-y-3" style={{ opacity: 0.7 }}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-[clamp(0.65rem,2vw,0.75rem)] font-semibold tracking-wide whitespace-nowrap flex-shrink-0 max-w-[120px] overflow-hidden text-ellipsis uppercase border border-[rgba(201,162,39,0.2)]">Inactive</span>
                      <div style={{ flex: 1 }}>
                        <strong>{tenant.tenantName}</strong>
                        <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
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
          <div className="flex flex-col gap-5 bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]">
            <div className="flex justify-between items-center gap-4">
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
                                className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
          <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-6 z-[1000]">
            <div className="bg-white rounded-3xl w-[min(640px,100%)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.35)] max-sm:w-full max-sm:max-h-[95vh] max-sm:rounded-2xl">
              <div className="p-5 border-b border-slate-300/20 flex justify-between gap-4 items-start">
                <div>
                  <h2>Add New Tenant</h2>
                  <span>Fill in tenant details</span>
                </div>
                <button className="border-none bg-transparent text-slate-600 text-[0.85rem] font-semibold cursor-pointer" onClick={() => setShowAddTenantModal(false)}>Close</button>
              </div>
              <form onSubmit={handleAddTenant}>
                <div className="p-6 overflow-y-auto flex flex-col gap-4 max-sm:p-4">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Tenant Name *</label>
                      <input
                        type="text"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.tenantName}
                        onChange={(e) => setTenantForm({ ...tenantForm, tenantName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.contactPhone}
                        onChange={(e) => setTenantForm({ ...tenantForm, contactPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Email</label>
                      <input
                        type="email"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.contactEmail}
                        onChange={(e) => setTenantForm({ ...tenantForm, contactEmail: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>ID Number (CNIC/Passport)</label>
                      <input
                        type="text"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.identificationNumber}
                        onChange={(e) => setTenantForm({ ...tenantForm, identificationNumber: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Lease Start Date *</label>
                      <input
                        type="date"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.leaseStartDate}
                        onChange={(e) => setTenantForm({ ...tenantForm, leaseStartDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Lease End Date *</label>
                      <input
                        type="date"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.leaseEndDate}
                        onChange={(e) => setTenantForm({ ...tenantForm, leaseEndDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Monthly Rent (PKR) *</label>
                      <input
                        type="number"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.monthlyRent}
                        onChange={(e) => setTenantForm({ ...tenantForm, monthlyRent: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Security Deposit (PKR)</label>
                      <input
                        type="number"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={tenantForm.securityDeposit}
                        onChange={(e) => setTenantForm({ ...tenantForm, securityDeposit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Notes</label>
                    <textarea
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all resize-y min-h-24 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={tenantForm.notes}
                      onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })}
                      placeholder="Additional notes about the tenant..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-300/20 bg-slate-50 max-sm:flex-col max-sm:items-stretch">
                  <button type="button" className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]" onClick={() => setShowAddTenantModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                    Add Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Rent Record Modal */}
        {showAddRentModal && (
          <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-6 z-[1000]">
            <div className="bg-white rounded-3xl w-[min(640px,100%)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.35)] max-sm:w-full max-sm:max-h-[95vh] max-sm:rounded-2xl">
              <div className="p-5 border-b border-slate-300/20 flex justify-between gap-4 items-start">
                <div>
                  <h2>Add Rent Record</h2>
                  <span>Create a new rent entry</span>
                </div>
                <button className="border-none bg-transparent text-slate-600 text-[0.85rem] font-semibold cursor-pointer" onClick={() => setShowAddRentModal(false)}>Close</button>
              </div>
              <form onSubmit={handleAddRentRecord}>
                <div className="p-6 overflow-y-auto flex flex-col gap-4 max-sm:p-4">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Tenant *</label>
                      <select
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
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
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Month *</label>
                      <input
                        type="month"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={rentForm.month}
                        onChange={(e) => setRentForm({ ...rentForm, month: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Amount Due (PKR) *</label>
                      <input
                        type="number"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={rentForm.amountDue}
                        onChange={(e) => setRentForm({ ...rentForm, amountDue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Due Date *</label>
                      <input
                        type="date"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={rentForm.dueDate}
                        onChange={(e) => setRentForm({ ...rentForm, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Remarks</label>
                    <textarea
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all resize-y min-h-24 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={rentForm.remarks}
                      onChange={(e) => setRentForm({ ...rentForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-300/20 bg-slate-50 max-sm:flex-col max-sm:items-stretch">
                  <button type="button" className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]" onClick={() => setShowAddRentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showPaymentModal && selectedRecord && (
          <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-6 z-[1000]">
            <div className="bg-white rounded-3xl w-[min(640px,100%)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(15,23,42,0.35)] max-sm:w-full max-sm:max-h-[95vh] max-sm:rounded-2xl">
              <div className="p-5 border-b border-slate-300/20 flex justify-between gap-4 items-start">
                <div>
                  <h2>Record Payment</h2>
                  <span>For {selectedRecord.month} - Due: {formatCurrency(selectedRecord.amountDue)}</span>
                </div>
                <button className="border-none bg-transparent text-slate-600 text-[0.85rem] font-semibold cursor-pointer" onClick={() => { setShowPaymentModal(false); setSelectedRecord(null) }}>Close</button>
              </div>
              <form onSubmit={handleUpdatePayment}>
                <div className="p-6 overflow-y-auto flex flex-col gap-4 max-sm:p-4">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Amount Received (PKR) *</label>
                      <input
                        type="number"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={paymentForm.amountReceived}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amountReceived: e.target.value })}
                        required
                        max={selectedRecord.amountDue - (selectedRecord.amountReceived || 0)}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Remaining: {formatCurrency(selectedRecord.amountDue - (selectedRecord.amountReceived || 0))}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Payment Date *</label>
                      <input
                        type="date"
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                      <label>Payment Method</label>
                      <select
                        className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
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
                  <div className="flex flex-col gap-1.5 text-[0.85rem] text-slate-600">
                    <label>Remarks</label>
                    <textarea
                      className="border border-slate-300/40 rounded-xl px-3.5 py-2.5 text-[0.92rem] w-full font-inherit transition-all resize-y min-h-24 focus:outline-none focus:border-orange-500 focus:shadow-[0_0_0_2px_rgba(249,115,22,0.12)]"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      placeholder="Transaction reference or notes..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-300/20 bg-slate-50 max-sm:flex-col max-sm:items-stretch">
                  <button type="button" className="border border-slate-300/35 rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-slate-300/[0.18] text-gray-800 transition-colors hover:bg-slate-300/[0.28]" onClick={() => { setShowPaymentModal(false); setSelectedRecord(null) }}>
                    Cancel
                  </button>
                  <button type="submit" className="border-none rounded-full px-4 py-1.5 text-[0.78rem] font-semibold cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_10px_18px_rgba(34,197,94,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(34,197,94,0.32)] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
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
