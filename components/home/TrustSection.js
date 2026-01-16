const trustPillars = [
  {
    title: 'Insurance Partners',
    description: 'Every property is fully insured against damage, natural disasters, and tenant defaults through our tier-1 insurance partners.',
    badges: ['Property Insurance', 'Liability Coverage', 'Rental Guarantee'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Amanorx Group',
    description: 'Backed by Amanorx Group — a diversified holding company with deep expertise in real estate, technology, and financial services across emerging markets.',
    badges: ['Institutional Backing', 'PKR 500Cr+ AUM', 'Since 2018'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    featured: true,
  },
  {
    title: 'Global Expansion',
    description: 'A clear regulatory roadmap across multiple jurisdictions ensures compliance and opens access to international investment opportunities.',
    badges: ['Pakistan', 'UAE', 'Singapore', 'UK'],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const complianceBadges = [
  { label: 'SECP Regulated', icon: '🏛️' },
  { label: 'Audited Financials', icon: '📊' },
  { label: 'Fully Insured', icon: '🛡️' },
  { label: 'Legal Verified', icon: '⚖️' },
]

export default function TrustSection() {
  return (
    <section className="bg-gray-950 py-24 lg:py-32 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <span className="inline-block px-4 py-2 bg-gold-500/10 rounded-full text-gold-500 text-sm font-semibold uppercase tracking-wider mb-4">
            Why Trust Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Institutional-Grade Trust
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your investments are protected by industry-leading security measures, regulatory compliance, and institutional backing.
          </p>
        </div>

        {/* Compliance Badges Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {complianceBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-full"
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="text-white font-medium text-sm">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Trust Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {trustPillars.map((pillar, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 lg:p-10 transition-all duration-300 ${
                pillar.featured
                  ? 'bg-gradient-to-br from-gold-500/20 to-gold-500/5 border-2 border-gold-500/30 md:scale-105 z-10'
                  : 'bg-white/5 border border-white/10 hover:bg-white/[0.07] hover:border-white/20'
              }`}
            >
              {/* Featured badge */}
              {pillar.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1 bg-gold-500 text-gray-900 text-xs font-bold uppercase tracking-wider rounded-full">
                    Primary Backer
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                pillar.featured
                  ? 'bg-gold-500/20 text-gold-500'
                  : 'bg-white/10 text-white'
              }`}>
                {pillar.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-4">{pillar.title}</h3>

              {/* Description */}
              <p className="text-gray-400 leading-relaxed mb-6">
                {pillar.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {pillar.badges.map((badge, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      pillar.featured
                        ? 'bg-gold-500/20 text-gold-400'
                        : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gold-500 mb-2">100%</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Insured Assets</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">PKR 500Cr+</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Assets Under Mgmt</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">4</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Jurisdictions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-white mb-2">0</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Defaults</div>
          </div>
        </div>
      </div>
    </section>
  )
}
