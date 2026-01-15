import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { useAdmin, AdminRoles } from '../contexts/AdminContext'
import { useFirebase } from '../contexts/FirebaseContext'

// Navigation items with icons
const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin-dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
      </svg>
    ),
  },
  {
    id: 'evaluations',
    label: 'Evaluations',
    href: '/admin-dashboard/evaluations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    ),
  },
  {
    id: 'listings',
    label: 'Listings',
    href: '/admin-dashboard/listings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
  },
  {
    id: 'auctions',
    label: 'Auctions',
    href: '/admin-dashboard/auctions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.66 8L12 2.35 6.34 8a8.02 8.02 0 000 11.31c1.56 1.56 3.61 2.34 5.66 2.34s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76a5.95 5.95 0 010-8.48L12 5.1l4.24 4.24a5.95 5.95 0 010 8.48A5.96 5.96 0 0112 19.59z"/>
      </svg>
    ),
  },
  {
    id: 'management',
    label: 'Management',
    href: '/admin-dashboard/management',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    ),
  },
  {
    id: 'development',
    label: 'Development',
    href: '/admin-dashboard/development',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
      </svg>
    ),
  },
  {
    id: 'admins',
    label: 'Admins',
    href: '/admin-dashboard/admins',
    superOnly: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Users',
    href: '/admin-dashboard/users',
    superOnly: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/admin-dashboard/reports',
    superOnly: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
      </svg>
    ),
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    href: '/admin-dashboard/audit-logs',
    superOnly: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H8l4-4 4 4h-2v4zm2-8H10V7h4v2z"/>
      </svg>
    ),
  },
]

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  const router = useRouter()
  const { logout } = useFirebase()
  const {
    adminUser,
    loading,
    notifications,
    unreadCount,
    sidebarCollapsed,
    toggleSidebar,
    hasAccess,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAdmin()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notifications-dropdown') && !e.target.closest('.notification-trigger')) {
        setShowNotifications(false)
      }
      if (!e.target.closest('.user-menu-dropdown') && !e.target.closest('.user-trigger')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !adminUser) {
      router.replace('/admin-dashboard/login')
    }
  }, [loading, adminUser, router])

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminUser')
    router.push('/admin-dashboard/login')
  }

  const getActiveModule = () => {
    const path = router.pathname
    if (path === '/admin-dashboard') return 'dashboard'
    const match = path.match(/\/admin-dashboard\/([^/]+)/)
    return match ? match[1] : 'dashboard'
  }

  const activeModule = getActiveModule()

  const formatTime = (time) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" />
        <style jsx>{`
          .admin-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #0a0a0a;
          }
          .admin-loading__spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(201, 162, 39, 0.2);
            border-top-color: #c9a227;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
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

  return (
    <>
      <Head>
        <title>{title} | REMMIC Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className={`admin-layout ${sidebarCollapsed ? 'admin-layout--collapsed' : ''}`}>
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileMenuOpen ? 'admin-sidebar--open' : ''}`}>
          <div className="sidebar-header">
            <Link href="/admin-dashboard" className="sidebar-brand">
              <div className="brand-logo">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="10" fill="url(#gold-gradient)" />
                  <path d="M12 28V16l8-6 8 6v12H12z" fill="#0a0a0a" />
                  <path d="M18 28v-6h4v6" stroke="#c9a227" strokeWidth="1.5" />
                  <defs>
                    <linearGradient id="gold-gradient" x1="0" y1="0" x2="40" y2="40">
                      <stop stopColor="#c9a227" />
                      <stop offset="1" stopColor="#d4b13d" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {!sidebarCollapsed && (
                <div className="brand-text">
                  <span className="brand-name">REMMIC</span>
                  <span className="brand-label">Admin Panel</span>
                </div>
              )}
            </Link>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => {
              // Skip items the user doesn't have access to
              if (item.superOnly && adminUser.adminRole !== AdminRoles.SUPER_ADMIN) {
                return null
              }
              if (!hasAccess(item.id)) {
                return null
              }

              const isActive = activeModule === item.id

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  data-tooltip={item.label}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          <div className="sidebar-footer">
            <button
              className="collapse-btn"
              onClick={toggleSidebar}
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                {sidebarCollapsed ? (
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                ) : (
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                )}
              </svg>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="admin-main">
          {/* Top Header */}
          <header className="admin-header">
            <div className="header-left">
              <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              </button>

              <div className="search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search properties, users, actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="header-right">
              {/* Role Badge */}
              <div className="role-badge">
                <span className="role-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </span>
                <span className="role-text">
                  {adminUser.adminRole === AdminRoles.SUPER_ADMIN ? 'Super Admin' : 'Sector Admin'}
                </span>
              </div>

              {/* Notifications */}
              <div className="header-action">
                <button
                  className="notification-trigger"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={markAllNotificationsRead}>Mark all read</button>
                      )}
                    </div>
                    <div className="notifications-list">
                      {notifications.length === 0 ? (
                        <div className="empty-notifications">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? '' : 'notification-item--unread'}`}
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            <div className="notification-icon">
                              {notification.type === 'evaluation' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                                </svg>
                              )}
                              {notification.type === 'listing' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                </svg>
                              )}
                              {notification.type === 'auction' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.66 8L12 2.35 6.34 8a8.02 8.02 0 000 11.31c1.56 1.56 3.61 2.34 5.66 2.34s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31z"/>
                                </svg>
                              )}
                            </div>
                            <div className="notification-content">
                              <p className="notification-title">{notification.title}</p>
                              <p className="notification-message">{notification.message}</p>
                              <span className="notification-time">{formatTime(notification.time)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <Link href="/admin-dashboard/notifications" className="view-all-link">
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="header-action">
                <button
                  className="user-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {adminUser.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="user-name">{adminUser.name || 'Admin'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        {adminUser.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <p className="user-name-large">{adminUser.name || 'Admin'}</p>
                        <p className="user-email">{adminUser.email}</p>
                      </div>
                    </div>
                    <div className="menu-divider" />
                    <Link href="/admin-dashboard/settings" className="menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/>
                      </svg>
                      Settings
                    </Link>
                    <Link href="/" className="menu-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                      View Site
                    </Link>
                    <div className="menu-divider" />
                    <button className="menu-item menu-item--danger" onClick={handleLogout}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>

      <style jsx>{`
        /* ========================================
           REMMIC Admin Layout - Premium Design
           ======================================== */

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #0a0a0a;
          font-family: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 90;
          backdrop-filter: blur(4px);
        }

        /* ====== SIDEBAR ====== */
        .admin-sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%);
          border-right: 1px solid rgba(201, 162, 39, 0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-layout--collapsed .admin-sidebar {
          width: 72px;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.1);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-logo {
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }

        .sidebar-brand:hover .brand-logo {
          transform: scale(1.05);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .brand-label {
          font-size: 0.7rem;
          color: #c9a227;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .admin-layout--collapsed .brand-text {
          display: none;
        }

        /* Sidebar Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          color: #9ca3af;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(201, 162, 39, 0.08);
          color: #c9a227;
        }

        .nav-item--active {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.08) 100%);
          color: #c9a227;
          border-left: 3px solid #c9a227;
          padding-left: 11px;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .admin-layout--collapsed .nav-label {
          display: none;
        }

        .admin-layout--collapsed .nav-item {
          justify-content: center;
          padding: 12px;
        }

        /* Tooltip for collapsed sidebar */
        .admin-layout--collapsed .nav-item::after {
          content: attr(data-tooltip);
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%) translateX(-8px);
          background: #1a1a1a;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s ease;
          border: 1px solid rgba(201, 162, 39, 0.2);
          z-index: 1000;
        }

        .admin-layout--collapsed .nav-item:hover::after {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid rgba(201, 162, 39, 0.1);
        }

        .collapse-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 8px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .collapse-btn:hover {
          background: rgba(201, 162, 39, 0.12);
          color: #c9a227;
        }

        /* ====== MAIN CONTENT ====== */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-layout--collapsed .admin-main {
          margin-left: 72px;
        }

        /* ====== HEADER ====== */
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(15, 15, 15, 0.95);
          border-bottom: 1px solid rgba(201, 162, 39, 0.1);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(10px);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .mobile-menu-btn {
          display: none;
          padding: 8px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          border-radius: 8px;
        }

        .mobile-menu-btn:hover {
          background: rgba(201, 162, 39, 0.1);
          color: #c9a227;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 10px;
          min-width: 300px;
          transition: all 0.2s ease;
        }

        .search-box:focus-within {
          border-color: rgba(201, 162, 39, 0.4);
          background: rgba(255, 255, 255, 0.05);
        }

        .search-box svg {
          color: #6b7280;
          flex-shrink: 0;
        }

        .search-box input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          font-size: 0.9rem;
          outline: none;
        }

        .search-box input::placeholder {
          color: #6b7280;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Role Badge */
        .role-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.06) 100%);
          border: 1px solid rgba(201, 162, 39, 0.25);
          border-radius: 8px;
        }

        .role-icon {
          color: #c9a227;
          display: flex;
        }

        .role-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: #c9a227;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Header Actions */
        .header-action {
          position: relative;
        }

        .notification-trigger,
        .user-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(201, 162, 39, 0.15);
          border-radius: 10px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notification-trigger:hover,
        .user-trigger:hover {
          background: rgba(201, 162, 39, 0.08);
          border-color: rgba(201, 162, 39, 0.3);
          color: #c9a227;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #dc2626;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
        }

        /* Notifications Dropdown */
        .notifications-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 360px;
          background: #141414;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          z-index: 100;
        }

        .notifications-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.1);
        }

        .notifications-header h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
        }

        .notifications-header button {
          background: none;
          border: none;
          color: #c9a227;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
        }

        .notifications-header button:hover {
          text-decoration: underline;
        }

        .notifications-list {
          max-height: 320px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .notification-item:hover {
          background: rgba(201, 162, 39, 0.05);
        }

        .notification-item--unread {
          background: rgba(201, 162, 39, 0.08);
        }

        .notification-icon {
          width: 36px;
          height: 36px;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          margin: 0 0 4px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #fff;
        }

        .notification-message {
          margin: 0;
          font-size: 0.8rem;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notification-time {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .empty-notifications {
          padding: 32px;
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .view-all-link {
          display: block;
          padding: 14px;
          text-align: center;
          background: rgba(201, 162, 39, 0.05);
          color: #c9a227;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .view-all-link:hover {
          background: rgba(201, 162, 39, 0.1);
        }

        /* User Menu Dropdown */
        .user-menu-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          background: #141414;
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          z-index: 100;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .user-avatar-large {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #c9a227, #d4b13d);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a0a0a;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .user-name-large {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
        }

        .user-email {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .menu-divider {
          height: 1px;
          background: rgba(201, 162, 39, 0.1);
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: #9ca3af;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
        }

        .menu-item:hover {
          background: rgba(201, 162, 39, 0.05);
          color: #c9a227;
        }

        .menu-item--danger:hover {
          background: rgba(220, 38, 38, 0.1);
          color: #ef4444;
        }

        /* ====== PAGE CONTENT ====== */
        .admin-content {
          flex: 1;
          padding: 24px;
          background: linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%);
        }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }

          .admin-sidebar--open {
            transform: translateX(0);
          }

          .admin-main {
            margin-left: 0;
          }

          .admin-layout--collapsed .admin-main {
            margin-left: 0;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .search-box {
            min-width: 200px;
          }

          .role-badge {
            display: none;
          }

          .user-name {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .admin-header {
            padding: 12px 16px;
          }

          .search-box {
            display: none;
          }

          .admin-content {
            padding: 16px;
          }

          .notifications-dropdown {
            width: calc(100vw - 32px);
            right: -80px;
          }

          .user-menu-dropdown {
            width: calc(100vw - 32px);
            right: -80px;
          }
        }
      `}</style>
    </>
  )
}
