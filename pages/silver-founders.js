import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

const BENEFITS = [
  'International branding & exposure',
  'Global real estate & investment access',
  'Qatar Gold Investment opportunity',
  'Amanorx personalized investment token',
  'Insurance-backed buyback guarantee (17 Hills Apartment Project)',
]

export default function SilverFounders() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>Silver Founders | REMMIC</title>
        <meta
          name="description"
          content="Limited Silver Founders membership: 100 strategic members, PKR 2.5 Crore contribution, premium global benefits."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__content ${visible ? 'is-visible' : ''}`}>
              <p className="hero__eyebrow">Silver Founders</p>
              <h1>Limited to 100 strategic members.</h1>
              <p>
                REMMIC’s Silver Founders circle is capped at 100 strategic investors who co-design cross-border real
                estate and capital market plays with us.
              </p>
            </div>
          </section>

          <section className="details">
            <article className="card">
              <h2>Contribution</h2>
              <p className="contribution">PKR 2.5 Crore</p>
              <p className="detail-note">Strategic, refundable / convertible based on mandate.</p>
            </article>

            <article className="card">
              <h2>Benefits</h2>
              <ul>
                {BENEFITS.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="disclaimer">
            <p>No guaranteed returns. Participation subject to REMMIC compliance and approval.</p>
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

        /* Details Section */
        .details {
          padding: 72px 5% 100px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Card Styling */
        .card {
          border: 1px solid #e8e8e6;
          border-radius: 24px;
          padding: 36px 32px;
          background: #ffffff;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #c9a227 0%, #d4b13d 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .card:hover {
          border-color: rgba(201, 162, 39, 0.35);
          box-shadow: 0 12px 40px rgba(201, 162, 39, 0.1);
          transform: translateY(-4px);
        }

        .card:hover::before {
          opacity: 1;
        }

        .card h2 {
          margin: 0 0 20px;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.01em;
        }

        .contribution {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 12px;
          color: #c9a227;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }

        .detail-note {
          color: #5f6368;
          font-size: 0.9375rem;
          line-height: 1.6;
          font-family: 'Manrope', sans-serif;
          margin: 0;
        }

        .card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card li {
          position: relative;
          padding-left: 28px;
          color: #1a1a1a;
          font-size: 0.9375rem;
          font-weight: 500;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        .card li::before {
          content: '';
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a227 0%, #b8922a 100%);
          position: absolute;
          left: 0;
          top: 6px;
          box-shadow: 0 2px 6px rgba(201, 162, 39, 0.3);
        }

        /* Disclaimer Section */
        .disclaimer {
          padding: 28px 5%;
          background: linear-gradient(135deg, rgba(180, 83, 9, 0.06) 0%, rgba(180, 83, 9, 0.03) 100%);
          border-top: 1px solid rgba(180, 83, 9, 0.12);
          text-align: center;
        }

        .disclaimer p {
          margin: 0;
          color: #78350f;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.5;
          font-family: 'Manrope', sans-serif;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .details {
            grid-template-columns: 1fr;
            max-width: 520px;
            padding: 56px 5% 80px;
            gap: 24px;
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

          .details {
            padding: 48px 5% 72px;
          }

          .card {
            padding: 28px 24px;
            border-radius: 20px;
          }

          .contribution {
            font-size: 2rem;
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

          .card {
            padding: 24px 20px;
            border-radius: 18px;
          }

          .card h2 {
            font-size: 1.125rem;
          }

          .contribution {
            font-size: 1.75rem;
          }

          .card li {
            font-size: 0.875rem;
            padding-left: 24px;
          }

          .card li::before {
            width: 8px;
            height: 8px;
            top: 5px;
          }

          .disclaimer {
            padding: 24px 5%;
          }

          .disclaimer p {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </>
  )
}
