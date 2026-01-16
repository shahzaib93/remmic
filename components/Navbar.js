import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useFirebase } from '../contexts/FirebaseContext'
import { getLogoUrl } from '../lib/assets'

export default function Navbar() {
  const { user, logout } = useFirebase()
  const router = useRouter()
  const [navUser, setNavUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  useEffect(() => {
    if (user) {
      setNavUser(user)
    } else {
      setNavUser(null)
    }
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setNavUser(null)
    window.location.href = '/'
  }

  // Navigation items based on user's structure
  const navItems = [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/investment-models', label: 'Invest' },
    { href: '/services', label: 'Services' },
    { href: '/trust-security', label: 'Trust' },
    { href: '/about', label: 'About' },
  ]


  return (
    <>
      <div
        data-animation="default"
        data-collapse="medium"
        data-duration="400"
        data-easing="ease"
        data-easing2="ease"
        role="banner"
        className={`navbar w-nav ${scrolled ? 'navbar-scrolled' : ''}`}
      >
        <div className="nav-container">
          <a
            href={navUser ? '/dashboard' : '/'}
            className="nav-logo-wrapper w-nav-brand"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src={getLogoUrl({ format: 'svg', size: 'medium', optimized: false })}
              loading="lazy"
              alt="REMMIC Logo"
              className="nav-logo"
              style={{ height: '50px', width: 'auto' }}
              onError={(e) => {
                e.target.src = '/REMMIC LOGO SVG.svg';
              }}
            />
          </a>

          {/* Desktop Menu */}
          <nav role="navigation" className="nav-menu w-nav-menu desktop-menu">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className={`nav-link w-nav-link ${router.pathname === item.href ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </span>
          </button>

          <div className="nav-button-wrapper hide-tablet">
            {navUser ? (
              <div className="user-profile-wrapper">
                <a href="/profile" className="user-profile-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="user-name">{navUser.name || navUser.email}</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                  title="Logout"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                </button>
              </div>
            ) : (
              <a href="/login" className="modern-button gold-cta">
                <span>Get Started</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay and Content */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      <nav className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <img
            src={getLogoUrl({ format: 'svg', size: 'small', optimized: false })}
            alt="REMMIC Logo"
            className="mobile-logo"
            onError={(e) => {
              e.target.src = '/REMMIC LOGO SVG.svg';
            }}
          />
          <button
            className="mobile-close-button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="mobile-menu-links">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className={`mobile-nav-link ${router.pathname === item.href ? 'mobile-nav-link-active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>{item.label}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </a>
          ))}
        </div>

        <div className="mobile-menu-footer">
          {navUser ? (
            <div className="mobile-user-info">
              <div className="mobile-user-profile">
                <div className="mobile-user-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <span className="mobile-user-name">{navUser.name || navUser.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="mobile-logout-button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <a href="/login" className="mobile-cta-button">
              <span>Get Started</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
          )}
        </div>
      </nav>

      <style jsx>{`
        /* ===== REMMIC Premium Navbar ===== */

        /* Color Variables */
        :global(:root) {
          --nav-gold: #c9a227;
          --nav-gold-light: #d4b13d;
          --nav-gold-dark: #a8861f;
          --nav-black: #0a0a0a;
          --nav-black-soft: #1a1a1a;
          --nav-brown: #4a3728;
          --nav-brown-light: #5d4637;
        }

        /* Navbar Base */
        :global(.navbar) {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          height: 90px !important;
          min-height: 90px !important;
          max-height: 90px !important;
        }

        :global(.navbar-scrolled) {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(25px) saturate(1.8);
          -webkit-backdrop-filter: blur(25px) saturate(1.8);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08),
                      0 1px 0 rgba(255, 255, 255, 0.4) inset;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }

        :global(.nav-container) {
          border-color: transparent !important;
          height: 100% !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        :global(.w-nav) {
          height: 90px !important;
        }

        /* Nav Links */
        :global(.nav-link) {
          position: relative;
          color: var(--nav-black-soft) !important;
          font-weight: 500 !important;
          font-size: 15px !important;
          transition: color 0.25s ease;
          padding: 8px 16px !important;
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
        }

        :global(.nav-link)::after {
          content: '';
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 4px;
          height: 2px;
          background: linear-gradient(90deg, var(--nav-gold), var(--nav-gold-light));
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        :global(.nav-link:hover) {
          color: var(--nav-gold) !important;
        }

        :global(.nav-link:hover)::after {
          transform: scaleX(1);
        }

        :global(.nav-link-active) {
          color: var(--nav-gold) !important;
        }

        :global(.nav-link-active)::after {
          transform: scaleX(1);
        }

        :global(.nav-link-auth) {
          color: var(--nav-gold-dark) !important;
          font-weight: 600 !important;
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: rgba(201, 162, 39, 0.3);
          margin: 0 8px;
        }

        /* Logo Animation */
        :global(.nav-logo-wrapper) {
          transition: transform 0.3s ease;
        }

        :global(.nav-logo-wrapper:hover) {
          transform: scale(1.02);
        }

        /* Modern CTA Button - Gold */
        :global(.modern-button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 28px;
          background: linear-gradient(135deg, var(--nav-gold) 0%, var(--nav-gold-light) 50%, var(--nav-gold) 100%);
          background-size: 200% auto;
          color: var(--nav-black) !important;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
          letter-spacing: 0.3px;
        }

        :global(.modern-button.gold-cta) {
          background: linear-gradient(135deg, #c9a227 0%, #e8c547 50%, #c9a227 100%);
          background-size: 200% auto;
        }

        :global(.modern-button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.4);
          background-position: right center;
        }

        :global(.modern-button::before) {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        :global(.modern-button:hover::before) {
          width: 300px;
          height: 300px;
        }

        /* User Profile Styles */
        :global(.user-profile-wrapper) {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        :global(.user-profile-button) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.05) 100%);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
          color: var(--nav-gold-dark);
          text-decoration: none;
        }

        :global(.user-profile-button:hover) {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.08) 100%);
          border-color: var(--nav-gold);
        }

        :global(.user-name) {
          font-size: 14px;
          font-weight: 600;
          color: var(--nav-brown);
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :global(.logout-button) {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          background: transparent;
          border: 1px solid rgba(74, 55, 40, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--nav-brown);
        }

        :global(.logout-button:hover) {
          background: #c62828;
          border-color: #c62828;
          color: white;
        }

        :global(.logout-button svg) {
          transition: all 0.3s ease;
        }

        :global(.logout-button:hover svg) {
          transform: translateX(2px);
        }

        /* Mobile Menu Button */
        .mobile-menu-button {
          display: none;
          background: transparent;
          border: none;
          padding: 12px;
          cursor: pointer;
          z-index: 10000;
          position: relative;
          margin-left: auto;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .hamburger {
          display: block;
          position: relative;
          width: 26px;
          height: 18px;
        }

        .hamburger .line {
          display: block;
          position: absolute;
          height: 2px;
          width: 100%;
          background: var(--nav-black-soft);
          border-radius: 2px;
          opacity: 1;
          left: 0;
          transform: rotate(0deg);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hamburger .line:nth-child(1) {
          top: 0px;
          width: 100%;
        }

        .hamburger .line:nth-child(2) {
          top: 8px;
          width: 75%;
        }

        .hamburger .line:nth-child(3) {
          top: 16px;
          width: 50%;
        }

        .hamburger.active .line {
          background: var(--nav-gold);
        }

        .hamburger.active .line:nth-child(1) {
          top: 8px;
          transform: rotate(45deg);
          width: 100%;
        }

        .hamburger.active .line:nth-child(2) {
          opacity: 0;
          width: 0;
        }

        .hamburger.active .line:nth-child(3) {
          top: 8px;
          transform: rotate(-45deg);
          width: 100%;
        }

        .mobile-menu-button:active .hamburger .line {
          background: var(--nav-gold);
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 10, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 9998;
        }

        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -320px;
          width: 320px;
          height: 100vh;
          background: #ffffff;
          box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
          transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 9999;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .mobile-menu.active {
          right: 0;
        }

        /* Mobile Menu Header */
        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.2);
        }

        .mobile-logo {
          height: 40px;
          width: auto;
        }

        .mobile-close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: 1px solid rgba(74, 55, 40, 0.2);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--nav-brown);
        }

        .mobile-close-button:hover {
          background: var(--nav-gold);
          border-color: var(--nav-gold);
          color: var(--nav-black);
        }

        /* Mobile Menu Links */
        .mobile-menu-links {
          flex: 1;
          padding: 16px 0;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          color: var(--nav-black-soft);
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.25s ease;
        }

        .mobile-nav-link svg {
          opacity: 0;
          transform: translateX(-8px);
          transition: all 0.25s ease;
          color: var(--nav-gold);
        }

        .mobile-nav-link:hover {
          background: rgba(201, 162, 39, 0.08);
          color: var(--nav-gold-dark);
          padding-left: 28px;
        }

        .mobile-nav-link:hover svg {
          opacity: 1;
          transform: translateX(0);
        }

        .mobile-nav-link-active {
          color: var(--nav-gold);
          background: rgba(201, 162, 39, 0.05);
        }

        .mobile-nav-link-active svg {
          opacity: 1;
          transform: translateX(0);
        }

        .mobile-nav-link-auth {
          color: var(--nav-gold-dark);
          font-weight: 600;
        }

        .mobile-nav-divider {
          height: 1px;
          background: rgba(201, 162, 39, 0.2);
          margin: 16px 24px;
        }

        .mobile-nav-section-title {
          padding: 8px 24px;
          font-size: 12px;
          font-weight: 600;
          color: var(--nav-gold);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Mobile Menu Footer */
        .mobile-menu-footer {
          padding: 24px;
          border-top: 1px solid rgba(201, 162, 39, 0.2);
          background: rgba(201, 162, 39, 0.03);
        }

        .mobile-cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--nav-gold) 0%, var(--nav-gold-light) 100%);
          color: var(--nav-black);
          text-align: center;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(201, 162, 39, 0.3);
        }

        .mobile-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.4);
        }

        /* Mobile User Profile Styles */
        .mobile-user-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mobile-user-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 12px;
        }

        .mobile-user-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--nav-gold) 0%, var(--nav-gold-light) 100%);
          border-radius: 10px;
          color: var(--nav-black);
        }

        .mobile-user-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--nav-brown);
        }

        .mobile-logout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          background: var(--nav-black);
          color: var(--nav-gold);
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-logout-button:hover {
          background: #c62828;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(198, 40, 40, 0.3);
        }

        /* Desktop Menu */
        .desktop-menu {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-left: auto;
          margin-right: 40px;
        }

        /* Media Queries */
        @media screen and (max-width: 991px) {
          .mobile-menu-button {
            display: flex !important;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 44px;
          }

          .desktop-menu {
            display: none !important;
          }

          :global(.hide-tablet) {
            display: none !important;
          }

          :global(.nav-menu.w-nav-menu) {
            display: none !important;
          }

          :global(.nav-container) {
            justify-content: space-between !important;
          }
        }

        @media screen and (min-width: 992px) {
          .mobile-menu,
          .mobile-menu-overlay {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
