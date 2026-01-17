// Test utility to add a sample investment for testing - DISABLED for production
export const addTestInvestment = () => {
  console.log('Test investment creation disabled - use real investment flow');
  return null;
};

// Function to clear all test data
export const clearTestData = () => {
  localStorage.removeItem('userInvestments');
  console.log('Test investment data cleared');
};