import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  const stats = [
    { value: '150+', label: 'Properties' },
    { value: 'PKR 10K', label: 'Minimum' },
    { value: '12-18%', label: 'ROI' },
    { value: '24/7', label: 'Liquidity' },
  ]

  return (
    <section className="relative bg-gray-950 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/5 to-transparent" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-gold-500 text-sm font-medium">Institutional-Grade Real Estate</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Real Assets.{' '}
              <span className="text-gold-500">Real Ownership.</span>{' '}
              Real Liquidity.
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
              A secure platform to evaluate, manage, invest, and trade real-world assets through fractional ownership and institutional-grade governance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/marketplace" className="btn-gold btn-lg">
                Explore Marketplace
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/silver-founders" className="btn-outline-dark btn-lg border-gray-700 text-white hover:bg-white hover:text-gray-900">
                Become a Silver Founder
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-800">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Property Card Mock */}
          <div className="relative lg:pl-8">
            {/* Main Property Card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
              {/* Property Image */}
              <div className="relative h-64 sm:h-80 bg-gradient-to-br from-gray-800 to-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Premium Property</p>
                  </div>
                </div>

                {/* Badges on image */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-green-500/90 text-white text-xs font-semibold rounded-full">
                    Live
                  </span>
                  <span className="px-3 py-1.5 bg-gold-500/90 text-gray-900 text-xs font-semibold rounded-full">
                    Featured
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">DHA Phase 6 Villa</h3>
                <p className="text-gray-400 text-sm mb-4">Lahore, Punjab</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-gold-500 text-lg font-bold">15.2%</div>
                    <div className="text-gray-500 text-xs">Expected ROI</div>
                  </div>
                  <div>
                    <div className="text-white text-lg font-bold">PKR 25K</div>
                    <div className="text-gray-500 text-xs">Min Investment</div>
                  </div>
                  <div>
                    <div className="text-green-400 text-lg font-bold">Low</div>
                    <div className="text-gray-500 text-xs">Risk Level</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Funded</span>
                    <span className="text-white font-medium">68%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-[68%] bg-gradient-to-r from-gold-500 to-gold-400 rounded-full" />
                  </div>
                </div>

                <button className="w-full py-3 bg-gold-500/10 border border-gold-500/30 rounded-xl text-gold-500 font-semibold hover:bg-gold-500 hover:text-gray-900 transition-all">
                  View Details
                </button>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
