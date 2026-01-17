import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function PropertyDetail() {
  const [isClient, setIsClient] = useState(false)
  const [property, setProperty] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [currentBid, setCurrentBid] = useState(0)
  const router = useRouter()
  const { id } = router.query

  // Property data
  const properties = {
    'bayview-oasis': {
      name: 'Bayview Oasis',
      location: 'San Francisco, CA',
      type: 'Penthouse Residence',
      description: 'A glass-wrapped penthouse rising above San Francisco Bay with sweeping water and skyline vistas from every room.',
      price: '$4,850,000',
      currentBid: '$4,950,000',
      bedrooms: 4,
      bathrooms: 3.5,
      area: '3,200 sq ft',
      yearBuilt: 2019,
      images: [
        'https://images.unsplash.com/photo-1529429617124-aee5418f3f37?w=1200&h=800&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1459535653751-d571815e906b?w=1200&h=800&fit=crop&auto=format&q=80'
      ],
      features: [
        'Floor-to-ceiling windows',
        'Private rooftop terrace',
        'Smart home automation',
        'Premium appliances',
        'Bay views from every room',
        'Private elevator access'
      ]
    },
    'midtown-collection': {
      name: 'Midtown Collection',
      location: 'Austin, TX',
      type: 'Townhome Ensemble',
      description: 'A connected enclave of three-story townhomes crafted for hybrid living with flexible floor plans and shared club amenities.',
      price: '$1,250,000',
      currentBid: '$1,310,000',
      bedrooms: 3,
      bathrooms: 2.5,
      area: '2,100 sq ft',
      yearBuilt: 2021,
      images: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&h=800&fit=crop&auto=format&q=80'
      ],
      features: [
        'Three-story layout',
        'Shared club amenities',
        'Flexible floor plans',
        'Modern kitchen design',
        'Private garage',
        'Community garden access'
      ]
    },
    'lakeside-residences': {
      name: 'Lakeside Residences',
      location: 'Seattle, WA',
      type: 'Waterfront Smart Home',
      description: 'A modern lakeside retreat with biophilic design, smart infrastructure, and framed views across Lake Washington.',
      price: '$2,890,000',
      currentBid: '$2,950,000',
      bedrooms: 4,
      bathrooms: 3,
      area: '2,800 sq ft',
      yearBuilt: 2020,
      images: [
        'https://images.unsplash.com/photo-1570129476769-55f4a5add23d?w=1200&h=800&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&h=800&fit=crop&auto=format&q=80'
      ],
      features: [
        'Lake Washington views',
        'Biophilic design elements',
        'Smart home integration',
        'Waterfront access',
        'Sustainable materials',
        'Private dock access'
      ]
    },
    'heritage-heights': {
      name: 'Heritage Heights',
      location: 'Boston, MA',
      type: 'Historic Brownstone',
      description: 'A meticulously restored 19th-century brownstone featuring original architectural details with modern sustainable upgrades in Back Bay.',
      price: '$3,200,000',
      currentBid: '$3,285,000',
      bedrooms: 5,
      bathrooms: 4,
      area: '3,500 sq ft',
      yearBuilt: 1885,
      images: [
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop&auto=format&q=80',
        'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1200&h=800&fit=crop&auto=format&q=80'
      ],
      features: [
        'Historic architectural details',
        'Modern sustainable upgrades',
        'Original hardwood floors',
        'Updated electrical systems',
        'Back Bay location',
        'Private garden'
      ]
    }
  }

  useEffect(() => {
    setIsClient(true)
    if (id && properties[id]) {
      setProperty(properties[id])
      // Parse current bid amount
      const bidValue = properties[id].currentBid.replace(/[$,]/g, '')
      setCurrentBid(parseInt(bidValue))
    }
  }, [id])

  const handleBidSubmit = (e) => {
    e.preventDefault()
    if (bidAmount && parseInt(bidAmount) > currentBid) {
      const newBid = parseInt(bidAmount)
      setCurrentBid(newBid)
      setBidAmount('')
      alert(`Bid submitted successfully for $${newBid.toLocaleString()}!`)
    } else {
      alert('Please enter a bid amount higher than the current bid.')
    }
  }

  if (!isClient || !property) {
    return null
  }

  return (
    <>
      <Head>
        <title>{property.name} - Property Details | REMMIC</title>
        <meta name="description" content={`${property.description} Located in ${property.location}.`} />
        <style jsx>{`
          .property-detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            align-items: start;
          }
          
          .property-main-image {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
          }
          
          .property-main-image img {
            transition: transform 0.3s ease;
            width: 100%;
            height: 400px;
            object-fit: cover;
          }
          
          .property-main-image:hover img {
            transform: scale(1.05);
          }
          
          .property-thumbnail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .property-thumbnail-grid img {
            transition: transform 0.3s ease;
            border-radius: 8px;
          }
          
          .property-thumbnail-grid img:hover {
            transform: scale(1.03);
          }
          
          .property-more-photos {
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .property-more-photos:hover {
            transform: scale(1.02);
          }
          
          .property-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          
          .testimonial-card {
            transition: all 0.3s ease;
            border-radius: 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
          }
          
          .testimonial-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .property-action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .blog-content-wrapper {
            padding: 30px;
          }
          
          .blog-card-top-content {
            margin-bottom: 20px;
          }
          
          .blog-card-bottom-content {
            margin-top: 20px;
          }
          
          .blog-ctegory {
            margin-bottom: 15px;
          }
          
          .blog-ctegory div {
            background: #f1f3f4;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            color: #666;
            display: inline-block;
          }
          
          .footer-input {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 16px;
            transition: border-color 0.3s ease;
          }
          
          .footer-input:focus {
            border-color: #007bff;
            outline: none;
          }
          
          .button {
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
            cursor: pointer;
          }
          
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          
          .button-text {
            font-weight: 500;
          }
          
          .button.is-secondary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 24px;
            border-radius: 8px;
          }
          
          .button.is-secondary:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          }
          
          .bidding-unified-component {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 24px;
            margin: 15px 0;
            transition: all 0.3s ease;
            text-align: center;
          }
          
          .bidding-unified-component:hover {
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            transform: translateY(-3px);
          }
          
          .bidding-unified-component h5 {
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
          }
          
          .bidding-unified-component .text-size-regular {
            font-weight: 500;
            color: #666;
            margin-bottom: 20px;
          }
          
          .bidding-unified-form {
            margin: 0;
          }
          
          .bidding-unified-component input {
            transition: all 0.3s ease;
          }
          
          .bidding-unified-component input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            outline: none;
          }
          
          .bidding-unified-component input:hover {
            border-color: #999;
          }
          
          .bidding-input-with-button {
            padding-right: 110px !important;
            position: relative;
            height: 48px !important;
            display: flex !important;
            align-items: center !important;
          }
          
          .bidding-button-overlay {
            position: absolute !important;
            right: 4px !important;
            top: 4px !important;
            bottom: 4px !important;
            height: calc(100% - 8px) !important;
            padding: 0 16px !important;
            margin: 0 !important;
            font-size: 14px !important;
            white-space: nowrap !important;
            z-index: 10 !important;
            border-radius: 4px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .pricing-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .pricing-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            transition: all 0.3s ease;
          }
          
          .pricing-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .property-details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .detail-item {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            transition: all 0.3s ease;
          }
          
          .detail-item:hover {
            background: #f1f3f4;
            transform: translateY(-1px);
          }
          
          
          @media (max-width: 768px) {
            .property-detail-grid {
              grid-template-columns: 1fr;
              gap: 30px;
            }
            
            .property-main-image {
              order: 1;
            }
            
            .property-info {
              order: 2;
            }
            
            .property-stats-grid {
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .property-action-buttons {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            
            .property-thumbnail-grid {
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .blog-content-wrapper {
              padding: 20px;
            }
          }
          
          @media (max-width: 480px) {
            .property-detail-grid {
              gap: 20px;
            }
            
            .property-stats-grid {
              grid-template-columns: 1fr;
              gap: 8px;
            }
            
            .property-thumbnail-grid {
              grid-template-columns: 1fr;
            }
            
            .property-more-photos {
              display: none;
            }
            
            .blog-content-wrapper {
              padding: 15px;
            }
            
            .bidding-input-with-button {
              padding-right: 95px !important;
              height: 44px !important;
            }
            
            .bidding-button-overlay {
              right: 3px !important;
              top: 3px !important;
              bottom: 3px !important;
              height: calc(100% - 6px) !important;
              padding: 0 12px !important;
              font-size: 13px !important;
            }
            
            .pricing-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            
            .pricing-card {
              padding: 12px;
            }
            
            .property-details-grid {
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            
            .detail-item {
              padding: 10px 8px;
            }
            
          }
        `}</style>
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="main-wrapper">
          {/* Property Header Section */}
          <header className="section-about-header">
            <div className="padding-global">
              <div className="container-large">
                <div className="about-header-component">
                  <div className="about-header-top-content-wrapper">
                    <div className="about-header-top-content">
                      <div className="property-breadcrumb" style={{marginBottom: '20px'}}>
                        <a href="/property" style={{color: '#666', textDecoration: 'none'}}>Properties</a>
                        <span style={{margin: '0 10px', color: '#999'}}>/</span>
                        <span style={{color: '#333'}}>{property.name}</span>
                      </div>
                      <h2 className="heading-style-h2" style={{textAlign: 'center', fontSize: '2.8rem', lineHeight: '1.3', fontWeight: 'bold', margin: '0 auto'}}>
                        {property.name}
                      </h2>
                      <div className="text-size-regular" style={{textAlign: 'center', marginBottom: '10px'}}>
                        {property.location} • {property.type}
                      </div>
                      <div className="text-size-regular" style={{textAlign: 'center'}}>
                        {property.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Property Images and Details */}
          <section className="section-blog">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="blog-component">
                    <div className="property-detail-grid">
                      
                      {/* Property Images */}
                      <div className="property-images">
                        <div style={{marginBottom: '20px'}}>
                          <img 
                            src={property.images[0]} 
                            alt={property.name}
                            className="about-image"
                            style={{
                              width: '100%',
                              height: '400px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                        <div className="property-thumbnail-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                          <img 
                            src={property.images[1]} 
                            alt={`${property.name} view 2`}
                            className="about-image"
                            style={{
                              width: '100%',
                              height: '190px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                          />
                          <div className="blog-card property-more-photos" style={{
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            minHeight: '190px',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease',
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))'
                          }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                            <span style={{color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>+3 More Photos</span>
                          </div>
                        </div>
                      </div>

                      {/* Property Information and Bidding */}
                      <div className="property-info">
                        <div className="blog-card">
                          <div className="blog-content-wrapper" style={{textAlign: 'center'}}>
                            {/* Property Description */}
                            <div className="blog-card-top-content" style={{marginBottom: '20px'}}>
                              <div className="blog-content">
                                <h5 className="heading-style-h5" style={{marginBottom: '10px'}}>{property.name}</h5>
                                <div className="text-size-regular text-color-black-800" style={{lineHeight: '1.6', marginBottom: '10px'}}>
                                  {property.description}
                                </div>
                                <div className="text-size-small tex-color-black-700" style={{marginBottom: '15px'}}>
                                  <strong>{property.location}</strong> • {property.type}
                                </div>
                                
                                {/* Property Pricing */}
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '15px'}}>
                                  <div className="blog-ctegory">
                                    <div>Pricing</div>
                                  </div>
                                  <div style={{width: '100%'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                                      <span className="text-size-regular text-color-black-800">Starting Price</span>
                                      <span className="heading-style-h6">{property.price}</span>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                      <span className="text-size-regular text-color-black-800">Current Bid</span>
                                      <span className="heading-style-h6" style={{color: '#28a745'}}>${currentBid.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Property Details */}
                            <div className="blog-card-top-content" style={{marginBottom: '20px'}}>
                              <div className="blog-ctegory">
                                <div>Details</div>
                              </div>
                              <div className="blog-content">
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'}}>
                                  <div style={{textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '6px'}}>
                                    <div className="heading-style-h6">{property.bedrooms}</div>
                                    <div className="text-size-small tex-color-black-700">Bedrooms</div>
                                  </div>
                                  <div style={{textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '6px'}}>
                                    <div className="heading-style-h6">{property.bathrooms}</div>
                                    <div className="text-size-small tex-color-black-700">Bathrooms</div>
                                  </div>
                                  <div style={{textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '6px'}}>
                                    <div className="heading-style-h6">{property.area}</div>
                                    <div className="text-size-small tex-color-black-700">Area</div>
                                  </div>
                                  <div style={{textAlign: 'center', padding: '12px', background: '#f8f9fa', borderRadius: '6px'}}>
                                    <div className="heading-style-h6">{property.yearBuilt}</div>
                                    <div className="text-size-small tex-color-black-700">Year Built</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Place Your Bid - Unified Component */}
                            <div className="blog-card-bottom-content">
                              <div className="bidding-unified-component">
                                <h5 className="heading-style-h5" style={{marginBottom: '12px'}}>
                                  Place Your Bid
                                </h5>
                                <div className="text-size-regular tex-color-black-700" style={{marginBottom: '16px'}}>
                                  Minimum: ${(currentBid + 1000).toLocaleString()}
                                </div>
                                <div className="footer-form-block w-form">
                                  <form onSubmit={handleBidSubmit} className="footer-form" style={{position: 'relative'}}>
                                    <input
                                      type="number"
                                      value={bidAmount}
                                      onChange={(e) => setBidAmount(e.target.value)}
                                      placeholder={`Enter amount (min: $${(currentBid + 1000).toLocaleString()})`}
                                      min={currentBid + 1000}
                                      className="footer-input w-input bidding-input-with-button"
                                    />
                                    <button 
                                      type="submit"
                                      className="button w-inline-block bidding-button-overlay"
                                    >
                                      Place Bid
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="blog-card-bottom-content" style={{marginTop: '20px'}}>
                              <div className="property-action-buttons" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                                <a href="/contact" className="button w-inline-block">
                                  <div className="button-text">Schedule Tour</div>
                                </a>
                                <a href="#" className="button is-secondary w-inline-block">
                                  <div className="button-text">Save Property</div>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Property Features */}
          <section className="section-testimonial">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="testimonial-component">
                    <div className="testimonial-top-content">
                      <div className="feature-head-line">
                        <div>Features</div>
                      </div>
                      <h2 className="heading-style-h2">Property Features</h2>
                    </div>
                    <div className="testimonial-bottom-content-wrap">
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
                        {property.features.map((feature, index) => (
                          <div key={index} className="blog-card" style={{
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              width: '10px',
                              height: '10px',
                              background: '#28a745',
                              borderRadius: '50%',
                              marginRight: '15px'
                            }}></div>
                            <span className="text-size-regular">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Agent Section */}
          <section className="section-cta">
            <div className="padding-global">
              <div className="container-large">
                <div className="padding-section-medium">
                  <div className="cta-component">
                    <div className="cta-content">
                      <h2 className="heading-style-h2">Interested in this property?</h2>
                      <div className="text-size-regular" style={{marginBottom: '30px'}}>
                        Contact our expert agents for more information and to schedule a private viewing.
                      </div>
                      <div className="cta-button-wrapper">
                        <a href="/contact" className="button is-secondary w-inline-block">
                          <div className="button-text">Contact Agent</div>
                        </a>
                        <a href="/contact" className="button w-inline-block">
                          <div className="button-text">Get Financing</div>
                        </a>
                      </div>
                    </div>
                    <div className="cta-image-wrapper">
                      <img src="/images/3d-models/3dwallpaper.jpg" loading="lazy" alt="" className="cta-image"/>
                    </div>
                    <div className="cta-glass-image-wrapper">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a33e286e2e1212a5ec3dd9_glass.png" loading="lazy" alt="" className="cta-glass-image"/>
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
    </>
  )
}
