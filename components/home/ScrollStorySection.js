import { useEffect, useRef, useState } from 'react'

const stories = [
  {
    number: '01',
    title: 'The Problem with Traditional Real Estate',
    description: 'High capital requirements, illiquidity, lack of transparency, and complex paperwork have kept quality real estate investments out of reach for most investors. Traditional property ownership demands millions upfront and locks your capital for years.',
    highlights: ['PKR 50M+ minimum investment', 'Years of illiquidity', 'No professional management', 'Zero transparency'],
    visual: 'problem',
  },
  {
    number: '02',
    title: 'How REMMIC Unlocks Access & Liquidity',
    description: 'We fractionalize institutional-quality properties into affordable digital shares. Invest with as little as PKR 10,000, trade on our secondary market anytime, and enjoy passive rental income — all from your phone.',
    highlights: ['Start from PKR 10,000', 'Trade shares 24/7', 'Monthly rental yields', 'Instant diversification'],
    visual: 'solution',
  },
  {
    number: '03',
    title: 'Trust, Insurance & Professional Management',
    description: 'Every property is professionally evaluated, legally verified, and fully insured. Our asset managers handle everything — from tenant acquisition to maintenance — while you earn passive income backed by real, tangible assets.',
    highlights: ['SECP regulatory compliance', 'Full insurance coverage', 'Professional asset managers', 'Audited financials'],
    visual: 'trust',
  },
]

function StoryCard({ story, index, isVisible }) {
  const isEven = index % 2 === 0

  const visualIcons = {
    problem: (
      <svg className="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    solution: (
      <svg className="w-16 h-16 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    trust: (
      <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  }

  return (
    <div
      className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Text Content */}
      <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="text-5xl font-bold text-gold-500/20">{story.number}</span>
          <div className="w-12 h-px bg-gold-500/40" />
        </div>

        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {story.title}
        </h3>

        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          {story.description}
        </p>

        <ul className="space-y-3">
          {story.highlights.map((highlight, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-gray-700 font-medium">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual */}
      <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
        <div className="relative">
          <div className={`relative bg-gradient-to-br ${
            story.visual === 'problem'
              ? 'from-red-50 to-red-100/50 border-red-200/50'
              : story.visual === 'solution'
              ? 'from-gold-50 to-amber-50 border-gold-200/50'
              : 'from-green-50 to-emerald-50 border-green-200/50'
          } border rounded-3xl p-12 lg:p-16`}>
            <div className="flex items-center justify-center">
              <div className={`w-32 h-32 rounded-2xl flex items-center justify-center ${
                story.visual === 'problem'
                  ? 'bg-red-100'
                  : story.visual === 'solution'
                  ? 'bg-gold-100'
                  : 'bg-green-100'
              }`}>
                {visualIcons[story.visual]}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-gold-500/30" />
            <div className="absolute bottom-8 left-8 w-2 h-2 rounded-full bg-gold-500/20" />
          </div>

          {/* Floating accent */}
          <div className={`absolute -z-10 ${isEven ? '-right-4 -bottom-4' : '-left-4 -bottom-4'} w-full h-full bg-gold-500/5 rounded-3xl`} />
        </div>
      </div>
    </div>
  )
}

export default function ScrollStorySection() {
  const [visibleStories, setVisibleStories] = useState([])
  const storyRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index)
          if (entry.isIntersecting) {
            setVisibleStories((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.2, rootMargin: '-50px' }
    )

    storyRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-gradient-to-b from-stone-50 to-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-gold-500/10 rounded-full text-gold-600 text-sm font-semibold uppercase tracking-wider mb-4">
            Our Story
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Transforming Real Estate Investment
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From barriers to breakthroughs — discover how REMMIC is democratizing access to premium real estate.
          </p>
        </div>

        {/* Stories */}
        <div className="space-y-24 lg:space-y-32">
          {stories.map((story, index) => (
            <div
              key={index}
              ref={(el) => (storyRefs.current[index] = el)}
              data-index={index}
            >
              <StoryCard
                story={story}
                index={index}
                isVisible={visibleStories.includes(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
