import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Rental() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const { getProperties } = useFirebase()

  const formatPrice = (value) => {
    if (!value) return 'Contact for rent'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'Contact for rent'
    if (num >= 100000) return `PKR ${(num / 1000).toFixed(0)}K/mo`
    return `PKR ${num.toLocaleString()}/mo`
  }

  useEffect(() => {
    setIsClient(true)

    const loadProperties = async () => {
      try {
        let allProps = []

        // Load from Firebase
        try {
          const result = await getProperties({ status: 'approved', type: 'rental' })
          if (result?.success && Array.isArray(result.properties)) {
            allProps = result.properties
          }
        } catch (e) {
          console.warn('Firebase load failed:', e)
        }

        // Load from localStorage as fallback
        const local = JSON.parse(localStorage.getItem('userProperties') || '[]')
        const localRentals = local.filter(p =>
          p.type === 'rental' || p.listingType === 'rental'
        )
        allProps = [...allProps, ...localRentals]

        // Remove duplicates
        const unique = allProps.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)

        const processed = unique.map((p, idx) => ({
          id: p.id || `rental-${idx}`,
          title: p.title || 'Rental Property',
          description: p.description || 'Beautiful property available for rent',
          image: p.images?.[0] || p.image || '/images/property-placeholder.jpg',
          location: p.location || 'Location TBA',
          area: p.areaSize || p.area || p.plotSize || '--',
          price: formatPrice(p.monthlyRent || p.price),
          bedrooms: p.bedrooms || '--',
          bathrooms: p.bathrooms || '--',
          type: p.propertyType || p.category || 'Residential',
          status: p.status === 'vacant' || p.available ? 'Available' : 'Occupied',
          amenities: p.amenities || [],
          createdAt: p.createdAt || Date.now()
        }))

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

    if (selectedType !== 'all') {
      result = result.filter(p => p.type?.toLowerCase() === selectedType)
    }

    if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (selectedSort === 'price-low') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0
        return priceA - priceB
      })
    } else if (selectedSort === 'price-high') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0
        return priceB - priceA
      })
    }

    setFilteredProperties(result)
  }, [searchQuery, selectedType, selectedSort, properties])

  const availableCount = properties.filter(p => p.status === 'Available').length

  if (!isClient) return null

  return (
    <>
      <Head>
        <title>Rentals - REMMIC</title>
        <meta name="description" content="Find your perfect rental property with REMMIC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main className="rental">
        {/* Hero */}
        <section className="rental-hero">
          <div className="rental-hero__container">
            <div className="rental-hero__content">
              <span className="rental-hero__eyebrow">Rental Properties</span>
              <h1 className="rental-hero__title">
                Find Your Perfect<br />
                <span className="rental-hero__accent">Rental Home</span>
              </h1>
              <p className="rental-hero__desc">
                Browse verified rental properties with transparent pricing.
                From apartments to villas, find the perfect space for your lifestyle.
              </p>
              <div className="rental-hero__stats">
                <div className="rental-hero__stat">
                  <span className="rental-hero__stat-value">{properties.length}</span>
                  <span className="rental-hero__stat-label">Properties</span>
                </div>
                <div className="rental-hero__stat">
                  <span className="rental-hero__stat-value">{availableCount}</span>
                  <span className="rental-hero__stat-label">Available</span>
                </div>
                <div className="rental-hero__stat">
                  <span className="rental-hero__stat-value">100%</span>
                  <span className="rental-hero__stat-label">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rental-filters">
          <div className="rental-filters__container">
            <div className="rental-filters__search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by location or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="rental-filters__options">
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
              </select>
              <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="rental-properties">
          <div className="rental-properties__container">
            <div className="rental-properties__header">
              <h2 className="rental-properties__title">
                {selectedType === 'all' ? 'All Rentals' : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Rentals`}
              </h2>
              <span className="rental-properties__count">{filteredProperties.length} properties</span>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="rental-properties__grid">
                {filteredProperties.map((property) => (
                  <article key={property.id} className="rental-card">
                    <div className="rental-card__image">
                      <img src={property.image} alt={property.title} loading="lazy" />
                      <span className={`rental-card__badge rental-card__badge--${property.status === 'Available' ? 'available' : 'occupied'}`}>
                        {property.status}
                      </span>
                      <div className="rental-card__price">{property.price}</div>
                    </div>

                    <div className="rental-card__body">
                      <div className="rental-card__header">
                        <h3 className="rental-card__title">{property.title}</h3>
                        <p className="rental-card__location">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {property.location}
                        </p>
                      </div>

                      <div className="rental-card__features">
                        <div className="rental-card__feature">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                          </svg>
                          <span>{property.area}</span>
                        </div>
                        <div className="rental-card__feature">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 4v16M22 4v16M6 20h12M6 4h12"/>
                          </svg>
                          <span>{property.bedrooms} Beds</span>
                        </div>
                        <div className="rental-card__feature">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 6l6 6-6 6"/>
                          </svg>
                          <span>{property.bathrooms} Baths</span>
                        </div>
                      </div>

                      <p className="rental-card__desc">{property.description}</p>

                      <a href={`/rental-detail?id=${property.id}`} className="rental-card__cta">
                        View Details
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rental-properties__empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>
                </svg>
                <h3>No Rental Properties Found</h3>
                <p>Adjust your filters or check back soon for new listings.</p>
                <a href="/land-registration" className="rental-properties__empty-cta">
                  List Your Property
                </a>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="rental-how">
          <div className="rental-how__container">
            <div className="rental-how__header">
              <span className="rental-how__eyebrow">How It Works</span>
              <h2 className="rental-how__title">Rent with Confidence</h2>
            </div>

            <div className="rental-how__steps">
              <div className="rental-step">
                <div className="rental-step__number">01</div>
                <h3 className="rental-step__title">Browse Properties</h3>
                <p className="rental-step__desc">Explore verified rental listings with real photos and accurate details.</p>
              </div>
              <div className="rental-step">
                <div className="rental-step__number">02</div>
                <h3 className="rental-step__title">Schedule Viewing</h3>
                <p className="rental-step__desc">Book a visit to see the property in person or take a virtual tour.</p>
              </div>
              <div className="rental-step">
                <div className="rental-step__number">03</div>
                <h3 className="rental-step__title">Sign & Move In</h3>
                <p className="rental-step__desc">Complete digital paperwork and get your keys. It's that simple.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="rental-cta">
          <div className="rental-cta__container">
            <div className="rental-cta__content">
              <h2>Have a Property to Rent?</h2>
              <p>List your property on REMMIC and reach verified tenants</p>
              <div className="rental-cta__buttons">
                <a href="/land-registration" className="rental-cta__btn rental-cta__btn--primary">
                  List Property
                </a>
                <a href="/contact" className="rental-cta__btn rental-cta__btn--secondary">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .rental {
          background: #f9fafb;
          padding-top: 80px;
        }

        /* Hero */
        .rental-hero {
          padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .rental-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -30%;
          width: 80%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(201, 162, 39, 0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .rental-hero__container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .rental-hero__content {
          max-width: 650px;
        }

        .rental-hero__eyebrow {
          display: inline-block;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .rental-hero__title {
          margin: 0 0 20px;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
        }

        .rental-hero__accent {
          color: #c9a227;
        }

        .rental-hero__desc {
          margin: 0 0 32px;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
        }

        .rental-hero__stats {
          display: flex;
          gap: 40px;
        }

        .rental-hero__stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rental-hero__stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #c9a227;
        }

        .rental-hero__stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Filters */
        .rental-filters {
          padding: 24px clamp(20px, 4vw, 48px);
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 80px;
          z-index: 100;
        }

        .rental-filters__container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .rental-filters__search {
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

        .rental-filters__search input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1rem;
          color: #111827;
          outline: none;
        }

        .rental-filters__search input::placeholder {
          color: #9ca3af;
        }

        .rental-filters__options {
          display: flex;
          gap: 12px;
        }

        .rental-filters__options select {
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #374151;
          background: #ffffff;
          cursor: pointer;
          outline: none;
        }

        /* Properties */
        .rental-properties {
          padding: clamp(40px, 6vw, 80px) clamp(20px, 4vw, 48px);
        }

        .rental-properties__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .rental-properties__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .rental-properties__title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .rental-properties__count {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .rental-properties__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        /* Rental Card */
        .rental-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .rental-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }

        .rental-card__image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .rental-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .rental-card:hover .rental-card__image img {
          transform: scale(1.05);
        }

        .rental-card__badge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .rental-card__badge--available {
          background: #10b981;
          color: #ffffff;
        }

        .rental-card__badge--occupied {
          background: #6b7280;
          color: #ffffff;
        }

        .rental-card__price {
          position: absolute;
          bottom: 14px;
          right: 14px;
          padding: 8px 14px;
          background: rgba(0, 0, 0, 0.8);
          color: #c9a227;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 10px;
        }

        .rental-card__body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rental-card__header {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rental-card__title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
        }

        .rental-card__location {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .rental-card__features {
          display: flex;
          gap: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 10px;
        }

        .rental-card__feature {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .rental-card__desc {
          margin: 0;
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rental-card__cta {
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

        .rental-card__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -6px rgba(201, 162, 39, 0.5);
        }

        /* Empty State */
        .rental-properties__empty {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .rental-properties__empty svg {
          margin-bottom: 24px;
          color: #d1d5db;
        }

        .rental-properties__empty h3 {
          margin: 0 0 8px;
          font-size: 1.3rem;
          color: #374151;
        }

        .rental-properties__empty p {
          margin: 0 0 24px;
        }

        .rental-properties__empty-cta {
          display: inline-flex;
          padding: 12px 24px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 10px;
          color: #0a0a0a;
          font-weight: 600;
          text-decoration: none;
        }

        /* How It Works */
        .rental-how {
          padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
          background: #ffffff;
        }

        .rental-how__container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .rental-how__header {
          text-align: center;
          margin-bottom: 48px;
        }

        .rental-how__eyebrow {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .rental-how__title {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #111827;
        }

        .rental-how__steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .rental-step {
          text-align: center;
          padding: 32px 24px;
          background: #f9fafb;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }

        .rental-step__number {
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

        .rental-step__title {
          margin: 0 0 12px;
          font-size: 1.15rem;
          font-weight: 600;
          color: #111827;
        }

        .rental-step__desc {
          margin: 0;
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.6;
        }

        /* CTA */
        .rental-cta {
          padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .rental-cta__container {
          max-width: 800px;
          margin: 0 auto;
        }

        .rental-cta__content {
          text-align: center;
        }

        .rental-cta__content h2 {
          margin: 0 0 12px;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #ffffff;
        }

        .rental-cta__content p {
          margin: 0 0 32px;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .rental-cta__buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .rental-cta__btn {
          display: inline-flex;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .rental-cta__btn--primary {
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
        }

        .rental-cta__btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(201, 162, 39, 0.3);
        }

        .rental-cta__btn--secondary {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .rental-cta__btn--secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .rental-properties__grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .rental-how__steps {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }

        @media (max-width: 640px) {
          .rental-hero__stats {
            flex-direction: column;
            gap: 16px;
          }

          .rental-filters__container {
            flex-direction: column;
          }

          .rental-filters__options {
            width: 100%;
          }

          .rental-filters__options select {
            flex: 1;
          }

          .rental-properties__grid {
            grid-template-columns: 1fr;
          }

          .rental-properties__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </>
  )
}
