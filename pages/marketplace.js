import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

// Sample bidding properties to demonstrate the feature
const SAMPLE_BIDDING_PROPERTIES = [
  {
    id: 'bidding-bahria-town',
    name: 'Bahria Town Luxury Villa - Live Auction',
    location: 'Bahria Town Phase 8, Rawalpindi',
    city: 'rawalpindi',
    assetType: 'residential',
    roi: 15,
    risk: 'moderate',
    insured: true,
    insurancePartner: 'EFU',
    image: '/house5.jpg',
    minInvestment: 15000000,
    isBidding: true,
    biddingStatus: 'live',
    auctionStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Started 2 days ago
    auctionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 5 days
    startingBid: 15000000,
    currentBid: 18500000,
    totalBids: 12,
  },
  {
    id: 'bidding-dha-islamabad',
    name: 'DHA Islamabad Commercial Plot',
    location: 'DHA Phase 2, Islamabad',
    city: 'islamabad',
    assetType: 'commercial',
    roi: 18,
    risk: 'aggressive',
    insured: false,
    image: '/house6.jpg',
    minInvestment: 25000000,
    isBidding: true,
    biddingStatus: 'live',
    auctionStartDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    startingBid: 25000000,
    currentBid: 28000000,
    totalBids: 8,
  },
  {
    id: 'bidding-gulberg',
    name: 'Gulberg III Prime Location',
    location: 'Gulberg III, Lahore',
    city: 'lahore',
    assetType: 'commercial',
    roi: 14,
    risk: 'moderate',
    insured: true,
    insurancePartner: 'Jubilee',
    image: '/house7.jpg',
    minInvestment: 35000000,
    isBidding: true,
    biddingStatus: 'upcoming',
    auctionStartDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 2 days
    auctionEndDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    startingBid: 35000000,
    currentBid: 35000000,
    totalBids: 0,
  },
]

const STATIC_ASSETS = [
  {
    id: 'dha-smart-villa',
    name: 'DHA Phase 6 Smart Villa',
    location: 'DHA Phase 6, Lahore',
    city: 'lahore',
    assetType: 'residential',
    roi: 12.4,
    risk: 'moderate',
    insured: true,
    insurancePartner: 'EFU',
    image: '/house5.jpg',
    minInvestment: 2500000,
  },
  {
    id: 'blue-area-office',
    name: 'Blue Area Corporate Floors',
    location: 'Blue Area, Islamabad',
    city: 'islamabad',
    assetType: 'commercial',
    roi: 14.1,
    risk: 'moderate',
    insured: true,
    insurancePartner: 'Jubilee',
    image: '/house6.jpg',
    minInvestment: 5000000,
  },
  {
    id: 'clifton-harbor',
    name: 'Clifton Harbor Residences',
    location: 'Clifton Block 5, Karachi',
    city: 'karachi',
    assetType: 'residential',
    roi: 9.8,
    risk: 'conservative',
    insured: false,
    image: '/house7.jpg',
    minInvestment: 1800000,
  },
  {
    id: 'tech-park',
    name: 'Lahore Tech Park',
    location: 'Main Boulevard, Lahore',
    city: 'lahore',
    assetType: 'commercial',
    roi: 16.3,
    risk: 'aggressive',
    insured: true,
    insurancePartner: 'Adamjee',
    image: '/house6.jpg',
    minInvestment: 8000000,
  },
  {
    id: 'karachi-logistics',
    name: 'Karachi Logistics Hub',
    location: 'Port Qasim, Karachi',
    city: 'karachi',
    assetType: 'industrial',
    roi: 13.5,
    risk: 'moderate',
    insured: false,
    image: '/house5.jpg',
    minInvestment: 6000000,
  },
  {
    id: 'skardu-retreat',
    name: 'Skardu Mountain Retreat',
    location: 'Shangrila Road, Skardu',
    city: 'skardu',
    assetType: 'hospitality',
    roi: 11.1,
    risk: 'conservative',
    insured: true,
    insurancePartner: 'TPL',
    image: '/house7.jpg',
    minInvestment: 1200000,
  },
]

const FILTER_DEFAULTS = {
  location: 'all',
  assetType: 'all',
  minInvestment: 'all',
  roiRange: 'all',
  risk: 'all',
}

