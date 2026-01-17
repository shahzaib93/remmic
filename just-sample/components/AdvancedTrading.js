import { useState, useEffect } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function AdvancedTrading({ propertyId, propertyTitle, currentSharePrice }) {
  const { user } = useFirebase()
  const [activeTab, setActiveTab] = useState('buy')
  const [orderType, setOrderType] = useState('market')
  const [orderForm, setOrderForm] = useState({
    shares: 1,
    price: currentSharePrice,
    stopPrice: currentSharePrice * 0.9,
    orderDuration: 'day'
  })
  const [marketDepth, setMarketDepth] = useState({ bids: [], asks: [] })
  const [recentTrades, setRecentTrades] = useState([])
  const [userOrders, setUserOrders] = useState([])
  const [priceAlerts, setPriceAlerts] = useState([])

  // Initialize market data
  useEffect(() => {
    generateMockMarketData()
    loadUserOrders()
    loadPriceAlerts()
  }, [propertyId, currentSharePrice])

  const generateMockMarketData = () => {
    // Generate mock market depth data
    const bids = []
    const asks = []
    
    for (let i = 0; i < 10; i++) {
      bids.push({
        price: currentSharePrice - (i + 1) * 1000,
        shares: Math.floor(Math.random() * 50) + 10,
        total: 0
      })
      
      asks.push({
        price: currentSharePrice + (i + 1) * 1000,
        shares: Math.floor(Math.random() * 50) + 10,
        total: 0
      })
    }
    
    // Calculate cumulative totals
    let bidTotal = 0
    bids.forEach(bid => {
      bidTotal += bid.shares
      bid.total = bidTotal
    })
    
    let askTotal = 0
    asks.forEach(ask => {
      askTotal += ask.shares
      ask.total = askTotal
    })
    
    setMarketDepth({ bids, asks })
    
    // Generate recent trades
    const trades = []
    for (let i = 0; i < 20; i++) {
      const price = currentSharePrice + (Math.random() - 0.5) * 10000
      trades.push({
        id: `trade-${i}`,
        price: Math.round(price),
        shares: Math.floor(Math.random() * 20) + 1,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: new Date(Date.now() - i * 60000 * 5)
      })
    }
    setRecentTrades(trades)
  }

  const loadUserOrders = () => {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    const propertyOrders = orders.filter(order => order.propertyId === propertyId)
    setUserOrders(propertyOrders)
  }

  const loadPriceAlerts = () => {
    const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
    const propertyAlerts = alerts.filter(alert => alert.propertyId === propertyId)
    setPriceAlerts(propertyAlerts)
  }

  const placeOrder = () => {
    if (!user) {
      alert('Please login to place orders')
      return
    }

    const order = {
      id: `order-${Date.now()}`,
      propertyId,
      propertyTitle,
      type: orderType,
      side: activeTab,
      shares: parseInt(orderForm.shares),
      price: orderType === 'market' ? currentSharePrice : parseInt(orderForm.price),
      stopPrice: orderType === 'stop-loss' ? parseInt(orderForm.stopPrice) : null,
      status: orderType === 'market' ? 'filled' : 'pending',
      duration: orderForm.orderDuration,
      timestamp: new Date().toISOString(),
      userId: user.uid
    }

    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    orders.push(order)
    localStorage.setItem('userOrders', JSON.stringify(orders))
    
    setUserOrders(prev => [order, ...prev])
    
    // Reset form
    setOrderForm({
      shares: 1,
      price: currentSharePrice,
      stopPrice: currentSharePrice * 0.9,
      orderDuration: 'day'
    })

    alert(`${orderType === 'market' ? 'Market' : 'Limit'} ${activeTab} order placed successfully!`)
  }

  const cancelOrder = (orderId) => {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]')
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    )
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders))
    loadUserOrders()
  }

  const createPriceAlert = () => {
    const alertPrice = prompt('Enter price for alert (PKR):')
    const alertType = confirm('Alert when price goes above this value? (Cancel for below)')
    
    if (alertPrice) {
      const alert = {
        id: `alert-${Date.now()}`,
        propertyId,
        propertyTitle,
        targetPrice: parseInt(alertPrice),
        type: alertType ? 'above' : 'below',
        isActive: true,
        createdAt: new Date().toISOString()
      }
      
      const alerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]')
      alerts.push(alert)
      localStorage.setItem('priceAlerts', JSON.stringify(alerts))
      setPriceAlerts(prev => [alert, ...prev])
    }
  }

  const formatCurrency = (amount) => `PKR ${amount.toLocaleString()}`

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '30px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ff5e01 0%, #e54e00 100%)',
        color: '#fff',
        padding: '20px 30px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
          Advanced Trading
        </h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          {propertyTitle} â€¢ Current Price: {formatCurrency(currentSharePrice)}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '500px' }}>
        {/* Left Panel - Trading Interface */}
        <div style={{ padding: '30px', borderRight: '1px solid #f1f5f9' }}>
          {/* Buy/Sell Tabs */}
          <div style={{ display: 'flex', marginBottom: '20px', background: '#f8fafc', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setActiveTab('buy')}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'buy' ? '#10b981' : 'transparent',
                color: activeTab === 'buy' ? '#fff' : '#6b7280',
                transition: 'all 0.3s ease'
              }}
            >
              Buy Shares
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: activeTab === 'sell' ? '#ef4444' : 'transparent',
                color: activeTab === 'sell' ? '#fff' : '#6b7280',
                transition: 'all 0.3s ease'
              }}
            >
              Sell Shares
            </button>
          </div>

          {/* Order Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff'
              }}
            >
              <option value="market">Market Order (Execute Immediately)</option>
              <option value="limit">Limit Order (Set Price)</option>
              <option value="stop-loss">Stop-Loss Order</option>
            </select>
          </div>

          {/* Shares Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Number of Shares
            </label>
            <input
              type="number"
              min="1"
              value={orderForm.shares}
              onChange={(e) => setOrderForm(prev => ({ ...prev, shares: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Price Input (for limit orders) */}
          {orderType !== 'market' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {orderType === 'limit' ? 'Limit Price (PKR)' : 'Stop Price (PKR)'}
              </label>
              <input
                type="number"
                value={orderType === 'limit' ? orderForm.price : orderForm.stopPrice}
                onChange={(e) => setOrderForm(prev => ({ 
                  ...prev, 
                  [orderType === 'limit' ? 'price' : 'stopPrice']: e.target.value 
                }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Order Duration */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Order Duration
            </label>
            <select
              value={orderForm.orderDuration}
              onChange={(e) => setOrderForm(prev => ({ ...prev, orderDuration: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff'
              }}
            >
              <option value="day">Day Order</option>
              <option value="gtc">Good Till Cancelled</option>
              <option value="week">One Week</option>
            </select>
          </div>

          {/* Order Summary */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Order Summary
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Shares:</span>
              <span style={{ fontWeight: '600' }}>{orderForm.shares}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#6b7280' }}>Price per Share:</span>
              <span style={{ fontWeight: '600' }}>
                {formatCurrency(orderType === 'market' ? currentSharePrice : 
                  (orderType === 'limit' ? orderForm.price : orderForm.stopPrice))}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: '600' }}>Total Amount:</span>
              <span style={{ fontWeight: '700', fontSize: '16px', color: activeTab === 'buy' ? '#10b981' : '#ef4444' }}>
                {formatCurrency(orderForm.shares * (orderType === 'market' ? currentSharePrice : 
                  (orderType === 'limit' ? orderForm.price : orderForm.stopPrice)))}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={placeOrder}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              background: activeTab === 'buy' ? '#10b981' : '#ef4444',
              color: '#fff',
              transition: 'all 0.3s ease',
              marginBottom: '12px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = activeTab === 'buy' ? '#059669' : '#dc2626'
            }}
            onMouseOut={(e) => {
              e.target.style.background = activeTab === 'buy' ? '#10b981' : '#ef4444'
            }}
          >
            Place {orderType.charAt(0).toUpperCase() + orderType.slice(1)} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Order
          </button>

          {/* Price Alert Button */}
          <button
            onClick={createPriceAlert}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ff5e01',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'transparent',
              color: '#ff5e01',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#ff5e01'
              e.target.style.color = '#fff'
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = '#ff5e01'
            }}
          >
            ðŸ”” Create Price Alert
          </button>
        </div>

        {/* Right Panel - Market Data */}
        <div style={{ padding: '30px' }}>
          {/* Market Depth */}
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Market Depth
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px' }}>
              {/* Bids */}
              <div>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#10b981' }}>Bids (Buy)</div>
                {marketDepth.bids.slice(0, 5).map((bid, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '4px 8px',
                    background: `linear-gradient(to right, rgba(16, 185, 129, 0.1) ${(bid.total / marketDepth.bids[0]?.total) * 100}%, transparent 0%)`,
                    borderRadius: '4px',
                    marginBottom: '2px'
                  }}>
                    <span>{formatCurrency(bid.price)}</span>
                    <span style={{ textAlign: 'right' }}>{bid.shares}</span>
                  </div>
                ))}
              </div>

              {/* Asks */}
              <div>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>Asks (Sell)</div>
                {marketDepth.asks.slice(0, 5).map((ask, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '4px 8px',
                    background: `linear-gradient(to right, rgba(239, 68, 68, 0.1) ${(ask.total / marketDepth.asks[0]?.total) * 100}%, transparent 0%)`,
                    borderRadius: '4px',
                    marginBottom: '2px'
                  }}>
                    <span>{formatCurrency(ask.price)}</span>
                    <span style={{ textAlign: 'right' }}>{ask.shares}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Recent Trades
            </h4>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {recentTrades.slice(0, 10).map((trade) => (
                <div key={trade.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  padding: '6px 8px',
                  fontSize: '12px',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <span style={{ color: trade.side === 'buy' ? '#10b981' : '#ef4444' }}>
                    {formatCurrency(trade.price)}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {trade.shares}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                    {trade.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Orders & Alerts */}
      <div style={{ 
        borderTop: '1px solid #f1f5f9', 
        padding: '30px',
        background: '#fafbfc'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Active Orders */}
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Your Orders ({userOrders.length})
            </h4>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {userOrders.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No active orders</p>
              ) : (
                userOrders.map((order) => (
                  <div key={order.id} style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        background: order.side === 'buy' ? '#dcfce7' : '#fee2e2',
                        color: order.side === 'buy' ? '#166534' : '#991b1b',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {order.side} {order.type}
                      </span>
                      <span style={{
                        background: order.status === 'filled' ? '#dcfce7' : order.status === 'pending' ? '#fef3cd' : '#fee2e2',
                        color: order.status === 'filled' ? '#166534' : order.status === 'pending' ? '#92400e' : '#991b1b',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {order.shares} shares @ {formatCurrency(order.price)}
                    </div>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Price Alerts */}
          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Price Alerts ({priceAlerts.length})
            </h4>
            
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {priceAlerts.length === 0 ? (
                <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No price alerts set</p>
              ) : (
                priceAlerts.map((alert) => (
                  <div key={alert.id} style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                      Alert when price goes {alert.type} {formatCurrency(alert.targetPrice)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
