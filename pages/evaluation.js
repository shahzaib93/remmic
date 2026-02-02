import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { addEvaluation } from '../lib/firebase'
import Footer from '../components/Footer'

export default function Evaluation() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [cityDetails, setCityDetails] = useState('')
  const [mediaPreview, setMediaPreview] = useState('')
  const [docPreview, setDocPreview] = useState('')
  const [evaluationProperties, setEvaluationProperties] = useState([])
  const [formData, setFormData] = useState({
    // Section A - Client Information
    fullName: '',
    cnicPassport: '',
    nationality: 'pakistani',
    nationalityOther: '',
    mobileNumber: '',
    email: '',
    currentAddress: '',
    isLegalOwner: 'yes',
    ownershipRelation: '',
    
    // Section B - Property Basic Information
    propertyType: '',
    propertyTypeOther: '',
    country: 'Pakistan',
    city: '',
    areaSociety: '',
    blockSector: '',
    propertySize: '',
    propertySizeUnit: 'sqft',
    propertyNature: 'freehold',
    
    // Section C - Ownership & Legal Status
    ownershipDocument: '',
    ownershipDocumentOther: '',
    transferStatus: '',
    disputeFree: 'yes',
    disputeExplanation: '',
    outstandingDues: [],
    
    // Section D - Construction Details
    constructionStatus: '',
    constructionYear: '',
    numberOfFloors: '',
    approvedPlan: 'yes',
    
    // Section E - Financial Expectations
    expectedPrice: '',
    expectedPriceCurrency: 'PKR',
    minimumPrice: '',
    urgencyLevel: '',
    openToAuction: 'yes',
    auctionConditions: '',
    
    // Section F - Rental/Income
    currentlyRented: 'no',
    monthlyRental: '',
    tenantType: '',
    tenancyAgreement: 'no',
    
    // Section G - Media & Documents
    propertyPhotos: 'no',
    propertyVideos: 'no',
    documentsUploaded: [],
    
    // File uploads
    propertyImage: [],
    documents: []
  })

  useEffect(() => {
    setIsClient(true)
    loadEvaluationProperties()

    const handleEvaluationUpdate = () => {
      loadEvaluationProperties()
    }

    window.addEventListener('evaluationApproved', handleEvaluationUpdate)
    window.addEventListener('evaluationPropertiesUpdated', handleEvaluationUpdate)

    return () => {
      window.removeEventListener('evaluationApproved', handleEvaluationUpdate)
      window.removeEventListener('evaluationPropertiesUpdated', handleEvaluationUpdate)
    }
  }, [])

  const loadEvaluationProperties = () => {
    try {
      const storedProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
      setEvaluationProperties(storedProperties)
    } catch (error) {
      console.error('Error loading evaluation properties:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAreaUnitChange = (e) => {
    setFormData(prev => ({ ...prev, areaUnit: e.target.value }))
  }

  const handleMeasurementChange = (e) => {
    setFormData(prev => ({ ...prev, areaMeasurement: e.target.value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const propertyId = `eval_${Date.now()}`
      let resolvedImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'

      const mediaFiles = Array.isArray(formData.propertyImage) ? formData.propertyImage : []
      const documentFiles = Array.isArray(formData.documents) ? formData.documents : []

      const newProperty = {
        id: propertyId,
        ...formData,
        areaSize: `${formData.areaSize} ${formData.areaUnit} (${formData.areaMeasurement})`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        evaluationValue: 'Pending',
        image: resolvedImage,
        source: 'evaluation',
        mediaFiles: mediaFiles.map(file => ({ name: file.name, type: file.type, size: file.size })),
        documentFiles: documentFiles.map(file => ({ name: file.name, type: file.type, size: file.size }))
      }

      let savedToFirestore = false

      try {
        const evaluationData = {
          propertyAddress: newProperty.propertyAddress,
          propertyType: newProperty.propertyType,
          areaSize: newProperty.areaSize,
          areaValue: formData.areaSize,
          areaUnit: formData.areaUnit,
          areaMeasurement: formData.areaMeasurement,
          propertyValue: newProperty.propertyValue,
          propertyId,
          fullName: newProperty.fullName,
          cnic: newProperty.cnic,
          contact: newProperty.contact,
          email: newProperty.email,
          city: newProperty.city,
          image: newProperty.image,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          mediaFiles: newProperty.mediaFiles,
          documentFiles: newProperty.documentFiles
        }

        const result = await addEvaluation(evaluationData)

        if (result.success) {
          const existingProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
          const updatedProperties = [newProperty, ...existingProperties]
          localStorage.setItem('evaluationProperties', JSON.stringify(updatedProperties))
          window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
          setEvaluationProperties(updatedProperties)
          savedToFirestore = true
        }
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError)
      }

      if (!savedToFirestore) {
        const existingProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
        const updatedProperties = [newProperty, ...existingProperties]
        localStorage.setItem('evaluationProperties', JSON.stringify(updatedProperties))
        window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
        setEvaluationProperties(updatedProperties)
      }

      setFormData({
        fullName: '', cnic: '', contact: '', email: '', address: '', city: '',
        propertyType: '', propertyAddress: '', plotNumber: '', areaSize: '',
        areaUnit: 'marla', areaMeasurement: 'sq_feet', floors: '', propertyValue: '',
        propertyImage: [], documents: []
      })
      setMediaPreview('')
      setDocPreview('')
      setShowForm(false)

      alert('Property submitted for evaluation successfully! Our team will review and notify you via email.')
    } catch (error) {
      console.error('Error saving property:', error)
      alert('Error submitting property. Please try again.')
    }
  }

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, propertyImage: [...prev.propertyImage, ...files] }))
    }
  }

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }))
    }
  }

  const removeMediaFile = (index) => {
    setFormData(prev => {
      const newMedia = [...prev.propertyImage]
      newMedia.splice(index, 1)
      return { ...prev, propertyImage: newMedia }
    })
  }

  const removeDocumentFile = (index) => {
    setFormData(prev => {
      const newDocs = [...prev.documents]
      newDocs.splice(index, 1)
      return { ...prev, documents: newDocs }
    })
  }

  if (!isClient) return null

  return (
    <>
      <Head>
        <title>Property Evaluation - REMMIC</title>
        <meta content="Get your property professionally evaluated by REMMIC experts" name="description" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="/logoremmic.png" rel="shortcut icon" type="image/x-icon" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="eval-main">
          {/* Hero Section */}
          <section className="eval-hero">
            <div className="eval-hero__container">
              <div className="eval-hero__content">
                <span className="eval-hero__eyebrow">Property Evaluation</span>
                <h1 className="eval-hero__title">
                  Get Your Property<br />
                  <span className="eval-hero__title-accent">Professionally Valued</span>
                </h1>
                <p className="eval-hero__description">
                  Our expert team provides accurate property valuations backed by market data,
                  helping you make informed decisions about your real estate assets.
                </p>
                <div className="eval-hero__cta">
                  <button onClick={() => setShowForm(true)} className="eval-hero__button eval-hero__button--primary">
                    Start Evaluation
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                  <a href="/contact" className="eval-hero__button eval-hero__button--secondary">
                    Talk to Expert
                  </a>
                </div>
              </div>
              <div className="eval-hero__visual">
                <div className="eval-hero__stats-card">
                  <div className="eval-hero__stat">
                    <span className="eval-hero__stat-value">2,500+</span>
                    <span className="eval-hero__stat-label">Properties Evaluated</span>
                  </div>
                  <div className="eval-hero__stat">
                    <span className="eval-hero__stat-value">98%</span>
                    <span className="eval-hero__stat-label">Accuracy Rate</span>
                  </div>
                  <div className="eval-hero__stat">
                    <span className="eval-hero__stat-value">24hrs</span>
                    <span className="eval-hero__stat-label">Avg. Turnaround</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Process Section */}
          <section className="eval-process">
            <div className="eval-process__container">
              <div className="eval-process__header">
                <span className="eval-process__eyebrow">How It Works</span>
                <h2 className="eval-process__title">Simple 3-Step Evaluation Process</h2>
                <p className="eval-process__subtitle">
                  Get your property valued in just a few easy steps
                </p>
              </div>

              <div className="eval-process__grid">
                <article className="eval-step">
                  <div className="eval-step__number">01</div>
                  <div className="eval-step__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 className="eval-step__title">Submit Details</h3>
                  <p className="eval-step__description">
                    Fill out our simple form with your property information, location, and upload relevant documents.
                  </p>
                </article>

                <article className="eval-step">
                  <div className="eval-step__number">02</div>
                  <div className="eval-step__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                  </div>
                  <h3 className="eval-step__title">Expert Review</h3>
                  <p className="eval-step__description">
                    Our certified evaluators analyze market data, comparable sales, and property specifics.
                  </p>
                </article>

                <article className="eval-step">
                  <div className="eval-step__number">03</div>
                  <div className="eval-step__icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 className="eval-step__title">Get Report</h3>
                  <p className="eval-step__description">
                    Receive a detailed valuation report with market insights and investment recommendations.
                  </p>
                </article>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="eval-features">
            <div className="eval-features__container">
              <div className="eval-features__header">
                <span className="eval-features__eyebrow">Why Choose REMMIC</span>
                <h2 className="eval-features__title">Trusted Property Valuation</h2>
              </div>

              <div className="eval-features__grid">
                <div className="eval-feature">
                  <div className="eval-feature__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <h4 className="eval-feature__title">Verified Experts</h4>
                  <p className="eval-feature__text">Certified property evaluators with 10+ years experience</p>
                </div>

                <div className="eval-feature">
                  <div className="eval-feature__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <h4 className="eval-feature__title">Fast Turnaround</h4>
                  <p className="eval-feature__text">Get your evaluation report within 24-48 hours</p>
                </div>

                <div className="eval-feature">
                  <div className="eval-feature__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h4 className="eval-feature__title">Market Data</h4>
                  <p className="eval-feature__text">Valuations backed by real-time market analytics</p>
                </div>

                <div className="eval-feature">
                  <div className="eval-feature__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                  </div>
                  <h4 className="eval-feature__title">Detailed Reports</h4>
                  <p className="eval-feature__text">Comprehensive analysis with investment insights</p>
                </div>
              </div>

              <div className="eval-features__cta">
                <button onClick={() => setShowForm(true)} className="eval-features__button">
                  Start Your Evaluation Now
                </button>
              </div>
            </div>
          </section>

          {/* Form Modal */}
          {showForm && (
            <div className="eval-modal">
              <div className="eval-modal__overlay" onClick={() => setShowForm(false)} />
              <div className="eval-modal__content">
                <button className="eval-modal__close" onClick={() => setShowForm(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>

                <div className="eval-form__header">
                  <h2 className="eval-form__title">REMMIC – Real Estate Evaluation Intake Form (Phase 1)</h2>
                  <p className="eval-form__subtitle">This form is used to collect verified information for internal evaluation before a property is approved for marketing, bidding, or investment on the REMMIC platform.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="eval-form">
                  {/* Section A - Client Information */}
                  <div className="eval-form__section">
                    <h3 className="eval-form__section-title">SECTION A — CLIENT / OWNER INFORMATION</h3>
                    <div className="eval-form__grid">
                      <div className="eval-form__field eval-form__field--full">
                        <label>1. Full Name (as per CNIC / Passport) *</label>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                      </div>
                      <div className="eval-form__field">
                        <label>2. CNIC / Passport No. *</label>
                        <input type="text" name="cnicPassport" value={formData.cnicPassport} onChange={handleInputChange} placeholder="XXXXX-XXXXXXX-X" required />
                      </div>
                      <div className="eval-form__field">
                        <label>3. Nationality *</label>
                        <select name="nationality" value={formData.nationality} onChange={handleInputChange} required>
                          <option value="pakistani">Pakistani</option>
                          <option value="overseas_pakistani">Overseas Pakistani</option>
                          <option value="foreign_national">Foreign National</option>
                        </select>
                      </div>
                      {formData.nationality === 'foreign_national' && (
                        <div className="eval-form__field">
                          <label>Specify Nationality</label>
                          <input type="text" name="nationalityOther" value={formData.nationalityOther} onChange={handleInputChange} />
                        </div>
                      )}
                      <div className="eval-form__field">
                        <label>4. Mobile Number (WhatsApp) *</label>
                        <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required />
                      </div>
                      <div className="eval-form__field">
                        <label>5. Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                      </div>
                      <div className="eval-form__field eval-form__field--full">
                        <label>6. Current Residential Address *</label>
                        <input type="text" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} required />
                      </div>
                      <div className="eval-form__field">
                        <label>7. Are you the legal owner of the property? *</label>
                        <select name="isLegalOwner" value={formData.isLegalOwner} onChange={handleInputChange} required>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      {formData.isLegalOwner === 'no' && (
                        <div className="eval-form__field">
                          <label>Explain relationship</label>
                          <input type="text" name="ownershipRelation" value={formData.ownershipRelation} onChange={handleInputChange} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="eval-form__section">
                    <h3 className="eval-form__section-title">Property Details</h3>
                    <div className="eval-form__grid">
                      <div className="eval-form__field">
                        <label>Property Type *</label>
                        <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required>
                          <option value="">Select Type</option>
                          <option value="residential_plot">Residential Plot</option>
                          <option value="commercial_plot">Commercial Plot</option>
                          <option value="house">House</option>
                          <option value="apartment">Apartment</option>
                          <option value="building">Building</option>
                          <option value="agriculture_land">Agriculture Land</option>
                        </select>
                      </div>
                      <div className="eval-form__field">
                        <label>Plot/Building Number</label>
                        <input type="text" name="plotNumber" value={formData.plotNumber} onChange={handleInputChange} />
                      </div>
                      <div className="eval-form__field eval-form__field--full">
                        <label>Property Address *</label>
                        <input type="text" name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} required />
                      </div>
                      <div className="eval-form__field">
                        <label>Area Size *</label>
                        <input type="number" name="areaSize" value={formData.areaSize} onChange={handleInputChange} min="0" step="0.01" required />
                      </div>
                      <div className="eval-form__field">
                        <label>Unit</label>
                        <select name="areaUnit" value={formData.areaUnit} onChange={handleAreaUnitChange}>
                          <option value="marla">Marla</option>
                          <option value="kanal">Kanal</option>
                          <option value="sqft">Sq. Feet</option>
                          <option value="sqm">Sq. Meters</option>
                        </select>
                      </div>
                      <div className="eval-form__field">
                        <label>Number of Floors</label>
                        <input type="number" name="floors" value={formData.floors} onChange={handleInputChange} min="0" />
                      </div>
                      <div className="eval-form__field">
                        <label>Expected Value (PKR)</label>
                        <input type="text" name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} placeholder="e.g., 50 Lac" />
                      </div>
                    </div>
                  </div>

                  <div className="eval-form__section">
                    <h3 className="eval-form__section-title">Documents & Images</h3>

                    <div className="eval-form__upload">
                      <label>Property Images</label>
                      {formData.propertyImage.length > 0 && (
                        <div className="eval-form__files">
                          {formData.propertyImage.map((file, idx) => (
                            <div key={idx} className="eval-form__file">
                              <span>{file.name}</span>
                              <button type="button" onClick={() => removeMediaFile(idx)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input type="file" onChange={handleMediaChange} accept="image/*,video/*" multiple />
                    </div>

                    <div className="eval-form__upload">
                      <label>Documents (Registry, Map, etc.)</label>
                      {formData.documents.length > 0 && (
                        <div className="eval-form__files">
                          {formData.documents.map((file, idx) => (
                            <div key={idx} className="eval-form__file">
                              <span>{file.name}</span>
                              <button type="button" onClick={() => removeDocumentFile(idx)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <input type="file" onChange={handleDocChange} accept=".pdf,.doc,.docx,.jpg,.png" multiple />
                    </div>
                  </div>

                  <button type="submit" className="eval-form__submit">
                    Submit for Evaluation
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .eval-main {
          background: #f9fafb;
        }

        /* Hero Section */
        .eval-hero {
          padding: clamp(80px, 10vw, 120px) clamp(20px, 4vw, 48px);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          position: relative;
          overflow: hidden;
        }

        .eval-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -30%;
          width: 80%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(201, 162, 39, 0.1) 0%, transparent 60%);
          pointer-events: none;
        }

        .eval-hero__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .eval-hero__content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .eval-hero__eyebrow {
          display: inline-block;
          align-self: flex-start;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.15);
          color: #c9a227;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .eval-hero__title {
          margin: 0;
          font-size: clamp(2.4rem, 5vw, 3.5rem);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.15;
        }

        .eval-hero__title-accent {
          color: #c9a227;
        }

        .eval-hero__description {
          margin: 0;
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          max-width: 520px;
        }

        .eval-hero__cta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .eval-hero__button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .eval-hero__button--primary {
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
        }

        .eval-hero__button--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -8px rgba(201, 162, 39, 0.5);
        }

        .eval-hero__button--secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .eval-hero__button--secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .eval-hero__visual {
          display: flex;
          justify-content: center;
        }

        .eval-hero__stats-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .eval-hero__stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: center;
        }

        .eval-hero__stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #c9a227;
        }

        .eval-hero__stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Process Section */
        .eval-process {
          padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
          background: #ffffff;
        }

        .eval-process__container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .eval-process__header {
          text-align: center;
          margin-bottom: 60px;
        }

        .eval-process__eyebrow {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .eval-process__title {
          margin: 0 0 16px;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 700;
          color: #0f172a;
        }

        .eval-process__subtitle {
          margin: 0;
          font-size: 1.1rem;
          color: #64748b;
        }

        .eval-process__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .eval-step {
          background: #f8fafc;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .eval-step:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.1);
        }

        .eval-step__number {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0a0a0a;
        }

        .eval-step__icon {
          width: 64px;
          height: 64px;
          margin: 16px auto 20px;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
        }

        .eval-step__title {
          margin: 0 0 12px;
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
        }

        .eval-step__description {
          margin: 0;
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Features Section */
        .eval-features {
          padding: clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px);
          background: #f8fafc;
        }

        .eval-features__container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .eval-features__header {
          text-align: center;
          margin-bottom: 48px;
        }

        .eval-features__eyebrow {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .eval-features__title {
          margin: 0;
          font-size: clamp(1.6rem, 3.5vw, 2.2rem);
          font-weight: 700;
          color: #0f172a;
        }

        .eval-features__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 48px;
        }

        .eval-feature {
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .eval-feature__icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
        }

        .eval-feature__title {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .eval-feature__text {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
        }

        .eval-features__cta {
          text-align: center;
        }

        .eval-features__button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .eval-features__button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -8px rgba(201, 162, 39, 0.4);
        }

        /* Modal */
        .eval-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px;
          overflow-y: auto;
        }

        .eval-modal__overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
        }

        .eval-modal__content {
          position: relative;
          width: 100%;
          max-width: 800px;
          background: #ffffff;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.2);
          z-index: 1;
        }

        .eval-modal__close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: #f1f5f9;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .eval-modal__close:hover {
          background: #e2e8f0;
        }

        .eval-form__header {
          text-align: center;
          margin-bottom: 32px;
        }

        .eval-form__title {
          margin: 0 0 8px;
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f172a;
        }

        .eval-form__subtitle {
          margin: 0;
          color: #64748b;
        }

        .eval-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .eval-form__section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .eval-form__section-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #c9a227;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .eval-form__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .eval-form__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .eval-form__field--full {
          grid-column: 1 / -1;
        }

        .eval-form__field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
        }

        .eval-form__field input,
        .eval-form__field select {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 1rem;
          color: #0f172a;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .eval-form__field input:focus,
        .eval-form__field select:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
        }

        .eval-form__upload {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .eval-form__upload label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
        }

        .eval-form__upload input {
          padding: 12px;
          border: 2px dashed #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
        }

        .eval-form__files {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .eval-form__file {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .eval-form__file button {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .eval-form__submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 12px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: #0a0a0a;
          font-weight: 600;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .eval-form__submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -8px rgba(201, 162, 39, 0.4);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .eval-hero__container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .eval-hero__content {
            align-items: center;
          }

          .eval-hero__cta {
            justify-content: center;
          }

          .eval-hero__visual {
            order: -1;
          }

          .eval-process__grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }

          .eval-features__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .eval-hero__cta {
            flex-direction: column;
            width: 100%;
          }

          .eval-hero__button {
            width: 100%;
            justify-content: center;
          }

          .eval-features__grid {
            grid-template-columns: 1fr;
          }

          .eval-form__grid {
            grid-template-columns: 1fr;
          }

          .eval-modal__content {
            padding: 24px;
          }
        }
      `}</style>
    </>
  )
}
