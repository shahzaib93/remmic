import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { getPropertyById, ensurePropertyImage, formatCurrency } from '../utils/propertyStorage'

export default function RentalDetail() {
  const router = useRouter()
  const { id } = router.query
  const [property, setProperty] = useState(null)

  // Sample rental properties data
  const rentalProperties = {
    1: {
      id: 1,
      title: "Luxury Apartment in DHA",
      description: "Modern 3-bedroom apartment with premium amenities in the heart of DHA Phase 5. This stunning property features contemporary design, high-end finishes, and breathtaking views. Perfect for families looking for comfort and luxury.",
      location: "DHA Phase 5, Lahore",
      area: "2200 sq ft",
      price: "85,000",
      bedrooms: 3,
      bathrooms: 2,
      type: "3 BHK",
      status: "Available",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1280&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1280&h=800&fit=crop",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=1280&h=800&fit=crop",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1280&h=800&fit=crop"
      ],
      features: ["Parking", "Garden", "Security", "Gym", "Swimming Pool"],
      contactInfo: {
        name: "Ahmed Ali",
        phone: "+92 300 1234567",
        email: "ahmed@remmic.com"
      },
      availableFrom: "January 2024",
      furnished: "Semi-Furnished",
      security: "50,000"
    },
    2: {
      id: 2,
      title: "Spacious Family House",
      description: "Beautiful 4-bedroom house in peaceful neighborhood of Model Town. This family home offers spacious living areas, a large garden, and excellent connectivity to major city areas.",
      location: "Model Town, Lahore",
      area: "3000 sq ft",
      price: "120,000",
      bedrooms: 4,
      bathrooms: 3,
      type: "4 BHK",
      status: "Rented",
      image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
      gallery: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        "https://images.unsplash.com/photo-1600607688960-e095f91ec1b8?w=1200"
      ],
      features: ["Parking", "Garden", "Security", "Servant Quarter"],
      contactInfo: {
        name: "Fatima Khan",
        phone: "+92 301 2345678",
        email: "fatima@remmic.com"
      },
      availableFrom: "Currently Occupied",
      furnished: "Unfurnished",
      security: "80,000"
    },
    3: {
      id: 3,
      title: "Modern Studio Apartment",
      description: "Compact and stylish studio perfect for young professionals. Located in the vibrant area of Gulberg with easy access to restaurants, cafes, and shopping centers.",
      location: "Gulberg, Lahore",
      area: "800 sq ft",
      price: "45,000",
      bedrooms: 1,
      bathrooms: 1,
      type: "Studio",
      status: "Available",
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
      gallery: [
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1280&h=800&fit=crop",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=1280&h=800&fit=crop"
      ],
      features: ["Parking", "Security", "Gym", "Rooftop Access"],
      contactInfo: {
        name: "Sara Ahmed",
        phone: "+92 302 3456789",
        email: "sara@remmic.com"
      },
      availableFrom: "February 2024",
      furnished: "Fully Furnished",
      security: "25,000"
    },
    4: {
      id: 4,
      title: "Prime Commercial Space",
      description: "Excellent location for retail or office space on the busy MM Alam Road. High visibility location with excellent foot traffic and parking facilities.",
      location: "MM Alam Road, Lahore",
      area: "1500 sq ft",
      price: "150,000",
      bedrooms: 0,
      bathrooms: 2,
      type: "Commercial",
      status: "Available",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1280&h=800&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1280&h=800&fit=crop",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
        "https://images.unsplash.com/photo-1600607688960-e095f91ec1b8?w=1200"
      ],
      features: ["Parking", "Security", "Central AC", "High Speed Internet"],
      contactInfo: {
        name: "Hassan Sheikh",
        phone: "+92 303 4567890",
        email: "hassan@remmic.com"
      },
      availableFrom: "March 2024",
      furnished: "Unfurnished",
      security: "100,000"
    }
  }

  useEffect(() => {
    if (!id) return

    const stored = getPropertyById(id)
    if (stored && stored.type === 'rental') {
      const priceLabel = (() => {
        if (typeof stored.price === 'string') return stored.price
        if (stored.priceNumeric != null) {
          const label = formatCurrency(stored.priceNumeric, { maximumFractionDigits: stored.priceNumeric % 1 === 0 ? 0 : 2 })
          return `${label}/month`
        }
        return 'Contact for rent'
      })()

      const gallery = Array.isArray(stored.images) && stored.images.length > 0
        ? stored.images
        : [ensurePropertyImage(stored)]

      const priceNumeric = stored.priceNumeric != null ? stored.priceNumeric : parseFloat(typeof stored.price === 'string' ? stored.price.replace(/[^0-9.]/g, '') : '')
      setProperty({
        id: stored.id,
        title: stored.title || 'Rental Property',
        description: stored.description || 'Property details will be shared soon.',
        location: stored.location || 'Location not specified',
        area: stored.area || 'Area not specified',
        price: priceNumeric || stored.price || 'Contact for rent',
        priceDisplay: priceLabel,
        bedrooms: stored.bedrooms || stored.beds || 0,
        bathrooms: stored.bathrooms || stored.baths || 0,
        type: stored.category || (stored.bedrooms ? `${stored.bedrooms} BHK` : 'Rental'),
        status: stored.status === 'vacant' ? 'Available' : (stored.status || 'Available'),
        image: ensurePropertyImage(stored),
        gallery,
        features: stored.features || [
          'Secure neighbourhood',
          '24/7 access',
          'Ready for immediate move-in'
        ],
        contactInfo: stored.contactInfo || {
          name: stored.ownerInfo?.name || 'Property Owner',
          phone: stored.ownerInfo?.phone || '+92 300 0000000',
          email: stored.ownerInfo?.email || 'info@remmic.com'
        },
        availableFrom: stored.availableFrom || 'Contact to schedule',
        furnished: stored.furnished || 'Information on request',
        security: stored.security || 'Information on request'
      })
      return
    }

    const propertyData = rentalProperties[id]
    if (propertyData) {
      setProperty(propertyData)
    }
  }, [id])

  if (!property) {
    return (
      <>
        <Head>
          <title>Loading... - REMMIC</title>
        </Head>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
          <div>Loading property details...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{property.title} - REMMIC</title>
        <meta name="description" content={property.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/css/opixo.webflow.shared.269830e95.css" rel="stylesheet" type="text/css"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a462172f27e0264706_32.png" rel="shortcut icon" type="image/x-icon"/>
        <link href="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68b576a587e457b5e3256985_256.png" rel="apple-touch-icon"/>
        <style dangerouslySetInnerHTML={{
          __html: `
            .property-gallery img:hover {
              transform: scale(1.05);
              transition: transform 0.3s ease;
            }
            .contact-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              background: white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .feature-tag {
              display: inline-block;
              padding: 4px 8px;
              background: #10b981;
              color: white;
              border-radius: 4px;
              font-size: 12px;
              margin: 2px;
            }
            .back-button {
              background: #6b7280;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              transition: background 0.3s;
            }
            .back-button:hover {
              background: #374151;
            }
            .contact-button {
              background: #10b981;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              width: 100%;
              margin-top: 10px;
              transition: background 0.3s;
            }
            .contact-button:hover {
              background: #059669;
            }
          `
        }} />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        
        <div style={{paddingTop: '100px', minHeight: '100vh', background: '#f9fafb'}}>
          <div className="padding-global">
            <div className="container-large">
              
              {/* Back Button */}
              <div style={{marginBottom: '30px'}}>
                <button 
                  className="back-button"
                  onClick={() => router.back()}
                >
                  Back to Rentals
                </button>
              </div>

              {/* Property Header */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                marginBottom: '30px'
              }}>
                
                {/* Main Image */}
                <div style={{position: 'relative', height: '400px', overflow: 'hidden'}}>
                  <img 
                    src={property.image} 
                    alt={property.title}
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    padding: '8px 12px',
                    background: property.status === 'Available' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}>
                    {property.status}
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}>
                    {property.type}
                  </div>
                </div>

                {/* Property Info */}
                <div style={{padding: '30px'}}>
                  <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '15px'
                  }}>
                    {property.title}
                  </h1>
                  
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#10b981',
                    marginBottom: '20px'
                  }}>
                    Monthly Rent: {property.priceDisplay || `PKR ${property.price.toLocaleString()}`}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    <div>
                      <strong>Location:</strong> {property.location}
                    </div>
                    <div>
                      <strong>Area:</strong> {property.area}
                    </div>
                    {property.bedrooms > 0 && (
                      <div>
                        <strong>Bedrooms:</strong> {property.bedrooms}
                      </div>
                    )}
                    <div>
                      <strong>Bathrooms:</strong> {property.bathrooms}
                    </div>
                    <div>
                      <strong>Furnished:</strong> {property.furnished}
                    </div>
                    <div>
                      <strong>Security Deposit:</strong> PKR {property.security.toLocaleString()}
                    </div>
                  </div>

                  <div style={{marginBottom: '30px'}}>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px'}}>Description</h3>
                    <p style={{lineHeight: '1.6', color: '#6b7280', fontSize: '1.1rem'}}>
                      {property.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div style={{marginBottom: '30px'}}>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px'}}>Features</h3>
                    <div>
                      {(Array.isArray(property.features) ? property.features : (property.features ? [property.features] : [])).map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                      {!property.features && (
                        <span className="feature-tag">Details coming soon</span>
                      )}
                    </div>
                  </div>

                  {/* Image Gallery */}
                  <div style={{marginBottom: '30px'}}>
                    <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px'}}>Gallery</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '15px'
                    }}>
                      {property.gallery.map((img, index) => (
                        <div key={index} style={{borderRadius: '8px', overflow: 'hidden'}}>
                          <img 
                            src={img} 
                            alt={`${property.title} - Image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '200px',
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            className="property-gallery"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="contact-card">
                <h3 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px'}}>Contact Information</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                  <div>
                    <strong>Contact Person:</strong><br />
                    {property.contactInfo.name}
                  </div>
                  <div>
                    <strong>Phone:</strong><br />
                    <a href={`tel:${property.contactInfo.phone}`} style={{color: '#10b981', textDecoration: 'none'}}>
                      {property.contactInfo.phone}
                    </a>
                  </div>
                  <div>
                    <strong>Email:</strong><br />
                    <a href={`mailto:${property.contactInfo.email}`} style={{color: '#10b981', textDecoration: 'none'}}>
                      {property.contactInfo.email}
                    </a>
                  </div>
                  <div>
                    <strong>Available From:</strong><br />
                    {property.availableFrom}
                  </div>
                </div>
                
                <div style={{marginTop: '20px'}}>
                  <button 
                    className="contact-button"
                    onClick={() => window.location.href = `tel:${property.contactInfo.phone}`}
                  >
                    Call Now
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
