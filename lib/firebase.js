import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore'

const firebaseMeasurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''

const firebaseConfig = {
  apiKey: 'AIzaSyAqgXk7L_BrF4e4EhfFmYgrsbcSOfvqg6g',
  authDomain: 'remmic-a1059.firebaseapp.com',
  projectId: 'remmic-a1059',
  storageBucket: 'remmic-a1059.firebasestorage.app',
  messagingSenderId: '1022087727324',
  appId: '1:1022087727324:web:784db036690809f83acc19',
}

if (firebaseMeasurementId.trim()) {
  firebaseConfig.measurementId = firebaseMeasurementId.trim()
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
let analytics = null
if (typeof window !== 'undefined') {
  if (!firebaseConfig.measurementId) {
    console.info('Analytics disabled: Firebase measurement ID missing')
  } else {
  try {
    // Check if we're in a proper browser environment
    if (window.navigator.onLine !== false) {
      // Add timeout to prevent hanging on analytics init
      const initAnalytics = () => {
        return Promise.race([
          getAnalytics(app),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analytics init timeout')), 5000)
          )
        ])
      }
      
      initAnalytics()
        .then(analyticsInstance => {
          analytics = analyticsInstance
        })
        .catch(error => {
          console.warn('Analytics init failed:', error.message)
          analytics = null
        })
    } else {
      console.warn('Analytics skipped: App appears to be offline')
    }
  } catch (error) {
    console.warn('Analytics init failed:', error.message)
    analytics = null
  }
  }
}

const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Auth persistence setup failed:', error)
  })
}

const sanitizeForFirestore = (value) => {
  if (value == null) return value

  if (typeof File !== 'undefined' && value instanceof File) {
    return {
      name: value.name,
      type: value.type,
      size: value.size,
      note: 'File reference stored. Upload to storage in production.'
    }
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return {
      type: value.type,
      size: value.size,
      note: 'Blob stripped for Firestore write. Upload to storage in production.'
    }
  }

  if (typeof value === 'string' && value.startsWith('data:') && value.length > 50000) {
    return 'data-url-removed'
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined)
  }

  if (typeof value === 'object') {
    const clone = {}
    Object.keys(value).forEach((key) => {
      const sanitized = sanitizeForFirestore(value[key])
      if (sanitized !== undefined) {
        clone[key] = sanitized
      }
    })
    return clone
  }

  if (typeof value === 'function') {
    return undefined
  }

  return value
}

const persistSession = async (user, role = 'buyer', extra = {}) => {
  if (!user) return null

  const userData = {
    id: user.uid,
    uid: user.uid,
    name: extra.fullName || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
    email: user.email || extra.email || '',
    role,
    phone: extra.phone || '',
    memberSince: extra.memberSince || new Date(user.metadata?.creationTime || Date.now()).toISOString().split('T')[0],
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem('currentUser', JSON.stringify({ uid: user.uid, email: user.email }))
    window.localStorage.setItem('userData', JSON.stringify(userData))
    
    // Special handling for admin users
    if (role === 'admin') {
      window.localStorage.setItem('isAdmin', 'true')
      window.localStorage.setItem('adminUser', JSON.stringify({
        ...userData,
        role: 'admin',
      }))
      console.log('Admin session established')
    }
    window.localStorage.setItem('userToken', user.accessToken || `firebase-token-${Date.now()}`)
  }

  return userData
}

const ensureAuthUser = async (role = 'guest') => {
  if (auth.currentUser) {
    return auth.currentUser
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const credential = await signInAnonymously(auth)
    return credential.user
  } catch (error) {
    console.warn('Anonymous authentication failed:', error)
    return null
  }
}

const fetchUserProfile = async (uid) => {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      return snap.data()
    }
    
    // If document doesn't exist, return null so we can create it
    return null
  } catch (error) {
    console.warn('Failed to load user profile from Firestore:', error)
    
    // Check if it's a permissions error
    if (error.code === 'permission-denied') {
      // For now, return a default profile based on localStorage
      const storedUserData = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('userData') || '{}')
        : {}
      
      return {
        fullName: storedUserData.name || '',
        email: storedUserData.email || '',
        role: storedUserData.role || 'buyer',
        phone: storedUserData.phone || '',
        memberSince: storedUserData.memberSince || new Date().toISOString().split('T')[0]
      }
    }
    
    // For other errors, return a default profile
    return {
      fullName: '',
      email: '',
      role: 'buyer',
      phone: '',
      memberSince: new Date().toISOString().split('T')[0]
    }
  }
}

export const getUserProfile = fetchUserProfile

export const updateUserProfile = async (uid, updates = {}) => {
  if (!uid) {
    return { success: false, error: 'Missing user id' }
  }

  try {
    await setDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true })

    return { success: true }
  } catch (error) {
    console.error('Update user profile error:', error)
    return { success: false, error: error.message }
  }
}

export const signUpUser = async (email, password, fullName, role = 'buyer') => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    const user = credential.user

    try {
      await updateProfile(user, { displayName: fullName })
    } catch (error) {
      console.warn('Failed to update profile:', error)
    }

    try {
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        role,
        phone: '',
        memberSince: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
      })
      console.log('User profile saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save user profile to Firestore (will use localStorage):', firestoreError)
      // Continue with signup even if Firestore write fails - data will be stored in localStorage
    }

    const userData = await persistSession(user, role, { fullName })

    return { success: true, user, userData }
  } catch (error) {
    let errorMessage = 'Failed to create account'
    if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already registered'
    else if (error.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters'
    else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address'

    return { success: false, error: errorMessage }
  }
}

export const loginUser = async (email, password, requiredRole = null) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const user = credential.user

    // FAST PATH: For admin login, skip Firestore and use localStorage immediately
    if (requiredRole === 'admin') {
      const adminProfile = {
        fullName: user.displayName || email.split('@')[0],
        email: user.email,
        role: 'admin',
        phone: '',
        memberSince: new Date(user.metadata?.creationTime || Date.now()).toISOString().split('T')[0]
      }

      const userData = await persistSession(user, 'admin', {
        fullName: adminProfile.fullName,
        phone: adminProfile.phone,
        memberSince: adminProfile.memberSince,
      })

      // Update Firestore in background (non-blocking)
      setDoc(doc(db, 'users', user.uid), {
        ...adminProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(err => console.warn('Background Firestore update failed:', err))

      return { success: true, user, userData }
    }

    // REGULAR PATH: For non-admin users, fetch profile from Firestore
    let profile = await fetchUserProfile(user.uid)

    // If profile doesn't exist in Firestore, create it based on email domain or default
    if (!profile) {
      const defaultRole = requiredRole || 'buyer'
      profile = {
        fullName: user.displayName || email.split('@')[0],
        email: user.email,
        role: defaultRole,
        phone: '',
        memberSince: new Date().toISOString().split('T')[0]
      }

      // Try to save to Firestore in background
      setDoc(doc(db, 'users', user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      }).catch(err => console.warn('Could not save to Firestore:', err))
    }

    const role = profile?.role || requiredRole || 'buyer'

    if (requiredRole && role !== requiredRole) {
      await signOut(auth)
      return { success: false, error: `This account is registered as ${role}, not ${requiredRole}` }
    }

    const userData = await persistSession(user, profile.role, {
      fullName: profile?.fullName,
      phone: profile?.phone,
      memberSince: profile?.memberSince,
    })

    return { success: true, user, userData }
  } catch (error) {
    let errorMessage = 'Failed to login'
    if (error.code === 'auth/user-not-found') errorMessage = 'No account found with this email'
    else if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password'
    else if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address'
    else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many failed attempts. Please try again later'
    else if (error.code === 'auth/invalid-credential') errorMessage = 'Invalid email or password'

    return { success: false, error: errorMessage }
  }
}

export const loginWithGoogle = async () => {
  try {
    const credential = await signInWithPopup(auth, googleProvider)
    const user = credential.user

    let profile = await fetchUserProfile(user.uid)
    if (!profile) {
      profile = {
        fullName: user.displayName || (user.email ? user.email.split('@')[0] : 'Investor'),
        email: user.email || '',
        role: 'buyer',
        phone: '',
        memberSince: new Date(user.metadata?.creationTime || Date.now()).toISOString().split('T')[0],
      }

      setDoc(doc(db, 'users', user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      }, { merge: true }).catch(err => console.warn('Failed to persist Google profile:', err))
    }

    const userData = await persistSession(user, profile.role || 'buyer', {
      fullName: profile.fullName,
      phone: profile.phone,
      memberSince: profile.memberSince,
    })

    return { success: true, user, userData }
  } catch (error) {
    console.error('Google sign-in failed:', error)
    let message = 'Google sign-in failed'
    if (error.code === 'auth/popup-closed-by-user') message = 'Google sign-in popup was closed'
    if (error.code === 'auth/cancelled-popup-request') message = 'Another sign-in request was made'
    return { success: false, error: message }
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('currentUser')
      window.localStorage.removeItem('userData')
      window.localStorage.removeItem('userToken')
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getCurrentUser = () => auth.currentUser

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback)
export const ensureAuthenticated = ensureAuthUser

// Helper function to handle Firestore permissions gracefully
const handleFirestoreOperation = async (operation, fallbackData = null) => {
  try {
    return await operation()
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.warn('Firestore permission denied, using localStorage fallback')
      return fallbackData
    }
    throw error
  }
}

