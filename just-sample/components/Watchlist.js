import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Watchlist({ propertyId, propertyData, size = 'default' }) {
  const { user } = useFirebase()
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if property is in watchlist on component mount
  useEffect(() => {
    if (propertyId) {
      const watchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]')
      setIsWatchlisted(watchlist.some(item => item.id === propertyId))
    }
  }, [propertyId])

  const toggleWatchlist = async () => {
    if (!user) {
      alert('Please login to add properties to your watchlist')
      return
    }

    setIsLoading(true)
    
    try {
      const watchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]')
      
      if (isWatchlisted) {
        // Remove from watchlist
        const updatedWatchlist = watchlist.filter(item => item.id !== propertyId)
        localStorage.setItem('userWatchlist', JSON.stringify(updatedWatchlist))
        setIsWatchlisted(false)
      } else {
        // Add to watchlist
        const watchlistItem = {
          id: propertyId,
          title: propertyData?.title || 'Property',
          location: propertyData?.location || '',
          image: propertyData?.image || '',
          totalValue: propertyData?.totalValue || '',
          minInvestment: propertyData?.minInvestment || '',
          expectedReturn: propertyData?.expectedReturn || '',
          status: propertyData?.status || '',
          dateAdded: new Date().toISOString()
        }
        
        const updatedWatchlist = [...watchlist, watchlistItem]
        localStorage.setItem('userWatchlist', JSON.stringify(updatedWatchlist))
        setIsWatchlisted(true)
      }
    } catch (error) {
      console.error('Error updating watchlist:', error)
      alert('Error updating watchlist. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const buttonStyle = {
    default: {
      background: isWatchlisted ? '#ff5e01' : 'transparent',
      color: isWatchlisted ? '#fff' : '#ff5e01',
      border: '1px solid #ff5e01',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      opacity: isLoading ? 0.7 : 1
    },
    small: {
      background: isWatchlisted ? '#ff5e01' : 'rgba(255, 255, 255, 0.9)',
      color: isWatchlisted ? '#fff' : '#ff5e01',
      border: '1px solid #ff5e01',
      padding: '6px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      opacity: isLoading ? 0.7 : 1,
      backdropFilter: 'blur(10px)'
    },
    icon: {
      background: isWatchlisted ? '#ff5e01' : 'rgba(255, 255, 255, 0.9)',
      color: isWatchlisted ? '#fff' : '#ff5e01',
      border: '1px solid #ff5e01',
      padding: '8px',
      borderRadius: '50%',
      fontSize: '16px',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      opacity: isLoading ? 0.7 : 1,
      backdropFilter: 'blur(10px)'
    }
  }

  const handleMouseOver = (e) => {
    if (!isLoading) {
      if (!isWatchlisted) {
        e.target.style.background = '#ff5e01'
        e.target.style.color = '#fff'
      } else {
        e.target.style.background = '#e54e00'
      }
    }
  }

  const handleMouseOut = (e) => {
    if (!isLoading) {
      if (!isWatchlisted) {
        e.target.style.background = size === 'icon' || size === 'small' ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
        e.target.style.color = '#ff5e01'
      } else {
        e.target.style.background = '#ff5e01'
        e.target.style.color = '#fff'
      }
    }
  }

  const renderIcon = () => {
    if (isLoading) {
      return (
        <span style={{ 
          display: 'inline-block', 
          width: '12px', 
          height: '12px', 
          border: '2px solid currentColor', 
          borderTopColor: 'transparent', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )
    }
    
    return isWatchlisted ? '❤️' : '🤍'
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <button
        onClick={toggleWatchlist}
        disabled={isLoading}
        style={buttonStyle[size] || buttonStyle.default}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
      >
        {renderIcon()}
        {size !== 'icon' && (
          <span>
            {isLoading ? 'Updating...' : (isWatchlisted ? 'Watchlisted' : 'Watchlist')}
          </span>
        )}
      </button>
    </>
  )
}

// Watchlist Page Component
export function WatchlistPage() {
  const { user } = useFirebase()
  const [watchlist, setWatchlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const userWatchlist = JSON.parse(localStorage.getItem('userWatchlist') || '[]')
      setWatchlist(userWatchlist)
    }
    setIsLoading(false)
  }, [user])

  const removeFromWatchlist = (propertyId) => {
    const updatedWatchlist = watchlist.filter(item => item.id !== propertyId)
    setWatchlist(updatedWatchlist)
    localStorage.setItem('userWatchlist', JSON.stringify(updatedWatchlist))
  }

  const clearWatchlist = () => {
    if (confirm('Are you sure you want to clear your entire watchlist?')) {
      setWatchlist([])
      localStorage.setItem('userWatchlist', JSON.stringify([]))
    }
  }

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading watchlist...</div>
  }

  if (!user) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: '#fff',
        borderRadius: '16px',
        margin: '20px'
      }}>
        <h2>Please Login</h2>
        <p>You need to be logged in to view your watchlist.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>
            My Watchlist
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
            {watchlist.length} propert{watchlist.length !== 1 ? 'ies' : 'y'} saved
          </p>
        </div>
        
        {watchlist.length > 0 && (
          <button
            onClick={clearWatchlist}
            style={{
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#ef4444'
              e.target.style.color = '#fff'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#ef4444'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
            No Properties in Watchlist
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
            Start adding properties to your watchlist to keep track of your favorites
          </p>
          <a 
            href="/investment-shares"
            style={{
              background: '#ff5e01',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }}
          >
            Browse Properties
          </a>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {watchlist.map((property) => (
            <div key={property.id} style={{
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.3s ease'
            }}>
              {property.image && (
                <div style={{ 
                  height: '200px', 
                  backgroundImage: `url(${property.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <button
                    onClick={() => removeFromWatchlist(property.id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                    title="Remove from Watchlist"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#1f2937' 
                }}>
                  {property.title}
                </h3>
                
                <p style={{ 
                  margin: '0 0 16px 0', 
                  color: '#6b7280', 
                  fontSize: '14px' 
                }}>
                  📍 {property.location}
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Total Value
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {property.totalValue}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      Min Investment
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {property.minInvestment}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    background: '#f0fdf4',
                    color: '#166534',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {property.expectedReturn} ROI
                  </span>
                  
                  <a
                    href={`/investment-payment?id=${property.id}&title=${encodeURIComponent(property.title)}&min=${encodeURIComponent(property.minInvestment)}`}
                    style={{
                      background: '#ff5e01',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Invest Now
                  </a>
                </div>
                
                <div style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af', 
                  marginTop: '12px',
                  borderTop: '1px solid #f3f4f6',
                  paddingTop: '12px'
                }}>
                  Added {new Date(property.dateAdded).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}