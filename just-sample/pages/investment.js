import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CRORE_IN_RUPEES = 10000000
const LAKH_IN_RUPEES = 100000
const MILLION_IN_RUPEES = 1000000
const THOUSAND_IN_RUPEES = 1000

const parseRupeeAmount = (raw) => {
  if (raw == null) return null
  if (typeof raw === 'number') return raw

  const normalized = String(raw).toLowerCase().replace(/,/g, '').trim()
  const numeric = parseFloat(normalized.replace(/[^0-9.]/g, ''))
  if (Number.isNaN(numeric)) return null

  if (/\b(crore|cr)\b/.test(normalized)) {
    return numeric * CRORE_IN_RUPEES
  }

  if (/\b(lakh|lac|lacs)\b/.test(normalized)) {
    return numeric * LAKH_IN_RUPEES
  }

  if (/[0-9.]+m\b/.test(normalized)) {
    return numeric * MILLION_IN_RUPEES
  }

  if (/[0-9.]+k\b/.test(normalized)) {
    return numeric * THOUSAND_IN_RUPEES
  }

  return numeric
}

const formatInvestmentCurrency = (value) => {
  const amount = parseRupeeAmount(value)
  if (!Number.isFinite(amount)) {
    return typeof value === 'string' ? value : 'PKR —'
  }

  if (amount >= CRORE_IN_RUPEES) {
    const crores = amount / CRORE_IN_RUPEES
    const precise = crores >= 10 ? Math.round(crores) : Number(crores.toFixed(2))
    const label = Number.isInteger(precise) ? precise.toString() : precise.toString().replace(/\.0+$/, '')
    return `PKR ${label} Cr`
  }

  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`
}

const getMetricValue = (metric) => {
  if (!metric) return '—'
  if (metric.format === 'currency') {
    return formatInvestmentCurrency(metric.value)
  }
  return metric.value
}

const INVESTMENT_STORIES = [
  {
    id: 'model-town',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    status: { label: 'Live', tone: 'live' },
    roi: '+12.4% ROI',
    location: 'Lahore • Luxury Apartments',
    title: 'Model Town Residences',
    summary: 'Fractional ownership in a stabilized apartment community with long-term rental contracts and professional management.',
    funding: 82,
    metrics: [
      { label: 'Min. Investment', value: 250000, format: 'currency' },
      { label: 'Projected Yield', value: '8.2% rental' },
      { label: 'Hold Period', value: '4 years' }
    ],
    tags: ['Escrow protected capital', 'Quarterly payouts'],
    ctaLabel: 'View Opportunity',
    ctaHref: '/investment-shares?id=model-town'
  },
  {
    id: 'gulberg-square',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    status: { label: 'Selling Fast', tone: 'selling' },
    roi: '+10.8% ROI',
    location: 'Islamabad • Mixed Use',
    title: 'Gulberg Square Offices',
    summary: 'Grade-A commercial floors pre-leased to technology tenants with indexed rental escalations every 12 months.',
    funding: 68,
    metrics: [
      { label: 'Min. Investment', value: 180000, format: 'currency' },
      { label: 'Projected Yield', value: '7.4% rental' },
      { label: 'Hold Period', value: '3 years' }
    ],
    tags: ['Corporate tenancy secured', 'Escalating leases'],
    ctaLabel: 'Review Details',
    ctaHref: '/investment-shares?id=gulberg-square'
  },
  {
    id: 'seaview-lofts',
    image: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=800&q=80',
    status: { label: 'Limited', tone: 'limited' },
    roi: '+14.6% ROI',
    location: 'Karachi • Coastal Rentals',
    title: 'Seaview Loft Portfolio',
    summary: 'Short-term rental units operated under a hospitality partner with dynamic pricing and occupancy above 85%.',
    funding: 91,
    metrics: [
      { label: 'Min. Investment', value: 320000, format: 'currency' },
      { label: 'Projected Yield', value: '9.1% rental' },
      { label: 'Hold Period', value: '5 years' }
    ],
    tags: ['Revenue share model', 'Hospitality partnership'],
    ctaLabel: 'Reserve Allocation',
    ctaHref: '/investment-shares?id=seaview-lofts'
  },
  {
    id: 'tech-park',
    image: 'https://images.unsplash.com/photo-1507206942509-8b3b25a86e10?auto=format&fit=crop&w=800&q=80',
    status: { label: 'Live', tone: 'live' },
    roi: '+11.2% ROI',
    location: 'Lahore • Innovation Hub',
    title: 'Canal Tech Park',
    summary: 'Smart offices anchored by a multinational with rental uplifts tied to occupancy milestones and strong tenant covenants.',
    funding: 57,
    metrics: [
      { label: 'Min. Investment', value: 200000, format: 'currency' },
      { label: 'Projected Yield', value: '8.0% rental' },
      { label: 'Hold Period', value: '4 years' }
    ],
    tags: ['Institutional sponsor', 'Tenant upgrade reserve'],
    ctaLabel: 'Invest Now',
    ctaHref: '/investment-shares?id=canal-tech-park'
  }
]

export default function Investment() {
  const [enableScroll, setEnableScroll] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const marqueeCards = useMemo(() => {
    const base = INVESTMENT_STORIES.map((story, index) => ({
      ...story,
      __instanceKey: `investment-story-${story.id}-${index}-base`
    }))

    if (!enableScroll) {
      return base
    }

    const duplicated = []
    for (let loop = 0; loop < 2; loop += 1) {
      base.forEach((story, index) => {
        duplicated.push({
          ...story,
          __instanceKey: `investment-story-${story.id}-${index}-loop-${loop}`
        })
      })
    }

    return duplicated
  }, [enableScroll])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const cardCount = INVESTMENT_STORIES.length
    const mediaQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null

    const evaluate = () => {
      const isWide = window.innerWidth >= 1024
      const prefersReduced = mediaQuery ? mediaQuery.matches : false
      setEnableScroll(!prefersReduced && cardCount > 3 && isWide)
    }

    evaluate()
    window.addEventListener('resize', evaluate)

    if (mediaQuery) {
      const handleChange = () => evaluate()
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange)
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleChange)
      }

      return () => {
        window.removeEventListener('resize', evaluate)
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleChange)
        } else if (typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(handleChange)
        }
      }
    }

    return () => {
      window.removeEventListener('resize', evaluate)
    }
  }, [])

  useEffect(() => {
    if (!enableScroll) {
      setIsPaused(false)
    }
  }, [enableScroll])

  const handleInteractionStart = () => {
    if (enableScroll) {
      setIsPaused(true)
    }
  }

  const handleInteractionEnd = () => {
    if (enableScroll) {
      setIsPaused(false)
    }
  }

  const trackerAnimationState = enableScroll ? (isPaused ? 'paused' : 'running') : undefined

  return (
    <>
      <Head>
        <title>Investment - REMMIC</title>
        <meta content="Smart property investment opportunities with REMMIC" property="og:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
      </Head>
      
      <div className="page-wrapper">
        <Navbar />
        
        <main className="main-wrapper">
          {/* Header Section */}
          <header className="section-header">
            <div className="padding-global">
              <div className="container-large">
                <div className="header-component">
                  <div className="header-top-content-wrap">
                    <div className="header-top-card">
                      <h1 className="heading-style-h1">Smart Property</h1>
                    </div>
                    <div className="header-top-card second">
                      <div className="header-top-card-content">
                        <h1 className="heading-style-h1 text-color-brand">Investment Opportunities</h1>
                      </div>
                      <div className="header-button-wrapper">
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Start Investing</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Investment Features */}
          <section className="section-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="feature-component">
                    <div className="feature-top-content-wrapper">
                      <div className="section-tag">
                        <div>Investment</div>
                      </div>
                      <h2 className="heading-style-h2">
                        Maximize Your Returns with Smart Property Investments
                      </h2>
                    </div>
                    <div className="padding-bottom padding-large"></div>
                    <div className="feature-bottom-content-wrapper" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '30px',
                      alignItems: 'stretch'
                    }}>
                      
                      {/* High-Yield Properties */}
                      <div className="feature-bottom-card first-card" style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#fff'
                      }}>
                        <div className="feature-bottom-image-wrapper" style={{position: 'relative'}}>
                          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1280&h=800&fit=crop"
                               loading="lazy"
                               alt="High-Yield Properties"
                               className="feature-bottom-image first"
                               style={{width: '100%', height: '200px', objectFit: 'cover'}} />
                          <div className="feature-bottom-circal"></div>
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            background: 'rgba(255, 94, 1, 0.9)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>REMMIC</div>
                        </div>
                        <div className="feature-bottom-content" style={{
                          padding: '20px',
                          flexGrow: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h5 className="heading-style-h5" style={{marginBottom: '12px'}}>High-Yield Properties</h5>
                            <div className="text-size-regular" style={{marginBottom: '20px'}}>Discover properties with exceptional ROI potential and growth prospects.</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <a href="/property" className="button is-secondary w-inline-block" style={{
                              padding: '10px 20px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}>
                              <div className="button-text">Explore</div>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Market Analysis */}
                      <div className="feature-bottom-card second-card" style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#fff'
                      }}>
                        <div className="feature-bottom-image-wrapper second" style={{position: 'relative'}}>
                          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1280&h=800&fit=crop"
                               loading="lazy"
                               alt="Market Analysis"
                               className="feature-bottom-image"
                               style={{width: '100%', height: '200px', objectFit: 'cover'}} />
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            background: 'rgba(255, 94, 1, 0.9)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>REMMIC</div>
                        </div>
                        <div className="feature-bottom-content" style={{
                          padding: '20px',
                          flexGrow: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h5 className="heading-style-h5" style={{marginBottom: '12px'}}>AI Market Analysis</h5>
                            <div className="text-size-regular" style={{marginBottom: '20px'}}>Data-driven insights and predictive analytics for informed decisions.</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <a href="/analysis" className="button is-secondary w-inline-block" style={{
                              padding: '10px 20px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}>
                              <div className="button-text">Analyze</div>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Portfolio Management */}
                      <div className="feature-bottom-card third" style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#fff'
                      }}>
                        <div className="feature-bottom-image-wrapper third" style={{position: 'relative'}}>
                          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1280&h=800&fit=crop"
                               loading="lazy"
                               alt="Portfolio Management"
                               className="feature-bottom-image second"
                               style={{width: '100%', height: '200px', objectFit: 'cover'}} />
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            background: 'rgba(255, 94, 1, 0.9)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>REMMIC</div>
                        </div>
                        <div className="feature-bottom-content" style={{
                          padding: '20px',
                          flexGrow: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h5 className="heading-style-h5" style={{marginBottom: '12px'}}>Portfolio Management</h5>
                            <div className="text-size-regular" style={{marginBottom: '20px'}}>Comprehensive tools to manage and optimize your investment portfolio.</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <a href="/portfolio" className="button is-secondary w-inline-block" style={{
                              padding: '10px 20px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}>
                              <div className="button-text">Manage</div>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="feature-bottom-card fourth" style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#fff'
                      }}>
                        <div className="feature-bottom-image-wrapper third" style={{position: 'relative'}}>
                          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1280&h=800&fit=crop"
                               loading="lazy"
                               alt="Risk Assessment"
                               className="feature-bottom-image second"
                               style={{width: '100%', height: '200px', objectFit: 'cover'}} />
                          <div style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            background: 'rgba(255, 94, 1, 0.9)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>REMMIC</div>
                        </div>
                        <div className="feature-bottom-content" style={{
                          padding: '20px',
                          flexGrow: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          <div>
                            <h5 className="heading-style-h5" style={{marginBottom: '12px'}}>Risk Assessment</h5>
                            <div className="text-size-regular" style={{marginBottom: '20px'}}>Advanced risk analysis to protect and grow your investments.</div>
                          </div>
                          <div style={{textAlign: 'right'}}>
                            <a href="/risk" className="button is-secondary w-inline-block" style={{
                              padding: '10px 20px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              display: 'inline-block'
                            }}>
                              <div className="button-text">Assess</div>
                            </a>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

          {/* Featured Opportunities */}
          <section className="section-investment-stories" style={{ background: '#f8fafc' }}>
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium investment-stories">
                  <div className="investment-stories__header">
                    <div className="section-tag">
                      <div>Featured</div>
                    </div>
                    <h2 className="heading-style-h2">Curated Opportunities with Continuous Visibility</h2>
                    <p className="text-size-medium investment-stories__description">
                      Explore live REMMIC offerings vetted by our due diligence desk. Each opportunity meets our cash flow, governance, and growth thresholds before it appears in the marketplace.
                    </p>
                  </div>

                  <div className="story-tracker-wrapper investment-stories__marquee">
                    <div
                      className={`story-tracker${enableScroll && !isPaused ? ' scrolling' : ''}`}
                      onMouseEnter={handleInteractionStart}
                      onMouseLeave={handleInteractionEnd}
                      onTouchStart={handleInteractionStart}
                      onTouchEnd={handleInteractionEnd}
                      onPointerDown={handleInteractionStart}
                      onPointerUp={handleInteractionEnd}
                      onPointerCancel={handleInteractionEnd}
                      style={enableScroll ? { animationPlayState: trackerAnimationState } : undefined}
                    >
                      {marqueeCards.map((card, index) => {
                        const {
                          __instanceKey,
                          status,
                          roi,
                          image,
                          title,
                          location,
                          summary,
                          funding,
                          metrics,
                          tags,
                          ctaHref,
                          ctaLabel
                        } = card

                        const statusTone = status?.tone || 'live'
                        const statusAccentMap = {
                          live: '#0ea5e9',
                          selling: '#f97316',
                          limited: '#ef4444',
                          closed: '#94a3b8'
                        }
                        const statusAccent = statusAccentMap[statusTone] || '#0ea5e9'
                        const progress = Math.min(Math.max(typeof funding === 'number' ? funding : 0, 0), 100)
                        const safeMetrics = Array.isArray(metrics) ? metrics : []
                        const safeTags = Array.isArray(tags) ? tags : []
                        const targetHref = ctaHref || '/investment-shares'
                        const targetLabel = ctaLabel || 'Explore'

                        return (
                          <article
                            key={__instanceKey || `investment-card-${index}`}
                            className="story-card investment-story-card"
                          >
                            <div className="investment-story-card__media">
                              <img src={image} alt={title} loading="lazy" />
                              {status?.label && (
                                <span
                                  className="investment-story-card__badge investment-story-card__badge--status"
                                  style={{ background: statusAccent }}
                                >
                                  {status.label}
                                </span>
                              )}
                              {roi && (
                                <span className="investment-story-card__badge investment-story-card__badge--roi">
                                  {roi}
                                </span>
                              )}
                            </div>
                            <div className="investment-story-card__body">
                              <div>
                                <h3 className="heading-style-h5 investment-story-card__title">{title}</h3>
                                {location && (
                                  <p className="investment-story-card__location">{location}</p>
                                )}
                                {summary && (
                                  <p className="investment-story-card__summary">{summary}</p>
                                )}
                              </div>

                              {safeMetrics.length > 0 && (
                                <div className="investment-story-card__metrics">
                                  {safeMetrics.map((metric, metricIndex) => (
                                    <div
                                      key={`${__instanceKey || index}-metric-${metricIndex}`}
                                      className="investment-story-card__metric"
                                    >
                                      <span className="investment-story-card__metric-label">{metric.label}</span>
                                      <span className="investment-story-card__metric-value">{getMetricValue(metric)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="investment-story-card__progress">
                                <div className="investment-story-card__progress-track">
                                  <div
                                    className="investment-story-card__progress-fill"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="investment-story-card__progress-label">{progress}% funded</span>
                              </div>

                              {safeTags.length > 0 && (
                                <div className="investment-story-card__tags">
                                  {safeTags.map((tag, tagIndex) => (
                                    <span
                                      key={`${__instanceKey || index}-tag-${tagIndex}`}
                                      className="investment-story-card__tag"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="investment-story-card__cta">
                                <a href={targetHref} className="button is-secondary w-inline-block">
                                  <div className="button-text">{targetLabel}</div>
                                </a>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style jsx>{`
              .investment-stories {
                display: flex;
                flex-direction: column;
                gap: 40px;
              }

              .investment-stories__header {
                max-width: 720px;
                display: flex;
                flex-direction: column;
                gap: 16px;
              }

              .investment-stories__description {
                margin: 0;
                color: #475569;
                line-height: 1.6;
              }

              .investment-story-card {
                width: 320px;
                min-height: 460px;
                display: flex;
                flex-direction: column;
                background: #ffffff;
                border-radius: 16px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }

              .investment-story-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 24px 50px rgba(15, 23, 42, 0.12);
              }

              .investment-story-card__media {
                position: relative;
                height: 200px;
                overflow: hidden;
              }

              .investment-story-card__media img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.6s ease;
              }

              .investment-story-card:hover .investment-story-card__media img {
                transform: scale(1.05);
              }

              .investment-story-card__badge {
                position: absolute;
                top: 16px;
                padding: 6px 12px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 600;
                color: #ffffff;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                background: rgba(15, 23, 42, 0.8);
              }

              .investment-story-card__badge--status {
                left: 16px;
              }

              .investment-story-card__badge--roi {
                right: 16px;
                background: rgba(15, 23, 42, 0.85);
              }

              .investment-story-card__body {
                display: flex;
                flex-direction: column;
                gap: 18px;
                padding: 22px 24px 24px;
              }

              .investment-story-card__title {
                margin: 0;
                color: #0f172a;
              }

              .investment-story-card__location {
                margin: 6px 0 10px;
                color: #64748b;
                font-size: 14px;
              }

              .investment-story-card__summary {
                margin: 0;
                color: #475569;
                font-size: 14px;
                line-height: 1.6;
              }

              .investment-story-card__metrics {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 12px;
              }

              .investment-story-card__metric {
                display: flex;
                flex-direction: column;
                gap: 4px;
              }

              .investment-story-card__metric-label {
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #94a3b8;
              }

              .investment-story-card__metric-value {
                font-size: 14px;
                font-weight: 600;
                color: #0f172a;
              }

              .investment-story-card__progress {
                display: flex;
                flex-direction: column;
                gap: 6px;
              }

              .investment-story-card__progress-track {
                height: 6px;
                border-radius: 999px;
                background: #e2e8f0;
                overflow: hidden;
              }

              .investment-story-card__progress-fill {
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, #f97316, #fb923c);
              }

              .investment-story-card__progress-label {
                font-size: 12px;
                font-weight: 600;
                color: #475569;
              }

              .investment-story-card__tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
              }

              .investment-story-card__tag {
                padding: 6px 12px;
                border-radius: 999px;
                background: #f1f5f9;
                font-size: 12px;
                font-weight: 500;
                color: #475569;
              }

              .investment-story-card__cta {
                margin-top: auto;
              }

              @media (max-width: 1200px) {
                .investment-story-card {
                  width: 300px;
                }

                .investment-story-card__metrics {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }

              @media (max-width: 767px) {
                .section-investment-stories {
                  background: #ffffff;
                }

                .investment-stories {
                  gap: 28px;
                }

                .investment-story-card {
                  width: 260px;
                  min-height: 420px;
                }

                .investment-story-card__body {
                  padding: 20px;
                }

                .investment-story-card__metrics {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
            `}</style>

            <style jsx global>{`
              .investment-stories__marquee.story-tracker-wrapper {
                padding: 0 !important;
                margin: 0 !important;
              }

              .investment-stories__marquee .story-tracker {
                gap: 32px !important;
                padding: 0 !important;
                align-items: stretch !important;
              }

              .investment-stories__marquee .story-tracker.scrolling {
                animation-duration: 55s !important;
              }

              .investment-stories__marquee .story-tracker:hover,
              .investment-stories__marquee .story-tracker:active {
                cursor: grab;
              }
            `}</style>
          </section>

          {/* Investment Process */}
          <section className="section-process">
            <div className="page-lode">
              <div className="process-component">
                <div className="process-top-content">
                  <div className="process-head-line">
                    <div>Process</div>
                  </div>
                  <h2 className="heading-style-h2">Start Investing in Just 3 Simple Steps</h2>
                </div>
                <div className="process-bottom-content">
                  <div className="process-card-list-wrapper">
                    <div className="process-card-wrapper fast">
                      <div className="process-line-wrapper">
                        <div className="process-number first">
                          <h6 className="heading-style-h6">01</h6>
                        </div>
                        <div className="process-line">
                          <div className="process-hover-line"></div>
                        </div>
                      </div>
                      <div className="process-card first">
                        <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201.png" 
                             loading="lazy" alt="" className="process-card-image" />
                        <div className="process-card-content">
                          <h6 className="heading-style-h6">Create Investment Profile</h6>
                          <div className="text-size-regular">Set your investment goals, risk tolerance, and budget preferences.</div>
                        </div>
                      </div>
                    </div>
                    <div className="process-card-wrapper">
                      <div className="process-card second">
                        <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202.png" 
                             loading="lazy" alt="" className="process-card-image" />
                        <div className="process-card-content">
                          <h6 className="heading-style-h6">Analyze Opportunities</h6>
                          <div className="text-size-regular">Review curated investment opportunities with detailed market analysis.</div>
                        </div>
                      </div>
                      <div className="process-line-wrapper">
                        <div className="process-number second">
                          <h6 className="heading-style-h6">02</h6>
                        </div>
                        <div className="process-line">
                          <div className="process-second-hover-line"></div>
                        </div>
                      </div>
                    </div>
                    <div className="process-card-wrapper">
                      <div className="process-line-wrapper">
                        <div className="process-number third">
                          <h6 className="heading-style-h6">03</h6>
                        </div>
                        <div className="process-line">
                          <div className="process-third-hover-line"></div>
                        </div>
                      </div>
                      <div className="process-card third">
                        <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203.png" 
                             loading="lazy" alt="" className="process-card-image" />
                        <div className="process-card-content">
                          <h6 className="heading-style-h6">Invest & Monitor</h6>
                          <div className="text-size-regular">Make secure investments and track performance with real-time analytics.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Stats */}
          <section className="section-stats" style={{padding: '80px 0', background: '#f9f9f9'}}>
            <div className="padding-global">
              <div className="container-large">
                <div className="stats-component" style={{textAlign: 'center'}}>
                  <h2 className="heading-style-h2" style={{marginBottom: '50px'}}>Investment Performance</h2>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px'}}>
                    <div className="stat-card">
                      <h3 style={{fontSize: '3rem', fontWeight: 'bold', color: '#ff5e01', margin: '0'}}>15.2%</h3>
                      <p style={{fontSize: '1.2rem', color: '#666', margin: '10px 0 0 0'}}>Average Annual ROI</p>
                    </div>
                    <div className="stat-card">
                      <h3 style={{fontSize: '3rem', fontWeight: 'bold', color: '#ff5e01', margin: '0'}}>$2.5M+</h3>
                      <p style={{fontSize: '1.2rem', color: '#666', margin: '10px 0 0 0'}}>Total Investments</p>
                    </div>
                    <div className="stat-card">
                      <h3 style={{fontSize: '3rem', fontWeight: 'bold', color: '#ff5e01', margin: '0'}}>850+</h3>
                      <p style={{fontSize: '1.2rem', color: '#666', margin: '10px 0 0 0'}}>Active Investors</p>
                    </div>
                    <div className="stat-card">
                      <h3 style={{fontSize: '3rem', fontWeight: 'bold', color: '#ff5e01', margin: '0'}}>95%</h3>
                      <p style={{fontSize: '1.2rem', color: '#666', margin: '10px 0 0 0'}}>Positive Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="section-cta">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="cta-component">
                    <div className="cta-content">
                      <h2 className="heading-style-h2">Ready to Start Your Investment Journey?</h2>
                      <div className="cta-button-wrapper">
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Get Started</div>
                        </a>
                        <a href="/login" className="button w-inline-block">
                          <div className="button-text">Join Now</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      <script src="/scripts/remove-webflow-badge.js"></script>
    </>
  )
}
