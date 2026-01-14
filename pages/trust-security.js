import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

const CONTROLS = [
  {
    title: 'Insurance-backed assets',
    description: 'Every listed asset carries verified insurance coverage.',
    icon: 'shield',
  },
  {
    title: 'Independent evaluations',
    description: 'Third-party licensed assessors verify all valuations.',
    icon: 'scale',
  },
  {
    title: 'Escrow-based payments',
    description: 'Funds held securely until milestones are verified.',
    icon: 'lock',
  },
  {
    title: 'SPV structuring',
    description: 'Legal entities isolate investor interests per asset.',
    icon: 'building',
  },
  {
    title: 'Regular audits',
    description: 'Quarterly reviews by independent audit partners.',
    icon: 'audit',
  },
]

export default function TrustSecurity() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>Trust & Security | REMMIC</title>
        <meta name="description" content="REMMIC trust stack: insurance-backed assets, independent evaluations, escrow payments, SPV structuring, regular audits." />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__content ${visible ? 'is-visible' : ''}`}>
              <p className="hero__eyebrow">Trust & Security</p>
              <h1>Institutional controls for every listing.</h1>
              <p>We publish the checks that power REMMIC so investors understand exactly how capital is protected.</p>
            </div>
          </section>

          <section className="controls">
            <div className="controls__grid">
              {CONTROLS.map((control, idx) => (
                <article key={control.title} className="control-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="control-card__icon">
                    {control.icon === 'shield' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    )}
                    {control.icon === 'scale' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 3v18" />
                        <path d="M5 12l-2 9h6l-2-9" />
                        <path d="M19 12l-2 9h6l-2-9" />
                        <path d="M3 12h18" />
                      </svg>
                    )}
                    {control.icon === 'lock' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <circle cx="12" cy="16" r="1" />
                      </svg>
                    )}
                    {control.icon === 'building' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                      </svg>
                    )}
                    {control.icon === 'audit' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    )}
                  </div>
                  <h2>{control.title}</h2>
                  <p>{control.description}</p>
                </article>
              ))}
            </div>
            <div className="controls__disclaimer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>REMMIC never owns client assets and never promises fixed returns.</p>
            </div>
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

        /* Controls Section */
        .controls {
          padding: 72px 5% 100px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
          text-align: center;
        }

        .controls__grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto 48px;
        }

        /* Control Card */
        .control-card {
          border: 1px solid #e8e8e6;
          border-radius: 20px;
          padding: 32px 24px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .control-card::before {
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

        .control-card:hover {
          border-color: rgba(201, 162, 39, 0.35);
          box-shadow: 0 12px 36px rgba(201, 162, 39, 0.1);
          transform: translateY(-4px);
        }

        .control-card:hover::before {
          opacity: 1;
        }

        .control-card:hover .control-card__icon {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(74, 55, 40, 0.1) 100%);
          transform: scale(1.05);
        }

        .control-card__icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(74, 55, 40, 0.05) 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
          transition: all 0.3s ease;
        }

        .control-card h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          font-family: 'Manrope', sans-serif;
        }

        .control-card p {
          margin: 0;
          font-size: 0.8125rem;
          color: #5f6368;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        /* Disclaimer */
        .controls__disclaimer {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 28px;
          background: linear-gradient(135deg, rgba(180, 83, 9, 0.06) 0%, rgba(180, 83, 9, 0.03) 100%);
          border: 1px solid rgba(180, 83, 9, 0.12);
          border-radius: 14px;
          max-width: 600px;
          margin: 0 auto;
        }

        .controls__disclaimer svg {
          color: #b45309;
          flex-shrink: 0;
        }

        .controls__disclaimer p {
          margin: 0;
          color: #78350f;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.5;
          text-align: left;
          font-family: 'Manrope', sans-serif;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .controls__grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .controls__grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .control-card {
            padding: 28px 20px;
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

          .controls {
            padding: 56px 5% 80px;
          }

          .controls__grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto 40px;
            gap: 14px;
          }

          .control-card {
            padding: 24px 20px;
            flex-direction: row;
            text-align: left;
            gap: 18px;
            border-radius: 16px;
          }

          .control-card__icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            flex-shrink: 0;
          }

          .control-card__icon svg {
            width: 24px;
            height: 24px;
          }

          .control-card h2 {
            font-size: 0.9375rem;
          }

          .control-card p {
            font-size: 0.75rem;
            margin-top: 4px;
          }

          .controls__disclaimer {
            flex-direction: column;
            text-align: center;
            gap: 10px;
            padding: 16px 20px;
          }

          .controls__disclaimer p {
            text-align: center;
            font-size: 0.8125rem;
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

          .controls {
            padding: 48px 5% 72px;
          }

          .control-card {
            padding: 20px 16px;
            gap: 14px;
          }

          .control-card__icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }

          .control-card__icon svg {
            width: 20px;
            height: 20px;
          }

          .control-card h2 {
            font-size: 0.875rem;
          }

          .controls__disclaimer {
            padding: 14px 16px;
          }

          .controls__disclaimer p {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  )
}
