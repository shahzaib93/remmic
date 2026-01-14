import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'
import {
  getMaintenanceRequests,
  getTenants,
  getRentRecords,
  MAINTENANCE_STATUS,
  RENT_STATUS
} from '../../lib/firebase'
import styles from '../../styles/adminOverview.module.css'

export default function PropertyManagerDashboard() {
  const router = useRouter()
  const { user } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [assignedProperties, setAssignedProperties] = useState([])
  const [maintenanceRequests, setMaintenanceRequests] = useState([])
  const [recentRentRecords, setRecentRentRecords] = useState([])
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTenants: 0,
    pendingMaintenance: 0,
    rentDue: 0
  })

  const loadData = useCallback(async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      // Load properties assigned to this manager from localStorage
      const storedAssignments = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('propertyManagerAssignments') || '[]')
        : []

      const userAssignments = storedAssignments.filter(a => a.managerId === user.uid)
      const assignedPropertyIds = userAssignments.map(a => a.propertyId)

      // Load all properties and filter to assigned ones
      const storedProperties = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('userProperties') || '[]')
        : []

      const managedProperties = storedProperties.filter(p =>
        assignedPropertyIds.includes(p.id)
      )
      setAssignedProperties(managedProperties)

      // Load maintenance requests for assigned properties
      let allMaintenance = []
      let allTenants = []
      let allRentRecords = []

      for (const property of managedProperties) {
        const [maintenanceResult, tenantsResult, rentResult] = await Promise.all([
          getMaintenanceRequests(property.id),
          getTenants(property.id),
          getRentRecords(property.id)
        ])

        if (maintenanceResult.success) {
          allMaintenance = [...allMaintenance, ...(maintenanceResult.requests || [])]
        }
        if (tenantsResult.success) {
          allTenants = [...allTenants, ...(tenantsResult.tenants || [])]
        }
        if (rentResult.success) {
          allRentRecords = [...allRentRecords, ...(rentResult.records || [])]
        }
      }

      // Sort and filter
      const pendingMaintenance = allMaintenance.filter(m =>
        [MAINTENANCE_STATUS.SUBMITTED, MAINTENANCE_STATUS.ASSIGNED].includes(m.status)
      )
      setMaintenanceRequests(pendingMaintenance.slice(0, 10))

      const dueRentRecords = allRentRecords.filter(r =>
        [RENT_STATUS.DUE, RENT_STATUS.PARTIAL].includes(r.paymentStatus)
      )
      setRecentRentRecords(dueRentRecords.slice(0, 10))

      // Calculate stats
      setStats({
        totalProperties: managedProperties.length,
        totalTenants: allTenants.filter(t => t.status === 'active').length,
        pendingMaintenance: pendingMaintenance.length,
        rentDue: dueRentRecords.reduce((sum, r) => sum + (r.amountDue - (r.amountReceived || 0)), 0)
      })

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <>
        <Head><title>Property Manager | REMMIC</title></Head>
        <Navbar />
        <main style={{ padding: '2rem', textAlign: 'center', minHeight: '70vh' }}>
          <h1>Please Sign In</h1>
          <p style={{ color: '#6b7280' }}>You need to sign in to access the property manager dashboard.</p>
          <Link href="/auth" className={styles.actionButtonPrimary} style={{ marginTop: '1rem', display: 'inline-block' }}>
            Sign In
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Property Manager Dashboard | REMMIC</title>
      </Head>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', minHeight: '70vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>Property Manager Dashboard</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            Welcome, {user.displayName || user.email}
          </p>
        </div>

        {/* Stats */}
        <div className={styles.metricGrid} style={{ marginBottom: '2rem' }}>
          <div className={styles.metricCard}>
            <h3>Assigned Properties</h3>
            <div className={styles.metricValue}>{stats.totalProperties}</div>
            <div className={styles.metricMeta}>
              <span>Under your management</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Active Tenants</h3>
            <div className={styles.metricValue}>{stats.totalTenants}</div>
            <div className={styles.metricMeta}>
              <span>Across all properties</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Pending Maintenance</h3>
            <div className={styles.metricValue} style={{ color: stats.pendingMaintenance > 0 ? '#d97706' : '#059669' }}>
              {stats.pendingMaintenance}
            </div>
            <div className={styles.metricMeta}>
              <span>Requires attention</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <h3>Rent Outstanding</h3>
            <div className={styles.metricValue} style={{ color: stats.rentDue > 0 ? '#dc2626' : '#059669' }}>
              {formatCurrency(stats.rentDue)}
            </div>
            <div className={styles.metricMeta}>
              <span>Due from tenants</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Loading your properties...</p>
          </div>
        ) : assignedProperties.length === 0 ? (
          <div className={styles.panel} style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
            <h2>No Properties Assigned</h2>
            <p style={{ color: '#6b7280' }}>
              You don&apos;t have any properties assigned to manage yet.
              Contact your administrator for property assignments.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Assigned Properties */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>My Properties</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assignedProperties.map(property => (
                  <Link
                    key={property.id}
                    href={`/management/property/${property.id}`}
                    style={{
                      display: 'block',
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem', color: '#1f2937' }}>
                          {property.title || property.propertyAddress || 'Property'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                          {property.location || property.city}
                        </p>
                      </div>
                      <svg width="20" height="20" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pending Maintenance */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Pending Maintenance</h2>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: maintenanceRequests.length > 0 ? '#fef3c7' : '#d1fae5',
                  color: maintenanceRequests.length > 0 ? '#d97706' : '#059669'
                }}>
                  {maintenanceRequests.length} pending
                </span>
              </div>
              {maintenanceRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                  <p>No pending maintenance requests</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {maintenanceRequests.map(request => (
                    <div key={request.id} style={{
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      borderLeft: `3px solid ${request.urgency === 'emergency' ? '#dc2626' : request.urgency === 'high' ? '#f97316' : '#d97706'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{request.requestType}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{formatDate(request.createdAt)}</div>
                        </div>
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          background: request.urgency === 'emergency' ? '#fee2e2' : request.urgency === 'high' ? '#fef3c7' : '#f3f4f6',
                          color: request.urgency === 'emergency' ? '#dc2626' : request.urgency === 'high' ? '#d97706' : '#6b7280'
                        }}>
                          {request.urgency?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rent Due */}
            <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.panelHeader}>
                <h2>Outstanding Rent</h2>
              </div>
              {recentRentRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                  <p>All rent payments are up to date</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Tenant</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Month</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Due</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Received</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>Balance</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRentRecords.map(record => (
                        <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.75rem' }}>{record.tenantName || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{record.month}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(record.amountDue)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(record.amountReceived || 0)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                            {formatCurrency(record.amountDue - (record.amountReceived || 0))}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background: record.paymentStatus === 'partial' ? '#fef3c7' : '#fee2e2',
                              color: record.paymentStatus === 'partial' ? '#d97706' : '#dc2626'
                            }}>
                              {record.paymentStatus?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.panel} style={{ marginTop: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {assignedProperties.slice(0, 3).map(property => (
              <div key={property.id} style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  href={`/management/property/${property.id}/tenants`}
                  className={styles.actionButtonSecondary}
                  style={{ textDecoration: 'none' }}
                >
                  Tenants - {property.title?.slice(0, 15) || 'Property'}
                </Link>
                <Link
                  href={`/management/property/${property.id}/maintenance`}
                  className={styles.actionButtonSecondary}
                  style={{ textDecoration: 'none' }}
                >
                  Maintenance
                </Link>
              </div>
            ))}
          </div>
        </div>

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
          REMMIC provides coordination and reporting services only and does not guarantee income or performance.
        </div>
      </main>

      <Footer />
    </>
  )
}
