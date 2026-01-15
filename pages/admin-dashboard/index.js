import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '../../components/AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { useFirebase } from '../../contexts/FirebaseContext'

// Format currency
const formatCurrency = (value) => {
  const num = Number(value || 0)
  if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `PKR ${(num / 100000).toFixed(1)}L`
  return `PKR ${num.toLocaleString()}`
}

// Format time ago
const formatTimeAgo = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diff = now - past
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return past.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })
}

export default function AdminDashboard() {
  const router = useRouter()
  const { adminUser, isSuper, logAuditAction } = useAdmin()
  const { getAllProperties, getEvaluations, getAllInvestments } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pendingEvaluations: 0,
    pendingListings: 0,
    liveAuctions: 0,
    maintenanceOpen: 0,
    projectsDevelopment: 0,
    documentsUploaded: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [quickStats, setQuickStats] = useState({
    totalProperties: 0,
    totalInvestors: 0,
    totalValue: 0,
    monthlyGrowth: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load properties
      let properties = []
      if (getAllProperties) {
        const result = await getAllProperties()
        if (result?.success) {
          properties = result.properties || []
        }
      }

      // Load from localStorage
      const localProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const allProperties = [...properties, ...localProperties]

      // Load evaluations
      let evaluations = []
      if (getEvaluations) {
        const evalResult = await getEvaluations()
        if (evalResult?.success) {
          evaluations = evalResult.evaluations || []
        }
      }
      const localEvaluations = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
      const allEvaluations = [...evaluations, ...localEvaluations]

      // Load investments
      const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]')

      // Load maintenance requests
      const maintenance = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]')

      // Load development projects
      const projects = JSON.parse(localStorage.getItem('developmentProjects') || '[]')

      // Calculate stats
      const pendingEvaluations = allEvaluations.filter(e =>
        e.status === 'Under Evaluation' || e.status === 'submitted' || !e.status
      ).length

      const pendingListings = allProperties.filter(p =>
        p.status === 'pending' || !p.status
      ).length

      const liveAuctions = allProperties.filter(p => {
        if (p.type !== 'bidding' && p.listingType !== 'bidding') return false
        if (p.status !== 'approved') return false
        const now = new Date()
        const start = p.bidding?.startDateTime ? new Date(p.bidding.startDateTime) : null
        const end = p.bidding?.endDateTime ? new Date(p.bidding.endDateTime) : null
        return start && end && now >= start && now <= end
      }).length

      const maintenanceOpen = maintenance.filter(m =>
        m.status === 'open' || m.status === 'pending' || !m.status
      ).length

      const projectsDevelopment = projects.filter(p =>
        p.status === 'UNDER_DEVELOPMENT' || p.status === 'FUNDING_OPEN'
      ).length

      // Documents uploaded in last 7 days
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      let documentsCount = 0
      allProperties.forEach(p => {
        if (p.documents?.length && new Date(p.createdAt) >= weekAgo) {
          documentsCount += p.documents.length
        }
        if (p.supportingDocuments?.length && new Date(p.createdAt) >= weekAgo) {
          documentsCount += p.supportingDocuments.length
        }
      })

      setStats({
        pendingEvaluations,
        pendingListings,
        liveAuctions,
        maintenanceOpen,
        projectsDevelopment,
        documentsUploaded: documentsCount,
      })

      // Quick stats
      const totalValue = allProperties.reduce((sum, p) => {
        return sum + Number(p.price || p.startingBid || p.bidding?.minBidAmount || 0)
      }, 0)

      setQuickStats({
        totalProperties: allProperties.length,
        totalInvestors: investments.length,
        totalValue,
        monthlyGrowth: 12.5,
      })

      // Generate recent activity
      const activity = []

      // Recent evaluations
      allEvaluations.slice(0, 3).forEach(e => {
        activity.push({
          id: `eval-${e.id}`,
          type: 'evaluation',
          title: 'Evaluation Submitted',
          description: e.propertyTitle || e.title || 'Property evaluation request',
          time: e.submittedAt || e.createdAt,
          status: e.status,
          icon: 'evaluation',
        })
      })

      // Recent property updates
      allProperties.filter(p => p.updatedAt || p.createdAt).slice(0, 3).forEach(p => {
        activity.push({
          id: `prop-${p.id}`,
          type: 'property',
          title: p.status === 'approved' ? 'Property Approved' : 'Property Added',
          description: p.title || p.name || 'Untitled property',
          time: p.updatedAt || p.createdAt,
          status: p.status,
          icon: 'property',
        })
      })

      // Recent investments
      investments.slice(0, 2).forEach(i => {
        activity.push({
          id: `inv-${i.id}`,
          type: 'investment',
          title: 'Investment Received',
          description: `${formatCurrency(i.amount)} in ${i.propertyTitle || 'property'}`,
          time: i.investmentDate || i.createdAt,
          status: i.status,
          icon: 'investment',
        })
      })

      // Sort by time
      activity.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivity(activity.slice(0, 8))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      id: 'evaluations',
      label: 'Pending Evaluations',
      value: stats.pendingEvaluations,
      href: '/admin-dashboard/evaluations',
      color: 'gold',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      ),
    },
    {
      id: 'listings',
      label: 'Pending Listings',
      value: stats.pendingListings,
      href: '/admin-dashboard/listings',
      color: 'blue',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
    },
    {
      id: 'auctions',
      label: 'Live Auctions',
      value: stats.liveAuctions,
      href: '/admin-dashboard/auctions',
      color: 'green',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.66 8L12 2.35 6.34 8a8.02 8.02 0 000 11.31c1.56 1.56 3.61 2.34 5.66 2.34s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31z"/>
        </svg>
      ),
    },
    {
      id: 'maintenance',
      label: 'Maintenance Open',
      value: stats.maintenanceOpen,
      href: '/admin-dashboard/management',
      color: 'orange',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
        </svg>
      ),
    },
    {
      id: 'development',
      label: 'Projects in Development',
      value: stats.projectsDevelopment,
      href: '/admin-dashboard/development',
      color: 'purple',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
        </svg>
      ),
    },
    {
      id: 'documents',
      label: 'Documents (7 days)',
      value: stats.documentsUploaded,
      href: '/admin-dashboard/reports',
      color: 'brown',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
      ),
    },
  ]

  const quickActions = [
    {
      label: 'Review Evaluations',
      href: '/admin-dashboard/evaluations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      ),
    },
    {
      label: 'Approve Listings',
      href: '/admin-dashboard/listings',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      ),
    },
    {
      label: 'Assign Managers',
      href: '/admin-dashboard/management',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      ),
    },
    {
      label: 'Generate Statements',
      href: '/admin-dashboard/reports',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      ),
      superOnly: true,
    },
    {
      label: 'View Audit Logs',
      href: '/admin-dashboard/audit-logs',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8l4-4 4 4h-2v4zm2-8H10V7h4v2z"/>
        </svg>
      ),
      superOnly: true,
    },
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'evaluation':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        )
      case 'property':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
        )
      case 'investment':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        )
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { label: 'Approved', color: 'green' },
      'pending': { label: 'Pending', color: 'gold' },
      'rejected': { label: 'Rejected', color: 'red' },
      'Under Evaluation': { label: 'Under Review', color: 'gold' },
      'submitted': { label: 'Submitted', color: 'blue' },
      'active': { label: 'Active', color: 'green' },
      'confirmed': { label: 'Confirmed', color: 'green' },
    }

    const mapped = statusMap[status] || { label: status || 'Unknown', color: 'gray' }
    return (
      <span className={`status-badge status-badge--${mapped.color}`}>
        {mapped.label}
      </span>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="dashboard-page">
        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <h1>Welcome back, {adminUser?.name?.split(' ')[0] || 'Admin'}</h1>
            <p>Here's what's happening with your platform today.</p>
          </div>
          <div className="header-meta">
            <span className="current-date">
              {new Date().toLocaleDateString('en-PK', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Quick Stats Bar */}
        <section className="quick-stats-bar">
          <div className="quick-stat">
            <span className="quick-stat__value">{quickStats.totalProperties}</span>
            <span className="quick-stat__label">Total Properties</span>
          </div>
          <div className="quick-stat-divider" />
          <div className="quick-stat">
            <span className="quick-stat__value">{quickStats.totalInvestors}</span>
            <span className="quick-stat__label">Total Investors</span>
          </div>
          <div className="quick-stat-divider" />
          <div className="quick-stat">
            <span className="quick-stat__value">{formatCurrency(quickStats.totalValue)}</span>
            <span className="quick-stat__label">Portfolio Value</span>
          </div>
          <div className="quick-stat-divider" />
          <div className="quick-stat quick-stat--highlight">
            <span className="quick-stat__value">+{quickStats.monthlyGrowth}%</span>
            <span className="quick-stat__label">Monthly Growth</span>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-section">
          <h2 className="section-title">Overview</h2>
          <div className="stats-grid">
            {statCards.map((stat) => (
              <Link key={stat.id} href={stat.href} className={`stat-card stat-card--${stat.color}`}>
                <div className="stat-card__icon">
                  {stat.icon}
                </div>
                <div className="stat-card__content">
                  <span className="stat-card__value">{loading ? '...' : stat.value}</span>
                  <span className="stat-card__label">{stat.label}</span>
                </div>
                <div className="stat-card__arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              {quickActions.map((action, index) => {
                if (action.superOnly && !isSuper) return null
                return (
                  <Link key={index} href={action.href} className="quick-action">
                    <span className="quick-action__icon">{action.icon}</span>
                    <span className="quick-action__label">{action.label}</span>
                    <svg className="quick-action__arrow" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                    </svg>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="activity-section">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <button className="refresh-btn" onClick={loadDashboardData}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </button>
            </div>
            <div className="activity-feed">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <span>Loading activity...</span>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className={`activity-icon activity-icon--${item.type}`}>
                      {getActivityIcon(item.type)}
                    </div>
                    <div className="activity-content">
                      <p className="activity-title">{item.title}</p>
                      <p className="activity-description">{item.description}</p>
                      <div className="activity-meta">
                        <span className="activity-time">{formatTimeAgo(item.time)}</span>
                        {item.status && getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Phase-1 Notice */}
        <div className="phase-notice">
          <div className="phase-notice__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div className="phase-notice__content">
            <strong>Phase-1 Admin System</strong>
            <p>Manual entries only. No online payments, escrow automation, or smart contracts. All transactions require manual verification.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
        }

        .header-content h1 {
          margin: 0;
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: #fff;
        }

        .header-content p {
          margin: 8px 0 0;
          color: #9ca3af;
          font-size: 0.95rem;
        }

        .current-date {
          font-size: 0.85rem;
          color: #6b7280;
        }

        /* Quick Stats Bar */
        .quick-stats-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.03) 100%);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 16px;
          overflow-x: auto;
        }

        .quick-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: fit-content;
        }

        .quick-stat__value {
          font-size: 1.35rem;
          font-weight: 700;
          color: #fff;
        }

        .quick-stat__label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .quick-stat--highlight .quick-stat__value {
          color: #22c55e;
        }

        .quick-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(201, 162, 39, 0.2);
          flex-shrink: 0;
        }

        /* Section Title */
        .section-title {
          margin: 0 0 16px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header .section-title {
          margin: 0;
        }

        .refresh-btn {
          padding: 8px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 8px;
          color: #c9a227;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .refresh-btn:hover {
          background: rgba(201, 162, 39, 0.15);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-2px);
        }

        .stat-card__icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card--gold .stat-card__icon {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }
        .stat-card--gold:hover {
          border-color: rgba(201, 162, 39, 0.3);
        }

        .stat-card--blue .stat-card__icon {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        .stat-card--blue:hover {
          border-color: rgba(59, 130, 246, 0.3);
        }

        .stat-card--green .stat-card__icon {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .stat-card--green:hover {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .stat-card--orange .stat-card__icon {
          background: rgba(249, 115, 22, 0.15);
          color: #f97316;
        }
        .stat-card--orange:hover {
          border-color: rgba(249, 115, 22, 0.3);
        }

        .stat-card--purple .stat-card__icon {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
        }
        .stat-card--purple:hover {
          border-color: rgba(168, 85, 247, 0.3);
        }

        .stat-card--brown .stat-card__icon {
          background: rgba(74, 55, 40, 0.25);
          color: #a18072;
        }
        .stat-card--brown:hover {
          border-color: rgba(74, 55, 40, 0.4);
        }

        .stat-card__content {
          flex: 1;
          min-width: 0;
        }

        .stat-card__value {
          display: block;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        .stat-card__label {
          display: block;
          margin-top: 6px;
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .stat-card__arrow {
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .stat-card:hover .stat-card__arrow {
          color: #c9a227;
          transform: translateX(4px);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        /* Quick Actions */
        .quick-actions-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: rgba(201, 162, 39, 0.05);
          border: 1px solid rgba(201, 162, 39, 0.1);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .quick-action:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: rgba(201, 162, 39, 0.25);
        }

        .quick-action__icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quick-action__label {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
        }

        .quick-action__arrow {
          color: #6b7280;
          transition: all 0.2s ease;
        }

        .quick-action:hover .quick-action__arrow {
          color: #c9a227;
          transform: translateX(4px);
        }

        /* Activity Section */
        .activity-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          gap: 14px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon--evaluation {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .activity-icon--property {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .activity-icon--investment {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
        }

        .activity-description {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .activity-time {
          font-size: 0.7rem;
          color: #6b7280;
        }

        /* Status Badges */
        .status-badge {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .status-badge--green {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .status-badge--gold {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .status-badge--red {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .status-badge--blue {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .status-badge--gray {
          background: rgba(107, 114, 128, 0.15);
          color: #9ca3af;
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          color: #6b7280;
          text-align: center;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(201, 162, 39, 0.2);
          border-top-color: #c9a227;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state svg {
          color: #4b5563;
          margin-bottom: 12px;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        /* Phase Notice */
        .phase-notice {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(74, 55, 40, 0.15);
          border: 1px solid rgba(74, 55, 40, 0.3);
          border-radius: 12px;
        }

        .phase-notice__icon {
          width: 36px;
          height: 36px;
          background: rgba(74, 55, 40, 0.25);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a18072;
          flex-shrink: 0;
        }

        .phase-notice__content {
          flex: 1;
        }

        .phase-notice__content strong {
          display: block;
          font-size: 0.9rem;
          color: #d4c4bc;
          margin-bottom: 4px;
        }

        .phase-notice__content p {
          margin: 0;
          font-size: 0.8rem;
          color: #a18072;
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .quick-stats-bar {
            gap: 16px;
            padding: 16px 20px;
          }

          .quick-stat__value {
            font-size: 1.15rem;
          }
        }

        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
            padding: 16px;
          }

          .stat-card__arrow {
            display: none;
          }

          .quick-stats-bar {
            flex-wrap: wrap;
            justify-content: center;
          }

          .quick-stat-divider {
            display: none;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
