import Head from 'next/head'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MODELS = [
  {
    title: 'Direct Investment',
    subtitle: 'Choose and invest in a specific asset',
    description:
      'Pick a verified property, review its ROI, risk and ownership stack, and deploy capital instantly from your REMMIC wallet.',
    bullets: ['Asset-level selection', 'Full control over exit timing', 'Ideal for active investors'],
    cta: { label: 'Browse assets', href: '/marketplace' },
  },
  {
    title: 'REMMIC Managed Investment',
    subtitle: 'Passive model with target ROI and full risk disclosure',
    description:
      'Hand portfolios to REMMIC managers who balance yield and risk, publish quarterly reports, and keep you aligned with target returns.',
    bullets: ['Target ROI with variance bands', 'Risk disclosures + audits', 'Managed rebalancing'],
    cta: { label: 'Talk to REMMIC', href: '/contact' },
    highlight: true,
  },
  {
    title: 'Fractional Ownership',
    subtitle: 'Low-entry access to premium real assets',
    description:
      'Buy compliant fractions of trophy assets with legal protection, escrowed distributions, and liquidity pathways via the REMMIC marketplace.',
    bullets: ['Entry tickets from PKR 100K', 'Fully compliant SPVs', 'Secondary liquidity roadmap'],
    cta: { label: 'See fractions', href: '/marketplace' },
  },
]

export default function InvestmentModels() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>Investment Models | REMMIC</title>
        <meta
          name="description"
          content="Compare REMMIC investment models: direct asset investment, REMMIC-managed portfolios, and fractional ownership."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__content ${visible ? 'is-visible' : ''}`}>
              <p className="hero__eyebrow">Investment Models</p>
              <h1>Pick the path that matches your strategy.</h1>
              <p>
                All models sit on REMMIC’s verified asset stack. Choose hands-on direct investments, go passive with
                managed portfolios, or enter via fractional ownership.
              </p>
            </div>
          </section>

          <section className="models">
            <div className="models__grid">
              {MODELS.map((model) => (
                <article key={model.title} className={`model-card ${model.highlight ? 'model-card--highlight' : ''}`}>
                  <header>
                    <h2>{model.title}</h2>
                    <p>{model.subtitle}</p>
                  </header>
                  <p className="model-card__description">{model.description}</p>
                  <ul>
                    {model.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <a className="model-card__cta" href={model.cta.href}>
                    {model.cta.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </a>
                </article>
              ))}
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

        .hero p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          font-size: 1.0625rem;
          max-width: 520px;
          margin: 0 auto;
          font-family: 'Manrope', sans-serif;
        }

        /* Models Section */
        .models {
          padding: 64px 5% 100px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
        }

        .models__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1180px;
          margin: 0 auto;
        }

        /* Model Cards */
        .model-card {
          border: 1px solid #e8e8e6;
          border-radius: 20px;
          padding: 32px 28px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: relative;
        }

        .model-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c9a227 0%, #b8922a 100%);
          border-radius: 20px 20px 0 0;
          opacity: 0;
        }

        /* Highlighted Card (Managed Investment) */
        .model-card--highlight {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.08) 0%, rgba(255, 250, 240, 1) 100%);
          border-color: rgba(201, 162, 39, 0.35);
          box-shadow: 0 12px 40px rgba(201, 162, 39, 0.12);
        }

        .model-card--highlight::before {
          opacity: 0;
        }

        .model-card--highlight::after {
          content: 'RECOMMENDED';
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 5px 12px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 100px;
          letter-spacing: 0.06em;
          font-family: 'Manrope', sans-serif;
          box-shadow: 0 2px 8px rgba(201, 162, 39, 0.3);
        }

        .model-card header {
          padding-right: 90px;
        }

        .model-card header h2 {
          margin: 0;
          font-size: 1.3125rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
          font-family: 'Manrope', sans-serif;
        }

        .model-card header p {
          margin: 8px 0 0;
          color: #5f6368;
          font-size: 0.9375rem;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        .model-card__description {
          margin: 0;
          color: #3d3d3d;
          line-height: 1.65;
          font-size: 0.9375rem;
          font-family: 'Manrope', sans-serif;
        }

        .model-card ul {
          list-style: none;
          margin: 0;
          padding: 16px 0;
          border-top: 1px solid #f0f0ee;
          border-bottom: 1px solid #f0f0ee;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .model-card li {
          padding-left: 24px;
          position: relative;
          color: #1a1a1a;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        .model-card li::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a227 0%, #b8922a 100%);
          position: absolute;
          left: 0;
          top: 6px;
          box-shadow: 0 1px 3px rgba(201, 162, 39, 0.3);
        }

        .model-card__cta {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: #0a0a0a;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          border-radius: 12px;
          font-family: 'Manrope', sans-serif;
        }

        .model-card--highlight .model-card__cta {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 16px rgba(201, 162, 39, 0.3);
        }

        /* Risk Disclaimer */
        .models__disclaimer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 48px;
          padding: 16px 24px;
          text-align: center;
          color: #78350f;
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.5;
          background: rgba(180, 83, 9, 0.06);
          border: 1px solid rgba(180, 83, 9, 0.12);
          border-radius: 12px;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
          font-family: 'Manrope', sans-serif;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .models__grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .model-card {
            padding: 28px 24px;
          }

          .model-card header {
            padding-right: 0;
          }

          .model-card--highlight::after {
            position: static;
            display: inline-block;
            margin-bottom: 8px;
          }
        }

        @media (max-width: 900px) {
          .models__grid {
            grid-template-columns: 1fr;
            max-width: 520px;
            gap: 20px;
          }

          .model-card--highlight {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 100px 6% 48px;
          }

          .hero h1 {
            font-size: clamp(1.75rem, 6vw, 2.5rem);
          }

          .hero p {
            font-size: 1rem;
          }

          .models {
            padding: 48px 5% 80px;
          }

          .model-card {
            padding: 26px 22px;
            border-radius: 16px;
          }

          .model-card header h2 {
            font-size: 1.1875rem;
          }

          .model-card__cta {
            width: 100%;
            justify-content: center;
          }

          .models__disclaimer {
            padding: 14px 18px;
            font-size: 0.75rem;
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

          .model-card {
            padding: 22px 18px;
            gap: 14px;
          }

          .model-card header h2 {
            font-size: 1.125rem;
          }

          .model-card li {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </>
  )
}
