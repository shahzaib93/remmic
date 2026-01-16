'use client'

import ScrollStack, { ScrollStackItem } from './ScrollStack'

const cards = [
  {
    step: '01',
    badge: 'EVALUATE',
    title: 'Evaluate Assets',
    subtitle: 'Data-Driven Property Analysis',
    desc: 'Make informed decisions with comprehensive property valuations, market analysis, and risk assessments powered by institutional-grade data.',
    features: [
      { icon: 'chart', text: 'Market valuation reports' },
      { icon: 'shield', text: 'Risk & return metrics' },
      { icon: 'trending', text: 'Asset performance insights' },
      { icon: 'check', text: 'Verified ownership history' },
    ],
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    cta: { text: 'Explore Properties', href: '/marketplace' },
    accent: 'from-amber-500 to-orange-600',
  },
  {
    step: '02',
    badge: 'MANAGE',
    title: 'Manage Portfolio',
    subtitle: 'Complete Control & Visibility',
    desc: 'Monitor your investments in real-time with an intuitive dashboard. Track rental yields, property lifecycle, and access all documents securely.',
    features: [
      { icon: 'dashboard', text: 'Real-time portfolio dashboard' },
      { icon: 'wallet', text: 'Rental income tracking' },
      { icon: 'clock', text: 'Property lifecycle insights' },
      { icon: 'lock', text: 'Secure documents vault' },
    ],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    cta: { text: 'View Dashboard', href: '/dashboard' },
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    step: '03',
    badge: 'INVEST',
    title: 'Invest & Trade',
    subtitle: 'Fractional Ownership Made Easy',
    desc: 'Own premium real estate starting from PKR 100,000. Participate in live auctions, earn monthly yields, and trade your shares anytime.',
    features: [
      { icon: 'grid', text: 'Fractional ownership access' },
      { icon: 'zap', text: 'Live auction participation' },
      { icon: 'shield', text: 'Secure transactions' },
      { icon: 'refresh', text: 'Exit opportunities anytime' },
    ],
    image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80',
    cta: { text: 'Start Investing', href: '/investment-shares' },
    accent: 'from-violet-500 to-purple-600',
  },
]

// Icon Component
function FeatureIcon({ name }) {
  const icons = {
    chart: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    shield: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    trending: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 6l-9.5 9.5-5-5L1 18"/>
        <path d="M17 6h6v6"/>
      </svg>
    ),
    check: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="M22 4 12 14.01l-3-3"/>
      </svg>
    ),
    dashboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9"/>
        <rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/>
        <rect x="3" y="16" width="7" height="5"/>
      </svg>
    ),
    wallet: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
      </svg>
    ),
    clock: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    lock: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    grid: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    zap: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    refresh: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 4v6h-6"/>
        <path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    ),
  }
  return icons[name] || null
}

