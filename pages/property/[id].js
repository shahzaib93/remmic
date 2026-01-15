import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'

const ASSET_DETAILS = {
  'dha-smart-villa': {
    name: 'DHA Phase 6 Smart Villa',
    location: 'DHA Phase 6, Lahore',
    description:
      'Smart-enabled one kanal villa curated for yield plus appreciation investors. Managed tenant pipeline with predictive maintenance stack.',
    grade: 'A',
    gallery: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    overview: {
      assetType: 'Residential villa',
      highlights: ['AI-backed valuation & REMMIC audit complete', 'Tenant secured for 24 months', 'On-chain reporting pilot ready'],
    },
    financials: {
      valuation: 'PKR 850M (REM Verified)',
      expectedYield: '12.4% net (not guaranteed)',
      fees: ['2% acquisition servicing', '1% yearly management', 'Performance fee above 14% IRR'],
    },
    riskInsurance: {
      riskFactors: ['Tenant rollover risk after 24 months', 'Smart device maintenance exposure', 'FX sensitivity for overseas investors'],
      insurance: { status: 'Active', provider: 'EFU', coverage: 'Structure + rental default' },
    },
    ownership: {
      availableShares: '3,200 fractional lots',
      minimumInvestment: 'PKR 2.5M',
      lockIn: '12 months lock-in, quarterly liquidity thereafter',
    },
  },
  'blue-area-office': {
    name: 'Blue Area Corporate Floors',
    location: 'Blue Area, Islamabad',
    description:
      'Grade-A commercial floors with 9-year leaseback to a fintech anchor tenant. Includes REMMIC building ops and insurance coverage from Jubilee.',
    grade: 'A-',
    gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    overview: {
      assetType: 'Commercial office floors',
      highlights: ['Lease-backed cash flows', 'Capex reserve funded', 'Environmental compliance cleared'],
    },
    financials: {
      valuation: 'PKR 1.5B (independent appraisal)',
      expectedYield: '14.1% net (not guaranteed)',
      fees: ['1.5% structure fee', '0.8% monthly ops', 'Carry above 15% IRR'],
    },
    riskInsurance: {
      riskFactors: ['Anchor renewal risk year 5', 'Indexation tied to CPI', 'Regulatory requirements for fintech tenant'],
      insurance: { status: 'Active', provider: 'Jubilee', coverage: 'Property + business interruption' },
    },
    ownership: {
      availableShares: '5,000 institutional lots',
      minimumInvestment: 'PKR 5.0M',
      lockIn: '18 months lock-in, semiannual windows',
    },
  },
  'clifton-harbor': {
    name: 'Clifton Harbor Residences',
    location: 'Clifton Block 5, Karachi',
    description:
      'Seafront residences with occupancy-backed rental roll. Conservative remittance strategy with diversified tenant roster.',
    grade: 'A+',
    gallery: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
    overview: {
      assetType: 'Luxury residential tower',
      highlights: ['Insurance pending final bind', 'Rental escrow monitored by REMMIC', 'Marine-grade maintenance schedule'],
    },
    financials: {
      valuation: 'PKR 620M (REM Verified)',
      expectedYield: '9.8% net (not guaranteed)',
      fees: ['1% onboarding', '0.75% rental management'],
    },
    riskInsurance: {
      riskFactors: ['Coastal weather exposure', 'Premium tenant churn', 'Insurance binding pending'],
      insurance: { status: 'Pending', provider: 'TBD', coverage: 'In negotiation' },
    },
    ownership: {
      availableShares: 'Full ownership blocks',
      minimumInvestment: 'PKR 1.8M',
      lockIn: '6 months lock before resale',
    },
  },
  'tech-park': {
    name: 'Lahore Tech Park',
    location: 'Main Boulevard, Lahore',
    description:
      'Innovation campus with hybrid leasing mix and embedded data center capacity. Aggressive yield profile with upside through token liquidity pilot.',
    grade: 'B+',
    gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    overview: {
      assetType: 'Commercial tech campus',
      highlights: ['Token liquidity (coming soon)', 'Power redundancy upgrades complete', 'ESG reporting available'],
    },
    financials: {
      valuation: 'PKR 2.1B (tech-specialist appraisal)',
      expectedYield: '16.3% net (not guaranteed)',
      fees: ['2.5% development fee', '1.2% ops retainer'],
    },
    riskInsurance: {
      riskFactors: ['High capex requirements', 'Token liquidity regulatory approvals', 'Aggressive yield strategy'],
      insurance: { status: 'Active', provider: 'Adamjee', coverage: 'Structure + data center equipment' },
    },
    ownership: {
      availableShares: '7,500 token-ready shares',
      minimumInvestment: 'PKR 8.0M',
      lockIn: '24 months lock prior to token launch',
    },
  },
  'karachi-logistics': {
    name: 'Karachi Logistics Hub',
    location: 'Port Qasim, Karachi',
    description:
      'Critical logistics facility catering to FMCG exporters. Mid-risk yield with resilient tenants and REMMIC-managed maintenance.',
    grade: 'A',
    gallery: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    overview: {
      assetType: 'Industrial logistics',
      highlights: ['Port adjacency advantage', 'Dual insurance pending', 'FX-hedged rent structure'],
    },
    financials: {
      valuation: 'PKR 980M (logistics specialist)',
      expectedYield: '13.5% net (not guaranteed)',
      fees: ['1.2% asset management', 'Maintenance at cost'],
    },
    riskInsurance: {
      riskFactors: ['Port congestion impact', 'FX hedging counterparties', 'Industrial maintenance capex'],
      insurance: { status: 'Partial', provider: 'In progress', coverage: 'Structure confirmed; liability pending' },
    },
    ownership: {
      availableShares: '4,200 lots',
      minimumInvestment: 'PKR 6.0M',
      lockIn: '12 months lock, then quarterly exits',
    },
  },
  'skardu-retreat': {
    name: 'Skardu Mountain Retreat',
    location: 'Shangrila Road, Skardu',
    description:
      'Boutique hospitality asset with seasonal uplift and curated eco-tourism experiences. Conservative yield with upside in peak quarters.',
    grade: 'A-',
    gallery: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
    overview: {
      assetType: 'Hospitality',
      highlights: ['Insurance active via TPL', 'Eco-certification underway', 'Remote ops center monitoring'],
    },
    financials: {
      valuation: 'PKR 420M (hospitality review)',
      expectedYield: '11.1% net (not guaranteed)',
      fees: ['0.9% eco-ops fee', 'Seasonal revenue share'],
    },
    riskInsurance: {
      riskFactors: ['Seasonality', 'Weather-related closures', 'Tourism policy shifts'],
      insurance: { status: 'Active', provider: 'TPL', coverage: 'Property + business interruption' },
    },
    ownership: {
      availableShares: '2,000 eco-shares',
      minimumInvestment: 'PKR 1.2M',
      lockIn: '9 months lock, seasonal redemptions',
    },
  },
}

