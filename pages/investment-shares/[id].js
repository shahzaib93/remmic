import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useFirebase } from '../../contexts/FirebaseContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import styles from './[id].module.css';

export default function InvestmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { getAllProperties, getAllInvestments } = useFirebase();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const userToken = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      
      if (userToken && userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.email) {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Auth check error:', error);
        }
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch all properties from Firebase
        const response = await getAllProperties();
        const properties = response?.properties || [];
        
        // Find the property with matching ID
        const foundProperty = properties.find(prop => {
          const propId = prop?.id || prop?.propertyId;
          return propId && propId.toString() === id.toString();
        });

        if (foundProperty) {
          // Fetch investment data for this property
          const investmentResponse = await getAllInvestments();
          const investments = investmentResponse?.investments || [];
          const propertyInvestments = investments.filter(inv => {
            const invPropId = inv?.propertyId || inv?.property?.id;
            return invPropId && invPropId.toString() === id.toString();
          });

          // Calculate investment metrics
          const uniqueInvestors = new Set(propertyInvestments.map(inv => inv.userId || inv.userEmail)).size;
          const totalInvested = propertyInvestments.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
          
          // Parse and format property data
          const shareOffering = foundProperty.shareOffering || {};
          const totalShares = parseInt(shareOffering.totalShares) || parseInt(foundProperty.totalShares) || 1000;
          const sharesAvailable = parseInt(shareOffering.availableShares) || parseInt(foundProperty.sharesAvailable) || 
                                 parseInt(foundProperty.availableShares) || Math.floor(totalShares * 0.4);
          const sharesSold = totalShares - sharesAvailable;
          
          // Parse financial values
          const parseAmount = (value) => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              const cleaned = value.replace(/[^0-9.]/g, '');
              return parseFloat(cleaned) || 0;
            }
            return 0;
          };

          const sharePrice = parseAmount(shareOffering.sharePrice) || parseAmount(foundProperty.sharePrice) || 
                            parseAmount(foundProperty.minInvestment) || 50000;
          const fundingTarget = parseAmount(foundProperty.fundingTarget) || parseAmount(foundProperty.targetAmount) || 
                               parseAmount(foundProperty.totalValue) || (totalShares * sharePrice);
          const capitalRaised = totalInvested || (sharesSold * sharePrice);

          // Format the property object for display
          const formattedProperty = {
            id: foundProperty.id || foundProperty.propertyId,
            title: foundProperty.title || foundProperty.name || "Investment Property",
            location: foundProperty.location || foundProperty.address || "Karachi, Pakistan",
            type: foundProperty.propertyType || foundProperty.type || "Residential",
            status: foundProperty.status || "Active",
            riskLevel: foundProperty.riskLevel || foundProperty.risk || "Medium",
            image: foundProperty.images?.[0] || foundProperty.image || foundProperty.imageUrl || 
                   "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            mapCoordinates: foundProperty.coordinates || { lat: 6.5244, lng: 3.3792 },
            description: foundProperty.description || foundProperty.details || 
                        "Premium investment opportunity with exceptional returns and strategic location.",
            sharePrice: sharePrice,
            minInvestment: parseAmount(foundProperty.minInvestment) || sharePrice,
            totalShares: totalShares,
            sharesAvailable: sharesAvailable,
            sharesSold: sharesSold,
            fundingTarget: fundingTarget,
            capitalRaised: capitalRaised,
            investors: uniqueInvestors || parseInt(foundProperty.investors) || 0,
            projectedYield: parseFloat(foundProperty.projectedYield) || parseFloat(foundProperty.expectedReturn) || 15,
            appreciationRate: parseFloat(foundProperty.appreciationRate) || 10,
            dividendYield: parseFloat(foundProperty.dividendYield) || 5,
            holdingPeriod: foundProperty.holdingPeriod || foundProperty.duration || "5 years",
            propertyArea: foundProperty.area || foundProperty.size || "2,000 sqm",
            landCost: foundProperty.landCost || foundProperty.landValue || "PKR 20,000,000",
            plotNumber: foundProperty.plotNumber || foundProperty.plot || "Plot 1",
            completionDate: foundProperty.completionDate || foundProperty.expectedCompletion || "Q4 2025",
            developer: foundProperty.developer || foundProperty.developerName || "Premium Developers",
            features: Array.isArray(foundProperty.features) ? foundProperty.features : 
                     foundProperty.amenities || ["Security", "Parking", "Power Backup"],
            documents: {
              brochure: foundProperty.brochureUrl || "/documents/brochure.pdf",
              investmentBrief: foundProperty.investmentBriefUrl || "/documents/investment-brief.pdf"
            },
            media: {
              hasVRTour: true, // Enable VR Tour for all properties
              hasVideo: !!foundProperty.videoUrl,
              hasGallery: !!(foundProperty.images && foundProperty.images.length > 0),
              vrTourUrl: "https://it-s-travelick.vercel.app/tours/UlucE9jpq1HQFL3FuLbf?embed=1",
              videoUrl: foundProperty.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
              gallery: foundProperty.images || [
                foundProperty.image || foundProperty.imageUrl,
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
              ].filter(Boolean)
            },
            recentActivity: propertyInvestments.slice(0, 3).map(inv => ({
              date: new Date(inv.createdAt || inv.date).toLocaleDateString(),
              action: `${inv.userName || 'Investor'} invested ${formatCurrency(inv.amount)}`
            })),
            dueDiligence: foundProperty.dueDiligence || [
              "Legal documentation verified",
              "Property title authenticated",
              "Environmental impact assessment completed",
              "Building permits approved",
              "Insurance coverage secured"
            ]
          };

          setProperty(formattedProperty);
        } else {
          // Property not found
          setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, getAllProperties, getAllInvestments]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading investment details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.errorContainer}>
        <h2>Property not found</h2>
        <p>The investment opportunity you're looking for doesn't exist or has been removed.</p>
        <Link href="/investment-shares">
          <button className={styles.backButton}>Back to Investments</button>
        </Link>
      </div>
    );
  }

  const fundingPercentage = (property.capitalRaised / property.fundingTarget) * 100;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Header Section */}
        <header className={styles.header}>
        <Link href="/investment-shares">
          <button className={styles.backBtn}>
            ← Back to Investment Opportunities
          </button>
        </Link>
      </header>

      {/* Media Section */}
      <section className={styles.mediaSection}>
        <div className={styles.heroImage}>
          <img src={property.image} alt={property.title} />
          <div className={styles.imageOverlay}>
            <span className={styles.propertyType}>{property.type}</span>
            <h1 className={styles.propertyTitle}>{property.title}</h1>
            <p className={styles.propertyLocation}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {property.location}
            </p>
          </div>
        </div>
        <div className={styles.mapContainer}>
          <iframe
            src={`https://maps.google.com/maps?q=${property.mapCoordinates.lat},${property.mapCoordinates.lng}&z=15&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* Media Actions Grid */}
      <section className={styles.mediaActions}>
        <button 
          className={`${styles.mediaCard} ${!property.media.hasVRTour ? styles.disabled : ''}`}
          onClick={() => property.media.hasVRTour && setActiveModal('vr')}
          disabled={!property.media.hasVRTour}
        >
          <span className={styles.mediaIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 10c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-5.5l-2.5-2-2.5 2H5c-1.1 0-2-.9-2-2V10zm2 0v8h3.5l2.5-2 2.5 2H19v-8H5zm7-7c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
            </svg>
          </span>
          <span className={styles.mediaText}>VR Tour</span>
        </button>
        <button 
          className={`${styles.mediaCard} ${!property.media.hasVideo ? styles.disabled : ''}`}
          onClick={() => property.media.hasVideo && setActiveModal('video')}
          disabled={!property.media.hasVideo}
        >
          <span className={styles.mediaIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
            </svg>
          </span>
          <span className={styles.mediaText}>Video</span>
        </button>
        <button 
          className={`${styles.mediaCard} ${!property.media.hasGallery ? styles.disabled : ''}`}
          onClick={() => property.media.hasGallery && setActiveModal('gallery')}
          disabled={!property.media.hasGallery}
        >
          <span className={styles.mediaIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </span>
          <span className={styles.mediaText}>Photo Gallery</span>
        </button>
        <button 
          className={styles.mediaCard}
          onClick={() => alert('Downloading brochure...')}
        >
          <span className={styles.mediaIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </span>
          <span className={styles.mediaText}>Brochure</span>
        </button>
      </section>

      {/* Investment Summary Section */}
      <section className={styles.investmentSummary}>
        <div className={styles.summaryHeader}>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.riskBadge}`}>
              {property.riskLevel} Risk
            </span>
            <span className={`${styles.badge} ${styles.statusBadge}`}>
              {property.status}
            </span>
          </div>
          <h2 className={styles.sectionTitle}>{property.title}</h2>
          <p className={styles.propertyDesc}>{property.description}</p>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Share Price</span>
            <span className={styles.metricValue}>{formatCurrency(property.sharePrice)}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Min Investment</span>
            <span className={styles.metricValue}>{formatCurrency(property.minInvestment)}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Shares</span>
            <span className={styles.metricValue}>{property.totalShares.toLocaleString()}</span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Shares Available</span>
            <span className={styles.metricValue}>{property.sharesAvailable.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.fundingProgress}>
          <div className={styles.progressHeader}>
            <span>Funding Progress</span>
            <span>{fundingPercentage.toFixed(1)}% Funded</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            ></div>
          </div>
          <div className={styles.progressStats}>
            <span>{formatCurrency(property.capitalRaised)} raised</span>
            <span>of {formatCurrency(property.fundingTarget)}</span>
          </div>
        </div>

        <div className={styles.snapshotGrid}>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotLabel}>Funding Target</span>
            <span className={styles.snapshotValue}>{formatCurrency(property.fundingTarget)}</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotLabel}>Capital Raised</span>
            <span className={styles.snapshotValue}>{formatCurrency(property.capitalRaised)}</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotLabel}>Investors</span>
            <span className={styles.snapshotValue}>{property.investors}</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotLabel}>Availability</span>
            <span className={styles.snapshotValue}>{property.sharesAvailable} shares</span>
          </div>
        </div>

        <div className={styles.highlights}>
          <span className={styles.highlightPill}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}>
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            {property.projectedYield}% Projected Yield
          </span>
          <span className={styles.highlightPill}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}>
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            {property.appreciationRate}% Annual Appreciation
          </span>
          <span className={styles.highlightPill}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
            {property.dividendYield}% Dividend Yield
          </span>
          <span className={styles.highlightPill}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}>
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            {property.holdingPeriod} Holding Period
          </span>
        </div>

        <button 
          className={styles.investButton}
          onClick={() => {
            if (isAuthenticated) {
              setShowInvestModal(true);
            } else {
              router.push('/login');
            }
          }}
        >
          Invest Now
        </button>
      </section>

      {/* Property Details Section */}
      <section className={styles.propertyDetails}>
        <h3 className={styles.sectionTitle}>Property Details</h3>
        
        <div className={styles.downloadSection}>
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px'}}>
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download Investment Brief
          </p>
          <a href={property.documents.investmentBrief} className={styles.downloadLink}>
            Investment_Brief_{property.title.replace(/\s+/g, '_')}.pdf
          </a>
        </div>

        <div className={styles.factsGrid}>
          <div className={styles.factItem}>
            <span className={styles.factLabel}>Property Type</span>
            <span className={styles.factValue}>{property.type}</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factLabel}>Area Size</span>
            <span className={styles.factValue}>{property.propertyArea}</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factLabel}>Land Cost</span>
            <span className={styles.factValue}>{property.landCost}</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factLabel}>Plot Number</span>
            <span className={styles.factValue}>{property.plotNumber}</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factLabel}>Completion Date</span>
            <span className={styles.factValue}>{property.completionDate}</span>
          </div>
          <div className={styles.factItem}>
            <span className={styles.factLabel}>Developer</span>
            <span className={styles.factValue}>{property.developer}</span>
          </div>
        </div>

        <div className={styles.detailsColumns}>
          <div className={styles.column}>
            <h4>Yield & Holding Information</h4>
            <ul className={styles.infoList}>
              <li>Expected Annual Yield: {property.projectedYield}%</li>
              <li>Capital Appreciation: {property.appreciationRate}%</li>
              <li>Dividend Distribution: Quarterly</li>
              <li>Minimum Holding Period: {property.holdingPeriod}</li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4>Key Features</h4>
            <div className={styles.featureBadges}>
              {property.features.map((feature, index) => (
                <span key={index} className={styles.featureBadge}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
          <div className={styles.column}>
            <h4>Recent Investment Activity</h4>
            {property.recentActivity.length > 0 ? (
              <ul className={styles.activityList}>
                {property.recentActivity.map((activity, index) => (
                  <li key={index}>
                    <span className={styles.activityDate}>{activity.date}</span>
                    <span className={styles.activityAction}>{activity.action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noActivity}>Be the first to invest!</p>
            )}
          </div>
        </div>

        <div className={styles.dueDiligence}>
          <h4>Due Diligence Highlights</h4>
          <ul className={styles.dueDiligenceList}>
            {property.dueDiligence.map((item, index) => (
              <li key={index}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '6px', color: '#2e7d32'}}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Modals */}
      {activeModal === 'vr' && (
        <div className={styles.modal} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setActiveModal(null)}>×</button>
            <h3>Virtual Reality Tour</h3>
            <div className={styles.vrTourContainer} style={{ flex: '1', width: '100%' }}>
              <iframe
                src={property.media.vrTourUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen; autoplay; vr"
                allowFullScreen
                allowvr="yes"
                scrolling="no"
                title="Virtual Reality Tour"
              />
            </div>
          </div>
        </div>
      )}

      {activeModal === 'video' && (
        <div className={styles.modal} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setActiveModal(null)}>×</button>
            <h3>Property Video</h3>
            <iframe
              src={property.media.videoUrl}
              width="100%"
              height="500"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Investment Modal */}
      {showInvestModal && (
        <div className={styles.modal} onClick={() => setShowInvestModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowInvestModal(false)}>×</button>
            <h3>Invest in {property.title}</h3>
            
            <div className={styles.investmentForm}>
              <div className={styles.investmentInfo}>
                <p><strong>Share Price:</strong> {formatCurrency(property.sharePrice)}</p>
                <p><strong>Minimum Investment:</strong> {formatCurrency(property.minInvestment)}</p>
                <p><strong>Available Shares:</strong> {property.sharesAvailable.toLocaleString()}</p>
                <p><strong>Expected Return:</strong> {property.projectedYield}% annually</p>
              </div>
              
              <div className={styles.investmentInputGroup}>
                <label htmlFor="investmentAmount">Investment Amount (PKR)</label>
                <input
                  type="number"
                  id="investmentAmount"
                  className={styles.investmentInput}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder={`Minimum: ${formatCurrency(property.minInvestment)}`}
                  min={property.minInvestment}
                />
                {investmentAmount && (
                  <p className={styles.sharesCalculation}>
                    You will receive: <strong>{Math.floor(investmentAmount / property.sharePrice).toLocaleString()}</strong> shares
                  </p>
                )}
              </div>
              
              <div className={styles.investmentActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowInvestModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmInvestButton}
                  onClick={() => {
                    if (investmentAmount >= property.minInvestment) {
                      alert(`Investment of ${formatCurrency(investmentAmount)} confirmed! You will receive ${Math.floor(investmentAmount / property.sharePrice).toLocaleString()} shares.`);
                      setShowInvestModal(false);
                      setInvestmentAmount('');
                    } else {
                      alert(`Minimum investment is ${formatCurrency(property.minInvestment)}`);
                    }
                  }}
                  disabled={!investmentAmount || investmentAmount < property.minInvestment}
                >
                  Confirm Investment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'gallery' && (
        <div className={styles.modal} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setActiveModal(null)}>×</button>
            <h3>Photo Gallery</h3>
            <div className={styles.galleryGrid}>
              {property.media.gallery.map((image, index) => (
                <img 
                  key={index} 
                  src={image} 
                  alt={`${property.title} ${index + 1}`}
                  className={styles.galleryImage}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
      </div>
    </>
  );
}