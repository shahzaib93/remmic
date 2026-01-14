/**
 * Step 2: Auction System Data Service
 *
 * Handles all data operations for:
 * - Seller profiles & KYC
 * - Listings (draft, pending, approved, rejected)
 * - Listing media & documents
 * - Admin review logs
 *
 * Phase 2A scope only - no auction/bidding logic
 */

// Storage keys - namespaced for Step 2
const STORAGE_KEYS = {
  SELLER_PROFILES: 'step2_seller_profiles',
  LISTINGS: 'step2_listings',
  LISTING_MEDIA: 'step2_listing_media',
  LISTING_DOCUMENTS: 'step2_listing_documents',
  LISTING_REVIEWS: 'step2_listing_reviews',
}

// Listing status enum
export const LISTING_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION_REQUESTED: 'revision_requested',
}

// Seller verification status enum
export const SELLER_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending_verification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
}

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

// ============================================
// SELLER PROFILE & KYC FUNCTIONS
// ============================================

/**
 * Register a new seller profile
 */
export const registerSeller = async (userId, profileData) => {
  try {
    const profiles = getData(STORAGE_KEYS.SELLER_PROFILES)

    // Check if seller profile already exists
    const existing = profiles.find(p => p.userId === userId)
    if (existing) {
      return { success: false, error: 'Seller profile already exists' }
    }

    const newProfile = {
      id: generateId('seller_'),
      userId,
      ...profileData,
      verificationStatus: SELLER_STATUS.UNVERIFIED,
      kycDocuments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    profiles.push(newProfile)
    setData(STORAGE_KEYS.SELLER_PROFILES, profiles)

    return { success: true, profile: newProfile }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Submit KYC documents for verification
 */
export const submitSellerKYC = async (userId, kycData) => {
  try {
    const profiles = getData(STORAGE_KEYS.SELLER_PROFILES)
    const index = profiles.findIndex(p => p.userId === userId)

    if (index === -1) {
      return { success: false, error: 'Seller profile not found' }
    }

    profiles[index] = {
      ...profiles[index],
      kycDocuments: kycData.documents || [],
      cnicNumber: kycData.cnicNumber,
      businessName: kycData.businessName,
      businessType: kycData.businessType,
      businessAddress: kycData.businessAddress,
      verificationStatus: SELLER_STATUS.PENDING,
      kycSubmittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.SELLER_PROFILES, profiles)

    return { success: true, profile: profiles[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get seller profile by user ID
 */
export const getSellerProfile = async (userId) => {
  try {
    const profiles = getData(STORAGE_KEYS.SELLER_PROFILES)
    const profile = profiles.find(p => p.userId === userId)

    if (!profile) {
      return { success: false, error: 'Seller profile not found' }
    }

    return { success: true, profile }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get seller verification status
 */
export const getSellerStatus = async (userId) => {
  try {
    const profiles = getData(STORAGE_KEYS.SELLER_PROFILES)
    const profile = profiles.find(p => p.userId === userId)

    return {
      success: true,
      status: profile?.verificationStatus || SELLER_STATUS.UNVERIFIED,
      isVerified: profile?.verificationStatus === SELLER_STATUS.VERIFIED,
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Admin: Verify seller (approve/reject KYC)
 */
export const adminVerifySeller = async (sellerId, approved, rejectionReason = '') => {
  try {
    const profiles = getData(STORAGE_KEYS.SELLER_PROFILES)
    const index = profiles.findIndex(p => p.id === sellerId)

    if (index === -1) {
      return { success: false, error: 'Seller not found' }
    }

    profiles[index] = {
      ...profiles[index],
      verificationStatus: approved ? SELLER_STATUS.VERIFIED : SELLER_STATUS.REJECTED,
      verifiedAt: approved ? new Date().toISOString() : null,
      rejectionReason: approved ? null : rejectionReason,
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.SELLER_PROFILES, profiles)

    return { success: true, profile: profiles[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// LISTING FUNCTIONS
// ============================================

/**
 * Create a new listing (draft)
 */
export const createListing = async (sellerId, userId, listingData) => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)

    const newListing = {
      id: generateId('listing_'),
      sellerId,
      userId,
      ...listingData,
      status: LISTING_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    listings.push(newListing)
    setData(STORAGE_KEYS.LISTINGS, listings)

    return { success: true, listing: newListing }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Update a draft listing
 */
export const updateListing = async (listingId, updateData) => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const index = listings.findIndex(l => l.id === listingId)

    if (index === -1) {
      return { success: false, error: 'Listing not found' }
    }

    // Only allow updates if listing is in draft or revision_requested status
    if (![LISTING_STATUS.DRAFT, LISTING_STATUS.REVISION_REQUESTED].includes(listings[index].status)) {
      return { success: false, error: 'Cannot update listing in current status' }
    }

    listings[index] = {
      ...listings[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.LISTINGS, listings)

    return { success: true, listing: listings[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Submit listing for review (finalize)
 */
export const submitListingForReview = async (listingId) => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const index = listings.findIndex(l => l.id === listingId)

    if (index === -1) {
      return { success: false, error: 'Listing not found' }
    }

    // Validate required fields
    const listing = listings[index]
    const requiredFields = ['title', 'propertyType', 'location', 'askingPrice']
    const missingFields = requiredFields.filter(f => !listing[f])

    if (missingFields.length > 0) {
      return { success: false, error: `Missing required fields: ${missingFields.join(', ')}` }
    }

    // Check for at least one photo
    const media = getData(STORAGE_KEYS.LISTING_MEDIA)
    const listingMedia = media.filter(m => m.listingId === listingId && m.type === 'photo')
    if (listingMedia.length === 0) {
      return { success: false, error: 'At least one photo is required' }
    }

    listings[index] = {
      ...listings[index],
      status: LISTING_STATUS.PENDING_REVIEW,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.LISTINGS, listings)

    // Create audit log
    await createReviewLog(listingId, 'submitted', null, 'Listing submitted for review')

    return { success: true, listing: listings[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get listing by ID
 */
export const getListing = async (listingId) => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const listing = listings.find(l => l.id === listingId)

    if (!listing) {
      return { success: false, error: 'Listing not found' }
    }

    // Get associated media and documents
    const media = getData(STORAGE_KEYS.LISTING_MEDIA).filter(m => m.listingId === listingId)
    const documents = getData(STORAGE_KEYS.LISTING_DOCUMENTS).filter(d => d.listingId === listingId)

    return {
      success: true,
      listing: {
        ...listing,
        media,
        documents,
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all listings for a seller
 */
export const getSellerListings = async (userId) => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const sellerListings = listings.filter(l => l.userId === userId)

    // Sort by most recent first
    sellerListings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    return { success: true, listings: sellerListings }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get all approved listings (public auctions)
 */
export const getApprovedListings = async () => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const approved = listings.filter(l => l.status === LISTING_STATUS.APPROVED)

    // Get media for each listing
    const media = getData(STORAGE_KEYS.LISTING_MEDIA)

    const listingsWithMedia = approved.map(listing => ({
      ...listing,
      media: media.filter(m => m.listingId === listing.id),
    }))

    // Sort by approval date
    listingsWithMedia.sort((a, b) => new Date(b.approvedAt || b.updatedAt) - new Date(a.approvedAt || a.updatedAt))

    return { success: true, listings: listingsWithMedia }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// LISTING MEDIA FUNCTIONS
// ============================================

/**
 * Add media to listing (photos/videos)
 */
export const addListingMedia = async (listingId, mediaData) => {
  try {
    const media = getData(STORAGE_KEYS.LISTING_MEDIA)

    const newMedia = {
      id: generateId('media_'),
      listingId,
      ...mediaData,
      uploadedAt: new Date().toISOString(),
    }

    media.push(newMedia)
    setData(STORAGE_KEYS.LISTING_MEDIA, media)

    return { success: true, media: newMedia }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Remove media from listing
 */
export const removeListingMedia = async (mediaId) => {
  try {
    const media = getData(STORAGE_KEYS.LISTING_MEDIA)
    const filtered = media.filter(m => m.id !== mediaId)
    setData(STORAGE_KEYS.LISTING_MEDIA, filtered)

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get media for a listing
 */
export const getListingMedia = async (listingId) => {
  try {
    const media = getData(STORAGE_KEYS.LISTING_MEDIA)
    const listingMedia = media.filter(m => m.listingId === listingId)

    return { success: true, media: listingMedia }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// LISTING DOCUMENTS FUNCTIONS
// ============================================

/**
 * Add document to listing (ownership docs, legal docs)
 */
export const addListingDocument = async (listingId, documentData) => {
  try {
    const documents = getData(STORAGE_KEYS.LISTING_DOCUMENTS)

    const newDocument = {
      id: generateId('doc_'),
      listingId,
      ...documentData,
      uploadedAt: new Date().toISOString(),
    }

    documents.push(newDocument)
    setData(STORAGE_KEYS.LISTING_DOCUMENTS, documents)

    return { success: true, document: newDocument }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Remove document from listing
 */
export const removeListingDocument = async (documentId) => {
  try {
    const documents = getData(STORAGE_KEYS.LISTING_DOCUMENTS)
    const filtered = documents.filter(d => d.id !== documentId)
    setData(STORAGE_KEYS.LISTING_DOCUMENTS, filtered)

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// ADMIN REVIEW FUNCTIONS
// ============================================

/**
 * Get pending listings for admin review
 */
export const getPendingListings = async () => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const pending = listings.filter(l => l.status === LISTING_STATUS.PENDING_REVIEW)

    // Get media for each listing
    const media = getData(STORAGE_KEYS.LISTING_MEDIA)
    const documents = getData(STORAGE_KEYS.LISTING_DOCUMENTS)

    const listingsWithDetails = pending.map(listing => ({
      ...listing,
      media: media.filter(m => m.listingId === listing.id),
      documents: documents.filter(d => d.listingId === listing.id),
    }))

    // Sort by submission date (oldest first)
    listingsWithDetails.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))

    return { success: true, listings: listingsWithDetails }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Admin: Approve listing
 */
export const approveListing = async (listingId, adminId, notes = '') => {
  try {
    const listings = getData(STORAGE_KEYS.LISTINGS)
    const index = listings.findIndex(l => l.id === listingId)

    if (index === -1) {
      return { success: false, error: 'Listing not found' }
    }

    listings[index] = {
      ...listings[index],
      status: LISTING_STATUS.APPROVED,
      approvedAt: new Date().toISOString(),
      approvedBy: adminId,
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.LISTINGS, listings)

    // Create audit log
    await createReviewLog(listingId, 'approved', adminId, notes || 'Listing approved')

    return { success: true, listing: listings[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Admin: Reject listing
 */
export const rejectListing = async (listingId, adminId, reason) => {
  try {
    if (!reason) {
      return { success: false, error: 'Rejection reason is required' }
    }

    const listings = getData(STORAGE_KEYS.LISTINGS)
    const index = listings.findIndex(l => l.id === listingId)

    if (index === -1) {
      return { success: false, error: 'Listing not found' }
    }

    listings[index] = {
      ...listings[index],
      status: LISTING_STATUS.REJECTED,
      rejectedAt: new Date().toISOString(),
      rejectedBy: adminId,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.LISTINGS, listings)

    // Create audit log
    await createReviewLog(listingId, 'rejected', adminId, reason)

    return { success: true, listing: listings[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Admin: Request revision
 */
export const requestListingRevision = async (listingId, adminId, feedback) => {
  try {
    if (!feedback) {
      return { success: false, error: 'Revision feedback is required' }
    }

    const listings = getData(STORAGE_KEYS.LISTINGS)
    const index = listings.findIndex(l => l.id === listingId)

    if (index === -1) {
      return { success: false, error: 'Listing not found' }
    }

    listings[index] = {
      ...listings[index],
      status: LISTING_STATUS.REVISION_REQUESTED,
      revisionRequestedAt: new Date().toISOString(),
      revisionRequestedBy: adminId,
      revisionFeedback: feedback,
      updatedAt: new Date().toISOString(),
    }

    setData(STORAGE_KEYS.LISTINGS, listings)

    // Create audit log
    await createReviewLog(listingId, 'revision_requested', adminId, feedback)

    return { success: true, listing: listings[index] }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Create review audit log
 */
export const createReviewLog = async (listingId, action, adminId, notes) => {
  try {
    const reviews = getData(STORAGE_KEYS.LISTING_REVIEWS)

    const newReview = {
      id: generateId('review_'),
      listingId,
      action,
      adminId,
      notes,
      createdAt: new Date().toISOString(),
    }

    reviews.push(newReview)
    setData(STORAGE_KEYS.LISTING_REVIEWS, reviews)

    return { success: true, review: newReview }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Get review history for a listing
 */
export const getListingReviewHistory = async (listingId) => {
  try {
    const reviews = getData(STORAGE_KEYS.LISTING_REVIEWS)
    const listingReviews = reviews.filter(r => r.listingId === listingId)

    // Sort by date (newest first)
    listingReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return { success: true, reviews: listingReviews }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ============================================
// DEMO DATA SEEDING
// ============================================

/**
 * Seed demo data for testing Phase 2A
 */
export const seedDemoData = async () => {
  // Clear existing Step 2 data
  Object.values(STORAGE_KEYS).forEach(key => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  })

  // Demo seller profiles
  const sellerProfiles = [
    {
      id: 'seller_demo_1',
      userId: 'demo_seller_1',
      fullName: 'Ahmad Khan',
      email: 'ahmad.khan@example.com',
      phone: '+92 300 1234567',
      cnicNumber: '35201-1234567-1',
      businessName: 'Khan Properties',
      businessType: 'individual',
      businessAddress: 'DHA Phase 5, Lahore',
      verificationStatus: SELLER_STATUS.VERIFIED,
      kycDocuments: [
        { type: 'cnic_front', name: 'CNIC Front.jpg', url: '/demo/cnic-front.jpg' },
        { type: 'cnic_back', name: 'CNIC Back.jpg', url: '/demo/cnic-back.jpg' },
      ],
      createdAt: '2025-12-01T10:00:00.000Z',
      updatedAt: '2025-12-05T14:30:00.000Z',
      verifiedAt: '2025-12-05T14:30:00.000Z',
    },
    {
      id: 'seller_demo_2',
      userId: 'demo_seller_2',
      fullName: 'Sara Ahmed',
      email: 'sara.ahmed@example.com',
      phone: '+92 321 9876543',
      cnicNumber: '35201-9876543-2',
      businessName: 'Ahmed Realty',
      businessType: 'company',
      businessAddress: 'Gulberg III, Lahore',
      verificationStatus: SELLER_STATUS.PENDING,
      kycDocuments: [
        { type: 'cnic_front', name: 'CNIC Front.jpg', url: '/demo/cnic-front.jpg' },
      ],
      createdAt: '2026-01-10T09:00:00.000Z',
      updatedAt: '2026-01-10T09:00:00.000Z',
      kycSubmittedAt: '2026-01-10T09:00:00.000Z',
    },
  ]

  // Demo listings
  const listings = [
    {
      id: 'listing_demo_1',
      sellerId: 'seller_demo_1',
      userId: 'demo_seller_1',
      title: 'Luxury 4-Bedroom Villa in DHA',
      propertyType: 'villa',
      location: 'DHA Phase 6, Lahore',
      city: 'Lahore',
      area: 500,
      areaUnit: 'sqyd',
      bedrooms: 4,
      bathrooms: 5,
      askingPrice: 85000000,
      description: 'Beautiful 4-bedroom villa with modern amenities, swimming pool, and landscaped garden. Prime location in DHA Phase 6.',
      features: ['Swimming Pool', 'Garden', 'Servant Quarter', 'Security System'],
      status: LISTING_STATUS.APPROVED,
      createdAt: '2025-12-10T10:00:00.000Z',
      updatedAt: '2025-12-15T14:00:00.000Z',
      submittedAt: '2025-12-12T10:00:00.000Z',
      approvedAt: '2025-12-15T14:00:00.000Z',
      approvedBy: 'admin_1',
    },
    {
      id: 'listing_demo_2',
      sellerId: 'seller_demo_1',
      userId: 'demo_seller_1',
      title: 'Commercial Plot in Johar Town',
      propertyType: 'commercial_plot',
      location: 'Johar Town Block G, Lahore',
      city: 'Lahore',
      area: 2,
      areaUnit: 'kanal',
      askingPrice: 120000000,
      description: 'Prime commercial plot on main boulevard. Ideal for plaza or commercial building. All utilities available.',
      features: ['Main Boulevard', 'Corner Plot', 'Commercial Zone'],
      status: LISTING_STATUS.PENDING_REVIEW,
      createdAt: '2026-01-05T09:00:00.000Z',
      updatedAt: '2026-01-08T11:00:00.000Z',
      submittedAt: '2026-01-08T11:00:00.000Z',
    },
    {
      id: 'listing_demo_3',
      sellerId: 'seller_demo_1',
      userId: 'demo_seller_1',
      title: 'Modern Apartment in Bahria Town',
      propertyType: 'apartment',
      location: 'Bahria Town Sector E, Lahore',
      city: 'Lahore',
      area: 1800,
      areaUnit: 'sqft',
      bedrooms: 3,
      bathrooms: 3,
      askingPrice: 25000000,
      description: 'Fully furnished 3-bedroom apartment with scenic views. Located in gated community with 24/7 security.',
      features: ['Furnished', 'Gym', 'Parking', 'Community Pool'],
      status: LISTING_STATUS.PENDING_REVIEW,
      createdAt: '2026-01-10T14:00:00.000Z',
      updatedAt: '2026-01-11T09:00:00.000Z',
      submittedAt: '2026-01-11T09:00:00.000Z',
    },
    {
      id: 'listing_demo_4',
      sellerId: 'seller_demo_1',
      userId: 'demo_seller_1',
      title: '10 Marla House in Model Town',
      propertyType: 'house',
      location: 'Model Town Block J, Lahore',
      city: 'Lahore',
      area: 10,
      areaUnit: 'marla',
      bedrooms: 5,
      bathrooms: 4,
      askingPrice: 45000000,
      description: 'Well-maintained 10 marla house in prime location. Recently renovated with modern fixtures.',
      features: ['Renovated', 'Lawn', 'Garage', 'Store Room'],
      status: LISTING_STATUS.APPROVED,
      createdAt: '2025-11-20T10:00:00.000Z',
      updatedAt: '2025-11-25T16:00:00.000Z',
      submittedAt: '2025-11-22T10:00:00.000Z',
      approvedAt: '2025-11-25T16:00:00.000Z',
      approvedBy: 'admin_1',
    },
    {
      id: 'listing_demo_5',
      sellerId: 'seller_demo_2',
      userId: 'demo_seller_2',
      title: 'Farm House in Bedian Road',
      propertyType: 'farmhouse',
      location: 'Bedian Road, Lahore',
      city: 'Lahore',
      area: 4,
      areaUnit: 'kanal',
      bedrooms: 6,
      bathrooms: 6,
      askingPrice: 150000000,
      description: 'Luxurious farm house with lush green lawns, fruit orchard, and modern architecture.',
      features: ['Orchard', 'Swimming Pool', 'BBQ Area', 'Guest House'],
      status: LISTING_STATUS.DRAFT,
      createdAt: '2026-01-12T10:00:00.000Z',
      updatedAt: '2026-01-12T10:00:00.000Z',
    },
  ]

  // Demo media
  const media = [
    { id: 'media_1', listingId: 'listing_demo_1', type: 'photo', name: 'Front View', url: '/house1.jpg', isPrimary: true, uploadedAt: '2025-12-10T10:00:00.000Z' },
    { id: 'media_2', listingId: 'listing_demo_1', type: 'photo', name: 'Living Room', url: '/house2.jpg', isPrimary: false, uploadedAt: '2025-12-10T10:01:00.000Z' },
    { id: 'media_3', listingId: 'listing_demo_1', type: 'photo', name: 'Garden', url: '/house3.jpg', isPrimary: false, uploadedAt: '2025-12-10T10:02:00.000Z' },
    { id: 'media_4', listingId: 'listing_demo_2', type: 'photo', name: 'Plot View', url: '/house4.jpg', isPrimary: true, uploadedAt: '2026-01-05T09:00:00.000Z' },
    { id: 'media_5', listingId: 'listing_demo_3', type: 'photo', name: 'Apartment Exterior', url: '/house5.jpg', isPrimary: true, uploadedAt: '2026-01-10T14:00:00.000Z' },
    { id: 'media_6', listingId: 'listing_demo_3', type: 'photo', name: 'Kitchen', url: '/house1.jpg', isPrimary: false, uploadedAt: '2026-01-10T14:01:00.000Z' },
    { id: 'media_7', listingId: 'listing_demo_4', type: 'photo', name: 'House Front', url: '/house2.jpg', isPrimary: true, uploadedAt: '2025-11-20T10:00:00.000Z' },
    { id: 'media_8', listingId: 'listing_demo_4', type: 'photo', name: 'Bedroom', url: '/house3.jpg', isPrimary: false, uploadedAt: '2025-11-20T10:01:00.000Z' },
  ]

  // Demo documents
  const documents = [
    { id: 'doc_1', listingId: 'listing_demo_1', type: 'ownership', name: 'Title Deed.pdf', url: '/demo/deed.pdf', uploadedAt: '2025-12-10T10:00:00.000Z' },
    { id: 'doc_2', listingId: 'listing_demo_2', type: 'ownership', name: 'Plot Registry.pdf', url: '/demo/registry.pdf', uploadedAt: '2026-01-05T09:00:00.000Z' },
    { id: 'doc_3', listingId: 'listing_demo_3', type: 'ownership', name: 'Apartment Deed.pdf', url: '/demo/deed.pdf', uploadedAt: '2026-01-10T14:00:00.000Z' },
    { id: 'doc_4', listingId: 'listing_demo_4', type: 'ownership', name: 'House Registry.pdf', url: '/demo/registry.pdf', uploadedAt: '2025-11-20T10:00:00.000Z' },
  ]

  // Demo review logs
  const reviews = [
    { id: 'review_1', listingId: 'listing_demo_1', action: 'submitted', adminId: null, notes: 'Listing submitted for review', createdAt: '2025-12-12T10:00:00.000Z' },
    { id: 'review_2', listingId: 'listing_demo_1', action: 'approved', adminId: 'admin_1', notes: 'All documents verified. Property inspection passed.', createdAt: '2025-12-15T14:00:00.000Z' },
    { id: 'review_3', listingId: 'listing_demo_4', action: 'submitted', adminId: null, notes: 'Listing submitted for review', createdAt: '2025-11-22T10:00:00.000Z' },
    { id: 'review_4', listingId: 'listing_demo_4', action: 'approved', adminId: 'admin_1', notes: 'Verified and approved', createdAt: '2025-11-25T16:00:00.000Z' },
    { id: 'review_5', listingId: 'listing_demo_2', action: 'submitted', adminId: null, notes: 'Listing submitted for review', createdAt: '2026-01-08T11:00:00.000Z' },
    { id: 'review_6', listingId: 'listing_demo_3', action: 'submitted', adminId: null, notes: 'Listing submitted for review', createdAt: '2026-01-11T09:00:00.000Z' },
  ]

  // Save all demo data
  setData(STORAGE_KEYS.SELLER_PROFILES, sellerProfiles)
  setData(STORAGE_KEYS.LISTINGS, listings)
  setData(STORAGE_KEYS.LISTING_MEDIA, media)
  setData(STORAGE_KEYS.LISTING_DOCUMENTS, documents)
  setData(STORAGE_KEYS.LISTING_REVIEWS, reviews)

  return {
    success: true,
    message: 'Demo data seeded successfully',
    counts: {
      sellers: sellerProfiles.length,
      listings: listings.length,
      media: media.length,
      documents: documents.length,
      reviews: reviews.length,
    }
  }
}
