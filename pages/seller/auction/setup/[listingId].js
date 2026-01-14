/**
 * Seller Auction Setup Page
 * Phase 2B: Auction Engine & Live Bidding
 *
 * Allows sellers to configure and launch auctions for their approved listings
 * - Set base price
 * - Set reserve price (optional)
 * - Set buy now price (optional)
 * - Set auction duration
 * - Set urgency level
 */

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFirebase } from '../../../../contexts/FirebaseContext'
import { getListing, getListingMedia, getSellerProfile, LISTING_STATUS } from '../../../../lib/step2-auction-service'
import { createAuction, getAuctionByListing, formatPrice } from '../../../../lib/step2-auction-engine'

export default function AuctionSetupPage() {
  const router = useRouter()
  const { listingId } = router.query
  const { user, loading: authLoading } = useFirebase()

  const [listing, setListing] = useState(null)
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    basePrice: '',
    reservePrice: '',
    buyNowPrice: '',
    duration: '72', // hours
    urgency: 'standard',
    startImmediately: true,
  })

  const [formErrors, setFormErrors] = useState({})

  // Check if user has permission
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=' + encodeURIComponent(router.asPath))
    }
  }, [user, authLoading, router])

  // Load listing data
  useEffect(() => {
    const loadData = async () => {
      if (!listingId || !user) return

      try {
        setLoading(true)
        setError(null)

        // Get listing
        const listingResult = await getListing(listingId)
        if (!listingResult.success) {
          setError('Listing not found')
          setLoading(false)
          return
        }

        const listingData = listingResult.listing

        // Check ownership
        if (listingData.userId !== user.uid) {
          setError('You do not have permission to create an auction for this listing')
          setLoading(false)
          return
        }

        // Check if listing is approved
        if (listingData.status !== LISTING_STATUS.APPROVED) {
          setError('Only approved listings can be auctioned. Current status: ' + listingData.status)
          setLoading(false)
          return
        }

        // Check if auction already exists
        const existingAuction = await getAuctionByListing(listingId)
        if (existingAuction.success) {
          router.replace(`/auction/${existingAuction.auction.id}`)
          return
        }

        setListing(listingData)
        setMedia(listingData.media || [])

        // Pre-fill base price from asking price
        if (listingData.askingPrice) {
          setFormData(prev => ({
            ...prev,
            basePrice: listingData.askingPrice.toString(),
          }))
        }

        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadData()
  }, [listingId, user, router])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Handle price input (numbers only)
  const handlePriceChange = (e) => {
    const { name, value } = e.target
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({
      ...prev,
      [name]: numericValue,
    }))

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}
    const basePrice = parseInt(formData.basePrice, 10)
    const reservePrice = formData.reservePrice ? parseInt(formData.reservePrice, 10) : null
    const buyNowPrice = formData.buyNowPrice ? parseInt(formData.buyNowPrice, 10) : null

    if (!formData.basePrice || isNaN(basePrice) || basePrice <= 0) {
      errors.basePrice = 'Base price is required and must be greater than 0'
    }

    if (reservePrice && reservePrice < basePrice) {
      errors.reservePrice = 'Reserve price cannot be less than base price'
    }

    if (buyNowPrice) {
      if (buyNowPrice <= basePrice) {
        errors.buyNowPrice = 'Buy now price must be higher than base price'
      }
      if (reservePrice && buyNowPrice <= reservePrice) {
        errors.buyNowPrice = 'Buy now price must be higher than reserve price'
      }
    }

    if (!formData.duration) {
      errors.duration = 'Please select an auction duration'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Get seller profile
      const profileResult = await getSellerProfile(user.uid)
      const sellerId = profileResult.success ? profileResult.profile.id : user.uid

      const auctionData = {
        basePrice: parseInt(formData.basePrice, 10),
        reservePrice: formData.reservePrice ? parseInt(formData.reservePrice, 10) : null,
        buyNowPrice: formData.buyNowPrice ? parseInt(formData.buyNowPrice, 10) : null,
        duration: parseInt(formData.duration, 10),
        urgency: formData.urgency,
        startImmediately: formData.startImmediately,
      }

      const result = await createAuction(listingId, sellerId, auctionData)

      if (result.success) {
        router.push(`/auction/${result.auction.id}?created=true`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Loading...</p>
        <style jsx>{`
          .page-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #c9a227;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error && !listing) {
    return (
      <div className="error-page">
        <h2>Cannot Create Auction</h2>
        <p>{error}</p>
        <Link href="/seller/dashboard" className="btn-back">
          Back to Dashboard
        </Link>
        <style jsx>{`
          .error-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 2rem;
          }
          .btn-back {
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: #c9a227;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          }
        `}</style>
      </div>
    )
  }

  const primaryImage = media.find(m => m.isPrimary) || media[0]

  return (
    <>
      <Head>
        <title>Launch Auction - {listing?.title || 'Listing'} | REMMIC</title>
      </Head>

      <div className="setup-page">
        <div className="setup-container">
          {/* Header */}
          <header className="setup-header">
            <Link href="/seller/dashboard" className="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
            <h1>Launch Auction</h1>
            <p>Configure your auction settings for this property</p>
          </header>

          <div className="setup-content">
            {/* Listing Preview */}
            <div className="listing-preview">
              <div className="preview-image">
                {primaryImage ? (
                  <img
                    src={primaryImage.url || '/house1.jpg'}
                    alt={listing.title}
                    onError={(e) => { e.target.src = '/house1.jpg' }}
                  />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="preview-info">
                <h3>{listing.title}</h3>
                <p className="location">{listing.location}, {listing.city}</p>
                <div className="details-row">
                  <span>{listing.area} {listing.areaUnit}</span>
                  {listing.bedrooms && <span>{listing.bedrooms} Beds</span>}
                  {listing.bathrooms && <span>{listing.bathrooms} Baths</span>}
                </div>
                <p className="asking-price">
                  Asking Price: {formatPrice(listing.askingPrice)}
                </p>
              </div>
            </div>

            {/* Setup Form */}
            <form onSubmit={handleSubmit} className="setup-form">
              {error && (
                <div className="alert alert-error">{error}</div>
              )}

              {/* Base Price */}
              <div className="form-group">
                <label htmlFor="basePrice">
                  Starting Price <span className="required">*</span>
                </label>
                <p className="field-hint">
                  The minimum price at which bidding will start
                </p>
                <div className="price-input">
                  <span className="currency">PKR</span>
                  <input
                    type="text"
                    id="basePrice"
                    name="basePrice"
                    value={formData.basePrice ? parseInt(formData.basePrice).toLocaleString('en-PK') : ''}
                    onChange={handlePriceChange}
                    placeholder="Enter starting price"
                    className={formErrors.basePrice ? 'error' : ''}
                  />
                </div>
                {formErrors.basePrice && (
                  <span className="error-message">{formErrors.basePrice}</span>
                )}
              </div>

              {/* Reserve Price */}
              <div className="form-group">
                <label htmlFor="reservePrice">
                  Reserve Price <span className="optional">(Optional)</span>
                </label>
                <p className="field-hint">
                  Minimum price you will accept. If not met, the property will not sell.
                </p>
                <div className="price-input">
                  <span className="currency">PKR</span>
                  <input
                    type="text"
                    id="reservePrice"
                    name="reservePrice"
                    value={formData.reservePrice ? parseInt(formData.reservePrice).toLocaleString('en-PK') : ''}
                    onChange={handlePriceChange}
                    placeholder="Enter reserve price"
                    className={formErrors.reservePrice ? 'error' : ''}
                  />
                </div>
                {formErrors.reservePrice && (
                  <span className="error-message">{formErrors.reservePrice}</span>
                )}
              </div>

              {/* Buy Now Price */}
              <div className="form-group">
                <label htmlFor="buyNowPrice">
                  Buy Now Price <span className="optional">(Optional)</span>
                </label>
                <p className="field-hint">
                  Allow buyers to purchase immediately at this price, ending the auction.
                </p>
                <div className="price-input">
                  <span className="currency">PKR</span>
                  <input
                    type="text"
                    id="buyNowPrice"
                    name="buyNowPrice"
                    value={formData.buyNowPrice ? parseInt(formData.buyNowPrice).toLocaleString('en-PK') : ''}
                    onChange={handlePriceChange}
                    placeholder="Enter buy now price"
                    className={formErrors.buyNowPrice ? 'error' : ''}
                  />
                </div>
                {formErrors.buyNowPrice && (
                  <span className="error-message">{formErrors.buyNowPrice}</span>
                )}
              </div>

              {/* Duration */}
              <div className="form-group">
                <label htmlFor="duration">
                  Auction Duration <span className="required">*</span>
                </label>
                <p className="field-hint">
                  How long the auction will run
                </p>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={formErrors.duration ? 'error' : ''}
                >
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="120">5 Days</option>
                  <option value="168">7 Days</option>
                  <option value="336">14 Days</option>
                </select>
                {formErrors.duration && (
                  <span className="error-message">{formErrors.duration}</span>
                )}
              </div>

              {/* Urgency */}
              <div className="form-group">
                <label>Urgency Level</label>
                <p className="field-hint">
                  Higher urgency means more visibility and faster sale
                </p>
                <div className="urgency-options">
                  <label className={`urgency-option ${formData.urgency === 'standard' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="urgency"
                      value="standard"
                      checked={formData.urgency === 'standard'}
                      onChange={handleChange}
                    />
                    <div className="urgency-content">
                      <span className="urgency-label">Standard</span>
                      <span className="urgency-desc">Normal listing visibility</span>
                    </div>
                  </label>
                  <label className={`urgency-option ${formData.urgency === 'urgent' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="urgency"
                      value="urgent"
                      checked={formData.urgency === 'urgent'}
                      onChange={handleChange}
                    />
                    <div className="urgency-content">
                      <span className="urgency-label">Urgent</span>
                      <span className="urgency-desc">Featured placement + badge</span>
                      <span className="urgency-fee">+PKR 3,000</span>
                    </div>
                  </label>
                  <label className={`urgency-option ${formData.urgency === 'emergency' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="urgency"
                      value="emergency"
                      checked={formData.urgency === 'emergency'}
                      onChange={handleChange}
                    />
                    <div className="urgency-content">
                      <span className="urgency-label">Emergency</span>
                      <span className="urgency-desc">Top placement + priority alerts</span>
                      <span className="urgency-fee">+PKR 5,000</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="summary-section">
                <h3>Auction Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Starting Price</span>
                    <span className="value">{formData.basePrice ? formatPrice(parseInt(formData.basePrice, 10)) : '-'}</span>
                  </div>
                  {formData.reservePrice && (
                    <div className="summary-item">
                      <span className="label">Reserve Price</span>
                      <span className="value">{formatPrice(parseInt(formData.reservePrice, 10))}</span>
                    </div>
                  )}
                  {formData.buyNowPrice && (
                    <div className="summary-item">
                      <span className="label">Buy Now Price</span>
                      <span className="value">{formatPrice(parseInt(formData.buyNowPrice, 10))}</span>
                    </div>
                  )}
                  <div className="summary-item">
                    <span className="label">Duration</span>
                    <span className="value">
                      {formData.duration === '24' && '24 Hours'}
                      {formData.duration === '48' && '48 Hours'}
                      {formData.duration === '72' && '3 Days'}
                      {formData.duration === '120' && '5 Days'}
                      {formData.duration === '168' && '7 Days'}
                      {formData.duration === '336' && '14 Days'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Urgency</span>
                    <span className="value" style={{ textTransform: 'capitalize' }}>{formData.urgency}</span>
                  </div>
                </div>
              </div>

              {/* Anti-sniping Notice */}
              <div className="info-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <div>
                  <strong>Anti-Sniping Protection</strong>
                  <p>
                    If a bid is placed in the last 5 minutes, the auction will automatically
                    extend by 5 minutes to ensure fair bidding.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <Link href="/seller/dashboard" className="btn-cancel">
                  Cancel
                </Link>
                <button type="submit" className="btn-launch" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-small" />
                      Launching...
                    </>
                  ) : (
                    'Launch Auction'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .setup-page {
          min-height: 100vh;
          background: #f9fafb;
          padding: 2rem 1rem;
        }

        .setup-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .setup-header {
          margin-bottom: 2rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          text-decoration: none;
          margin-bottom: 1rem;
        }

        .back-link:hover {
          color: #111827;
        }

        .setup-header h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
          color: #111827;
        }

        .setup-header p {
          margin: 0;
          color: #6b7280;
        }

        .setup-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        /* Listing Preview */
        .listing-preview {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .preview-image {
          width: 200px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e5e7eb;
          color: #9ca3af;
        }

        .preview-info {
          flex: 1;
        }

        .preview-info h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
        }

        .preview-info .location {
          margin: 0 0 0.5rem;
          color: #6b7280;
        }

        .details-row {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .asking-price {
          font-weight: 600;
          color: #c9a227;
          margin: 0;
        }

        /* Form */
        .setup-form {
          padding: 2rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .alert-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #111827;
        }

        .required {
          color: #dc2626;
        }

        .optional {
          color: #9ca3af;
          font-weight: 400;
          font-size: 0.875rem;
        }

        .field-hint {
          margin: 0 0 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .price-input {
          display: flex;
          align-items: center;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .price-input:focus-within {
          border-color: #c9a227;
        }

        .price-input .currency {
          padding: 0.75rem 1rem;
          background: #f9fafb;
          color: #6b7280;
          font-weight: 500;
        }

        .price-input input {
          flex: 1;
          border: none;
          padding: 0.75rem;
          font-size: 1rem;
          outline: none;
        }

        .price-input input.error {
          background: #fef2f2;
        }

        select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          background: white;
        }

        select:focus {
          border-color: #c9a227;
        }

        select.error {
          border-color: #dc2626;
        }

        .error-message {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.875rem;
          color: #dc2626;
        }

        /* Urgency Options */
        .urgency-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .urgency-option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .urgency-option:hover {
          border-color: #c9a227;
        }

        .urgency-option.selected {
          border-color: #c9a227;
          background: #fffbeb;
        }

        .urgency-option input {
          margin-top: 0.25rem;
        }

        .urgency-content {
          flex: 1;
        }

        .urgency-label {
          display: block;
          font-weight: 600;
        }

        .urgency-desc {
          display: block;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .urgency-fee {
          display: inline-block;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          background: #fef3c7;
          color: #92400e;
          border-radius: 4px;
        }

        /* Summary */
        .summary-section {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .summary-section h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .summary-item .label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .summary-item .value {
          font-weight: 600;
        }

        /* Info Box */
        .info-box {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #fffbeb;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .info-box svg {
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .info-box strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .info-box p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-cancel {
          padding: 0.875rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
        }

        .btn-launch {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: #c9a227;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-launch:hover:not(:disabled) {
          background: #b8941f;
        }

        .btn-launch:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .listing-preview {
            flex-direction: column;
          }

          .preview-image {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-cancel {
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}
