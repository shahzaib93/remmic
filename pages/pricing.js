import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for independent landlords or small portfolios getting started with REMMIC.',
    price: 'PKR 15,000',
    cadence: 'per month',
    badge: 'Most Popular',
    features: [
      'Manage up to 15 units',
      'Digital property files',
      'Standard analytics dashboard',
      'Tenant & owner messaging',
      'Email support'
    ]
  },
  {
    name: 'Growth',
    description: 'Advanced automation for professional managers overseeing multiple projects.',
    price: 'PKR 45,000',
    cadence: 'per month',
    highlighted: true,
    features: [
      'Unlimited properties',
      'Automated rent collection',
      'Smart workflows & reminders',
      'Advanced analytics & exports',
      'Priority support'
    ]
  },
  {
    name: 'Enterprise',
    description: 'Tailored infrastructure, SSO, and service-level commitments for institutions.',
    price: 'Custom pricing',
    cadence: 'annual contracts',
    features: [
      'Dedicated account architect',
      'Custom integrations & API',
      'Compliance & audit reporting',
      'Premium onboarding for teams',
      '24/7 success desk'
    ]
  }
]

const comparison = [
  {
    label: 'Smart automation workflows',
    starter: true,
    growth: true,
    enterprise: true
  },
  {
    label: 'Investment marketplace access',
    starter: false,
    growth: true,
    enterprise: true
  },
  {
    label: 'Dedicated success manager',
    starter: false,
    growth: false,
    enterprise: true
  },
  {
    label: 'Custom reporting & data rooms',
    starter: false,
    growth: true,
    enterprise: true
  }
]

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing - REMMIC</title>
        <meta
          name="description"
          content="Transparent pricing for REMMIC's property evaluation, management, and investment platform."
        />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="pricing-page">
          <section className="pricing-hero">
            <div className="pricing-hero__eyebrow">Pricing</div>
            <h1>Affordable plans for serious operators</h1>
            <p>
              Scale your real estate business with institutional-grade tooling — from asset onboarding to investor reporting.
            </p>
            <div className="pricing-hero__cta">
              <a className="btn btn--primary" href="/contact">Talk to an expert</a>
              <a className="btn btn--ghost" href="/silver-founders">Become a Silver Founder</a>
            </div>
          </section>

          <section className="pricing-grid">
            {plans.map((plan) => (
              <article
                className={`pricing-card ${plan.highlighted ? 'pricing-card--highlighted' : ''}`}
                key={plan.name}
              >
                <div className="pricing-card__body">
                  <div className="pricing-card__header">
                    <div className="pricing-card__name">{plan.name}</div>
                    {plan.badge && <span className="pricing-card__badge">{plan.badge}</span>}
                  </div>
                  <p className="pricing-card__description">{plan.description}</p>
                  <div className="pricing-card__price">
                    <span>{plan.price}</span>
                    <small>{plan.cadence}</small>
                  </div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M5 13l4 4L19 7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pricing-card__footer">
                  <a className="btn btn--full" href="/contact">
                    {plan.name === 'Enterprise' ? 'Request proposal' : 'Start free trial'}
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="pricing-comparison">
            <div>
              <p className="pricing-comparison__eyebrow">Capability matrix</p>
              <h2>Choose the level of support your team needs</h2>
            </div>
            <div className="comparison-table">
              <div className="comparison-table__header">
                <span>Capabilities</span>
                <span>Starter</span>
                <span>Growth</span>
                <span>Enterprise</span>
              </div>
              {comparison.map((row) => (
                <div className="comparison-table__row" key={row.label}>
                  <span>{row.label}</span>
                  {[row.starter, row.growth, row.enterprise].map((value, index) => (
                    <span key={index}>
                      {value ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M5 13l4 4L19 7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M6 6l12 12M6 18L18 6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .pricing-page {
          padding-top: 72px;
        }

        .pricing-hero {
          max-width: 960px;
          margin: 0 auto;
          padding: 80px 5% 40px;
          text-align: center;
        }

        .pricing-hero__eyebrow {
          display: inline-flex;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #c9a227;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          margin-bottom: 24px;
        }

        .pricing-hero h1 {
          font-size: clamp(2.5rem, 6vw, 3.5rem);
          margin-bottom: 16px;
          color: #0f172a;
        }

        .pricing-hero p {
          font-size: 1.1rem;
          color: #475467;
          margin: 0 auto 32px;
          max-width: 620px;
        }

        .pricing-hero__cta {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          padding: 0 5% 80px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pricing-card {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          background: #fff;
          box-shadow: 0 25px 45px -30px rgba(15, 23, 42, 0.2);
          position: relative;
        }

        .pricing-card--highlighted {
          border-color: rgba(201, 162, 39, 0.35);
          background: linear-gradient(135deg, #0c0c0c, #1c1b18);
          color: #fff;
        }

        .pricing-card__body {
          flex: 1;
        }

        .pricing-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .pricing-card__name {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .pricing-card__badge {
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
        }

        .pricing-card--highlighted .pricing-card__badge {
          background: rgba(255, 255, 255, 0.14);
          color: #fffbe6;
        }

        .pricing-card__description {
          color: inherit;
          opacity: 0.85;
          margin-bottom: 24px;
        }

        .pricing-card__price span {
          font-size: 2.5rem;
          font-weight: 700;
        }

        .pricing-card__price small {
          display: block;
          color: inherit;
          opacity: 0.75;
        }

        .pricing-card ul {
          list-style: none;
          padding: 0;
          margin: 24px 0 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pricing-card li {
          display: flex;
          align-items: center;
          gap: 10px;
          color: inherit;
        }

        .pricing-card li svg {
          color: #c9a227;
        }

        .pricing-card--highlighted li svg {
          color: #ffe598;
        }

        .pricing-card__footer {
          margin-top: 32px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 22px;
          border-radius: 999px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -18px rgba(15, 23, 42, 0.4);
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          border: none;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
        }

        .btn--ghost {
          color: #0f172a;
          border: 1px solid rgba(15, 23, 42, 0.2);
          background: transparent;
        }

        .btn--full {
          width: 100%;
          border-radius: 12px;
          background: #0f172a;
          color: #fff;
        }

        .pricing-card--highlighted .btn--full {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
        }

        .pricing-comparison {
          max-width: 1100px;
          margin: 0 auto 120px;
          padding: 0 5%;
        }

        .pricing-comparison__eyebrow {
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #c9a227;
          margin-bottom: 12px;
        }

        .pricing-comparison h2 {
          font-size: clamp(2rem, 4vw, 2.5rem);
          color: #0f172a;
          margin-bottom: 32px;
        }

        .comparison-table {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          overflow: hidden;
          background: #fff;
        }

        .comparison-table__header,
        .comparison-table__row {
          display: grid;
          grid-template-columns: 2fr repeat(3, 1fr);
          padding: 18px 24px;
          align-items: center;
        }

        .comparison-table__header {
          background: #0f172a;
          color: #fff;
          font-weight: 600;
        }

        .comparison-table__row:nth-child(odd) {
          background: rgba(249, 250, 251, 0.8);
        }

        .comparison-table__row span:last-child,
        .comparison-table__row span:nth-child(3),
        .comparison-table__row span:nth-child(2) {
          text-align: center;
        }

        .comparison-table__row svg {
          color: #0f172a;
        }

        @media (max-width: 720px) {
          .comparison-table__header,
          .comparison-table__row {
            grid-template-columns: 1fr 80px 80px 90px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  )
}
