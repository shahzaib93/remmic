import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useFirebase } from '../../contexts/FirebaseContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const DEFAULT_COORDINATES = { lat: 24.8607, lng: 67.0011 };
const CITY_COORDINATES = {
  karachi: { lat: 24.8607, lng: 67.0011 },
  lahore: { lat: 31.5204, lng: 74.3587 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
};

const parseAmountValue = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }
  return 0;
};

const getCoordinatesFromLocation = (location = '') => {
  const normalized = location.toLowerCase();
  const cityMatch = Object.keys(CITY_COORDINATES).find((city) => normalized.includes(city));
  return cityMatch ? CITY_COORDINATES[cityMatch] : DEFAULT_COORDINATES;
};

const convertOpportunityToProperty = (share) => {
  if (!share) return null;

  const shareOffering = share.shareOffering || {};
  const sharePrice =
    parseAmountValue(shareOffering.sharePrice) ||
    parseAmountValue(share.sharePrice) ||
    parseAmountValue(share.minInvestment) ||
    50000;

  const totalShares =
    Number(shareOffering.totalShares) ||
    Math.max(
      Math.round((parseAmountValue(share.totalValue) || sharePrice * 1000) / Math.max(sharePrice, 1)),
      1000
    );

  const sharesDistributed =
    Number(shareOffering.distributedShares) ||
    Math.round(totalShares * ((share.sharesDistributedPercent ?? share.fundingPercent ?? 60) / 100));

  const sharesAvailable =
    Number(shareOffering.availableShares) || Math.max(totalShares - Math.max(sharesDistributed, 0), 0);

  const fundingTarget =
    parseAmountValue(share.fundingTarget) || parseAmountValue(share.totalValue) || sharePrice * totalShares;
  const capitalRaised = Math.max(totalShares - sharesAvailable, 0) * sharePrice;

  const investors =
    Number(share.shareOffering?.investorCount) ||
    Number(share.investorCount) ||
    Number(share.investors) ||
    Math.max(
      Math.round(capitalRaised / Math.max(parseAmountValue(share.minInvestment) || sharePrice, sharePrice)),
      8
    );

  const gallery =
    (share.media?.gallery && share.media.gallery.length && share.media.gallery) ||
    (Array.isArray(share.gallery) && share.gallery.length ? share.gallery : null) ||
    (Array.isArray(share.images) && share.images.length ? share.images : null) ||
    [share.image].filter(Boolean);

  return {
    id: share.id || share.originalId || share.propertyId,
    title: share.title || share.name || 'Investment Opportunity',
    location: share.location || share.address || 'Karachi, Pakistan',
    type: share.propertyType || share.type || 'Investment',
    status: share.status || 'Active',
    riskLevel: share.riskLevel || share.risk || 'Managed',
    image: share.image || (gallery && gallery[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    mapCoordinates: share.mapCoordinates || share.coordinates || getCoordinatesFromLocation(share.location || ''),
    description: share.description || 'Premium investment opportunity with exceptional returns and strategic location.',
    sharePrice,
    minInvestment: parseAmountValue(share.minInvestment) || sharePrice,
    totalShares,
    sharesAvailable,
    sharesSold: Math.max(totalShares - sharesAvailable, 0),
    fundingTarget,
    capitalRaised,
    investors,
    projectedYield: Number(share.expectedReturn) || Number(share.projectedYield) || Number(share.annualYield) || 15,
    appreciationRate: Number(share.appreciationRate) || 10,
    dividendYield: Number(share.dividendYield) || Number(share.annualYield) || 6,
    holdingPeriod: share.holdingPeriod || share.duration || '5 years',
    propertyArea: share.propertyArea || share.area || share.size || '2,000 sqm',
    landCost: share.landCost || share.landValue || share.price || 'PKR 20,000,000',
    plotNumber: share.plotNumber || share.referenceId || 'Plot 1',
    completionDate: share.completionDate || share.expectedCompletion || 'Q4 2025',
    developer: share.developer || share.developerName || 'Premium Developers',
    features:
      Array.isArray(share.features) && share.features.length
        ? share.features
        : ['Secured income', 'Managed asset', 'Investor reporting'],
    documents: share.documents || {
      brochure: share.brochureUrl || '/documents/brochure.pdf',
      investmentBrief: share.investmentBriefUrl || '/documents/investment-brief.pdf',
    },
    media: {
      hasVRTour: Boolean(share.media?.hasVRTour || share.vrTourUrl),
      hasVideo: Boolean(share.media?.hasVideo || share.videoUrl),
      hasGallery: Boolean(gallery && gallery.length),
      vrTourUrl: share.media?.vrTourUrl || share.vrTourUrl || 'https://it-s-travelick.vercel.app/tours/UlucE9jpq1HQFL3FuLbf?embed=1',
      videoUrl: share.media?.videoUrl || share.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      gallery: (gallery && gallery.length ? gallery : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']),
    },
    recentActivity: Array.isArray(share.recentActivity) ? share.recentActivity : [],
    dueDiligence:
      Array.isArray(share.dueDiligence) && share.dueDiligence.length
        ? share.dueDiligence
        : [
            'Title authenticated',
            'Insurance coverage secured',
            'Developer profile verified',
            'Regulatory compliance review complete',
          ],
  };
};

const readCachedOpportunity = (identifier) => {
  if (typeof window === 'undefined' || !identifier) return null;
  try {
    const raw = window.localStorage.getItem('selectedInvestmentOpportunity');
    if (!raw) return null;

    const payload = JSON.parse(raw);
    const share = payload?.share || payload;
    if (!share) return null;

    const shareId = share.id || share.originalId || share.propertyId;
    if (!shareId) return null;

    return shareId.toString() === identifier.toString() ? share : null;
  } catch (error) {
    console.warn('Failed to restore cached investment opportunity:', error);
    return null;
  }
};

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
  const { getAllProperties, getAllInvestments, addInvestment } = useFirebase();

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

      const fallbackFromCache = () => {
        const cachedOpportunity = readCachedOpportunity(id);
        if (!cachedOpportunity) return false;
        const converted = convertOpportunityToProperty(cachedOpportunity);
        if (!converted) return false;
        setProperty(converted);
        return true;
      };

      setLoading(true);
      try {
        const response = await getAllProperties();
        const properties = response?.properties || [];

        const foundProperty = properties.find(prop => {
          const propId = prop?.id || prop?.propertyId;
          return propId && propId.toString() === id.toString();
        });

        if (foundProperty) {
          const investmentResponse = await getAllInvestments();
          const investments = investmentResponse?.investments || [];
          const propertyInvestments = investments.filter(inv => {
            const invPropId = inv?.propertyId || inv?.property?.id;
            return invPropId && invPropId.toString() === id.toString();
          });

          const uniqueInvestors = new Set(propertyInvestments.map(inv => inv.userId || inv.userEmail)).size;
          const totalInvested = propertyInvestments.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);

          const shareOffering = foundProperty.shareOffering || {};
          const totalShares = parseInt(shareOffering.totalShares) || parseInt(foundProperty.totalShares) || 1000;
          const sharesAvailable = parseInt(shareOffering.availableShares) || parseInt(foundProperty.sharesAvailable) ||
                                 parseInt(foundProperty.availableShares) || Math.floor(totalShares * 0.4);
          const sharesSold = totalShares - sharesAvailable;

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
              hasVRTour: true,
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
        } else if (!fallbackFromCache()) {
          setProperty(null);
        }
      } catch (error) {
        console.error('Error fetching property details:', error);
        if (!fallbackFromCache()) {
          setProperty(null);
        }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f8fa]">
        <div className="w-[50px] h-[50px] border-4 border-gray-100 border-t-[#ff5e01] rounded-full animate-spin mb-5" />
        <p className="text-gray-600">Loading investment details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f8fa]">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
        <p className="text-gray-600 mb-6">The investment opportunity you're looking for doesn't exist or has been removed.</p>
        <Link href="/investment-shares">
          <button className="px-6 py-3 bg-gradient-to-r from-[#ff5e01] to-[#ff8a00] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Back to Investments
          </button>
        </Link>
      </div>
    );
  }

  const fundingPercentage = (property.capitalRaised / property.fundingTarget) * 100;

  return (
    <>
      <Head>
        <title>{property.title} - Investment Opportunity | REMMIC</title>
        <meta name="description" content={property.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/investment-shares" className="hover:text-[#c9a227]">
                Investment Opportunities
              </Link>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900">{property.title}</span>
            </nav>
          </div>
        </div>

        {/* Property Gallery and Map */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left - Property Image (60%) */}
              <div className="lg:col-span-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white shadow-lg mb-3">
                      Investment Opportunity
                    </span>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {property.title}
                    </h1>
                    <p className="text-white/90 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {property.location}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right - Map Panel (40%) */}
              <div className="lg:col-span-2">
                <div className="h-full rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <iframe
                    src={`https://maps.google.com/maps?q=${property.mapCoordinates.lat},${property.mapCoordinates.lng}&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    allowFullScreen=""
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Property Title + Meta Row */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Title Row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white">
                  {property.type}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{fundingPercentage.toFixed(0)}% funded</span>
                <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-gray-400 hover:text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Location */}
            <p className="text-gray-500 mb-4">
              {property.location}
            </p>

            {/* Meta Info Row */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="font-medium text-gray-900">{property.projectedYield}% ROI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium text-gray-900">Min. {formatCurrency(property.minInvestment)}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-medium text-gray-900">{property.investors} Investors</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium text-gray-900">{property.riskLevel} Risk</span>
              </div>
            </div>
          </div>
        </section>

        {/* Media Actions Grid */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
              <button
                className={`bg-white border border-gray-200 rounded-xl py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:not-disabled:border-[#c9a227] hover:not-disabled:shadow-sm ${!property.media.hasVRTour ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => property.media.hasVRTour ? window.open(property.media.vrTourUrl, '_blank') : alert('VR Tour not available')}
                disabled={!property.media.hasVRTour}
              >
                <span className="flex items-center justify-center h-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 10c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-5.5l-2.5-2-2.5 2H5c-1.1 0-2-.9-2-2V10zm2 0v8h3.5l2.5-2 2.5 2H19v-8H5zm7-7c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </span>
                <span className="text-xs font-semibold leading-tight text-gray-700">VR Tour</span>
              </button>
              
              <button
                className={`bg-white border border-gray-200 rounded-xl py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:not-disabled:border-[#c9a227] hover:not-disabled:shadow-sm ${!property.media.hasVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => property.media.hasVideo ? window.open(property.media.videoUrl, '_blank') : alert('Video not available')}
                disabled={!property.media.hasVideo}
              >
                <span className="flex items-center justify-center h-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
                  </svg>
                </span>
                <span className="text-xs font-semibold leading-tight text-gray-700">Video</span>
              </button>
              
              <button
                className={`bg-white border border-gray-200 rounded-xl py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:not-disabled:border-[#c9a227] hover:not-disabled:shadow-sm ${!property.media.hasGallery ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => property.media.hasGallery ? alert('Photo gallery feature coming soon!') : alert('Gallery not available')}
                disabled={!property.media.hasGallery}
              >
                <span className="flex items-center justify-center h-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </span>
                <span className="text-xs font-semibold leading-tight text-gray-700">Photo Gallery</span>
              </button>
              
              <button
                className="bg-white border border-gray-200 rounded-xl py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:border-[#c9a227] hover:shadow-sm"
                onClick={() => alert('Downloading brochure...')}
              >
                <span className="flex items-center justify-center h-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </span>
                <span className="text-xs font-semibold leading-tight text-gray-700">Brochure</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <main className="pt-6 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left - Property Details (60%) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Investment Summary Section */}
                {/* Investment Overview */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="mb-6">
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#c9a227]/10 text-[#8b6914]">
                        {property.riskLevel} Risk
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {property.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{property.title}</h2>
                    <p className="text-gray-600 leading-relaxed">{property.description}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-500 font-medium mb-1">Share Price</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(property.sharePrice)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-500 font-medium mb-1">Min Investment</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(property.minInvestment)}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-500 font-medium mb-1">Total Shares</div>
                      <div className="text-lg font-bold text-gray-900">{property.totalShares.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-xs text-gray-500 font-medium mb-1">Available Shares</div>
                      <div className="text-lg font-bold text-gray-900">{property.sharesAvailable.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
                      <span>Funding Progress</span>
                      <span>{fundingPercentage.toFixed(1)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-[#c9a227] to-[#b8922a] h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatCurrency(property.capitalRaised)} raised</span>
                      <span>{formatCurrency(property.fundingTarget)} target</span>
                    </div>
                  </div>
                </section>
                
              </div>
              
              {/* Right - Investment Action Card (40%) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(property.fundingTarget)}
                    </div>
                    <div className="text-sm text-gray-500">Investment Target</div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expected ROI</span>
                      <span className="font-semibold text-gray-900">{property.projectedYield}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Risk Level</span>
                      <span className="font-semibold text-gray-900">{property.riskLevel}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Holding Period</span>
                      <span className="font-semibold text-gray-900">{property.holdingPeriod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Investors</span>
                      <span className="font-semibold text-gray-900">{property.investors}</span>
                    </div>
                  </div>

                  <button
                    className="w-full py-4 bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white font-semibold rounded-xl hover:from-[#b8922a] hover:to-[#a67c00] transition-all shadow-md hover:shadow-lg"
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
                  
                  <div className="text-center mt-4">
                    <div className="text-xs text-gray-500">
                      Minimum investment: {formatCurrency(property.minInvestment)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {/* Investment Modal */}
        {showInvestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Invest in {property.title}</h3>
                  <button
                    onClick={() => setShowInvestModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Share Price</span>
                        <div className="font-semibold">{formatCurrency(property.sharePrice)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Min Investment</span>
                        <div className="font-semibold">{formatCurrency(property.minInvestment)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Available Shares</span>
                        <div className="font-semibold">{property.sharesAvailable.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Expected ROI</span>
                        <div className="font-semibold text-green-600">{property.projectedYield}%</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Amount
                    </label>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder={`Minimum ${formatCurrency(property.minInvestment)}`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    />
                    {investmentAmount && (
                      <div className="mt-2 text-sm text-gray-600">
                        You will receive: {Math.floor(Number(investmentAmount) / property.sharePrice).toLocaleString()} shares
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInvestModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const amount = Number(investmentAmount);
                      if (amount >= property.minInvestment) {
                        try {
                          const userData = localStorage.getItem('userData');
                          const user = JSON.parse(userData);
                          const shares = Math.floor(amount / property.sharePrice);
                          
                          const ownershipPercentage = ((shares / property.totalShares) * 100).toFixed(2);
                          
                          const investment = {
                            userId: user.id,
                            userEmail: user.email,
                            propertyId: property.id,
                            propertyTitle: property.title,
                            amount: amount,
                            sharePrice: property.sharePrice,
                            shares: shares,
                            totalShares: property.totalShares,
                            ownershipPercentage: parseFloat(ownershipPercentage),
                            investmentDate: new Date().toISOString(),
                            status: 'confirmed',
                            location: property.location,
                            propertyType: property.type,
                            riskLevel: property.riskLevel,
                            expectedReturn: property.projectedYield,
                            image: property.image
                          };
                          
                          // Save to Firebase
                          const result = await addInvestment(investment);
                          
                          if (result.success) {
                            // Also save to localStorage
                            const existingInvestments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
                            const updatedInvestments = [...existingInvestments, { ...investment, id: result.id || Date.now().toString() }];
                            localStorage.setItem('userInvestments', JSON.stringify(updatedInvestments));
                            
                            alert(`Investment confirmed! You've purchased ${shares.toLocaleString()} shares for ${formatCurrency(amount)}. View your investment in your dashboard.`);
                            setShowInvestModal(false);
                            setInvestmentAmount('');
                            
                            // Redirect to dashboard
                            router.push('/dashboard?section=investments');
                          } else {
                            throw new Error(result.error || 'Failed to save investment');
                          }
                        } catch (error) {
                          console.error('Investment failed:', error);
                          alert('Sorry, there was an error processing your investment. Please try again.');
                        }
                      } else {
                        alert(`Minimum investment is ${formatCurrency(property.minInvestment)}`);
                      }
                    }}
                    disabled={!investmentAmount || Number(investmentAmount) < property.minInvestment}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#c9a227] to-[#b8922a] text-white font-semibold rounded-xl hover:from-[#b8922a] hover:to-[#a67c00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Investment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
