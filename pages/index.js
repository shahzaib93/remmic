import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'
import { ensurePropertyImage } from '../utils/propertyStorage'
import { formatPrice, parsePriceNumber } from '../utils/priceFormat'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function Home() {
  const { getAllProperties } = useFirebase()
  const [isVisible, setIsVisible] = useState(false)
  const [trustVisible, setTrustVisible] = useState(false)
  const [highDemandProperties, setHighDemandProperties] = useState([])
  const trustRef = useRef(null)

  const buildHighDemandProperties = (properties = []) => {
    return properties
      .filter((property) => {
        const status = (property.statusCode || property.status || '').toLowerCase()
        return status !== 'rejected' && status !== 'archived'
      })
      .slice(0, 8)
      .map((property, index) => {
        const price = parsePriceNumber(property.priceNumeric ?? property.price ?? property.guidePrice) || 0

        // Deterministic variation based on property price and index (avoids hydration mismatch)
        const seed = ((price % 1000) / 1000)
        let roi = 8.5 + (seed * 6) // Base 8.5% + up to 6% variation

        if (property.propertyType?.includes('Commercial') || property.propertyType?.includes('Office')) {
          roi += 3 // Commercial properties typically have higher ROI
        }
        if (price > 50000000) {
          roi += 2 // Higher-value properties often have better ROI
        }
        if (property.badge === 'Featured') {
          roi += 1.5 // Featured properties have premium ROI
        }

        // Determine risk level based on price and property type
        let risk = 'Medium Risk'
        const bedrooms = Number(property.beds ?? property.bedrooms) || 0
        if (price < 20000000 && bedrooms <= 3) {
          risk = 'Low Risk'
        } else if (price > 70000000 || property.propertyType?.includes('Commercial')) {
          risk = 'High Risk'
        }

        // Generate status based on property badge and type
        let status = property.status || 'Available'
        if (property.badge === 'Featured') {
          status = 'Featured'
        } else if (property.badge === 'Auction') {
          status = 'Live Auction'
        } else if (property.badge === 'New') {
          status = 'Just Listed'
        } else if (property.type === 'auction' || property.type === 'bidding') {
          status = 'Bidding Live'
        }

        // Calculate minimum investment (typically 20-30% of property value)
        const minInvestmentPercent = 0.2 + (((index + 1) * 7 % 10) / 100) // deterministic 20-29%
        const minInvestment = Math.round(price * minInvestmentPercent / 100000) * 100000

        return {
          ...property,
          price,
          beds: bedrooms,
          baths: Number(property.baths ?? property.bathrooms) || 0,
          area: property.areaSize || property.area || 'Area not specified',
          image: ensurePropertyImage(property),
          roi: roi.toFixed(1),
          risk,
          status,
          minInvestment,
          // Add display title for cards
          displayTitle: property.title?.length > 25 ? `${property.title.substring(0, 22)}...` : property.title || 'Property Listing'
        }
      })
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isActive = true

    const loadProperties = async () => {
      try {
        const result = await getAllProperties()
        const properties = Array.isArray(result?.properties) ? result.properties : []
        if (isActive) {
          setHighDemandProperties(buildHighDemandProperties(properties))
        }
      } catch (error) {
        console.error('Failed to load high-demand properties:', error)
        if (isActive) {
          setHighDemandProperties([])
        }
      }
    }

    loadProperties()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === trustRef.current && entry.isIntersecting) {
            setTrustVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (trustRef.current) observer.observe(trustRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Head>
        <title>REMMIC - Real Estate Evaluation, Marketing, Management & Investment</title>
        <meta name="description" content="REMMIC is a technology-driven PropTech ecosystem delivering end-to-end transparency across property evaluation, legal verification, marketing, auctions, and fractional ownership." />
        <meta content="REMMIC - Real Assets Real Ownership Real Liquidity" property="og:title"/>
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="main-wrapper">
          {/* Hero Section */}
          <section className="hero">
            <div className="hero__container">
              <div className="hero__content" style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease'
              }}>
                <h1 className="hero__title">
                  Real Assets<br />
                  Real Ownership<br />
                  <span className="hero__title-accent">Real Liquidity</span>
                </h1>
                <p className="hero__description">
                  A secure platform to evaluate, manage, invest, and trade real‑world assets through fractional ownership and institutional‑grade governance.
                </p>
                <div className="hero__cta">
                  <a 
                    href="/marketplace" 
                    className="btn btn--primary btn--large"
                    aria-label="Explore REMMIC marketplace to view available properties"
                  >
                    <span>Explore Marketplace</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                  <a 
                    href="/silver-founders" 
                    className="btn btn--outline btn--large"
                    aria-label="Join the Silver Founders program for exclusive benefits"
                  >
                    <span>Become a Silver Founder</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="hero__visual" style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
                transition: 'all 0.8s ease 0.3s'
              }}>
                <div className="hero__image-main">
                  <img 
                    src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" 
                    alt="Luxury residential property showcasing REMMIC's premium real estate investment opportunities" 
                    loading="eager"
                  />
                </div>
              </div>
            </div>

          </section>

          {/* Story Section - Scroll Narrative */}
          <section className="story">
            <div className="story__container">
              <div className="story__header" data-aos="fade-up" data-aos-duration="1000">
                <h2 className="story__main-title">
                  Revolutionizing Real Estate with <span className="story__title-accent">Technology & Trust</span>
                </h2>
                <p className="story__subtitle">
                  From traditional barriers to modern solutions — see how REMMIC is transforming 
                  the future of property investment through innovation and institutional-grade security.
                </p>
              </div>

              <div className="story__content">
                <div className="story__challenge" 
                     data-aos="fade-right" 
                     data-aos-duration="1000" 
                     data-aos-delay="200">
                  <div className="story__section-badge story__section-badge--problem">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    The Problem
                  </div>
                  <h3 className="story__section-title" data-aos="fade-up" data-aos-delay="400">
                    Traditional Real Estate is Broken
                  </h3>
                  <div className="story__narrative" data-aos="fade-up" data-aos-delay="600">
                    <p>
                      For decades, real estate investment has been the privilege of the wealthy. 
                      High capital requirements, lengthy transaction processes, and opaque market 
                      conditions have created an exclusive ecosystem that locks out millions of potential investors.
                    </p>
                    <p>
                      Properties sit illiquid for months, investors face uncertain valuations, 
                      and management processes remain inefficient and costly. The industry desperately 
                      needs modernization to unlock its true potential.
                    </p>
                  </div>
                </div>

                <div className="story__solution" 
                     data-aos="fade-left" 
                     data-aos-duration="1000" 
                     data-aos-delay="400">
                  <div className="story__section-badge story__section-badge--solution">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    The Solution
                  </div>
                  <h3 className="story__section-title" data-aos="fade-up" data-aos-delay="600">
                    REMMIC: The Future of Property Investment
                  </h3>
                  <div className="story__narrative" data-aos="fade-up" data-aos-delay="800">
                    <p>
                      We're democratizing real estate through innovative technology and institutional-grade security. 
                      With fractional ownership, instant liquidity, and complete transparency, REMMIC makes 
                      property investment accessible to everyone — from $100 to millions.
                    </p>
                    <p>
                      Our platform combines AI-powered valuations, blockchain verification, and regulatory 
                      compliance to create a trustworthy ecosystem where properties can be evaluated, 
                      managed, and traded with unprecedented efficiency and security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What REMMIC Does Section */}
          <section className="what-remmic-does">
            <div className="what-remmic-does__container">
              <div className="what-remmic-does__header" data-aos="fade-up" data-aos-duration="1000">
                <span className="what-remmic-does__eyebrow">What REMMIC Does</span>
                <h2 className="what-remmic-does__title">
                  Three Core Solutions for Real Estate Excellence
                </h2>
                <p className="what-remmic-does__subtitle">
                  End-to-end real estate services powered by institutional-grade technology
                </p>
              </div>

              <div className="what-remmic-does__grid">
                {/* Evaluate Assets */}
                <div className="remmic-card" 
                     data-aos="fade-up" 
                     data-aos-duration="1000" 
                     data-aos-delay="200">
                  <div className="remmic-card__icon remmic-card__icon--evaluate">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" fillOpacity="0.2"/>
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="remmic-card__title">Evaluate Assets</h3>
                  <p className="remmic-card__description">
                    AI-powered property valuation with certified evaluators, 
                    market intelligence, and comprehensive risk assessment.
                  </p>
                  <ul className="remmic-card__features">
                    <li>AI-based price estimation</li>
                    <li>Legal verification & title checks</li>
                    <li>Market analysis & trends</li>
                    <li>REM Verified certification</li>
                  </ul>
                </div>

                {/* Manage Assets */}
                <div className="remmic-card remmic-card--featured" 
                     data-aos="fade-up" 
                     data-aos-duration="1000" 
                     data-aos-delay="400">
                  <div className="remmic-card__icon remmic-card__icon--manage">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="18" cy="6" r="3" fill="currentColor" fillOpacity="0.8"/>
                      <path d="M16.5 6L17.5 7L19.5 5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="6" y="16" width="8" height="2" rx="1" fill="currentColor" fillOpacity="0.4"/>
                      <rect x="6" y="7" width="6" height="1.5" rx="0.75" fill="currentColor" fillOpacity="0.3"/>
                    </svg>
                  </div>
                  <h3 className="remmic-card__title">Manage Assets</h3>
                  <p className="remmic-card__description">
                    Complete property management with rental services, 
                    maintenance networks, and smart-contract execution.
                  </p>
                  <ul className="remmic-card__features">
                    <li>Rental & tenant management</li>
                    <li>Maintenance coordination</li>
                    <li>Financial reporting</li>
                    <li>Smart-contract automation</li>
                  </ul>
                </div>

                {/* Invest & Trade */}
                <div className="remmic-card" 
                     data-aos="fade-up" 
                     data-aos-duration="1000" 
                     data-aos-delay="600">
                  <div className="remmic-card__icon remmic-card__icon--invest">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12L7 7L12 12L22 2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7" cy="7" r="2" fill="currentColor" fillOpacity="0.8"/>
                      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.6"/>
                      <circle cx="22" cy="2" r="2" fill="currentColor"/>
                      <rect x="16" y="6" width="6" height="12" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M18 14V10M20 14V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 20L8 15L13 18L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                    </svg>
                  </div>
                  <h3 className="remmic-card__title">Invest & Trade</h3>
                  <p className="remmic-card__description">
                    Fractional ownership, instant liquidity, and transparent 
                    trading with global marketplace access.
                  </p>
                  <ul className="remmic-card__features">
                    <li>Fractional ownership</li>
                    <li>Instant liquidity trading</li>
                    <li>Global marketplace access</li>
                    <li>Transparent pricing</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Live Hot Assets Strip */}
          <section className="hot-assets-strip">
            <div className="hot-assets-strip__container">
              <div className="hot-assets-strip__header">
                <h2 className="hot-assets-strip__title">High‑Demand Opportunities</h2>
              </div>
              
              <div className="hot-assets-strip__scroll">
                <div className="hot-assets-strip__track">
                  {/* Render dynamic properties */}
                  {highDemandProperties.map((property, index) => (
                    <div key={property.id} className="hot-asset-card">
                      <div className="hot-asset-card__image">
                        <img 
                          src={property.image} 
                          alt={property.title}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
                          }}
                        />
                        <div className={`hot-asset-card__status ${property.status === 'Featured' ? 'hot-asset-card__status--featured' : ''}`}>
                          <span className="hot-asset-card__status-dot"></span>
                          {property.status}
                        </div>
                      </div>
                      <div className="hot-asset-card__content">
                        <div className="hot-asset-card__insurance">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                          REM Verified
                        </div>
                        <h4 className="hot-asset-card__title">{property.displayTitle}</h4>
                        <div className="hot-asset-card__metrics">
                          <span className="hot-asset-card__roi">{property.roi}% ROI</span>
                          <span className={`hot-asset-card__risk ${
                            property.risk === 'Low Risk' ? 'hot-asset-card__risk--low' : 
                            property.risk === 'High Risk' ? 'hot-asset-card__risk--high' : 
                            'hot-asset-card__risk--medium'
                          }`}>
                            {property.risk}
                          </span>
                        </div>
                        <div className="hot-asset-card__details">
                          <span>
                            {property.beds ? `${property.beds} Bed` : ''} 
                            {property.beds && property.baths ? ' • ' : ''}
                            {property.baths ? `${property.baths} Bath` : ''} 
                            {(property.beds || property.baths) && property.area ? ' • ' : ''}
                            {property.area} • {property.city}
                          </span>
                        </div>
                        <div className="hot-asset-card__min">
                          <span>Min. Investment:</span>
                          <strong>{formatPrice(property.minInvestment)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Duplicate first few cards for seamless loop */}
                  {highDemandProperties.slice(0, 3).map((property, index) => (
                    <div key={`duplicate-${property.id}`} className="hot-asset-card">
                      <div className="hot-asset-card__image">
                        <img 
                          src={property.image} 
                          alt={property.title}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
                          }}
                        />
                        <div className={`hot-asset-card__status ${property.status === 'Featured' ? 'hot-asset-card__status--featured' : ''}`}>
                          <span className="hot-asset-card__status-dot"></span>
                          {property.status}
                        </div>
                      </div>
                      <div className="hot-asset-card__content">
                        <div className="hot-asset-card__insurance">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                          REM Verified
                        </div>
                        <h4 className="hot-asset-card__title">{property.displayTitle}</h4>
                        <div className="hot-asset-card__metrics">
                          <span className="hot-asset-card__roi">{property.roi}% ROI</span>
                          <span className={`hot-asset-card__risk ${
                            property.risk === 'Low Risk' ? 'hot-asset-card__risk--low' : 
                            property.risk === 'High Risk' ? 'hot-asset-card__risk--high' : 
                            'hot-asset-card__risk--medium'
                          }`}>
                            {property.risk}
                          </span>
                        </div>
                        <div className="hot-asset-card__details">
                          <span>
                            {property.beds ? `${property.beds} Bed` : ''} 
                            {property.beds && property.baths ? ' • ' : ''}
                            {property.baths ? `${property.baths} Bath` : ''} 
                            {(property.beds || property.baths) && property.area ? ' • ' : ''}
                            {property.area} • {property.city}
                          </span>
                        </div>
                        <div className="hot-asset-card__min">
                          <span>Min. Investment:</span>
                          <strong>{formatPrice(property.minInvestment)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hot-assets-strip__cta">
                <a href="/marketplace" className="hot-assets-strip__cta-button">
                  <span>View All Properties</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* Trust & Security Section */}
          <section ref={trustRef} className="trust">
            <div className="trust__container">
              <div className="trust__header" style={{
                opacity: trustVisible ? 1 : 0,
                transform: trustVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s ease'
              }}>
                <span className="trust__eyebrow">Trust & Security</span>
                <h2 className="trust__title">Institutional-Grade Protection</h2>
                <p className="trust__subtitle">
                  Built on regulated frameworks with complete investor protection
                </p>
              </div>

              {/* Trust Pillars */}
              <div className="trust__pillars" style={{
                opacity: trustVisible ? 1 : 0,
                transform: trustVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: 'all 0.6s ease 0.2s'
              }}>
                {/* Insurance Partners */}
                <div className="trust__pillar">
                  <div className="trust__pillar-header">
                    <div className="trust__pillar-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                    </div>
                    <h3 className="trust__pillar-title">Insurance Partners</h3>
                    <p className="trust__pillar-subtitle">Comprehensive protection for all investments</p>
                  </div>
                  
                  <div className="trust__pillar-content">
                    <div className="trust__insurance-partners">
                      <div className="trust__partner">
                        <div className="trust__partner-logo">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <div className="trust__partner-info">
                          <h4>State Life Insurance</h4>
                          <span>Property & Liability Coverage</span>
                        </div>
                      </div>
                      
                      <div className="trust__partner">
                        <div className="trust__partner-logo">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                        </div>
                        <div className="trust__partner-info">
                          <h4>Jubilee Insurance</h4>
                          <span>Investment Protection Plans</span>
                        </div>
                      </div>
                      
                      <div className="trust__partner">
                        <div className="trust__partner-logo">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                        <div className="trust__partner-info">
                          <h4>EFU General</h4>
                          <span>Risk Management Solutions</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Amanorx Group Backing */}
                <div className="trust__pillar trust__pillar--featured">
                  <div className="trust__pillar-header">
                    <div className="trust__pillar-badge">Parent Company</div>
                    <div className="trust__pillar-icon trust__pillar-icon--amanorx">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h3 className="trust__pillar-title">Amanorx Group</h3>
                    <p className="trust__pillar-subtitle">Backed by Pakistan's leading conglomerate</p>
                  </div>
                  
                  <div className="trust__pillar-content">
                    <div className="trust__amanorx-stats">
                      <div className="trust__amanorx-stat">
                        <span className="trust__amanorx-number">25+</span>
                        <span className="trust__amanorx-label">Years Experience</span>
                      </div>
                      <div className="trust__amanorx-stat">
                        <span className="trust__amanorx-number">$2B+</span>
                        <span className="trust__amanorx-label">Assets Under Management</span>
                      </div>
                      <div className="trust__amanorx-stat">
                        <span className="trust__amanorx-number">15+</span>
                        <span className="trust__amanorx-label">Business Verticals</span>
                      </div>
                    </div>
                    
                    <div className="trust__amanorx-sectors">
                      <div className="trust__sector">Real Estate Development</div>
                      <div className="trust__sector">Financial Services</div>
                      <div className="trust__sector">Technology Solutions</div>
                      <div className="trust__sector">Construction & Infrastructure</div>
                    </div>
                    
                    <a href="/amanorx-group" className="trust__amanorx-link">
                      <span>Learn About Amanorx Group</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Multi-Jurisdiction Roadmap */}
                <div className="trust__pillar">
                  <div className="trust__pillar-header">
                    <div className="trust__pillar-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <h3 className="trust__pillar-title">Global Expansion</h3>
                    <p className="trust__pillar-subtitle">Multi-jurisdiction regulatory roadmap</p>
                  </div>
                  
                  <div className="trust__pillar-content">
                    <div className="trust__roadmap">
                      <div className="trust__roadmap-item trust__roadmap-item--completed">
                        <div className="trust__roadmap-flag">
                          <span className="trust__roadmap-flag-icon">🇵🇰</span>
                        </div>
                        <div className="trust__roadmap-content">
                          <h4>Pakistan</h4>
                          <span className="trust__roadmap-status">Live • SECP Regulated</span>
                          <p>Fully operational under SECP sandbox framework</p>
                        </div>
                      </div>
                      
                      <div className="trust__roadmap-item trust__roadmap-item--in-progress">
                        <div className="trust__roadmap-flag">
                          <span className="trust__roadmap-flag-icon">🇦🇪</span>
                        </div>
                        <div className="trust__roadmap-content">
                          <h4>UAE</h4>
                          <span className="trust__roadmap-status">Q2 2026 • ADGM License</span>
                          <p>Dubai and Abu Dhabi market entry</p>
                        </div>
                      </div>
                      
                      <div className="trust__roadmap-item">
                        <div className="trust__roadmap-flag">
                          <span className="trust__roadmap-flag-icon">🇸🇬</span>
                        </div>
                        <div className="trust__roadmap-content">
                          <h4>Singapore</h4>
                          <span className="trust__roadmap-status">Q4 2026 • MAS Compliance</span>
                          <p>Southeast Asia hub development</p>
                        </div>
                      </div>
                      
                      <div className="trust__roadmap-item">
                        <div className="trust__roadmap-flag">
                          <span className="trust__roadmap-flag-icon">🇬🇧</span>
                        </div>
                        <div className="trust__roadmap-content">
                          <h4>United Kingdom</h4>
                          <span className="trust__roadmap-status">2027 • FCA Authorization</span>
                          <p>European market expansion</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="trust__cta" style={{
                opacity: trustVisible ? 1 : 0,
                transform: trustVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease 0.4s'
              }}>
                <a href="/about" className="btn btn--outline-light">
                  <span>Learn About Our Governance</span>
                </a>
              </div>
            </div>
          </section>

          {/* Footer CTA Section */}
          <section className="footer-cta">
            <div className="footer-cta__container">
              <div className="footer-cta__content">
                <h2 className="footer-cta__title">
                  Start Investing in <span className="footer-cta__accent">Real Assets</span>
                </h2>

                <p className="footer-cta__subtitle">
                  Join Pakistan's first institutional-grade PropTech ecosystem.
                  Whether you're an investor, property owner, or developer.
                </p>

                <div className="footer-cta__actions">
                  <a href="/signup" className="btn btn--primary btn--large">
                    <span>Start Investing in Real Assets</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                  <a href="/contact" className="btn btn--dark btn--large">
                    <span>Talk to Advisor</span>
                  </a>
                </div>
              </div>
              <div className="footer-cta__image">
                <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" alt="Real Estate Investment Platform" />
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>

      <style jsx>{`
        /* ===== REMMIC Home Page Styles ===== */
        
        /* Performance Optimizations */
        * {
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          -ms-transform: translateZ(0);
          -o-transform: translateZ(0);
          transform: translateZ(0);
        }

        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        body {
          overflow-x: hidden;
          background: #0a0a0a;
          min-height: 100vh;
        }

        html {
          background: #0a0a0a;
        }

        /* Main page container */
        .page-wrapper {
          background: #0a0a0a;
          min-height: 100vh;
          position: relative;
        }

        .main-wrapper {
          background: #0a0a0a;
          position: relative;
          z-index: 1;
        }

        /* Additional Performance Optimizations */
        .what-remmic-does,
        .hot-assets-strip,
        .trust,
        .story {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .remmic-card::before,
        .remmic-card::after,
        .remmic-card--featured::before,
        .remmic-card--featured::after {
          will-change: opacity;
          transform: translateZ(0);
        }

        /* Hero Section */
        .hero {
          padding: 120px 5% 100px;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          min-height: 100vh;
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
          background: 
            radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(74, 55, 40, 0.02) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .hero__content {
          max-width: 560px;
        }

        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.4);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.1);
        }

        .hero__badge:hover {
          background: rgba(201, 162, 39, 0.18);
          border-color: rgba(201, 162, 39, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 162, 39, 0.15);
        }

        .hero__badge::before {
          content: '🏛️';
          font-size: 16px;
        }

        .hero__title {
          font-size: clamp(2.75rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.25;
          color: #ffffff;
          margin: 0 0 28px;
          letter-spacing: -0.025em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .hero__title-accent {
          color: #c9a227;
          text-shadow: 0 0 30px rgba(201, 162, 39, 0.3);
        }

        .hero__description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.75;
          margin: 0 0 40px;
          font-weight: 400;
          letter-spacing: 0.01em;
          max-width: 480px;
        }

        .hero__cta {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .hero__visual {
          position: relative;
        }

        .hero__image-main {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.25);
          transform: perspective(1000px) rotateY(-2deg);
        }

        .hero__image-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(201, 162, 39, 0.1) 100%);
          z-index: 1;
          opacity: 0;
        }

        .hero__image-main img {
          width: 100%;
          height: 500px;
          object-fit: cover;
        }

        .hero__badge-verified {
          position: absolute;
          bottom: 24px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(201, 162, 39, 0.4);
          border-radius: 100px;
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          z-index: 2;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: verifiedBadgePulse 3s ease-in-out infinite;
        }

        @keyframes verifiedBadgePulse {
          0%, 100% { 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(201, 162, 39, 0.4);
          }
          50% { 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(201, 162, 39, 0.1);
          }
        }

        .hero__stats {
          max-width: 1200px;
          margin: 60px auto 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          padding: 40px 60px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .hero__stat {
          text-align: center;
        }

        .hero__stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: #c9a227;
          margin-bottom: 8px;
        }

        .hero__stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .hero__stat-divider {
          width: 1px;
          height: 50px;
          background: rgba(201, 162, 39, 0.3);
        }

        /* Story Section */
        .story {
          padding: 80px 5% 100px;
          background: #ffffff;
        }

        .story__container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
        }

        .story__header {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 64px;
        }

        .story__main-title {
          font-size: clamp(1.875rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 16px;
          line-height: 1.25;
        }

        .story__title-accent {
          color: #c9a227;
        }

        .story__subtitle {
          font-size: 1.0625rem;
          color: #6b7280;
          line-height: 1.75;
          margin: 0 auto;
          max-width: 640px;
        }

        .story__content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
          position: relative;
        }

        .story__content::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 40px;
          bottom: 40px;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(201, 162, 39, 0.2), transparent);
          transform: translateX(-50%);
        }

        .story__section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .story__section-badge--problem {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        .story__section-badge--solution {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        }

        .story__section-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 24px;
          line-height: 1.3;
        }

        .story__narrative {
          margin-bottom: 40px;
        }

        .story__narrative p {
          font-size: 0.9375rem;
          color: #4b5563;
          line-height: 1.75;
          margin: 0 0 14px;
        }

        /* What REMMIC Does Section */
        .what-remmic-does {
          padding: 100px 5%;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .what-remmic-does::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(201, 162, 39, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(74, 55, 40, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 10%, rgba(59, 130, 246, 0.08) 0%, transparent 30%),
            radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 35%),
            radial-gradient(circle at 70% 30%, rgba(34, 197, 94, 0.08) 0%, transparent 25%),
            linear-gradient(45deg, rgba(255, 255, 255, 0.02) 0%, transparent 25%, rgba(255, 255, 255, 0.01) 50%, transparent 75%, rgba(255, 255, 255, 0.02) 100%);
          background-size: 100% 100%, 100% 100%, 60% 60%, 80% 80%, 70% 70%, 200px 200px;
          pointer-events: none;
          animation: backgroundShift 20s ease-in-out infinite;
        }

        @keyframes backgroundShift {
          0%, 100% { 
            background-position: 0% 0%, 100% 100%, 20% 20%, 80% 80%, 70% 30%, 0% 0%;
          }
          50% { 
            background-position: 10% 10%, 90% 90%, 30% 10%, 70% 90%, 60% 40%, 100% 100%;
          }
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          .what-remmic-does::before {
            animation: none;
          }
          
          .hot-assets-strip__track {
            animation: none;
          }
          
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        .what-remmic-does__container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .what-remmic-does__header {
          text-align: center;
          margin-bottom: 80px;
        }

        .what-remmic-does__eyebrow {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 100px;
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }

        .what-remmic-does__title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 16px;
          line-height: 1.2;
        }

        .what-remmic-does__subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .what-remmic-does__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          align-items: stretch;
        }

        .remmic-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 36px;
          position: relative;
          overflow: hidden;
          text-align: center;
          will-change: transform;
          transform: translateZ(0);
          display: flex;
          flex-direction: column;
          min-height: 420px;
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transition: all 0.3s ease;
        }

        .remmic-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: rgba(201, 162, 39, 0.25);
        }

        .remmic-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0.08) 100%),
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
          opacity: 1;
          pointer-events: none;
        }

        .remmic-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.03) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.02) 50%, transparent 70%);
          opacity: 1;
          pointer-events: none;
        }

        .remmic-card--featured {
          background: rgba(201, 162, 39, 0.05);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
          border-color: rgba(201, 162, 39, 0.25);
          will-change: transform;
          transform: translateZ(0);
          box-shadow:
            0 4px 32px rgba(201, 162, 39, 0.15),
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .remmic-card--featured:hover {
          box-shadow:
            0 8px 40px rgba(201, 162, 39, 0.25),
            0 6px 20px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .remmic-card--featured::before {
          background: 
            linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(201, 162, 39, 0.05) 50%, rgba(201, 162, 39, 0.15) 100%),
            radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.12) 0%, transparent 50%);
        }

        .remmic-card--featured::after {
          background: 
            linear-gradient(45deg, transparent 30%, rgba(201, 162, 39, 0.08) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(201, 162, 39, 0.05) 50%, transparent 70%);
        }


        .remmic-card__icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(218, 165, 32, 0.1) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(201, 162, 39, 0.4);
          border-radius: 16px;
          color: #d4af37;
          margin: 0 auto 28px;
          position: relative;
          z-index: 3;
          will-change: transform;
          transform: translateZ(0);
          box-shadow:
            0 4px 12px rgba(201, 162, 39, 0.15);
        }

        .remmic-card__icon svg {
          display: block;
          margin: 0 auto;
        }

        .remmic-card__icon--evaluate {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%);
          color: #ffd700;
          border-color: rgba(255, 215, 0, 0.6);
          will-change: transform;
          transform: translateZ(0);
          box-shadow: 
            0 4px 16px rgba(255, 215, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(255, 215, 0, 0.3);
        }

        .remmic-card__icon--manage {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.35) 0%, rgba(184, 134, 11, 0.25) 100%);
          color: #eab308;
          border-color: rgba(234, 179, 8, 0.6);
          will-change: transform;
          transform: translateZ(0);
          box-shadow: 
            0 4px 16px rgba(234, 179, 8, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(234, 179, 8, 0.25);
        }

        .remmic-card__icon--invest {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.28) 0%, rgba(202, 138, 4, 0.18) 100%);
          color: #ca8a04;
          border-color: rgba(202, 138, 4, 0.6);
          will-change: transform;
          transform: translateZ(0);
          box-shadow: 
            0 4px 16px rgba(202, 138, 4, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(202, 138, 4, 0.2);
        }

        .remmic-card__title {
          font-size: 1.375rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 14px;
          line-height: 1.3;
          position: relative;
          z-index: 3;
        }

        .remmic-card__description {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.65;
          margin: 0 0 24px;
          position: relative;
          z-index: 3;
          flex-grow: 1;
        }

        .remmic-card__features {
          list-style: none;
          padding: 0;
          margin: 0;
          margin-top: auto;
          position: relative;
          z-index: 3;
          text-align: left;
          display: inline-block;
        }

        .remmic-card__features li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 12px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.5;
          text-align: left;
        }

        .remmic-card__features li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 8px;
          height: 8px;
          background: rgba(201, 162, 39, 0.8);
          border-radius: 50%;
        }

        .remmic-card__features li:last-child {
          margin-bottom: 0;
        }


        /* Pillars Section */
        .pillars {
          padding: 100px 5%;
          background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
          position: relative;
        }

        .pillars::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 25% 25%, rgba(201, 162, 39, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(74, 55, 40, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .pillars__container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .pillars__header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 60px;
        }

        .pillars__eyebrow {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.1);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .pillars__title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 16px;
        }

        .pillars__subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .pillars__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .pillar {
          position: relative;
          padding: 40px 32px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .pillar:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .pillar--featured {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .pillar--featured .pillar__title,
        .pillar--featured .pillar__description,
        .pillar--featured .pillar__features li {
          color: #ffffff;
        }

        .pillar--featured .pillar__description {
          color: rgba(255, 255, 255, 0.7);
        }

        .pillar--featured .pillar__features li {
          color: rgba(255, 255, 255, 0.8);
        }

        .pillar--featured .pillar__icon {
          background: rgba(201, 162, 39, 0.2);
        }

        .pillar__badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 16px;
          background: #c9a227;
          color: #0a0a0a;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pillar__icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 16px;
          color: #c9a227;
          margin-bottom: 24px;
        }

        .pillar__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 12px;
        }

        .pillar__description {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 24px;
        }

        .pillar__features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
        }

        .pillar__features li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 12px;
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .pillar__features li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          width: 8px;
          height: 8px;
          background: #c9a227;
          border-radius: 50%;
        }

        .pillar__link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #c9a227;
          font-weight: 600;
          text-decoration: none;
          transition: gap 0.3s ease;
        }

        .pillar__link:hover {
          gap: 12px;
        }

        /* Hot Assets Strip */
        .hot-assets-strip {
          padding: 80px 0;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .hot-assets-strip::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(74, 55, 40, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .hot-assets-strip__container {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .hot-assets-strip__header {
          text-align: center;
          margin-bottom: 60px;
          padding: 0 5%;
        }

        .hot-assets-strip__badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 100px;
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(201, 162, 39, 0.3);
          }
          50% { 
            box-shadow: 0 0 30px rgba(201, 162, 39, 0.5);
          }
        }

        .hot-assets-strip__title {
          font-size: clamp(1.75rem, 3vw, 2.25rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .hot-assets-strip__scroll {
          position: relative;
          overflow: hidden;
          margin-bottom: 60px;
          mask: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
          transform: translateZ(0); /* Hardware acceleration */
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .hot-assets-strip__track {
          display: flex;
          gap: 24px;
          animation: scroll-horizontal 25s linear infinite;
          width: max-content;
          will-change: transform;
          transform: translateZ(0); /* Hardware acceleration */
        }

        .hot-assets-strip__track:hover {
          animation-play-state: paused;
          transition: animation-play-state 0.3s ease;
        }

        @keyframes scroll-horizontal {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(calc(-50% - 12px), 0, 0);
          }
        }

        .hot-asset-card {
          width: 340px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          transform: translateZ(0); /* Hardware acceleration */
        }

        .hot-asset-card:hover {
          transform: translate3d(0, -6px, 0);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
          border-color: rgba(201, 162, 39, 0.25);
        }

        .hot-asset-card__image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .hot-asset-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateZ(0); /* Hardware acceleration */
        }

        .hot-asset-card:hover .hot-asset-card__image img {
          transform: scale3d(1.05, 1.05, 1);
        }

        .hot-asset-card__status {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .hot-asset-card__status--featured {
          background: rgba(201, 162, 39, 0.9);
          color: #0a0a0a;
        }

        .hot-asset-card__status-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .hot-asset-card__status--featured .hot-asset-card__status-dot {
          background: #0a0a0a;
        }

        @keyframes pulse-dot {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.3); 
          }
        }

        .hot-asset-card__content {
          padding: 20px;
        }

        .hot-asset-card__title {
          font-size: 1.0625rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 12px;
          line-height: 1.4;
        }

        .hot-asset-card__insurance {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
        }

        .hot-asset-card__metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .hot-asset-card__roi {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 8px;
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .hot-asset-card__risk {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .hot-asset-card__risk--low {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .hot-asset-card__risk--medium {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .hot-asset-card__risk--high {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .hot-asset-card__details {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hot-asset-card__min {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0;
        }

        .hot-asset-card__min span {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .hot-asset-card__min strong {
          font-size: 1rem;
          color: #c9a227;
          font-weight: 700;
        }

        .hot-asset-card__investors {
          color: #c9a227;
          font-weight: 600;
        }

        .hot-asset-card__progress {
          margin-top: 16px;
        }

        .hot-asset-card__progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .hot-asset-card__progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a227, #e6c453);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .hot-asset-card__progress-text {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
        }

        .hot-assets-strip__cta {
          text-align: center;
          padding: 0 5%;
        }

        .hot-assets-strip__cta-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #c9a227 0%, #e6c453 50%, #c9a227 100%);
          background-size: 200% auto;
          color: #0a0a0a;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 25px rgba(201, 162, 39, 0.4);
        }

        .hot-assets-strip__cta-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 35px rgba(201, 162, 39, 0.5);
          background-position: right center;
        }

        .hot-assets-strip__cta-button svg {
          transition: transform 0.3s ease;
        }

        .hot-assets-strip__cta-button:hover svg {
          transform: translateX(4px);
        }

        /* Trust Section */
        .trust {
          padding: 100px 5%;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .trust__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .trust__header {
          text-align: center;
          margin-bottom: 48px;
        }

        .trust__eyebrow {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.25);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 14px;
        }

        .trust__title {
          font-size: clamp(1.875rem, 4vw, 2.25rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 12px;
        }

        .trust__subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.55);
          margin: 0 auto;
          max-width: 500px;
        }

        .trust__pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .trust__pillar {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .trust__pillar--featured {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.06) 0%, rgba(201, 162, 39, 0.02) 100%);
          border-color: rgba(201, 162, 39, 0.2);
        }

        .trust__pillar:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
          border-color: rgba(201, 162, 39, 0.25);
        }

        .trust__pillar-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 6px 16px;
          background: rgba(201, 162, 39, 0.9);
          color: #0a0a0a;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .trust__pillar-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }

        .trust__pillar-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.12);
          border-radius: 14px;
          color: #c9a227;
          flex-shrink: 0;
        }

        .trust__pillar-icon--amanorx {
          background: linear-gradient(135deg, #c9a227 0%, #e6c453 100%);
          color: #0a0a0a;
        }

        .trust__pillar-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px;
        }

        .trust__pillar-subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.55);
          margin: 0;
        }

        .trust__pillar-content {
          margin-left: 0;
        }

        /* Insurance Partners */
        .trust__insurance-partners {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 0;
        }

        .trust__partner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .trust__partner:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(201, 162, 39, 0.2);
        }

        .trust__partner-logo {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 10px;
          color: #c9a227;
          flex-shrink: 0;
        }

        .trust__partner-logo svg {
          width: 24px;
          height: 24px;
        }

        .trust__partner-info h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 2px;
        }

        .trust__partner-info span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .trust__coverage-stats {
          display: flex;
          gap: 32px;
        }

        .trust__stat {
          text-align: center;
        }

        .trust__stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: #c9a227;
          margin-bottom: 4px;
        }

        .trust__stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Amanorx Group */
        .trust__amanorx-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .trust__amanorx-stat {
          text-align: center;
          padding: 14px 12px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
        }

        .trust__amanorx-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: #c9a227;
          margin-bottom: 4px;
        }

        .trust__amanorx-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.4;
        }

        .trust__amanorx-sectors {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }

        .trust__sector {
          padding: 10px 12px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 8px;
          font-size: 0.75rem;
          color: #c9a227;
          font-weight: 600;
          text-align: center;
        }

        .trust__amanorx-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #c9a227;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .trust__amanorx-link:hover {
          gap: 12px;
          color: #e6c453;
        }

        .trust__amanorx-link svg {
          transition: transform 0.3s ease;
        }

        .trust__amanorx-link:hover svg {
          transform: translateX(4px);
        }

        /* Multi-Jurisdiction Roadmap */
        .trust__roadmap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
        }

        .trust__roadmap::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 20px;
          bottom: 20px;
          width: 2px;
          background: linear-gradient(180deg,
            rgba(34, 197, 94, 0.4),
            rgba(251, 191, 36, 0.4),
            rgba(201, 162, 39, 0.2),
            rgba(201, 162, 39, 0.2)
          );
        }

        .trust__roadmap-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .trust__roadmap-item--completed {
          background: rgba(34, 197, 94, 0.06);
          border-color: rgba(34, 197, 94, 0.15);
        }

        .trust__roadmap-item--in-progress {
          background: rgba(251, 191, 36, 0.06);
          border-color: rgba(251, 191, 36, 0.15);
        }

        .trust__roadmap-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(201, 162, 39, 0.2);
        }

        .trust__roadmap-flag {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .trust__roadmap-flag-icon {
          font-size: 1.25rem;
        }

        .trust__roadmap-content h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .trust__roadmap-status {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 6px;
        }

        .trust__roadmap-item--completed .trust__roadmap-status {
          background: rgba(34, 197, 94, 0.12);
          color: #22c55e;
        }

        .trust__roadmap-item--in-progress .trust__roadmap-status {
          background: rgba(251, 191, 36, 0.12);
          color: #fbbf24;
        }

        .trust__roadmap-content p {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          line-height: 1.4;
        }

        .trust__cta {
          text-align: center;
        }

        /* Footer CTA Section */
        .footer-cta {
          padding: 100px 5%;
          background: linear-gradient(135deg, #faf9f7 0%, #f5f3ef 100%);
          position: relative;
        }

        .footer-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(201, 162, 39, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(74, 55, 40, 0.02) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer-cta__container {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          background: linear-gradient(135deg, #ffffff 0%, #faf9f7 100%);
          border-radius: 24px;
          padding: 64px;
          border: 1px solid rgba(201, 162, 39, 0.15);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 1;
        }

        .footer-cta__title {
          font-size: clamp(1.875rem, 4vw, 2.25rem);
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 16px;
          line-height: 1.25;
        }

        .footer-cta__accent {
          color: #c9a227;
        }

        .footer-cta__subtitle {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.7;
          margin: 0 0 28px;
          max-width: 440px;
        }

        .footer-cta__actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footer-cta__image {
          border-radius: 20px;
          overflow: hidden;
          height: 300px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
        }

        .footer-cta__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .footer-cta__image:hover img {
          transform: scale(1.03);
        }

        /* CTA Section */
        .cta {
          padding: 100px 5%;
          background: #ffffff;
        }

        .cta__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          background: linear-gradient(135deg, #faf9f7 0%, #f5f3ef 100%);
          border-radius: 24px;
          padding: 60px;
          border: 1px solid rgba(201, 162, 39, 0.2);
        }

        .cta__title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 20px;
          line-height: 1.2;
        }

        .cta__accent {
          color: #c9a227;
        }

        .cta__description {
          font-size: 1.0625rem;
          color: #6b7280;
          line-height: 1.7;
          margin: 0 0 32px;
        }

        .cta__buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .cta__image {
          border-radius: 16px;
          overflow: hidden;
          height: 320px;
        }

        .cta__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Enhanced Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: none;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.02em;
          min-height: 56px;
          white-space: nowrap;
        }

        .btn svg {
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .btn:hover svg {
          transform: translateX(4px);
        }

        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.3);
        }

        .btn:active {
          transform: translateY(1px);
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #e6c453 50%, #c9a227 100%);
          background-size: 200% auto;
          color: #0a0a0a;
          box-shadow: 0 6px 20px rgba(201, 162, 39, 0.35);
          font-weight: 700;
        }

        .btn--primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: all 0.6s ease;
        }

        .btn--primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(201, 162, 39, 0.45);
          background-position: right center;
        }

        .btn--primary:hover::before {
          width: 300px;
          height: 300px;
        }

        .btn--outline {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
        }

        .btn--outline::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.1), transparent);
          transition: left 0.6s ease;
        }

        .btn--outline:hover {
          border-color: rgba(201, 162, 39, 0.8);
          color: #c9a227;
          background: rgba(201, 162, 39, 0.1);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.2);
        }

        .btn--outline:hover::before {
          left: 100%;
        }

        .btn--outline-light {
          background: transparent;
          color: #c9a227;
          border: 2px solid rgba(201, 162, 39, 0.5);
        }

        .btn--outline-light:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: #c9a227;
        }

        .btn--dark {
          background: #0a0a0a;
          color: #ffffff;
        }

        .btn--dark:hover {
          background: #1a1a1a;
        }

        .btn--large {
          padding: 18px 40px;
          font-size: 1.0625rem;
          border-radius: 14px;
          min-height: 60px;
        }

        /* Enhanced Responsive Design */
        @media (max-width: 1024px) {
          .story {
            padding: 60px 5% 80px;
          }

          .story__content {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .story__content::before {
            display: none;
          }

          .story__header {
            margin-bottom: 48px;
          }

          .what-remmic-does__grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }

          .remmic-card {
            min-height: auto;
          }

          .trust__pillars {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .trust__roadmap::before {
            display: none;
          }


          .hot-assets-strip {
            padding: 60px 0;
          }

          .hot-assets-strip__header {
            margin-bottom: 40px;
          }

          .hot-assets-strip__scroll {
            margin-bottom: 40px;
          }
          .hero {
            padding: 100px 5% 80px;
          }

          .hero__container {
            grid-template-columns: 1fr;
            gap: 60px;
            max-width: 800px;
          }

          .hero__content {
            text-align: center;
            max-width: 100%;
            order: 2;
          }

          .hero__visual {
            order: 1;
            max-width: 600px;
            margin: 0 auto;
          }

          .hero__image-main {
            transform: perspective(1000px) rotateY(0deg);
            height: 400px;
          }

          .hero__image-main img {
            height: 400px;
          }

          .hero__cta {
            justify-content: space-between;
            gap: 16px;
            max-width: 100%;
          }

          .hero__title {
            font-size: clamp(2.25rem, 4vw, 3.5rem);
          }

          .hero__stats {
            flex-wrap: wrap;
            gap: 24px;
            padding: 32px;
          }

          .hero__stat-divider {
            display: none;
          }

          .pillars__grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }

          .trust__pillar-content {
            margin-left: 0;
            margin-top: 24px;
          }

          .trust__pillar-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
          }

          .trust__amanorx-stats {
            grid-template-columns: 1fr;
          }

          .trust__coverage-stats {
            flex-direction: column;
            gap: 20px;
          }

          .trust__amanorx-sectors {
            grid-template-columns: 1fr;
          }

          .cta__container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-cta {
            padding: 60px 5%;
          }

          .footer-cta__container {
            padding: 40px;
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }

          .footer-cta__actions {
            justify-content: center;
            gap: 16px;
          }

          .cta__buttons {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .story {
            padding: 20px 5% 60px;
          }

          .story__header {
            margin-bottom: 40px;
          }

          .story__content {
            gap: 40px;
          }

          .what-remmic-does {
            padding: 60px 5%;
          }

          .what-remmic-does__header {
            margin-bottom: 50px;
          }

          .what-remmic-does__grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .remmic-card {
            padding: 32px;
          }

          .remmic-card__icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            margin-bottom: 24px;
          }

          .remmic-card__title {
            font-size: 1.375rem;
          }

          .remmic-card__description {
            font-size: 0.9375rem;
            margin-bottom: 24px;
          }

          .remmic-card__features li {
            font-size: 0.875rem;
            margin-bottom: 12px;
            padding-left: 24px;
          }

          .remmic-card__features li::before {
            width: 10px;
            height: 10px;
            top: 8px;
          }


          .hot-assets-strip {
            padding: 40px 0;
          }

          .hot-assets-strip__header {
            margin-bottom: 32px;
          }

          .hot-assets-strip__scroll {
            margin-bottom: 32px;
          }

          .hot-asset-card {
            width: 280px;
          }

          .hot-assets-strip__track {
            gap: 16px;
            animation: scroll-horizontal 20s linear infinite;
          }

          @keyframes scroll-horizontal {
            0% {
              transform: translate3d(0, 0, 0);
            }
            100% {
              transform: translate3d(calc(-50% - 8px), 0, 0);
            }
          }

          .hero {
            padding: 100px 5% 60px;
            min-height: 90vh;
          }

          .hero__container {
            gap: 40px;
            padding: 0 16px;
          }

          .hero__badge {
            padding: 10px 20px;
            font-size: 0.8125rem;
            margin-bottom: 32px;
          }

          .hero__title {
            font-size: clamp(2rem, 6vw, 2.75rem);
            line-height: 1.2;
            margin-bottom: 24px;
          }

          .hero__description {
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 36px;
          }

          .hero__image-main {
            border-radius: 20px;
            height: 350px;
          }

          .hero__image-main img {
            height: 350px;
          }

          .hero__badge-verified {
            padding: 12px 18px;
            bottom: 16px;
            left: 16px;
            font-size: 0.8125rem;
          }

          .hero__cta {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
            justify-content: center;
            max-width: 100%;
          }

          .btn {
            padding: 14px 24px;
            font-size: 0.9375rem;
            min-height: 52px;
          }

          .hero__stat-value {
            font-size: 1.5rem;
          }

          .footer-cta {
            padding: 40px 5%;
          }

          .footer-cta__container {
            padding: 32px 24px;
          }

          .footer-cta__actions {
            flex-direction: column;
            gap: 12px;
          }

          .footer-cta__actions .btn {
            width: 100%;
          }

          .footer-cta__image {
            display: none;
          }

          .pillars, .trust, .cta {
            padding: 60px 5%;
          }

          .trust__pillars {
            gap: 32px;
            margin-bottom: 40px;
          }

          .trust__pillar {
            padding: 24px;
          }

          .trust__pillar-title {
            font-size: 1.5rem;
          }

          .trust__pillar-badge {
            top: 16px;
            right: 16px;
            padding: 4px 12px;
            font-size: 0.6875rem;
          }

          .trust__partner {
            flex-direction: column;
            text-align: center;
            padding: 16px;
          }

          .trust__roadmap-item {
            flex-direction: column;
            padding: 20px;
            gap: 16px;
          }

          .cta__container {
            padding: 40px 24px;
          }

          .cta__image {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 80px 5% 50px;
          }

          .hero__container {
            gap: 32px;
            padding: 0 12px;
          }

          .hero__badge {
            padding: 8px 16px;
            font-size: 0.75rem;
            margin-bottom: 24px;
          }

          .hero__title {
            font-size: clamp(1.75rem, 7vw, 2.25rem);
            margin-bottom: 20px;
          }

          .hero__description {
            font-size: 0.9375rem;
            margin-bottom: 32px;
          }

          .hero__image-main {
            height: 280px;
            border-radius: 16px;
          }

          .hero__image-main img {
            height: 280px;
          }

          .hero__badge-verified {
            padding: 10px 16px;
            bottom: 12px;
            left: 12px;
            font-size: 0.75rem;
          }

          .hero__cta {
            gap: 12px;
          }

          .hero__cta .btn {
            width: 100%;
            padding: 12px 20px;
            font-size: 0.875rem;
            min-height: 48px;
          }

          .cta__buttons {
            flex-direction: column;
          }

          .cta__buttons .btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
