import Head from 'next/head'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const HOW_IT_WORKS_STEPS = [
  {
    order: '01',
    title: 'Asset Evaluation',
    description:
      'Every asset on REMMIC starts with a forensic evaluation handled by licensed analysts and AI-assisted valuation engines.',
    points: [
      'Licensed agents & AI-assisted models',
      'Market value, yield, risk score',
    ],
  },
  {
    order: '02',
    title: 'Asset Structuring',
    description:
      'We package the asset into the investment shape that best suits investor demand and regulatory compliance.',
    points: ['Full ownership', 'Fractional shares', 'Managed investment vehicles'],
  },
  {
    order: '03',
    title: 'Invest or REMMIC Manage',
    description:
      'Investors can deploy capital directly or let REMMIC manage diversified exposure with embedded professional care.',
    points: ['Direct investment', 'REMMIC-managed portfolios', 'Professional asset care'],
  },
  {
    order: '04',
    title: 'Trade or Exit',
    description:
      'Liquidity unlocks through secondary trading, live bidding and upcoming token rails for compliant exits.',
    points: ['Secondary marketplace', 'Live bidding', 'Future token liquidity (coming soon)'],
  },
]

export default function HowItWorks() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>How REMMIC Works - Transparent Real Estate Pipelines</title>
        <meta
          name="description"
          content="Follow the four-step REMMIC pipeline from asset evaluation to exit opportunities and see how transparency is embedded at every stage."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="pt-24">
          <section className="hero">
            <div className={`hero__container ${isMounted ? 'is-visible' : ''}`}>
              <span className="hero__eyebrow">How REMMIC Works</span>
              <h1 className="hero__title">
                Step-by-Step Transparency for
                <span className="hero__title-accent">Real Estate Investing</span>
              </h1>
              <p className="hero__description">
                REMMIC orchestrates every layer of evaluation, structuring, management and exit so you can follow a
                single, auditable pipeline from discovery to liquidity.
              </p>
            </div>
          </section>

          <section className="timeline" aria-label="How REMMIC Works timeline">
            <div className="timeline__intro">
              <span className="timeline__eyebrow">The REMMIC Pipeline</span>
              <h2 className="timeline__title">Follow the Investment Journey</h2>
              <p className="timeline__subtitle">
                Each step is designed so investors, partners and regulators can track controls end-to-end.
              </p>
            </div>

            <div className="timeline__wrapper">
              <div className="timeline__hint" aria-hidden="true">
                <span>Scroll to explore</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </div>
              <div className="timeline__scroller">
                <div className="timeline__track">
                  {HOW_IT_WORKS_STEPS.map((step, index) => (
                    <article className="timeline__step" key={step.title}>
                      <div className="timeline__step-header">
                        <div className="timeline__step-number">
                          <span>{step.order}</span>
                        </div>
                        <div className="timeline__step-meta">
                          <span className="timeline__step-label">Step {index + 1}</span>
                          <h3 className="timeline__step-title">{step.title}</h3>
                        </div>
                      </div>
                      <p className="timeline__step-description">{step.description}</p>
                      <ul className="timeline__step-points">
                        {step.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                      {index < HOW_IT_WORKS_STEPS.length - 1 && (
                        <div className="timeline__connector" aria-hidden="true" />
                      )}
                    </article>
                  ))}
                </div>
              </div>
              <div className="timeline__fade timeline__fade--left" aria-hidden="true" />
              <div className="timeline__fade timeline__fade--right" aria-hidden="true" />
            </div>
          </section>

          <section className="cta">
            <div className="cta__container">
              <h2 className="cta__title">Need the Pipeline for Your Assets?</h2>
              <p className="cta__description">
                Book a walkthrough with our structuring desk or explore verified listings to experience the
                REMMIC workflow yourself.
              </p>
              <div className="cta__actions">
                <a href="/contact" className="btn btn--primary btn--large">
                  <span>Talk to REMMIC</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                </a>
                <a href="/marketplace" className="btn btn--secondary btn--large">
                  <span>Explore Assets</span>
                </a>
              </div>
              <p className="cta__trust">Trusted by institutional investors across Pakistan</p>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        /* ===== How It Works Page - Premium Styles ===== */

        /* Hero Section */
        .hero {
          background: linear-gradient(180deg, #0a0a0a 0%, #121212 100%);
          padding: 120px 5% 80px;
          text-align: center;
          color: #fff;
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
            radial-gradient(circle at 30% 20%, rgba(201, 162, 39, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(74, 55, 40, 0.03) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero__container {
          max-width: 720px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(24px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }

        .hero__container.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 100px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.25);
          color: #c9a227;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'Manrope', sans-serif;
        }

        .hero__title {
          font-size: clamp(2.25rem, 5.5vw, 3rem);
          line-height: 1.15;
          margin: 0 0 18px;
          font-weight: 600;
          letter-spacing: -0.025em;
          color: #ffffff;
          font-family: 'Playfair Display', serif;
        }

        .hero__title-accent {
          display: block;
          color: #c9a227;
          margin-top: 6px;
        }

        .hero__description {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.65);
          margin: 0 auto;
          max-width: 480px;
          font-family: 'Manrope', sans-serif;
        }

        /* Timeline Section */
        .timeline {
          padding: 80px 5%;
          background: #ffffff;
          position: relative;
        }

        .timeline__intro {
          max-width: 600px;
          margin: 0 auto 40px;
          text-align: center;
        }

        .timeline__eyebrow {
          display: inline-block;
          padding: 6px 12px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 100px;
          color: #c9a227;
          font-size: 0.6875rem;
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: 'Manrope', sans-serif;
        }

        .timeline__title {
          font-size: clamp(1.75rem, 4.5vw, 2.25rem);
          margin: 0 0 10px;
          color: #0a0a0a;
          font-weight: 600;
          line-height: 1.2;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }

        .timeline__subtitle {
          font-size: 0.9375rem;
          color: #6b7280;
          line-height: 1.65;
          margin: 0 auto;
          max-width: 480px;
          font-family: 'Manrope', sans-serif;
        }

        .timeline__wrapper {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
        }

        .timeline__hint {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          color: #b8922a;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 20px;
          padding-right: 12px;
          font-family: 'Manrope', sans-serif;
        }

        .timeline__hint span {
          background: linear-gradient(90deg, #c9a227, #b8922a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .timeline__hint svg {
          color: #c9a227;
          animation: arrowPulse 1.2s ease-in-out infinite;
        }

        @keyframes arrowPulse {
          0%, 100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(8px); opacity: 0.7; }
        }

        .timeline__scroller {
          overflow-x: auto;
          padding-bottom: 16px;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #c9a227 rgba(0, 0, 0, 0.08);
          -webkit-overflow-scrolling: touch;
        }

        .timeline__scroller::-webkit-scrollbar {
          height: 6px;
        }

        .timeline__scroller::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.06);
          border-radius: 3px;
        }

        .timeline__scroller::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #c9a227, #d4b13d);
          border-radius: 3px;
        }

        .timeline__track {
          display: flex;
          gap: 32px;
          padding: 8px 4px;
        }

        .timeline__step {
          min-width: 320px;
          flex: 0 0 320px;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          color: #fff;
          border-radius: 16px;
          padding: 28px;
          position: relative;
          border: 1px solid rgba(201, 162, 39, 0.15);
          scroll-snap-align: start;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .timeline__step:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.14);
          border-color: rgba(201, 162, 39, 0.3);
        }

        .timeline__step:first-child {
          margin-left: 8px;
        }

        .timeline__step:last-child {
          margin-right: 8px;
        }

        .timeline__connector {
          position: absolute;
          right: -32px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 2px;
          background: linear-gradient(90deg, rgba(201, 162, 39, 0.4), rgba(201, 162, 39, 0.1));
        }

        .timeline__connector::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(201, 162, 39, 0.3);
        }

        .timeline__step-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .timeline__step-number {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%);
          border: 1px solid rgba(201, 162, 39, 0.35);
          flex-shrink: 0;
        }

        .timeline__step-number span {
          font-size: 1.375rem;
          font-weight: 800;
          color: #c9a227;
          letter-spacing: -0.02em;
          font-family: 'Playfair Display', serif;
        }

        .timeline__step-meta {
          padding-top: 4px;
        }

        .timeline__step-label {
          display: block;
          text-transform: uppercase;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          margin-bottom: 4px;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
        }

        .timeline__step-title {
          margin: 0;
          font-size: 1.375rem;
          color: #fff;
          font-weight: 600;
          line-height: 1.3;
          font-family: 'Playfair Display', serif;
        }

        .timeline__step-description {
          margin: 0 0 20px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.65;
          font-size: 0.875rem;
          flex-grow: 1;
          font-family: 'Manrope', sans-serif;
        }

        .timeline__step-points {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: auto;
        }

        .timeline__step-points li {
          padding-left: 18px;
          position: relative;
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        .timeline__step-points li::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a227;
          position: absolute;
          left: 0;
          top: 6px;
        }

        /* Scroll Fade Hints */
        .timeline__fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 48px;
          pointer-events: none;
          z-index: 2;
        }

        .timeline__fade--left {
          left: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, transparent 100%);
          opacity: 0;
        }

        .timeline__fade--right {
          right: 0;
          background: linear-gradient(-90deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%);
        }

        /* CTA Section */
        .cta {
          background: linear-gradient(135deg, #faf9f7 0%, #f5f3ef 100%);
          padding: 70px 5%;
          position: relative;
        }

        .cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(201, 162, 39, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(74, 55, 40, 0.015) 0%, transparent 50%);
          pointer-events: none;
        }

        .cta__container {
          max-width: 560px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cta__title {
          font-size: clamp(1.625rem, 3.5vw, 2.125rem);
          margin: 0 0 12px;
          color: #0a0a0a;
          font-weight: 600;
          line-height: 1.2;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }

        .cta__description {
          margin: 0 0 28px;
          color: #6b7280;
          line-height: 1.65;
          font-size: 0.9375rem;
          font-family: 'Manrope', sans-serif;
        }

        .cta__actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: stretch;
          margin-bottom: 20px;
        }

        .cta__trust {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.01em;
          font-family: 'Manrope', sans-serif;
        }

        /* Button Styles */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 10px;
          text-decoration: none;
          border: 2px solid transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          font-size: 0.875rem;
          font-family: 'Manrope', sans-serif;
        }

        .btn--large {
          padding: 14px 28px;
          font-size: 0.9375rem;
          min-height: 52px;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 50%, #c9a227 100%);
          background-size: 200% auto;
          color: #0a0a0a;
          box-shadow: 0 6px 20px rgba(201, 162, 39, 0.35);
          font-weight: 700;
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(201, 162, 39, 0.45);
          background-position: right center;
        }

        .btn--primary svg {
          transition: transform 0.25s ease;
        }

        .btn--primary:hover svg {
          transform: translateX(3px);
        }

        .btn--secondary {
          background: #ffffff;
          color: #0a0a0a;
          border: 1.5px solid rgba(0, 0, 0, 0.1);
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .btn--secondary:hover {
          transform: translateY(-2px);
          border-color: rgba(201, 162, 39, 0.4);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.25);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .timeline__step {
            min-width: 280px;
            flex: 0 0 280px;
            min-height: 320px;
          }

          .timeline__fade {
            width: 40px;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 110px 6% 70px;
          }

          .hero__eyebrow {
            padding: 5px 12px;
            font-size: 0.6875rem;
            margin-bottom: 20px;
          }

          .hero__title {
            font-size: clamp(1.875rem, 5vw, 2.5rem);
          }

          .hero__description {
            font-size: 0.9375rem;
          }

          .timeline {
            padding: 60px 6%;
          }

          .timeline__intro {
            margin-bottom: 32px;
          }

          .timeline__eyebrow {
            margin-bottom: 10px;
          }

          .timeline__hint {
            display: none;
          }

          .timeline__wrapper {
            margin: 0 -6%;
            padding: 0 6%;
          }

          .timeline__scroller {
            overflow-x: visible;
          }

          .timeline__track {
            flex-direction: column;
            gap: 16px;
          }

          .timeline__step {
            min-width: 100%;
            flex: 1;
            min-height: auto;
            padding: 24px;
          }

          .timeline__step:first-child,
          .timeline__step:last-child {
            margin: 0;
          }

          .timeline__connector {
            display: none;
          }

          .timeline__fade {
            display: none;
          }

          .timeline__step-number {
            width: 48px;
            height: 48px;
            border-radius: 12px;
          }

          .timeline__step-number span {
            font-size: 1.125rem;
          }

          .timeline__step-title {
            font-size: 1.125rem;
          }

          .cta {
            padding: 60px 6%;
          }

          .cta__actions {
            flex-direction: column;
            gap: 10px;
          }

          .btn--large {
            width: 100%;
            justify-content: center;
            min-height: 48px;
          }
        }

        @media (max-width: 480px) {
          .hero {
            padding: 100px 5% 60px;
          }

          .hero__title {
            font-size: clamp(1.75rem, 6.5vw, 2.25rem);
          }

          .timeline__step {
            padding: 20px;
          }

          .timeline__step-header {
            gap: 12px;
          }

          .timeline__step-number {
            width: 44px;
            height: 44px;
          }

          .timeline__step-number span {
            font-size: 1rem;
          }

          .timeline__step-description {
            font-size: 0.8125rem;
          }

          .cta {
            padding: 50px 5%;
          }
        }
      `}</style>
    </>
  )
}
