import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import layoutStyles from '../../styles/adminLayout.module.css'
import reportsStyles from '../../styles/adminReports.module.css'

// Mock maintenance data (in a real implementation, this would come from Firebase)
const MOCK_MAINTENANCE_REQUESTS = [
  {
    id: 'maint-001',
    propertyId: 'prop-123',
    propertyName: 'DHA Phase 5 Villa',
    requestType: 'Plumbing',
    urgency: 'urgent',
    status: 'In Progress',
    estimatedCost: 15000,
    actualCost: null,
    submittedAt: '2024-12-01',
    investmentId: 'inv-123'
  },
  {
    id: 'maint-002',
    propertyId: 'prop-456',
    propertyName: 'Gulberg Apartment',
    requestType: 'Electrical',
    urgency: 'standard',
    status: 'Pending',
    estimatedCost: 25000,
    actualCost: null,
    submittedAt: '2024-12-03',
    investmentId: 'inv-456'
  },
  {
    id: 'maint-003',
    propertyId: 'prop-789',
    propertyName: 'F-7 Commercial Plaza',
    requestType: 'HVAC',
    urgency: 'emergency',
    status: 'Completed',
    estimatedCost: 75000,
    actualCost: 68000,
    submittedAt: '2024-11-28',
    investmentId: 'inv-789'
  },
  {
    id: 'maint-004',
    propertyId: 'prop-321',
    propertyName: 'Bahria Town House',
    requestType: 'Roofing',
    urgency: 'urgent',
    status: 'Quoted',
    estimatedCost: 120000,
    actualCost: null,
    submittedAt: '2024-12-04',
    investmentId: 'inv-321'
  }
]

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0))

const formatCurrency = (value) =>
  `PKR ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`

