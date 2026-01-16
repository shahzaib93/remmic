import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFirebase } from '../../contexts/FirebaseContext'
import { useAdminAccess } from '../../hooks/useAdminAccess'

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
      <div className="relative min-h-screen flex justify-center items-start bg-gradient-to-br from-[#faf9f7] to-[#f5f3ef] p-8 gap-3">
        <div className="flex gap-3 max-w-[1400px] w-full mx-auto">
          <main className="flex flex-col gap-10 flex-1 w-full">
            <div className="flex justify-center items-center min-h-[60vh]">
              <span className="text-gray-500">Validating admin session…</span>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{metaTitle || `${title} · REMMIC Admin`}</title>
      </Head>

      <div className="relative min-h-screen flex justify-center items-start bg-gradient-to-br from-[#faf9f7] to-[#f5f3ef] p-8 gap-3">
        <div className="flex gap-3 max-w-[1400px] w-full mx-auto flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] rounded-3xl py-6 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col items-center w-[72px] self-start sticky top-8 shrink-0 border border-[rgba(201,162,39,0.15)] lg:flex lg:flex-col max-lg:fixed max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:bottom-4 max-lg:top-auto max-lg:w-auto max-lg:flex-row max-lg:z-50 max-lg:p-3 max-lg:rounded-2xl">
            <nav className="flex flex-col gap-2 px-4 w-full flex-1 max-lg:grid max-lg:grid-cols-5 max-lg:gap-2" aria-label="Admin navigation">
              {navItems.map((item) => {
                const isActive = activePath === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-center w-10 h-10 rounded-xl no-underline transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-visible bg-transparent border-none max-lg:w-12 max-lg:h-12 ${
                      isActive
                        ? 'text-[#0a0a0a] !bg-gradient-to-br from-[#c9a227] to-[#d4b13d] shadow-[0_4px_16px_rgba(201,162,39,0.35)] w-12 h-12 rounded-xl'
                        : 'text-[#757575] hover:text-[#c9a227] hover:bg-[rgba(201,162,39,0.1)]'
                    }`}
                    data-tooltip={item.label}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`flex items-center justify-center w-5 h-5 shrink-0 transition-all duration-300 relative z-[1] ${isActive ? 'scale-[1.15]' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    {/* Tooltip */}
                    <span className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 -translate-x-2 bg-gradient-to-br from-[#c9a227] to-[#d4b13d] text-[#0a0a0a] py-2 px-3 rounded-[0.65rem] text-sm font-semibold whitespace-nowrap opacity-0 pointer-events-none transition-all duration-300 shadow-[0_8px_24px_rgba(201,162,39,0.25)] z-[1000] group-hover:opacity-100 group-hover:translate-x-0 max-lg:left-1/2 max-lg:top-auto max-lg:bottom-[calc(100%+12px)] max-lg:-translate-x-1/2 max-lg:translate-y-2 max-lg:group-hover:-translate-x-1/2 max-lg:group-hover:translate-y-0">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="flex flex-col items-center gap-4 p-4 mt-auto border-t border-[rgba(201,162,39,0.15)] w-full max-lg:hidden">
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-xl border-none bg-transparent text-[#757575] cursor-pointer transition-all duration-300 no-underline hover:text-[#c9a227] hover:bg-[rgba(201,162,39,0.1)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Refresh data"
                onClick={onRefresh}
                disabled={!onRefresh}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-xl border-none bg-transparent text-[#757575] cursor-pointer transition-all duration-300 no-underline hover:text-[#c62828] hover:bg-[rgba(198,40,40,0.1)]"
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-xl border-none bg-transparent text-[#757575] cursor-pointer transition-all duration-300 no-underline hover:bg-[rgba(201,162,39,0.1)]"
                type="button"
                onClick={() => router.push('/admin-dashboard/settings')}
                aria-label="Open profile"
              >
                <span className="grid place-items-center w-full h-full font-semibold text-gray-700">
                  {initials.charAt(0) || 'A'}
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex flex-col gap-10 flex-1 w-full max-lg:p-4">
            {/* Top Bar */}
            <header className="flex justify-between items-center gap-8 max-lg:flex-col max-lg:items-start max-lg:gap-6">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-[14px] grid place-items-center bg-gradient-to-br from-[rgba(201,162,39,0.15)] to-[rgba(201,162,39,0.08)] border border-[rgba(201,162,39,0.2)] text-[#c9a227] shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF5E01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12l2-2 4 4 8-8 4 4" />
                  </svg>
                </div>
                <div>
                  <h1 className="m-0 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold text-[#0a0a0a]">
                    Welcome back, {adminUser?.name || adminUser?.fullName || 'Admin'}
                  </h1>
                  {description ? <p className="mt-1 mb-0 text-[#757575] text-[0.95rem]">{description}</p> : null}
                </div>
              </div>

              <div className="flex items-center gap-4 max-lg:w-full">
                <div className="relative bg-white py-3 px-6 rounded-xl border border-[rgba(201,162,39,0.2)] transition-all duration-300 focus-within:border-[#c9a227] focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.1)]">
                  <input
                    type="search"
                    placeholder="Search Anything…"
                    aria-label="Search admin workspace"
                    className="border-none outline-none bg-transparent min-w-[250px] text-[0.95rem] text-[#0a0a0a] placeholder:text-[#9e9e9e]"
                  />
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#c9a227]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="w-11 h-11 rounded-xl border border-[rgba(201,162,39,0.2)] bg-white text-[#4a3728] grid place-items-center cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-[rgba(201,162,39,0.1)] hover:to-[rgba(201,162,39,0.05)] hover:border-[#c9a227] hover:text-[#c9a227]"
                    aria-label="Open notifications"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="w-11 h-11 rounded-xl border border-[rgba(201,162,39,0.2)] bg-white text-[#4a3728] grid place-items-center cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-[rgba(201,162,39,0.1)] hover:to-[rgba(201,162,39,0.05)] hover:border-[#c9a227] hover:text-[#c9a227]"
                    aria-label="Messages"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2H2v20l4-4h16z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="w-11 h-11 rounded-xl border border-[rgba(201,162,39,0.2)] bg-white text-[#4a3728] grid place-items-center cursor-pointer transition-all duration-300 hover:bg-gradient-to-br hover:from-[rgba(201,162,39,0.1)] hover:to-[rgba(201,162,39,0.05)] hover:border-[#c9a227] hover:text-[#c9a227] disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={onRefresh}
                    disabled={!onRefresh}
                    aria-label="Refresh data"
                  >
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
