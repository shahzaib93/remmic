import { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'

const formatCurrency = (value) =>
  `PKR ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0))

const getLastSixMonths = () => {
  const months = []
  const current = new Date()
  current.setDate(1)

  for (let i = 5; i >= 0; i -= 1) {
    const ref = new Date(current)
    ref.setMonth(ref.getMonth() - i)
    months.push(ref)
  }

  return months
}

export default function AdminAnalyticsPage() {
  const {
    loading,
    error,
    allProperties,
    allInvestments,
    contactMessages,
    stats,
    pendingProperties,
    pendingInvestments,
    refresh,
  } = useAdminDashboardData()

  const totalProperties = allProperties.length
  const totalInvestments = allInvestments.length
  const occupancyRate = totalProperties
    ? Math.round((stats.activeProperties / totalProperties) * 100)
    : 0

  const percentageDelta = (current, total) => {
    if (!total) return '0%'
    const ratio = Math.round((Number(current || 0) / total) * 100)
    return `${ratio}%`
  }

  const monthlyRevenue = useMemo(() => {
    if (!allInvestments.length) {
      return getLastSixMonths().map((month) => ({
        label: month.toLocaleDateString('en-IN', { month: 'short' }),
        value: 0,
      }))
    }

    const bucket = new Map()

    allInvestments.forEach((investment) => {
      const dateString = investment.investmentDate || investment.createdAt
      if (!dateString) return
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${date.getMonth()}`
      bucket.set(key, (bucket.get(key) || 0) + Number(investment.amount || investment.currentValue || 0))
    })

    return getLastSixMonths().map((month) => {
      const key = `${month.getFullYear()}-${month.getMonth()}`
      return {
        label: month.toLocaleDateString('en-IN', { month: 'short' }),
        value: bucket.get(key) || 0,
      }
    })
  }, [allInvestments])

  const maxRevenue = monthlyRevenue.reduce((max, entry) => Math.max(max, entry.value), 0) || 1

  const propertyPerformance = useMemo(() => {
    if (!allProperties.length) return []

    const parsePropertyValue = (property) => {
      const value = property.price || property.priceNumeric || property.startingBid || property.currentValue || 0
      if (typeof value === 'string') {
        return parseFloat(value.replace(/[^0-9.]/g, '')) || 0
      }
      return Number(value) || 0
    }

    const calculatePerformanceScore = (property) => {
      const status = (property.status || '').toString().toLowerCase()
      const type = (property.listingType || property.type || '').toString().toLowerCase()

      let baseScore = 100

      const statusDeductions = {
        pending: 45,
        submitted: 55,
        draft: 65,
        rejected: 75,
        maintenance: 15,
        dispute: 25,
        vacant: 10,
      }

      if (statusDeductions[status]) {
        baseScore -= statusDeductions[status]
      }

      const issues = property.issues || []
      const maintenanceIssues = issues.filter(issue =>
        issue.type === 'maintenance' || issue.category === 'maintenance'
      )
      const legalIssues = issues.filter(issue =>
        issue.type === 'legal' || issue.category === 'legal'
      )
      const tenantIssues = issues.filter(issue =>
        issue.type === 'tenant' || issue.category === 'tenant'
      )

      if (maintenanceIssues.length > 0) {
        baseScore -= Math.min(maintenanceIssues.length * 8, 25)
      }

      if (legalIssues.length > 0) {
        baseScore -= Math.min(legalIssues.length * 15, 35)
      }

      if (tenantIssues.length > 0) {
        baseScore -= Math.min(tenantIssues.length * 10, 20)
      }

      if (property.paymentStatus === 'overdue') {
        baseScore -= 20
      } else if (property.paymentStatus === 'late') {
        baseScore -= 10
      }

      const propertyAge = property.age || 0
      if (propertyAge > 20) {
        baseScore -= 8
      } else if (propertyAge > 10) {
        baseScore -= 4
      }

      if (['rental', 'lease', 'rent'].includes(type)) {
        const vacancyDays = property.vacancyDays || 0
        if (vacancyDays > 90) {
          baseScore -= 15
        } else if (vacancyDays > 30) {
          baseScore -= 8
        }
      }

      if (property.condition === 'excellent') baseScore += 5
      if (property.maintenanceScore && property.maintenanceScore > 8) baseScore += 3
      if (property.tenantRating && property.tenantRating > 4) baseScore += 3

      return Math.min(Math.max(baseScore, 5), 100)
    }

    const getPropertyMetrics = (property) => {
      const value = parsePropertyValue(property)
      const status = (property.status || '').toString().toLowerCase()
      const type = (property.listingType || property.type || '').toString().toLowerCase()
      const performanceScore = calculatePerformanceScore(property)

      const issues = property.issues || []
      const reasons = []

      if (performanceScore >= 95) {
        reasons.push('Excellent property performance')
      } else if (performanceScore >= 85) {
        reasons.push('Good performance with minor areas for improvement')
      } else if (performanceScore >= 70) {
        reasons.push('Moderate performance')
      } else if (performanceScore >= 50) {
        reasons.push('Below average performance')
      } else {
        reasons.push('Poor performance requiring immediate attention')
      }

      if (issues.some(i => i.type === 'maintenance')) {
        reasons.push('Maintenance issues affecting performance')
      }
      if (issues.some(i => i.type === 'legal')) {
        reasons.push('Legal complications reducing score')
      }
      if (issues.some(i => i.type === 'tenant')) {
        reasons.push('Tenant-related concerns')
      }
      if (property.paymentStatus === 'overdue') {
        reasons.push('Overdue payments impacting score')
      }
      if (property.vacancyDays > 30) {
        reasons.push('Extended vacancy period')
      }

      return {
        id: property.id || `prop-${Date.now()}-${Math.random()}`,
        name: property.title || property.name || property.propertyName || 'Untitled Property',
        status: status.charAt(0).toUpperCase() + status.slice(1),
        type: type.charAt(0).toUpperCase() + type.slice(1) || 'Property',
        value: formatCurrency(value),
        location: property.location || property.address || property.city || 'Location not specified',
        performanceScore: performanceScore,
        performanceColor: getPerformanceColor(performanceScore),
        performanceReasons: reasons,
        issues: issues,
        createdAt: property.createdAt || property.dateAdded,
        area: property.area || property.size,
      }
    }

    const getPerformanceColor = (score) => {
      if (score >= 90) return '#22c55e'
      if (score >= 80) return '#84cc16'
      if (score >= 70) return '#eab308'
      if (score >= 50) return '#f97316'
      return '#ef4444'
    }

    return allProperties
      .map(getPropertyMetrics)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 6)
  }, [allProperties])

  const metricCards = [
    {
      id: 'revenue',
      label: 'Portfolio',
      value: formatCurrency(stats.totalInvestmentValue),
      trendLabel: pendingInvestments.length ? `${pendingInvestments.length} pending` : 'Stable',
      trendVariant: pendingInvestments.length ? 'negative' : 'positive',
    },
    {
      id: 'properties',
      label: 'Properties',
      value: formatNumber(stats.activeProperties),
      trendLabel: pendingProperties.length ? `${pendingProperties.length} pending` : 'Active',
      trendVariant: pendingProperties.length ? 'positive' : 'neutral',
    },
    {
      id: 'occupancy',
      label: 'Occupancy',
      value: totalProperties ? `${occupancyRate}%` : '—',
      trendLabel: totalProperties ? `${percentageDelta(stats.activeProperties, totalProperties)}` : 'No data',
      trendVariant: occupancyRate < 70 ? 'negative' : 'positive',
    },
    {
      id: 'leads',
      label: 'Leads',
      value: formatNumber(contactMessages.length),
      trendLabel: stats.unreadMessages
        ? `${stats.unreadMessages} new`
        : stats.totalMessages
          ? 'All read'
          : 'None',
      trendVariant: stats.unreadMessages ? 'negative' : 'positive',
    },
  ]

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase()
    switch (statusLower) {
      case 'active':
      case 'approved':
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
      case 'pending':
      case 'submitted':
        return 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20'
      case 'rejected':
        return 'bg-red-500/15 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/15 text-gray-600 border-gray-500/20'
    }
  }

  return (
    <AdminLayout
      title="Analytics"
      description="Track growth, revenue, and asset health in real-time."
      metaTitle="Admin Analytics"
      onRefresh={refresh}
    >
      <div className="grid gap-7">
        {/* Metrics Grid */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          {metricCards.map((card) => (
            <article key={card.id} className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-gray-500 text-sm font-medium">{card.label}</h3>
                <span className={`text-xs font-semibold ${card.trendVariant === 'negative' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {card.trendLabel}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{loading ? '…' : card.value}</div>
            </article>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue Overview */}
          <article className="bg-white rounded-2xl p-6 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <h3 className="text-gray-800 font-semibold mb-6">Revenue Overview</h3>
            <div className="flex items-end justify-between gap-3 h-48">
              {monthlyRevenue.map((entry) => {
                const height = Math.round((entry.value / maxRevenue) * 100)
                return (
                  <div key={entry.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-40 bg-gray-100 rounded-lg relative overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-orange-500 to-orange-400 rounded-lg transition-all duration-300"
                        style={{ height: `${height || 2}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{entry.label}</span>
                  </div>
                )
              })}
            </div>
          </article>

          {/* Property Performance */}
          <article className="bg-white rounded-2xl p-6 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <h3 className="text-gray-800 font-semibold mb-6">Property Performance</h3>
            {loading ? (
              <p className="text-gray-400 m-0">Loading property metrics…</p>
            ) : propertyPerformance.length ? (
              <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                {propertyPerformance.map((property) => (
                  <div key={property.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-gray-800 font-medium text-sm m-0 truncate max-w-[60%]">{property.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold uppercase tracking-wide border ${getStatusBadgeClass(property.status)}`}>
                        {property.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">{property.type}</span>
                      <span className="text-xs font-semibold text-gray-800">{property.value}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">{property.location}</div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Performance Score</span>
                        <span className="text-xs font-bold" style={{ color: property.performanceColor }}>
                          {property.performanceScore}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(Math.max(property.performanceScore, 5), 100)}%`,
                            backgroundColor: property.performanceColor
                          }}
                        />
                      </div>
                    </div>
                    {property.performanceReasons && property.performanceReasons.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-[0.65rem] text-gray-500 uppercase tracking-wide">Performance Factors:</span>
                        <ul className="mt-1 space-y-0.5">
                          {property.performanceReasons.slice(0, 3).map((reason, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-gray-400 mt-0.5">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12h18m-9-9v18" />
                  </svg>
                </div>
                <h4 className="text-gray-800 font-semibold mb-1">No Properties Available</h4>
                <p className="text-gray-500 text-sm m-0">Start by adding properties to see performance analytics and insights.</p>
              </div>
            )}
          </article>
        </section>

        {error && !loading ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl">
            We could not load fresh analytics. Try refreshing the data.
          </div>
        ) : null}

        {/* Summary Cards */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          <article className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <div className="flex items-start gap-4 mb-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/15 to-orange-500/10 text-orange-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Portfolio Value</h3>
                <div className="text-xl font-bold text-gray-900">{loading ? '…' : formatCurrency(stats.totalInvestmentValue)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Captured across all investments</span>
              <span className="text-emerald-500">{formatNumber(totalInvestments)} investment records</span>
            </div>
          </article>

          <article className="bg-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(15,23,42,0.08)] border border-slate-200/20">
            <div className="flex items-start gap-4 mb-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">Contact Trends</h3>
                <div className="text-xl font-bold text-gray-900">{formatNumber(contactMessages.length)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Messages received in the current cycle</span>
              <span className="text-red-500">{formatNumber(stats.unreadMessages)} awaiting response</span>
            </div>
          </article>
        </section>
      </div>
    </AdminLayout>
  )
}
