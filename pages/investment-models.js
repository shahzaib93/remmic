import Head from 'next/head'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Mock property data for share investment
const SHARE_PROPERTIES = [
  {
    id: 'dha-phase-5-residential',
    title: 'DHA Phase 5 Residential Complex',
    location: 'Lahore, Punjab',
    type: 'Residential',
    status: 'Live',
    price: 25000000, // Total property value PKR 2.5 Crore
    sharePrice: 250000, // PKR 2.5 Lakh per share
    totalShares: 100,
    availableShares: 22,
    soldShares: 78,
    minInvestment: 250000,
    expectedROI: 18.5,
    annualYield: 8.5,
    holdPeriod: 36, // months
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop'
    ],
    description: 'Premium residential complex in DHA Phase 5 with modern amenities and high rental demand. Professional property management ensures consistent returns.',
    amenities: ['Gated Community', '24/7 Security', 'Swimming Pool', 'Gym', 'Playground', 'Mosque'],
    highlights: ['Escrow Protected', 'Quarterly Dividends', 'Professional Management', 'High Demand Area'],
    riskLevel: 'Low',
    propertyArea: '10 Kanal',
    bedrooms: 'Multiple Units',
    bathrooms: 'Multiple Units',
    parking: 'Dedicated Parking',
    yearBuilt: 2020,
    developer: 'DHA Lahore',
    lastUpdated: '2 hours ago'
  },
  {
    id: 'gulberg-commercial-plaza',
    title: 'Gulberg Commercial Plaza',
    location: 'Islamabad, ICT',
    type: 'Commercial',
    status: 'Selling Fast',
    price: 42000000, // PKR 4.2 Crore
    sharePrice: 420000, // PKR 4.2 Lakh per share
    totalShares: 100,
    availableShares: 11,
    soldShares: 89,
    minInvestment: 420000,
    expectedROI: 22.3,
    annualYield: 12.8,
    holdPeriod: 48,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=800&h=600&fit=crop'
    ],
    description: 'Grade-A commercial office space in Gulberg with pre-leased tenants. Located in prime commercial district with excellent connectivity.',
    amenities: ['Central AC', 'High Speed Elevators', 'Generator Backup', 'Parking Plaza', 'Food Court', 'Conference Rooms'],
    highlights: ['Pre-leased Tenants', 'Monthly Returns', 'Prime Location', 'Corporate Tenancy'],
    riskLevel: 'Medium',
    propertyArea: '15,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: 'Multiple',
    parking: '50 Spaces',
    yearBuilt: 2019,
    developer: 'Gulberg Developers',
    lastUpdated: '5 hours ago'
  },
  {
    id: 'bahria-town-villas',
    title: 'Bahria Town Luxury Villas',
    location: 'Karachi, Sindh',
    type: 'Residential',
    status: 'Limited',
    price: 68000000, // PKR 6.8 Crore
    sharePrice: 680000, // PKR 6.8 Lakh per share
    totalShares: 100,
    availableShares: 5,
    soldShares: 95,
    minInvestment: 680000,
    expectedROI: 15.7,
    annualYield: 6.9,
    holdPeriod: 60,
    images: [
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600563438938-a42634a3ac68?w=800&h=600&fit=crop'
    ],
    description: 'Luxury villa complex in Bahria Town with premium finishes and resort-style amenities. High-end residential investment with capital appreciation focus.',
    amenities: ['Private Garden', 'Maid Quarter', 'Study Room', 'Drawing Room', 'Family Lounge', 'Roof Top'],
    highlights: ['Luxury Amenities', 'Capital Appreciation', 'Gated Community', 'Few Shares Left'],
    riskLevel: 'Low',
    propertyArea: '1 Kanal',
    bedrooms: '5 Bedrooms',
    bathrooms: '6 Bathrooms',
    parking: '2 Car Garage',
    yearBuilt: 2021,
    developer: 'Bahria Town',
    lastUpdated: '1 day ago'
  },
  {
    id: 'emaar-hills-apartments',
    title: 'Emaar Hills Apartments',
    location: 'Islamabad, ICT',
    type: 'Residential',
    status: 'Live',
    price: 35000000, // PKR 3.5 Crore
    sharePrice: 350000, // PKR 3.5 Lakh per share
    totalShares: 100,
    availableShares: 43,
    soldShares: 57,
    minInvestment: 350000,
    expectedROI: 16.2,
    annualYield: 9.1,
    holdPeriod: 42,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
    ],
    description: 'Modern apartment complex with state-of-the-art facilities in prime Islamabad location. High rental yield from young professional tenants.',
    amenities: ['Fitness Center', 'Rooftop Garden', 'Concierge Service', '24/7 Security', 'Kids Play Area', 'Business Center'],
    highlights: ['Modern Design', 'High Rental Yield', 'Professional Tenants', 'Prime Location'],
    riskLevel: 'Medium',
    propertyArea: '1200 sq ft',
    bedrooms: '2-3 Bedrooms',
    bathrooms: '2-3 Bathrooms',
    parking: 'Covered Parking',
    yearBuilt: 2022,
    developer: 'Emaar Pakistan',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'canal-view-offices',
    title: 'Canal View Office Tower',
    location: 'Lahore, Punjab',
    type: 'Commercial',
    status: 'Live',
    price: 55000000, // PKR 5.5 Crore
    sharePrice: 550000, // PKR 5.5 Lakh per share
    totalShares: 100,
    availableShares: 31,
    soldShares: 69,
    minInvestment: 550000,
    expectedROI: 19.8,
    annualYield: 11.2,
    holdPeriod: 45,
    images: [
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&h=600&fit=crop'
    ],
    description: 'Premium office tower overlooking Lahore Canal with Grade-A specifications. Anchor tenants include multinational corporations.',
    amenities: ['Canal View', 'High Speed Internet', 'Video Conferencing', 'Cafeteria', 'Helipads', 'VIP Parking'],
    highlights: ['Canal View', 'Grade-A Specs', 'Multinational Tenants', 'Premium Location'],
    riskLevel: 'Low',
    propertyArea: '12,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: 'Executive Washrooms',
    parking: '40 Spaces',
    yearBuilt: 2020,
    developer: 'Canal Developers',
    lastUpdated: '6 hours ago'
  },
  {
    id: 'clifton-beach-resort',
    title: 'Clifton Beach Resort',
    location: 'Karachi, Sindh',
    type: 'Hospitality',
    status: 'Coming Soon',
    price: 95000000, // PKR 9.5 Crore
    sharePrice: 950000, // PKR 9.5 Lakh per share
    totalShares: 100,
    availableShares: 85,
    soldShares: 15,
    minInvestment: 950000,
    expectedROI: 25.4,
    annualYield: 14.6,
    holdPeriod: 72,
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop'
    ],
    description: 'Luxury beachfront resort project with international hospitality management. Revenue sharing model with operational hospitality partner.',
    amenities: ['Beachfront', 'Spa & Wellness', 'Multiple Restaurants', 'Event Halls', 'Water Sports', 'Helipad'],
    highlights: ['Beachfront Location', 'Hospitality Partner', 'Revenue Sharing', 'Luxury Project'],
    riskLevel: 'High',
    propertyArea: '5 Acres',
    bedrooms: '200 Suites',
    bathrooms: 'Luxury Suites',
    parking: 'Valet Parking',
    yearBuilt: 2024, // Under construction
    developer: 'Clifton Hospitality',
    lastUpdated: '12 hours ago'
  },
  {
    id: 'phase-8-shopping-mall',
    title: 'Phase 8 Shopping Complex',
    location: 'Lahore, Punjab',
    type: 'Commercial',
    status: 'Live',
    price: 78000000, // PKR 7.8 Crore
    sharePrice: 780000, // PKR 7.8 Lakh per share
    totalShares: 100,
    availableShares: 18,
    soldShares: 82,
    minInvestment: 780000,
    expectedROI: 20.1,
    annualYield: 10.8,
    holdPeriod: 54,
    images: [
      'https://images.unsplash.com/photo-1531973968078-9bb02785f13d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580867218229-cd0ff2eb8db6?w=800&h=600&fit=crop'
    ],
    description: 'Prime retail space in DHA Phase 8 with anchor tenants including international brands. High footfall location with excellent ROI potential.',
    amenities: ['Food Court', 'Parking Plaza', 'Entertainment Zone', 'Security Systems', 'Central AC', 'Prayer Area'],
    highlights: ['International Brands', 'Prime Location', 'High Footfall', 'Anchor Tenants'],
    riskLevel: 'Medium',
    propertyArea: '25,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: 'Public Facilities',
    parking: '150 Spaces',
    yearBuilt: 2019,
    developer: 'DHA Lahore',
    lastUpdated: '4 hours ago'
  },
  {
    id: 'park-view-apartments',
    title: 'Park View Luxury Apartments',
    location: 'Islamabad, ICT',
    type: 'Residential',
    status: 'Selling Fast',
    price: 48000000, // PKR 4.8 Crore
    sharePrice: 480000, // PKR 4.8 Lakh per share
    totalShares: 100,
    availableShares: 9,
    soldShares: 91,
    minInvestment: 480000,
    expectedROI: 17.3,
    annualYield: 8.9,
    holdPeriod: 40,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556909114-1fb12eed3a9a?w=800&h=600&fit=crop'
    ],
    description: 'Modern luxury apartments with park views in F-7 sector. Premium finishes and high-end amenities targeting expatriate and corporate housing.',
    amenities: ['Park View', 'Gym & Spa', 'Rooftop Terrace', 'Concierge', 'Smart Home', 'Children Play Area'],
    highlights: ['Park Facing', 'Luxury Finishes', 'Expatriate Housing', 'Smart Features'],
    riskLevel: 'Low',
    propertyArea: '1800 sq ft',
    bedrooms: '3 Bedrooms',
    bathrooms: '3 Bathrooms',
    parking: '1 Covered',
    yearBuilt: 2021,
    developer: 'Capital Smart City',
    lastUpdated: '1 hour ago'
  },
  {
    id: 'industrial-warehouse',
    title: 'Industrial Storage Complex',
    location: 'Faisalabad, Punjab',
    type: 'Industrial',
    status: 'Live',
    price: 32000000, // PKR 3.2 Crore
    sharePrice: 320000, // PKR 3.2 Lakh per share
    totalShares: 100,
    availableShares: 56,
    soldShares: 44,
    minInvestment: 320000,
    expectedROI: 14.8,
    annualYield: 9.5,
    holdPeriod: 36,
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605902394069-ff2ae5430928?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop'
    ],
    description: 'Modern warehouse facility with temperature control and logistics management. Pre-leased to major textile exporters with long-term contracts.',
    amenities: ['Temperature Control', 'Loading Docks', 'Security Systems', 'Fire Safety', 'Office Space', 'Truck Parking'],
    highlights: ['Pre-leased', 'Export Industry', 'Long-term Contracts', 'Modern Facility'],
    riskLevel: 'Medium',
    propertyArea: '50,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: 'Staff Facilities',
    parking: 'Truck Bays',
    yearBuilt: 2020,
    developer: 'Industrial Zone Ltd',
    lastUpdated: '8 hours ago'
  },
  {
    id: 'student-housing-complex',
    title: 'University Town Student Housing',
    location: 'Lahore, Punjab',
    type: 'Residential',
    status: 'Limited',
    price: 18000000, // PKR 1.8 Crore
    sharePrice: 180000, // PKR 1.8 Lakh per share
    totalShares: 100,
    availableShares: 4,
    soldShares: 96,
    minInvestment: 180000,
    expectedROI: 16.7,
    annualYield: 11.2,
    holdPeriod: 30,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556909114-1fb12eed3a9a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop'
    ],
    description: 'Purpose-built student accommodation near UET and PU campuses. Fully furnished units with high occupancy rates and steady rental income.',
    amenities: ['Study Rooms', 'Common Kitchen', 'Laundry Facility', 'WiFi', 'Security', 'Recreation Area'],
    highlights: ['Near Universities', 'Fully Furnished', 'High Occupancy', 'Student Focused'],
    riskLevel: 'Low',
    propertyArea: '450 sq ft',
    bedrooms: '1-2 Bedrooms',
    bathrooms: '1 Bathroom',
    parking: 'Limited Parking',
    yearBuilt: 2022,
    developer: 'Education Housing Ltd',
    lastUpdated: '30 minutes ago'
  },
  {
    id: 'tech-hub-offices',
    title: 'IT Park Office Towers',
    location: 'Karachi, Sindh',
    type: 'Commercial',
    status: 'Live',
    price: 65000000, // PKR 6.5 Crore
    sharePrice: 650000, // PKR 6.5 Lakh per share
    totalShares: 100,
    availableShares: 34,
    soldShares: 66,
    minInvestment: 650000,
    expectedROI: 18.9,
    annualYield: 10.3,
    holdPeriod: 48,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    ],
    description: 'Grade-A office space in Karachi IT Park with tech company tenants. Modern facilities and high-speed connectivity for technology businesses.',
    amenities: ['High Speed Internet', 'Server Rooms', 'Meeting Rooms', 'Cafeteria', 'Backup Power', '24/7 Access'],
    highlights: ['Tech Tenants', 'IT Park Location', 'Modern Infrastructure', 'Growth Potential'],
    riskLevel: 'Medium',
    propertyArea: '20,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: 'Executive Facilities',
    parking: '60 Spaces',
    yearBuilt: 2021,
    developer: 'Karachi IT Development',
    lastUpdated: '6 hours ago'
  },
  {
    id: 'farmhouse-resort',
    title: 'Murree Hills Farmhouse Resort',
    location: 'Murree, Punjab',
    type: 'Hospitality',
    status: 'Coming Soon',
    price: 38000000, // PKR 3.8 Crore
    sharePrice: 380000, // PKR 3.8 Lakh per share
    totalShares: 100,
    availableShares: 75,
    soldShares: 25,
    minInvestment: 380000,
    expectedROI: 21.5,
    annualYield: 12.8,
    holdPeriod: 60,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c986?w=800&h=600&fit=crop'
    ],
    description: 'Boutique hill station resort with panoramic mountain views. Targeting weekend getaway and event hosting markets with premium positioning.',
    amenities: ['Mountain Views', 'Event Halls', 'Restaurant', 'Hiking Trails', 'Spa Services', 'Adventure Sports'],
    highlights: ['Hill Station', 'Event Venue', 'Tourism Growth', 'Scenic Location'],
    riskLevel: 'High',
    propertyArea: '8 Acres',
    bedrooms: '25 Suites',
    bathrooms: 'Luxury Suites',
    parking: 'Open Parking',
    yearBuilt: 2024,
    developer: 'Mountain Resort Developers',
    lastUpdated: '1 day ago'
  },
  {
    id: 'medical-center-plaza',
    title: 'Medical Center Complex',
    location: 'Islamabad, ICT',
    type: 'Commercial',
    status: 'Selling Fast',
    price: 52000000, // PKR 5.2 Crore
    sharePrice: 520000, // PKR 5.2 Lakh per share
    totalShares: 100,
    availableShares: 12,
    soldShares: 88,
    minInvestment: 520000,
    expectedROI: 15.6,
    annualYield: 8.7,
    holdPeriod: 42,
    images: [
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=600&fit=crop'
    ],
    description: 'Specialized medical office complex with diagnostic centers, clinics, and pharmacy. Located in healthcare district with steady medical tenant demand.',
    amenities: ['Medical Equipment Ready', 'Pharmacy Space', 'Patient Parking', 'Emergency Access', 'Medical Gas Lines', 'Waiting Areas'],
    highlights: ['Healthcare District', 'Medical Tenants', 'Specialized Design', 'Stable Demand'],
    riskLevel: 'Low',
    propertyArea: '15,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: 'Public & Staff',
    parking: '80 Spaces',
    yearBuilt: 2020,
    developer: 'Healthcare Properties',
    lastUpdated: '3 hours ago'
  },
  {
    id: 'luxury-farmhouse-plots',
    title: 'Executive Farmhouse Community',
    location: 'Multan, Punjab',
    type: 'Residential',
    status: 'Live',
    price: 28000000, // PKR 2.8 Crore
    sharePrice: 280000, // PKR 2.8 Lakh per share
    totalShares: 100,
    availableShares: 47,
    soldShares: 53,
    minInvestment: 280000,
    expectedROI: 13.4,
    annualYield: 7.2,
    holdPeriod: 60,
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop'
    ],
    description: 'Gated farmhouse community with large plots and agricultural facilities. Targeting high-net-worth individuals seeking weekend retreats.',
    amenities: ['Gated Community', 'Agricultural Land', 'Club House', 'Swimming Pool', 'Horse Stables', 'Security'],
    highlights: ['Large Plots', 'Agricultural Use', 'Weekend Retreats', 'Premium Community'],
    riskLevel: 'Medium',
    propertyArea: '2 Kanal',
    bedrooms: 'Custom Build',
    bathrooms: 'Custom Build',
    parking: 'Multiple Cars',
    yearBuilt: 2023,
    developer: 'Premium Farmhouses Ltd',
    lastUpdated: '10 hours ago'
  }
]

