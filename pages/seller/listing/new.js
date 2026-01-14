/**
 * Listing Submission Wizard
 *
 * Step 2 Phase 2A: 5-step property listing submission
 * Route: /seller/listing/new
 */

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { useFirebase } from '../../../contexts/FirebaseContext'
import {
  getSellerProfile,
  createListing,
  updateListing,
  addListingMedia,
  addListingDocument,
  submitListingForReview,
  SELLER_STATUS,
  LISTING_STATUS,
} from '../../../lib/step2-auction-service'

const WIZARD_STEPS = [
  { id: 1, title: 'Property Info', icon: 'home' },
  { id: 2, title: 'Details', icon: 'details' },
  { id: 3, title: 'Pricing', icon: 'price' },
  { id: 4, title: 'Photos', icon: 'camera' },
  { id: 5, title: 'Documents', icon: 'document' },
]

const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Residential Plot' },
  { value: 'commercial_plot', label: 'Commercial Plot' },
  { value: 'commercial', label: 'Commercial Building' },
  { value: 'farmhouse', label: 'Farm House' },
  { value: 'penthouse', label: 'Penthouse' },
]

const AREA_UNITS = [
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'sqyd', label: 'Sq. Yd.' },
  { value: 'marla', label: 'Marla' },
  { value: 'kanal', label: 'Kanal' },
]

const FEATURES = [
  'Swimming Pool', 'Garden', 'Garage', 'Servant Quarter',
  'Security System', 'CCTV', 'Solar Panels', 'Central AC',
  'Gym', 'Elevator', 'Basement', 'Terrace',
  'Lawn', 'Store Room', 'Furnished', 'Corner Plot',
]

