import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useFirebase } from '../contexts/FirebaseContext';

const InvestorDashboard = ({ user, investments = [] }) => {
  const router = useRouter();
  const { getAllProperties } = useFirebase();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [propertyMap, setPropertyMap] = useState({});
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalProfit: 0,
    totalLoss: 0,
    activeProperties: 0,
    avgReturns: 0
  });
  const [liveUpdates, setLiveUpdates] = useState({});

  const totalInvested = portfolioSummary.totalInvested || 0;
  const totalCurrentValue = portfolioSummary.totalCurrentValue || 0;
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const totalSharesOwned = (investments || []).reduce((sum, investment) => sum + (Number(investment.shares) || 0), 0);
  const averageCostPerShare = totalSharesOwned > 0 ? totalInvested / totalSharesOwned : 0;
  const averageCurrentSharePrice = totalSharesOwned > 0 ? totalCurrentValue / totalSharesOwned : 0;
  const propertiesTracked = useMemo(
    () => Object.values(propertyMap).filter(Boolean),
    [propertyMap]
  );
  const totalSharesAvailableAcross = propertiesTracked.reduce(
    (sum, property) => sum + (Number(property?.shareOffering?.sharesAvailable) || 0),
    0
  );
  const investmentLookup = useMemo(() => {
    const map = {};
    (investments || []).forEach((investment) => {
      map[investment.id || investment.propertyId] = investment;
    });
    return map;
  }, [investments]);

  useEffect(() => {
    if (!investments || investments.length === 0) {
      setPropertyMap({});
      return;
    }

    let isMounted = true;

    const loadProperties = async () => {
      const uniqueIds = Array.from(new Set((investments || []).map((inv) => inv.propertyId).filter(Boolean)));
      if (!uniqueIds.length) {
        if (isMounted) setPropertyMap({});
        return;
      }

      let properties = [];
      if (typeof getAllProperties === 'function') {
        try {
          const response = await getAllProperties();
          if (response?.success && Array.isArray(response.properties)) {
            properties = response.properties;
          }
        } catch (error) {
          console.warn('Failed to load properties for investor dashboard:', error);
        }
      }

      if ((!properties || !properties.length) && typeof window !== 'undefined') {
        try {
          const cached = JSON.parse(window.localStorage.getItem('userProperties') || '[]');
          properties = cached;
        } catch (cacheError) {
          console.warn('Failed to parse cached properties for investor dashboard:', cacheError);
        }
      }

      if (!properties || !properties.length) {
        if (isMounted) setPropertyMap({});
        return;
      }

      const map = {};
      uniqueIds.forEach((id) => {
        map[id] = properties.find((item) => {
          const identifier = item?.id || item?.propertyId;
          return identifier && identifier.toString() === id.toString();
        }) || null;
      });

      if (isMounted) {
        setPropertyMap(map);
      }
    };

    loadProperties();

    const handleLocalUpdate = () => {
      loadProperties();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('userPropertiesUpdated', handleLocalUpdate);
      window.addEventListener('storage', handleLocalUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('userPropertiesUpdated', handleLocalUpdate);
        window.removeEventListener('storage', handleLocalUpdate);
      }
    };
  }, [investments, getAllProperties]);

  // Calculate portfolio summary with live updates
  useEffect(() => {
    if (!investments || investments.length === 0) {
      setPortfolioSummary({
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfit: 0,
        totalLoss: 0,
        activeProperties: 0,
        avgReturns: 0,
      });
      setLiveUpdates({});
      return;
    }

    const valuations = {};
    const summary = investments.reduce((acc, investment) => {
      const propertyId = investment.propertyId;
      const property = propertyId ? propertyMap[propertyId] : null;
      const offering = property?.shareOffering || {};

      const sharesOwned = Number(investment.shares) || 0;
      const invested = Number(investment.amount) || 0;
      const purchaseSharePrice = Number(investment.sharePrice) || (sharesOwned > 0 ? invested / sharesOwned : 0);
      const currentSharePrice = Number(offering.sharePrice) || purchaseSharePrice;
      const currentValue = sharesOwned * currentSharePrice;
      const profitLoss = currentValue - invested;
      const changePercent = purchaseSharePrice > 0 ? ((currentSharePrice - purchaseSharePrice) / purchaseSharePrice) * 100 : 0;

      valuations[investment.id || propertyId] = {
        changePercent,
        isPositive: profitLoss >= 0,
        currentSharePrice,
        purchaseSharePrice,
        profitLoss,
        currentValue,
      };

      return {
        totalInvested: acc.totalInvested + invested,
        totalCurrentValue: acc.totalCurrentValue + currentValue,
        totalProfit: acc.totalProfit + (profitLoss > 0 ? profitLoss : 0),
        totalLoss: acc.totalLoss + (profitLoss < 0 ? Math.abs(profitLoss) : 0),
        activeProperties: acc.activeProperties + 1,
      };
    }, {
      totalInvested: 0,
      totalCurrentValue: 0,
      totalProfit: 0,
      totalLoss: 0,
      activeProperties: 0,
    });

    summary.avgReturns = summary.totalInvested > 0
      ? ((summary.totalCurrentValue - summary.totalInvested) / summary.totalInvested) * 100
      : 0;

    setLiveUpdates(valuations);
    setPortfolioSummary(summary);
    setLastUpdate(new Date());
  }, [investments, propertyMap]);

  const recentActivityEntries = useMemo(() => {
    const entries = Object.entries(liveUpdates).map(([key, data]) => {
      const investment = investmentLookup[key];
      const property = investment?.propertyId ? propertyMap[investment.propertyId] : null;
      const title = property?.title || investment?.propertyTitle || 'Opportunity';
      const investedValue = Number(investment?.amount) || 0;
      const shares = Number(investment?.shares) || 0;
      const purchaseSharePrice = Number(investment?.shareSnapshot?.sharePrice) || (shares > 0 ? investedValue / shares : 0);
      const currentSharePrice = Number.isFinite(data.currentSharePrice) ? data.currentSharePrice : (shares > 0 ? (Number(data.currentValue) || Number(investment?.currentValue) || investedValue) / shares : 0);
      const changeValue = Number.isFinite(data.profitLoss)
        ? data.profitLoss
        : (shares > 0 ? (currentSharePrice - purchaseSharePrice) * shares : (Number(data.currentValue) || Number(investment?.currentValue) || investedValue) - investedValue);
      const changePercent = purchaseSharePrice > 0
        ? ((currentSharePrice - purchaseSharePrice) / purchaseSharePrice) * 100
        : Number(data.changePercent) || (investedValue > 0 ? (changeValue / investedValue) * 100 : 0);
      const isPositive = data.isPositive ?? changeValue >= 0;
      return {
        key,
        title,
        changePercent,
        changeValue,
        isPositive,
      };
    });

    if (entries.length === 0 && totalPnL !== 0) {
      entries.push({
        key: 'portfolio',
        title: 'Portfolio Performance',
        changePercent: totalPnLPercent,
        changeValue: totalPnL,
        isPositive: totalPnL >= 0,
      });
    }

    entries.sort((a, b) => Math.abs(b.changeValue) - Math.abs(a.changeValue));
    return entries.slice(0, 4);
  }, [investmentLookup, liveUpdates, propertyMap, totalPnL, totalPnLPercent]);

  const formatCurrency = (amount) => {
    if (!Number.isFinite(amount)) return 'PKR 0';
    const sign = amount < 0 ? 'âˆ’' : '';
    const absolute = Math.abs(amount);
    if (absolute >= 10000000) return `${sign}PKR ${(absolute / 10000000).toFixed(2)}Cr`;
    if (absolute >= 100000) return `${sign}PKR ${(absolute / 100000).toFixed(2)}L`;
    return `${sign}PKR ${absolute.toLocaleString()}`;
  };

