import Link from 'next/link'

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Evaluate Assets',
    subtitle: 'Professional, Independent Valuation',
    description: 'Every property undergoes rigorous due diligence by certified professionals before listing.',
    bullets: [
      'Independent market valuations',
      'Legal title verification',
      'Physical inspection reports',
    ],
    color: 'emerald',
    href: '/how-it-works#evaluation',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Manage Assets',
    subtitle: 'Safeguarding, Upgrades & Construction',
    description: 'Our professional managers handle every aspect of property ownership so you can earn passively.',
    bullets: [
      'Tenant acquisition & management',
      'Maintenance & improvements',
      'Financial reporting & distributions',
    ],
    color: 'gold',
    featured: true,
    href: '/how-it-works#management',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Invest & Trade',
    subtitle: 'Fractional Ownership & Live Marketplace',
    description: 'Buy fractional shares of premium properties and trade them on our liquid secondary market.',
    bullets: [
      'Start from PKR 10,000',
      '24/7 secondary market',
      'Instant portfolio diversification',
    ],
    color: 'blue',
    href: '/marketplace',
  },
]

function FeatureCard({ feature, index }) {
  const colorClasses = {
    emerald: {
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      bulletIcon: 'text-emerald-500',
    },
    gold: {
      iconBg: 'bg-gold-100',
      iconColor: 'text-gold-600',
      bulletIcon: 'text-gold-500',
    },
    blue: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      bulletIcon: 'text-blue-500',
    },
  }

  const colors = colorClasses[feature.color]

  return (
    <div
      className={`group relative bg-white rounded-3xl p-8 lg:p-10 transition-all duration-300 hover:-translate-y-2 ${
        feature.featured
          ? 'shadow-xl border-2 border-gold-500/30 lg:scale-105 z-10'
          : 'shadow-lg border border-gray-100 hover:shadow-xl'
      }`}
    >
      {/* Featured badge */}
      {feature.featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-block px-4 py-1.5 bg-gold-500 text-gray-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {/* Icon */}
      <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-6 ${colors.iconColor}`}>
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-sm font-medium text-gold-600 uppercase tracking-wide mb-4">
        {feature.subtitle}
      </p>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed mb-6">
        {feature.description}
      </p>

      {/* Bullets */}
      <ul className="space-y-3 mb-8">
        {feature.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className={`w-5 h-5 ${colors.bulletIcon} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{bullet}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={feature.href}
        className={`inline-flex items-center gap-2 font-semibold transition-colors ${
          feature.featured ? 'text-gold-600 hover:text-gold-700' : 'text-gray-900 hover:text-gold-600'
        }`}
      >
        Learn more
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="bg-gray-950 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <span className="inline-block px-4 py-2 bg-gold-500/10 rounded-full text-gold-500 text-sm font-semibold uppercase tracking-wider mb-4">
            Platform
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            What REMMIC Does
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A complete ecosystem for institutional-grade real estate investment — from evaluation to exit.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
