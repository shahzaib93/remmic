/**
 * Step 2 Phase 2B: Auction Engine Service
 *
 * Handles all auction and bidding operations:
 * - Auction creation from approved listings
 * - Bid placement with validation
 * - Auto-bid (proxy bidding) system
 * - Buy now functionality
 * - Anti-sniping protection
 * - Auction status management
 */

// Storage keys for Phase 2B
const STORAGE_KEYS = {
  AUCTIONS: 'step2_auctions',
  BIDS: 'step2_bids',
  AUTO_BIDS: 'step2_auto_bids',
  BID_NOTIFICATIONS: 'step2_bid_notifications',
  WATCHLIST: 'step2_watchlist',
}

// Auction status enum
export const AUCTION_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  ENDING_SOON: 'ending_soon',
  ENDED: 'ended',
  SOLD: 'sold',
  UNSOLD: 'unsold',
  CANCELLED: 'cancelled',
}

// Bid increment rules based on current price
const BID_INCREMENTS = [
  { threshold: 1000000, increment: 10000 },      // Under 10 lakh: 10k increment
  { threshold: 5000000, increment: 25000 },      // 10-50 lakh: 25k increment
  { threshold: 10000000, increment: 50000 },     // 50 lakh - 1 crore: 50k increment
  { threshold: 50000000, increment: 100000 },    // 1-5 crore: 1 lakh increment
  { threshold: 100000000, increment: 250000 },   // 5-10 crore: 2.5 lakh increment
  { threshold: Infinity, increment: 500000 },    // Above 10 crore: 5 lakh increment
]

// Anti-sniping: Extend auction if bid in last X minutes
const ANTI_SNIPE_WINDOW_MINUTES = 5
const ANTI_SNIPE_EXTENSION_MINUTES = 5

// Helper: Get data from localStorage
const getData = (key) => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

// Helper: Set data to localStorage
const setData = (key, data) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// Helper: Generate unique ID
const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper: Get minimum bid increment for a price
export const getMinBidIncrement = (currentPrice) => {
  for (const rule of BID_INCREMENTS) {
    if (currentPrice < rule.threshold) {
      return rule.increment
    }
  }
  return BID_INCREMENTS[BID_INCREMENTS.length - 1].increment
}

// Helper: Calculate minimum next bid
export const getMinNextBid = (currentPrice) => {
  return currentPrice + getMinBidIncrement(currentPrice)
}

// Helper: Format price in PKR
export const formatPrice = (price) => {
  if (!price) return 'PKR 0'
  return `PKR ${Number(price).toLocaleString('en-PK')}`
}

