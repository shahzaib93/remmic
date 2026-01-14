/**
 * Public Auctions Page
 *
 * Step 2 Phase 2B: Browse live property auctions
 * Route: /auctions
 *
 * Shows live auctions with real-time countdowns and bid info
 */

import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FooterCTA from '../components/FooterCTA'
import { getApprovedListings, seedDemoData } from '../lib/step2-auction-service'
import {
  getLiveAuctions,
  getTimeRemaining,
  formatPrice as formatAuctionPrice,
  seedAuctionDemoData,
  hasAuctionDemoData,
  AUCTION_STATUS,
} from '../lib/step2-auction-engine'

const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Residential Plot' },
  { value: 'commercial_plot', label: 'Commercial Plot' },
  { value: 'commercial', label: 'Commercial Building' },
  { value: 'farmhouse', label: 'Farm House' },
]

const CITIES = [
  { value: '', label: 'All Cities' },
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Multan', label: 'Multan' },
]

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: '0-5000000', label: 'Under 50 Lac' },
  { value: '5000000-10000000', label: '50 Lac - 1 Cr' },
  { value: '10000000-50000000', label: '1 Cr - 5 Cr' },
  { value: '50000000-100000000', label: '5 Cr - 10 Cr' },
  { value: '100000000+', label: 'Above 10 Cr' },
]

