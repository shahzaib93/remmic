import Head from 'next/head'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SERVICE_GROUPS = [
  {
    title: 'For Property Owners',
    description: 'Everything owners need to evaluate, operate and unlock liquidity from premium assets.',
    items: [
      { label: 'Evaluation', detail: 'REM Verified valuation reports with licensed assessors.' },
      { label: 'Management', detail: 'Tenant, rent and maintenance operations with real-time dashboards.' },
      { label: 'Renovation & construction', detail: 'Escrow-based upgrades with vetted contractors and milestones.' },
      { label: 'Liquidity via fractionalization', detail: 'Turn assets into tradable fractions with REMMIC compliance.' },
    ],
    cta: { label: 'Request Evaluation', href: '/evaluation' },
    accent: 'gold',
  },
  {
    title: 'For Investors',
    description: 'Institutional-grade access to direct deals or REMMIC-managed portfolios.',
    items: [
      { label: 'Direct investment', detail: 'Pick verified assets and invest outright or fractionally.' },
      { label: 'Managed portfolios', detail: 'Diversified real-estate baskets curated by REMMIC analysts.' },
      { label: 'Fractional ownership', detail: 'Lower entry tickets with full legal protection and reporting.' },
    ],
    cta: { label: 'Explore Marketplace', href: '/marketplace' },
    accent: 'brown',
  },
  {
    title: 'For Realtors & Contractors',
    description: 'Onboard into the REMMIC supply network with transparent tiers and performance bonuses.',
    items: [
      { label: 'Verified onboarding', detail: 'KYC, documentation and project credential checks.' },
      { label: 'Tier system (Silver / Gold / Platinum)', detail: 'Earn higher exposure and perks as performance climbs.' },
      { label: 'Performance-based ranking', detail: 'Marketplace visibility tied to quality, delivery and ratings.' },
    ],
    cta: { label: 'Apply for Verification', href: '/contact' },
    accent: 'dark',
  },
]

