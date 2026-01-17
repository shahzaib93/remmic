import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Dashboard() {
  const { user: firebaseUser, logout } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProperties, setUserProperties] = useState([])
  const [userInvestments, setUserInvestments] = useState([])
  const [userRentals, setUserRentals] = useState([])
  const [userBids, setUserBids] = useState([])
  const [uploadedReports, setUploadedReports] = useState([])
  const [investmentGraphData, setInvestmentGraphData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  })
  const [activeTab, setActiveTab] = useState('daily')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
          // Check if user is admin and redirect
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
    }

    checkAuth()
  }, [router])

  // Load user properties data
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Load user's actual properties from localStorage or API
        const storedProperties = localStorage.getItem('userProperties')
        if (storedProperties) {
          setUserProperties(JSON.parse(storedProperties))
        } else {
          setUserProperties([]) // Empty if no properties registered
        }

        // Load user's actual investments
        const storedInvestments = localStorage.getItem('userInvestments')
        if (storedInvestments) {
          setUserInvestments(JSON.parse(storedInvestments))
        } else {
          setUserInvestments([]) // Empty if no investments made
        }

        // Load user's actual rental properties
        const storedRentals = localStorage.getItem('userRentals')
        if (storedRentals) {
          setUserRentals(JSON.parse(storedRentals))
        } else {
          setUserRentals([]) // Empty if no rental properties
        }

        // Load user's actual bids
        const storedBids = localStorage.getItem('userBids')
        if (storedBids) {
          setUserBids(JSON.parse(storedBids))
        } else {
          setUserBids([]) // Empty if no bids placed
        }

        // Load user's actual reports
        const storedReports = localStorage.getItem('userReports')
        if (storedReports) {
          setUploadedReports(JSON.parse(storedReports))
        } else {
          setUploadedReports([]) // Empty if no reports uploaded
        }

        // Load user's actual investment graph data
        const storedGraphData = localStorage.getItem('investmentGraphData')
        if (storedGraphData) {
          setInvestmentGraphData(JSON.parse(storedGraphData))
        } else {
          // Empty graph data if no investments
          setInvestmentGraphData({
            daily: [],
            weekly: [],
            monthly: []
          })
        }
      }
    }

    loadUserData()
  }, [user])

  // Handle property deletion
  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        setUserProperties(prev => prev.filter(prop => prop.id !== propertyId))
        alert('Property deleted successfully!')
      } catch (error) {
        console.error('Error deleting property:', error)
        alert('Failed to delete property')
      }
    }
  }

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        setUploadedReports(prev => prev.filter(report => report.id !== reportId))
        alert('Report deleted successfully!')
      } catch (error) {
        console.error('Error deleting report:', error)
        alert('Failed to delete report')
      }
    }
  }

  // Simple graph component
  const SimpleGraph = ({ data, type }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', marginBottom: '15px' }}>
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            No investment data available yet
          </div>
        </div>
      )
    }

    const maxValue = Math.max(...data.map(item => item.value))
    return (
      <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '150px', marginBottom: '10px' }}>
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 120
            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  height: `${height}px`,
                  backgroundColor: item.profit > 0 ? '#4a5568' : '#718096',
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease'
                }} />
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px', textAlign: 'center' }}>
                  {type === 'daily' ? new Date(item.date).getDate() : 
                   type === 'weekly' ? item.week : 
                   item.month}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
          Current Value: PKR {data[data.length - 1]?.value.toLocaleString()} | 
          Profit: PKR {data[data.length - 1]?.profit.toLocaleString()}
        </div>
      </div>
    )
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        router.push('/')
      } else {
        console.error('Logout error:', result.error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <>
      <Head>
        <title>Dashboard - REMMIC</title>
        <meta name="description" content="Your REMMIC user dashboard" />
      </Head>
      
      <Navbar />
      
      <main className="main-wrapper" style={{ 
        minHeight: '100vh'
      }}>
        <div className="padding-global">
          <div className="container-large">
            <div className="padding-section-medium">
              
              {/* Header */}
              <div className="about-header-component" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '40px',
                padding: '30px'
              }}>
                <div>
                  <h1 className="heading-style-h2" style={{ 
                    fontSize: '2rem', 
                    marginBottom: '8px'
                  }}>
                    Welcome, {user.name || 'User'}!
                  </h1>
                  <p className="text-size-regular">
                    Your Property Management Dashboard
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <a 
                    href="/land-registration"
                    className="button is-secondary w-inline-block"
                  >
                    <div className="button-text">Register Property</div>
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="button is-secondary"
                    style={{ 
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="button-text">Logout</div>
                  </button>
                </div>
              </div>


              {/* Comprehensive Property Management Dashboard */}
              <div style={{ marginTop: '40px' }}>
                
                {/* 1. REGISTERED PROPERTIES SECTION */}
                <div style={{ marginBottom: '50px' }}>
                  <h2 className="heading-style-h2" style={{ 
                    marginBottom: '30px',
                    textAlign: 'center'
                  }}>
                    My Registered Properties
                  </h2>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                    gap: '25px', 
                    marginBottom: '30px' 
                  }}>
                  
                  {/* Listed Properties */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '25px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#4a5568' }}></span> Listed Properties ({userProperties.length})
                      </span>
                      <button 
                        onClick={() => router.push('/add-property')}
                        style={{
                          background: '#4a5568',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        + Add
                      </button>
                    </h3>
                    
                    {userProperties.length === 0 ? (
                      <div style={{ 
                        minHeight: '120px', 
                        padding: '15px', 
                        background: '#f9fafb', 
                        borderRadius: '8px',
                        border: '2px dashed #d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <p style={{ color: '#6b7280', textAlign: 'center', margin: '0' }}>
                          No properties listed yet
                        </p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {userProperties.map(property => (
                          <div key={property.id} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '12px',
                            background: '#fafafa'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600' }}>
                                  {property.title}
                                </h4>
                                <p style={{ color: '#6b7280', margin: '0', fontSize: '12px' }}>
                                  📍 {property.location}
                                </p>
                              </div>
                              <span style={{
                                background: property.status === 'Registered' ? '#dcfce7' : 
                                           property.status === 'Verified' ? '#dbeafe' : '#fef3c7',
                                color: property.status === 'Registered' ? '#166534' : 
                                       property.status === 'Verified' ? '#1e40af' : '#92400e',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '500'
                              }}>
                                {property.status}
                              </span>
                            </div>
                            
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(2, 1fr)', 
                              gap: '8px', 
                              marginBottom: '12px',
                              fontSize: '11px',
                              color: '#6b7280'
                            }}>
                              <div>{property.price || 'N/A'}</div>
                              <div>📐 {property.plotSize || property.area || 'N/A'}</div>
                              <div>{property.landType || property.type || 'N/A'}</div>
                              <div>{property.plotNumber || 'N/A'}</div>
                            </div>
                            
                            <div style={{ 
                              fontSize: '10px',
                              color: '#9ca3af',
                              marginBottom: '8px',
                              padding: '6px',
                              background: '#f3f4f6',
                              borderRadius: '4px'
                            }}>
                              <div><strong>Reg #:</strong> {property.registrationNumber || 'N/A'}</div>
                              <div><strong>Date:</strong> {property.registrationDate || 'N/A'}</div>
                              <div><strong>Documents:</strong> {Array.isArray(property.documents) ? property.documents.join(", ") : 'No documents'}</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => router.push(`/property/${property.id}`)}
                                style={{
                                  background: '#2d3748',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  flex: 1
                                }}
                              >
                                View
                              </button>
                              <button
                                onClick={() => router.push(`/edit-property/${property.id}`)}
                                style={{
                                  background: '#718096',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  flex: 1
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                style={{
                                  background: '#a0aec0',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  flex: 1
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Investment Shares */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '25px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#2d3748' }}></span> Investment Shares ({userInvestments.length})
                      </span>
                      <button 
                        onClick={() => router.push('/investment-shares')}
                        style={{
                          background: '#2d3748',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        + Invest
                      </button>
                    </h3>
                    
                    {userInvestments.length === 0 ? (
                      <div style={{ 
                        minHeight: '120px', 
                        padding: '15px', 
                        background: '#f9fafb', 
                        borderRadius: '8px',
                        border: '2px dashed #d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <p style={{ color: '#6b7280', textAlign: 'center', margin: '0' }}>
                          No shares purchased yet
                        </p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {userInvestments.map(investment => (
                          <div key={investment.id} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '15px',
                            marginBottom: '12px',
                            background: '#fafafa'
                          }}>
                            <div style={{ marginBottom: '10px' }}>
                              <h4 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600' }}>
                                {investment.propertyTitle}
                              </h4>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                fontSize: '11px',
                                color: '#6b7280'
                              }}>
                                <span>{investment.shares || 0}/{investment.totalShares || 0} shares</span>
                                <span style={{
                                  background: (investment.roi && investment.roi.startsWith('+')) ? '#dcfce7' : '#fecaca',
                                  color: (investment.roi && investment.roi.startsWith('+')) ? '#166534' : '#dc2626',
                                  padding: '2px 6px',
                                  borderRadius: '8px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  {investment.roi || 'N/A'}
                                </span>
                              </div>
                            </div>
                            
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(2, 1fr)', 
                              gap: '8px', 
                              marginBottom: '12px',
                              fontSize: '11px',
                              color: '#6b7280'
                            }}>
                              <div>Invested: {investment.investmentAmount}</div>
                              <div>Current: {investment.currentValue}</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => router.push(`/investment/${investment.id}`)}
                                style={{
                                  background: '#2d3748',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  flex: 1
                                }}
                              >
                                Details
                              </button>
                              <button
                                onClick={() => router.push(`/sell-shares/${investment.id}`)}
                                style={{
                                  background: '#718096',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  flex: 1
                                }}
                              >
                                Sell Shares
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rental Properties */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '25px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#4a5568' }}></span> Rental Properties
                    </h3>
                    <div style={{ 
                      minHeight: '120px', 
                      padding: '15px', 
                      background: '#f9fafb', 
                      borderRadius: '8px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <p style={{ color: '#6b7280', textAlign: 'center', margin: '0' }}>
                        No rentals yet
                      </p>
                      <button 
                        onClick={() => router.push('/rental')}
                        style={{
                          background: '#4a5568',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginTop: '10px',
                          width: '100%'
                        }}
                      >
                        Browse Rentals
                      </button>
                    </div>
                  </div>

                  {/* Bidding Activities */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '25px', 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#718096' }}></span> Bidding Activities
                    </h3>
                    <div style={{ 
                      minHeight: '120px', 
                      padding: '15px', 
                      background: '#f9fafb', 
                      borderRadius: '8px',
                      border: '2px dashed #d1d5db'
                    }}>
                      <p style={{ color: '#6b7280', textAlign: 'center', margin: '0' }}>
                        No active bids yet
                      </p>
                      <button 
                        onClick={() => router.push('/bidding')}
                        style={{
                          background: '#718096',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginTop: '10px',
                          width: '100%'
                        }}
                      >
                        Start Bidding
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              {/* 2. INVESTMENT SECTION WITH GRAPHS */}
              <div style={{ marginBottom: '50px' }}>
                <h2 className="heading-style-h2" style={{ 
                  marginBottom: '30px',
                  textAlign: 'center'
                }}>
                  Investment Portfolio & Analytics
                </h2>

                {/* Investment Graph Section */}
                <div style={{ 
                  background: '#fff', 
                  padding: '25px', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  marginBottom: '25px'
                }}>
                  <h3 style={{ color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#2d3748' }}></span> Investment Performance
                  </h3>

                  {/* Tab Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {['daily', 'weekly', 'monthly'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          background: activeTab === tab ? '#2d3748' : '#f3f4f6',
                          color: activeTab === tab ? '#fff' : '#6b7280',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textTransform: 'capitalize'
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Graph Display */}
                  <SimpleGraph data={investmentGraphData[activeTab]} type={activeTab} />
                </div>

                {/* Investment Details Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                  gap: '25px'
                }}>
                  {userInvestments.map(investment => (
                    <div key={investment.id} style={{ 
                      background: '#fff', 
                      padding: '25px', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '16px', fontWeight: '600' }}>
                          {investment.propertyTitle}
                        </h4>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {investment.investmentDate}
                          </span>
                          <span style={{
                            background: (investment.roi && investment.roi.startsWith('+')) ? '#dcfce7' : '#fecaca',
                            color: (investment.roi && investment.roi.startsWith('+')) ? '#166534' : '#dc2626',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {investment.roi}
                          </span>
                        </div>
                      </div>

                      {/* Investment Stats */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px', 
                        marginBottom: '15px',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Shares Owned</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>
                            {investment.shares}/{investment.totalShares}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Monthly Dividend</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>
                            {investment.monthlyDividend}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Invested</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>
                            {investment.investmentAmount}
                          </div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Current Value</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>
                            {investment.currentValue}
                          </div>
                        </div>
                      </div>

                      {/* Dividend History */}
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ color: '#1f2937', fontSize: '14px', marginBottom: '8px' }}>Recent Dividends</h5>
                        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                          {Array.isArray(investment.dividendHistory) ? investment.dividendHistory.map((dividend, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              fontSize: '11px',
                              borderBottom: '1px solid #f3f4f6'
                            }}>
                              <span>{dividend.month}</span>
                              <span style={{ fontWeight: '600' }}>{dividend.amount}</span>
                            </div>
                          )) : (
                            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '11px', padding: '10px' }}>
                              No dividend history available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => router.push(`/investment-details/${investment.id}`)}
                          style={{
                            background: '#2d3748',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/sell-shares/${investment.id}`)}
                          style={{
                            background: '#718096',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. RENTAL PROPERTIES SECTION */}
              <div style={{ 
                marginBottom: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '40px 30px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  opacity: 0.1
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '80px',
                      height: '80px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      marginBottom: '20px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        color: '#fff',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}>R</div>
                    </div>
                    <h2 className="heading-style-h2" style={{ 
                      color: '#fff',
                      fontSize: '32px',
                      fontWeight: '700',
                      marginBottom: '10px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Rental Properties Management
                    </h2>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '16px',
                      maxWidth: '600px',
                      margin: '0 auto'
                    }}>
                      Manage your rental properties, track tenant payments, and monitor property performance
                    </p>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', 
                    gap: '30px'
                  }}>
                  {userRentals.map(rental => (
                    <div key={rental.id} style={{ 
                      background: '#fff', 
                      padding: '25px', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '16px', fontWeight: '600' }}>
                            {rental.propertyTitle}
                          </h4>
                          <p style={{ color: '#6b7280', margin: '0', fontSize: '12px' }}>
                            👤 Tenant: {rental.tenantName}
                          </p>
                        </div>
                        <span style={{
                          background: rental.status === 'Active' ? '#dcfce7' : '#fef3c7',
                          color: rental.status === 'Active' ? '#166534' : '#92400e',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {rental.status}
                        </span>
                      </div>

                      {/* Rental Details */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px', 
                        marginBottom: '15px',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Monthly Rent</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{rental.monthlyRent}</div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Security Deposit</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{rental.securityDeposit}</div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Lease Start</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{rental.leaseStart}</div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Lease End</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{rental.leaseEnd}</div>
                        </div>
                      </div>

                      {/* Rent History */}
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ color: '#1f2937', fontSize: '14px', marginBottom: '8px' }}>Payment History</h5>
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                          {Array.isArray(rental.rentHistory) ? rental.rentHistory.map((payment, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px',
                              fontSize: '11px',
                              borderBottom: '1px solid #f3f4f6'
                            }}>
                              <span>{payment.month}</span>
                              <span style={{ fontWeight: '600' }}>{payment.amount}</span>
                              <span style={{
                                background: payment.status === 'Paid' ? '#dcfce7' : '#fecaca',
                                color: payment.status === 'Paid' ? '#166534' : '#dc2626',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontSize: '10px'
                              }}>
                                {payment.status}
                              </span>
                            </div>
                          )) : (
                            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '11px', padding: '10px' }}>
                              No payment history available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => router.push(`/rental-details/${rental.id}`)}
                          style={{
                            background: '#4a5568',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/manage-tenant/${rental.id}`)}
                          style={{
                            background: '#718096',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Manage Tenant
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>

              {/* 4. BIDDING ACTIVITIES SECTION */}
              <div style={{ 
                  marginBottom: '60px',
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
                  borderRadius: '20px',
                  padding: '40px 30px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Background Pattern */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ff6b6b" fill-opacity="0.1" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                  }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '50%',
                        marginBottom: '20px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          color: '#fff',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}>B</div>
                      </div>
                      <h2 className="heading-style-h2" style={{ 
                        color: '#fff',
                        fontSize: '32px',
                        fontWeight: '700',
                        marginBottom: '10px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        Bidding Activities & Auctions
                      </h2>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                        maxWidth: '600px',
                        margin: '0 auto'
                      }}>
                        Participate in property auctions, track your bids, and monitor auction results
                      </p>
                    </div>

                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', 
                      gap: '30px'
                    }}>
                  {userBids.map(bid => (
                    <div key={bid.id} style={{ 
                      background: '#fff', 
                      padding: '25px', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <div>
                          <h4 style={{ color: '#1f2937', margin: '0 0 5px 0', fontSize: '16px', fontWeight: '600' }}>
                            {bid.propertyTitle}
                          </h4>
                          <p style={{ color: '#6b7280', margin: '0', fontSize: '12px' }}>
                            {bid.auctionDate} at {bid.auctionTime}
                          </p>
                        </div>
                        <span style={{
                          background: bid.status === 'Leading' ? '#dcfce7' : 
                                     bid.status === 'Outbid' ? '#fecaca' : '#fef3c7',
                          color: bid.status === 'Leading' ? '#166534' : 
                                 bid.status === 'Outbid' ? '#dc2626' : '#92400e',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {bid.status}
                        </span>
                      </div>

                      {/* Bid Details */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px', 
                        marginBottom: '15px',
                        fontSize: '12px'
                      }}>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>My Bid</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{bid.bidAmount}</div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Current Highest</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{bid.currentHighest}</div>
                        </div>
                        <div style={{ padding: '10px', background: '#f9fafb', borderRadius: '6px', gridColumn: 'span 2' }}>
                          <div style={{ color: '#6b7280', marginBottom: '3px' }}>Minimum Bid</div>
                          <div style={{ color: '#1f2937', fontWeight: '600' }}>{bid.minimumBid}</div>
                        </div>
                      </div>

                      {/* Bid History */}
                      <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ color: '#1f2937', fontSize: '14px', marginBottom: '8px' }}>My Bid History</h5>
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                          {Array.isArray(bid.bidHistory) ? bid.bidHistory.map((bidItem, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px',
                              fontSize: '11px',
                              borderBottom: '1px solid #f3f4f6'
                            }}>
                              <span>{bidItem.amount}</span>
                              <span style={{ color: '#6b7280' }}>{bidItem.time}</span>
                              <span style={{
                                background: bidItem.status === 'Leading' ? '#dcfce7' : '#fecaca',
                                color: bidItem.status === 'Leading' ? '#166534' : '#dc2626',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontSize: '10px'
                              }}>
                                {bidItem.status}
                              </span>
                            </div>
                          )) : (
                            <div style={{ padding: '8px', color: '#6b7280', fontSize: '11px' }}>
                              No bid history available
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => router.push(`/auction-details/${bid.id}`)}
                          style={{
                            background: '#718096',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          View Auction
                        </button>
                        <button
                          onClick={() => router.push(`/place-bid/${bid.id}`)}
                          style={{
                            background: '#a0aec0',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Update Bid
                        </button>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
                </div>

              {/* 5. UPLOADED REPORTS SECTION */}
              <div style={{ marginBottom: '50px' }}>
                <h2 className="heading-style-h2" style={{ 
                  marginBottom: '30px',
                  textAlign: 'center'
                }}>
                  Uploaded Reports & Documents
                </h2>

                <div style={{ 
                  background: '#fff', 
                  padding: '25px', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#2d3748' }}></span> All Reports ({uploadedReports.length})
                    </span>
                    <button 
                      onClick={() => router.push('/upload-report')}
                      style={{
                        background: '#2d3748',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      + Upload Report
                    </button>
                  </h3>

                  <div style={{ display: 'grid', gap: '15px' }}>
                    {uploadedReports.map(report => (
                      <div key={report.id} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '20px',
                        background: '#fafafa',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h4 style={{ color: '#1f2937', margin: '0', fontSize: '14px', fontWeight: '600' }}>
                              {report.title}
                            </h4>
                            <span style={{
                              background: report.status === 'Verified' ? '#dcfce7' : 
                                         report.status === 'Approved' ? '#dbeafe' : '#fef3c7',
                              color: report.status === 'Verified' ? '#166534' : 
                                     report.status === 'Approved' ? '#1e40af' : '#92400e',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}>
                              {report.status}
                            </span>
                          </div>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                            gap: '12px', 
                            fontSize: '11px',
                            color: '#6b7280',
                            marginBottom: '8px'
                          }}>
                            <div>📁 Type: {report.type}</div>
                            <div>Uploaded: {report.uploadDate}</div>
                            <div>💾 Size: {report.fileSize}</div>
                            <div>Format: {report.format}</div>
                          </div>
                          <p style={{ 
                            color: '#6b7280', 
                            margin: '0', 
                            fontSize: '12px',
                            fontStyle: 'italic'
                          }}>
                            {report.summary}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
                          <button
                            onClick={() => window.open(`/reports/${report.id}`, '_blank')}
                            style={{
                              background: '#2d3748',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            style={{
                              background: '#a0aec0',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              </div>

              {/* User Info Section */}
              <div className="about-header-component" style={{ 
                padding: '25px', 
                textAlign: 'center'
              }}>
                <h3 className="heading-style-h3" style={{ marginBottom: '15px' }}>Account Information</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px',
                  textAlign: 'left'
                }}>
                  <div>
                    <strong className="text-size-regular">Name:</strong>
                    <p className="text-size-regular" style={{ margin: '5px 0 0 0' }}>{user.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <strong className="text-size-regular">Email:</strong>
                    <p className="text-size-regular" style={{ margin: '5px 0 0 0' }}>{user.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <strong className="text-size-regular">Role:</strong>
                    <p className="text-size-regular" style={{ margin: '5px 0 0 0', textTransform: 'capitalize' }}>
                      {user.role || 'User'}
                    </p>
                  </div>
                  <div>
                    <strong className="text-size-regular">Member Since:</strong>
                    <p className="text-size-regular" style={{ margin: '5px 0 0 0' }}>{user.memberSince || 'Recently'}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}