import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function EvaluationDetail() {
  const router = useRouter()
  const { id } = router.query
  const [property, setProperty] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (id) {
      loadPropertyDetails()
    }
    
    // Add event listener for evaluation approval
    const handleEvaluationUpdate = () => {
      if (id) {
        loadPropertyDetails()
      }
    }
    
    window.addEventListener('evaluationApproved', handleEvaluationUpdate)
    window.addEventListener('evaluationPropertiesUpdated', handleEvaluationUpdate)
    
    return () => {
      window.removeEventListener('evaluationApproved', handleEvaluationUpdate)
      window.removeEventListener('evaluationPropertiesUpdated', handleEvaluationUpdate)
    }
  }, [id])

  const loadPropertyDetails = () => {
    try {
      const evaluationProperties = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
      const foundProperty = evaluationProperties.find(prop => prop.id.toString() === id)
      setProperty(foundProperty)
    } catch (error) {
      console.error('Error loading property details:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isClient) {
    return null
  }

  if (!property) {
    return (
      <>
        <Head>
          <title>Property Not Found - REMMIC</title>
        </Head>
        <div className="page-wrapper">
          <Navbar />
          <div style={{
            padding: '100px 20px',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h2 style={{fontSize: '2rem', marginBottom: '10px', color: '#1f2937'}}>Property Not Found</h2>
            <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '30px'}}>
              The property you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => router.push('/evaluation')}
              style={{
                padding: '12px 24px',
                background: '#080808',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Back to Evaluation
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{property.propertyType} in {property.city} - Evaluation Details - REMMIC</title>
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={() => router.back()}
              style={{
                padding: '10px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              Back
            </button>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
              Property Evaluation Details
            </h1>
            <div style={{
              display: 'inline-block',
              padding: '6px 12px',
              background: property.status === 'Under Evaluation' ? '#fef3c7' : 
                         property.status === 'Approved' ? '#dcfce7' :
                         property.status === 'Rejected' ? '#fef2f2' : '#f3f4f6',
              color: property.status === 'Under Evaluation' ? '#92400e' : 
                     property.status === 'Approved' ? '#166534' :
                     property.status === 'Rejected' ? '#991b1b' : '#6b7280',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {property.status}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
            {/* Property Image */}
            <div>
              <img
                src={property.image}
                alt={property.propertyType}
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>

            {/* Property Summary */}
            <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '12px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
                {property.propertyType} in {property.city}
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                  Property Information
                </h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Address:</strong> {property.propertyAddress}</div>
                  <div><strong>Plot/Building Number:</strong> {property.plotNumber}</div>
                  <div><strong>Area/Size:</strong> {property.areaSize}</div>
                  <div><strong>Number of Floors:</strong> {property.floors}</div>
                  <div><strong>Property Value:</strong> {property.propertyValue}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                  Evaluation Status
                </h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Submitted:</strong> {formatDate(property.submittedAt)}</div>
                  <div><strong>Current Status:</strong> 
                    <span style={{
                      color: property.status === 'Under Evaluation' ? '#f59e0b' : 
                             property.status === 'Approved' ? '#059669' :
                             property.status === 'Rejected' ? '#dc2626' : '#6b7280',
                      fontWeight: '600',
                      marginLeft: '5px'
                    }}>
                      {property.status}
                    </span>
                  </div>
                  <div><strong>Original Value:</strong> 
                    <span style={{ fontWeight: '600', marginLeft: '5px' }}>
                      {property.propertyValue}
                    </span>
                  </div>
                  <div><strong>Evaluated Value:</strong> 
                    <span style={{ 
                      fontWeight: '600', 
                      marginLeft: '5px',
                      color: property.status === 'Approved' ? '#059669' :
                             property.status === 'Rejected' ? '#dc2626' : '#6b7280'
                    }}>
                      {property.status === 'Approved' && property.evaluationValue !== 'Pending' ? 
                        property.evaluationValue : 
                        property.status === 'Rejected' ? 'Rejected' :
                        'Under Review'}
                    </span>
                  </div>
                  {property.status === 'Approved' && property.approvedAt && (
                    <div><strong>Approved:</strong> 
                      <span style={{ marginLeft: '5px' }}>
                        {formatDate(property.approvedAt)}
                      </span>
                    </div>
                  )}
                  {property.status === 'Rejected' && property.rejectedAt && (
                    <div><strong>Rejected:</strong> 
                      <span style={{ marginLeft: '5px' }}>
                        {formatDate(property.rejectedAt)}
                      </span>
                    </div>
                  )}
                  {property.evaluatedBy && (
                    <div><strong>Reviewed by:</strong> 
                      <span style={{ marginLeft: '5px' }}>
                        {property.evaluatedBy}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {property.status === 'Under Evaluation' && (
                <div style={{
                  padding: '15px',
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#92400e'
                }}>
                  <strong>Note:</strong> Your property is currently under evaluation. 
                  Our experts will review all details and provide a comprehensive evaluation report within 3-5 business days.
                </div>
              )}
              
              {property.status === 'Approved' && (
                <div style={{
                  padding: '15px',
                  background: '#dcfce7',
                  border: '1px solid #059669',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#065f46'
                }}>
                  <strong>✅ Evaluation Approved!</strong> Your property has been successfully evaluated. 
                  The evaluated value is {property.evaluationValue}. This property is now available in our main property system.
                  {property.pdfReport && (
                    <div style={{ marginTop: '10px' }}>
                      <a 
                        href={property.pdfReport} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          background: '#059669',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}
                      >
                        Download Evaluation Report (PDF)
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {property.status === 'Rejected' && (
                <div style={{
                  padding: '15px',
                  background: '#fef2f2',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#991b1b'
                }}>
                  <strong>❌ Evaluation Rejected</strong> 
                  {property.rejectionReason && (
                    <>
                      <br/><br/>
                      <strong>Reason:</strong> {property.rejectionReason}
                    </>
                  )}
                  <br/><br/>
                  You may submit a new evaluation request with updated information or contact our support team for assistance.
                </div>
              )}
            </div>
          </div>

          {/* Owner Information */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
              Owner Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
                  Personal Details
                </h3>
                <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                  <div><strong>Full Name:</strong> {property.fullName}</div>
                  <div><strong>CNIC:</strong> {property.cnic}</div>
                  <div><strong>Contact:</strong> {property.contact}</div>
                  <div><strong>Email:</strong> {property.email}</div>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
                  Address Information
                </h3>
                <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                  <div><strong>Address:</strong> {property.address}</div>
                  <div><strong>City:</strong> {property.city}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <button
              onClick={() => router.push('/evaluation')}
              style={{
                padding: '12px 30px',
                background: '#080808',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '15px'
              }}
            >
              Submit Another Property
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: '12px 30px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Print Details
            </button>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}