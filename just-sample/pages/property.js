import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import PropertyMap from '../components/PropertyMap';
import { useFirebase } from '../contexts/FirebaseContext';
import { ensurePropertyImage } from '../utils/propertyStorage';

export default function Property() {
  const router = useRouter();
  const { getAllProperties } = useFirebase();
  const [isClient, setIsClient] = useState(false);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);

  const RUPEES_PER_CRORE = 10000000;

  const toRupees = (value) => {
    if (value == null) return null;

    if (typeof value === 'number') {
      if (value >= RUPEES_PER_CRORE) {
        return value;
      }
      return value * RUPEES_PER_CRORE;
    }

    const text = String(value).toLowerCase();
    const numeric = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) {
      return null;
    }

    if (text.includes('lakh') || text.includes('lac')) {
      return numeric * 100000;
    }
    if (text.includes('crore')) {
      return numeric * RUPEES_PER_CRORE;
    }
    if (text.includes('million')) {
      return numeric * 1000000;
    }
    if (text.includes('thousand')) {
      return numeric * 1000;
    }

    if (numeric >= 1000000) {
      return numeric;
    }

    return numeric * RUPEES_PER_CRORE;
  };

  const formatRupees = (value) => {
    if (value == null || Number.isNaN(value)) return 'PKR —';
    return `PKR ${Math.round(value).toLocaleString()}`;
  };

const formatPriceDisplay = (property) => {
  if (!property) return 'PKR —';

  if (property.type === 'rental') {
    const rupees = toRupees(property.price);
      if (!rupees) return 'PKR —';
      return `${formatRupees(rupees)}/month`;
    }

    const rupeesFromPrice = toRupees(property.price);
    if (rupeesFromPrice) {
      return formatRupees(rupeesFromPrice);
    }

    if (property.priceNumeric != null) {
      const numeric = property.priceNumeric;
      const rupees = numeric >= 1000000 ? numeric : numeric * RUPEES_PER_CRORE;
      return formatRupees(rupees);
    }

  return 'PKR —';
};

const formatPropertyTypeLabel = (type) => {
  const value = (type || '').toLowerCase();
  switch (value) {
    case 'bidding':
      return 'Bidding';
    case 'auction':
      return 'Bidding';
    case 'rental':
      return 'Rental';
    case 'investment':
      return 'Investment';
    case 'commercial':
      return 'Commercial';
    case 'residential':
      return 'Residential';
    default:
      return 'Property';
  }
};

