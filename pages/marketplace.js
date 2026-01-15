import Head from 'next/head'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PropertyCard, { PropertyCardSkeleton } from '../components/marketplace/PropertyCard'
import MarketplaceToolbar, { FiltersDrawer } from '../components/marketplace/MarketplaceToolbar'
import Pagination from '../components/marketplace/Pagination'
import { mockProperties } from '../data/mockProperties'

const ITEMS_PER_PAGE = 9

export default function Marketplace() {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...mockProperties]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (p) =>
          p.address.toLowerCase().includes(term) ||
          p.city.toLowerCase().includes(term) ||
          p.title.toLowerCase().includes(term)
      )
    }

    // Sort
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    return result
  }, [searchTerm, sortOption])

  // Pagination
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredProperties, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortOption])

  // Reset all filters
  const handleReset = () => {
    setSearchTerm('')
    setSortOption('newest')
    setCurrentPage(1)
  }

  return (
    <>
      <Head>
        <title>Properties for Sale | REMMIC</title>
        <meta
          name="description"
          content="Browse our collection of premium properties for sale. Find your dream home today."
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Properties for Sale
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Discover premium properties across Pakistan. Browse our curated collection
                of homes, apartments, and investment opportunities.
              </p>
            </div>

            {/* Toolbar */}
            <MarketplaceToolbar
              viewMode={viewMode}
              setViewMode={setViewMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOption={sortOption}
              setSortOption={setSortOption}
              onReset={handleReset}
              onOpenFilters={() => setIsFiltersOpen(true)}
              totalResults={filteredProperties.length}
            />

            {/* Properties Grid/List */}
            {isLoading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : paginatedProperties.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any properties matching your search criteria.
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {paginatedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredProperties.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>

        <Footer />

        {/* Filters Drawer */}
        <FiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
        />
      </div>
    </>
  )
}
