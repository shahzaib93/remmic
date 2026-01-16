import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

  const propertyServices = [
    {
      title: 'Browse Properties',
      description: 'Explore curated listings with valuation insights, amenities, and immersive media.',
      cta: 'Browse marketplace',
      href: '/property',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=535&h=400&fit=crop&crop=center&auto=format&q=80'
    },
    {
      title: 'Investment Shares',
      description: 'Fractionalize trophy assets, automate payouts, and monitor investor allocations.',
      cta: 'View live offerings',
      href: '/investment-shares',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=535&h=400&fit=crop&crop=center&auto=format&q=80'
    },
    {
      title: 'Rental Management',
      description: 'Screen tenants, trigger digital leases, and reconcile rent with automated alerts.',
      cta: 'Manage rentals',
      href: '/rental',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=535&h=400&fit=crop&crop=center&auto=format&q=80'
    },
    {
      title: 'Live Auctions',
      description: 'Host transparent bidding rounds with compliance workflows baked in.',
      cta: 'Launch auction',
      href: '/bidding',
      image: 'https://images.unsplash.com/photo-1529429617124-aee711a70412?w=535&h=400&fit=crop&crop=center&auto=format&q=80'
    },
    {
      title: 'Property Evaluation',
      description: 'AI-assisted evaluations and legal verification packs for institutional investors.',
      cta: 'Schedule evaluation',
      href: '/evaluation',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=535&h=400&fit=crop&crop=center&auto=format&q=80'
    },
    {
      title: 'Register Property',
      description: 'Onboard new assets, digitize compliance trails, and unlock liquidity faster.',
      cta: 'Register asset',
      href: '/land-registration',
      image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=535&h=400&fit=crop&crop=center&auto=format&q=80'
    }
  ];

  const ctaLinks = [
    { label: 'For Investors', href: '/contact' },
    { label: 'For Landowners', href: '/land-registration' }
  ];

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
      </Head>

      <div className="page-wrapper">
        
        <Navbar />

        {/* Feature Section */}
        <section className="property-marketplace">
          <div className="property-marketplace__intro">
            <span className="eyebrow">Marketplace</span>
            <h1>Trusted projects, smarter research, faster investments.</h1>
            <p>
              Every asset passes REMMIC evaluation, legal, and monitoring standards before it reaches investors. Track performance,
              diligence assets, and move from discovery to transaction inside a single workspace.
            </p>
          </div>

          {loading && (
            <div className="property-state">
              <h3>Loading properties…</h3>
              <p>Please hold on while we fetch the latest verified opportunities.</p>
            </div>
          )}

          {!loading && filteredProperties.length === 0 && properties.length === 0 && (
            <div className="property-state">
              <h3>No properties available</h3>
              <p>We're onboarding new assets. Check back shortly for fresh drops.</p>
            </div>
          )}

          {!loading && filteredProperties.length === 0 && properties.length > 0 && (
            <div className="property-state">
              <h3>No matches for your filters</h3>
              <p>Adjust your keywords or sorting to explore other opportunities.</p>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('');
                  setFilteredProperties(properties);
                }}
              >
                Clear search
              </button>
            </div>
          )}

          <div className="property-grid">
            {filteredProperties.map((property) => (
              <article
                key={property.id}
                className="property-card"
                onClick={() => router.push(getPropertyRoute(property))}
              >
                <div className="property-card__media">
                  <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    onError={(e) => {
                      if (!e.target.hasAttribute('data-fallback-1')) {
                        e.target.setAttribute('data-fallback-1', 'true')
                        e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80'
                      } else if (!e.target.hasAttribute('data-fallback-2')) {
                        e.target.setAttribute('data-fallback-2', 'true')
                        e.target.src = '/images/property-placeholder.svg'
                      } else {
                        e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                          <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                            <rect width="100%" height="100%" fill="#f3f4f6"/>
                            <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">Property Image</text>
                          </svg>
                        `)
                      }
                    }}
                  />
                  <span className="property-card__badge property-card__badge--status" style={{
                    background: property.statusCode === 'approved' ? 'rgba(255, 94, 1, 0.9)' :
                                property.statusCode === 'evaluated' ? 'rgba(16, 185, 129, 0.9)' :
                                property.status?.toLowerCase().includes('rented') ? 'rgba(15, 23, 42, 0.85)' :
                                property.type === 'bidding' ? 'rgba(239, 68, 68, 0.9)' :
                                property.type === 'rental' ? 'rgba(16, 185, 129, 0.9)' :
                                'rgba(15, 23, 42, 0.85)'
                  }}>
                    {property.status}
                  </span>
                  <span className="property-card__badge property-card__badge--type" style={{
                    background: property.typeBadgeBackground,
                    color: property.typeBadgeColor
                  }}>
                    {property.typeLabel}
                  </span>
                  <span className="property-card__cta">View details</span>
                </div>
                <div className="property-card__body">
                  <h3>{property.title}</h3>
                  <p className="property-card__meta">{property.location} · {property.area}</p>
                  <p className="property-card__description">{property.description}</p>
                  <div className="property-card__footer">
                    <div>
                      <span className="property-card__price">{property.price}</span>
                      <span className="property-card__status">{property.source === 'land-registration' ? 'Verified land record' : 'Dashboard listing'}</span>
                    </div>
                    <button
                      className="btn btn--ghost"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(getPropertyRoute(property));
                      }}
                    >
                      Open listing
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="property-toolbar">
          <div className="property-toolbar__card">
            <form
              className="property-toolbar__form"
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
                    default:
                      break;
                  }
                }

                setFilteredProperties(filtered);
                setSearchQuery(query);
                setSortBy(sort);
              }}
            >
              <div className="property-toolbar__field">
                <label htmlFor="property-search">Search portfolio</label>
                <input
                  id="property-search"
                  type="text"
                  placeholder="City, area, asset type…"
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
                />
              </div>

              <div className="property-toolbar__field">
                <label htmlFor="property-sort">Sort results</label>
                <select
                  id="property-sort"
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
                        default:
                          break;
                      }
                      setFilteredProperties(filtered);
                    }
                  }}
                >
                  <option value="">Sort by</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>

              <div className="property-toolbar__actions">
                <button type="submit" className="btn btn--primary">Search</button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setSearchQuery('');
                    setSortBy('');
                    setFilteredProperties(properties);
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </section>


        {/* Services Section */}
        <section className="property-services">
          <div className="property-services__header">
            <span className="eyebrow">Services</span>
            <h2>Everything you need to operate premium assets</h2>
            <p>
              Deploy REMMIC modules individually or bundle them into a full-stack operations suite. Each workflow includes
              institutional security, audit-friendly activity logs, and collaborative workspaces.
            </p>
          </div>

          <div className="property-services__grid">
            {propertyServices.map((service) => (
              <article className="service-card" key={service.title}>
                <div className="service-card__media">
                  <img src={service.image} alt={service.title} loading="lazy" />
                </div>
                <div className="service-card__body">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <a className="btn btn--ghost" href={service.href}>
                    {service.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="property-cta">
          <div className="property-cta__grid">
            <div>
              <span className="eyebrow">Get started</span>
              <h2>Your property, investor ready in days.</h2>
              <p>
                Whether you are raising capital or digitizing a portfolio, REMMIC gives you compliance workflows, structured data,
                and investor-grade reporting from day one.
              </p>
              <div className="property-cta__actions">
                {ctaLinks.map((link) => (
                  <a className="btn btn--primary" href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="property-cta__media">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=802&auto=format&fit=crop&q=80"
                alt="Luxury property"
                loading="lazy"
              />
            </div>
          </div>
        </section>





        <Footer />
      </div>

      <style jsx>{`
        .property-marketplace {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 5% 20px;
        }

        .property-marketplace__intro {
          text-align: center;
          max-width: 800px;
          margin: 0 auto 48px;
        }

        .property-marketplace__intro h1 {
          font-size: clamp(2.3rem, 5vw, 3.4rem);
          color: #0f172a;
          margin-bottom: 16px;
        }

        .property-marketplace__intro p {
          font-size: 1.05rem;
          color: #475467;
          line-height: 1.7;
        }

        .eyebrow {
          display: inline-flex;
          padding: 8px 16px;
          border-radius: 999px;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          color: #c9a227;
          background: rgba(201, 162, 39, 0.12);
          border: 1px solid rgba(201, 162, 39, 0.3);
          margin-bottom: 16px;
        }

        .property-state {
          text-align: center;
          border: 1px dashed rgba(148, 163, 184, 0.7);
          border-radius: 24px;
          padding: 48px 24px;
          margin-bottom: 40px;
          background: #f9fafb;
        }

        .property-state h3 {
          margin-bottom: 12px;
          color: #0f172a;
        }

        .property-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .property-card {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 45px -35px rgba(15, 23, 42, 0.4);
          cursor: pointer;
          background: #fff;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .property-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 60px -30px rgba(15, 23, 42, 0.4);
        }

        .property-card__media {
          position: relative;
          aspect-ratio: 4 / 3;
        }

        .property-card__media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .property-card__badge {
          position: absolute;
          top: 16px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #fff;
        }

        .property-card__badge--status {
          left: 16px;
        }

        .property-card__badge--type {
          right: 16px;
        }

        .property-card__cta {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 10px 20px;
          border-radius: 999px;
          font-size: 0.85rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .property-card:hover .property-card__cta {
          opacity: 1;
        }

        .property-card__body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .property-card__body h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #0f172a;
        }

        .property-card__meta {
          font-size: 0.95rem;
          color: #475467;
        }

        .property-card__description {
          color: #555;
          line-height: 1.6;
          flex: 1;
        }

        .property-card__footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .property-card__price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          display: block;
        }

        .property-card__status {
          font-size: 0.85rem;
          color: #64748b;
        }

        .property-toolbar {
          padding: 40px 5%;
        }

        .property-toolbar__card {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 32px;
          background: #fff;
          max-width: 1100px;
          margin: 0 auto;
          box-shadow: 0 20px 60px -45px rgba(15, 23, 42, 0.4);
        }

        .property-toolbar__form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          align-items: end;
        }

        .property-toolbar__field label {
          display: block;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
          color: #475467;
        }

        .property-toolbar__field input,
        .property-toolbar__field select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          padding: 14px 16px;
          font-size: 1rem;
        }

        .property-toolbar__actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          border-radius: 999px;
          text-transform: capitalize;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 25px -20px rgba(15, 23, 42, 0.45);
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
        }

        .btn--ghost {
          border: 1px solid rgba(15, 23, 42, 0.15);
          background: transparent;
          color: #0f172a;
        }

        .property-services {
          padding: 100px 5%;
          background: radial-gradient(circle at top right, rgba(201, 162, 39, 0.15), rgba(10, 10, 10, 0.95));
          color: #fff;
        }

        .property-services__header {
          max-width: 820px;
          margin: 0 auto 48px;
          text-align: center;
        }

        .property-services__header h2 {
          font-size: clamp(2.4rem, 5vw, 3rem);
          margin-bottom: 16px;
        }

        .property-services__header p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
        }

        .property-services__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .service-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .service-card__media img {
          width: 100%;
          height: 220px;
          object-fit: cover;
        }

        .service-card__body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .service-card__body h3 {
          margin: 0;
        }

        .service-card__body p {
          color: rgba(255, 255, 255, 0.7);
          flex: 1;
        }

        .service-card .btn {
          align-self: flex-start;
          color: #fff;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .property-cta {
          padding: 80px 5% 120px;
        }

        .property-cta__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 40px;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }

        .property-cta h2 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          margin-bottom: 16px;
          color: #0f172a;
        }

        .property-cta p {
          color: #475467;
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .property-cta__media img {
          width: 100%;
          border-radius: 32px;
          box-shadow: 0 30px 70px -40px rgba(15, 23, 42, 0.4);
        }

        .property-cta__actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .property-toolbar__form {
            grid-template-columns: 1fr;
          }

          .property-card__footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}