const getTypeBadgePresentation = (type) => {
  const normalized = (type || '').toLowerCase();

  switch (normalized) {
    case 'bidding':
    case 'auction':
      return {
        label: 'Bidding',
        background: 'rgba(239, 68, 68, 0.9)',
        color: '#ffffff'
      };
    case 'rental':
      return {
        label: 'Rental',
        background: 'rgba(16, 185, 129, 0.9)',
        color: '#ffffff'
      };
    case 'investment':
      return {
        label: 'Investment',
        background: 'rgba(255, 94, 1, 0.92)',
        color: '#ffffff'
      };
    case 'commercial':
      return {
        label: 'Commercial',
        background: 'rgba(14, 116, 144, 0.9)',
        color: '#ffffff'
      };
    case 'residential':
      return {
        label: 'Residential',
        background: 'rgba(37, 99, 235, 0.85)',
        color: '#ffffff'
      };
    default:
      return {
        label: formatPropertyTypeLabel(type),
        background: 'rgba(15, 23, 42, 0.85)',
        color: '#ffffff'
      };
  }
};

  // No mock properties - only show admin approved properties

  // Function to determine the appropriate route based on property type
  const getPropertyRoute = (property) => {
    switch (property.type) {
      case 'bidding':
        return `/bidding-detail?id=${property.id}`;
      case 'rental':
        return `/rental-detail?id=${property.id}`;
      case 'investment':
        return `/investment-shares?id=${property.id}`;
      default:
        return `/property-detail?id=${property.id}`;
    }
  };

  useEffect(() => {
    setIsClient(true);
    
    // Load properties from Firebase
    const loadPropertiesFromFirebase = async () => {
      try {
        setLoading(true);
        const result = await getAllProperties();
        const firebaseProperties = result?.success ? result.properties || [] : [];
        console.log('Loading properties from Firebase:', firebaseProperties.length)

        const nonRejectedProperties = firebaseProperties.filter((property) => {
          const status = (property.statusCode || property.status || '').toLowerCase()
          return status !== 'rejected'
        })

        const processedProperties = nonRejectedProperties.map((property) => {
          const priceLabel = formatPriceDisplay(property)

          const statusCode = (property.statusCode || property.status || '').toLowerCase()

          const status = (() => {
            if (property.source === 'land-registration') {
              return property.type === 'bidding' ? 'Live Auction' : 'Pending Verification'
            }
            if (property.type === 'rental') {
              return property.status === 'vacant' ? 'Available' : (property.status || 'Rented')
            }
            if (property.type === 'investment') {
              return property.status || 'Open for Investment'
            }
            if (property.type === 'bidding') {
              return property.status || 'Live Auction'
            }
            if (statusCode === 'evaluated') {
              return 'Evaluated'
            }
            return property.status || 'Active'
          })()

          const propertyImage = ensurePropertyImage(property)
          console.log('Property image resolved for', property.title, ':', propertyImage)
          
          const typePresentation = getTypeBadgePresentation(property.type || property.category);

          return {
            id: property.id,
            title: property.title || 'Property Listing',
            description: property.description || 'Property details will be shared soon.',
            image: propertyImage,
            area: property.areaSize || property.area || 'Area not specified',
            location: property.address || property.location || 'Location not specified',
            price: priceLabel,
            type: property.type || 'general',
            typeLabel: typePresentation.label,
            typeBadgeBackground: typePresentation.background,
            typeBadgeColor: typePresentation.color,
            status,
            statusCode,
            category: property.landType || property.landtype
              ? ((property.landType || property.landtype).toLowerCase().includes('commercial') ? 'Commercial' : 'Residential')
              : property.category || (property.bedrooms ? 'Residential' : 'Commercial'),
            source: property.source || 'dashboard'
          }
        })

        // Final deduplication to ensure no duplicates in the display
        const uniqueApprovedProperties = processedProperties.filter((property, index, array) => {
          return array.findIndex(p => p.id === property.id) === index
        })
        
        // Ensure all properties have valid images
        const propertiesWithImages = uniqueApprovedProperties.map(property => {
          if (!property.image || property.image.trim() === '') {
            console.warn('Property missing image, applying fallback:', property.title)
            return {
              ...property,
              image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80'
            }
          }
          return property
        })
        
        console.log('Final unique approved properties with images:', propertiesWithImages.length)
        setProperties(propertiesWithImages);
        setFilteredProperties(propertiesWithImages);
      } catch (error) {
        console.error('Error loading properties from Firebase:', error)
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    }

    loadPropertiesFromFirebase();
    
    // Listen for storage changes (when properties are added from other pages)
    const handleStorageChange = (e) => {
      if (e.key === 'userProperties') {
        loadPropertiesFromFirebase();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from same page
    window.addEventListener('propertyAdded', loadPropertiesFromFirebase);
    
    
    // Load WebFont script
    if (typeof window !== 'undefined' && window.WebFont) {
      window.WebFont.load({ 
        google: { 
          families: ["Manrope:300,regular,500,600,700,800"] 
        }
      });
    }
    
    // Search and filter functions
    const handleSearch = (e) => {
      e.preventDefault();
      filterAndSortProperties(searchQuery, sortBy);
    };

    const filterAndSortProperties = (query, sort) => {
      let filtered = [...properties];

      // Apply search filter
      if (query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        filtered = filtered.filter(property => 
          property.title.toLowerCase().includes(searchTerm) ||
          property.location.toLowerCase().includes(searchTerm) ||
          property.description.toLowerCase().includes(searchTerm) ||
          property.category.toLowerCase().includes(searchTerm) ||
          property.type.toLowerCase().includes(searchTerm)
        );
      }

      // Apply sorting
      if (sort) {
        switch (sort) {
          case 'price-low-high':
            filtered.sort((a, b) => {
              const priceA = extractNumericPrice(a.price);
              const priceB = extractNumericPrice(b.price);
              return priceA - priceB;
            });
            break;
          case 'price-high-low':
            filtered.sort((a, b) => {
              const priceA = extractNumericPrice(a.price);
              const priceB = extractNumericPrice(b.price);
              return priceB - priceA;
            });
            break;
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            break;
          case 'oldest':
            filtered.sort((a, b) => new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now()));
            break;
          default:
            break;
        }
      }

      setFilteredProperties(filtered);
    };

    const extractNumericPrice = (priceString) => {
      if (!priceString) return 0;
      const numericValue = priceString.replace(/[^0-9]/g, '');
      return parseInt(numericValue) || 0;
    };

    const handleSearchInputChange = (e) => {
      setSearchQuery(e.target.value);
      filterAndSortProperties(e.target.value, sortBy);
    };

    const handleSortChange = (e) => {
      setSortBy(e.target.value);
      filterAndSortProperties(searchQuery, e.target.value);
    };

    // Store functions in window for access in JSX
    window.handleSearch = handleSearch;
    window.handleSearchInputChange = handleSearchInputChange;
    window.handleSortChange = handleSortChange;
    window.searchQuery = searchQuery;
    window.sortBy = sortBy;
    window.filteredProperties = filteredProperties;
    window.properties = properties;
    window.setSearchQuery = setSearchQuery;
    window.setSortBy = setSortBy;
    window.setFilteredProperties = setFilteredProperties;

    // Cleanup event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('propertyAdded', loadPropertiesFromFirebase);
    };
  }, [getAllProperties]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Property - REMMIC</title>
        <meta content="Property - REMMIC" property="og:title" />
        <meta content="Property - REMMIC" property="twitter:title" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style dangerouslySetInnerHTML={{
          __html: `
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
          `
        }} />
      </Head>

      <div className="page-wrapper">
        
        <Navbar />

        {/* Feature Section */}
        <section data-wf-feature-variant="base" className="section-feature">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div data-w-id="a6792325-465d-c3c7-29b9-8e788dd4558e" className="feature-component">
                  <div className="feature-top-content-wrapper">
                    <div className="section-tag">
                      <div>Feature</div>
                    </div>
                    <h2 
                      className="heading-style-h2" 
                      style={{
                        textAlign: 'center', 
                        fontSize: '2.8rem', 
                        lineHeight: '1.3', 
                        fontWeight: 'bold', 
                        margin: '0 auto'
                      }}
                    >
                      Trusted projects, smarter research, faster investments.
                    </h2>
                  </div>
                  <div className="padding-bottom padding-large"></div>
                  
                  {/* Loading State */}
                  {loading && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      margin: '40px 0'
                    }}>
                      <h3 style={{fontSize: '1.5rem', color: '#6b7280', marginBottom: '10px'}}>Loading Properties...</h3>
                      <p style={{color: '#9ca3af'}}>Please wait while we fetch the latest properties from our database.</p>
                    </div>
                  )}
                  
                  {/* No Results Message */}
                  {!loading && filteredProperties.length === 0 && properties.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      background: '#f9fafb',
                      borderRadius: '16px',
                      border: '2px dashed #d1d5db',
                      margin: '40px 0'
                    }}>
                      <h3 style={{fontSize: '1.5rem', color: '#6b7280', marginBottom: '10px'}}>No Properties Available</h3>
                      <p style={{color: '#9ca3af', marginBottom: '20px'}}>No properties have been uploaded yet. Check back later for new listings.</p>
                    </div>
                  )}
                  
                  {/* No Search Results */}
                  {!loading && filteredProperties.length === 0 && properties.length > 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      background: '#f9fafb',
                      borderRadius: '16px',
                      border: '2px dashed #d1d5db',
                      margin: '40px 0'
                    }}>
                      <h3 style={{fontSize: '1.5rem', color: '#6b7280', marginBottom: '10px'}}>No Properties Found</h3>
                      <p style={{color: '#9ca3af', marginBottom: '20px'}}>No properties match your search criteria. Try adjusting your search terms.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSortBy('');
                          setFilteredProperties(properties);
                        }}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #ff5e01 0%, #ff8732 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          boxShadow: '0 15px 35px -12px rgba(255, 94, 1, 0.6)'
                        }}
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                  
                  {/* Dynamic Property Cards */}
                  {filteredProperties.map((property, index) => {
                    const cardClass = index === 0 ? 'second-card' : 
                                    index === 1 ? 'second-card' : 
                                    index === 2 ? 'third' : 'fourth';
                    const wrapperClass = index === 0 ? 'second' : 
                                       index === 1 ? 'second' : 
                                       index === 2 ? 'third' : 'third';
                    
                    return (
                      <div
                        key={property.id}
                        className={`feature-bottom-card ${cardClass}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push(getPropertyRoute(property))}
                      >
                        <div
                          className={`feature-bottom-image-wrapper ${wrapperClass}`}
                          style={{ position: 'relative' }}
                          onMouseEnter={(event) => {
                            const link = event.currentTarget.querySelector('a')
                            if (link) link.style.opacity = '1'
                          }}
                          onMouseLeave={(event) => {
                            const link = event.currentTarget.querySelector('a')
                            if (link) link.style.opacity = '0'
                          }}
                        >
                          <img
                            src={property.image}
                            loading="lazy"
                            alt={property.title}
                            className="feature-bottom-image"
                            style={{ width: '100%', display: 'block' }}
                            onError={(e) => {
                              console.log('Image failed to load:', property.image, 'for property:', property.title)
                              // Enhanced fallback with multiple attempts
                              if (!e.target.hasAttribute('data-fallback-1')) {
                                e.target.setAttribute('data-fallback-1', 'true')
                                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80'
                              } else if (!e.target.hasAttribute('data-fallback-2')) {
                                e.target.setAttribute('data-fallback-2', 'true')
                                e.target.src = '/images/property-placeholder.svg'
                              } else {
                                // Final fallback: data URL placeholder
                                e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                                  <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100%" height="100%" fill="#f3f4f6"/>
                                    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">Property Image</text>
                                  </svg>
                                `)
                              }
                            }}
                          />
                          
                          {/* Property Status Badge */}
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            padding: '4px 8px',
                            background: property.statusCode === 'approved' ? 'rgba(255, 94, 1, 0.9)' :
                                        property.statusCode === 'evaluated' ? 'rgba(16, 185, 129, 0.9)' :
                                        property.status?.toLowerCase().includes('rented') ? 'rgba(15, 23, 42, 0.85)' :
                                        property.type === 'bidding' ? 'rgba(239, 68, 68, 0.9)' :
                                        property.type === 'rental' ? 'rgba(16, 185, 129, 0.9)' :
                                        'rgba(15, 23, 42, 0.85)',
                            color: '#ffffff',
                            fontSize: '12px',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            {property.status}
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '4px 8px',
                            background: property.typeBadgeBackground,
                            color: property.typeBadgeColor,
                            fontSize: '12px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase'
                          }}>
                            {property.typeLabel}
                          </div>

                          <a 
                            href={getPropertyRoute(property)}
                            onClick={(event) => event.stopPropagation()}
                            style={{
                              position: 'absolute', 
                              bottom: '15px', 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              padding: '8px 18px', 
                              background: '#000', 
                              color: '#fff', 
                              fontSize: '14px',
                              borderRadius: '5px', 
                              textDecoration: 'none', 
                              opacity: '0',
                              transition: 'opacity 0.3s ease', 
                              zIndex: '10'
                            }}
                            onMouseOver={(e) => e.target.style.opacity = '1'}
                            onMouseOut={(e) => e.target.style.opacity = '0'}
                          >
                            View More
                          </a>
                        </div>
                        <div className="feature-bottom-content">
                          <h5 className="heading-style-h5">{property.title}</h5>
                          <div className="text-size-regular">
                            {property.location}<br/>
                            {property.area}<br/>
                            {property.description}
                          </div>
                          <div style={{marginTop: '10px', fontSize: '16px', fontWeight: '600', color: '#0f172a'}}>
                            {property.price}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="section-search-bar" style={{padding: '40px 0', background: '#fff'}}>
          <div className="padding-global">
            <div className="container-large">
              <form 
                className="project-search-form" 
                onSubmit={(e) => {
                  e.preventDefault();
                  const query = e.target.querySelector('input').value;
                  const sort = e.target.querySelector('select').value;
                  
                  let filtered = [...properties];
                  
                  if (query.trim()) {
                    const searchTerm = query.toLowerCase().trim();
                    filtered = filtered.filter(property => 
                      property.title.toLowerCase().includes(searchTerm) ||
                      property.location.toLowerCase().includes(searchTerm) ||
                      property.description.toLowerCase().includes(searchTerm) ||
                      property.category.toLowerCase().includes(searchTerm) ||
                      property.type.toLowerCase().includes(searchTerm)
                    );
                  }
                  
                  if (sort) {
                    switch (sort) {
                      case 'price-low-high':
                        filtered.sort((a, b) => {
                          const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                          const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                          return priceA - priceB;
                        });
                        break;
                      case 'price-high-low':
                        filtered.sort((a, b) => {
                          const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                          const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                          return priceB - priceA;
                        });
                        break;
                      case 'newest':
                        filtered.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
                        break;
                      case 'oldest':
                        filtered.sort((a, b) => new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now()));
                        break;
                    }
                  }
                  
                  setFilteredProperties(filtered);
                  setSearchQuery(query);
                  setSortBy(sort);
                }}
                style={{
                  display: 'flex', 
                  gap: '15px', 
                  width: '100%', 
                  maxWidth: '1000px', 
                  margin: '0 auto'
                }}
              >
                <input 
                  type="text" 
                  placeholder="Search city, area, or project..." 
                  className="footer-input w-input" 
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    
                    let filtered = [...properties];
                    if (value.trim()) {
                      const searchTerm = value.toLowerCase().trim();
                      filtered = filtered.filter(property => 
                        property.title.toLowerCase().includes(searchTerm) ||
                        property.location.toLowerCase().includes(searchTerm) ||
                        property.description.toLowerCase().includes(searchTerm) ||
                        property.category.toLowerCase().includes(searchTerm) ||
                        property.type.toLowerCase().includes(searchTerm)
                      );
                    }
                    setFilteredProperties(filtered);
                  }}
                  style={{flex: '1', padding: '15px', fontSize: '16px'}} 
                />

                <select 
                  className="footer-input w-input" 
                  value={sortBy}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSortBy(value);
                    
                    let filtered = [...filteredProperties];
                    if (value) {
                      switch (value) {
                        case 'price-low-high':
                          filtered.sort((a, b) => {
                            const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                            const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                            return priceA - priceB;
                          });
                          break;
                        case 'price-high-low':
                          filtered.sort((a, b) => {
                            const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                            const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                            return priceB - priceA;
                          });
                          break;
                        case 'newest':
                          filtered.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
                          break;
                        case 'oldest':
                          filtered.sort((a, b) => new Date(a.createdAt || Date.now()) - new Date(b.createdAt || Date.now()));
                          break;
                      }
                      setFilteredProperties(filtered);
                    }
                  }}
                  style={{padding: '15px', fontSize: '16px'}}
                >
                  <option value="">Sort by</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>

                <button 
                  type="submit" 
                  className="button w-button" 
                  style={{padding: '15px 40px', fontSize: '16px'}}
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </section>


        {/* Services Section */}
        <section data-w-id="3616b13b-cf18-9839-3e56-d339fa6c63fd" className="section-process">
          <div className="page-lode">
            <div className="process-component">
              <div className="process-top-content">
                <div className="process-head-line">
                  <div>Quick Links</div>
                </div>
                <h2 className="heading-style-h2">Explore Our Services</h2>
              </div>
              <div className="process-bottom-content">
                <div className="process-card-list-wrapper">
                  
                  {/* Service 1 - Browse Properties */}
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
                      <img 
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=535&h=400&fit=crop&crop=center&auto=format&q=80" 
                        loading="lazy" 
                        sizes="(max-width: 535px) 100vw, 535px" 
                        alt="Browse Properties" 
                        className="process-card-image"
                      />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Browse Properties</h6>
                        <div className="text-size-regular">
                          Explore our curated collection of premium properties with detailed listings and virtual tours.
                        </div>
                        <a href="/property" className="button is-secondary w-inline-block" style={{marginTop: "20px"}}>
                          <div>Browse Properties</div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Service 2 - Investment Shares */}
                  <div id="w-node-d9d084c9-b42a-7895-03fb-e8397585a944-039500ab" className="process-card-wrapper">
                    <div className="process-card second">
                      <img 
                        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=535&h=400&fit=crop&crop=center&auto=format&q=80" 
                        loading="lazy" 
                        sizes="(max-width: 535px) 100vw, 535px" 
                        alt="Investment Shares" 
                        className="process-card-image"
                      />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Investment Shares</h6>
                        <div className="text-size-regular">
                          Fractional ownership opportunities with detailed ROI analysis and transparent returns.
                        </div>
                        <a href="/investment-shares" className="button is-secondary w-inline-block" style={{marginTop: "20px"}}>
                          <div>Investment Shares</div>
                        </a>
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

                  {/* Service 3 - Rental Management */}
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
                      <img 
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=535&h=400&fit=crop&crop=center&auto=format&q=80" 
                        loading="lazy" 
                        sizes="(max-width: 535px) 100vw, 535px" 
                        alt="Rental Management" 
                        className="process-card-image"
                      />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Rental Management</h6>
                        <div className="text-size-regular">
                          Comprehensive property rental and tenant management with automated workflows.
                        </div>
                        <a href="/rental" className="button is-secondary w-inline-block" style={{marginTop: "20px"}}>
                          <div>Rental Management</div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Service 4 - Live Auctions */}
                  <div id="w-node-d9d084c9-b42a-7895-03fb-e8397585a946-039500ab" className="process-card-wrapper">
                    <div className="process-card second">
                      <img 
                        src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=535&h=400&fit=crop&crop=center&auto=format&q=80" 
                        loading="lazy" 
                        sizes="(max-width: 535px) 100vw, 535px" 
                        alt="Live Auctions" 
                        className="process-card-image"
                      />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Live Auctions</h6>
                        <div className="text-size-regular">
                          Real-time property auctions with transparent bidding and competitive pricing.
                        </div>
                        <a href="/bidding" className="button is-secondary w-inline-block" style={{marginTop: "20px"}}>
                          <div>Live Auctions</div>
                        </a>
                      </div>
                    </div>
                    <div className="process-line-wrapper">
                      <div className="process-number second">
                        <h6 data-w-id="5eb120f0-efaa-46ad-0feb-57dfdfbeecb1" className="heading-style-h6">04</h6>
                      </div>
                      <div className="process-line">
                        <div data-w-id="de6dbf9d-e5da-69a1-d249-8afdd7a5ef1b" className="process-second-hover-line"></div>
                      </div>
                    </div>
                  </div>

                  {/* Service 5 - Property Evaluation */}
                  <div className="process-card-wrapper">
                    <div className="process-line-wrapper">
                      <div className="process-number third">
                        <h6 data-w-id="2720b254-e069-03e4-1e51-b5d0af0ac48d" className="heading-style-h6">05</h6>
                      </div>
                      <div className="process-line">
                        <div className="process-third-hover-line"></div>
                      </div>
                    </div>
                    <div id="w-node-fefd2574-931d-8619-5c53-556169d80ae7-039500ab" className="process-card third">
                      <img 
                        src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=535&h=400&fit=crop&crop=center&auto=format&q=80" 
                        loading="lazy" 
                        sizes="(max-width: 535px) 100vw, 535px" 
                        alt="Property Evaluation" 
                        className="process-card-image"
                      />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Property Evaluation</h6>
                        <div className="text-size-regular">
                          AI-powered property valuations and comprehensive market analysis reports.
                        </div>
                        <a href="/evaluation" className="button is-secondary w-inline-block" style={{marginTop: "20px"}}>
                          <div>Property Evaluation</div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Service 6 - Register Property */}
                  <div id="w-node-d9d084c9-b42a-7895-03fb-e8397585a947-039500ab" className="process-card-wrapper">
                    <div className="process-card second">
                      <img 
                        src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=535&h=400&fit=crop&crop=center&auto=format&q=80" 
                        loading="lazy" 
                        sizes="(max-width: 535px) 100vw, 535px" 
                        alt="Register Property" 
                        className="process-card-image"
                      />
                      <div className="process-card-content">
                        <h6 className="heading-style-h6">Register Property</h6>
                        <div className="text-size-regular">
                          List your property for auction or sale with our streamlined registration process.
                        </div>
                        <a href="/land-registration" className="button is-secondary w-inline-block" style={{marginTop: "20px"}}>
                          <div>Register Property</div>
                        </a>
                      </div>
                    </div>
                    <div className="process-line-wrapper">
                      <div className="process-number second">
                        <h6 data-w-id="5eb120f0-efaa-46ad-0feb-57dfdfbeecb2" className="heading-style-h6">06</h6>
                      </div>
                      <div className="process-line">
                        <div data-w-id="de6dbf9d-e5da-69a1-d249-8afdd7a5ef1c" className="process-second-hover-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-cta">
          <div className="padding-global">
            <div className="container-large">
              <div className="padding-section-medium">
                <div data-w-id="03b4adc1-f918-bae5-37d1-18bef1a11870" className="cta-component">
                  <div className="cta-content">
                    <h2 className="heading-style-h2">Your Property, Just a Click Away.</h2>
                    <div className="cta-button-wrapper">
                      <a href="/contact" className="button is-secondary w-inline-block">
                        <div className="button-text">investors</div>
                      </a>
                      <a href="#" className="button w-inline-block">
                        <div className="button-text">landowner</div>
                      </a>
                    </div>
                  </div>
                  <div className="cta-image-wrapper">
                    <img 
                      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=802&auto=format&fit=crop&q=80" 
                      loading="lazy" 
                      sizes="(max-width: 802px) 100vw, 802px" 
                      srcSet="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&auto=format&fit=crop&q=80 500w, https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80 800w, https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=802&auto=format&fit=crop&q=80 802w" 
                      alt="House" 
                      className="cta-image"
                      onError={(e) => {
                        console.log('CTA image failed to load')
                        e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="802" height="600" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#f3f4f6"/>
                            <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#6b7280" text-anchor="middle" dy=".3em">Property Image</text>
                          </svg>
                        `)
                      }}
                    />
                  </div>
                  <div className="cta-glass-image-wrapper">
                    <img 
                      src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68a33e286e2e1212a5ec3dd9_glass.png" 
                      loading="lazy" 
                      alt="" 
                      className="cta-glass-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="section-footer">
          <div className="padding-global">
            <div className="container-large">
              <div className="footer-component">
                <div className="footer-top-content">
                  <div className="footer-form-block w-form">
                    <form 
                      id="email-form" 
                      name="email-form" 
                      data-name="Email Form" 
                      method="get" 
                      className="footer-form" 
                      data-wf-page-id="68a06250db2face4039500ab" 
                      data-wf-element-id="c3ca6c12-0952-b2a9-8a02-ea3290ce594a"
                    >
                      <input 
                        className="footer-input w-input" 
                        maxLength="256" 
                        name="email" 
                        data-name="Email" 
                        placeholder="Enter your email" 
                        type="email" 
                        id="email" 
                        required 
                      />
                      <div className="footer-submit-button">
                        <input 
                          type="submit" 
                          data-wait="Please wait..." 
                          className="button is-footer w-button" 
                          value="Submit"
                        />
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
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac246154f611ea1420a7c4_instagram.svg" 
                        loading="lazy" 
                        alt="instagram" 
                        className="social-link"
                      />
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461db48f9856f9b7dc5_instagram%2002.svg" 
                        loading="lazy" 
                        alt="instagram" 
                        className="hover-social-link"
                      />
                    </a>
                    <a href="https://x.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2462f03cccc6637bd306_twitter.svg" 
                        loading="lazy" 
                        alt="X" 
                        className="social-link"
                      />
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24611de591518864682a_twitter%2002.svg" 
                        loading="lazy" 
                        alt="X" 
                        className="hover-social-link"
                      />
                    </a>
                    <a href="https://linkedin.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461ba0482ed367c032e_linkedin.svg" 
                        loading="lazy" 
                        alt="linkdin" 
                        className="social-link"
                      />
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461471a6191f7cb01da_linkedin%2002.svg" 
                        loading="lazy" 
                        alt="Linkdine" 
                        className="hover-social-link"
                      />
                    </a>
                    <a href="https://www.facebook.com/" target="_blank" className="footer-social-link-circle w-inline-block">
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24610096cecff568c101_facebook.svg" 
                        loading="lazy" 
                        alt="facebook" 
                        className="social-link"
                      />
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac24615c48e8d43a920438_facebook%2002.svg" 
                        loading="lazy" 
                        alt="Facebook " 
                        className="hover-social-link"
                      />
                    </a>
                  </div>
                </div>
                
                <div className="footer-card">
                  <div className="text-size-regular">Company</div>
                  <div className="footer-link-list">
                    <a href="/" aria-current="page" className="text-size-regular w--current">Home</a>
                    <a href="/about" className="text-size-regular">About</a>
                    <a href="/contact" className="text-size-regular">Contact</a>
                    <a href="/blog" className="text-size-regular">Blog</a>
                  </div>
                </div>
                
                <div className="footer-card-list">
                  <div className="footer-card">
                    <div className="text-size-regular">Inner page</div>
                    <div className="footer-bottom-link-list">
                      <a href="/feature" className="footer-text">Feature</a>
                      <a href="/team" className="footer-text">Team</a>
                      <a href="/price" className="footer-text">Price</a>
                      <a href="/privacy-policy" className="footer-text">Privacy Policy</a>
                      <a href="/terms-and-conditions" className="footer-text">Terms &amp; Conditions</a>
                    </div>
                  </div>
                  
                  <div className="footer-card second">
                    <div className="text-size-regular">Authentication</div>
                    <div className="footer-bottom-link-list">
                      <a href="#" className="footer-text">Login</a>
                      <a href="#" className="footer-text">Sign up</a>
                      <a href="#" className="footer-text">Forgot</a>
                      <a href="#" className="footer-text">Confirm email</a>
                    </div>
                  </div>
                  
                  <div className="footer-card">
                    <div className="text-size-regular">Utility pages</div>
                    <div className="footer-bottom-link-list">
                      <a href="/style-guide" className="footer-text">Style Guide</a>
                      <a href="/change-log" className="footer-text">Change log</a>
                      <a href="/licenses" className="footer-text">Licenses</a>
                      <a href="/protected" className="footer-text">Protected</a>
                    </div>
                  </div>
                </div>
                
                <div className="footer-botom-content">
                  <div className="website-link-wrapper">
                    <div className="text-size-small tex-color-black-700">Designed by</div>
                    <a href="https://webocean.io/" target="_blank" className="website-link w-inline-block">
                      <img 
                        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/68ac2461cdc0f95afcb65f44_webocan%20Logo.svg" 
                        loading="lazy" 
                        alt="webocean" 
                        className="website-logo"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Webflow Scripts */}
      <script 
        src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68a06250db2face4039500cc" 
        type="text/javascript" 
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" 
        crossOrigin="anonymous"
      />
      <script 
        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/js/webflow.schunk.36b8fb49256177c8.js" 
        type="text/javascript"
      />
      <script 
        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/js/webflow.schunk.82f44582d86d1ea9.js" 
        type="text/javascript"
      />
      <script 
        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/js/webflow.schunk.5f01b945a8ce2cbb.js" 
        type="text/javascript"
      />
      <script 
        src="https://cdn.prod.website-files.com/68a06250db2face4039500cc/js/webflow.fe8b6fb3.7a24e3ec66a2b3b8.js" 
        type="text/javascript"
      />
    </>
  );
}
