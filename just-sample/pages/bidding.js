import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'
import { ensurePropertyImage } from '../utils/propertyStorage'

const HeroInfo = ({ label, value }) => (
  <div style={{ minWidth: '160px' }}>
    <div style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{value || 'TBC'}</div>
  </div>
)

const LOCATION_CURRENCY = {
  default: { code: 'PKR', label: 'PKR' },
  pakistan: { code: 'PKR', label: 'PKR' },
  india: { code: 'INR', label: 'INR' },
  bangladesh: { code: 'BDT', label: 'BDT' },
  'sri-lanka': { code: 'LKR', label: 'LKR' },
  nepal: { code: 'NPR', label: 'NPR' },
  afghanistan: { code: 'AFN', label: 'AFN' },
  maldives: { code: 'MVR', label: 'MVR' },
  bhutan: { code: 'BTN', label: 'BTN' },
  myanmar: { code: 'MMK', label: 'MMK' },
  thailand: { code: 'THB', label: 'THB' },
  malaysia: { code: 'MYR', label: 'MYR' },
  singapore: { code: 'SGD', label: 'SGD' },
  indonesia: { code: 'IDR', label: 'IDR' },
  philippines: { code: 'PHP', label: 'PHP' },
  vietnam: { code: 'VND', label: 'VND' },
  cambodia: { code: 'KHR', label: 'KHR' },
  laos: { code: 'LAK', label: 'LAK' },
  china: { code: 'CNY', label: 'CNY' },
  japan: { code: 'JPY', label: 'JPY' },
  'south-korea': { code: 'KRW', label: 'KRW' },
  uae: { code: 'AED', label: 'AED' },
  'saudi-arabia': { code: 'SAR', label: 'SAR' },
  qatar: { code: 'QAR', label: 'QAR' },
  kuwait: { code: 'KWD', label: 'KWD' },
  oman: { code: 'OMR', label: 'OMR' },
  bahrain: { code: 'BHD', label: 'BHD' },
  turkey: { code: 'TRY', label: 'TRY' },
  iran: { code: 'IRR', label: 'IRR' },
  iraq: { code: 'IQD', label: 'IQD' },
  jordan: { code: 'JOD', label: 'JOD' },
  lebanon: { code: 'LBP', label: 'LBP' },
  syria: { code: 'SYP', label: 'SYP' },
  egypt: { code: 'EGP', label: 'EGP' },
  usa: { code: 'USD', label: 'USD' },
  canada: { code: 'CAD', label: 'CAD' },
  uk: { code: 'GBP', label: 'GBP' },
  germany: { code: 'EUR', label: 'EUR' },
  france: { code: 'EUR', label: 'EUR' },
  italy: { code: 'EUR', label: 'EUR' },
  spain: { code: 'EUR', label: 'EUR' },
  netherlands: { code: 'EUR', label: 'EUR' },
  belgium: { code: 'EUR', label: 'EUR' },
  switzerland: { code: 'CHF', label: 'CHF' },
  austria: { code: 'EUR', label: 'EUR' },
  sweden: { code: 'SEK', label: 'SEK' },
  norway: { code: 'NOK', label: 'NOK' },
  denmark: { code: 'DKK', label: 'DKK' },
  finland: { code: 'EUR', label: 'EUR' },
  australia: { code: 'AUD', label: 'AUD' },
  'new-zealand': { code: 'NZD', label: 'NZD' },
  'south-africa': { code: 'ZAR', label: 'ZAR' }
}

const PRICE_OPTIONS = [
  { value: '1000000', label: '10 Lakh' },
  { value: '2500000', label: '25 Lakh' },
  { value: '5000000', label: '50 Lakh' },
  { value: '7500000', label: '75 Lakh' },
  { value: '10000000', label: '1 Crore' },
  { value: '15000000', label: '1.5 Crore' },
  { value: '20000000', label: '2 Crore' },
  { value: '30000000', label: '3 Crore' },
  { value: '50000000', label: '5 Crore' },
  { value: '100000000', label: '10 Crore+' }
]