// Property management functions
export const addProperty = async (propertyData) => {
  try {
    let user = getCurrentUser()
    if (!user) {
      user = await ensureAuthUser()
    }
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}
    
    // Allow property registration from forms even without authentication
    // For land registration forms, we can create entries with form owner data

    const cloneForLocalStorage = (value) => {
      if (value == null) return value

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value
      }

      if (value instanceof Date) {
        return value.toISOString()
      }

      if (typeof File !== 'undefined' && value instanceof File) {
        return {
          name: value.name,
          type: value.type,
          size: value.size,
          note: 'File metadata stored locally. Upload original file to storage in production.'
        }
      }

      if (typeof Blob !== 'undefined' && value instanceof Blob) {
        return {
          type: value.type,
          size: value.size,
          note: 'Blob stripped for local storage clone. Upload original data to storage in production.'
        }
      }

      if (Array.isArray(value)) {
        return value.map((item) => cloneForLocalStorage(item))
      }

      if (typeof value === 'object') {
        return Object.keys(value).reduce((acc, key) => {
          acc[key] = cloneForLocalStorage(value[key])
          return acc
        }, {})
      }

      return value
    }

    const localPropertyData = cloneForLocalStorage(propertyData)
    const sanitizedPropertyData = sanitizeForFirestore(propertyData)

    const propertyWithMeta = {
      ...sanitizedPropertyData,
      userId: userData.id || user?.uid || propertyData.ownerCNIC || `form_${Date.now()}`,
      userEmail: userData.email || user?.email || propertyData.ownerEmail || 'form-submission',
      createdAt: serverTimestamp(),
      status: 'pending', // All properties need admin approval
    }

    // Try to save to Firestore with permission handling
    let firestoreResult = null
    try {
      const docRef = await addDoc(collection(db, 'properties'), propertyWithMeta)
      firestoreResult = { id: docRef.id, success: true }
      console.log('Property saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save to Firestore, using localStorage only:', firestoreError)
    }
    
    // Always save to localStorage as backup/primary storage
    const localProperties = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userProperties') || '[]')
      : []
    
    const propertyId = firestoreResult?.id || Date.now().toString()
    const propertyWithId = {
      ...localPropertyData,
      id: propertyId,
      createdAt: new Date().toISOString(),
      status: propertyWithMeta.status,
      userId: propertyWithMeta.userId,
      userEmail: propertyWithMeta.userEmail,
    }
    localProperties.push(propertyWithId)
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userProperties', JSON.stringify(localProperties))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'userProperties' }))
      } catch (err) {
        window.dispatchEvent(new Event('userPropertiesUpdated'))
      }
    }

    return { 
      success: true, 
      id: propertyId, 
      property: propertyWithId,
      savedToFirestore: !!firestoreResult
    }
  } catch (error) {
    console.error('Add property error:', error)
    return { success: false, error: error.message }
  }
}

export const getProperties = async (filters = {}) => {
  try {
    let q = collection(db, 'properties')
    
    // Apply filters
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId))
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status))
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type))
    }
    
    // Order by creation date
    q = query(q, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const properties = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      properties.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, properties }
  } catch (error) {
    console.error('Get properties error:', error)
    // Fallback to localStorage
    const localProperties = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userProperties') || '[]')
      : []
    return { success: true, properties: localProperties }
  }
}

export const updatePropertyStatus = async (propertyId, status) => {
  try {
    await updateDoc(doc(db, 'properties', propertyId), {
      status,
      updatedAt: serverTimestamp()
    })

    // Also update localStorage
    if (typeof window !== 'undefined') {
      const properties = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
      const index = properties.findIndex(p => p.id === propertyId)
      if (index >= 0) {
        properties[index].status = status
        properties[index].updatedAt = new Date().toISOString()
        window.localStorage.setItem('userProperties', JSON.stringify(properties))
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Update property status error:', error)
    return { success: false, error: error.message }
  }
}

export const updateProperty = async (propertyId, updates = {}) => {
  if (!propertyId) {
    return { success: false, error: 'Property ID is required' }
  }

  const sanitizedUpdates = sanitizeForFirestore(updates)
  let firestoreSuccess = false

  try {
    await updateDoc(doc(db, 'properties', propertyId), {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp(),
    })
    firestoreSuccess = true
  } catch (error) {
    console.warn('Failed to update property in Firestore:', error)
  }

  let updatedProperty = null

  if (typeof window !== 'undefined') {
    try {
      const properties = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
      const index = properties.findIndex((property) => property.id === propertyId)

      if (index >= 0) {
        properties[index] = {
          ...properties[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        window.localStorage.setItem('userProperties', JSON.stringify(properties))
        updatedProperty = properties[index]
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'userProperties' }))
        } catch (err) {
          window.dispatchEvent(new Event('userPropertiesUpdated'))
        }
      }
    } catch (error) {
      console.warn('Failed to update property in local storage:', error)
    }
  }

  if (!firestoreSuccess && !updatedProperty) {
    return { success: false, error: 'Failed to update property' }
  }

  return { success: true, property: updatedProperty }
}

export const addEvaluation = async (evaluationData) => {
  try {
    let user = getCurrentUser()
    if (!user) {
      user = await ensureAuthUser()
    }
    const sanitizedEvaluation = sanitizeForFirestore(evaluationData)
    const evaluationWithMeta = {
      ...sanitizedEvaluation,
      userId: sanitizedEvaluation.userId || user?.uid || 'anonymous',
      status: sanitizedEvaluation.status || 'pending',
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'evaluations'), evaluationWithMeta)
      firestoreId = docRef.id
      console.log('Evaluation saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save evaluation to Firestore, using localStorage only:', firestoreError)
    }

    const evaluationId = firestoreId || `eval_${Date.now()}`
    const evaluationRecord = {
      ...sanitizedEvaluation,
      id: evaluationId,
      userId: evaluationWithMeta.userId,
      status: evaluationWithMeta.status,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const evaluations = JSON.parse(window.localStorage.getItem('evaluationProperties') || '[]')
      const filtered = evaluations.filter((evaluation) => evaluation.id !== evaluationId)
      filtered.unshift(evaluationRecord)
      window.localStorage.setItem('evaluationProperties', JSON.stringify(filtered))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }))
      } catch (err) {
        window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
      }
    }

    return { success: true, id: evaluationId, evaluation: evaluationRecord }
  } catch (error) {
    console.error('Add evaluation error:', error)
    return { success: false, error: error.message }
  }
}

export const updateEvaluationStatus = async (evaluationId, updates = {}) => {
  let firestoreSuccess = false
  try {
    const sanitizedUpdates = sanitizeForFirestore(updates)
    await updateDoc(doc(db, 'evaluations', evaluationId), {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp(),
    })
    firestoreSuccess = true
    console.log('Evaluation updated in Firestore')
  } catch (error) {
    console.warn('Failed to update evaluation in Firestore:', error)
  }

  let updatedEvaluation = null
  if (typeof window !== 'undefined') {
    const evaluations = JSON.parse(window.localStorage.getItem('evaluationProperties') || '[]')
    const index = evaluations.findIndex((evaluation) => evaluation.id === evaluationId)
    if (index >= 0) {
      evaluations[index] = {
        ...evaluations[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      window.localStorage.setItem('evaluationProperties', JSON.stringify(evaluations))
      updatedEvaluation = evaluations[index]
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }))
      } catch (err) {
        window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
      }
    }
  }

  return { success: firestoreSuccess || !!updatedEvaluation, evaluation: updatedEvaluation }
}

export const deleteEvaluation = async (evaluationId) => {
  try {
    try {
      await deleteDoc(doc(db, 'evaluations', evaluationId))
      console.log('Evaluation deleted from Firestore')
    } catch (error) {
      console.warn('Failed to delete evaluation from Firestore:', error)
    }

    if (typeof window !== 'undefined') {
      const evaluations = JSON.parse(window.localStorage.getItem('evaluationProperties') || '[]')
      const filtered = evaluations.filter((evaluation) => evaluation.id !== evaluationId)
      window.localStorage.setItem('evaluationProperties', JSON.stringify(filtered))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'evaluationProperties' }))
      } catch (err) {
        window.dispatchEvent(new Event('evaluationPropertiesUpdated'))
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete evaluation error:', error)
    return { success: false, error: error.message }
  }
}

