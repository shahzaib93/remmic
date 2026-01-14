import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const createEmptyMediaLibrary = () => ({
  simpleImages: [],
  panoramicImages: [],
  videos: []
})

export default function LandRegistration() {
  const { addProperty, user } = useFirebase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [mediaLibrary, setMediaLibrary] = useState(createEmptyMediaLibrary())
  const [additionalDocs, setAdditionalDocs] = useState([])

  const [formData, setFormData] = useState({
    fullname: '',
    cnic: '',
    phone: '',
    email: '',
    landtype: '',
    listingType: 'bidding',
    areasize: '',
    address: '',
    plotno: '',
    description: '',
    cnicdoc: [],
    landdoc: [],
    minBidAmount: '',
    maxBidAmount: '',
    biddingStartDate: '',
    biddingStartTime: '',
    biddingEndDate: '',
    biddingEndTime: '',
    biddingFees: '',
    showInUpcomingAuctions: false,
    investmentTotalShares: '',
    investmentSharePrice: '',
    investmentMinShares: '1',
    investmentLandCost: '',
    investmentDevelopmentCost: '',
    investmentOtherCosts: '',
    investmentProjectedYield: '',
    investmentExpectedAppreciation: '',
    investmentHoldingPeriodMonths: ''
  })

  const steps = [
    { id: 1, title: 'Owner Info', icon: 'user' },
    { id: 2, title: 'Property Details', icon: 'home' },
    { id: 3, title: 'Listing Options', icon: 'tag' },
    { id: 4, title: 'Documents', icon: 'file' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, files, checked, multiple } = e.target
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: multiple ? Array.from(files || []) : files[0] || null }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const convertFileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleMediaUpload = async (event, mediaKey = 'simpleImages') => {
    const files = Array.from(event.target?.files || [])
    if (!files.length) return

    const processedFiles = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds 5MB limit`)
        continue
      }
      try {
        const dataUrl = await convertFileToDataUrl(file)
        processedFiles.push({
          id: `${mediaKey}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: dataUrl,
          mediaType: mediaKey
        })
      } catch (error) {
        alert(`Failed to process ${file.name}`)
      }
    }

    if (processedFiles.length) {
      setMediaLibrary(prev => ({ ...prev, [mediaKey]: [...prev[mediaKey], ...processedFiles] }))
    }
    event.target.value = ''
  }

  const removeMediaAsset = (mediaKey, index) => {
    setMediaLibrary(prev => ({ ...prev, [mediaKey]: prev[mediaKey].filter((_, i) => i !== index) }))
  }

  const handleAdditionalDocuments = (event) => {
    const files = Array.from(event.target?.files || [])
    if (!files.length) return

    const acceptedFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds 5MB limit`)
        return false
      }
      return true
    }).map(file => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }))

    if (acceptedFiles.length) {
      setAdditionalDocs(prev => [...prev, ...acceptedFiles])
    }
    event.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const propertyData = {
        title: `${formData.landtype} Land - ${formData.areasize}`,
        type: formData.listingType,
        price: 0,
        location: formData.address,
        description: formData.description || `${formData.landtype} land of ${formData.areasize} at ${formData.address}`,
        status: 'pending',
        landType: formData.landtype,
        areaSize: formData.areasize,
        plotNumber: formData.plotno,
        ownerName: formData.fullname,
        ownerCNIC: formData.cnic,
        ownerPhone: formData.phone,
        ownerEmail: formData.email,
        documents: {
          cnicDoc: Array.isArray(formData.cnicdoc) ? formData.cnicdoc.map(f => f.name).join(', ') : formData.cnicdoc?.name || '',
          landDoc: Array.isArray(formData.landdoc) ? formData.landdoc.map(f => f.name).join(', ') : formData.landdoc?.name || '',
          additional: additionalDocs.map(d => ({ id: d.id, name: d.name, size: d.size, type: d.type }))
        },
        images: mediaLibrary.simpleImages,
        mediaAssets: mediaLibrary,
        ...(formData.listingType === 'bidding' && {
          bidding: {
            minBidAmount: parseFloat(formData.minBidAmount) || 0,
            maxBidAmount: parseFloat(formData.maxBidAmount) || 0,
            startDateTime: new Date(`${formData.biddingStartDate}T${formData.biddingStartTime}`).toISOString(),
            endDateTime: new Date(`${formData.biddingEndDate}T${formData.biddingEndTime}`).toISOString(),
            fees: parseFloat(formData.biddingFees) || 0,
            showInUpcomingAuctions: formData.showInUpcomingAuctions
          }
        }),
        ...(formData.listingType === 'investment' && {
          price: (parseFloat(formData.investmentTotalShares) || 0) * (parseFloat(formData.investmentSharePrice) || 0),
          shareOffering: {
            totalShares: parseFloat(formData.investmentTotalShares) || 0,
            sharesAvailable: parseFloat(formData.investmentTotalShares) || 0,
            sharePrice: parseFloat(formData.investmentSharePrice) || 0,
            minSharesPerInvestor: parseFloat(formData.investmentMinShares) || 1,
            fundingTarget: (parseFloat(formData.investmentTotalShares) || 0) * (parseFloat(formData.investmentSharePrice) || 0),
            fundingRaised: 0,
            landCost: parseFloat(formData.investmentLandCost) || 0,
            developmentCost: parseFloat(formData.investmentDevelopmentCost) || 0,
            projectedYield: parseFloat(formData.investmentProjectedYield) || 0,
            expectedAppreciation: parseFloat(formData.investmentExpectedAppreciation) || 0
          }
        }),
        registrationDate: new Date().toISOString(),
        source: 'land-registration-form',
        needsEvaluation: true
      }

      const result = await addProperty(propertyData)

      if (result.success) {
        alert('Property registered successfully!')
        setTimeout(() => {
          if (formData.listingType === 'rental') router.push('/rental')
          else if (formData.listingType === 'investment') router.push('/investment-shares')
          else router.push('/bidding')
        }, 1500)
      } else {
        alert(`Registration failed: ${result.error}`)
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <>
      <Head>
        <title>Register Property - REMMIC</title>
        <meta name="description" content="Register your property with REMMIC" />
      </Head>

      <Navbar />

      <main className="registration">
        {/* Hero */}
        <section className="registration-hero">
          <div className="registration-hero__container">
            <span className="registration-hero__eyebrow">Property Registration</span>
            <h1 className="registration-hero__title">List Your Property</h1>
            <p className="registration-hero__desc">
              Register your land for sale, rent, or investment opportunities on REMMIC's verified platform
            </p>
          </div>
        </section>

        {/* Progress Steps */}
        <section className="registration-progress">
          <div className="registration-progress__container">
            {steps.map((step, index) => (
              <div key={step.id} className={`progress-step ${currentStep >= step.id ? 'progress-step--active' : ''} ${currentStep > step.id ? 'progress-step--completed' : ''}`}>
                <div className="progress-step__number">{currentStep > step.id ? '✓' : step.id}</div>
                <span className="progress-step__title">{step.title}</span>
                {index < steps.length - 1 && <div className="progress-step__line" />}
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="registration-form">
          <div className="registration-form__container">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Owner Info */}
              {currentStep === 1 && (
                <div className="form-section">
                  <div className="form-section__header">
                    <h2>Owner Information</h2>
                    <p>Provide your personal details for property ownership verification</p>
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Full Name *</label>
                      <input type="text" name="fullname" value={formData.fullname} onChange={handleInputChange} placeholder="Muhammad Ali" required />
                    </div>
                    <div className="form-field">
                      <label>CNIC / NIC *</label>
                      <input type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="35202-1234567-8" required />
                    </div>
                    <div className="form-field">
                      <label>Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0300-1234567" required />
                    </div>
                    <div className="form-field">
                      <label>Email (Optional)</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="example@gmail.com" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <div className="form-section">
                  <div className="form-section__header">
                    <h2>Property Details</h2>
                    <p>Enter information about your land or property</p>
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Land Type *</label>
                      <select name="landtype" value={formData.landtype} onChange={handleInputChange} required>
                        <option value="">Select Land Type</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Area Size *</label>
                      <input type="text" name="areasize" value={formData.areasize} onChange={handleInputChange} placeholder="5 Marla / 1 Kanal" required />
                    </div>
                    <div className="form-field">
                      <label>Location / Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address" required />
                    </div>
                    <div className="form-field">
                      <label>Khasra / Plot No *</label>
                      <input type="text" name="plotno" value={formData.plotno} onChange={handleInputChange} placeholder="Plot # 123" required />
                    </div>
                    <div className="form-field form-field--full">
                      <label>Description</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Additional details about the property..." rows="4" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Listing Options */}
              {currentStep === 3 && (
                <div className="form-section">
                  <div className="form-section__header">
                    <h2>Listing Options</h2>
                    <p>Choose how you want to list your property</p>
                  </div>

                  {/* Listing Type Selection */}
                  <div className="listing-types">
                    {[
                      { value: 'bidding', label: 'For Sale / Bidding', icon: '🔨', desc: 'Auction your property to highest bidder' },
                      { value: 'rental', label: 'For Rent', icon: '🏠', desc: 'List property for monthly rental' },
                      { value: 'investment', label: 'Investment', icon: '📈', desc: 'Offer fractional ownership shares' }
                    ].map(type => (
                      <label key={type.value} className={`listing-type ${formData.listingType === type.value ? 'listing-type--active' : ''}`}>
                        <input type="radio" name="listingType" value={type.value} checked={formData.listingType === type.value} onChange={handleInputChange} />
                        <span className="listing-type__icon">{type.icon}</span>
                        <span className="listing-type__label">{type.label}</span>
                        <span className="listing-type__desc">{type.desc}</span>
                      </label>
                    ))}
                  </div>

                  {/* Bidding Fields */}
                  {formData.listingType === 'bidding' && (
                    <div className="conditional-fields">
                      <h3>Bidding Details</h3>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Minimum Bid (PKR) *</label>
                          <input type="number" name="minBidAmount" value={formData.minBidAmount} onChange={handleInputChange} placeholder="500000" required />
                        </div>
                        <div className="form-field">
                          <label>Maximum Bid (PKR) *</label>
                          <input type="number" name="maxBidAmount" value={formData.maxBidAmount} onChange={handleInputChange} placeholder="2000000" required />
                        </div>
                        <div className="form-field">
                          <label>Start Date *</label>
                          <input type="date" name="biddingStartDate" value={formData.biddingStartDate} onChange={handleInputChange} required />
                        </div>
                        <div className="form-field">
                          <label>Start Time *</label>
                          <input type="time" name="biddingStartTime" value={formData.biddingStartTime} onChange={handleInputChange} required />
                        </div>
                        <div className="form-field">
                          <label>End Date *</label>
                          <input type="date" name="biddingEndDate" value={formData.biddingEndDate} onChange={handleInputChange} required />
                        </div>
                        <div className="form-field">
                          <label>End Time *</label>
                          <input type="time" name="biddingEndTime" value={formData.biddingEndTime} onChange={handleInputChange} required />
                        </div>
                        <div className="form-field">
                          <label>Bidding Fee (PKR) *</label>
                          <input type="number" name="biddingFees" value={formData.biddingFees} onChange={handleInputChange} placeholder="5000" required />
                        </div>
                        <div className="form-field form-field--checkbox">
                          <label className="checkbox-label">
                            <input type="checkbox" name="showInUpcomingAuctions" checked={formData.showInUpcomingAuctions} onChange={handleInputChange} />
                            <span>Show in Upcoming Auctions</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Investment Fields */}
                  {formData.listingType === 'investment' && (
                    <div className="conditional-fields">
                      <h3>Investment Details</h3>
                      <div className="form-grid">
                        <div className="form-field">
                          <label>Total Shares *</label>
                          <input type="number" name="investmentTotalShares" value={formData.investmentTotalShares} onChange={handleInputChange} placeholder="400" required />
                        </div>
                        <div className="form-field">
                          <label>Price Per Share (PKR) *</label>
                          <input type="number" name="investmentSharePrice" value={formData.investmentSharePrice} onChange={handleInputChange} placeholder="50000" required />
                        </div>
                        <div className="form-field">
                          <label>Min Shares Per Investor *</label>
                          <input type="number" name="investmentMinShares" value={formData.investmentMinShares} onChange={handleInputChange} placeholder="1" required />
                        </div>
                        <div className="form-field">
                          <label>Land Cost (PKR) *</label>
                          <input type="number" name="investmentLandCost" value={formData.investmentLandCost} onChange={handleInputChange} placeholder="12000000" required />
                        </div>
                        <div className="form-field">
                          <label>Development Cost (PKR)</label>
                          <input type="number" name="investmentDevelopmentCost" value={formData.investmentDevelopmentCost} onChange={handleInputChange} placeholder="4000000" />
                        </div>
                        <div className="form-field">
                          <label>Projected Yield (%)</label>
                          <input type="number" name="investmentProjectedYield" value={formData.investmentProjectedYield} onChange={handleInputChange} placeholder="9" step="0.1" />
                        </div>
                        <div className="form-field">
                          <label>Expected Appreciation (%)</label>
                          <input type="number" name="investmentExpectedAppreciation" value={formData.investmentExpectedAppreciation} onChange={handleInputChange} placeholder="12" step="0.1" />
                        </div>
                        <div className="form-field">
                          <label>Holding Period (Months)</label>
                          <input type="number" name="investmentHoldingPeriodMonths" value={formData.investmentHoldingPeriodMonths} onChange={handleInputChange} placeholder="36" />
                        </div>
                      </div>
                      <div className="investment-summary">
                        <div className="investment-summary__item">
                          <span>Target Funding</span>
                          <strong>PKR {((parseFloat(formData.investmentTotalShares) || 0) * (parseFloat(formData.investmentSharePrice) || 0)).toLocaleString()}</strong>
                        </div>
                        <div className="investment-summary__item">
                          <span>Total Project Cost</span>
                          <strong>PKR {((parseFloat(formData.investmentLandCost) || 0) + (parseFloat(formData.investmentDevelopmentCost) || 0)).toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <div className="form-section">
                  <div className="form-section__header">
                    <h2>Documents & Media</h2>
                    <p>Upload property images and required documents</p>
                  </div>

                  {/* Property Images */}
                  <div className="media-section">
                    <h3>Property Images</h3>
                    <p className="media-hint">Upload clear photos of your property (max 5MB each)</p>
                    <div className="media-upload">
                      <div className="media-preview">
                        {mediaLibrary.simpleImages.map((img, idx) => (
                          <div key={img.id} className="media-item">
                            <img src={img.url} alt={img.name} />
                            <button type="button" onClick={() => removeMediaAsset('simpleImages', idx)} className="media-item__remove">×</button>
                          </div>
                        ))}
                        <label className="media-add">
                          <input type="file" accept="image/*" multiple onChange={(e) => handleMediaUpload(e, 'simpleImages')} />
                          <span>+</span>
                          <span>Add Images</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="documents-section">
                    <div className="document-upload">
                      <label>CNIC Document *</label>
                      <input type="file" name="cnicdoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" multiple required />
                      {formData.cnicdoc?.length > 0 && <span className="file-count">{formData.cnicdoc.length} file(s) selected</span>}
                    </div>
                    <div className="document-upload">
                      <label>Land Document *</label>
                      <input type="file" name="landdoc" onChange={handleInputChange} accept=".pdf,.jpg,.jpeg,.png" multiple required />
                      {formData.landdoc?.length > 0 && <span className="file-count">{formData.landdoc.length} file(s) selected</span>}
                    </div>
                    <div className="document-upload">
                      <label>Additional Documents</label>
                      <input type="file" onChange={handleAdditionalDocuments} accept=".pdf,.jpg,.jpeg,.png" multiple />
                      {additionalDocs.length > 0 && (
                        <div className="additional-docs">
                          {additionalDocs.map(doc => (
                            <div key={doc.id} className="additional-doc">
                              <span>{doc.name}</span>
                              <button type="button" onClick={() => setAdditionalDocs(prev => prev.filter(d => d.id !== doc.id))}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="btn btn--secondary">
                    Back
                  </button>
                )}
                {currentStep < 4 ? (
                  <button type="button" onClick={nextStep} className="btn btn--primary">
                    Continue
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="btn btn--primary btn--submit">
                    {loading ? 'Submitting...' : 'Submit Registration'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .registration {
          background: #f9fafb;
          min-height: 100vh;
          padding-top: 80px;
        }

        /* Hero */
        .registration-hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 60px 24px;
          text-align: center;
        }

        .registration-hero__container {
          max-width: 700px;
          margin: 0 auto;
        }

        .registration-hero__eyebrow {
          display: inline-block;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .registration-hero__title {
          margin: 0 0 12px;
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: #ffffff;
        }

        .registration-hero__desc {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
        }

        /* Progress */
        .registration-progress {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px;
          position: sticky;
          top: 80px;
          z-index: 50;
        }

        .registration-progress__container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .progress-step__number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .progress-step--active .progress-step__number {
          background: #c9a227;
          color: #0a0a0a;
        }

        .progress-step--completed .progress-step__number {
          background: #10b981;
          color: #ffffff;
        }

        .progress-step__title {
          font-size: 0.9rem;
          font-weight: 500;
          color: #6b7280;
        }

        .progress-step--active .progress-step__title {
          color: #111827;
          font-weight: 600;
        }

        .progress-step__line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          margin: 0 16px;
        }

        .progress-step--completed .progress-step__line {
          background: #10b981;
        }

        /* Form */
        .registration-form {
          padding: 40px 24px 80px;
        }

        .registration-form__container {
          max-width: 900px;
          margin: 0 auto;
        }

        .form-section {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid #e5e7eb;
        }

        .form-section__header {
          margin-bottom: 32px;
        }

        .form-section__header h2 {
          margin: 0 0 8px;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .form-section__header p {
          margin: 0;
          color: #6b7280;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-field--full {
          grid-column: 1 / -1;
        }

        .form-field label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .form-field input,
        .form-field select,
        .form-field textarea {
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          color: #111827;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .form-field textarea {
          resize: vertical;
          min-height: 100px;
        }

        /* Listing Types */
        .listing-types {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .listing-type {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 24px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .listing-type input {
          display: none;
        }

        .listing-type:hover {
          border-color: #c9a227;
        }

        .listing-type--active {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.05);
        }

        .listing-type__icon {
          font-size: 2rem;
        }

        .listing-type__label {
          font-weight: 600;
          color: #111827;
        }

        .listing-type__desc {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .conditional-fields {
          background: #f9fafb;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
        }

        .conditional-fields h3 {
          margin: 0 0 20px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #111827;
        }

        .form-field--checkbox {
          justify-content: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 20px;
          height: 20px;
          accent-color: #c9a227;
        }

        .investment-summary {
          display: flex;
          gap: 24px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .investment-summary__item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .investment-summary__item span {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .investment-summary__item strong {
          font-size: 1.1rem;
          color: #c9a227;
        }

        /* Media Upload */
        .media-section {
          margin-bottom: 32px;
        }

        .media-section h3 {
          margin: 0 0 8px;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .media-hint {
          margin: 0 0 16px;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .media-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .media-item {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .media-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-item__remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ef4444;
          color: #ffffff;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .media-add {
          width: 120px;
          height: 120px;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .media-add:hover {
          border-color: #c9a227;
          color: #c9a227;
        }

        .media-add input {
          display: none;
        }

        .media-add span:first-of-type {
          font-size: 2rem;
          line-height: 1;
        }

        /* Documents */
        .documents-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .document-upload {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .document-upload label {
          font-weight: 600;
          color: #374151;
        }

        .document-upload input[type="file"] {
          padding: 16px;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
        }

        .file-count {
          font-size: 0.85rem;
          color: #10b981;
        }

        .additional-docs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .additional-doc {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .additional-doc button {
          background: #fee2e2;
          border: none;
          border-radius: 4px;
          color: #dc2626;
          padding: 4px 8px;
          cursor: pointer;
        }

        /* Navigation */
        .form-navigation {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
        }

        .btn {
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(201, 162, 39, 0.3);
        }

        .btn--secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn--secondary:hover {
          background: #e5e7eb;
        }

        .btn--submit {
          min-width: 200px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .registration-progress__container {
            flex-wrap: wrap;
            gap: 16px;
          }

          .progress-step {
            flex: none;
            width: calc(50% - 8px);
          }

          .progress-step__line {
            display: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .listing-types {
            grid-template-columns: 1fr;
          }

          .form-section {
            padding: 20px;
          }
        }
      `}</style>
    </>
  )
}
