/**
 * Seller Dashboard
 *
 * Step 2 Phase 2B: Overview of listings and auctions
 * Route: /seller/dashboard
 */

import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'
import {
  getSellerProfile,
  getSellerListings,
  getListingMedia,
  SELLER_STATUS,
  LISTING_STATUS,
} from '../../lib/step2-auction-service'
import {
  getAuctionByListing,
  getSellerAuctions,
  formatPrice as formatAuctionPrice,
  getTimeRemaining,
  AUCTION_STATUS,
  seedAuctionDemoData,
  hasAuctionDemoData,
} from '../../lib/step2-auction-engine'

const STATUS_CONFIG = {
  [LISTING_STATUS.DRAFT]: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
  [LISTING_STATUS.PENDING_REVIEW]: { label: 'Pending Review', color: '#f59e0b', bg: '#fffbeb' },
  [LISTING_STATUS.APPROVED]: { label: 'Approved', color: '#10b981', bg: '#ecfdf5' },
  [LISTING_STATUS.REJECTED]: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2' },
  [LISTING_STATUS.REVISION_REQUESTED]: { label: 'Revision Needed', color: '#f97316', bg: '#fff7ed' },
  'live': { label: 'Live Auction', color: '#fff', bg: '#10b981' },
  'ending_soon': { label: 'Ending Soon', color: '#fff', bg: '#f59e0b' },
  'sold': { label: 'Sold', color: '#fff', bg: '#3b82f6' },
}

