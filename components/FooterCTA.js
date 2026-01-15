/**
 * FooterCTA Component
 *
 * Standardized call-to-action section for page footers.
 * Spec copy: "Start Investing in Real Assets"
 *
 * Props:
 * - variant: 'default' | 'minimal' - Default shows image, minimal is text-only
 * - title: string - Main heading
 * - subtitle: string - Supporting text
 * - primaryCta: { label, href } - Primary gold button
 * - secondaryCta: { label, href } | null - Secondary dark button (optional)
 * - showImage: boolean - Whether to show property image (default variant only)
 *
 * Usage:
 * <FooterCTA /> - Full version with image for homepage
 * <FooterCTA variant="minimal" /> - Compact version for inner pages
 */
import { useEffect, useState, useRef } from 'react'

export default function FooterCTA({
  variant = 'default',
  title = 'Start Investing in Real Assets',
  subtitle = "Join Pakistan's first institutional-grade PropTech ecosystem. Whether you're an investor, property owner, or developer.",
  primaryCta = { label: 'Start Investing in Real Assets', href: '/signup' },
  secondaryCta = { label: 'Talk to Advisor', href: '/contact' },
  showImage = true
}) {
  const ctaRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ctaRef.current) {
      observer.observe(ctaRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Minimal variant for inner pages
  if (variant === 'minimal') {
    return (
      <section ref={ctaRef} className="footer-cta footer-cta--minimal">
        <div className="footer-cta__container" style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease'
        }}>
          <h2 className="footer-cta__title">{title}</h2>
          <p className="footer-cta__subtitle">{subtitle}</p>
          <div className="footer-cta__actions">
            <a href={primaryCta.href} className="btn btn--primary btn--large">
              <span>{primaryCta.label}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
            {secondaryCta && (
              <a href={secondaryCta.href} className="btn btn--dark btn--large">
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>

        <style jsx>{`
          .footer-cta--minimal {
            padding: 80px 5%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            text-align: center;
          }

          .footer-cta__container {
            max-width: 700px;
            margin: 0 auto;
          }

          .footer-cta__title {
            font-size: clamp(1.75rem, 4vw, 2.5rem);
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 16px;
            letter-spacing: -0.01em;
          }

          .footer-cta__subtitle {
            font-size: 1.0625rem;
            color: rgba(255, 255, 255, 0.7);
            margin: 0 0 32px;
            line-height: 1.6;
          }

          .footer-cta__actions {
            display: flex;
            justify-content: center;
            gap: 16px;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 16px 28px;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }

          .btn--primary {
            background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
            color: #0a0a0a;
            box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
          }

          .btn--primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(201, 162, 39, 0.4);
          }

          .btn--dark {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
          }

          .btn--dark:hover {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(255, 255, 255, 0.25);
          }

          @media (max-width: 600px) {
            .footer-cta--minimal {
              padding: 60px 5%;
            }

            .footer-cta__actions {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        `}</style>
      </section>
    )
  }

  // Default variant with image (for homepage)
  return (
    <section ref={ctaRef} className="footer-cta">
      <div className="footer-cta__container" style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.6s ease'
      }}>
        <div className="footer-cta__content">
          <h2 className="footer-cta__title">
            {title.includes('Real Assets') ? (
              <>Start Investing in <span className="footer-cta__accent">Real Assets</span></>
            ) : (
              title
            )}
          </h2>

          <p className="footer-cta__subtitle">{subtitle}</p>

          <div className="footer-cta__actions">
            <a href={primaryCta.href} className="btn btn--primary btn--large">
              <span>{primaryCta.label}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </a>
            {secondaryCta && (
              <a href={secondaryCta.href} className="btn btn--dark btn--large">
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>
        {showImage && (
          <div className="footer-cta__image">
            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80" alt="Real Estate Investment Platform" />
          </div>
        )}
      </div>

      <style jsx>{`
        .footer-cta {
          padding: 100px 5%;
          background: linear-gradient(135deg, #0a0a0a 0%, #151515 100%);
          position: relative;
          overflow: hidden;
        }

        .footer-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(201, 162, 39, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer-cta__container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .footer-cta__content {
          max-width: 520px;
        }

        .footer-cta__title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 20px;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }

        .footer-cta__accent {
          color: #c9a227;
        }

        .footer-cta__subtitle {
          font-size: 1.0625rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 36px;
          line-height: 1.7;
        }

        .footer-cta__actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
        }

        .btn--primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 35px rgba(201, 162, 39, 0.4);
        }

        .btn--dark {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .btn--dark:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .footer-cta__image {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        .footer-cta__image::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(201, 162, 39, 0.1) 100%);
          z-index: 1;
        }

        .footer-cta__image img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 900px) {
          .footer-cta {
            padding: 80px 5%;
          }

          .footer-cta__container {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }

          .footer-cta__content {
            max-width: 100%;
          }

          .footer-cta__actions {
            justify-content: center;
          }

          .footer-cta__image {
            max-width: 500px;
            margin: 0 auto;
          }

          .footer-cta__image img {
            height: 300px;
          }
        }

        @media (max-width: 600px) {
          .footer-cta__actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  )
}
