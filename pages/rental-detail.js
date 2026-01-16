import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getPropertyById, ensurePropertyImage, formatCurrency } from '../utils/propertyStorage'

export default function RentalDetail() {
  const router = useRouter()
  const { id } = router.query
  const [property, setProperty] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

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

  // Format security deposit display
  const formatSecurityDeposit = (security) => {
    if (typeof security === 'string') {
      return security.includes('PKR') ? security : `PKR ${security}`
    }
    return typeof security === 'number' ? `PKR ${security.toLocaleString()}` : security
  }

  // Loading state
  if (!property) {
    return (
      <>
        <Head>
          <title>Loading... - REMMIC</title>
        </Head>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-[#c9a227] rounded-full animate-spin" />
          <p className="text-base text-gray-500">Loading property details...</p>
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
        <link href="/images/favicon.ico" rel="shortcut icon" type="image/x-icon"/>
        <link href="/images/logo.png" rel="apple-touch-icon"/>
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="pt-[120px] min-h-screen bg-gray-50 max-md:pt-[100px]">
          <div className="max-w-[1200px] mx-auto px-[5%] pb-16 max-md:px-[4%] max-md:pb-12">

            {/* Back Button */}
            <button
              className="inline-flex items-center gap-2 py-3 px-5 bg-gray-900 text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 mb-8 hover:bg-[#4a3728] hover:-translate-x-1"
              onClick={() => router.back()}
              aria-label="Go back to rentals"
            >
              <svg className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Rentals
            </button>

            {/* Property Card */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">

              {/* Hero Image */}
              <div className="relative h-[450px] overflow-hidden max-lg:h-[350px] max-md:h-[280px] max-sm:h-[220px] group">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  src={property.gallery?.[activeImage] || property.image}
                  alt={property.title}
                />
                <span className={`absolute top-5 left-5 py-2 px-4 rounded-lg font-semibold text-sm uppercase tracking-wider text-white ${property.status === 'Available' ? 'bg-green-500' : 'bg-amber-500'}`}>
                  {property.status}
                </span>
                <span className="absolute top-5 right-5 py-2 px-4 bg-[rgba(10,10,10,0.85)] text-white rounded-lg font-semibold text-sm backdrop-blur-sm">
                  {property.type}
                </span>
              </div>

              {/* Property Content */}
              <div className="p-10 max-lg:p-8 max-md:p-6 max-sm:p-5">

                {/* Header */}
                <header className="mb-8 pb-6 border-b border-gray-100">
                  <h1 className="text-4xl font-bold text-gray-900 m-0 mb-4 leading-tight max-lg:text-3xl max-md:text-2xl max-sm:text-xl">{property.title}</h1>
                  <p className="text-sm text-gray-500 font-medium mb-1">Monthly Rent</p>
                  <p className="text-2xl font-bold text-[#c9a227] m-0 max-md:text-xl">
                    {property.priceDisplay || `PKR ${typeof property.price === 'number' ? property.price.toLocaleString() : property.price}`}
                  </p>
                </header>

                {/* Details Grid */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-8 p-6 bg-gray-50 rounded-xl max-lg:grid-cols-2 max-md:gap-4 max-md:p-4 max-sm:grid-cols-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Location</span>
                    <span className="text-base text-gray-900 font-medium">{property.location}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Area</span>
                    <span className="text-base text-gray-900 font-medium">{property.area}</span>
                  </div>
                  {property.bedrooms > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Bedrooms</span>
                      <span className="text-base text-gray-900 font-medium">{property.bedrooms}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Bathrooms</span>
                    <span className="text-base text-gray-900 font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Furnished</span>
                    <span className="text-base text-gray-900 font-medium">{property.furnished}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Security Deposit</span>
                    <span className="text-base text-gray-900 font-medium">{formatSecurityDeposit(property.security)}</span>
                  </div>
                </div>

                {/* Description */}
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 m-0 mb-4 flex items-center gap-3 before:content-[''] before:w-1 before:h-6 before:bg-gradient-to-b before:from-[#c9a227] before:to-[#d4b13d] before:rounded-full max-sm:text-lg">Description</h2>
                  <p className="text-base leading-relaxed text-gray-600 m-0">{property.description}</p>
                </section>

                {/* Features */}
                <section className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 m-0 mb-4 flex items-center gap-3 before:content-[''] before:w-1 before:h-6 before:bg-gradient-to-b before:from-[#c9a227] before:to-[#d4b13d] before:rounded-full max-sm:text-lg">Features & Amenities</h2>
                  <div className="flex flex-wrap gap-3">
                    {(Array.isArray(property.features) ? property.features : [property.features].filter(Boolean)).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 py-2 px-4 bg-[rgba(201,162,39,0.08)] text-[#a8861f] border border-[#c9a227] rounded-full text-sm font-medium transition-all duration-200 hover:bg-[#c9a227] hover:text-gray-900 max-sm:text-xs max-sm:py-1 max-sm:px-3"
                      >
                        {feature}
                      </span>
                    ))}
                    {(!property.features || property.features.length === 0) && (
                      <span className="inline-flex items-center gap-2 py-2 px-4 bg-[rgba(201,162,39,0.08)] text-[#a8861f] border border-[#c9a227] rounded-full text-sm font-medium">Details coming soon</span>
                    )}
                  </div>
                </section>

                {/* Gallery */}
                {property.gallery && property.gallery.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 m-0 mb-4 flex items-center gap-3 before:content-[''] before:w-1 before:h-6 before:bg-gradient-to-b before:from-[#c9a227] before:to-[#d4b13d] before:rounded-full max-sm:text-lg">Photo Gallery</h2>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 max-md:grid-cols-1">
                      {property.gallery.map((img, index) => (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden aspect-[16/10] cursor-pointer group"
                          onClick={() => setActiveImage(index)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View image ${index + 1}`}
                          onKeyDown={(e) => e.key === 'Enter' && setActiveImage(index)}
                        >
                          <img
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.08]"
                            src={img}
                            alt={`${property.title} - Image ${index + 1}`}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </article>

            {/* Contact Card */}
            <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-md:p-6">
              <h2 className="text-xl font-bold text-gray-900 m-0 mb-4 flex items-center gap-3 before:content-[''] before:w-1 before:h-6 before:bg-gradient-to-b before:from-[#c9a227] before:to-[#d4b13d] before:rounded-full max-sm:text-lg">Contact Information</h2>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mb-6 max-md:grid-cols-1 max-md:gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Contact Person</span>
                  <span className="text-base text-gray-900 font-medium">{property.contactInfo.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone</span>
                  <a href={`tel:${property.contactInfo.phone}`} className="text-[#c9a227] no-underline font-medium transition-colors duration-200 hover:text-[#a8861f]">
                    {property.contactInfo.phone}
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</span>
                  <a href={`mailto:${property.contactInfo.email}`} className="text-[#c9a227] no-underline font-medium transition-colors duration-200 hover:text-[#a8861f]">
                    {property.contactInfo.email}
                  </a>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Available From</span>
                  <span className="text-base text-gray-900 font-medium">{property.availableFrom}</span>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap max-md:flex-col">
                <button
                  className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#c9a227] to-[#d4b13d] text-gray-900 border-none rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_14px_rgba(201,162,39,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(201,162,39,0.35)] max-md:w-full"
                  onClick={() => window.location.href = `tel:${property.contactInfo.phone}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </button>
                <button
                  className="btn-outline-gold btn-lg flex-1 min-w-[200px] max-md:w-full"
                  onClick={() => window.location.href = `mailto:${property.contactInfo.email}?subject=Inquiry about ${property.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
              </div>
            </section>

          </div>
        </main>
      </div>

      <Footer />
    </>
  )
}
