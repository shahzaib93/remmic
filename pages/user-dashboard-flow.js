import Head from 'next/head'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const FLOW_SECTIONS = [
  {
    title: 'Dashboard overview',
    items: ['Portfolio value', 'Active investments', 'Yield', 'Alerts'],
  },
  {
    title: 'My investments',
    items: ['Asset-wise breakdown', 'Performance', 'Exit options'],
  },
  {
    title: 'Live bidding room',
    items: ['Real-time bids', 'Timers', 'Bid history'],
  },
  {
    title: 'Wallet & credits',
    items: ['Internal credits', 'Transaction history', 'Token readiness'],
  },
  {
    title: 'Reports & documents',
    items: ['Contracts', 'Insurance', 'Audit summaries'],
  },
]

export default function UserDashboardFlow() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Head>
        <title>User Dashboard UX Flow | REMMIC</title>
        <meta
          name="description"
          content="See how the REMMIC user dashboard guides investors through portfolio overview, investments, bidding, wallets, and reports."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="hero">
            <div className={`hero__content ${visible ? 'is-visible' : ''}`}>
              <p className="hero__eyebrow">UX Flow</p>
              <h1>User Dashboard</h1>
              <p>Every surface prioritizes transparency, liquidity and readiness for institutional-grade workflows.</p>
            </div>
          </section>

          <section className="flow">
            {FLOW_SECTIONS.map((section) => (
              <article key={section.title} className="flow-card">
                <h2>{section.title}</h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>

          <section className="statement">
            <p>
              REMMIC is building the global financial infrastructure for real assets — responsibly, transparently, and at
              institutional standards.
            </p>
          </section>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .hero {
          padding: 150px 5% 80px;
          background: linear-gradient(145deg, #040404, #0f0f0f);
          text-align: center;
          color: #fff;
        }

        .hero__content {
          max-width: 700px;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s ease;
        }

        .hero__content.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero__eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 14px;
        }

        .hero h1 {
          margin: 0 0 16px;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
        }

        .hero p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
        }

        .flow {
          padding: 80px 5% 100px;
          background: #fff;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .flow-card {
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 28px;
          background: #fafafa;
        }

        .flow-card h2 {
          margin: 0 0 12px;
          font-size: 1.3rem;
          text-transform: capitalize;
        }

        .flow-card ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .flow-card li {
          position: relative;
          padding-left: 16px;
          color: #111827;
        }

        .flow-card li::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9a227;
          position: absolute;
          left: 0;
          top: 10px;
        }

        .statement {
          padding: 40px 5% 80px;
          background: #fff7e6;
          text-align: center;
          font-weight: 600;
          color: #92400e;
        }
      `}</style>
    </>
  )
}
