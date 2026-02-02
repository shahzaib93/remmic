import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Rental() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSort, setSelectedSort] = useState('newest')
  const { getProperties } = useFirebase()

  const formatPrice = (value) => {
    if (!value) return 'Contact for rent'
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, ''))
    if (!num || !Number.isFinite(num)) return 'Contact for rent'
    if (num >= 100000) return `PKR ${(num / 1000).toFixed(0)}K/mo`
    return `PKR ${num.toLocaleString()}/mo`
  }

  useEffect(() => {
    setIsClient(true)

    const loadProperties = async () => {
      try {
        let allProps = []

        // Load from Firebase
        try {
          const result = await getProperties({ status: 'approved', type: 'rental' })
          if (result?.success && Array.isArray(result.properties)) {
            allProps = result.properties
          }
        } catch (e) {
          console.warn('Firebase load failed:', e)
        }

        // Load from localStorage as fallback
        const local = JSON.parse(localStorage.getItem('userProperties') || '[]')
        const localRentals = local.filter(p =>
          p.type === 'rental' || p.listingType === 'rental'
        )
        allProps = [...allProps, ...localRentals]

        // Remove duplicates
        const unique = allProps.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i)

        const processed = unique.map((p, idx) => ({
          id: p.id || `rental-${idx}`,
          title: p.title || 'Rental Property',
          description: p.description || 'Beautiful property available for rent',
          image: p.images?.[0] || p.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzAgMTIwSDE2MEwxODAgMTAwTDE5NSAxMTVMMjIwIDkwTDI0MCA5NVYxMzBIMTcwWiIgZmlsbD0iI0Q0RDlERiIvPgo8cGF0aCBkPSJNMTgwIDEwNUMxODMuMzE0IDEwNSAxODYgMTAyLjMxNCAxODYgOTlDMTg2IDk1LjY4NiAxODMuMzE0IDkzIDE4MCA5M0MxNzYuNjg2IDkzIDE3NCA5NS42ODYgMTc0IDk5QzE3NCAxMDIuMzE0IDE3Ni42ODYgMTA1IDE4MCAxMDVaIiBmaWxsPSIjRDRENURGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5Q0E1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPlByb3BlcnR5IEltYWdlPC90ZXh0Pgo8L3N2Zz4=',
          location: p.location || 'Location TBA',
          area: p.areaSize || p.area || p.plotSize || '--',
          price: formatPrice(p.monthlyRent || p.price),
          bedrooms: p.bedrooms || '--',
          bathrooms: p.bathrooms || '--',
          type: p.propertyType || p.category || 'Residential',
          status: p.status === 'vacant' || p.available ? 'Available' : 'Occupied',
          amenities: p.amenities || [],
          createdAt: p.createdAt || Date.now()
        }))

        setProperties(processed)
        setFilteredProperties(processed)
      } catch (err) {
        console.error('Error loading properties:', err)
      }
    }

    loadProperties()
  }, [])

  useEffect(() => {
    let result = [...properties]

    if (searchQuery) {
      result = result.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      result = result.filter(p => p.type?.toLowerCase() === selectedType)
    }

    if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (selectedSort === 'price-low') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0
        return priceA - priceB
      })
    } else if (selectedSort === 'price-high') {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0
        return priceB - priceA
      })
    }

    setFilteredProperties(result)
  }, [searchQuery, selectedType, selectedSort, properties])

  const availableCount = properties.filter(p => p.status === 'Available').length

  if (!isClient) return null

  return (
    <>
      <Head>
        <title>Rentals - REMMIC</title>
        <meta name="description" content="Find your perfect rental property with REMMIC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-[#f8f7f5] to-white">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8 sm:p-12 mb-10 shadow-xl">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#c9a227,_transparent_45%)]" />
              <div className="relative text-center max-w-3xl mx-auto space-y-4">
                <span className="inline-block text-xs tracking-[0.5em] uppercase text-[#facc15] font-semibold">
                  Rentals
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
                  Find Your Perfect Rental Home Across Pakistan
                </h1>
                <p className="text-base sm:text-lg text-white/80">
                  Browse verified rental properties with transparent pricing. 
                  From apartments to villas, find the perfect space for your lifestyle.
                </p>
                <div className="flex justify-center items-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#facc15]">{properties.length}</div>
                    <div className="text-sm text-white/70">Properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#facc15]">{availableCount}</div>
                    <div className="text-sm text-white/70">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#facc15]">100%</div>
                    <div className="text-sm text-white/70">Verified</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by location or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] outline-none"
                  />
                </div>
                <div className="flex gap-4">
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] outline-none bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                  </select>
                  <select 
                    value={selectedSort} 
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-[#c9a227] outline-none bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Properties Grid */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#c9a227]/10 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#c9a227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">
                  No rental properties found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any properties matching your search criteria.
                  Try adjusting your filters or search term.
                </p>
                <a
                  href="/land-registration"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white rounded-xl font-medium hover:from-[#b8922a] hover:to-[#a67c00] transition-all shadow-md hover:shadow-lg"
                >
                  List Your Property
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img 
                        src={property.image} 
                        alt={property.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzAgMTIwSDE2MEwxODAgMTAwTDE5NSAxMTVMMjIwIDkwTDI0MCA5NVYxMzBIMTcwWiIgZmlsbD0iI0Q0RDlERiIvPgo8cGF0aCBkPSJNMTgwIDEwNUMxODMuMzE0IDEwNSAxODYgMTAyLjMxNCAxODYgOTlDMTg2IDk1LjY4NiAxODMuMzE0IDkzIDE4MCA5M0MxNzYuNjg2IDkzIDE3NCA5NS42ODYgMTc0IDk5QzE3NCAxMDIuMzE0IDE3Ni42ODYgMTA1IDE4MCAxMDVaIiBmaWxsPSIjRDRENURGIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5Q0E1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPlByb3BlcnR5IEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                        }}
                      />
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === 'Available' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {property.status}
                      </div>
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 text-[#c9a227] rounded-lg text-sm font-semibold">
                        {property.price}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
                        <p className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {property.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                          </svg>
                          {property.area}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 4v16M22 4v16M6 20h12M6 4h12"/>
                          </svg>
                          {property.bedrooms} Beds
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6l6 6-6 6"/>
                          </svg>
                          {property.bathrooms} Baths
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                      <a 
                        href={`/rental-detail?id=${property.id}`} 
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[#c9a227] to-[#b8922a] hover:from-[#b8922a] hover:to-[#a67c00] text-white rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        View Details
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block text-xs tracking-[0.5em] uppercase text-[#c9a227] font-semibold mb-4">
                How It Works
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Rent with Confidence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-[#c9a227] to-[#d4b13d] rounded-full flex items-center justify-center text-black font-bold text-lg mb-6 mx-auto">
                  01
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Browse Properties</h3>
                <p className="text-gray-600">Explore verified rental listings with real photos and accurate details.</p>
              </div>
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-[#c9a227] to-[#d4b13d] rounded-full flex items-center justify-center text-black font-bold text-lg mb-6 mx-auto">
                  02
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Schedule Viewing</h3>
                <p className="text-gray-600">Book a visit to see the property in person or take a virtual tour.</p>
              </div>
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-[#c9a227] to-[#d4b13d] rounded-full flex items-center justify-center text-black font-bold text-lg mb-6 mx-auto">
                  03
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign & Move In</h3>
                <p className="text-gray-600">Complete digital paperwork and get your keys. It's that simple.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Have a Property to Rent?</h2>
            <p className="text-xl text-white/80 mb-8">List your property on REMMIC and reach verified tenants</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/land-registration" 
                className="px-8 py-4 bg-gradient-to-r from-[#c9a227] to-[#b8922a] hover:from-[#b8922a] hover:to-[#a67c00] text-black rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                List Property
              </a>
              <a 
                href="/contact" 
                className="px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}
