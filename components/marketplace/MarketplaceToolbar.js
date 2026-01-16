import { useState } from 'react'

export default function MarketplaceToolbar({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  onReset,
  onOpenFilters,
  totalResults,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Left: View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="Grid View"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title="List View"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 w-full lg:max-w-md">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by address or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right: Sort, Reset, Filters */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Sort Dropdown */}
          <div className="relative flex-1 lg:flex-none">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full lg:w-auto appearance-none px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors font-medium whitespace-nowrap"
          >
            Reset
          </button>

          {/* Filters Button */}
          <button
            onClick={onOpenFilters}
            className="btn-dark whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{totalResults}</span> properties
        </p>
      </div>
    </div>
  )
}

// Filters Drawer Component
export function FiltersDrawer({ isOpen, onClose }) {
  const [priceRange, setPriceRange] = useState([0, 200000000])
  const [bedrooms, setBedrooms] = useState('any')
  const [propertyType, setPropertyType] = useState('any')

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Property Type */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Property Type
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['Any', 'House', 'Apartment', 'Villa', 'Commercial', 'Land'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type.toLowerCase())}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      propertyType === type.toLowerCase()
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Bedrooms
              </h3>
              <div className="flex gap-2">
                {['Any', '1+', '2+', '3+', '4+', '5+'].map((bed) => (
                  <button
                    key={bed}
                    onClick={() => setBedrooms(bed.toLowerCase())}
                    className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      bedrooms === bed.toLowerCase()
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {bed}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Price Range
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                  <select className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="0">Any</option>
                    <option value="5000000">PKR 50 Lac</option>
                    <option value="10000000">PKR 1 Cr</option>
                    <option value="20000000">PKR 2 Cr</option>
                    <option value="50000000">PKR 5 Cr</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                  <select className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900">
                    <option value="200000000">Any</option>
                    <option value="10000000">PKR 1 Cr</option>
                    <option value="20000000">PKR 2 Cr</option>
                    <option value="50000000">PKR 5 Cr</option>
                    <option value="100000000">PKR 10 Cr</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                City
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['Any', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'].map((city) => (
                  <button
                    key={city}
                    className="px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="btn-outline flex-1"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="btn-dark flex-1"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
