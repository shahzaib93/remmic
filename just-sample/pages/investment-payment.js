import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import InvestorDashboard from '../components/InvestorDashboard'
import PaymentProcessor from '../components/PaymentProcessor'
import { getUserInvestments } from '../lib/firebase'
import { useFirebase } from '../contexts/FirebaseContext'
// Removed mock data import

export default function InvestmentPayment() {
  const router = useRouter()
  const { id, title, min } = router.query
  const { user, loading: authLoading, getAllProperties } = useFirebase()
  const [investments, setInvestments] = useState([])
  const [step, setStep] = useState(1) // 1: Payment, 2: Verification, 3: Dashboard
  const [paymentResult, setPaymentResult] = useState(null)
  const [propertyInfo, setPropertyInfo] = useState(null)
  const [propertyLoading, setPropertyLoading] = useState(false)

  // Demo data initialization removed - using real data only

  useEffect(() => {
    let isMounted = true
    const fetchProperty = async () => {
      if (!id) {
        setPropertyInfo(null)
        return
      }

      setPropertyLoading(true)

      try {
        let property = null

        if (typeof getAllProperties === 'function') {
          try {
            const response = await getAllProperties()
            if (response?.success && Array.isArray(response.properties)) {
              property = response.properties.find((item) => {
                const identifier = item?.id || item?.propertyId
                return identifier && identifier.toString() === id.toString()
              })
            }
          } catch (error) {
            console.warn('Failed to load properties from remote for investment payment:', error)
          }
        }

        if (!property && typeof window !== 'undefined') {
          try {
            const cached = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
            property = cached.find((item) => {
              const identifier = item?.id || item?.propertyId
              return identifier && identifier.toString() === id.toString()
            })
          } catch (error) {
            console.warn('Failed to load property from local cache for investment payment:', error)
          }
        }

        if (isMounted) {
          setPropertyInfo(property || null)
        }
      } finally {
        if (isMounted) {
          setPropertyLoading(false)
        }
      }
    }

    fetchProperty()

    return () => {
      isMounted = false
    }
  }, [getAllProperties, id])

  // Check authentication
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  const handlePaymentSuccess = async (result) => {
    setPaymentResult(result)
    setStep(2) // Move to verification step
    
    // Load updated investments
    try {
      const investmentResult = await getUserInvestments()
      if (investmentResult.success) {
        setInvestments(investmentResult.investments)
      }
    } catch (error) {
      console.error('Error loading investments:', error)
    }
    
    // Auto-proceed to dashboard after 2 seconds
    setTimeout(() => {
      setStep(3)
    }, 2000)
  }

  const handlePaymentError = (error) => {
    alert('Payment failed: ' + error)
  }

  // Get property details from URL or use defaults
  const shareOffering = propertyInfo?.shareOffering || {}

  const propertyDetails = {
    id: id || propertyInfo?.id || 'demo-property',
    title: title || propertyInfo?.title || 'Model Town Residency',
    sharePrice: Number(shareOffering?.sharePrice) || parseInt(min) || 50000,
    totalShares: Number(shareOffering?.totalShares) || 400,
    sharesAvailable: Number(shareOffering?.sharesAvailable ?? shareOffering?.totalShares) || Number(shareOffering?.totalShares) || 400,
    type: propertyInfo?.type || 'Real Estate'
  }

  if (authLoading || !user || propertyLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading payment system...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Investment Payment - REMMIC</title>
        <meta name="description" content="Complete your real estate investment payment" />
      </Head>
      
      <Navbar />
      
      {/* Payment Step */}
      {step === 1 && (
        <div style={{ 
          minHeight: '100vh', 
          background: '#f9fafb',
          paddingTop: '80px',
          paddingBottom: '40px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* Progress Steps */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', margin: '0 auto 8px' }}>1</div>
                  <span style={{ fontSize: '12px', color: '#000' }}>Payment</span>
                </div>
                <div style={{ width: '100px', height: '2px', background: '#e5e7eb' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', margin: '0 auto 8px' }}>2</div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Verification</span>
                </div>
                <div style={{ width: '100px', height: '2px', background: '#e5e7eb' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', margin: '0 auto 8px' }}>3</div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Dashboard</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1f2937', marginBottom: '10px' }}>
                Fractional Real Estate Investment
              </h1>
              <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
                Own a piece of {propertyDetails.title} starting from PKR {parseInt(propertyDetails.sharePrice).toLocaleString()}
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                ðŸ”’ Funds held in escrow â€¢ ðŸ¢ Property in separate LLC â€¢ ðŸ’° Monthly rental income
              </p>
            </div>

            <PaymentProcessor
              propertyId={propertyDetails.id}
              propertyTitle={propertyDetails.title}
              propertyType={propertyDetails.type}
              sharePrice={propertyDetails.sharePrice}
              totalPropertyValue={Number(propertyInfo?.price) || 20000000}
              totalShares={propertyDetails.totalShares}
              shareOffering={shareOffering}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>
      )}

      {/* Verification Step */}
      {step === 2 && (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f9fafb',
          paddingTop: '80px'
        }}>
          <div style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%',
            margin: '0 20px'
          }}>
            {/* Progress Steps */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', margin: '0 auto 8px' }}>âœ“</div>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>Payment</span>
                </div>
                <div style={{ width: '100px', height: '2px', background: '#10b981' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', margin: '0 auto 8px' }}>2</div>
                  <span style={{ fontSize: '12px', color: '#000' }}>Verification</span>
                </div>
                <div style={{ width: '100px', height: '2px', background: '#e5e7eb' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', margin: '0 auto 8px' }}>3</div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Dashboard</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '60px', marginBottom: '20px' }}>ðŸŽ‰</div>
            <h2 style={{ marginBottom: '20px', color: '#10b981' }}>Payment Successful!</h2>
            
            {paymentResult && (
              <div style={{ 
                background: '#f0fdf4', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid #bbf7d0',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Transaction ID:</strong> {paymentResult.transactionId}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Amount Invested:</strong> PKR {paymentResult.amount?.toLocaleString()}
                </div>
                <div>
                  <strong>Shares Purchased:</strong> {paymentResult.shares}
                </div>
              </div>
            )}
            
            <p style={{ marginBottom: '20px', color: '#6b7280' }}>
              Verifying your investment... You will be redirected to your dashboard shortly.
            </p>

            <div style={{ 
              width: '100%', 
              background: '#e5e7eb', 
              borderRadius: '8px', 
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '100%', 
                background: '#10b981', 
                height: '100%',
                animation: 'loading 2s ease-in-out'
              }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Step */}
      {step === 3 && <InvestorDashboard user={user} investments={investments} />}
    </>
  )
}
