import { useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminDashboardData } from '../../hooks/useAdminDashboardData'
import layoutStyles from '../../styles/adminLayout.module.css'
import analyticsStyles from '../../styles/adminAnalytics.module.css'

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
      const value = parsePropertyValue(property)
      
      // Start with 100% - all properties begin perfect
      let baseScore = 100
      
      // Deduct points based on status issues
      const statusDeductions = {
        pending: 45,     // Major deduction for pending approval
        submitted: 55,   // Significant deduction for awaiting review
        draft: 65,       // Property not completed
        rejected: 75,    // Major issues to resolve
        maintenance: 15, // Minor deduction for maintenance issues
        dispute: 25,     // Moderate deduction for disputes
        vacant: 10,      // Small deduction for vacancy
      }
      
      if (statusDeductions[status]) {
        baseScore -= statusDeductions[status]
      }
      
      // Deduct points for various issues
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
      
      // Deduct for maintenance issues
      if (maintenanceIssues.length > 0) {
        baseScore -= Math.min(maintenanceIssues.length * 8, 25) // Max 25 points for maintenance
      }
      
      // Deduct for legal issues
      if (legalIssues.length > 0) {
        baseScore -= Math.min(legalIssues.length * 15, 35) // Max 35 points for legal
      }
      
      // Deduct for tenant issues
      if (tenantIssues.length > 0) {
        baseScore -= Math.min(tenantIssues.length * 10, 20) // Max 20 points for tenant
      }
      
      // Deduct for payment delays
      if (property.paymentStatus === 'overdue') {
        baseScore -= 20
      } else if (property.paymentStatus === 'late') {
        baseScore -= 10
      }
      
      // Deduct for age and condition
      const propertyAge = property.age || 0
      if (propertyAge > 20) {
        baseScore -= 8
      } else if (propertyAge > 10) {
        baseScore -= 4
      }
      
      // Deduct for vacancy period (if rental)
      if (['rental', 'lease', 'rent'].includes(type)) {
        const vacancyDays = property.vacancyDays || 0
        if (vacancyDays > 90) {
          baseScore -= 15
        } else if (vacancyDays > 30) {
          baseScore -= 8
        }
      }
      
      // Bonus for excellent conditions
      if (property.condition === 'excellent') baseScore += 5
      if (property.maintenanceScore && property.maintenanceScore > 8) baseScore += 3
      if (property.tenantRating && property.tenantRating > 4) baseScore += 3
      
      return Math.min(Math.max(baseScore, 5), 100) // Cap between 5-100%
    }

    const getPropertyMetrics = (property) => {
      const value = parsePropertyValue(property)
      const status = (property.status || '').toString().toLowerCase()
      const type = (property.listingType || property.type || '').toString().toLowerCase()
      const performanceScore = calculatePerformanceScore(property)
      
      // Generate performance reasons
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
      
      // Add specific issue reasons
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
      if (score >= 90) return '#22c55e' // Green - Excellent
      if (score >= 80) return '#84cc16' // Light Green - Good
      if (score >= 70) return '#eab308' // Yellow - Average
      if (score >= 50) return '#f97316' // Orange - Below Average
      return '#ef4444' // Red - Poor
    }

    return allProperties
      .map(getPropertyMetrics)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 6) // Show top 6 performing properties
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

  return (
    <AdminLayout
      title="Analytics"
      description="Track growth, revenue, and asset health in real-time."
      metaTitle="Admin Analytics"
      onRefresh={refresh}
    >
      <div className={analyticsStyles.analyticsContent}>
        <section className={analyticsStyles.metricsGrid}>
          {metricCards.map((card) => (
            <article key={card.id} className={analyticsStyles.metricCard}>
              <div className={analyticsStyles.metricHeader}>
                <h3>{card.label}</h3>
                <span
                  className={`${analyticsStyles.metricTrend} ${
                    card.trendVariant === 'negative' ? analyticsStyles.metricTrendNegative : ''
                  }`}
                >
                  {card.trendLabel}
                </span>
              </div>
              <div className={analyticsStyles.metricValue}>{loading ? '…' : card.value}</div>
            </article>
          ))}
        </section>

        <section className={analyticsStyles.chartsSection}>
          <article className={analyticsStyles.chartCard}>
            <h3>Revenue Overview</h3>
            <div className={analyticsStyles.barChart}>
              {monthlyRevenue.map((entry) => {
                const height = Math.round((entry.value / maxRevenue) * 100)
                return (
                  <div key={entry.label} className={analyticsStyles.chartBar}>
                    <div className={analyticsStyles.barTrack}>
                      <div className={analyticsStyles.barFill} style={{ height: `${height || 2}%` }} />
                    </div>
                    <span className={analyticsStyles.barLabel}>{entry.label}</span>
                  </div>
                )
              })}
            </div>
          </article>

          <article className={analyticsStyles.chartCard}>
            <h3>Property Performance</h3>
            {loading ? (
              <p style={{ color: '#94a3b8', margin: 0 }}>Loading property metrics…</p>
            ) : propertyPerformance.length ? (
              <div className={analyticsStyles.propertyGrid}>
                {propertyPerformance.map((property) => (
                  <div key={property.id} className={analyticsStyles.propertyCard}>
                    <div className={analyticsStyles.propertyHeader}>
                      <h4 className={analyticsStyles.propertyTitle}>{property.name}</h4>
                      <span className={`${analyticsStyles.propertyStatus} ${analyticsStyles[`status${property.status}`]}`}>
                        {property.status}
                      </span>
                    </div>
                    <div className={analyticsStyles.propertyDetails}>
                      <div className={analyticsStyles.propertyMeta}>
                        <span className={analyticsStyles.propertyType}>{property.type}</span>
                        <span className={analyticsStyles.propertyValue}>{property.value}</span>
                      </div>
                      <div className={analyticsStyles.propertyLocation}>{property.location}</div>
                    </div>
                    <div className={analyticsStyles.performanceSection}>
                      <div className={analyticsStyles.performanceHeader}>
                        <span className={analyticsStyles.performanceLabel}>Performance Score</span>
                        <span 
                          className={analyticsStyles.performanceScore}
                          style={{ color: property.performanceColor }}
                        >
                          {property.performanceScore}%
                        </span>
                      </div>
                      <div className={analyticsStyles.performanceBar}>
                        <div
                          className={analyticsStyles.performanceFill}
                          style={{ 
                            width: `${Math.min(Math.max(property.performanceScore, 5), 100)}%`,
                            backgroundColor: property.performanceColor
                          }}
                        />
                      </div>
                      {property.performanceReasons && property.performanceReasons.length > 0 && (
                        <div className={analyticsStyles.performanceReasons}>
                          <div className={analyticsStyles.reasonsHeader}>
                            <span className={analyticsStyles.reasonsLabel}>Performance Factors:</span>
                          </div>
                          <ul className={analyticsStyles.reasonsList}>
                            {property.performanceReasons.slice(0, 3).map((reason, index) => (
                              <li key={index} className={analyticsStyles.reasonItem}>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={analyticsStyles.noDataState}>
                <div className={analyticsStyles.noDataIcon}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12h18m-9-9v18" />
                  </svg>
                </div>
                <h4>No Properties Available</h4>
                <p>Start by adding properties to see performance analytics and insights.</p>
              </div>
            )}
          </article>
        </section>

        {error && !loading ? (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.9rem 1.1rem', borderRadius: '0.9rem' }}>
            We could not load fresh analytics. Try refreshing the data.
          </div>
        ) : null}

        <section className={layoutStyles.summaryRow}>
          <article className={layoutStyles.summaryCard}>
            <div className={layoutStyles.cardHeader}>
              <div className={layoutStyles.cardTitleRow}>
                <span className={`${layoutStyles.cardIcon} ${layoutStyles.iconproperties}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </span>
                <div>
                  <h3>Portfolio Value</h3>
                  <div className={layoutStyles.summaryValue}>{loading ? '…' : formatCurrency(stats.totalInvestmentValue)}</div>
                </div>
              </div>
            </div>
            <div className={layoutStyles.summaryMeta}>
              <span className={layoutStyles.summaryHint}>Captured across all investments</span>
              <span className={`${layoutStyles.trend} ${layoutStyles.trendUp}`}>
                {formatNumber(totalInvestments)} investment records
              </span>
            </div>
          </article>

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
                  <h3>Contact Trends</h3>
                  <div className={layoutStyles.summaryValue}>{formatNumber(contactMessages.length)}</div>
                </div>
              </div>
            </div>
            <div className={layoutStyles.summaryMeta}>
              <span className={layoutStyles.summaryHint}>Messages received in the current cycle</span>
              <span className={`${layoutStyles.trend} ${layoutStyles.trendDown}`}>
                {formatNumber(stats.unreadMessages)} awaiting response
              </span>
            </div>
          </article>
        </section>
      </div>
    </AdminLayout>
  )
}
