import { getLogoUrl } from '../lib/assets'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        aria-label="Back to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>

      <footer className="footer">
        <div className="footer__container">
          {/* Main Content */}
          <div className="footer__main">
            <div className="footer__brand">
              <a href="/" className="footer__logo-link">
                <img 
                  src={getLogoUrl({ format: 'svg', size: 'medium', optimized: false })} 
                  alt="REMMIC Logo" 
                  className="footer__logo"
                  onError={(e) => {
                    e.target.src = '/REMMIC LOGO SVG.svg';
                  }}
                />
              </a>
              <p className="footer__tagline">Real Assets Real Ownership Real Liquidity</p>
            </div>

            <div className="footer__links">
              <div className="footer__col">
                <span className="footer__col-title">Company</span>
                <a href="/" className="footer__link">Home</a>
                <a href="/about" className="footer__link">About</a>
                <a href="/amanorx-group" className="footer__link">Amanorx Group</a>
                <a href="/contact" className="footer__link">Contact</a>
              </div>
              <div className="footer__col">
                <span className="footer__col-title">Services</span>
                <a href="/evaluation" className="footer__link">Evaluation</a>
                <a href="/investment" className="footer__link">Investment</a>
                <a href="/marketplace" className="footer__link">Marketplace</a>
                <a href="/silver-founders" className="footer__link">Silver Founders</a>
              </div>
              <div className="footer__col">
                <span className="footer__col-title">Resources</span>
                <a href="/how-it-works" className="footer__link">How It Works</a>
                <a href="/trust-security" className="footer__link">Trust & Security</a>
                <a href="/faqs" className="footer__link">FAQs</a>
                <a href="/privacy-policy" className="footer__link">Privacy</a>
              </div>
            </div>

            <div className="footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer__bottom">
            <span>&copy; 2026 REMMIC. All rights reserved.</span>
            <span className="footer__separator">|</span>
            <span>A product of <a href="/amanorx-group" style={{color: '#c9a227', textDecoration: 'none'}}><strong>Amanorx Group</strong></a></span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Back to Top Button */
        .back-to-top {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
          z-index: 999;
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(201, 162, 39, 0.4);
        }

        .footer {
          background: #0a0a0a;
          padding: 80px 5% 40px;
        }

        .footer__container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer__main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 48px;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(201, 162, 39, 0.15);
        }

        .footer__brand {
          flex-shrink: 0;
        }

        .footer__logo-link {
          display: inline-block;
          margin-bottom: 8px;
        }

        .footer__logo {
          height: 45px;
          width: auto;
        }

        .footer__tagline {
          color: #c9a227;
          font-size: 0.875rem;
          margin: 0;
        }

        .footer__links {
          display: flex;
          gap: 48px;
        }

        .footer__col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer__col-title {
          color: #c9a227;
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }

        .footer__link {
          color: #888;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
          padding-bottom: 2px;
        }

        .footer__link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: #c9a227;
          transition: width 0.3s ease;
        }

        .footer__link:hover {
          color: #c9a227;
        }

        .footer__link:hover::after {
          width: 100%;
        }

        .footer__social {
          display: flex;
          gap: 8px;
        }

        .footer__social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(201, 162, 39, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.2);
          border-radius: 10px;
          color: #c9a227;
          transition: all 0.2s;
        }

        .footer__social-link:hover {
          background: #c9a227;
          color: #0a0a0a;
        }

        .footer__bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding-top: 28px;
          color: #666;
          font-size: 0.8125rem;
        }

        .footer__bottom strong {
          color: #c9a227;
        }

        .footer__separator {
          color: rgba(201, 162, 39, 0.3);
        }

        @media (max-width: 768px) {
          .back-to-top {
            bottom: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
          }

          .footer {
            padding: 60px 5% 32px;
          }

          .footer__main {
            flex-direction: column;
            gap: 40px;
            align-items: flex-start;
          }

          .footer__brand {
            text-align: left;
          }

          .footer__links {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            width: 100%;
          }

          .footer__col {
            align-items: flex-start;
          }

          .footer__social {
            gap: 12px;
          }

          .footer__bottom {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .footer__links {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .footer__col:last-child {
            grid-column: 1 / -1;
          }

          .footer__separator {
            display: none;
          }

          .footer__bottom {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}
