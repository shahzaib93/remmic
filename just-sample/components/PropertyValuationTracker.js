import { useState, useEffect } from 'react'

export default function PropertyValuationTracker({ propertyId, propertyTitle, userShares, totalShares, initialPropertyValue = 20000000 }) {
  const [valuationHistory, setValuationHistory] = useState([])
  const [currentValuation, setCurrentValuation] = useState(initialPropertyValue)
  const [totalAppreciation, setTotalAppreciation] = useState(0)
  const [yearToDate, setYearToDate] = useState(0)
  const [ownershipValue, setOwnershipValue] = useState(0)

  // Generate mock valuation data
  useEffect(() => {
    if (!userShares || userShares === 0) return

    const ownershipPercentage = (userShares / totalShares) * 100
    const currentOwnershipValue = (currentValuation * ownershipPercentage) / 100
    const initialOwnershipValue = (initialPropertyValue * ownershipPercentage) / 100

    const mockValuationData = []
    const currentDate = new Date()
    
    // Generate 12 months of valuation history
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      
      // Simulate property appreciation with some volatility
      const monthsFromStart = 12 - i
      const baseGrowth = 0.008 // 0.8% monthly base growth (10% annually)
      const volatility = (Math.random() - 0.5) * 0.004 // Â±0.2% random volatility
      const seasonality = Math.sin((monthsFromStart / 12) * 2 * Math.PI) * 0.002 // Small seasonal effect
      
      const monthlyGrowthRate = baseGrowth + volatility + seasonality
      const cumulativeGrowth = Math.pow(1 + monthlyGrowthRate, monthsFromStart)
      const propertyValue = initialPropertyValue * cumulativeGrowth
      const userValue = (propertyValue * ownershipPercentage) / 100
      
      const valuationData = {
        id: `valuation-${date.getTime()}`,
        date: date.toISOString(),
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        propertyValue: Math.round(propertyValue),
        userValue: Math.round(userValue),
        appreciation: ((propertyValue - initialPropertyValue) / initialPropertyValue) * 100,
        monthlyChange: i === 11 ? 0 : monthlyGrowthRate * 100,
        valuationMethod: 'Comparative Market Analysis',
        valuatedBy: 'REMMIC Valuation Services',
        sqftValue: Math.round(propertyValue / 2500) // Assuming 2500 sqft property
      }
      
      mockValuationData.push(valuationData)
    }

    setValuationHistory(mockValuationData)
    
    const latestValuation = mockValuationData[mockValuationData.length - 1]
    setCurrentValuation(latestValuation.propertyValue)
    setOwnershipValue(latestValuation.userValue)
    setTotalAppreciation(latestValuation.appreciation)
    
    // Calculate year-to-date appreciation
    const ytdStart = mockValuationData.find(v => new Date(v.date).getMonth() === 0) // January
    const ytdAppreciation = ytdStart ? 
      ((latestValuation.propertyValue - ytdStart.propertyValue) / ytdStart.propertyValue) * 100 : 
      latestValuation.appreciation
    setYearToDate(ytdAppreciation)
    
  }, [userShares, totalShares, initialPropertyValue])

  if (!userShares || userShares === 0) {
    return (
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>ðŸ“ˆ</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>No Property Valuation</h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Purchase shares in this property to track its valuation and appreciation
        </p>
      </div>
    )
  }

  const ownershipPercentage = (userShares / totalShares) * 100

  return (
    <div style={{ 
      background: '#fff', 
      padding: '30px', 
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
          Property Valuation & Appreciation
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Your ownership: {userShares} shares ({ownershipPercentage.toFixed(2)}% of property)
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
          color: '#fff',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Current Property Value</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>PKR {(currentValuation / 10000000).toFixed(1)}Cr</div>
          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
            PKR {Math.round(currentValuation / 2500).toLocaleString()}/sqft
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Your Share Value</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>PKR {Math.round(ownershipValue / 100000).toFixed(1)}L</div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
            {ownershipPercentage.toFixed(2)}% ownership
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Total Appreciation</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: totalAppreciation >= 0 ? '#10b981' : '#ef4444' }}>
            {totalAppreciation >= 0 ? '+' : ''}{totalAppreciation.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
            Since investment
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Year-to-Date</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: yearToDate >= 0 ? '#10b981' : '#ef4444' }}>
            {yearToDate >= 0 ? '+' : ''}{yearToDate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
            {new Date().getFullYear()} performance
          </div>
        </div>
      </div>

      {/* Valuation Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          12-Month Valuation Trend
        </h4>
        
        <div style={{ 
          height: '200px', 
          background: '#f9fafb', 
          borderRadius: '8px', 
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '20px',
          gap: '8px'
        }}>
          {valuationHistory.slice(-6).map((valuation, index) => {
            const maxValue = Math.max(...valuationHistory.map(v => v.propertyValue))
            const height = (valuation.propertyValue / maxValue) * 160
            
            return (
              <div key={valuation.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  background: index === valuationHistory.slice(-6).length - 1 ? 
                    'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)' : '#d1d5db',
                  height: `${height}px`,
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  {index === valuationHistory.slice(-6).length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1f2937',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      PKR {(valuation.propertyValue / 10000000).toFixed(1)}Cr
                    </div>
                  )}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#6b7280', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {valuation.month}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Valuation History */}
      <div>
        <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          Recent Valuations
        </h4>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {valuationHistory.slice(-4).reverse().map(valuation => (
            <div key={valuation.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              alignItems: 'center',
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  {valuation.month}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {valuation.valuationMethod} â€¢ {valuation.valuatedBy}
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  PKR {(valuation.propertyValue / 10000000).toFixed(2)}Cr
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  PKR {valuation.sqftValue.toLocaleString()}/sqft
                </div>
              </div>
              
              <div style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: valuation.appreciation >= 0 ? '#dcfce7' : '#fee2e2',
                color: valuation.appreciation >= 0 ? '#166534' : '#dc2626'
              }}>
                {valuation.appreciation >= 0 ? '+' : ''}{valuation.appreciation.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valuation Info */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '4px' }}>Valuation Method</div>
            <div style={{ fontWeight: '600', color: '#0c4a6e' }}>Comparative Market Analysis</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '4px' }}>Last Updated</div>
            <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
              {new Date(valuationHistory[valuationHistory.length - 1]?.date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '4px' }}>Next Valuation</div>
            <div style={{ fontWeight: '600', color: '#0c4a6e' }}>
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '4px' }}>Valuation Frequency</div>
            <div style={{ fontWeight: '600', color: '#0c4a6e' }}>Monthly</div>
          </div>
        </div>
        
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#0c4a6e' }}>
          ðŸ“ Professional valuations conducted by certified real estate appraisers using comparable sales data and market analysis.
        </div>
      </div>
    </div>
  )
}
