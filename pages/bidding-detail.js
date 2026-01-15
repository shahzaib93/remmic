import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  PropertyGallery,
  PropertyGallerySkeleton,
  PropertyMapPanel,
  PropertyMapPanelSkeleton,
  BiddingActionCard,
  BiddingActionCardSkeleton,
  PropertySummary,
  PropertySummarySkeleton,
  ContactUsCard,
  ContactUsCardSkeleton,
  DownloadsSection,
  DownloadsSectionSkeleton,
  PropertyInfoTable,
  PropertyInfoTableSkeleton,
  HelpfulLinks,
  HelpfulLinksSkeleton,
  TermsConditions,
  PromoBanner,
  RegisterModal,
  ViewingModal,
  NotFoundState,
} from '../components/bidding-detail'
import { getPropertyById, formatPricePKR } from '../data/mockProperties'

export default function BiddingDetail() {
  const router = useRouter()
  const { id } = router.query

  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showViewingModal, setShowViewingModal] = useState(false)

  // Load property data
  useEffect(() => {
    if (id) {
      setIsLoading(true)
      setNotFound(false)

      // Simulate API fetch with timeout
      const timer = setTimeout(() => {
        const propertyData = getPropertyById(id)

        if (propertyData) {
          setProperty(propertyData)
          setNotFound(false)
        } else {
          setProperty(null)
          setNotFound(true)
        }

        setIsLoading(false)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [id])

  // Toggle favorite
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  // Show loading state while router is not ready
  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-2xl mb-6" />
              <div className="h-8 w-96 bg-gray-200 rounded mb-4" />
              <div className="h-6 w-64 bg-gray-100 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Show not found state
  if (!isLoading && notFound) {
    return (
      <>
        <Head>
          <title>Property Not Found | REMMIC Auctions</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pt-20 pb-16">
            <NotFoundState propertyId={id} />
          </main>
          <Footer />
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{property?.title || 'Property Details'} | REMMIC Auctions</title>
        <meta
          name="description"
          content={property?.description?.slice(0, 160) || 'View property details and place your bid'}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pt-20 pb-16">
          {/* Hero Section - Gallery + Map */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left - Gallery (60%) */}
                <div className="lg:col-span-3">
                  {isLoading ? (
                    <PropertyGallerySkeleton />
                  ) : (
                    <PropertyGallery
                      images={property?.images || []}
                      hasVideo={property?.hasVideo}
                      has360Tour={property?.has360Tour}
                    />
                  )}
                </div>

                {/* Right - Map Panel (40%) */}
                <div className="lg:col-span-2">
                  {isLoading ? (
                    <PropertyMapPanelSkeleton />
                  ) : (
                    <PropertyMapPanel
                      coordinates={property?.coordinates}
                      address={`${property?.address}, ${property?.city}`}
                      onSave={handleToggleFavorite}
                      isSaved={isFavorite}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Property Title + Meta Row */}
          <section className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    <div className="h-8 w-96 bg-gray-200 rounded" />
                  </div>
                  <div className="h-5 w-64 bg-gray-100 rounded mb-4" />
                  <div className="flex gap-4">
                    <div className="h-10 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-10 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-10 w-32 bg-gray-100 rounded-lg" />
                    <div className="h-10 w-32 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      {property?.badge && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            property.badge === 'Auction'
                              ? 'bg-rose-500 text-white'
                              : property.badge === 'Featured'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {property.badge}
                        </span>
                      )}
                      {property?.type === 'auction' && !property?.badge && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white">
                          Auction
                        </span>
                      )}
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {property?.address}
                      </h1>
                    </div>
                    <button
                      onClick={handleToggleFavorite}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg
                        className={`w-6 h-6 transition-colors ${
                          isFavorite ? 'text-rose-500 fill-rose-500' : 'text-gray-400'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill={isFavorite ? 'currentColor' : 'none'}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Location */}
                  <p className="text-gray-500 mb-4">
                    {property?.city}, {property?.postalCode}, {property?.country}
                  </p>

                  {/* Meta Info Row */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Lot ID:</span> {property?.lotId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Country:</span> {property?.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Tenure:</span> {property?.tenure}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {property?.propertyType}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Price + Bidding Action Panel */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left - Price Info */}
              <div className="lg:col-span-2">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-5 w-72 bg-gray-100 rounded" />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">
                      Guide Price
                    </p>
                    <p className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                      {formatPricePKR(property?.guidePrice || property?.price)}
                    </p>
                    <p className="text-gray-500">
                      A security deposit of{' '}
                      <span className="font-semibold text-gray-700">
                        {formatPricePKR(property?.securityDeposit || 500000)}
                      </span>{' '}
                      is required to participate in bidding.
                    </p>

                    {/* Property Quick Stats */}
                    <div className="mt-6 flex flex-wrap gap-4">
                      {property?.beds > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bedrooms</p>
                            <p className="font-semibold text-gray-900">{property?.beds}</p>
                          </div>
                        </div>
                      )}
                      {property?.baths > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bathrooms</p>
                            <p className="font-semibold text-gray-900">{property?.baths}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Area</p>
                          <p className="font-semibold text-gray-900">{property?.area}</p>
                        </div>
                      </div>
                      {property?.parking && (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Parking</p>
                            <p className="font-semibold text-gray-900">{property?.parking}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Action Card */}
              <div className="lg:col-span-1">
                {isLoading ? (
                  <BiddingActionCardSkeleton />
                ) : (
                  <BiddingActionCard
                    auctionDate={property?.auctionDate}
                    biddingOpens={property?.biddingOpens}
                    biddingCloses={property?.biddingCloses}
                    onRegisterToBid={() => setShowRegisterModal(true)}
                    onBookViewing={() => setShowViewingModal(true)}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Property Summary + Contact Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoading ? (
                <>
                  <PropertySummarySkeleton />
                  <ContactUsCardSkeleton />
                </>
              ) : (
                <>
                  <PropertySummary summaryPoints={property?.summaryPoints} />
                  <ContactUsCard
                    agent={property?.agent}
                    legalContact={property?.legalContact}
                    conveyancing={property?.conveyancing}
                  />
                </>
              )}
            </div>
          </section>

          {/* Downloads Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {isLoading ? (
              <DownloadsSectionSkeleton />
            ) : (
              <DownloadsSection documents={property?.documents} />
            )}
          </section>

          {/* Detailed Information Table */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
              <PropertyInfoTableSkeleton />
            ) : (
              <PropertyInfoTable
                description={property?.description}
                location={property?.location}
                planning={property?.planning}
                tenureDetails={property?.tenureDetails}
                accommodation={property?.accommodation}
                vat={property?.vat}
                additionalInfo={property?.additionalInfo}
                epcRating={property?.epcRating}
                councilTaxBand={property?.councilTaxBand}
              />
            )}
          </section>

          {/* Promo Banner */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PromoBanner />
          </section>

          {/* Helpful Links */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? <HelpfulLinksSkeleton /> : <HelpfulLinks />}
          </section>

          {/* Terms & Conditions */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TermsConditions />
          </section>
        </main>

        <Footer />

        {/* Modals */}
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          propertyTitle={property?.title}
        />
        <ViewingModal
          isOpen={showViewingModal}
          onClose={() => setShowViewingModal(false)}
          propertyTitle={property?.title}
          propertyAddress={property?.address}
        />
      </div>
    </>
  )
}
