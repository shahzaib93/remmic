import { useState, useEffect, createContext, useContext } from 'react'

// Currency Context
const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

// Currency Provider Component
export function CurrencyProvider({ children }) {
  const [selectedCurrency, setSelectedCurrency] = useState('PKR')
  const [exchangeRates, setExchangeRates] = useState({
    PKR: 1,
    USD: 0.0036, // 1 PKR = 0.0036 USD (approx)
    AED: 0.013,  // 1 PKR = 0.013 AED (approx)
    GBP: 0.0029, // 1 PKR = 0.0029 GBP (approx)
    EUR: 0.0033  // 1 PKR = 0.0033 EUR (approx)
  })
  const [lastUpdated, setLastUpdated] = useState(null)

  const currencies = [
    { code: 'PKR', symbol: 'PKR', name: 'Pakistani Rupee', flag: 'ðŸ‡µðŸ‡°' },
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'ðŸ‡ºðŸ‡¸' },
    { code: 'AED', symbol: 'Ø¯.Ø¥', name: 'UAE Dirham', flag: 'ðŸ‡¦ðŸ‡ª' },
    { code: 'GBP', symbol: 'Â£', name: 'British Pound', flag: 'ðŸ‡¬ðŸ‡§' },
    { code: 'EUR', symbol: 'â‚¬', name: 'Euro', flag: 'ðŸ‡ªðŸ‡º' }
  ]

  // Load saved currency preference
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency')
    if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
      setSelectedCurrency(savedCurrency)
    }
  }, [])

  // Fetch live exchange rates (mock implementation)
  useEffect(() => {
    fetchExchangeRates()
    // Update rates every 30 minutes
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchExchangeRates = async () => {
    try {
      // In production, this would call a real exchange rate API
      // For now, we'll simulate with mock data with small variations
      const mockRates = {
        PKR: 1,
        USD: 0.0036 + (Math.random() - 0.5) * 0.0002,
        AED: 0.013 + (Math.random() - 0.5) * 0.001,
        GBP: 0.0029 + (Math.random() - 0.5) * 0.0002,
        EUR: 0.0033 + (Math.random() - 0.5) * 0.0002
      }
      
      setExchangeRates(mockRates)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
    }
  }

  const changeCurrency = (currencyCode) => {
    setSelectedCurrency(currencyCode)
    localStorage.setItem('selectedCurrency', currencyCode)
  }

  const convertAmount = (amount, fromCurrency = 'PKR', toCurrency = selectedCurrency) => {
    if (fromCurrency === toCurrency) return amount
    
    // Convert to PKR first if needed
    const amountInPKR = fromCurrency === 'PKR' ? amount : amount / exchangeRates[fromCurrency]
    
    // Convert from PKR to target currency
    return toCurrency === 'PKR' ? amountInPKR : amountInPKR * exchangeRates[toCurrency]
  }

  const formatCurrency = (amount, currencyCode = selectedCurrency, options = {}) => {
    const {
      showSymbol = true,
      showCode = false,
      decimals = 0,
      compact = false
    } = options

    const currency = currencies.find(c => c.code === currencyCode)
    if (!currency) return amount.toString()

    let formattedAmount = amount

    // Compact notation for large numbers
    if (compact) {
      if (currencyCode === 'PKR') {
        if (amount >= 10000000) {
          formattedAmount = (amount / 10000000).toFixed(1) + 'Cr'
        } else if (amount >= 100000) {
          formattedAmount = (amount / 100000).toFixed(1) + 'L'
        } else {
          formattedAmount = amount.toLocaleString('en-IN', { maximumFractionDigits: decimals })
        }
      } else {
        if (amount >= 1000000) {
          formattedAmount = (amount / 1000000).toFixed(1) + 'M'
        } else if (amount >= 1000) {
          formattedAmount = (amount / 1000).toFixed(1) + 'K'
        } else {
          formattedAmount = amount.toFixed(decimals)
        }
      }
    } else {
      formattedAmount = amount.toLocaleString('en-IN', { 
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals 
      })
    }

    let result = ''
    if (showSymbol) result += currency.symbol + ' '
    result += formattedAmount
    if (showCode) result += ' ' + currency.code

    return result
  }

  const contextValue = {
    selectedCurrency,
    currencies,
    exchangeRates,
    lastUpdated,
    changeCurrency,
    convertAmount,
    formatCurrency,
    refreshRates: fetchExchangeRates
  }

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  )
}

