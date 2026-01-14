import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Payment() {
  const router = useRouter()
  const { user, loading } = useFirebase()
  const { amount, type, propertyId, propertyTitle } = router.query

  const [paymentMethod, setPaymentMethod] = useState('')
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    accountNumber: '',
    accountTitle: '',
    transactionId: '',
    bank: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath))
    }
  }, [user, loading, router])

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Transfer directly from your bank account',
      processingTime: '2-3 business days'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: '📱',
      description: 'Pay using your JazzCash mobile wallet',
      processingTime: 'Instant'
    },
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: '📲',
      description: 'Pay using your EasyPaisa account',
      processingTime: 'Instant'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, UnionPay accepted',
      processingTime: 'Instant'
    }
  ]

  const bankDetails = {
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'REMMIC Real Estate Pvt Ltd',
    accountNumber: '1234-5678-9012-3456',
    iban: 'PK36HABB0001234567890123',
    branchCode: '1234'
  }

  const formatCurrency = (value) => {
    if (!value) return 'PKR 0'
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method)
    setStep(2)
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    setProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setStep(3)
    }, 2000)
  }

  const handleInputChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Payment - REMMIC</title>
        <meta name="description" content="Complete your payment securely on REMMIC" />
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="main-wrapper">
          <section className="payment-section">
            <div className="payment-container">
              {/* Progress Steps */}
              <div className="payment-steps">
                <div className={`payment-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                  <span className="payment-step__number">1</span>
                  <span className="payment-step__label">Select Method</span>
                </div>
                <div className="payment-step__line"></div>
                <div className={`payment-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                  <span className="payment-step__number">2</span>
                  <span className="payment-step__label">Payment Details</span>
                </div>
                <div className="payment-step__line"></div>
                <div className={`payment-step ${step >= 3 ? 'active' : ''}`}>
                  <span className="payment-step__number">3</span>
                  <span className="payment-step__label">Confirmation</span>
                </div>
              </div>

              <div className="payment-content">
                {/* Order Summary */}
                <div className="payment-summary">
                  <h3>Payment Summary</h3>
                  <div className="payment-summary__item">
                    <span>Payment Type</span>
                    <span>{type || 'Investment'}</span>
                  </div>
                  {propertyTitle && (
                    <div className="payment-summary__item">
                      <span>Property</span>
                      <span>{propertyTitle}</span>
                    </div>
                  )}
                  <div className="payment-summary__item payment-summary__total">
                    <span>Total Amount</span>
                    <span>{formatCurrency(amount || 0)}</span>
                  </div>
                </div>

                {/* Step 1: Select Payment Method */}
                {step === 1 && (
                  <div className="payment-methods">
                    <h2>Select Payment Method</h2>
                    <div className="payment-methods__grid">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                          onClick={() => handlePaymentMethodSelect(method.id)}
                        >
                          <span className="payment-method-card__icon">{method.icon}</span>
                          <span className="payment-method-card__name">{method.name}</span>
                          <span className="payment-method-card__desc">{method.description}</span>
                          <span className="payment-method-card__time">{method.processingTime}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Details */}
                {step === 2 && (
                  <div className="payment-details">
                    <button className="payment-back" onClick={() => setStep(1)}>
                      ← Back to payment methods
                    </button>

                    <h2>Payment Details</h2>

                    {paymentMethod === 'bank' && (
                      <div className="bank-transfer-info">
                        <div className="bank-details">
                          <h4>Transfer to this account:</h4>
                          <div className="bank-details__row">
                            <span>Bank Name</span>
                            <span>{bankDetails.bankName}</span>
                          </div>
                          <div className="bank-details__row">
                            <span>Account Title</span>
                            <span>{bankDetails.accountTitle}</span>
                          </div>
                          <div className="bank-details__row">
                            <span>Account Number</span>
                            <span>{bankDetails.accountNumber}</span>
                          </div>
                          <div className="bank-details__row">
                            <span>IBAN</span>
                            <span>{bankDetails.iban}</span>
                          </div>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="payment-form">
                          <h4>Confirm your transfer details:</h4>
                          <div className="form-group">
                            <label>Your Bank</label>
                            <select name="bank" value={paymentDetails.bank} onChange={handleInputChange} required>
                              <option value="">Select bank</option>
                              <option value="hbl">HBL</option>
                              <option value="mcb">MCB</option>
                              <option value="ubl">UBL</option>
                              <option value="abl">ABL</option>
                              <option value="meezan">Meezan Bank</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Transaction Reference / ID</label>
                            <input
                              type="text"
                              name="transactionId"
                              value={paymentDetails.transactionId}
                              onChange={handleInputChange}
                              placeholder="Enter transaction reference number"
                              required
                            />
                          </div>
                          <button type="submit" className="payment-submit" disabled={processing}>
                            {processing ? 'Processing...' : 'Confirm Payment'}
                          </button>
                        </form>
                      </div>
                    )}

                    {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                      <div className="mobile-wallet-info">
                        <p className="wallet-instruction">
                          Send payment to the following {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} account:
                        </p>
                        <div className="wallet-number">
                          <span className="wallet-number__label">Account Number</span>
                          <span className="wallet-number__value">0300-1234567</span>
                        </div>
                        <div className="wallet-number">
                          <span className="wallet-number__label">Account Title</span>
                          <span className="wallet-number__value">REMMIC PVT LTD</span>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="payment-form">
                          <div className="form-group">
                            <label>Your Mobile Number</label>
                            <input
                              type="tel"
                              name="accountNumber"
                              value={paymentDetails.accountNumber}
                              onChange={handleInputChange}
                              placeholder="03XX-XXXXXXX"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Transaction ID</label>
                            <input
                              type="text"
                              name="transactionId"
                              value={paymentDetails.transactionId}
                              onChange={handleInputChange}
                              placeholder="Enter transaction ID from SMS"
                              required
                            />
                          </div>
                          <button type="submit" className="payment-submit" disabled={processing}>
                            {processing ? 'Processing...' : 'Confirm Payment'}
                          </button>
                        </form>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="card-payment">
                        <form onSubmit={handleSubmitPayment} className="payment-form">
                          <div className="form-group">
                            <label>Card Number</label>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              maxLength="19"
                              required
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Expiry Date</label>
                              <input type="text" placeholder="MM/YY" maxLength="5" required />
                            </div>
                            <div className="form-group">
                              <label>CVV</label>
                              <input type="text" placeholder="123" maxLength="4" required />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Cardholder Name</label>
                            <input type="text" placeholder="Name on card" required />
                          </div>
                          <button type="submit" className="payment-submit" disabled={processing}>
                            {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <div className="payment-confirmation">
                    <div className="confirmation-icon">✓</div>
                    <h2>Payment Submitted Successfully!</h2>
                    <p>
                      Your payment of <strong>{formatCurrency(amount)}</strong> has been submitted for verification.
                    </p>
                    <p className="confirmation-note">
                      You will receive a confirmation email once your payment is verified.
                      This usually takes 1-2 business days for bank transfers and within hours for digital payments.
                    </p>
                    <div className="confirmation-actions">
                      <a href="/dashboard" className="confirmation-btn confirmation-btn--primary">
                        Go to Dashboard
                      </a>
                      <a href="/wallet" className="confirmation-btn confirmation-btn--secondary">
                        View Wallet
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f9f9f9;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #eee;
          border-top-color: #D4AF37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .payment-section {
          padding: 100px 20px 60px;
          background: #f5f5f5;
          min-height: 100vh;
        }
        .payment-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .payment-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
          gap: 8px;
        }
        .payment-step {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .payment-step__number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ddd;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        .payment-step.active .payment-step__number {
          background: #D4AF37;
          color: #1a1a1a;
        }
        .payment-step.completed .payment-step__number {
          background: #2e7d32;
          color: #fff;
        }
        .payment-step__label {
          font-size: 14px;
          color: #666;
        }
        .payment-step.active .payment-step__label {
          color: #1a1a1a;
          font-weight: 600;
        }
        .payment-step__line {
          width: 60px;
          height: 2px;
          background: #ddd;
        }

        .payment-content {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .payment-summary {
          background: #f9f9f9;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }
        .payment-summary h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        .payment-summary__item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #666;
        }
        .payment-summary__total {
          border-top: 1px solid #ddd;
          margin-top: 12px;
          padding-top: 16px;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .payment-methods h2,
        .payment-details h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #1a1a1a;
        }
        .payment-methods__grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .payment-method-card {
          background: #fff;
          border: 2px solid #eee;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .payment-method-card:hover {
          border-color: #D4AF37;
        }
        .payment-method-card.selected {
          border-color: #D4AF37;
          background: #fffbf0;
        }
        .payment-method-card__icon {
          font-size: 36px;
          display: block;
          margin-bottom: 12px;
        }
        .payment-method-card__name {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        .payment-method-card__desc {
          display: block;
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }
        .payment-method-card__time {
          display: inline-block;
          font-size: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .payment-back {
          background: none;
          border: none;
          color: #666;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 20px;
          padding: 0;
        }
        .payment-back:hover {
          color: #D4AF37;
        }

        .bank-details,
        .wallet-number {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }
        .bank-details h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        .bank-details__row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }
        .bank-details__row:last-child {
          border-bottom: none;
        }
        .bank-details__row span:first-child {
          color: #666;
        }
        .bank-details__row span:last-child {
          font-weight: 600;
          color: #1a1a1a;
        }

        .wallet-instruction {
          color: #666;
          margin-bottom: 16px;
        }
        .wallet-number {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .wallet-number__label {
          color: #666;
          font-size: 14px;
        }
        .wallet-number__value {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .payment-form h4 {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
        }
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #D4AF37;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .payment-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(90deg, #D4AF37, #F4D03F);
          color: #1a1a1a;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
          margin-top: 12px;
        }
        .payment-submit:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .payment-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .payment-confirmation {
          text-align: center;
          padding: 40px 20px;
        }
        .confirmation-icon {
          width: 80px;
          height: 80px;
          background: #2e7d32;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
        }
        .payment-confirmation h2 {
          font-size: 28px;
          margin-bottom: 16px;
          color: #1a1a1a;
        }
        .payment-confirmation p {
          font-size: 16px;
          color: #666;
          margin-bottom: 12px;
        }
        .confirmation-note {
          font-size: 14px;
          color: #888;
          max-width: 500px;
          margin: 0 auto 32px;
        }
        .confirmation-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .confirmation-btn {
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .confirmation-btn:hover {
          transform: translateY(-2px);
        }
        .confirmation-btn--primary {
          background: #1a1a1a;
          color: #fff;
        }
        .confirmation-btn--secondary {
          background: #f0f0f0;
          color: #1a1a1a;
        }

        @media (max-width: 768px) {
          .payment-methods__grid {
            grid-template-columns: 1fr;
          }
          .payment-steps {
            flex-wrap: wrap;
          }
          .payment-step__label {
            display: none;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
