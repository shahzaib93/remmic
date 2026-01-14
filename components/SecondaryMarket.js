import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function SecondaryMarket({ propertyId, propertyTitle, currentSharePrice }) {
  const { user } = useFirebase()
  const [listings, setListings] = useState([])
  const [userShares, setUserShares] = useState(0)
  const [showSellModal, setShowSellModal] = useState(false)
  const [sellForm, setSellForm] = useState({ shares: 1, pricePerShare: currentSharePrice })
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)

  // Mock data for secondary market listings
  useEffect(() => {
    const mockListings = [
      {
        id: 'listing-1',
        sellerId: 'investor-1',
        sellerName: 'Ahmad Hassan',
        shares: 5,
        pricePerShare: currentSharePrice + 2000,
        totalPrice: (currentSharePrice + 2000) * 5,
        listingDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        reason: 'Portfolio rebalancing'
      },
      {
        id: 'listing-2',
        sellerId: 'investor-2',
        sellerName: 'Fatima Khan',
        shares: 3,
        pricePerShare: currentSharePrice - 1000,
        totalPrice: (currentSharePrice - 1000) * 3,
        listingDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        reason: 'Emergency funds needed'
      },
      {
        id: 'listing-3',
        sellerId: 'investor-3',
        sellerName: 'Usman Ali',
        shares: 10,
        pricePerShare: currentSharePrice + 5000,
        totalPrice: (currentSharePrice + 5000) * 10,
        listingDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        reason: 'Moving abroad'
      }
    ]
    setListings(mockListings)

    // Get user's shares from localStorage
    const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]')
    const userPropertyShares = investments
      .filter(inv => inv.propertyId === propertyId)
      .reduce((total, inv) => total + (inv.shares || 0), 0)
    setUserShares(userPropertyShares)
  }, [propertyId, currentSharePrice])

  const handleSellShares = () => {
    if (sellForm.shares > userShares) {
      alert('You cannot sell more shares than you own')
      return
    }

    const newListing = {
      id: `listing-${Date.now()}`,
      sellerId: user?.uid || 'current-user',
      sellerName: user?.displayName || 'You',
      shares: parseInt(sellForm.shares),
      pricePerShare: parseInt(sellForm.pricePerShare),
      totalPrice: parseInt(sellForm.shares) * parseInt(sellForm.pricePerShare),
      listingDate: new Date().toISOString(),
      reason: 'User listing'
    }

    setListings(prev => [newListing, ...prev])
    setUserShares(prev => prev - parseInt(sellForm.shares))
    setShowSellModal(false)
    setSellForm({ shares: 1, pricePerShare: currentSharePrice })
    
    alert('Your shares have been listed for sale!')
  }

  const handleBuyShares = (listing) => {
    setSelectedListing(listing)
    setShowBuyModal(true)
  }

  const confirmPurchase = () => {
    if (!selectedListing) return

    // Add to user's investments
    const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]')
    const newInvestment = {
      id: `investment-${Date.now()}`,
      propertyId: propertyId,
      propertyTitle: propertyTitle,
      shares: selectedListing.shares,
      sharePrice: selectedListing.pricePerShare,
      totalAmount: selectedListing.totalPrice,
      investmentDate: new Date().toISOString(),
      type: 'secondary_market',
      sellerId: selectedListing.sellerId,
      status: 'active'
    }
    
    investments.push(newInvestment)
    localStorage.setItem('userInvestments', JSON.stringify(investments))

    // Remove listing from market
    setListings(prev => prev.filter(l => l.id !== selectedListing.id))
    setUserShares(prev => prev + selectedListing.shares)
    setShowBuyModal(false)
    setSelectedListing(null)
    
    alert('Purchase successful! Shares added to your portfolio.')
  }

  return (
    <div style={{ 
      background: '#fff', 
      padding: '30px', 
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      marginTop: '30px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            Secondary Market
          </h3>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            Buy and sell shares with other investors
          </p>
        </div>
        
        {userShares > 0 && (
          <button
            onClick={() => setShowSellModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Sell Your Shares ({userShares})
          </button>
        )}
      </div>

      {listings.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>ðŸ“ˆ</div>
          <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>No shares available</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>Be the first to list shares for this property</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {listings.map(listing => (
            <div key={listing.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '20px',
              transition: 'all 0.2s ease',
              ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    {listing.sellerName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px' }}>
                      {listing.sellerName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Listed {new Date(listing.listingDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Shares</div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{listing.shares}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Price per Share</div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>PKR {listing.pricePerShare.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Price</div>
                    <div style={{ fontWeight: '600', color: '#ff5e01' }}>PKR {listing.totalPrice.toLocaleString()}</div>
                  </div>
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Reason: {listing.reason}
                </div>
              </div>
              
              <button
                onClick={() => handleBuyShares(listing)}
                style={{
                  background: '#f9fafb',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#ff5e01'
                  e.target.style.color = '#fff'
                  e.target.style.borderColor = '#ff5e01'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f9fafb'
                  e.target.style.color = '#1f2937'
                  e.target.style.borderColor = '#d1d5db'
                }}
              >
                Buy Shares
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>
              Sell Your Shares
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Number of Shares (You own: {userShares})
              </label>
              <input
                type="number"
                min="1"
                max={userShares}
                value={sellForm.shares}
                onChange={(e) => setSellForm(prev => ({ ...prev, shares: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Price per Share (PKR)
              </label>
              <input
                type="number"
                value={sellForm.pricePerShare}
                onChange={(e) => setSellForm(prev => ({ ...prev, pricePerShare: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ 
              background: '#f9fafb', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                Total Sale Value: PKR {(sellForm.shares * sellForm.pricePerShare).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Platform fee (2%): PKR {Math.round(sellForm.shares * sellForm.pricePerShare * 0.02).toLocaleString()}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSellModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSellShares}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                List for Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && selectedListing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '700' }}>
              Purchase Shares
            </h3>
            
            <div style={{ 
              background: '#f9fafb', 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Seller</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>{selectedListing.sellerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Shares</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>{selectedListing.shares}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Price per Share</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>PKR {selectedListing.pricePerShare.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Cost</div>
                  <div style={{ fontWeight: '600', color: '#ff5e01' }}>PKR {selectedListing.totalPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: '#fef3cd', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #fbbf24',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', color: '#92400e' }}>
                âš ï¸ This is a peer-to-peer transaction. Funds will be held in escrow until the transfer is complete.
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowBuyModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
