import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'

// Utility function to estimate localStorage usage
const getStorageUsage = () => {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total
}

// Utility function to format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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
  const [isVisible, setIsVisible] = useState(false)
  const [mediaLibrary, setMediaLibrary] = useState(createEmptyMediaLibrary())
  const [additionalDocs, setAdditionalDocs] = useState([])

  const mediaUploadSections = [
    {
      key: 'simpleImages',
      label: 'Simple Images (Default)',
      shortLabel: 'Images',
      description: 'Upload as many clear property photos as you like. These appear everywhere by default.',
      placeholderIcon: 'IMG',
      emptyStateText: 'Upload clear images of your property',
      actionLabel: 'Choose Images',
      accept: 'image/*'
    },
    {
      key: 'panoramicImages',
      label: '360 & Panoramic',
      shortLabel: '360 Media',
      description: 'Add immersive 360 captures or panoramic renders for a full-view experience.',
      placeholderIcon: '360',
      emptyStateText: 'Upload 360 visuals or panoramic renders',
      actionLabel: 'Upload 360 Media',
      accept: 'image/*'
    },
    {
      key: 'videos',
      label: 'Property Videos',
      shortLabel: 'Videos',
      description: 'Attach walkthroughs, drone clips, or teasers (MP4/WEBM).',
      placeholderIcon: 'VID',
      emptyStateText: 'Upload a walkthrough or teaser video',
      actionLabel: 'Upload Videos',
      accept: 'video/*'
    }
  ]

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
    // Bidding-specific fields
    minBidAmount: '',
    maxBidAmount: '',
    biddingStartDate: '',
    biddingStartTime: '',
    biddingEndDate: '',
    biddingEndTime: '',
    biddingFees: '',
    showInUpcomingAuctions: false,
    // Investment-specific fields
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

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value, type, files, checked, multiple } = e.target
    
    if (type === 'file') {
      const fileList = Array.from(files || [])
      setFormData(prev => ({
        ...prev,
        [name]: multiple ? fileList : fileList[0] || null
      }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }


  const handleAdditionalDocuments = (event) => {
    const files = Array.from(event.target?.files || [])
    if (!files.length) return

    const acceptedFiles = []

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} exceeds the 5MB limit. Please upload a smaller document.`)
        return
      }

      acceptedFiles.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file
      })
    })

    if (acceptedFiles.length) {
      setAdditionalDocs((prev) => [...prev, ...acceptedFiles])
    }

    event.target.value = ''
  }

  const removeAdditionalDocument = (docId) => {
    setAdditionalDocs((prev) => prev.filter((doc) => doc.id !== docId))
  }
// Media helpers
const convertFileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

const handleMediaUpload = async (event, mediaKey = 'simpleImages') => {
  const inputElement = event.target
  const files = Array.from(inputElement?.files || [])
  if (!files.length) return

  const processedFiles = []

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      alert(`${file.name} exceeds the 5MB limit. Please choose a smaller file.`)
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
      console.error('Failed to process file', error)
      alert(`Something went wrong while reading ${file.name}. Please try again.`)
    }
  }

  if (processedFiles.length) {
    setMediaLibrary(prev => ({
      ...prev,
      [mediaKey]: [...prev[mediaKey], ...processedFiles]
    }))
  }

  if (inputElement) {
    inputElement.value = ''
  }
}

const removeMediaAsset = (mediaKey, index) => {
  setMediaLibrary(prev => ({
    ...prev,
    [mediaKey]: prev[mediaKey].filter((_, assetIndex) => assetIndex !== index)
  }))
}

// Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare property data for integration with the property management system
      const propertyData = {
        title: `${formData.landtype} Land - ${formData.areasize}`,
        type: formData.listingType, // This will route to correct page (rental/investment/bidding)
        price: 0, // Will be set later during evaluation
        location: formData.address,
        description: formData.description || `${formData.landtype} land of ${formData.areasize} located at ${formData.address}. Plot/Khasra No: ${formData.plotno}`,
        status: 'pending', // Pending approval/evaluation
        
        // Land specific details
        landType: formData.landtype,
        areaSize: formData.areasize,
        plotNumber: formData.plotno,
        
        // Owner details
        ownerName: formData.fullname,
        ownerCNIC: formData.cnic,
        ownerPhone: formData.phone,
        ownerEmail: formData.email,
        
        // Documents (in real implementation, these would be uploaded to cloud storage)
        documents: {
          cnicDoc: Array.isArray(formData.cnicdoc)
            ? formData.cnicdoc.map(file => file.name).join(', ')
            : formData.cnicdoc?.name || '',
          landDoc: Array.isArray(formData.landdoc)
            ? formData.landdoc.map(file => file.name).join(', ')
            : formData.landdoc?.name || '',
          additional: additionalDocs.map((doc) => ({
            id: doc.id,
            name: doc.name,
            size: doc.size,
            type: doc.type
          }))
        },
        
        // Images with base64 conversion for persistence
        images: mediaLibrary.simpleImages,
        mediaAssets: mediaLibrary,
        
        // Bidding-specific data (only included if listingType is 'bidding')
        ...(formData.listingType === 'bidding' && {
          bidding: {
            minBidAmount: parseFloat(formData.minBidAmount) || 0,
            maxBidAmount: parseFloat(formData.maxBidAmount) || 0,
            startDate: formData.biddingStartDate,
            startTime: formData.biddingStartTime,
            endDate: formData.biddingEndDate,
            endTime: formData.biddingEndTime,
            fees: parseFloat(formData.biddingFees) || 0,
            startDateTime: new Date(`${formData.biddingStartDate}T${formData.biddingStartTime}`).toISOString(),
            endDateTime: new Date(`${formData.biddingEndDate}T${formData.biddingEndTime}`).toISOString(),
            showInUpcomingAuctions: formData.showInUpcomingAuctions
          }
        }),

        ...(formData.listingType === 'investment' && (() => {
          const totalShares = parseFloat(formData.investmentTotalShares) || 0
          const sharePrice = parseFloat(formData.investmentSharePrice) || 0
          const minShares = Math.max(parseFloat(formData.investmentMinShares) || 1, 1)
          const landCost = parseFloat(formData.investmentLandCost) || 0
          const developmentCost = parseFloat(formData.investmentDevelopmentCost) || 0
          const otherCosts = parseFloat(formData.investmentOtherCosts) || 0
          const projectedYield = parseFloat(formData.investmentProjectedYield) || 0
          const expectedAppreciation = parseFloat(formData.investmentExpectedAppreciation) || 0
          const holdingPeriodMonths = parseFloat(formData.investmentHoldingPeriodMonths) || null

          const fundingTargetFromShares = totalShares * sharePrice
          const totalCapitalRequirement = landCost + developmentCost + otherCosts
          const fundingTarget = fundingTargetFromShares || totalCapitalRequirement

          return {
            price: fundingTarget || 0,
            shareOffering: {
              totalShares,
              sharesAvailable: totalShares,
              sharePrice,
              minSharesPerInvestor: minShares,
              minInvestmentAmount: sharePrice * minShares,
              fundingTarget,
              fundingRaised: 0,
              sharesSold: 0,
              investorCount: 0,
              landCost,
              developmentCost,
              otherCosts,
              projectedYield,
              expectedAppreciation,
              holdingPeriodMonths,
              performanceHistory: []
            },
            investmentDetails: {
              landCost,
              developmentCost,
              otherCosts,
              totalCapitalRequirement,
              fundingTarget,
              projectedYield,
              expectedAppreciation,
              holdingPeriodMonths,
              totalShares,
              sharePrice,
              minSharesPerInvestor: minShares
            }
          }
        })()),

        // Metadata
        registrationDate: new Date().toISOString(),
        source: 'land-registration-form',
        needsEvaluation: true
      }

      // Add property through Firebase context - this will make it appear on respective pages
      const result = await addProperty(propertyData)

      if (result.success) {
        // Show success message, including any warnings
        let message = 'Land registration submitted successfully! Your property has been added to the platform and will appear on the respective page based on your listing type.'

        if (result.warning) {
          message += `\n\nNote: ${result.warning}`;
        }
        alert(message)

        
        // Reset form
        setFormData({
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
          // Reset bidding-specific fields
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
        setMediaLibrary(createEmptyMediaLibrary())
        setAdditionalDocs([])
        
        // Clear file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]')
        fileInputs.forEach(input => input.value = '')
        
        // Redirect to appropriate page based on listing type
        setTimeout(() => {
          if (formData.listingType === 'rental') {
            router.push('/rental')
          } else if (formData.listingType === 'investment') {
            router.push('/investment-shares')
          } else {
            router.push('/bidding')
          }
        }, 2000)
        
      } else {
        // Show more helpful error message
        let errorMessage = `Failed to submit registration: ${result.error}`;

        if (result.error.includes("Storage quota exceeded")) {
          errorMessage += `\n\nSuggestions:\n- Try uploading a smaller image (less than 1MB)\n- Choose JPEG format for better compression\n- Contact support if the problem persists`;
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('An error occurred while submitting the registration.')
    } finally {
      setLoading(false)
    }

  }
  return (
    <>
      <Head>
        <title>Land Registration Form - REMMIC</title>
        <meta name="description" content="Register your land property with REMMIC for sale, rent, or investment opportunities" />
      </Head>
      
      <div className="page-wrapper">
        <Navbar />
        
        <main className="main-wrapper">
          <header className="secttion-contact">
            <div className="padding-global">
              <div className="container-large">
                <div className="contact-component" style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                  transition: 'all 0.8s ease'
                }}>
                  <h2 className="heading-style-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    Land Registration Form
                  </h2>
                  
                  <div className="contact-form-block w-form">
                    <form className="contact-form" onSubmit={handleSubmit}>
                      
                      {/* Personal Information */}
                      <div className="form-row">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="fullname">Full Name *</label>
                          <input
                            type="text"
                            id="fullname"
                            name="fullname"
                            placeholder="Ex. Muhammad Ali"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="cnic">CNIC / NIC *</label>
                          <input
                            type="text"
                            id="cnic"
                            name="cnic"
                            placeholder="Ex. 35202-1234567-8"
                            value={formData.cnic}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="phone">Phone Number *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="Ex. 0300-1234567"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="email">Email (Optional)</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Ex. example@gmail.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      {/* Property Information */}
                      <div className="form-row">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="landtype">Land Type *</label>
                          <select
                            id="landtype"
                            name="landtype"
                            value={formData.landtype}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          >
                            <option value="">-- Select Land Type --</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                          </select>
                        </div>
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="listingType">Property Listing Purpose *</label>
                          <select
                            id="listingType"
                            name="listingType"
                            value={formData.listingType}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          >
                            <option value="bidding">For Sale/Bidding</option>
                            <option value="rental">For Rent</option>
                            <option value="investment">Investment Opportunity</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="areasize">Area Size *</label>
                          <input
                            type="text"
                            id="areasize"
                            name="areasize"
                            placeholder="Ex. 5 Marla / 1 Kanal"
                            value={formData.areasize}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="address">Location / Address *</label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="Enter land address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="plotno">Khasra / Plot No *</label>
                          <input
                            type="text"
                            id="plotno"
                            name="plotno"
                            placeholder="Ex. Plot # 123"
                            value={formData.plotno}
                            onChange={handleInputChange}
                            required
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                        <div className="contact-input-field-wrapper"></div>
                      </div>

                      {/* Bidding-Specific Fields - Only show when 'For Sale/Bidding' is selected */}
                      {formData.listingType === 'bidding' && (
                        <>
                          {/* Bid Limits Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="minBidAmount">Minimum Bid Amount (PKR) *</label>
                              <input
                                type="number"
                                id="minBidAmount"
                                name="minBidAmount"
                                placeholder="Ex. 500000"
                                value={formData.minBidAmount}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="maxBidAmount">Maximum Bid Limit (PKR) *</label>
                              <input
                                type="number"
                                id="maxBidAmount"
                                name="maxBidAmount"
                                placeholder="Ex. 2000000"
                                value={formData.maxBidAmount}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Bidding Dates Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="biddingStartDate">Bidding Start Date *</label>
                              <input
                                type="date"
                                id="biddingStartDate"
                                name="biddingStartDate"
                                value={formData.biddingStartDate}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="biddingStartTime">Bidding Start Time *</label>
                              <input
                                type="time"
                                id="biddingStartTime"
                                name="biddingStartTime"
                                value={formData.biddingStartTime}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Bidding End Dates Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="biddingEndDate">Bidding End Date *</label>
                              <input
                                type="date"
                                id="biddingEndDate"
                                name="biddingEndDate"
                                value={formData.biddingEndDate}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="biddingEndTime">Bidding End Time *</label>
                              <input
                                type="time"
                                id="biddingEndTime"
                                name="biddingEndTime"
                                value={formData.biddingEndTime}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Bidding Fees Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="biddingFees">Bidding Fees (PKR) *</label>
                              <input
                                type="number"
                                id="biddingFees"
                                name="biddingFees"
                                placeholder="Ex. 5000"
                                value={formData.biddingFees}
                                onChange={handleInputChange}
                                required={formData.listingType === 'bidding'}
                                style={{
                                  borderRadius: '12px',
                                  border: '2px solid #e5e7eb',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                              <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '6px',
                                fontStyle: 'italic'
                              }}>
                                Amount required to participate in bidding
                              </p>
                            </div>
                            <div className="contact-input-field-wrapper"></div>
                          </div>

                          {/* Show in Upcoming Auctions Checkbox */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                backgroundColor: '#f9fafb',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                              }}>
                              <input
                                type="checkbox"
                                id="showInUpcomingAuctions"
                                name="showInUpcomingAuctions"
                                  checked={formData.showInUpcomingAuctions}
                                onChange={handleInputChange}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: '#ff5e01',
                                    cursor: 'pointer'
                                  }}
                              />
                                <label 
                                  htmlFor="showInUpcomingAuctions"
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    flex: 1
                                  }}
                                >
                                  Show this property in "Upcoming Auctions" section
                                </label>
                            </div>
                              <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginTop: '8px',
                                fontStyle: 'italic'
                              }}>
                                Enable this to display your property in the upcoming auctions showcase on the bidding page
                              </p>
                            </div>
                            <div className="contact-input-field-wrapper"></div>
                          </div>
                        </>
                      )}

                      {/* Investment-Specific Fields - Only show when 'For Investment' is selected */}
                      {formData.listingType === 'investment' && (
                        <>
                          {/* Share Details Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="investmentTotalShares">Total Shares *</label>
                              <input
                                type="number"
                                id="investmentTotalShares"
                                name="investmentTotalShares"
                                placeholder="Ex. 400"
                                value={formData.investmentTotalShares}
                                onChange={handleInputChange}
                                required={formData.listingType === 'investment'}
                                min="1"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                              <div className="contact-input-field-wrapper">
                                <label htmlFor="investmentSharePrice">Price Per Share (PKR) *</label>
                              <input
                                type="number"
                                id="investmentSharePrice"
                                name="investmentSharePrice"
                                placeholder="Ex. 50000"
                                value={formData.investmentSharePrice}
                                onChange={handleInputChange}
                                required={formData.listingType === 'investment'}
                                min="1"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Investment Period and Costs Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="investmentMinShares">Minimum Shares Per Investor *</label>
                              <input
                                type="number"
                                id="investmentMinShares"
                                name="investmentMinShares"
                                placeholder="Ex. 2"
                                value={formData.investmentMinShares}
                                onChange={handleInputChange}
                                required={formData.listingType === 'investment'}
                                min="1"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                              <div className="contact-input-field-wrapper">
                                <label htmlFor="investmentHoldingPeriodMonths">Holding Period (Months)</label>
                              <input
                                type="number"
                                id="investmentHoldingPeriodMonths"
                                name="investmentHoldingPeriodMonths"
                                placeholder="Ex. 36"
                                value={formData.investmentHoldingPeriodMonths}
                                onChange={handleInputChange}
                                min="0"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Cost Breakdown Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="investmentLandCost">Land Cost (PKR) *</label>
                              <input
                                type="number"
                                id="investmentLandCost"
                                name="investmentLandCost"
                                placeholder="Ex. 12000000"
                                value={formData.investmentLandCost}
                                onChange={handleInputChange}
                                required={formData.listingType === 'investment'}
                                min="0"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                              <div className="contact-input-field-wrapper">
                                <label htmlFor="investmentDevelopmentCost">Development / Construction Cost (PKR)</label>
                              <input
                                type="number"
                                id="investmentDevelopmentCost"
                                name="investmentDevelopmentCost"
                                placeholder="Ex. 4000000"
                                value={formData.investmentDevelopmentCost}
                                onChange={handleInputChange}
                                min="0"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Returns and Projections Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="investmentOtherCosts">Other Costs / Fees (PKR)</label>
                              <input
                                type="number"
                                id="investmentOtherCosts"
                                name="investmentOtherCosts"
                                placeholder="Ex. 500000"
                                value={formData.investmentOtherCosts}
                                onChange={handleInputChange}
                                min="0"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                              <div className="contact-input-field-wrapper">
                                <label htmlFor="investmentProjectedYield">Projected Annual Yield (%)</label>
                              <input
                                type="number"
                                id="investmentProjectedYield"
                                name="investmentProjectedYield"
                                placeholder="Ex. 9"
                                value={formData.investmentProjectedYield}
                                onChange={handleInputChange}
                                min="0"
                                step="0.1"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                          </div>

                          {/* Investment Summary Row */}
                          <div className="form-row">
                            <div className="contact-input-field-wrapper">
                              <label htmlFor="investmentExpectedAppreciation">Expected Appreciation (%)</label>
                              <input
                                type="number"
                                id="investmentExpectedAppreciation"
                                name="investmentExpectedAppreciation"
                                placeholder="Ex. 12"
                                value={formData.investmentExpectedAppreciation}
                                onChange={handleInputChange}
                                min="0"
                                step="0.1"
                                style={{
                                    borderRadius: '12px',
                                    border: '2px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                  }}
                                onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                              />
                            </div>
                              <div className="contact-input-field-wrapper" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end'
                              }}>
                                <div style={{
                                  background: '#f8fafc',
                                  borderRadius: '12px',
                                  padding: '16px',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                    color: '#6b7280'
                                  }}>
                                    <span>Target raise (shares × price)</span>
                                    <strong style={{ color: '#111827' }}>
                                      PKR {((parseFloat(formData.investmentTotalShares) || 0) * (parseFloat(formData.investmentSharePrice) || 0)).toLocaleString()}
                                    </strong>
                                </div>
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '8px',
                                    fontSize: '13px',
                                    color: '#6b7280'
                                  }}>
                                    <span>Estimated project cost</span>
                                    <strong style={{ color: '#111827' }}>
                                      PKR {(parseFloat(formData.investmentLandCost || 0)
                                        + parseFloat(formData.investmentDevelopmentCost || 0)
                                        + parseFloat(formData.investmentOtherCosts || 0)).toLocaleString()}
                                    </strong>
                                </div>
                              </div>
                            </div>
                            </div>
                        </>
                      )}

                      {/* Description */}
                      <div className="form-row full-width">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="description">Description</label>
                          <textarea
                            id="description"
                            name="description"
                            placeholder="Enter additional details about land..."
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            style={{
                              borderRadius: '12px',
                              border: '2px solid #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              resize: 'vertical'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      {/* Property Media Uploads */}
                      <div className="form-row full-width">
                        <div className="contact-input-field-wrapper">
                          <label htmlFor="propertyMedia">Property Media</label>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: '16px' }}>
                            Upload as many JPG, PNG, 360 renders, or MP4/WEBM videos as you like. Each file must be under 5MB and will be attached to the property listing.
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {mediaUploadSections.map((section) => {
                              const assets = mediaLibrary[section.key] || []
                              const inputId = `media-upload-${section.key}`
                              return (
                                <div
                                  key={section.key}
                                  style={{
                                    border: '2px dashed #e5e7eb',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    background: '#f9fafb'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                    <div>
                                      <p style={{ margin: 0, fontWeight: 600 }}>{section.label}</p>
                                      <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>{section.description}</p>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                      {assets.length ? `${assets.length} uploaded` : 'No files yet'}
                                    </span>
                                  </div>

                                  <div style={{ marginTop: '15px', background: '#fff', borderRadius: '12px', padding: '15px', border: '1px solid #e5e7eb' }}>
                                    {assets.length ? (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                        {assets.map((asset, index) => (
                                          <div
                                            key={asset.id}
                                            style={{
                                              width: '140px',
                                              border: '1px solid #e5e7eb',
                                              borderRadius: '10px',
                                              overflow: 'hidden',
                                              background: '#fdfdfd'
                                            }}
                                          >
                                            <div style={{ width: '100%', height: '90px', background: '#11182710', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              {asset.type?.startsWith('video') ? (
                                                <video
                                                  src={asset.url}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                  muted
                                                  playsInline
                                                />
                                              ) : (
                                                <img
                                                  src={asset.url}
                                                  alt={asset.name}
                                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                              )}
                                            </div>
                                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                              <p style={{ margin: 0, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</p>
                                              <button
                                                type="button"
                                                onClick={() => removeMediaAsset(section.key, index)}
                                                style={{
                                                  background: '#fee2e2',
                                                  border: 'none',
                                                  borderRadius: '6px',
                                                  padding: '6px',
                                                  fontSize: '12px',
                                                  color: '#b91c1c',
                                                  cursor: 'pointer'
                                                }}
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ textAlign: 'center', color: '#6b7280' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 600, marginBottom: '8px' }}>{section.placeholderIcon}</div>
                                        <p style={{ margin: 0 }}>{section.emptyStateText}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                    <label
                                      htmlFor={inputId}
                                      style={{
                                        background: '#ff5e01',
                                        color: '#fff',
                                        padding: '10px 20px',
                                        borderRadius: '999px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        display: 'inline-block'
                                      }}
                                    >
                                      {section.actionLabel}
                                    </label>
                                    <input
                                      id={inputId}
                                      type="file"
                                      accept={section.accept}
                                      multiple
                                      style={{ display: 'none' }}
                                      onChange={(event) => handleMediaUpload(event, section.key)}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Document Uploads */}
                      <div className="form-row">
                        <div className="contact-input-field-wrapper" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="cnicdoc" style={{ marginBottom: '8px' }}>Upload CNIC Document *</label>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {Array.isArray(formData.cnicdoc) && formData.cnicdoc.length
                                ? `${formData.cnicdoc.length} file${formData.cnicdoc.length > 1 ? 's' : ''} attached`
                                : 'Attach CNIC (PDF/JPG/PNG)'}
                            </span>
                          </div>
                          <input
                            type="file"
                            id="cnicdoc"
                            name="cnicdoc"
                            onChange={handleInputChange}
                            required
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{
                              borderRadius: '12px',
                              border: '2px dashed #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              background: '#f9fafb'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginTop: '12px' }}>
                        <div className="contact-input-field-wrapper" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="landdoc" style={{ marginBottom: '8px' }}>Upload Land Document *</label>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {Array.isArray(formData.landdoc) && formData.landdoc.length
                                ? `${formData.landdoc.length} file${formData.landdoc.length > 1 ? 's' : ''} attached`
                                : 'Attach land doc (PDF/JPG/PNG)'}
                            </span>
                          </div>
                          <input
                            type="file"
                            id="landdoc"
                            name="landdoc"
                            onChange={handleInputChange}
                            required
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{
                              borderRadius: '12px',
                              border: '2px dashed #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              background: '#f9fafb'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ marginTop: '12px' }}>
                        <div className="contact-input-field-wrapper" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label htmlFor="additionalDocs" style={{ marginBottom: '8px' }}>Additional Documents (optional)</label>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {additionalDocs.length ? `${additionalDocs.length} file${additionalDocs.length > 1 ? 's' : ''} attached` : 'Attach PDFs or images'}
                            </span>
                          </div>
                          <input
                            type="file"
                            id="additionalDocs"
                            name="additionalDocs"
                            onChange={handleAdditionalDocuments}
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            style={{
                              borderRadius: '12px',
                              border: '2px dashed #e5e7eb',
                              padding: '12px 16px',
                              fontSize: '14px',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              background: '#f9fafb'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                          />

                          {additionalDocs.length > 0 && (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {additionalDocs.map((doc) => (
                                <div
                                  key={doc.id}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '10px'
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{doc.name}</span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{(doc.size / 1024).toFixed(1)} KB</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeAdditionalDocument(doc.id)}
                                    style={{
                                      background: '#fee2e2',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '6px 10px',
                                      color: '#b91c1c',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          marginTop: '15px',
                          textAlign: 'center',
                          width: '100%',
                          background: loading ? '#ccc' : 'linear-gradient(135deg, #ff5e01, #ff7221)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '15px 30px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        className="button is-submit w-button"
                      >
                        {loading ? 'Submitting...' : 'Submit Registration'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </main>
      </div>
    </>
  )
}


















