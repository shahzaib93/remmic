import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function KYCVerification({ onKYCComplete }) {
  const { user } = useFirebase()
  const [kycStatus, setKycStatus] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      cnicNumber: '',
      dateOfBirth: '',
      nationality: 'Pakistani',
      occupation: '',
      annualIncome: '',
      sourceOfIncome: '',
      politicallyExposed: false
    },
    contactInfo: {
      address: '',
      city: '',
      postalCode: '',
      phoneNumber: '',
      emergencyContact: '',
      emergencyPhone: ''
    },
    financialInfo: {
      bankName: '',
      accountNumber: '',
      branchCode: '',
      accountTitle: '',
      monthlyInvestmentCapacity: '',
      investmentExperience: '',
      riskTolerance: 'moderate'
    },
    documents: {
      cnicFront: null,
      cnicBack: null,
      bankStatement: null,
      incomeProof: null,
      utilityBill: null
    }
  })

  const kycSteps = [
    { id: 1, title: 'Personal Information', icon: 'ðŸ‘¤' },
    { id: 2, title: 'Contact Details', icon: 'ðŸ“' },
    { id: 3, title: 'Financial Information', icon: 'ðŸ’°' },
    { id: 4, title: 'Document Upload', icon: 'ðŸ“„' },
    { id: 5, title: 'Review & Submit', icon: 'âœ…' }
  ]

  const documentRequirements = [
    { key: 'cnicFront', label: 'CNIC Front Side', required: true, description: 'Clear photo of CNIC front side' },
    { key: 'cnicBack', label: 'CNIC Back Side', required: true, description: 'Clear photo of CNIC back side' },
    { key: 'bankStatement', label: 'Bank Statement', required: true, description: 'Last 3 months bank statement' },
    { key: 'incomeProof', label: 'Income Proof', required: true, description: 'Salary certificate or business documents' },
    { key: 'utilityBill', label: 'Utility Bill', required: true, description: 'Recent utility bill for address verification' }
  ]

  useEffect(() => {
    // Load existing KYC status from localStorage
    const existingKYC = localStorage.getItem('userKYC')
    if (existingKYC) {
      const kycData = JSON.parse(existingKYC)
      setKycStatus(kycData.status)
      if (kycData.formData) {
        setFormData(kycData.formData)
      }
      if (kycData.currentStep) {
        setCurrentStep(kycData.currentStep)
      }
    }
  }, [])

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (documentType, file) => {
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [documentType]: {
              file: file,
              dataUrl: e.target.result,
              name: file.name,
              size: file.size
            }
          }
        }))
        setUploadedFiles(prev => ({
          ...prev,
          [documentType]: true
        }))
      }
      reader.readAsDataURL(file)
    } else {
      alert('File size must be less than 5MB')
    }
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const { fullName, cnicNumber, dateOfBirth, occupation, annualIncome } = formData.personalInfo
        return fullName && cnicNumber && dateOfBirth && occupation && annualIncome
      case 2:
        const { address, city, phoneNumber } = formData.contactInfo
        return address && city && phoneNumber
      case 3:
        const { bankName, accountNumber, accountTitle } = formData.financialInfo
        return bankName && accountNumber && accountTitle
      case 4:
        return documentRequirements.filter(doc => doc.required).every(doc => formData.documents[doc.key])
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
      // Save progress
      localStorage.setItem('userKYC', JSON.stringify({
        status: 'in-progress',
        currentStep: currentStep + 1,
        formData: formData
      }))
    } else {
      alert('Please fill in all required fields before proceeding')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const submitKYC = async () => {
    setIsLoading(true)
    
    try {
      // Simulate API call for KYC submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const kycData = {
        status: 'pending-review',
        submittedAt: new Date().toISOString(),
        formData: formData,
        currentStep: 5
      }
      
      localStorage.setItem('userKYC', JSON.stringify(kycData))
      setKycStatus('pending-review')
      
      // Notify parent component
      onKYCComplete && onKYCComplete('pending-review')
      
    } catch (error) {
      console.error('KYC submission error:', error)
      alert('Error submitting KYC. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderPersonalInfoStep = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Full Name *
        </label>
        <input
          type="text"
          value={formData.personalInfo.fullName}
          onChange={(e) => updateFormData('personalInfo', 'fullName', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Enter your full name as per CNIC"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          CNIC Number *
        </label>
        <input
          type="text"
          value={formData.personalInfo.cnicNumber}
          onChange={(e) => updateFormData('personalInfo', 'cnicNumber', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="XXXXX-XXXXXXX-X"
          maxLength="15"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Date of Birth *
        </label>
        <input
          type="date"
          value={formData.personalInfo.dateOfBirth}
          onChange={(e) => updateFormData('personalInfo', 'dateOfBirth', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Nationality
        </label>
        <select
          value={formData.personalInfo.nationality}
          onChange={(e) => updateFormData('personalInfo', 'nationality', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="Pakistani">Pakistani</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Occupation *
        </label>
        <input
          type="text"
          value={formData.personalInfo.occupation}
          onChange={(e) => updateFormData('personalInfo', 'occupation', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Your profession/occupation"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Annual Income *
        </label>
        <select
          value={formData.personalInfo.annualIncome}
          onChange={(e) => updateFormData('personalInfo', 'annualIncome', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select income range</option>
          <option value="0-500k">PKR 0 - 5 Lakh</option>
          <option value="500k-1m">PKR 5 - 10 Lakh</option>
          <option value="1m-2m">PKR 10 - 20 Lakh</option>
          <option value="2m-5m">PKR 20 - 50 Lakh</option>
          <option value="5m+">PKR 50 Lakh+</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Source of Income
        </label>
        <select
          value={formData.personalInfo.sourceOfIncome}
          onChange={(e) => updateFormData('personalInfo', 'sourceOfIncome', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select source</option>
          <option value="salary">Salary</option>
          <option value="business">Business</option>
          <option value="investments">Investments</option>
          <option value="inheritance">Inheritance</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.personalInfo.politicallyExposed}
            onChange={(e) => updateFormData('personalInfo', 'politicallyExposed', e.target.checked)}
          />
          <span style={{ fontSize: '14px', color: '#374151' }}>
            I am a Politically Exposed Person (PEP) or related to one
          </span>
        </label>
      </div>
    </div>
  )

  const renderContactInfoStep = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Complete Address *
        </label>
        <textarea
          value={formData.contactInfo.address}
          onChange={(e) => updateFormData('contactInfo', 'address', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '100px',
            boxSizing: 'border-box',
            resize: 'vertical'
          }}
          placeholder="Enter your complete residential address"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          City *
        </label>
        <input
          type="text"
          value={formData.contactInfo.city}
          onChange={(e) => updateFormData('contactInfo', 'city', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="City name"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Postal Code
        </label>
        <input
          type="text"
          value={formData.contactInfo.postalCode}
          onChange={(e) => updateFormData('contactInfo', 'postalCode', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Postal code"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.contactInfo.phoneNumber}
          onChange={(e) => updateFormData('contactInfo', 'phoneNumber', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="+92 XXX XXXXXXX"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Emergency Contact Name
        </label>
        <input
          type="text"
          value={formData.contactInfo.emergencyContact}
          onChange={(e) => updateFormData('contactInfo', 'emergencyContact', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Emergency contact name"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Emergency Contact Phone
        </label>
        <input
          type="tel"
          value={formData.contactInfo.emergencyPhone}
          onChange={(e) => updateFormData('contactInfo', 'emergencyPhone', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="+92 XXX XXXXXXX"
        />
      </div>
    </div>
  )

  const renderFinancialInfoStep = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Bank Name *
        </label>
        <select
          value={formData.financialInfo.bankName}
          onChange={(e) => updateFormData('financialInfo', 'bankName', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select your bank</option>
          <option value="HBL">Habib Bank Limited (HBL)</option>
          <option value="UBL">United Bank Limited (UBL)</option>
          <option value="NBP">National Bank of Pakistan (NBP)</option>
          <option value="MCB">MCB Bank</option>
          <option value="ABL">Allied Bank Limited (ABL)</option>
          <option value="Standard Chartered">Standard Chartered</option>
          <option value="Meezan Bank">Meezan Bank</option>
          <option value="Bank Alfalah">Bank Alfalah</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Account Number *
        </label>
        <input
          type="text"
          value={formData.financialInfo.accountNumber}
          onChange={(e) => updateFormData('financialInfo', 'accountNumber', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Your bank account number"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Branch Code
        </label>
        <input
          type="text"
          value={formData.financialInfo.branchCode}
          onChange={(e) => updateFormData('financialInfo', 'branchCode', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Bank branch code"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Account Title *
        </label>
        <input
          type="text"
          value={formData.financialInfo.accountTitle}
          onChange={(e) => updateFormData('financialInfo', 'accountTitle', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="Account holder name"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Monthly Investment Capacity
        </label>
        <select
          value={formData.financialInfo.monthlyInvestmentCapacity}
          onChange={(e) => updateFormData('financialInfo', 'monthlyInvestmentCapacity', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select range</option>
          <option value="0-25k">PKR 0 - 25,000</option>
          <option value="25k-50k">PKR 25,000 - 50,000</option>
          <option value="50k-100k">PKR 50,000 - 1,00,000</option>
          <option value="100k-250k">PKR 1,00,000 - 2,50,000</option>
          <option value="250k+">PKR 2,50,000+</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Investment Experience
        </label>
        <select
          value={formData.financialInfo.investmentExperience}
          onChange={(e) => updateFormData('financialInfo', 'investmentExperience', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Select experience</option>
          <option value="beginner">Beginner (0-1 years)</option>
          <option value="intermediate">Intermediate (1-5 years)</option>
          <option value="experienced">Experienced (5+ years)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Risk Tolerance
        </label>
        <select
          value={formData.financialInfo.riskTolerance}
          onChange={(e) => updateFormData('financialInfo', 'riskTolerance', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
    </div>
  )

  const renderDocumentUploadStep = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {documentRequirements.map((doc) => (
        <div key={doc.key} style={{
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
          background: uploadedFiles[doc.key] ? '#f0fdf4' : '#fafafa',
          borderColor: uploadedFiles[doc.key] ? '#22c55e' : '#d1d5db'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>
            {uploadedFiles[doc.key] ? 'âœ…' : 'ðŸ“„'}
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
            {doc.label} {doc.required && <span style={{ color: '#ef4444' }}>*</span>}
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6b7280' }}>
            {doc.description}
          </p>
          
          {uploadedFiles[doc.key] ? (
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#22c55e', fontWeight: '600' }}>
                âœ“ {formData.documents[doc.key]?.name}
              </p>
              <button
                onClick={() => {
                  setUploadedFiles(prev => ({ ...prev, [doc.key]: false }))
                  setFormData(prev => ({
                    ...prev,
                    documents: { ...prev.documents, [doc.key]: null }
                  }))
                }}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label style={{
              background: '#ff5e01',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-block'
            }}>
              Choose File
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  )

  const renderReviewStep = () => (
    <div style={{ display: 'grid', gap: '30px' }}>
      {/* Personal Information Review */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          Personal Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div><strong>Name:</strong> {formData.personalInfo.fullName}</div>
          <div><strong>CNIC:</strong> {formData.personalInfo.cnicNumber}</div>
          <div><strong>Date of Birth:</strong> {formData.personalInfo.dateOfBirth}</div>
          <div><strong>Occupation:</strong> {formData.personalInfo.occupation}</div>
          <div><strong>Annual Income:</strong> {formData.personalInfo.annualIncome}</div>
        </div>
      </div>

      {/* Contact Information Review */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          Contact Information
        </h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div><strong>Address:</strong> {formData.contactInfo.address}</div>
          <div><strong>City:</strong> {formData.contactInfo.city}</div>
          <div><strong>Phone:</strong> {formData.contactInfo.phoneNumber}</div>
        </div>
      </div>

      {/* Financial Information Review */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          Financial Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div><strong>Bank:</strong> {formData.financialInfo.bankName}</div>
          <div><strong>Account Number:</strong> {formData.financialInfo.accountNumber}</div>
          <div><strong>Account Title:</strong> {formData.financialInfo.accountTitle}</div>
        </div>
      </div>

      {/* Documents Review */}
      <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
          Uploaded Documents
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {documentRequirements.map(doc => (
            <div key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: formData.documents[doc.key] ? '#22c55e' : '#ef4444' }}>
                {formData.documents[doc.key] ? 'âœ…' : 'âŒ'}
              </span>
              <span>{doc.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div style={{ 
        background: '#fef3cd', 
        border: '1px solid #fbbf24', 
        padding: '20px', 
        borderRadius: '12px' 
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
          Important Declaration
        </h4>
        <div style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.5' }}>
          <p>By submitting this KYC application, I declare that:</p>
          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
            <li>All information provided is true and accurate</li>
            <li>I understand that false information may result in account suspension</li>
            <li>I agree to REMMIC's Terms of Service and Privacy Policy</li>
            <li>I understand SECP regulations regarding fractional real estate investment</li>
            <li>I confirm that my investment funds are from legitimate sources</li>
          </ul>
        </div>
      </div>
    </div>
  )

  if (kycStatus === 'verified') {
    return (
      <div style={{
        background: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>âœ…</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
          KYC Verified
        </h2>
        <p style={{ margin: '0', color: '#16a34a', fontSize: '16px' }}>
          Your identity has been successfully verified. You can now invest in properties.
        </p>
      </div>
    )
  }

  if (kycStatus === 'pending-review') {
    return (
      <div style={{
        background: '#fef3cd',
        border: '2px solid #fbbf24',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>â³</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700', color: '#92400e' }}>
          KYC Under Review
        </h2>
        <p style={{ margin: '0 0 16px 0', color: '#92400e', fontSize: '16px' }}>
          Your KYC application is being reviewed by our compliance team.
        </p>
        <p style={{ margin: '0', color: '#92400e', fontSize: '14px' }}>
          Review typically takes 2-3 business days. We'll notify you once approved.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
          Complete Your KYC Verification
        </h2>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '16px' }}>
          Verify your identity to start investing in real estate
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '40px',
        overflowX: 'auto',
        padding: '0 20px'
      }}>
        {kycSteps.map((step, index) => (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '120px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: currentStep >= step.id ? '#ff5e01' : '#e5e7eb',
                color: currentStep >= step.id ? '#fff' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {currentStep > step.id ? 'âœ“' : step.icon}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: currentStep >= step.id ? '#ff5e01' : '#9ca3af',
                textAlign: 'center'
              }}>
                {step.title}
              </span>
            </div>
            {index < kycSteps.length - 1 && (
              <div style={{
                width: '60px',
                height: '2px',
                background: currentStep > step.id ? '#ff5e01' : '#e5e7eb',
                margin: '0 10px',
                marginTop: '-20px'
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div style={{ marginBottom: '40px' }}>
        {currentStep === 1 && renderPersonalInfoStep()}
        {currentStep === 2 && renderContactInfoStep()}
        {currentStep === 3 && renderFinancialInfoStep()}
        {currentStep === 4 && renderDocumentUploadStep()}
        {currentStep === 5 && renderReviewStep()}
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          style={{
            background: currentStep === 1 ? '#f9fafb' : '#fff',
            color: currentStep === 1 ? '#9ca3af' : '#374151',
            border: '1px solid #d1d5db',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Previous
        </button>

        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Step {currentStep} of {kycSteps.length}
        </div>

        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
            style={{
              background: validateStep(currentStep) ? '#ff5e01' : '#f9fafb',
              color: validateStep(currentStep) ? '#fff' : '#9ca3af',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: validateStep(currentStep) ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease'
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitKYC}
            disabled={isLoading}
            style={{
              background: isLoading ? '#f9fafb' : '#ff5e01',
              color: isLoading ? '#9ca3af' : '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isLoading && (
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {isLoading ? 'Submitting...' : 'Submit KYC'}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
