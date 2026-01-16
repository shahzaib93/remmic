import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'

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

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
    case 'submitted':
    case 'review':
      return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20'
    case 'active':
      return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
    case 'completed':
    case 'settled':
      return 'bg-green-500/15 text-emerald-700 border-green-500/20'
    case 'cancelled':
    case 'archived':
      return 'bg-orange-500/15 text-orange-700 border-orange-500/20'
    default:
      return 'bg-gray-500/15 text-gray-600 border-gray-500/20'
  }
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
        statusClass: getStatusBadgeClass(status),
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

  const getTrendClass = (variant) => {
    if (variant === 'down') return 'text-red-500'
    if (variant === 'up') return 'text-emerald-500'
    return 'text-gray-500'
  }

  return (
    <AdminLayout
      title="Portfolio Reports"
      description="Generate investor-ready insights across investments, approvals, and support activity."
      metaTitle="Admin Reports"
      onRefresh={refresh}
    >
      {/* Summary Cards */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 mb-7">
        {summaryCards.map((card) => (
          <article key={card.id} className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <div className="flex items-start gap-4 mb-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/15 to-orange-500/10 text-orange-500 flex items-center justify-center">
                {card.icon}
              </span>
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{card.label}</h3>
                <div className="text-xl font-bold text-gray-900">{loading ? '…' : card.value}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{card.hint}</span>
              <span className={getTrendClass(card.variant)}>{card.trend}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Filters Section */}
      <section className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {activeFilters.length ? (
            activeFilters.map((filter) => (
              <button
                key={filter}
                className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 text-sm font-medium flex items-center gap-1 border-none cursor-pointer hover:bg-orange-500/20"
                onClick={() => handleRemoveFilter(filter)}
                type="button"
              >
                {filter}
                <span className="text-orange-400">×</span>
              </button>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Select a status to focus the ledger.</span>
          )}
        </div>
        <button
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          type="button"
          onClick={refresh}
        >
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
        <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl">
          Unable to load the latest analytics. Try refreshing or check your connection.
        </div>
      ) : null}

      {/* Data Table */}
      <section className="bg-white rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.08)] border border-slate-200/20 overflow-hidden mb-7">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Investor</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Property</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Status</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Capital</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Aging</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Maintenance</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Next Action</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200">Recorded</th>
                <th className="text-left p-4 text-gray-600 font-semibold border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {!loading && tableRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    {activeFilters.length > 0
                      ? 'No investments match the current status filters.'
                      : 'No investment data available yet.'}
                  </td>
                </tr>
              ) : (
                (tableRows.length ? tableRows : loadingRows).map((row) => (
                  <tr key={row.id} className={`hover:bg-gray-50 ${row.isLoading ? 'animate-pulse' : ''}`}>
                    <td className="p-4 border-b border-gray-100 font-medium text-gray-800">{row.isLoading ? 'Loading…' : row.investor}</td>
                    <td className="p-4 border-b border-gray-100 text-gray-600">{row.isLoading ? '—' : row.property}</td>
                    <td className="p-4 border-b border-gray-100">
                      {row.isLoading ? (
                        '—'
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide border ${row.statusClass}`}>
                          {row.statusLabel}
                        </span>
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-gray-600">{row.isLoading ? '—' : row.amountDisplay}</td>
                    <td className="p-4 border-b border-gray-100 text-gray-600">{row.isLoading ? '—' : row.aging}</td>
                    <td className="p-4 border-b border-gray-100">
                      {row.isLoading ? '—' : (
                        row.hasMaintenance ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-500">
                              {row.maintenanceRequests.length} request{row.maintenanceRequests.length !== 1 ? 's' : ''}
                            </span>
                            {row.pendingMaintenance > 0 && (
                              <span className="text-xs text-red-600 font-semibold">
                                {row.pendingMaintenance} pending
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )
                      )}
                    </td>
                    <td className="p-4 border-b border-gray-100 text-gray-600">{row.isLoading ? '—' : row.nextAction}</td>
                    <td className="p-4 border-b border-gray-100 text-gray-600">{row.isLoading ? '—' : row.renewal}</td>
                    <td className="p-4 border-b border-gray-100">
                      <div className="flex gap-1">
                        {!row.isLoading && (
                          <button
                            type="button"
                            className={`p-2 rounded-lg border-none cursor-pointer ${row.pendingMaintenance > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
                            onClick={() => router.push(`/admin-dashboard/maintenance`)}
                            aria-label="View Maintenance"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                          </button>
                        )}
                        <button type="button" className="p-2 rounded-lg bg-gray-100 text-gray-500 border-none cursor-pointer hover:bg-gray-200" aria-label="Archive">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        <button type="button" className="p-2 rounded-lg bg-gray-100 text-gray-500 border-none cursor-pointer hover:bg-gray-200" aria-label="Edit">
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

      {/* Additional Summary Cards */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 mb-7">
        <article className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
          <div className="flex items-start gap-4 mb-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8H3" />
                <path d="M18 5H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3Z" />
                <path d="m12 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Pending capital</h3>
              <div className="text-xl font-bold text-gray-900">{loading ? '…' : formatCurrency(pendingCapital)}</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Awaiting confirmation across reviews</span>
            <span className="text-red-500">{formatNumber(pendingInvestments.length)} investments pending</span>
          </div>
        </article>

        <article className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
          <div className="flex items-start gap-4 mb-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
              </svg>
            </span>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Support backlog</h3>
              <div className="text-xl font-bold text-gray-900">{formatNumber(stats.unreadMessages)}</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Unread contact messages</span>
            <span className={stats.unreadMessages ? 'text-red-500' : 'text-emerald-500'}>
              {stats.unreadMessages
                ? 'Action required'
                : stats.totalMessages
                  ? 'All messages read'
                  : 'No messages'}
            </span>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        <article className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
          <div className="flex items-start gap-4 mb-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-500/10 text-purple-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </span>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Contact log</h3>
              <div className="text-xl font-bold text-gray-900">{formatNumber(contactMessages.length)}</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Messages captured via the platform</span>
            <span className="text-gray-500">Last 90 days snapshot</span>
          </div>
        </article>
      </section>
    </AdminLayout>
  )
}
