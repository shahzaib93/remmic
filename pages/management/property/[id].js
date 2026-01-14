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
import styles from '../../../styles/adminOverview.module.css'

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
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Active Tenants</h3>
            <div className={styles.metricValue}>{activeTenants.length}</div>
            <div className={styles.metricMeta}>
              <span>Total: {managementData?.tenants?.length || 0}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <h3>Monthly Rent Due</h3>
            <div className={styles.metricValue}>
              {formatCurrency(financialSummary?.totalRentDue || 0)}
            </div>
            <div className={styles.metricMeta}>
              <span>Collected: {formatCurrency(financialSummary?.totalRentCollected || 0)}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <h3>Open Maintenance</h3>
            <div className={styles.metricValue}>{openMaintenance.length}</div>
            <div className={styles.metricMeta}>
              <span>Total: {managementData?.maintenanceRequests?.length || 0}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <h3>Net Amount</h3>
            <div className={styles.metricValue} style={{ color: (financialSummary?.netAmount || 0) >= 0 ? '#059669' : '#dc2626' }}>
              {formatCurrency(financialSummary?.netAmount || 0)}
            </div>
            <div className={styles.metricMeta}>
              <span>After expenses</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.colTwo}>
          {/* Recent Rent Records */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Recent Rent Records</h2>
              <Link href={`/management/property/${propertyId}/tenants`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
                View All
              </Link>
            </div>
            <div className={styles.list}>
              {recentRentRecords.length === 0 ? (
                <div className={styles.emptyState}>No rent records yet</div>
              ) : (
                recentRentRecords.map(record => (
                  <div key={record.id} className={styles.listItem}>
                    <span
                      className={styles.badge}
                      style={RENT_COLORS[record.paymentStatus] || RENT_COLORS[RENT_STATUS.DUE]}
                    >
                      {record.paymentStatus?.toUpperCase() || 'DUE'}
                    </span>
                    <div>
                      <strong>{record.month}</strong>
                      <div className={styles.smallMeta}>
                        Due: {formatCurrency(record.amountDue)} | Received: {formatCurrency(record.amountReceived || 0)}
                      </div>
                    </div>
                    <div className={styles.listItemMeta}>
                      <span className={styles.smallMeta}>{formatDate(record.paymentDate || record.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Tenants */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Active Tenants</h2>
              <Link href={`/management/property/${propertyId}/tenants`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
                Manage
              </Link>
            </div>
            <div className={styles.list}>
              {activeTenants.length === 0 ? (
                <div className={styles.emptyState}>No active tenants</div>
              ) : (
                activeTenants.map(tenant => (
                  <div key={tenant.id} className={styles.listItem}>
                    <span className={styles.badgeActive}>Active</span>
                    <div>
                      <strong>{tenant.tenantName}</strong>
                      <div className={styles.smallMeta}>
                        {tenant.contactPhone} | {formatCurrency(tenant.monthlyRent)}/month
                      </div>
                    </div>
                    <div className={styles.listItemMeta}>
                      <span className={styles.smallMeta}>
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
        <div className={styles.panel} style={{ marginTop: '1.5rem' }}>
          <div className={styles.panelHeader}>
            <h2>Open Maintenance Requests</h2>
            <Link href={`/management/property/${propertyId}/maintenance`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div className={styles.list}>
            {openMaintenance.length === 0 ? (
              <div className={styles.emptyState}>No open maintenance requests</div>
            ) : (
              openMaintenance.slice(0, 5).map(request => (
                <div key={request.id} className={styles.listItem}>
                  <span
                    className={styles.badge}
                    style={MAINTENANCE_COLORS[request.status] || MAINTENANCE_COLORS[MAINTENANCE_STATUS.SUBMITTED]}
                  >
                    {request.status?.replace('_', ' ').toUpperCase() || 'SUBMITTED'}
                  </span>
                  <div>
                    <strong>{request.requestType}</strong>
                    <div className={styles.smallMeta}>
                      {request.description?.slice(0, 100)}...
                    </div>
                  </div>
                  <div className={styles.listItemMeta}>
                    <span className={styles.smallMeta}>
                      Urgency: <strong style={{ color: request.urgency === 'high' ? '#dc2626' : request.urgency === 'medium' ? '#d97706' : '#059669' }}>
                        {request.urgency?.toUpperCase() || 'MEDIUM'}
                      </strong>
                    </span>
                    <span className={styles.smallMeta}>{formatDate(request.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Log Preview */}
        <div className={styles.panel} style={{ marginTop: '1.5rem' }}>
          <div className={styles.panelHeader}>
            <h2>Recent Activity</h2>
            <Link href={`/management/property/${propertyId}/activity`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div className={styles.list}>
            {(managementData?.activityLogs?.length === 0 || !managementData?.activityLogs) ? (
              <div className={styles.emptyState}>No activity logged yet</div>
            ) : (
              managementData.activityLogs.slice(0, 5).map(log => (
                <div key={log.id} className={styles.listItem}>
                  <span className={styles.badge}>{log.action?.replace('_', ' ')}</span>
                  <div>
                    <strong>{log.entityType}</strong>
                    <div className={styles.smallMeta}>
                      By {log.changedByName || 'System'}
                    </div>
                  </div>
                  <div className={styles.listItemMeta}>
                    <span className={styles.smallMeta}>{formatDate(log.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Documents Preview */}
        <div className={styles.panel} style={{ marginTop: '1.5rem' }}>
          <div className={styles.panelHeader}>
            <h2>Documents ({managementData?.documents?.length || 0})</h2>
            <Link href={`/management/property/${propertyId}/documents`} style={{ color: '#f97316', fontSize: '0.875rem', textDecoration: 'none' }}>
              Manage Documents
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {(managementData?.documents?.length === 0 || !managementData?.documents) ? (
              <div className={styles.emptyState} style={{ width: '100%' }}>No documents uploaded yet</div>
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
