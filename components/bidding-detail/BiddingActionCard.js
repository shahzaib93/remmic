import { useState } from 'react'

export default function BiddingActionCard({
  auctionDate = '',
  biddingOpens = '',
  biddingCloses = '',
  onRegisterToBid,
  onBookViewing,
}) {
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'TBA'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
      {/* Register Button */}
      <button
        onClick={onRegisterToBid}
        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Register to Bid
      </button>

      {/* Auction Info Boxes */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">Auction Date</p>
          <p className="text-sm font-semibold text-gray-900">{formatDate(auctionDate)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">Bidding Opens</p>
          <p className="text-sm font-semibold text-gray-900">{formatTime(biddingOpens)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-1">Bidding Closes</p>
          <p className="text-sm font-semibold text-gray-900">{formatTime(biddingCloses)}</p>
        </div>
      </div>

      {/* Book Viewing Button */}
      <button
        onClick={onBookViewing}
        className="w-full mt-4 py-3 px-6 bg-white border-2 border-gray-200 hover:border-indigo-600 text-gray-700 hover:text-indigo-600 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Book Viewing
      </button>

      {/* Help Text */}
      <p className="mt-4 text-xs text-gray-400 text-center">
        Need help? Call us at +92 42 35761234
      </p>
    </div>
  )
}

// Skeleton
export function BiddingActionCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
      <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="mt-4 h-12 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  )
}
