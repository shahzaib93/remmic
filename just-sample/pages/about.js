import Head from 'next/head'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'

const formatCompactNumber = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

const formatCompactCurrency = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 'PKR 0'
  const formatted = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
  return `PKR ${formatted}`
}

const formatPercentValue = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '—'
  return `${Number(value).toFixed(value >= 10 ? 0 : 1)}%`
}

export default function About() {
  const [isVisible, setIsVisible] = useState(false)
  const { getAllProperties, getAllInvestments } = useFirebase()
  const [impactStats, setImpactStats] = useState({
    totalInvestmentVolume: 0,
    investorCount: 0,
    avgReturnPercent: 0,
    activeOpportunities: 0,
    lastUpdated: null,
  })
  const [isImpactLoading, setIsImpactLoading] = useState(true)
  const [impactRefreshKey, setImpactRefreshKey] = useState(0)

  const computeImpactStats = useCallback(async () => {
    if (typeof window === 'undefined') {
      return {
        totalInvestmentVolume: 0,
        investorCount: 0,
        avgReturnPercent: 0,
        activeOpportunities: 0,
        lastUpdated: Date.now()
      }
    }

    const parseJson = (value) => {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const localInvestments = parseJson(window.localStorage.getItem('userInvestments') || '[]')
    const localProperties = parseJson(window.localStorage.getItem('userProperties') || '[]')

    const extractArray = (payload, key) => {
      if (!payload) return []
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload[key])) return payload[key]
      if (Array.isArray(payload.data)) return payload.data
      return []
    }

    let remoteInvestments = []
    let remoteProperties = []

    if (typeof getAllInvestments === 'function') {
      try {
        const response = await getAllInvestments()
        remoteInvestments = extractArray(response, 'investments')
      } catch (error) {
        console.warn('Impact metrics: failed to fetch remote investments', error)
      }
    }

    if (typeof getAllProperties === 'function') {
      try {
        const response = await getAllProperties()
        remoteProperties = extractArray(response, 'properties')
      } catch (error) {
        console.warn('Impact metrics: failed to fetch remote properties', error)
      }
    }

    const investments = remoteInvestments.length ? remoteInvestments : localInvestments
    const properties = remoteProperties.length ? remoteProperties : localProperties

    const totalInvestmentVolume = investments.reduce((sum, investment) => {
      const amount = Number(
        investment?.amount ??
        investment?.totalAmount ??
        investment?.investmentAmount ??
        investment?.capital ??
        investment?.committedAmount
      )
      return Number.isFinite(amount) ? sum + amount : sum
    }, 0)

    const investorSet = new Set()
    investments.forEach((investment) => {
      const identifier =
        investment?.userId ??
        investment?.investorId ??
        investment?.uid ??
        investment?.user?.id ??
        investment?.userEmail ??
        investment?.email

      if (identifier) {
        investorSet.add(String(identifier).trim().toLowerCase())
      }
    })

    const returns = []
    investments.forEach((investment) => {
      const explicit = Number(
        investment?.returnPercentage ??
        investment?.returnPercent ??
        investment?.roi ??
        investment?.expectedRoi ??
        investment?.projectedReturnPercent ??
        investment?.annualReturn
      )

      if (Number.isFinite(explicit)) {
        returns.push(explicit)
        return
      }

      const amount = Number(
        investment?.amount ??
        investment?.totalAmount ??
        investment?.investmentAmount ??
        investment?.committedAmount
      )

      const currentValue = Number(
        investment?.currentValue ??
        investment?.valuation ??
        investment?.currentAmount ??
        investment?.projectedValue
      )

      if (Number.isFinite(amount) && amount > 0 && Number.isFinite(currentValue)) {
        const percentGain = ((currentValue - amount) / amount) * 100
        if (Number.isFinite(percentGain)) {
          returns.push(percentGain)
        }
      }
    })

    const avgReturnPercent = returns.length
      ? returns.reduce((sum, value) => sum + value, 0) / returns.length
      : 0

    const normalizedProperties = properties.filter((property) => {
      const status = (property?.status || '').toLowerCase()
      if (!status) return true
      return !['archived', 'inactive', 'closed'].includes(status)
    })

    const propertyFromInvestments = Array.from(new Set(
      investments
        .map((investment) => investment?.propertyId ?? investment?.property?.id)
        .filter(Boolean)
    ))

    const activeOpportunities = normalizedProperties.length || propertyFromInvestments.length

    return {
      totalInvestmentVolume,
      investorCount: investorSet.size,
      avgReturnPercent,
      activeOpportunities,
      lastUpdated: Date.now()
    }
  }, [getAllInvestments, getAllProperties])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    let isMounted = true

    const updateImpactStats = async () => {
      setIsImpactLoading(true)
      try {
        const computed = await computeImpactStats()
        if (isMounted && computed) {
          setImpactStats(computed)
        }
      } catch (error) {
        console.warn('Impact metrics: failed to compute', error)
      } finally {
        if (isMounted) {
          setIsImpactLoading(false)
        }
      }
    }

    updateImpactStats()

    return () => {
      isMounted = false
    }
  }, [computeImpactStats, impactRefreshKey])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleStorage = (event) => {
      if (!event.key || ['userInvestments', 'userProperties'].includes(event.key)) {
        setImpactRefreshKey((prev) => prev + 1)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const impactCards = useMemo(() => {
    const baseDelay = 1.8
    const cards = [
      {
        label: 'Investment Volume',
        value: isImpactLoading ? '—' : formatCompactCurrency(impactStats.totalInvestmentVolume),
        description: 'Capital facilitated across REMMIC opportunities',
      },
      {
        label: 'Active Investors',
        value: isImpactLoading ? '—' : formatCompactNumber(impactStats.investorCount),
        description: 'Unique investors growing portfolios on REMMIC',
      },
      {
        label: 'Average Returns',
        value: isImpactLoading ? '—' : formatPercentValue(impactStats.avgReturnPercent),
        description: 'Weighted average ROI reported across deals',
      },
      {
        label: 'Active Opportunities',
        value: isImpactLoading ? '—' : formatCompactNumber(impactStats.activeOpportunities),
        description: 'Live and upcoming investment offerings',
      },
    ]

    return cards.map((card, index) => ({
      ...card,
      delay: baseDelay + index * 0.2,
    }))
  }, [impactStats, isImpactLoading])

  return (
    <>
      <Head>
        <title>About - REMMIC</title>
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <header className="section-about-header">
            <div className="padding-global">
              <div className="container-large">
                <div className="about-header-component">
                  <div className="about-header-top-content-wrapper" style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, -65px, 0) scale3d(0.9, 0.9, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                    transition: 'transform 800ms ease, opacity 800ms ease'
                  }}>
                    <div className="about-header-top-content">
                      <h2 className="heading-style-h2" 
                          style={{
                            textAlign: 'center', 
                            fontSize: '2.8rem', 
                            lineHeight: '1.3', 
                            fontWeight: 'bold', 
                            margin: '0 auto'
                          }}>
                        The Future of Real Estate <br/>
                        Investment & Management
                      </h2>
                      <div className="text-size-regular">
                        REMMIC is your all-in-one platform for property investment opportunities, fractional ownership, comprehensive rental management, and intelligent property operations — all powered by cutting-edge technology.
                      </div>
                    </div>
                    <a href="/contact" className="button is-secondary w-inline-block">
                      <div className="button-text">
                        Get Started
                      </div>
                    </a>
                  </div>
                  <div className="about-image-card-list">
                    <div style={{
                      transform: isVisible ? 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(6deg) skew(0deg, 0deg)' : 'translate3d(343px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(-11deg) skew(0, 0)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 800ms ease'
                    }} className="about-image-wrapper first">
                      <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=640&q=80" loading="lazy" alt="Luxury home exterior with grand entrance" className="about-image"/>
                    </div>
                    <div style={{
                      transform: isVisible ? 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(6deg) skew(0deg, 0deg)' : 'translate3d(62px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0deg) skew(0, 0)',
                      transformStyle: 'preserve-3d',
                      zIndex: 2,
                      transition: 'transform 800ms ease 200ms'
                    }} className="about-image-wrapper second">
                      <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=640&q=80" loading="lazy" alt="Stylish living area inside premium property" className="about-image"/>
                    </div>
                    <div style={{
                      transform: isVisible ? 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(6deg) skew(0deg, 0deg)' : 'translate3d(-240px, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(11deg) skew(0, 0)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 800ms ease 400ms'
                    }} className="about-image-wrapper third">
                      <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=640&q=80" loading="lazy" alt="High-end penthouse interior" className="about-image"/>
                    </div>
                  </div>
                  <div className="about-header-bottom-content">
                    <div style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                      transition: 'transform 800ms ease, opacity 800ms ease'
                    }} className="text-size-regular text-color-black-800">
                      Founded in 2024, REMMIC emerged from recognizing the massive gap between traditional real estate operations and the digital-first world investors and property owners demand today. We saw individual investors locked out of premium opportunities, property owners struggling with outdated management systems, and a market crying out for transparency and accessibility.
                    </div>
                    <div style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                      transition: 'transform 800ms ease 200ms, opacity 800ms ease 200ms'
                    }} className="text-size-regular text-color-black-800">
                      Our revolutionary platform democratizes real estate by offering fractional investment opportunities, enabling anyone to build a diversified property portfolio. From PKR 3 Lacs to multi-crore investments, REMMIC opens doors to premium commercial plazas, residential developments, and high-yield properties that were previously exclusive to large institutional investors.
                    </div>
                    <div style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' : 'translate3d(0, 50px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)',
                      transition: 'transform 800ms ease 400ms, opacity 800ms ease 400ms'
                    }} className="text-size-regular text-color-black-800">
                      Beyond investments, REMMIC provides comprehensive property management solutions — from intelligent tenant screening and automated rent collection to maintenance tracking and performance analytics. Whether you're investing in fractional ownership or managing your entire portfolio, REMMIC ensures maximum returns with minimal hassle through smart automation and transparent operations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Mission & Values Section */}
          <section className="section-mission" style={{padding: '100px 0', background: '#f8f9fa'}}>
            <div className="padding-global">
              <div className="container-large">
                <div className="mission-component">
                  <div className="mission-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '60px',
                    alignItems: 'start'
                  }}>
                    
                    {/* Our Mission */}
                    <div className="mission-card" style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: 'all 0.8s ease 1.2s'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#ff5e01',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="heading-style-h3" style={{marginBottom: '16px'}}>Our Mission</h3>
                      <p className="text-size-regular" style={{lineHeight: '1.6', color: '#666'}}>
                        To democratize real estate investment and property management by breaking down traditional barriers. We make premium investment opportunities accessible to everyone while providing intelligent management tools that maximize returns and minimize operational complexity for property owners across Pakistan.
                      </p>
                    </div>

                    {/* Our Vision */}
                    <div className="vision-card" style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: 'all 0.8s ease 1.4s'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#ff5e01',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3 className="heading-style-h3" style={{marginBottom: '16px'}}>Our Vision</h3>
                      <p className="text-size-regular" style={{lineHeight: '1.6', color: '#666'}}>
                        To transform Pakistan's real estate landscape into a transparent, technology-driven ecosystem where anyone can invest in premium properties through fractional ownership, and property management becomes effortless through intelligent automation. We envision a future where geography and capital constraints no longer limit investment opportunities.
                      </p>
                    </div>

                    {/* What Sets Us Apart */}
                    <div className="values-card" style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: 'all 0.8s ease 1.6s',
                      gridColumn: 'span 2'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#ff5e01',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                      }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="heading-style-h3" style={{marginBottom: '24px'}}>What Sets REMMIC Apart</h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '30px'
                      }}>
                        <div>
                          <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333'}}>Fractional Investment Access</h4>
                          <p style={{fontSize: '14px', lineHeight: '1.5', color: '#666'}}>Start investing in premium properties from just PKR 3 Lacs. Build a diversified portfolio without massive capital requirements.</p>
                        </div>
                        <div>
                          <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333'}}>AI-Powered Management</h4>
                          <p style={{fontSize: '14px', lineHeight: '1.5', color: '#666'}}>Smart automation handles tenant screening, rent collection, maintenance scheduling, and performance analytics seamlessly.</p>
                        </div>
                        <div>
                          <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333'}}>Verified Opportunities</h4>
                          <p style={{fontSize: '14px', lineHeight: '1.5', color: '#666'}}>Every investment opportunity is thoroughly vetted with detailed due diligence, legal verification, and transparent risk assessment.</p>
                        </div>
                        <div>
                          <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#333'}}>Mobile-First Platform</h4>
                          <p style={{fontSize: '14px', lineHeight: '1.5', color: '#666'}}>Manage investments and properties anywhere, anytime. Our mobile app puts complete control in your pocket.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Company Stats Section */}
          <section className="section-stats" style={{padding: '80px 0'}}>
            <div className="padding-global">
              <div className="container-large">
                <div style={{textAlign: 'center', marginBottom: '60px'}}>
                  <h2 className="heading-style-h2" style={{marginBottom: '20px'}}>REMMIC Impact & Growth</h2>
                  <p className="text-size-regular" style={{color: '#666', maxWidth: '600px', margin: '0 auto'}}>
                    Since our launch, we've democratized real estate investment and transformed property management for thousands of users across Pakistan.
                  </p>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '40px',
                  textAlign: 'center'
                }}>
                  {impactCards.map((card, index) => (
                    <div
                      key={card.label}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: `all 0.6s ease ${card.delay}s`
                      }}
                    >
                      <h3 style={{fontSize: '3rem', fontWeight: 'bold', color: '#ff5e01', margin: '0 0 8px 0'}}>{card.value}</h3>
                      <p style={{fontSize: '18px', color: '#333', margin: '0 0 4px 0'}}>{card.label}</p>
                      <p style={{fontSize: '14px', color: '#666', margin: '0'}}>{card.description}</p>
                    </div>
                  ))}
                </div>
                {!isImpactLoading && impactStats.lastUpdated && (
                  <p style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                    marginTop: '32px'
                  }}>
                    Updated {new Date(impactStats.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="section-team">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="team-component">
                    <div className="team-top-content" style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-42px) scale(0.9)',
                      transition: 'all 0.8s ease 1.5s'
                    }}>
                      <div className="team-highlight">
                        <div>
                          Our Team
                        </div>
                      </div>
                      <h2 className="heading-style-h2">Meet our dedicated team of experts</h2>
                    </div>
                    <div className="team-bottom-content">
                      <div className="team-collection-list-wrapper w-dyn-list">
                        <div role="list" className="team-collection-list w-dyn-items" style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                          transition: 'all 0.8s ease 1.7s'
                        }}>
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/uzair.jpg" loading="lazy" alt="" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Uzair Karghatra</h6>
                                    <div className="text-size-regular">
                                      CEO
                                    </div>
                                  </div>
                                  <a href="/member/Uzair-Karghatra" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div role="listitem" className="team-collection-item w-dyn-item">
                              <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/shazaib-kamal.png" loading="lazy" alt="Shazaib Kamal" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Shazaib Kamal</h6>
                                    <div className="text-size-regular">
                                      CTO
                                    </div>
                                  </div>
                                  <a href="/member/Junaid-tariq" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="team-collection-list-wrapper right w-dyn-list">
                        <div role="list" className="team-collection-list w-dyn-items" style={{
                          opacity: isVisible ? 1 : 0,
                          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                          transition: 'all 0.8s ease 1.9s'
                        }}>
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/khatam.jpg" loading="lazy" alt="" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Muhammad Khatam Usmani</h6>
                                    <div className="text-size-regular">
                                      Head Of Product
                                    </div>
                                  </div>
                                  <a href="/member/Khatam-Usmani" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div role="listitem" className="team-collection-item w-dyn-item">
                            <div className="team-card">
                              <div className="team-image-wrapper">
                                <img src="/images/team/salman-mehmood.png" loading="lazy" alt="Salman Mehmood" className="team-image"/>
                              </div>
                              <div className="team-card-content">
                                <div className="team-card-top-content">
                                  <div className="team-card-top-left-content">
                                    <h6 className="heading-style-h6">Salman Mehmood</h6>
                                    <div className="text-size-regular">
                                      UI/UX Designer
                                    </div>
                                  </div>
                                  <a href="/member/Saad" className="team-arrow-wrapper w-inline-block">
                                    <img src="/images/arrow-up-right.svg" loading="lazy" alt=""/>
                                  </a>
                                </div>
                                <div className="team-link-list">
                                  <a href="https://www.instagram.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                                    <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                                  </a>
                                  <a href="https://x.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                                    <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                                  </a>
                                  <a href="https://linkedin.com/" target="_blank" className="team-social-link-circle w-inline-block">
                                    <img src="/images/linkedin.svg" loading="lazy" alt="linkedin" className="social-link"/>
                                    <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkedin" className="hover-social-link"/>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="section-footer">
          <div className="padding-global">
            <div className="container-large">
              <div className="footer-component">
                <div className="footer-top-content">
                  <div className="footer-form-block w-form">
                    <form id="email-form" name="email-form" method="get" className="footer-form">
                      <input className="footer-input w-input" maxLength="256" name="email" placeholder="Enter your email" type="email" id="email" required=""/>
                      <div className="footer-submit-button">
                        <input type="submit" className="button is-footer w-button" value="Submit"/>
                      </div>
                    </form>
                    <div className="w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                  <div className="footer-social-link-wrapper">
                    <a href="https://www.instagram.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="/images/instagram.svg" loading="lazy" alt="instagram" className="social-link"/>
                      <img src="/images/instagram-02.svg" loading="lazy" alt="instagram" className="hover-social-link"/>
                    </a>
                    <a href="https://x.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="/images/twitter.svg" loading="lazy" alt="X" className="social-link"/>
                      <img src="/images/twitter-02.svg" loading="lazy" alt="X" className="hover-social-link"/>
                    </a>
                    <a href="https://linkedin.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="/images/linkedin.svg" loading="lazy" alt="linkdin" className="social-link"/>
                      <img src="/images/linkedin-02.svg" loading="lazy" alt="Linkdine" className="hover-social-link"/>
                    </a>
                    <a href="https://www.facebook.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="/images/facebook.svg" loading="lazy" alt="facebook" className="social-link"/>
                      <img src="/images/facebook-02.svg" loading="lazy" alt="Facebook " className="hover-social-link"/>
                    </a>
                  </div>
                </div>
                <div className="footer-card">
                  <div className="text-size-regular">Company</div>
                  <div className="footer-link-list">
                    <a href="/" className="text-size-regular">Home</a>
                    <a href="/about" className="text-size-regular">About</a>
                    <a href="/contact" className="text-size-regular">Contact</a>
                    <a href="/blog" className="text-size-regular">Blog</a>
                  </div>
                </div>
                <div className="footer-card-list">
                  <div className="footer-card">
                    <div className="text-size-regular">Inner page</div>
                    <div className="footer-bottom-link-list">
                      <a href="/feature" className="footer-text">Feature</a>
                      <a href="/team" className="footer-text">Team</a>
                      <a href="/pricing" className="footer-text">Price</a>
                      <a href="/privacy-policy" className="footer-text">Privacy Policy</a>
                      <a href="/terms-and-conditions" className="footer-text">Terms & Conditions</a>
                    </div>
                  </div>
                  <div className="footer-card second">
                    <div className="text-size-regular">Authentication</div>
                    <div className="footer-bottom-link-list">
                      <a href="#" className="footer-text">Login</a>
                      <a href="#" className="footer-text">Sign up</a>
                      <a href="#" className="footer-text">Forgot</a>
                      <a href="#" className="footer-text">Confirm email</a>
                    </div>
                  </div>
                  <div className="footer-card">
                    <div className="text-size-regular">Utility pages</div>
                    <div className="footer-bottom-link-list">
                      <a href="/style-guide" className="footer-text">Style Guide</a>
                      <a href="/change-log" className="footer-text">Change log</a>
                      <a href="/licenses" className="footer-text">Licenses</a>
                      <a href="/protected" className="footer-text">Protected</a>
                    </div>
                  </div>
                </div>
                <div className="footer-botom-content">
                  <div className="text-size-small tex-color-black-700">© 2024 REMMIC. All rights reserved.</div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <script src="/scripts/remove-webflow-badge.js"></script>
    </>
  )
}