export const addInvestment = async (investmentData) => {
  try {
    const user = getCurrentUser()
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}
    
    if (!user && !userData.id) {
      throw new Error('User not authenticated')
    }

    const sharesPurchased = Number(investmentData.shares) || 0
    const amountInvested = Number(investmentData.amount) || 0
    const shareSnapshot = investmentData.shareSnapshot || {}
    const sharesAvailableBefore = Number(shareSnapshot.sharesAvailableBefore)
    const sharesAvailableAfter = Number(shareSnapshot.sharesAvailableAfter)
    const totalSharesSnapshot = Number(shareSnapshot.totalShares)
    const normalizedSharePrice = Number(investmentData.sharePrice) || Number(shareSnapshot.sharePrice) || 0
    const currentValue = sharesPurchased > 0 && normalizedSharePrice > 0
      ? sharesPurchased * normalizedSharePrice
      : amountInvested

    const investmentWithMeta = {
      ...investmentData,
      userId: userData.id || user?.uid || 'anonymous',
      userEmail: userData.email || user?.email || 'unknown',
      createdAt: new Date().toISOString(), // Use regular timestamp for localStorage
      investmentDate: new Date().toISOString(),
      status: 'completed', // For demo purposes, mark as completed immediately
      currentValue,
      profitLoss: 0,
      returnPercentage: 0,
      escrowStatus: investmentData.paymentMethod === 'escrow' ? 'pending_verification' : 'direct_payment',
      ownershipPercentage: investmentData.ownershipPercentage || 0,
      shareSnapshot: {
        totalShares: Number.isFinite(totalSharesSnapshot) ? totalSharesSnapshot : null,
        sharesAvailableBefore: Number.isFinite(sharesAvailableBefore) ? sharesAvailableBefore : null,
        sharesAvailableAfter: Number.isFinite(sharesAvailableAfter) ? sharesAvailableAfter : null,
        sharePrice: normalizedSharePrice,
        minSharesPerInvestor: Number.isFinite(Number(shareSnapshot.minSharesPerInvestor))
          ? Number(shareSnapshot.minSharesPerInvestor)
          : null,
      },
    }

    let firestoreResult = null
    let investmentId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Try to save to Firestore with permission handling
    try {
      const firestoreData = {
        ...investmentWithMeta,
        createdAt: serverTimestamp(),
        investmentDate: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'investments'), firestoreData)
      firestoreResult = { id: docRef.id, success: true }
      investmentId = docRef.id
      console.log('Investment saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save investment to Firestore, using localStorage only:', firestoreError)
      // Continue with localStorage-only approach
    }
    
    // Always save to localStorage as primary storage when Firestore fails
    const localInvestments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userInvestments') || '[]')
      : []
    
    const investmentWithId = { 
      ...investmentWithMeta, 
      id: investmentId,
      savedToFirestore: !!firestoreResult
    }
    localInvestments.push(investmentWithId)
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userInvestments', JSON.stringify(localInvestments))
    }

    const inferredSharesRemaining = Number.isFinite(sharesAvailableAfter)
      ? Math.max(sharesAvailableAfter, 0)
      : Number.isFinite(sharesAvailableBefore)
        ? Math.max(sharesAvailableBefore - sharesPurchased, 0)
        : null

    const updateLocalPropertyShareAllocation = () => {
      if (typeof window === 'undefined' || !investmentData.propertyId) return
      try {
        const stored = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
        const index = stored.findIndex((prop) => {
          const identifier = prop?.id || prop?.propertyId
          return identifier && identifier.toString() === investmentData.propertyId.toString()
        })
        if (index === -1) return

        const propertyRecord = { ...stored[index] }
        const offering = { ...(propertyRecord.shareOffering || {}) }
        const baselineAvailable = Number.isFinite(offering.sharesAvailable)
          ? offering.sharesAvailable
          : Number.isFinite(offering.totalShares)
            ? offering.totalShares
            : Number.isFinite(totalSharesSnapshot)
              ? totalSharesSnapshot
              : sharesPurchased

        const remaining = inferredSharesRemaining != null
          ? inferredSharesRemaining
          : Math.max(baselineAvailable - sharesPurchased, 0)

        offering.sharesAvailable = remaining
        offering.totalShares = Number.isFinite(offering.totalShares)
          ? offering.totalShares
          : (Number.isFinite(totalSharesSnapshot) ? totalSharesSnapshot : offering.sharesAvailable + sharesPurchased)
        offering.sharesSold = (Number(offering.sharesSold) || 0) + sharesPurchased
        offering.fundingRaised = (Number(offering.fundingRaised) || 0) + amountInvested
        offering.investorCount = (Number(offering.investorCount) || 0) + 1
        offering.lastInvestmentAt = new Date().toISOString()
        offering.sharePrice = normalizedSharePrice || offering.sharePrice || 0
        if (!Array.isArray(offering.performanceHistory)) {
          offering.performanceHistory = []
        }
        if (sharesPurchased > 0 || amountInvested > 0) {
          offering.performanceHistory.push({
            timestamp: new Date().toISOString(),
            sharesPurchased,
            amountInvested,
            investorId: investmentWithMeta.userId,
            ownershipPercentage: investmentWithMeta.ownershipPercentage || 0,
          })
        }

        if (remaining === 0) {
          propertyRecord.status = 'funded'
          offering.status = 'fully-funded'
        }

        propertyRecord.shareOffering = offering
        stored[index] = propertyRecord
        window.localStorage.setItem('userProperties', JSON.stringify(stored))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'userProperties' }))
        } catch (err) {
          window.dispatchEvent(new Event('userPropertiesUpdated'))
        }
      } catch (localError) {
        console.warn('Failed to update local property allocation:', localError)
      }
    }

    const updateRemotePropertyShareAllocation = async () => {
      if (!investmentData.propertyId) return
      try {
        const propertyRef = doc(db, 'properties', investmentData.propertyId)
        const updates = {
          updatedAt: serverTimestamp(),
          'shareOffering.lastInvestmentAt': serverTimestamp(),
        }

        if (sharesPurchased > 0) {
          if (inferredSharesRemaining != null) {
            updates['shareOffering.sharesAvailable'] = Math.max(inferredSharesRemaining, 0)
          } else {
            updates['shareOffering.sharesAvailable'] = increment(-sharesPurchased)
          }
          updates['shareOffering.sharesSold'] = increment(sharesPurchased)
        }

        if (amountInvested > 0) {
          updates['shareOffering.fundingRaised'] = increment(amountInvested)
        }

        if (investmentWithMeta.ownershipPercentage) {
          updates['shareOffering.investorCount'] = increment(1)
        }

        if (normalizedSharePrice > 0) {
          updates['shareOffering.sharePrice'] = normalizedSharePrice
        }

        if (sharesPurchased > 0 || amountInvested > 0) {
          updates['shareOffering.performanceHistory'] = arrayUnion({
            timestamp: serverTimestamp(),
            sharesPurchased,
            amountInvested,
            investorId: investmentWithMeta.userId,
            ownershipPercentage: investmentWithMeta.ownershipPercentage || 0,
          })
        }

        if (inferredSharesRemaining === 0) {
          updates.status = 'funded'
          updates['shareOffering.status'] = 'fully-funded'
        }

        await updateDoc(propertyRef, updates)
      } catch (updateError) {
        console.warn('Failed to update property share allocation in Firestore:', updateError)
      }
    }

    updateLocalPropertyShareAllocation()
    await updateRemotePropertyShareAllocation()

    return { success: true, investment: investmentWithId }
  } catch (error) {
    console.error('Add investment error:', error)
    return { success: false, error: error.message }
  }
}

export const getUserInvestments = async (userId = null) => {
  try {
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}
    
    const targetUserId = userId || userData.id
    
    if (!targetUserId) {
      return { success: true, investments: [] }
    }

    // Fetch from Firestore
    const q = query(
      collection(db, 'investments'),
      where('userId', '==', targetUserId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const investments = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      investments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        investmentDate: data.investmentDate?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, investments }
  } catch (error) {
    console.error('Get investments error:', error)
    // Fallback to localStorage
    const localInvestments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userInvestments') || '[]')
      : []
    return { success: true, investments: localInvestments }
  }
}

export const submitContactMessage = async (messageData) => {
  try {
    const messageWithMeta = {
      ...messageData,
      createdAt: serverTimestamp(),
      status: 'unread',
      priority: 'normal',
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'contactMessages'), messageWithMeta)
    
    // Also save to localStorage as backup
    const localMessages = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('contactMessages') || '[]')
      : []
    
    const messageWithId = { 
      ...messageWithMeta, 
      id: docRef.id, 
      createdAt: new Date().toISOString() 
    }
    localMessages.push(messageWithId)
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('contactMessages', JSON.stringify(localMessages))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
      } catch (err) {
        window.dispatchEvent(new Event('contactMessagesUpdated'))
      }
    }

    return { success: true, message: messageWithId }
  } catch (error) {
    console.error('Submit contact message error:', error)
    return { success: false, error: error.message }
  }
}

export const getAllContactMessages = async () => {
  try {
    // Fetch from Firestore
    const q = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const messages = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, messages }
  } catch (error) {
    console.error('Get contact messages error:', error)
    // Fallback to localStorage
    const localMessages = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('contactMessages') || '[]')
      : []
    localMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { success: true, messages: localMessages }
  }
}

export const markMessageAsRead = async (messageId) => {
  try {
    // Update in Firestore
    await updateDoc(doc(db, 'contactMessages', messageId), {
      status: 'read',
      readAt: serverTimestamp()
    })

    // Also update localStorage
    if (typeof window !== 'undefined') {
      const messages = JSON.parse(window.localStorage.getItem('contactMessages') || '[]')
      const index = messages.findIndex(msg => msg.id === messageId)
      if (index >= 0) {
        messages[index].status = 'read'
        messages[index].readAt = new Date().toISOString()
        window.localStorage.setItem('contactMessages', JSON.stringify(messages))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
        } catch (err) {
          window.dispatchEvent(new Event('contactMessagesUpdated'))
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Mark message as read error:', error)
    return { success: false, error: error.message }
  }
}

export const deleteContactMessage = async (messageId) => {
  try {
    try {
      await deleteDoc(doc(db, 'contactMessages', messageId))
      console.log('Contact message deleted from Firestore')
    } catch (error) {
      console.warn('Failed to delete contact message from Firestore:', error)
    }

    if (typeof window !== 'undefined') {
      const messages = JSON.parse(window.localStorage.getItem('contactMessages') || '[]')
      const filtered = messages.filter((message) => message.id !== messageId)
      window.localStorage.setItem('contactMessages', JSON.stringify(filtered))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
      } catch (err) {
        window.dispatchEvent(new Event('contactMessagesUpdated'))
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete contact message error:', error)
    return { success: false, error: error.message }
  }
}

export const replyToContactMessage = async (messageId, replyRecord) => {
  try {
    const record = sanitizeForFirestore(replyRecord)
    await updateDoc(doc(db, 'contactMessages', messageId), {
      status: 'replied',
      repliedAt: serverTimestamp(),
      replies: arrayUnion({
        ...record,
        sentAt: serverTimestamp(),
      })
    })

    const replyWithMeta = {
      ...replyRecord,
      sentAt: new Date().toISOString()
    }

    if (typeof window !== 'undefined') {
      const messages = JSON.parse(window.localStorage.getItem('contactMessages') || '[]')
      const index = messages.findIndex((message) => message.id === messageId)
      if (index >= 0) {
        const existingReplies = messages[index].replies || []
        messages[index] = {
          ...messages[index],
          status: 'replied',
          repliedAt: replyWithMeta.sentAt,
          replies: [...existingReplies, replyWithMeta],
        }
        window.localStorage.setItem('contactMessages', JSON.stringify(messages))
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'contactMessages' }))
        } catch (err) {
          window.dispatchEvent(new Event('contactMessagesUpdated'))
        }
      }
    }

    return { success: true, reply: replyWithMeta }
  } catch (error) {
    console.error('Reply to contact message error:', error)
    return { success: false, error: error.message }
  }
}

// Additional utility functions for admin
export const getAllProperties = async () => {
  try {
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const properties = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      properties.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, properties }
  } catch (error) {
    console.error('Get all properties error:', error)
    // Fallback to localStorage
    const localProperties = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userProperties') || '[]')
      : []
    return { success: true, properties: localProperties }
  }
}

