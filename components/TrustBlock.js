/**
 * TrustBlock Component
 *
 * Reusable trust section for site-wide consistency.
 * Displays insurance partners, Amanorx Group backing, and jurisdiction roadmap.
 *
 * Props:
 * - variant: 'full' (default) | 'compact' - Full shows all pillars, compact shows summary grid
 * - showCta: boolean - Whether to show "Learn About Our Governance" link
 *
 * Usage:
 * <TrustBlock /> - Full version for homepage
 * <TrustBlock variant="compact" /> - Compact version for inner pages
 */
import { useEffect, useState, useRef } from 'react'

export default function TrustBlock({ variant = 'full', showCta = true }) {
  const trustRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (trustRef.current) {
      observer.observe(trustRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Compact variant for pages that need a smaller trust block
  if (variant === 'compact') {
    return (
      <section ref={trustRef} className="trust trust--compact">
        <div className="trust__container">
          <div className="trust__compact-grid" style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease'
          }}>
            <div className="trust__compact-item">
              <div className="trust__compact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <div className="trust__compact-text">
                <strong>Insurance-Backed</strong>
                <span>All assets protected</span>
              </div>
            </div>
            <div className="trust__compact-item">
              <div className="trust__compact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div className="trust__compact-text">
                <strong>SECP Regulated</strong>
                <span>Sandbox framework</span>
              </div>
            </div>
            <div className="trust__compact-item">
              <div className="trust__compact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="trust__compact-text">
                <strong>Amanorx Group</strong>
                <span>Institutional backing</span>
              </div>
            </div>
            <div className="trust__compact-item">
              <div className="trust__compact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div className="trust__compact-text">
                <strong>Regular Audits</strong>
                <span>Transparent reporting</span>
              </div>
            </div>
          </div>
          <p className="trust__disclaimer" style={{
            opacity: visible ? 1 : 0,
            transition: 'all 0.6s ease 0.3s'
          }}>
            REMMIC never owns client assets and never promises fixed returns.
          </p>
        </div>

        <style jsx>{`
          .trust--compact {
            padding: 48px 5%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          }

          .trust__container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .trust__compact-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin-bottom: 24px;
          }

          .trust__compact-item {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(201, 162, 39, 0.15);
            border-radius: 16px;
          }

          .trust__compact-icon {
            width: 48px;
            height: 48px;
            background: rgba(201, 162, 39, 0.12);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c9a227;
            flex-shrink: 0;
          }

          .trust__compact-text {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .trust__compact-text strong {
            color: #ffffff;
            font-size: 0.9375rem;
            font-weight: 600;
          }

          .trust__compact-text span {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.8125rem;
          }

          .trust__disclaimer {
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.8125rem;
            margin: 0;
          }

          @media (max-width: 900px) {
            .trust__compact-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 480px) {
            .trust__compact-grid {
              grid-template-columns: 1fr;
            }

            .trust__compact-item {
              padding: 16px;
            }
          }
        `}</style>
      </section>
    )
  }

  // Full variant (default) - for homepage
  return (
    <section ref={trustRef} className="trust">
      <div className="trust__container">
        <div className="trust__header" style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
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
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
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

          {/* Jurisdiction Roadmap */}
          <div className="trust__pillar">
            <div className="trust__pillar-header">
              <div className="trust__pillar-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <h3 className="trust__pillar-title">Jurisdiction Roadmap</h3>
              <p className="trust__pillar-subtitle">Multi-jurisdiction regulatory expansion</p>
            </div>

            <div className="trust__pillar-content">
              <div className="trust__roadmap">
                <div className="trust__roadmap-item trust__roadmap-item--completed">
                  <div className="trust__roadmap-flag">
                    <span className="trust__roadmap-flag-icon">PK</span>
                  </div>
                  <div className="trust__roadmap-content">
                    <h4>Pakistan</h4>
                    <span className="trust__roadmap-status">Live - SECP Regulated</span>
                  </div>
                </div>

                <div className="trust__roadmap-item trust__roadmap-item--in-progress">
                  <div className="trust__roadmap-flag">
                    <span className="trust__roadmap-flag-icon">AE</span>
                  </div>
                  <div className="trust__roadmap-content">
                    <h4>UAE</h4>
                    <span className="trust__roadmap-status">Q2 2026 - ADGM License</span>
                  </div>
                </div>

                <div className="trust__roadmap-item">
                  <div className="trust__roadmap-flag">
                    <span className="trust__roadmap-flag-icon">SG</span>
                  </div>
                  <div className="trust__roadmap-content">
                    <h4>Singapore</h4>
                    <span className="trust__roadmap-status">Q4 2026 - MAS Compliance</span>
                  </div>
                </div>

                <div className="trust__roadmap-item">
                  <div className="trust__roadmap-flag">
                    <span className="trust__roadmap-flag-icon">UK</span>
                  </div>
                  <div className="trust__roadmap-content">
                    <h4>United Kingdom</h4>
                    <span className="trust__roadmap-status">2027 - FCA Authorization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCta && (
          <div className="trust__cta" style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease 0.4s'
          }}>
            <a href="/trust-security" className="btn btn--outline-light">
              <span>Learn About Our Governance</span>
            </a>
          </div>
        )}

        <p className="trust__disclaimer-note" style={{
          opacity: visible ? 1 : 0,
          transition: 'all 0.6s ease 0.5s'
        }}>
          REMMIC never owns client assets and never promises fixed returns.
        </p>
      </div>

      <style jsx>{`
        .trust {
          padding: 100px 5%;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .trust::before {
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

        .trust__container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .trust__header {
          text-align: center;
          margin-bottom: 60px;
        }

        .trust__eyebrow {
          display: inline-block;
          padding: 10px 20px;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 100px;
          color: #c9a227;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 24px;
        }

        .trust__title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 16px;
          letter-spacing: -0.01em;
        }

        .trust__subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .trust__pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .trust__pillar {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 24px;
          padding: 32px;
          transition: all 0.3s ease;
        }

        .trust__pillar:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          transform: translateY(-4px);
        }

        .trust__pillar--featured {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(74, 55, 40, 0.05) 100%);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .trust__pillar-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .trust__pillar-badge {
          display: inline-block;
          padding: 6px 14px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .trust__pillar-icon {
          width: 64px;
          height: 64px;
          background: rgba(201, 162, 39, 0.12);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #c9a227;
        }

        .trust__pillar-icon--amanorx {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
        }

        .trust__pillar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px;
        }

        .trust__pillar-subtitle {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .trust__pillar-content {
          border-top: 1px solid rgba(201, 162, 39, 0.15);
          padding-top: 24px;
        }

        /* Insurance Partners */
        .trust__insurance-partners {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .trust__partner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .trust__partner-logo {
          width: 48px;
          height: 48px;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
          flex-shrink: 0;
        }

        .trust__partner-info h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .trust__partner-info span {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Amanorx Stats */
        .trust__amanorx-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .trust__amanorx-stat {
          text-align: center;
          padding: 16px 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .trust__amanorx-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #c9a227;
          margin-bottom: 4px;
        }

        .trust__amanorx-label {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .trust__amanorx-sectors {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .trust__sector {
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 100px;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .trust__amanorx-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .trust__amanorx-link:hover {
          color: #d4b13d;
        }

        /* Roadmap */
        .trust__roadmap {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trust__roadmap-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          opacity: 0.6;
          transition: all 0.2s ease;
        }

        .trust__roadmap-item:hover {
          opacity: 1;
        }

        .trust__roadmap-item--completed {
          opacity: 1;
          background: rgba(16, 185, 129, 0.1);
        }

        .trust__roadmap-item--in-progress {
          opacity: 1;
          background: rgba(201, 162, 39, 0.1);
        }

        .trust__roadmap-flag {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .trust__roadmap-flag-icon {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
        }

        .trust__roadmap-content h4 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .trust__roadmap-status {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .trust__roadmap-item--completed .trust__roadmap-status {
          color: #10b981;
        }

        .trust__roadmap-item--in-progress .trust__roadmap-status {
          color: #c9a227;
        }

        .trust__cta {
          text-align: center;
          margin-bottom: 32px;
        }

        .btn--outline-light {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: transparent;
          border: 2px solid rgba(201, 162, 39, 0.4);
          color: #c9a227;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn--outline-light:hover {
          background: rgba(201, 162, 39, 0.1);
          border-color: #c9a227;
        }

        .trust__disclaimer-note {
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.8125rem;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .trust__pillars {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .trust__amanorx-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .trust {
            padding: 80px 5%;
          }

          .trust__pillar {
            padding: 24px;
          }

          .trust__amanorx-stats {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .trust__amanorx-stat {
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .trust__amanorx-number {
            font-size: 1.25rem;
            margin-bottom: 0;
          }
        }
      `}</style>
    </section>
  )
}
