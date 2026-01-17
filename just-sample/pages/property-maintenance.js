import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'

const CONTRACTOR_DATABASE = [
  {
    id: 'contractor-1',
    name: 'Ahmed Construction Services',
    specialties: ['Plumbing', 'Electrical', 'General Repairs'],
    rating: 4.8,
    completedProjects: 47,
    phone: '+92 300 1234567',
    email: 'ahmed@constructionservices.pk',
    location: 'Islamabad',
    hourlyRate: 2500,
    availability: 'Available',
    portfolio: [
      { project: 'DHA Phase 2 Apartment Renovation', year: 2024, rating: 5 },
      { project: 'Bahria Town Villa Plumbing', year: 2024, rating: 4.5 },
      { project: 'F-7 Office Building Electrical', year: 2023, rating: 5 }
    ],
    certifications: ['Licensed Electrician', 'Plumbing Certificate'],
    description: 'Experienced contractor with 10+ years in residential and commercial properties. Specializes in quick turnaround repairs and renovations.'
  },
  {
    id: 'contractor-2',
    name: 'Reliable Home Solutions',
    specialties: ['HVAC', 'Painting', 'Carpentry'],
    rating: 4.6,
    completedProjects: 32,
    phone: '+92 301 9876543',
    email: 'contact@reliablehome.pk',
    location: 'Rawalpindi',
    hourlyRate: 3000,
    availability: 'Busy until Dec 15',
    portfolio: [
      { project: 'Gulberg Apartment HVAC Installation', year: 2024, rating: 4.8 },
      { project: 'Model Town House Painting', year: 2024, rating: 4.5 },
      { project: 'Blue Area Office Renovation', year: 2023, rating: 4.7 }
    ],
    certifications: ['HVAC Specialist', 'Safety Training Certified'],
    description: 'Full-service home maintenance company offering quality workmanship and reliable service. Known for attention to detail and customer satisfaction.'
  },
  {
    id: 'contractor-3',
    name: 'Elite Property Maintenance',
    specialties: ['Roofing', 'Waterproofing', 'Structural Repairs'],
    rating: 4.9,
    completedProjects: 63,
    phone: '+92 333 4567890',
    email: 'info@elitemaintenance.pk',
    location: 'Islamabad',
    hourlyRate: 3500,
    availability: 'Available',
    portfolio: [
      { project: 'F-6 Villa Roof Replacement', year: 2024, rating: 5 },
      { project: 'Diplomatic Enclave Waterproofing', year: 2024, rating: 4.8 },
      { project: 'G-9 Complex Structural Repairs', year: 2023, rating: 5 }
    ],
    certifications: ['Structural Engineering Certified', 'Waterproofing Specialist'],
    description: 'Premium maintenance services for high-end properties. Specializes in complex structural work and waterproofing solutions.'
  }
]

const MAINTENANCE_CATEGORIES = [
  { 
    id: 'plumbing', 
    name: 'Plumbing', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 7l-6.5 6.5a1.5 1.5 0 0 0 2.12 2.12L16 9.5"/>
        <path d="M8.5 7.5L10.5 9.5"/>
        <path d="M12 12l1.5 1.5"/>
        <path d="M14 7v1"/>
        <path d="M16 16l1-1"/>
        <path d="M20 20l-2-2"/>
        <path d="M15 15l-2-2"/>
      </svg>
    )
  },
  { 
    id: 'electrical', 
    name: 'Electrical', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  { 
    id: 'hvac', 
    name: 'HVAC', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
        <path d="M12 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        <path d="M12 9v6"/>
      </svg>
    )
  },
  { 
    id: 'painting', 
    name: 'Painting', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/>
        <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>
        <path d="M14.5 17.5L4.5 15"/>
      </svg>
    )
  },
  { 
    id: 'roofing', 
    name: 'Roofing', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"/>
        <path d="M5 21V7l8-4v18"/>
        <path d="M19 21V11l-6-4"/>
      </svg>
    )
  },
  { 
    id: 'carpentry', 
    name: 'Carpentry', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 12l-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/>
        <path d="M17.64 15L22 10.64"/>
        <path d="M20.91 11.7L9.7 22.91A2.12 2.12 0 0 1 6.7 19.9L17.91 8.7a2.12 2.12 0 0 1 3.01 3.01Z"/>
      </svg>
    )
  },
  { 
    id: 'general', 
    name: 'General Repairs', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    )
  }
]

