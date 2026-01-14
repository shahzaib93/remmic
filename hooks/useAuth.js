import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from '../contexts/FirebaseContext'

/**
 * Authentication hook for protecting pages
 * @param {Object} options - Configuration options
 * @param {boolean} options.required - Whether authentication is required (default: true)
 * @param {string} options.redirectTo - Where to redirect if not authenticated (default: '/login')
 * @param {string[]} options.allowedRoles - Array of allowed roles (optional)
 */
export function useAuth(options = {}) {
  const {
    required = true,
    redirectTo = '/login',
    allowedRoles = null
  } = options

  const { user: firebaseUser } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for user data
        const userData = localStorage.getItem('userData')

        if (userData) {
          const parsedUser = JSON.parse(userData)

          // Check role restrictions if specified
          if (allowedRoles && !allowedRoles.includes(parsedUser.role)) {
            router.push('/401') // Unauthorized
            return
          }

          setUser(parsedUser)
          setIsAuthenticated(true)
        } else if (required) {
          // Store intended destination for redirect after login
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('redirectAfterLogin', router.asPath)
          }
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (required) {
          router.push(redirectTo)
          return
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [router, required, redirectTo, allowedRoles])

  // Sync with Firebase user if available
  useEffect(() => {
    if (firebaseUser && !user) {
      setUser(firebaseUser)
      setIsAuthenticated(true)
    }
  }, [firebaseUser])

  return {
    user,
    loading,
    isAuthenticated
  }
}

/**
 * Hook to check if user is logged in (non-blocking)
 * Returns user data without redirecting
 */
export function useOptionalAuth() {
  const { user: firebaseUser } = useFirebase()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (firebaseUser) {
      setUser(firebaseUser)
    }
  }, [firebaseUser])

  return {
    user,
    loading,
    isAuthenticated: !!user
  }
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth(WrappedComponent, options = {}) {
  return function ProtectedPage(props) {
    const { user, loading, isAuthenticated } = useAuth(options)

    if (loading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#ffffff',
          gap: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(201, 162, 39, 0.2)',
            borderTopColor: '#c9a227',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} user={user} />
  }
}

export default useAuth
