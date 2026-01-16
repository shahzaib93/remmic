import Head from 'next/head'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Investment() {
  const [isVisible, setIsVisible] = useState(false)
  const [modelsVisible, setModelsVisible] = useState(false)
  const modelsRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === modelsRef.current && entry.isIntersecting) {
            setModelsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (modelsRef.current) observer.observe(modelsRef.current)

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Head>
        <title>Investment Models - REMMIC</title>
        <meta name="description" content="Explore REMMIC's investment models: Direct investment, fractional ownership, and crowd-funded development with institutional-grade protection." />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="pt-24">
          {/* Hero Section */}
          <section className="hero">
            <div className="hero__container" style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s ease'
            }}>
              <span className="hero__eyebrow">Investment Models</span>
              <h1 className="hero__title">
                Real Estate Investment<br />
                <span className="hero__accent">Made Accessible</span>
              </h1>
              <p className="hero__description">
                From direct purchases to fractional ownership — invest in verified
                properties with complete transparency and institutional protection.
              </p>
            </div>
          </section>

          {/* Investment Models Section */}
          <section ref={modelsRef} className="models">
            <div className="models__container">
              <div className="models__header" style={{
                opacity: modelsVisible ? 1 : 0,
                transform: modelsVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'all 0.6s ease'
              }}>
                <span className="models__eyebrow">Choose Your Path</span>
                <h2 className="models__title">Investment Models</h2>
                <p className="models__subtitle">
                  Select the investment approach that matches your goals and capital
                </p>
              </div>

              <div className="models__grid">
                {/* Direct Investment */}
                <div className="model-card" style={{
                  opacity: modelsVisible ? 1 : 0,
                  transform: modelsVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: 'all 0.6s ease 0.1s'
                }}>
                  <div className="model-card__header">
                    <div className="model-card__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    </div>
                    <h3 className="model-card__title">Direct Investment</h3>
                    <p className="model-card__subtitle">Full property ownership</p>
                  </div>
                  <div className="model-card__body">
                    <p className="model-card__description">
                      Purchase complete ownership of verified properties with full control
                      over management, rental income, and sale decisions.
                    </p>
                    <ul className="model-card__features">
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>100% property ownership</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Full rental income</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Capital appreciation</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Management support available</span>
                      </li>
                    </ul>
                    <div className="model-card__investment">
                      <span className="model-card__label">Minimum Investment</span>
                      <span className="model-card__amount">PKR 50 Lac+</span>
                    </div>
                  </div>
                  <div className="model-card__footer">
                    <a href="/marketplace" className="model-card__btn">
                      <span>Browse Properties</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Fractional Ownership */}
                <div className="model-card model-card--featured" style={{
                  opacity: modelsVisible ? 1 : 0,
                  transform: modelsVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: 'all 0.6s ease 0.2s'
                }}>
                  <div className="model-card__badge">Most Popular</div>
                  <div className="model-card__header">
                    <div className="model-card__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="model-card__title">Fractional Ownership</h3>
                    <p className="model-card__subtitle">Own a share of premium properties</p>
                  </div>
                  <div className="model-card__body">
                    <p className="model-card__description">
                      Invest in high-value properties by purchasing ownership shares.
                      Earn proportional rental income and capital gains.
                    </p>
                    <ul className="model-card__features">
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Lower entry barrier</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Proportional returns</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Portfolio diversification</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Secondary market trading</span>
                      </li>
                    </ul>
                    <div className="model-card__investment">
                      <span className="model-card__label">Minimum Investment</span>
                      <span className="model-card__amount">PKR 50,000</span>
                    </div>
                  </div>
                  <div className="model-card__footer">
                    <a href="/signup" className="model-card__btn model-card__btn--primary">
                      <span>Start Investing</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Crowd-funded Development */}
                <div className="model-card" style={{
                  opacity: modelsVisible ? 1 : 0,
                  transform: modelsVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: 'all 0.6s ease 0.3s'
                }}>
                  <div className="model-card__header">
                    <div className="model-card__icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                      </svg>
                    </div>
                    <h3 className="model-card__title">Crowd-funded Development</h3>
                    <p className="model-card__subtitle">Fund new developments together</p>
                  </div>
                  <div className="model-card__body">
                    <p className="model-card__description">
                      Pool investments to fund new construction projects. Higher returns
                      with escrow-protected capital and milestone-based releases.
                    </p>
                    <ul className="model-card__features">
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Higher potential returns</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Escrow protection</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Progress tracking</span>
                      </li>
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        <span>Exit on completion</span>
                      </li>
                    </ul>
                    <div className="model-card__investment">
                      <span className="model-card__label">Minimum Investment</span>
                      <span className="model-card__amount">PKR 1 Lac</span>
                    </div>
                  </div>
                  <div className="model-card__footer">
                    <a href="/contact" className="model-card__btn">
                      <span>Learn More</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Section */}
          <section className="trust">
            <div className="trust__container">
              <div className="trust__header">
                <span className="trust__eyebrow">Investor Protection</span>
                <h2 className="trust__title">Your Investment is Protected</h2>
              </div>
              <div className="trust__grid">
                <div className="trust__item">
                  <div className="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                  </div>
                  <h4>SECP Regulated</h4>
                  <p>Operating under SECP sandbox framework</p>
                </div>
                <div className="trust__item">
                  <div className="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                  </div>
                  <h4>SBP Escrow</h4>
                  <p>Funds held in compliant escrow accounts</p>
                </div>
                <div className="trust__item">
                  <div className="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h4>Full Transparency</h4>
                  <p>Complete audit trails and reporting</p>
                </div>
                <div className="trust__item">
                  <div className="trust__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h4>Verified Assets</h4>
                  <p>Only REM Verified properties listed</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta">
            <div className="cta__container">
              <h2 className="cta__title">Start Your Investment Journey</h2>
              <p className="cta__description">
                Create a free account and explore verified investment opportunities
                with complete transparency and institutional protection.
              </p>
              <div className="cta__buttons">
                <a href="/signup" className="btn btn--primary btn--large">
                  <span>Create Free Account</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </a>
                <a href="/contact" className="btn btn--outline btn--large">
                  <span>Talk to Advisor</span>
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        /* Hero */
        .hero {
          padding: 160px 5% 80px;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          text-align: center;
        }

        .hero__container {
          max-width: 900px;
          margin: 0 auto;
        }

        .hero__eyebrow {
          display: inline-block;
          padding: 10px 20px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 24px;
        }

        .hero__title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 24px;
        }

        .hero__accent {
          color: #c9a227;
        }

        .hero__description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin: 0 0 48px;
        }

        .hero__stats {
          display: flex;
          justify-content: center;
          gap: 48px;
          padding: 32px 48px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 16px;
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

        /* Models */
        .models {
          padding: 100px 5%;
          background: #ffffff;
        }

        .models__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .models__header {
          text-align: center;
          margin-bottom: 60px;
        }

        .models__eyebrow {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.1);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .models__title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 16px;
        }

        .models__subtitle {
          font-size: 1.125rem;
          color: #6b7280;
          margin: 0;
        }

        .models__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .model-card {
          position: relative;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .model-card:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .model-card--featured {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .model-card--featured .model-card__title,
        .model-card--featured .model-card__subtitle,
        .model-card--featured .model-card__description {
          color: #ffffff;
        }

        .model-card--featured .model-card__subtitle,
        .model-card--featured .model-card__description {
          color: rgba(255, 255, 255, 0.7);
        }

        .model-card--featured .model-card__features li span {
          color: rgba(255, 255, 255, 0.8);
        }

        .model-card--featured .model-card__label {
          color: rgba(255, 255, 255, 0.5);
        }

        .model-card--featured .model-card__icon {
          background: rgba(201, 162, 39, 0.2);
        }

        .model-card__badge {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 20px;
          background: #c9a227;
          color: #0a0a0a;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 0 0 8px 8px;
        }

        .model-card__header {
          padding: 40px 32px 24px;
          text-align: center;
        }

        .model-card__icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 16px;
          color: #c9a227;
          margin: 0 auto 20px;
        }

        .model-card__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 8px;
        }

        .model-card__subtitle {
          font-size: 0.9375rem;
          color: #6b7280;
          margin: 0;
        }

        .model-card__body {
          padding: 0 32px 24px;
          flex: 1;
        }

        .model-card__description {
          font-size: 0.9375rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 20px;
          text-align: center;
        }

        .model-card__features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
        }

        .model-card__features li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9375rem;
          color: #374151;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .model-card__features li:last-child {
          border-bottom: none;
        }

        .model-card__features li svg {
          color: #c9a227;
          flex-shrink: 0;
        }

        .model-card__investment {
          text-align: center;
          padding: 16px;
          background: rgba(201, 162, 39, 0.05);
          border-radius: 12px;
        }

        .model-card__label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .model-card__amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #c9a227;
        }

        .model-card__footer {
          padding: 24px 32px 32px;
        }

        .model-card__btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: transparent;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          color: #0a0a0a;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .model-card__btn:hover {
          border-color: #c9a227;
          color: #c9a227;
        }

        .model-card__btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          border-color: transparent;
          color: #0a0a0a;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
        }

        .model-card__btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.4);
        }

        /* Trust */
        .trust {
          padding: 80px 5%;
          background: #faf9f7;
        }

        .trust__container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .trust__header {
          text-align: center;
          margin-bottom: 48px;
        }

        .trust__eyebrow {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.1);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .trust__title {
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 700;
          color: #0a0a0a;
          margin: 0;
        }

        .trust__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .trust__item {
          text-align: center;
          padding: 24px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
        }

        .trust__icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 12px;
          color: #c9a227;
          margin: 0 auto 12px;
        }

        .trust__item h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0 0 4px;
        }

        .trust__item p {
          font-size: 0.8125rem;
          color: #6b7280;
          margin: 0;
        }

        /* CTA */
        .cta {
          padding: 100px 5%;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          text-align: center;
        }

        .cta__container {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta__title {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 16px;
        }

        .cta__description {
          font-size: 1.0625rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin: 0 0 32px;
        }

        .cta__buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.4);
        }

        .btn--outline {
          background: transparent;
          color: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn--outline:hover {
          border-color: #c9a227;
          color: #c9a227;
        }

        .btn--large {
          padding: 16px 32px;
          font-size: 1rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .models__grid {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin: 0 auto;
          }

          .trust__grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero__stats {
            flex-wrap: wrap;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 140px 5% 60px;
          }

          .models, .cta {
            padding: 60px 5%;
          }

          .trust {
            padding: 60px 5%;
          }

          .trust__grid {
            grid-template-columns: 1fr;
            max-width: 300px;
            margin: 0 auto;
          }

          .hero__stat-value {
            font-size: 1.5rem;
          }

          .cta__buttons {
            flex-direction: column;
          }

          .cta__buttons .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}