const TABS = [
  {
    id: 'Overview',
    label: 'Overview',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    )
  },
  {
    id: 'Financials',
    label: 'Financials',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    )
  },
  {
    id: 'Risk & Insurance',
    label: 'Risk & Insurance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )
  },
  {
    id: 'Ownership',
    label: 'Ownership',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    )
  }
]

export default function PropertyDetail() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useFirebase()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [tabTransition, setTabTransition] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [watchlisted, setWatchlisted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 120)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Check login state
    if (user) {
      setIsLoggedIn(true)
    } else {
      const userData = localStorage.getItem('userData')
      setIsLoggedIn(!!userData)
    }
  }, [user])

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return
    setTabTransition(true)
    setTimeout(() => {
      setActiveTab(tabId)
      setTimeout(() => setTabTransition(false), 50)
    }, 200)
  }

  const handleInvestClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/property/${id}`)
      return
    }
    // Investment action for logged-in users
    router.push(`/investment-payment?asset=${id}`)
  }

  const handleBidClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/property/${id}`)
      return
    }
    // Bidding action for logged-in users
    router.push(`/bidding?asset=${id}`)
  }

  const handleWatchlistClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/property/${id}`)
      return
    }
    setWatchlisted(!watchlisted)
  }

  if (!router.isReady) return null

  const asset = id && ASSET_DETAILS[id]

  if (!asset) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper not-found">
          <h1>Asset not found</h1>
          <p>
            The asset you are looking for is unavailable. Return to the <a href="/marketplace">Marketplace</a>.
          </p>
        </main>
        <Footer />
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="tab-content overview">
            {/* Gallery Section - BidX1 Style Full Width */}
            <div className="bidx-gallery">
              <div className="bidx-gallery__main">
                <img src={asset.gallery[0]} alt={`${asset.name} main`} />
                <div className="bidx-gallery__badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                  {asset.gallery.length} Photos
                </div>
              </div>
              <div className="bidx-gallery__thumbs">
                {asset.gallery.slice(1).map((image, index) => (
                  <div key={image} className="bidx-gallery__thumb">
                    <img src={image} alt={`${asset.name} ${index + 2}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Property Summary + Contact - BidX1 Style */}
            <div className="bidx-summary-row">
              <div className="bidx-summary">
                <h3>Property Summary</h3>
                <ul className="bidx-summary__list">
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                    Grade {asset.grade} rated asset
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                    {asset.overview.assetType}
                  </li>
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                    Located in {asset.location}
                  </li>
                  {asset.overview.highlights.map((highlight) => (
                    <li key={highlight}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                      {highlight}
                    </li>
                  ))}
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
                    Insurance: {asset.riskInsurance.insurance.status}
                  </li>
                </ul>
              </div>
              <div className="bidx-contact">
                <h3>Investment Details</h3>
                <div className="bidx-contact__card">
                  <div className="bidx-contact__item">
                    <span className="bidx-contact__label">Min. Investment</span>
                    <span className="bidx-contact__value">{asset.ownership.minimumInvestment}</span>
                  </div>
                  <div className="bidx-contact__item">
                    <span className="bidx-contact__label">Expected Yield</span>
                    <span className="bidx-contact__value bidx-contact__value--highlight">{asset.financials.expectedYield.split(' ')[0]}</span>
                  </div>
                  <div className="bidx-contact__item">
                    <span className="bidx-contact__label">Lock-in Period</span>
                    <span className="bidx-contact__value">{asset.ownership.lockIn.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Details Table - BidX1 Style */}
            <div className="bidx-details">
              <div className="bidx-details__row">
                <span className="bidx-details__label">Property Description</span>
                <div className="bidx-details__content">
                  <p>{asset.description}</p>
                </div>
              </div>
              <div className="bidx-details__row">
                <span className="bidx-details__label">Location</span>
                <div className="bidx-details__content">
                  <p>{asset.location}</p>
                </div>
              </div>
              <div className="bidx-details__row">
                <span className="bidx-details__label">Asset Type</span>
                <div className="bidx-details__content">
                  <p>{asset.overview.assetType}</p>
                </div>
              </div>
              <div className="bidx-details__row">
                <span className="bidx-details__label">Valuation</span>
                <div className="bidx-details__content">
                  <p>{asset.financials.valuation}</p>
                </div>
              </div>
              <div className="bidx-details__row">
                <span className="bidx-details__label">Available Shares</span>
                <div className="bidx-details__content">
                  <p>{asset.ownership.availableShares}</p>
                </div>
              </div>
              <div className="bidx-details__row">
                <span className="bidx-details__label">Insurance</span>
                <div className="bidx-details__content">
                  <p><strong>Status:</strong> {asset.riskInsurance.insurance.status}</p>
                  <p><strong>Provider:</strong> {asset.riskInsurance.insurance.provider}</p>
                  <p><strong>Coverage:</strong> {asset.riskInsurance.insurance.coverage}</p>
                </div>
              </div>
              <div className="bidx-details__row">
                <span className="bidx-details__label">Fee Structure</span>
                <div className="bidx-details__content">
                  {asset.financials.fees.map((fee, index) => (
                    <p key={index}>{fee}</p>
                  ))}
                </div>
              </div>
              <div className="bidx-details__row bidx-details__row--warning">
                <span className="bidx-details__label">Risk Factors</span>
                <div className="bidx-details__content bidx-details__content--warning">
                  {asset.riskInsurance.riskFactors.map((risk, index) => (
                    <p key={index}>• {risk}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'Financials':
        return (
          <div className="tab-content financials">
            <div className="content-header">
              <div className="content-header__icon content-header__icon--gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div className="content-header__text">
                <h2>Financial Details</h2>
                <p>Complete financial breakdown and fee structure for this investment opportunity.</p>
              </div>
            </div>
            <div className="financials-grid">
              <div className="stat-card stat-card--featured">
                <div className="stat-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                </div>
                <span>Current Valuation</span>
                <strong>{asset.financials.valuation}</strong>
                <div className="stat-badge">REM Verified</div>
              </div>
              <div className="stat-card stat-card--yield">
                <div className="stat-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                    <polyline points="17,6 23,6 23,12"/>
                  </svg>
                </div>
                <span>Expected Yield</span>
                <strong>{asset.financials.expectedYield}</strong>
                <div className="stat-badge stat-badge--warning">Not Guaranteed</div>
              </div>
              <div className="stat-card stat-card--fees">
                <div className="stat-card__header">
                  <div className="stat-card__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <span>Fee Breakdown</span>
                </div>
                <ul>
                  {asset.financials.fees.map((fee, index) => (
                    <li key={fee}>
                      <span className="fee-bullet">{index + 1}</span>
                      {fee}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      case 'Risk & Insurance':
        return (
          <div className="tab-content risk">
            <div className="content-header">
              <div className="content-header__icon content-header__icon--brown">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="content-header__text">
                <h2>Risk Assessment & Insurance</h2>
                <p>Comprehensive risk analysis and insurance coverage details for informed decision-making.</p>
              </div>
            </div>
            <div className="risk-grid">
              <div className="risk__block risk__block--factors">
                <div className="risk__block-header">
                  <div className="risk__block-icon risk__block-icon--warning">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <h3>Risk Factors</h3>
                </div>
                <ul>
                  {asset.riskInsurance.riskFactors.map((risk, index) => (
                    <li key={risk}>
                      <span className="risk-number">{index + 1}</span>
                      <span className="risk-text">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="risk__block risk__block--insurance">
                <div className="risk__block-header">
                  <div className="risk__block-icon risk__block-icon--success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <h3>Insurance Coverage</h3>
                </div>
                <div className="insurance-details">
                  <div className="insurance-row">
                    <span className="insurance-label">Status</span>
                    <span className={`insurance-value insurance-status insurance-status--${asset.riskInsurance.insurance.status.toLowerCase()}`}>
                      {asset.riskInsurance.insurance.status}
                    </span>
                  </div>
                  <div className="insurance-row">
                    <span className="insurance-label">Provider</span>
                    <span className="insurance-value">{asset.riskInsurance.insurance.provider}</span>
                  </div>
                  <div className="insurance-row insurance-row--coverage">
                    <span className="insurance-label">Coverage</span>
                    <span className="insurance-value">{asset.riskInsurance.insurance.coverage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Ownership':
        return (
          <div className="tab-content ownership">
            <div className="content-header">
              <div className="content-header__icon content-header__icon--purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div className="content-header__text">
                <h2>Ownership Structure</h2>
                <p>Investment tiers, share availability, and lock-in period information.</p>
              </div>
            </div>
            <div className="ownership-grid">
              <div className="ownership-card">
                <div className="ownership-card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                  </svg>
                </div>
                <span>Available Shares</span>
                <strong>{asset.ownership.availableShares}</strong>
              </div>
              <div className="ownership-card ownership-card--highlight">
                <div className="ownership-card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                </div>
                <span>Minimum Investment</span>
                <strong>{asset.ownership.minimumInvestment}</strong>
                <div className="ownership-card__badge">Entry Point</div>
              </div>
              <div className="ownership-card">
                <div className="ownership-card__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span>Lock-in Period</span>
                <strong>{asset.ownership.lockIn}</strong>
              </div>
            </div>
            <div className="ownership-cta">
              <p>Ready to become a fractional owner of this premium asset?</p>
              <button className="ownership-cta__btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
                Start Investment Process
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Head>
        <title>{asset.name} | REMMIC Marketplace</title>
        <meta name="description" content={`Detailed overview for ${asset.name} located in ${asset.location}.`} />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__content ${mounted ? 'is-visible' : ''}`}>
              <div className="hero__badge-row">
                <span className="hero__eyebrow">Asset Detail</span>
                <span className={`hero__grade grade-${asset.grade.replace('+', '-plus').replace('-', '-minus')}`}>
                  Grade {asset.grade}
                </span>
              </div>
              <h1>{asset.name}</h1>
              <div className="hero__location">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {asset.location}
              </div>
              <p className="hero__description">{asset.description}</p>
              <div className="hero__tags">
                <span className="hero__tag">{asset.overview.assetType}</span>
                <span className="hero__tag hero__tag--insurance">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Insurance: {asset.riskInsurance.insurance.status}
                </span>
              </div>
            </div>
          </section>

          <section className="tabs-layout">
            <div className="tabs-layout__main">
              <section className="tabs">
                <div className="tabs__wrapper">
                  <div className="tabs__nav">
                    {TABS.map((tab, index) => (
                      <button
                        key={tab.id}
                        className={`tabs__btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                        style={{ '--tab-index': index }}
                      >
                        <span className="tabs__btn-icon">{tab.icon}</span>
                        <span className="tabs__btn-label">{tab.label}</span>
                        {activeTab === tab.id && <span className="tabs__btn-indicator" />}
                      </button>
                    ))}
                  </div>
                  <div className="tabs__counter">
                    {TABS.findIndex(t => t.id === activeTab) + 1} / {TABS.length}
                  </div>
                </div>
                <div className={`tabs__content ${tabTransition ? 'transitioning' : ''}`}>
                  {renderTabContent()}
                </div>
              </section>
            </div>

            {/* Sticky CTA Panel */}
            <aside className="cta-panel">
              {/* Insurance & Risk Status - Always Visible */}
              <div className="cta-panel__status">
                <div className={`cta-panel__insurance cta-panel__insurance--${asset.riskInsurance.insurance.status.toLowerCase()}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Insurance: {asset.riskInsurance.insurance.status}</span>
                </div>
                <div className="cta-panel__risk">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>{asset.riskInsurance.riskFactors.length} Risk Factors</span>
                </div>
              </div>

              <div className="cta-panel__header">
                <h3>{isLoggedIn ? 'Ready to Invest?' : 'View Asset Details'}</h3>
                <p>{isLoggedIn ? 'Take your next step towards building wealth with real assets.' : 'Login to access investment features.'}</p>
              </div>

              <div className="cta-panel__stats">
                <div className="cta-stat">
                  <span>Min. Investment</span>
                  <strong>{asset.ownership.minimumInvestment}</strong>
                </div>
                <div className="cta-stat">
                  <span>Expected Yield</span>
                  <strong>{asset.financials.expectedYield.split(' ')[0]}</strong>
                </div>
              </div>

              {/* Risk Disclosure - Always Visible */}
              <div className="cta-panel__risk-disclosure">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                <span>Returns are not guaranteed. Capital at risk.</span>
              </div>

              {isLoggedIn ? (
                <>
                  <div className="cta-panel__buttons">
                    <button className="cta-btn cta-btn--primary" onClick={handleInvestClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                      </svg>
                      Invest Now
                    </button>
                    <button className="cta-btn cta-btn--secondary" onClick={handleBidClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                      </svg>
                      Join Live Bid
                    </button>
                    <button className={`cta-btn cta-btn--outline ${watchlisted ? 'cta-btn--watchlisted' : ''}`} onClick={handleWatchlistClick}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={watchlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                      </svg>
                      {watchlisted ? 'Watchlisted' : 'Add to Watchlist'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="cta-panel__buttons">
                    <button className="cta-btn cta-btn--primary" onClick={() => router.push(`/login?redirect=/property/${id}`)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                        <polyline points="10,17 15,12 10,7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      Login to Invest
                    </button>
                    <a href="/signup" className="cta-btn cta-btn--outline">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                      </svg>
                      Create Account
                    </a>
                  </div>
                  <p className="cta-panel__note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                    View-only mode. Login required for investment actions.
                  </p>
                </>
              )}
            </aside>
          </section>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        /* Hero Section */
        .hero {
          padding: 100px 5% 44px;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          color: #fff;
          display: block;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 45%;
          height: 100%;
          background: radial-gradient(ellipse at 70% 30%, rgba(201, 162, 39, 0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Tabs Layout with Sticky CTA */
        .tabs-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 40px;
          padding: 48px 5% 80px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
          align-items: start;
        }

        .tabs-layout__main {
          min-width: 0;
        }

        /* CTA Panel - Sticky */
        .cta-panel {
          background: #ffffff;
          color: #0a0a0a;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 90px;
          border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .cta-panel__status {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .cta-panel__insurance {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
        }

        .cta-panel__insurance svg {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .cta-panel__insurance--active {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }

        .cta-panel__insurance--pending {
          background: rgba(245, 158, 11, 0.1);
          color: #b45309;
        }

        .cta-panel__insurance--partial {
          background: rgba(59, 130, 246, 0.1);
          color: #1d4ed8;
        }

        .cta-panel__risk {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          background: rgba(180, 83, 9, 0.08);
          border-radius: 10px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #92400e;
          font-family: 'Manrope', sans-serif;
        }

        .cta-panel__risk svg {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }

        .cta-panel__risk-disclosure {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(180, 83, 9, 0.05);
          border: 1px solid rgba(180, 83, 9, 0.12);
          border-radius: 10px;
          margin-bottom: 18px;
        }

        .cta-panel__risk-disclosure svg {
          color: #b45309;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .cta-panel__risk-disclosure span {
          font-size: 0.8125rem;
          color: #78350f;
          font-weight: 500;
          line-height: 1.45;
          font-family: 'Manrope', sans-serif;
        }

        .hero__content {
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
          max-width: 640px;
        }

        .hero__content.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__badge-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .hero__eyebrow {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #c9a227;
          font-family: 'Manrope', sans-serif;
        }

        .hero__grade {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'Manrope', sans-serif;
        }

        .grade-A-plus, .grade-A {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .grade-A-minus, .grade-B-plus {
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
          border: 1px solid rgba(201, 162, 39, 0.2);
        }

        .grade-B, .grade-B-minus {
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .hero h1 {
          margin: 0 0 10px;
          font-size: clamp(2.25rem, 5vw, 3.25rem);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: #ffffff;
          font-family: 'Playfair Display', serif;
        }

        .hero__location {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 0.9375rem;
          font-weight: 500;
          font-family: 'Manrope', sans-serif;
        }

        .hero__location svg {
          color: #c9a227;
          flex-shrink: 0;
          width: 16px;
          height: 16px;
        }

        .hero__description {
          margin: 0 0 18px;
          color: rgba(255, 255, 255, 0.68);
          line-height: 1.7;
          font-size: 1.0625rem;
          max-width: 540px;
          font-family: 'Manrope', sans-serif;
        }

        .hero__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .hero__tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.72);
          font-family: 'Manrope', sans-serif;
          transition: all 0.2s ease;
        }

        .hero__tag:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .hero__tag--insurance {
          background: rgba(74, 55, 40, 0.25);
          border-color: rgba(201, 162, 39, 0.25);
          color: #e0c894;
        }

        .hero__tag--insurance svg {
          color: #c9a227;
          width: 13px;
          height: 13px;
        }

        /* CTA Panel Header & Stats */
        .cta-panel__header {
          margin-bottom: 18px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .cta-panel__header h3 {
          margin: 0 0 6px;
          font-size: 1.125rem;
          font-weight: 700;
          color: #0a0a0a;
          font-family: 'Manrope', sans-serif;
          letter-spacing: -0.01em;
        }

        .cta-panel__header p {
          margin: 0;
          font-size: 0.875rem;
          color: #5f6368;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        .cta-panel__stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .cta-stat {
          background: linear-gradient(135deg, #f9f9f8 0%, #fafafa 100%);
          border: 1px solid #ebebeb;
          border-radius: 12px;
          padding: 16px 14px;
          text-align: center;
          transition: all 0.2s ease;
        }

        .cta-stat:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 2px 8px rgba(201, 162, 39, 0.08);
        }

        .cta-stat span {
          display: block;
          font-size: 0.6875rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
          font-family: 'Manrope', sans-serif;
        }

        .cta-stat strong {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0a0a0a;
          font-family: 'Manrope', sans-serif;
        }

        .cta-panel__buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: none;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          text-decoration: none;
          min-height: 50px;
          font-family: 'Manrope', sans-serif;
        }

        .cta-btn svg {
          width: 17px;
          height: 17px;
          flex-shrink: 0;
        }

        .cta-btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 16px rgba(201, 162, 39, 0.35);
        }

        .cta-btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.45);
        }

        .cta-btn--secondary {
          background: #0a0a0a;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .cta-btn--secondary:hover {
          background: #1a1a1a;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
        }

        .cta-btn--outline {
          background: transparent;
          color: #4b5563;
          border: 1.5px solid #e0e0e0;
        }

        .cta-btn--outline:hover {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.05);
          color: #b8922a;
        }

        .cta-btn--watchlisted {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.1);
          color: #b8922a;
        }

        .cta-panel__note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 16px 0 0;
          padding-top: 14px;
          border-top: 1px solid #f0f0f0;
          font-size: 0.8125rem;
          color: #9ca3af;
          text-align: center;
          line-height: 1.45;
          font-family: 'Manrope', sans-serif;
        }

        .cta-panel__note svg {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }

        /* Tabs Section */
        .tabs {
          padding: 0;
          background: transparent;
        }

        .tabs__wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          padding-bottom: 0;
          border-bottom: none;
          position: relative;
        }

        .tabs__nav {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          background: #f4f4f3;
          padding: 5px;
          border-radius: 14px;
          border: 1px solid #e6e6e4;
        }

        .tabs__btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          border-radius: 10px;
          padding: 11px 18px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          font-family: 'Manrope', sans-serif;
        }

        .tabs__btn:hover {
          color: #4a3728;
          background: rgba(255, 255, 255, 0.7);
        }

        .tabs__btn:hover .tabs__btn-icon {
          color: #c9a227;
        }

        .tabs__btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .tabs__btn-icon svg {
          width: 16px;
          height: 16px;
        }

        .tabs__btn-label {
          white-space: nowrap;
        }

        .tabs__btn-indicator {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #c9a227;
          border-radius: 2px;
          transition: width 0.2s ease;
        }

        .tabs__btn.active .tabs__btn-indicator {
          width: 20px;
        }

        .tabs__btn.active {
          color: #0a0a0a;
          background: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .tabs__btn.active .tabs__btn-icon {
          color: #c9a227;
        }

        .tabs__counter {
          display: flex;
          align-items: center;
          padding: 6px 14px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.18);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #b8922a;
          letter-spacing: 0.04em;
          font-family: 'Manrope', sans-serif;
        }

        .tabs__content {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.2s ease;
        }

        .tabs__content.transitioning {
          opacity: 0;
          transform: translateY(5px);
        }

        /* Tab Content */
        .tab-content {
          border: 1px solid #e8e8e6;
          border-radius: 18px;
          padding: 32px;
          background: #ffffff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }

        /* Content Header - Shared */
        .content-header {
          display: flex;
          gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f2f2f0;
        }

        .content-header__icon {
          width: 48px;
          height: 48px;
          background: #f5f5f4;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a3728;
          flex-shrink: 0;
        }

        .content-header__icon svg {
          width: 22px;
          height: 22px;
        }

        .content-header__icon--gold {
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
        }

        .content-header__icon--brown {
          background: rgba(74, 55, 40, 0.1);
          color: #4a3728;
        }

        .content-header__icon--purple {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .content-header__text h2 {
          margin: 0 0 6px;
          font-size: 1.375rem;
          font-weight: 600;
          color: #0a0a0a;
          letter-spacing: -0.02em;
          font-family: 'Playfair Display', serif;
        }

        .content-header__text p {
          margin: 0;
          font-size: 0.9375rem;
          color: #5f6368;
          line-height: 1.65;
          max-width: 500px;
          font-family: 'Manrope', sans-serif;
        }

        /* Overview Tab - BidX1 Inspired */

        /* BidX1 Gallery */
        .bidx-gallery {
          margin-bottom: 28px;
        }

        .bidx-gallery__main {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 10px;
          aspect-ratio: 16/9;
          cursor: pointer;
        }

        .bidx-gallery__main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .bidx-gallery__main:hover img {
          transform: scale(1.02);
        }

        .bidx-gallery__badge {
          position: absolute;
          bottom: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(8px);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
        }

        .bidx-gallery__badge svg {
          color: #c9a227;
        }

        .bidx-gallery__thumbs {
          display: flex;
          gap: 10px;
        }

        .bidx-gallery__thumb {
          flex: 1;
          aspect-ratio: 16/10;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }

        .bidx-gallery__thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .bidx-gallery__thumb:hover img {
          transform: scale(1.05);
        }

        /* BidX1 Summary Row */
        .bidx-summary-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }

        .bidx-summary {
          background: #ffffff;
          border: 1px solid #e8e8e6;
          border-radius: 12px;
          padding: 24px;
        }

        .bidx-summary h3 {
          margin: 0 0 18px;
          font-size: 1.0625rem;
          font-weight: 600;
          color: #0a0a0a;
          font-family: 'Playfair Display', serif;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0ee;
        }

        .bidx-summary__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .bidx-summary__list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          font-size: 0.9rem;
          color: #3d3d3d;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
          border-bottom: 1px solid #f8f8f7;
        }

        .bidx-summary__list li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .bidx-summary__list li svg {
          color: #c9a227;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* BidX1 Contact/Investment Card */
        .bidx-contact {
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
          border: 1px solid #e8e8e6;
          border-radius: 12px;
          padding: 24px;
        }

        .bidx-contact h3 {
          margin: 0 0 18px;
          font-size: 1.0625rem;
          font-weight: 600;
          color: #0a0a0a;
          font-family: 'Playfair Display', serif;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0f0ee;
        }

        .bidx-contact__card {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .bidx-contact__item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #f0f0ee;
        }

        .bidx-contact__item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .bidx-contact__label {
          font-size: 0.8125rem;
          color: #6b7280;
          font-family: 'Manrope', sans-serif;
        }

        .bidx-contact__value {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #0a0a0a;
          font-family: 'Manrope', sans-serif;
        }

        .bidx-contact__value--highlight {
          color: #c9a227;
          font-size: 1.125rem;
        }

        /* BidX1 Property Details Table */
        .bidx-details {
          background: #ffffff;
          border: 1px solid #e8e8e6;
          border-radius: 12px;
          overflow: hidden;
        }

        .bidx-details__row {
          display: grid;
          grid-template-columns: 180px 1fr;
          border-bottom: 1px solid #f0f0ee;
        }

        .bidx-details__row:last-child {
          border-bottom: none;
        }

        .bidx-details__label {
          padding: 18px 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #c9a227;
          font-family: 'Manrope', sans-serif;
          background: rgba(201, 162, 39, 0.04);
          border-right: 1px solid #f0f0ee;
        }

        .bidx-details__content {
          padding: 18px 24px;
        }

        .bidx-details__content p {
          margin: 0 0 6px;
          font-size: 0.9rem;
          color: #3d3d3d;
          line-height: 1.65;
          font-family: 'Manrope', sans-serif;
        }

        .bidx-details__content p:last-child {
          margin-bottom: 0;
        }

        .bidx-details__content p strong {
          color: #1a1a1a;
          font-weight: 600;
        }

        .bidx-details__row--warning .bidx-details__label {
          color: #b45309;
          background: rgba(180, 83, 9, 0.05);
        }

        .bidx-details__content--warning p {
          color: #92400e;
          font-size: 0.875rem;
        }

        /* Keep old styles for backward compatibility */
        .highlight-card__number {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #0a0a0a;
          font-family: 'Manrope', sans-serif;
          box-shadow: 0 3px 8px rgba(201, 162, 39, 0.3);
        }

        .highlight-card p {
          margin: 0;
          font-size: 0.875rem;
          color: #3d3d3d;
          line-height: 1.55;
          font-weight: 500;
          font-family: 'Manrope', sans-serif;
          padding-top: 6px;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.88) 0%, rgba(74, 55, 40, 0.92) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease;
          color: #ffffff;
        }

        .gallery-overlay svg {
          width: 28px;
          height: 28px;
        }

        .gallery-item:first-child .gallery-overlay svg {
          width: 36px;
          height: 36px;
        }

        .gallery-item:hover {
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.15);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .gallery-item:hover img {
          transform: scale(1.05);
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        /* Financials Tab */
        .financials-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 28px;
          border: 1px solid #e8e8e6;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c9a227 0%, #b8922a 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .stat-card:hover {
          border-color: rgba(201, 162, 39, 0.35);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
          transform: translateY(-3px);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-card__icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.14) 0%, rgba(74, 55, 40, 0.06) 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          color: #c9a227;
        }

        .stat-card__icon svg {
          width: 24px;
          height: 24px;
        }

        .stat-card span {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #8b8b8b;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 8px;
          font-family: 'Manrope', sans-serif;
        }

        .stat-card strong {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.35;
          font-family: 'Manrope', sans-serif;
        }

        .stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 14px;
          padding: 7px 14px;
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 100px;
          font-family: 'Manrope', sans-serif;
        }

        .stat-badge--warning {
          background: rgba(180, 83, 9, 0.1);
          color: #b45309;
        }

        .stat-card--featured {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.06) 0%, #ffffff 100%);
          border-color: rgba(201, 162, 39, 0.25);
        }

        .stat-card--yield {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, #ffffff 100%);
        }

        .stat-card--fees {
          grid-column: span 2;
        }

        .stat-card__header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f2f2f0;
        }

        .stat-card__header .stat-card__icon {
          margin-bottom: 0;
          width: 44px;
          height: 44px;
        }

        .stat-card__header span {
          margin-bottom: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          text-transform: none;
          letter-spacing: -0.01em;
        }

        .stat-card ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .stat-card ul li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #f2f2f0;
          font-size: 0.9375rem;
          color: #3d3d3d;
          line-height: 1.55;
          font-family: 'Manrope', sans-serif;
        }

        .stat-card ul li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .stat-card ul li:first-child {
          padding-top: 0;
        }

        .fee-bullet {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.16) 0%, rgba(74, 55, 40, 0.08) 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #b8922a;
          flex-shrink: 0;
          font-family: 'Manrope', sans-serif;
        }

        /* Risk Tab */
        .risk-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
        }

        .risk__block {
          background: #ffffff;
          border-radius: 18px;
          padding: 28px;
          border: 1px solid #e8e8e6;
          transition: all 0.25s ease;
        }

        .risk__block:hover {
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }

        .risk__block--factors {
          border-left: 4px solid #d97706;
        }

        .risk__block--insurance {
          border-left: 4px solid #059669;
        }

        .risk__block-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid #f2f2f0;
        }

        .risk__block-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .risk__block-icon svg {
          width: 22px;
          height: 22px;
        }

        .risk__block-icon--warning {
          background: rgba(217, 119, 6, 0.12);
          color: #d97706;
        }

        .risk__block-icon--success {
          background: rgba(5, 150, 105, 0.12);
          color: #059669;
        }

        .risk__block h3 {
          margin: 0;
          font-size: 1.1875rem;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .risk__block ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .risk__block ul li {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #f2f2f0;
        }

        .risk__block ul li:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .risk__block ul li:first-child {
          padding-top: 0;
        }

        .risk-number {
          width: 28px;
          height: 28px;
          background: rgba(217, 119, 6, 0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #d97706;
          flex-shrink: 0;
          font-family: 'Manrope', sans-serif;
        }

        .risk-text {
          font-size: 0.9375rem;
          color: #3d3d3d;
          line-height: 1.55;
          font-family: 'Manrope', sans-serif;
        }

        .insurance-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .insurance-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          background: linear-gradient(135deg, #faf9f8 0%, #f8f8f7 100%);
          border-radius: 12px;
          border: 1px solid #f0f0ee;
        }

        .insurance-row--coverage {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .insurance-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #8b8b8b;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'Manrope', sans-serif;
        }

        .insurance-value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .insurance-status {
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
        }

        .insurance-status--active {
          background: rgba(5, 150, 105, 0.12);
          color: #059669;
        }

        .insurance-status--pending {
          background: rgba(217, 119, 6, 0.12);
          color: #d97706;
        }

        .insurance-status--partial {
          background: rgba(37, 99, 235, 0.12);
          color: #2563eb;
        }

        /* Ownership Tab */
        .ownership-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }

        .ownership-card {
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
          border-radius: 18px;
          padding: 28px 24px;
          border: 1px solid #e8e8e6;
          transition: all 0.25s ease;
          text-align: center;
          position: relative;
        }

        .ownership-card:hover {
          border-color: rgba(201, 162, 39, 0.35);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
          transform: translateY(-3px);
        }

        .ownership-card--highlight {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(201, 162, 39, 0.02) 100%);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .ownership-card__icon {
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.14) 0%, rgba(74, 55, 40, 0.06) 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          color: #c9a227;
        }

        .ownership-card__icon svg {
          width: 26px;
          height: 26px;
        }

        .ownership-card span {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #8b8b8b;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 10px;
          font-family: 'Manrope', sans-serif;
        }

        .ownership-card strong {
          display: block;
          font-size: 1.1875rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.4;
          font-family: 'Manrope', sans-serif;
        }

        .ownership-card__badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 5px 12px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-family: 'Manrope', sans-serif;
          box-shadow: 0 2px 8px rgba(201, 162, 39, 0.3);
        }

        .ownership-cta {
          background: linear-gradient(135deg, #0a0a0a 0%, #151515 100%);
          border-radius: 20px;
          padding: 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .ownership-cta::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 40%;
          height: 100%;
          background: radial-gradient(ellipse at 80% 50%, rgba(201, 162, 39, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .ownership-cta p {
          margin: 0 0 22px;
          font-size: 1.0625rem;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.6;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
          font-family: 'Manrope', sans-serif;
          position: relative;
          z-index: 1;
        }

        .ownership-cta__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 36px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          border: none;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.35);
          font-family: 'Manrope', sans-serif;
          position: relative;
          z-index: 1;
        }

        .ownership-cta__btn svg {
          width: 18px;
          height: 18px;
        }

        .ownership-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201, 162, 39, 0.45);
        }

        /* Not Found */
        .not-found {
          padding: 160px 5%;
          text-align: center;
        }

        .not-found h1 {
          font-size: 2rem;
          margin-bottom: 16px;
        }

        .not-found a {
          color: #c9a227;
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .tabs-layout {
            grid-template-columns: 1fr 320px;
            gap: 28px;
            padding: 40px 5% 70px;
          }

          .cta-panel {
            padding: 22px;
          }

          .tabs__btn {
            padding: 10px 14px;
            font-size: 0.8125rem;
          }

          .tabs__counter {
            display: none;
          }

          /* BidX1 Gallery - 1024px */
          .bidx-gallery__main {
            aspect-ratio: 16/8;
          }

          .bidx-gallery__thumbs {
            gap: 8px;
          }

          /* BidX1 Summary Row */
          .bidx-summary-row {
            gap: 20px;
          }

          .bidx-summary,
          .bidx-contact {
            padding: 20px;
          }

          /* BidX1 Details */
          .bidx-details__row {
            grid-template-columns: 160px 1fr;
          }

          .bidx-details__label {
            padding: 16px 18px;
            font-size: 0.8125rem;
          }

          .bidx-details__content {
            padding: 16px 20px;
          }

          .financials-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .financials-grid .stat-card--fees {
            grid-column: span 2;
          }

          .stat-card {
            padding: 24px;
          }

          .ownership-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ownership-grid .ownership-card:last-child {
            grid-column: span 2;
          }
        }

        @media (max-width: 900px) {
          .tabs-layout {
            grid-template-columns: 1fr;
            gap: 28px;
            padding: 36px 5% 60px;
          }

          .cta-panel {
            position: relative;
            top: 0;
            max-width: 100%;
            order: -1;
            border-radius: 16px;
          }

          .cta-panel__status {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 5% 36px;
          }

          .hero__badge-row {
            flex-wrap: wrap;
            gap: 8px;
          }

          .hero__eyebrow,
          .hero__grade {
            padding: 5px 12px;
            font-size: 0.625rem;
          }

          .hero h1 {
            font-size: clamp(1.75rem, 6vw, 2.5rem);
          }

          .hero__description {
            font-size: 0.9375rem;
            line-height: 1.65;
          }

          .cta-panel {
            padding: 20px;
          }

          .cta-panel__stats {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .cta-stat {
            padding: 14px 12px;
          }

          .cta-panel__status {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .cta-panel__insurance,
          .cta-panel__risk {
            font-size: 0.75rem;
            padding: 8px 12px;
          }

          .tabs__wrapper {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }

          .tabs__nav {
            gap: 3px;
            overflow-x: auto;
            padding: 4px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }

          .tabs__nav::-webkit-scrollbar {
            display: none;
          }

          .tabs__btn {
            padding: 10px 14px;
            font-size: 0.8125rem;
            flex-shrink: 0;
          }

          .tabs__btn-label {
            display: none;
          }

          .tabs__btn.active .tabs__btn-label {
            display: block;
          }

          .tabs__counter {
            display: none;
          }

          .tab-content {
            padding: 20px;
            border-radius: 14px;
          }

          /* BidX1 Gallery - 768px */
          .bidx-gallery__main {
            aspect-ratio: 16/9;
            border-radius: 10px;
          }

          .bidx-gallery__thumbs {
            gap: 8px;
          }

          .bidx-gallery__thumb {
            border-radius: 6px;
          }

          .bidx-gallery__badge {
            bottom: 10px;
            left: 10px;
            padding: 6px 12px;
            font-size: 0.75rem;
          }

          /* BidX1 Summary Row - 768px */
          .bidx-summary-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .bidx-summary,
          .bidx-contact {
            padding: 18px;
          }

          .bidx-summary h3,
          .bidx-contact h3 {
            font-size: 1rem;
            margin-bottom: 14px;
            padding-bottom: 12px;
          }

          .bidx-summary__list li {
            padding: 8px 0;
            font-size: 0.8125rem;
          }

          .bidx-contact__item {
            padding: 12px 0;
          }

          .bidx-contact__label {
            font-size: 0.75rem;
          }

          .bidx-contact__value {
            font-size: 0.875rem;
          }

          /* BidX1 Details - 768px */
          .bidx-details__row {
            grid-template-columns: 1fr;
          }

          .bidx-details__label {
            padding: 14px 16px;
            border-right: none;
            border-bottom: 1px solid #f0f0ee;
            font-size: 0.8125rem;
          }

          .bidx-details__content {
            padding: 14px 16px;
          }

          .bidx-details__content p {
            font-size: 0.8125rem;
          }

          .content-header {
            flex-direction: column;
            gap: 14px;
            margin-bottom: 22px;
            padding-bottom: 18px;
          }

          .content-header__icon {
            width: 42px;
            height: 42px;
          }

          .content-header__text h2 {
            font-size: 1.1875rem;
          }

          .content-header__text p {
            font-size: 0.875rem;
          }

          .financials-grid,
          .risk-grid,
          .ownership-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .stat-card,
          .risk__block,
          .ownership-card {
            padding: 22px;
            border-radius: 14px;
          }

          .ownership-cta {
            padding: 22px;
            border-radius: 14px;
          }

          .ownership-cta p {
            font-size: 0.9375rem;
          }

          .ownership-cta__btn {
            width: 100%;
            padding: 14px 24px;
            font-size: 0.9375rem;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 96px 5% 32px;
          }

          .hero h1 {
            font-size: clamp(1.625rem, 7vw, 2.25rem);
          }

          .tabs__btn {
            padding: 9px 12px;
          }

          .tab-content {
            padding: 16px;
          }

          /* BidX1 Gallery - 480px Mobile */
          .bidx-gallery {
            margin-bottom: 20px;
          }

          .bidx-gallery__main {
            aspect-ratio: 16/10;
            border-radius: 10px;
            margin-bottom: 8px;
          }

          .bidx-gallery__thumbs {
            gap: 6px;
          }

          .bidx-gallery__thumb {
            aspect-ratio: 1/1;
            border-radius: 6px;
          }

          .bidx-gallery__badge {
            bottom: 8px;
            left: 8px;
            padding: 5px 10px;
            font-size: 0.6875rem;
            border-radius: 6px;
          }

          /* BidX1 Summary Row - Mobile */
          .bidx-summary-row {
            gap: 14px;
            margin-bottom: 20px;
          }

          .bidx-summary,
          .bidx-contact {
            padding: 16px;
            border-radius: 10px;
          }

          .bidx-summary h3,
          .bidx-contact h3 {
            font-size: 0.9375rem;
            margin-bottom: 12px;
            padding-bottom: 10px;
          }

          .bidx-summary__list li {
            padding: 8px 0;
            font-size: 0.8125rem;
            gap: 10px;
          }

          .bidx-summary__list li svg {
            width: 14px;
            height: 14px;
          }

          .bidx-contact__item {
            padding: 10px 0;
          }

          .bidx-contact__label {
            font-size: 0.6875rem;
          }

          .bidx-contact__value {
            font-size: 0.8125rem;
          }

          .bidx-contact__value--highlight {
            font-size: 1rem;
          }

          /* BidX1 Details - Mobile */
          .bidx-details {
            border-radius: 10px;
          }

          .bidx-details__label {
            padding: 12px 14px;
            font-size: 0.75rem;
          }

          .bidx-details__content {
            padding: 12px 14px;
          }

          .bidx-details__content p {
            font-size: 0.8125rem;
            line-height: 1.55;
          }

          .cta-btn {
            min-height: 46px;
            font-size: 0.875rem;
          }

          .cta-panel__risk-disclosure {
            padding: 10px 12px;
          }
        }
      `}</style>
    </>
  )
}
