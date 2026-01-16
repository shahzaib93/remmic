import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [trustVisible, setTrustVisible] = useState(false)
  const trustRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80
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

        <main className="pt-24">
          {/* ============================================
              SECTION 1: HERO (Dark)
          ============================================ */}
          <section className="hero">
            <div className="hero__bg" aria-hidden="true" />
            <div className="hero__glow hero__glow--1" aria-hidden="true" />
            <div className="hero__glow hero__glow--2" aria-hidden="true" />

            <div className="container hero__container">
              <div className="hero__content" style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.8s ease'
              }}>
                <div className="hero__eyebrow">
                  <span className="hero__eyebrow-dot" />
                  <span>Pakistan's First Institutional PropTech</span>
                </div>

                <h1 className="hero__title">
                  <span className="hero__title-line">Real Assets.</span>
                  <span className="hero__title-line">Real Ownership.</span>
                  <span className="hero__title-accent">Real Liquidity.</span>
                </h1>

                <p className="hero__description">
                  Invest in verified real estate from PKR 10,000. AI-powered valuations, fractional ownership, and instant liquidity — all in one platform.
                </p>

                <div className="hero__cta">
                  <a href="/marketplace" className="btn btn--primary btn--lg">
                    <span>Start Investing</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                  <a href="/silver-founders" className="btn btn--outline btn--lg">
                    <span>Become a Founder</span>
                  </a>
                </div>

                <div className="hero__trust">
                  <span className="hero__trust-label">Trusted & Regulated</span>
                  <div className="hero__trust-badges">
                    <div className="hero__trust-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                      <span>SECP Regulated</span>
                    </div>
                    <div className="hero__trust-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>100% Insured</span>
                    </div>
                    <div className="hero__trust-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span>REM Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero__visual" style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.95)',
                transition: 'all 0.9s ease 0.2s'
              }}>
                <div className="hero__cards">
                  {/* Main Property Card */}
                  <div className="hero__card hero__card--main">
                    <div className="hero__card-image">
                      <img
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
                        alt="Premium luxury villa investment opportunity"
                        loading="eager"
                      />
                      <div className="hero__card-badge">
                        <span className="hero__card-badge-dot" />
                        Live Investment
                      </div>
                    </div>
                    <div className="hero__card-body">
                      <h3 className="hero__card-title">DHA Phase 6 Villa</h3>
                      <p className="hero__card-location">Lahore, Pakistan</p>
                      <div className="hero__card-footer">
                        <div className="hero__card-price">
                          <span className="hero__card-price-label">Min. Investment</span>
                          <span className="hero__card-price-value">PKR 50,000</span>
                        </div>
                        <div className="hero__card-roi">
                          <span className="hero__card-roi-value">14.2%</span>
                          <span className="hero__card-roi-label">Est. ROI</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Stats Card */}
                  <div className="hero__floating hero__floating--stats" style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.6s ease 0.5s'
                  }}>
                    <div className="hero__floating-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                      </svg>
                    </div>
                    <div className="hero__floating-content">
                      <span className="hero__floating-value">$2.5B+</span>
                      <span className="hero__floating-label">Assets Under Management</span>
                    </div>
                  </div>

                  {/* Floating Investors Card */}
                  <div className="hero__floating hero__floating--investors" style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.6s ease 0.7s'
                  }}>
                    <div className="hero__floating-avatars">
                      <div className="hero__floating-avatar">A</div>
                      <div className="hero__floating-avatar">K</div>
                      <div className="hero__floating-avatar">S</div>
                      <div className="hero__floating-avatar hero__floating-avatar--more">+</div>
                    </div>
                    <div className="hero__floating-content">
                      <span className="hero__floating-value">12,500+</span>
                      <span className="hero__floating-label">Active Investors</span>
                    </div>
                  </div>

                  {/* Floating Verified Badge */}
                  <div className="hero__floating hero__floating--verified" style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                    transition: 'all 0.5s ease 0.9s'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Bottom Stats Bar */}
            <div className="hero__stats" style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease 0.4s'
            }}>
              <div className="container">
                <div className="hero__stats-grid">
                  <div className="hero__stat">
                    <span className="hero__stat-value">150+</span>
                    <span className="hero__stat-label">Verified Properties</span>
                  </div>
                  <div className="hero__stat-divider" />
                  <div className="hero__stat">
                    <span className="hero__stat-value">PKR 10K</span>
                    <span className="hero__stat-label">Minimum Investment</span>
                  </div>
                  <div className="hero__stat-divider" />
                  <div className="hero__stat">
                    <span className="hero__stat-value">12-18%</span>
                    <span className="hero__stat-label">Average Returns</span>
                  </div>
                  <div className="hero__stat-divider" />
                  <div className="hero__stat">
                    <span className="hero__stat-value">24/7</span>
                    <span className="hero__stat-label">Instant Liquidity</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================
              SECTION 2: TECHNOLOGY & TRUST (Light)
          ============================================ */}
          <section className="story">
            <div className="container">
              <div className="story__header" data-aos="fade-up">
                <h2 className="story__main-title">
                  Revolutionizing Real Estate with <span className="text-gold">Technology & Trust</span>
                </h2>
                <p className="story__subtitle">
                  From traditional barriers to modern solutions — see how REMMIC is transforming
                  the future of property investment through innovation and institutional-grade security.
                </p>
              </div>

              <div className="story__grid">
                <div className="story__card story__card--problem" data-aos="fade-up" data-aos-delay="100">
                  <div className="story__card-badge story__card-badge--problem">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>The Problem</span>
                  </div>
                  <h3 className="story__card-title">Traditional Real Estate is Broken</h3>
                  <p className="story__card-text">
                    For decades, real estate investment has been the privilege of the wealthy.
                    High capital requirements, lengthy transaction processes, and opaque market
                    conditions have created an exclusive ecosystem that locks out millions of potential investors.
                  </p>
                  <p className="story__card-text">
                    Properties sit illiquid for months, investors face uncertain valuations,
                    and management processes remain inefficient and costly.
                  </p>
                </div>

                <div className="story__card story__card--solution" data-aos="fade-up" data-aos-delay="200">
                  <div className="story__card-badge story__card-badge--solution">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>The Solution</span>
                  </div>
                  <h3 className="story__card-title">REMMIC: The Future of Property Investment</h3>
                  <p className="story__card-text">
                    We're democratizing real estate through innovative technology and institutional-grade security.
                    With fractional ownership, instant liquidity, and complete transparency, REMMIC makes
                    property investment accessible to everyone — from $100 to millions.
                  </p>
                  <p className="story__card-text">
                    Our platform combines AI-powered valuations, blockchain verification, and regulatory
                    compliance to create a trustworthy ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================
              SECTION 3: THREE CORE SOLUTIONS (Dark)
          ============================================ */}
          <section className="solutions">
            <div className="solutions__bg" aria-hidden="true" />
            <div className="solutions__glow solutions__glow--1" aria-hidden="true" />
            <div className="solutions__glow solutions__glow--2" aria-hidden="true" />

            <div className="container">
              <div className="solutions__header" data-aos="fade-up">
                <span className="section-eyebrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  What REMMIC Does
                </span>
                <h2 className="section-title section-title--light">
                  Three Core Solutions for<br/>
                  <span className="text-gold-gradient">Real Estate Excellence</span>
                </h2>
                <p className="section-subtitle section-subtitle--light">
                  End-to-end real estate services powered by institutional-grade technology and AI
                </p>
              </div>

              <div className="solutions__grid">
                {/* Evaluate Assets */}
                <div className="solution-card" data-aos="fade-up" data-aos-delay="100">
                  <div className="solution-card__step">01</div>
                  <div className="solution-card__header">
                    <div className="solution-card__icon solution-card__icon--evaluate">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.73 0 3.35.49 4.72 1.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M21 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="solution-card__badge">Evaluation</div>
                  </div>
                  <h3 className="solution-card__title">Evaluate Assets</h3>
                  <p className="solution-card__description">
                    AI-powered property valuation with certified evaluators and comprehensive risk assessment.
                  </p>
                  <ul className="solution-card__list">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      AI-based price estimation with 95% accuracy
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Legal verification & title checks
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Market analysis & trend forecasting
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      REM Verified certification badge
                    </li>
                  </ul>
                  <a href="/evaluation" className="solution-card__cta">
                    <span>Get Evaluation</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </div>

                {/* Manage Assets - FEATURED */}
                <div className="solution-card solution-card--featured" data-aos="fade-up" data-aos-delay="200">
                  <div className="solution-card__ribbon">Most Popular</div>
                  <div className="solution-card__step solution-card__step--gold">02</div>
                  <div className="solution-card__header">
                    <div className="solution-card__icon solution-card__icon--manage">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9 21V9" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="6" cy="6" r="1" fill="currentColor"/>
                        <path d="M12 14h5M12 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="solution-card__badge solution-card__badge--gold">Management</div>
                  </div>
                  <h3 className="solution-card__title">Manage Assets</h3>
                  <p className="solution-card__description">
                    Complete property management with rental services and smart-contract execution.
                  </p>
                  <ul className="solution-card__list">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Rental & tenant management portal
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      24/7 maintenance coordination
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Real-time financial reporting
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Smart-contract automation
                    </li>
                  </ul>
                  <a href="/asset-management" className="solution-card__cta solution-card__cta--primary">
                    <span>Start Managing</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </div>

                {/* Invest & Trade */}
                <div className="solution-card" data-aos="fade-up" data-aos-delay="300">
                  <div className="solution-card__step">03</div>
                  <div className="solution-card__header">
                    <div className="solution-card__icon solution-card__icon--invest">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="solution-card__badge">Investment</div>
                  </div>
                  <h3 className="solution-card__title">Invest & Trade</h3>
                  <p className="solution-card__description">
                    Fractional ownership, instant liquidity, and transparent trading globally.
                  </p>
                  <ul className="solution-card__list">
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Fractional ownership from PKR 10,000
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Instant liquidity trading platform
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Global marketplace access
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Transparent, real-time pricing
                    </li>
                  </ul>
                  <a href="/marketplace" className="solution-card__cta">
                    <span>Start Investing</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Solutions Stats */}
              <div className="solutions__stats" data-aos="fade-up" data-aos-delay="400">
                <div className="solutions__stat">
                  <span className="solutions__stat-value">500+</span>
                  <span className="solutions__stat-label">Properties Evaluated</span>
                </div>
                <div className="solutions__stat">
                  <span className="solutions__stat-value">PKR 5B+</span>
                  <span className="solutions__stat-label">Assets Managed</span>
                </div>
                <div className="solutions__stat">
                  <span className="solutions__stat-value">12,500+</span>
                  <span className="solutions__stat-label">Active Investors</span>
                </div>
                <div className="solutions__stat">
                  <span className="solutions__stat-value">98%</span>
                  <span className="solutions__stat-label">Client Satisfaction</span>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================
              SECTION 4: HIGH-DEMAND OPPORTUNITIES (Dark)
          ============================================ */}
          <section className="opportunities">
            <div className="container">
              <div className="opportunities__header" data-aos="fade-up">
                <span className="section-eyebrow">Featured Properties</span>
                <h2 className="section-title section-title--light">High-Demand Opportunities</h2>
                <p className="section-subtitle section-subtitle--light">
                  Curated investment properties with verified returns and institutional-grade security
                </p>
              </div>

              <div className="opportunities__scroll">
                <div className="opportunities__track">
                  {/* Asset Card 1 */}
                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" alt="Luxury Villa in DHA Phase 5" />
                      <span className="asset-card__badge asset-card__badge--live">
                        <span className="asset-card__badge-dot" />
                        Live Auction
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Luxury Villa DHA Phase 5</h3>
                      <p className="asset-card__location">5 Bed  |  4 Bath  |  DHA Lahore</p>
                      <div className="asset-card__price">PKR 2.5M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">12.4% ROI</span>
                        <span className="asset-card__risk asset-card__risk--low">Low Risk</span>
                      </div>
                    </div>
                  </article>

                  {/* Asset Card 2 */}
                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" alt="Commercial Plaza Gulberg" />
                      <span className="asset-card__badge asset-card__badge--featured">
                        <span className="asset-card__badge-dot" />
                        Featured
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Commercial Plaza Gulberg</h3>
                      <p className="asset-card__location">8000 sqft  |  Commercial  |  Lahore</p>
                      <div className="asset-card__price">PKR 5.0M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">14.1% ROI</span>
                        <span className="asset-card__risk asset-card__risk--medium">Medium Risk</span>
                      </div>
                    </div>
                  </article>

                  {/* Asset Card 3 */}
                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80" alt="Apartment Block Bahria Town" />
                      <span className="asset-card__badge asset-card__badge--live">
                        <span className="asset-card__badge-dot" />
                        Just Listed
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Apartment Block Bahria</h3>
                      <p className="asset-card__location">3 Bed  |  2 Bath  |  Bahria Town</p>
                      <div className="asset-card__price">PKR 1.8M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">9.8% ROI</span>
                        <span className="asset-card__risk asset-card__risk--low">Low Risk</span>
                      </div>
                    </div>
                  </article>

                  {/* Asset Card 4 */}
                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80" alt="Industrial Warehouse Karachi" />
                      <span className="asset-card__badge asset-card__badge--hot">
                        <span className="asset-card__badge-dot" />
                        High Demand
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Industrial Warehouse</h3>
                      <p className="asset-card__location">15000 sqft  |  Industrial  |  Karachi</p>
                      <div className="asset-card__price">PKR 6.0M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">13.5% ROI</span>
                        <span className="asset-card__risk asset-card__risk--medium">Medium Risk</span>
                      </div>
                    </div>
                  </article>

                  {/* Asset Card 5 */}
                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1567449303078-57ad995bd329?w=800&q=80" alt="Retail Space F-7 Islamabad" />
                      <span className="asset-card__badge asset-card__badge--live">
                        <span className="asset-card__badge-dot" />
                        Almost Full
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Retail Space F-7</h3>
                      <p className="asset-card__location">2500 sqft  |  Retail  |  Islamabad</p>
                      <div className="asset-card__price">PKR 1.2M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">11.1% ROI</span>
                        <span className="asset-card__risk asset-card__risk--low">Low Risk</span>
                      </div>
                    </div>
                  </article>

                  {/* Duplicate cards for seamless loop */}
                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" alt="Luxury Villa in DHA Phase 5" />
                      <span className="asset-card__badge asset-card__badge--live">
                        <span className="asset-card__badge-dot" />
                        Live Auction
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Luxury Villa DHA Phase 5</h3>
                      <p className="asset-card__location">5 Bed  |  4 Bath  |  DHA Lahore</p>
                      <div className="asset-card__price">PKR 2.5M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">12.4% ROI</span>
                        <span className="asset-card__risk asset-card__risk--low">Low Risk</span>
                      </div>
                    </div>
                  </article>

                  <article className="asset-card">
                    <div className="asset-card__image">
                      <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" alt="Commercial Plaza Gulberg" />
                      <span className="asset-card__badge asset-card__badge--featured">
                        <span className="asset-card__badge-dot" />
                        Featured
                      </span>
                    </div>
                    <div className="asset-card__body">
                      <div className="asset-card__chip asset-card__chip--insured">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                        Insured
                      </div>
                      <h3 className="asset-card__title">Commercial Plaza Gulberg</h3>
                      <p className="asset-card__location">8000 sqft  |  Commercial  |  Lahore</p>
                      <div className="asset-card__price">PKR 5.0M</div>
                      <div className="asset-card__metrics">
                        <span className="asset-card__roi">14.1% ROI</span>
                        <span className="asset-card__risk asset-card__risk--medium">Medium Risk</span>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              <div className="opportunities__cta" data-aos="fade-up">
                <a href="/marketplace" className="btn btn--primary">
                  <span>View All Properties</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* ============================================
              SECTION 5: INSTITUTIONAL-GRADE PROTECTION (Dark)
          ============================================ */}
          <section ref={trustRef} className="trust">
            <div className="container">
              <div className="trust__header" style={{
                opacity: trustVisible ? 1 : 0,
                transform: trustVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s ease'
              }}>
                <span className="section-eyebrow">Trust & Security</span>
                <h2 className="section-title section-title--light">Institutional-Grade Protection</h2>
                <p className="section-subtitle section-subtitle--light">
                  Built on regulated frameworks with complete investor protection
                </p>
              </div>

              {/* Trust Pillars */}
              <div className="trust__grid" style={{
                opacity: trustVisible ? 1 : 0,
                transform: trustVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: 'all 0.6s ease 0.2s'
              }}>
                {/* Insurance Partners */}
                <div className="trust-card">
                  <div className="trust-card__header">
                    <div className="trust-card__icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="trust-card__title">Insurance Partners</h3>
                      <p className="trust-card__subtitle">Comprehensive protection for all investments</p>
                    </div>
                  </div>

                  <div className="trust-card__content">
                    <div className="trust-card__partners">
                      <div className="trust-card__partner">
                        <div className="trust-card__partner-logo">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <div>
                          <strong>State Life Insurance</strong>
                          <span>Property & Liability Coverage</span>
                        </div>
                      </div>

                      <div className="trust-card__partner">
                        <div className="trust-card__partner-logo">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                        </div>
                        <div>
                          <strong>Jubilee Insurance</strong>
                          <span>Investment Protection Plans</span>
                        </div>
                      </div>

                      <div className="trust-card__partner">
                        <div className="trust-card__partner-logo">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                        <div>
                          <strong>EFU General</strong>
                          <span>Risk Management Solutions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amanorx Group Backing - FEATURED */}
                <div className="trust-card trust-card--featured">
                  <div className="trust-card__badge">Parent Company</div>
                  <div className="trust-card__header trust-card__header--center">
                    <div className="trust-card__icon trust-card__icon--gold">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h3 className="trust-card__title">Amanorx Group</h3>
                    <p className="trust-card__subtitle">Backed by Pakistan's leading conglomerate</p>
                  </div>

                  <div className="trust-card__content">
                    <p className="trust-card__description">
                      A diversified holding company with proven expertise across real estate,
                      technology, and financial services — providing REMMIC with institutional
                      backing and operational excellence.
                    </p>

                    <div className="trust-card__features">
                      <span className="trust-card__feature">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        SECP Regulated
                      </span>
                      <span className="trust-card__feature">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        ISO Certified
                      </span>
                      <span className="trust-card__feature">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Audit Compliant
                      </span>
                    </div>

                    <div className="trust-card__stats">
                      <div className="trust-card__stat">
                        <span className="trust-card__stat-value">25+</span>
                        <span className="trust-card__stat-label">Years Experience</span>
                      </div>
                      <div className="trust-card__stat">
                        <span className="trust-card__stat-value">$2B+</span>
                        <span className="trust-card__stat-label">Assets Managed</span>
                      </div>
                      <div className="trust-card__stat">
                        <span className="trust-card__stat-value">15+</span>
                        <span className="trust-card__stat-label">Verticals</span>
                      </div>
                    </div>

                    <div className="trust-card__sectors">
                      <span>Real Estate</span>
                      <span>FinTech</span>
                      <span>Construction</span>
                      <span>Technology</span>
                    </div>

                    <a href="/amanorx-group" className="btn btn--primary trust-card__btn">
                      <span>Learn More About Amanorx</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Multi-Jurisdiction Roadmap */}
                <div className="trust-card">
                  <div className="trust-card__header">
                    <div className="trust-card__icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="trust-card__title">Global Expansion</h3>
                      <p className="trust-card__subtitle">Multi-jurisdiction regulatory roadmap</p>
                    </div>
                  </div>

                  <div className="trust-card__content">
                    <div className="trust-card__roadmap">
                      <div className="trust-card__roadmap-item trust-card__roadmap-item--completed">
                        <span className="trust-card__roadmap-flag">🇵🇰</span>
                        <div>
                          <strong>Pakistan</strong>
                          <span className="trust-card__roadmap-status trust-card__roadmap-status--live">Live</span>
                        </div>
                      </div>

                      <div className="trust-card__roadmap-item trust-card__roadmap-item--progress">
                        <span className="trust-card__roadmap-flag">🇦🇪</span>
                        <div>
                          <strong>UAE</strong>
                          <span className="trust-card__roadmap-status trust-card__roadmap-status--progress">Q2 2026</span>
                        </div>
                      </div>

                      <div className="trust-card__roadmap-item">
                        <span className="trust-card__roadmap-flag">🇸🇬</span>
                        <div>
                          <strong>Singapore</strong>
                          <span className="trust-card__roadmap-status">Q4 2026</span>
                        </div>
                      </div>

                      <div className="trust-card__roadmap-item">
                        <span className="trust-card__roadmap-flag">🇬🇧</span>
                        <div>
                          <strong>United Kingdom</strong>
                          <span className="trust-card__roadmap-status">2027</span>
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

          {/* ============================================
              SECTION 6: FINAL CTA (Light)
          ============================================ */}
          <section className="cta-section">
            <div className="container">
              <div className="cta-card">
                <div className="cta-card__content" data-aos="fade-right">
                  <h2 className="cta-card__title">
                    Your Portfolio Deserves <span className="text-gold">Real Assets</span>
                  </h2>
                  <p className="cta-card__text">
                    Join Pakistan's first institutional-grade PropTech ecosystem.
                    Start building wealth through verified real estate investments.
                  </p>
                  <div className="cta-card__benefits">
                    <div className="cta-card__benefit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Start from PKR 10,000</span>
                    </div>
                    <div className="cta-card__benefit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>SECP Regulated</span>
                    </div>
                    <div className="cta-card__benefit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Instant Liquidity</span>
                    </div>
                  </div>
                  <div className="cta-card__actions">
                    <a href="/signup" className="btn btn--primary">
                      <span>Start Investing Now</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </a>
                    <a href="/contact" className="btn btn--dark">
                      <span>Talk to Advisor</span>
                    </a>
                  </div>
                </div>
                <div className="cta-card__image" data-aos="fade-left" data-aos-delay="100">
                  <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80" alt="Real Estate Investment Platform" />
                </div>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>

      <style jsx>{`
        /* =============================================
           DESIGN SYSTEM - CSS CUSTOM PROPERTIES
        ============================================= */
        :root {
          /* Colors */
          --gold: #c9a227;
          --gold-light: #e6c453;
          --gold-dark: #a68418;
          --dark-900: #0a0a0a;
          --dark-800: #111111;
          --dark-700: #1a1a1a;
          --dark-600: #222222;
          --light-100: #ffffff;
          --light-200: #faf9f7;
          --light-300: #f5f3ef;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --success: #22c55e;
          --warning: #f59e0b;
          --error: #ef4444;

          /* Spacing - Consistent Section Padding */
          --section-py: 96px;
          --section-py-tablet: 72px;
          --section-py-mobile: 60px;

          /* Container System */
          --container-max: 1200px;
          --container-px-desktop: 32px;
          --container-px-tablet: 24px;
          --container-px-mobile: 16px;
          --container-px: var(--container-px-desktop);

          /* Typography */
          --font-h1: clamp(2.125rem, 5vw, 3.25rem);
          --font-h2: clamp(1.75rem, 4vw, 2.25rem);
          --font-h3: 1.25rem;
          --font-body: 1rem;
          --font-small: 0.875rem;
          --line-height: 1.6;

          /* Cards - Consistent Border Radius */
          --radius: 14px;
          --radius-lg: 16px;
          --radius-sm: 10px;
          --card-border: 1px solid rgba(255, 255, 255, 0.08);
          --card-border-light: 1px solid rgba(201, 162, 39, 0.15);
          --card-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          --card-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.12);

          /* Buttons */
          --btn-height: 48px;
          --btn-radius: 14px;
          --btn-px: 28px;
        }

        /* =============================================
           BASE STYLES
        ============================================= */
        .page-wrapper {
          background: var(--dark-900);
          min-height: 100vh;
        }

        .main-wrapper {
          background: var(--dark-900);
        }

        /* Global Container System */
        .container {
          max-width: var(--container-max);
          margin: 0 auto;
          padding: 0 var(--container-px);
          width: 100%;
        }

        @media (min-width: 1280px) {
          .container {
            max-width: 1280px;
          }
        }

        /* Typography Utilities */
        .text-gold {
          color: var(--gold);
        }

        .section-eyebrow {
          display: inline-block;
          padding: 8px 18px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 100px;
          color: var(--gold);
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: var(--font-h2);
          font-weight: 700;
          color: var(--dark-900);
          margin: 0 0 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .section-title--light {
          color: var(--light-100);
        }

        .section-subtitle {
          font-size: var(--font-body);
          color: var(--gray-500);
          line-height: var(--line-height);
          margin: 0;
          max-width: 560px;
        }

        .section-subtitle--light {
          color: rgba(255, 255, 255, 0.8);
        }

        /* =============================================
           BUTTON SYSTEM
        ============================================= */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: var(--btn-height);
          padding: 0 var(--btn-px);
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: var(--btn-radius);
          transition: all 0.25s ease;
          cursor: pointer;
          border: none;
          white-space: nowrap;
        }

        .btn svg {
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }

        .btn:hover svg {
          transform: translateX(4px);
        }

        .btn--primary {
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--dark-900);
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.35);
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201, 162, 39, 0.45);
        }

        .btn--outline {
          background: transparent;
          color: var(--light-100);
          border: 2px solid rgba(255, 255, 255, 0.35);
        }

        .btn--outline:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: rgba(201, 162, 39, 0.08);
        }

        .btn--outline-light {
          background: transparent;
          color: var(--gold);
          border: 2px solid rgba(201, 162, 39, 0.4);
        }

        .btn--outline-light:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: var(--gold);
        }

        .btn--dark {
          background: var(--dark-900);
          color: var(--light-100);
        }

        .btn--dark:hover {
          background: var(--dark-700);
        }

        /* =============================================
           SECTION 1: HERO
        ============================================= */
        .hero {
          position: relative;
          padding: 140px 0 0;
          background: linear-gradient(180deg, var(--dark-900) 0%, var(--dark-800) 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .hero__bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(201, 162, 39, 0.02) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }

        .hero__glow--1 {
          width: 500px;
          height: 500px;
          background: rgba(201, 162, 39, 0.08);
          top: -100px;
          right: 10%;
          animation: float 8s ease-in-out infinite;
        }

        .hero__glow--2 {
          width: 400px;
          height: 400px;
          background: rgba(201, 162, 39, 0.05);
          bottom: 10%;
          left: -100px;
          animation: float 10s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }

        .hero__container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
          flex: 1;
          padding-bottom: 40px;
        }

        .hero__content {
          max-width: 540px;
        }

        .hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 100px;
          color: var(--gold);
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 28px;
        }

        .hero__eyebrow-dot {
          width: 8px;
          height: 8px;
          background: var(--gold);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .hero__title {
          font-size: clamp(2.5rem, 5.5vw, 3.75rem);
          font-weight: 800;
          line-height: 1.05;
          color: var(--light-100);
          margin: 0 0 24px;
          letter-spacing: -0.03em;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .hero__title-line {
          display: block;
        }

        .hero__title-accent {
          display: block;
          color: var(--gold);
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero__description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.75;
          margin: 0 0 32px;
          max-width: 480px;
        }

        .hero__cta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .btn--lg {
          height: 54px;
          padding: 0 32px;
          font-size: 1rem;
        }

        .hero__trust {
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero__trust-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }

        .hero__trust-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hero__trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all 0.25s ease;
        }

        .hero__trust-badge:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: rgba(201, 162, 39, 0.25);
          color: var(--gold);
        }

        .hero__trust-badge svg {
          color: var(--gold);
        }

        /* Hero Visual - Cards Layout */
        .hero__visual {
          position: relative;
          min-height: 520px;
        }

        .hero__cards {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hero__card--main {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.3),
            0 0 80px rgba(201, 162, 39, 0.08);
          transition: all 0.4s ease;
        }

        .hero__card--main:hover {
          transform: translateY(-8px);
          box-shadow:
            0 40px 80px rgba(0, 0, 0, 0.35),
            0 0 100px rgba(201, 162, 39, 0.12);
        }

        .hero__card-image {
          position: relative;
          height: 280px;
          overflow: hidden;
        }

        .hero__card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .hero__card--main:hover .hero__card-image img {
          transform: scale(1.05);
        }

        .hero__card-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(12px);
          border-radius: 100px;
          color: var(--light-100);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .hero__card-badge-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .hero__card-body {
          padding: 24px;
        }

        .hero__card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--light-100);
          margin: 0 0 6px;
        }

        .hero__card-location {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0 0 20px;
        }

        .hero__card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero__card-price-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 4px;
        }

        .hero__card-price-value {
          font-size: 1.375rem;
          font-weight: 800;
          color: var(--gold);
        }

        .hero__card-roi {
          text-align: right;
        }

        .hero__card-roi-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--success);
        }

        .hero__card-roi-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.75);
        }

        /* Floating Cards */
        .hero__floating {
          position: absolute;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }

        .hero__floating--stats {
          top: 20px;
          right: -30px;
        }

        .hero__floating--investors {
          bottom: 100px;
          left: -40px;
        }

        .hero__floating--verified {
          top: 50%;
          right: -20px;
          transform: translateY(-50%);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          border: none;
          color: var(--dark-900);
          box-shadow: 0 8px 32px rgba(201, 162, 39, 0.4);
        }

        .hero__floating-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.15);
          border-radius: 12px;
          color: var(--gold);
          flex-shrink: 0;
        }

        .hero__floating-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .hero__floating-value {
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--light-100);
        }

        .hero__floating-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .hero__floating-avatars {
          display: flex;
        }

        .hero__floating-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%);
          color: var(--dark-900);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: -10px;
          border: 2px solid var(--dark-900);
        }

        .hero__floating-avatar:first-child {
          margin-left: 0;
        }

        .hero__floating-avatar--more {
          background: var(--dark-600);
          color: var(--light-100);
        }

        /* Hero Stats Bar */
        .hero__stats {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 32px 0;
        }

        .hero__stats-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0;
        }

        .hero__stat {
          text-align: center;
          padding: 0 48px;
        }

        .hero__stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
        }

        .hero__stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 4px;
        }

        .hero__stat-label {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.75);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }

        /* =============================================
           SECTION 2: TECHNOLOGY & TRUST (Light)
        ============================================= */
        .story {
          padding: var(--section-py) 0;
          background: var(--light-200);
        }

        .story__header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 56px;
        }

        .story__main-title {
          font-size: var(--font-h2);
          font-weight: 700;
          color: var(--dark-900);
          margin: 0 0 16px;
          line-height: 1.25;
        }

        .story__subtitle {
          font-size: var(--font-body);
          color: var(--gray-500);
          line-height: var(--line-height);
          margin: 0;
        }

        .story__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .story__card {
          padding: 36px;
          border-radius: var(--radius-lg);
          background: var(--light-100);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
          min-height: 340px;
          transition: all 0.3s ease;
        }

        .story__card:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-4px);
        }

        .story__card--problem {
          border-left: 3px solid var(--error);
        }

        .story__card--solution {
          border-left: 3px solid var(--success);
        }

        .story__card-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 20px;
          width: fit-content;
        }

        .story__card-badge--problem {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .story__card-badge--solution {
          background: rgba(34, 197, 94, 0.1);
          color: var(--success);
        }

        .story__card-title {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--dark-900);
          margin: 0 0 16px;
          line-height: 1.3;
        }

        .story__card-text {
          font-size: 0.9375rem;
          color: var(--gray-600);
          line-height: var(--line-height);
          margin: 0 0 14px;
        }

        .story__card-text:last-child {
          margin-bottom: 0;
        }

        /* =============================================
           SECTION 3: THREE CORE SOLUTIONS (Dark)
        ============================================= */
        .solutions {
          position: relative;
          padding: var(--section-py) 0;
          background: linear-gradient(180deg, var(--dark-800) 0%, var(--dark-700) 100%);
          overflow: hidden;
        }

        .solutions__bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 25% 25%, rgba(201, 162, 39, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(201, 162, 39, 0.04) 0%, transparent 50%);
          pointer-events: none;
        }

        .solutions__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .solutions__glow--1 {
          width: 400px;
          height: 400px;
          background: rgba(201, 162, 39, 0.06);
          top: 10%;
          left: -100px;
        }

        .solutions__glow--2 {
          width: 350px;
          height: 350px;
          background: rgba(201, 162, 39, 0.05);
          bottom: 10%;
          right: -80px;
        }

        .solutions__header {
          text-align: center;
          margin-bottom: 64px;
          position: relative;
          z-index: 1;
        }

        .solutions__header .section-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .text-gold-gradient {
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .solutions__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
          align-items: stretch;
          margin-bottom: 64px;
        }

        .solution-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 32px 28px 28px;
          text-align: left;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .solution-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.3), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .solution-card:hover {
          transform: translateY(-12px);
          border-color: rgba(201, 162, 39, 0.25);
          box-shadow:
            0 24px 48px rgba(0, 0, 0, 0.25),
            0 0 60px rgba(201, 162, 39, 0.06);
          background: rgba(255, 255, 255, 0.04);
        }

        .solution-card:hover::before {
          opacity: 1;
        }

        .solution-card--featured {
          background: linear-gradient(180deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.03) 100%);
          border: 2px solid rgba(201, 162, 39, 0.3);
          transform: scale(1.02);
          z-index: 2;
        }

        .solution-card--featured::before {
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 1;
        }

        .solution-card--featured:hover {
          transform: scale(1.02) translateY(-12px);
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.3),
            0 0 80px rgba(201, 162, 39, 0.12);
        }

        .solution-card__ribbon {
          position: absolute;
          top: 20px;
          right: -35px;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--dark-900);
          padding: 6px 40px;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transform: rotate(45deg);
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
        }

        .solution-card__step {
          position: absolute;
          top: 24px;
          left: 28px;
          font-size: 3rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.04);
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .solution-card__step--gold {
          color: rgba(201, 162, 39, 0.12);
        }

        .solution-card__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .solution-card__icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
          color: var(--gold);
          transition: all 0.3s ease;
        }

        .solution-card:hover .solution-card__icon {
          transform: scale(1.1);
          background: rgba(201, 162, 39, 0.15);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.2);
        }

        .solution-card__icon--evaluate {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.05) 100%);
          border-color: rgba(34, 197, 94, 0.25);
          color: var(--success);
        }

        .solution-card__icon--manage {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.08) 100%);
          border-color: rgba(201, 162, 39, 0.3);
          color: var(--gold);
        }

        .solution-card__icon--invest {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%);
          border-color: rgba(59, 130, 246, 0.25);
          color: #3b82f6;
        }

        .solution-card__badge {
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .solution-card__badge--gold {
          background: rgba(201, 162, 39, 0.15);
          border-color: rgba(201, 162, 39, 0.3);
          color: var(--gold);
        }

        .solution-card__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--light-100);
          margin: 0 0 12px;
          letter-spacing: -0.02em;
        }

        .solution-card__description {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
          margin: 0 0 24px;
        }

        .solution-card__list {
          list-style: none;
          padding: 0;
          margin: 0 0 28px 0;
          flex-grow: 1;
        }

        .solution-card__list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        .solution-card__list li svg {
          color: var(--gold);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .solution-card__list li:last-child {
          margin-bottom: 0;
        }

        .solution-card__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          color: var(--light-100);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          margin-top: auto;
        }

        .solution-card__cta svg {
          transition: transform 0.3s ease;
        }

        .solution-card__cta:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(201, 162, 39, 0.4);
          color: var(--gold);
        }

        .solution-card__cta:hover svg {
          transform: translateX(4px);
        }

        .solution-card__cta--primary {
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          border: none;
          color: var(--dark-900);
          box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);
        }

        .solution-card__cta--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(201, 162, 39, 0.4);
          color: var(--dark-900);
        }

        /* Solutions Stats */
        .solutions__stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          position: relative;
          z-index: 1;
        }

        .solutions__stat {
          text-align: center;
          padding: 0 16px;
          position: relative;
        }

        .solutions__stat:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 48px;
          background: rgba(255, 255, 255, 0.08);
        }

        .solutions__stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .solutions__stat-label {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.75);
        }

        /* =============================================
           SECTION 4: HIGH-DEMAND OPPORTUNITIES (Dark)
        ============================================= */
        .opportunities {
          padding: var(--section-py) 0;
          background: linear-gradient(180deg, var(--dark-700) 0%, var(--dark-800) 100%);
          overflow: hidden;
        }

        .opportunities__header {
          text-align: center;
          margin-bottom: 56px;
        }

        .opportunities__header .section-subtitle {
          margin: 0 auto;
        }

        .opportunities__scroll {
          position: relative;
          margin: 0 calc(-1 * var(--container-px)) 56px;
          mask: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
        }

        .opportunities__track {
          display: flex;
          gap: 32px;
          animation: scroll-horizontal 50s linear infinite;
          width: max-content;
          padding: 12px 0;
        }

        .opportunities__track:hover {
          animation-play-state: paused;
        }

        @keyframes scroll-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 16px)); }
        }

        .asset-card {
          width: 320px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: var(--card-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .asset-card:hover {
          transform: translateY(-8px);
          border-color: rgba(201, 162, 39, 0.25);
          box-shadow: var(--card-shadow-hover);
        }

        .asset-card__image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .asset-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .asset-card:hover .asset-card__image img {
          transform: scale(1.05);
        }

        .asset-card__badge {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          color: var(--light-100);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .asset-card__badge--featured {
          background: var(--gold);
          color: var(--dark-900);
        }

        .asset-card__badge--hot {
          background: var(--error);
        }

        .asset-card__badge-dot {
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .asset-card__badge--featured .asset-card__badge-dot {
          background: var(--dark-900);
        }

        .asset-card__body {
          padding: 20px 22px 22px;
        }

        .asset-card__chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 12px;
        }

        .asset-card__chip--insured {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: var(--success);
        }

        .asset-card__title {
          font-size: 1.0625rem;
          font-weight: 600;
          color: var(--light-100);
          margin: 0 0 6px;
          line-height: 1.4;
        }

        .asset-card__location {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0 0 16px;
        }

        .asset-card__price {
          font-size: 1.625rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 14px;
          letter-spacing: -0.02em;
        }

        .asset-card__metrics {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .asset-card__roi {
          padding: 5px 12px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 6px;
          color: var(--gold);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .asset-card__risk {
          padding: 5px 10px;
          border-radius: 6px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .asset-card__risk--low {
          background: rgba(34, 197, 94, 0.12);
          color: var(--success);
        }

        .asset-card__risk--medium {
          background: rgba(245, 158, 11, 0.12);
          color: var(--warning);
        }

        .opportunities__cta {
          text-align: center;
        }

        /* =============================================
           SECTION 5: INSTITUTIONAL-GRADE PROTECTION (Dark)
        ============================================= */
        .trust {
          padding: var(--section-py) 0;
          background: linear-gradient(180deg, var(--dark-800) 0%, var(--dark-900) 100%);
        }

        .trust__header {
          text-align: center;
          margin-bottom: 56px;
        }

        .trust__header .section-subtitle {
          margin: 0 auto;
        }

        .trust__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-bottom: 56px;
          align-items: stretch;
        }

        .trust-card {
          background: rgba(255, 255, 255, 0.025);
          backdrop-filter: blur(12px);
          border: var(--card-border);
          border-radius: var(--radius-lg);
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .trust-card:hover {
          transform: translateY(-6px);
          border-color: rgba(201, 162, 39, 0.2);
          box-shadow: var(--card-shadow-hover);
        }

        .trust-card--featured {
          background: linear-gradient(145deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.04) 100%);
          border: 2px solid rgba(201, 162, 39, 0.35);
          position: relative;
          overflow: hidden;
        }

        .trust-card--featured::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .trust-card--featured:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25), 0 0 60px rgba(201, 162, 39, 0.1);
        }

        .trust-card__badge {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 5px 14px;
          background: var(--gold);
          color: var(--dark-900);
          font-size: 0.6875rem;
          font-weight: 700;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .trust-card__header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }

        .trust-card__header--center {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .trust-card__icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: var(--radius);
          color: var(--gold);
          flex-shrink: 0;
        }

        .trust-card__icon--gold {
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
          color: var(--dark-900);
        }

        .trust-card__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--light-100);
          margin: 0 0 4px;
        }

        .trust-card__subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .trust-card__content {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .trust-card__description {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.7;
          margin: 0 0 20px;
          text-align: center;
        }

        .trust-card__features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .trust-card__feature {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--success);
        }

        .trust-card__btn {
          width: 100%;
          margin-top: auto;
        }

        .trust-card__partners {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trust-card__partner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-sm);
          transition: all 0.25s ease;
        }

        .trust-card__partner:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(201, 162, 39, 0.15);
        }

        .trust-card__partner-logo {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: var(--radius-sm);
          color: var(--gold);
          flex-shrink: 0;
        }

        .trust-card__partner strong {
          display: block;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--light-100);
          margin-bottom: 2px;
        }

        .trust-card__partner span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.75);
        }

        .trust-card__stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .trust-card__stat {
          text-align: center;
          padding: 14px 8px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-sm);
        }

        .trust-card__stat-value {
          display: block;
          font-size: 1.375rem;
          font-weight: 800;
          color: var(--gold);
          margin-bottom: 4px;
        }

        .trust-card__stat-label {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.3;
        }

        .trust-card__sectors {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }

        .trust-card__sectors span {
          padding: 10px 12px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.12);
          border-radius: 8px;
          font-size: 0.75rem;
          color: var(--gold);
          font-weight: 500;
          text-align: center;
        }

        .trust-card__roadmap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .trust-card__roadmap-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius-sm);
          transition: all 0.25s ease;
        }

        .trust-card__roadmap-item--completed {
          background: rgba(34, 197, 94, 0.06);
          border-color: rgba(34, 197, 94, 0.15);
        }

        .trust-card__roadmap-item--progress {
          background: rgba(251, 191, 36, 0.06);
          border-color: rgba(251, 191, 36, 0.15);
        }

        .trust-card__roadmap-item:hover {
          border-color: rgba(201, 162, 39, 0.2);
        }

        .trust-card__roadmap-flag {
          font-size: 1.25rem;
        }

        .trust-card__roadmap-item strong {
          display: block;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--light-100);
          margin-bottom: 4px;
        }

        .trust-card__roadmap-status {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(201, 162, 39, 0.1);
          color: var(--gold);
          font-size: 0.6875rem;
          font-weight: 600;
          border-radius: 100px;
        }

        .trust-card__roadmap-status--live {
          background: rgba(34, 197, 94, 0.12);
          color: var(--success);
        }

        .trust-card__roadmap-status--progress {
          background: rgba(251, 191, 36, 0.12);
          color: var(--warning);
        }

        .trust__cta {
          text-align: center;
        }

        /* =============================================
           SECTION 6: FINAL CTA (Light)
        ============================================= */
        .cta-section {
          padding: var(--section-py) 0;
          background: linear-gradient(135deg, var(--light-200) 0%, var(--light-300) 100%);
        }

        .cta-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          background: var(--light-100);
          border-radius: var(--radius-lg);
          padding: 56px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: var(--card-shadow);
        }

        .cta-card__title {
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 800;
          color: var(--dark-900);
          margin: 0 0 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .cta-card__text {
          font-size: var(--font-body);
          color: var(--gray-500);
          line-height: var(--line-height);
          margin: 0 0 24px;
          max-width: 420px;
        }

        .cta-card__benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 28px;
        }

        .cta-card__benefit {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--dark-900);
        }

        .cta-card__benefit svg {
          color: var(--success);
          flex-shrink: 0;
        }

        .cta-card__actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .cta-card__image {
          border-radius: var(--radius-lg);
          overflow: hidden;
          height: 420px;
          box-shadow: var(--card-shadow);
        }

        .cta-card__image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .cta-card__image:hover img {
          transform: scale(1.03);
        }

        /* =============================================
           RESPONSIVE DESIGN
        ============================================= */
        @media (max-width: 1024px) {
          :root {
            --section-py: var(--section-py-tablet);
            --container-px: var(--container-px-tablet);
          }

          .hero__container {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }

          .hero__content {
            max-width: 100%;
            order: 1;
          }

          .hero__eyebrow {
            justify-content: center;
          }

          .hero__description {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .hero__cta {
            justify-content: center;
          }

          .hero__trust {
            text-align: center;
          }

          .hero__trust-badges {
            justify-content: center;
          }

          .hero__visual {
            order: 2;
            max-width: 480px;
            margin: 0 auto;
            min-height: 450px;
          }

          .hero__card-image {
            height: 220px;
          }

          .hero__floating--stats {
            top: 10px;
            right: -10px;
          }

          .hero__floating--investors {
            bottom: 80px;
            left: -10px;
          }

          .hero__floating--verified {
            right: -10px;
          }

          .hero__stats-grid {
            flex-wrap: wrap;
            gap: 24px;
          }

          .hero__stat {
            padding: 0 24px;
          }

          .hero__stat-divider {
            display: none;
          }

          .story__grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .solutions__grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto 48px;
          }

          .solution-card--featured {
            transform: scale(1);
          }

          .solution-card--featured:hover {
            transform: translateY(-12px);
          }

          .solution-card__ribbon {
            top: 16px;
            right: -32px;
            padding: 5px 36px;
            font-size: 0.625rem;
          }

          .solutions__stats {
            grid-template-columns: repeat(2, 1fr);
            padding: 32px;
            gap: 20px;
          }

          .solutions__stat:nth-child(2)::after {
            display: none;
          }

          .solutions__stat-value {
            font-size: 1.75rem;
          }

          .trust__grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto 48px;
          }

          .trust-card__stats {
            grid-template-columns: repeat(3, 1fr);
          }

          .cta-card {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 48px 32px;
          }

          .cta-card__text {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .cta-card__actions {
            justify-content: center;
          }

          .cta-card__image {
            order: -1;
            height: 360px;
            max-width: 520px;
            margin: 0 auto;
          }

          .cta-card__benefits {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          :root {
            --section-py: var(--section-py-mobile);
            --container-px: var(--container-px-mobile);
            --btn-height: 44px;
            --btn-px: 22px;
          }

          .hero {
            padding: 110px 0 0;
            min-height: auto;
          }

          .hero__glow {
            display: none;
          }

          .hero__title {
            font-size: clamp(1.875rem, 8vw, 2.5rem);
          }

          .hero__title-line {
            white-space: normal;
          }

          .hero__description {
            font-size: 1rem;
          }

          .hero__cta {
            flex-direction: column;
            align-items: stretch;
          }

          .btn--lg {
            height: 50px;
            padding: 0 24px;
          }

          .hero__trust-badges {
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .hero__visual {
            min-height: 380px;
          }

          .hero__card-image {
            height: 180px;
          }

          .hero__floating {
            padding: 12px 14px;
            gap: 10px;
          }

          .hero__floating--stats {
            top: 5px;
            right: 5px;
          }

          .hero__floating--investors {
            bottom: 60px;
            left: 5px;
          }

          .hero__floating--verified {
            width: 44px;
            height: 44px;
            right: 5px;
          }

          .hero__floating--verified svg {
            width: 20px;
            height: 20px;
          }

          .hero__floating-icon {
            width: 36px;
            height: 36px;
          }

          .hero__floating-icon svg {
            width: 16px;
            height: 16px;
          }

          .hero__floating-value {
            font-size: 1rem;
          }

          .hero__floating-label {
            font-size: 0.6875rem;
          }

          .hero__floating-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.625rem;
            margin-left: -8px;
          }

          .hero__stats {
            padding: 24px 0;
          }

          .hero__stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .hero__stat {
            padding: 0;
          }

          .hero__stat-value {
            font-size: 1.25rem;
          }

          .hero__stat-label {
            font-size: 0.75rem;
          }

          .story__header {
            margin-bottom: 40px;
          }

          .story__card {
            padding: 28px;
          }

          .solutions__glow {
            display: none;
          }

          .solutions__header {
            margin-bottom: 48px;
          }

          .solution-card {
            padding: 28px 24px 24px;
          }

          .solution-card__step {
            font-size: 2.5rem;
            top: 20px;
            left: 24px;
          }

          .solution-card__icon {
            width: 56px;
            height: 56px;
          }

          .solution-card__icon svg {
            width: 26px;
            height: 26px;
          }

          .solution-card__title {
            font-size: 1.375rem;
          }

          .solution-card__cta {
            padding: 12px 20px;
            font-size: 0.8125rem;
          }

          .solutions__stats {
            padding: 24px;
            gap: 16px;
          }

          .solutions__stat:not(:last-child)::after {
            display: none;
          }

          .solutions__stat-value {
            font-size: 1.5rem;
          }

          .solutions__stat-label {
            font-size: 0.75rem;
          }

          .opportunities__header {
            margin-bottom: 40px;
          }

          .opportunities__track {
            gap: 20px;
          }

          .asset-card {
            width: 280px;
          }

          .trust__header {
            margin-bottom: 40px;
          }

          .trust-card {
            padding: 24px;
          }

          .trust-card__stats {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .trust-card__sectors {
            grid-template-columns: 1fr;
          }

          .trust-card__partner {
            flex-direction: column;
            text-align: center;
          }

          .trust-card__roadmap-item {
            flex-direction: column;
            text-align: center;
          }

          .cta-card {
            padding: 32px 24px;
          }

          .cta-card__benefits {
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }

          .cta-card__actions {
            flex-direction: column;
          }

          .cta-card__image {
            height: 300px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 100px 0 0;
          }

          .hero__eyebrow {
            font-size: 0.6875rem;
            padding: 8px 14px;
          }

          .hero__title {
            font-size: clamp(1.625rem, 9vw, 2rem);
          }

          .hero__visual {
            min-height: 320px;
          }

          .hero__card-body {
            padding: 18px;
          }

          .hero__card-title {
            font-size: 1.0625rem;
          }

          .hero__card-footer {
            padding-top: 16px;
          }

          .hero__card-price-value {
            font-size: 1.125rem;
          }

          .hero__card-roi-value {
            font-size: 1rem;
          }

          .hero__floating--stats,
          .hero__floating--investors {
            transform: scale(0.85);
          }

          .hero__floating--stats {
            top: 0;
            right: 0;
            transform-origin: top right;
          }

          .hero__floating--investors {
            bottom: 50px;
            left: 0;
            transform-origin: bottom left;
          }

          .hero__floating--verified {
            width: 40px;
            height: 40px;
          }

          .hero__stats-grid {
            gap: 16px;
          }

          .hero__stat-value {
            font-size: 1.125rem;
          }

          .story__card {
            padding: 24px 20px;
          }

          .story__card-title {
            font-size: 1.25rem;
          }

          .solution-card {
            padding: 24px 20px 20px;
          }

          .solution-card__step {
            font-size: 2rem;
            top: 16px;
            left: 20px;
          }

          .solution-card__header {
            flex-direction: column;
            gap: 12px;
          }

          .solution-card__icon {
            width: 52px;
            height: 52px;
          }

          .solution-card__ribbon {
            top: 14px;
            right: -30px;
            padding: 4px 32px;
            font-size: 0.5625rem;
          }

          .solution-card__title {
            font-size: 1.25rem;
          }

          .solution-card__description {
            font-size: 0.875rem;
          }

          .solution-card__list li {
            font-size: 0.8125rem;
            gap: 10px;
          }

          .solution-card__list li svg {
            width: 14px;
            height: 14px;
          }

          .solutions__stats {
            grid-template-columns: 1fr 1fr;
            padding: 20px;
            gap: 12px;
          }

          .solutions__stat {
            padding: 0 8px;
          }

          .solutions__stat-value {
            font-size: 1.25rem;
          }

          .solutions__stat-label {
            font-size: 0.6875rem;
          }

          .asset-card {
            width: 260px;
          }

          .trust-card__stat-value {
            font-size: 1.25rem;
          }

          .cta-card__image {
            display: none;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .opportunities__track {
            animation: none;
          }

          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}
