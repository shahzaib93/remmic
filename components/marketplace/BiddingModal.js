import { useState, useEffect } from 'react'

export default function BiddingModal({ property, isOpen, onClose }) {
  const [bidAmount, setBidAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bidHistory, setBidHistory] = useState([])
  const [currentHighestBid, setCurrentHighestBid] = useState(0)
  const [timeLeft, setTimeLeft] = useState('')

  const formatPrice = (value) => {
    if (!value) return 'PKR 0'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'PKR 0'
    if (num >= 10000000) return `PKR ${(num / 10000000).toFixed(1)} Cr`
    if (num >= 100000) return `PKR ${(num / 100000).toFixed(1)} Lac`
    return `PKR ${num.toLocaleString()}`
  }

  const getBiddingStatus = () => {
    if (!property?.biddingOpens || !property?.biddingCloses) {
      return { status: 'Pending', timeLeft: 'Schedule TBA', phase: 'pending' }
    }
    const now = new Date()
    const start = new Date(property.biddingOpens)
    const end = new Date(property.biddingCloses)

    if (now < start) {
      const diff = start - now
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      return { status: 'Upcoming', timeLeft: days > 0 ? `Starts in ${days}d ${hours}h` : 'Starting soon', phase: 'upcoming' }
    }
    if (now <= end) {
      const diff = end - now
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      return { status: 'Live', timeLeft: days > 0 ? `${days}d ${hours}h left` : hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`, phase: 'live' }
    }
    return { status: 'Ended', timeLeft: 'Auction closed', phase: 'ended' }
  }

  useEffect(() => {
    if (isOpen && property) {
      // Initialize with property data
      const startingBid = property.startingBid || property.price || 0
      const currentBid = property.currentBid || startingBid
      const mockBids = [
        { id: 1, bidder: 'Anonymous', amount: currentBid, time: '2 minutes ago' },
        { id: 2, bidder: 'Anonymous', amount: currentBid - 25000, time: '5 minutes ago' },
        { id: 3, bidder: 'Anonymous', amount: startingBid, time: '10 minutes ago' }
      ]
      setBidHistory(mockBids)
      setCurrentHighestBid(currentBid)
      setBidAmount((currentBid + 10000).toString())
    }
  }, [isOpen, property])

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        const status = getBiddingStatus()
        setTimeLeft(status.timeLeft)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen, property])

  const handleSubmitBid = async (e) => {
    e.preventDefault()
    if (!bidAmount || isSubmitting) return

    const amount = parseFloat(bidAmount.replace(/[^0-9.]/g, ''))
    if (amount <= currentHighestBid) {
      alert('Bid must be higher than current highest bid')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      const newBid = {
        id: Date.now(),
        bidder: 'You',
        amount: amount,
        time: 'Just now'
      }
      setBidHistory([newBid, ...bidHistory])
      setCurrentHighestBid(amount)
      setBidAmount((amount + 10000).toString())
      setIsSubmitting(false)
      alert('Bid submitted successfully!')
    }, 1500)
  }

  const status = getBiddingStatus()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <img
              src={property?.image}
              alt={property?.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{property?.title}</h2>
              <p className="text-gray-600">{property?.address || property?.location || `${property?.city}, Pakistan`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Auction Status */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  status.phase === 'live' ? 'bg-green-100 text-green-800' :
                  status.phase === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status.status}
                </span>
                <p className="text-sm text-gray-600 mt-1">{timeLeft}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Highest Bid</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(currentHighestBid)}</p>
              </div>
            </div>
          </div>

          {/* Place Bid Form */}
          {status.phase === 'live' && (
            <form onSubmit={handleSubmitBid} className="mb-6">
              <div className="mb-4">
                <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">PKR</span>
                  <input
                    type="text"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] outline-none"
                    placeholder="Enter your bid"
                    min={currentHighestBid + 1}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum bid: {formatPrice(currentHighestBid + 10000)}
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !bidAmount}
                className="w-full py-3 bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white font-semibold rounded-xl hover:from-[#b8922a] hover:to-[#a67c00] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </form>
          )}

          {/* Property Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Starting Price:</span>
                <p className="font-medium">{formatPrice(property?.startingBid || property?.price)}</p>
              </div>
              <div>
                <span className="text-gray-600">Guide Price:</span>
                <p className="font-medium">{formatPrice(property?.guidePrice || property?.price)}</p>
              </div>
              <div>
                <span className="text-gray-600">Area:</span>
                <p className="font-medium">{property?.area || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <p className="font-medium">{property?.propertyType || property?.type || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Bid History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Recent Bids</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {bidHistory.map((bid, index) => (
                <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-medium text-gray-900">{bid.bidder}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(bid.amount)}</p>
                    <p className="text-xs text-gray-500">{bid.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}