export const getAllInvestments = async () => {
  try {
    const q = query(collection(db, 'investments'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const investments = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      investments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        investmentDate: data.investmentDate?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, investments }
  } catch (error) {
    console.error('Get all investments error:', error)
    // Fallback to localStorage
    const localInvestments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userInvestments') || '[]')
      : []
    return { success: true, investments: localInvestments }
  }
}

// Bidding system functions
export const addBid = async (bidData) => {
  try {
    const user = getCurrentUser()
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}
    
    const bidWithMeta = {
      ...bidData,
      userId: userData.id || user?.uid || 'anonymous',
      userEmail: userData.email || user?.email || 'unknown',
      bidderName: bidData.bidderName || userData.name || 'Anonymous',
      createdAt: serverTimestamp(),
      status: 'active',
      bidType: bidData.bidType || 'manual', // manual, auto
    }

    // Save to Firestore
    let firestoreResult = null
    try {
      const docRef = await addDoc(collection(db, 'bids'), bidWithMeta)
      firestoreResult = { id: docRef.id, success: true }
      console.log('Bid saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save bid to Firestore, using localStorage only:', firestoreError)
    }
    
    // Always save to localStorage as backup
    const localBids = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('propertyBids') || '{}')
      : {}
    
    const bidId = firestoreResult?.id || `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const bidWithId = {
      ...bidWithMeta,
      id: bidId,
      createdAt: new Date().toISOString(),
      savedToFirestore: !!firestoreResult
    }
    
    // Organize bids by property ID
    if (!localBids[bidData.propertyId]) {
      localBids[bidData.propertyId] = []
    }
    localBids[bidData.propertyId].push(bidWithId)
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('propertyBids', JSON.stringify(localBids))
    }

    return { success: true, bid: bidWithId }
  } catch (error) {
    console.error('Add bid error:', error)
    return { success: false, error: error.message }
  }
}

export const getBidsForProperty = async (propertyId) => {
  try {
    // Fetch from Firestore
    const q = query(
      collection(db, 'bids'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const bids = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      bids.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, bids }
  } catch (error) {
    console.error('Get bids error:', error)
    // Fallback to localStorage
    const localBids = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('propertyBids') || '{}')
      : {}
    const propertyBids = localBids[propertyId] || []
    return { success: true, bids: propertyBids }
  }
}

// Bidding payment functions
export const recordBiddingPenalty = async (penaltyData) => {
  try {
    const user = getCurrentUser()
    const adminData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}

    const penaltyRecord = {
      ...penaltyData,
      penaltyAmount: Number(penaltyData.penaltyAmount) || 0,
      bidAmount: Number(penaltyData.bidAmount) || 0,
      propertyId: penaltyData.propertyId,
      propertyTitle: penaltyData.propertyTitle,
      bidderId: penaltyData.bidderId,
      bidderName: penaltyData.bidderName,
      bidderEmail: penaltyData.bidderEmail || '',
      reason: penaltyData.reason || 'payment_missed',
      status: penaltyData.status || 'deducted',
      penalizedBy: adminData.name || user?.displayName || 'System',
      penalizedById: adminData.id || user?.uid || 'system',
      createdAt: serverTimestamp(),
    }

    let firestoreResult = null
    try {
      const docRef = await addDoc(collection(db, 'biddingPenalties'), penaltyRecord)
      firestoreResult = { id: docRef.id, success: true }
      console.log('Bidding penalty recorded in Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save penalty to Firestore, storing locally:', firestoreError)
    }

    const penaltyId = firestoreResult?.id || `penalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const penaltyWithId = {
      ...penaltyRecord,
      id: penaltyId,
      createdAt: new Date().toISOString(),
      savedToFirestore: !!firestoreResult,
    }

    if (typeof window !== 'undefined') {
      const existingPenalties = JSON.parse(window.localStorage.getItem('biddingPenalties') || '[]')
      existingPenalties.push(penaltyWithId)
      window.localStorage.setItem('biddingPenalties', JSON.stringify(existingPenalties))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'biddingPenalties' }))
      } catch (err) {
        window.dispatchEvent(new Event('biddingPenaltiesUpdated'))
      }
    }

    return { success: true, penalty: penaltyWithId }
  } catch (error) {
    console.error('Record bidding penalty error:', error)
    return { success: false, error: error.message }
  }
}