export default function NewListing() {
  const router = useRouter()
  const { user, loading: authLoading } = useFirebase()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [sellerProfile, setSellerProfile] = useState(null)
  const [listingId, setListingId] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Property Info
    title: '',
    propertyType: '',
    location: '',
    city: '',
    // Step 2: Details
    area: '',
    areaUnit: 'marla',
    bedrooms: '',
    bathrooms: '',
    description: '',
    features: [],
    // Step 3: Pricing
    askingPrice: '',
    reservePrice: '',
    // Step 4: Photos
    photos: [],
    // Step 5: Documents
    documents: [],
  })

  // Check seller verification status
  useEffect(() => {
    const checkSellerStatus = async () => {
      if (user?.uid) {
        const result = await getSellerProfile(user.uid)
        if (result.success) {
          setSellerProfile(result.profile)
        }
      }
    }
    checkSellerStatus()
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('redirectAfterLogin', '/seller/listing/new')
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    const newPhotos = files.map((file, index) => ({
      id: `photo_${Date.now()}_${index}`,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      isPrimary: formData.photos.length === 0 && index === 0,
    }))

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 10), // Max 10 photos
    }))
  }

  const handleRemovePhoto = (photoId) => {
    setFormData(prev => {
      const filtered = prev.photos.filter(p => p.id !== photoId)
      // If we removed the primary, set first as primary
      if (filtered.length > 0 && !filtered.some(p => p.isPrimary)) {
        filtered[0].isPrimary = true
      }
      return { ...prev, photos: filtered }
    })
  }

  const handleSetPrimaryPhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map(p => ({
        ...p,
        isPrimary: p.id === photoId,
      })),
    }))
  }

  const handleDocumentUpload = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      const newDoc = {
        id: `doc_${Date.now()}`,
        type: docType,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents.filter(d => d.type !== docType), newDoc],
      }))
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) return 'Property title is required'
        if (!formData.propertyType) return 'Property type is required'
        if (!formData.location.trim()) return 'Location is required'
        if (!formData.city) return 'City is required'
        break
      case 2:
        if (!formData.area) return 'Area size is required'
        if (formData.area <= 0) return 'Area must be a positive number'
        if (!formData.description.trim()) return 'Description is required'
        if (formData.description.length < 50) return 'Description should be at least 50 characters'
        break
      case 3:
        if (!formData.askingPrice) return 'Asking price is required'
        if (formData.askingPrice <= 0) return 'Asking price must be greater than 0'
        break
      case 4:
        if (formData.photos.length === 0) return 'At least one photo is required'
        break
      case 5:
        // Documents are optional but recommended
        break
    }
    return null
  }

  const saveDraft = async () => {
    setIsSaving(true)
    try {
      if (!listingId) {
        // Create new listing
        const result = await createListing(sellerProfile.id, user.uid, formData)
        if (result.success) {
          setListingId(result.listing.id)
          // Save photos
          for (const photo of formData.photos) {
            await addListingMedia(result.listing.id, {
              type: 'photo',
              name: photo.name,
              url: photo.url,
              isPrimary: photo.isPrimary,
            })
          }
          // Save documents
          for (const doc of formData.documents) {
            await addListingDocument(result.listing.id, {
              type: doc.type,
              name: doc.name,
              url: doc.url,
            })
          }
        }
      } else {
        // Update existing listing
        await updateListing(listingId, formData)
      }
    } catch (err) {
      setError('Failed to save draft')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      return
    }

    // Auto-save as draft when moving forward
    if (currentStep === 1 && !listingId) {
      await saveDraft()
    }

    setCurrentStep(prev => Math.min(prev + 1, 5))
    setError('')
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmitForReview = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Ensure listing is created/updated
      if (!listingId) {
        const createResult = await createListing(sellerProfile.id, user.uid, formData)
        if (!createResult.success) {
          throw new Error(createResult.error)
        }
        setListingId(createResult.listing.id)

        // Save photos
        for (const photo of formData.photos) {
          await addListingMedia(createResult.listing.id, {
            type: 'photo',
            name: photo.name,
            url: photo.url,
            isPrimary: photo.isPrimary,
          })
        }

        // Save documents
        for (const doc of formData.documents) {
          await addListingDocument(createResult.listing.id, {
            type: doc.type,
            name: doc.name,
            url: doc.url,
          })
        }

        // Submit for review
        const submitResult = await submitListingForReview(createResult.listing.id)
        if (!submitResult.success) {
          throw new Error(submitResult.error)
        }
      } else {
        // Update and submit
        await updateListing(listingId, formData)

        // Update photos
        for (const photo of formData.photos) {
          await addListingMedia(listingId, {
            type: 'photo',
            name: photo.name,
            url: photo.url,
            isPrimary: photo.isPrimary,
          })
        }

        // Update documents
        for (const doc of formData.documents) {
          await addListingDocument(listingId, {
            type: doc.type,
            name: doc.name,
            url: doc.url,
          })
        }

        const submitResult = await submitListingForReview(listingId)
        if (!submitResult.success) {
          throw new Error(submitResult.error)
        }
      }

      // Redirect to dashboard with success message
      router.push('/seller/dashboard?submitted=true')
    } catch (err) {
      setError(err.message || 'Failed to submit listing. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Check if seller is verified
  if (sellerProfile && sellerProfile.verificationStatus !== SELLER_STATUS.VERIFIED) {
    return (
      <>
        <Head>
          <title>Verification Required - REMMIC</title>
        </Head>
        <div className="page-wrapper">
          <Navbar />
          <main className="wizard-main">
            <div className="wizard-container">
              <div className="alert-card alert-card--warning">
                <div className="alert-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2>Seller Verification Required</h2>
                <p>
                  {sellerProfile.verificationStatus === SELLER_STATUS.PENDING
                    ? 'Your KYC documents are being reviewed. You\'ll be able to create listings once verified.'
                    : 'Please complete your seller registration and KYC verification to start listing properties.'}
                </p>
                <div className="alert-actions">
                  {sellerProfile.verificationStatus === SELLER_STATUS.PENDING ? (
                    <Link href="/seller/dashboard" className="btn btn--primary">
                      Check Status
                    </Link>
                  ) : (
                    <Link href="/seller/register" className="btn btn--primary">
                      Complete Registration
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
        <style jsx>{`
          .wizard-main {
            padding: 120px 5% 80px;
            min-height: calc(100vh - 200px);
            background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
          }
          .wizard-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .alert-card {
            background: #fff;
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          }
          .alert-icon {
            margin-bottom: 24px;
          }
          .alert-card h2 {
            font-size: 1.5rem;
            color: #0a0a0a;
            margin: 0 0 12px;
          }
          .alert-card p {
            color: #6b7280;
            margin: 0 0 32px;
            line-height: 1.6;
          }
          .alert-actions {
            display: flex;
            justify-content: center;
          }
          .btn {
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
          }
          .btn--primary {
            background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
            color: #0a0a0a;
          }
        `}</style>
      </>
    )
  }

  // If not a seller at all
  if (!authLoading && user && !sellerProfile) {
    return (
      <>
        <Head>
          <title>Register as Seller - REMMIC</title>
        </Head>
        <div className="page-wrapper">
          <Navbar />
          <main className="wizard-main">
            <div className="wizard-container">
              <div className="alert-card">
                <div className="alert-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <h2>Become a Seller</h2>
                <p>Register as a seller to list your properties on REMMIC&apos;s auction platform.</p>
                <div className="alert-actions">
                  <Link href="/seller/register" className="btn btn--primary">
                    Register as Seller
                  </Link>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
        <style jsx>{`
          .wizard-main {
            padding: 120px 5% 80px;
            min-height: calc(100vh - 200px);
            background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
          }
          .wizard-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .alert-card {
            background: #fff;
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          }
          .alert-icon {
            margin-bottom: 24px;
          }
          .alert-card h2 {
            font-size: 1.5rem;
            color: #0a0a0a;
            margin: 0 0 12px;
          }
          .alert-card p {
            color: #6b7280;
            margin: 0 0 32px;
          }
          .alert-actions {
            display: flex;
            justify-content: center;
          }
          .btn {
            padding: 14px 28px;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s;
          }
          .btn--primary {
            background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
            color: #0a0a0a;
          }
        `}</style>
      </>
    )
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span>Loading...</span>
      </div>
    )
  }

  const formatPrice = (value) => {
    if (!value) return ''
    return new Intl.NumberFormat('en-PK').format(value)
  }

  return (
    <>
      <Head>
        <title>Create New Listing - REMMIC Seller</title>
        <meta name="description" content="Submit your property listing for auction on REMMIC" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="wizard-main">
          <div className="wizard-container">
            {/* Header */}
            <div className="wizard-header">
              <h1>Create New Listing</h1>
              <p>List your property on REMMIC&apos;s auction platform</p>
            </div>

            {/* Progress Steps */}
            <div className="steps-nav">
              {WIZARD_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  className={`step-btn ${currentStep === step.id ? 'step-btn--active' : ''} ${currentStep > step.id ? 'step-btn--completed' : ''}`}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                >
                  <span className="step-btn__number">
                    {currentStep > step.id ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : step.id}
                  </span>
                  <span className="step-btn__title">{step.title}</span>
                </button>
              ))}
            </div>

            {/* Form Card */}
            <div className="form-card">
              {/* Step 1: Property Info */}
              {currentStep === 1 && (
                <div className="step-content">
                  <h2>Property Information</h2>
                  <p>Basic details about your property</p>

                  <div className="form-grid">
                    <div className="form-group form-group--full">
                      <label>Property Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Luxury 4-Bedroom Villa in DHA Phase 6"
                        maxLength={100}
                      />
                      <span className="form-hint">{formData.title.length}/100 characters</span>
                    </div>

                    <div className="form-group">
                      <label>Property Type *</label>
                      <select
                        value={formData.propertyType}
                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      >
                        <option value="">Select Type</option>
                        {PROPERTY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>City *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      >
                        <option value="">Select City</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Multan">Multan</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group form-group--full">
                      <label>Location / Address *</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., DHA Phase 6, Block J, Street 15"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Details */}
              {currentStep === 2 && (
                <div className="step-content">
                  <h2>Property Details</h2>
                  <p>Specifications and features</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Area Size *</label>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          value={formData.area}
                          onChange={(e) => handleInputChange('area', e.target.value)}
                          placeholder="e.g., 10"
                          min="0"
                        />
                        <select
                          value={formData.areaUnit}
                          onChange={(e) => handleInputChange('areaUnit', e.target.value)}
                        >
                          {AREA_UNITS.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {['house', 'apartment', 'villa', 'penthouse', 'farmhouse'].includes(formData.propertyType) && (
                      <>
                        <div className="form-group">
                          <label>Bedrooms</label>
                          <select
                            value={formData.bedrooms}
                            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                          >
                            <option value="">Select</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Bathrooms</label>
                          <select
                            value={formData.bathrooms}
                            onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                          >
                            <option value="">Select</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="form-group form-group--full">
                      <label>Description *</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your property in detail. Include key features, nearby amenities, and any unique selling points."
                        rows={5}
                      />
                      <span className="form-hint">{formData.description.length} characters (minimum 50)</span>
                    </div>

                    <div className="form-group form-group--full">
                      <label>Features</label>
                      <div className="features-grid">
                        {FEATURES.map(feature => (
                          <label key={feature} className="feature-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.features.includes(feature)}
                              onChange={() => handleFeatureToggle(feature)}
                            />
                            <span>{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing */}
              {currentStep === 3 && (
                <div className="step-content">
                  <h2>Pricing</h2>
                  <p>Set your asking price</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Asking Price (PKR) *</label>
                      <div className="price-input">
                        <span className="price-prefix">PKR</span>
                        <input
                          type="number"
                          value={formData.askingPrice}
                          onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                          placeholder="e.g., 50000000"
                          min="0"
                        />
                      </div>
                      {formData.askingPrice > 0 && (
                        <span className="price-formatted">
                          {formatPrice(formData.askingPrice)} PKR
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Reserve Price (Optional)</label>
                      <div className="price-input">
                        <span className="price-prefix">PKR</span>
                        <input
                          type="number"
                          value={formData.reservePrice}
                          onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                          placeholder="Minimum acceptable price"
                          min="0"
                        />
                      </div>
                      <span className="form-hint">Property won&apos;t sell below this price</span>
                    </div>
                  </div>

                  <div className="info-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <p>The asking price will be the starting bid for your auction. REMMIC charges a 2% success fee on completed sales.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Photos */}
              {currentStep === 4 && (
                <div className="step-content">
                  <h2>Property Photos</h2>
                  <p>Upload high-quality photos (max 10)</p>

                  <div className="upload-area">
                    {formData.photos.length < 10 && (
                      <label className="upload-zone">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                        />
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>Click to upload or drag and drop</span>
                        <span className="upload-hint">PNG, JPG up to 5MB each</span>
                      </label>
                    )}

                    {formData.photos.length > 0 && (
                      <div className="photos-grid">
                        {formData.photos.map((photo) => (
                          <div key={photo.id} className={`photo-item ${photo.isPrimary ? 'photo-item--primary' : ''}`}>
                            <img src={photo.url} alt={photo.name} />
                            <div className="photo-overlay">
                              <button
                                type="button"
                                className="photo-action"
                                onClick={() => handleSetPrimaryPhoto(photo.id)}
                                title="Set as primary"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={photo.isPrimary ? '#c9a227' : 'none'} stroke="currentColor" strokeWidth="2">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="photo-action photo-action--delete"
                                onClick={() => handleRemovePhoto(photo.id)}
                                title="Remove"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                            {photo.isPrimary && <span className="primary-badge">Primary</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="photo-count">{formData.photos.length}/10 photos uploaded</p>
                </div>
              )}

              {/* Step 5: Documents */}
              {currentStep === 5 && (
                <div className="step-content">
                  <h2>Ownership Documents</h2>
                  <p>Upload property ownership documents for verification</p>

                  <div className="documents-grid">
                    <div className="document-upload">
                      <label>Title Deed / Registry</label>
                      <div className="upload-box">
                        {formData.documents.find(d => d.type === 'deed') ? (
                          <div className="upload-preview">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{formData.documents.find(d => d.type === 'deed').name}</span>
                          </div>
                        ) : (
                          <label className="upload-label">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'deed')}
                            />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>Upload Document</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="document-upload">
                      <label>Utility Bill (Address Proof)</label>
                      <div className="upload-box">
                        {formData.documents.find(d => d.type === 'utility') ? (
                          <div className="upload-preview">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{formData.documents.find(d => d.type === 'utility').name}</span>
                          </div>
                        ) : (
                          <label className="upload-label">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'utility')}
                            />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>Upload Document</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="document-upload">
                      <label>Tax Receipt (Optional)</label>
                      <div className="upload-box">
                        {formData.documents.find(d => d.type === 'tax') ? (
                          <div className="upload-preview">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{formData.documents.find(d => d.type === 'tax').name}</span>
                          </div>
                        ) : (
                          <label className="upload-label">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentUpload(e, 'tax')}
                            />
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>Upload Document</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="submit-summary">
                    <h3>Ready to Submit?</h3>
                    <p>Your listing will be reviewed by our team within 24-48 hours. You&apos;ll be notified once approved.</p>
                    <ul className="checklist">
                      <li className={formData.title ? 'checked' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {formData.title ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
                        </svg>
                        Property information complete
                      </li>
                      <li className={formData.description ? 'checked' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {formData.description ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
                        </svg>
                        Details and description added
                      </li>
                      <li className={formData.askingPrice ? 'checked' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {formData.askingPrice ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
                        </svg>
                        Pricing set
                      </li>
                      <li className={formData.photos.length > 0 ? 'checked' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {formData.photos.length > 0 ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
                        </svg>
                        Photos uploaded ({formData.photos.length})
                      </li>
                      <li className={formData.documents.length > 0 ? 'checked' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {formData.documents.length > 0 ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
                        </svg>
                        Documents uploaded ({formData.documents.length})
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="form-error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="form-actions">
                <div className="form-actions__left">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={handlePrevious}
                      disabled={isLoading}
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={saveDraft}
                    disabled={isSaving || isLoading}
                  >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                </div>

                <div className="form-actions__right">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleNext}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={handleSubmitForReview}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .wizard-main {
          padding: 120px 5% 80px;
          min-height: calc(100vh - 200px);
          background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
        }

        .wizard-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .wizard-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .wizard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 8px;
        }

        .wizard-header p {
          color: #6b7280;
          margin: 0;
        }

        /* Steps Navigation */
        .steps-nav {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .step-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fff;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .step-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .step-btn--active {
          border-color: #c9a227;
          background: #fffbeb;
        }

        .step-btn--completed {
          border-color: #10b981;
        }

        .step-btn__number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }

        .step-btn--active .step-btn__number {
          background: #c9a227;
          color: #0a0a0a;
        }

        .step-btn--completed .step-btn__number {
          background: #10b981;
          color: #fff;
        }

        .step-btn__title {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        /* Form Card */
        .form-card {
          background: #fff;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }

        .step-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 8px;
        }

        .step-content > p {
          color: #6b7280;
          margin: 0 0 32px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group--full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 14px 16px;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          color: #0a0a0a;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #c9a227;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(201,162,39,0.1);
        }

        .form-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 4px;
        }

        /* Input with Unit */
        .input-with-unit {
          display: flex;
          gap: 8px;
        }

        .input-with-unit input {
          flex: 1;
        }

        .input-with-unit select {
          width: 120px;
        }

        /* Price Input */
        .price-input {
          display: flex;
          align-items: stretch;
        }

        .price-prefix {
          padding: 14px 16px;
          background: #e5e7eb;
          border: 2px solid #e5e7eb;
          border-right: none;
          border-radius: 12px 0 0 12px;
          font-weight: 600;
          color: #6b7280;
        }

        .price-input input {
          flex: 1;
          border-radius: 0 12px 12px 0;
        }

        .price-formatted {
          font-size: 0.875rem;
          color: #10b981;
          font-weight: 600;
          margin-top: 8px;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }

        .feature-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .feature-checkbox input {
          width: 18px;
          height: 18px;
          accent-color: #c9a227;
        }

        .feature-checkbox span {
          font-size: 0.875rem;
          color: #374151;
        }

        /* Upload Area */
        .upload-area {
          margin-bottom: 16px;
        }

        .upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .upload-zone:hover {
          border-color: #c9a227;
          background: #fffbeb;
        }

        .upload-zone input {
          display: none;
        }

        .upload-zone span {
          color: #6b7280;
        }

        .upload-hint {
          font-size: 0.75rem !important;
          color: #9ca3af !important;
        }

        /* Photos Grid */
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }

        .photo-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid transparent;
        }

        .photo-item--primary {
          border-color: #c9a227;
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .photo-item:hover .photo-overlay {
          opacity: 1;
        }

        .photo-action {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          transition: all 0.2s;
        }

        .photo-action:hover {
          transform: scale(1.1);
        }

        .photo-action--delete:hover {
          background: #dc2626;
          color: #fff;
        }

        .primary-badge {
          position: absolute;
          bottom: 8px;
          left: 8px;
          padding: 4px 8px;
          background: #c9a227;
          color: #0a0a0a;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
        }

        .photo-count {
          text-align: center;
          color: #6b7280;
          font-size: 0.875rem;
        }

        /* Documents Grid */
        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .document-upload label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }

        .upload-box {
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.2s;
        }

        .upload-box:hover {
          border-color: #c9a227;
          background: #fffbeb;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #6b7280;
        }

        .upload-label input {
          display: none;
        }

        .upload-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #10b981;
          font-weight: 500;
        }

        /* Submit Summary */
        .submit-summary {
          background: #f9fafb;
          border-radius: 16px;
          padding: 24px;
        }

        .submit-summary h3 {
          font-size: 1.125rem;
          color: #0a0a0a;
          margin: 0 0 8px;
        }

        .submit-summary > p {
          color: #6b7280;
          margin: 0 0 20px;
          font-size: 0.9375rem;
        }

        .checklist {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checklist li {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #6b7280;
          font-size: 0.9375rem;
        }

        .checklist li.checked {
          color: #10b981;
        }

        /* Info Box */
        .info-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fffbeb;
          border-radius: 12px;
          margin-top: 24px;
        }

        .info-box p {
          margin: 0;
          font-size: 0.875rem;
          color: #92400e;
        }

        /* Form Error */
        .form-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 24px;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .form-actions__left,
        .form-actions__right {
          display: flex;
          gap: 12px;
        }

        .btn {
          padding: 14px 24px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 20px rgba(201,162,39,0.3);
        }

        .btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201,162,39,0.4);
        }

        .btn--secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn--secondary:hover {
          background: #e5e7eb;
        }

        .btn--ghost {
          background: transparent;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .btn--ghost:hover {
          background: #f9fafb;
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 767px) {
          .wizard-main {
            padding: 100px 5% 60px;
          }

          .form-card {
            padding: 32px 24px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .steps-nav {
            flex-wrap: wrap;
            gap: 8px;
          }

          .step-btn {
            flex: 1;
            min-width: 80px;
            justify-content: center;
            padding: 10px 12px;
          }

          .step-btn__title {
            display: none;
          }

          .form-actions {
            flex-direction: column;
          }

          .form-actions__left,
          .form-actions__right {
            justify-content: center;
          }

          .photos-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .documents-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
