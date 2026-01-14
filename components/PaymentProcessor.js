import React, { useEffect, useMemo, useState } from 'react'
import { addInvestment } from '../lib/firebase'
import { useFirebase } from '../contexts/FirebaseContext'

const readStoredUser = () => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem('userData')
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('Failed to parse stored user data:', error)
    return null
  }
}

const PaymentProcessor = ({
  propertyId,
  propertyTitle,
  propertyType = 'Real Estate',
  sharePrice,
  totalPropertyValue = 20000000, // Total property value for ownership calculation
  totalShares = 400, // Total shares available
  shareOffering = {},
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { user: authUser, loading: authLoading } = useFirebase()
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const normalizedSharePrice = useMemo(() => {
    const offeringPrice = Number(shareOffering?.sharePrice)
    if (Number.isFinite(offeringPrice) && offeringPrice > 0) return offeringPrice
    return Number(sharePrice) || 0
  }, [shareOffering?.sharePrice, sharePrice])

  const normalizedSharesAvailable = useMemo(() => {
    const available = Number(shareOffering?.sharesAvailable)
    if (Number.isFinite(available) && available >= 0) return available
    return Number(shareOffering?.totalShares)
  }, [shareOffering?.sharesAvailable, shareOffering?.totalShares])

  const normalizedTotalShares = useMemo(() => {
    const total = Number(shareOffering?.totalShares)
    if (Number.isFinite(total) && total > 0) return total
    const fallback = Number(totalShares)
    if (Number.isFinite(fallback) && fallback > 0) return fallback
    return 0
  }, [shareOffering?.totalShares, totalShares])

  const normalizedMinShares = useMemo(() => {
    const minShares = Number(shareOffering?.minSharesPerInvestor)
    if (Number.isFinite(minShares) && minShares > 0) return minShares
    return 1
  }, [shareOffering?.minSharesPerInvestor])

  const defaultShares = Math.max(normalizedMinShares, 1)
  const baselineTotalForOwnership = normalizedSharesAvailable > 0
    ? normalizedSharesAvailable
    : normalizedTotalShares

  const [paymentData, setPaymentData] = useState({
    shares: defaultShares,
    amount: defaultShares * normalizedSharePrice,
    paymentMethod: 'escrow', // Default to escrow like Vairt
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    email: '',
    phone: '',
    agreeToTerms: false,
    agreeToEscrow: false,
    ownershipPercentage: baselineTotalForOwnership > 0
      ? (defaultShares / baselineTotalForOwnership) * 100
      : 0,
    propertyContextId: propertyId,
  })

  useEffect(() => {
    if (authUser) {
      const stored = readStoredUser()
      const merged = stored && stored.id === authUser.id ? stored : {
        id: authUser.id || authUser.uid,
        email: authUser.email || stored?.email || '',
        name: authUser.name || authUser.displayName || stored?.name || '',
      }
      setUser(merged)
      setPaymentData(prev => ({
        ...prev,
        email: merged.email || prev.email,
      }))
    } else if (!authLoading) {
      setUser(null)
    }
  }, [authUser, authLoading])

  const isLoggedIn = useMemo(() => Boolean(user && (user.id || user.uid || user.email)), [user])

  useEffect(() => {
    if (!propertyId) return

    setPaymentData(prev => {
      const baselineShares = Math.max(normalizedMinShares, 1)
      const isSameProperty = prev.propertyContextId === propertyId
      const previousShares = isSameProperty ? Math.max(prev.shares, baselineShares) : baselineShares
      const shares = Number.isFinite(previousShares) ? previousShares : baselineShares
      const totalForOwnership = normalizedSharesAvailable > 0
        ? normalizedSharesAvailable
        : normalizedTotalShares

      return {
        ...prev,
        propertyContextId: propertyId,
        shares,
        amount: shares * normalizedSharePrice,
        ownershipPercentage: totalForOwnership > 0 ? (shares / totalForOwnership) * 100 : prev.ownershipPercentage,
      }
    })
  }, [propertyId, normalizedMinShares, normalizedSharePrice, normalizedSharesAvailable, normalizedTotalShares])

  const handleInputChange = (field, value) => {
    setFormError('')
    if (field === 'shares') {
      const parsed = parseInt(value, 10)
      const safeValue = Number.isFinite(parsed) ? parsed : 0
      const maxPurchasable = normalizedSharesAvailable > 0
        ? normalizedSharesAvailable
        : normalizedTotalShares > 0
          ? normalizedTotalShares
          : Number.MAX_SAFE_INTEGER
      const shares = Math.min(Math.max(normalizedMinShares, safeValue), maxPurchasable)
      const totalForOwnership = normalizedSharesAvailable > 0
        ? normalizedSharesAvailable
        : normalizedTotalShares
      setPaymentData(prev => ({
        ...prev,
        shares,
        amount: shares * normalizedSharePrice,
        ownershipPercentage: totalForOwnership > 0 ? (shares / totalForOwnership) * 100 : prev.ownershipPercentage,
      }))
    } else {
      setPaymentData(prev => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const validatePayment = () => {
    const errors = []
    if (!paymentData.shares || paymentData.shares < 1) {
      errors.push('Number of shares must be at least 1')
    }
    if (!paymentData.agreeToTerms) {
      errors.push('You must agree to the terms and conditions')
    }
    if (!paymentData.agreeToEscrow) {
      errors.push('You must agree to the escrow arrangement')
    }
    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s+/g, '').length < 16) {
        errors.push('Please enter a valid card number')
      }
      if (!paymentData.expiryDate || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentData.expiryDate)) {
        errors.push('Please enter expiry date in MM/YY format')
      }
      if (!paymentData.cvv || paymentData.cvv.length < 3) {
        errors.push('Please enter a valid CVV')
      }
      if (!paymentData.cardHolder.trim()) {
        errors.push('Please enter card holder name')
      }
    }
    if (!paymentData.email || !paymentData.email.includes('@')) {
      errors.push('Please enter a valid email')
    }
    return errors
  }

  const processPayment = async () => {
    if (!isLoggedIn) {
      setFormError('Please login to make an investment')
      onPaymentError?.('Please login to make an investment')
      return
    }

    const validationErrors = validatePayment()
    if (validationErrors.length > 0) {
      const message = validationErrors.join(', ')
      setFormError(message)
      onPaymentError?.(message)
      return
    }

    setLoading(true)
    setFormError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const sharesAvailableBefore = normalizedSharesAvailable > 0
        ? normalizedSharesAvailable
        : normalizedTotalShares

      const investmentData = {
        propertyId,
        propertyTitle,
        propertyType,
        amount: paymentData.amount,
        shares: paymentData.shares,
        sharePrice: normalizedSharePrice,
        ownershipPercentage: paymentData.ownershipPercentage,
        shareSnapshot: {
          totalShares: normalizedTotalShares,
          sharesAvailableBefore: Number.isFinite(sharesAvailableBefore) ? sharesAvailableBefore : null,
          sharesAvailableAfter: Number.isFinite(sharesAvailableBefore)
            ? Math.max(sharesAvailableBefore - paymentData.shares, 0)
            : null,
          minSharesPerInvestor: normalizedMinShares,
          sharePrice: normalizedSharePrice,
        },
        paymentMethod: paymentData.paymentMethod,
        paymentDetails: {
          cardLast4: paymentData.cardNumber.slice(-4),
          cardHolder: paymentData.cardHolder,
          email: paymentData.email,
          phone: paymentData.phone,
        },
        transactionId: `TXN-${Date.now()}`,
        status: 'completed',
      }

      const result = await addInvestment(investmentData)
      if (result.success) {
        onPaymentSuccess?.({
          investment: result.investment,
          transactionId: investmentData.transactionId,
          amount: paymentData.amount,
          shares: paymentData.shares,
        })
      } else {
        const message = result.error || 'Payment processing failed'
        setFormError(message)
        onPaymentError?.(message)
      }
    } catch (error) {
      const message = error.message || 'Payment processing failed'
      setFormError(message)
      onPaymentError?.(message)
    } finally {
      setLoading(false)
    }
  }

  const effectiveTotalShares = normalizedSharesAvailable > 0
    ? normalizedSharesAvailable
    : (normalizedTotalShares || Number(totalShares) || 1)

  const formatCurrency = (amount) => `PKR ${Number(amount || 0).toLocaleString()}`

  return (
    <div
      style={{
        background: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <h3 style={{ textAlign: 'center', marginBottom: '25px', color: '#1f2937' }}>
        Complete Your Investment
      </h3>

      <div
        style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '25px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h4 style={{ color: '#374151', marginBottom: '15px' }}>Fractional Ownership Summary</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Property:</span>
          <span style={{ fontWeight: '600' }}>{propertyTitle}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Total Property Value:</span>
          <span style={{ fontWeight: '600' }}>{formatCurrency(totalPropertyValue)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Price Per Share:</span>
          <span style={{ fontWeight: '600' }}>{formatCurrency(normalizedSharePrice)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Number of Shares:</span>
          <input
            type="number"
            min="1"
            max={normalizedSharesAvailable > 0 ? normalizedSharesAvailable : normalizedTotalShares || totalShares}
            value={paymentData.shares}
            onChange={(event) => handleInputChange('shares', event.target.value)}
            style={{
              width: '80px',
              padding: '5px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              textAlign: 'center',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span>Your Ownership:</span>
          <span style={{ fontWeight: '600', color: '#ff5e01' }}>
            {paymentData.ownershipPercentage.toFixed(3)}% of property
          </span>
        </div>
        <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
          <span>Total Investment:</span>
          <span style={{ color: '#ff5e01' }}>{formatCurrency(paymentData.amount)}</span>
        </div>
        
        {/* Escrow Information */}
        <div style={{ 
          marginTop: '15px', 
          padding: '12px', 
          background: '#fef7ed', 
          borderRadius: '6px',
          border: '1px solid #fed7aa'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '5px' }}>
            ðŸ”’ Escrow Protection
          </div>
          <div style={{ fontSize: '11px', color: '#78350f' }}>
            Your funds will be held in a secure escrow account until the investment is verified by our third-party valuator.
          </div>
        </div>
      </div>

      {!isLoggedIn && !authLoading && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            color: '#92400e',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          Please sign in to continue with your investment.
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Payment Method
        </label>
        <select
          value={paymentData.paymentMethod}
          onChange={(event) => handleInputChange('paymentMethod', event.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value="escrow">ðŸ”’ Secure Escrow Account (Recommended)</option>
          <option value="card">Credit/Debit Card</option>
          <option value="bank">Bank Transfer</option>
          <option value="wire">Wire Transfer</option>
        </select>
        
        {paymentData.paymentMethod === 'escrow' && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#f0fdf4', 
            borderRadius: '6px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '5px', fontWeight: '600' }}>
              âœ“ Enhanced Security
            </div>
            <div style={{ fontSize: '11px', color: '#047857' }}>
              Funds held securely until property verification is complete. Same process used by leading fractional real estate platforms.
            </div>
          </div>
        )}
      </div>

      {/* Terms and Agreements */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          background: '#fef7ed', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          marginBottom: '15px'
        }}>
          <h4 style={{ color: '#92400e', marginBottom: '10px', fontSize: '14px' }}>
            Investment Terms & Conditions
          </h4>
          <div style={{ fontSize: '12px', color: '#78350f', lineHeight: '1.4', marginBottom: '10px' }}>
            â€¢ Property will be held in a separate LLC owned by investors<br/>
            â€¢ Minimum 5-year investment commitment recommended<br/>
            â€¢ Monthly rental income distributed proportionally<br/>
            â€¢ Exit options: Secondary market or property sale vote<br/>
            â€¢ Third-party property valuation before closing
          </div>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={paymentData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '12px', color: '#374151' }}>
              I agree to the Terms & Conditions and understand this is a long-term investment
            </span>
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={paymentData.agreeToEscrow}
              onChange={(e) => handleInputChange('agreeToEscrow', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span style={{ fontSize: '12px', color: '#374151' }}>
              I consent to escrow arrangement and third-party property verification process
            </span>
          </label>
        </div>
      </div>

      {/* Payment Details - Only show if not escrow or if card is selected */}
      {paymentData.paymentMethod === 'card' && (
        <>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Card Number
        </label>
        <input
          type="text"
          maxLength={19}
          value={paymentData.cardNumber}
          onChange={(event) => handleInputChange('cardNumber', event.target.value)}
          placeholder="1234 5678 9012 3456"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Expiry Date (MM/YY)
          </label>
          <input
            type="text"
            maxLength={5}
            value={paymentData.expiryDate}
            onChange={(event) => handleInputChange('expiryDate', event.target.value)}
            placeholder="08/26"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            CVV
          </label>
          <input
            type="password"
            maxLength={4}
            value={paymentData.cvv}
            onChange={(event) => handleInputChange('cvv', event.target.value)}
            placeholder="123"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Card Holder Name
        </label>
        <input
          type="text"
          value={paymentData.cardHolder}
          onChange={(event) => handleInputChange('cardHolder', event.target.value)}
          placeholder="As shown on card"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Contact Email
        </label>
        <input
          type="email"
          value={paymentData.email}
          onChange={(event) => handleInputChange('email', event.target.value)}
          placeholder="you@example.com"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Contact Phone (optional)
        </label>
        <input
          type="tel"
          value={paymentData.phone}
          onChange={(event) => handleInputChange('phone', event.target.value)}
          placeholder="0300 0000000"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>
        </>
      )}

      {/* Contact Information - Always show */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Contact Email
        </label>
        <input
          type="email"
          value={paymentData.email}
          onChange={(event) => handleInputChange('email', event.target.value)}
          placeholder="you@example.com"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          Contact Phone (optional)
        </label>
        <input
          type="tel"
          value={paymentData.phone}
          onChange={(event) => handleInputChange('phone', event.target.value)}
          placeholder="0300 0000000"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      {formError && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#fee2e2',
            border: '1px solid #f87171',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '14px',
          }}
        >
          {formError}
        </div>
      )}

      <button
        type="button"
        onClick={processPayment}
        disabled={loading || !isLoggedIn}
        style={{
          width: '100%',
          background: loading ? '#4b5563' : isLoggedIn ? '#1f2937' : '#6b7280',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontWeight: '700',
          cursor: loading ? 'wait' : isLoggedIn ? 'pointer' : 'not-allowed',
          transition: 'background 0.3s ease',
        }}
      >
        {loading ? 'Processing...' : paymentData.paymentMethod === 'escrow' ? 'Submit to Escrow & Verify' : 'Confirm Investment'}
      </button>
    </div>
  )
}

export default PaymentProcessor