const formatPercentage = (percentage) => {
  if (!Number.isFinite(percentage)) return '0.00%';
  const sign = percentage > 0 ? '+' : percentage < 0 ? 'âˆ’' : '';
  return `${sign}${Math.abs(percentage).toFixed(2)}%`;
};

const formatDate = (value) => {
  if (!value) return 'â€”';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'â€”';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

  const getLiveChangeDisplay = (investment) => {
    const liveUpdate = liveUpdates[investment.id || investment.propertyId];
    const invested = Number(investment.amount) || 0;
    const shares = Number(investment.shares) || 0;
    const purchaseSharePrice = Number(investment.shareSnapshot?.sharePrice) || (shares > 0 ? invested / shares : 0);
    const currentSharePrice = shares > 0
      ? (Number.isFinite(liveUpdate?.currentSharePrice)
          ? liveUpdate.currentSharePrice
          : (Number(liveUpdate?.currentValue) || Number(investment.currentValue) || invested) / shares)
      : 0;

    if (!purchaseSharePrice && !currentSharePrice) {
      return <span style={{ fontSize: '12px', color: '#94a3b8' }}>Trackingâ€¦</span>;
    }

    const perShareChange = currentSharePrice - purchaseSharePrice;
    const perShareChangePercent = purchaseSharePrice > 0
      ? (perShareChange / purchaseSharePrice) * 100
      : Number(liveUpdate?.changePercent) || 0;
    const isPositive = perShareChange >= 0;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: isPositive ? '#10b981' : '#ef4444'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{isPositive ? 'â†—' : 'â†˜'}</span>
          <span>{formatPercentage(perShareChangePercent)}</span>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isPositive ? '#10b981' : '#ef4444',
            animation: 'pulse 2s infinite'
          }} />
        </span>
        <span style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8' }}>
          {isPositive ? '+' : 'âˆ’'}{formatCurrency(Math.abs(perShareChange))}/share
        </span>
      </div>
    );
  };

  if (!investments || investments.length === 0) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '100vh', background: '#f9fafb' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading your portfolio...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '80px' }}>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .live-indicator {
          position: relative;
        }
        .live-indicator::before {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 2s infinite;
        }
      `}</style>

      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-medium">
            
            {/* Header */}
            <div style={{ marginBottom: '40px', animation: 'slideUp 0.6s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
                    Portfolio Dashboard
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '14px', 
                      color: '#6b7280' 
                    }}>
                      <div className="live-indicator">
                        <span style={{ color: '#10b981', fontWeight: '600' }}>â—</span>
                      </div>
                      Live Updates
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#fff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                    Market Open
                  </span>
                </div>
              </div>
            </div>

            {/* Portfolio Summary Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Total Portfolio Value */}
              <div className="card-hover" style={{
                background: 'linear-gradient(135deg, #c9a227 0%, #d4b13d 100%)',
                color: '#0a0a0a',
                padding: '32px',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(201, 162, 39, 0.25)'
              }}>
                <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.8 }}>
                  Net Portfolio Value
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
                  {formatCurrency(totalCurrentValue)}
                </div>
                <div style={{
                  fontSize: '14px',
                  opacity: 0.85,
                  fontWeight: 600,
                  color: totalPnL >= 0 ? '#166534' : '#991b1b'
                }}>
                  {totalPnL >= 0 ? 'Unrealized gain: ' : 'Unrealized loss: '}
                  {formatCurrency(Math.abs(totalPnL))} ({formatPercentage(totalPnLPercent)})
                </div>
              </div>

              {/* Capital Overview */}
              <div className="card-hover" style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Capital Invested
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {formatCurrency(totalInvested)}
                </div>
                <div style={{
                  fontSize: '14px',
                  marginTop: '8px',
                  color: totalPnL >= 0 ? '#10b981' : '#ef4444',
                  fontWeight: 600
                }}>
                  {totalPnL >= 0 ? '+' : 'âˆ’'}{formatCurrency(Math.abs(totalPnL))} change
                </div>
              </div>

              {/* Share Overview */}
              <div className="card-hover" style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  Shares Owned
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {totalSharesOwned.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                  Avg cost/share: {formatCurrency(averageCostPerShare)}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Avg current/share: {formatCurrency(averageCurrentSharePrice)}
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="card-hover" style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
              marginBottom: '40px'
            }}>
              <div style={{ padding: '32px 32px 0 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                    Your Holdings
                  </h3>
                  <div style={{ 
                    background: '#f0fdf4', 
                    color: '#166534', 
                    padding: '6px 12px', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    â— Real-time prices
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ textAlign: 'left', padding: '16px 32px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Property
                      </th>
                      <th style={{ textAlign: 'right', padding: '16px 32px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Shares
                      </th>
                      <th style={{ textAlign: 'right', padding: '16px 32px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Current Value
                      </th>
                      <th style={{ textAlign: 'right', padding: '16px 32px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        P&L
                      </th>
                      <th style={{ textAlign: 'right', padding: '16px 32px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment, index) => {
                      const invested = Number(investment.amount) || 0;
                      const lookupKey = investment.id || investment.propertyId;
                      const liveUpdate = liveUpdates[lookupKey] || {};
                      const recordedShares = Number(investment.shares) || 0;
                      const shares = recordedShares > 0
                        ? recordedShares
                        : (invested > 0 && averageCostPerShare > 0 ? Math.round(invested / averageCostPerShare) : 0);

                      const purchaseSharePrice = Number(investment.shareSnapshot?.sharePrice)
                        || (shares > 0 ? invested / shares : averageCostPerShare)
                        || 0;
                      const purchaseDate = investment.investmentDate || investment.createdAt;

                      const currentValue = Number.isFinite(liveUpdate.currentValue)
                        ? liveUpdate.currentValue
                        : Number(investment.currentValue) || invested;
                      const currentSharePrice = shares > 0
                        ? (Number.isFinite(liveUpdate.currentSharePrice)
                            ? liveUpdate.currentSharePrice
                            : currentValue / shares)
                        : 0;

                      const profitLoss = Number.isFinite(liveUpdate.profitLoss)
                        ? liveUpdate.profitLoss
                        : currentValue - invested;
                      const profitLossPercent = invested > 0 ? (profitLoss / invested) * 100 : 0;

                      const perShareChangeValue = currentSharePrice - purchaseSharePrice;
                      const perShareChangePercent = purchaseSharePrice > 0
                        ? (perShareChangeValue / purchaseSharePrice) * 100
                        : 0;
                      const holdingPeriodLabel = purchaseDate ? `since ${formatDate(purchaseDate)}` : '';

                      return (
                        <tr key={investment.id || index} style={{
                          borderBottom: index === investments.length - 1 ? 'none' : '1px solid #f8fafc',
                          transition: 'background 0.2s ease'
                        }}>
                          <td style={{ padding: '20px 32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: `linear-gradient(135deg, ${index % 2 === 0 ? '#c9a227' : '#4a3728'} 0%, ${index % 2 === 0 ? '#d4b13d' : '#5d4637'} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '14px'
                              }}>
                                {(investment.propertyTitle || investment.title || 'Property').charAt(0)}
                              </div>
                              <div>
                              <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                                {investment.propertyTitle || investment.title || 'Property Investment'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Invested: {formatCurrency(invested)}
                              </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                Bought @ {formatCurrency(purchaseSharePrice)} / share {holdingPeriodLabel}
                              </div>
                            </div>
                          </div>
                        </td>
                          <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>
                              {shares}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              shares
                            </div>
                          </td>
                          <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>
                              {formatCurrency(currentValue)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              Current / share: {formatCurrency(currentSharePrice)}
                            </div>
                            <div style={{ fontSize: '12px', color: perShareChangeValue >= 0 ? '#10b981' : '#ef4444' }}>
                              {perShareChangeValue >= 0 ? '+' : 'âˆ’'}{formatCurrency(Math.abs(perShareChangeValue))} ({formatPercentage(perShareChangePercent)})
                            </div>
                          </td>
                          <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                            <div style={{ 
                              fontWeight: '600', 
                              color: profitLoss >= 0 ? '#10b981' : '#ef4444' 
                            }}>
                              {profitLoss >= 0 ? '+' : 'âˆ’'}{formatCurrency(Math.abs(profitLoss))}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: profitLoss >= 0 ? '#10b981' : '#ef4444' 
                            }}>
                              {formatPercentage(profitLossPercent)}
                            </div>
                          </td>
                          <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                            {getLiveChangeDisplay(investment)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Insights */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Portfolio Snapshot */}
              <div className="card-hover" style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                  Portfolio Snapshot
                </h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Active Properties</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{portfolioSummary.activeProperties}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Shares Available</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{totalSharesAvailableAcross.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Average Return</span>
                    <span style={{ fontWeight: '600', color: portfolioSummary.avgReturns >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatPercentage(portfolioSummary.avgReturns)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card-hover" style={{
                background: '#fff',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9'
              }}>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
                  Recent Activity
                </h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {recentActivityEntries.length === 0 && (
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      Activity will appear once share prices change or new transactions are recorded.
                    </div>
                  )}
                  {recentActivityEntries.map((entry) => (
                    <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: entry.isPositive ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#fff',
                        fontWeight: 700
                      }}>
                        {entry.isPositive ? 'â–²' : 'â–¼'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {entry.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatPercentage(entry.changePercent)} change
                        </div>
                      </div>
                      <div style={{
                        fontWeight: '600',
                        color: entry.isPositive ? '#10b981' : '#ef4444'
                      }}>
                        {entry.isPositive ? '+' : 'âˆ’'}{formatCurrency(Math.abs(entry.changeValue))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginTop: '60px'
            }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #c9a227 0%, #d4b13d 100%)',
                  color: '#0a0a0a',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '200px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(201, 162, 39, 0.25)'
                }}
                onClick={() => router.push('/investment-shares')}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(201, 162, 39, 0.35)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(201, 162, 39, 0.25)';
                }}
              >
                Browse Marketplace
              </button>
              <button
                style={{
                  background: '#fff',
                  color: '#4a3728',
                  border: '2px solid #4a3728',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '200px',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => router.push('/dashboard')}
                onMouseOver={(e) => {
                  e.target.style.background = '#4a3728';
                  e.target.style.color = '#fff';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#fff';
                  e.target.style.color = '#4a3728';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Return to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
