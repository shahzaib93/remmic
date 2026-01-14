import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function MyInvestments() {
  const { user: firebaseUser, getInvestments } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const loadInvestments = async () => {
      if (user) {
        try {
          const result = await getInvestments(user.id)
          if (result?.success) {
            setInvestments(result.investments || [])
          }
        } catch (e) {
          // Load from localStorage as fallback
          const stored = localStorage.getItem('userInvestments')
          if (stored) {
            setInvestments(JSON.parse(stored))
          } else {
            // Demo data
            setInvestments([
              {
                id: '1',
                propertyName: 'DHA Phase 6 - Commercial Plot',
                propertyImage: '/property-1.jpg',
                type: 'Commercial',
                location: 'DHA Phase 6, Lahore',
                investedAmount: 500000,
                shares: 10,
                totalShares: 100,
                currentValue: 580000,
                returns: 16,
                status: 'active',
                startDate: '2024-01-15',
                tier: 'Gold'
              },
              {
                id: '2',
                propertyName: 'Bahria Town - Residential Villa',
                propertyImage: '/property-2.jpg',
                type: 'Residential',
                location: 'Bahria Town, Islamabad',
                investedAmount: 250000,
                shares: 5,
                totalShares: 100,
                currentValue: 275000,
                returns: 10,
                status: 'active',
                startDate: '2024-03-20',
                tier: 'Silver'
              },
              {
                id: '3',
                propertyName: 'Gulberg Business Center',
                propertyImage: '/property-3.jpg',
                type: 'Commercial',
                location: 'Gulberg III, Lahore',
                investedAmount: 100000,
                shares: 2,
                totalShares: 100,
                currentValue: 95000,
                returns: -5,
                status: 'active',
                startDate: '2024-06-10',
                tier: 'Bronze'
              }
            ])
          }
        }
      }
    }
    loadInvestments()
  }, [user])

  const formatCurrency = (value) => {
    if (!value) return 'PKR 0'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'PKR 0'
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(2)} Cr`
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(2)} Lac`
    return `PKR ${num.toLocaleString()}`
  }

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      pending: '#f59e0b',
      matured: '#3b82f6',
      withdrawn: '#6b7280'
    }
    return colors[status] || colors.active
  }

  const getTierColor = (tier) => {
    const colors = {
      Bronze: '#cd7f32',
      Silver: '#c0c0c0',
      Gold: '#c9a227',
      Platinum: '#e5e4e2'
    }
    return colors[tier] || colors.Bronze
  }

  const filteredInvestments = investments.filter(inv => {
    if (activeFilter === 'all') return true
    return inv.status === activeFilter
  })

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0)
  const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0)
  const totalGain = totalCurrentValue - totalInvested
  const overallReturn = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : 0

  if (loading) {
    return (
      <div className="investments-loading">
        <div className="investments-loading__spinner" />
        <p>Loading your investments...</p>
        <style jsx>{`
          .investments-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
            color: #ffffff;
            gap: 20px;
          }
          .investments-loading__spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(201, 162, 39, 0.2);
            border-top-color: #c9a227;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>My Investments - REMMIC</title>
        <meta name="description" content="View and manage your REMMIC real estate investments" />
      </Head>

      <Navbar />

      <main className="investments-page">
        {/* Header */}
        <section className="investments-header">
          <div className="investments-header__container">
            <div className="header-content">
              <h1>My Investments</h1>
              <p>Track and manage your real estate portfolio</p>
            </div>
            <a href="/investment-shares" className="invest-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              New Investment
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="investments-stats">
          <div className="investments-stats__container">
            <div className="stat-card">
              <div className="stat-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__label">Total Invested</span>
                <span className="stat-card__value">{formatCurrency(totalInvested)}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8v8M12 11v5M8 14v2M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                </svg>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__label">Current Value</span>
                <span className="stat-card__value">{formatCurrency(totalCurrentValue)}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ color: totalGain >= 0 ? '#10b981' : '#ef4444' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={totalGain >= 0 ? "M23 6l-9.5 9.5-5-5L1 18" : "M23 18l-9.5-9.5-5 5L1 6"}/>
                  <path d={totalGain >= 0 ? "M17 6h6v6" : "M17 18h6v-6"}/>
                </svg>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__label">Total Gain/Loss</span>
                <span className="stat-card__value" style={{ color: totalGain >= 0 ? '#10b981' : '#ef4444' }}>
                  {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                </span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ color: overallReturn >= 0 ? '#10b981' : '#ef4444' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__label">Overall Return</span>
                <span className="stat-card__value" style={{ color: overallReturn >= 0 ? '#10b981' : '#ef4444' }}>
                  {overallReturn >= 0 ? '+' : ''}{overallReturn}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="investments-filters">
          <div className="investments-filters__container">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All ({investments.length})
              </button>
              <button
                className={`filter-tab ${activeFilter === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                Active
              </button>
              <button
                className={`filter-tab ${activeFilter === 'matured' ? 'active' : ''}`}
                onClick={() => setActiveFilter('matured')}
              >
                Matured
              </button>
              <button
                className={`filter-tab ${activeFilter === 'withdrawn' ? 'active' : ''}`}
                onClick={() => setActiveFilter('withdrawn')}
              >
                Withdrawn
              </button>
            </div>
          </div>
        </section>

        {/* Investments List */}
        <section className="investments-list">
          <div className="investments-list__container">
            {filteredInvestments.length === 0 ? (
              <div className="no-investments">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5">
                  <path d="M16 8v8M12 11v5M8 14v2M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                </svg>
                <h3>No investments found</h3>
                <p>Start building your real estate portfolio today</p>
                <a href="/investment-shares" className="start-investing-btn">
                  Start Investing
                </a>
              </div>
            ) : (
              <div className="investments-grid">
                {filteredInvestments.map((investment) => (
                  <article key={investment.id} className="investment-card">
                    <div className="investment-card__header">
                      <div className="investment-card__image">
                        <img
                          src={investment.propertyImage || '/placeholder-property.jpg'}
                          alt={investment.propertyName}
                          onError={(e) => { e.target.src = '/placeholder-property.jpg' }}
                        />
                        <span
                          className="investment-card__tier"
                          style={{ background: getTierColor(investment.tier) }}
                        >
                          {investment.tier}
                        </span>
                      </div>
                      <div className="investment-card__info">
                        <h3>{investment.propertyName}</h3>
                        <p className="investment-card__location">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          {investment.location}
                        </p>
                        <span className="investment-card__type">{investment.type}</span>
                      </div>
                    </div>

                    <div className="investment-card__body">
                      <div className="investment-card__stats">
                        <div className="investment-stat">
                          <span className="investment-stat__label">Invested</span>
                          <span className="investment-stat__value">{formatCurrency(investment.investedAmount)}</span>
                        </div>
                        <div className="investment-stat">
                          <span className="investment-stat__label">Current Value</span>
                          <span className="investment-stat__value">{formatCurrency(investment.currentValue)}</span>
                        </div>
                        <div className="investment-stat">
                          <span className="investment-stat__label">Shares</span>
                          <span className="investment-stat__value">{investment.shares}/{investment.totalShares}</span>
                        </div>
                        <div className="investment-stat">
                          <span className="investment-stat__label">Returns</span>
                          <span
                            className="investment-stat__value"
                            style={{ color: investment.returns >= 0 ? '#10b981' : '#ef4444' }}
                          >
                            {investment.returns >= 0 ? '+' : ''}{investment.returns}%
                          </span>
                        </div>
                      </div>

                      <div className="investment-card__progress">
                        <div className="progress-label">
                          <span>Ownership</span>
                          <span>{((investment.shares / investment.totalShares) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${(investment.shares / investment.totalShares) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="investment-card__footer">
                      <div className="investment-card__status">
                        <span
                          className="status-badge"
                          style={{
                            background: `${getStatusColor(investment.status)}20`,
                            color: getStatusColor(investment.status)
                          }}
                        >
                          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                        </span>
                        <span className="investment-date">Since {new Date(investment.startDate).toLocaleDateString()}</span>
                      </div>
                      <a href={`/investment/${investment.id}`} className="view-details-btn">
                        View Details
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                        </svg>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .investments-page {
          min-height: 100vh;
          background: #f9fafb;
          padding-top: 90px;
        }

        /* Header */
        .investments-header {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 60px 5%;
        }

        .investments-header__container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }

        .header-content h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px;
        }

        .header-content p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .invest-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .invest-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.4);
        }

        /* Stats */
        .investments-stats {
          padding: 0 5%;
          margin-top: -40px;
        }

        .investments-stats__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .stat-card__icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 12px;
          color: #c9a227;
        }

        .stat-card__content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-card__label {
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .stat-card__value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        /* Filters */
        .investments-filters {
          padding: 40px 5% 20px;
        }

        .investments-filters__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 10px 20px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-tab:hover {
          border-color: #c9a227;
          color: #c9a227;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          border-color: transparent;
          color: #0a0a0a;
        }

        /* Investments List */
        .investments-list {
          padding: 20px 5% 80px;
        }

        .investments-list__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .no-investments {
          text-align: center;
          padding: 80px 20px;
          background: #ffffff;
          border-radius: 20px;
        }

        .no-investments h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 24px 0 8px;
        }

        .no-investments p {
          color: #6b7280;
          margin: 0 0 24px;
        }

        .start-investing-btn {
          display: inline-flex;
          padding: 14px 32px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-weight: 600;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .start-investing-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.3);
        }

        .investments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        .investment-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .investment-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        .investment-card__header {
          display: flex;
          gap: 16px;
          padding: 20px 20px 16px;
        }

        .investment-card__image {
          position: relative;
          width: 100px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .investment-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .investment-card__tier {
          position: absolute;
          top: 6px;
          left: 6px;
          padding: 2px 8px;
          font-size: 0.625rem;
          font-weight: 700;
          color: #0a0a0a;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .investment-card__info {
          flex: 1;
          min-width: 0;
        }

        .investment-card__info h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .investment-card__location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
          color: #6b7280;
          margin: 0 0 8px;
        }

        .investment-card__type {
          display: inline-block;
          padding: 2px 10px;
          background: #f3f4f6;
          font-size: 0.75rem;
          color: #374151;
          border-radius: 100px;
        }

        .investment-card__body {
          padding: 0 20px 20px;
        }

        .investment-card__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .investment-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .investment-stat__label {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .investment-stat__value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #0a0a0a;
        }

        .investment-card__progress {
          margin-bottom: 0;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .progress-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 100px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a227, #d4b13d);
          border-radius: 100px;
        }

        .investment-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        .investment-card__status {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 100px;
        }

        .investment-date {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .view-details-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #c9a227;
          text-decoration: none;
          transition: gap 0.3s ease;
        }

        .view-details-btn:hover {
          gap: 10px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .investments-stats__container {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .investments-header__container {
            flex-direction: column;
            text-align: center;
          }

          .investments-stats__container {
            grid-template-columns: 1fr;
          }

          .investments-stats {
            margin-top: -20px;
          }

          .investments-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
