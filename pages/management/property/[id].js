import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { useFirebase } from '../../../contexts/FirebaseContext'
import {
  getPropertyManagementData,
  getPropertyFinancialSummary,
  PROPERTY_MANAGEMENT_STATUS,
  MANAGEMENT_TYPE,
  MAINTENANCE_STATUS,
  RENT_STATUS
} from '../../../lib/firebase'

const STATUS_COLORS = {
  [PROPERTY_MANAGEMENT_STATUS.VACANT]: { bg: '#fef3c7', color: '#d97706' },
  [PROPERTY_MANAGEMENT_STATUS.RENTED]: { bg: '#d1fae5', color: '#059669' },
  [PROPERTY_MANAGEMENT_STATUS.UNDER_MAINTENANCE]: { bg: '#fee2e2', color: '#dc2626' },
}

const MAINTENANCE_COLORS = {
  [MAINTENANCE_STATUS.SUBMITTED]: { bg: '#e0e7ff', color: '#4338ca' },
  [MAINTENANCE_STATUS.ASSIGNED]: { bg: '#fef3c7', color: '#d97706' },
  [MAINTENANCE_STATUS.IN_PROGRESS]: { bg: '#dbeafe', color: '#2563eb' },
  [MAINTENANCE_STATUS.COMPLETED]: { bg: '#d1fae5', color: '#059669' },
}

const RENT_COLORS = {
  [RENT_STATUS.PAID]: { bg: '#d1fae5', color: '#059669' },
  [RENT_STATUS.PARTIAL]: { bg: '#fef3c7', color: '#d97706' },
  [RENT_STATUS.DUE]: { bg: '#fee2e2', color: '#dc2626' },
}

