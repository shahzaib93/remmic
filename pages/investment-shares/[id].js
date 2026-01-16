import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useFirebase } from '../../contexts/FirebaseContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

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
        } else {
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
      <Navbar />
      <div className="bg-[#f7f8fa] min-h-screen pb-[60px]">
        {/* Header Section */}
        <header className="bg-white py-5 px-10 shadow-sm sticky top-0 z-[100] max-md:py-4 max-md:px-5">
          <Link href="/investment-shares">
            <button className="bg-transparent border-2 border-gray-200 py-2.5 px-5 rounded-lg text-sm text-gray-700 cursor-pointer transition-all font-medium hover:bg-[#ff5e01] hover:text-white hover:border-[#ff5e01] hover:-translate-x-1">
              ← Back to Investment Opportunities
            </button>
          </Link>
        </header>

        {/* Media Section */}
        <section className="grid grid-cols-2 gap-5 py-5 px-10 bg-white max-md:grid-cols-1 max-md:py-4 max-md:px-5">
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-black max-md:h-[250px] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-black/80 before:z-[1] before:pointer-events-none">
            <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-[30px] text-white z-[2]">
              <span className="bg-[#ff5e01] text-white py-1 px-3 rounded-md text-xs font-semibold uppercase inline-block mb-2.5 shadow-md">
                {property.type}
              </span>
              <h1 className="text-[28px] font-bold my-2.5 text-white drop-shadow-lg tracking-tight max-md:text-[22px]">
                {property.title}
              </h1>
              <p className="text-base text-white opacity-95 flex items-center gap-1 drop-shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1 shrink-0 drop-shadow">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {property.location}
              </p>
            </div>
          </div>
          <div className="h-[400px] rounded-2xl overflow-hidden shadow-lg max-md:h-[250px]">
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
        <section className="grid grid-cols-4 gap-4 px-10 pb-6 bg-white max-lg:grid-cols-2 max-md:px-5">
          <button
            className={`bg-white border-[1.5px] border-gray-200 rounded-[10px] py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:not-disabled:-translate-y-1 hover:not-disabled:shadow-[0_8px_20px_rgba(255,94,1,0.15)] hover:not-disabled:border-[#ff5e01] ${!property.media.hasVRTour ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => property.media.hasVRTour && setActiveModal('vr')}
            disabled={!property.media.hasVRTour}
          >
            <span className="flex items-center justify-center h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 10c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-5.5l-2.5-2-2.5 2H5c-1.1 0-2-.9-2-2V10zm2 0v8h3.5l2.5-2 2.5 2H19v-8H5zm7-7c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
              </svg>
            </span>
            <span className="text-xs font-semibold leading-tight">VR Tour</span>
          </button>
          <button
            className={`bg-white border-[1.5px] border-gray-200 rounded-[10px] py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:not-disabled:-translate-y-1 hover:not-disabled:shadow-[0_8px_20px_rgba(255,94,1,0.15)] hover:not-disabled:border-[#ff5e01] ${!property.media.hasVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => property.media.hasVideo && setActiveModal('video')}
            disabled={!property.media.hasVideo}
          >
            <span className="flex items-center justify-center h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
            </span>
            <span className="text-xs font-semibold leading-tight">Video</span>
          </button>
          <button
            className={`bg-white border-[1.5px] border-gray-200 rounded-[10px] py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:not-disabled:-translate-y-1 hover:not-disabled:shadow-[0_8px_20px_rgba(255,94,1,0.15)] hover:not-disabled:border-[#ff5e01] ${!property.media.hasGallery ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => property.media.hasGallery && setActiveModal('gallery')}
            disabled={!property.media.hasGallery}
          >
            <span className="flex items-center justify-center h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </span>
            <span className="text-xs font-semibold leading-tight">Photo Gallery</span>
          </button>
          <button
            className="bg-white border-[1.5px] border-gray-200 rounded-[10px] py-4 px-3 text-center cursor-pointer transition-all flex flex-col items-center gap-2 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(255,94,1,0.15)] hover:border-[#ff5e01]"
            onClick={() => alert('Downloading brochure...')}
          >
            <span className="flex items-center justify-center h-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </span>
            <span className="text-xs font-semibold leading-tight">Brochure</span>
          </button>
        </section>

        {/* Investment Summary Section */}
        <section className="bg-white mx-10 my-[30px] p-10 rounded-2xl shadow-md max-md:mx-5 max-md:p-6">
          <div className="mb-[30px]">
            <div className="flex gap-2.5 mb-5">
              <span className="py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase bg-green-50 text-green-700">
                {property.riskLevel} Risk
              </span>
              <span className="py-1.5 px-3.5 rounded-full text-xs font-semibold uppercase bg-orange-50 text-orange-600">
                {property.status}
              </span>
            </div>
            <h2 className="text-[28px] font-bold text-gray-900 my-4 max-md:text-[22px]">{property.title}</h2>
            <p className="text-gray-600 leading-relaxed text-base">{property.description}</p>
          </div>

          <div className="grid grid-cols-4 gap-5 my-[30px] max-lg:grid-cols-2 max-md:grid-cols-1">
            <div className="bg-[#f7f8fa] p-5 rounded-xl flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Share Price</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(property.sharePrice)}</span>
            </div>
            <div className="bg-[#f7f8fa] p-5 rounded-xl flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Min Investment</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(property.minInvestment)}</span>
            </div>
            <div className="bg-[#f7f8fa] p-5 rounded-xl flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Total Shares</span>
              <span className="text-xl font-bold text-gray-900">{property.totalShares.toLocaleString()}</span>
            </div>
            <div className="bg-[#f7f8fa] p-5 rounded-xl flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Shares Available</span>
              <span className="text-xl font-bold text-gray-900">{property.sharesAvailable.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#f7f8fa] p-6 rounded-xl my-[30px]">
            <div className="flex justify-between mb-4 font-semibold text-gray-700">
              <span>Funding Progress</span>
              <span>{fundingPercentage.toFixed(1)}% Funded</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-md overflow-hidden mb-2.5">
              <div
                className="h-full bg-gradient-to-r from-[#ff5e01] to-[#ff8a00] rounded-md transition-all duration-500"
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatCurrency(property.capitalRaised)} raised</span>
              <span>of {formatCurrency(property.fundingTarget)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-5 my-[30px] max-lg:grid-cols-2 max-md:grid-cols-1">
            <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col gap-2.5">
              <span className="text-[13px] opacity-70 font-medium">Funding Target</span>
              <span className="text-2xl font-bold">{formatCurrency(property.fundingTarget)}</span>
            </div>
            <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col gap-2.5">
              <span className="text-[13px] opacity-70 font-medium">Capital Raised</span>
              <span className="text-2xl font-bold">{formatCurrency(property.capitalRaised)}</span>
            </div>
            <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col gap-2.5">
              <span className="text-[13px] opacity-70 font-medium">Investors</span>
              <span className="text-2xl font-bold">{property.investors}</span>
            </div>
            <div className="bg-gray-900 text-white p-6 rounded-xl flex flex-col gap-2.5">
              <span className="text-[13px] opacity-70 font-medium">Availability</span>
              <span className="text-2xl font-bold">{property.sharesAvailable} shares</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 my-[30px] max-sm:flex-col">
            <span className="bg-gradient-to-br from-orange-50 to-orange-100 text-[#ff5e01] py-2.5 px-5 rounded-full text-sm font-semibold border border-orange-200 inline-flex items-center gap-1.5 max-sm:w-full max-sm:text-center max-sm:justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1 shrink-0">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              {property.projectedYield}% Projected Yield
            </span>
            <span className="bg-gradient-to-br from-orange-50 to-orange-100 text-[#ff5e01] py-2.5 px-5 rounded-full text-sm font-semibold border border-orange-200 inline-flex items-center gap-1.5 max-sm:w-full max-sm:text-center max-sm:justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1 shrink-0">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              {property.appreciationRate}% Annual Appreciation
            </span>
            <span className="bg-gradient-to-br from-orange-50 to-orange-100 text-[#ff5e01] py-2.5 px-5 rounded-full text-sm font-semibold border border-orange-200 inline-flex items-center gap-1.5 max-sm:w-full max-sm:text-center max-sm:justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1 shrink-0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
              {property.dividendYield}% Dividend Yield
            </span>
            <span className="bg-gradient-to-br from-orange-50 to-orange-100 text-[#ff5e01] py-2.5 px-5 rounded-full text-sm font-semibold border border-orange-200 inline-flex items-center gap-1.5 max-sm:w-full max-sm:text-center max-sm:justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1 shrink-0">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              {property.holdingPeriod} Holding Period
            </span>
          </div>

          <button
            className="w-full py-[18px] bg-gradient-to-r from-[#ff5e01] to-[#ff8a00] text-white border-none rounded-xl text-lg font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,94,1,0.3)]"
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
        <section className="bg-white mx-10 my-[30px] p-10 rounded-2xl shadow-md max-md:mx-5 max-md:p-6">
          <h3 className="text-[28px] font-bold text-gray-900 my-4 max-md:text-[22px]">Property Details</h3>

          <div className="bg-[#f7f8fa] p-5 rounded-xl my-5 flex justify-between items-center max-sm:flex-col max-sm:gap-4 max-sm:text-center">
            <p className="font-semibold text-gray-700 flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1.5 shrink-0">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Download Investment Brief
            </p>
            <a href={property.documents.investmentBrief} className="text-[#ff5e01] no-underline font-semibold py-2.5 px-5 bg-white rounded-lg transition-all hover:bg-[#ff5e01] hover:text-white max-sm:w-full max-sm:text-center">
              Investment_Brief_{property.title.replace(/\s+/g, '_')}.pdf
            </a>
          </div>

          <div className="grid grid-cols-3 gap-5 my-[30px] py-[30px] border-y border-gray-200 max-md:grid-cols-1">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Property Type</span>
              <span className="text-base font-semibold text-gray-900">{property.type}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Area Size</span>
              <span className="text-base font-semibold text-gray-900">{property.propertyArea}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Land Cost</span>
              <span className="text-base font-semibold text-gray-900">{property.landCost}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Plot Number</span>
              <span className="text-base font-semibold text-gray-900">{property.plotNumber}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Completion Date</span>
              <span className="text-base font-semibold text-gray-900">{property.completionDate}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-gray-500 font-medium">Developer</span>
              <span className="text-base font-semibold text-gray-900">{property.developer}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10 my-10 max-md:grid-cols-1 max-md:gap-[30px]">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-5">Yield & Holding Information</h4>
              <ul className="list-none p-0">
                <li className="py-2.5 text-gray-600 text-sm border-b border-gray-100">Expected Annual Yield: {property.projectedYield}%</li>
                <li className="py-2.5 text-gray-600 text-sm border-b border-gray-100">Capital Appreciation: {property.appreciationRate}%</li>
                <li className="py-2.5 text-gray-600 text-sm border-b border-gray-100">Dividend Distribution: Quarterly</li>
                <li className="py-2.5 text-gray-600 text-sm border-b border-gray-100">Minimum Holding Period: {property.holdingPeriod}</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-5">Key Features</h4>
              <div className="flex flex-wrap gap-2.5">
                {property.features.map((feature, index) => (
                  <span key={index} className="bg-green-50 text-green-700 py-2 px-4 rounded-full text-[13px] font-semibold">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-5">Recent Investment Activity</h4>
              {property.recentActivity.length > 0 ? (
                <ul className="list-none p-0">
                  {property.recentActivity.map((activity, index) => (
                    <li key={index} className="flex flex-col gap-1.5 py-2.5 border-b border-gray-100">
                      <span className="text-xs text-gray-500">{activity.date}</span>
                      <span className="text-sm text-gray-700 font-medium">{activity.action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic text-sm">Be the first to invest!</p>
              )}
            </div>
          </div>

          <div className="bg-[#f7f8fa] p-[30px] rounded-xl mt-10">
            <h4 className="text-lg font-bold text-gray-900 mb-5">Due Diligence Highlights</h4>
            <ul className="list-none p-0 grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {property.dueDiligence.map((item, index) => (
                <li key={index} className="text-green-700 font-medium text-sm flex items-start gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block align-middle mr-1.5 text-green-700 shrink-0 mt-0.5">
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] animate-fadeIn" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-2xl p-[30px] max-w-[90%] max-h-[90%] w-[90vw] h-[80vh] max-w-[1400px] overflow-auto relative animate-slideUp flex flex-col max-md:w-full max-md:h-[85vh] max-md:p-2.5 max-md:rounded-lg" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-5 right-5 bg-transparent border-none text-4xl text-gray-500 cursor-pointer transition-all w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-[#ff5e01] hover:rotate-90 z-10" onClick={() => setActiveModal(null)}>×</button>
              <h3 className="mt-0 mb-2.5 text-[22px] text-gray-900 font-semibold">Virtual Reality Tour</h3>
              <div className="flex-1 w-full relative bg-black p-0 m-0 overflow-visible">
                <iframe
                  src={property.media.vrTourUrl}
                  className="absolute inset-0 w-full h-full border-none block"
                  allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen; autoplay; vr"
                  allowFullScreen
                  scrolling="no"
                  title="Virtual Reality Tour"
                />
              </div>
            </div>
          </div>
        )}

        {activeModal === 'video' && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] animate-fadeIn" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-2xl p-[30px] max-w-[90%] max-h-[90%] overflow-auto relative animate-slideUp max-md:max-w-[95%] max-md:p-5" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-5 right-5 bg-transparent border-none text-4xl text-gray-500 cursor-pointer transition-all w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-[#ff5e01] hover:rotate-90" onClick={() => setActiveModal(null)}>×</button>
              <h3 className="mb-5 text-2xl font-bold text-gray-900">Property Video</h3>
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] animate-fadeIn" onClick={() => setShowInvestModal(false)}>
            <div className="bg-white rounded-2xl p-[30px] max-w-[90%] max-h-[90%] overflow-auto relative animate-slideUp max-md:max-w-[95%] max-md:p-5" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-5 right-5 bg-transparent border-none text-4xl text-gray-500 cursor-pointer transition-all w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-[#ff5e01] hover:rotate-90" onClick={() => setShowInvestModal(false)}>×</button>
              <h3 className="mb-5 text-2xl font-bold text-gray-900">Invest in {property.title}</h3>

              <div className="py-5">
                <div className="bg-gray-50 p-5 rounded-lg mb-5">
                  <p className="my-2.5 text-gray-700 text-[15px]"><strong className="text-gray-900 font-semibold">Share Price:</strong> {formatCurrency(property.sharePrice)}</p>
                  <p className="my-2.5 text-gray-700 text-[15px]"><strong className="text-gray-900 font-semibold">Minimum Investment:</strong> {formatCurrency(property.minInvestment)}</p>
                  <p className="my-2.5 text-gray-700 text-[15px]"><strong className="text-gray-900 font-semibold">Available Shares:</strong> {property.sharesAvailable.toLocaleString()}</p>
                  <p className="my-2.5 text-gray-700 text-[15px]"><strong className="text-gray-900 font-semibold">Expected Return:</strong> {property.projectedYield}% annually</p>
                </div>

                <div className="my-5">
                  <label htmlFor="investmentAmount" className="block mb-2 font-semibold text-gray-700">Investment Amount (PKR)</label>
                  <input
                    type="number"
                    id="investmentAmount"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-[#ff5e01]"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder={`Minimum: ${formatCurrency(property.minInvestment)}`}
                    min={property.minInvestment}
                  />
                  {investmentAmount && (
                    <p className="mt-2.5 p-2.5 bg-green-50 rounded-md text-green-700 text-sm">
                      You will receive: <strong>{Math.floor(investmentAmount / property.sharePrice).toLocaleString()}</strong> shares
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    className="py-3 px-6 bg-gray-100 text-gray-600 border-none rounded-lg font-semibold cursor-pointer transition-colors hover:bg-gray-200"
                    onClick={() => setShowInvestModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="py-3 px-6 bg-gradient-to-r from-[#ff5e01] to-[#ff8a3d] text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_12px_rgba(255,94,1,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] animate-fadeIn" onClick={() => setActiveModal(null)}>
            <div className="bg-white rounded-2xl p-[30px] max-w-[90%] max-h-[90%] overflow-auto relative animate-slideUp max-md:max-w-[95%] max-md:p-5" onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-5 right-5 bg-transparent border-none text-4xl text-gray-500 cursor-pointer transition-all w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-[#ff5e01] hover:rotate-90" onClick={() => setActiveModal(null)}>×</button>
              <h3 className="mb-5 text-2xl font-bold text-gray-900">Photo Gallery</h3>
              <div className="grid grid-cols-2 gap-5 mt-5 max-md:grid-cols-1">
                {property.media.gallery.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-[250px] object-cover rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease;
        }
      `}</style>
    </>
  );
}