// Currency Selector Component
export default function CurrencySelector({ size = 'default', showDropdown = true }) {
  const { selectedCurrency, currencies, changeCurrency, exchangeRates, lastUpdated } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency)

  const selectorStyles = {
    default: {
      container: {
        position: 'relative',
        display: 'inline-block'
      },
      button: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        transition: 'all 0.3s ease'
      },
      dropdown: {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        marginTop: '4px',
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        maxHeight: '300px',
        overflowY: 'auto'
      }
    },
    compact: {
      container: {
        position: 'relative',
        display: 'inline-block'
      },
      button: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        color: '#374151'
      },
      dropdown: {
        position: 'absolute',
        top: '100%',
        right: '0',
        marginTop: '4px',
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '200px'
      }
    }
  }

  const currentStyle = selectorStyles[size] || selectorStyles.default

  if (!showDropdown) {
    return (
      <div style={currentStyle.button}>
        <span>{selectedCurrencyData?.flag}</span>
        <span>{selectedCurrencyData?.symbol}</span>
        <span>{selectedCurrency}</span>
      </div>
    )
  }

  return (
    <div style={currentStyle.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={currentStyle.button}
        onMouseOver={(e) => {
          e.target.style.borderColor = '#ff5e01'
          e.target.style.background = '#fef3e7'
        }}
        onMouseOut={(e) => {
          e.target.style.borderColor = '#d1d5db'
          e.target.style.background = size === 'compact' ? '#f9fafb' : '#fff'
        }}
      >
        <span>{selectedCurrencyData?.flag}</span>
        <span>{selectedCurrencyData?.symbol}</span>
        <span>{selectedCurrency}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          â–¼
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div style={currentStyle.dropdown}>
            {/* Exchange Rate Info */}
            {lastUpdated && (
              <div style={{
                padding: '12px',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '11px',
                color: '#6b7280',
                background: '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Last updated</span>
                  <span>{lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {/* Currency Options */}
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => {
                  changeCurrency(currency.code)
                  setIsOpen(false)
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: selectedCurrency === currency.code ? '#fef3e7' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  if (selectedCurrency !== currency.code) {
                    e.target.style.background = '#f9fafb'
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedCurrency !== currency.code) {
                    e.target.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{currency.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#374151' }}>
                    {currency.symbol} {currency.code}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {currency.name}
                  </div>
                </div>
                {currency.code !== 'PKR' && (
                  <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
                    1 PKR = {exchangeRates[currency.code]?.toFixed(4)} {currency.code}
                  </div>
                )}
                {selectedCurrency === currency.code && (
                  <span style={{ color: '#ff5e01', fontWeight: '600' }}>âœ“</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Currency Converter Widget
export function CurrencyConverter() {
  const { currencies, convertAmount, formatCurrency, exchangeRates } = useCurrency()
  const [fromCurrency, setFromCurrency] = useState('PKR')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('100000')
  const [convertedAmount, setConvertedAmount] = useState(0)

  useEffect(() => {
    if (amount && !isNaN(amount)) {
      const converted = convertAmount(parseFloat(amount), fromCurrency, toCurrency)
      setConvertedAmount(converted)
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates])

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid #f1f5f9'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937'
      }}>
        Currency Converter
      </h3>

      <div style={{ display: 'grid', gap: '16px' }}>
        {/* From Currency */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            From
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter amount"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#fff',
                minWidth: '100px'
              }}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={swapCurrencies}
            style={{
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#ff5e01'
              e.target.style.color = '#fff'
              e.target.style.borderColor = '#ff5e01'
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f3f4f6'
              e.target.style.color = '#374151'
              e.target.style.borderColor = '#d1d5db'
            }}
          >
            â‡…
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            To
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={formatCurrency(convertedAmount, toCurrency, { decimals: 2 })}
              readOnly
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#f9fafb',
                color: '#374151',
                boxSizing: 'border-box'
              }}
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: '#fff',
                minWidth: '100px'
              }}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exchange Rate Info */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          color: '#0369a1'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Exchange Rate</div>
          <div>
            1 {fromCurrency} = {(convertAmount(1, fromCurrency, toCurrency)).toFixed(6)} {toCurrency}
          </div>
        </div>
      </div>
    </div>
  )
}
