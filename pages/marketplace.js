import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'
import { ensurePropertyImage, resolvePropertyIdentifier } from '../utils/propertyStorage'

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
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  // Load all properties from Firebase and localStorage
  useEffect(() => {
    const loadProperties = async () => {
      try {
        let allProperties = []

        // Load from Firebase
        if (getAllProperties) {
          try {
            const result = await getAllProperties()
            if (result?.success && Array.isArray(result.properties)) {
              allProperties = result.properties
            }
          } catch (firebaseError) {
            console.error('Error loading properties from Firebase:', firebaseError)
          }
        }

        // Load from localStorage (userProperties from dashboard/land-registration)
        try {
          const localProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
          if (Array.isArray(localProperties) && localProperties.length > 0) {
            allProperties = [...allProperties, ...localProperties]
          }
        } catch (localError) {
          console.warn('Error loading local properties:', localError)
        }

        // Remove duplicates by id
        const uniqueProperties = allProperties.filter((prop, index, self) => {
          const propId = prop.id || prop.propertyId
          return index === self.findIndex(p => (p.id || p.propertyId) === propId)
        })

        // Convert properties to marketplace format
        const formattedProperties = uniqueProperties.map((prop, index) => {
          const propType = (prop.type || prop.listingType || '').toLowerCase()
          const isBidding = propType === 'bidding' || propType === 'auction' || !!prop.bidding
          const isInvestment = propType === 'investment' || propType === 'shares'
          const isRental = propType === 'rental'
          const image = ensurePropertyImage(prop)
          const propertyId = resolvePropertyIdentifier(prop, `marketplace-${index}`)

          // Extract price from various fields
          const price = prop.bidding?.minBidAmount || prop.startingBid || prop.price || prop.minInvestment || prop.shares?.pricePerShare || 1000000

          return {
            id: propertyId,
            name: prop.title || prop.name || 'Untitled Property',
            location: prop.location || prop.address || 'Pakistan',
            city: (prop.city || prop.location || 'other').toLowerCase().split(',')[0].trim(),
            assetType: prop.propertyType || prop.assetType || prop.landType || 'residential',
            propertyType: isBidding ? 'bidding' : isInvestment ? 'investment' : isRental ? 'rental' : 'general',
            roi: prop.expectedRoi || prop.roi || prop.shares?.expectedYield || 10,
            risk: prop.riskLevel || prop.risk || 'moderate',
            insured: prop.insured || false,
            insurancePartner: prop.insurancePartner || null,
            image,
            minInvestment: price,
            area: prop.areaSize || prop.area || '--',
            // Bidding specific fields
            isBidding: isBidding,
            biddingStatus: isBidding ? getBiddingStatus(prop) : null,
            auctionStartDate: prop.bidding?.startDateTime || prop.auctionStartDate,
            auctionEndDate: prop.bidding?.endDateTime || prop.auctionEndDate,
            startingBid: prop.bidding?.minBidAmount || prop.startingBid || price,
            currentBid: prop.currentBid || prop.bidding?.minBidAmount || prop.startingBid || price,
            totalBids: prop.bids?.length || prop.totalBids || 0,
            // Investment specific fields
            isInvestment: isInvestment,
            totalShares: prop.shares?.totalShares || 0,
            availableShares: prop.shares?.availableShares || 0,
            pricePerShare: prop.shares?.pricePerShare || 0,
            // Rental specific fields
            isRental: isRental,
            monthlyRent: prop.rental?.monthlyRent || prop.monthlyRent || 0,
          }
        })

        setProperties(formattedProperties)
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()

    const timer = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(timer)
  }, [getAllProperties])

  // Properties from Firebase/Admin only
  const ASSETS = useMemo(() => {
    return [...properties]
  }, [properties])

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
  }, [ASSETS, filters, searchTerm])

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
            <a href="/bidding" className="access__btn access__btn--bidding">
              <div className="access__btn-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
                  <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
                  <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
                  <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
                  <path d="M14 20.5c0-.83.67-1.5 1.5-1.5h.5v1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5z"/>
                  <path d="M10 9.5C10 10.33 9.33 11 8.5 11h-5C2.67 11 2 10.33 2 9.5S2.67 8 3.5 8h5c.83 0 1.5.67 1.5 1.5z"/>
                </svg>
              </div>
              <div className="access__btn-content">
                <h3>Property Bidding</h3>
                <p>Bid on premium properties through transparent real-time auctions</p>
              </div>
              <div className="access__btn-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
            <a href="/investment-shares" className="access__btn access__btn--investment">
              <div className="access__btn-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="access__btn-content">
                <h3>Investment Shares</h3>
                <p>Invest in fractional property shares and earn rental income</p>
              </div>
              <div className="access__btn-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
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
                  className={`asset-card ${asset.isBidding ? 'asset-card--bidding' : ''} ${asset.isInvestment ? 'asset-card--investment' : ''} ${asset.isRental ? 'asset-card--rental' : ''}`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    transition: `all 0.6s ease ${index * 0.08}s`,
                  }}
                >
                  <div className="asset-card__image">
                    <img src={asset.image} alt={asset.name} />
                    {/* Property Type Badge */}
                    {asset.isBidding && (
                      <div className={`property-badge property-badge--bidding bidding-badge--${asset.biddingStatus}`}>
                        {asset.biddingStatus === 'live' && (
                          <>
                            <span className="pulse"></span>
                            LIVE AUCTION
                          </>
                        )}
                        {asset.biddingStatus === 'upcoming' && 'UPCOMING'}
                        {asset.biddingStatus === 'ended' && 'ENDED'}
                        {asset.biddingStatus === 'pending' && 'AUCTION'}
                      </div>
                    )}
                    {asset.isInvestment && (
                      <div className="property-badge property-badge--investment">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        INVESTMENT
                      </div>
                    )}
                    {asset.isRental && (
                      <div className="property-badge property-badge--rental">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                        RENTAL
                      </div>
                    )}
                    {!asset.isBidding && !asset.isInvestment && !asset.isRental && (
                      <div className="property-badge property-badge--general">
                        PROPERTY
                      </div>
                    )}
                  </div>
                  <div className="asset-card__body">
                    <div className="asset-card__top">
                      <h3>{asset.name}</h3>
                      {asset.area && asset.area !== '--' && (
                        <span className="area-badge">{asset.area}</span>
                      )}
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
                    ) : asset.isInvestment ? (
                      <div className="asset-card__metrics">
                        <div>
                          <span>Price/Share</span>
                          <strong>PKR {(asset.pricePerShare || asset.minInvestment / 100).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Expected ROI</span>
                          <strong>{asset.roi}%</strong>
                        </div>
                        <div>
                          <span>Available</span>
                          <strong>{asset.availableShares || 100} shares</strong>
                        </div>
                      </div>
                    ) : asset.isRental ? (
                      <div className="asset-card__metrics">
                        <div>
                          <span>Monthly Rent</span>
                          <strong>PKR {(asset.monthlyRent || 0).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Property Value</span>
                          <strong>PKR {(asset.minInvestment / 1000000).toFixed(1)}M</strong>
                        </div>
                        <div>
                          <span>Yield</span>
                          <strong>{asset.roi}%</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="asset-card__metrics">
                        <div>
                          <span>Price</span>
                          <strong>PKR {(asset.minInvestment / 1000000).toFixed(1)}M</strong>
                        </div>
                        <div>
                          <span>Type</span>
                          <strong style={{textTransform: 'capitalize'}}>{asset.assetType}</strong>
                        </div>
                        <div>
                          <span>Area</span>
                          <strong>{asset.area || '--'}</strong>
                        </div>
                      </div>
                    )}

                    <div className="asset-card__footer">
                      <div className="asset-card__type-indicator">
                        {asset.isBidding && <span className="type-tag type-tag--bidding">Auction</span>}
                        {asset.isInvestment && <span className="type-tag type-tag--investment">Shares</span>}
                        {asset.isRental && <span className="type-tag type-tag--rental">Rental</span>}
                        {!asset.isBidding && !asset.isInvestment && !asset.isRental && <span className="type-tag type-tag--general">Property</span>}
                      </div>
                      {asset.isBidding ? (
                        <button
                          onClick={() => router.push(`/bidding-detail?id=${asset.id}`)}
                          className={`asset-card__btn asset-card__btn--bid ${asset.biddingStatus === 'live' ? 'asset-card__btn--live' : ''}`}
                        >
                          {asset.biddingStatus === 'live' && 'Place Bid'}
                          {asset.biddingStatus === 'upcoming' && 'View Auction'}
                          {asset.biddingStatus === 'ended' && 'View Results'}
                          {asset.biddingStatus === 'pending' && 'View Details'}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        </button>
                      ) : asset.isInvestment ? (
                        <a href={`/investment-shares/${asset.id}`} className="asset-card__btn asset-card__btn--investment">
                          Invest Now
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        </a>
                      ) : asset.isRental ? (
                        <a href={`/rental-detail?id=${asset.id}`} className="asset-card__btn asset-card__btn--rental">
                          View Rental
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                          </svg>
                        </a>
                      ) : (
                        <a href={`/bidding-detail?id=${asset.id}`} className="asset-card__btn">
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

            {loading && (
              <div className="assets__empty">
                <h3>Loading properties...</h3>
                <p>Fetching approved properties from admin.</p>
              </div>
            )}

            {!loading && filteredAssets.length === 0 && (
              <div className="assets__empty">
                <h3>No properties available</h3>
                <p>Properties will appear here once approved by admin.</p>
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
          max-width: 1000px;
          margin: 0 auto;
        }

        .access__btn {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 28px 32px;
          border-radius: 20px;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .access__btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .access__btn--bidding {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid rgba(201, 162, 39, 0.3);
        }

        .access__btn--bidding::before {
          background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
        }

        .access__btn--bidding:hover {
          border-color: rgba(201, 162, 39, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(201, 162, 39, 0.35);
        }

        .access__btn--bidding:hover::before {
          opacity: 1;
        }

        .access__btn--investment {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid rgba(59, 130, 246, 0.3);
        }

        .access__btn--investment::before {
          background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
        }

        .access__btn--investment:hover {
          border-color: rgba(59, 130, 246, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.35);
        }

        .access__btn--investment:hover::before {
          opacity: 1;
        }

        .access__btn-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        .access__btn--bidding .access__btn-icon {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #ffffff;
          box-shadow: 0 8px 20px -4px rgba(201, 162, 39, 0.4);
        }

        .access__btn--investment .access__btn-icon {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: #ffffff;
          box-shadow: 0 8px 20px -4px rgba(59, 130, 246, 0.4);
        }

        .access__btn-content {
          flex: 1;
          position: relative;
          z-index: 1;
        }

        .access__btn-content h3 {
          margin: 0 0 6px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .access__btn-content p {
          margin: 0;
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.5;
        }

        .access__btn-arrow {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .access__btn--bidding .access__btn-arrow {
          background: rgba(201, 162, 39, 0.15);
          color: #92710c;
        }

        .access__btn--investment .access__btn-arrow {
          background: rgba(59, 130, 246, 0.15);
          color: #1d4ed8;
        }

        .access__btn:hover .access__btn-arrow {
          transform: translateX(4px);
        }

        .access__btn--bidding:hover .access__btn-arrow {
          background: rgba(201, 162, 39, 0.25);
        }

        .access__btn--investment:hover .access__btn-arrow {
          background: rgba(59, 130, 246, 0.25);
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

        /* Property Type Badges */
        .property-badge {
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

        .property-badge--bidding {
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
        }

        .property-badge--bidding.bidding-badge--live {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: #fff;
          animation: glow 2s infinite;
        }

        .property-badge--bidding.bidding-badge--upcoming {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
          color: #fff;
        }

        .property-badge--bidding.bidding-badge--ended {
          background: #6b7280;
          color: #fff;
        }

        .property-badge--investment {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
        }

        .property-badge--rental {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
        }

        .property-badge--general {
          background: linear-gradient(135deg, #6b7280, #9ca3af);
          color: #fff;
        }

        .property-badge .pulse {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        /* Area Badge */
        .area-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f3f4f6;
          color: #374151;
          flex-shrink: 0;
        }

        /* Type Tags in Footer */
        .asset-card__type-indicator {
          display: flex;
          align-items: center;
        }

        .type-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .type-tag--bidding {
          background: rgba(201, 162, 39, 0.15);
          color: #92710c;
        }

        .type-tag--investment {
          background: rgba(37, 99, 235, 0.12);
          color: #1d4ed8;
        }

        .type-tag--rental {
          background: rgba(5, 150, 105, 0.12);
          color: #047857;
        }

        .type-tag--general {
          background: rgba(107, 114, 128, 0.12);
          color: #4b5563;
        }

        /* Card Type Variants */
        .asset-card--investment {
          border-color: rgba(37, 99, 235, 0.3);
        }

        .asset-card--investment:hover {
          border-color: rgba(37, 99, 235, 0.5);
          box-shadow: 0 15px 35px -8px rgba(37, 99, 235, 0.15);
        }

        .asset-card--rental {
          border-color: rgba(5, 150, 105, 0.3);
        }

        .asset-card--rental:hover {
          border-color: rgba(5, 150, 105, 0.5);
          box-shadow: 0 15px 35px -8px rgba(5, 150, 105, 0.15);
        }

        /* Button Variants */
        .asset-card__btn--investment {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
        }

        .asset-card__btn--investment:hover {
          box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.4);
        }

        .asset-card__btn--rental {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
        }

        .asset-card__btn--rental:hover {
          box-shadow: 0 8px 20px -4px rgba(5, 150, 105, 0.4);
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

          .access__btn {
            padding: 20px 24px;
            gap: 16px;
          }

          .access__btn-icon {
            width: 52px;
            height: 52px;
          }

          .access__btn-icon svg {
            width: 26px;
            height: 26px;
          }

          .access__btn-content h3 {
            font-size: 1.1rem;
          }

          .access__btn-content p {
            font-size: 0.85rem;
          }

          .access__btn-arrow {
            width: 40px;
            height: 40px;
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

          .access__btn {
            padding: 16px 20px;
            gap: 14px;
          }

          .access__btn-icon {
            width: 48px;
            height: 48px;
          }

          .access__btn-content h3 {
            font-size: 1rem;
          }

          .access__btn-content p {
            font-size: 0.8rem;
          }

          .access__btn-arrow {
            width: 36px;
            height: 36px;
          }

          .access__btn-arrow svg {
            width: 18px;
            height: 18px;
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