// Helper: Calculate time remaining
export const getTimeRemaining = (endTime) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end - now

  if (diff <= 0) {
    return { expired: true, total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { expired: false, total: diff, days, hours, minutes, seconds }
}

// Helper: Check if auction is ending soon (within 1 hour)
export const isEndingSoon = (endTime) => {
  const remaining = getTimeRemaining(endTime)
  return !remaining.expired && remaining.total <= 60 * 60 * 1000
}

// ============================================
// AUCTION FUNCTIONS
// ============================================

/**
 * Create auction from approved listing
 */
export const createAuction = async (listingId, sellerId, auctionData) => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)

    // Check if auction already exists for this listing
    const existing = auctions.find(a => a.listingId === listingId &&
      [AUCTION_STATUS.SCHEDULED, AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(a.status))
    if (existing) {
      return { success: false, error: 'Active auction already exists for this listing' }
    }

    const {
      basePrice,
      reservePrice,
      buyNowPrice,
      duration, // in hours
      urgency = 'standard',
      startImmediately = true,
    } = auctionData

    if (!basePrice || basePrice <= 0) {
      return { success: false, error: 'Base price is required' }
    }

    if (reservePrice && reservePrice < basePrice) {
      return { success: false, error: 'Reserve price cannot be less than base price' }
    }

    if (buyNowPrice && buyNowPrice <= basePrice) {
      return { success: false, error: 'Buy now price must be higher than base price' }
    }

    const now = new Date()
    const startTime = startImmediately ? now : new Date(auctionData.startTime)
    const endTime = new Date(startTime.getTime() + (duration || 72) * 60 * 60 * 1000)

    const newAuction = {
      id: generateId('auction_'),
      listingId,
      sellerId,
      status: startImmediately ? AUCTION_STATUS.LIVE : AUCTION_STATUS.SCHEDULED,
      basePrice,
      reservePrice: reservePrice || null,
      buyNowPrice: buyNowPrice || null,
      currentPrice: basePrice,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      originalEndTime: endTime.toISOString(),
      urgency,
      bidCount: 0,
      highestBidderId: null,
      winnerId: null,
      finalPrice: null,
      reserveMet: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    auctions.push(newAuction)
    setData(STORAGE_KEYS.AUCTIONS, auctions)

    // Update listing status to 'live'
    updateListingToLive(listingId)

    return { success: true, auction: newAuction }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get auction by ID
 */
export const getAuction = async (auctionId) => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const auction = auctions.find(a => a.id === auctionId)

    if (!auction) {
      return { success: false, error: 'Auction not found' }
    }

    // Check and update status if needed
    const updatedAuction = await checkAndUpdateAuctionStatus(auction)

    return { success: true, auction: updatedAuction }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get auction by listing ID
 */
export const getAuctionByListing = async (listingId) => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const auction = auctions.find(a => a.listingId === listingId &&
      [AUCTION_STATUS.SCHEDULED, AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(a.status))

    if (!auction) {
      return { success: false, error: 'No active auction found for this listing' }
    }

    const updatedAuction = await checkAndUpdateAuctionStatus(auction)

    return { success: true, auction: updatedAuction }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all live auctions
 */
export const getLiveAuctions = async () => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const liveAuctions = auctions.filter(a =>
      [AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(a.status)
    )

    // Check and update each auction's status
    const updatedAuctions = []
    for (const auction of liveAuctions) {
      const updated = await checkAndUpdateAuctionStatus(auction)
      if ([AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(updated.status)) {
        updatedAuctions.push(updated)
      }
    }

    // Sort by ending soonest first
    updatedAuctions.sort((a, b) => new Date(a.endTime) - new Date(b.endTime))

    return { success: true, auctions: updatedAuctions }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get auctions by seller
 */
export const getSellerAuctions = async (sellerId) => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const sellerAuctions = auctions.filter(a => a.sellerId === sellerId)

    // Update statuses
    const updatedAuctions = []
    for (const auction of sellerAuctions) {
      updatedAuctions.push(await checkAndUpdateAuctionStatus(auction))
    }

    // Sort by most recent first
    updatedAuctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return { success: true, auctions: updatedAuctions }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Check and update auction status based on time
 */
const checkAndUpdateAuctionStatus = async (auction) => {
  const now = new Date()
  const endTime = new Date(auction.endTime)
  const startTime = new Date(auction.startTime)
  let updated = { ...auction }
  let needsUpdate = false

  // Check if scheduled auction should start
  if (auction.status === AUCTION_STATUS.SCHEDULED && now >= startTime) {
    updated.status = AUCTION_STATUS.LIVE
    needsUpdate = true
  }

  // Check if live auction is ending soon (within 1 hour)
  if (auction.status === AUCTION_STATUS.LIVE && isEndingSoon(auction.endTime)) {
    updated.status = AUCTION_STATUS.ENDING_SOON
    needsUpdate = true
  }

  // Check if auction has ended
  if ([AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(auction.status) && now >= endTime) {
    // Determine if sold or unsold
    if (auction.bidCount > 0) {
      // Check if reserve was met
      if (auction.reservePrice && auction.currentPrice < auction.reservePrice) {
        updated.status = AUCTION_STATUS.UNSOLD
      } else {
        updated.status = AUCTION_STATUS.SOLD
        updated.winnerId = auction.highestBidderId
        updated.finalPrice = auction.currentPrice
      }
    } else {
      updated.status = AUCTION_STATUS.UNSOLD
    }
    updated.endedAt = now.toISOString()
    needsUpdate = true
  }

  if (needsUpdate) {
    updated.updatedAt = now.toISOString()
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const index = auctions.findIndex(a => a.id === auction.id)
    if (index !== -1) {
      auctions[index] = updated
      setData(STORAGE_KEYS.AUCTIONS, auctions)
    }
  }

  return updated
}

/**
 * Update listing status to live (called when auction starts)
 */
const updateListingToLive = (listingId) => {
  try {
    const listings = JSON.parse(localStorage.getItem('step2_listings') || '[]')
    const index = listings.findIndex(l => l.id === listingId)
    if (index !== -1) {
      listings[index].status = 'live'
      listings[index].updatedAt = new Date().toISOString()
      localStorage.setItem('step2_listings', JSON.stringify(listings))
    }
  } catch (e) {
    console.error('Error updating listing status:', e)
  }
}

// ============================================
// BIDDING FUNCTIONS
// ============================================

/**
 * Place a bid on an auction
 */
export const placeBid = async (auctionId, userId, bidAmount, userName = 'Bidder') => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const auctionIndex = auctions.findIndex(a => a.id === auctionId)

    if (auctionIndex === -1) {
      return { success: false, error: 'Auction not found' }
    }

    const auction = auctions[auctionIndex]

    // Validate auction is live
    if (![AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(auction.status)) {
      return { success: false, error: 'This auction is not accepting bids' }
    }

    // Validate bid amount
    const minBid = getMinNextBid(auction.currentPrice)
    if (bidAmount < minBid) {
      return { success: false, error: `Minimum bid is ${formatPrice(minBid)}` }
    }

    // Cannot bid on own auction
    if (auction.sellerId === userId) {
      return { success: false, error: 'You cannot bid on your own auction' }
    }

    // Check for auto-bids from other users
    const autoBidResult = await processAutoBids(auctionId, userId, bidAmount)

    const now = new Date()
    const bids = getData(STORAGE_KEYS.BIDS)

    // Create bid record
    const newBid = {
      id: generateId('bid_'),
      auctionId,
      userId,
      userName,
      amount: bidAmount,
      isAutoBid: false,
      createdAt: now.toISOString(),
    }
    bids.push(newBid)

    // If auto-bid triggered, add that bid too
    if (autoBidResult.triggered) {
      const autoBid = {
        id: generateId('bid_'),
        auctionId,
        userId: autoBidResult.autoBidder.userId,
        userName: autoBidResult.autoBidder.userName,
        amount: autoBidResult.newPrice,
        isAutoBid: true,
        createdAt: new Date(now.getTime() + 1).toISOString(), // 1ms later
      }
      bids.push(autoBid)
    }

    setData(STORAGE_KEYS.BIDS, bids)

    // Update auction
    const finalPrice = autoBidResult.triggered ? autoBidResult.newPrice : bidAmount
    const finalBidder = autoBidResult.triggered ? autoBidResult.autoBidder.userId : userId

    auctions[auctionIndex] = {
      ...auction,
      currentPrice: finalPrice,
      bidCount: auction.bidCount + (autoBidResult.triggered ? 2 : 1),
      highestBidderId: finalBidder,
      reserveMet: auction.reservePrice ? finalPrice >= auction.reservePrice : true,
      updatedAt: now.toISOString(),
    }

    // Anti-sniping: extend if bid in last X minutes
    const endTime = new Date(auction.endTime)
    const timeToEnd = endTime - now
    const antiSnipeWindow = ANTI_SNIPE_WINDOW_MINUTES * 60 * 1000

    if (timeToEnd > 0 && timeToEnd <= antiSnipeWindow) {
      const newEndTime = new Date(endTime.getTime() + ANTI_SNIPE_EXTENSION_MINUTES * 60 * 1000)
      auctions[auctionIndex].endTime = newEndTime.toISOString()
      auctions[auctionIndex].extended = true
      auctions[auctionIndex].extensionCount = (auction.extensionCount || 0) + 1
    }

    setData(STORAGE_KEYS.AUCTIONS, auctions)

    // Create notifications for outbid users
    if (auction.highestBidderId && auction.highestBidderId !== userId) {
      await createBidNotification(auction.highestBidderId, auctionId, 'outbid', {
        newPrice: finalPrice,
        outbidBy: userName,
      })
    }

    return {
      success: true,
      bid: newBid,
      auction: auctions[auctionIndex],
      wasOutbidByAutoBid: autoBidResult.triggered,
      message: autoBidResult.triggered
        ? `Your bid was placed but outbid by auto-bid. Current price: ${formatPrice(finalPrice)}`
        : `Bid placed successfully! You are the highest bidder.`,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Process auto-bids when a new bid is placed
 */
const processAutoBids = async (auctionId, newBidderId, newBidAmount) => {
  const autoBids = getData(STORAGE_KEYS.AUTO_BIDS)
  const activeAutoBids = autoBids.filter(ab =>
    ab.auctionId === auctionId &&
    ab.userId !== newBidderId &&
    ab.isActive &&
    ab.maxBid > newBidAmount
  )

  if (activeAutoBids.length === 0) {
    return { triggered: false }
  }

  // Find the highest auto-bid
  const highestAutoBid = activeAutoBids.reduce((max, ab) =>
    ab.maxBid > max.maxBid ? ab : max
  , activeAutoBids[0])

  // Calculate the auto-bid response
  const minIncrement = getMinBidIncrement(newBidAmount)
  const autoBidAmount = Math.min(newBidAmount + minIncrement, highestAutoBid.maxBid)

  return {
    triggered: true,
    autoBidder: {
      userId: highestAutoBid.userId,
      userName: highestAutoBid.userName,
    },
    newPrice: autoBidAmount,
  }
}

/**
 * Set up auto-bid (proxy bidding)
 */
export const setAutoBid = async (auctionId, userId, maxBid, userName = 'Bidder') => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const auction = auctions.find(a => a.id === auctionId)

    if (!auction) {
      return { success: false, error: 'Auction not found' }
    }

    if (![AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(auction.status)) {
      return { success: false, error: 'This auction is not accepting bids' }
    }

    const minBid = getMinNextBid(auction.currentPrice)
    if (maxBid < minBid) {
      return { success: false, error: `Maximum bid must be at least ${formatPrice(minBid)}` }
    }

    const autoBids = getData(STORAGE_KEYS.AUTO_BIDS)

    // Deactivate any existing auto-bid for this user on this auction
    const updated = autoBids.map(ab => {
      if (ab.auctionId === auctionId && ab.userId === userId) {
        return { ...ab, isActive: false }
      }
      return ab
    })

    // Add new auto-bid
    const newAutoBid = {
      id: generateId('autobid_'),
      auctionId,
      userId,
      userName,
      maxBid,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    updated.push(newAutoBid)
    setData(STORAGE_KEYS.AUTO_BIDS, updated)

    // If user is not current highest bidder, place initial bid
    if (auction.highestBidderId !== userId) {
      const bidResult = await placeBid(auctionId, userId, minBid, userName)
      return {
        success: true,
        autoBid: newAutoBid,
        initialBid: bidResult,
        message: `Auto-bid set up to ${formatPrice(maxBid)}. Initial bid placed.`,
      }
    }

    return {
      success: true,
      autoBid: newAutoBid,
      message: `Auto-bid updated to ${formatPrice(maxBid)}`,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Cancel auto-bid
 */
export const cancelAutoBid = async (auctionId, userId) => {
  try {
    const autoBids = getData(STORAGE_KEYS.AUTO_BIDS)
    const updated = autoBids.map(ab => {
      if (ab.auctionId === auctionId && ab.userId === userId && ab.isActive) {
        return { ...ab, isActive: false, cancelledAt: new Date().toISOString() }
      }
      return ab
    })
    setData(STORAGE_KEYS.AUTO_BIDS, updated)

    return { success: true, message: 'Auto-bid cancelled' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get user's auto-bid for an auction
 */
export const getUserAutoBid = async (auctionId, userId) => {
  try {
    const autoBids = getData(STORAGE_KEYS.AUTO_BIDS)
    const userAutoBid = autoBids.find(ab =>
      ab.auctionId === auctionId &&
      ab.userId === userId &&
      ab.isActive
    )

    return { success: true, autoBid: userAutoBid || null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// BUY NOW FUNCTIONS
// ============================================

/**
 * Execute buy now
 */
export const executeBuyNow = async (auctionId, userId, userName = 'Buyer') => {
  try {
    const auctions = getData(STORAGE_KEYS.AUCTIONS)
    const auctionIndex = auctions.findIndex(a => a.id === auctionId)

    if (auctionIndex === -1) {
      return { success: false, error: 'Auction not found' }
    }

    const auction = auctions[auctionIndex]

    if (![AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(auction.status)) {
      return { success: false, error: 'This auction is not active' }
    }

    if (!auction.buyNowPrice) {
      return { success: false, error: 'Buy now is not available for this auction' }
    }

    if (auction.sellerId === userId) {
      return { success: false, error: 'You cannot buy your own listing' }
    }

    const now = new Date()

    // Update auction as sold
    auctions[auctionIndex] = {
      ...auction,
      status: AUCTION_STATUS.SOLD,
      winnerId: userId,
      winnerName: userName,
      finalPrice: auction.buyNowPrice,
      soldViaBuyNow: true,
      endedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    setData(STORAGE_KEYS.AUCTIONS, auctions)

    // Create notification for seller
    await createBidNotification(auction.sellerId, auctionId, 'sold', {
      buyerName: userName,
      finalPrice: auction.buyNowPrice,
      viaBuyNow: true,
    })

    // Notify outbid users
    if (auction.highestBidderId && auction.highestBidderId !== userId) {
      await createBidNotification(auction.highestBidderId, auctionId, 'auction_ended', {
        reason: 'Buy Now executed by another user',
      })
    }

    return {
      success: true,
      auction: auctions[auctionIndex],
      message: 'Purchase successful! The seller will be notified.',
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// BID HISTORY FUNCTIONS
// ============================================

/**
 * Get bid history for an auction
 */
export const getAuctionBids = async (auctionId) => {
  try {
    const bids = getData(STORAGE_KEYS.BIDS)
    const auctionBids = bids.filter(b => b.auctionId === auctionId)

    // Sort by most recent first
    auctionBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return { success: true, bids: auctionBids }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get user's bid history
 */
export const getUserBids = async (userId) => {
  try {
    const bids = getData(STORAGE_KEYS.BIDS)
    const userBids = bids.filter(b => b.userId === userId)

    // Sort by most recent first
    userBids.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return { success: true, bids: userBids }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get user's active auctions (where they have bid)
 */
export const getUserActiveAuctions = async (userId) => {
  try {
    const bids = getData(STORAGE_KEYS.BIDS)
    const auctions = getData(STORAGE_KEYS.AUCTIONS)

    // Get unique auction IDs user has bid on
    const userAuctionIds = [...new Set(bids.filter(b => b.userId === userId).map(b => b.auctionId))]

    // Get those auctions
    const userAuctions = auctions.filter(a => userAuctionIds.includes(a.id))

    // Update statuses and categorize
    const result = {
      active: [],
      won: [],
      lost: [],
    }

    for (const auction of userAuctions) {
      const updated = await checkAndUpdateAuctionStatus(auction)
      const isHighestBidder = updated.highestBidderId === userId

      if ([AUCTION_STATUS.LIVE, AUCTION_STATUS.ENDING_SOON].includes(updated.status)) {
        result.active.push({ ...updated, isHighestBidder })
      } else if (updated.status === AUCTION_STATUS.SOLD && updated.winnerId === userId) {
        result.won.push(updated)
      } else if ([AUCTION_STATUS.SOLD, AUCTION_STATUS.UNSOLD, AUCTION_STATUS.ENDED].includes(updated.status)) {
        result.lost.push(updated)
      }
    }

    return { success: true, auctions: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// WATCHLIST FUNCTIONS
// ============================================

/**
 * Add auction to watchlist
 */
export const addToWatchlist = async (userId, auctionId) => {
  try {
    const watchlist = getData(STORAGE_KEYS.WATCHLIST)
    const existing = watchlist.find(w => w.userId === userId && w.auctionId === auctionId)

    if (existing) {
      return { success: true, message: 'Already in watchlist' }
    }

    watchlist.push({
      id: generateId('watch_'),
      userId,
      auctionId,
      addedAt: new Date().toISOString(),
    })

    setData(STORAGE_KEYS.WATCHLIST, watchlist)

    return { success: true, message: 'Added to watchlist' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Remove from watchlist
 */
export const removeFromWatchlist = async (userId, auctionId) => {
  try {
    const watchlist = getData(STORAGE_KEYS.WATCHLIST)
    const filtered = watchlist.filter(w => !(w.userId === userId && w.auctionId === auctionId))
    setData(STORAGE_KEYS.WATCHLIST, filtered)

    return { success: true, message: 'Removed from watchlist' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get user's watchlist
 */
export const getUserWatchlist = async (userId) => {
  try {
    const watchlist = getData(STORAGE_KEYS.WATCHLIST)
    const userWatchlist = watchlist.filter(w => w.userId === userId)

    return { success: true, watchlist: userWatchlist }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Check if auction is in user's watchlist
 */
export const isInWatchlist = async (userId, auctionId) => {
  try {
    const watchlist = getData(STORAGE_KEYS.WATCHLIST)
    const found = watchlist.find(w => w.userId === userId && w.auctionId === auctionId)

    return { success: true, isWatching: !!found }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Create bid notification
 */
export const createBidNotification = async (userId, auctionId, type, data = {}) => {
  try {
    const notifications = getData(STORAGE_KEYS.BID_NOTIFICATIONS)

    const newNotification = {
      id: generateId('notif_'),
      userId,
      auctionId,
      type, // 'outbid', 'winning', 'auction_ending', 'auction_ended', 'sold'
      data,
      read: false,
      createdAt: new Date().toISOString(),
    }

    notifications.push(newNotification)
    setData(STORAGE_KEYS.BID_NOTIFICATIONS, notifications)

    return { success: true, notification: newNotification }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get user's notifications
 */
export const getUserNotifications = async (userId) => {
  try {
    const notifications = getData(STORAGE_KEYS.BID_NOTIFICATIONS)
    const userNotifications = notifications.filter(n => n.userId === userId)

    // Sort by most recent first
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return { success: true, notifications: userNotifications }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId) => {
  try {
    const notifications = getData(STORAGE_KEYS.BID_NOTIFICATIONS)
    const index = notifications.findIndex(n => n.id === notificationId)

    if (index !== -1) {
      notifications[index].read = true
      setData(STORAGE_KEYS.BID_NOTIFICATIONS, notifications)
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// DEMO DATA SEEDING
// ============================================

/**
 * Seed demo auction data for testing Phase 2B
 */
export const seedAuctionDemoData = async () => {
  const now = new Date()

  // Demo auctions based on existing approved listings
  const auctions = [
    {
      id: 'auction_demo_1',
      listingId: 'listing_demo_1',
      sellerId: 'demo_seller_1',
      status: AUCTION_STATUS.LIVE,
      basePrice: 75000000,
      reservePrice: 80000000,
      buyNowPrice: 95000000,
      currentPrice: 78500000,
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Started 24h ago
      endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // Ends in 48h
      originalEndTime: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      urgency: 'standard',
      bidCount: 5,
      highestBidderId: 'demo_bidder_1',
      reserveMet: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'auction_demo_2',
      listingId: 'listing_demo_4',
      sellerId: 'demo_seller_1',
      status: AUCTION_STATUS.ENDING_SOON,
      basePrice: 40000000,
      reservePrice: null,
      buyNowPrice: 50000000,
      currentPrice: 46000000,
      startTime: new Date(now.getTime() - 70 * 60 * 60 * 1000).toISOString(), // Started 70h ago
      endTime: new Date(now.getTime() + 45 * 60 * 1000).toISOString(), // Ends in 45 minutes
      originalEndTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      urgency: 'urgent',
      bidCount: 12,
      highestBidderId: 'demo_bidder_2',
      reserveMet: true,
      extended: true,
      extensionCount: 2,
      createdAt: new Date(now.getTime() - 70 * 60 * 60 * 1000).toISOString(),
      updatedAt: now.toISOString(),
    },
  ]

  // Demo bids
  const bids = [
    { id: 'bid_1', auctionId: 'auction_demo_1', userId: 'demo_bidder_1', userName: 'Ali Hassan', amount: 75000000, isAutoBid: false, createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_2', auctionId: 'auction_demo_1', userId: 'demo_bidder_2', userName: 'Fatima Khan', amount: 76000000, isAutoBid: false, createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_3', auctionId: 'auction_demo_1', userId: 'demo_bidder_1', userName: 'Ali Hassan', amount: 77000000, isAutoBid: true, createdAt: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_4', auctionId: 'auction_demo_1', userId: 'demo_bidder_3', userName: 'Usman Ahmed', amount: 78000000, isAutoBid: false, createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_5', auctionId: 'auction_demo_1', userId: 'demo_bidder_1', userName: 'Ali Hassan', amount: 78500000, isAutoBid: true, createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_6', auctionId: 'auction_demo_2', userId: 'demo_bidder_2', userName: 'Fatima Khan', amount: 40000000, isAutoBid: false, createdAt: new Date(now.getTime() - 65 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_7', auctionId: 'auction_demo_2', userId: 'demo_bidder_1', userName: 'Ali Hassan', amount: 41000000, isAutoBid: false, createdAt: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_8', auctionId: 'auction_demo_2', userId: 'demo_bidder_2', userName: 'Fatima Khan', amount: 42000000, isAutoBid: false, createdAt: new Date(now.getTime() - 40 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_9', auctionId: 'auction_demo_2', userId: 'demo_bidder_3', userName: 'Usman Ahmed', amount: 43500000, isAutoBid: false, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_10', auctionId: 'auction_demo_2', userId: 'demo_bidder_2', userName: 'Fatima Khan', amount: 44000000, isAutoBid: false, createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_11', auctionId: 'auction_demo_2', userId: 'demo_bidder_1', userName: 'Ali Hassan', amount: 45000000, isAutoBid: false, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'bid_12', auctionId: 'auction_demo_2', userId: 'demo_bidder_2', userName: 'Fatima Khan', amount: 46000000, isAutoBid: false, createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString() },
  ]

  // Demo auto-bids
  const autoBids = [
    { id: 'autobid_1', auctionId: 'auction_demo_1', userId: 'demo_bidder_1', userName: 'Ali Hassan', maxBid: 82000000, isActive: true, createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString() },
  ]

  // Save demo data
  setData(STORAGE_KEYS.AUCTIONS, auctions)
  setData(STORAGE_KEYS.BIDS, bids)
  setData(STORAGE_KEYS.AUTO_BIDS, autoBids)

  // Update listing statuses to 'live'
  try {
    const listings = JSON.parse(localStorage.getItem('step2_listings') || '[]')
    const updatedListings = listings.map(l => {
      if (l.id === 'listing_demo_1' || l.id === 'listing_demo_4') {
        return { ...l, status: 'live' }
      }
      return l
    })
    localStorage.setItem('step2_listings', JSON.stringify(updatedListings))
  } catch (e) {
    console.error('Error updating listing statuses:', e)
  }

  return {
    success: true,
    message: 'Auction demo data seeded successfully',
    counts: {
      auctions: auctions.length,
      bids: bids.length,
      autoBids: autoBids.length,
    }
  }
}

/**
 * Check if auction demo data exists
 */
export const hasAuctionDemoData = () => {
  if (typeof window === 'undefined') return false
  const auctions = getData(STORAGE_KEYS.AUCTIONS)
  return auctions.length > 0
}
