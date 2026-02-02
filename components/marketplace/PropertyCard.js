import { useState } from 'react'
import { formatPrice } from '../../data/mockProperties'
import BiddingModal from './BiddingModal'

export default function PropertyCard({ property, viewMode = 'grid' }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showBiddingModal, setShowBiddingModal] = useState(false)

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const handleBidNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowBiddingModal(true)
  }

  const getBadgeColor = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'featured':
        return 'bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white shadow-lg'
      case 'auction':
        return 'bg-gradient-to-r from-[#d4b13d] to-[#c9a227] text-white shadow-lg'
      case 'new':
        return 'bg-gradient-to-r from-[#b8922a] to-[#a67c00] text-white shadow-lg'
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={property.image}
              alt={property.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10"
            >
              <svg
                className={`w-5 h-5 transition-colors ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill={isFavorite ? 'currentColor' : 'none'}
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            {/* Badge */}
            {property.badge && (
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(property.badge)}`}>
                {property.badge}
              </span>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a] mb-2">
                {formatPrice(property.price)}
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                {property.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {property.address}, {property.city}
              </p>

              {/* Meta Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                {property.beds > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a227]/10 rounded-full text-sm text-[#8b6914]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {property.beds} Beds
                  </span>
                )}
                {property.baths > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a227]/10 rounded-full text-sm text-[#8b6914]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {property.baths} Baths
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c9a227]/10 rounded-full text-sm text-[#8b6914]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  {property.area}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleBidNow}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white rounded-xl font-medium shadow-md hover:from-[#b8922a] hover:to-[#a67c00] transition-all"
              >
                Bid Now
              </button>
              <a
                href={`/bidding-detail?id=${property.id}`}
                className="px-4 py-2.5 border border-[#c9a227]/30 text-[#c9a227] rounded-xl font-medium hover:bg-[#fff9ed] transition-colors"
              >
                Details
              </a>
            </div>
          </div>
        </div>

        {/* Bidding Modal */}
        <BiddingModal 
          property={property}
          isOpen={showBiddingModal}
          onClose={() => setShowBiddingModal(false)}
        />
      </div>
    )
  }

  // Grid View
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={property.image}
            alt={property.title}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
          >
            <svg
              className={`w-5 h-5 transition-colors ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill={isFavorite ? 'currentColor' : 'none'}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          {/* Badge */}
          {property.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(property.badge)}`}>
              {property.badge}
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xl font-bold text-[#1a1a1a] mb-1">
            {formatPrice(property.price)}
          </p>
          <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-1">
            {property.address}, {property.city}
          </p>

          {/* Meta Row */}
          <div className="flex flex-wrap gap-2 mb-4 mt-auto">
            {property.beds > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#c9a227]/10 rounded-full text-xs text-[#8b6914]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {property.beds} Beds
              </span>
            )}
            {property.baths > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#c9a227]/10 rounded-full text-xs text-[#8b6914]">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {property.baths} Baths
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {property.area}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleBidNow}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-[#c9a227] via-[#b8922a] to-[#a67c00] text-white rounded-xl text-sm font-semibold shadow-md text-center hover:from-[#b8922a] hover:via-[#a67c00] hover:to-[#8b6914] transition-all border border-[#c9a227]/40"
            >
              Bid Now
            </button>
            <a
              href={`/bidding-detail?id=${property.id}`}
              className="px-3 py-2 rounded-xl text-sm font-medium text-[#c9a227] text-center border border-[#c9a227]/30 hover:bg-[#fff9ed]"
            >
              Details
            </a>
          </div>
        </div>
      </div>

      {/* Bidding Modal */}
      <BiddingModal 
        property={property}
        isOpen={showBiddingModal}
        onClose={() => setShowBiddingModal(false)}
      />
    </div>
  )
}

// Skeleton Card for loading state
export function PropertyCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-72 h-48 md:h-auto bg-gray-200 animate-pulse" />
          <div className="flex-1 p-5">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-10 bg-gray-200 rounded-xl animate-pulse" />
              <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="h-6 w-28 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-7 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-7 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl animate-pulse" />
          <div className="w-20 h-9 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
