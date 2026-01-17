import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function RentalIncomeTracker({ propertyId, propertyTitle, userShares, totalShares }) {
  const { user } = useFirebase()
  const [rentalHistory, setRentalHistory] = useState([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0)
  const [averageMonthlyIncome, setAverageMonthlyIncome] = useState(0)

  // Generate mock rental income data
  useEffect(() => {
    if (!userShares || userShares === 0) return

    const ownershipPercentage = (userShares / totalShares) * 100
    const monthlyPropertyRental = 150000 // PKR 1.5 Lakh monthly rental for the property
    const userMonthlyShare = (monthlyPropertyRental * ownershipPercentage) / 100

    const mockRentalData = []
    const currentDate = new Date()
    
    // Generate 12 months of rental history
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const isCurrentMonth = i === 0
      
      // Add some variation to monthly income
      const variation = (Math.random() - 0.5) * 0.1 // Â±5% variation
      const monthlyAmount = userMonthlyShare * (1 + variation)
      
      const rentalData = {
        id: `rental-${date.getTime()}`,
        date: date.toISOString(),
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        amount: Math.round(monthlyAmount),
        propertyRental: monthlyPropertyRental,
        ownershipPercentage: ownershipPercentage,
        status: isCurrentMonth ? 'pending' : 'paid',
        paymentDate: isCurrentMonth ? null : new Date(date.getFullYear(), date.getMonth() + 1, 5).toISOString(),
        tenantName: 'ABC Corporation',
        rentalYield: ((monthlyAmount * 12) / (userShares * 50000)) * 100 // Assuming PKR50k per share
      }
      
      mockRentalData.push(rentalData)
    }

    setRentalHistory(mockRentalData)
    
    // Calculate totals
    const paidRentals = mockRentalData.filter(r => r.status === 'paid')
    const total = paidRentals.reduce((sum, rental) => sum + rental.amount, 0)
    const thisMonth = mockRentalData.find(r => r.status === 'pending')?.amount || 0
    const average = paidRentals.length > 0 ? total / paidRentals.length : 0
    
    setTotalEarnings(total)
    setThisMonthEarnings(thisMonth)
    setAverageMonthlyIncome(average)
  }, [userShares, totalShares])

  if (!userShares || userShares === 0) {
    return (
      <div style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>ðŸ </div>
        <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>No Rental Income</h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Purchase shares in this property to start earning monthly rental income
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
          Monthly Rental Income
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Your share: {userShares} shares ({ownershipPercentage.toFixed(2)}% ownership)
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
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>Total Earnings</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>PKR {totalEarnings.toLocaleString()}</div>
          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
            {rentalHistory.filter(r => r.status === 'paid').length} payments received
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>This Month</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>PKR {thisMonthEarnings.toLocaleString()}</div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#f59e0b' }}>
            Payment pending
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '24px',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>Average Monthly</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>PKR {Math.round(averageMonthlyIncome).toLocaleString()}</div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#10b981' }}>
            {((averageMonthlyIncome * 12) / (userShares * 50000) * 100).toFixed(1)}% annual yield
          </div>
        </div>
      </div>

      {/* Rental History */}
      <div>
        <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          Rental History
        </h4>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {rentalHistory.slice(0, 6).map(rental => (
            <div key={rental.id} style={{
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
                  {rental.month}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {rental.tenantName} â€¢ {rental.ownershipPercentage.toFixed(2)}% ownership
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>
                  PKR {rental.amount.toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {rental.rentalYield.toFixed(1)}% yield
                </div>
              </div>
              
              <div style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: rental.status === 'paid' ? '#dcfce7' : '#fef3cd',
                color: rental.status === 'paid' ? '#166534' : '#92400e'
              }}>
                {rental.status === 'paid' ? 'Paid' : 'Pending'}
              </div>
            </div>
          ))}
        </div>

        {rentalHistory.length > 6 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <button style={{
              background: 'transparent',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              View All {rentalHistory.length} Payments
            </button>
          </div>
        )}
      </div>

      {/* Rental Info */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Property Rental</div>
            <div style={{ fontWeight: '600', color: '#166534' }}>PKR 1,50,000/month</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Your Share</div>
            <div style={{ fontWeight: '600', color: '#166534' }}>{ownershipPercentage.toFixed(2)}%</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Payment Date</div>
            <div style={{ fontWeight: '600', color: '#166534' }}>5th of each month</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Next Payment</div>
            <div style={{ fontWeight: '600', color: '#166534' }}>
              {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