export default function Services() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>Services | REMMIC</title>
        <meta
          name="description"
          content="Discover REMMIC services for property owners, investors, and real-estate professionals."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__content ${visible ? 'is-visible' : ''}`}>
              <p className="hero__eyebrow">Services</p>
              <h1>Built for every stakeholder in real assets.</h1>
              <p>
                Whether you own, invest, or build, REMMIC orchestrates evaluation, operations, liquidity and compliant
                access under one roof.
              </p>
            </div>
          </section>

          <section className="service-groups">
            {SERVICE_GROUPS.map((group, idx) => (
              <article key={group.title} className={`group-card group-card--${group.accent}`}>
                <header className="group-card__header">
                  <span className="group-card__number">0{idx + 1}</span>
                  <div className="group-card__title-wrap">
                    <h2>{group.title}</h2>
                    <p>{group.description}</p>
                  </div>
                </header>
                <ul className="group-card__list">
                  {group.items.map((item, i) => (
                    <li key={item.label} className="service-item">
                      <div className="service-item__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <div className="service-item__content">
                        <strong>{item.label}</strong>
                        <p>{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <footer className="group-card__footer">
                  <a href={group.cta.href} className="group-card__cta">
                    {group.cta.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </a>
                </footer>
              </article>
            ))}
          </section>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        /* Hero Section */
        .hero {
          padding: 110px 5% 56px;
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
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 0%, rgba(201, 162, 39, 0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .hero__content {
          max-width: 640px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .hero__content.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__eyebrow {
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.6875rem;
          font-weight: 600;
          color: #c9a227;
          margin-bottom: 16px;
          padding: 6px 16px;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 100px;
          font-family: 'Manrope', sans-serif;
        }

        .hero h1 {
          margin: 0 0 14px;
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #ffffff;
          font-family: 'Playfair Display', serif;
        }

        .hero > .hero__content > p:last-child {
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          font-size: 1.0625rem;
          max-width: 520px;
          font-family: 'Manrope', sans-serif;
        }

        /* Service Groups Section */
        .service-groups {
          padding: 72px 5% 100px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
          display: flex;
          flex-direction: column;
          gap: 40px;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Group Card */
        .group-card {
          border: 1px solid #e8e8e6;
          border-radius: 24px;
          padding: 0;
          background: #ffffff;
          overflow: hidden;
          transition: all 0.25s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
        }

        .group-card:hover {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }

        /* Group Card Accents */
        .group-card--gold {
          border-top: 4px solid #c9a227;
        }

        .group-card--brown {
          border-top: 4px solid #4a3728;
        }

        .group-card--dark {
          border-top: 4px solid #0a0a0a;
        }

        /* Group Card Header */
        .group-card__header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 32px 32px 24px;
          border-bottom: 1px solid #f2f2f0;
        }

        .group-card__number {
          font-size: 2.5rem;
          font-weight: 700;
          color: rgba(201, 162, 39, 0.15);
          line-height: 1;
          font-family: 'Playfair Display', serif;
          flex-shrink: 0;
        }

        .group-card__title-wrap h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          font-family: 'Manrope', sans-serif;
        }

        .group-card__title-wrap p {
          margin: 0;
          color: #5f6368;
          font-size: 0.9375rem;
          line-height: 1.6;
          font-family: 'Manrope', sans-serif;
        }

        /* Service Items List */
        .group-card__list {
          list-style: none;
          padding: 24px 32px;
          margin: 0;
          display: grid;
          gap: 14px;
        }

        .service-item {
          padding: 20px;
          border-radius: 14px;
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
          border: 1px solid #f0f0ee;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .service-item:hover {
          border-color: rgba(201, 162, 39, 0.3);
          box-shadow: 0 4px 16px rgba(201, 162, 39, 0.08);
          transform: translateX(4px);
        }

        .service-item__icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.14) 0%, rgba(74, 55, 40, 0.06) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #c9a227;
        }

        .service-item__content strong {
          display: block;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .service-item__content p {
          margin: 0;
          color: #5f6368;
          font-size: 0.875rem;
          line-height: 1.55;
          font-family: 'Manrope', sans-serif;
        }

        /* Group Card Footer */
        .group-card__footer {
          padding: 20px 32px 28px;
          border-top: 1px solid #f2f2f0;
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
        }

        .group-card__cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          background: #0a0a0a;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.25s ease;
          font-family: 'Manrope', sans-serif;
        }

        .group-card__cta svg {
          transition: transform 0.25s ease;
        }

        .group-card__cta:hover {
          background: #1a1a1a;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .group-card__cta:hover svg {
          transform: translateX(4px);
        }

        /* Gold accent CTA */
        .group-card--gold .group-card__cta {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);
        }

        .group-card--gold .group-card__cta:hover {
          box-shadow: 0 6px 24px rgba(201, 162, 39, 0.4);
        }

        /* Brown accent CTA */
        .group-card--brown .group-card__cta {
          background: linear-gradient(135deg, #4a3728 0%, #5d483a 100%);
        }

        .group-card--brown .group-card__cta:hover {
          box-shadow: 0 4px 16px rgba(74, 55, 40, 0.3);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .service-groups {
            padding: 56px 5% 80px;
            gap: 32px;
          }

          .group-card__header {
            padding: 28px 24px 20px;
          }

          .group-card__list {
            padding: 20px 24px;
          }

          .group-card__footer {
            padding: 18px 24px 24px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 6% 48px;
          }

          .hero h1 {
            font-size: clamp(1.75rem, 6vw, 2.5rem);
          }

          .hero > .hero__content > p:last-child {
            font-size: 1rem;
          }

          .service-groups {
            padding: 48px 5% 72px;
            gap: 28px;
          }

          .group-card {
            border-radius: 18px;
          }

          .group-card__header {
            flex-direction: column;
            gap: 12px;
            padding: 24px 20px 18px;
          }

          .group-card__number {
            font-size: 2rem;
          }

          .group-card__title-wrap h2 {
            font-size: 1.3125rem;
          }

          .group-card__list {
            padding: 18px 20px;
            gap: 12px;
          }

          .service-item {
            padding: 16px;
            border-radius: 12px;
          }

          .service-item__icon {
            width: 36px;
            height: 36px;
          }

          .service-item__content strong {
            font-size: 0.9375rem;
          }

          .service-item__content p {
            font-size: 0.8125rem;
          }

          .group-card__footer {
            padding: 16px 20px 22px;
          }

          .group-card__cta {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 96px 5% 40px;
          }

          .hero__eyebrow {
            font-size: 0.625rem;
            padding: 5px 12px;
          }

          .hero h1 {
            font-size: clamp(1.5rem, 7vw, 2rem);
          }

          .group-card__header {
            padding: 20px 18px 16px;
          }

          .group-card__title-wrap h2 {
            font-size: 1.1875rem;
          }

          .group-card__list {
            padding: 16px 18px;
          }

          .service-item {
            padding: 14px;
            gap: 12px;
          }

          .service-item__icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
          }

          .service-item__icon svg {
            width: 16px;
            height: 16px;
          }

          .group-card__footer {
            padding: 14px 18px 20px;
          }

          .group-card__cta {
            padding: 12px 20px;
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </>
  )
}