export default function PropertyMaintenance() {
  const router = useRouter()
  const { propertyId } = router.query
  const { getAllProperties } = useFirebase()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredContractors, setFilteredContractors] = useState(CONTRACTOR_DATABASE)
  const [selectedContractor, setSelectedContractor] = useState(null)
  const [showContractorDetails, setShowContractorDetails] = useState(false)
  const [maintenanceRequest, setMaintenanceRequest] = useState({
    description: '',
    urgency: 'standard',
    estimatedCost: '',
    preferredDate: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  })

  useEffect(() => {
    if (propertyId) {
      loadProperty()
    } else {
      // If no propertyId is provided, stop loading and allow general maintenance access
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = CONTRACTOR_DATABASE.filter(contractor =>
        contractor.specialties.some(specialty =>
          specialty.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory === 'general'
        )
      )
      setFilteredContractors(filtered)
    } else {
      setFilteredContractors(CONTRACTOR_DATABASE)
    }
  }, [selectedCategory])

  const loadProperty = async () => {
    try {
      const properties = await getAllProperties()
      const foundProperty = properties.find(p => p.id === propertyId || p.propertyId === propertyId)
      setProperty(foundProperty || null)
    } catch (error) {
      console.error('Error loading property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestChange = (field, value) => {
    setMaintenanceRequest(prev => ({ ...prev, [field]: value }))
  }

  const submitMaintenanceRequest = async () => {
    if (!selectedContractor || !maintenanceRequest.description) {
      alert('Please select a contractor and provide a description.')
      return
    }

    const requestData = {
      propertyId: propertyId || 'general',
      property: property?.title || property?.name || 'General Maintenance Request',
      contractor: selectedContractor.name,
      contractorId: selectedContractor.id,
      contractorPhone: selectedContractor.phone,
      contractorEmail: selectedContractor.email,
      category: selectedCategory,
      description: maintenanceRequest.description,
      urgency: maintenanceRequest.urgency,
      estimatedCost: maintenanceRequest.estimatedCost,
      preferredDate: maintenanceRequest.preferredDate,
      clientContact: {
        name: maintenanceRequest.contactName,
        phone: maintenanceRequest.contactPhone,
        email: maintenanceRequest.contactEmail
      },
      status: 'Pending',
      submittedAt: new Date().toISOString()
    }

    // In a real implementation, this would be saved to Firebase
    console.log('Maintenance request submitted:', requestData)
    alert('Maintenance request submitted successfully! The contractor will contact you shortly.')
    router.back()
  }

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid #f1f5f9'
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#1e293b',
    outline: 'none',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Property Maintenance - REMMIC</title>
        </Head>
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280' }}>Loading property details...</div>
          </main>
        </div>
      </>
    )
  }

  // Only show "Property Not Found" if we have a propertyId but couldn't find the property
  if (propertyId && !property && !loading) {
    return (
      <>
        <Head>
          <title>Property Not Found - REMMIC</title>
        </Head>
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
            <h1 style={{ color: '#1f2937', marginBottom: '16px' }}>Property Not Found</h1>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>The requested property could not be found.</p>
            <button
              onClick={() => router.back()}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#ff5e01',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Property Maintenance - {property ? (property.title || property.name) : 'REMMIC'}</title>
      </Head>
      <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ padding: '100px 24px 140px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Page Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #ff5e01 0%, #ff7a32 45%, #ff9659 100%)',
              borderRadius: '24px',
              padding: '48px',
              color: 'white',
              marginBottom: '48px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <button
                    onClick={() => router.back()}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>
                  <div style={{ 
                    width: '1px', 
                    height: '24px', 
                    background: 'rgba(255,255,255,0.3)' 
                  }} />
                  <h1 style={{ 
                    color: 'white', 
                    margin: 0, 
                    fontSize: '2.5rem', 
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}>
                    Property Maintenance
                  </h1>
                </div>
                {property ? (
                  <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '8px', fontWeight: 600 }}>
                        {property.title || property.name || 'Property'}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem' }}>
                        {property.location || property.address || 'Location not available'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>Property ID</div>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '1.1rem' }}>{property.id || propertyId}</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '12px', fontWeight: 600 }}>
                      Professional Maintenance Services
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Connect with verified contractors and property maintenance specialists in your area. 
                      Get quality work done with transparent pricing and reliable service.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Maintenance Categories */}
            <div style={{ ...cardStyle, marginBottom: '48px' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  color: '#1e293b', 
                  marginBottom: '8px', 
                  fontSize: '1.5rem',
                  fontWeight: 700 
                }}>
                  Choose Your Service Category
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  margin: 0, 
                  fontSize: '1rem',
                  lineHeight: 1.6 
                }}>
                  Select the type of maintenance work you need to find specialized contractors
                </p>
              </div>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {MAINTENANCE_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '20px 24px',
                      borderRadius: '12px',
                      border: selectedCategory === category.id ? '2px solid #ff5e01' : '1px solid #e5e7eb',
                      background: selectedCategory === category.id ? '#fff7ed' : 'white',
                      color: selectedCategory === category.id ? '#ff5e01' : '#374151',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontWeight: selectedCategory === category.id ? 600 : 500,
                      transition: 'all 0.2s ease',
                      boxShadow: selectedCategory === category.id ? '0 4px 12px rgba(255, 94, 1, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      minHeight: '120px',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ 
                      color: selectedCategory === category.id ? '#ff5e01' : '#6b7280',
                      transition: 'color 0.2s ease'
                    }}>
                      {category.icon}
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Available Contractors */}
            {selectedCategory && (
              <div style={{ ...cardStyle, marginBottom: '48px' }}>
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    color: '#1e293b', 
                    marginBottom: '8px', 
                    fontSize: '1.5rem',
                    fontWeight: 700 
                  }}>
                    Available {MAINTENANCE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Contractors
                  </h3>
                  <p style={{ 
                    color: '#64748b', 
                    margin: 0, 
                    fontSize: '1rem',
                    lineHeight: 1.6 
                  }}>
                    Choose from our verified professionals with proven track records
                  </p>
                </div>
                <div style={{ display: 'grid', gap: '24px' }}>
                  {filteredContractors.map(contractor => (
                    <div
                      key={contractor.id}
                      style={{
                        padding: '32px',
                        borderRadius: '20px',
                        border: selectedContractor?.id === contractor.id ? '2px solid #ff5e01' : '1px solid #f1f5f9',
                        background: selectedContractor?.id === contractor.id ? '#fff7ed' : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedContractor?.id === contractor.id 
                          ? '0 12px 48px rgba(255, 94, 1, 0.15)' 
                          : '0 4px 24px rgba(0, 0, 0, 0.08)',
                        transform: selectedContractor?.id === contractor.id ? 'translateY(-4px)' : 'translateY(0)'
                      }}
                      onClick={() => setSelectedContractor(contractor)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ 
                            color: '#1e293b', 
                            marginBottom: '8px', 
                            fontSize: '1.25rem',
                            fontWeight: 700 
                          }}>
                            {contractor.name}
                          </h4>
                          <div style={{ 
                            color: '#64748b', 
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {contractor.location}
                          </div>
                          <div style={{ 
                            color: '#64748b', 
                            fontSize: '0.9rem',
                            lineHeight: 1.5
                          }}>
                            Specializes in: {contractor.specialties.join(', ')}
                          </div>
                        </div>
                        <div style={{ 
                          textAlign: 'right',
                          background: selectedContractor?.id === contractor.id ? 'rgba(255,94,1,0.1)' : '#f8fafc',
                          padding: '16px',
                          borderRadius: '12px',
                          minWidth: '120px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span style={{ color: '#1e293b', fontWeight: 700, fontSize: '1.1rem' }}>{contractor.rating}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                            {contractor.completedProjects} projects completed
                          </div>
                        </div>
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gap: '16px', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        marginBottom: '20px',
                        padding: '20px',
                        background: '#f8fafc',
                        borderRadius: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Hourly Rate</div>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>PKR {contractor.hourlyRate}/hr</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            background: contractor.availability === 'Available' ? '#16a34a' : '#dc2626' 
                          }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Availability</div>
                            <div style={{ 
                              fontWeight: 600, 
                              color: contractor.availability === 'Available' ? '#16a34a' : '#dc2626' 
                            }}>
                              {contractor.availability}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Contact Information</span>
                        </div>
                        <div style={{ paddingLeft: '24px' }}>
                          <div style={{ marginBottom: '4px', fontSize: '0.9rem', color: '#1e293b' }}>{contractor.phone}</div>
                          <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{contractor.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedContractor(contractor)
                          setShowContractorDetails(true)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                          color: '#475569',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        View Portfolio & Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contractor Details Modal */}
            {showContractorDetails && selectedContractor && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflow: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                    <h2 style={{ color: '#1f2937', margin: 0 }}>{selectedContractor.name}</h2>
                    <button
                      onClick={() => setShowContractorDetails(false)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        background: 'white',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>About</h3>
                    <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{selectedContractor.description}</p>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '12px' }}>Recent Projects</h3>
                    {selectedContractor.portfolio.map((project, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                          {project.project}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
                          <span>{project.year}</span>
                          <span>Rating: {project.rating}★</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Certifications</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedContractor.certifications.map((cert, index) => (
                        <span key={index} style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: '#dcfce7',
                          color: '#166534',
                          fontSize: '0.8rem'
                        }}>
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowContractorDetails(false)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ff5e01',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Select This Contractor
                  </button>
                </div>
              </div>
            )}

            {/* Request Form */}
            {selectedContractor && (
              <div style={cardStyle}>
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    color: '#1e293b', 
                    marginBottom: '8px', 
                    fontSize: '1.5rem',
                    fontWeight: 700 
                  }}>
                    Submit Your Maintenance Request
                  </h3>
                  <p style={{ 
                    color: '#64748b', 
                    margin: 0, 
                    fontSize: '1rem',
                    lineHeight: 1.6 
                  }}>
                    Provide details about your maintenance needs and schedule with your selected contractor
                  </p>
                </div>
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      color: '#1e293b', 
                      fontWeight: 600, 
                      marginBottom: '8px',
                      fontSize: '0.95rem'
                    }}>
                      Selected Contractor
                    </label>
                    <div style={{ 
                      padding: '16px 20px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      color: '#1e293b',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#16a34a" stroke="#16a34a" strokeWidth="2">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedContractor.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{selectedContractor.phone} • {selectedContractor.email}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                      Problem Description *
                    </label>
                    <textarea
                      value={maintenanceRequest.description}
                      onChange={(e) => handleRequestChange('description', e.target.value)}
                      placeholder="Describe the maintenance issue in detail..."
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                        Urgency Level
                      </label>
                      <select
                        value={maintenanceRequest.urgency}
                        onChange={(e) => handleRequestChange('urgency', e.target.value)}
                        style={inputStyle}
                      >
                        <option value="standard">Standard (3-5 days)</option>
                        <option value="urgent">Urgent (24-48 hours)</option>
                        <option value="emergency">Emergency (Same day)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                        Estimated Budget (PKR)
                      </label>
                      <input
                        type="text"
                        value={maintenanceRequest.estimatedCost}
                        onChange={(e) => handleRequestChange('estimatedCost', e.target.value)}
                        placeholder="e.g., 50,000"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                        Preferred Start Date
                      </label>
                      <input
                        type="date"
                        value={maintenanceRequest.preferredDate}
                        onChange={(e) => handleRequestChange('preferredDate', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={maintenanceRequest.contactName}
                        onChange={(e) => handleRequestChange('contactName', e.target.value)}
                        placeholder="Your full name"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={maintenanceRequest.contactPhone}
                        onChange={(e) => handleRequestChange('contactPhone', e.target.value)}
                        placeholder="+92 300 1234567"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#374151', fontWeight: 500, marginBottom: '6px' }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={maintenanceRequest.contactEmail}
                        onChange={(e) => handleRequestChange('contactEmail', e.target.value)}
                        placeholder="your@email.com"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <button
                    onClick={submitMaintenanceRequest}
                    style={{
                      width: '100%',
                      padding: '18px 32px',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #ff5e01 0%, #ff7a32 45%, #ff9659 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      marginTop: '16px',
                      boxShadow: '0 8px 32px rgba(255, 94, 1, 0.3)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m22 2-7 20-4-9-9-4Z"/>
                      <path d="M22 2 11 13"/>
                    </svg>
                    Submit Maintenance Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}