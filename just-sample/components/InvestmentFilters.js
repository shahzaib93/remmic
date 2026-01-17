import { useState, useEffect } from 'react'

export default function InvestmentFilters({ onFiltersChange, totalProperties = 0 }) {
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'all',
    location: 'all',
    priceRange: 'all',
    riskLevel: 'all',
    status: 'all',
    minInvestment: 'all',
    expectedReturn: 'all'
  })
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Property types
  const propertyTypes = [
    { value: 'all', label: 'All Property Types' },
    { value: 'residential_plot', label: 'Residential Plot' },
    { value: 'commercial_plot', label: 'Commercial Plot' },
    { value: 'building', label: 'Building' },
    { value: 'agriculture_land', label: 'Agriculture Land' },
    { value: 'apartments', label: 'Apartments' }
  ]

  // Locations
  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'lahore', label: 'Lahore' },
    { value: 'karachi', label: 'Karachi' },
    { value: 'islamabad', label: 'Islamabad' },
    { value: 'faisalabad', label: 'Faisalabad' },
    { value: 'rawalpindi', label: 'Rawalpindi' },
    { value: 'peshawar', label: 'Peshawar' },
    { value: 'quetta', label: 'Quetta' }
  ]

  // Price ranges
  const priceRanges = [
    { value: 'all', label: 'All Price Ranges' },
    { value: '0-1cr', label: 'Under PKR 1 Crore' },
    { value: '1-5cr', label: 'PKR 1-5 Crores' },
    { value: '5-10cr', label: 'PKR 5-10 Crores' },
    { value: '10cr+', label: 'Above PKR 10 Crores' }
  ]

  // Risk levels
  const riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ]

  // Investment status
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open for Investment' },
    { value: 'selling-fast', label: 'Selling Fast' },
    { value: 'limited', label: 'Limited Availability' },
    { value: 'sold-out', label: 'Sold Out' }
  ]

  // Minimum investment
  const minInvestmentOptions = [
    { value: 'all', label: 'Any Minimum' },
    { value: '0-50k', label: 'Under PKR 50k' },
    { value: '50k-100k', label: 'PKR 50k - 1L' },
    { value: '100k-500k', label: 'PKR 1L - 5L' },
    { value: '500k+', label: 'Above PKR 5L' }
  ]

  // Expected returns
  const returnOptions = [
    { value: 'all', label: 'Any Return' },
    { value: '0-5', label: '0-5% Annual' },
    { value: '5-10', label: '5-10% Annual' },
    { value: '10-15', label: '10-15% Annual' },
    { value: '15+', label: '15%+ Annual' }
  ]

  // Count active filters
  useEffect(() => {
    const activeCount = Object.entries(filters).filter(([key, value]) => 
      key !== 'search' && value !== 'all'
    ).length + (filters.search ? 1 : 0)
    
    setActiveFiltersCount(activeCount)
  }, [filters])

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange && onFiltersChange(newFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      propertyType: 'all',
      location: 'all',
      priceRange: 'all',
      riskLevel: 'all',
      status: 'all',
      minInvestment: 'all',
      expectedReturn: 'all'
    }
    setFilters(clearedFilters)
    onFiltersChange && onFiltersChange(clearedFilters)
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
      marginBottom: '24px',
      border: '1px solid #f1f5f9'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 4px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Filter Properties
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {totalProperties} properties available
            {activeFiltersCount > 0 && ` â€¢ ${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#ef4444'
                e.target.style.color = '#fff'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#ef4444'
              }}
            >
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: isExpanded ? '#ff5e01' : '#f8fafc',
              color: isExpanded ? '#fff' : '#374151',
              border: isExpanded ? '1px solid #ff5e01' : '1px solid #d1d5db',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
            <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
              â–¼
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search properties by name, location, or developer..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#fff',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#ff5e01'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />
      </div>

      {/* Basic Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: isExpanded ? '20px' : '0'
      }}>
        <select
          value={filters.propertyType}
          onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          {locations.map(location => (
            <option key={location.value} value={location.value}>{location.label}</option>
          ))}
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          {priceRanges.map(range => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            {riskLevels.map(risk => (
              <option key={risk.value} value={risk.value}>{risk.label}</option>
            ))}
          </select>

          <select
            value={filters.minInvestment}
            onChange={(e) => handleFilterChange('minInvestment', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            {minInvestmentOptions.map(min => (
              <option key={min.value} value={min.value}>{min.label}</option>
            ))}
          </select>

          <select
            value={filters.expectedReturn}
            onChange={(e) => handleFilterChange('expectedReturn', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: '#fff',
              cursor: 'pointer'
            }}
          >
            {returnOptions.map(returnOpt => (
              <option key={returnOpt.value} value={returnOpt.value}>{returnOpt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
