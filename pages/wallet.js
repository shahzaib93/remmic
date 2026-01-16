import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'
import { useRouter } from 'next/router'

export default function Wallet() {
  const { user, loading } = useFirebase()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Mock wallet data - in production this would come from Firebase
  const [walletData] = useState({
    balance: 250000,
    invested: 1500000,
    pendingReturns: 45000,
    totalEarnings: 185000
  })

  const [transactions] = useState([
    { id: 1, type: 'deposit', amount: 100000, date: '2024-12-28', status: 'completed', method: 'Bank Transfer' },
    { id: 2, type: 'investment', amount: -50000, date: '2024-12-25', status: 'completed', property: 'DHA Phase 5 Plot' },
    { id: 3, type: 'return', amount: 15000, date: '2024-12-20', status: 'completed', property: 'Bahria Town Apartment' },
    { id: 4, type: 'deposit', amount: 200000, date: '2024-12-15', status: 'completed', method: 'JazzCash' },
    { id: 5, type: 'withdrawal', amount: -50000, date: '2024-12-10', status: 'completed', method: 'Bank Transfer' },
    { id: 6, type: 'return', amount: 30000, date: '2024-12-05', status: 'completed', property: 'F-10 Commercial' }
  ])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/wallet')
    }
  }, [user, loading, router])

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleDeposit = (e) => {
    e.preventDefault()
    alert(`Deposit request for ${formatCurrency(depositAmount)} submitted. You will receive payment instructions via email.`)
    setShowDepositModal(false)
    setDepositAmount('')
  }

  const handleWithdraw = (e) => {
    e.preventDefault()
    if (parseInt(withdrawAmount) > walletData.balance) {
      alert('Insufficient balance')
      return
    }
    alert(`Withdrawal request for ${formatCurrency(withdrawAmount)} submitted. Funds will be transferred within 2-3 business days.`)
    setShowWithdrawModal(false)
    setWithdrawAmount('')
  }

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return '↓'
      case 'withdrawal': return '↑'
      case 'investment': return '📊'
      case 'return': return '💰'
      default: return '•'
    }
  }

  const getTransactionColor = (type) => {
    switch(type) {
      case 'deposit': return '#2e7d32'
      case 'return': return '#2e7d32'
      case 'withdrawal': return '#c62828'
      case 'investment': return '#1565c0'
      default: return '#666'
    }
  }

  return (
    <>
      <Head>
        <title>Wallet - REMMIC</title>
        <meta name="description" content="Manage your REMMIC wallet, deposits, withdrawals and transaction history" />
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="pt-24">
          <section className="wallet-section">
            <div className="wallet-container">
              <h1 className="wallet-title">My Wallet</h1>

              {/* Balance Cards */}
              <div className="wallet-cards">
                <div className="wallet-card wallet-card--primary">
                  <span className="wallet-card__label">Available Balance</span>
                  <span className="wallet-card__amount">{formatCurrency(walletData.balance)}</span>
                  <div className="wallet-card__actions">
                    <button onClick={() => setShowDepositModal(true)} className="wallet-btn wallet-btn--deposit">
                      + Deposit
                    </button>
                    <button onClick={() => setShowWithdrawModal(true)} className="wallet-btn wallet-btn--withdraw">
                      ↑ Withdraw
                    </button>
                  </div>
                </div>

                <div className="wallet-stats">
                  <div className="wallet-stat">
                    <span className="wallet-stat__icon">📊</span>
                    <div>
                      <span className="wallet-stat__label">Total Invested</span>
                      <span className="wallet-stat__value">{formatCurrency(walletData.invested)}</span>
                    </div>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-stat__icon">⏳</span>
                    <div>
                      <span className="wallet-stat__label">Pending Returns</span>
                      <span className="wallet-stat__value">{formatCurrency(walletData.pendingReturns)}</span>
                    </div>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-stat__icon">💰</span>
                    <div>
                      <span className="wallet-stat__label">Total Earnings</span>
                      <span className="wallet-stat__value wallet-stat__value--green">{formatCurrency(walletData.totalEarnings)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="wallet-tabs">
                <button
                  className={`wallet-tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  All Transactions
                </button>
                <button
                  className={`wallet-tab ${activeTab === 'deposits' ? 'active' : ''}`}
                  onClick={() => setActiveTab('deposits')}
                >
                  Deposits
                </button>
                <button
                  className={`wallet-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('withdrawals')}
                >
                  Withdrawals
                </button>
                <button
                  className={`wallet-tab ${activeTab === 'returns' ? 'active' : ''}`}
                  onClick={() => setActiveTab('returns')}
                >
                  Returns
                </button>
              </div>

              {/* Transactions List */}
              <div className="transactions">
                <h3 className="transactions__title">Transaction History</h3>
                {transactions
                  .filter(t => {
                    if (activeTab === 'deposits') return t.type === 'deposit'
                    if (activeTab === 'withdrawals') return t.type === 'withdrawal'
                    if (activeTab === 'returns') return t.type === 'return'
                    return true
                  })
                  .map((transaction) => (
                  <div key={transaction.id} className="transaction">
                    <div className="transaction__icon" style={{ background: getTransactionColor(transaction.type) }}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction__details">
                      <span className="transaction__type">
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                      <span className="transaction__meta">
                        {transaction.property || transaction.method} • {transaction.date}
                      </span>
                    </div>
                    <div className="transaction__amount" style={{ color: transaction.amount > 0 ? '#2e7d32' : '#c62828' }}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <span className={`transaction__status transaction__status--${transaction.status}`}>
                      {transaction.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="payment-methods">
                <h3 className="payment-methods__title">Payment Methods</h3>
                <div className="payment-methods__grid">
                  <div className="payment-method">
                    <span className="payment-method__icon">🏦</span>
                    <span className="payment-method__name">Bank Transfer</span>
                    <span className="payment-method__desc">2-3 business days</span>
                  </div>
                  <div className="payment-method">
                    <span className="payment-method__icon">📱</span>
                    <span className="payment-method__name">JazzCash</span>
                    <span className="payment-method__desc">Instant</span>
                  </div>
                  <div className="payment-method">
                    <span className="payment-method__icon">📲</span>
                    <span className="payment-method__name">EasyPaisa</span>
                    <span className="payment-method__desc">Instant</span>
                  </div>
                  <div className="payment-method">
                    <span className="payment-method__icon">💳</span>
                    <span className="payment-method__name">Credit/Debit Card</span>
                    <span className="payment-method__desc">Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Deposit Funds</h2>
              <form onSubmit={handleDeposit}>
                <div className="modal__field">
                  <label>Amount (PKR)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1000"
                    required
                  />
                </div>
                <div className="modal__field">
                  <label>Payment Method</label>
                  <select required>
                    <option value="">Select method</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="card">Credit/Debit Card</option>
                  </select>
                </div>
                <div className="modal__actions">
                  <button type="button" onClick={() => setShowDepositModal(false)} className="modal__btn modal__btn--cancel">Cancel</button>
                  <button type="submit" className="modal__btn modal__btn--submit">Continue</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Withdraw Funds</h2>
              <p className="modal__balance">Available: {formatCurrency(walletData.balance)}</p>
              <form onSubmit={handleWithdraw}>
                <div className="modal__field">
                  <label>Amount (PKR)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1000"
                    max={walletData.balance}
                    required
                  />
                </div>
                <div className="modal__field">
                  <label>Bank Account</label>
                  <select required>
                    <option value="">Select account</option>
                    <option value="hbl">HBL - ****1234</option>
                    <option value="add">+ Add New Account</option>
                  </select>
                </div>
                <div className="modal__actions">
                  <button type="button" onClick={() => setShowWithdrawModal(false)} className="modal__btn modal__btn--cancel">Cancel</button>
                  <button type="submit" className="modal__btn modal__btn--submit">Withdraw</button>
                </div>
              </form>
            </div>
          </div>
        )}
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

        .wallet-section {
          padding: 100px 20px 60px;
          background: #f5f5f5;
          min-height: 100vh;
        }
        .wallet-container {
          max-width: 1000px;
          margin: 0 auto;
        }
        .wallet-title {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 32px;
        }

        .wallet-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .wallet-card--primary {
          background: linear-gradient(135deg, #1a1a1a, #333);
          color: #fff;
          padding: 32px;
          border-radius: 16px;
        }
        .wallet-card__label {
          display: block;
          font-size: 14px;
          color: #aaa;
          margin-bottom: 8px;
        }
        .wallet-card__amount {
          display: block;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .wallet-card__actions {
          display: flex;
          gap: 12px;
        }
        .wallet-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }
        .wallet-btn:hover {
          transform: translateY(-2px);
        }
        .wallet-btn--deposit {
          background: #D4AF37;
          color: #1a1a1a;
        }
        .wallet-btn--withdraw {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .wallet-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .wallet-stat {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .wallet-stat__icon {
          font-size: 24px;
        }
        .wallet-stat__label {
          display: block;
          font-size: 13px;
          color: #666;
        }
        .wallet-stat__value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }
        .wallet-stat__value--green {
          color: #2e7d32;
        }

        .wallet-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
        }
        .wallet-tab {
          padding: 10px 20px;
          background: none;
          border: none;
          font-size: 14px;
          color: #666;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .wallet-tab:hover {
          background: #f0f0f0;
        }
        .wallet-tab.active {
          background: #1a1a1a;
          color: #fff;
        }

        .transactions {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .transactions__title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1a1a1a;
        }
        .transaction {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .transaction:last-child {
          border-bottom: none;
        }
        .transaction__icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 16px;
        }
        .transaction__details {
          flex: 1;
        }
        .transaction__type {
          display: block;
          font-weight: 600;
          color: #1a1a1a;
          font-size: 15px;
        }
        .transaction__meta {
          font-size: 13px;
          color: #888;
        }
        .transaction__amount {
          font-size: 16px;
          font-weight: 600;
        }
        .transaction__status {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: capitalize;
        }
        .transaction__status--completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .transaction__status--pending {
          background: #fff3e0;
          color: #ef6c00;
        }

        .payment-methods {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .payment-methods__title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          color: #1a1a1a;
        }
        .payment-methods__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .payment-method {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          transition: transform 0.2s;
        }
        .payment-method:hover {
          transform: translateY(-2px);
        }
        .payment-method__icon {
          font-size: 32px;
          display: block;
          margin-bottom: 12px;
        }
        .payment-method__name {
          display: block;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        .payment-method__desc {
          font-size: 13px;
          color: #888;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: #fff;
          padding: 32px;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          margin: 20px;
        }
        .modal h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .modal__balance {
          color: #666;
          margin-bottom: 24px;
        }
        .modal__field {
          margin-bottom: 20px;
        }
        .modal__field label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        .modal__field input,
        .modal__field select {
          width: 100%;
          padding: 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 15px;
        }
        .modal__field input:focus,
        .modal__field select:focus {
          outline: none;
          border-color: #D4AF37;
        }
        .modal__actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .modal__btn {
          flex: 1;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }
        .modal__btn--cancel {
          background: #f0f0f0;
          color: #333;
        }
        .modal__btn--submit {
          background: #D4AF37;
          color: #1a1a1a;
        }

        @media (max-width: 768px) {
          .wallet-cards {
            grid-template-columns: 1fr;
          }
          .wallet-card__amount {
            font-size: 28px;
          }
          .transaction {
            flex-wrap: wrap;
          }
          .transaction__amount {
            order: 3;
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>
    </>
  )
}
