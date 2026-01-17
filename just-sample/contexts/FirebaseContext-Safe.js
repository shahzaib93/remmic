import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  loginUser,
  signUpUser,
  logoutUser as firebaseLogout,
  onAuthChange,
  getUserProfile,
  addInvestment,
  getUserInvestments,
  submitContactMessage as submitContactMessageRemote,
  getAllContactMessages as getAllContactMessagesRemote,
  markMessageAsRead as markMessageAsReadRemote,
  addProperty,
  getProperties as getPropertiesRemote,
  updatePropertyStatus,
  getAllProperties,
  getAllInvestments,
  updateUserProfile,
  addEvaluation as addEvaluationRemote,
  updateEvaluationStatus as updateEvaluationStatusRemote,
  deleteEvaluation as deleteEvaluationRemote,
  deleteContactMessage as deleteContactMessageRemote,
  replyToContactMessage as replyToContactMessageRemote,
} from '../lib/firebase'

// Create Firebase Context
const FirebaseContext = createContext();

// Custom hook to use Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Mock/Fallback Firebase Provider for when Firebase is not installed
export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const readStoredUser = () => {
    if (typeof window === 'undefined') return null
    try {
      const stored = window.localStorage.getItem('userData')
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      
      // Validate that the stored user data has required fields
      if (!parsed.id || !parsed.email) {
        console.warn('Stored user data is invalid, clearing...')
        window.localStorage.removeItem('userData')
        return null
      }
      
      return parsed
    } catch (error) {
      console.warn('Failed to parse stored user data, clearing corrupt data:', error)
      // Clear corrupt data
      try {
        window.localStorage.removeItem('userData')
      } catch (clearError) {
        console.error('Failed to clear corrupt user data:', clearError)
      }
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('Firebase auth state changed:', { 
        hasUser: !!firebaseUser, 
        isAnonymous: firebaseUser?.isAnonymous,
        email: firebaseUser?.email 
      })

      if (firebaseUser) {
        if (firebaseUser.isAnonymous) {
          setUser(null)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('userData')
            window.localStorage.removeItem('currentUser')
            window.localStorage.removeItem('userToken')
          }
          setLoading(false)
          return
        }

        let sessionUser = readStoredUser()
        
        // Only fetch new profile if we don't have stored data or UIDs don't match
        if (!sessionUser || sessionUser.id !== firebaseUser.uid) {
          console.log('Fetching fresh user profile...')
          
          // Try to get profile, but fallback gracefully if permissions fail
          let profile = null
          try {
            profile = await getUserProfile(firebaseUser.uid)
          } catch (error) {
            console.warn('Failed to fetch user profile, using Firebase auth data:', error)
          }

          // Determine role with fallback logic
          let userRole = 'buyer'
          if (profile?.role) {
            userRole = profile.role
          } else if (firebaseUser.email?.includes('admin')) {
            userRole = 'admin'
          } else if (typeof window !== 'undefined') {
            // Check if localStorage has admin flags
            const isAdmin = window.localStorage.getItem('isAdmin')
            const storedAdmin = window.localStorage.getItem('adminUser')
            if (isAdmin && storedAdmin) {
              try {
                const adminData = JSON.parse(storedAdmin)
                if (adminData.role === 'admin') {
                  userRole = 'admin'
                }
              } catch (e) {
                console.warn('Failed to parse stored admin data')
              }
            }
          }

          sessionUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: profile?.fullName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
            email: firebaseUser.email || profile?.email || '',
            role: userRole,
            phone: profile?.phone || '',
            memberSince: profile?.memberSince || new Date(firebaseUser.metadata?.creationTime || Date.now()).toISOString().split('T')[0],
          }

          if (typeof window !== 'undefined') {
            try {
              window.localStorage.setItem('userData', JSON.stringify(sessionUser))
              window.localStorage.setItem('currentUser', JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email }))
            } catch (storageError) {
              console.error('Failed to store user data in localStorage:', storageError)
              // Continue without localStorage - user will need to re-login on refresh
            }
          }
        } else {
          console.log('Using cached user data')
        }
        
        setUser(sessionUser)
      } else {
        // Only clear if we're not in the middle of a page transition
        // Check if we have stored session data that should persist
        const storedUser = readStoredUser()
        const isAdmin = typeof window !== 'undefined' ? window.localStorage.getItem('isAdmin') : null
        
        if (storedUser && isAdmin) {
          console.log('Preserving session during navigation...')
          setUser(storedUser)
        } else {
          console.log('Clearing user session')
          setUser(null)
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('currentUser')
            window.localStorage.removeItem('userData')
            window.localStorage.removeItem('userToken')
          }
        }
      }
      setLoading(false)
    })

    // Initialize with stored user if available
    const initialUser = readStoredUser()
    if (initialUser) {
      console.log('Initializing with stored user:', initialUser.email)
      setUser(initialUser)
      setLoading(false)
    }

    return () => unsubscribe()
  }, [])

  const login = async (email, password, requiredRole) => {
    const result = await loginUser(email, password, requiredRole)
    if (result.success && result.userData) {
      const adminName = result.userData.fullName || result.userData.name || email.split('@')[0]
      setUser({
        ...result.userData,
        name: adminName,
        fullName: result.userData.fullName || adminName,
      })
    }
    return result
  }

  const register = async (email, password, userData = {}) => {
    const result = await signUpUser(email, password, userData.fullName || '', userData.role || 'buyer')
    if (result.success) {
      const baseProfile = result.userData || {
        email,
        fullName: userData.fullName || email.split('@')[0],
        role: userData.role || 'buyer',
      }
      const adminName = baseProfile.fullName || baseProfile.name || userData.fullName || email.split('@')[0]
      setUser({
        ...baseProfile,
        name: adminName,
        fullName: adminName,
      })
    }
    return result
  }

  const updateProfile = async (updates = {}) => {
    if (!user?.uid) {
      throw new Error('No authenticated user')
    }

    const newProfile = { ...user, ...updates }
    setUser(newProfile)

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('userData', JSON.stringify(newProfile))
        if (user.role === 'admin') {
          window.localStorage.setItem('adminUser', JSON.stringify({
            ...newProfile,
            role: 'admin',
          }))
        }
      } catch (storageError) {
        console.error('Failed to update user profile in localStorage:', storageError)
        // Continue without updating localStorage
      }
    }

    const response = await updateUserProfile(user.uid, newProfile)
    return response
  }

  const logout = async () => {
    try {
      console.log('Logging out user...')
      const result = await firebaseLogout()
      
      if (result.success) {
        setUser(null)
        if (typeof window !== 'undefined') {
          // Clear session data
          window.localStorage.removeItem('isAdmin')
          window.localStorage.removeItem('adminUser')
          window.localStorage.removeItem('userData')
          window.localStorage.removeItem('currentUser')
          window.localStorage.removeItem('userToken')
        }
      }
      return result
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local session
      setUser(null)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('isAdmin')
        window.localStorage.removeItem('adminUser')
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem('currentUser')
        window.localStorage.removeItem('userToken')
      }
      return { success: false, error: error.message }
    }
  }

  // Helper function to check localStorage space
  const checkStorageSpace = () => {
    try {
      const test = 'storage-test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  // Helper function to clean up old data
  const cleanupOldData = () => {
    try {
      const properties = JSON.parse(localStorage.getItem('userProperties') || '[]')
      
      // Remove properties older than 30 days with large images
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const cleanedProperties = properties.filter(prop => {
        const propDate = new Date(prop.createdAt || Date.now())
        const hasLargeImages = prop.images && prop.images.some(img => 
          img.url && img.url.length > 50000 // Remove if base64 > 50KB
        )
        
        // Keep recent properties or those without large images
        return propDate > thirtyDaysAgo || !hasLargeImages
      })
      
      if (cleanedProperties.length < properties.length) {
        localStorage.setItem('userProperties', JSON.stringify(cleanedProperties))
        console.log(`Cleaned up ${properties.length - cleanedProperties.length} old properties with large images`)
      }
    } catch (error) {
      console.warn('Failed to cleanup old data:', error)
    }
  }

  // Property management functions using Firestore with localStorage backup
  const addPropertyWithOptimization = async (propertyData) => {
    try {
      // Optimize images before storing
      let optimizedPropertyData = { ...propertyData }
      
      if (optimizedPropertyData.images && optimizedPropertyData.images.length > 0) {
        optimizedPropertyData.images = optimizedPropertyData.images.map(img => {
          if (img.url && img.url.startsWith('data:image/') && img.url.length > 100000) {
            // If image is too large, store only metadata
            return {
              name: img.name,
              type: img.type,
              size: 'large',
              note: 'Image too large for direct storage - would be stored in cloud storage in production'
            }
          }
          return img
        })
      }

      if (optimizedPropertyData.mediaAssets) {
        const sanitizeMediaEntries = (entries = []) => entries.map(entry => {
          if (!entry) return entry
          if (entry.url && entry.url.startsWith('data:') && entry.url.length > 100000) {
            return {
              name: entry.name,
              type: entry.type,
              size: entry.size || 'large',
              note: 'Media too large for direct storage - would be stored in cloud storage in production'
            }
          }
          return entry
        })

        optimizedPropertyData.mediaAssets = {
          simpleImages: sanitizeMediaEntries(optimizedPropertyData.mediaAssets.simpleImages || []),
          panoramicImages: sanitizeMediaEntries(optimizedPropertyData.mediaAssets.panoramicImages || []),
          videos: sanitizeMediaEntries(optimizedPropertyData.mediaAssets.videos || [])
        }
      }

      // Strip unsupported values before sending to Firestore
      const sanitizedForFirestore = (data) => {
        if (!data || typeof data !== 'object') return data
        const clone = Array.isArray(data) ? [] : {}
        Object.keys(data).forEach((key) => {
          const value = data[key]
          if (value == null) {
            return
          }
          if (typeof File !== 'undefined' && value instanceof File) {
            clone[key] = {
              name: value.name,
              type: value.type,
              size: value.size,
              note: 'File metadata stored. Actual file should be uploaded to storage in production.',
            }
            return
          }
          if (typeof Blob !== 'undefined' && value instanceof Blob) {
            clone[key] = {
              type: value.type,
              size: value.size,
              note: 'Blob stripped for Firestore write. Upload actual data to storage.'
            }
            return
          }
          if (typeof value === 'string' && value.startsWith('data:') && value.length > 50000) {
            // Skip huge base64 strings for Firestore writes
            clone[key] = 'data-url-removed'
            return
          }
          if (typeof value === 'object') {
            clone[key] = sanitizedForFirestore(value)
            return
          }
          if (typeof value !== 'function') {
            clone[key] = value
          }
        })
        return clone
      }

      const firestorePayload = sanitizedForFirestore(optimizedPropertyData)

      // Use the Firestore function from firebase.js
      const result = await addProperty(firestorePayload)

      if (!result.success && result.error.includes('Storage quota exceeded')) {
        // Try without images as fallback
        const propertyWithoutImages = { ...firestorePayload }
        delete propertyWithoutImages.images
        
        const retryResult = await addProperty(propertyWithoutImages)
        if (retryResult.success) {
          return {
            ...retryResult,
            warning: 'Property saved but images were too large to store. In production, images would be stored in cloud storage.'
          }
        }
      }
      
      return result
    } catch (error) {
      console.error('Add property with optimization error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to add property' 
      }
    }
  }

  const getProperties = async (filters = {}) => {
    try {
      const result = await getPropertiesRemote(filters)

      if (result.success && Array.isArray(result.properties)) {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem('userProperties', JSON.stringify(result.properties))
          } catch (storageError) {
            console.warn('Failed to cache properties locally:', storageError)
          }
        }
        return result
      }

      return result
    } catch (error) {
      console.error('Get properties via context failed:', error)
      try {
        const cached = typeof window !== 'undefined'
          ? JSON.parse(window.localStorage.getItem('userProperties') || '[]')
          : []
        return { success: true, properties: cached, fallback: true }
      } catch (storageError) {
        return { success: false, error: error.message || 'Failed to get properties' }
      }
    }
  }

  const updateProperty = async (propertyId, updateData) => {
    try {
      const properties = JSON.parse(localStorage.getItem('userProperties') || '[]');
      const propertyIndex = properties.findIndex(p => p.id === propertyId);
      
      if (propertyIndex >= 0) {
        properties[propertyIndex] = {
          ...properties[propertyIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('userProperties', JSON.stringify(properties));
        return { success: true, property: properties[propertyIndex] };
      }
      
      return { success: false, error: 'Property not found' };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update property' };
    }
  };

  const deleteProperty = async (propertyId) => {
    try {
      const properties = JSON.parse(localStorage.getItem('userProperties') || '[]');
      const filteredProperties = properties.filter(p => p.id !== propertyId);
      localStorage.setItem('userProperties', JSON.stringify(filteredProperties));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete property' };
    }
  };

  const deleteInvestment = async (investmentId) => {
    try {
      const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
      const filteredInvestments = investments.filter((investment) => investment.id !== investmentId);
      localStorage.setItem('userInvestments', JSON.stringify(filteredInvestments));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete investment' };
    }
  };

  // Calendar event helpers (local storage only)
  const createCalendarEvent = async (eventData) => {
    try {
      const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      const record = {
        id: `event-${Date.now()}`,
        ...eventData,
        createdAt: new Date().toISOString(),
      }
      events.push(record)
      localStorage.setItem('calendarEvents', JSON.stringify(events))
      return { success: true, event: record }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to create event' }
    }
  }

  const getCalendarEvents = async () => {
    try {
      const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      return { success: true, events }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to load events', events: [] }
    }
  }

  const deleteCalendarEvent = async (eventId) => {
    try {
      const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]')
      const filtered = events.filter((event) => event.id !== eventId)
      localStorage.setItem('calendarEvents', JSON.stringify(filtered))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to delete event' }
    }
  }

  // Evaluation functions
  const submitEvaluation = async (evaluationData) => {
    try {
      const basePayload = {
        ...evaluationData,
        userId: evaluationData.userId || user?.uid || null,
        submittedAt: new Date().toISOString(),
        status: evaluationData.status || 'Under Evaluation',
      }

      const result = await addEvaluationRemote(basePayload)
      if (result.success) {
        return result
      }

      throw new Error(result.error || 'Failed to submit evaluation')
    } catch (error) {
      console.warn('submitEvaluation remote failed, falling back to local storage:', error)
      try {
        const fallbackEvaluation = {
          id: Date.now().toString(),
          ...evaluationData,
          userId: user?.uid,
          status: 'Under Evaluation',
          submittedAt: new Date().toISOString(),
        }

        const evaluations = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
        evaluations.push(fallbackEvaluation)
        localStorage.setItem('evaluationProperties', JSON.stringify(evaluations))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }))
        } catch (err) {
          window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
        }

        return { success: true, id: fallbackEvaluation.id, evaluation: fallbackEvaluation }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to submit evaluation' }
      }
    }
  };

  const getEvaluations = async (userId = null) => {
    try {
      let evaluations = JSON.parse(localStorage.getItem('evaluationProperties') || '[]');
      
      if (userId) {
        evaluations = evaluations.filter(e => e.userId === userId);
      }
      
      evaluations.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      return { success: true, evaluations };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get evaluations' };
    }
  };

  const updateEvaluationStatusLocal = async (evaluationId, updates = {}) => {
    try {
      const result = await updateEvaluationStatusRemote(evaluationId, updates)
      if (result.success) {
        return result
      }
      throw new Error(result.error || 'Failed to update evaluation via Firestore')
    } catch (error) {
      console.warn('updateEvaluationStatus remote failed, falling back to local storage:', error)
      try {
        const evaluations = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
        const index = evaluations.findIndex((evaluation) => evaluation.id === evaluationId)
        if (index === -1) {
          return { success: false, error: 'Evaluation not found' }
        }

        const updated = {
          ...evaluations[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }

        evaluations[index] = updated
        localStorage.setItem('evaluationProperties', JSON.stringify(evaluations))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }))
        } catch (err) {
          window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
        }
        return { success: true, evaluation: updated }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to update evaluation' }
      }
    }
  };

  const deleteEvaluationLocal = async (evaluationId) => {
    try {
      const result = await deleteEvaluationRemote(evaluationId)
      if (result.success) {
        return result
      }
      throw new Error(result.error || 'Failed to delete evaluation via Firestore')
    } catch (error) {
      console.warn('deleteEvaluation remote failed, falling back to local storage:', error)
      try {
        const evaluations = JSON.parse(localStorage.getItem('evaluationProperties') || '[]')
        const filtered = evaluations.filter((evaluation) => evaluation.id !== evaluationId)
        localStorage.setItem('evaluationProperties', JSON.stringify(filtered))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }))
        } catch (err) {
          window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
        }
        return { success: true }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to delete evaluation' }
      }
    }
  };

  // Bidding functions
  const submitBid = async (bidData) => {
    try {
      const bidWithId = {
        id: Date.now().toString(),
        ...bidData,
        userId: user?.uid,
        bidTime: new Date().toISOString(),
        status: 'active'
      };

      const bids = JSON.parse(localStorage.getItem('propertyBids') || '{}');
      if (!bids[bidData.propertyId]) {
        bids[bidData.propertyId] = [];
      }
      bids[bidData.propertyId].push(bidWithId);
      localStorage.setItem('propertyBids', JSON.stringify(bids));
      
      return { success: true, id: bidWithId.id, bid: bidWithId };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to submit bid' };
    }
  };

  const getBids = async (propertyId = null) => {
    try {
      const allBids = JSON.parse(localStorage.getItem('propertyBids') || '{}');
      
      if (propertyId) {
        const bids = allBids[propertyId] || [];
        return { success: true, bids };
      }
      
      // Return all bids flattened
      const bids = Object.values(allBids).flat();
      bids.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
      
      return { success: true, bids };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get bids' };
    }
  };

  // Investment functions using localStorage
  const addInvestment = async (investmentData) => {
    try {
      const investmentWithId = {
        id: Date.now().toString(),
        ...investmentData,
        userId: user?.uid,
        investmentDate: new Date().toISOString(),
        status: 'active',
        currentValue: investmentData.amount, // Initial value equals investment amount
        profitLoss: 0,
        returnPercentage: 0
      };

      const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
      investments.push(investmentWithId);
      localStorage.setItem('userInvestments', JSON.stringify(investments));
      
      return { success: true, id: investmentWithId.id, investment: investmentWithId };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to add investment' };
    }
  };

  const getInvestments = async (userId = null) => {
    try {
      let investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
      
      if (userId) {
        investments = investments.filter(i => i.userId === userId);
      }
      
      // Sort by investment date
      investments.sort((a, b) => new Date(b.investmentDate) - new Date(a.investmentDate));
      
      return { success: true, investments };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get investments' };
    }
  };

  const updateInvestmentValue = async (investmentId, newValue) => {
    try {
      const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
      const investmentIndex = investments.findIndex(i => i.id === investmentId);
      
      if (investmentIndex >= 0) {
        const investment = investments[investmentIndex];
        const profitLoss = newValue - investment.amount;
        const returnPercentage = ((profitLoss / investment.amount) * 100).toFixed(2);
        
        investments[investmentIndex] = {
          ...investment,
          currentValue: newValue,
          profitLoss: profitLoss,
          returnPercentage: parseFloat(returnPercentage),
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('userInvestments', JSON.stringify(investments));
        return { success: true, investment: investments[investmentIndex] };
      }
      
      return { success: false, error: 'Investment not found' };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update investment' };
    }
  };

  const updateInvestmentStatusLocal = async (investmentId, status = 'confirmed', additionalUpdates = {}) => {
    try {
      const investments = JSON.parse(localStorage.getItem('userInvestments') || '[]');
      const investmentIndex = investments.findIndex((investment) => investment.id === investmentId);

      if (investmentIndex === -1) {
        return { success: false, error: 'Investment not found' };
      }

      const investment = investments[investmentIndex];
      const updatedInvestment = {
        ...investment,
        status,
        paymentReceived: status !== 'pending',
        confirmationDate: status !== 'pending' ? new Date().toISOString() : investment.confirmationDate,
        updatedAt: new Date().toISOString(),
        ...additionalUpdates,
      };

      investments[investmentIndex] = updatedInvestment;
      localStorage.setItem('userInvestments', JSON.stringify(investments));

      return { success: true, investment: updatedInvestment };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update investment status' };
    }
  };

  const getPortfolioSummary = async (userId = null) => {
    try {
      const { investments } = await getInvestments(userId);
      
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
      const totalProfit = totalCurrentValue - totalInvested;
      const totalLoss = investments.reduce((sum, inv) => sum + (inv.profitLoss < 0 ? Math.abs(inv.profitLoss) : 0), 0);
      const avgReturns = investments.length > 0 ? 
        (investments.reduce((sum, inv) => sum + inv.returnPercentage, 0) / investments.length).toFixed(2) : 0;
      
      return {
        success: true,
        summary: {
          totalInvested,
          totalCurrentValue,
          totalProfit,
          totalLoss,
          avgReturns: parseFloat(avgReturns),
          activeProperties: investments.filter(i => i.status === 'active').length,
          totalInvestments: investments.length
        }
      };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get portfolio summary' };
    }
  };

  const getPortfolioPerformance = async (userId = null, period = 'daily') => {
    try {
      const { investments } = await getInvestments(userId);
      
      // Generate mock performance data based on investments
      const performanceData = [];
      const days = period === 'daily' ? 7 : period === 'weekly' ? 4 : 12;
      const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
      
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        
        // Simulate growth over time
        const growthFactor = (i + 1) / days;
        const value = Math.round(totalValue * growthFactor);
        
        performanceData.push({
          date: date.toISOString().split('T')[0],
          value: value,
          label: period === 'daily' ? 
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
            period === 'weekly' ? `Week ${i + 1}` : 
            date.toLocaleString('default', { month: 'short' })
        });
      }
      
      return { success: true, performance: performanceData };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to get performance data' };
    }
  };

  // File upload function (creates local URLs)
  const uploadFile = async (file, folder = 'uploads') => {
    try {
      const localUrl = URL.createObjectURL(file);
      return { 
        success: true, 
        url: localUrl, 
        fileName: file.name,
        message: 'File stored locally (Firebase not available)'
      };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to upload file' };
    }
  };

  // Contact message functions
  const submitContactMessage = async (messageData) => {
    try {
      const result = await submitContactMessageRemote(messageData)
      if (result.success) {
        return result
      }

      throw new Error(result.error || 'Failed to submit message via Firestore')
    } catch (error) {
      console.warn('submitContactMessage remote failed, falling back to local storage:', error)
      try {
        const messageId = `msg_${Date.now()}`
        const contactMessage = {
          ...messageData,
          id: messageId,
          createdAt: new Date().toISOString(),
          status: 'unread',
          priority: 'normal'
        }

        const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
        existingMessages.push(contactMessage)
        localStorage.setItem('contactMessages', JSON.stringify(existingMessages))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
        } catch (err) {
          window.dispatchEvent(new Event('contactMessagesUpdated'))
        }

        return { success: true, id: messageId, message: contactMessage, fallback: true }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to submit message' }
      }
    }
  };

  const getAllContactMessages = async () => {
    try {
      const result = await getAllContactMessagesRemote()
      if (result.success) {
        return result
      }
      throw new Error(result.error || 'Failed to fetch messages via Firestore')
    } catch (error) {
      console.warn('getAllContactMessages remote failed, falling back to local storage:', error)
      try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        return { success: true, messages, fallback: true }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to get messages', messages: [] }
      }
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      const result = await markMessageAsReadRemote(messageId)
      if (result.success) {
        return result
      }
      throw new Error(result.error || 'Failed to mark message as read via Firestore')
    } catch (error) {
      console.warn('markMessageAsRead remote failed, falling back to local storage:', error)
      try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
        const messageIndex = messages.findIndex(msg => msg.id === messageId)
        if (messageIndex !== -1) {
          messages[messageIndex].status = 'read'
          messages[messageIndex].readAt = new Date().toISOString()
          localStorage.setItem('contactMessages', JSON.stringify(messages))
          try {
            window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
          } catch (err) {
            window.dispatchEvent(new Event('contactMessagesUpdated'))
          }
          return { success: true, fallback: true }
        }
        return { success: false, error: 'Message not found' }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to mark as read' }
      }
    }
  };

  const replyToContactMessage = async (messageId, replyBody, responder = {}) => {
    const replyRecord = {
      id: `reply_${Date.now()}`,
      body: replyBody,
      responderName: responder.name || 'Admin',
      responderEmail: responder.email || 'admin@remmic.com',
      sentAt: new Date().toISOString(),
    }

    try {
      const result = await replyToContactMessageRemote(messageId, replyRecord)
      if (result.success) {
        return result
      }
      throw new Error(result.error || 'Failed to send reply')
    } catch (error) {
      console.warn('replyToContactMessage remote failed, falling back to local storage:', error)
      try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
        const messageIndex = messages.findIndex((msg) => msg.id === messageId)

        if (messageIndex === -1) {
          return { success: false, error: 'Message not found' }
        }

        const existingReplies = messages[messageIndex].replies || []
        messages[messageIndex] = {
          ...messages[messageIndex],
          replies: [...existingReplies, replyRecord],
          status: 'replied',
          repliedAt: replyRecord.sentAt,
        }

        localStorage.setItem('contactMessages', JSON.stringify(messages))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
        } catch (err) {
          window.dispatchEvent(new Event('contactMessagesUpdated'))
        }
        return { success: true, reply: replyRecord }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to send reply' }
      }
    }
  };

  const deleteContactMessage = async (messageId) => {
    try {
      const result = await deleteContactMessageRemote(messageId)
      if (result.success) {
        return result
      }
      throw new Error(result.error || 'Failed to delete message via Firestore')
    } catch (error) {
      console.warn('deleteContactMessage remote failed, falling back to local storage:', error)
      try {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]')
        const filteredMessages = messages.filter((message) => message.id !== messageId)
        localStorage.setItem('contactMessages', JSON.stringify(filteredMessages))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
        } catch (err) {
          window.dispatchEvent(new Event('contactMessagesUpdated'))
        }
        return { success: true }
      } catch (fallbackError) {
        return { success: false, error: fallbackError.message || 'Failed to delete message' }
      }
    }
  };

  const value = {
    // Auth state
    user,
    loading,
    
    // Auth functions
    login,
    register,
    logout,
    
    // Property functions (Firestore-enabled)
    addProperty: addPropertyWithOptimization,
    getProperties,
    updateProperty,
    deleteProperty,
    updatePropertyStatus,
    getAllProperties,
    
    // Evaluation functions
    submitEvaluation,
    updateEvaluationStatus: updateEvaluationStatusLocal,
    deleteEvaluation: deleteEvaluationLocal,
    getEvaluations,
    
    // Bidding functions
    submitBid,
    getBids,
    
    // Investment functions (Firestore-enabled)
    addInvestment,
    getInvestments: getUserInvestments,
    getAllInvestments,
    updateInvestmentStatus: updateInvestmentStatusLocal,
    deleteInvestment,
    updateInvestmentValue,
    getPortfolioSummary,
    getPortfolioPerformance,

    // Contact message functions
    submitContactMessage,
    getAllContactMessages,
    markMessageAsRead,
    replyToContactMessage,
    updateProfile,
    deleteContactMessage,

    // Calendar helpers
    createCalendarEvent,
    getCalendarEvents,
    deleteCalendarEvent,

    // File upload
    uploadFile,

    // Firebase availability
    isFirebaseAvailable: true
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
