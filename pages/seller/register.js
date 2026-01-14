/**
 * Seller Registration Page
 *
 * Step 2 Phase 2A: Multi-step seller signup with KYC
 * Route: /seller/register
 */

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useFirebase } from '../../contexts/FirebaseContext'
import {
  registerSeller,
  submitSellerKYC,
  getSellerProfile,
  SELLER_STATUS,
} from '../../lib/step2-auction-service'

const STEPS = [
  { id: 1, title: 'Account Info', description: 'Basic details' },
  { id: 2, title: 'Business Info', description: 'Your business' },
  { id: 3, title: 'KYC Documents', description: 'Verification' },
  { id: 4, title: 'Review', description: 'Confirm details' },
]

export default function SellerRegister() {
  const router = useRouter()
  const { user, loading: authLoading } = useFirebase()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingProfile, setExistingProfile] = useState(null)

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Account Info
    fullName: '',
    email: '',
    phone: '',
    // Step 2: Business Info
    businessName: '',
    businessType: 'individual',
    businessAddress: '',
    city: '',
    // Step 3: KYC
    cnicNumber: '',
    documents: [],
  })

  // Check for existing seller profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (user?.uid) {
        const result = await getSellerProfile(user.uid)
        if (result.success) {
          setExistingProfile(result.profile)
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            fullName: result.profile.fullName || user.name || '',
            email: result.profile.email || user.email || '',
            phone: result.profile.phone || '',
            businessName: result.profile.businessName || '',
            businessType: result.profile.businessType || 'individual',
            businessAddress: result.profile.businessAddress || '',
            cnicNumber: result.profile.cnicNumber || '',
          }))
        } else {
          // Pre-fill from user data
          setFormData(prev => ({
            ...prev,
            fullName: user.name || '',
            email: user.email || '',
          }))
        }
      }
    }
    checkExistingProfile()
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('redirectAfterLogin', '/seller/register')
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      // Create local URL for preview
      const fileData = {
        type: docType,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
      }

      setFormData(prev => ({
        ...prev,
        documents: [
          ...prev.documents.filter(d => d.type !== docType),
          fileData,
        ],
      }))
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) return 'Full name is required'
        if (!formData.email.trim()) return 'Email is required'
        if (!formData.phone.trim()) return 'Phone number is required'
        if (!/^(\+92|0)?[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
          return 'Please enter a valid Pakistani phone number'
        }
        break
      case 2:
        if (!formData.businessName.trim()) return 'Business/Agency name is required'
        if (!formData.businessAddress.trim()) return 'Business address is required'
        if (!formData.city.trim()) return 'City is required'
        break
      case 3:
        if (!formData.cnicNumber.trim()) return 'CNIC number is required'
        if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnicNumber)) {
          return 'CNIC format should be: 35201-1234567-1'
        }
        const hasCnicFront = formData.documents.some(d => d.type === 'cnic_front')
        const hasCnicBack = formData.documents.some(d => d.type === 'cnic_back')
        if (!hasCnicFront) return 'Please upload CNIC front image'
        if (!hasCnicBack) return 'Please upload CNIC back image'
        break
    }
    return null
  }

  const handleNext = () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      return
    }
    setCurrentStep(prev => Math.min(prev + 1, 4))
    setError('')
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Register seller profile if not exists
      if (!existingProfile) {
        const registerResult = await registerSeller(user.uid, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        })

        if (!registerResult.success) {
          throw new Error(registerResult.error)
        }
      }

      // Submit KYC
      const kycResult = await submitSellerKYC(user.uid, {
        cnicNumber: formData.cnicNumber,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessAddress: `${formData.businessAddress}, ${formData.city}`,
        documents: formData.documents,
      })

      if (!kycResult.success) {
        throw new Error(kycResult.error)
      }

      // Redirect to seller dashboard
      router.push('/seller/dashboard?registered=true')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // If already verified, redirect to dashboard
  if (existingProfile?.verificationStatus === SELLER_STATUS.VERIFIED) {
    return (
      <>
        <Head>
          <title>Already Registered - REMMIC Seller</title>
        </Head>
        <div className="page-wrapper">
          <Navbar />
          <main className="register-main">
            <div className="register-container">
              <div className="success-card">
                <div className="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2>You&apos;re Already Verified!</h2>
                <p>Your seller account is active. You can start listing properties.</p>
                <div className="success-actions">
                  <Link href="/seller/dashboard" className="btn btn--primary">
                    Go to Dashboard
                  </Link>
                  <Link href="/seller/listing/new" className="btn btn--secondary">
                    Create Listing
                  </Link>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
        <style jsx>{`
          .register-main {
            padding: 120px 5% 80px;
            min-height: calc(100vh - 200px);
            background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
          }
          .register-container {
            max-width: 600px;
            margin: 0 auto;
          }
          .success-card {
            background: #fff;
            border-radius: 24px;
            padding: 48px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          }
          .success-icon {
            margin-bottom: 24px;
          }
          .success-card h2 {
            font-size: 1.75rem;
            color: #0a0a0a;
            margin: 0 0 12px;
          }
          .success-card p {
            color: #6b7280;
            margin: 0 0 32px;
          }
          .success-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
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
          .btn--secondary {
            background: #f3f4f6;
            color: #374151;
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

  return (
    <>
      <Head>
        <title>Seller Registration - REMMIC</title>
        <meta name="description" content="Register as a seller on REMMIC to list your properties for auction" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="register-main">
          <div className="register-container">
            {/* Header */}
            <div className="register-header">
              <h1>Become a REMMIC Seller</h1>
              <p>List your properties on Pakistan&apos;s premier real estate auction platform</p>
            </div>

            {/* Progress Steps */}
            <div className="steps-container">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`step ${currentStep >= step.id ? 'step--active' : ''} ${currentStep > step.id ? 'step--completed' : ''}`}
                >
                  <div className="step__number">
                    {currentStep > step.id ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : step.id}
                  </div>
                  <div className="step__info">
                    <span className="step__title">{step.title}</span>
                    <span className="step__desc">{step.description}</span>
                  </div>
                  {index < STEPS.length - 1 && <div className="step__line" />}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="form-card">
              {/* Step 1: Account Info */}
              {currentStep === 1 && (
                <div className="step-content">
                  <h2>Account Information</h2>
                  <p>Enter your personal details</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Info */}
              {currentStep === 2 && (
                <div className="step-content">
                  <h2>Business Information</h2>
                  <p>Tell us about your real estate business</p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Business/Agency Name *</label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        placeholder="Your business or agency name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Type *</label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                      >
                        <option value="individual">Individual Seller</option>
                        <option value="agent">Real Estate Agent</option>
                        <option value="agency">Real Estate Agency</option>
                        <option value="developer">Property Developer</option>
                        <option value="company">Company/Corporation</option>
                      </select>
                    </div>

                    <div className="form-group form-group--full">
                      <label>Business Address *</label>
                      <input
                        type="text"
                        value={formData.businessAddress}
                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                        placeholder="Street address, building, etc."
                      />
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
                        <option value="Quetta">Quetta</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: KYC Documents */}
              {currentStep === 3 && (
                <div className="step-content">
                  <h2>KYC Verification</h2>
                  <p>Upload your identity documents for verification</p>

                  <div className="form-grid">
                    <div className="form-group form-group--full">
                      <label>CNIC Number *</label>
                      <input
                        type="text"
                        value={formData.cnicNumber}
                        onChange={(e) => handleInputChange('cnicNumber', e.target.value)}
                        placeholder="35201-1234567-1"
                      />
                      <span className="form-hint">Format: XXXXX-XXXXXXX-X</span>
                    </div>

                    <div className="form-group">
                      <label>CNIC Front *</label>
                      <div className="upload-box">
                        {formData.documents.find(d => d.type === 'cnic_front') ? (
                          <div className="upload-preview">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{formData.documents.find(d => d.type === 'cnic_front').name}</span>
                          </div>
                        ) : (
                          <label className="upload-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'cnic_front')}
                            />
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Upload CNIC Front</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>CNIC Back *</label>
                      <div className="upload-box">
                        {formData.documents.find(d => d.type === 'cnic_back') ? (
                          <div className="upload-preview">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{formData.documents.find(d => d.type === 'cnic_back').name}</span>
                          </div>
                        ) : (
                          <label className="upload-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'cnic_back')}
                            />
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Upload CNIC Back</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="info-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <p>Your documents will be reviewed within 24-48 hours. You&apos;ll receive a notification once verified.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="step-content">
                  <h2>Review Your Information</h2>
                  <p>Please verify all details before submitting</p>

                  <div className="review-sections">
                    <div className="review-section">
                      <h3>Account Information</h3>
                      <div className="review-grid">
                        <div className="review-item">
                          <span className="review-label">Full Name</span>
                          <span className="review-value">{formData.fullName}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Email</span>
                          <span className="review-value">{formData.email}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Phone</span>
                          <span className="review-value">{formData.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-section">
                      <h3>Business Information</h3>
                      <div className="review-grid">
                        <div className="review-item">
                          <span className="review-label">Business Name</span>
                          <span className="review-value">{formData.businessName}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Business Type</span>
                          <span className="review-value">{formData.businessType}</span>
                        </div>
                        <div className="review-item review-item--full">
                          <span className="review-label">Address</span>
                          <span className="review-value">{formData.businessAddress}, {formData.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-section">
                      <h3>KYC Documents</h3>
                      <div className="review-grid">
                        <div className="review-item">
                          <span className="review-label">CNIC Number</span>
                          <span className="review-value">{formData.cnicNumber}</span>
                        </div>
                        <div className="review-item">
                          <span className="review-label">Documents Uploaded</span>
                          <span className="review-value">{formData.documents.length} files</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="terms-checkbox">
                    <label>
                      <input type="checkbox" required />
                      <span>I confirm that all information provided is accurate and I agree to REMMIC&apos;s <Link href="/terms">Terms of Service</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</span>
                    </label>
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

              {/* Navigation Buttons */}
              <div className="form-actions">
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

                {currentStep < 4 ? (
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
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Registration'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .register-main {
          padding: 120px 5% 80px;
          min-height: calc(100vh - 200px);
          background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
        }

        .register-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .register-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .register-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 8px;
        }

        .register-header p {
          font-size: 1.0625rem;
          color: #6b7280;
          margin: 0;
        }

        /* Steps */
        .steps-container {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .step__number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s;
        }

        .step--active .step__number {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
        }

        .step--completed .step__number {
          background: #10b981;
          color: #fff;
        }

        .step__info {
          display: flex;
          flex-direction: column;
        }

        .step__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .step__desc {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .step__line {
          width: 40px;
          height: 2px;
          background: #e5e7eb;
          margin: 0 8px;
        }

        .step--completed + .step .step__line,
        .step--active .step__line {
          background: #c9a227;
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
        .form-group select {
          padding: 14px 16px;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          color: #0a0a0a;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #c9a227;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(201,162,39,0.1);
        }

        .form-hint {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 4px;
        }

        /* Upload Box */
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
          gap: 12px;
          cursor: pointer;
          color: #6b7280;
        }

        .upload-label input {
          display: none;
        }

        .upload-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #10b981;
          font-weight: 500;
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

        /* Review Sections */
        .review-sections {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .review-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .review-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .review-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .review-item--full {
          grid-column: 1 / -1;
        }

        .review-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .review-value {
          font-size: 1rem;
          color: #0a0a0a;
          font-weight: 500;
        }

        /* Terms Checkbox */
        .terms-checkbox {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .terms-checkbox label {
          display: flex;
          gap: 12px;
          cursor: pointer;
        }

        .terms-checkbox input {
          width: 20px;
          height: 20px;
          accent-color: #c9a227;
        }

        .terms-checkbox span {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.5;
        }

        .terms-checkbox a {
          color: #c9a227;
          text-decoration: none;
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

        .btn {
          padding: 14px 32px;
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
          margin-left: auto;
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

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 767px) {
          .register-main {
            padding: 100px 5% 60px;
          }

          .form-card {
            padding: 32px 24px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .review-grid {
            grid-template-columns: 1fr;
          }

          .steps-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .step__line {
            display: none;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn--primary {
            margin-left: 0;
          }
        }
      `}</style>
    </>
  )
}