export const addBiddingPayment = async (paymentData) => {
  try {
    const user = getCurrentUser()
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}
    
    const paymentWithMeta = {
      ...paymentData,
      userId: userData.id || user?.uid || 'anonymous',
      userEmail: userData.email || user?.email || 'unknown',
      createdAt: serverTimestamp(),
      status: 'pending', // pending, approved, rejected
      paidAt: serverTimestamp(),
    }

    // Save to Firestore
    let firestoreResult = null
    try {
      const docRef = await addDoc(collection(db, 'biddingPayments'), paymentWithMeta)
      firestoreResult = { id: docRef.id, success: true }
      console.log('Bidding payment saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save payment to Firestore, using localStorage only:', firestoreError)
    }
    
    // Always save to localStorage as backup
    const localPayments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
      : []
    
    const paymentId = firestoreResult?.id || `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const paymentWithId = {
      ...paymentWithMeta,
      id: paymentId,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      savedToFirestore: !!firestoreResult
    }
    
    localPayments.push(paymentWithId)
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('biddingFeePayments', JSON.stringify(localPayments))
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: 'biddingFeePayments' }))
      } catch (err) {
        window.dispatchEvent(new Event('biddingFeePaymentsUpdated'))
      }
    }

    return { success: true, payment: paymentWithId }
  } catch (error) {
    console.error('Add bidding payment error:', error)
    return { success: false, error: error.message }
  }
}

export const getUserBiddingPayments = async (userId = null) => {
  try {
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}

    const targetUserId = userId || userData.id

    if (!targetUserId) {
      return { success: true, payments: [] }
    }

    const q = query(
      collection(db, 'biddingPayments'),
      where('userId', '==', targetUserId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const payments = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        paidAt: data.paidAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, payments }
  } catch (error) {
    console.error('Get bidding payments error:', error)
    const localPayments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
      : []
    return { success: true, payments: localPayments }
  }
}

export const getAllBiddingPayments = async () => {
  try {
    const q = query(
      collection(db, 'biddingPayments'),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const payments = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      payments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        paidAt: data.paidAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })
    })

    return { success: true, payments }
  } catch (error) {
    console.error('Get all bidding payments error:', error)
    const localPayments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
      : []
    localPayments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    return { success: true, payments: localPayments, fallback: true }
  }
}

export const updateBiddingPaymentStatus = async (paymentId, status, options = {}) => {
  const normalizedStatus = (status || '').toLowerCase()
  const allowedStatuses = ['pending', 'approved', 'rejected']

  if (!allowedStatuses.includes(normalizedStatus)) {
    return { success: false, error: 'Invalid status: ' + status }
  }

  const adminNote = options.adminNote || ''
  const reviewer = options.reviewedBy || options.adminName || null
  const reviewerId = options.reviewedById || options.adminId || null

  const nowIso = new Date().toISOString()
  const localUpdates = {
    status: normalizedStatus,
    reviewedAt: nowIso,
    updatedAt: nowIso,
  }

  if (adminNote) {
    localUpdates.adminNote = adminNote
  }
  if (reviewer) {
    localUpdates.reviewedBy = reviewer
  }
  if (reviewerId) {
    localUpdates.reviewedById = reviewerId
  }
  if (normalizedStatus === 'approved') {
    localUpdates.approvedAt = nowIso
    localUpdates.rejectedAt = null
  } else if (normalizedStatus === 'rejected') {
    localUpdates.rejectedAt = nowIso
    localUpdates.approvedAt = null
  }

  let savedToFirestore = false
  try {
    const updates = {
      status: normalizedStatus,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    if (adminNote) {
      updates.adminNote = adminNote
    }
    if (reviewer) {
      updates.reviewedBy = reviewer
    }
    if (reviewerId) {
      updates.reviewedById = reviewerId
    }
    if (normalizedStatus === 'approved') {
      updates.approvedAt = serverTimestamp()
      updates.rejectedAt = null
    } else if (normalizedStatus === 'rejected') {
      updates.rejectedAt = serverTimestamp()
      updates.approvedAt = null
    }

    await updateDoc(doc(db, 'biddingPayments', paymentId), updates)
    savedToFirestore = true
  } catch (error) {
    console.warn('Failed to update bidding payment in Firestore:', error)
  }

  let localSuccess = false
  if (typeof window !== 'undefined') {
    try {
      const payments = JSON.parse(window.localStorage.getItem('biddingFeePayments') || '[]')
      const index = payments.findIndex((payment) => payment.id === paymentId)
      if (index !== -1) {
        payments[index] = {
          ...payments[index],
          ...localUpdates,
        }
        window.localStorage.setItem('biddingFeePayments', JSON.stringify(payments))
        localSuccess = true
        try {
          window.dispatchEvent(new StorageEvent('storage', { key: 'biddingFeePayments' }))
        } catch (err) {
          window.dispatchEvent(new Event('biddingFeePaymentsUpdated'))
        }
      }
    } catch (storageError) {
      console.warn('Failed to update local bidding payment cache:', storageError)
    }
  }

  if (!savedToFirestore && !localSuccess) {
    return { success: false, error: 'Failed to update bidding payment status' }
  }

  return { success: true, status: normalizedStatus, savedToFirestore, payment: { id: paymentId, ...localUpdates } }
}

// Notification functions
export const addNotification = async (notificationData) => {
  try {
    const notificationWithMeta = {
      ...notificationData,
      createdAt: serverTimestamp(),
      status: 'unread',
      type: notificationData.type || 'info', // info, success, warning, error
    }

    // Save to Firestore
    let firestoreResult = null
    try {
      const docRef = await addDoc(collection(db, 'notifications'), notificationWithMeta)
      firestoreResult = { id: docRef.id, success: true }
      console.log('Notification saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save notification to Firestore, using localStorage only:', firestoreError)
    }
    
    // Always save to localStorage as backup
    const localNotifications = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userNotifications') || '[]')
      : []
    
    const notificationId = firestoreResult?.id || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const notificationWithId = {
      ...notificationWithMeta,
      id: notificationId,
      createdAt: new Date().toISOString(),
      savedToFirestore: !!firestoreResult
    }
    
    localNotifications.unshift(notificationWithId) // Add to beginning
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userNotifications', JSON.stringify(localNotifications))
    }

    return { success: true, notification: notificationWithId }
  } catch (error) {
    console.error('Add notification error:', error)
    return { success: false, error: error.message }
  }
}

export const getUserNotifications = async (userId) => {
  try {
    // Fetch from Firestore
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const notifications = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      notifications.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, notifications }
  } catch (error) {
    console.error('Get notifications error:', error)
    // Fallback to localStorage
    const localNotifications = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userNotifications') || '[]')
      : []
    return { success: true, notifications: localNotifications }
  }
}

export const markNotificationAsRead = async (notificationId) => {
  try {
    // Update in Firestore
    await updateDoc(doc(db, 'notifications', notificationId), {
      status: 'read',
      readAt: serverTimestamp()
    })

    // Also update localStorage
    if (typeof window !== 'undefined') {
      const notifications = JSON.parse(window.localStorage.getItem('userNotifications') || '[]')
      const index = notifications.findIndex(n => n.id === notificationId)
      if (index >= 0) {
        notifications[index].status = 'read'
        notifications[index].readAt = new Date().toISOString()
        window.localStorage.setItem('userNotifications', JSON.stringify(notifications))
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return { success: false, error: error.message }
  }
}

// Admin settings functions
export const getAdminSettings = async () => {
  try {
    const docRef = doc(db, 'adminSettings', 'global')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { success: true, settings: docSnap.data() }
    } else {
      // Return default settings
      const defaultSettings = {
        platformFee: 2.5,
        minBidIncrement: 500000,
        maxBidLimit: 1000000000,
        biddingFeeAmount: 20000,
        autoApprovalEnabled: false,
        maintenanceMode: false,
        createdAt: new Date().toISOString()
      }
      return { success: true, settings: defaultSettings }
    }
  } catch (error) {
    console.error('Get admin settings error:', error)
    // Fallback to localStorage
    const localSettings = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('adminSettings') || '{}')
      : {}
    return { success: true, settings: localSettings }
  }
}

export const updateAdminSettings = async (settings) => {
  try {
    const settingsWithMeta = {
      ...settings,
      updatedAt: serverTimestamp(),
    }

    // Save to Firestore
    await setDoc(doc(db, 'adminSettings', 'global'), settingsWithMeta, { merge: true })
    
    // Also save to localStorage
    if (typeof window !== 'undefined') {
      const settingsForLocal = {
        ...settings,
        updatedAt: new Date().toISOString(),
      }
      window.localStorage.setItem('adminSettings', JSON.stringify(settingsForLocal))
    }

    return { success: true }
  } catch (error) {
    console.error('Update admin settings error:', error)
    return { success: false, error: error.message }
  }
}

// Test function to verify Firestore collections are working
export const testFirestoreCollections = async () => {
  const testResults = {
    users: false,
    properties: false,
    evaluations: false,
    investments: false,
    contactMessages: false,
    bids: false,
    biddingPayments: false,
    notifications: false,
    adminSettings: false
  }

  try {
    // Test each collection by trying to read from it
    const collections = [
      'users', 'properties', 'evaluations', 'investments', 
      'contactMessages', 'bids', 'biddingPayments', 'notifications'
    ]

    for (const collectionName of collections) {
      try {
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        testResults[collectionName] = true
        console.log(`âœ… ${collectionName} collection accessible (${querySnapshot.size} documents)`)
      } catch (error) {
        console.warn(`âš ï¸ ${collectionName} collection test failed:`, error.message)
        testResults[collectionName] = false
      }
    }

    // Test admin settings separately (single document)
    try {
      const docRef = doc(db, 'adminSettings', 'global')
      await getDoc(docRef)
      testResults.adminSettings = true
      console.log('âœ… adminSettings collection accessible')
    } catch (error) {
      console.warn('âš ï¸ adminSettings collection test failed:', error.message)
      testResults.adminSettings = false
    }

    const successCount = Object.values(testResults).filter(Boolean).length
    const totalCount = Object.keys(testResults).length
    
    console.log(`ðŸ”¥ Firestore Test Results: ${successCount}/${totalCount} collections accessible`)
    
    return {
      success: successCount > 0,
      results: testResults,
      summary: `${successCount}/${totalCount} collections working`
    }
  } catch (error) {
    console.error('Firestore test failed:', error)
    return {
      success: false,
      error: error.message,
      results: testResults
    }
  }
}

// Database initialization function to create all collections
export const initializeFirestoreCollections = async () => {
  const initResults = {
    success: true,
    collectionsCreated: [],
    errors: []
  }

  try {
    // 1. Create bids collection with sample bid
    try {
      const sampleBid = {
        propertyId: 'sample_property_001',
        bidderName: 'Sample Bidder',
        bidderEmail: 'sample@example.com',
        bidderPhone: '+92300000000',
        amount: 5000000,
        propertyTitle: 'Sample Property for Bidding',
        bidType: 'manual',
        status: 'active',
        createdAt: serverTimestamp()
      }
      await addDoc(collection(db, 'bids'), sampleBid)
      initResults.collectionsCreated.push('bids')
      console.log('âœ… Created bids collection')
    } catch (error) {
      initResults.errors.push(`bids: ${error.message}`)
      console.error('âŒ Failed to create bids collection:', error)
    }

    // 2. Create biddingPayments collection
    try {
      const samplePayment = {
        propertyId: 'sample_property_001',
        feeAmount: 20000,
        fullName: 'Sample Bidder',
        email: 'sample@example.com',
        phone: '+92300000000',
        cnic: '12345-1234567-1',
        paymentMethod: 'bank',
        senderAccount: '00123456789',
        transactionReference: 'TXN123456789',
        paymentNotes: 'Sample bidding fee payment',
        status: 'pending',
        createdAt: serverTimestamp(),
        paidAt: serverTimestamp()
      }
      await addDoc(collection(db, 'biddingPayments'), samplePayment)
      initResults.collectionsCreated.push('biddingPayments')
      console.log('âœ… Created biddingPayments collection')
    } catch (error) {
      initResults.errors.push(`biddingPayments: ${error.message}`)
      console.error('âŒ Failed to create biddingPayments collection:', error)
    }

    // 3. Create notifications collection
    try {
      const sampleNotification = {
        userId: 'sample_user_001',
        title: 'Welcome to REMMIC',
        message: 'Your account has been successfully created. Start exploring properties!',
        type: 'info',
        status: 'unread',
        createdAt: serverTimestamp()
      }
      await addDoc(collection(db, 'notifications'), sampleNotification)
      initResults.collectionsCreated.push('notifications')
      console.log('âœ… Created notifications collection')
    } catch (error) {
      initResults.errors.push(`notifications: ${error.message}`)
      console.error('âŒ Failed to create notifications collection:', error)
    }

    // 4. Create adminSettings document
    try {
      const defaultSettings = {
        platformFee: 2.5,
        minBidIncrement: 500000,
        maxBidLimit: 1000000000,
        biddingFeeAmount: 20000,
        autoApprovalEnabled: false,
        maintenanceMode: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      await setDoc(doc(db, 'adminSettings', 'global'), defaultSettings)
      initResults.collectionsCreated.push('adminSettings')
      console.log('âœ… Created adminSettings collection')
    } catch (error) {
      initResults.errors.push(`adminSettings: ${error.message}`)
      console.error('âŒ Failed to create adminSettings collection:', error)
    }

    // 5. Ensure existing collections have at least one document
    
    // Properties collection sample
    try {
      const propertiesQuery = query(collection(db, 'properties'))
      const propertiesSnapshot = await getDocs(propertiesQuery)
      
      if (propertiesSnapshot.empty) {
        const sampleProperty = {
          title: 'Sample Commercial Plot',
          location: 'DHA Phase 5, Lahore',
          area: '5 Marla',
          price: 15000000,
          description: 'Prime commercial plot in DHA Phase 5',
          propertyType: 'commercial_plot',
          status: 'approved',
          userId: 'sample_user_001',
          userEmail: 'sample@example.com',
          createdAt: serverTimestamp()
        }
        await addDoc(collection(db, 'properties'), sampleProperty)
        initResults.collectionsCreated.push('properties (sample)')
        console.log('✅ Added sample data to properties collection')
      }
    } catch (error) {
      initResults.errors.push(`properties: ${error.message}`)
      console.error('❌ Failed to ensure properties collection:', error)
    }

    // Evaluations collection sample
    try {
      const evaluationsQuery = query(collection(db, 'evaluations'))
      const evaluationsSnapshot = await getDocs(evaluationsQuery)
      
      if (evaluationsSnapshot.empty) {
        const sampleEvaluation = {
          propertyAddress: 'Sample Address, Lahore',
          propertyType: 'residential_plot',
          area: '10 Marla',
          currentValue: 25000000,
          status: 'pending',
          userId: 'sample_user_001',
          createdAt: serverTimestamp()
        }
        await addDoc(collection(db, 'evaluations'), sampleEvaluation)
        initResults.collectionsCreated.push('evaluations (sample)')
        console.log('✅ Added sample data to evaluations collection')
      }
    } catch (error) {
      initResults.errors.push(`evaluations: ${error.message}`)
      console.error('❌ Failed to ensure evaluations collection:', error)
    }

    // Investments collection sample
    try {
      const investmentsQuery = query(collection(db, 'investments'))
      const investmentsSnapshot = await getDocs(investmentsQuery)
      
      if (investmentsSnapshot.empty) {
        const sampleInvestment = {
          propertyId: 'sample_property_001',
          propertyTitle: 'Sample Investment Property',
          shares: 10,
          amount: 500000,
          sharePrice: 50000,
          paymentMethod: 'bank',
          status: 'completed',
          userId: 'sample_user_001',
          userEmail: 'sample@example.com',
          createdAt: serverTimestamp(),
          investmentDate: serverTimestamp()
        }
        await addDoc(collection(db, 'investments'), sampleInvestment)
        initResults.collectionsCreated.push('investments (sample)')
        console.log('âœ… Added sample data to investments collection')
      }
    } catch (error) {
      initResults.errors.push(`investments: ${error.message}`)
      console.error('âŒ Failed to ensure investments collection:', error)
    }

    // Contact Messages collection sample
    try {
      const messagesQuery = query(collection(db, 'contactMessages'))
      const messagesSnapshot = await getDocs(messagesQuery)
      
      if (messagesSnapshot.empty) {
        const sampleMessage = {
          name: 'Sample User',
          email: 'sample@example.com',
          phone: '+92300000000',
          subject: 'Welcome Message',
          message: 'This is a sample contact message to initialize the collection.',
          status: 'unread',
          priority: 'normal',
          createdAt: serverTimestamp()
        }
        await addDoc(collection(db, 'contactMessages'), sampleMessage)
        initResults.collectionsCreated.push('contactMessages (sample)')
        console.log('âœ… Added sample data to contactMessages collection')
      }
    } catch (error) {
      initResults.errors.push(`contactMessages: ${error.message}`)
      console.error('âŒ Failed to ensure contactMessages collection:', error)
    }

    if (initResults.errors.length > 0) {
      initResults.success = false
    }

    console.log(`ðŸ”¥ Database initialization completed: ${initResults.collectionsCreated.length} collections created/verified`)
    
    return initResults
  } catch (error) {
    console.error('Database initialization failed:', error)
    return {
      success: false,
      collectionsCreated: [],
      errors: [error.message]
    }
  }
}

// ============================================================================
// DEVELOPMENT MANAGEMENT MODEL FUNCTIONS
// ============================================================================

// Development Project Status Flow
export const DEVELOPMENT_PROJECT_STATUS = {
  UNDER_EVALUATION: 'under_evaluation',
  EVALUATED: 'evaluated',
  PROJECT_STRUCTURED: 'project_structured',
  FUNDING_OPEN: 'funding_open',
  FUNDED: 'funded',
  UNDER_DEVELOPMENT: 'under_development',
  COMPLETED: 'completed'
}

// Development Projects CRUD
export const addDevelopmentProject = async (projectData) => {
  try {
    let user = getCurrentUser()
    if (!user) {
      user = await ensureAuthUser()
    }

    const sanitizedData = sanitizeForFirestore(projectData)
    const projectWithMeta = {
      ...sanitizedData,
      userId: projectData.userId || user?.uid || 'anonymous',
      userEmail: projectData.userEmail || user?.email || 'unknown',
      projectStatus: projectData.projectStatus || DEVELOPMENT_PROJECT_STATUS.UNDER_EVALUATION,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'development_projects'), projectWithMeta)
      firestoreId = docRef.id
      console.log('Development project saved to Firestore successfully')
    } catch (firestoreError) {
      console.warn('Failed to save development project to Firestore:', firestoreError)
    }

    const projectId = firestoreId || `dev_project_${Date.now()}`
    const projectRecord = {
      ...sanitizedData,
      id: projectId,
      userId: projectWithMeta.userId,
      projectStatus: projectWithMeta.projectStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const projects = JSON.parse(window.localStorage.getItem('developmentProjects') || '[]')
      projects.push(projectRecord)
      window.localStorage.setItem('developmentProjects', JSON.stringify(projects))
      window.dispatchEvent(new Event('developmentProjectsUpdated'))
    }

    return { success: true, id: projectId, project: projectRecord, savedToFirestore: !!firestoreId }
  } catch (error) {
    console.error('Add development project error:', error)
    return { success: false, error: error.message }
  }
}

export const getDevelopmentProjects = async (filters = {}) => {
  try {
    let q = collection(db, 'development_projects')

    if (filters.propertyId) {
      q = query(q, where('propertyId', '==', filters.propertyId))
    }
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId))
    }
    if (filters.projectStatus) {
      q = query(q, where('projectStatus', '==', filters.projectStatus))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const projects = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      projects.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, projects }
  } catch (error) {
    console.error('Get development projects error:', error)
    const localProjects = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('developmentProjects') || '[]')
      : []
    return { success: true, projects: localProjects }
  }
}

export const getDevelopmentProject = async (projectId) => {
  try {
    const docSnap = await getDoc(doc(db, 'development_projects', projectId))
    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        success: true,
        project: {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const projects = JSON.parse(window.localStorage.getItem('developmentProjects') || '[]')
      const project = projects.find(p => p.id === projectId)
      if (project) {
        return { success: true, project }
      }
    }

    return { success: false, error: 'Project not found' }
  } catch (error) {
    console.error('Get development project error:', error)
    return { success: false, error: error.message }
  }
}

export const updateDevelopmentProjectStatus = async (projectId, status, updates = {}) => {
  const sanitizedUpdates = sanitizeForFirestore(updates)
  let firestoreSuccess = false

  try {
    await updateDoc(doc(db, 'development_projects', projectId), {
      projectStatus: status,
      ...sanitizedUpdates,
      updatedAt: serverTimestamp(),
    })
    firestoreSuccess = true
  } catch (error) {
    console.warn('Failed to update development project in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const projects = JSON.parse(window.localStorage.getItem('developmentProjects') || '[]')
    const index = projects.findIndex(p => p.id === projectId)
    if (index >= 0) {
      projects[index] = {
        ...projects[index],
        projectStatus: status,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      window.localStorage.setItem('developmentProjects', JSON.stringify(projects))
      window.dispatchEvent(new Event('developmentProjectsUpdated'))
    }
  }

  // Log the activity
  await logActivity('development_project', projectId, 'status_changed', { newStatus: status, ...updates })

  return { success: firestoreSuccess, status }
}

// Feasibility Reports CRUD
export const addFeasibilityReport = async (reportData) => {
  try {
    const sanitizedData = sanitizeForFirestore(reportData)
    const reportWithMeta = {
      ...sanitizedData,
      reportStatus: reportData.reportStatus || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'feasibility_reports'), reportWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save feasibility report to Firestore:', firestoreError)
    }

    const reportId = firestoreId || `feasibility_${Date.now()}`
    const reportRecord = {
      ...sanitizedData,
      id: reportId,
      reportStatus: reportWithMeta.reportStatus,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const reports = JSON.parse(window.localStorage.getItem('feasibilityReports') || '[]')
      reports.push(reportRecord)
      window.localStorage.setItem('feasibilityReports', JSON.stringify(reports))
    }

    return { success: true, id: reportId, report: reportRecord }
  } catch (error) {
    console.error('Add feasibility report error:', error)
    return { success: false, error: error.message }
  }
}

export const getFeasibilityReport = async (projectId) => {
  try {
    const q = query(
      collection(db, 'feasibility_reports'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      return {
        success: true,
        report: {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }
      }
    }

    return { success: true, report: null }
  } catch (error) {
    console.error('Get feasibility report error:', error)
    const localReports = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('feasibilityReports') || '[]')
      : []
    const report = localReports.find(r => r.projectId === projectId)
    return { success: true, report }
  }
}

export const updateFeasibilityReport = async (reportId, updates = {}) => {
  const sanitizedUpdates = sanitizeForFirestore(updates)

  try {
    await updateDoc(doc(db, 'feasibility_reports', reportId), {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.warn('Failed to update feasibility report in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const reports = JSON.parse(window.localStorage.getItem('feasibilityReports') || '[]')
    const index = reports.findIndex(r => r.id === reportId)
    if (index >= 0) {
      reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() }
      window.localStorage.setItem('feasibilityReports', JSON.stringify(reports))
    }
  }

  return { success: true }
}

// Project Drawings CRUD
export const addProjectDrawing = async (drawingData) => {
  try {
    const sanitizedData = sanitizeForFirestore(drawingData)
    const drawingWithMeta = {
      ...sanitizedData,
      approvalStatus: drawingData.approvalStatus || 'uploaded',
      version: drawingData.version || 1,
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'project_drawings'), drawingWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save project drawing to Firestore:', firestoreError)
    }

    const drawingId = firestoreId || `drawing_${Date.now()}`
    const drawingRecord = {
      ...sanitizedData,
      id: drawingId,
      approvalStatus: drawingWithMeta.approvalStatus,
      version: drawingWithMeta.version,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const drawings = JSON.parse(window.localStorage.getItem('projectDrawings') || '[]')
      drawings.push(drawingRecord)
      window.localStorage.setItem('projectDrawings', JSON.stringify(drawings))
    }

    return { success: true, id: drawingId, drawing: drawingRecord }
  } catch (error) {
    console.error('Add project drawing error:', error)
    return { success: false, error: error.message }
  }
}

export const getProjectDrawings = async (projectId) => {
  try {
    const q = query(
      collection(db, 'project_drawings'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const drawings = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      drawings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, drawings }
  } catch (error) {
    console.error('Get project drawings error:', error)
    const localDrawings = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('projectDrawings') || '[]').filter(d => d.projectId === projectId)
      : []
    return { success: true, drawings: localDrawings }
  }
}

export const deleteProjectDrawing = async (drawingId) => {
  try {
    await deleteDoc(doc(db, 'project_drawings', drawingId))
  } catch (error) {
    console.warn('Failed to delete drawing from Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const drawings = JSON.parse(window.localStorage.getItem('projectDrawings') || '[]')
    const filtered = drawings.filter(d => d.id !== drawingId)
    window.localStorage.setItem('projectDrawings', JSON.stringify(filtered))
  }

  return { success: true }
}

// Project Milestones CRUD
export const addProjectMilestone = async (milestoneData) => {
  try {
    const sanitizedData = sanitizeForFirestore(milestoneData)
    const milestoneWithMeta = {
      ...sanitizedData,
      status: milestoneData.status || 'pending',
      percentage: milestoneData.percentage || 0,
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'project_milestones'), milestoneWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save milestone to Firestore:', firestoreError)
    }

    const milestoneId = firestoreId || `milestone_${Date.now()}`
    const milestoneRecord = {
      ...sanitizedData,
      id: milestoneId,
      status: milestoneWithMeta.status,
      percentage: milestoneWithMeta.percentage,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const milestones = JSON.parse(window.localStorage.getItem('projectMilestones') || '[]')
      milestones.push(milestoneRecord)
      window.localStorage.setItem('projectMilestones', JSON.stringify(milestones))
    }

    return { success: true, id: milestoneId, milestone: milestoneRecord }
  } catch (error) {
    console.error('Add project milestone error:', error)
    return { success: false, error: error.message }
  }
}

export const getProjectMilestones = async (projectId) => {
  try {
    const q = query(
      collection(db, 'project_milestones'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'asc')
    )
    const querySnapshot = await getDocs(q)
    const milestones = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      milestones.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, milestones }
  } catch (error) {
    console.error('Get project milestones error:', error)
    const localMilestones = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('projectMilestones') || '[]').filter(m => m.projectId === projectId)
      : []
    return { success: true, milestones: localMilestones }
  }
}

export const updateMilestoneProgress = async (milestoneId, percentage, status = null) => {
  const updates = { percentage, updatedAt: serverTimestamp() }
  if (status) updates.status = status
  if (percentage >= 100) {
    updates.status = 'completed'
    updates.completionDate = serverTimestamp()
  }

  try {
    await updateDoc(doc(db, 'project_milestones', milestoneId), updates)
  } catch (error) {
    console.warn('Failed to update milestone in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const milestones = JSON.parse(window.localStorage.getItem('projectMilestones') || '[]')
    const index = milestones.findIndex(m => m.id === milestoneId)
    if (index >= 0) {
      milestones[index] = {
        ...milestones[index],
        percentage,
        status: updates.status || milestones[index].status,
        completionDate: percentage >= 100 ? new Date().toISOString() : milestones[index].completionDate,
        updatedAt: new Date().toISOString(),
      }
      window.localStorage.setItem('projectMilestones', JSON.stringify(milestones))
    }
  }

  return { success: true }
}

// Project Expenses CRUD
export const addProjectExpense = async (expenseData) => {
  try {
    const sanitizedData = sanitizeForFirestore(expenseData)
    const expenseWithMeta = {
      ...sanitizedData,
      status: expenseData.status || 'pending',
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'project_expenses'), expenseWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save expense to Firestore:', firestoreError)
    }

    const expenseId = firestoreId || `expense_${Date.now()}`
    const expenseRecord = {
      ...sanitizedData,
      id: expenseId,
      status: expenseWithMeta.status,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const expenses = JSON.parse(window.localStorage.getItem('projectExpenses') || '[]')
      expenses.push(expenseRecord)
      window.localStorage.setItem('projectExpenses', JSON.stringify(expenses))
    }

    return { success: true, id: expenseId, expense: expenseRecord }
  } catch (error) {
    console.error('Add project expense error:', error)
    return { success: false, error: error.message }
  }
}

export const getProjectExpenses = async (projectId) => {
  try {
    const q = query(
      collection(db, 'project_expenses'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const expenses = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      expenses.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, expenses }
  } catch (error) {
    console.error('Get project expenses error:', error)
    const localExpenses = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('projectExpenses') || '[]').filter(e => e.projectId === projectId)
      : []
    return { success: true, expenses: localExpenses }
  }
}

export const approveExpense = async (expenseId, approverData = {}) => {
  const updates = {
    status: 'approved',
    approvedAt: serverTimestamp(),
    approvedBy: approverData.name || 'Admin',
    approvedById: approverData.id || null,
  }

  try {
    await updateDoc(doc(db, 'project_expenses', expenseId), updates)
  } catch (error) {
    console.warn('Failed to approve expense in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const expenses = JSON.parse(window.localStorage.getItem('projectExpenses') || '[]')
    const index = expenses.findIndex(e => e.id === expenseId)
    if (index >= 0) {
      expenses[index] = {
        ...expenses[index],
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: approverData.name || 'Admin',
      }
      window.localStorage.setItem('projectExpenses', JSON.stringify(expenses))
    }
  }

  return { success: true }
}

// ============================================================================
// REAL ESTATE MANAGEMENT MODULE FUNCTIONS
// ============================================================================

// Management Types
export const MANAGEMENT_TYPE = {
  SELF_MANAGED: 'self_managed',
  REMMIC_MANAGED: 'remmic_managed'
}

// Property Management Status
export const PROPERTY_MANAGEMENT_STATUS = {
  VACANT: 'vacant',
  RENTED: 'rented',
  UNDER_MAINTENANCE: 'under_maintenance'
}

// Tenants CRUD
export const addTenant = async (tenantData) => {
  try {
    const sanitizedData = sanitizeForFirestore(tenantData)
    const tenantWithMeta = {
      ...sanitizedData,
      status: tenantData.status || 'active',
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'tenants'), tenantWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save tenant to Firestore:', firestoreError)
    }

    const tenantId = firestoreId || `tenant_${Date.now()}`
    const tenantRecord = {
      ...sanitizedData,
      id: tenantId,
      status: tenantWithMeta.status,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const tenants = JSON.parse(window.localStorage.getItem('tenants') || '[]')
      tenants.push(tenantRecord)
      window.localStorage.setItem('tenants', JSON.stringify(tenants))
    }

    // Log activity
    await logActivity('tenant', tenantId, 'created', { propertyId: tenantData.propertyId })

    return { success: true, id: tenantId, tenant: tenantRecord }
  } catch (error) {
    console.error('Add tenant error:', error)
    return { success: false, error: error.message }
  }
}

export const getTenants = async (propertyId) => {
  try {
    const q = query(
      collection(db, 'tenants'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const tenants = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tenants.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, tenants }
  } catch (error) {
    console.error('Get tenants error:', error)
    const localTenants = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('tenants') || '[]').filter(t => t.propertyId === propertyId)
      : []
    return { success: true, tenants: localTenants }
  }
}

export const updateTenant = async (tenantId, updates = {}) => {
  const sanitizedUpdates = sanitizeForFirestore(updates)

  try {
    await updateDoc(doc(db, 'tenants', tenantId), {
      ...sanitizedUpdates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.warn('Failed to update tenant in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const tenants = JSON.parse(window.localStorage.getItem('tenants') || '[]')
    const index = tenants.findIndex(t => t.id === tenantId)
    if (index >= 0) {
      tenants[index] = { ...tenants[index], ...updates, updatedAt: new Date().toISOString() }
      window.localStorage.setItem('tenants', JSON.stringify(tenants))
    }
  }

  await logActivity('tenant', tenantId, 'updated', updates)

  return { success: true }
}

export const deactivateTenant = async (tenantId) => {
  return updateTenant(tenantId, { status: 'inactive', deactivatedAt: new Date().toISOString() })
}

// Rent Records CRUD
export const RENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  DUE: 'due'
}

export const addRentRecord = async (rentData) => {
  try {
    const sanitizedData = sanitizeForFirestore(rentData)
    const rentWithMeta = {
      ...sanitizedData,
      paymentStatus: rentData.paymentStatus || RENT_STATUS.DUE,
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'rent_records'), rentWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save rent record to Firestore:', firestoreError)
    }

    const rentId = firestoreId || `rent_${Date.now()}`
    const rentRecord = {
      ...sanitizedData,
      id: rentId,
      paymentStatus: rentWithMeta.paymentStatus,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const records = JSON.parse(window.localStorage.getItem('rentRecords') || '[]')
      records.push(rentRecord)
      window.localStorage.setItem('rentRecords', JSON.stringify(records))
    }

    await logActivity('rent', rentId, 'created', { propertyId: rentData.propertyId, month: rentData.month })

    return { success: true, id: rentId, record: rentRecord }
  } catch (error) {
    console.error('Add rent record error:', error)
    return { success: false, error: error.message }
  }
}

export const getRentRecords = async (propertyId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'rent_records'),
      where('propertyId', '==', propertyId)
    )

    if (filters.tenantId) {
      q = query(q, where('tenantId', '==', filters.tenantId))
    }
    if (filters.paymentStatus) {
      q = query(q, where('paymentStatus', '==', filters.paymentStatus))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const records = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      records.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, records }
  } catch (error) {
    console.error('Get rent records error:', error)
    const localRecords = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('rentRecords') || '[]').filter(r => r.propertyId === propertyId)
      : []
    return { success: true, records: localRecords }
  }
}

export const updateRentPayment = async (rentId, paymentData) => {
  const updates = {
    amountReceived: paymentData.amountReceived,
    paymentDate: paymentData.paymentDate || new Date().toISOString(),
    paymentStatus: paymentData.paymentStatus || RENT_STATUS.PAID,
    paymentMethod: paymentData.paymentMethod,
    remarks: paymentData.remarks,
    updatedAt: serverTimestamp(),
  }

  try {
    await updateDoc(doc(db, 'rent_records', rentId), updates)
  } catch (error) {
    console.warn('Failed to update rent record in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const records = JSON.parse(window.localStorage.getItem('rentRecords') || '[]')
    const index = records.findIndex(r => r.id === rentId)
    if (index >= 0) {
      records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() }
      window.localStorage.setItem('rentRecords', JSON.stringify(records))
    }
  }

  await logActivity('rent', rentId, 'payment_updated', updates)

  return { success: true }
}

// Maintenance Requests CRUD
export const MAINTENANCE_STATUS = {
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

export const MAINTENANCE_URGENCY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

export const addMaintenanceRequest = async (requestData) => {
  try {
    const sanitizedData = sanitizeForFirestore(requestData)
    const requestWithMeta = {
      ...sanitizedData,
      status: requestData.status || MAINTENANCE_STATUS.SUBMITTED,
      urgency: requestData.urgency || MAINTENANCE_URGENCY.MEDIUM,
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'maintenance_requests'), requestWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save maintenance request to Firestore:', firestoreError)
    }

    const requestId = firestoreId || `maintenance_${Date.now()}`
    const requestRecord = {
      ...sanitizedData,
      id: requestId,
      status: requestWithMeta.status,
      urgency: requestWithMeta.urgency,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const requests = JSON.parse(window.localStorage.getItem('maintenanceRequests') || '[]')
      requests.push(requestRecord)
      window.localStorage.setItem('maintenanceRequests', JSON.stringify(requests))
    }

    await logActivity('maintenance', requestId, 'created', { propertyId: requestData.propertyId })

    return { success: true, id: requestId, request: requestRecord }
  } catch (error) {
    console.error('Add maintenance request error:', error)
    return { success: false, error: error.message }
  }
}

export const getMaintenanceRequests = async (propertyId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'maintenance_requests'),
      where('propertyId', '==', propertyId)
    )

    if (filters.status) {
      q = query(q, where('status', '==', filters.status))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const requests = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      requests.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, requests }
  } catch (error) {
    console.error('Get maintenance requests error:', error)
    const localRequests = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('maintenanceRequests') || '[]').filter(r => r.propertyId === propertyId)
      : []
    return { success: true, requests: localRequests }
  }
}

export const assignMaintenance = async (requestId, assignmentData) => {
  const updates = {
    status: MAINTENANCE_STATUS.ASSIGNED,
    assignedTo: assignmentData.assignedTo,
    assignedToName: assignmentData.assignedToName,
    estimatedCost: assignmentData.estimatedCost,
    assignedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  try {
    await updateDoc(doc(db, 'maintenance_requests', requestId), updates)
  } catch (error) {
    console.warn('Failed to assign maintenance in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const requests = JSON.parse(window.localStorage.getItem('maintenanceRequests') || '[]')
    const index = requests.findIndex(r => r.id === requestId)
    if (index >= 0) {
      requests[index] = { ...requests[index], ...updates, assignedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      window.localStorage.setItem('maintenanceRequests', JSON.stringify(requests))
    }
  }

  await logActivity('maintenance', requestId, 'assigned', updates)

  return { success: true }
}

export const completeMaintenance = async (requestId, completionData) => {
  const updates = {
    status: MAINTENANCE_STATUS.COMPLETED,
    finalCost: completionData.finalCost,
    completionNotes: completionData.notes,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  try {
    await updateDoc(doc(db, 'maintenance_requests', requestId), updates)
  } catch (error) {
    console.warn('Failed to complete maintenance in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const requests = JSON.parse(window.localStorage.getItem('maintenanceRequests') || '[]')
    const index = requests.findIndex(r => r.id === requestId)
    if (index >= 0) {
      requests[index] = { ...requests[index], ...updates, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      window.localStorage.setItem('maintenanceRequests', JSON.stringify(requests))
    }
  }

  await logActivity('maintenance', requestId, 'completed', updates)

  return { success: true }
}

// Documents Vault CRUD
export const DOCUMENT_TYPES = {
  OWNERSHIP: 'ownership',
  LEASE: 'lease',
  UTILITY: 'utility',
  TAX: 'tax',
  MANAGEMENT: 'management',
  OTHER: 'other'
}

export const addDocument = async (documentData) => {
  try {
    const sanitizedData = sanitizeForFirestore(documentData)
    const documentWithMeta = {
      ...sanitizedData,
      accessStatus: documentData.accessStatus || 'active',
      version: documentData.version || 1,
      createdAt: serverTimestamp(),
    }

    let firestoreId = null
    try {
      const docRef = await addDoc(collection(db, 'documents_vault'), documentWithMeta)
      firestoreId = docRef.id
    } catch (firestoreError) {
      console.warn('Failed to save document to Firestore:', firestoreError)
    }

    const documentId = firestoreId || `doc_${Date.now()}`
    const documentRecord = {
      ...sanitizedData,
      id: documentId,
      accessStatus: documentWithMeta.accessStatus,
      version: documentWithMeta.version,
      createdAt: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      const documents = JSON.parse(window.localStorage.getItem('documentsVault') || '[]')
      documents.push(documentRecord)
      window.localStorage.setItem('documentsVault', JSON.stringify(documents))
    }

    await logActivity('document', documentId, 'uploaded', { propertyId: documentData.propertyId, docType: documentData.docType })

    return { success: true, id: documentId, document: documentRecord }
  } catch (error) {
    console.error('Add document error:', error)
    return { success: false, error: error.message }
  }
}

export const getDocuments = async (propertyId, filters = {}) => {
  try {
    let q = query(
      collection(db, 'documents_vault'),
      where('propertyId', '==', propertyId)
    )

    if (filters.docType) {
      q = query(q, where('docType', '==', filters.docType))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const documents = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      documents.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, documents }
  } catch (error) {
    console.error('Get documents error:', error)
    const localDocuments = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('documentsVault') || '[]').filter(d => d.propertyId === propertyId)
      : []
    return { success: true, documents: localDocuments }
  }
}

export const deleteDocument = async (documentId) => {
  try {
    await deleteDoc(doc(db, 'documents_vault', documentId))
  } catch (error) {
    console.warn('Failed to delete document from Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const documents = JSON.parse(window.localStorage.getItem('documentsVault') || '[]')
    const filtered = documents.filter(d => d.id !== documentId)
    window.localStorage.setItem('documentsVault', JSON.stringify(filtered))
  }

  await logActivity('document', documentId, 'deleted', {})

  return { success: true }
}

// Activity Logs (Immutable)
export const logActivity = async (entityType, entityId, action, details = {}) => {
  try {
    const user = getCurrentUser()
    const userData = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('userData') || '{}')
      : {}

    const logEntry = {
      entityType,
      entityId,
      action,
      details: sanitizeForFirestore(details),
      changedBy: userData.id || user?.uid || 'system',
      changedByName: userData.name || user?.displayName || 'System',
      changedByEmail: userData.email || user?.email || '',
      timestamp: serverTimestamp(),
    }

    try {
      await addDoc(collection(db, 'activity_logs'), logEntry)
    } catch (firestoreError) {
      console.warn('Failed to save activity log to Firestore:', firestoreError)
    }

    // Also save to localStorage
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(window.localStorage.getItem('activityLogs') || '[]')
      logs.unshift({
        ...logEntry,
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
      })
      // Keep only last 500 logs in localStorage
      if (logs.length > 500) logs.pop()
      window.localStorage.setItem('activityLogs', JSON.stringify(logs))
    }

    return { success: true }
  } catch (error) {
    console.error('Log activity error:', error)
    return { success: false, error: error.message }
  }
}

export const getActivityLogs = async (entityType = null, entityId = null, limit = 50) => {
  try {
    let q = collection(db, 'activity_logs')

    if (entityType && entityId) {
      q = query(q, where('entityType', '==', entityType), where('entityId', '==', entityId))
    } else if (entityType) {
      q = query(q, where('entityType', '==', entityType))
    }

    q = query(q, orderBy('timestamp', 'desc'))

    const querySnapshot = await getDocs(q)
    const logs = []
    let count = 0

    querySnapshot.forEach((doc) => {
      if (count >= limit) return
      const data = doc.data()
      logs.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      })
      count++
    })

    return { success: true, logs }
  } catch (error) {
    console.error('Get activity logs error:', error)
    const localLogs = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('activityLogs') || '[]')
      : []

    let filtered = localLogs
    if (entityType && entityId) {
      filtered = localLogs.filter(l => l.entityType === entityType && l.entityId === entityId)
    } else if (entityType) {
      filtered = localLogs.filter(l => l.entityType === entityType)
    }

    return { success: true, logs: filtered.slice(0, limit) }
  }
}

// Property Management Helper Functions
export const getPropertyManagementData = async (propertyId) => {
  try {
    const [tenantsResult, rentResult, maintenanceResult, documentsResult, logsResult] = await Promise.all([
      getTenants(propertyId),
      getRentRecords(propertyId),
      getMaintenanceRequests(propertyId),
      getDocuments(propertyId),
      getActivityLogs('property', propertyId, 20)
    ])

    return {
      success: true,
      data: {
        tenants: tenantsResult.tenants || [],
        rentRecords: rentResult.records || [],
        maintenanceRequests: maintenanceResult.requests || [],
        documents: documentsResult.documents || [],
        activityLogs: logsResult.logs || []
      }
    }
  } catch (error) {
    console.error('Get property management data error:', error)
    return { success: false, error: error.message }
  }
}

// Financial Summary for Property
export const getPropertyFinancialSummary = async (propertyId, startDate = null, endDate = null) => {
  try {
    const rentResult = await getRentRecords(propertyId)
    const maintenanceResult = await getMaintenanceRequests(propertyId)

    let records = rentResult.records || []
    let requests = maintenanceResult.requests || []

    // Filter by date range if provided
    if (startDate) {
      records = records.filter(r => new Date(r.createdAt) >= new Date(startDate))
      requests = requests.filter(r => new Date(r.createdAt) >= new Date(startDate))
    }
    if (endDate) {
      records = records.filter(r => new Date(r.createdAt) <= new Date(endDate))
      requests = requests.filter(r => new Date(r.createdAt) <= new Date(endDate))
    }

    const totalRentDue = records.reduce((sum, r) => sum + (r.amountDue || 0), 0)
    const totalRentCollected = records.reduce((sum, r) => sum + (r.amountReceived || 0), 0)
    const totalMaintenanceCost = requests
      .filter(r => r.status === MAINTENANCE_STATUS.COMPLETED)
      .reduce((sum, r) => sum + (r.finalCost || 0), 0)

    const netAmount = totalRentCollected - totalMaintenanceCost

    return {
      success: true,
      summary: {
        totalRentDue,
        totalRentCollected,
        totalMaintenanceCost,
        managementFees: 0, // To be calculated based on REMMIC fee structure
        netAmount,
        period: { startDate, endDate },
        recordCount: records.length,
        maintenanceCount: requests.length
      }
    }
  } catch (error) {
    console.error('Get property financial summary error:', error)
    return { success: false, error: error.message }
  }
}

// Evaluation Internal Review (Admin Only)
export const updateEvaluationInternalReview = async (evaluationId, reviewData) => {
  const sanitizedReview = sanitizeForFirestore(reviewData)
  const updates = {
    internalReview: {
      ...sanitizedReview,
      reviewStatus: reviewData.reviewStatus || 'pending',
      assignedEvaluator: reviewData.assignedEvaluator,
      assignedEvaluatorId: reviewData.assignedEvaluatorId,
      redFlags: reviewData.redFlags || [],
      notes: reviewData.notes || '',
      nextStep: reviewData.nextStep, // detailed_evaluation, legal_review, site_visit
      reviewedAt: new Date().toISOString(),
    },
    updatedAt: serverTimestamp(),
  }

  try {
    await updateDoc(doc(db, 'evaluations', evaluationId), updates)
  } catch (error) {
    console.warn('Failed to update evaluation internal review in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const evaluations = JSON.parse(window.localStorage.getItem('evaluationProperties') || '[]')
    const index = evaluations.findIndex(e => e.id === evaluationId)
    if (index >= 0) {
      evaluations[index] = {
        ...evaluations[index],
        internalReview: updates.internalReview,
        updatedAt: new Date().toISOString(),
      }
      window.localStorage.setItem('evaluationProperties', JSON.stringify(evaluations))
    }
  }

  await logActivity('evaluation', evaluationId, 'internal_review_updated', reviewData)

  return { success: true }
}

// Get all evaluations for admin
export const getAllEvaluations = async (filters = {}) => {
  try {
    let q = collection(db, 'evaluations')

    if (filters.status) {
      q = query(q, where('status', '==', filters.status))
    }

    q = query(q, orderBy('createdAt', 'desc'))

    const querySnapshot = await getDocs(q)
    const evaluations = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      evaluations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    })

    return { success: true, evaluations }
  } catch (error) {
    console.error('Get all evaluations error:', error)
    const localEvaluations = typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('evaluationProperties') || '[]')
      : []
    return { success: true, evaluations: localEvaluations }
  }
}

// Property Manager Functions
export const assignPropertyManager = async (propertyId, managerData) => {
  const updates = {
    managementType: MANAGEMENT_TYPE.REMMIC_MANAGED,
    propertyManager: {
      id: managerData.id,
      name: managerData.name,
      email: managerData.email,
      phone: managerData.phone,
      assignedAt: new Date().toISOString(),
    },
    updatedAt: serverTimestamp(),
  }

  try {
    await updateDoc(doc(db, 'properties', propertyId), updates)
  } catch (error) {
    console.warn('Failed to assign property manager in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const properties = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
    const index = properties.findIndex(p => p.id === propertyId)
    if (index >= 0) {
      properties[index] = { ...properties[index], ...updates, updatedAt: new Date().toISOString() }
      window.localStorage.setItem('userProperties', JSON.stringify(properties))
    }
  }

  await logActivity('property', propertyId, 'manager_assigned', managerData)

  return { success: true }
}

export const removePropertyManager = async (propertyId) => {
  const updates = {
    managementType: MANAGEMENT_TYPE.SELF_MANAGED,
    propertyManager: null,
    updatedAt: serverTimestamp(),
  }

  try {
    await updateDoc(doc(db, 'properties', propertyId), updates)
  } catch (error) {
    console.warn('Failed to remove property manager in Firestore:', error)
  }

  if (typeof window !== 'undefined') {
    const properties = JSON.parse(window.localStorage.getItem('userProperties') || '[]')
    const index = properties.findIndex(p => p.id === propertyId)
    if (index >= 0) {
      properties[index] = { ...properties[index], ...updates, updatedAt: new Date().toISOString() }
      window.localStorage.setItem('userProperties', JSON.stringify(properties))
    }
  }

  await logActivity('property', propertyId, 'manager_removed', {})

  return { success: true }
}

export { app, auth, db, analytics }

