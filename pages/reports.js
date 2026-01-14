import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Reports() {
  const { 
    user: firebaseUser, 
    logout, 
    getAllContactMessages, 
    getInvestments, 
    getAllInvestments,
    getProperties, 
    getAllProperties,
    getBids,
    getEvaluations
  } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState('properties')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [reportData, setReportData] = useState({
    properties: [],
    investments: [],
    bids: [],
    evaluations: [],
    messages: []
  })

  // Authentication check
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    const storedAdminUser = localStorage.getItem('adminUser')
    
    if (!isAdmin || !storedAdminUser) {
      router.push('/admin')
      return
    }

    try {
      const adminData = JSON.parse(storedAdminUser)
      setUser(adminData)
    } catch (error) {
      console.error('Error parsing admin data:', error)
      router.push('/admin')
      return
    }

    if (firebaseUser && firebaseUser.role !== 'admin') {
      router.push('/admin')
      return
    }

    setIsLoading(false)
    loadReportData()
  }, [firebaseUser, router])

  const loadReportData = async () => {
    setDataLoading(true)
    try {
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

      const properties = propertiesResult?.success ? propertiesResult.properties : []
      const allPropertiesData = allPropertiesResult?.success ? allPropertiesResult.properties : []
      const investments = investmentsResult?.success ? investmentsResult.investments : []
      const allInvestmentsData = allInvestmentsResult?.success ? allInvestmentsResult.investments : []
      const bids = bidsResult?.success ? bidsResult.bids : []
      const evaluations = evaluationsResult?.success ? evaluationsResult.evaluations : []
      const messages = messagesResult?.success ? messagesResult.messages : []

      const combinedProperties = [...allPropertiesData, ...properties].filter((prop, index, self) => 
        index === self.findIndex(p => p.id === prop.id)
      )

      const combinedInvestments = [...allInvestmentsData, ...investments].filter((inv, index, self) => 
        index === self.findIndex(i => i.id === inv.id)
      )

      setReportData({
        properties: combinedProperties,
        investments: combinedInvestments,
        bids: bids,
        evaluations: evaluations,
        messages: messages
      })

    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const formatRupeeValue = (value) => {
    if (!value) return 'PKR0'
    return `PKR${value.toLocaleString()}`
  }

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFilteredData = () => {
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case 'last-7-days':
        startDate.setDate(now.getDate() - 7)
        break
      case 'last-30-days':
        startDate.setDate(now.getDate() - 30)
        break
      case 'last-90-days':
        startDate.setDate(now.getDate() - 90)
        break
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const filterByDate = (item) => {
      const itemDate = new Date(item.createdAt || item.submittedAt || item.timestamp || Date.now())
      return itemDate >= startDate && itemDate <= now
    }

    return reportData[selectedReport].filter(filterByDate)
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
          color: '#c9a227'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #c9a227',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading Reports...
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const filteredData = getFilteredData()

  return (
    <>
      <Head>
        <title>Reports - REMMIC Admin</title>
        <meta name="description" content="REMMIC Admin Reports" />
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
                background: '#c9a227',
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

            {/* Navigation Buttons */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
              {[
                { 
                  id: 'dashboard', 
                  label: 'Dashboard', 
                  href: '/admin-dashboard',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
                    </svg>
                  )
                },
                { 
                  id: 'reports', 
                  label: 'Reports', 
                  href: '/reports',
                  active: true,
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
                  id: 'analytics', 
                  label: 'Analytics', 
                  href: '/analytics',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
                      <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
                      <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )
                }
              ].map((item) => (
                <div key={item.id} style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                  <button
                    onClick={() => item.href && router.push(item.href)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: '0',
                      margin: '0',
                      background: item.active ? '#f8fafc' : 'transparent',
                      color: item.active ? '#c9a227' : '#9ca3af',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      boxShadow: item.active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                  >
                    {item.icon}
                  </button>
                </div>
              ))}

              {/* User Avatar */}
              <div style={{position: 'relative', display: 'flex', justifyContent: 'center', marginTop: '8px'}}>
                <button
                  onClick={() => {
                    logout()
                    localStorage.removeItem('isAdmin')
                    localStorage.removeItem('adminUser')
                    router.push('/admin')
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: '0',
                    background: 'linear-gradient(135deg, #c9a227 0%, #e54e00 100%)',
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
                >
                  {(user?.name || 'Admin').charAt(0).toUpperCase()}
                </button>
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
                Reports & Exports
              </h1>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.9rem'
              }}>
                Generate and download platform data reports
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

          {/* Main Content */}
          <main style={{
            flex: 1,
            padding: '1rem',
            overflow: 'auto'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              margin: '1rem',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              border: '1px solid #f1f5f9'
            }}>
              {/* Filter Controls */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <label style={{fontSize: '0.9rem', fontWeight: '600', color: '#374151'}}>
                    Report Type
                  </label>
                  <select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      minWidth: '150px'
                    }}
                  >
                    <option value="properties">Properties</option>
                    <option value="investments">Investments</option>
                    <option value="bids">Bids</option>
                    <option value="evaluations">Evaluations</option>
                    <option value="messages">Messages</option>
                  </select>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <label style={{fontSize: '0.9rem', fontWeight: '600', color: '#374151'}}>
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.9rem',
                      minWidth: '150px'
                    }}
                  >
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="last-30-days">Last 30 Days</option>
                    <option value="last-90-days">Last 90 Days</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>

                <div style={{display: 'flex', alignItems: 'end', gap: '0.5rem'}}>
                  <button
                    onClick={loadReportData}
                    disabled={dataLoading}
                    style={{
                      background: '#c9a227',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: dataLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {dataLoading && (
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    )}
                    Refresh
                  </button>

                  <button
                    onClick={() => exportToCSV(filteredData, selectedReport)}
                    disabled={filteredData.length === 0}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                      opacity: filteredData.length === 0 ? 0.5 : 1
                    }}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Report Summary */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h2 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
                </h2>
                <div style={{
                  background: '#f3f4f6',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  {filteredData.length} records found
                </div>
              </div>

              {/* Data Table */}
              {filteredData.length === 0 ? (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '3rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{fontSize: '48px', marginBottom: '1rem', color: '#d1d5db'}}>ðŸ“Š</div>
                  <h3 style={{fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem'}}>
                    No Data Available
                  </h3>
                  <p style={{color: '#6b7280', margin: 0}}>
                    No {selectedReport} found for the selected date range.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{background: '#374151', color: 'white'}}>
                          {selectedReport === 'properties' && (
                            <>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Title</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Location</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Type</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Price</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Status</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Date</th>
                            </>
                          )}
                          {selectedReport === 'investments' && (
                            <>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Property</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Amount</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Shares</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Status</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Date</th>
                            </>
                          )}
                          {selectedReport === 'bids' && (
                            <>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Property</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Bid Amount</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Bidder</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Status</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Date</th>
                            </>
                          )}
                          {selectedReport === 'evaluations' && (
                            <>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Property</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Location</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Estimated Value</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Status</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Date</th>
                            </>
                          )}
                          {selectedReport === 'messages' && (
                            <>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Name</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Email</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Subject</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Status</th>
                              <th style={{padding: '12px', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600'}}>Date</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={item.id || index} style={{
                            borderBottom: '1px solid #e5e7eb',
                            background: index % 2 === 0 ? 'white' : '#f9fafb'
                          }}>
                            {selectedReport === 'properties' && (
                              <>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151'}}>
                                  {item.title || item.name || 'Untitled'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {item.location || item.address || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {item.type || item.propertyType || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151', fontWeight: '600'}}>
                                  {formatRupeeValue(item.price)}
                                </td>
                                <td style={{padding: '12px'}}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: item.status === 'approved' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                    color: item.status === 'approved' ? '#166534' : item.status === 'pending' ? '#92400e' : '#dc2626'
                                  }}>
                                    {item.status || 'Pending'}
                                  </span>
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {new Date(item.createdAt || item.submittedAt || Date.now()).toLocaleDateString()}
                                </td>
                              </>
                            )}
                            {selectedReport === 'investments' && (
                              <>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151'}}>
                                  {item.propertyTitle || item.title || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151', fontWeight: '600'}}>
                                  {formatRupeeValue(item.amount || item.currentValue)}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {item.shares || 'N/A'}
                                </td>
                                <td style={{padding: '12px'}}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: item.status === 'active' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                    color: item.status === 'active' ? '#166534' : item.status === 'pending' ? '#92400e' : '#dc2626'
                                  }}>
                                    {item.status || 'Pending'}
                                  </span>
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {new Date(item.createdAt || item.timestamp || Date.now()).toLocaleDateString()}
                                </td>
                              </>
                            )}
                            {selectedReport === 'bids' && (
                              <>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151'}}>
                                  {item.propertyTitle || item.title || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151', fontWeight: '600'}}>
                                  {formatRupeeValue(item.bidAmount || item.amount)}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {item.bidderName || item.name || item.userId || 'N/A'}
                                </td>
                                <td style={{padding: '12px'}}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: item.status === 'accepted' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                    color: item.status === 'accepted' ? '#166534' : item.status === 'pending' ? '#92400e' : '#dc2626'
                                  }}>
                                    {item.status || 'Pending'}
                                  </span>
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {new Date(item.createdAt || item.timestamp || Date.now()).toLocaleDateString()}
                                </td>
                              </>
                            )}
                            {selectedReport === 'evaluations' && (
                              <>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151'}}>
                                  {item.propertyTitle || item.title || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {item.location || item.address || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151', fontWeight: '600'}}>
                                  {formatRupeeValue(item.estimatedValue || item.value)}
                                </td>
                                <td style={{padding: '12px'}}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: item.status === 'completed' ? '#dcfce7' : item.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                    color: item.status === 'completed' ? '#166534' : item.status === 'pending' ? '#92400e' : '#dc2626'
                                  }}>
                                    {item.status || 'Pending'}
                                  </span>
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {new Date(item.createdAt || item.submittedAt || Date.now()).toLocaleDateString()}
                                </td>
                              </>
                            )}
                            {selectedReport === 'messages' && (
                              <>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151'}}>
                                  {item.name || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {item.email || 'N/A'}
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#374151'}}>
                                  {item.subject || 'N/A'}
                                </td>
                                <td style={{padding: '12px'}}>
                                  <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: item.status === 'read' ? '#dcfce7' : '#fef3c7',
                                    color: item.status === 'read' ? '#166534' : '#92400e'
                                  }}>
                                    {item.status || 'Unread'}
                                  </span>
                                </td>
                                <td style={{padding: '12px', fontSize: '0.85rem', color: '#6b7280'}}>
                                  {new Date(item.createdAt || item.timestamp || Date.now()).toLocaleDateString()}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
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
