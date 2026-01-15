import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from './FirebaseContext'

// Admin roles enum
export const AdminRoles = {
  SUPER_ADMIN: 'super_admin',
  SECTOR_ADMIN: 'sector_admin',
}

// Module access permissions
const modulePermissions = {
  [AdminRoles.SUPER_ADMIN]: [
    'dashboard',
    'evaluations',
    'listings',
    'auctions',
    'management',
    'development',
    'admins',
    'users',
    'reports',
    'audit-logs',
    'settings',
  ],
  [AdminRoles.SECTOR_ADMIN]: [
    'dashboard',
    'evaluations',
    'listings',
    'auctions',
    'management',
    'development',
    'settings',
  ],
}

// Create Admin Context
const AdminContext = createContext()

// Hook to use Admin context
export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

// Admin Provider Component
export const AdminProvider = ({ children }) => {
  const router = useRouter()
  const { user, loading: authLoading } = useFirebase()
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load admin data
  useEffect(() => {
    const loadAdminData = () => {
      if (authLoading) return

      // Check if user is admin
      if (user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'sector_admin')) {
        const adminRole = user.role === 'admin' ? AdminRoles.SUPER_ADMIN :
                         user.role === 'super_admin' ? AdminRoles.SUPER_ADMIN :
                         AdminRoles.SECTOR_ADMIN

        setAdminUser({
          ...user,
          adminRole,
          permissions: modulePermissions[adminRole],
        })
      } else {
        // Check localStorage for admin session
        try {
          const storedAdmin = localStorage.getItem('adminUser')
          const isAdmin = localStorage.getItem('isAdmin')

          if (storedAdmin && isAdmin) {
            const parsedAdmin = JSON.parse(storedAdmin)
            const adminRole = parsedAdmin.role === 'admin' ? AdminRoles.SUPER_ADMIN :
                             parsedAdmin.adminRole || AdminRoles.SUPER_ADMIN

            setAdminUser({
              ...parsedAdmin,
              adminRole,
              permissions: modulePermissions[adminRole],
            })
          } else {
            setAdminUser(null)
          }
        } catch (error) {
          console.error('Failed to load admin data:', error)
          setAdminUser(null)
        }
      }

      setLoading(false)
    }

    loadAdminData()
  }, [user, authLoading])

  // Load notifications
  useEffect(() => {
    if (!adminUser) return

    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem('adminNotifications')
        if (stored) {
          setNotifications(JSON.parse(stored))
        } else {
          // Generate sample notifications
          const sampleNotifications = [
            {
              id: 1,
              type: 'evaluation',
              title: 'New Evaluation Request',
              message: 'Property in DHA Phase 5 submitted for evaluation',
              time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              read: false,
            },
            {
              id: 2,
              type: 'listing',
              title: 'Listing Pending Approval',
              message: 'Commercial property listing awaits review',
              time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
              read: false,
            },
            {
              id: 3,
              type: 'auction',
              title: 'Auction Ending Soon',
              message: 'Agricultural land auction ends in 2 hours',
              time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
              read: true,
            },
          ]
          setNotifications(sampleNotifications)
          localStorage.setItem('adminNotifications', JSON.stringify(sampleNotifications))
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    loadNotifications()
  }, [adminUser])

  // Check if user has access to a module
  const hasAccess = (module) => {
    if (!adminUser) return false
    return adminUser.permissions?.includes(module) || false
  }

  // Check if current route is accessible
  const canAccessRoute = (route) => {
    if (!adminUser) return false

    // Extract module from route
    const module = route.replace('/admin-dashboard/', '').split('/')[0] || 'dashboard'
    return hasAccess(module)
  }

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      time: new Date().toISOString(),
      read: false,
    }

    const updated = [newNotification, ...notifications].slice(0, 50)
    setNotifications(updated)
    localStorage.setItem('adminNotifications', JSON.stringify(updated))
  }

  // Mark notification as read
  const markNotificationRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem('adminNotifications', JSON.stringify(updated))
  }

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem('adminNotifications', JSON.stringify(updated))
  }

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([])
    localStorage.removeItem('adminNotifications')
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev)
  }

  // Log audit action
  const logAuditAction = (action) => {
    try {
      const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: adminUser?.name || adminUser?.email || 'Unknown',
        actorRole: adminUser?.adminRole || 'admin',
        ...action,
      }
      logs.unshift(newLog)
      localStorage.setItem('auditLogs', JSON.stringify(logs.slice(0, 500)))
      return { success: true, log: newLog }
    } catch (error) {
      console.error('Failed to log audit action:', error)
      return { success: false, error: error.message }
    }
  }

  // Get audit logs
  const getAuditLogs = (filters = {}) => {
    try {
      let logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')

      if (filters.module) {
        logs = logs.filter(log => log.module === filters.module)
      }
      if (filters.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate))
      }
      if (filters.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate))
      }

      return { success: true, logs }
    } catch (error) {
      return { success: false, error: error.message, logs: [] }
    }
  }

  const value = {
    adminUser,
    loading,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    sidebarCollapsed,

    // Access control
    hasAccess,
    canAccessRoute,
    isSuper: adminUser?.adminRole === AdminRoles.SUPER_ADMIN,
    isSectorAdmin: adminUser?.adminRole === AdminRoles.SECTOR_ADMIN,

    // Notifications
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,

    // UI state
    toggleSidebar,

    // Audit
    logAuditAction,
    getAuditLogs,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

// HOC for protected admin routes
export const withAdminAuth = (WrappedComponent, requiredModule = null) => {
  const WithAdminAuthComponent = (props) => {
    const router = useRouter()
    const { adminUser, loading, hasAccess } = useAdmin()

    useEffect(() => {
      if (!loading && !adminUser) {
        router.replace('/admin-dashboard/login')
      } else if (!loading && requiredModule && !hasAccess(requiredModule)) {
        router.replace('/admin-dashboard?error=unauthorized')
      }
    }, [loading, adminUser, router])

    if (loading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0a0a0a',
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(201, 162, 39, 0.2)',
            borderTopColor: '#c9a227',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )
    }

    if (!adminUser) {
      return null
    }

    if (requiredModule && !hasAccess(requiredModule)) {
      return null
    }

    return <WrappedComponent {...props} />
  }

  WithAdminAuthComponent.displayName = `WithAdminAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return WithAdminAuthComponent
}

export default AdminContext
