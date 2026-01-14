/**
 * Auction Detail Page with Live Bidding
 * Phase 2B: Auction Engine & Live Bidding
 *
 * Features:
 * - Property details with photo gallery
 * - Live countdown timer
 * - Bid placement
 * - Auto-bid setup
 * - Buy now option
 * - Bid history
 * - Anti-sniping indicator
 */

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFirebase } from '../../contexts/FirebaseContext'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import {
  getAuction,
  getAuctionByListing,
  getAuctionBids,
  placeBid,
  setAutoBid,
  getUserAutoBid,
  executeBuyNow,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getTimeRemaining,
  getMinNextBid,
  formatPrice,
  AUCTION_STATUS,
  seedAuctionDemoData,
  hasAuctionDemoData,
} from '../../lib/step2-auction-engine'
import { getListing, getListingMedia } from '../../lib/step2-auction-service'

export default function AuctionDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useFirebase()

  const [auction, setAuction] = useState(null)
  const [listing, setListing] = useState(null)
  const [media, setMedia] = useState([])
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Bidding state
  const [bidAmount, setBidAmount] = useState('')
  const [autoBidMax, setAutoBidMax] = useState('')
  const [userAutoBid, setUserAutoBid] = useState(null)
  const [bidding, setBidding] = useState(false)
  const [bidError, setBidError] = useState(null)
  const [bidSuccess, setBidSuccess] = useState(null)

  // UI state
  const [activeTab, setActiveTab] = useState('details')
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAutoBidModal, setShowAutoBidModal] = useState(false)
  const [showBuyNowModal, setShowBuyNowModal] = useState(false)
  const [watching, setWatching] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(null)

  // Load auction data
  const loadAuctionData = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Seed demo data if not exists
      if (!hasAuctionDemoData()) {
        await seedAuctionDemoData()
      }

      // Try loading by auction ID first, then by listing ID
      let auctionResult = await getAuction(id)
      if (!auctionResult.success) {
        auctionResult = await getAuctionByListing(id)
      }

      if (!auctionResult.success) {
        setError('Auction not found')
        setLoading(false)
        return
      }

      setAuction(auctionResult.auction)

      // Load listing details
      const listingResult = await getListing(auctionResult.auction.listingId)
      if (listingResult.success) {
        setListing(listingResult.listing)
        setMedia(listingResult.listing.media || [])
      }

      // Load bids
      const bidsResult = await getAuctionBids(auctionResult.auction.id)
      if (bidsResult.success) {
        setBids(bidsResult.bids)
      }

      // Check watchlist status
      if (user) {
        const watchResult = await isInWatchlist(user.uid, auctionResult.auction.id)
        setWatching(watchResult.isWatching)

        // Get user's auto-bid
        const autoBidResult = await getUserAutoBid(auctionResult.auction.id, user.uid)
        setUserAutoBid(autoBidResult.autoBid)
      }

      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    loadAuctionData()
  }, [loadAuctionData])

  // Update countdown timer
  useEffect(() => {
    if (!auction) return

    const updateTimer = () => {
      setTimeRemaining(getTimeRemaining(auction.endTime))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [auction])

  // Refresh auction data periodically
  useEffect(() => {
    if (!auction) return

    const interval = setInterval(() => {
      loadAuctionData()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [auction, loadAuctionData])

  // Handle bid placement
  const handlePlaceBid = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath))
      return
    }

    setBidding(true)
    setBidError(null)
    setBidSuccess(null)

    const amount = parseInt(bidAmount.replace(/,/g, ''), 10)
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount')
      setBidding(false)
      return
    }

    const result = await placeBid(auction.id, user.uid, amount, user.displayName || 'Bidder')

    if (result.success) {
      setBidSuccess(result.message)
      setBidAmount('')
      setAuction(result.auction)
      loadAuctionData() // Refresh all data
    } else {
      setBidError(result.error)
    }

    setBidding(false)
  }

  // Handle auto-bid setup
  const handleSetAutoBid = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath))
      return
    }

    setBidding(true)
    setBidError(null)

    const maxBid = parseInt(autoBidMax.replace(/,/g, ''), 10)
    if (isNaN(maxBid) || maxBid <= 0) {
      setBidError('Please enter a valid maximum bid')
      setBidding(false)
      return
    }

    const result = await setAutoBid(auction.id, user.uid, maxBid, user.displayName || 'Bidder')

    if (result.success) {
      setBidSuccess(result.message)
      setAutoBidMax('')
      setShowAutoBidModal(false)
      setUserAutoBid(result.autoBid)
      loadAuctionData()
    } else {
      setBidError(result.error)
    }

    setBidding(false)
  }

  // Handle buy now
  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath))
      return
    }

    setBidding(true)
    setBidError(null)

    const result = await executeBuyNow(auction.id, user.uid, user.displayName || 'Buyer')

    if (result.success) {
      setShowBuyNowModal(false)
      setAuction(result.auction)
      setBidSuccess(result.message)
    } else {
      setBidError(result.error)
    }

    setBidding(false)
  }

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath))
      return
    }

    if (watching) {
      await removeFromWatchlist(user.uid, auction.id)
      setWatching(false)
    } else {
      await addToWatchlist(user.uid, auction.id)
      setWatching(true)
    }
  }

  // Format time remaining
  const formatTimeRemaining = () => {
    if (!timeRemaining || timeRemaining.expired) {
      return 'Auction Ended'
    }

    const { days, hours, minutes, seconds } = timeRemaining
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
  }

  // Get status badge
  const getStatusBadge = () => {
    if (!auction) return null

    const statusConfig = {
      [AUCTION_STATUS.LIVE]: { label: 'Live', className: 'badge-live' },
      [AUCTION_STATUS.ENDING_SOON]: { label: 'Ending Soon', className: 'badge-ending' },
      [AUCTION_STATUS.SOLD]: { label: 'Sold', className: 'badge-sold' },
      [AUCTION_STATUS.UNSOLD]: { label: 'Unsold', className: 'badge-unsold' },
      [AUCTION_STATUS.SCHEDULED]: { label: 'Upcoming', className: 'badge-scheduled' },
    }

    const config = statusConfig[auction.status] || { label: auction.status, className: '' }
    return <span className={`status-badge ${config.className}`}>{config.label}</span>
  }

  // Check if user is winning
  const isUserWinning = user && auction && auction.highestBidderId === user.uid

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading auction...</p>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #c9a227;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    )
  }

  if (error || !auction || !listing) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>Auction Not Found</h2>
          <p>{error || 'This auction does not exist or has been removed.'}</p>
          <Link href="/auctions" className="back-link">
            Browse All Auctions
          </Link>
        </div>
        <Footer />
        <style jsx>{`
          .error-container {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            text-align: center;
            padding: 2rem;
          }
          .back-link {
            background: #c9a227;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 1rem;
          }
        `}</style>
      </>
    )
  }

  const minNextBid = getMinNextBid(auction.currentPrice)
  const isActive = [AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(auction.status)
  const primaryImage = media.find(m => m.isPrimary) || media[0]

  return (
    <>
      <Head>
        <title>{listing.title} - Live Auction | REMMIC</title>
        <meta name="description" content={`Bid on ${listing.title}. Current bid: ${formatPrice(auction.currentPrice)}`} />
      </Head>

      <Navbar />

      <main className="auction-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/auctions">Auctions</Link>
          <span>/</span>
          <span>{listing.title}</span>
        </nav>

        <div className="auction-container">
          {/* Left Column - Images & Details */}
          <div className="auction-left">
            {/* Image Gallery */}
            <div className="image-gallery">
              <div className="main-image">
                {media.length > 0 ? (
                  <img
                    src={media[selectedImage]?.url || '/house1.jpg'}
                    alt={listing.title}
                    onError={(e) => { e.target.src = '/house1.jpg' }}
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
                {auction.extended && (
                  <div className="extended-badge">
                    Extended +{auction.extensionCount * 5}min
                  </div>
                )}
              </div>
              {media.length > 1 && (
                <div className="thumbnail-row">
                  {media.slice(0, 5).map((img, idx) => (
                    <button
                      key={img.id}
                      className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img
                        src={img.url || '/house1.jpg'}
                        alt={`View ${idx + 1}`}
                        onError={(e) => { e.target.src = '/house1.jpg' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <button
                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
              <button
                className={`tab ${activeTab === 'bids' ? 'active' : ''}`}
                onClick={() => setActiveTab('bids')}
              >
                Bid History ({bids.length})
              </button>
              <button
                className={`tab ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Features
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'details' && (
                <div className="details-content">
                  <h3>Property Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="label">Property Type</span>
                      <span className="value">{listing.propertyType?.replace('_', ' ')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Location</span>
                      <span className="value">{listing.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">City</span>
                      <span className="value">{listing.city}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Area</span>
                      <span className="value">{listing.area} {listing.areaUnit}</span>
                    </div>
                    {listing.bedrooms && (
                      <div className="detail-item">
                        <span className="label">Bedrooms</span>
                        <span className="value">{listing.bedrooms}</span>
                      </div>
                    )}
                    {listing.bathrooms && (
                      <div className="detail-item">
                        <span className="label">Bathrooms</span>
                        <span className="value">{listing.bathrooms}</span>
                      </div>
                    )}
                  </div>
                  {listing.description && (
                    <div className="description">
                      <h4>Description</h4>
                      <p>{listing.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bids' && (
                <div className="bids-content">
                  <h3>Bid History</h3>
                  {bids.length === 0 ? (
                    <p className="no-bids">No bids yet. Be the first to bid!</p>
                  ) : (
                    <div className="bids-list">
                      {bids.map((bid, idx) => (
                        <div
                          key={bid.id}
                          className={`bid-item ${idx === 0 ? 'winning' : ''} ${bid.userId === user?.uid ? 'my-bid' : ''}`}
                        >
                          <div className="bid-info">
                            <span className="bidder-name">
                              {bid.userName}
                              {bid.isAutoBid && <span className="auto-badge">Auto</span>}
                              {bid.userId === user?.uid && <span className="you-badge">You</span>}
                            </span>
                            <span className="bid-time">
                              {new Date(bid.createdAt).toLocaleString('en-PK', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <span className="bid-amount">{formatPrice(bid.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'features' && (
                <div className="features-content">
                  <h3>Property Features</h3>
                  {listing.features && listing.features.length > 0 ? (
                    <ul className="features-list">
                      {listing.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-features">No features listed</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="auction-right">
            <div className="bidding-panel">
              {/* Status & Timer */}
              <div className="auction-header">
                {getStatusBadge()}
                <button
                  className={`watchlist-btn ${watching ? 'watching' : ''}`}
                  onClick={handleWatchlistToggle}
                  title={watching ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={watching ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <h1 className="auction-title">{listing.title}</h1>
              <p className="auction-location">{listing.location}, {listing.city}</p>

              {/* Timer */}
              {isActive && (
                <div className={`countdown ${timeRemaining && timeRemaining.total < 3600000 ? 'urgent' : ''}`}>
                  <span className="countdown-label">
                    {auction.status === AUCTION_STATUS.ENDING_SOON ? 'Ending In' : 'Time Remaining'}
                  </span>
                  <span className="countdown-value">{formatTimeRemaining()}</span>
                </div>
              )}

              {/* Current Price */}
              <div className="price-section">
                <div className="current-bid">
                  <span className="price-label">Current Bid</span>
                  <span className="price-value">{formatPrice(auction.currentPrice)}</span>
                  <span className="bid-count">{auction.bidCount} bids</span>
                </div>

                {auction.reservePrice && (
                  <div className={`reserve-status ${auction.reserveMet ? 'met' : 'not-met'}`}>
                    {auction.reserveMet ? 'Reserve Met' : 'Reserve Not Met'}
                  </div>
                )}

                {isUserWinning && (
                  <div className="winning-status">
                    You are the highest bidder!
                  </div>
                )}
              </div>

              {/* Bid Form */}
              {isActive && (
                <div className="bid-section">
                  {bidError && <div className="alert alert-error">{bidError}</div>}
                  {bidSuccess && <div className="alert alert-success">{bidSuccess}</div>}

                  <form onSubmit={handlePlaceBid} className="bid-form">
                    <div className="bid-input-group">
                      <span className="currency">PKR</span>
                      <input
                        type="text"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder={`Min: ${minNextBid.toLocaleString('en-PK')}`}
                        disabled={bidding}
                      />
                    </div>
                    <button type="submit" className="btn-bid" disabled={bidding}>
                      {bidding ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </form>

                  <p className="min-bid-note">
                    Minimum bid: {formatPrice(minNextBid)}
                  </p>

                  {/* Auto-bid Button */}
                  <button
                    className="btn-auto-bid"
                    onClick={() => setShowAutoBidModal(true)}
                    disabled={bidding}
                  >
                    {userAutoBid ? `Auto-Bid Active (Max: ${formatPrice(userAutoBid.maxBid)})` : 'Set Auto-Bid'}
                  </button>

                  {/* Buy Now */}
                  {auction.buyNowPrice && (
                    <div className="buy-now-section">
                      <div className="divider">
                        <span>OR</span>
                      </div>
                      <button
                        className="btn-buy-now"
                        onClick={() => setShowBuyNowModal(true)}
                        disabled={bidding}
                      >
                        Buy Now for {formatPrice(auction.buyNowPrice)}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ended Auction */}
              {auction.status === AUCTION_STATUS.SOLD && (
                <div className="sold-section">
                  <div className="sold-badge">SOLD</div>
                  <p className="final-price">Final Price: {formatPrice(auction.finalPrice)}</p>
                  {auction.soldViaBuyNow && <p className="sold-method">Sold via Buy Now</p>}
                </div>
              )}

              {auction.status === AUCTION_STATUS.UNSOLD && (
                <div className="unsold-section">
                  <div className="unsold-badge">Auction Ended</div>
                  <p>This auction ended without a sale.</p>
                </div>
              )}

              {/* Seller Info */}
              <div className="seller-info">
                <h4>Listed by</h4>
                <p>Verified Seller</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auto-Bid Modal */}
      {showAutoBidModal && (
        <div className="modal-overlay" onClick={() => setShowAutoBidModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Set Auto-Bid</h3>
            <p>
              Auto-bid will automatically place bids on your behalf up to your maximum amount.
              You will only pay the minimum amount needed to stay in the lead.
            </p>
            <form onSubmit={handleSetAutoBid}>
              <div className="form-group">
                <label>Maximum Bid Amount</label>
                <div className="bid-input-group">
                  <span className="currency">PKR</span>
                  <input
                    type="text"
                    value={autoBidMax}
                    onChange={(e) => setAutoBidMax(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={`Min: ${minNextBid.toLocaleString('en-PK')}`}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAutoBidModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-confirm" disabled={bidding}>
                  {bidding ? 'Setting...' : 'Set Auto-Bid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buy Now Modal */}
      {showBuyNowModal && (
        <div className="modal-overlay" onClick={() => setShowBuyNowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Purchase</h3>
            <p>You are about to purchase this property for:</p>
            <div className="buy-now-amount">{formatPrice(auction.buyNowPrice)}</div>
            <p className="buy-now-note">
              This will immediately end the auction and you will be the winner.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowBuyNowModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn-confirm" onClick={handleBuyNow} disabled={bidding}>
                {bidding ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .auction-page {
          min-height: 100vh;
          background: #fafafa;
          padding: 1rem;
        }

        .breadcrumb {
          max-width: 1400px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .breadcrumb a {
          color: #6b7280;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: #c9a227;
        }

        .auction-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2rem;
        }

        /* Image Gallery */
        .image-gallery {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .main-image {
          position: relative;
          aspect-ratio: 16/10;
          background: #f3f4f6;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }

        .extended-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #ef4444;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .thumbnail-row {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem;
          overflow-x: auto;
        }

        .thumbnail {
          flex-shrink: 0;
          width: 80px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          background: none;
        }

        .thumbnail.active {
          border-color: #c9a227;
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Tabs */
        .detail-tabs {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          background: white;
          margin-top: 1rem;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .tab {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #e5e7eb;
        }

        .tab.active {
          background: #c9a227;
          color: white;
        }

        .tab-content {
          background: white;
          padding: 1.5rem;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          min-height: 300px;
        }

        .tab-content h3 {
          margin: 0 0 1rem;
          font-size: 1.125rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item .label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .detail-item .value {
          font-weight: 600;
          text-transform: capitalize;
        }

        .description {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .description h4 {
          margin: 0 0 0.5rem;
        }

        .description p {
          color: #4b5563;
          line-height: 1.6;
        }

        /* Bids List */
        .bids-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bid-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .bid-item.winning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
        }

        .bid-item.my-bid {
          background: #ecfdf5;
          border: 1px solid #10b981;
        }

        .bid-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .bidder-name {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .auto-badge, .you-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .auto-badge {
          background: #dbeafe;
          color: #2563eb;
        }

        .you-badge {
          background: #d1fae5;
          color: #059669;
        }

        .bid-time {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .bid-amount {
          font-weight: 700;
          color: #111827;
        }

        .no-bids, .no-features {
          color: #6b7280;
          text-align: center;
          padding: 2rem;
        }

        /* Features List */
        .features-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .features-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f3f4f6;
          border-radius: 6px;
        }

        .features-list li::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #c9a227;
          border-radius: 50%;
        }

        /* Bidding Panel */
        .bidding-panel {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: sticky;
          top: 1rem;
        }

        .auction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge-live {
          background: #dcfce7;
          color: #166534;
        }

        .badge-ending {
          background: #fef3c7;
          color: #92400e;
          animation: pulse 1s infinite;
        }

        .badge-sold {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-unsold {
          background: #f3f4f6;
          color: #6b7280;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .watchlist-btn {
          background: none;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          color: #9ca3af;
          transition: all 0.2s;
        }

        .watchlist-btn:hover {
          border-color: #c9a227;
          color: #c9a227;
        }

        .watchlist-btn.watching {
          background: #fef3c7;
          border-color: #c9a227;
          color: #c9a227;
        }

        .auction-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: #111827;
        }

        .auction-location {
          color: #6b7280;
          margin: 0 0 1.5rem;
        }

        .countdown {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .countdown.urgent {
          background: #fef3c7;
          animation: pulse 1s infinite;
        }

        .countdown-label {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .countdown-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .price-section {
          margin-bottom: 1.5rem;
        }

        .current-bid {
          text-align: center;
          padding: 1rem;
          background: linear-gradient(135deg, #c9a227 0%, #b8941f 100%);
          border-radius: 8px;
          color: white;
        }

        .price-label {
          display: block;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .price-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          margin: 0.25rem 0;
        }

        .bid-count {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .reserve-status {
          text-align: center;
          padding: 0.5rem;
          margin-top: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .reserve-status.met {
          background: #dcfce7;
          color: #166534;
        }

        .reserve-status.not-met {
          background: #fef3c7;
          color: #92400e;
        }

        .winning-status {
          text-align: center;
          padding: 0.75rem;
          margin-top: 0.5rem;
          background: #dcfce7;
          color: #166534;
          border-radius: 6px;
          font-weight: 600;
        }

        /* Bid Form */
        .bid-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
        }

        .alert {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert-success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .bid-form {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .bid-input-group {
          flex: 1;
          display: flex;
          align-items: center;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .bid-input-group:focus-within {
          border-color: #c9a227;
        }

        .currency {
          padding: 0 0.75rem;
          color: #6b7280;
          font-weight: 500;
          background: #f9fafb;
        }

        .bid-input-group input {
          flex: 1;
          border: none;
          padding: 0.75rem;
          font-size: 1rem;
          outline: none;
        }

        .btn-bid {
          background: #c9a227;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-bid:hover:not(:disabled) {
          background: #b8941f;
        }

        .btn-bid:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .min-bid-note {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 1rem;
        }

        .btn-auto-bid {
          width: 100%;
          padding: 0.75rem;
          background: white;
          border: 2px solid #c9a227;
          color: #c9a227;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-auto-bid:hover:not(:disabled) {
          background: #fef3c7;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .btn-buy-now {
          width: 100%;
          padding: 1rem;
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-buy-now:hover:not(:disabled) {
          background: #1f2937;
        }

        /* Sold/Unsold Sections */
        .sold-section, .unsold-section {
          text-align: center;
          padding: 2rem;
        }

        .sold-badge, .unsold-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .sold-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        .unsold-badge {
          background: #f3f4f6;
          color: #6b7280;
        }

        .final-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .sold-method {
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Seller Info */
        .seller-info {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .seller-info h4 {
          margin: 0 0 0.25rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .seller-info p {
          margin: 0;
          font-weight: 500;
        }

        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 400px;
          width: 100%;
        }

        .modal h3 {
          margin: 0 0 1rem;
        }

        .modal p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .btn-cancel {
          flex: 1;
          padding: 0.75rem;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-confirm {
          flex: 1;
          padding: 0.75rem;
          background: #c9a227;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .buy-now-amount {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          color: #c9a227;
          margin: 1rem 0;
        }

        .buy-now-note {
          font-size: 0.875rem;
          background: #fef3c7;
          padding: 0.75rem;
          border-radius: 8px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .auction-container {
            grid-template-columns: 1fr;
          }

          .bidding-panel {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .details-grid {
            grid-template-columns: 1fr;
          }

          .features-list {
            grid-template-columns: 1fr;
          }

          .bid-form {
            flex-direction: column;
          }

          .detail-tabs {
            overflow-x: auto;
          }

          .tab {
            white-space: nowrap;
          }
        }
      `}</style>
    </>
  )
}
