import { useEffect, useState } from 'react'
import { useFirebase } from '../contexts/FirebaseContext-Safe'

export default function Navbar() {
  const { user, logout } = useFirebase()
  const [navUser, setNavUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const handleLogout = async () => {
    await logout()
    setNavUser(null)
    window.location.href = '/'
  }

  return (
    <>
      <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar w-nav">
        <div className="nav-container">
          <a
            href="/"
            className="nav-logo-wrapper w-nav-brand"
            style={{ height: '64px', display: 'flex', alignItems: 'center', overflow: 'visible' }}
          >
            <img
              src="/Remmic%20LOGO%201.png"
              loading="lazy"
              alt="REMMIC Logo"
              className="nav-logo"
              style={{ height: '170px', width: 'auto', objectFit: 'contain' }}
            />
          </a>
          
          {/* Desktop Menu */}
          <nav role="navigation" className="nav-menu w-nav-menu desktop-menu">
            <a href="/" className="nav-link w-nav-link">Home</a>
            <a href="/about" className="nav-link w-nav-link">About</a>
            <a href="/bidding" className="nav-link w-nav-link">Bidding</a>
            <a href="/investment-shares" className="nav-link w-nav-link">Investment</a>
            <a href="/evaluation" className="nav-link w-nav-link">Evaluations</a>
            {navUser && (
              <a
                href={navUser.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                className="nav-link w-nav-link"
                style={{fontWeight: '600', color: '#059669'}}
              >
                {navUser.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </a>
            )}
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
                <div className="user-profile-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '8px'}}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="user-name">{navUser.name || navUser.email}</span>
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
              </div>
            ) : (
              <a href="/login" className="modern-button">
                <span className="button-text">Get Started</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay and Content */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      <nav className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <button 
          className="mobile-close-button"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          ×
        </button>
        <a href="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
        <a href="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
        <a href="/bidding" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Bidding</a>
        <a href="/investment-shares" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Investment</a>
        <a href="/evaluation" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Evaluations</a>
        {navUser && (
          <a
            href={navUser.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
            className="mobile-nav-link"
            style={{fontWeight: '600', color: '#059669'}}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {navUser.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </a>
        )}
        <div className="mobile-menu-footer">
          {navUser ? (
            <div className="mobile-user-info">
              <div className="mobile-user-profile">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#059669">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
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
            <a href="/login" className="mobile-cta-button">Get Started</a>
          )}
        </div>
      </nav>

      <style jsx>{`
        /* Ensure navbar has proper stacking */
        :global(.navbar) {
          position: relative;
          z-index: 1000;
        }

        :global(.nav-link) {
          position: relative;
          transition: color 0.2s ease;
        }

        :global(.nav-link)::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 2px;
          background: #ff5e01;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s ease;
        }

        :global(.nav-link:hover) {
          color: #ff5e01;
        }

        :global(.nav-link:hover)::after {
          transform: scaleX(1);
        }

        :global(.nav-container) {
          border-color: white;
        }

        :global(.nav-logo-wrapper) {
          transition: transform 0.2s ease;
        }

        :global(.nav-logo-wrapper:hover) {
          transform: scale(1.02);
        }

        :global(.modern-button) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #ff5e01 0%, #ff8a3d 100%);
          color: white;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 100px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(255, 94, 1, 0.3);
        }

        :global(.modern-button:hover) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(255, 94, 1, 0.4);
        }

        :global(.modern-button::before) {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
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
        }

        :global(.user-profile-button) {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f0fdf4;
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        :global(.user-profile-button:hover) {
          background: #dcfce7;
        }

        :global(.user-name) {
          font-size: 14px;
          font-weight: 600;
          color: #059669;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :global(.logout-button) {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          margin-left: 8px;
          background: transparent;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        :global(.logout-button:hover) {
          background: #dc2626;
          color: white;
        }

        :global(.logout-button svg) {
          transition: all 0.3s ease;
        }

        :global(.logout-button:hover svg) {
          transform: translateX(2px);
        }

        /* Mobile Menu Button Styles */
        .mobile-menu-button {
          display: none;
          background: transparent;
          border: none;
          padding: 10px;
          cursor: pointer;
          z-index: 10000;
          position: relative;
        }

        .hamburger {
          display: block;
          position: relative;
          width: 28px;
          height: 20px;
        }

        .hamburger .line {
          display: block;
          position: absolute;
          height: 3px;
          width: 100%;
          background: #333;
          border-radius: 3px;
          opacity: 1;
          left: 0;
          transform: rotate(0deg);
          transition: all 0.25s ease-in-out;
        }

        .hamburger .line:nth-child(1) {
          top: 0px;
        }

        .hamburger .line:nth-child(2) {
          top: 8px;
        }

        .hamburger .line:nth-child(3) {
          top: 16px;
        }

        .hamburger.active .line:nth-child(1) {
          top: 8px;
          transform: rotate(135deg);
        }

        .hamburger.active .line:nth-child(2) {
          opacity: 0;
          left: -60px;
        }

        .hamburger.active .line:nth-child(3) {
          top: 8px;
          transform: rotate(-135deg);
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
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
          right: -300px;
          width: 300px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 9999;
          overflow-y: auto;
          padding: 20px;
          padding-top: 60px;
        }

        .mobile-menu.active {
          right: 0;
        }

        /* Close Button */
        .mobile-close-button {
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 36px;
          color: #333;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .mobile-close-button:hover {
          background: #f0f0f0;
          color: #ff5e01;
        }

        .mobile-nav-link {
          display: block;
          padding: 15px 20px;
          color: #333;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .mobile-nav-link:hover {
          background: #f8f8f8;
          color: #ff5e01;
          padding-left: 25px;
        }

        .mobile-menu-footer {
          margin-top: 30px;
          padding: 20px;
          border-top: 2px solid #f0f0f0;
        }

        .mobile-cta-button {
          display: block;
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #ff5e01 0%, #ff8a3d 100%);
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .mobile-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 94, 1, 0.3);
        }

        /* Mobile User Profile Styles */
        .mobile-user-info {
          padding: 10px 0;
        }

        .mobile-user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f0fdf4;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .mobile-user-name {
          font-size: 16px;
          font-weight: 600;
          color: #059669;
        }

        .mobile-logout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mobile-logout-button:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        /* Desktop Menu - Hide on mobile */
        .desktop-menu {
          display: flex;
        }

        /* Media Queries */
        @media screen and (max-width: 991px) {
          .mobile-menu-button {
            display: block;
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