export default function PropertyManagementDashboard() {
  const router = useRouter()
  const { id: propertyId } = router.query
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [managementData, setManagementData] = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const loadData = useCallback(async () => {
    if (!propertyId) return

    setLoading(true)
    try {
      // Load property details from localStorage or Firestore
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []
      const foundProperty = storedProperties.find(p => p.id === propertyId)
      setProperty(foundProperty || { id: propertyId, title: 'Property', location: 'Unknown' })

      // Load management data
      const mgmtResult = await getPropertyManagementData(propertyId)
      if (mgmtResult.success) {
        setManagementData(mgmtResult.data)
      }

      // Load financial summary
      const finResult = await getPropertyFinancialSummary(propertyId)
      if (finResult.success) {
        setFinancialSummary(finResult.summary)
      }
    } catch (error) {
      console.error('Error loading property management data:', error)
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (amount) => {
    if (!amount) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 48,
              height: 48,
              border: '4px solid #f3f4f6',
              borderTopColor: '#f97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: '#6b7280' }}>Loading property management data...</p>
          </div>
        </div>
        <Footer />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    )
  }

  const activeTenants = managementData?.tenants?.filter(t => t.status === 'active') || []
  const openMaintenance = managementData?.maintenanceRequests?.filter(
    r => r.status !== MAINTENANCE_STATUS.COMPLETED
  ) || []
  const recentRentRecords = managementData?.rentRecords?.slice(0, 5) || []

  return (
    <>
      <Head>
        <title>Property Management - {property?.title || 'Dashboard'} | REMMIC</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <Link href="/dashboard" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                Back to Dashboard
              </Link>
              <h1 style={{ margin: 0, color: '#1f2937', fontSize: '1.75rem' }}>
                {property?.title || 'Property Management'}
              </h1>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0' }}>
                {property?.location} | ID: {propertyId?.slice(0, 8)}...
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: property?.managementType === MANAGEMENT_TYPE.REMMIC_MANAGED
                  ? 'linear-gradient(135deg, #f97316, #fb923c)'
                  : '#f3f4f6',
                color: property?.managementType === MANAGEMENT_TYPE.REMMIC_MANAGED ? '#fff' : '#374151'
              }}>
                {property?.managementType === MANAGEMENT_TYPE.REMMIC_MANAGED ? 'REMMIC Managed' : 'Self Managed'}
              </span>
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                ...STATUS_COLORS[property?.managementStatus || PROPERTY_MANAGEMENT_STATUS.VACANT]
              }}>
                {(property?.managementStatus || PROPERTY_MANAGEMENT_STATUS.VACANT).replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.05))',
          border: '1px solid rgba(249, 115, 22, 0.2)',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <svg width="20" height="20" fill="none" stroke="#f97316" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
            REMMIC provides coordination and reporting services only and does not guarantee income or performance.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'tenants', label: 'Tenants & Rental', href: `/management/property/${propertyId}/tenants` },
            { id: 'financials', label: 'Financials', href: `/management/property/${propertyId}/financials` },
            { id: 'maintenance', label: 'Maintenance', href: `/management/property/${propertyId}/maintenance` },
            { id: 'documents', label: 'Documents', href: `/management/property/${propertyId}/documents` },
            { id: 'activity', label: 'Activity Log', href: `/management/property/${propertyId}/activity` },
          ].map(tab => (
            tab.href ? (
              <Link
                key={tab.id}
                href={tab.href}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#f97316' : '#6b7280',
                  borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </Link>
            ) : (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem 0.5rem 0 0',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#f97316' : '#6b7280',
                  borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            )
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-8">
          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Active Tenants</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-slate-900">{activeTenants.length}</div>
            <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
              <span>Total: {managementData?.tenants?.length || 0}</span>
            </div>
          </div>

          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Monthly Rent Due</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-slate-900">
              {formatCurrency(financialSummary?.totalRentDue || 0)}
            </div>
            <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
              <span>Collected: {formatCurrency(financialSummary?.totalRentCollected || 0)}</span>
            </div>
          </div>

          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Open Maintenance</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold text-slate-900">{openMaintenance.length}</div>
            <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
              <span>Total: {managementData?.maintenanceRequests?.length || 0}</span>
            </div>
          </div>

          <div className="relative overflow-hidden grid gap-2.5 bg-gradient-to-br from-white to-[#fafafa] rounded-[1.25rem] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.08)] border border-slate-300/[0.16] transition-all before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a227] before:via-[#d4b13d] before:to-[#c9a227] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(15,23,42,0.12)]">
            <h3 className="m-0 text-[0.85rem] font-semibold text-slate-500 uppercase tracking-wide">Net Amount</h3>
            <div className="text-[clamp(1.6rem,2.8vw,2rem)] font-bold" style={{ color: (financialSummary?.netAmount || 0) >= 0 ? '#059669' : '#dc2626' }}>
              {formatCurrency(financialSummary?.netAmount || 0)}
            </div>
            <div className="flex justify-between items-center text-[0.78rem] text-slate-400">
              <span>After expenses</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 max-lg:grid-cols-1">
          {/* Recent Rent Records */}
          <div className="flex flex-col gap-5 max-h-[450px] overflow-hidden bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]">
            <div className="flex justify-between items-center gap-4">
              <h2 className="m-0 text-[1.1rem]">Recent Rent Records</h2>
              <Link href={`/management/property/${propertyId}/tenants`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
                View All
              </Link>
            </div>
            <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
              {recentRentRecords.length === 0 ? (
                <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No rent records yet</div>
              ) : (
                recentRentRecords.map(record => (
                  <div key={record.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0 max-md:grid-cols-1 max-md:gap-y-3">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[clamp(0.65rem,2vw,0.75rem)] font-semibold tracking-wide whitespace-nowrap flex-shrink-0 max-w-[120px] overflow-hidden text-ellipsis uppercase"
                      style={RENT_COLORS[record.paymentStatus] || RENT_COLORS[RENT_STATUS.DUE]}
                    >
                      {record.paymentStatus?.toUpperCase() || 'DUE'}
                    </span>
                    <div>
                      <strong className="font-semibold text-gray-800">{record.month}</strong>
                      <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
                        Due: {formatCurrency(record.amountDue)} | Received: {formatCurrency(record.amountReceived || 0)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px] w-full max-md:items-start max-md:min-w-0">
                      <span className="text-gray-400 text-[0.82rem] break-words leading-tight">{formatDate(record.paymentDate || record.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Tenants */}
          <div className="flex flex-col gap-5 max-h-[450px] overflow-hidden bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18]">
            <div className="flex justify-between items-center gap-4">
              <h2 className="m-0 text-[1.1rem]">Active Tenants</h2>
              <Link href={`/management/property/${propertyId}/tenants`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
                Manage
              </Link>
            </div>
            <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
              {activeTenants.length === 0 ? (
                <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No active tenants</div>
              ) : (
                activeTenants.map(tenant => (
                  <div key={tenant.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0 max-md:grid-cols-1 max-md:gap-y-3">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/[0.14] text-emerald-600 text-[clamp(0.6rem,2vw,0.72rem)] font-semibold whitespace-nowrap flex-shrink-0 max-w-[85px] overflow-hidden text-ellipsis">Active</span>
                    <div>
                      <strong className="font-semibold text-gray-800">{tenant.tenantName}</strong>
                      <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
                        {tenant.contactPhone} | {formatCurrency(tenant.monthlyRent)}/month
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px] w-full max-md:items-start max-md:min-w-0">
                      <span className="text-gray-400 text-[0.82rem] break-words leading-tight">
                        Lease ends: {formatDate(tenant.leaseEndDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Requests */}
        <div className="flex flex-col gap-5 max-h-[450px] overflow-hidden bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18] mt-6">
          <div className="flex justify-between items-center gap-4">
            <h2 className="m-0 text-[1.1rem]">Open Maintenance Requests</h2>
            <Link href={`/management/property/${propertyId}/maintenance`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
            {openMaintenance.length === 0 ? (
              <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No open maintenance requests</div>
            ) : (
              openMaintenance.slice(0, 5).map(request => (
                <div key={request.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0 max-md:grid-cols-1 max-md:gap-y-3">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[clamp(0.65rem,2vw,0.75rem)] font-semibold tracking-wide whitespace-nowrap flex-shrink-0 max-w-[120px] overflow-hidden text-ellipsis uppercase"
                    style={MAINTENANCE_COLORS[request.status] || MAINTENANCE_COLORS[MAINTENANCE_STATUS.SUBMITTED]}
                  >
                    {request.status?.replace('_', ' ').toUpperCase() || 'SUBMITTED'}
                  </span>
                  <div>
                    <strong className="font-semibold text-gray-800">{request.requestType}</strong>
                    <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
                      {request.description?.slice(0, 100)}...
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px] w-full max-md:items-start max-md:min-w-0">
                    <span className="text-gray-400 text-[0.82rem] break-words leading-tight">
                      Urgency: <strong style={{ color: request.urgency === 'high' ? '#dc2626' : request.urgency === 'medium' ? '#d97706' : '#059669' }}>
                        {request.urgency?.toUpperCase() || 'MEDIUM'}
                      </strong>
                    </span>
                    <span className="text-gray-400 text-[0.82rem] break-words leading-tight">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Log Preview */}
        <div className="flex flex-col gap-5 max-h-[450px] overflow-hidden bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18] mt-6">
          <div className="flex justify-between items-center gap-4">
            <h2 className="m-0 text-[1.1rem]">Recent Activity</h2>
            <Link href={`/management/property/${propertyId}/activity`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div className="grid gap-4 overflow-y-auto flex-1 pr-1">
            {(managementData?.activityLogs?.length === 0 || !managementData?.activityLogs) ? (
              <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem]">No activity logged yet</div>
            ) : (
              managementData.activityLogs.slice(0, 5).map(log => (
                <div key={log.id} className="grid grid-cols-[auto_1fr_minmax(150px,220px)] gap-x-4 gap-y-2 items-start py-3.5 border-b border-slate-200/55 last:border-b-0 max-md:grid-cols-1 max-md:gap-y-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.1)] text-[#92710c] text-[clamp(0.65rem,2vw,0.75rem)] font-semibold tracking-wide whitespace-nowrap flex-shrink-0 max-w-[120px] overflow-hidden text-ellipsis uppercase border border-[rgba(201,162,39,0.2)]">{log.action?.replace('_', ' ')}</span>
                  <div>
                    <strong className="font-semibold text-gray-800">{log.entityType}</strong>
                    <div className="text-gray-400 text-[0.82rem] break-words leading-tight">
                      By {log.changedByName || 'System'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center gap-1.5 min-w-[170px] w-full max-md:items-start max-md:min-w-0">
                    <span className="text-gray-400 text-[0.82rem] break-words leading-tight">{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Documents Preview */}
        <div className="flex flex-col gap-5 max-h-[450px] overflow-hidden bg-white rounded-[1.75rem] p-7 shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-300/[0.18] mt-6">
          <div className="flex justify-between items-center gap-4">
            <h2 className="m-0 text-[1.1rem]">Documents ({managementData?.documents?.length || 0})</h2>
            <Link href={`/management/property/${propertyId}/documents`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
              Manage Documents
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {(managementData?.documents?.length === 0 || !managementData?.documents) ? (
              <div className="border border-dashed border-slate-300/40 rounded-3xl py-10 px-6 text-center text-slate-400 text-[0.95rem] w-full">No documents uploaded yet</div>
            ) : (
              managementData.documents.slice(0, 6).map(doc => (
                <div
                  key={doc.id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                      {doc.docName?.slice(0, 20) || 'Document'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {doc.docType}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
