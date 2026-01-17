import { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';

// Hook for authentication state
export const useAuth = () => {
  const { user, loading, login, register, logout } = useFirebase();
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    
    const result = await login(email, password);
    
    if (!result.success) {
      setAuthError(result.error);
    }
    
    setAuthLoading(false);
    return result;
  };

  const handleRegister = async (email, password, userData = {}) => {
    setAuthLoading(true);
    setAuthError(null);
    
    const result = await register(email, password, userData);
    
    if (!result.success) {
      setAuthError(result.error);
    }
    
    setAuthLoading(false);
    return result;
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    const result = await logout();
    setAuthLoading(false);
    return result;
  };

  return {
    user,
    loading: loading || authLoading,
    error: authError,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAuthenticated: !!user
  };
};

// Hook for property management
export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getProperties } = useFirebase();

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getProperties(filters);
        if (result.success) {
          setProperties(result.properties);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [JSON.stringify(filters)]);

  const refreshProperties = async () => {
    setLoading(true);
    const result = await getProperties(filters);
    if (result.success) {
      setProperties(result.properties);
    }
    setLoading(false);
  };

  return { properties, loading, error, refreshProperties };
};

// Hook for file uploads with progress
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const { uploadFile } = useFirebase();

  const upload = async (file, folder = 'uploads') => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadFile(file, folder);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success) {
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
        }, 500);
        return result;
      } else {
        setError(result.error);
        setUploading(false);
        return result;
      }
    } catch (err) {
      setError(err.message);
      setUploading(false);
      return { success: false, error: err.message };
    }
  };

  return { upload, uploading, progress, error };
};

// Hook for investment management
export const useInvestments = (userId = null) => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getInvestments, addInvestment, updateInvestmentValue } = useFirebase();

  useEffect(() => {
    const loadInvestments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getInvestments(userId);
        if (result.success) {
          setInvestments(result.investments);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInvestments();
  }, [userId]);

  const createInvestment = async (investmentData) => {
    setError(null);
    const result = await addInvestment(investmentData);
    
    if (result.success) {
      setInvestments(prev => [result.investment, ...prev]);
    } else {
      setError(result.error);
    }
    
    return result;
  };

  const updateValue = async (investmentId, newValue) => {
    setError(null);
    const result = await updateInvestmentValue(investmentId, newValue);
    
    if (result.success) {
      setInvestments(prev => 
        prev.map(inv => inv.id === investmentId ? result.investment : inv)
      );
    } else {
      setError(result.error);
    }
    
    return result;
  };

  const refreshInvestments = async () => {
    setLoading(true);
    const result = await getInvestments(userId);
    if (result.success) {
      setInvestments(result.investments);
    }
    setLoading(false);
  };

  return { 
    investments, 
    loading, 
    error, 
    createInvestment, 
    updateValue, 
    refreshInvestments 
  };
};

// Hook for portfolio summary and analytics
export const usePortfolio = (userId = null) => {
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily');
  const { getPortfolioSummary, getPortfolioPerformance } = useFirebase();

  useEffect(() => {
    const loadPortfolioData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [summaryResult, performanceResult] = await Promise.all([
          getPortfolioSummary(userId),
          getPortfolioPerformance(userId, period)
        ]);
        
        if (summaryResult.success) {
          setSummary(summaryResult.summary);
        } else {
          setError(summaryResult.error);
        }
        
        if (performanceResult.success) {
          setPerformance(performanceResult.performance);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, [userId, period]);

  const changePeriod = async (newPeriod) => {
    setPeriod(newPeriod);
    setLoading(true);
    
    try {
      const result = await getPortfolioPerformance(userId, newPeriod);
      if (result.success) {
        setPerformance(result.performance);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshPortfolio = async () => {
    setLoading(true);
    
    try {
      const [summaryResult, performanceResult] = await Promise.all([
        getPortfolioSummary(userId),
        getPortfolioPerformance(userId, period)
      ]);
      
      if (summaryResult.success) {
        setSummary(summaryResult.summary);
      }
      
      if (performanceResult.success) {
        setPerformance(performanceResult.performance);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { 
    summary, 
    performance, 
    loading, 
    error, 
    period, 
    changePeriod, 
    refreshPortfolio 
  };
};