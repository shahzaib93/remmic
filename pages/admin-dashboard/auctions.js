import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '../../components/AdminLayout'
import { useAdmin } from '../../contexts/AdminContext'
import { useFirebase } from '../../contexts/FirebaseContext'

// Format currency
const formatCurrency = (value) => {
  const num = Number(value || 0)
  if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(1)}Cr`
  if (num >= 100000) return `PKR ${(num / 100000).toFixed(1)}L`
  return `PKR ${num.toLocaleString()}`
}

// Calculate countdown
const getCountdown = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end - now

  if (diff <= 0) return { expired: true, text: 'Ended' }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (days > 0) return { expired: false, text: `${days}d ${hours}h` }
  if (hours > 0) return { expired: false, text: `${hours}h ${minutes}m` }
  return { expired: false, text: `${minutes}m ${seconds}s`, urgent: true }
}

// Get auction status
const getAuctionStatus = (auction) => {
  const now = new Date()
  const start = auction.bidding?.startDateTime ? new Date(auction.bidding.startDateTime) : null
  const end = auction.bidding?.endDateTime ? new Date(auction.bidding.endDateTime) : null

  if (auction.auctionStatus === 'paused') return 'paused'
  if (auction.auctionStatus === 'cancelled') return 'cancelled'
  if (auction.auctionStatus === 'sold') return 'sold'
  if (auction.auctionStatus === 'unsold') return 'unsold'

  if (!start || !end) return 'draft'
  if (now < start) return 'scheduled'
  if (now > end) return 'ended'

  // Check if ending soon (within 2 hours)
  const twoHours = 2 * 60 * 60 * 1000
  if (end - now <= twoHours) return 'ending-soon'

  return 'live'
}

export default function AdminAuctions() {
  const router = useRouter()
  const { logAuditAction } = useAdmin()
  const { getAllProperties, updatePropertyStatus } = useFirebase()

  const [loading, setLoading] = useState(true)
  const [auctions, setAuctions] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [showModal, setShowModal] = useState(null) // 'pause', 'end', 'mark'
  const [modalReason, setModalReason] = useState('')
  const [notification, setNotification] = useState(null)

  // Live countdown update
  const [, setTick] = useState(0)

  useEffect(() => {
    loadAuctions()
  }, [])

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const loadAuctions = async () => {
    setLoading(true)
    try {
      let properties = []

      // Load from Firebase
      if (getAllProperties) {
        const result = await getAllProperties()
        if (result?.success) {
          properties = result.properties || []
        }
      }

      // Load from localStorage
      const localProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const allProperties = [...properties, ...localProperties]

      // Filter bidding/auction properties
      const auctionProperties = allProperties.filter(p =>
        (p.type === 'bidding' || p.listingType === 'bidding') &&
        p.status === 'approved'
      )

      // Load bids for each auction
      const bids = JSON.parse(localStorage.getItem('propertyBids') || '{}')

      // Enhance auction data
      const enhancedAuctions = auctionProperties.map(auction => {
        const auctionBids = bids[auction.id] || bids[auction.propertyId] || []
        const sortedBids = [...auctionBids].sort((a, b) => Number(b.amount) - Number(a.amount))
        const highestBid = sortedBids[0]?.amount || auction.bidding?.minBidAmount || 0

        return {
          ...auction,
          bids: auctionBids,
          totalBids: auctionBids.length,
          highestBid,
          uniqueBidders: new Set(auctionBids.map(b => b.userId)).size,
          status: getAuctionStatus(auction),
        }
      })

      setAuctions(enhancedAuctions)
    } catch (error) {
      console.error('Failed to load auctions:', error)
      showNotification('Failed to load auctions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePauseAuction = async () => {
    if (!selectedAuction) return
    setActionLoading(selectedAuction.id)

    try {
      // Update auction status
      const updated = { ...selectedAuction, auctionStatus: 'paused', pauseReason: modalReason }

      // Update in localStorage
      const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const updatedProps = localProps.map(p =>
        (p.id === selectedAuction.id || p.propertyId === selectedAuction.id) ? updated : p
      )
      localStorage.setItem('userProperties', JSON.stringify(updatedProps))

      // Log audit action
      logAuditAction({
        module: 'auctions',
        action: 'pause_auction',
        entity: selectedAuction.title || selectedAuction.id,
        notes: modalReason || 'Auction paused by admin',
      })

      showNotification('Auction paused successfully')
      setShowModal(null)
      setSelectedAuction(null)
      setModalReason('')
      loadAuctions()
    } catch (error) {
      console.error('Failed to pause auction:', error)
      showNotification('Failed to pause auction', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResumeAuction = async (auction) => {
    setActionLoading(auction.id)

    try {
      const updated = { ...auction, auctionStatus: null, pauseReason: null }

      const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const updatedProps = localProps.map(p =>
        (p.id === auction.id || p.propertyId === auction.id) ? updated : p
      )
      localStorage.setItem('userProperties', JSON.stringify(updatedProps))

      logAuditAction({
        module: 'auctions',
        action: 'resume_auction',
        entity: auction.title || auction.id,
        notes: 'Auction resumed by admin',
      })

      showNotification('Auction resumed successfully')
      loadAuctions()
    } catch (error) {
      console.error('Failed to resume auction:', error)
      showNotification('Failed to resume auction', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEndAuction = async () => {
    if (!selectedAuction) return
    setActionLoading(selectedAuction.id)

    try {
      const updated = { ...selectedAuction, auctionStatus: 'ended', endReason: modalReason }

      const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const updatedProps = localProps.map(p =>
        (p.id === selectedAuction.id || p.propertyId === selectedAuction.id) ? updated : p
      )
      localStorage.setItem('userProperties', JSON.stringify(updatedProps))

      logAuditAction({
        module: 'auctions',
        action: 'end_auction',
        entity: selectedAuction.title || selectedAuction.id,
        notes: modalReason || 'Auction ended by admin',
      })

      showNotification('Auction ended successfully')
      setShowModal(null)
      setSelectedAuction(null)
      setModalReason('')
      loadAuctions()
    } catch (error) {
      console.error('Failed to end auction:', error)
      showNotification('Failed to end auction', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkResult = async (result) => {
    if (!selectedAuction) return
    setActionLoading(selectedAuction.id)

    try {
      const updated = { ...selectedAuction, auctionStatus: result }

      const localProps = JSON.parse(localStorage.getItem('userProperties') || '[]')
      const updatedProps = localProps.map(p =>
        (p.id === selectedAuction.id || p.propertyId === selectedAuction.id) ? updated : p
      )
      localStorage.setItem('userProperties', JSON.stringify(updatedProps))

      logAuditAction({
        module: 'auctions',
        action: `mark_${result}`,
        entity: selectedAuction.title || selectedAuction.id,
        notes: `Auction marked as ${result} by admin`,
      })

      showNotification(`Auction marked as ${result}`)
      setShowModal(null)
      setSelectedAuction(null)
      loadAuctions()
    } catch (error) {
      console.error('Failed to mark auction:', error)
      showNotification('Failed to update auction', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // Filter auctions
  const filteredAuctions = auctions.filter(auction => {
    // Tab filter
    let matchesTab = true
    if (activeTab === 'scheduled') matchesTab = auction.status === 'scheduled'
    else if (activeTab === 'live') matchesTab = auction.status === 'live' || auction.status === 'ending-soon'
    else if (activeTab === 'ending-soon') matchesTab = auction.status === 'ending-soon'
    else if (activeTab === 'ended') matchesTab = ['ended', 'sold', 'unsold', 'cancelled'].includes(auction.status)
    else if (activeTab === 'paused') matchesTab = auction.status === 'paused'

    // Search filter
    let matchesSearch = true
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      matchesSearch =
        (auction.title || '').toLowerCase().includes(query) ||
        (auction.location || '').toLowerCase().includes(query) ||
        (auction.id || '').toLowerCase().includes(query)
    }

    return matchesTab && matchesSearch
  })

  // Stats
  const stats = {
    total: auctions.length,
    scheduled: auctions.filter(a => a.status === 'scheduled').length,
    live: auctions.filter(a => a.status === 'live' || a.status === 'ending-soon').length,
    endingSoon: auctions.filter(a => a.status === 'ending-soon').length,
    ended: auctions.filter(a => ['ended', 'sold', 'unsold'].includes(a.status)).length,
    paused: auctions.filter(a => a.status === 'paused').length,
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'scheduled': { label: 'Scheduled', color: 'blue' },
      'live': { label: 'Live', color: 'green' },
      'ending-soon': { label: 'Ending Soon', color: 'orange' },
      'ended': { label: 'Ended', color: 'gray' },
      'paused': { label: 'Paused', color: 'gold' },
      'sold': { label: 'Sold', color: 'green' },
      'unsold': { label: 'Unsold', color: 'red' },
      'cancelled': { label: 'Cancelled', color: 'red' },
      'draft': { label: 'Draft', color: 'gray' },
    }

    const config = statusConfig[status] || { label: status, color: 'gray' }
    return (
      <span className={`status-badge status-badge--${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getImage = (auction) => {
    if (auction.image) return auction.image
    if (Array.isArray(auction.images) && auction.images.length > 0) {
      const img = auction.images[0]
      return typeof img === 'string' ? img : (img?.url || img?.dataUrl)
    }
    return '/images/property-placeholder.svg'
  }

  return (
    <AdminLayout title="Auctions">
      <div className="auctions-page">
        {/* Notification */}
        {notification && (
          <div className={`notification notification--${notification.type}`}>
            {notification.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            )}
            {notification.message}
          </div>
        )}

        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <h1>Auction Monitoring</h1>
            <p>Monitor and control all property auctions</p>
          </div>
          <button className="btn-refresh" onClick={loadAuctions}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </header>

        {/* Stats Cards */}
        <section className="stats-grid">
          <div className={`stat-card ${activeTab === 'all' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('all')}>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Auctions</span>
          </div>
          <div className={`stat-card ${activeTab === 'scheduled' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('scheduled')}>
            <span className="stat-value">{stats.scheduled}</span>
            <span className="stat-label">Scheduled</span>
          </div>
          <div className={`stat-card stat-card--live ${activeTab === 'live' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('live')}>
            <span className="stat-value">{stats.live}</span>
            <span className="stat-label">Live</span>
            {stats.live > 0 && <span className="live-indicator" />}
          </div>
          <div className={`stat-card stat-card--urgent ${activeTab === 'ending-soon' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('ending-soon')}>
            <span className="stat-value">{stats.endingSoon}</span>
            <span className="stat-label">Ending Soon</span>
          </div>
          <div className={`stat-card ${activeTab === 'ended' ? 'stat-card--active' : ''}`} onClick={() => setActiveTab('ended')}>
            <span className="stat-value">{stats.ended}</span>
            <span className="stat-label">Ended</span>
          </div>
        </section>

        {/* Search & Tabs */}
        <section className="filter-section">
          <div className="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>

          <div className="tabs">
            {[
              { id: 'all', label: 'All' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'live', label: 'Live' },
              { id: 'ending-soon', label: 'Ending Soon' },
              { id: 'ended', label: 'Ended' },
              { id: 'paused', label: 'Paused' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Auctions Grid */}
        <section className="auctions-grid">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading auctions...</span>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17.66 8L12 2.35 6.34 8a8.02 8.02 0 000 11.31c1.56 1.56 3.61 2.34 5.66 2.34s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31z"/>
              </svg>
              <h3>No Auctions Found</h3>
              <p>{searchQuery ? 'Try different search terms' : 'No auctions match the current filter'}</p>
            </div>
          ) : (
            filteredAuctions.map(auction => {
              const countdown = auction.bidding?.endDateTime ? getCountdown(auction.bidding.endDateTime) : null
              const isLoading = actionLoading === auction.id

              return (
                <article key={auction.id || auction.propertyId} className="auction-card">
                  <div className="auction-card__image">
                    <img src={getImage(auction)} alt={auction.title || 'Auction'} />
                    {getStatusBadge(auction.status)}
                    {countdown && !countdown.expired && (
                      <div className={`countdown ${countdown.urgent ? 'countdown--urgent' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                        </svg>
                        {countdown.text}
                      </div>
                    )}
                  </div>

                  <div className="auction-card__body">
                    <h3>{auction.title || 'Untitled Auction'}</h3>
                    <p className="location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                      </svg>
                      {auction.location || 'Location not specified'}
                    </p>

                    <div className="auction-stats">
                      <div className="auction-stat">
                        <span className="stat-label">Highest Bid</span>
                        <span className="stat-value stat-value--highlight">{formatCurrency(auction.highestBid)}</span>
                      </div>
                      <div className="auction-stat">
                        <span className="stat-label">Total Bids</span>
                        <span className="stat-value">{auction.totalBids}</span>
                      </div>
                      <div className="auction-stat">
                        <span className="stat-label">Bidders</span>
                        <span className="stat-value">{auction.uniqueBidders}</span>
                      </div>
                    </div>

                    <div className="auction-meta">
                      <span>Start: {auction.bidding?.startDateTime ? new Date(auction.bidding.startDateTime).toLocaleDateString() : 'N/A'}</span>
                      <span>End: {auction.bidding?.endDateTime ? new Date(auction.bidding.endDateTime).toLocaleDateString() : 'N/A'}</span>
                    </div>

                    {/* Admin Controls */}
                    <div className="admin-controls">
                      {auction.status === 'paused' ? (
                        <button
                          className="control-btn control-btn--resume"
                          onClick={() => handleResumeAuction(auction)}
                          disabled={isLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          Resume
                        </button>
                      ) : (auction.status === 'live' || auction.status === 'ending-soon') && (
                        <>
                          <button
                            className="control-btn control-btn--pause"
                            onClick={() => { setSelectedAuction(auction); setShowModal('pause'); }}
                            disabled={isLoading}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                            Pause
                          </button>
                          <button
                            className="control-btn control-btn--end"
                            onClick={() => { setSelectedAuction(auction); setShowModal('end'); }}
                            disabled={isLoading}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                            End
                          </button>
                        </>
                      )}

                      {(auction.status === 'ended' || (countdown && countdown.expired)) && (
                        <button
                          className="control-btn control-btn--mark"
                          onClick={() => { setSelectedAuction(auction); setShowModal('mark'); }}
                          disabled={isLoading}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          Mark Result
                        </button>
                      )}

                      <Link href={`/auction/${auction.id || auction.propertyId}`} className="control-btn control-btn--view">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </section>

        {/* Phase-1 Notice */}
        <div className="phase-notice">
          <strong>Phase-1 Controls:</strong>
          <span>Manual auction management only. No automated payment processing or escrow.</span>
        </div>
      </div>

      {/* Pause Modal */}
      {showModal === 'pause' && (
        <div className="modal-overlay" onClick={() => { setShowModal(null); setModalReason(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Pause Auction</h3>
            <p>Are you sure you want to pause this auction? Bidding will be suspended.</p>
            <div className="modal-field">
              <label>Reason (optional)</label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Enter reason for pausing..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={() => { setShowModal(null); setModalReason(''); }}>
                Cancel
              </button>
              <button className="modal-btn modal-btn--confirm" onClick={handlePauseAuction} disabled={actionLoading}>
                {actionLoading ? 'Pausing...' : 'Pause Auction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Modal */}
      {showModal === 'end' && (
        <div className="modal-overlay" onClick={() => { setShowModal(null); setModalReason(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>End Auction</h3>
            <p>This will permanently end the auction. This action cannot be undone.</p>
            <div className="modal-field">
              <label>Reason for ending</label>
              <textarea
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Enter reason for ending..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn--cancel" onClick={() => { setShowModal(null); setModalReason(''); }}>
                Cancel
              </button>
              <button className="modal-btn modal-btn--danger" onClick={handleEndAuction} disabled={actionLoading}>
                {actionLoading ? 'Ending...' : 'End Auction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Result Modal */}
      {showModal === 'mark' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Mark Auction Result</h3>
            <p>Select the final outcome for this auction:</p>
            <div className="result-options">
              <button
                className="result-btn result-btn--sold"
                onClick={() => handleMarkResult('sold')}
                disabled={actionLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Mark as Sold
              </button>
              <button
                className="result-btn result-btn--unsold"
                onClick={() => handleMarkResult('unsold')}
                disabled={actionLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Mark as Unsold
              </button>
            </div>
            <button className="modal-btn modal-btn--cancel" onClick={() => setShowModal(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .auctions-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Notification */
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 14px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .notification--success {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .notification--error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Page Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content h1 {
          margin: 0;
          font-family: var(--font-playfair), 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fff;
        }

        .header-content p {
          margin: 4px 0 0;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 10px;
          color: #c9a227;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover {
          background: rgba(201, 162, 39, 0.15);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .stat-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .stat-card--active {
          border-color: rgba(201, 162, 39, 0.4);
          background: rgba(201, 162, 39, 0.08);
        }

        .stat-card--live .stat-value {
          color: #22c55e;
        }

        .stat-card--urgent .stat-value {
          color: #f97316;
        }

        .stat-card .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-card .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .live-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Filter Section */
        .filter-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 200px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .search-box svg {
          color: #6b7280;
          flex-shrink: 0;
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
        }

        .search-box input::placeholder {
          color: #6b7280;
        }

        .clear-btn {
          padding: 4px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .clear-btn:hover {
          color: #9ca3af;
        }

        .tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .tab {
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #9ca3af;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .tab:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .tab--active {
          background: rgba(201, 162, 39, 0.15);
          border-color: rgba(201, 162, 39, 0.3);
          color: #c9a227;
        }

        /* Auctions Grid */
        .auctions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(201, 162, 39, 0.2);
          border-top-color: #c9a227;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state svg {
          color: #4b5563;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 1.1rem;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        /* Auction Card */
        .auction-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .auction-card:hover {
          border-color: rgba(201, 162, 39, 0.2);
          transform: translateY(-2px);
        }

        .auction-card__image {
          position: relative;
          height: 160px;
          overflow: hidden;
        }

        .auction-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .status-badge--blue {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .status-badge--green {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .status-badge--orange {
          background: rgba(249, 115, 22, 0.2);
          color: #f97316;
        }

        .status-badge--gold {
          background: rgba(201, 162, 39, 0.2);
          color: #c9a227;
        }

        .status-badge--red {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .status-badge--gray {
          background: rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }

        .countdown {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 6px;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .countdown--urgent {
          background: rgba(239, 68, 68, 0.9);
          animation: urgentPulse 1s infinite;
        }

        @keyframes urgentPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .auction-card__body {
          padding: 18px;
        }

        .auction-card__body h3 {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 0 14px;
          color: #9ca3af;
          font-size: 0.8rem;
        }

        .auction-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .auction-stat {
          text-align: center;
        }

        .auction-stat .stat-label {
          display: block;
          font-size: 0.65rem;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .auction-stat .stat-value {
          display: block;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
        }

        .auction-stat .stat-value--highlight {
          color: #c9a227;
        }

        .auction-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
          font-size: 0.75rem;
          color: #6b7280;
        }

        /* Admin Controls */
        .admin-controls {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          text-decoration: none;
        }

        .control-btn--pause {
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .control-btn--pause:hover {
          background: rgba(201, 162, 39, 0.25);
        }

        .control-btn--resume {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .control-btn--resume:hover {
          background: rgba(34, 197, 94, 0.25);
        }

        .control-btn--end {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .control-btn--end:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .control-btn--mark {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .control-btn--mark:hover {
          background: rgba(59, 130, 246, 0.25);
        }

        .control-btn--view {
          background: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
          margin-left: auto;
        }

        .control-btn--view:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        /* Phase Notice */
        .phase-notice {
          padding: 14px 18px;
          background: rgba(74, 55, 40, 0.15);
          border: 1px solid rgba(74, 55, 40, 0.3);
          border-radius: 10px;
          font-size: 0.85rem;
          color: #a18072;
        }

        .phase-notice strong {
          color: #d4c4bc;
          margin-right: 8px;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: #141414;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
        }

        .modal h3 {
          margin: 0 0 8px;
          font-size: 1.1rem;
          color: #fff;
        }

        .modal p {
          margin: 0 0 20px;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .modal-field {
          margin-bottom: 20px;
        }

        .modal-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .modal-field textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #fff;
          font-size: 0.9rem;
          resize: vertical;
          outline: none;
        }

        .modal-field textarea:focus {
          border-color: rgba(201, 162, 39, 0.4);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .modal-btn {
          flex: 1;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .modal-btn--cancel {
          background: rgba(255, 255, 255, 0.05);
          color: #9ca3af;
        }

        .modal-btn--cancel:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-btn--confirm {
          background: rgba(201, 162, 39, 0.2);
          color: #c9a227;
        }

        .modal-btn--confirm:hover {
          background: rgba(201, 162, 39, 0.3);
        }

        .modal-btn--danger {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .modal-btn--danger:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .result-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .result-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .result-btn--sold {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .result-btn--sold:hover {
          background: rgba(34, 197, 94, 0.25);
        }

        .result-btn--unsold {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .result-btn--unsold:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        /* Responsive */
        @media (max-width: 640px) {
          .auctions-grid {
            grid-template-columns: 1fr;
          }

          .filter-section {
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .tabs {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </AdminLayout>
  )
}