export default function Auctions() {
  const [listings, setListings] = useState([])
  const [liveAuctions, setLiveAuctions] = useState([])
  const [combinedData, setCombinedData] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [seeded, setSeeded] = useState(false)
  const [activeTab, setActiveTab] = useState('live') // 'live' or 'upcoming'

  // Filters
  const [filters, setFilters] = useState({
    propertyType: '',
    city: '',
    priceRange: '',
    search: '',
  })

  // Load listings and auctions
  const loadData = useCallback(async () => {
    setIsLoading(true)

    // Auto-seed demo data if no listings exist
    let result = await getApprovedListings()

    if (!result.success || result.listings.length === 0) {
      // Seed listing demo data
      await seedDemoData()
      setSeeded(true)
      result = await getApprovedListings()
    }

    // Seed auction demo data if needed
    if (!hasAuctionDemoData()) {
      await seedAuctionDemoData()
    }

    // Get live auctions
    const auctionsResult = await getLiveAuctions()

    if (result.success) {
      setListings(result.listings)

      // Combine listings with auction data
      const auctionMap = {}
      if (auctionsResult.success) {
        auctionsResult.auctions.forEach(auction => {
          auctionMap[auction.listingId] = auction
        })
        setLiveAuctions(auctionsResult.auctions)
      }

      // Merge listing data with auction data
      const combined = result.listings.map(listing => ({
        ...listing,
        auction: auctionMap[listing.id] || null,
        hasLiveAuction: !!auctionMap[listing.id],
      }))

      setCombinedData(combined)
      setFilteredListings(combined)
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [loadData])

  // Apply filters
  useEffect(() => {
    let filtered = [...combinedData]

    // Tab filter (live vs upcoming)
    if (activeTab === 'live') {
      filtered = filtered.filter(l => l.hasLiveAuction)
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(l => l.propertyType === filters.propertyType)
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(l => l.city === filters.city)
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(v => v.replace('+', ''))
      filtered = filtered.filter(l => {
        const price = l.auction?.currentPrice || l.askingPrice
        if (max) {
          return price >= parseInt(min) && price <= parseInt(max)
        }
        return price >= parseInt(min)
      })
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(searchLower) ||
        l.location.toLowerCase().includes(searchLower) ||
        l.description?.toLowerCase().includes(searchLower)
      )
    }

    setFilteredListings(filtered)
  }, [filters, combinedData, activeTab])

  // Format time remaining for display
  const formatTimeRemaining = (endTime) => {
    const remaining = getTimeRemaining(endTime)
    if (remaining.expired) return 'Ended'

    const { days, hours, minutes, seconds } = remaining
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  // Count live auctions
  const liveCount = combinedData.filter(l => l.hasLiveAuction).length
  const upcomingCount = combinedData.filter(l => !l.hasLiveAuction).length

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      propertyType: '',
      city: '',
      priceRange: '',
      search: '',
    })
  }

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} Lac`
    }
    return new Intl.NumberFormat('en-PK').format(price)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  return (
    <>
      <Head>
        <title>Property Auctions - REMMIC</title>
        <meta name="description" content="Browse verified property listings available for auction on REMMIC" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="auctions-main">
          {/* Hero Section */}
          <section className="auctions-hero">
            <div className="hero-content">
              <span className="hero-badge">Step 2: Live Auctions</span>
              <h1>Property Auctions</h1>
              <p>Browse live property auctions and place your bids in real-time</p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-value">{liveCount}</span>
                  <span className="stat-label">Live Auctions</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-value">{upcomingCount}</span>
                  <span className="stat-label">Available Properties</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <section className="tabs-section">
            <div className="tabs-container">
              <button
                className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
                onClick={() => setActiveTab('live')}
              >
                <span className="tab-icon live-pulse" />
                Live Auctions ({liveCount})
              </button>
              <button
                className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                All Properties ({listings.length})
              </button>
            </div>
          </section>

          {/* Filters Section */}
          <section className="filters-section">
            <div className="filters-container">
              {/* Search */}
              <div className="search-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="filter-dropdowns">
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                  {CITIES.map(city => (
                    <option key={city.value} value={city.value}>{city.label}</option>
                  ))}
                </select>

                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                >
                  {PRICE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button className="clear-filters" onClick={clearFilters}>
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Listings Section */}
          <section className="listings-section">
            <div className="listings-container">
              {/* Results Header */}
              <div className="results-header">
                <p className="results-count">
                  {isLoading ? 'Loading...' : `${filteredListings.length} properties found`}
                </p>
                {seeded && (
                  <span className="demo-badge">Demo Data Loaded</span>
                )}
              </div>

              {/* Listings Grid */}
              {isLoading ? (
                <div className="loading-grid">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="listing-skeleton">
                      <div className="skeleton-image" />
                      <div className="skeleton-content">
                        <div className="skeleton-line skeleton-line--title" />
                        <div className="skeleton-line skeleton-line--short" />
                        <div className="skeleton-line skeleton-line--price" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <h3>No properties found</h3>
                  <p>Try adjusting your filters or check back later for new listings.</p>
                  {hasActiveFilters && (
                    <button className="btn btn--secondary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="listings-grid">
                  {filteredListings.map((listing) => {
                    const primaryPhoto = listing.media?.find(m => m.isPrimary) || listing.media?.[0]
                    const auction = listing.auction
                    const isLive = listing.hasLiveAuction
                    const isEndingSoon = auction?.status === AUCTION_STATUS.ENDING_SOON
                    const remaining = auction ? getTimeRemaining(auction.endTime) : null

                    return (
                      <Link
                        key={listing.id}
                        href={`/auction/${auction?.id || listing.id}`}
                        className={`listing-card ${isLive ? 'has-live-auction' : ''} ${isEndingSoon ? 'ending-soon' : ''}`}
                      >
                        <div className="listing-image">
                          {primaryPhoto ? (
                            <img
                              src={primaryPhoto.url}
                              alt={listing.title}
                              onError={(e) => { e.target.src = '/house1.jpg' }}
                            />
                          ) : (
                            <div className="image-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                          <span className="property-type-badge">{listing.propertyType?.replace('_', ' ')}</span>
                          {isLive && (
                            <span className={`countdown-badge ${isEndingSoon ? 'urgent' : ''}`}>
                              {formatTimeRemaining(auction.endTime)}
                            </span>
                          )}
                          <div className="image-overlay">
                            <span className="view-details">{isLive ? 'Place Bid' : 'View Details'}</span>
                          </div>
                        </div>

                        <div className="listing-content">
                          <h3>{listing.title}</h3>
                          <p className="listing-location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {listing.location}, {listing.city}
                          </p>

                          <div className="listing-specs">
                            {listing.area && (
                              <span className="spec">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                </svg>
                                {listing.area} {listing.areaUnit}
                              </span>
                            )}
                            {listing.bedrooms && (
                              <span className="spec">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                                  <path d="M21 7V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3" />
                                </svg>
                                {listing.bedrooms} Beds
                              </span>
                            )}
                            {listing.bathrooms && (
                              <span className="spec">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                                  <line x1="10" y1="5" x2="8" y2="7" />
                                </svg>
                                {listing.bathrooms} Baths
                              </span>
                            )}
                          </div>

                          <div className="listing-footer">
                            {isLive ? (
                              <>
                                <div className="bid-info">
                                  <span className="current-bid-label">Current Bid</span>
                                  <span className="listing-price">{formatAuctionPrice(auction.currentPrice)}</span>
                                </div>
                                <div className="bid-stats">
                                  <span className="bid-count">{auction.bidCount} bids</span>
                                  <span className={`auction-status ${isEndingSoon ? 'ending' : ''}`}>
                                    <span className="status-dot" />
                                    {isEndingSoon ? 'Ending Soon' : 'Live'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="listing-price">PKR {formatPrice(listing.askingPrice)}</span>
                                <span className="auction-status upcoming">
                                  Auction Ready
                                </span>
                              </>
                            )}
                          </div>

                          {isLive && auction.buyNowPrice && (
                            <div className="buy-now-strip">
                              Buy Now: {formatAuctionPrice(auction.buyNowPrice)}
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Seller CTA */}
          <section className="seller-cta">
            <div className="seller-cta-content">
              <h2>Want to Sell Your Property?</h2>
              <p>List your property on REMMIC&apos;s auction platform and reach thousands of verified buyers.</p>
              <Link href="/seller/register" className="btn btn--primary">
                Become a Seller
              </Link>
            </div>
          </section>
        </main>

        <FooterCTA variant="minimal" />
        <Footer />
      </div>

      <style jsx>{`
        .auctions-main {
          padding-top: 80px;
        }

        /* Hero */
        .auctions-hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 80px 5%;
          text-align: center;
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.2);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .auctions-hero h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 12px;
        }

        .auctions-hero p {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 24px;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat .stat-value {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #c9a227;
        }

        .hero-stat .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Tabs */
        .tabs-section {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 80px;
          z-index: 11;
        }

        .tabs-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 5%;
          display: flex;
          gap: 8px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 16px 24px;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #374151;
        }

        .tab-btn.active {
          color: #c9a227;
          border-bottom-color: #c9a227;
        }

        .tab-icon {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10b981;
        }

        .tab-icon.live-pulse {
          animation: livePulse 1.5s infinite;
        }

        @keyframes livePulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
          }
        }

        /* Filters */
        .filters-section {
          background: #fff;
          padding: 24px 5%;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 80px;
          z-index: 10;
        }

        .filters-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-box svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-box input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .search-box input:focus {
          border-color: #c9a227;
        }

        .filter-dropdowns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-dropdowns select {
          padding: 14px 40px 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.9375rem;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center;
          appearance: none;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s;
        }

        .filter-dropdowns select:focus {
          border-color: #c9a227;
        }

        .clear-filters {
          padding: 14px 20px;
          background: transparent;
          border: none;
          color: #dc2626;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }

        .clear-filters:hover {
          color: #b91c1c;
        }

        /* Listings */
        .listings-section {
          padding: 40px 5% 80px;
          background: #f9fafb;
        }

        .listings-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .results-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .results-count {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
        }

        .demo-badge {
          padding: 4px 10px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
        }

        /* Loading Skeleton */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .listing-skeleton {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
        }

        .skeleton-image {
          height: 200px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-content {
          padding: 20px;
        }

        .skeleton-line {
          height: 16px;
          background: #f3f4f6;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-line--title {
          width: 80%;
        }

        .skeleton-line--short {
          width: 50%;
        }

        .skeleton-line--price {
          width: 30%;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #fff;
          border-radius: 20px;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          color: #374151;
          margin: 20px 0 8px;
        }

        .empty-state p {
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
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .listing-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .listing-image {
          position: relative;
          aspect-ratio: 16/10;
          background: #f3f4f6;
          overflow: hidden;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .listing-card:hover .listing-image img {
          transform: scale(1.05);
        }

        .listing-card.has-live-auction {
          border: 2px solid #10b981;
        }

        .listing-card.ending-soon {
          border: 2px solid #f59e0b;
        }

        .countdown-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 8px 14px;
          background: rgba(0, 0, 0, 0.85);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 8px;
          z-index: 2;
        }

        .countdown-badge.urgent {
          background: #ef4444;
          animation: urgentPulse 1s infinite;
        }

        @keyframes urgentPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .property-type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 8px;
          text-transform: capitalize;
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .listing-card:hover .image-overlay {
          opacity: 1;
        }

        .view-details {
          padding: 12px 24px;
          background: #c9a227;
          color: #0a0a0a;
          font-weight: 600;
          border-radius: 10px;
        }

        .listing-content {
          padding: 24px;
        }

        .listing-content h3 {
          font-size: 1.125rem;
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
          margin: 0 0 16px;
        }

        .listing-specs {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .spec {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .listing-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .listing-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .bid-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .current-bid-label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .bid-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .bid-count {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .auction-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #10b981;
          font-weight: 500;
        }

        .auction-status.ending {
          color: #f59e0b;
        }

        .auction-status.upcoming {
          color: #6b7280;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .auction-status.ending .status-dot {
          background: #f59e0b;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .buy-now-strip {
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          border-radius: 8px;
        }

        /* Seller CTA */
        .seller-cta {
          padding: 80px 5%;
          background: #fff;
        }

        .seller-cta-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .seller-cta h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 12px;
        }

        .seller-cta p {
          color: #6b7280;
          margin: 0 0 32px;
          line-height: 1.6;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 162, 39, 0.4);
        }

        .btn--secondary {
          background: #f3f4f6;
          color: #374151;
        }

        @media (max-width: 767px) {
          .auctions-hero {
            padding: 60px 5%;
          }

          .filters-container {
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .filter-dropdowns {
            width: 100%;
            justify-content: center;
          }

          .filter-dropdowns select {
            flex: 1;
            min-width: 0;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