const formatDate = (input) => {
  if (!input) return '—'
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getAgingLabel = (input) => {
  if (!input) return '—'
  const reference = new Date(input)
  if (Number.isNaN(reference.getTime())) {
    return '—'
  }
  const now = new Date()
  const diff = Math.floor((now.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24))
  if (!Number.isFinite(diff) || diff < 0) {
    return '—'
  }
  return `${diff} days`
}

const statusOrder = {
  pending: 0,
  submitted: 0,
  review: 1,
  active: 2,
  completed: 3,
  settled: 3,
  cancelled: 4,
  archived: 5,
  draft: 6,
}

const statusClassMap = {
  pending: reportsStyles.statusPending,
  submitted: reportsStyles.statusPending,
  review: reportsStyles.statusPending,
  active: reportsStyles.statusActive,
  completed: reportsStyles.statusCompleted,
  settled: reportsStyles.statusCompleted,
  cancelled: reportsStyles.statusCancelled,
  archived: reportsStyles.statusCancelled,
  draft: reportsStyles.statusDraft,
}

const loadingRows = Array.from({ length: 3 }).map((_, index) => ({
  id: `loading-${index}`,
  isLoading: true,
}))

export default function AdminReportsPage() {
  const router = useRouter()
  const {
    loading,
    error,
    stats,
    allInvestments,
    pendingInvestments,
    pendingProperties,
    contactMessages,
    refresh,
  } = useAdminDashboardData()

  // Calculate maintenance stats
  const maintenanceStats = useMemo(() => {
    return {
      total: MOCK_MAINTENANCE_REQUESTS.length,
      pending: MOCK_MAINTENANCE_REQUESTS.filter(req => req.status === 'Pending').length,
      inProgress: MOCK_MAINTENANCE_REQUESTS.filter(req => req.status === 'In Progress').length,
      completed: MOCK_MAINTENANCE_REQUESTS.filter(req => req.status === 'Completed').length,
      totalCost: MOCK_MAINTENANCE_REQUESTS.reduce((sum, req) => sum + (req.actualCost || req.estimatedCost || 0), 0)
    }
  }, [])

  const investmentStatuses = useMemo(() => {
    const statuses = new Set()
    allInvestments.forEach((investment) => {
      const status = (investment.status || 'pending').toString().toLowerCase()
      if (status) {
        const label = status.charAt(0).toUpperCase() + status.slice(1)
        statuses.add(label)
      }
    })
    return Array.from(statuses)
  }, [allInvestments])

  const [activeFilters, setActiveFilters] = useState([])

  useEffect(() => {
    // Start with no filters to show all real data by default
    setActiveFilters([])
  }, [investmentStatuses])

  const pendingCapital = useMemo(
    () => pendingInvestments.reduce((sum, inv) => sum + Number(inv.amount || inv.currentValue || 0), 0),
    [pendingInvestments]
  )

  const summaryCards = [
    {
      id: 'portfolioValue',
      label: 'Pipeline Volume',
      value: formatCurrency(stats.totalInvestmentValue),
      hint: `${formatNumber(allInvestments.length)} investment records`,
      trend: pendingInvestments.length 
        ? `${formatNumber(pendingInvestments.length)} pending` 
        : allInvestments.length 
          ? `${formatNumber(allInvestments.length)} active investments`
          : 'No investments yet',
      variant: pendingInvestments.length ? 'down' : 'up',
      iconClass: `${layoutStyles.cardIcon} ${layoutStyles.iconsales}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
    {
      id: 'approvals',
      label: 'Pending Approvals',
      value: formatNumber(pendingProperties.length + pendingInvestments.length),
      hint: `${formatNumber(pendingProperties.length)} property reviews`,
      trend: pendingInvestments.length 
        ? `${formatNumber(pendingInvestments.length)} investment checks` 
        : pendingProperties.length 
          ? `${formatNumber(pendingProperties.length)} property reviews only`
          : 'All reviews completed',
      variant: pendingProperties.length + pendingInvestments.length ? 'up' : 'neutral',
      iconClass: `${layoutStyles.cardIcon} ${layoutStyles.iconorders}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8H3" />
          <path d="M18 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Z" />
          <path d="m12 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Support Inbox',
      value: formatNumber(stats.totalMessages),
      hint: `${formatNumber(stats.totalUsers)} investors on file`,
      trend: stats.unreadMessages 
        ? `${formatNumber(stats.unreadMessages)} unread` 
        : stats.totalMessages 
          ? `${formatNumber(stats.totalMessages)} total messages`
          : 'No messages yet',
      variant: stats.unreadMessages ? 'down' : 'up',
      iconClass: `${layoutStyles.cardIcon} ${layoutStyles.iconproperties}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
      ),
    },
    {
      id: 'maintenance',
      label: 'Property Maintenance',
      value: formatNumber(maintenanceStats.total),
      hint: `${formatCurrency(maintenanceStats.totalCost)} total maintenance value`,
      trend: maintenanceStats.pending > 0 
        ? `${formatNumber(maintenanceStats.pending)} pending requests` 
        : maintenanceStats.inProgress > 0
          ? `${formatNumber(maintenanceStats.inProgress)} in progress`
          : maintenanceStats.completed > 0
            ? `${formatNumber(maintenanceStats.completed)} completed`
            : 'No maintenance requests',
      variant: maintenanceStats.pending > 0 ? 'down' : maintenanceStats.inProgress > 0 ? 'neutral' : 'up',
      iconClass: `${layoutStyles.cardIcon} ${layoutStyles.iconproperties}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
  ]

  // Helper function to find maintenance requests for an investment
  const getMaintenanceForInvestment = (investmentId) => {
    return MOCK_MAINTENANCE_REQUESTS.filter(req => req.investmentId === investmentId)
  }

  const tableRows = useMemo(() => {
    if (loading) {
      return loadingRows
    }

    const normalizedFilters = new Set(activeFilters.map((filter) => filter.toLowerCase()))

    const rows = allInvestments.map((investment) => {
      const status = (investment.status || 'pending').toString().toLowerCase()
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
      const amount = Number(investment.amount || investment.currentValue || 0)
      const investor = investment.userEmail || investment.userId || 'Investor'
      const property =
        investment.propertyTitle || investment.propertyName || investment.propertyId || investment.asset || 'Not linked'
      const aging = getAgingLabel(investment.investmentDate || investment.createdAt)
      let nextAction = 'Monitor performance'
      if (status === 'pending' || status === 'submitted') {
        nextAction = 'Review submission'
      } else if (status === 'active') {
        nextAction = 'Track payouts'
      } else if (status === 'cancelled' || status === 'archived') {
        nextAction = 'Close out'
      }

      const maintenanceRequests = getMaintenanceForInvestment(investment.id)
      const hasMaintenance = maintenanceRequests.length > 0
      const pendingMaintenance = maintenanceRequests.filter(req => req.status === 'Pending' || req.status === 'In Progress').length

      return {
        id: investment.id,
        status,
        statusLabel,
        statusClass: statusClassMap[status] || reportsStyles.statusDraft,
        investor,
        property,
        amount,
        amountDisplay: formatCurrency(amount),
        aging,
        nextAction,
        renewal: formatDate(investment.investmentDate || investment.createdAt),
        maintenanceRequests,
        hasMaintenance,
        pendingMaintenance,
      }
    })

    const sortedRows = rows.sort((a, b) => {
      const orderDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
      if (orderDiff !== 0) {
        return orderDiff
      }
      return b.amount - a.amount
    })

    if (!normalizedFilters.size) {
      return sortedRows
    }

    return sortedRows.filter((row) => normalizedFilters.has(row.statusLabel.toLowerCase()))
  }, [activeFilters, allInvestments, loading])

  const handleRemoveFilter = (filter) => {
    setActiveFilters((prev) => prev.filter((item) => item !== filter))
  }

  const trendClassForVariant = (variant) => {
    if (variant === 'down') return `${layoutStyles.trend} ${layoutStyles.trendDown}`
    if (variant === 'up') return `${layoutStyles.trend} ${layoutStyles.trendUp}`
    return layoutStyles.trend
  }

  return (
    <AdminLayout
      title="Portfolio Reports"
      description="Generate investor-ready insights across investments, approvals, and support activity."
      metaTitle="Admin Reports"
      onRefresh={refresh}
    >
      <section className={layoutStyles.summaryRow}>
        {summaryCards.map((card) => (
          <article key={card.id} className={layoutStyles.summaryCard}>
            <div className={layoutStyles.cardHeader}>
              <div className={layoutStyles.cardTitleRow}>
                <span className={card.iconClass}>{card.icon}</span>
                <div>
                  <h3>{card.label}</h3>
                  <div className={layoutStyles.summaryValue}>{loading ? '…' : card.value}</div>
                </div>
              </div>
            </div>
            <div className={layoutStyles.summaryMeta}>
              <span className={layoutStyles.summaryHint}>{card.hint}</span>
              <span className={trendClassForVariant(card.variant)}>{card.trend}</span>
            </div>
          </article>
        ))}
      </section>

      <section className={reportsStyles.filtersSection}>
        <div className={reportsStyles.filterTags}>
          {activeFilters.length ? (
            activeFilters.map((filter) => (
              <button key={filter} className={reportsStyles.filterTag} onClick={() => handleRemoveFilter(filter)} type="button">
                {filter}
                <span className={reportsStyles.removeIcon}>×</span>
              </button>
            ))
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a status to focus the ledger.</span>
          )}
        </div>
        <button className={reportsStyles.moreFilters} type="button" onClick={refresh}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          Refresh data
        </button>
      </section>

      {error && !loading ? (
        <div style={{ marginBottom: '1.5rem', background: '#fee2e2', color: '#b91c1c', padding: '0.9rem 1.1rem', borderRadius: '0.8rem' }}>
          Unable to load the latest analytics. Try refreshing or check your connection.
        </div>
      ) : null}

      <section className={reportsStyles.tableSection}>
        <div className={reportsStyles.tableWrapper}>
          <table className={reportsStyles.dataTable}>
            <thead>
              <tr>
                <th>Investor</th>
                <th>Property</th>
                <th>Status</th>
                <th>Capital</th>
                <th>Aging</th>
                <th>Maintenance</th>
                <th>Next Action</th>
                <th>Recorded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && tableRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className={reportsStyles.emptyState}>
                    {activeFilters.length > 0 
                      ? 'No investments match the current status filters.' 
                      : 'No investment data available yet.'}
                  </td>
                </tr>
              ) : (
                (tableRows.length ? tableRows : loadingRows).map((row) => (
                  <tr key={row.id} className={row.isLoading ? reportsStyles.loadingRow : undefined}>
                    <td className={reportsStyles.rowPrimary}>{row.isLoading ? 'Loading…' : row.investor}</td>
                    <td>{row.isLoading ? '—' : row.property}</td>
                    <td>
                      {row.isLoading ? (
                        '—'
                      ) : (
                        <span className={`${reportsStyles.statusBadge} ${row.statusClass}`}>{row.statusLabel}</span>
                      )}
                    </td>
                    <td>{row.isLoading ? '—' : row.amountDisplay}</td>
                    <td>{row.isLoading ? '—' : row.aging}</td>
                    <td>
                      {row.isLoading ? '—' : (
                        row.hasMaintenance ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                              {row.maintenanceRequests.length} request{row.maintenanceRequests.length !== 1 ? 's' : ''}
                            </span>
                            {row.pendingMaintenance > 0 && (
                              <span style={{ 
                                fontSize: '0.75rem', 
                                color: '#dc2626', 
                                fontWeight: 600 
                              }}>
                                {row.pendingMaintenance} pending
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>None</span>
                        )
                      )}
                    </td>
                    <td>{row.isLoading ? '—' : row.nextAction}</td>
                    <td>{row.isLoading ? '—' : row.renewal}</td>
                    <td>
                      <div className={reportsStyles.actions}>
                        {!row.isLoading && (
                          <button 
                            type="button" 
                            className={`${reportsStyles.actionButton}`}
                            onClick={() => router.push(`/admin-dashboard/maintenance`)}
                            aria-label="View Maintenance"
                            style={{ 
                              background: row.pendingMaintenance > 0 ? '#fee2e2' : '#f3f4f6',
                              color: row.pendingMaintenance > 0 ? '#dc2626' : '#6b7280',
                              marginRight: '4px'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                          </button>
                        )}
                        <button type="button" className={reportsStyles.actionButton} aria-label="Archive">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        <button type="button" className={reportsStyles.actionButton} aria-label="Edit">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={layoutStyles.summaryRow}>
        <article className={layoutStyles.summaryCard}>
          <div className={layoutStyles.cardHeader}>
            <div className={layoutStyles.cardTitleRow}>
              <span className={`${layoutStyles.cardIcon} ${layoutStyles.iconorders}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8H3" />
                  <path d="M18 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Z" />
                  <path d="m12 12 2 2 4-4" />
                </svg>
              </span>
              <div>
                <h3>Pending capital</h3>
                <div className={layoutStyles.summaryValue}>{loading ? '…' : formatCurrency(pendingCapital)}</div>
              </div>
            </div>
          </div>
          <div className={layoutStyles.summaryMeta}>
            <span className={layoutStyles.summaryHint}>Awaiting confirmation across reviews</span>
            <span className={`${layoutStyles.trend} ${layoutStyles.trendDown}`}>
              {formatNumber(pendingInvestments.length)} investments pending
            </span>
          </div>
        </article>

        <article className={layoutStyles.summaryCard}>
          <div className={layoutStyles.cardHeader}>
            <div className={layoutStyles.cardTitleRow}>
              <span className={`${layoutStyles.cardIcon} ${layoutStyles.iconproperties}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                </svg>
              </span>
              <div>
                <h3>Support backlog</h3>
                <div className={layoutStyles.summaryValue}>{formatNumber(stats.unreadMessages)}</div>
              </div>
            </div>
          </div>
          <div className={layoutStyles.summaryMeta}>
            <span className={layoutStyles.summaryHint}>Unread contact messages</span>
            <span className={`${layoutStyles.trend} ${stats.unreadMessages ? layoutStyles.trendDown : layoutStyles.trendUp}`}>
              {stats.unreadMessages 
                ? 'Action required' 
                : stats.totalMessages 
                  ? 'All messages read'
                  : 'No messages'}
            </span>
          </div>
        </article>
      </section>

      <section className={layoutStyles.summaryRow}>
        <article className={layoutStyles.summaryCard}>
          <div className={layoutStyles.cardHeader}>
            <div className={layoutStyles.cardTitleRow}>
              <span className={`${layoutStyles.cardIcon} ${layoutStyles.iconorders}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <div>
                <h3>Contact log</h3>
                <div className={layoutStyles.summaryValue}>{formatNumber(contactMessages.length)}</div>
              </div>
            </div>
          </div>
          <div className={layoutStyles.summaryMeta}>
            <span className={layoutStyles.summaryHint}>Messages captured via the platform</span>
            <span className={layoutStyles.trend}>Last 90 days snapshot</span>
          </div>
        </article>
      </section>
    </AdminLayout>
  )
}
