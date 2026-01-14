import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFirebase } from '../../contexts/FirebaseContext'
import { useAdminAccess } from '../../hooks/useAdminAccess'
import styles from '../../styles/adminLayout.module.css'

const navItems = [
  {
    label: 'Overview',
    href: '/admin-dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/admin-dashboard/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/admin-dashboard/analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    href: '/admin-dashboard/calendar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Properties',
    href: '/admin-dashboard/properties',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.75V20a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V9.75a1 1 0 0 0-.37-.78l-8-6.4a1 1 0 0 0-1.26 0l-8 6.4A1 1 0 0 0 3 9.75Z" />
      </svg>
    ),
  },
  {
    label: 'Listings',
    href: '/admin-dashboard/listings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Bidding Fees',
    href: '/admin-dashboard/bidding-fees',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M8 10h8" />
        <path d="M8 14h4" />
        <circle cx="16.5" cy="14" r="1" />
      </svg>
    ),
  },
  {
    label: 'Evaluations',
    href: '/admin-dashboard/evaluations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h6" />
        <path d="M7 16h8" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/admin-dashboard/settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15A1.65 1.65 0 0 0 21 13.35v-2.7A1.65 1.65 0 0 0 19.4 9l-1.26-.2a1.65 1.65 0 0 1-1.14-.8l-.6-1.1A1.65 1.65 0 0 0 14.9 6h-2.8a1.65 1.65 0 0 0-1.5.9l-.6 1.1a1.65 1.65 0 0 1-1.14.8L7.6 9A1.65 1.65 0 0 0 6 10.65v2.7A1.65 1.65 0 0 0 7.6 15l1.26.2a1.65 1.65 0 0 1 1.14.8l.6 1.1a1.65 1.65 0 0 0 1.5.9h2.8a1.65 1.65 0 0 0 1.5-.9l.6-1.1a1.65 1.65 0 0 1 1.14-.8Z" />
      </svg>
    ),
  },
  {
    label: 'Help',
    href: '/admin-dashboard/help',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

export default function AdminLayout({ children, title = 'Admin Workspace', description, metaTitle, onRefresh }) {
  const router = useRouter()
  const { logout } = useFirebase()
  const { adminUser, checking } = useAdminAccess()

  const activePath = router.pathname.replace(/\/index$/, '') || '/'

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('isAdmin')
        window.localStorage.removeItem('adminUser')
      }
      router.replace('/admin')
    }
  }

  const initials = (adminUser?.name || adminUser?.fullName || 'Admin')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)

  if (checking) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.dashboardWrapper}>
          <div className={styles.main}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
              <span style={{ color: '#6b7280' }}>Validating admin session…</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{metaTitle || `${title} · REMMIC Admin`}</title>
      </Head>

      <div className={styles.dashboard}>
        <div className={styles.dashboardWrapper}>
          <aside className={styles.sidebar}>
            <nav className={styles.nav} aria-label="Admin navigation">
              {navItems.map((item) => {
                const isActive = activePath === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    data-tooltip={item.label}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className={styles.sidebarFooter}>
              <button
                type="button"
                className={styles.logoutButton}
                aria-label="Refresh data"
                onClick={onRefresh}
                disabled={!onRefresh}
                style={!onRefresh ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
              <button className={styles.logoutButton} type="button" onClick={handleLogout} aria-label="Logout">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
              <button
                className={styles.logoutButton}
                type="button"
                onClick={() => router.push('/admin-dashboard/settings')}
                aria-label="Open profile"
              >
                <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', fontWeight: 600, color: '#374151' }}>
                  {initials.charAt(0) || 'A'}
                </span>
              </button>
            </div>
          </aside>

          <main className={styles.main}>
            <header className={styles.topBar}>
              <div className={styles.greeting}>
                <div className={styles.greetingIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l2-2 4 4 8-8 4 4" />
                  </svg>
                </div>
                <div>
                  <h1>
                    Welcome back, {adminUser?.name || adminUser?.fullName || 'Admin'}
                  </h1>
                  {description ? <p>{description}</p> : null}
                </div>
              </div>

              <div className={styles.topBarActions}>
                <div className={styles.searchField}>
                  <input type="search" placeholder="Search Anything…" aria-label="Search admin workspace" />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className={styles.actionButtons}>
                  <button type="button" className={styles.iconButton} aria-label="Open notifications">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </button>
                  <button type="button" className={styles.iconButton} aria-label="Messages">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2H2v20l4-4h16z" />
                    </svg>
                  </button>
                  <button type="button" className={styles.iconButton} onClick={onRefresh} disabled={!onRefresh} aria-label="Refresh data">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>
    </>
  )
}
