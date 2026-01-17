import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from '../contexts/FirebaseContext'

export default function AdminDashboard() {
  const { 
    user: firebaseUser, 
    logout, 
    getAllContactMessages, 
    markMessageAsRead, 
    getInvestments, 
    getAllInvestments,
    getProperties, 
    getAllProperties,
    getBids,
    getEvaluations,
    getPortfolioSummary
  } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalInvestments: 0,
    totalInvestmentValue: 0,
    pendingInvestments: 0,
    totalBids: 0,
    pendingBids: 0,
    totalRentals: 0,
    pendingRentals: 0,
    totalEvaluations: 0,
    pendingEvaluations: 0,
    totalMessages: 0,
    unreadMessages: 0
  })
  const [contactMessages, setContactMessages] = useState([])
  const [pendingProperties, setPendingProperties] = useState([])
  const [pendingInvestments, setPendingInvestments] = useState([])
  const [pendingBids, setPendingBids] = useState([])
  const [pendingRentals, setPendingRentals] = useState([])
  const [pendingEvaluations, setPendingEvaluations] = useState([])
  const [allProperties, setAllProperties] = useState([])
  const [allInvestments, setAllInvestments] = useState([])
  const [allBids, setAllBids] = useState([])
  const [allEvaluations, setAllEvaluations] = useState([])

  // Authentication check
  useEffect(() => {
    // Check if user is admin from localStorage first
    const isAdmin = localStorage.getItem('isAdmin')
    const storedAdminUser = localStorage.getItem('adminUser')
    
    if (!isAdmin || !storedAdminUser) {
      router.push('/admin-login')
      return
    }

    try {
      const adminData = JSON.parse(storedAdminUser)
      setUser(adminData)
    } catch (error) {
      console.error('Error parsing admin data:', error)
      router.push('/admin-login')
      return
    }

    // Also check Firebase user if available
    if (firebaseUser && firebaseUser.role !== 'admin') {
      router.push('/admin-login')
      return
    }

    setIsLoading(false)
    loadData()
  }, [firebaseUser, router])

  const loadData = async () => {
    setDataLoading(true)
    try {
      // Load all real data using Firebase context functions
      const [
        propertiesResult,
        allPropertiesResult, 
        investmentsResult,
        allInvestmentsResult,
        bidsResult,
        evaluationsResult,
        messagesResult
      ] = await Promise.all([
        getProperties(),
        getAllProperties(),
        getInvestments(),
        getAllInvestments(),
        getBids(),
        getEvaluations(),
        getAllContactMessages()
      ])

      // Extract data from results
      const properties = propertiesResult?.success ? propertiesResult.properties : []
      const allPropertiesData = allPropertiesResult?.success ? allPropertiesResult.properties : []
      const investments = investmentsResult?.success ? investmentsResult.investments : []
      const allInvestmentsData = allInvestmentsResult?.success ? allInvestmentsResult.investments : []
      const bids = bidsResult?.success ? bidsResult.bids : []
      const evaluations = evaluationsResult?.success ? evaluationsResult.evaluations : []
      const messages = messagesResult?.success ? messagesResult.messages : []

      // Combine properties from both sources
      const combinedProperties = [...allPropertiesData, ...properties].filter((prop, index, self) => 
        index === self.findIndex(p => p.id === prop.id)
      )

      // Combine investments from both sources  
      const combinedInvestments = [...allInvestmentsData, ...investments].filter((inv, index, self) => 
        index === self.findIndex(i => i.id === inv.id)
      )

      setAllProperties(combinedProperties)
      setAllInvestments(combinedInvestments)
      setAllBids(bids)
      setAllEvaluations(evaluations)
      setContactMessages(messages)

      // Calculate real statistics
      const totalInvestmentValue = combinedInvestments.reduce((sum, inv) => sum + (inv.amount || inv.currentValue || 0), 0)
      const activeProperties = combinedProperties.filter(p => p.status === 'approved' || p.status === 'active')
      const pendingPropertiesData = combinedProperties.filter(p => p.status === 'pending' || !p.status)
      const pendingInvestmentsData = combinedInvestments.filter(inv => inv.status === 'pending' || !inv.status)
      const pendingBidsData = bids.filter(bid => bid.status === 'pending' || !bid.status)
      const pendingEvaluationsData = evaluations.filter(e => e.status === 'pending' || !e.status)
      const unreadMessagesData = messages.filter(m => m.status === 'unread' || !m.status)

      // Calculate unique users from all data sources
      const userIds = new Set()
      combinedProperties.forEach(p => p.userId && userIds.add(p.userId))
      combinedInvestments.forEach(i => i.userId && userIds.add(i.userId))
      bids.forEach(b => b.userId && userIds.add(b.userId))
      evaluations.forEach(e => e.userId && userIds.add(e.userId))
      messages.forEach(m => m.userId && userIds.add(m.userId))
      
      setStats({
        totalUsers: userIds.size,
        activeProperties: activeProperties.length,
        pendingProperties: pendingPropertiesData.length,
        totalInvestments: combinedInvestments.length,
        totalInvestmentValue: totalInvestmentValue,
        pendingInvestments: pendingInvestmentsData.length,
        totalBids: bids.length,
        pendingBids: pendingBidsData.length,
        totalRentals: combinedProperties.filter(p => p.listingType === 'rental' || p.type === 'rental').length,
        pendingRentals: combinedProperties.filter(p => (p.listingType === 'rental' || p.type === 'rental') && (p.status === 'pending' || !p.status)).length,
        totalEvaluations: evaluations.length,
        pendingEvaluations: pendingEvaluationsData.length,
        totalMessages: messages.length,
        unreadMessages: unreadMessagesData.length
      })

      // Set pending items for admin review
      setPendingProperties(pendingPropertiesData)
      setPendingInvestments(pendingInvestmentsData)
      setPendingBids(pendingBidsData)
      setPendingEvaluations(pendingEvaluationsData)
      setPendingRentals(combinedProperties.filter(p => (p.listingType === 'rental' || p.type === 'rental') && (p.status === 'pending' || !p.status)))

    } catch (error) {
      console.error('Error loading admin data:', error)
      // Fallback to empty states if all async calls fail
      setStats({
        totalUsers: 0,
        activeProperties: 0,
        pendingProperties: 0,
        totalInvestments: 0,
        totalInvestmentValue: 0,
        pendingInvestments: 0,
        totalBids: 0,
        pendingBids: 0,
        totalRentals: 0,
        pendingRentals: 0,
        totalEvaluations: 0,
        pendingEvaluations: 0,
        totalMessages: 0,
        unreadMessages: 0
      })
    } finally {
      setDataLoading(false)
    }
  }

  const formatRupeeValue = (value) => {
    if (!value) return 'PKR0'
    return `PKR${value.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f8fafc',
        fontFamily: "'Manrope', sans-serif"
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '16px',
          color: '#ff5e01'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ff5e01',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading Admin Dashboard...
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - REMMIC</title>
        <meta name="description" content="REMMIC Admin Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: "'Manrope', sans-serif"
      }}>
        {/* Unified Card Sidebar */}
        <aside style={{
          width: '50px',
          margin: '12px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Single Card Container */}
          <div style={{
            background: '#ffffff',
            color: '#6b7280',
            padding: '8px 6px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            gap: '2px'
          }}>
            {/* Brand Logo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                background: '#ff5e01',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '12px',
                color: 'white',
                boxShadow: '0 2px 4px rgba(255, 94, 1, 0.2)'
              }}>
                R
              </div>
            </div>

            {/* All Buttons Combined */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
              {[
                { 
                  id: 'overview', 
                  label: 'Dashboard Overview', 
                  badge: null,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'all-properties', 
                  label: 'All Properties', 
                  badge: allProperties.length,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 9.3V4h-3v2.6L12 3L2 12h3v8h6v-6h2v6h6v-8h3l-3-2.7z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'properties', 
                  label: 'Property Approvals', 
                  badge: stats.pendingProperties,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'evaluations', 
                  label: 'Evaluations', 
                  badge: stats.pendingEvaluations,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )
                },
                { 
                  id: 'investments', 
                  label: 'Investments', 
                  badge: stats.pendingInvestments,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'bids', 
                  label: 'Bidding', 
                  badge: stats.pendingBids,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'rentals', 
                  label: 'Rentals', 
                  badge: stats.pendingRentals,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'messages', 
                  label: 'Messages', 
                  badge: stats.unreadMessages,
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor"/>
                    </svg>
                  )
                }
              ].map((item) => (
                <div key={item.id} style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '0',
                      margin: '0',
                      background: activeTab === item.id ? '#f8fafc' : 'transparent',
                      color: activeTab === item.id ? '#ff5e01' : '#9ca3af',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      boxShadow: activeTab === item.id ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== item.id) {
                        e.target.style.background = '#f9fafb'
                        e.target.style.color = '#374151'
                      }
                      // Show tooltip
                      const tooltip = e.target.nextElementSibling
                      if (tooltip) {
                        tooltip.style.opacity = '1'
                        tooltip.style.visibility = 'visible'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== item.id) {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#9ca3af'
                      }
                      // Hide tooltip
                      const tooltip = e.target.nextElementSibling
                      if (tooltip) {
                        tooltip.style.opacity = '0'
                        tooltip.style.visibility = 'hidden'
                      }
                    }}
                  >
                    {item.icon}
                    {item.badge > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '12px',
                        height: '12px',
                        fontSize: '7px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '12px',
                        border: '1px solid white'
                      }}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </button>
                  
                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute',
                    left: '42px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#374151',
                    color: 'white',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    opacity: '0',
                    visibility: 'hidden',
                    transition: 'all 0.15s ease',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                  }}>
                    {item.label}
                    {/* Arrow */}
                    <div style={{
                      position: 'absolute',
                      left: '-3px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '0',
                      height: '0',
                      borderTop: '3px solid transparent',
                      borderBottom: '3px solid transparent',
                      borderRight: '3px solid #374151'
                    }} />
                  </div>
                </div>
              ))}
              
              {/* Refresh Button */}
              <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
              <button
                onClick={loadData}
                disabled={dataLoading}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: '0',
                  background: dataLoading ? '#f9fafb' : 'transparent',
                  color: dataLoading ? '#6b7280' : '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: dataLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!dataLoading) {
                    e.target.style.background = '#f9fafb'
                    e.target.style.color = '#374151'
                  }
                  // Show tooltip
                  const tooltip = e.target.nextElementSibling
                  if (tooltip) {
                    tooltip.style.opacity = '1'
                    tooltip.style.visibility = 'visible'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!dataLoading) {
                    e.target.style.background = 'transparent'
                    e.target.style.color = '#9ca3af'
                  }
                  // Hide tooltip
                  const tooltip = e.target.nextElementSibling
                  if (tooltip) {
                    tooltip.style.opacity = '0'
                    tooltip.style.visibility = 'hidden'
                  }
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    animation: dataLoading ? 'spin 1s linear infinite' : 'none'
                  }}
                >
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              
              {/* Refresh Tooltip */}
              <div style={{
                position: 'absolute',
                left: '42px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#374151',
                color: 'white',
                padding: '4px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                opacity: '0',
                visibility: 'hidden',
                transition: 'all 0.15s ease',
                zIndex: 1000,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
              }}>
                Refresh Data
                <div style={{
                  position: 'absolute',
                  left: '-3px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0',
                  height: '0',
                  borderTop: '3px solid transparent',
                  borderBottom: '3px solid transparent',
                  borderRight: '3px solid #374151'
                }} />
              </div>
            </div>

              {/* User Avatar */}
              <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                <button
                  onClick={() => {
                    logout()
                    localStorage.removeItem('isAdmin')
                    localStorage.removeItem('adminUser')
                    router.push('/admin-login')
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    fontSize: '11px',
                    fontWeight: '700',
                    boxShadow: '0 1px 3px rgba(255, 94, 1, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e54e00'
                    // Show tooltip
                    const tooltip = e.target.nextElementSibling
                    if (tooltip) {
                      tooltip.style.opacity = '1'
                      tooltip.style.visibility = 'visible'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)'
                    // Hide tooltip
                    const tooltip = e.target.nextElementSibling
                    if (tooltip) {
                      tooltip.style.opacity = '0'
                      tooltip.style.visibility = 'hidden'
                    }
                  }}
                >
                  {(user?.name || 'Admin').charAt(0).toUpperCase()}
                </button>
                
                {/* User Tooltip */}
                <div style={{
                  position: 'absolute',
                  left: '42px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#374151',
                  color: 'white',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  opacity: '0',
                  visibility: 'hidden',
                  transition: 'all 0.15s ease',
                  zIndex: 1000,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)'
                }}>
                  Logout ({user?.name || 'Admin'})
                  <div style={{
                    position: 'absolute',
                    left: '-3px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '0',
                    height: '0',
                    borderTop: '3px solid transparent',
                    borderBottom: '3px solid transparent',
                    borderRight: '3px solid #374151'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {/* Header */}
          <header style={{
            background: 'white',
            padding: '1rem 2rem',
            margin: '1rem',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 0.25rem 0'
              }}>
                Admin Dashboard
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.9rem'
              }}>
                Manage properties, users, and platform operations
              </p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{
                background: '#f3f4f6',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <main style={{
            flex: 1,
            padding: '1rem',
            overflow: 'auto'
          }}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                margin: '1rem',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #f1f5f9'
              }}>
                <h2 style={{fontSize: '1.6rem', fontWeight: '600', marginBottom: '2rem', color: '#1f2937'}}>
                  Platform Overview
                </h2>
                
                {/* Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {[
                    { title: 'Total Properties', value: stats.activeProperties, color: '#ff5e01' },
                    { title: 'Pending Approvals', value: stats.pendingProperties + stats.pendingEvaluations + stats.pendingInvestments, color: '#f59e0b' },
                    { title: 'Total Investment Value', value: formatRupeeValue(stats.totalInvestmentValue), color: '#10b981' },
                    { title: 'Total Investments', value: stats.totalInvestments, color: '#8b5cf6' },
                    { title: 'Active Bids', value: stats.totalBids, color: '#06b6d4' },
                    { title: 'Users', value: stats.totalUsers, color: '#ef4444' }
                  ].map((stat, index) => (
                    <div key={index} style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      border: `1px solid ${stat.color}20`
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <h3 style={{color: '#6b7280', fontSize: '0.9rem', fontWeight: '600', margin: 0, textTransform: 'uppercase'}}>
                          {stat.title}
                        </h3>
                      </div>
                      <div style={{fontSize: '2rem', fontWeight: '700', color: stat.color}}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #f1f5f9'
                }}>
                  <h3 style={{fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937'}}>
                    Quick Actions
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    {[
                      { label: 'Review Properties', count: stats.pendingProperties, tab: 'properties', color: '#059669' },
                      { label: 'Review Evaluations', count: stats.pendingEvaluations, tab: 'evaluations', color: '#7c3aed' },
                      { label: 'Check Messages', count: stats.unreadMessages, tab: 'messages', color: '#dc2626' }
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(action.tab)}
                        style={{
                          background: 'white',
                          border: `2px solid ${action.color}30`,
                          borderRadius: '12px',
                          padding: '1rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'transform 0.2s',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        <div style={{fontSize: '1.5rem', fontWeight: '700', color: action.color}}>
                          {action.count}
                        </div>
                        <div style={{fontSize: '0.9rem', color: '#6b7280', marginTop: '0.25rem'}}>
                          {action.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* All Properties Tab */}
            {activeTab === 'all-properties' && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                margin: '1rem',
                padding: '2rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                  <h2 style={{fontSize: '1.6rem', fontWeight: '600', color: '#1f2937', margin: 0}}>
                    All Properties ({allProperties.length})
                  </h2>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    {dataLoading && (
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#ff5e01'}}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #ff5e01',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                        Loading...
                      </div>
                    )}
                    <button
                      onClick={loadData}
                      style={{
                        background: '#ff5e01',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                {allProperties.length === 0 ? (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '3rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{fontSize: '48px', marginBottom: '1rem', color: '#d1d5db'}}>â–¡</div>
                    <h3 style={{fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                      No Properties Found
                    </h3>
                    <p style={{color: '#6b7280', margin: 0}}>
                      No properties have been registered through the land registration form yet.
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {allProperties.map((property) => (
                      <div key={property.id} style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9',
                        position: 'relative'
                      }}>
                        {/* Status Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: property.status === 'approved' || property.status === 'active' ? '#dcfce7' : 
                                     property.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: property.status === 'approved' || property.status === 'active' ? '#166534' : 
                                property.status === 'pending' ? '#92400e' : '#dc2626'
                        }}>
                          {property.status || 'Pending'}
                        </div>

                        {/* Property Image */}
                        {property.images && property.images.length > 0 && property.images[0].url && (
                          <div style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '8px',
                            backgroundImage: `url(${property.images[0].url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            marginBottom: '1rem',
                            border: '1px solid #e5e7eb'
                          }} />
                        )}

                        {/* Property Details */}
                        <div style={{marginBottom: '1rem'}}>
                          <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 0.5rem 0',
                            paddingRight: '80px'
                          }}>
                            {property.title || property.name || 'Untitled Property'}
                          </h3>
                          
                          <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                            <strong>Location:</strong> {property.location || property.address || 'Not specified'}
                          </div>
                          
                          <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                            <strong>Type:</strong> {property.type || property.propertyType || 'Not specified'}
                          </div>
                          
                          {property.price && (
                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                              <strong>Price:</strong> {formatRupeeValue(property.price)}
                            </div>
                          )}
                          
                          {property.area && (
                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                              <strong>Area:</strong> {property.area}
                            </div>
                          )}
                          
                          <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                            <strong>Submitted:</strong> {new Date(property.createdAt || property.submittedAt || Date.now()).toLocaleDateString()}
                          </div>
                          
                          {property.userId && (
                            <div style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem'}}>
                              <strong>Owner ID:</strong> {property.userId}
                            </div>
                          )}
                        </div>

                        {/* Property Description */}
                        {property.description && (
                          <div style={{
                            marginBottom: '1rem',
                            padding: '12px',
                            background: '#f9fafb',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '4px'}}>
                              Description:
                            </div>
                            <div style={{fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.4'}}>
                              {property.description.length > 150 ? 
                                `${property.description.substring(0, 150)}...` : 
                                property.description
                              }
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                          {property.status === 'pending' && (
                            <>
                              <button style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}>
                                Approve
                              </button>
                              <button style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}>
                                Reject
                              </button>
                            </>
                          )}
                          <button style={{
                            background: '#6b7280',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}>
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other tabs placeholder */}
            {activeTab !== 'overview' && activeTab !== 'all-properties' && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                margin: '1rem',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #f1f5f9'
              }}>
                <h2 style={{color: '#6b7280', fontSize: '1.5rem', marginBottom: '1rem'}}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Section
                </h2>
                <p style={{color: '#9ca3af'}}>
                  This section is being implemented. Full functionality will be available soon.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