export default function Bidding() {
  const [isClient, setIsClient] = useState(false)
  const [properties, setProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const { getAllProperties } = useFirebase()
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedPropertyType, setSelectedPropertyType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedSort, setSelectedSort] = useState('ending-soon')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [heroProperty, setHeroProperty] = useState(null)
  const [heroCountdown, setHeroCountdown] = useState({ label: '', timeLeft: '', phase: 'idle' })
  const [isViewingsOpen, setIsViewingsOpen] = useState(false)
  const activeCurrency = useMemo(() => {
    const key = (selectedLocation || '').toLowerCase()
    return LOCATION_CURRENCY[key] || LOCATION_CURRENCY.default
  }, [selectedLocation])

  const RUPEES_PER_CRORE = 10000000

  const toRupees = (value) => {
    if (value == null) return null

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null
    }

    const text = String(value).toLowerCase().trim()
    const numeric = parseFloat(text.replace(/[^0-9.]/g, ''))
    if (!Number.isFinite(numeric)) {
      return null
    }

    if (text.includes('crore')) {
      return numeric * RUPEES_PER_CRORE
    }
    if (text.includes('lakh') || text.includes('lac')) {
      return numeric * 100000
    }
    if (text.includes('million')) {
      return numeric * 1000000
    }
    if (text.includes('thousand')) {
      return numeric * 1000
    }

    return numeric
  }

  const formatBidAmount = (value) => {
    const rupees = toRupees(value)
    if (rupees == null) {
      return 'PKR —'
    }
    return `PKR ${Math.round(rupees).toLocaleString()}`
  }

  const assignPropertyId = (property, index) => {
    if (!property || typeof property !== 'object') {
      return `fallback-property-${index}`
    }

    const preferredId = property.id ?? property.propertyId ?? property.localId ?? property.firebaseId ?? property.slug ?? property.uuid
    if (preferredId != null) {
      return preferredId.toString()
    }

    const signature = [property.source, property.title, property.location, property.area]
      .filter((part) => typeof part === 'string' && part.trim() !== '')
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const suffix = signature || 'property'
    return `fallback-${suffix}-${index}`
  }

  // Function to handle property details modal
  const handleShowPropertyDetails = (property) => {
    setSelectedProperty(property)
    setShowPropertyModal(true)
  }

  const handleCloseModal = () => {
    setShowPropertyModal(false)
    setSelectedProperty(null)
  }

  // Filter and search functions
  const filterProperties = () => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      )
    }

    // Price range filter
    if (selectedPriceRange) {
      filtered = filtered.filter(property => {
        const rawPrice = property.bidding?.minBidAmount ?? property.startingBid ?? property.priceNumeric ?? property.price
        const price = toRupees(rawPrice)
        if (price == null) {
          return false
        }

        const priceInCrores = price / RUPEES_PER_CRORE

        switch (selectedPriceRange) {
          case '0-1':
            return priceInCrores < 1
          case '1-2':
            return priceInCrores >= 1 && priceInCrores <= 2
          case '2-5':
            return priceInCrores >= 2 && priceInCrores <= 5
          case '5-10':
            return priceInCrores >= 5 && priceInCrores <= 10
          case '10+':
            return priceInCrores > 10
          default:
            return true
        }
      })
    }

    // Property type filter
    if (selectedPropertyType) {
      filtered = filtered.filter(property =>
        property.title?.toLowerCase().includes(selectedPropertyType.toLowerCase()) ||
        property.description?.toLowerCase().includes(selectedPropertyType.toLowerCase())
      )
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(property => {
        switch (selectedStatus) {
          case 'live':
            return property.biddingStatus === 'Live Auction'
          case 'upcoming':
            return property.biddingStatus === 'Upcoming Auction' || property.biddingStatus === 'Starting Soon'
          case 'ending-soon':
            return property.auctionEnd?.includes('hour') || property.auctionEnd?.includes('1 day')
          case 'ended':
            return property.biddingStatus === 'Auction Ended'
          default:
            return true
        }
      })
    }

    const sorted = sortProperties(filtered)
    setFilteredProperties(sorted)
  }

  const handleSearch = () => {
    filterProperties()
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedLocation('')
    setSelectedPriceRange('')
    setSelectedPropertyType('')
    setSelectedStatus('')
    setSelectedSort('ending-soon')
    setFilteredProperties(properties)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedLocation('')
    setSelectedPriceRange('')
    setSelectedPropertyType('')
    setSelectedStatus('')
    setSelectedSort('ending-soon')
  }

  const getHeroCandidate = useMemo(() => {
    if (!filteredProperties.length) return null
    return filteredProperties[0]
  }, [filteredProperties])

  const buildCountdown = (property) => {
    if (!property?.bidding?.startDateTime || !property?.bidding?.endDateTime) {
      return { label: 'Auction Status', timeLeft: property?.biddingStatus || 'Schedule Pending', phase: 'idle' }
    }

    const now = new Date()
    const start = new Date(property.bidding.startDateTime)
    const end = new Date(property.bidding.endDateTime)

    const formatTimeDiff = (target) => {
      const diffMs = target - now
      if (diffMs <= 0) return '0m'
      const totalMinutes = Math.floor(diffMs / (1000 * 60))
      const days = Math.floor(totalMinutes / (60 * 24))
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
      const minutes = totalMinutes % 60
      const parts = []
      if (days > 0) parts.push(`${days}d`)
      if (hours > 0) parts.push(`${hours}h`)
      if (minutes > 0 && parts.length < 2) parts.push(`${minutes}m`)
      return parts.join(' ') || '0m'
    }

    if (now < start) {
      return { label: 'Bidding Starts In', timeLeft: formatTimeDiff(start), phase: 'pre' }
    }

    if (now >= start && now <= end) {
      return { label: 'Bidding Ends In', timeLeft: formatTimeDiff(end), phase: 'live' }
    }

    return { label: 'Bidding Status', timeLeft: 'Closed', phase: 'post' }
  }

  // Function to check if a property can be bid on
  const canBidOnProperty = (property) => {
    if (!property.bidding || !property.bidding.startDateTime || !property.bidding.endDateTime) {
      // If no bidding dates, assume it's biddable (for older properties)
      return true
    }

    const now = new Date()
    const startDate = new Date(property.bidding.startDateTime)
    const endDate = new Date(property.bidding.endDateTime)

    // Can only bid if current time is between start and end dates
    return now >= startDate && now <= endDate
  }

  // Function to get bidding button text and status
  const getBiddingButtonInfo = (property) => {
    if (!property.bidding || !property.bidding.startDateTime || !property.bidding.endDateTime) {
      return { text: 'Place Bid', disabled: false, reason: '' }
    }

    const now = new Date()
    const startDate = new Date(property.bidding.startDateTime)
    const endDate = new Date(property.bidding.endDateTime)

    if (now < startDate) {
      return { 
        text: 'Auction Not Started', 
        disabled: true, 
        reason: 'Bidding has not started yet' 
      }
    } else if (now > endDate) {
      return { 
        text: 'Auction Ended', 
        disabled: true, 
        reason: 'Bidding has ended' 
      }
    } else {
      return { 
        text: 'Place Bid', 
        disabled: false, 
        reason: '' 
      }
    }
  }

  const extractPrice = (property) => {
    const raw = property?.startingBid
    if (!raw) return null
    const numeric = toRupees(String(raw).replace(/[^0-9.]/g, ''))
    return Number.isFinite(numeric) ? numeric : null
  }

  const endingSortValue = (property) => {
    const endDateTime = property?.bidding?.endDateTime
    if (endDateTime) {
      const endDate = new Date(endDateTime)
      const timestamp = endDate.getTime()
      return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER
    }

    const text = property?.auctionEnd?.toLowerCase?.() || ''
    const base = Date.now()

    if (text.includes('minute')) {
      const value = parseInt(text, 10)
      if (Number.isFinite(value)) return base + value * 60 * 1000
    }
    if (text.includes('hour')) {
      const value = parseInt(text, 10)
      if (Number.isFinite(value)) return base + value * 60 * 60 * 1000
    }
    if (text.includes('day')) {
      const value = parseInt(text, 10)
      if (Number.isFinite(value)) return base + value * 24 * 60 * 60 * 1000
    }

    return Number.MAX_SAFE_INTEGER
  }

  const sortProperties = (list) => {
    if (!Array.isArray(list)) {
      return []
    }

    const cloned = [...list]

    switch (selectedSort) {
      case 'price-low':
        return cloned.sort((a, b) => (extractPrice(a) ?? Infinity) - (extractPrice(b) ?? Infinity))
      case 'price-high':
        return cloned.sort((a, b) => (extractPrice(b) ?? -Infinity) - (extractPrice(a) ?? -Infinity))
      case 'ending-soon':
      default:
        return cloned.sort((a, b) => (endingSortValue(a) ?? Number.MAX_SAFE_INTEGER) - (endingSortValue(b) ?? Number.MAX_SAFE_INTEGER))
    }
  }

  // No mock properties - only show admin-approved bidding properties

  useEffect(() => {
    setIsClient(true)
    
    // Helper function to determine bidding status based on dates
  const getBiddingStatus = (property) => {
    if (!property.bidding || !property.bidding.startDateTime || !property.bidding.endDateTime) {
      return { status: 'Auction Schedule Pending', timeLeft: 'Dates to be announced', isUpcoming: false }
    }

    const now = new Date()
    const startDate = new Date(property.bidding.startDateTime)
    const endDate = new Date(property.bidding.endDateTime)

    if (now < startDate) {
      // Bidding hasn't started yet - upcoming
      const timeUntilStart = startDate - now
      const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      let timeLeft = ''
      if (days > 0) {
        timeLeft = `Starts in ${days} day${days > 1 ? 's' : ''}`
      } else if (hours > 0) {
        timeLeft = `Starts in ${hours} hour${hours > 1 ? 's' : ''}`
      } else {
        timeLeft = 'Starting soon'
      }
      
      return { status: 'Upcoming Auction', timeLeft, isUpcoming: true }
    } else if (now >= startDate && now <= endDate) {
      // Bidding is currently active
      const timeUntilEnd = endDate - now
      const days = Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeUntilEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      let timeLeft = ''
      if (days > 0) {
        timeLeft = `${days} day${days > 1 ? 's' : ''} left`
      } else if (hours > 0) {
        timeLeft = `${hours} hour${hours > 1 ? 's' : ''} left`
      } else {
        timeLeft = 'Ending soon'
      }
      
      return { status: 'Live Auction', timeLeft, isUpcoming: false }
    } else {
      // Bidding has ended
      return { status: 'Auction Ended', timeLeft: 'Bidding closed', isUpcoming: false }
    }
  }

  const loadBiddingProperties = async () => {
      try {
        // Get all properties from Firebase first
        let allProperties = []
        try {
          const firebaseResult = await getAllProperties()
          if (firebaseResult && firebaseResult.success && Array.isArray(firebaseResult.properties)) {
            // Filter for bidding-related properties from Firebase
            allProperties = firebaseResult.properties.filter(p => {
              const isBiddingRelated = p.type === 'bidding' || 
                                      (p.bidding && (p.bidding.startDateTime || p.bidding.minBidAmount))
              const isApproved = (p.status || '').toLowerCase() === 'approved'
              return isBiddingRelated && isApproved
            })
          }
        } catch (error) {
          console.warn('Failed to load from Firebase, falling back to localStorage:', error)
        }
        
        // Get all properties from localStorage to avoid duplicates
        const allLocalProperties = JSON.parse(localStorage.getItem('userProperties') || '[]')
        
        // Filter for bidding-related properties from localStorage
        const localBiddingProperties = allLocalProperties.filter(p => {
          // Only include user-uploaded properties, exclude mock/system properties
          const isUserUploaded = p.source === 'land-registration-form' || 
                                 p.source === 'land-registration' ||
                                 p.source === 'dashboard' ||
                                 p.source === 'add-property'
          
          const isBiddingRelated = p.type === 'bidding' || 
                                  (p.bidding && (p.bidding.startDateTime || p.bidding.minBidAmount))
          
          // Exclude properties with mock/example/demo in title or description
          const isMockProperty = (p.title && p.title.toLowerCase().includes('example')) ||
                                (p.title && p.title.toLowerCase().includes('demo')) ||
                                (p.title && p.title.toLowerCase().includes('mock')) ||
                                (p.title && p.title.toLowerCase().includes('sample')) ||
                                (p.title && p.title.toLowerCase().includes('test')) ||
                                (p.description && p.description.toLowerCase().includes('example')) ||
                                (p.description && p.description.toLowerCase().includes('demo')) ||
                                // Exclude properties with default placeholder content
                                (p.title === 'Property Listing') ||
                                (p.title === 'Auction Property') ||
                                (p.description === 'Property details will be shared soon.')
          
          return isUserUploaded && isBiddingRelated && !isMockProperty
        })
        
        // Combine Firebase and localStorage properties, removing duplicates
        const combinedProperties = [...allProperties, ...localBiddingProperties].map((property, index) => {
          const assignedId = assignPropertyId(property, index)
          if (property?.id === assignedId) {
            return { ...property, id: assignedId }
          }
          return { ...property, id: assignedId }
        })

        // Remove duplicates based on property ID
        const uniqueProperties = combinedProperties.filter((property, index, array) => {
          return array.findIndex(p => p.id === property.id) === index
        })
        
        allProperties = uniqueProperties
        
        const storedBidding = allProperties.map((property) => {
          const startingBidDisplay = (() => {
            // For land registration properties, use minimum bid amount
            if (property.bidding && property.bidding.minBidAmount) {
              return formatBidAmount(property.bidding.minBidAmount)
            }

            if (property.startingBid) {
              const formatted = formatBidAmount(property.startingBid)
              if (formatted !== 'PKR —') return formatted
            }

            if (property.price) {
              const formatted = formatBidAmount(property.price)
              if (formatted !== 'PKR —') return formatted
            }

            if (property.priceNumeric != null) {
              return formatBidAmount(property.priceNumeric)
            }

            return formatBidAmount(1)
          })()

          // Get bidding status based on dates
          const biddingInfo = getBiddingStatus(property)
          
          return {
            id: property.id,
            title: property.title || 'Auction Property',
            description: property.description || 'Property details will be shared soon.',
            image: ensurePropertyImage(property),
            area: property.areaSize || property.area || 'Area not specified',
            location: property.location || 'Location not specified',
            startingBid: startingBidDisplay,
            status: property.status, // Keep original approval status
            biddingStatus: biddingInfo.status, // Separate bidding status
            auctionEnd: biddingInfo.timeLeft,
            source: property.source || 'dashboard',
            isUpcoming: biddingInfo.isUpcoming,
            biddingStartDate: property.bidding?.startDate,
            biddingEndDate: property.bidding?.endDate,
            minBidAmount: property.bidding?.minBidAmount,
            maxBidAmount: property.bidding?.maxBidAmount,
            biddingFees: property.bidding?.fees,
            bidding: property.bidding,
            registerUrl: property.registerUrl,
            agentName: property.agentName,
            agentEmail: property.agentEmail,
            agentPhone: property.agentPhone
          }
        })

        // Only show admin-approved bidding properties or land registration properties  
        const approvedBiddingProperties = storedBidding.filter(property => {
          // Include if explicitly approved
          if (property.status === 'approved') {
            return true
          }
          
          // Include land registration properties (they are pre-approved for bidding)
          if (property.source === 'land-registration-form') {
            return true
          }
          
          // Include properties that have bidding configured (from property registration)
          if (property.source === 'land-registration' && property.biddingStatus) {
            return true
          }
          
          return false
        })
        
        setProperties(approvedBiddingProperties)
      } catch (error) {
        console.error('Error loading bidding properties:', error)
        setProperties([])
      }
    }

    loadBiddingProperties()
    
    // Listen for storage changes (when new bidding properties are added)
    const handleStorageChange = (e) => {
      if (e.key === 'userProperties') {
        loadBiddingProperties()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('propertyAdded', loadBiddingProperties)
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('propertyAdded', loadBiddingProperties)
    }
  }, [])

  // Update filtered properties when properties change
  useEffect(() => {
    setFilteredProperties(sortProperties(properties))
  }, [properties])

  // Update filtered properties when filters change
  useEffect(() => {
    filterProperties()
  }, [searchQuery, selectedLocation, selectedPriceRange, selectedPropertyType, selectedStatus, selectedSort, properties])

  useEffect(() => {
    setHeroProperty(getHeroCandidate)
  }, [getHeroCandidate])

  useEffect(() => {
    if (!heroProperty) {
      setHeroCountdown({ label: '', timeLeft: '', phase: 'idle' })
      return undefined
    }

    const updateCountdown = () => {
      setHeroCountdown(buildCountdown(heroProperty))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [heroProperty])

  if (!isClient) {
    return null
  }

  return (
    <>
      <Head>
        <title>Bidding - Real Estate Auctions Made Simple | REMMIC</title>
        <meta name="description" content="Experience transparent, real-time property auctions where every bid brings you closer to the deal." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.5;
                transform: scale(1.2);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }
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
            
            @keyframes scrollStack {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .story-tracker-container:hover {
              animation-play-state: paused;
            }
            
            .story-card {
              background: #fff;
              border-radius: 12px;
              padding: 1.5rem;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .story-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            }
            
            .story-image-wrapper {
              width: 80px;
              height: 80px;
              margin-bottom: 1rem;
              overflow: hidden;
              border-radius: 8px;
            }
            
            .story-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          `
        }} />
      </Head>

      <div className="page-wrapper">
        <Navbar />



        {/* Feature Section - EXACT COPY */}
        <section data-wf--feature--variant="base" className="section-feature">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div data-w-id="a6792325-465d-c3c7-29b9-8e788dd4558e" className="feature-component">
                  <div className="feature-top-content-wrapper">
                    <h2 className="heading-style-h2" style={{fontSize: '2.2rem !important', lineHeight: '1.4 !important', textAlign: 'center !important', margin: '0 auto !important', display: 'block !important', maxWidth: '90% !important', fontWeight: '900 !important'}}>
                      All-in-One Property Marketplace <br />
                      Easy. Secure. Stress-Free.
                    </h2>
                  </div>
                  <div className="padding-bottom padding-large"></div>

                  <div
                    style={{
                      display: 'grid',
                      gap: '1rem',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(255, 236, 217, 0.95))',
                      padding: '2rem',
                      borderRadius: '22px',
                      marginBottom: '2rem',
                      border: '1px solid rgba(255, 94, 1, 0.35)',
                      boxShadow: '0 20px 45px -30px rgba(255, 94, 1, 0.65)'
                    }}
                  >
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      <label htmlFor="auction-search" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>Search Auctions</label>
                      <input
                        id="auction-search"
                        type="search"
                        placeholder="Search by property name or location"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 94, 1, 0.5)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      <label htmlFor="auction-status" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>Auction Status</label>
                      <select
                        id="auction-status"
                        value={selectedStatus || 'all'}
                        onChange={(e) => {
                          const value = e.target.value
                          setSelectedStatus(value === 'all' ? '' : value)
                        }}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 94, 1, 0.5)',
                          fontSize: '0.9rem',
                          backgroundColor: '#fff6ed'
                        }}
                      >
                        <option value="all">All auctions</option>
                        <option value="live">Live auctions</option>
                        <option value="upcoming">Starting soon</option>
                        <option value="ended">Closed</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      <label htmlFor="auction-sort" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>Sort By</label>
                      <select
                        id="auction-sort"
                        value={selectedSort}
                        onChange={(e) => setSelectedSort(e.target.value)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 94, 1, 0.5)',
                          fontSize: '0.9rem',
                          backgroundColor: '#fff6ed'
                        }}
                      >
                        <option value="price-low">Price (low to high)</option>
                        <option value="price-high">Price (high to low)</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>View Mode</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setViewMode('grid')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: viewMode === 'grid' ? '2px solid #ff5e01' : '1px solid rgba(255, 94, 1, 0.3)',
                            background: viewMode === 'grid' ? '#ff5e01' : '#fff6ed',
                            color: viewMode === 'grid' ? '#fff' : '#c2410c',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10 0h8v8h-8v-8zm0-10h8v8h-8V3z"/>
                          </svg>
                          Grid
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: viewMode === 'list' ? '2px solid #ff5e01' : '1px solid rgba(255, 94, 1, 0.3)',
                            background: viewMode === 'list' ? '#ff5e01' : '#fff6ed',
                            color: viewMode === 'list' ? '#fff' : '#c2410c',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 4h18v2H3V4zm0 5h18v2H3V9zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                          </svg>
                          List
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c2410c' }}>Auctions Found</span>
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: '1px dashed rgba(255, 94, 1, 0.6)',
                          fontWeight: 600,
                          color: '#0f172a'
                        }}
                      >
                        {filteredProperties.length}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Property Cards */}
                  {filteredProperties.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: '#f9fafb',
                        borderRadius: '16px',
                        border: '2px dashed #d1d5db',
                        margin: '40px 0'
                      }}
                    >
                      {properties.length === 0 ? (
                        <>
                          <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '10px' }}>No Bidding Properties Available</h3>
                          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
                            No properties are currently available for bidding. Check back later for new auction listings.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 style={{ fontSize: '1.5rem', color: '#6b7280', marginBottom: '10px' }}>No Properties Found</h3>
                          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
                            No properties match your search criteria. Try adjusting your search terms.
                          </p>
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            style={{
                              padding: '12px 24px',
                              background: 'linear-gradient(135deg, #ff5e01 0%, #ff8732 100%)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              boxShadow: '0 15px 35px -12px rgba(255, 94, 1, 0.6)'
                            }}
                          >
                            Clear Search
                          </button>
                        </>
                      )}
                    </div>
                  ) : viewMode === 'list' ? (
                    // List View - Redesigned
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '20px 0' }}>
                      {filteredProperties.map((property) => {
                        const biddingInfo = getBiddingButtonInfo(property);
                        const canBid = !biddingInfo.disabled;
                        
                        return (
                          <div key={property.id} style={{
                            display: 'flex',
                            flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            border: '2px solid #f0f0f0',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 94, 1, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#ff5e01';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.borderColor = '#f0f0f0';
                          }}
                          >
                            <div style={{ 
                              position: 'relative',
                              width: window.innerWidth < 768 ? '100%' : '320px',
                              height: window.innerWidth < 768 ? '250px' : '220px',
                              overflow: 'hidden'
                            }}>
                              <img 
                                src={property.image}
                                alt={property.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.4s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.target.style.transform = ''}
                              />
                              {/* Overlay badges */}
                              <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}>
                                <span style={{
                                  padding: '6px 12px',
                                  background: property.biddingStatus === 'Live Auction' 
                                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                    : property.biddingStatus === 'Upcoming Auction'
                                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                      : property.biddingStatus === 'Auction Ended'
                                        ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                  color: '#fff',
                                  fontSize: '13px',
                                  borderRadius: '20px',
                                  fontWeight: '700',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <span style={{
                                    width: '8px',
                                    height: '8px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    animation: property.biddingStatus === 'Live Auction' ? 'pulse 2s infinite' : 'none'
                                  }}></span>
                                  {property.biddingStatus}
                                </span>
                              </div>
                              <div style={{
                                position: 'absolute',
                                bottom: '15px',
                                left: '15px',
                                padding: '6px 12px',
                                background: 'rgba(0, 0, 0, 0.8)',
                                backdropFilter: 'blur(10px)',
                                color: '#fff',
                                fontSize: '12px',
                                borderRadius: '8px',
                                fontWeight: '600'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                                {property.auctionEnd}
                              </div>
                            </div>
                            
                            <div style={{ 
                              flex: 1, 
                              padding: '24px',
                              display: 'flex', 
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                  <div>
                                    <h3 style={{ 
                                      fontSize: '1.5rem', 
                                      fontWeight: '800', 
                                      marginBottom: '6px',
                                      color: '#1f2937',
                                      lineHeight: '1.2'
                                    }}>
                                      {property.title}
                                    </h3>
                                    <p style={{ 
                                      color: '#6b7280', 
                                      fontSize: '0.95rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}>
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                      </svg>
                                      {property.location}
                                    </p>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>Starting Bid</div>
                                    <div style={{ 
                                      fontSize: '1.75rem', 
                                      fontWeight: '900',
                                      background: 'linear-gradient(135deg, #ff5e01, #ff8732)',
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent',
                                      backgroundClip: 'text'
                                    }}>
                                      {activeCurrency.label} {property.price ? Math.round(property.price).toLocaleString() : '—'}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Property Features */}
                                <div style={{ 
                                  display: 'flex', 
                                  gap: '20px', 
                                  marginTop: '16px',
                                  paddingTop: '16px',
                                  borderTop: '1px solid #f0f0f0'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff5e01">
                                      <path d="M12 2l2 5h5l-4 3 2 5-5-3-5 3 2-5-4-3h5z"/>
                                    </svg>
                                    <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Premium</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff5e01">
                                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                                    </svg>
                                    <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                                      {property.bidding?.startDateTime 
                                        ? new Date(property.bidding.startDateTime).toLocaleDateString()
                                        : 'Coming Soon'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ 
                                display: 'flex', 
                                gap: '12px',
                                marginTop: '20px',
                                flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap'
                              }}>
                                <a
                                  href={`/bidding-detail?id=${property.id}`}
                                  style={{
                                    flex: window.innerWidth < 768 ? '1' : '0 0 auto',
                                    padding: '12px 20px',
                                    background: '#fff',
                                    border: '2px solid #ff5e01',
                                    color: '#ff5e01',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    transition: 'all 0.3s',
                                    fontSize: '0.95rem'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fff5f0';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                  }}
                                >
                                  View Details
                                </a>
                                <a
                                  href={canBid ? `/bidding-detail?id=${property.id}` : undefined}
                                  style={{
                                    flex: window.innerWidth < 768 ? '1' : '0 0 auto',
                                    padding: '12px 28px',
                                    background: canBid 
                                      ? 'linear-gradient(135deg, #ff5e01 0%, #ff8732 100%)' 
                                      : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                                    color: '#fff',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    pointerEvents: canBid ? 'auto' : 'none',
                                    transition: 'all 0.3s',
                                    fontSize: '0.95rem',
                                    boxShadow: '0 4px 15px rgba(255, 94, 1, 0.3)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (canBid) {
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 94, 1, 0.4)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (canBid) {
                                      e.currentTarget.style.transform = '';
                                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 94, 1, 0.3)';
                                    }
                                  }}
                                >
                                  {canBid ? biddingInfo.text : biddingInfo.reason || biddingInfo.text}
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Grid View
                    filteredProperties.map((property, index) => {
                      const cardClass = index === 0 ? 'second-card' : 
                                      index === 1 ? 'second-card' : 
                                      index === 2 ? 'third' : 'fourth';
                      const wrapperClass = index === 0 ? 'second' : 
                                         index === 1 ? 'second' : 
                                         index === 2 ? 'third' : 'third';
                      
                      return (
                        <div key={property.id} className={`feature-bottom-card ${cardClass}`}>
                        <div 
                          className={`feature-bottom-image-wrapper ${wrapperClass}`}
                          style={{position: 'relative'}}
                          onMouseEnter={(e) => {
                            const button = e.currentTarget.querySelector('.feature-card-hover-link');
                            if (button) button.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const button = e.currentTarget.querySelector('.feature-card-hover-link');
                            if (button) button.style.opacity = '0';
                          }}
                        >
                          <img 
                            src={property.image}
                            loading="lazy" 
                            alt={property.title}
                            className="feature-bottom-image" 
                            style={{width: '100%', display: 'block'}} 
                          />
                          
                          {/* Property Status Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            padding: '4px 8px',
                            background: property.biddingStatus === 'Live Auction' 
                              ? '#22c55e'  // Green for live auctions
                              : property.biddingStatus === 'Upcoming Auction'
                                ? '#f59e0b'  // Orange for upcoming
                                : property.biddingStatus === 'Auction Ended'
                                  ? '#6b7280'  // Gray for ended
                                  : '#ef4444', // Red for other statuses
                            color: '#fff',
                            fontSize: '12px',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            {property.biddingStatus}
                          </div>

                          {/* Auction End Time */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '4px 8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            fontSize: '12px',
                            borderRadius: '4px'
                          }}>
                            {property.auctionEnd}
                          </div>

                          {(() => {
                            const biddingInfo = getBiddingButtonInfo(property)
                            const canBid = !biddingInfo.disabled

                            return (
                              <a
                                href={canBid ? `/bidding-detail?id=${property.id}` : undefined}
                                className="feature-card-hover-link"
                                title={biddingInfo.reason}
                                style={{
                                  position: 'absolute',
                                  bottom: '15px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  padding: '8px 18px',
                                  background: canBid ? '#000' : '#9ca3af',
                                  color: '#fff',
                                  fontSize: '14px',
                                  borderRadius: '5px',
                                  textDecoration: 'none',
                                  opacity: '0',
                                  transition: 'opacity 0.3s',
                                  zIndex: 10,
                                  pointerEvents: canBid ? 'auto' : 'none',
                                  fontWeight: 600
                                }}
                              >
                                {canBid ? biddingInfo.text : biddingInfo.reason || biddingInfo.text}
                              </a>
                            )
                          })()}
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
                          <div style={{marginTop: '8px', fontSize: '16px', fontWeight: '600', color: '#0f172a'}}>
                            Starting Bid: {property.startingBid}
                          </div>
                          
                          {/* Auction Date and Timing Information - Show original data */}
                          <div style={{marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                            {/* Auction Date Box */}
                            <div style={{flex: '1', minWidth: '120px', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '2px'}}>
                                Auction Date
                              </div>
                              <div style={{fontSize: '13px', fontWeight: '600', color: '#1f2937'}}>
                                {property.bidding?.startDateTime 
                                  ? new Date(property.bidding.startDateTime).toLocaleDateString('en-GB', { 
                                      day: 'numeric', 
                                      month: 'long' 
                                    })
                                  : '20 November'
                                }
                              </div>
                            </div>
                            
                            {/* Bidding Opens Box */}
                            <div style={{flex: '1', minWidth: '120px', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '2px'}}>
                                Bidding Opens
                              </div>
                              <div style={{fontSize: '13px', fontWeight: '600', color: '#1f2937'}}>
                                {property.bidding?.startDateTime 
                                  ? new Date(property.bidding.startDateTime).toLocaleTimeString('en-GB', { 
                                      hour: '2-digit', 
                                      minute: '2-digit'
                                    }) + ' (GMT)'
                                  : '10:00 (GMT)'
                                }
                              </div>
                            </div>
                            
                            {/* Bidding Closes Box */}
                            <div style={{flex: '1', minWidth: '120px', padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
                              <div style={{fontSize: '11px', color: '#6b7280', fontWeight: '600', marginBottom: '2px'}}>
                                Bidding Closes
                              </div>
                              <div style={{fontSize: '13px', fontWeight: '600', color: '#1f2937'}}>
                                {property.bidding?.endDateTime 
                                  ? new Date(property.bidding.endDateTime).toLocaleTimeString('en-GB', { 
                                      hour: '2-digit', 
                                      minute: '2-digit'
                                    }) + ' (GMT)'
                                  : 'To be Confirmed'
                                }
                              </div>
                            </div>
                          </div>

                                    <div className="cta-button-wrapper" style={{ gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <a
              href={`/bidding-detail?id=${property.id}`}
              className="button is-secondary w-inline-block"
              style={{ borderRadius: '9999px', minWidth: '140px' }}
            >
              <div className="button-text">View Details</div>
            </a>
            <a
              href="/signup"
              className="button w-inline-block"
              style={{ borderRadius: '9999px', minWidth: '160px' }}
            >
              <div className="button-text">Register to Bid</div>
            </a>
          </div>
                        </div>
                      </div>
                    );
                  })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section - The Remmic Edge */}
        <section className="section-story">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div className="story-component">
              <div data-w-id="09a08e46-57b6-0605-e24c-7f329ffc2850" style={{opacity: 1, transform: 'translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)', transformStyle: 'preserve-3d'}} className="story-top-content-wrapper">
                <div className="story-highlight">
                  <div>Upcoming Auctions</div>
                </div>
                <h2 className="heading-style-h2">Get ready for the next exciting property auctions coming soon.</h2>
              </div>
              
              {(() => {
                // Debug: Show all available properties first
                console.log('All properties available:', properties.length, properties)
                
                // Filter for upcoming auction properties - only user uploaded properties
                let upcomingProperties = properties.filter(property => {
                  console.log('Checking property:', property.title, {
                    status: property.status,
                    type: property.type,
                    source: property.source,
                    biddingStatus: property.biddingStatus,
                    isUpcoming: property.isUpcoming,
                    bidding: property.bidding
                  })
                  
                  // Exclude mock/demo/example properties
                  const isMockProperty = (property.title && property.title.toLowerCase().includes('example')) ||
                                        (property.title && property.title.toLowerCase().includes('demo')) ||
                                        (property.title && property.title.toLowerCase().includes('mock')) ||
                                        (property.title && property.title.toLowerCase().includes('sample')) ||
                                        (property.title && property.title.toLowerCase().includes('test')) ||
                                        (property.title === 'Property Listing') ||
                                        (property.title === 'Auction Property') ||
                                        (property.description === 'Property details will be shared soon.')
                  
                  if (isMockProperty) {
                    console.log('Excluding mock property:', property.title)
                    return false
                  }
                  
                  // Only show properties that are:
                  // 1. From land registration (user uploaded)
                  // 2. Approved bidding properties (admin approved user uploads)
                  // 3. Have approved status (admin approved)
                  return (property.source === 'land-registration-form' && property.status !== 'rejected') ||
                         (property.status === 'approved' && property.type === 'bidding') ||
                         (property.status === 'approved' && property.biddingStatus)
                })
                
                console.log('Filtered upcoming properties (user uploaded only):', upcomingProperties.length, upcomingProperties)
                
                // NO fallback to avoid showing unwanted properties
                
                if (upcomingProperties.length === 0) {
                  return (
                    <div style={{
                      textAlign: 'center',
                      padding: '4rem 2rem',
                      color: '#6b7280'
                    }}>
                      <h3 style={{marginBottom: '1rem', color: '#374151'}}>No Upcoming Auctions</h3>
                      <p style={{marginBottom: '2rem'}}>Stay tuned! New property auctions will be announced soon.</p>
                      
                      {/* Properties Button */}
                      <button
                        onClick={() => {
                          // Show all available properties in modal
                          if (properties.length > 0) {
                            setSelectedProperty(properties[0])
                            setShowPropertyModal(true)
                          }
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #ff5e01, #ff7221)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(255, 94, 1, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 6px 20px rgba(255, 94, 1, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0px)'
                          e.target.style.boxShadow = '0 4px 12px rgba(255, 94, 1, 0.3)'
                        }}
                      >
                        View All Properties ({properties.length})
                      </button>
                    </div>
                  )
                }

                return (
                  <div className="story-tracker-wrapper" style={{
                    overflow: 'hidden', 
                    position: 'relative',
                    width: '100%',
                    height: 'auto',
                    padding: '2rem 0'
                  }}>
                    <div className="story-tracker-container" style={{
                      display: 'flex',
                      animation: upcomingProperties.length > 1 ? 'scrollStack 25s linear infinite' : 'none',
                      width: upcomingProperties.length > 1 ? 'calc(200% + 4rem)' : '100%',
                      height: 'auto'
                    }}>
                      <div className="story-tracker" style={{
                        display: 'flex',
                        width: upcomingProperties.length > 1 ? '50%' : '100%',
                        gap: '2rem',
                        justifyContent: upcomingProperties.length <= 1 ? 'center' : 'flex-start',
                        alignItems: 'stretch',
                        height: 'auto',
                        paddingLeft: '20px',
                        paddingRight: '20px'
                      }}>
                        {upcomingProperties.map((property, index) => (
                          <div key={`upcoming-1-${property.id}-${index}`} className="auction-card" style={{
                            minWidth: '380px', 
                            maxWidth: '380px',
                            flex: '0 0 380px',
                            height: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                            overflow: 'hidden',
                            border: '1px solid #f1f5f9',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                          }}
                          >
                            <div className="auction-image-wrapper" style={{
                              width: '100%',
                              height: '240px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <img 
                                src={ensurePropertyImage(property)} 
                                loading="lazy" 
                                alt={property.title}
                                className="auction-image"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease'
                                }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=380&auto=format&fit=crop&q=80'
                                }}
                              />
                              
                              {/* Status Badge */}
                              <div style={{
                                position: 'absolute',
                                top: '16px',
                                left: '16px',
                                padding: '8px 14px',
                                background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                color: '#fff',
                                fontSize: '11px',
                                borderRadius: '25px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                              }}>
                                Live Auction
                              </div>

                              {/* Time Badge */}
                              <div style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                padding: '8px 14px',
                                background: 'rgba(0, 0, 0, 0.85)',
                                color: '#fff',
                                fontSize: '11px',
                                borderRadius: '25px',
                                fontWeight: '600',
                                backdropFilter: 'blur(10px)'
                              }}>
                                {property.auctionEnd || '6 days left'}
                              </div>
                            </div>
                            
                            <div className="auction-content" style={{
                              padding: '24px',
                              display: 'flex',
                              flexDirection: 'column',
                              flex: '1'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px'
                              }}>
                                <div style={{
                                  padding: '4px 10px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  fontSize: '10px',
                                  borderRadius: '50px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {property.type || 'residential Land'}
                                </div>
                                <div style={{
                                  padding: '4px 10px',
                                  background: '#ecfdf5',
                                  color: '#059669',
                                  fontSize: '10px',
                                  borderRadius: '50px',
                                  fontWeight: '600'
                                }}>
                                  {property.area || '5 marla'}
                                </div>
                              </div>

                              <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#0f172a',
                                lineHeight: '1.3'
                              }}>
                                {property.title}
                              </h3>
                              
                              <div style={{
                                color: '#64748b',
                                fontSize: '13px',
                                marginBottom: '16px',
                                lineHeight: '1.5',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {property.description}
                              </div>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '16px',
                                fontSize: '13px',
                                color: '#64748b'
                              }}>
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{property.location || 'islamabad'}</span>
                              </div>

                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 'auto',
                                padding: '16px 0 0 0',
                                borderTop: '1px solid #f1f5f9'
                              }}>
                                <div>
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                  }}>
                                    Starting Bid
                                  </div>
                                  <div style={{
                                    fontSize: '18px',
                                    fontWeight: '800',
                                    color: '#0f172a'
                                  }}>
                                    {property.startingBid || 'PKR 20,000,000,000'}
                                  </div>
                                </div>
                                
                                <div style={{
                                  textAlign: 'right'
                                }}>
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                  }}>
                                    Starts
                                  </div>
                                  <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#059669'
                                  }}>
                                    {property.biddingStartDate ? new Date(property.biddingStartDate).toLocaleDateString() : '27/10/2025'}
                                  </div>
                                </div>
                              </div>

                              {/* View Details Button */}
                              <button
                                onClick={() => handleShowPropertyDetails(property)}
                                style={{
                                  width: '100%',
                                  marginTop: '20px',
                                  padding: '12px 16px',
                                  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50px',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #ea580c, #dc2626)';
                                  e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'linear-gradient(135deg, #ff6b35, #f7931e)';
                                  e.target.style.transform = 'translateY(0)';
                                }}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Duplicate set for seamless loop - only if more than 1 property */}
                      {upcomingProperties.length > 1 && (
                        <div className="story-tracker" style={{
                          display: 'flex',
                          width: '50%',
                          gap: '2rem',
                          alignItems: 'stretch',
                          height: 'auto',
                          paddingLeft: '20px',
                          paddingRight: '20px'
                        }}>
                          {upcomingProperties.map((property, index) => (
                            <div key={`upcoming-2-${property.id}-${index}`} className="auction-card" style={{
                              minWidth: '380px', 
                              maxWidth: '380px',
                              flex: '0 0 380px',
                              height: 'auto',
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: '#fff',
                              borderRadius: '16px',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                              overflow: 'hidden',
                              border: '1px solid #f1f5f9',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                            }}
                            >
                              <div className="auction-image-wrapper" style={{
                                width: '100%',
                                height: '240px',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                <img 
                                  src={ensurePropertyImage(property)} 
                                  loading="lazy" 
                                  alt={property.title}
                                  className="auction-image"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease'
                                  }}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=380&auto=format&fit=crop&q=80'
                                  }}
                                />
                                
                                <div style={{
                                  position: 'absolute',
                                  top: '16px',
                                  left: '16px',
                                  padding: '8px 14px',
                                  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                  color: '#fff',
                                  fontSize: '11px',
                                  borderRadius: '25px',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                                }}>
                                  Live Auction
                                </div>

                                <div style={{
                                  position: 'absolute',
                                  top: '16px',
                                  right: '16px',
                                  padding: '8px 14px',
                                  background: 'rgba(0, 0, 0, 0.85)',
                                  color: '#fff',
                                  fontSize: '11px',
                                  borderRadius: '25px',
                                  fontWeight: '600',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  {property.auctionEnd || '6 days left'}
                                </div>
                              </div>
                              
                              <div className="auction-content" style={{
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                flex: '1'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '12px'
                                }}>
                                  <div style={{
                                    padding: '4px 10px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    fontSize: '10px',
                                    borderRadius: '50px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                  }}>
                                    {property.type || 'residential Land'}
                                  </div>
                                  <div style={{
                                    padding: '4px 10px',
                                    background: '#ecfdf5',
                                    color: '#059669',
                                    fontSize: '10px',
                                    borderRadius: '50px',
                                    fontWeight: '600'
                                  }}>
                                    {property.area || '5 marla'}
                                  </div>
                                </div>

                                <h3 style={{
                                  margin: '0 0 8px 0',
                                  fontSize: '18px',
                                  fontWeight: '700',
                                  color: '#0f172a',
                                  lineHeight: '1.3'
                                }}>
                                  {property.title}
                                </h3>
                                
                                <div style={{
                                  color: '#64748b',
                                  fontSize: '13px',
                                  marginBottom: '16px',
                                  lineHeight: '1.5',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {property.description}
                                </div>

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '16px',
                                  fontSize: '13px',
                                  color: '#64748b'
                                }}>
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{property.location || 'islamabad'}</span>
                                </div>

                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginTop: 'auto',
                                  padding: '16px 0 0 0',
                                  borderTop: '1px solid #f1f5f9'
                                }}>
                                  <div>
                                    <div style={{
                                      fontSize: '11px',
                                      color: '#64748b',
                                      fontWeight: '500',
                                      marginBottom: '4px'
                                    }}>
                                      Starting Bid
                                    </div>
                                    <div style={{
                                      fontSize: '18px',
                                      fontWeight: '800',
                                      color: '#0f172a'
                                    }}>
                                      {property.startingBid || 'PKR 20,000,000,000'}
                                    </div>
                                  </div>
                                  
                                  <div style={{
                                    textAlign: 'right'
                                  }}>
                                    <div style={{
                                      fontSize: '11px',
                                      color: '#64748b',
                                      fontWeight: '500',
                                      marginBottom: '4px'
                                    }}>
                                      Starts
                                    </div>
                                    <div style={{
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      color: '#059669'
                                    }}>
                                      {property.biddingStartDate ? new Date(property.biddingStartDate).toLocaleDateString() : '27/10/2025'}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleShowPropertyDetails(property)}
                                  style={{
                                    width: '100%',
                                    marginTop: '20px',
                                    padding: '12px 16px',
                                    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, #ea580c, #dc2626)';
                                    e.target.style.transform = 'translateY(-1px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, #ff6b35, #f7931e)';
                                    e.target.style.transform = 'translateY(0)';
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#1f2937'}
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>

        <>
        {heroProperty && (
          <section style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
            <div className="padding-global">
              <div className="container-x-large">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', padding: '3rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <span style={{ color: '#ff5e01', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Featured Auction</span>
                    <h1 style={{ fontSize: '2.4rem', lineHeight: 1.2, margin: 0 }}>{heroProperty.title}</h1>
                    <p style={{ color: '#4b5563', margin: 0 }}>{heroProperty.description}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>{heroCountdown.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: heroCountdown.phase === 'live' ? '#16a34a' : '#111827' }}>{heroCountdown.timeLeft}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>Guide / Starting Bid</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{heroProperty.startingBid}</div>
                      </div>
                    </div>
                              <div className="cta-button-wrapper" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={heroProperty.registerUrl || '/register'}
              className="button w-inline-block"
              style={{ borderRadius: '9999px', minWidth: '160px' }}
            >
              <div className="button-text">Register to Bid</div>
            </a>
            <button
              type="button"
              onClick={() => setIsViewingsOpen((prev) => !prev)}
              className="button is-secondary w-inline-block"
              style={{ borderRadius: '9999px', minWidth: '160px' }}
            >
              <div className="button-text">Book Viewing</div>
            </button>
          </div>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      <HeroInfo label="Auction Date" value={heroProperty.bidding?.startDateTime ? new Date(heroProperty.bidding.startDateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'To be confirmed'} />
                      <HeroInfo label="Bidding Opens" value={heroProperty.bidding?.startDateTime ? new Date(heroProperty.bidding.startDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' (GMT)' : 'To be confirmed'} />
                      <HeroInfo label="Bidding Closes" value={heroProperty.bidding?.endDateTime ? new Date(heroProperty.bidding.endDateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' (GMT)' : 'To be confirmed'} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)' }}>
                      <img src={ensurePropertyImage(heroProperty)} alt={heroProperty.title} style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '360px' }} />
                    </div>
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>Your Auction Specialist</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#4b5563' }}>
                        <span>{heroProperty.agentName || 'Remmic Auctions Team'}</span>
                        <a href={`mailto:${heroProperty.agentEmail || 'auctions@remmic.com'}`} style={{ color: '#0f172a', textDecoration: 'none' }}>{heroProperty.agentEmail || 'auctions@remmic.com'}</a>
                        <a href={`tel:${heroProperty.agentPhone || '+971-000-0000'}`} style={{ color: '#0f172a', textDecoration: 'none' }}>{heroProperty.agentPhone || '+971-000-0000'}</a>
                      </div>
                    </div>
                  </div>
                </div>
                {isViewingsOpen && (
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e7eb', marginTop: '-1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Property Viewings</h3>
                      <button
                        onClick={() => setIsViewingsOpen(false)}
                        style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                        aria-label="Close viewings"
                      >
                        ×
                      </button>
                    </div>
                    <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>
                      Viewings have not yet been scheduled for this property. Sign in to be notified when viewing appointments become available.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      <a href="/login" style={{ color: '#0f172a', fontWeight: 600 }}>Sign in</a>
                      <a href="/register" style={{ color: '#0f172a', fontWeight: 600 }}>Create account</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

          {/* Process Section - EXACT COPY */}
          <section data-w-id="3616b13b-cf18-9839-3e56-d339fa6c63fd" className="section-process">
          <div className="page-lode">
            <div className="process-component">
              <div className="process-top-content">
                <div className="process-head-line">
                  <div>Process</div>
                </div>
                <h2 className="heading-style-h2">How it Works</h2>
              </div>
              <div className="process-bottom-content">
                <div className="process-card-list-wrapper">
                  <div className="process-card-wrapper fast">
                    <div className="process-line-wrapper">
                      <div className="process-number first">
                        <h6 data-w-id="ad81eb1f-e905-668e-f2e8-fd336f52b855" className="heading-style-h6">01</h6>
                      </div>
                      <div className="process-line">
                        <div data-w-id="4c5562e1-8782-df07-921c-19c518f2e8de" className="process-hover-line"></div>
                      </div>
                    </div>
                    <div id="w-node-a7c0caf3-34e8-c2db-29d9-af706a3fa852-039500ab" className="process-card first">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201.png" loading="lazy" sizes="(max-width: 535px) 100vw, 535px" srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035906e4b0e24ea61b56_Process%20Image%201.png 535w" alt="" className="process-card-image" />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Add Your Properties</h6>
                        <div className="text-size-regular">
                          Easily upload property listings, photos, and key details in just minutes—no technical skills needed.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div id="w-node-d9d084c9-b42a-7895-03fb-e8397585a944-039500ab" className="process-card-wrapper">
                    <div className="process-card second">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202.png" loading="lazy" sizes="(max-width: 535px) 100vw, 535px" srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a7035963f22775eca2d85a_Process%20Image%202.png 535w" alt="" className="process-card-image" />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Live Bidding</h6>
                        <div className="text-size-regular">
                          Remmic Live Bidding System brings buyers and sellers together on a transparent auction platform, where every bid is updated in real time — ensuring fair pricing and quick deal closure.
                        </div>
                      </div>
                    </div>
                    <div className="process-line-wrapper">
                      <div className="process-number second">
                        <h6 data-w-id="5eb120f0-efaa-46ad-0feb-57dfdfbeecaf" className="heading-style-h6">02</h6>
                      </div>
                      <div className="process-line">
                        <div data-w-id="de6dbf9d-e5da-69a1-d249-8afdd7a5ef19" className="process-second-hover-line"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="process-card-wrapper">
                    <div className="process-line-wrapper">
                      <div className="process-number third">
                        <h6 data-w-id="2720b254-e069-03e4-1e51-b5d0af0ac48b" className="heading-style-h6">03</h6>
                      </div>
                      <div className="process-line">
                        <div className="process-third-hover-line"></div>
                      </div>
                    </div>
                    <div id="w-node-fefd2574-931d-8619-5c53-556169d80ae5-039500ab" className="process-card third">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203.png" loading="lazy" sizes="(max-width: 535px) 100vw, 535px" srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70359241ac8d4e4389c30_Process%20Image%203.png 535w" alt="" className="process-card-image" />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Automate Everything</h6>
                        <div className="text-size-regular">
                          Auto Bidding Set your max bid and let the system compete for you—fast, fair, and hands-free.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - EXACT COPY */}
        <section className="section-cta">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div data-w-id="03b4adc1-f918-bae5-37d1-18bef1a11870" className="cta-component">
                  <div className="cta-content">
                    <h2 className="heading-style-h2">Your Deal Starts Here</h2>
                    <div className="cta-button-wrapper">
                      <a href="/contact" className="button is-secondary w-inline-block">
                        <div className="button-text">Join Auction</div>
                      </a>
                      <a href="/signup" className="button w-inline-block">
                        <div className="button-text">List Property</div>
                      </a>
                    </div>
                  </div>
                  <div className="cta-image-wrapper">
                    <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70f8af95c3cf69a01112e_Cta%20Image.png" loading="lazy" sizes="(max-width: 802px) 100vw, 802px" srcSet="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70f8af95c3cf69a01112e_Cta%20Image-p-500.png 500w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70f8af95c3cf69a01112e_Cta%20Image-p-800.png 800w, https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a70f8af95c3cf69a01112e_Cta%20Image.png 802w" alt="" className="cta-image" />
                  </div>
                  <div className="cta-glass-image-wrapper">
                    <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a33e286e2e1212a5ec3dd9_glass.png" loading="lazy" alt="" className="cta-glass-image" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Footer Section - EXACT COPY */}
        <footer className="section-footer">
          <div className="padding-global">
            <div className="container-large">
              <div className="footer-component">
                <div className="footer-top-content">
                  <div className="footer-form-block w-form">
                    <form id="email-form" name="email-form" data-name="Email Form" method="get" className="footer-form">
                      <input className="footer-input w-input" maxLength="256" name="email" data-name="Email" placeholder="Enter your email" type="email" id="email" required />
                      <div className="footer-submit-button">
                        <input type="submit" data-wait="Please wait..." className="button is-footer w-button" value="Submit" />
                      </div>
                    </form>
                    <div className="w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                  <div className="footer-social-link-wrapper">
                    <a href="https://www.instagram.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac246154f611ea1420a7c4_instagram.svg" loading="lazy" alt="instagram" className="social-link" />
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461db48f9856f9b7dc5_instagram%2002.svg" loading="lazy" alt="instagram" className="hover-social-link" />
                    </a>
                    <a href="https://x.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2462f03cccc6637bd306_twitter.svg" loading="lazy" alt="X" className="social-link" />
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" loading="lazy" alt="X" className="hover-social-link" />
                    </a>
                    <a href="https://linkedin.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461ba0482ed367c032e_linkedin.svg" loading="lazy" alt="linkdin" className="social-link" />
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461471a6191f7cb01da_linkedin%2002.svg" loading="lazy" alt="Linkdine" className="hover-social-link" />
                    </a>
                    <a href="https://www.facebook.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24610096cecff568c101_facebook.svg" loading="lazy" alt="facebook" className="social-link" />
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24615c48e8d43a920438_facebook%2002.svg" loading="lazy" alt="Facebook " className="hover-social-link" />
                    </a>
                  </div>
                </div>
                <div className="footer-card">
                  <div className="text-size-regular">Company</div>
                  <div className="footer-link-list">
                    <a href="/" className="text-size-regular">Home</a>
                    <a href="/about" className="text-size-regular">About</a>
                    <a href="/contact" className="text-size-regular">Contact</a>
                  </div>
                </div>
                <div className="footer-card-list">
                  <div className="footer-card">
                    <div className="text-size-regular">Inner page</div>
                    <div className="footer-bottom-link-list">
                      <a href="/feature" className="footer-text">Feature</a>
                      <a href="/team" className="footer-text">Team</a>
                      <a href="/pricing" className="footer-text">Price</a>
                      <a href="/privacy-policy" className="footer-text">Privacy Policy</a>
                    </div>
                  </div>
                  <div className="footer-card second">
                    <div className="text-size-regular">Authentication</div>
                    <div className="footer-bottom-link-list">
                      <a href="/login" className="footer-text">Login</a>
                      <a href="/signup" className="footer-text">Sign up</a>
                    </div>
                  </div>
                </div>
                <div className="footer-botom-content">
                  <div className="website-link-wrapper">
                    <div className="text-size-small tex-color-black-700">Designed by</div>
                    <a href="https://webocean.io/" target="_blank" className="website-link w-inline-block">
                      <img src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461cdc0f95afcb65f44_webocan%20Logo.svg" loading="lazy" alt="webocean" className="website-logo" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Property Details Modal */}
        {showPropertyModal && selectedProperty && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              maxWidth: '800px',
              maxHeight: '90vh',
              width: '100%',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001
                }}
              >
                ×
              </button>

              {/* Property Image */}
              <div style={{
                height: '300px',
                backgroundImage: `url(${selectedProperty.image || '/api/placeholder/800/300'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '20px 20px 0 0',
                position: 'relative'
              }}>
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  padding: '8px 16px',
                  background: selectedProperty.status === 'Live Auction' 
                    ? '#22c55e'  // Green for live auctions
                    : selectedProperty.status === 'Upcoming Auction'
                      ? '#f59e0b'  // Orange for upcoming
                      : selectedProperty.status === 'Auction Ended'
                        ? '#6b7280'  // Gray for ended
                        : '#ef4444', // Red for other statuses
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '25px',
                  fontWeight: '600'
                }}>
                  {selectedProperty.status}
                </div>
              </div>

              {/* Property Details */}
              <div style={{ padding: '30px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '10px'
                }}>
                  {selectedProperty.title}
                </h2>

                <p style={{
                  color: '#6b7280',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginBottom: '20px'
                }}>
                  {selectedProperty.description}
                </p>

                {/* Property Info Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  marginBottom: '25px'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Area</h4>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{selectedProperty.area}</p>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Location</h4>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{selectedProperty.location}</p>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Starting Bid</h4>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{selectedProperty.startingBid}</p>
                  </div>

                  {selectedProperty.auctionEnd && (
                    <div style={{
                      background: '#f8fafc',
                      padding: '15px',
                      borderRadius: '12px'
                    }}>
                      <h4 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Auction Status</h4>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>{selectedProperty.auctionEnd}</p>
                    </div>
                  )}
                </div>

                {/* Bidding Info */}
                {selectedProperty.bidding && (
                  <div style={{
                    background: '#fef3c7',
                    padding: '20px',
                    borderRadius: '50px',
                    marginBottom: '20px'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '10px' }}>Bidding Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      {selectedProperty.bidding.minBidAmount && (
                        <div>
                          <span style={{ fontSize: '14px', color: '#92400e' }}>Min Bid: </span>
                          <strong>{formatBidAmount(selectedProperty.bidding.minBidAmount)}</strong>
                        </div>
                      )}
                      {selectedProperty.bidding.maxBidAmount && (
                        <div>
                          <span style={{ fontSize: '14px', color: '#92400e' }}>Max Bid: </span>
                          <strong>{formatBidAmount(selectedProperty.bidding.maxBidAmount)}</strong>
                        </div>
                      )}
                      {selectedProperty.bidding.fees && (
                        <div>
                          <span style={{ fontSize: '14px', color: '#92400e' }}>Bidding Fee: </span>
                          <strong>{formatBidAmount(selectedProperty.bidding.fees)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'center'
                }}>
                  {(() => {
                    const biddingInfo = getBiddingButtonInfo(selectedProperty)
                    const canBid = !biddingInfo.disabled
                    
                    return (
                      <>
                        <button
                          onClick={() => {
                            if (canBid) {
                              window.location.href = `/bidding-detail?id=${selectedProperty.id}`
                            }
                          }}
                          disabled={!canBid}
                          title={biddingInfo.reason}
                          style={{
                            background: canBid 
                              ? 'linear-gradient(135deg, #ff5e01, #ff7221)' 
                              : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '12px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: canBid ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            opacity: canBid ? 1 : 0.7
                          }}
                        >
                          {biddingInfo.text}
                        </button>
                        
                        {!canBid && (
                          <div style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fbbf24',
                            borderRadius: '50px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'center',
                            minWidth: '200px'
                          }}>
                            {biddingInfo.reason}
                          </div>
                        )}
                      </>
                    )
                  })()}
                  
                  <button
                    onClick={handleCloseModal}
                    style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      </div>
    </>
  )
}

