import React, { useEffect, useState } from 'react';
import { useAuth, usePortfolio, useInvestments } from '../hooks/useFirebase';
// Removed mock data import

export default function DashboardStatus() {
  const { user, login } = useAuth();
  const { summary, loading: portfolioLoading } = usePortfolio(user?.uid);
  const { investments, loading: investmentsLoading } = useInvestments(user?.uid);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Auto-login for testing
    if (!user) {
      login('test@remmic.com', 'password123');
    }
  }, [user, login]);

  useEffect(() => {
    // Demo data initialization removed - using real data only
    
    // Run tests
    setTimeout(() => {
      const localStorageData = JSON.parse(localStorage.getItem('userInvestments') || '[]');
      
      setTestResults({
        hasUser: !!user,
        hasInvestments: investments.length > 0,
        hasValidData: investments.every(inv => 
          inv.amount && !isNaN(inv.amount) && 
          inv.currentValue && !isNaN(inv.currentValue) &&
          inv.shares && !isNaN(inv.shares)
        ),
        portfolioLoading,
        investmentsLoading,
        localStorageCount: localStorageData.length,
        hookInvestmentsCount: investments.length,
        summaryData: summary
      });
    }, 1000);
  }, [user, investments, summary, portfolioLoading, investmentsLoading]);

  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return 'PKR 0';
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px 20px',
      background: '#f9fafb'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        background: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
          ðŸ” Dashboard System Status
        </h1>

        {/* Test Results */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{ 
            background: testResults.hasUser ? '#f0fdf4' : '#fef2f2', 
            padding: '20px', 
            borderRadius: '8px',
            border: `1px solid ${testResults.hasUser ? '#bbf7d0' : '#fecaca'}`
          }}>
            <h3 style={{ color: testResults.hasUser ? '#166534' : '#dc2626', marginBottom: '10px' }}>
              {testResults.hasUser ? 'âœ…' : 'âŒ'} User Authentication
            </h3>
            <p style={{ color: testResults.hasUser ? '#166534' : '#dc2626', fontSize: '14px' }}>
              {testResults.hasUser ? `Logged in as: ${user?.email}` : 'No user authenticated'}
            </p>
          </div>

          <div style={{ 
            background: testResults.hasInvestments ? '#f0fdf4' : '#fef2f2', 
            padding: '20px', 
            borderRadius: '8px',
            border: `1px solid ${testResults.hasInvestments ? '#bbf7d0' : '#fecaca'}`
          }}>
            <h3 style={{ color: testResults.hasInvestments ? '#166534' : '#dc2626', marginBottom: '10px' }}>
              {testResults.hasInvestments ? 'âœ…' : 'âŒ'} Investment Data
            </h3>
            <p style={{ color: testResults.hasInvestments ? '#166534' : '#dc2626', fontSize: '14px' }}>
              {testResults.hasInvestments ? `${investments.length} investments found` : 'No investments found'}
            </p>
          </div>

          <div style={{ 
            background: testResults.hasValidData ? '#f0fdf4' : '#fef2f2', 
            padding: '20px', 
            borderRadius: '8px',
            border: `1px solid ${testResults.hasValidData ? '#bbf7d0' : '#fecaca'}`
          }}>
            <h3 style={{ color: testResults.hasValidData ? '#166534' : '#dc2626', marginBottom: '10px' }}>
              {testResults.hasValidData ? 'âœ…' : 'âŒ'} Data Validation
            </h3>
            <p style={{ color: testResults.hasValidData ? '#166534' : '#dc2626', fontSize: '14px' }}>
              {testResults.hasValidData ? 'All data is valid (no NaN values)' : 'Invalid data detected'}
            </p>
          </div>

          <div style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#374151', marginBottom: '10px' }}>
              ðŸ“Š Loading Status
            </h3>
            <p style={{ color: '#374151', fontSize: '14px' }}>
              Portfolio: {portfolioLoading ? 'Loading...' : 'Ready'}<br/>
              Investments: {investmentsLoading ? 'Loading...' : 'Ready'}
            </p>
          </div>
        </div>

        {/* Portfolio Summary */}
        {summary && (
          <div style={{ 
            background: '#f8fafc', 
            padding: '30px', 
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#374151' }}>ðŸ“ˆ Portfolio Summary</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px'
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Total Invested</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>
                  {formatCurrency(summary.totalInvested)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Current Value</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                  {formatCurrency(summary.totalCurrentValue)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Total Profit</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                  {formatCurrency(summary.totalProfit)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Active Properties</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                  {summary.activeProperties}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Details */}
        {investments.length > 0 && (
          <div style={{ 
            background: '#f8fafc', 
            padding: '30px', 
            borderRadius: '12px',
            marginBottom: '30px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#374151' }}>ðŸ’° Investment Details</h3>
            {investments.map((investment, index) => (
              <div key={investment.id} style={{ 
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ color: '#374151', marginBottom: '5px' }}>
                      {investment.propertyTitle || 'Investment Property'}
                    </h4>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                      {investment.shares || 1} shares @ {formatCurrency(investment.sharePrice || 50000)} each
                    </p>
                  </div>
                  <span style={{ 
                    padding: '4px 12px', 
                    background: '#dcfce7', 
                    color: '#166534', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: '600'
                  }}>
                    {investment.status || 'Active'}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '15px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Invested Amount</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                      {formatCurrency(investment.amount || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Current Value</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                      {formatCurrency(investment.currentValue || investment.amount || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Profit/Loss</div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: (investment.profitLoss || 0) >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {(investment.profitLoss || 0) >= 0 ? '+' : ''}{formatCurrency(investment.profitLoss || 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Return %</div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: (investment.returnPercentage || 0) >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {(investment.returnPercentage || 0) >= 0 ? '+' : ''}{(investment.returnPercentage || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Information */}
        <div style={{ 
          background: '#fffbeb', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #fbbf24',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '15px' }}>ðŸ”§ Debug Information</h3>
          <div style={{ color: '#92400e', fontSize: '14px' }}>
            <p><strong>localStorage Investments:</strong> {testResults.localStorageCount}</p>
            <p><strong>Hook Investments:</strong> {testResults.hookInvestmentsCount}</p>
            <p><strong>Portfolio Loading:</strong> {testResults.portfolioLoading ? 'Yes' : 'No'}</p>
            <p><strong>Investments Loading:</strong> {testResults.investmentsLoading ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.uid || 'None'}</p>
          </div>
        </div>

        {/* Dashboard Links */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a 
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ðŸ“Š Main Dashboard
          </a>

          <a 
            href="/investment-payment"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#10b981',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ðŸ’° Investment Payment
          </a>

          <a 
            href="/test-investment-flow"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#f59e0b',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ðŸ§ª Test Flow
          </a>
        </div>

      </div>
    </div>
  );
}