// Utility functions
const formatCurrency = (amount) => {
  if (amount >= 10000000) {
    return `PKR ${(amount / 10000000).toFixed(1)} Cr`
  } else if (amount >= 100000) {
    return `PKR ${(amount / 100000).toFixed(1)} Lac`
  }
  return `PKR ${amount.toLocaleString()}`
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Live': return '#059669'        // Deep emerald green - complements gold
    case 'Selling Fast': return '#dc2626'  // Rich red - creates urgency
    case 'Limited': return '#7c2d12'       // Deep brown - warm and sophisticated  
    case 'Coming Soon': return '#1e40af'   // Deep blue - trustworthy and professional
    default: return '#475569'              // Slate gray - neutral
  }
}

const getRiskColor = (risk) => {
  switch (risk) {
    case 'Low': return '#059669'     // Deep emerald green - safe investment
    case 'Medium': return '#d97706'  // Warm amber - moderate risk
    case 'High': return '#dc2626'    // Rich red - high risk
    default: return '#475569'        // Slate gray - neutral
  }
}

export default function InvestInShares() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('roi-desc')
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let filtered = SHARE_PROPERTIES.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filterType === 'all' || property.type.toLowerCase() === filterType.toLowerCase()
      const matchesStatus = filterStatus === 'all' || property.status.toLowerCase() === filterStatus.toLowerCase()
      
      return matchesSearch && matchesType && matchesStatus
    })

    // Sort properties
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'roi-desc': return b.expectedROI - a.expectedROI
        case 'roi-asc': return a.expectedROI - b.expectedROI
        case 'price-desc': return b.sharePrice - a.sharePrice
        case 'price-asc': return a.sharePrice - b.sharePrice
        case 'availability-desc': return b.availableShares - a.availableShares
        case 'availability-asc': return a.availableShares - b.availableShares
        default: return 0
      }
    })

    return filtered
  }, [searchQuery, filterType, filterStatus, sortBy])

  const handleInvestClick = (property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleInvestNow = (property, shares) => {
    // Redirect to investment-shares page with property details
    router.push(`/investment-shares?id=${property.id}&shares=${shares}`)
  }

  return (
    <>
      <Head>
        <title>Invest in Shares - Property Investment | REMMIC</title>
        <meta name="description" content="Invest in fractional shares of premium properties. Start with as little as PKR 250,000 and earn consistent returns through professional property management." />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="pt-24">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-container">
              <div className="hero-content">
                <span className="hero-badge">Share Investment</span>
                <h1 className="hero-title">
                  Invest in <span className="hero-accent">Property Shares</span>
                </h1>
                <p className="hero-description">
                  Own fractional shares of premium properties without buying entire assets. 
                  Start investing with as little as PKR 2.5 Lac and earn consistent returns.
                </p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-value">15.2%</span>
                    <span className="stat-label">Avg. Annual ROI</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">850+</span>
                    <span className="stat-label">Active Investors</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">PKR 2.5M+</span>
                    <span className="stat-label">Total Invested</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filters and Search */}
          <section className="filters-section">
            <div className="filters-container">
              <div className="filters-header">
                <h2>Available Properties</h2>
                <p>{filteredProperties.length} properties available for share investment</p>
              </div>
              
              <div className="filters-controls">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by property name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                
                <div className="filter-group">
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="hospitality">Hospitality</option>
                  </select>
                  
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="live">Live</option>
                    <option value="selling fast">Selling Fast</option>
                    <option value="limited">Limited</option>
                    <option value="coming soon">Coming Soon</option>
                  </select>
                  
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="roi-desc">Highest ROI</option>
                    <option value="roi-asc">Lowest ROI</option>
                    <option value="price-desc">Highest Price</option>
                    <option value="price-asc">Lowest Price</option>
                    <option value="availability-desc">Most Available</option>
                    <option value="availability-asc">Least Available</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Properties Grid */}
          <section className="properties-section">
            <div className="properties-container">
              <div className="properties-grid">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="property-card">
                    {/* Image Gallery */}
                    <div className="property-image-container">
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="property-image"
                      />
                      <div className="property-badges">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(property.status) }}
                        >
                          {property.status}
                        </span>
                        <span className="roi-badge">
                          +{property.expectedROI}% ROI
                        </span>
                      </div>
                      <div className="image-count">
                        <span>{property.images.length} Photos</span>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="property-content">
                      <div className="property-header">
                        <h3 className="property-title">{property.title}</h3>
                        <p className="property-location">{property.location}</p>
                        <div className="property-type-risk">
                          <span className="property-type">{property.type}</span>
                          <span 
                            className="risk-level"
                            style={{ color: getRiskColor(property.riskLevel) }}
                          >
                            {property.riskLevel} Risk
                          </span>
                        </div>
                      </div>

                      <div className="property-metrics">
                        <div className="metric-row">
                          <div className="metric">
                            <span className="metric-label">Share Price</span>
                            <span className="metric-value">{formatCurrency(property.sharePrice)}</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Min. Investment</span>
                            <span className="metric-value">{formatCurrency(property.minInvestment)}</span>
                          </div>
                        </div>
                        <div className="metric-row">
                          <div className="metric">
                            <span className="metric-label">Annual Yield</span>
                            <span className="metric-value">{property.annualYield}%</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Hold Period</span>
                            <span className="metric-value">{Math.round(property.holdPeriod / 12)} years</span>
                          </div>
                        </div>
                      </div>

                      {/* Availability Progress */}
                      <div className="availability-section">
                        <div className="availability-header">
                          <span>Shares Available: {property.availableShares}/{property.totalShares}</span>
                          <span>{Math.round((property.soldShares / property.totalShares) * 100)}% Sold</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(property.soldShares / property.totalShares) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Property Highlights */}
                      <div className="property-highlights">
                        {property.highlights.slice(0, 3).map((highlight, index) => (
                          <span key={index} className="highlight-tag">
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Basic Property Info */}
                      <div className="property-basic-info">
                        <div className="info-item">
                          <span>Area: {property.propertyArea}</span>
                        </div>
                        <div className="info-item">
                          <span>Bedrooms: {property.bedrooms}</span>
                        </div>
                        <div className="info-item">
                          <span>Parking: {property.parking}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="property-actions">
                        <button
                          onClick={() => router.push(`/property/${property.id}`)}
                          className="btn-secondary"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleInvestClick(property)}
                          className="btn-primary"
                          disabled={property.availableShares === 0}
                        >
                          {property.availableShares === 0 ? 'Sold Out' : 'Invest Now'}
                        </button>
                      </div>

                      <div className="property-footer">
                        <span className="last-updated">Updated {property.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProperties.length === 0 && (
                <div className="no-results">
                  <h3>No properties found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          </section>

          {/* Investment Modal */}
          {isModalOpen && selectedProperty && (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Invest in {selectedProperty.title}</h3>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="modal-close"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="investment-summary">
                    <div className="summary-row">
                      <span>Share Price:</span>
                      <span>{formatCurrency(selectedProperty.sharePrice)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Available Shares:</span>
                      <span>{selectedProperty.availableShares}</span>
                    </div>
                    <div className="summary-row">
                      <span>Expected Annual ROI:</span>
                      <span className="roi-highlight">{selectedProperty.expectedROI}%</span>
                    </div>
                  </div>
                  <div className="investment-options">
                    <div className="option-card" onClick={() => handleInvestNow(selectedProperty, 1)}>
                      <h4>Buy 1 Share</h4>
                      <p className="option-price">{formatCurrency(selectedProperty.sharePrice)}</p>
                      <p className="option-description">Minimum investment to start earning returns</p>
                    </div>
                    <div className="option-card" onClick={() => handleInvestNow(selectedProperty, 5)}>
                      <h4>Buy 5 Shares</h4>
                      <p className="option-price">{formatCurrency(selectedProperty.sharePrice * 5)}</p>
                      <p className="option-description">Balanced investment for steady growth</p>
                    </div>
                    <div className="option-card" onClick={() => handleInvestNow(selectedProperty, 10)}>
                      <h4>Buy 10 Shares</h4>
                      <p className="option-price">{formatCurrency(selectedProperty.sharePrice * 10)}</p>
                      <p className="option-description">Premium investment with higher returns</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/investment-shares?id=${selectedProperty.id}`)}
                    className="btn-custom-investment"
                  >
                    Custom Investment Amount
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <section className="info-section">
            <div className="info-container">
              <div className="info-content">
                <h2>Why Invest in Property Shares?</h2>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <h3>Lower Entry Barrier</h3>
                    <p>Start investing in premium properties with as little as PKR 2.5 Lac instead of buying entire properties worth crores.</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Diversified Portfolio</h3>
                    <p>Spread your investment across multiple properties and locations to reduce risk and maximize returns.</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Professional Management</h3>
                    <p>All properties are professionally managed, ensuring optimal rental yields and property maintenance.</p>
                  </div>
                  <div className="benefit-card">
                    <h3>Legal Protection</h3>
                    <p>Your investment is legally protected through compliant SPVs and escrow accounts for complete security.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        /* Hero Section */
        .hero-section {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 120px 5% 80px;
          color: white;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-block;
          padding: 10px 20px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 24px;
        }

        .hero-accent {
          color: #c9a227;
        }

        .hero-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
          margin: 0 0 48px;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 48px;
          padding: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: #c9a227;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Filters Section */
        .filters-section {
          padding: 60px 5% 40px;
          background: #f8fafc;
        }

        .filters-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .filters-header {
          margin-bottom: 32px;
        }

        .filters-header h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .filters-header p {
          color: #6b7280;
          margin: 0;
        }

        .filters-controls {
          display: flex;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .search-input::placeholder {
          color: #9ca3af;
          transition: color 0.2s ease;
        }

        .search-input:focus::placeholder {
          color: rgba(201, 162, 39, 0.6);
        }

        .filter-group {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          min-width: 140px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #c9a227;
        }

        /* Properties Section */
        .properties-section {
          padding: 40px 5% 80px;
          background: #f8fafc;
        }

        .properties-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 32px;
        }

        .property-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }


        .property-image-container {
          position: relative;
          height: 240px;
          overflow: hidden;
        }

        .property-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }


        .property-badges {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          gap: 8px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .roi-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          color: white;
          box-shadow: 0 2px 8px rgba(201, 162, 39, 0.3);
        }

        .image-count {
          position: absolute;
          bottom: 16px;
          right: 16px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .property-content {
          padding: 24px;
        }

        .property-header {
          margin-bottom: 20px;
        }

        .property-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
          line-height: 1.3;
        }

        .property-location {
          color: #6b7280;
          margin: 0 0 12px;
          font-size: 0.9rem;
        }

        .property-type-risk {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .property-type {
          padding: 4px 12px;
          background: rgba(201, 162, 39, 0.08);
          color: #c9a227;
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }


        .risk-level {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .property-metrics {
          margin-bottom: 20px;
        }

        .metric-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 12px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-value {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }


        .availability-section {
          margin-bottom: 20px;
        }

        .availability-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 8px;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c9a227, #d4b13d);
          transition: width 0.3s ease;
        }

        .property-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .highlight-tag {
          padding: 6px 12px;
          background: rgba(201, 162, 39, 0.1);
          color: #c9a227;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }


        .property-basic-info {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          padding: 12px 0;
          border-top: 1px solid #f3f4f6;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #374151;
        }


        .property-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn-secondary {
          flex: 1;
          padding: 12px;
          border: 2px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: #c9a227;
          color: #c9a227;
        }

        .btn-primary {
          flex: 1;
          padding: 12px;
          background: #c9a227;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #b8922a;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .property-footer {
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .last-updated {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .no-results {
          text-align: center;
          padding: 80px 20px;
          color: #6b7280;
        }

        .no-results h3 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          color: #374151;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #6b7280;
          cursor: pointer;
          line-height: 1;
        }

        .modal-close:hover {
          color: #374151;
        }

        .modal-body {
          padding: 24px;
        }

        .investment-summary {
          margin-bottom: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .summary-row:last-child {
          margin-bottom: 0;
        }

        .roi-highlight {
          color: #059669;
          font-weight: 600;
        }

        .investment-options {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }

        .option-card {
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .option-card:hover {
          border-color: #c9a227;
          background: rgba(201, 162, 39, 0.04);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.12);
        }

        .option-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 8px;
        }

        .option-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #c9a227;
          margin: 0 0 8px;
        }

        .option-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .btn-custom-investment {
          width: 100%;
          padding: 14px;
          background: #374151;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-custom-investment:hover {
          background: #1f2937;
        }

        /* Info Section */
        .info-section {
          padding: 80px 5%;
          background: white;
        }

        .info-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .info-content h2 {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 60px;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }

        .benefit-card {
          text-align: center;
          padding: 32px 24px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .benefit-card:hover {
          box-shadow: 0 10px 30px rgba(201, 162, 39, 0.15);
          transform: translateY(-4px);
          border-color: rgba(201, 162, 39, 0.2);
        }


        .benefit-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px;
        }

        .benefit-card p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-stats {
            flex-direction: column;
            gap: 24px;
          }

          .filters-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .filter-group {
            flex-direction: column;
          }

          .filter-select {
            min-width: auto;
          }

          .properties-grid {
            grid-template-columns: 1fr;
          }

          .property-basic-info {
            flex-direction: column;
            gap: 8px;
          }

          .property-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 100px 5% 60px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .properties-section {
            padding: 40px 5% 60px;
          }

          .modal-overlay {
            padding: 10px;
          }

          .modal-header,
          .modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </>
  )
}