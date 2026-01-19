import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Dashboard() {
  const { user: firebaseUser, logout, getProperties, getInvestments } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProperties, setUserProperties] = useState([])
  const [userInvestments, setUserInvestments] = useState([])
  const [activeSection, setActiveSection] = useState('overview')
  
  // Check for URL section parameter
  useEffect(() => {
    const { section } = router.query
    if (section && ['overview', 'properties', 'investments', 'activity'].includes(section)) {
      setActiveSection(section)
    }
  }, [router.query])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          if (parsedUser.role === 'admin') {
            router.push('/admin-dashboard')
            return
          }
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
      setTimeout(() => setIsVisible(true), 100)
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Load properties
        try {
          const propsResult = await getProperties({ userId: user.id })
          if (propsResult?.success) {
            setUserProperties(propsResult.properties || [])
          }
        } catch (e) {
          const stored = localStorage.getItem('userProperties')
          if (stored) setUserProperties(JSON.parse(stored))
        }

        // Load investments
        try {
          const invResult = await getInvestments(user.id)
          if (invResult?.success) {
            setUserInvestments(invResult.investments || [])
          }
        } catch (e) {
          let stored = localStorage.getItem('userInvestments')
          if (stored) {
            let investments = JSON.parse(stored)
            
            // Update existing investments with ownership percentage if missing
            let hasUpdates = false
            investments = investments.map(investment => {
              if (!investment.ownershipPercentage && investment.shares) {
                hasUpdates = true
                const totalShares = investment.totalShares || 1000 // fallback
                const ownershipPercentage = ((investment.shares / totalShares) * 100).toFixed(2)
                return {
                  ...investment,
                  totalShares,
                  ownershipPercentage: parseFloat(ownershipPercentage)
                }
              }
              return investment
            })
            
            // Save updated data back to localStorage
            if (hasUpdates) {
              localStorage.setItem('userInvestments', JSON.stringify(investments))
            }
            
            setUserInvestments(investments)
          }
        }
      }
    }
    loadUserData()
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatCurrency = (value) => {
    if (!value) return 'PKR 0'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'PKR 0'
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(2)} Cr`
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(2)} Lac`
    return `PKR ${num.toLocaleString()}`
  }

  const totalInvested = userInvestments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0)
  const totalProperties = userProperties.length

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__spinner" />
        <p>Loading your dashboard...</p>
        <style jsx>{`
          .dashboard-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
            color: #ffffff;
            gap: 20px;
          }
          .dashboard-loading__spinner {
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
        <title>Dashboard - REMMIC</title>
        <meta name="description" content="Your REMMIC investment dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className="dashboard">
        {/* Hero Header */}
        <section className="dashboard-hero">
          <div className={`dashboard-hero__container ${isVisible ? 'is-visible' : ''}`}>
            <div className="dashboard-hero__welcome">
              <span className="dashboard-hero__greeting">Welcome back</span>
              <h1 className="dashboard-hero__name">{user.name || 'Investor'}</h1>
              <p className="dashboard-hero__subtitle">Manage your real estate portfolio</p>
            </div>
            <div className="dashboard-hero__actions">
              <a href="/land-registration" className="dashboard-btn dashboard-btn--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Register Property
              </a>
              <a href="/investment-shares" className="dashboard-btn dashboard-btn--secondary">
                Invest Now
              </a>
              <button onClick={handleLogout} className="dashboard-btn dashboard-btn--ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="dashboard-stats">
          <div className="dashboard-stats__container">
            <div className="dashboard-stat">
              <div className="dashboard-stat__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div className="dashboard-stat__content">
                <span className="dashboard-stat__label">Total Invested</span>
                <span className="dashboard-stat__value">{formatCurrency(totalInvested)}</span>
              </div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>
                </svg>
              </div>
              <div className="dashboard-stat__content">
                <span className="dashboard-stat__label">Properties</span>
                <span className="dashboard-stat__value">{totalProperties}</span>
              </div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8v8M12 11v5M8 14v2M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                </svg>
              </div>
              <div className="dashboard-stat__content">
                <span className="dashboard-stat__label">Investments</span>
                <span className="dashboard-stat__value">{userInvestments.length}</span>
              </div>
            </div>
            <div className="dashboard-stat">
              <div className="dashboard-stat__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="dashboard-stat__content">
                <span className="dashboard-stat__label">Member Since</span>
                <span className="dashboard-stat__value">{user.memberSince || 'Recently'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="dashboard-nav">
          <div className="dashboard-nav__container">
            {['overview', 'properties', 'investments', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`dashboard-nav__tab ${activeSection === tab ? 'dashboard-nav__tab--active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {/* Content Sections */}
        <section className="dashboard-content">
          <div className="dashboard-content__container">

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="dashboard-grid">
                {/* Quick Actions */}
                <div className="dashboard-card dashboard-card--full">
                  <h3 className="dashboard-card__title">Quick Actions</h3>
                  <div className="dashboard-actions">
                    <a href="/land-registration" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                      </div>
                      <span>Register Property</span>
                    </a>
                    <a href="/investment-shares" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8v8M12 11v5M8 14v2"/>
                        </svg>
                      </div>
                      <span>Buy Shares</span>
                    </a>
                    <a href="/rental" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <span>Browse Rentals</span>
                    </a>
                    <a href="/bidding" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                        </svg>
                      </div>
                      <span>Live Auctions</span>
                    </a>
                    <a href="/evaluation" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                      </div>
                      <span>Get Evaluation</span>
                    </a>
                    <a href="/reports" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                        </svg>
                      </div>
                      <span>View Reports</span>
                    </a>
                    <a href="/my-investments" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                        </svg>
                      </div>
                      <span>My Investments</span>
                    </a>
                    <a href="/asset-management" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                      </div>
                      <span>Asset Management</span>
                    </a>
                    <a href="/wallet" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/>
                        </svg>
                      </div>
                      <span>Wallet & Credits</span>
                    </a>
                    <a href="/profile" className="dashboard-action">
                      <div className="dashboard-action__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <span>Profile & Settings</span>
                    </a>
                  </div>
                </div>

                {/* Recent Properties */}
                <div className="dashboard-card">
                  <div className="dashboard-card__header">
                    <h3 className="dashboard-card__title">My Properties</h3>
                    <a href="/land-registration" className="dashboard-card__link">+ Add New</a>
                  </div>
                  {userProperties.length === 0 ? (
                    <div className="dashboard-empty">
                      <p>No properties registered yet</p>
                      <a href="/land-registration" className="dashboard-btn dashboard-btn--small">Register Property</a>
                    </div>
                  ) : (
                    <div className="dashboard-list">
                      {userProperties.slice(0, 3).map((property) => (
                        <div key={property.id} className="dashboard-item">
                          <div className="dashboard-item__info">
                            <h4>{property.title || 'Untitled Property'}</h4>
                            <p>{property.location || 'Location not set'}</p>
                          </div>
                          <span className={`dashboard-badge dashboard-badge--${property.status?.toLowerCase() || 'pending'}`}>
                            {property.status || 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Investments */}
                <div className="dashboard-card">
                  <div className="dashboard-card__header">
                    <h3 className="dashboard-card__title">My Investments</h3>
                    <a href="/investment-shares" className="dashboard-card__link">View All</a>
                  </div>
                  {userInvestments.length === 0 ? (
                    <div className="dashboard-empty">
                      <p>No investments yet</p>
                      <a href="/investment-shares" className="dashboard-btn dashboard-btn--small">Start Investing</a>
                    </div>
                  ) : (
                    <div className="dashboard-list">
                      {userInvestments.slice(0, 3).map((investment) => (
                        <div key={investment.id} className="dashboard-item">
                          <div className="dashboard-item__info">
                            <h4>{investment.propertyTitle || 'Investment'}</h4>
                            <p>{investment.shares || 0} shares</p>
                          </div>
                          <span className="dashboard-item__value">{formatCurrency(investment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Properties Section */}
            {activeSection === 'properties' && (
              <div className="dashboard-section">
                <div className="dashboard-section__header">
                  <h2>My Properties</h2>
                  <a href="/land-registration" className="dashboard-btn dashboard-btn--primary">Register New</a>
                </div>
                {userProperties.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>
                    </svg>
                    <h3>No Properties Yet</h3>
                    <p>Register your first property to start building your portfolio</p>
                    <a href="/land-registration" className="dashboard-btn dashboard-btn--primary">Register Property</a>
                  </div>
                ) : (
                  <div className="dashboard-properties">
                    {userProperties.map((property) => (
                      <div key={property.id} className="property-card">
                        <div className="property-card__header">
                          <h3>{property.title || 'Untitled'}</h3>
                          <span className={`dashboard-badge dashboard-badge--${property.status?.toLowerCase() || 'pending'}`}>
                            {property.status || 'Pending'}
                          </span>
                        </div>
                        <div className="property-card__details">
                          <div className="property-card__detail">
                            <span className="label">Location</span>
                            <span className="value">{property.location || 'Not specified'}</span>
                          </div>
                          <div className="property-card__detail">
                            <span className="label">Area</span>
                            <span className="value">{property.area || property.plotSize || 'N/A'}</span>
                          </div>
                          <div className="property-card__detail">
                            <span className="label">Type</span>
                            <span className="value">{property.landType || property.type || 'N/A'}</span>
                          </div>
                          <div className="property-card__detail">
                            <span className="label">Price</span>
                            <span className="value">{formatCurrency(property.price)}</span>
                          </div>
                        </div>
                        <div className="property-card__actions">
                          <a href={`/property/${property.id}`} className="dashboard-btn dashboard-btn--small">View Details</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Investments Section */}
            {activeSection === 'investments' && (
              <div className="dashboard-section">
                <div className="dashboard-section__header">
                  <h2>My Investments</h2>
                  <a href="/investment-shares" className="dashboard-btn dashboard-btn--primary">Invest More</a>
                </div>
                {userInvestments.length === 0 ? (
                  <div className="dashboard-empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M16 8v8M12 11v5M8 14v2M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    </svg>
                    <h3>No Investments Yet</h3>
                    <p>Start investing in fractional property ownership</p>
                    <a href="/investment-shares" className="dashboard-btn dashboard-btn--primary">Browse Investments</a>
                  </div>
                ) : (
                  <div className="dashboard-investments">
                    {userInvestments.map((investment) => (
                      <div key={investment.id} className="investment-card">
                        <div className="investment-card__header">
                          <h3>{investment.propertyTitle || 'Investment'}</h3>
                          <span className={`dashboard-badge dashboard-badge--${investment.status || 'active'}`}>
                            {investment.status || 'Active'}
                          </span>
                        </div>
                        <div className="investment-card__stats">
                          <div className="investment-card__stat">
                            <span className="label">Invested</span>
                            <span className="value">{formatCurrency(investment.amount)}</span>
                          </div>
                          <div className="investment-card__stat">
                            <span className="label">Shares</span>
                            <span className="value">{investment.shares || 0}</span>
                          </div>
                          <div className="investment-card__stat">
                            <span className="label">Ownership</span>
                            <span className="value">
                              {(() => {
                                // If ownershipPercentage is already calculated
                                if (investment.ownershipPercentage) {
                                  return `${investment.ownershipPercentage}%`;
                                }
                                
                                // If we have shares and totalShares, calculate
                                if (investment.shares && investment.totalShares) {
                                  return `${((investment.shares / investment.totalShares) * 100).toFixed(2)}%`;
                                }
                                
                                // Fallback for older investments - assume 1000 total shares
                                if (investment.shares) {
                                  const fallbackTotalShares = 1000;
                                  return `${((investment.shares / fallbackTotalShares) * 100).toFixed(2)}%`;
                                }
                                
                                return '0%';
                              })()}
                            </span>
                          </div>
                          <div className="investment-card__stat">
                            <span className="label">Date</span>
                            <span className="value">{new Date(investment.investmentDate || investment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Activity Section */}
            {activeSection === 'activity' && (
              <div className="dashboard-section">
                <div className="dashboard-section__header">
                  <h2>Recent Activity</h2>
                </div>
                <div className="dashboard-activity">
                  <div className="activity-item">
                    <div className="activity-item__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>
                      </svg>
                    </div>
                    <div className="activity-item__content">
                      <p>Account created</p>
                      <span>{user.memberSince || 'Recently'}</span>
                    </div>
                  </div>
                  {userProperties.slice(0, 3).map((property) => (
                    <div key={property.id} className="activity-item">
                      <div className="activity-item__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <div className="activity-item__content">
                        <p>Property registered: {property.title}</p>
                        <span>{property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                  {userInvestments.slice(0, 3).map((investment) => (
                    <div key={investment.id} className="activity-item">
                      <div className="activity-item__icon activity-item__icon--gold">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                        </svg>
                      </div>
                      <div className="activity-item__content">
                        <p>Investment made: {formatCurrency(investment.amount)}</p>
                        <span>{investment.investmentDate ? new Date(investment.investmentDate).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Account Info */}
        <section className="dashboard-account">
          <div className="dashboard-account__container">
            <h3>Account Information</h3>
            <div className="dashboard-account__grid">
              <div className="dashboard-account__item">
                <span className="label">Name</span>
                <span className="value">{user.name || 'Not provided'}</span>
              </div>
              <div className="dashboard-account__item">
                <span className="label">Email</span>
                <span className="value">{user.email || 'Not provided'}</span>
              </div>
              <div className="dashboard-account__item">
                <span className="label">Role</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>{user.role || 'Investor'}</span>
              </div>
              <div className="dashboard-account__item">
                <span className="label">Member Since</span>
                <span className="value">{user.memberSince || 'Recently'}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
          padding-top: 72px;
          font-family: 'Manrope', sans-serif;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION A: DASHBOARD HERO */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #151515 100%);
          padding: 48px 5%;
          position: relative;
          overflow: hidden;
        }

        .dashboard-hero::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background: radial-gradient(ellipse at 80% 30%, rgba(201, 162, 39, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .dashboard-hero__container {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dashboard-hero__container.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .dashboard-hero__greeting {
          display: block;
          font-size: 0.6875rem;
          color: #c9a227;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-hero__name {
          margin: 0;
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 600;
          color: #ffffff;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        .dashboard-hero__subtitle {
          margin: 10px 0 0;
          color: rgba(255, 255, 255, 0.55);
          font-size: 0.9375rem;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-hero__actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        /* Buttons */
        .dashboard-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 22px;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);
        }

        .dashboard-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.4);
        }

        .dashboard-btn--secondary {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .dashboard-btn--secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .dashboard-btn--ghost {
          background: transparent;
          color: rgba(255, 255, 255, 0.5);
          padding: 10px 14px;
          font-size: 0.8125rem;
        }

        .dashboard-btn--ghost:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .dashboard-btn--small {
          padding: 10px 18px;
          font-size: 0.8125rem;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION B: STATS ROW */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-stats {
          background: #ffffff;
          padding: 0 5%;
          border-bottom: 1px solid #e8e8e6;
        }

        .dashboard-stats__container {
          max-width: 1140px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .dashboard-stat {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 24px 20px;
          background: #ffffff;
          border-right: 1px solid #f0f0ee;
          transition: all 0.25s ease;
        }

        .dashboard-stat:last-child {
          border-right: none;
        }

        .dashboard-stat:hover {
          background: #faf9f8;
        }

        .dashboard-stat__icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.04) 100%);
          border-radius: 12px;
          color: #c9a227;
          flex-shrink: 0;
        }

        .dashboard-stat__label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 500;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-stat__value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION C: TABS NAVIGATION */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-nav {
          background: #ffffff;
          border-bottom: 1px solid #e8e8e6;
          padding: 0 5%;
          position: sticky;
          top: 72px;
          z-index: 50;
        }

        .dashboard-nav__container {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          gap: 4px;
        }

        .dashboard-nav__tab {
          padding: 18px 24px;
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.25s ease;
          font-family: 'Manrope', sans-serif;
          position: relative;
        }

        .dashboard-nav__tab:hover {
          color: #1a1a1a;
        }

        .dashboard-nav__tab--active {
          color: #c9a227;
          border-bottom-color: #c9a227;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION D: CONTENT AREA */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-content {
          padding: 36px 5% 56px;
        }

        .dashboard-content__container {
          max-width: 1140px;
          margin: 0 auto;
        }

        /* Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        /* Cards */
        .dashboard-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 26px;
          border: 1px solid #e8e8e6;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }

        .dashboard-card:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
        }

        .dashboard-card--full {
          grid-column: 1 / -1;
        }

        .dashboard-card--full:hover {
          transform: none;
        }

        .dashboard-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0ee;
        }

        .dashboard-card__title {
          margin: 0 0 20px;
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-card__header .dashboard-card__title {
          margin: 0;
        }

        .dashboard-card__link {
          font-size: 0.8125rem;
          color: #c9a227;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .dashboard-card__link:hover {
          color: #b8922a;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* QUICK ACTIONS GRID */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-actions {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .dashboard-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 14px;
          background: #faf9f8;
          border-radius: 14px;
          text-decoration: none;
          color: #3d3d3d;
          font-weight: 600;
          font-size: 0.8125rem;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-action:hover {
          background: #ffffff;
          border-color: rgba(201, 162, 39, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.12);
        }

        .dashboard-action:hover .dashboard-action__icon {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.35);
          transform: scale(1.05);
        }

        .dashboard-action__icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 12px;
          color: #c9a227;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION E: PROPERTIES & INVESTMENTS CARDS */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dashboard-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #faf9f8;
          border-radius: 12px;
          border: 1px solid #f0f0ee;
          transition: all 0.2s ease;
        }

        .dashboard-item:hover {
          border-color: rgba(201, 162, 39, 0.25);
          background: #ffffff;
        }

        .dashboard-item__info h4 {
          margin: 0 0 4px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-item__info p {
          margin: 0;
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .dashboard-item__value {
          font-weight: 700;
          color: #c9a227;
          font-size: 0.9375rem;
        }

        /* Badge */
        .dashboard-badge {
          padding: 5px 12px;
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-badge--approved, .dashboard-badge--active, .dashboard-badge--completed {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .dashboard-badge--pending {
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        }

        .dashboard-badge--rejected {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        /* Empty State */
        .dashboard-empty {
          padding: 36px 24px;
          text-align: center;
          color: #6b7280;
          background: #faf9f8;
          border-radius: 12px;
        }

        .dashboard-empty p {
          margin: 0 0 16px;
          font-size: 0.9375rem;
        }

        .dashboard-empty-state {
          text-align: center;
          padding: 72px 24px;
          color: #6b7280;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e8e8e6;
        }

        .dashboard-empty-state svg {
          color: #d1d5db;
          margin-bottom: 20px;
        }

        .dashboard-empty-state h3 {
          margin: 0 0 8px;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .dashboard-empty-state p {
          margin: 0 0 24px;
          font-size: 0.9375rem;
        }

        /* Section Header */
        .dashboard-section__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .dashboard-section__header h2 {
          margin: 0;
          font-size: 1.375rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.01em;
        }

        /* Properties Grid */
        .dashboard-properties, .dashboard-investments {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .property-card, .investment-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e8e8e6;
          transition: all 0.3s ease;
        }

        .property-card:hover, .investment-card:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
        }

        .property-card__header, .investment-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 18px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0ee;
        }

        .property-card__header h3, .investment-card__header h3 {
          margin: 0;
          font-size: 1.0625rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .property-card__details, .investment-card__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .property-card__detail, .investment-card__stat {
          padding: 12px 14px;
          background: #faf9f8;
          border-radius: 10px;
        }

        .property-card__detail .label, .investment-card__stat .label {
          display: block;
          font-size: 0.6875rem;
          color: #6b7280;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 500;
        }

        .property-card__detail .value, .investment-card__stat .value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        /* Activity */
        .dashboard-activity {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e8e8e6;
          transition: all 0.2s ease;
        }

        .activity-item:hover {
          border-color: rgba(201, 162, 39, 0.25);
        }

        .activity-item__icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 10px;
          color: #6b7280;
          flex-shrink: 0;
        }

        .activity-item__icon--gold {
          background: rgba(201, 162, 39, 0.1);
          color: #c9a227;
        }

        .activity-item__content p {
          margin: 0 0 3px;
          font-weight: 600;
          color: #1a1a1a;
          font-size: 0.9375rem;
          font-family: 'Manrope', sans-serif;
        }

        .activity-item__content span {
          font-size: 0.8125rem;
          color: #6b7280;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION F: ACCOUNT INFORMATION */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .dashboard-account {
          background: #ffffff;
          border-top: 1px solid #e8e8e6;
          padding: 40px 5%;
        }

        .dashboard-account__container {
          max-width: 1140px;
          margin: 0 auto;
        }

        .dashboard-account__container h3 {
          margin: 0 0 24px;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.01em;
        }

        .dashboard-account__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .dashboard-account__item {
          padding: 18px 20px;
          background: #faf9f8;
          border-radius: 12px;
          border: 1px solid #f0f0ee;
        }

        .dashboard-account__item .label {
          display: block;
          font-size: 0.6875rem;
          color: #6b7280;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }

        .dashboard-account__item .value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* RESPONSIVE */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        @media (max-width: 1024px) {
          .dashboard-stats__container {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-stat {
            border-right: none;
            border-bottom: 1px solid #f0f0ee;
          }

          .dashboard-stat:nth-child(odd) {
            border-right: 1px solid #f0f0ee;
          }

          .dashboard-stat:nth-last-child(-n+2) {
            border-bottom: none;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-actions {
            grid-template-columns: repeat(4, 1fr);
          }

          .dashboard-account__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding-top: 64px;
          }

          .dashboard-hero {
            padding: 40px 5%;
          }

          .dashboard-hero__name {
            font-size: clamp(1.5rem, 5vw, 2rem);
          }

          .dashboard-hero__subtitle {
            font-size: 0.875rem;
          }

          .dashboard-nav {
            top: 64px;
          }

          .dashboard-nav__container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .dashboard-nav__tab {
            padding: 16px 18px;
            white-space: nowrap;
          }

          .dashboard-actions {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .dashboard-action {
            padding: 16px 10px;
            font-size: 0.75rem;
          }

          .dashboard-action__icon {
            width: 38px;
            height: 38px;
          }

          .dashboard-section__header h2 {
            font-size: 1.1875rem;
          }

          .dashboard-account__grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-hero__container {
            flex-direction: column;
            align-items: flex-start;
          }

          .dashboard-hero__actions {
            width: 100%;
          }

          .dashboard-hero__actions .dashboard-btn--primary,
          .dashboard-hero__actions .dashboard-btn--secondary {
            flex: 1;
          }

          .dashboard-stats__container {
            grid-template-columns: 1fr;
          }

          .dashboard-stat {
            border-right: none;
            border-bottom: 1px solid #f0f0ee;
          }

          .dashboard-stat:last-child {
            border-bottom: none;
          }

          .dashboard-actions {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-properties, .dashboard-investments {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard-hero {
            padding: 32px 5%;
          }

          .dashboard-hero__greeting {
            font-size: 0.625rem;
          }

          .dashboard-hero__name {
            font-size: 1.5rem;
          }

          .dashboard-btn {
            padding: 11px 16px;
            font-size: 0.8125rem;
          }

          .dashboard-btn--ghost {
            padding: 8px 10px;
            font-size: 0.75rem;
          }

          .dashboard-stat {
            padding: 18px 16px;
          }

          .dashboard-stat__icon {
            width: 38px;
            height: 38px;
          }

          .dashboard-stat__value {
            font-size: 1.125rem;
          }

          .dashboard-content {
            padding: 28px 5% 48px;
          }

          .dashboard-card {
            padding: 20px;
            border-radius: 14px;
          }

          .dashboard-account {
            padding: 32px 5%;
          }
        }
      `}</style>
    </>
  )
}
