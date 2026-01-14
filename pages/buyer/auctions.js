/**
 * Buyer Auctions Dashboard
 * Phase 2B: Auction Engine & Live Bidding
 *
 * Shows:
 * - Active bids (auctions user is participating in)
 * - Won auctions
 * - Lost auctions
 * - Watchlist
 */

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFirebase } from '../../contexts/FirebaseContext'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import {
  getUserActiveAuctions,
  getUserWatchlist,
  getUserNotifications,
  markNotificationRead,
  getTimeRemaining,
  formatPrice,
  AUCTION_STATUS,
  seedAuctionDemoData,
  hasAuctionDemoData,
} from '../../lib/step2-auction-engine'
import { getListing } from '../../lib/step2-auction-service'

export default function BuyerAuctionsDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useFirebase()

  const [activeTab, setActiveTab] = useState('active')
  const [auctions, setAuctions] = useState({ active: [], won: [], lost: [] })
  const [watchlist, setWatchlist] = useState([])
  const [notifications, setNotifications] = useState([])
  const [listings, setListings] = useState({})
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=' + encodeURIComponent(router.asPath))
    }
  }, [user, authLoading, router])

  // Load data
  const loadData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Seed demo data if needed
      if (!hasAuctionDemoData()) {
        await seedAuctionDemoData()
      }

      // Get user's auctions
      const auctionsResult = await getUserActiveAuctions(user.uid)
      if (auctionsResult.success) {
        setAuctions(auctionsResult.auctions)

        // Load listings for each auction
        const allAuctions = [
          ...auctionsResult.auctions.active,
          ...auctionsResult.auctions.won,
          ...auctionsResult.auctions.lost,
        ]
        const listingPromises = allAuctions.map(a => getListing(a.listingId))
        const listingResults = await Promise.all(listingPromises)

        const listingsMap = {}
        listingResults.forEach((result, idx) => {
          if (result.success) {
            listingsMap[allAuctions[idx].listingId] = result.listing
          }
        })
        setListings(listingsMap)
      }

      // Get watchlist
      const watchResult = await getUserWatchlist(user.uid)
      if (watchResult.success) {
        setWatchlist(watchResult.watchlist)
      }

      // Get notifications
      const notifResult = await getUserNotifications(user.uid)
      if (notifResult.success) {
        setNotifications(notifResult.notifications)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error loading data:', err)
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh data
  useEffect(() => {
    if (!user) return

    const interval = setInterval(loadData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [user, loadData])

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id)
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    }
    if (notification.auctionId) {
      router.push(`/auction/${notification.auctionId}`)
    }
  }

  // Format time remaining
  const formatTimeRemaining = (endTime) => {
    const remaining = getTimeRemaining(endTime)
    if (remaining.expired) return 'Ended'

    const { days, hours, minutes } = remaining
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.read).length

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading your auctions...</p>
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
          .spinner {
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

  return (
    <>
      <Head>
        <title>My Auctions | REMMIC</title>
      </Head>

      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-content">
              <h1>My Auctions</h1>
              <p>Track your bids and auction activity</p>
            </div>
            <Link href="/auctions" className="btn-browse">
              Browse Auctions
            </Link>
          </header>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{auctions.active.length}</span>
              <span className="stat-label">Active Bids</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{auctions.won.length}</span>
              <span className="stat-label">Won</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{auctions.lost.length}</span>
              <span className="stat-label">Lost</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{watchlist.length}</span>
              <span className="stat-label">Watching</span>
            </div>
          </div>

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-section">
              <div className="section-header">
                <h2>
                  Notifications
                  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </h2>
              </div>
              <div className="notifications-list">
                {notifications.slice(0, 5).map(notif => (
                  <button
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notif-icon">
                      {notif.type === 'outbid' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <path d="M12 9v4M12 17h.01" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                      {notif.type === 'winning' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <path d="M22 4L12 14.01l-3-3" />
                        </svg>
                      )}
                      {notif.type === 'sold' && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      )}
                    </div>
                    <div className="notif-content">
                      <span className="notif-text">
                        {notif.type === 'outbid' && `You've been outbid! New price: ${formatPrice(notif.data?.newPrice)}`}
                        {notif.type === 'winning' && 'You are currently the highest bidder!'}
                        {notif.type === 'sold' && 'Congratulations! You won this auction.'}
                        {notif.type === 'auction_ended' && 'This auction has ended.'}
                      </span>
                      <span className="notif-time">
                        {new Date(notif.createdAt).toLocaleDateString('en-PK', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active Bids ({auctions.active.length})
              </button>
              <button
                className={`tab ${activeTab === 'won' ? 'active' : ''}`}
                onClick={() => setActiveTab('won')}
              >
                Won ({auctions.won.length})
              </button>
              <button
                className={`tab ${activeTab === 'lost' ? 'active' : ''}`}
                onClick={() => setActiveTab('lost')}
              >
                Lost ({auctions.lost.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'active' && (
              <>
                {auctions.active.length === 0 ? (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <h3>No Active Bids</h3>
                    <p>You haven't placed any bids yet.</p>
                    <Link href="/auctions" className="btn-action">
                      Browse Auctions
                    </Link>
                  </div>
                ) : (
                  <div className="auction-grid">
                    {auctions.active.map(auction => {
                      const listing = listings[auction.listingId] || {}
                      const primaryMedia = listing.media?.find(m => m.isPrimary) || listing.media?.[0]
                      const remaining = getTimeRemaining(auction.endTime)

                      return (
                        <Link
                          key={auction.id}
                          href={`/auction/${auction.id}`}
                          className={`auction-card ${auction.isHighestBidder ? 'winning' : 'outbid'}`}
                        >
                          <div className="card-image">
                            <img
                              src={primaryMedia?.url || '/house1.jpg'}
                              alt={listing.title}
                              onError={(e) => { e.target.src = '/house1.jpg' }}
                            />
                            <span className={`status-badge ${auction.isHighestBidder ? 'badge-winning' : 'badge-outbid'}`}>
                              {auction.isHighestBidder ? 'Winning' : 'Outbid'}
                            </span>
                            {remaining.total < 3600000 && !remaining.expired && (
                              <span className="time-badge urgent">
                                {formatTimeRemaining(auction.endTime)}
                              </span>
                            )}
                          </div>
                          <div className="card-content">
                            <h3>{listing.title || 'Property'}</h3>
                            <p className="location">{listing.location}, {listing.city}</p>
                            <div className="price-row">
                              <div className="current-price">
                                <span className="label">Current Bid</span>
                                <span className="value">{formatPrice(auction.currentPrice)}</span>
                              </div>
                              <div className="time-left">
                                <span className="label">Time Left</span>
                                <span className="value">{formatTimeRemaining(auction.endTime)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'won' && (
              <>
                {auctions.won.length === 0 ? (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                    <h3>No Won Auctions</h3>
                    <p>You haven't won any auctions yet.</p>
                  </div>
                ) : (
                  <div className="auction-grid">
                    {auctions.won.map(auction => {
                      const listing = listings[auction.listingId] || {}
                      const primaryMedia = listing.media?.find(m => m.isPrimary) || listing.media?.[0]

                      return (
                        <Link
                          key={auction.id}
                          href={`/auction/${auction.id}`}
                          className="auction-card won"
                        >
                          <div className="card-image">
                            <img
                              src={primaryMedia?.url || '/house1.jpg'}
                              alt={listing.title}
                              onError={(e) => { e.target.src = '/house1.jpg' }}
                            />
                            <span className="status-badge badge-won">Won</span>
                          </div>
                          <div className="card-content">
                            <h3>{listing.title || 'Property'}</h3>
                            <p className="location">{listing.location}, {listing.city}</p>
                            <div className="price-row">
                              <div className="final-price">
                                <span className="label">Final Price</span>
                                <span className="value">{formatPrice(auction.finalPrice)}</span>
                              </div>
                              <div className="won-date">
                                <span className="label">Won On</span>
                                <span className="value">
                                  {new Date(auction.endedAt).toLocaleDateString('en-PK', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'lost' && (
              <>
                {auctions.lost.length === 0 ? (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                    <h3>No Lost Auctions</h3>
                    <p>You haven't lost any auctions.</p>
                  </div>
                ) : (
                  <div className="auction-grid">
                    {auctions.lost.map(auction => {
                      const listing = listings[auction.listingId] || {}
                      const primaryMedia = listing.media?.find(m => m.isPrimary) || listing.media?.[0]

                      return (
                        <Link
                          key={auction.id}
                          href={`/auction/${auction.id}`}
                          className="auction-card lost"
                        >
                          <div className="card-image">
                            <img
                              src={primaryMedia?.url || '/house1.jpg'}
                              alt={listing.title}
                              onError={(e) => { e.target.src = '/house1.jpg' }}
                            />
                            <span className="status-badge badge-lost">
                              {auction.status === AUCTION_STATUS.UNSOLD ? 'Unsold' : 'Sold'}
                            </span>
                          </div>
                          <div className="card-content">
                            <h3>{listing.title || 'Property'}</h3>
                            <p className="location">{listing.location}, {listing.city}</p>
                            <div className="price-row">
                              <div className="final-price">
                                <span className="label">Final Price</span>
                                <span className="value">{formatPrice(auction.finalPrice || auction.currentPrice)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: #f9fafb;
          padding: 1rem;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .header-content h1 {
          margin: 0 0 0.25rem;
          font-size: 1.75rem;
          color: #111827;
        }

        .header-content p {
          margin: 0;
          color: #6b7280;
        }

        .btn-browse {
          padding: 0.75rem 1.5rem;
          background: #c9a227;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
        }

        .btn-browse:hover {
          background: #b8941f;
        }

        /* Stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Notifications */
        .notifications-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          margin: 0;
          font-size: 1.125rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f9fafb;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: #f3f4f6;
        }

        .notification-item.unread {
          background: #fffbeb;
        }

        .notif-icon {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .notif-content {
          flex: 1;
        }

        .notif-text {
          display: block;
          font-size: 0.875rem;
          color: #111827;
        }

        .notif-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        /* Tabs */
        .tabs-container {
          background: white;
          border-radius: 12px 12px 0 0;
          padding: 1rem 1rem 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: -1px;
        }

        .tab:hover {
          color: #111827;
        }

        .tab.active {
          color: #c9a227;
          border-bottom-color: #c9a227;
        }

        .tab-content {
          background: white;
          border-radius: 0 0 12px 12px;
          padding: 1.5rem;
          min-height: 300px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .empty-state h3 {
          margin: 1rem 0 0.25rem;
          color: #374151;
        }

        .empty-state p {
          margin: 0 0 1.5rem;
          color: #6b7280;
        }

        .btn-action {
          padding: 0.75rem 1.5rem;
          background: #c9a227;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
        }

        /* Auction Grid */
        .auction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .auction-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .auction-card:hover {
          border-color: #c9a227;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .auction-card.winning {
          border-color: #22c55e;
        }

        .auction-card.outbid {
          border-color: #f59e0b;
        }

        .auction-card.won {
          border-color: #3b82f6;
        }

        .auction-card.lost {
          border-color: #e5e7eb;
          opacity: 0.8;
        }

        .card-image {
          position: relative;
          aspect-ratio: 16/10;
          background: #f3f4f6;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge-winning {
          background: #dcfce7;
          color: #166534;
        }

        .badge-outbid {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-won {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-lost {
          background: #f3f4f6;
          color: #6b7280;
        }

        .time-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.375rem 0.75rem;
          background: rgba(0,0,0,0.7);
          color: white;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .time-badge.urgent {
          background: #ef4444;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .card-content {
          padding: 1rem;
        }

        .card-content h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .location {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding-top: 0.75rem;
          border-top: 1px solid #f3f4f6;
        }

        .current-price, .final-price, .time-left, .won-date {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .price-row .label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .price-row .value {
          font-weight: 600;
          color: #111827;
        }

        .current-price .value {
          color: #c9a227;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-browse {
            width: 100%;
            text-align: center;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .tabs {
            overflow-x: auto;
          }

          .tab {
            white-space: nowrap;
          }

          .auction-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
