import { useState } from 'react'

export default function PropertyMapPanel({
  coordinates = { lat: 31.4826, lng: 74.3239 },
  address = '',
  onShare,
  onPrint,
  onSave,
  isSaved = false
}) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const lat = Number(coordinates?.lat)
  const lng = Number(coordinates?.lng)
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng)
  const mapQuery = hasCoordinates ? `${lat},${lng}` : encodeURIComponent(address || 'Pakistan')

  const handleShare = () => {
    if (onShare) {
      onShare()
    } else if (navigator.share) {
      navigator.share({
        title: 'Property Listing',
        text: address,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <div className="relative h-full flex">
      {/* Map Container */}
      <div className="flex-1 rounded-2xl overflow-hidden bg-gray-100 relative min-h-[300px]">
        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}

        {/* Google Maps Embed */}
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}&zoom=15`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setMapLoaded(true)}
          title="Property Location"
        />

        {/* Fallback Static Map Placeholder */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center ${mapLoaded ? 'hidden' : ''}`}>
          <div className="w-16 h-16 bg-gradient-to-r from-[#c9a227] to-[#b8922a] rounded-full flex items-center justify-center mb-3 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-medium">Loading Map...</p>
          <p className="text-xs text-gray-400 mt-1">{address}</p>
        </div>

        {/* Map Controls Overlay */}
        <div className="absolute bottom-4 left-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Maps
          </a>
        </div>
      </div>

      {/* Vertical Action Strip */}
      <div className="ml-3 flex flex-col gap-2">
        <button
          onClick={handleShare}
          className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
          title="Share"
        >
          <svg className="w-5 h-5 text-gray-500 group-hover:text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <button
          onClick={handlePrint}
          className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
          title="Print"
        >
          <svg className="w-5 h-5 text-gray-500 group-hover:text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>

        <button
          onClick={onSave}
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm border transition-all group ${
            isSaved
              ? 'bg-rose-50 border-rose-200 hover:bg-rose-100'
              : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'
          }`}
          title={isSaved ? 'Saved' : 'Save'}
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              isSaved ? 'text-rose-500 fill-rose-500' : 'text-gray-500 group-hover:text-rose-500'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            fill={isSaved ? 'currentColor' : 'none'}
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Skeleton
export function PropertyMapPanelSkeleton() {
  return (
    <div className="flex h-full min-h-[300px]">
      <div className="flex-1 rounded-2xl bg-gray-200 animate-pulse" />
      <div className="ml-3 flex flex-col gap-2">
        <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse" />
        <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse" />
        <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse" />
      </div>
    </div>
  )
}
