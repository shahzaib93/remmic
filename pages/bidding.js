import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'
import { ensurePropertyImage } from '../utils/propertyStorage'

export default function Bidding() {
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSort, setSelectedSort] = useState('ending-soon')
  const { getAllProperties } = useFirebase()

  const formatPrice = (value) => {
    if (!value) return 'PKR --'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'PKR --'
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(1)} Cr`
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(1)} Lac`
    return `PKR ${num.toLocaleString()}`
  }

  const getBiddingStatus = (property) => {
    if (!property.bidding?.startDateTime || !property.bidding?.endDateTime) {
      return { status: 'Pending', timeLeft: 'Schedule TBA', phase: 'pending' }
    }
    const now = new Date()
    const start = new Date(property.bidding.startDateTime)
    const end = new Date(property.bidding.endDateTime)

    if (now < start) {
      const diff = start - now
      const days = Math.floor(diff / 86400000)
      return { status: 'Upcoming', timeLeft: days > 0 ? `Starts in ${days}d` : 'Starting soon', phase: 'upcoming' }
    }
    if (now <= end) {
      const diff = end - now
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      return { status: 'Live', timeLeft: days > 0 ? `${days}d ${hours}h left` : `${hours}h left`, phase: 'live' }
    }
    return { status: 'Ended', timeLeft: 'Auction closed', phase: 'ended' }
  }

  useEffect(() => {
    setIsClient(true)

    const loadProperties = async () => {
      try {
        let allProps = []
        const result = await getAllProperties()
        if (result?.success && Array.isArray(result.properties)) {
          allProps = result.properties.filter(p =>
            (p.type === 'bidding' || p.bidding?.startDateTime) &&
            p.status?.toLowerCase() === 'approved'
          )
        }

        const local = JSON.parse(localStorage.getItem('userProperties') || '[]')
        const localBidding = local.filter(p =>
          (p.type === 'bidding' || p.bidding?.startDateTime) &&
          ['land-registration-form', 'land-registration', 'dashboard'].includes(p.source)
        )

        const combined = [...allProps, ...localBidding]
        const unique = combined.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)

        const processed = unique.map((p, idx) => {
          const bidInfo = getBiddingStatus(p)
          return {
            id: p.id || `bid-${idx}`,
            title: p.title || 'Auction Property',
            description: p.description || 'Details coming soon',
            image: ensurePropertyImage(p),
            location: p.location || 'Location TBA',
            area: p.areaSize || p.area || '--',
            startingBid: formatPrice(p.bidding?.minBidAmount || p.startingBid || p.price),
            currentBid: formatPrice(p.bidding?.currentBid || p.bidding?.minBidAmount || p.startingBid),
            totalBids: p.bidding?.totalBids || 0,
            ...bidInfo,
            bidding: p.bidding
          }
        })

        setProperties(processed)
        setFilteredProperties(processed)
      } catch (err) {
        console.error('Error loading properties:', err)
      }
    }

    loadProperties()
  }, [])

  useEffect(() => {
    let result = [...properties]

    if (searchQuery) {
      result = result.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      result = result.filter(p => p.phase === selectedStatus)
    }

    if (selectedSort === 'ending-soon') {
      result.sort((a, b) => (a.phase === 'live' ? -1 : 1))
    } else if (selectedSort === 'price-low') {
      result.sort((a, b) => parseFloat(a.startingBid.replace(/[^0-9.]/g, '')) - parseFloat(b.startingBid.replace(/[^0-9.]/g, '')))
    }

    setFilteredProperties(result)
  }, [searchQuery, selectedStatus, selectedSort, properties])

  const liveCount = properties.filter(p => p.phase === 'live').length
  const upcomingCount = properties.filter(p => p.phase === 'upcoming').length

  if (!isClient) return null

  return (
    <>
      <Head>
        <title>Property Auctions - REMMIC</title>
        <meta name="description" content="Bid on premium properties with transparent, real-time auctions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/logoremmic.png" rel="shortcut icon" type="image/x-icon" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="bidding-main">
          {/* Hero */}
          <section className="bidding-hero">
            <div className="bidding-hero__container">
              <div className="bidding-hero__content">
                <span className="bidding-hero__eyebrow">Property Auctions</span>
                <h1 className="bidding-hero__title">
                  Bid Smart.<br />
                  <span className="bidding-hero__accent">Win Big.</span>
                </h1>
                <p className="bidding-hero__desc">
                  Discover premium properties at competitive prices through our transparent,
                  real-time auction platform. Every bid brings you closer to your dream property.
                </p>
                <div className="bidding-hero__stats">
                  <div className="bidding-hero__stat">
                    <span className="bidding-hero__stat-value">{liveCount}</span>
                    <span className="bidding-hero__stat-label">Live Auctions</span>
                  </div>
                  <div className="bidding-hero__stat">
                    <span className="bidding-hero__stat-value">{upcomingCount}</span>
                    <span className="bidding-hero__stat-label">Upcoming</span>
                  </div>
                  <div className="bidding-hero__stat">
                    <span className="bidding-hero__stat-value">100%</span>
                    <span className="bidding-hero__stat-label">Transparent</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="bidding-filters">
            <div className="bidding-filters__container">
              <div className="bidding-filters__search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="bidding-filters__options">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="live">Live Now</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ended">Ended</option>
                </select>
                <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                  <option value="ending-soon">Ending Soon</option>
                  <option value="price-low">Price: Low to High</option>
                </select>
              </div>
            </div>
          </section>

          {/* Properties Grid */}
          <section className="bidding-properties">
            <div className="bidding-properties__container">
              <div className="bidding-properties__header">
                <h2 className="bidding-properties__title">
                  {selectedStatus === 'all' ? 'All Auctions' :
                   selectedStatus === 'live' ? 'Live Auctions' :
                   selectedStatus === 'upcoming' ? 'Upcoming Auctions' : 'Ended Auctions'}
                </h2>
                <span className="bidding-properties__count">{filteredProperties.length} properties</span>
              </div>

              {filteredProperties.length > 0 ? (
                <div className="bidding-properties__grid">
                  {filteredProperties.map((property) => (
                    <article key={property.id} className={`auction-card auction-card--${property.phase}`}>
                      <div className="auction-card__image">
                        <img src={property.image} alt={property.title} loading="lazy" />
                        <span className={`auction-card__badge auction-card__badge--${property.phase}`}>
                          {property.status}
                        </span>
                        {property.phase === 'live' && (
                          <div className="auction-card__live-indicator">
                            <span className="auction-card__live-dot" />
                            LIVE
                          </div>
                        )}
                      </div>

                      <div className="auction-card__body">
                        <div className="auction-card__header">
                          <h3 className="auction-card__title">{property.title}</h3>
                          <p className="auction-card__location">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {property.location}
                          </p>
                        </div>

                        <div className="auction-card__info">
                          <div className="auction-card__info-item">
                            <span className="auction-card__info-label">Starting Bid</span>
                            <span className="auction-card__info-value">{property.startingBid}</span>
                          </div>
                          <div className="auction-card__info-item">
                            <span className="auction-card__info-label">Area</span>
                            <span className="auction-card__info-value">{property.area}</span>
                          </div>
                        </div>

                        <div className="auction-card__timer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                          </svg>
                          <span>{property.timeLeft}</span>
                        </div>

                        <a href={`/bidding/${property.id}`} className="auction-card__cta">
                          {property.phase === 'live' ? 'Place Bid' :
                           property.phase === 'upcoming' ? 'View Details' : 'View Results'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bidding-properties__empty">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                  <h3>No Auctions Found</h3>
                  <p>Check back soon for new property auctions or adjust your filters.</p>
                  <a href="/land-registration" className="bidding-properties__empty-cta">
                    Register Your Property
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* How It Works */}
          <section className="bidding-how">
            <div className="bidding-how__container">
              <div className="bidding-how__header">
                <span className="bidding-how__eyebrow">How It Works</span>
                <h2 className="bidding-how__title">Simple Bidding Process</h2>
              </div>

              <div className="bidding-how__steps">
                <div className="bidding-step">
                  <div className="bidding-step__number">01</div>
                  <h3 className="bidding-step__title">Browse Auctions</h3>
                  <p className="bidding-step__desc">Explore verified properties with detailed information and documentation.</p>
                </div>
                <div className="bidding-step">
                  <div className="bidding-step__number">02</div>
                  <h3 className="bidding-step__title">Place Your Bid</h3>
                  <p className="bidding-step__desc">Set your maximum bid and let our system automatically bid for you.</p>
                </div>
                <div className="bidding-step">
                  <div className="bidding-step__number">03</div>
                  <h3 className="bidding-step__title">Win & Close</h3>
                  <p className="bidding-step__desc">If you win, complete the transaction with our secure escrow service.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .bidding-main {
          background: #f9fafb;
          padding-top: 80px;
        }

        /* Hero */
        .bidding-hero {
          padding: clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .bidding-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -30%;
          width: 80%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(201, 162, 39, 0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .bidding-hero__container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .bidding-hero__content {
          max-width: 700px;
        }

        .bidding-hero__eyebrow {
          display: inline-block;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .bidding-hero__title {
          margin: 0 0 24px;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
        }

        .bidding-hero__accent {
          color: #c9a227;
        }

        .bidding-hero__desc {
          margin: 0 0 32px;
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
        }

        .bidding-hero__stats {
          display: flex;
          gap: 40px;
        }

        .bidding-hero__stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bidding-hero__stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #c9a227;
        }

        .bidding-hero__stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Filters */
        .bidding-filters {
          padding: 24px clamp(20px, 4vw, 48px);
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .bidding-filters__container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .bidding-filters__search {
          flex: 1;
          min-width: 280px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f3f4f6;
          border-radius: 12px;
          color: #6b7280;
        }

        .bidding-filters__search input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1rem;
          color: #111827;
        }

        .bidding-filters__search input::placeholder {
          color: #9ca3af;
        }

        .bidding-filters__options {
          display: flex;
          gap: 12px;
        }

        .bidding-filters__options select {
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #374151;
          background: #ffffff;
          cursor: pointer;
        }

        /* Properties */
        .bidding-properties {
          padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 48px);
        }

        .bidding-properties__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .bidding-properties__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .bidding-properties__title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .bidding-properties__count {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .bidding-properties__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        /* Auction Card */
        .auction-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .auction-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }

        .auction-card--live {
          border-color: rgba(201, 162, 39, 0.4);
        }

        .auction-card__image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .auction-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .auction-card:hover .auction-card__image img {
          transform: scale(1.05);
        }

        .auction-card__badge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .auction-card__badge--live {
          background: #c9a227;
          color: #0a0a0a;
        }

        .auction-card__badge--upcoming {
          background: #3b82f6;
          color: #ffffff;
        }

        .auction-card__badge--ended {
          background: #6b7280;
          color: #ffffff;
        }

        .auction-card__badge--pending {
          background: #f59e0b;
          color: #0a0a0a;
        }

        .auction-card__live-indicator {
          position: absolute;
          top: 14px;
          right: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 999px;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .auction-card__live-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .auction-card__body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .auction-card__header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .auction-card__title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
        }

        .auction-card__location {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .auction-card__info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 14px;
          background: #f9fafb;
          border-radius: 12px;
        }

        .auction-card__info-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .auction-card__info-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .auction-card__info-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
        }

        .auction-card__timer {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #c9a227;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .auction-card__cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 12px;
          color: #0a0a0a;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .auction-card__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -6px rgba(201, 162, 39, 0.5);
        }

        /* Empty State */
        .bidding-properties__empty {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .bidding-properties__empty svg {
          margin-bottom: 24px;
          color: #d1d5db;
        }

        .bidding-properties__empty h3 {
          margin: 0 0 8px;
          font-size: 1.3rem;
          color: #374151;
        }

        .bidding-properties__empty p {
          margin: 0 0 24px;
        }

        .bidding-properties__empty-cta {
          display: inline-flex;
          padding: 12px 24px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 10px;
          color: #0a0a0a;
          font-weight: 600;
          text-decoration: none;
        }

        /* How It Works */
        .bidding-how {
          padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
          background: #ffffff;
        }

        .bidding-how__container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .bidding-how__header {
          text-align: center;
          margin-bottom: 48px;
        }

        .bidding-how__eyebrow {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .bidding-how__title {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #111827;
        }

        .bidding-how__steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .bidding-step {
          text-align: center;
          padding: 32px 24px;
          background: #f9fafb;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }

        .bidding-step__number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 50%;
          font-size: 1rem;
          font-weight: 700;
          color: #0a0a0a;
          margin-bottom: 20px;
        }

        .bidding-step__title {
          margin: 0 0 12px;
          font-size: 1.15rem;
          font-weight: 600;
          color: #111827;
        }

        .bidding-step__desc {
          margin: 0;
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .bidding-properties__grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .bidding-how__steps {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }

        @media (max-width: 640px) {
          .bidding-hero__stats {
            flex-direction: column;
            gap: 20px;
          }

          .bidding-filters__container {
            flex-direction: column;
          }

          .bidding-filters__options {
            width: 100%;
          }

          .bidding-filters__options select {
            flex: 1;
          }

          .bidding-properties__grid {
            grid-template-columns: 1fr;
          }

          .bidding-properties__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </>
  )
}
