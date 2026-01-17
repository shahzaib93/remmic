// Portfolio value simulation utilities

export const simulatePortfolioGrowth = () => {
  // Get existing investments
  const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
  
  investments.forEach(investment => {
    // Simulate market fluctuations (realistic property market movements)
    const daysSinceInvestment = Math.floor(
      (Date.now() - new Date(investment.investmentDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Base growth rate: 8-15% annually
    const annualGrowthRate = 0.08 + Math.random() * 0.07; // 8-15%
    const dailyGrowthRate = annualGrowthRate / 365;
    
    // Add some random market volatility
    const volatility = (Math.random() - 0.5) * 0.002; // ±0.1% daily volatility
    const totalGrowthRate = dailyGrowthRate * daysSinceInvestment + volatility;
    
    // Calculate new value
    const newValue = investment.amount * (1 + totalGrowthRate);
    const profitLoss = newValue - investment.amount;
    const returnPercentage = (profitLoss / investment.amount) * 100;
    
    // Update investment
    investment.currentValue = Math.max(investment.amount * 0.85, newValue); // Minimum 15% loss protection
    investment.profitLoss = investment.currentValue - investment.amount;
    investment.returnPercentage = ((investment.currentValue - investment.amount) / investment.amount) * 100;
    investment.lastUpdated = new Date().toISOString();
  });
  
  // Save updated investments
  localStorage.setItem('userInvestments', JSON.stringify(investments));
  
  return investments;
};

export const addSampleInvestments = () => {
  const existingInvestments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
  
  // No longer create sample investments - show real data only
  return existingInvestments;
};

export const generateRealisticPerformanceData = (investments, period = 'daily') => {
  const days = period === 'daily' ? 7 : period === 'weekly' ? 4 : 12;
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  
  const performanceData = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    
    if (period === 'daily') {
      date.setDate(date.getDate() - (days - 1 - i));
    } else if (period === 'weekly') {
      date.setDate(date.getDate() - (days - 1 - i) * 7);
    } else {
      date.setMonth(date.getMonth() - (days - 1 - i));
    }
    
    // Calculate progressive growth
    const progressFactor = (i + 1) / days;
    const growthMultiplier = totalCurrentValue / totalInvested;
    const baseValue = totalInvested * (1 + (growthMultiplier - 1) * progressFactor);
    
    // Add some realistic market fluctuation
    const fluctuation = 1 + (Math.random() - 0.5) * 0.05; // ±2.5% fluctuation
    const value = Math.round(baseValue * fluctuation);
    
    performanceData.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(totalInvested * 0.9, value), // Never go below 90% of invested amount
      label: period === 'daily' ? 
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
        period === 'weekly' ? `Week ${i + 1}` : 
        date.toLocaleString('default', { month: 'short' })
    });
  }
  
  return performanceData;
};

export const initializePortfolioDemo = () => {
  // Only simulate growth for existing real investments - no sample data
  const existingInvestments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
  
  if (existingInvestments.length > 0) {
    const updatedInvestments = simulatePortfolioGrowth();
    return updatedInvestments;
  }
  
  return [];
};

// Auto-update portfolio values every 30 seconds when page is active
export const startPortfolioAutoUpdate = (onUpdate) => {
  const updateInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      const updatedInvestments = simulatePortfolioGrowth();
      onUpdate?.(updatedInvestments);
    }
  }, 30000); // Update every 30 seconds
  
  return () => clearInterval(updateInterval);
};