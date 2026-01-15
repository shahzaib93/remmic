// Mock Auction Property Data
export const mockAuctionProperty = {
  id: 'prop-004',
  title: 'Spacious Corner Plot House',
  address: '12 Model Town, Extension',
  city: 'Lahore',
  postalCode: '54000',
  country: 'Pakistan',

  // Pricing
  guidePrice: 52000000,
  startingBid: 45000000,
  currentBid: 48500000,
  reservePrice: 50000000,
  securityDeposit: 500000,

  // Property Details
  lotId: 'LT-2024-0456',
  propertyType: 'Residential House',
  tenure: 'Freehold',
  beds: 6,
  baths: 5,
  area: '1.5 Kanal',
  yearBuilt: 2019,
  parking: '3 Cars',

  // Auction Info
  auctionDate: '2024-02-15',
  biddingOpens: '2024-02-15T10:00:00',
  biddingCloses: '2024-02-15T18:00:00',
  auctionStatus: 'upcoming', // upcoming, live, ended

  // Media
  images: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80',
  ],
  hasVideo: true,
  has360Tour: true,

  // Location
  coordinates: {
    lat: 31.4826,
    lng: 74.3239,
  },

  // Summary Points
  summaryPoints: [
    'Corner plot with extra land',
    'Modern architecture with contemporary finishes',
    'Spacious living areas with high ceilings',
    '6 bedrooms including master suite',
    '5 luxury bathrooms with imported fittings',
    'Fully fitted modular kitchen',
    'Servant quarters with separate entrance',
    'Covered parking for 3 vehicles',
    '24/7 security with CCTV',
    'Backup generator included',
    'Landscaped garden with lawn',
    'Prime location near main boulevard',
  ],

  // Detailed Information
  description: `This exceptional corner plot property offers an outstanding opportunity for buyers seeking a prestigious family home in one of Lahore's most sought-after locations. The property has been meticulously maintained and features high-quality finishes throughout.

The ground floor comprises a grand entrance hall, formal reception room, spacious living room with garden views, fully fitted kitchen with breakfast area, and guest bedroom with en-suite. The first floor houses the master bedroom suite with dressing room and luxury bathroom, plus four additional bedrooms, two of which are en-suite.

External features include a beautifully landscaped garden, covered parking area, and servant quarters. The property benefits from excellent security arrangements and is located within easy reach of schools, shopping centers, and major transport links.`,

  location: 'Model Town Extension is one of Lahore\'s premier residential areas, known for its wide tree-lined avenues, excellent infrastructure, and proximity to top educational institutions and commercial centers. The area offers easy access to Ring Road and Motorway connections.',

  planning: 'The property is situated within a designated residential zone. Any future development would be subject to local planning regulations and approval from the Lahore Development Authority.',

  tenureDetails: 'Freehold property with clear title. All documentation is complete and verified. Transfer can be completed within 30 days of auction completion.',

  accommodation: `Ground Floor: Entrance hall, drawing room (25x20), living room (30x22), kitchen (20x15), guest bedroom with en-suite, utility room.

First Floor: Master bedroom (22x18) with dressing room and en-suite, 4 additional bedrooms (average 18x15), 2 shared bathrooms.

External: Covered parking, servant quarters (2 rooms with bathroom), garden store, generator room.`,

  vat: 'The sale of this property is not subject to VAT. Standard property transfer taxes will apply as per government regulations.',

  additionalInfo: 'The property is being sold with all fixtures and fittings as viewed. Furniture and appliances can be negotiated separately. The seller is motivated and seeking a quick completion.',

  epcRating: 'B',
  councilTaxBand: 'Category A (Lahore Metropolitan)',

  // Agent Info
  agent: {
    name: 'Ahmed Khan',
    role: 'Senior Property Consultant',
    email: 'ahmed.khan@remmic.pk',
    phone: '+92 321 1234567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
  },

  legalContact: {
    name: 'Legal Department',
    email: 'legal@remmic.pk',
    phone: '+92 42 35761234',
  },

  conveyancing: {
    team: 'REMMIC Conveyancing Services',
    contact: 'conveyancing@remmic.pk',
    phone: '+92 42 35761235',
  },

  // Downloads
  documents: [
    { name: 'Legal Pack', type: 'legal', url: '#' },
    { name: 'Property Brochure', type: 'brochure', url: '#' },
    { name: 'Floor Plans', type: 'floorplan', url: '#' },
    { name: 'Title Documents', type: 'title', url: '#' },
    { name: 'Survey Report', type: 'survey', url: '#' },
  ],
}

// Format price in PKR
export const formatPricePKR = (price) => {
  if (price >= 10000000) {
    return `PKR ${(price / 10000000).toFixed(2)} Crore`
  }
  if (price >= 100000) {
    return `PKR ${(price / 100000).toFixed(0)} Lac`
  }
  return `PKR ${price.toLocaleString()}`
}

// Get property by ID
export const getAuctionPropertyById = (id) => {
  // In real app, this would fetch from API
  if (id === mockAuctionProperty.id || id === 'prop-004') {
    return mockAuctionProperty
  }
  // Return mock for any ID for demo purposes
  return { ...mockAuctionProperty, id }
}
