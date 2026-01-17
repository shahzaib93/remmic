import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'
import { getPropertiesByType, ensurePropertyImage, formatCurrency } from '../utils/propertyStorage'
import Footer from '../components/Footer'

export default function Rental() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [rentalProperties, setRentalProperties] = useState([])
  const { getProperties } = useFirebase()

  useEffect(() => {
    setIsClient(true)
    
    // Load only approved rental properties from Firebase and localStorage
    const loadRentalProperties = async () => {
      try {
        // Try to get properties from Firebase first
        let allProperties = []
        try {
          const firebaseResult = await getProperties({ status: 'approved', type: 'rental' })
          if (firebaseResult && firebaseResult.success && Array.isArray(firebaseResult.properties)) {
            allProperties = firebaseResult.properties
          }
        } catch (error) {
          console.warn('Failed to load from Firebase, falling back to localStorage:', error)
        }
        
        // Fallback to localStorage approved rental properties
        const localRentals = getPropertiesByType('rental')
        allProperties = [...allProperties, ...localRentals]
        
        const rentals = allProperties.map((property) => {
          const monthlyRent = (() => {
            if (typeof property.price === 'string' && /\/month/i.test(property.price)) {
              return property.price
            }
            if (property.priceNumeric != null) {
              const label = formatCurrency(property.priceNumeric, { maximumFractionDigits: property.priceNumeric % 1 === 0 ? 0 : 2 })
              return `${label}/month`
            }
            return 'Contact for rent'
          })()

          return {
            id: property.id,
            title: property.title || 'Rental Property',
            description: property.description || 'Property details will be shared soon.',
            image: ensurePropertyImage(property),
            area: property.area || 'Area not specified',
            location: property.location || 'Location not specified',
            price: monthlyRent,
            type: property.bedrooms ? `${property.bedrooms} BHK` : (property.category || 'Rental'),
            status: property.status === 'vacant' ? 'Available' : (property.status || 'Available'),
            source: property.source || 'dashboard'
          }
        })

        setRentalProperties(rentals)
      } catch (error) {
        console.error('Error loading rental properties:', error)
        setRentalProperties([])
      }
    }

    loadRentalProperties()
    
    // Listen for storage changes (when new rental properties are added)
    const handleStorageChange = (e) => {
      if (e.key === 'userProperties') {
        loadRentalProperties()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('propertyAdded', loadRentalProperties)
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('propertyAdded', loadRentalProperties)
    }
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <>
      <Head>
        <title>Rental Management - REMMIC</title>
        <meta content="Complete rental property management solution with REMMIC" property="og:title"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
        <style dangerouslySetInnerHTML={{
          __html: `
            .feature-bottom-card:hover .feature-bottom-image-wrapper a {
              opacity: 1 !important;
            }
            .feature-bottom-card:hover .feature-bottom-image-wrapper::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.3);
              z-index: 5;
            }
          `
        }} />
      </Head>
      
      <div className="page-wrapper">
        <Navbar />
        
        <main className="main-wrapper">
          {/* Header Section */}
          <header className="section-header">
            <div className="padding-global">
              <div className="container-large">
                <div className="header-component">
                  <div className="header-top-content-wrap">
                    <div className="header-top-card">
                      <h1 className="heading-style-h1">Streamline Your</h1>
                    </div>
                    <div className="header-top-card second">
                      <div className="header-top-card-content">
                        <h1 className="heading-style-h1 text-color-brand">Rental Management</h1>
                      </div>
                      <div className="header-button-wrapper">
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Get Started</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Rental Features */}
          <section className="section-feature">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="feature-component">
                    <div className="feature-top-content-wrapper">
                      <div className="section-tag">
                        <div>Features</div>
                      </div>
                      <h2 className="heading-style-h2">
                        Everything You Need for Efficient Rental Management
                      </h2>
                    </div>
                    <div className="padding-bottom padding-large"></div>
                    <div className="feature-bottom-content-wrapper">
                      {rentalProperties.length > 0 ? (
                        rentalProperties.map((property, index) => {
                          const cardClass = index === 0 ? 'second-card' : 
                                          index === 1 ? 'second-card' : 
                                          index === 2 ? 'third' : 'fourth';
                          const wrapperClass = index === 0 ? 'second' : 
                                             index === 1 ? 'second' : 
                                             index === 2 ? 'third' : 'third';
                          
                          return (
                            <div
                              key={property.id}
                              className={`feature-bottom-card ${cardClass}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => router.push(`/rental-detail?id=${property.id}`)}
                            >
                              <div
                                className={`feature-bottom-image-wrapper ${wrapperClass}`}
                                style={{position: 'relative'}}
                                onMouseEnter={(event) => {
                                  const link = event.currentTarget.querySelector('a')
                                  if (link) link.style.opacity = '1'
                                }}
                                onMouseLeave={(event) => {
                                  const link = event.currentTarget.querySelector('a')
                                  if (link) link.style.opacity = '0'
                                }}
                              >
                                <img 
                                  src={property.image}
                                  loading="lazy"
                                  alt={property.title}
                                  className="feature-bottom-image"
                                  style={{width: '100%', display: 'block'}} 
                                />
                                <div style={{
                                  position: 'absolute', 
                                  top: '10px', 
                                  left: '10px', 
                                  padding: '4px 8px', 
                                  background: property.status === 'Available' ? '#10b981' : '#f59e0b', 
                                  color: 'white', 
                                  fontSize: '12px', 
                                  borderRadius: '4px', 
                                  fontWeight: '600'
                                }}>
                                  {property.status}
                                </div>
                                <div style={{
                                  position: 'absolute', 
                                  top: '10px', 
                                  right: '10px', 
                                  padding: '4px 8px', 
                                  background: 'rgba(0, 0, 0, 0.7)', 
                                  color: 'white', 
                                  fontSize: '12px', 
                                  borderRadius: '4px'
                                }}>
                                  {property.type}
                                </div>
                                <a 
                                  href={`/rental-detail?id=${property.id}`} 
                                  onClick={(event) => event.stopPropagation()}
                                  style={{
                                    position: 'absolute', 
                                    bottom: '15px', 
                                    left: '50%', 
                                    transform: 'translateX(-50%)', 
                                    padding: '8px 18px', 
                                    background: '#000', 
                                    color: 'white', 
                                    fontSize: '14px', 
                                    borderRadius: '5px', 
                                    textDecoration: 'none', 
                                    opacity: '0', 
                                    transition: 'opacity 0.3s', 
                                    zIndex: '10'
                                  }}
                                  onMouseOver={(e) => e.target.style.opacity = '1'}
                                  onMouseOut={(e) => e.target.style.opacity = '0'}
                                >
                                  View Details
                                </a>
                              </div>
                              <div className="feature-bottom-content">
                                <h5 className="heading-style-h5">{property.title}</h5>
                                <div className="text-size-regular" style={{marginBottom: '8px'}}>
                                  {property.description}
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px'}}>
                                  <div style={{fontSize: '14px', color: '#666'}}>
                                    <strong>{property.area}</strong> • {property.location}
                                  </div>
                                </div>
                                <div style={{marginTop: '8px', fontSize: '16px', fontWeight: '600', color: '#10b981'}}>
                                  Monthly Rent: {property.price}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '60px 20px',
                          gridColumn: '1 / -1'
                        }}>
                          <h3 style={{fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '10px'}}>
                            No Rental Properties Available
                          </h3>
                          <p style={{fontSize: '1rem', color: '#6b7280', marginBottom: '30px'}}>
                            Rental properties added through the dashboard or land registration will appear here.
                          </p>
                          <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                            <a href="/add-property" style={{
                              background: '#059669',
                              color: 'white',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              Add Property
                            </a>
                            <a href="/land-registration" style={{
                              background: '#6b7280',
                              color: 'white',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              Register Land
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Management Process */}
          <section className="section-process">
            <div className="page-lode">
              <div className="process-component">
                <div className="process-top-content">
                  <div className="process-head-line">
                    <div>Process</div>
                  </div>
                  <h2 className="heading-style-h2">Simplify Rental Management in 3 Steps</h2>
                </div>
                <div className="process-bottom-content">
                  <div className="process-card-list-wrapper">
                    <div className="process-card-wrapper fast">
                      <div className="process-line-wrapper">
                        <div className="process-number first">
                          <h6 className="heading-style-h6">01</h6>
                        </div>
                        <div className="process-line">
                          <div className="process-hover-line"></div>
                        </div>
                      </div>
                      <div className="process-card first">
                        <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201.png" 
                             loading="lazy" alt="" className="process-card-image" />
                        <div className="process-card-content">
                          <h6 className="heading-style-h6">Add Your Properties</h6>
                          <div className="text-size-regular">Upload property details, photos, and rental terms to get started.</div>
                        </div>
                      </div>
                    </div>
                    <div className="process-card-wrapper">
                      <div className="process-card second">
                        <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202.png" 
                             loading="lazy" alt="" className="process-card-image" />
                        <div className="process-card-content">
                          <h6 className="heading-style-h6">Find & Screen Tenants</h6>
                          <div className="text-size-regular">List properties, screen applicants, and sign digital lease agreements.</div>
                        </div>
                      </div>
                      <div className="process-line-wrapper">
                        <div className="process-number second">
                          <h6 className="heading-style-h6">02</h6>
                        </div>
                        <div className="process-line">
                          <div className="process-second-hover-line"></div>
                        </div>
                      </div>
                    </div>
                    <div className="process-card-wrapper">
                      <div className="process-line-wrapper">
                        <div className="process-number third">
                          <h6 className="heading-style-h6">03</h6>
                        </div>
                        <div className="process-line">
                          <div className="process-third-hover-line"></div>
                        </div>
                      </div>
                      <div className="process-card third">
                        <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203.png" 
                             loading="lazy" alt="" className="process-card-image" />
                        <div className="process-card-content">
                          <h6 className="heading-style-h6">Automate Management</h6>
                          <div className="text-size-regular">Collect rent, handle maintenance, and track financials automatically.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* CTA Section */}
          <section className="section-cta">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="cta-component">
                    <div className="cta-content">
                      <h2 className="heading-style-h2">Transform Your Rental Management Today</h2>
                      <p style={{fontSize: '1.2rem', color: '#666', margin: '20px 0 40px'}}>
                        Join thousands of property managers who trust REMMIC for their rental operations
                      </p>
                      <div className="cta-button-wrapper">
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Schedule Demo</div>
                        </a>
                        <a href="/login" className="button w-inline-block">
                          <div className="button-text">Start Free Trial</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>
      
      <script src="/scripts/remove-webflow-badge.js"></script>
    </>
  )
}
