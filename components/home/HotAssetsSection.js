import Link from 'next/link'
import { useRef } from 'react'

const hotAssets = [
  {
    id: 1,
    title: 'DHA Phase 6 Villa',
    location: 'Lahore, Punjab',
    roi: '15.2%',
    risk: 'Low',
    minInvestment: 'PKR 25K',
    funded: 68,
    image: null,
  },
  {
    id: 2,
    title: 'Bahria Town Apartment',
    location: 'Islamabad',
    roi: '18.5%',
    risk: 'Medium',
    minInvestment: 'PKR 10K',
    funded: 82,
    image: null,
  },
  {
    id: 3,
    title: 'Clifton Block 5 Plot',
    location: 'Karachi, Sindh',
    roi: '12.8%',
    risk: 'Low',
    minInvestment: 'PKR 50K',
    funded: 45,
    image: null,
  },
  {
    id: 4,
    title: 'Gulberg III Commercial',
    location: 'Lahore, Punjab',
    roi: '22.0%',
    risk: 'High',
    minInvestment: 'PKR 100K',
    funded: 91,
    image: null,
  },
  {
    id: 5,
    title: 'F-7 Markaz Shop',
    location: 'Islamabad',
    roi: '16.5%',
    risk: 'Medium',
    minInvestment: 'PKR 75K',
    funded: 55,
    image: null,
  },
]

function AssetCard({ asset }) {
  const riskColors = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-red-100 text-red-700',
  }

  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-gray-300/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-gold-500 text-gray-900 text-xs font-bold rounded-full">
            {asset.roi} ROI
          </span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${riskColors[asset.risk]}`}>
            {asset.risk} Risk
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{asset.title}</h3>
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {asset.location}
        </p>

        {/* Min Investment */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Min Investment</span>
          <span className="text-lg font-bold text-gray-900">{asset.minInvestment}</span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">Funded</span>
            <span className="font-semibold text-gray-900">{asset.funded}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500"
              style={{ width: `${asset.funded}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/marketplace/${asset.id}`}
          className="block w-full py-2.5 text-center bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default function HotAssetsSection() {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="bg-stone-50 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block px-4 py-2 bg-gold-500/10 rounded-full text-gold-600 text-sm font-semibold uppercase tracking-wider mb-4">
              Live Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Hot Assets
            </h2>
            <p className="text-lg text-gray-600 max-w-xl">
              Trending properties with strong fundamentals and proven returns.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrolling Cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        >
          {hotAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/marketplace" className="btn-gold btn-lg">
            View All Properties
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
