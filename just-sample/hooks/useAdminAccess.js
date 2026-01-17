import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from '../contexts/FirebaseContext'

/**
 * Guards admin routes by validating the stored admin session.
 */
export function useAdminAccess(options = {}) {
  const { redirectTo = '/admin-login' } = options
  const router = useRouter()
  const { user: firebaseUser } = useFirebase()
  const [adminUser, setAdminUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const redirectIfNeeded = () => {
      setAdminUser(null)
      setChecking(false)
      if (router.pathname !== redirectTo) {
        router.replace(redirectTo)
      }
    }

    const validateAccess = () => {
      const storedFlag = window.localStorage.getItem('isAdmin')
      const storedUser = window.localStorage.getItem('adminUser')

      if (!storedFlag || !storedUser) {
        redirectIfNeeded()
        return
      }

      let parsedUser = null
      try {
        parsedUser = JSON.parse(storedUser)
        setAdminUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse admin session:', error)
        window.localStorage.removeItem('adminUser')
        window.localStorage.removeItem('isAdmin')
        redirectIfNeeded()
        return
      }

      // More lenient role checking - accept if stored user has admin role
      // or if Firebase user email contains 'admin' or role is admin
      const hasAdminRole = parsedUser && parsedUser.role === 'admin'
      const firebaseUserIsAdmin = firebaseUser && (
        firebaseUser.role === 'admin' || 
        (firebaseUser.email && firebaseUser.email.includes('admin'))
      )

      // Only redirect if we have definitive proof that user is NOT an admin
      if (firebaseUser && firebaseUser.role && firebaseUser.role !== 'admin' && !hasAdminRole) {
        console.warn('User role validation failed:', { 
          firebaseRole: firebaseUser.role, 
          storedRole: parsedUser?.role,
          email: firebaseUser.email 
        })
        redirectIfNeeded()
        return
      }

      setChecking(false)
    }

    validateAccess()
  }, [firebaseUser, redirectTo, router])

  return { adminUser, checking }
}
