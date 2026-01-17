import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function PortfolioOverview() {
  const { user } = useFirebase()
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalProfit: 0,
    profitPercentage: 0,
    monthlyIncome: 0,
    totalProperties: 0,
    totalShares: 0
  })
  const [investments, setInvestments] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  useEffect(() => {
    // Load user investments from localStorage (in real app, this would be from API)
    const userInvestments = JSON.parse(localStorage.getItem('userInvestments') || '[]')
    setInvestments(userInvestments)

    // Calculate portfolio metrics
    const totalInvested = userInvestments.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const currentValue = totalInvested * 1.12 // Mock 12% appreciation
    const profit = currentValue - totalInvested
    const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
    const monthlyIncome = userInvestments.reduce((sum, inv) => sum + (inv.monthlyRental || 2500), 0)
    const totalShares = userInvestments.reduce((sum, inv) => sum + (inv.shares || 0), 0)

    setPortfolioData({
      totalValue: currentValue,
      totalInvested,
      totalProfit: profit,
      profitPercentage,
      monthlyIncome,
      totalProperties: userInvestments.length,
      totalShares
    })

    // Generate mock performance data for chart
    const performanceHistory = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const baseValue = totalInvested
      const growthFactor = 1 + (0.12 * (12 - i) / 12) // 12% annual growth
      const value = baseValue * growthFactor
      performanceHistory.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        value: value,
        invested: baseValue
      })
    }
    setPerformanceData(performanceHistory)
  }, [])

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `PKR ${(amount / 10000000).toFixed(1)}Cr`
    if (amount >= 100000) return `PKR ${(amount / 100000).toFixed(1)}L`
    return `PKR ${amount.toLocaleString()}`
  }

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '16px', 
      padding: '30px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '30px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1f2937' 
        }}>
          Portfolio Overview
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#6b7280', 
          fontSize: '16px' 
        }}>
          Track your real estate investments and performance
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Total Portfolio Value */}
        <div style={{
          background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
          color: '#fff',
          padding: '24px',
          borderRadius: '16px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Total Portfolio Value</div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
              {formatCurrency(portfolioData.totalValue)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {portfolioData.profitPercentage >= 0 ? '+' : ''}{portfolioData.profitPercentage.toFixed(1)}% total return
            </div>
          </div>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }} />
        </div>

        {/* Total Invested */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '24px',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Total Invested</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
            {formatCurrency(portfolioData.totalInvested)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Across {portfolioData.totalProperties} properties
          </div>
        </div>

        {/* Total Profit */}
        <div style={{
          background: portfolioData.totalProfit >= 0 ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${portfolioData.totalProfit >= 0 ? '#bbf7d0' : '#fecaca'}`,
          padding: '24px',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Total Profit/Loss</div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: portfolioData.totalProfit >= 0 ? '#16a34a' : '#dc2626',
            marginBottom: '4px'
          }}>
            {portfolioData.totalProfit >= 0 ? '+' : ''}{formatCurrency(portfolioData.totalProfit)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {portfolioData.profitPercentage >= 0 ? '+' : ''}{portfolioData.profitPercentage.toFixed(1)}% return
          </div>
        </div>

        {/* Monthly Income */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          padding: '24px',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Monthly Rental Income</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>
            {formatCurrency(portfolioData.monthlyIncome)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            From {portfolioData.totalShares} total shares
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#1f2937' 
        }}>
          12-Month Performance
        </h3>
        
        <div style={{ 
          height: '300px', 
          background: '#f9fafb', 
          borderRadius: '12px', 
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '20px',
          gap: '8px'
        }}>
          {performanceData.map((data, index) => {
            const maxValue = Math.max(...performanceData.map(d => d.value))
            const height = (data.value / maxValue) * 260
            const isLatest = index === performanceData.length - 1
            
            return (
              <div key={index} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{
                  background: isLatest ? 
                    'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)' : '#d1d5db',
                  height: `${height}px`,
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  {isLatest && (
                    <div style={{
                      position: 'absolute',
                      top: '-50px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1f2937',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatCurrency(data.value)}
                    </div>
                  )}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {data.month}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        <button style={{
          background: '#ff5e01',
          color: '#fff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.background = '#e54e00'}
        onMouseOut={(e) => e.target.style.background = '#ff5e01'}
        >
          Browse Properties
        </button>
        
        <button style={{
          background: '#fff',
          color: '#ff5e01',
          border: '1px solid #ff5e01',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = '#ff5e01'
          e.target.style.color = '#fff'
        }}
        onMouseOut={(e) => {
          e.target.style.background = '#fff'
          e.target.style.color = '#ff5e01'
        }}
        >
          View Reports
        </button>
        
        <button style={{
          background: '#fff',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = '#f9fafb'
          e.target.style.borderColor = '#9ca3af'
        }}
        onMouseOut={(e) => {
          e.target.style.background = '#fff'
          e.target.style.borderColor = '#d1d5db'
        }}
        >
          Export Data
        </button>
      </div>
    </div>
  )
}