export default function SellerDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useFirebase()
  const { registered, submitted } = router.query

  const [sellerProfile, setSellerProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const loadData = useCallback(async () => {
    if (user?.uid) {
      setIsLoading(true)

      // Seed auction demo data if needed
      if (!hasAuctionDemoData()) {
        await seedAuctionDemoData()
      }

      // Get seller profile
      const profileResult = await getSellerProfile(user.uid)
      if (profileResult.success) {
        setSellerProfile(profileResult.profile)
      }

      // Get listings
      const listingsResult = await getSellerListings(user.uid)
      if (listingsResult.success) {
        // Fetch media and auction info for each listing
        const listingsWithDetails = await Promise.all(
          listingsResult.listings.map(async (listing) => {
            const mediaResult = await getListingMedia(listing.id)
            const primaryPhoto = mediaResult.success
              ? mediaResult.media.find(m => m.isPrimary) || mediaResult.media[0]
              : null

            // Check for active auction
            let auction = null
            if (listing.status === LISTING_STATUS.APPROVED || listing.status === 'live') {
              const auctionResult = await getAuctionByListing(listing.id)
              if (auctionResult.success) {
                auction = auctionResult.auction
              }
            }

            return { ...listing, primaryPhoto, auction }
          })
        )
        setListings(listingsWithDetails)
      }

      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Show success message
  useEffect(() => {
    if (registered || submitted) {
      setShowSuccessMessage(true)
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [registered, submitted])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('redirectAfterLogin', '/seller/dashboard')
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span>Loading...</span>
      </div>
    )
  }

  // Not a seller yet
  if (!sellerProfile) {
    return (
      <>
        <Head>
          <title>Become a Seller - REMMIC</title>
        </Head>
        <div className="page-wrapper">
          <Navbar />
          <main className="dashboard-main">
            <div className="dashboard-container">
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <h2>Start Selling on REMMIC</h2>
                <p>Register as a seller to list your properties on our auction platform.</p>
                <Link href="/seller/register" className="btn btn--primary">
                  Register as Seller
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
        <style jsx>{`
          .dashboard-main {
            padding: 120px 5% 80px;
            min-height: calc(100vh - 200px);
            background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
          }
          .dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .empty-state {
            background: #fff;
            border-radius: 24px;
            padding: 64px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          }
          .empty-state h2 {
            font-size: 1.5rem;
            color: #0a0a0a;
            margin: 24px 0 12px;
          }
          .empty-state p {
            color: #6b7280;
            margin: 0 0 32px;
          }
          .btn {
            display: inline-block;
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
          }
          .btn--primary {
            background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
            color: #0a0a0a;
          }
        `}</style>
      </>
    )
  }

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} Lac`
    }
    return new Intl.NumberFormat('en-PK').format(price)
  }

  const getVerificationBadge = () => {
    switch (sellerProfile.verificationStatus) {
      case SELLER_STATUS.VERIFIED:
        return { label: 'Verified', color: '#10b981', icon: 'check' }
      case SELLER_STATUS.PENDING:
        return { label: 'Pending Verification', color: '#f59e0b', icon: 'clock' }
      case SELLER_STATUS.REJECTED:
        return { label: 'Verification Rejected', color: '#dc2626', icon: 'x' }
      default:
        return { label: 'Unverified', color: '#6b7280', icon: 'alert' }
    }
  }

  const verificationBadge = getVerificationBadge()

  const stats = {
    total: listings.length,
    live: listings.filter(l => l.auction && [AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(l.auction.status)).length,
    approved: listings.filter(l => l.status === LISTING_STATUS.APPROVED && !l.auction).length,
    pending: listings.filter(l => l.status === LISTING_STATUS.PENDING_REVIEW).length,
    draft: listings.filter(l => l.status === LISTING_STATUS.DRAFT).length,
  }

  // Format time remaining for display
  const formatTimeRemaining = (endTime) => {
    const remaining = getTimeRemaining(endTime)
    if (remaining.expired) return 'Ended'

    const { days, hours, minutes } = remaining
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <>
      <Head>
        <title>Seller Dashboard - REMMIC</title>
        <meta name="description" content="Manage your property listings on REMMIC" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="dashboard-main">
          <div className="dashboard-container">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="success-toast">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {registered ? 'Registration submitted! Your KYC is being reviewed.' : 'Listing submitted for review!'}
              </div>
            )}

            {/* Header */}
            <div className="dashboard-header">
              <div className="header-info">
                <h1>Seller Dashboard</h1>
                <p>Manage your property listings</p>
              </div>
              <div className="header-actions">
                <Link href="/seller/listing/new" className={`btn btn--primary ${sellerProfile.verificationStatus !== SELLER_STATUS.VERIFIED ? 'btn--disabled' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Listing
                </Link>
              </div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-info">
                <div className="profile-avatar">
                  {sellerProfile.fullName?.charAt(0) || 'S'}
                </div>
                <div className="profile-details">
                  <h2>{sellerProfile.fullName}</h2>
                  <p>{sellerProfile.businessName}</p>
                  <span className="verification-badge" style={{ color: verificationBadge.color }}>
                    {verificationBadge.icon === 'check' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {verificationBadge.icon === 'clock' && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                    {verificationBadge.label}
                  </span>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat__value">{stats.total}</span>
                  <span className="stat__label">Total</span>
                </div>
                <div className="stat stat--highlight">
                  <span className="stat__value">{stats.live}</span>
                  <span className="stat__label">Live Auctions</span>
                </div>
                <div className="stat">
                  <span className="stat__value">{stats.approved}</span>
                  <span className="stat__label">Ready</span>
                </div>
                <div className="stat">
                  <span className="stat__value">{stats.pending}</span>
                  <span className="stat__label">Pending</span>
                </div>
              </div>
            </div>

            {/* Verification Warning */}
            {sellerProfile.verificationStatus !== SELLER_STATUS.VERIFIED && (
              <div className="alert-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="alert-content">
                  <strong>
                    {sellerProfile.verificationStatus === SELLER_STATUS.PENDING
                      ? 'Verification in Progress'
                      : 'Complete Your Verification'}
                  </strong>
                  <p>
                    {sellerProfile.verificationStatus === SELLER_STATUS.PENDING
                      ? 'Your KYC documents are being reviewed. This usually takes 24-48 hours.'
                      : 'Complete your KYC verification to start listing properties.'}
                  </p>
                </div>
                {sellerProfile.verificationStatus !== SELLER_STATUS.PENDING && (
                  <Link href="/seller/register" className="alert-action">
                    Complete KYC
                  </Link>
                )}
              </div>
            )}

            {/* Listings */}
            <div className="listings-section">
              <div className="section-header">
                <h2>Your Listings</h2>
              </div>

              {listings.length === 0 ? (
                <div className="empty-listings">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <h3>No listings yet</h3>
                  <p>Create your first property listing to get started.</p>
                  {sellerProfile.verificationStatus === SELLER_STATUS.VERIFIED && (
                    <Link href="/seller/listing/new" className="btn btn--primary">
                      Create Listing
                    </Link>
                  )}
                </div>
              ) : (
                <div className="listings-grid">
                  {listings.map((listing) => {
                    // Determine status based on auction state
                    let displayStatus = listing.status
                    if (listing.auction) {
                      if (listing.auction.status === AUCTION_STATUS.ENDING_SOON) {
                        displayStatus = 'ending_soon'
                      } else if ([AUCTION_STATUS.LIVE].includes(listing.auction.status)) {
                        displayStatus = 'live'
                      } else if (listing.auction.status === AUCTION_STATUS.SOLD) {
                        displayStatus = 'sold'
                      }
                    }
                    const statusConfig = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.draft
                    const hasLiveAuction = listing.auction && [AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(listing.auction.status)

                    return (
                      <div key={listing.id} className={`listing-card ${hasLiveAuction ? 'listing-card--live' : ''}`}>
                        <div className="listing-image">
                          {listing.primaryPhoto ? (
                            <img
                              src={listing.primaryPhoto.url}
                              alt={listing.title}
                              onError={(e) => { e.target.src = '/house1.jpg' }}
                            />
                          ) : (
                            <div className="listing-image-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                          <span
                            className="listing-status"
                            style={{ background: statusConfig.bg, color: statusConfig.color }}
                          >
                            {statusConfig.label}
                          </span>
                          {hasLiveAuction && (
                            <span className="auction-timer">
                              {formatTimeRemaining(listing.auction.endTime)}
                            </span>
                          )}
                        </div>
                        <div className="listing-content">
                          <h3>{listing.title}</h3>
                          <p className="listing-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {listing.location}
                          </p>

                          {/* Show auction info if live */}
                          {hasLiveAuction ? (
                            <div className="auction-info">
                              <div className="auction-price">
                                <span className="price-label">Current Bid</span>
                                <span className="price-value">{formatAuctionPrice(listing.auction.currentPrice)}</span>
                              </div>
                              <div className="auction-meta">
                                <span>{listing.auction.bidCount} bids</span>
                              </div>
                            </div>
                          ) : (
                            <div className="listing-meta">
                              <span className="listing-price">PKR {formatPrice(listing.askingPrice)}</span>
                              <span className="listing-area">{listing.area} {listing.areaUnit}</span>
                            </div>
                          )}

                          <div className="listing-actions">
                            {listing.status === LISTING_STATUS.DRAFT && (
                              <Link href={`/seller/listing/${listing.id}/edit`} className="action-btn">
                                Edit
                              </Link>
                            )}
                            {listing.status === LISTING_STATUS.REVISION_REQUESTED && (
                              <>
                                <Link href={`/seller/listing/${listing.id}/edit`} className="action-btn">
                                  Update
                                </Link>
                                <span className="revision-note" title={listing.revisionFeedback}>
                                  See feedback
                                </span>
                              </>
                            )}
                            {listing.status === LISTING_STATUS.APPROVED && !listing.auction && (
                              <Link href={`/seller/auction/setup/${listing.id}`} className="action-btn action-btn--primary">
                                Launch Auction
                              </Link>
                            )}
                            {hasLiveAuction && (
                              <Link href={`/auction/${listing.auction.id}`} className="action-btn action-btn--primary">
                                View Auction
                              </Link>
                            )}
                            {listing.auction?.status === AUCTION_STATUS.SOLD && (
                              <span className="sold-badge">Sold for {formatAuctionPrice(listing.auction.finalPrice)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .dashboard-main {
          padding: 120px 5% 80px;
          min-height: calc(100vh - 200px);
          background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Success Toast */
        .success-toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 12px;
          color: #065f46;
          font-weight: 500;
          margin-bottom: 24px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-info h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 4px;
        }

        .header-info p {
          color: #6b7280;
          margin: 0;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 20px rgba(201,162,39,0.3);
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201,162,39,0.4);
        }

        .btn--disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        /* Profile Card */
        .profile-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border-radius: 20px;
          padding: 24px 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          margin-bottom: 24px;
        }

        .profile-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .profile-details h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0 0 4px;
        }

        .profile-details p {
          color: #6b7280;
          margin: 0 0 8px;
          font-size: 0.9375rem;
        }

        .verification-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .profile-stats {
          display: flex;
          gap: 32px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat__value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .stat__label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat--highlight .stat__value {
          color: #10b981;
        }

        /* Alert Banner */
        .alert-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 16px;
          margin-bottom: 32px;
        }

        .alert-banner > svg {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .alert-content {
          flex: 1;
        }

        .alert-content strong {
          display: block;
          color: #92400e;
          margin-bottom: 4px;
        }

        .alert-content p {
          margin: 0;
          color: #a16207;
          font-size: 0.875rem;
        }

        .alert-action {
          padding: 10px 20px;
          background: #f59e0b;
          color: #fff;
          border-radius: 10px;
          font-weight: 600;
          text-decoration: none;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .alert-action:hover {
          background: #d97706;
        }

        /* Listings Section */
        .listings-section {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
        }

        .section-header {
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0;
        }

        /* Empty Listings */
        .empty-listings {
          text-align: center;
          padding: 48px;
        }

        .empty-listings h3 {
          font-size: 1.125rem;
          color: #374151;
          margin: 16px 0 8px;
        }

        .empty-listings p {
          color: #6b7280;
          margin: 0 0 24px;
        }

        /* Listings Grid */
        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .listing-card {
          background: #f9fafb;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .listing-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.1);
        }

        .listing-card--live {
          border: 2px solid #10b981;
        }

        .listing-image {
          position: relative;
          aspect-ratio: 16/10;
          background: #e5e7eb;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .listing-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .listing-status {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .listing-content {
          padding: 20px;
        }

        .listing-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0 0 8px;
          line-height: 1.4;
        }

        .listing-location {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 12px;
        }

        .listing-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          margin-bottom: 12px;
        }

        .listing-price {
          font-size: 1rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .listing-area {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .listing-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-btn {
          padding: 8px 16px;
          background: #f3f4f6;
          color: #374151;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
        }

        .action-btn:hover {
          background: #e5e7eb;
        }

        .action-btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
        }

        .revision-note {
          font-size: 0.75rem;
          color: #f97316;
          cursor: help;
          text-decoration: underline;
          text-decoration-style: dotted;
        }

        /* Auction Elements */
        .auction-timer {
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .auction-info {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .auction-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .auction-price .price-label {
          font-size: 0.75rem;
          color: #059669;
          font-weight: 600;
        }

        .auction-price .price-value {
          font-size: 1rem;
          font-weight: 700;
          color: #047857;
        }

        .auction-meta {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .sold-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(239, 68, 68, 0.95);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .action-btn--success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .action-btn--success:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        @media (max-width: 900px) {
          .profile-card {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }

          .profile-info {
            flex-direction: column;
          }

          .profile-stats {
            width: 100%;
            justify-content: space-around;
          }
        }

        @media (max-width: 767px) {
          .dashboard-main {
            padding: 100px 5% 60px;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .alert-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}