const RISK_LABELS = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
}

// Helper function to get bidding status
const getBiddingStatus = (property) => {
  if (!property.auctionStartDate || !property.auctionEndDate) return 'pending'

  const now = new Date()
  const startDate = new Date(property.auctionStartDate)
  const endDate = new Date(property.auctionEndDate)

  if (now < startDate) return 'upcoming'
  if (now > endDate) return 'ended'
  return 'live'
}

// Helper to format time remaining
const formatTimeRemaining = (endDate) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end - now

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export default function Marketplace() {
  const router = useRouter()
  const { getAllProperties } = useFirebase()
  const [mounted, setMounted] = useState(false)
  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const [searchTerm, setSearchTerm] = useState('')
  const [biddingProperties, setBiddingProperties] = useState([])
  const [loading, setLoading] = useState(true)

  // Load bidding properties from Firebase and localStorage
  useEffect(() => {
    const loadBiddingProperties = async () => {
      try {
        let allBiddingProperties = []

        // Load from Firebase (with error handling)
        if (getAllProperties) {
          try {
            const firebaseProperties = await getAllProperties()
            if (Array.isArray(firebaseProperties)) {
              const firebaseBidding = firebaseProperties.filter(
                p => p.type === 'bidding' && p.status === 'approved'
              )
              allBiddingProperties = [...firebaseBidding]
            }
          } catch (firebaseError) {
            console.log('Firebase not available, using localStorage only')
          }
        }

        // Load from localStorage
        if (typeof window !== 'undefined') {
          const localProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
          const localBidding = localProperties.filter(
            p => p.type === 'bidding' && (p.status === 'approved' || p.status === 'pending')
          )

          // Merge without duplicates
          localBidding.forEach(localProp => {
            if (!allBiddingProperties.find(p => p.id === localProp.id)) {
              allBiddingProperties.push(localProp)
            }
          })
        }

        // Convert bidding properties to marketplace format
        const formattedProperties = allBiddingProperties.map(prop => ({
          id: prop.id,
          name: prop.title || prop.name || 'Untitled Property',
          location: prop.location || prop.address || 'Pakistan',
          city: (prop.city || prop.location || 'other').toLowerCase().split(',')[0].trim(),
          assetType: prop.propertyType || prop.type || 'residential',
          roi: prop.expectedRoi || prop.roi || 10,
          risk: prop.riskLevel || 'moderate',
          insured: prop.insured || false,
          insurancePartner: prop.insurancePartner || null,
          image: prop.images?.[0] || prop.image || '/house5.jpg',
          minInvestment: prop.startingBid || prop.price || prop.minInvestment || 1000000,
          // Bidding specific fields
          isBidding: true,
          biddingStatus: getBiddingStatus(prop),
          auctionStartDate: prop.auctionStartDate,
          auctionEndDate: prop.auctionEndDate,
          startingBid: prop.startingBid || prop.price,
          currentBid: prop.currentBid || prop.startingBid || prop.price,
          totalBids: prop.bids?.length || prop.totalBids || 0,
        }))

        setBiddingProperties(formattedProperties)
      } catch (error) {
        console.error('Error loading bidding properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBiddingProperties()

    // Save sample bidding properties to localStorage for bidding-detail page
    if (typeof window !== 'undefined') {
      // Always update sample properties with fresh data
      const sampleForStorage = SAMPLE_BIDDING_PROPERTIES.map(prop => ({
          id: prop.id,
          title: prop.name,
          name: prop.name,
          location: prop.location,
          city: prop.city,
          propertyType: prop.assetType,
          type: 'bidding',
          status: 'approved',
          price: prop.startingBid,
          startingBid: prop.startingBid,
          currentBid: prop.currentBid,
          auctionStartDate: prop.auctionStartDate,
          auctionEndDate: prop.auctionEndDate,
          image: prop.image,
          images: [prop.image],
          totalBids: prop.totalBids,
          bids: [],
          description: `Premium ${prop.assetType} property in ${prop.location}. Great investment opportunity with expected ROI of ${prop.roi}%.`,
          // Bidding form data for bidding-detail page
          bidding: {
            startDateTime: prop.auctionStartDate,
            endDateTime: prop.auctionEndDate,
            minBidAmount: prop.startingBid,
            maxBidAmount: prop.startingBid * 3,
            fees: 50000,
          }
        }))
      localStorage.setItem('sampleBiddingProperties', JSON.stringify(sampleForStorage))
    }

    const timer = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(timer)
  }, [getAllProperties])

  // Combine static assets with bidding properties (sample + user added)
  const ASSETS = useMemo(() => {
    return [...SAMPLE_BIDDING_PROPERTIES, ...biddingProperties, ...STATIC_ASSETS]
  }, [biddingProperties])

  const locations = useMemo(() => ['all', ...new Set(ASSETS.map((asset) => asset.city))], [ASSETS])

  const filteredAssets = useMemo(() => {
    return ASSETS.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesLocation = filters.location === 'all' || asset.city === filters.location
      const matchesType = filters.assetType === 'all' || asset.assetType === filters.assetType

      const matchesMinInvestment = (() => {
        if (filters.minInvestment === 'all') return true
        if (filters.minInvestment === 'lt2') return asset.minInvestment < 2000000
        if (filters.minInvestment === '2to5') return asset.minInvestment >= 2000000 && asset.minInvestment <= 5000000
        if (filters.minInvestment === '5to10') return asset.minInvestment > 5000000 && asset.minInvestment <= 10000000
        if (filters.minInvestment === 'gt10') return asset.minInvestment > 10000000
        return true
      })()

      const matchesRoi = (() => {
        if (filters.roiRange === 'all') return true
        if (filters.roiRange === 'lt10') return asset.roi < 10
        if (filters.roiRange === '10to12') return asset.roi >= 10 && asset.roi <= 12
        if (filters.roiRange === '12to15') return asset.roi > 12 && asset.roi <= 15
        if (filters.roiRange === 'gt15') return asset.roi > 15
        return true
      })()

      const matchesRisk = filters.risk === 'all' || asset.risk === filters.risk

      return matchesSearch && matchesLocation && matchesType && matchesMinInvestment && matchesRoi && matchesRisk
    })
  }, [filters, searchTerm])

  const updateFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  const resetFilters = () => {
    setFilters(FILTER_DEFAULTS)
    setSearchTerm('')
  }

  return (
    <>
      <Head>
        <title>Marketplace - Public & Private Access | REMMIC</title>
        <meta
          name="description"
          content="Publicly browse REMMIC assets with ROI, risk and grade signals. Log in to unlock buy/sell, bidding and management actions."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__container ${mounted ? 'is-visible' : ''}`}>
              <p className="hero__eyebrow">Marketplace</p>
              <h1>
                Public transparency.
                <span>Private execution.</span>
              </h1>
              <p>
                Browse REMMIC assets with ROI, risk and grading signals in read-only mode. Transactions unlock only after
                login and verification.
              </p>
            </div>
          </section>

          <section className="access">
            <div className="access__card">
              <h2>Public View</h2>
              <ul>
                <li>Browse assets</li>
                <li>See ROI, risk, grade</li>
                <li>No transaction access</li>
              </ul>
              <p className="access__note">Transactions available to logged-in, verified investors only.</p>
            </div>
            <div className="access__card access__card--private">
              <h2>Private View</h2>
              <ul>
                <li>Buy / Sell shares</li>
                <li>Join bidding</li>
                <li>Request management</li>
              </ul>
              <a className="access__cta" href="/login">Log in / Create account</a>
            </div>
          </section>

          <section className="filters-section">
            <div className="filters__wrapper">
              <div className="filters__search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M16.5 16.5L21 21" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or location"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button onClick={resetFilters}>Clear</button>
              </div>
              <div className="filters__grid">
                <label>
                  <span>Location</span>
                  <select value={filters.location} onChange={(event) => updateFilter('location', event.target.value)}>
                    <option value="all">All</option>
                    {locations.map((city) => (
                      <option key={city} value={city}>
                        {city.charAt(0).toUpperCase() + city.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Asset type</span>
                  <select value={filters.assetType} onChange={(event) => updateFilter('assetType', event.target.value)}>
                    <option value="all">All</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="hospitality">Hospitality</option>
                  </select>
                </label>
                <label>
                  <span>Min. investment</span>
                  <select value={filters.minInvestment} onChange={(event) => updateFilter('minInvestment', event.target.value)}>
                    <option value="all">Any</option>
                    <option value="lt2">Below PKR 2M</option>
                    <option value="2to5">PKR 2M - 5M</option>
                    <option value="5to10">PKR 5M - 10M</option>
                    <option value="gt10">Above PKR 10M</option>
                  </select>
                </label>
                <label>
                  <span>ROI range</span>
                  <select value={filters.roiRange} onChange={(event) => updateFilter('roiRange', event.target.value)}>
                    <option value="all">All</option>
                    <option value="lt10">Below 10%</option>
                    <option value="10to12">10% - 12%</option>
                    <option value="12to15">12% - 15%</option>
                    <option value="gt15">Above 15%</option>
                  </select>
                </label>
                <label>
                  <span>Risk level</span>
                  <select value={filters.risk} onChange={(event) => updateFilter('risk', event.target.value)}>
                    <option value="all">Any</option>
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="assets">
            <div className="assets__header">
              <div>
                <p>Public view</p>
                <h2>Browse assets with ROI, risk & grade</h2>
              </div>
              <span>Read-only · Log in to transact</span>
            </div>

            <div className="assets__grid">
              {filteredAssets.map((asset, index) => (
                <article
                  key={asset.id}
                  className={`asset-card ${asset.isBidding ? 'asset-card--bidding' : ''}`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s ease ${index * 0.08}s`,
                  }}
                >
                  <div className="asset-card__image">
                    <img src={asset.image} alt={asset.name} />
                    {asset.isBidding && (
                      <div className={`bidding-badge bidding-badge--${asset.biddingStatus}`}>
                        {asset.biddingStatus === 'live' && (
                          <>
                            <span className="pulse"></span>
                            LIVE AUCTION
                          </>
                        )}
                        {asset.biddingStatus === 'upcoming' && 'UPCOMING'}
                        {asset.biddingStatus === 'ended' && 'ENDED'}
                        {asset.biddingStatus === 'pending' && 'PENDING'}
                      </div>
                    )}
                  </div>
                  <div className="asset-card__body">
                    <div className="asset-card__top">
                      <h3>{asset.name}</h3>
                      <span className={
                        `risk-badge risk-badge--${asset.risk}`
                      }>{RISK_LABELS[asset.risk]}</span>
                    </div>
                    <p className="asset-card__location">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.134 2 5 5.107 5 8.94 5 13.8 12 22 12 22s7-8.2 7-13.06C19 5.107 15.866 2 12 2zm0 8.3a2.3 2.3 0 110-4.6 2.3 2.3 0 010 4.6z" />
                      </svg>
                      {asset.location}
                    </p>

                    {/* Bidding Info Section */}
                    {asset.isBidding ? (
                      <div className="asset-card__bidding-info">
                        <div className="bidding-stats">
                          <div>
                            <span>Starting Bid</span>
                            <strong>PKR {((asset.startingBid || 0) / 1000000).toFixed(1)}M</strong>
                          </div>
                          <div>
                            <span>Current Bid</span>
                            <strong className="current-bid">PKR {((asset.currentBid || 0) / 1000000).toFixed(1)}M</strong>
                          </div>
                          <div>
                            <span>Total Bids</span>
                            <strong>{asset.totalBids || 0}</strong>
                          </div>
                        </div>
                        {asset.biddingStatus === 'live' && asset.auctionEndDate && (
                          <div className="time-remaining">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            {formatTimeRemaining(asset.auctionEndDate)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="asset-card__metrics">
                        <div>
                          <span>Expected ROI</span>
                          <strong>{asset.roi}%</strong>
                        </div>
                        <div>
                          <span>Risk</span>
                          <strong>{RISK_LABELS[asset.risk]}</strong>
                        </div>
                        <div>
                          <span>Min investment</span>
                          <strong>PKR {(asset.minInvestment / 1000000).toFixed(1)}M</strong>
                        </div>
                      </div>
                    )}

                    <div className="asset-card__footer">
                      <div className="asset-card__insurance">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 3l9 4v5c0 5-3.5 9.5-9 11-5.5-1.5-9-6-9-11V7l9-4z" />
                        </svg>
                        {asset.insured ? (
                          <div>
                            <span>Insurance</span>
                            <strong>{asset.insurancePartner}</strong>
                          </div>
                        ) : (
                          <div>
                            <span>Insurance</span>
                            <strong>Pending</strong>
                          </div>
                        )}
                      </div>
                      {asset.isBidding ? (
                        <button
                          onClick={() => router.push(`/bidding-detail?id=${asset.id}`)}
                          className={`asset-card__btn asset-card__btn--bid ${asset.biddingStatus === 'live' ? 'asset-card__btn--live' : ''}`}
                          disabled={asset.biddingStatus === 'ended'}
                        >
                          {asset.biddingStatus === 'live' && 'Place Bid'}
                          {asset.biddingStatus === 'upcoming' && 'View Auction'}
                          {asset.biddingStatus === 'ended' && 'View Results'}
                          {asset.biddingStatus === 'pending' && 'Coming Soon'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        </button>
                      ) : (
                        <a href={`/property/${asset.id}`} className="asset-card__btn">
                          View Details
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredAssets.length === 0 && (
              <div className="assets__empty">
                <h3>No matching assets</h3>
                <p>Adjust filters to explore more of the public inventory.</p>
              </div>
            )}
          </section>

          <section className="private">
            <div className="private__content">
              <h2>Ready for private execution?</h2>
              <p>Log in to place orders, enter bidding rooms or hand management to REMMIC.</p>
              <div className="private__actions">
                <div>
                  <strong>Buy / Sell shares</strong>
                  <p>Trade fractional lots and monitor settlements.</p>
                </div>
                <div>
                  <strong>Join bidding</strong>
                  <p>Enter live rooms with deposits and audit trails.</p>
                </div>
                <div>
                  <strong>Request management</strong>
                  <p>Move assets to REMMIC-managed care.</p>
                </div>
              </div>
              <a href="/login" className="btn btn--primary">Log in / Create account</a>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .hero {
          padding: 120px 5% 70px;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 30%, rgba(201, 162, 39, 0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero__container {
          max-width: 680px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .hero__container.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__eyebrow {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(201, 162, 39, 0.25);
          background: rgba(201, 162, 39, 0.08);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 20px;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #c9a227;
        }

        .hero h1 {
          margin: 0 0 16px;
          font-size: clamp(2.25rem, 5vw, 3rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .hero h1 span {
          color: #c9a227;
          display: block;
          margin-top: 4px;
        }

        .hero > .hero__container > p {
          margin: 0 auto;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.7;
          font-size: 1rem;
        }

        .access {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          padding: 60px 5%;
          background: #faf9f7;
          max-width: 900px;
          margin: 0 auto;
        }

        .access__card {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 32px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          min-height: 280px;
          transition: all 0.3s ease;
        }

        .access__card:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        .access__card--private {
          border-color: rgba(201, 162, 39, 0.4);
          background: linear-gradient(180deg, #fffbf0 0%, #fff8e6 100%);
        }

        .access__card--private:hover {
          border-color: rgba(201, 162, 39, 0.6);
          box-shadow: 0 12px 32px rgba(201, 162, 39, 0.12);
        }

        .access__card h2 {
          margin: 0 0 20px;
          font-size: 1.375rem;
          font-weight: 700;
          color: #0a0a0a;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .access__card h2::before {
          content: '';
          width: 4px;
          height: 24px;
          background: #e5e7eb;
          border-radius: 2px;
        }

        .access__card--private h2::before {
          background: linear-gradient(180deg, #c9a227, #d4b13d);
        }

        .access__card ul {
          list-style: none;
          padding: 0;
          margin: 0 0 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-grow: 1;
        }

        .access__card ul li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.5;
        }

        .access__card ul li::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .access__card--private ul li::before {
          background: #c9a227;
        }

        .access__note {
          font-size: 0.8125rem;
          color: #6b7280;
          margin: 0;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
          line-height: 1.5;
        }

        .access__cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: auto;
          padding: 12px 20px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .access__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 162, 39, 0.35);
        }

        .filters-section {
          padding: 0 5% 24px;
          background: #faf9f7;
        }

        .filters__wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .filters__search {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 16px;
          transition: all 0.2s ease;
        }

        .filters__search:focus-within {
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .filters__search svg {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .filters__search input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
          background: transparent;
          color: #0a0a0a;
        }

        .filters__search input::placeholder {
          color: #9ca3af;
        }

        .filters__search button {
          border: none;
          background: none;
          color: #6b7280;
          font-weight: 600;
          font-size: 0.8125rem;
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .filters__search button:hover {
          background: #fee2e2;
          color: #b91c1c;
        }

        .filters__grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .filters__grid label {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filters__grid label span {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .filters__grid select {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.8125rem;
          color: #0a0a0a;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 42px;
        }

        .filters__grid select:hover {
          border-color: #d1d5db;
        }

        .filters__grid select:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .assets {
          padding: 40px 5% 80px;
          background: #ffffff;
          max-width: 1400px;
          margin: 0 auto;
        }

        .assets__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f3f4f6;
        }

        .assets__header p {
          margin: 0 0 4px;
          text-transform: uppercase;
          font-size: 0.6875rem;
          letter-spacing: 0.06em;
          font-weight: 600;
          color: #c9a227;
        }

        .assets__header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .assets__header span {
          font-size: 0.8125rem;
          color: #6b7280;
          background: #f9fafb;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .assets__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .asset-card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .asset-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .asset-card__image {
          position: relative;
          overflow: hidden;
        }

        .asset-card__image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .asset-card:hover .asset-card__image img {
          transform: scale(1.03);
        }

        .asset-card__body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .asset-card__top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .asset-card__top h3 {
          margin: 0;
          font-size: 1.0625rem;
          font-weight: 700;
          color: #0a0a0a;
          line-height: 1.3;
        }

        .risk-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.6875rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }

        .risk-badge--conservative {
          background: rgba(34, 197, 94, 0.1);
          color: #15803d;
        }

        .risk-badge--moderate {
          background: rgba(201, 162, 39, 0.12);
          color: #92400e;
        }

        .risk-badge--aggressive {
          background: rgba(239, 68, 68, 0.1);
          color: #b91c1c;
        }

        .asset-card__location {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #6b7280;
          font-size: 0.8125rem;
        }

        .asset-card__location svg {
          color: #9ca3af;
        }

        .asset-card__metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #f9fafb;
          border-radius: 10px;
          padding: 14px;
          margin-top: 4px;
        }

        .asset-card__metrics > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .asset-card__metrics span {
          font-size: 0.6875rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .asset-card__metrics strong {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .asset-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
          margin-top: 4px;
        }

        .asset-card__insurance {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8125rem;
          color: #4b5563;
        }

        .asset-card__insurance svg {
          color: #10b981;
        }

        .asset-card__insurance > div {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .asset-card__insurance span {
          display: block;
          font-size: 0.6875rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .asset-card__insurance strong {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #374151;
        }

        .asset-card__btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 10px 16px;
          border-radius: 8px;
          background: #0a0a0a;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.8125rem;
          transition: all 0.25s ease;
        }

        .asset-card__btn:hover {
          background: #1a1a1a;
          transform: translateX(2px);
        }

        .asset-card__btn svg {
          transition: transform 0.25s ease;
        }

        .asset-card__btn:hover svg {
          transform: translateX(3px);
        }

        /* Bidding Card Styles */
        .asset-card--bidding {
          border-color: rgba(201, 162, 39, 0.3);
        }

        .asset-card--bidding:hover {
          border-color: rgba(201, 162, 39, 0.5);
          box-shadow: 0 12px 32px rgba(201, 162, 39, 0.15);
        }

        .asset-card__image {
          position: relative;
        }

        .bidding-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 2;
        }

        .bidding-badge--live {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #fff;
          animation: glow 2s infinite;
        }

        .bidding-badge--upcoming {
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
        }

        .bidding-badge--ended {
          background: #6b7280;
          color: #fff;
        }

        .bidding-badge--pending {
          background: #3b82f6;
          color: #fff;
        }

        .bidding-badge .pulse {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
        }

        .asset-card__bidding-info {
          background: linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 10px;
          padding: 14px;
          margin-top: 4px;
        }

        .bidding-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .bidding-stats > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .bidding-stats span {
          font-size: 0.6875rem;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .bidding-stats strong {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .bidding-stats .current-bid {
          color: #c9a227;
        }

        .time-remaining {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(201, 162, 39, 0.15);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #dc2626;
        }

        .time-remaining svg {
          color: #dc2626;
        }

        .asset-card__btn--bid {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: none;
          cursor: pointer;
        }

        .asset-card__btn--live {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          animation: pulseBtn 2s infinite;
        }

        .asset-card__btn--live:hover {
          background: linear-gradient(135deg, #b91c1c, #dc2626);
        }

        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }

        .asset-card__btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .asset-card__btn:disabled:hover {
          transform: none;
        }

        .assets__empty {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 12px;
          margin-top: 20px;
        }

        .assets__empty h3 {
          margin: 0 0 8px;
          color: #374151;
        }

        .assets__empty p {
          margin: 0;
          font-size: 0.9375rem;
        }

        .private {
          padding: 80px 5%;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          color: #fff;
          position: relative;
        }

        .private::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(201, 162, 39, 0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        .private__content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .private__content h2 {
          margin: 0 0 12px;
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .private__content > p {
          margin: 0 auto 36px;
          max-width: 520px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          line-height: 1.65;
        }

        .private__actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: left;
          margin-bottom: 36px;
        }

        .private__actions > div {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.25s ease;
        }

        .private__actions > div:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(201, 162, 39, 0.25);
        }

        .private__actions strong {
          display: block;
          margin-bottom: 6px;
          font-size: 0.9375rem;
          color: #c9a227;
        }

        .private__actions p {
          margin: 0;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.5;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 32px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9375rem;
          transition: all 0.25s ease;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 50%, #c9a227 100%);
          background-size: 200% auto;
          color: #0a0a0a;
          box-shadow: 0 6px 24px rgba(201, 162, 39, 0.35);
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(201, 162, 39, 0.45);
          background-position: right center;
        }

        @media (max-width: 1024px) {
          .assets__grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }

          .filters__grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .private__actions {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 110px 6% 60px;
          }

          .hero__eyebrow {
            padding: 5px 12px;
            font-size: 0.625rem;
            margin-bottom: 16px;
          }

          .hero h1 {
            font-size: clamp(1.875rem, 5vw, 2.5rem);
          }

          .access {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 40px 5%;
          }

          .access__card {
            min-height: auto;
            padding: 24px;
          }

          .filters-section {
            padding: 0 5% 20px;
          }

          .filters__wrapper {
            padding: 16px;
          }

          .filters__grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .filters__grid label span {
            font-size: 0.625rem;
          }

          .filters__grid select {
            padding: 8px 10px;
            min-height: 38px;
            font-size: 0.75rem;
          }

          .assets {
            padding: 32px 5% 60px;
          }

          .assets__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .assets__grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .asset-card__metrics {
            grid-template-columns: repeat(3, 1fr);
          }

          .asset-card__footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .asset-card__btn {
            width: 100%;
            justify-content: center;
          }

          .private {
            padding: 60px 5%;
          }

          .private__actions {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .private__actions > div {
            padding: 16px;
          }

          .btn--primary {
            width: 100%;
            padding: 14px 24px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 100px 5% 50px;
          }

          .hero h1 {
            font-size: clamp(1.625rem, 6vw, 2rem);
          }

          .hero > .hero__container > p {
            font-size: 0.9375rem;
          }

          .access__card {
            padding: 20px;
          }

          .access__card h2 {
            font-size: 1.25rem;
          }

          .filters__grid {
            grid-template-columns: 1fr;
          }

          .asset-card__body {
            padding: 16px;
          }

          .asset-card__top h3 {
            font-size: 1rem;
          }

          .asset-card__metrics {
            padding: 12px;
          }

          .asset-card__metrics span {
            font-size: 0.625rem;
          }

          .asset-card__metrics strong {
            font-size: 0.875rem;
          }

          .private__content h2 {
            font-size: clamp(1.5rem, 5vw, 1.875rem);
          }
        }
      `}</style>
    </>
  )
}
