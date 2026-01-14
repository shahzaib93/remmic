import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PropertySubmission() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState({
    // Section A - Client Information
    fullName: '',
    cnicPassport: '',
    nationality: 'pakistani',
    foreignNationality: '',
    mobile: '',
    email: '',
    residentialAddress: '',
    isLegalOwner: 'yes',
    ownerRelation: '',

    // Section B - Property Basic Info
    propertyType: '',
    otherPropertyType: '',
    country: 'Pakistan',
    city: '',
    area: '',
    block: '',
    propertySize: '',
    sizeUnit: 'marla',
    propertyNature: '',

    // Section C - Ownership & Legal
    ownershipDocument: [],
    otherDocument: '',
    transferStatus: '',
    disputeFree: 'yes',
    disputeDetails: '',
    outstandingDues: [],

    // Section D - Construction Details
    constructionStatus: '',
    yearOfConstruction: '',
    numberOfFloors: '',
    approvedPlan: '',

    // Section E - Financial Expectations
    expectedPrice: '',
    priceCurrency: 'PKR',
    minimumPrice: '',
    urgencyLevel: '',
    openToAuction: '',
    auctionCondition: '',

    // Section F - Rental Income
    currentlyRented: 'no',
    monthlyRental: '',
    tenantType: '',
    tenancyAgreement: '',

    // Section G - Media
    photosAvailable: 'no',
    videosAvailable: 'no',
    documentsUploaded: [],

    // Section H - Declaration
    declarationAccepted: false,
    declarationDate: ''
  })

  const sections = [
    { id: 'A', title: 'Client / Owner Information' },
    { id: 'B', title: 'Property Basic Information' },
    { id: 'C', title: 'Ownership & Legal Status' },
    { id: 'D', title: 'Construction Details' },
    { id: 'E', title: 'Financial Expectations' },
    { id: 'F', title: 'Rental / Income' },
    { id: 'G', title: 'Media & Documents' },
    { id: 'H', title: 'Declaration & Submit' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'declarationAccepted') {
        setFormData(prev => ({ ...prev, [name]: checked }))
      } else {
        // Handle array checkboxes
        const arrayName = name.split('_')[0]
        const arrayValue = name.split('_')[1]
        setFormData(prev => ({
          ...prev,
          [arrayName]: checked
            ? [...(prev[arrayName] || []), arrayValue]
            : (prev[arrayName] || []).filter(v => v !== arrayValue)
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would submit to an API
    alert('Form submitted successfully! Our team will review your property details.')
    router.push('/marketplace')
  }

  const renderSectionA = () => (
    <div className="form-section">
      <div className="form-group">
        <label>Full Name (as per CNIC / Passport) <span className="required">*</span></label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Enter your full legal name"
          required
        />
      </div>

      <div className="form-group">
        <label>CNIC / Passport No. <span className="required">*</span></label>
        <input
          type="text"
          name="cnicPassport"
          value={formData.cnicPassport}
          onChange={handleInputChange}
          placeholder="e.g., 35201-1234567-8"
          required
        />
      </div>

      <div className="form-group">
        <label>Nationality <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="nationality"
              value="pakistani"
              checked={formData.nationality === 'pakistani'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Pakistani
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="nationality"
              value="overseas"
              checked={formData.nationality === 'overseas'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Overseas Pakistani
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="nationality"
              value="foreign"
              checked={formData.nationality === 'foreign'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Foreign National
          </label>
        </div>
        {formData.nationality === 'foreign' && (
          <input
            type="text"
            name="foreignNationality"
            value={formData.foreignNationality}
            onChange={handleInputChange}
            placeholder="Specify nationality"
            className="conditional-input"
          />
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Mobile Number (WhatsApp) <span className="required">*</span></label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            placeholder="+92 300 1234567"
            required
          />
        </div>
        <div className="form-group">
          <label>Email Address <span className="required">*</span></label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Current Residential Address <span className="required">*</span></label>
        <textarea
          name="residentialAddress"
          value={formData.residentialAddress}
          onChange={handleInputChange}
          placeholder="Enter your complete residential address"
          rows="3"
          required
        />
      </div>

      <div className="form-group">
        <label>Are you the legal owner of the property? <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="isLegalOwner"
              value="yes"
              checked={formData.isLegalOwner === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="isLegalOwner"
              value="no"
              checked={formData.isLegalOwner === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
        </div>
        {formData.isLegalOwner === 'no' && (
          <input
            type="text"
            name="ownerRelation"
            value={formData.ownerRelation}
            onChange={handleInputChange}
            placeholder="Explain your relationship to the property"
            className="conditional-input"
          />
        )}
      </div>
    </div>
  )

  const renderSectionB = () => (
    <div className="form-section">
      <div className="form-group">
        <label>Property Type <span className="required">*</span></label>
        <div className="checkbox-grid">
          {[
            { value: 'residential_plot', label: 'Residential Plot' },
            { value: 'commercial_plot', label: 'Commercial Plot' },
            { value: 'house', label: 'House' },
            { value: 'apartment', label: 'Apartment / Flat' },
            { value: 'plaza', label: 'Plaza / Building' },
            { value: 'agricultural', label: 'Agricultural Land' },
            { value: 'other', label: 'Other' }
          ].map(type => (
            <label key={type.value} className="radio-label">
              <input
                type="radio"
                name="propertyType"
                value={type.value}
                checked={formData.propertyType === type.value}
                onChange={handleInputChange}
              />
              <span className="radio-custom"></span>
              {type.label}
            </label>
          ))}
        </div>
        {formData.propertyType === 'other' && (
          <input
            type="text"
            name="otherPropertyType"
            value={formData.otherPropertyType}
            onChange={handleInputChange}
            placeholder="Specify property type"
            className="conditional-input"
          />
        )}
      </div>

      <div className="form-group">
        <label>Property Location <span className="required">*</span></label>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country"
            />
            <span className="input-hint">Country</span>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              required
            />
            <span className="input-hint">City</span>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="e.g., DHA Phase 6, Bahria Town"
              required
            />
            <span className="input-hint">Area / Society / Scheme</span>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="block"
              value={formData.block}
              onChange={handleInputChange}
              placeholder="e.g., Block D, Sector F"
            />
            <span className="input-hint">Block / Sector (if any)</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Property Size <span className="required">*</span></label>
        <div className="form-row size-row">
          <div className="form-group">
            <input
              type="number"
              name="propertySize"
              value={formData.propertySize}
              onChange={handleInputChange}
              placeholder="Enter size"
              required
            />
          </div>
          <div className="form-group">
            <select
              name="sizeUnit"
              value={formData.sizeUnit}
              onChange={handleInputChange}
            >
              <option value="sqft">Sq. Ft</option>
              <option value="sqyd">Sq. Yd</option>
              <option value="kanal">Kanal</option>
              <option value="marla">Marla</option>
              <option value="acre">Acre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Nature of Property <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="propertyNature"
              value="freehold"
              checked={formData.propertyNature === 'freehold'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Freehold
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="propertyNature"
              value="leasehold"
              checked={formData.propertyNature === 'leasehold'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Leasehold
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="propertyNature"
              value="allotted"
              checked={formData.propertyNature === 'allotted'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Allotted (not transferred)
          </label>
        </div>
      </div>
    </div>
  )

  const renderSectionC = () => (
    <div className="form-section">
      <div className="form-group">
        <label>Ownership Document Available <span className="required">*</span></label>
        <div className="checkbox-grid">
          {[
            { value: 'sale_deed', label: 'Sale Deed' },
            { value: 'allotment_letter', label: 'Allotment Letter' },
            { value: 'registry', label: 'Registry' },
            { value: 'lease_agreement', label: 'Lease Agreement' },
            { value: 'other', label: 'Other' }
          ].map(doc => (
            <label key={doc.value} className="checkbox-label">
              <input
                type="checkbox"
                name={`ownershipDocument_${doc.value}`}
                checked={formData.ownershipDocument?.includes(doc.value)}
                onChange={handleInputChange}
              />
              <span className="checkbox-custom"></span>
              {doc.label}
            </label>
          ))}
        </div>
        {formData.ownershipDocument?.includes('other') && (
          <input
            type="text"
            name="otherDocument"
            value={formData.otherDocument}
            onChange={handleInputChange}
            placeholder="Specify document type"
            className="conditional-input"
          />
        )}
      </div>

      <div className="form-group">
        <label>Property Transfer Status <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="transferStatus"
              value="fully_transferred"
              checked={formData.transferStatus === 'fully_transferred'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Fully transferred
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="transferStatus"
              value="in_process"
              checked={formData.transferStatus === 'in_process'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Transfer in process
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="transferStatus"
              value="not_transferred"
              checked={formData.transferStatus === 'not_transferred'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Not transferred
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Is the property free from disputes? <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="disputeFree"
              value="yes"
              checked={formData.disputeFree === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="disputeFree"
              value="no"
              checked={formData.disputeFree === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
        </div>
        {formData.disputeFree === 'no' && (
          <textarea
            name="disputeDetails"
            value={formData.disputeDetails}
            onChange={handleInputChange}
            placeholder="Please explain the dispute"
            className="conditional-input"
            rows="3"
          />
        )}
      </div>

      <div className="form-group">
        <label>Any outstanding dues?</label>
        <div className="checkbox-grid">
          {[
            { value: 'development', label: 'Development charges' },
            { value: 'utility', label: 'Utility bills' },
            { value: 'taxes', label: 'Taxes' },
            { value: 'none', label: 'None' }
          ].map(due => (
            <label key={due.value} className="checkbox-label">
              <input
                type="checkbox"
                name={`outstandingDues_${due.value}`}
                checked={formData.outstandingDues?.includes(due.value)}
                onChange={handleInputChange}
              />
              <span className="checkbox-custom"></span>
              {due.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSectionD = () => (
    <div className="form-section">
      <div className="section-note">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        Skip this section if the property is a plot only
      </div>

      <div className="form-group">
        <label>Construction Status</label>
        <div className="radio-group">
          {[
            { value: 'fully_constructed', label: 'Fully constructed' },
            { value: 'under_construction', label: 'Under construction' },
            { value: 'old_construction', label: 'Old construction' },
            { value: 'brand_new', label: 'Brand new' }
          ].map(status => (
            <label key={status.value} className="radio-label">
              <input
                type="radio"
                name="constructionStatus"
                value={status.value}
                checked={formData.constructionStatus === status.value}
                onChange={handleInputChange}
              />
              <span className="radio-custom"></span>
              {status.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Year of Construction (approx.)</label>
          <input
            type="number"
            name="yearOfConstruction"
            value={formData.yearOfConstruction}
            onChange={handleInputChange}
            placeholder="e.g., 2018"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <div className="form-group">
          <label>Number of Floors</label>
          <input
            type="number"
            name="numberOfFloors"
            value={formData.numberOfFloors}
            onChange={handleInputChange}
            placeholder="e.g., 2"
            min="1"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Approved Building Plan Available?</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="approvedPlan"
              value="yes"
              checked={formData.approvedPlan === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="approvedPlan"
              value="no"
              checked={formData.approvedPlan === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
        </div>
      </div>
    </div>
  )

  const renderSectionE = () => (
    <div className="form-section">
      <div className="form-group">
        <label>Expected Sale Price <span className="required">*</span></label>
        <div className="form-row price-row">
          <div className="form-group">
            <input
              type="number"
              name="expectedPrice"
              value={formData.expectedPrice}
              onChange={handleInputChange}
              placeholder="Enter amount"
              required
            />
          </div>
          <div className="form-group">
            <select
              name="priceCurrency"
              value={formData.priceCurrency}
              onChange={handleInputChange}
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Minimum Acceptable Price (if any)</label>
        <input
          type="number"
          name="minimumPrice"
          value={formData.minimumPrice}
          onChange={handleInputChange}
          placeholder="Enter minimum acceptable price"
        />
      </div>

      <div className="form-group">
        <label>Urgency Level <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="urgencyLevel"
              value="immediate"
              checked={formData.urgencyLevel === 'immediate'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Immediate (0–30 days)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="urgencyLevel"
              value="short_term"
              checked={formData.urgencyLevel === 'short_term'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Short-term (1–3 months)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="urgencyLevel"
              value="flexible"
              checked={formData.urgencyLevel === 'flexible'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Flexible
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Open to Auction / Bidding Model? <span className="required">*</span></label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="openToAuction"
              value="yes"
              checked={formData.openToAuction === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="openToAuction"
              value="no"
              checked={formData.openToAuction === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="openToAuction"
              value="conditional"
              checked={formData.openToAuction === 'conditional'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Conditional
          </label>
        </div>
        {formData.openToAuction === 'conditional' && (
          <textarea
            name="auctionCondition"
            value={formData.auctionCondition}
            onChange={handleInputChange}
            placeholder="Explain your conditions"
            className="conditional-input"
            rows="3"
          />
        )}
      </div>
    </div>
  )

  const renderSectionF = () => (
    <div className="form-section">
      <div className="form-group">
        <label>Currently Rented?</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="currentlyRented"
              value="yes"
              checked={formData.currentlyRented === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="currentlyRented"
              value="no"
              checked={formData.currentlyRented === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
        </div>
      </div>

      {formData.currentlyRented === 'yes' && (
        <>
          <div className="form-group">
            <label>Monthly Rental Income</label>
            <input
              type="number"
              name="monthlyRental"
              value={formData.monthlyRental}
              onChange={handleInputChange}
              placeholder="Enter monthly rent amount"
            />
          </div>

          <div className="form-group">
            <label>Tenant Type</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="tenantType"
                  value="residential"
                  checked={formData.tenantType === 'residential'}
                  onChange={handleInputChange}
                />
                <span className="radio-custom"></span>
                Residential
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="tenantType"
                  value="commercial"
                  checked={formData.tenantType === 'commercial'}
                  onChange={handleInputChange}
                />
                <span className="radio-custom"></span>
                Commercial
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Tenancy Agreement Available?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="tenancyAgreement"
                  value="yes"
                  checked={formData.tenancyAgreement === 'yes'}
                  onChange={handleInputChange}
                />
                <span className="radio-custom"></span>
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="tenancyAgreement"
                  value="no"
                  checked={formData.tenancyAgreement === 'no'}
                  onChange={handleInputChange}
                />
                <span className="radio-custom"></span>
                No
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderSectionG = () => (
    <div className="form-section">
      <div className="form-group">
        <label>Property Photos Available?</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="photosAvailable"
              value="yes"
              checked={formData.photosAvailable === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="photosAvailable"
              value="no"
              checked={formData.photosAvailable === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Property Videos Available?</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="videosAvailable"
              value="yes"
              checked={formData.videosAvailable === 'yes'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="videosAvailable"
              value="no"
              checked={formData.videosAvailable === 'no'}
              onChange={handleInputChange}
            />
            <span className="radio-custom"></span>
            No
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Documents to Upload</label>
        <div className="checkbox-grid">
          {[
            { value: 'ownership', label: 'Ownership papers' },
            { value: 'cnic', label: 'CNIC / Passport' },
            { value: 'approved_plan', label: 'Approved plan' },
            { value: 'utility_bills', label: 'Utility bills' },
            { value: 'others', label: 'Others' }
          ].map(doc => (
            <label key={doc.value} className="checkbox-label">
              <input
                type="checkbox"
                name={`documentsUploaded_${doc.value}`}
                checked={formData.documentsUploaded?.includes(doc.value)}
                onChange={handleInputChange}
              />
              <span className="checkbox-custom"></span>
              {doc.label}
            </label>
          ))}
        </div>
      </div>

      <div className="upload-area">
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p>Drag & drop files here or click to browse</p>
        <span>Supported: PDF, JPG, PNG (Max 10MB each)</span>
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" />
      </div>
    </div>
  )

  const renderSectionH = () => (
    <div className="form-section">
      <div className="declaration-box">
        <h4>Client Declaration</h4>
        <p>
          I hereby declare that the information provided above is true and correct to the best of my knowledge.
          I understand that submission of this form does not guarantee listing, valuation, or sale and is subject
          to REMMIC's internal evaluation and approval process.
        </p>

        <label className="checkbox-label declaration-checkbox">
          <input
            type="checkbox"
            name="declarationAccepted"
            checked={formData.declarationAccepted}
            onChange={handleInputChange}
            required
          />
          <span className="checkbox-custom"></span>
          I accept the above declaration and agree to REMMIC's terms and conditions
        </label>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="declarationDate"
            value={formData.declarationDate}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="disclaimer-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <p>
          <strong>Disclaimer:</strong> REMMIC is a management and structuring platform.
          Investments are project-based and subject to risk. Returns are indicative only and not guaranteed.
        </p>
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0: return renderSectionA()
      case 1: return renderSectionB()
      case 2: return renderSectionC()
      case 3: return renderSectionD()
      case 4: return renderSectionE()
      case 5: return renderSectionF()
      case 6: return renderSectionG()
      case 7: return renderSectionH()
      default: return renderSectionA()
    }
  }

  return (
    <>
      <Head>
        <title>Property Submission | REMMIC</title>
        <meta name="description" content="Submit your property for evaluation on REMMIC platform" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="form-page">
          {/* Hero Section */}
          <section className="form-hero">
            <div className="form-hero__content">
              <span className="form-hero__badge">Property Evaluation</span>
              <h1>Real Estate Evaluation Intake Form</h1>
              <p>Submit your property details for internal evaluation before approval for marketing, bidding, or investment on the REMMIC platform.</p>
            </div>
          </section>

          {/* Progress Bar */}
          <div className="form-progress-container">
            <div className="form-progress">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`progress-step ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
                  onClick={() => setCurrentSection(index)}
                >
                  <div className="progress-step__number">
                    {index < currentSection ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    ) : (
                      section.id
                    )}
                  </div>
                  <span className="progress-step__label">{section.title}</span>
                </div>
              ))}
              <div className="progress-line">
                <div
                  className="progress-line__fill"
                  style={{ width: `${(currentSection / (sections.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-card">
                <div className="form-card__header">
                  <span className="section-badge">Section {sections[currentSection].id}</span>
                  <h2>{sections[currentSection].title}</h2>
                </div>

                <div className="form-card__body">
                  {renderCurrentSection()}
                </div>

                <div className="form-card__footer">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={prevSection}
                    disabled={currentSection === 0}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6"/>
                    </svg>
                    Previous
                  </button>

                  {currentSection < sections.length - 1 ? (
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={nextSection}
                    >
                      Next Section
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"/>
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn--primary btn--submit"
                      disabled={!formData.declarationAccepted}
                    >
                      Submit for Evaluation
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background: #faf9f8;
        }

        /* Hero Section */
        .form-hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 120px 5% 60px;
          position: relative;
          overflow: hidden;
        }

        .form-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 30% 0%, rgba(201, 162, 39, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .form-hero__content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .form-hero__badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 100px;
          color: #c9a227;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        }

        .form-hero h1 {
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px;
          font-family: 'Playfair Display', serif;
          line-height: 1.2;
        }

        .form-hero p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          font-family: 'Manrope', sans-serif;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Progress Bar */
        .form-progress-container {
          background: #ffffff;
          border-bottom: 1px solid #e8e8e6;
          padding: 24px 5%;
          position: sticky;
          top: 70px;
          z-index: 100;
        }

        .form-progress {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }

        .progress-line {
          position: absolute;
          top: 18px;
          left: 40px;
          right: 40px;
          height: 2px;
          background: #e8e8e6;
          z-index: 0;
        }

        .progress-line__fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a227 0%, #d4b13d 100%);
          transition: width 0.4s ease;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .progress-step__number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #e8e8e6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #8b8b8b;
          font-family: 'Manrope', sans-serif;
          transition: all 0.3s ease;
        }

        .progress-step.active .progress-step__number {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          border-color: #c9a227;
          color: #0a0a0a;
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.35);
        }

        .progress-step.completed .progress-step__number {
          background: #c9a227;
          border-color: #c9a227;
          color: #0a0a0a;
        }

        .progress-step__label {
          font-size: 0.6875rem;
          color: #8b8b8b;
          margin-top: 8px;
          text-align: center;
          font-family: 'Manrope', sans-serif;
          max-width: 80px;
          line-height: 1.3;
          transition: color 0.3s ease;
        }

        .progress-step.active .progress-step__label {
          color: #0a0a0a;
          font-weight: 600;
        }

        .progress-step.completed .progress-step__label {
          color: #c9a227;
        }

        /* Form Container */
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 5% 80px;
        }

        .form-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e8e8e6;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .form-card__header {
          padding: 28px 32px;
          border-bottom: 1px solid #f0f0ee;
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
        }

        .section-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(201, 162, 39, 0.12);
          border-radius: 6px;
          color: #c9a227;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
          margin-bottom: 12px;
        }

        .form-card__header h2 {
          margin: 0;
          font-size: 1.375rem;
          font-weight: 600;
          color: #0a0a0a;
          font-family: 'Playfair Display', serif;
        }

        .form-card__body {
          padding: 32px;
        }

        .form-card__footer {
          padding: 24px 32px;
          border-top: 1px solid #f0f0ee;
          background: #faf9f8;
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        /* Form Elements */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1a1a1a;
          font-family: 'Manrope', sans-serif;
        }

        .required {
          color: #dc2626;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="tel"],
        .form-group input[type="number"],
        .form-group input[type="date"],
        .form-group textarea,
        .form-group select {
          padding: 14px 18px;
          border: 1px solid #e8e8e6;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-family: 'Manrope', sans-serif;
          color: #1a1a1a;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.12);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #9ca3af;
        }

        .input-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .size-row,
        .price-row {
          grid-template-columns: 2fr 1fr;
        }

        .conditional-input {
          margin-top: 12px;
        }

        /* Radio & Checkbox */
        .radio-group,
        .checkbox-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .checkbox-grid {
          gap: 16px;
        }

        .radio-label,
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #3d3d3d;
          font-family: 'Manrope', sans-serif;
          padding: 10px 16px;
          border: 1px solid #e8e8e6;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .radio-label:hover,
        .checkbox-label:hover {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.04);
        }

        .radio-label input,
        .checkbox-label input {
          display: none;
        }

        .radio-custom,
        .checkbox-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .checkbox-custom {
          border-radius: 6px;
        }

        .radio-label input:checked + .radio-custom,
        .checkbox-label input:checked + .checkbox-custom {
          border-color: #c9a227;
          background: #c9a227;
        }

        .radio-label input:checked + .radio-custom::after {
          content: '';
          width: 8px;
          height: 8px;
          background: #0a0a0a;
          border-radius: 50%;
        }

        .checkbox-label input:checked + .checkbox-custom::after {
          content: '';
          width: 6px;
          height: 10px;
          border: solid #0a0a0a;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          margin-bottom: 2px;
        }

        .radio-label:has(input:checked),
        .checkbox-label:has(input:checked) {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.08);
        }

        /* Section Note */
        .section-note {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 10px;
          font-size: 0.875rem;
          color: #1d4ed8;
          font-family: 'Manrope', sans-serif;
        }

        .section-note svg {
          flex-shrink: 0;
        }

        /* Upload Area */
        .upload-area {
          border: 2px dashed #e8e8e6;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
        }

        .upload-area:hover {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.04);
        }

        .upload-icon {
          color: #c9a227;
          margin-bottom: 16px;
        }

        .upload-area p {
          font-size: 0.9375rem;
          color: #3d3d3d;
          margin: 0 0 8px;
          font-family: 'Manrope', sans-serif;
        }

        .upload-area span {
          font-size: 0.8125rem;
          color: #8b8b8b;
          font-family: 'Manrope', sans-serif;
        }

        .upload-area input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        /* Declaration Box */
        .declaration-box {
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
          border: 1px solid #e8e8e6;
          border-radius: 12px;
          padding: 28px;
        }

        .declaration-box h4 {
          margin: 0 0 16px;
          font-size: 1.125rem;
          font-weight: 600;
          color: #0a0a0a;
          font-family: 'Playfair Display', serif;
        }

        .declaration-box > p {
          font-size: 0.9rem;
          color: #4a4a4a;
          line-height: 1.7;
          margin: 0 0 24px;
          font-family: 'Manrope', sans-serif;
        }

        .declaration-checkbox {
          margin-bottom: 20px;
          background: #ffffff;
        }

        /* Disclaimer Box */
        .disclaimer-box {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 10px;
          margin-top: 24px;
        }

        .disclaimer-box svg {
          color: #b45309;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .disclaimer-box p {
          margin: 0;
          font-size: 0.8125rem;
          color: #92400e;
          line-height: 1.6;
          font-family: 'Manrope', sans-serif;
        }

        .disclaimer-box strong {
          font-weight: 700;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 28px;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: 'Manrope', sans-serif;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 14px rgba(201, 162, 39, 0.35);
        }

        .btn--primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(201, 162, 39, 0.45);
        }

        .btn--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn--secondary {
          background: #ffffff;
          color: #3d3d3d;
          border: 1px solid #e8e8e6;
        }

        .btn--secondary:hover:not(:disabled) {
          border-color: #c9a227;
          color: #c9a227;
        }

        .btn--secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn--submit {
          min-width: 200px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .form-hero {
            padding: 100px 5% 50px;
          }

          .form-hero h1 {
            font-size: 1.75rem;
          }

          .form-progress-container {
            overflow-x: auto;
            padding: 20px 5%;
          }

          .form-progress {
            min-width: 600px;
            padding: 0 20px;
          }

          .progress-step__label {
            display: none;
          }

          .form-container {
            padding: 24px 4% 60px;
          }

          .form-card__header,
          .form-card__body,
          .form-card__footer {
            padding: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .size-row,
          .price-row {
            grid-template-columns: 1fr 1fr;
          }

          .radio-group,
          .checkbox-grid {
            flex-direction: column;
          }

          .radio-label,
          .checkbox-label {
            width: 100%;
          }

          .form-card__footer {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .form-hero {
            padding: 90px 5% 40px;
          }

          .form-hero h1 {
            font-size: 1.5rem;
          }

          .form-hero p {
            font-size: 0.9rem;
          }

          .progress-step__number {
            width: 32px;
            height: 32px;
            font-size: 0.75rem;
          }

          .form-card__header h2 {
            font-size: 1.125rem;
          }

          .form-group label {
            font-size: 0.875rem;
          }

          .form-group input,
          .form-group textarea,
          .form-group select {
            padding: 12px 14px;
            font-size: 0.875rem;
          }

          .upload-area {
            padding: 30px 20px;
          }

          .declaration-box {
            padding: 20px;
          }

          .btn {
            padding: 12px 20px;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  )
}