// Premium Card Content Component
function CardContent({ step, badge, title, subtitle, desc, features, image, cta, accent }) {
  return (
    <div className="card-content">
      {/* Background Glow */}
      <div className={`card-glow bg-gradient-to-br ${accent}`} />

      <div className="card-inner">
        {/* Left: Content */}
        <div className="card-text">
          {/* Step Number */}
          <div className="card-step">
            <span className="card-step-number">{step}</span>
            <span className="card-step-line" />
          </div>

          {/* Badge */}
          <div className={`card-badge bg-gradient-to-r ${accent}`}>
            <span className="card-badge-dot" />
            {badge}
          </div>

          {/* Title */}
          <h3 className="card-title">{title}</h3>

          {/* Subtitle */}
          <p className="card-subtitle">{subtitle}</p>

          {/* Description */}
          <p className="card-desc">{desc}</p>

          {/* Features Grid */}
          <div className="card-features">
            {features.map((feature, i) => (
              <div key={i} className="card-feature">
                <div className={`card-feature-icon bg-gradient-to-br ${accent}`}>
                  <FeatureIcon name={feature.icon} />
                </div>
                <span className="card-feature-text">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a href={cta.href} className={`card-cta bg-gradient-to-r ${accent}`}>
            <span>{cta.text}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Right: Image */}
        <div className="card-visual">
          <div className="card-image-wrapper">
            {/* Image */}
            <img src={image} alt={title} className="card-image" loading="lazy" />

            {/* Overlay Gradient */}
            <div className={`card-image-overlay bg-gradient-to-t ${accent}`} />

            {/* Stats Floating Card */}
            <div className="card-floating-stats">
              <div className="card-floating-stat">
                <span className="card-floating-value">12.5%</span>
                <span className="card-floating-label">Avg ROI</span>
              </div>
              <div className="card-floating-divider" />
              <div className="card-floating-stat">
                <span className="card-floating-value">150+</span>
                <span className="card-floating-label">Properties</span>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className={`card-decoration card-decoration--1 bg-gradient-to-br ${accent}`} />
          <div className={`card-decoration card-decoration--2 bg-gradient-to-br ${accent}`} />
        </div>
      </div>

      <style jsx>{`
        .card-content {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0;
        }

        .card-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          opacity: 0.08;
          filter: blur(80px);
          border-radius: 50%;
          pointer-events: none;
        }

        .card-inner {
          position: relative;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 48px;
          align-items: center;
          height: 100%;
          z-index: 1;
        }

        /* Step Number */
        .card-step {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .card-step-number {
          font-size: 0.875rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.3);
          font-family: monospace;
        }

        .card-step-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%);
          max-width: 60px;
        }

        /* Badge */
        .card-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: white;
          margin-bottom: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .card-badge-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }

        /* Title */
        .card-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          color: white;
          margin: 0 0 8px;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .card-subtitle {
          font-size: 1rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 16px;
        }

        /* Description */
        .card-desc {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin: 0 0 24px;
          max-width: 420px;
        }

        /* Features */
        .card-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
        }

        .card-feature {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-feature-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          color: white;
          flex-shrink: 0;
        }

        .card-feature-text {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.4;
        }

        /* CTA */
        .card-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .card-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }

        /* Visual */
        .card-visual {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
        }

        .card-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          opacity: 0.6;
          pointer-events: none;
        }

        /* Floating Stats */
        .card-floating-stats {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 14px 20px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-floating-stat {
          text-align: center;
        }

        .card-floating-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
        }

        .card-floating-label {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-floating-divider {
          width: 1px;
          height: 32px;
          background: rgba(255, 255, 255, 0.15);
        }

        /* Decorations */
        .card-decoration {
          position: absolute;
          border-radius: 12px;
          opacity: 0.15;
        }

        .card-decoration--1 {
          top: -20px;
          right: 30px;
          width: 60px;
          height: 60px;
          transform: rotate(15deg);
        }

        .card-decoration--2 {
          bottom: 20px;
          right: -20px;
          width: 40px;
          height: 40px;
          transform: rotate(-10deg);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .card-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .card-visual {
            order: -1;
            max-width: 400px;
            margin: 0 auto;
          }

          .card-features {
            grid-template-columns: 1fr;
          }

          .card-desc {
            max-width: 100%;
          }

          .card-glow {
            top: -50px;
            right: -50px;
            width: 250px;
            height: 250px;
          }
        }

        @media (max-width: 768px) {
          .card-title {
            font-size: 1.5rem;
          }

          .card-subtitle {
            font-size: 0.875rem;
          }

          .card-desc {
            font-size: 0.875rem;
          }

          .card-features {
            gap: 10px;
          }

          .card-feature-icon {
            width: 32px;
            height: 32px;
          }

          .card-feature-text {
            font-size: 0.75rem;
          }

          .card-cta {
            width: 100%;
            justify-content: center;
            padding: 12px 24px;
          }

          .card-floating-stats {
            padding: 12px 16px;
            gap: 16px;
          }

          .card-floating-value {
            font-size: 1rem;
          }

          .card-decoration {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .card-step {
            margin-bottom: 12px;
          }

          .card-badge {
            padding: 6px 12px;
            font-size: 0.625rem;
          }

          .card-title {
            font-size: 1.25rem;
          }

          .card-feature {
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}

export default function HomeScrollStackSection() {
  return (
    <div className="stack-container">
      <ScrollStack
        useWindowScroll={true}
        lockScrollUntilComplete={true}
        itemDistance={120}
        itemStackDistance={30}
        itemScale={0.035}
        baseScale={0.86}
        scaleDuration={0.35}
        scrollSensitivity={0.003}
        onStackComplete={() => console.log('Stack complete!')}
        onStepChange={(step) => console.log('Step:', step)}
      >
        {cards.map((card) => (
          <ScrollStackItem key={card.badge}>
            <CardContent {...card} />
          </ScrollStackItem>
        ))}
      </ScrollStack>

      <style jsx>{`
        .stack-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        @media (max-width: 768px) {
          .stack-container {
            padding: 0 12px;
          }
        }
      `}</style>
    </div>
  )
}
