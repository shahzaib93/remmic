import Head from 'next/head'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])



  return (
    <>
      <Head>
        <title>About - REMMIC</title>
        <meta name="description" content="Learn about REMMIC - Pakistan's leading real estate investment and property management platform." />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="about-main">
          {/* Hero Section */}
          <section className="about-hero">
            <div className="about-hero-container">
              <div className={`about-hero-content ${isVisible ? 'is-visible' : ''}`}>
                <span className="about-badge">About REMMIC</span>
                <h1 className="about-title">
                  The Future of<br />
                  <span className="about-title-accent">Real Estate Investment</span>
                </h1>
                <p className="about-description">
                  REMMIC is your all-in-one platform for property investment opportunities,
                  fractional ownership, comprehensive rental management, and intelligent
                  property operations — all powered by cutting-edge technology.
                </p>
                <a href="/contact" className="about-cta-btn">
                  Get Started
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </a>
              </div>

              <div className={`about-hero-image ${isVisible ? 'is-visible' : ''}`}>
                <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" alt="Modern property" />
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="about-story-section">
            <div className="about-container">
              <div className="about-story-grid">
                <div className="about-story-card">
                  <div className="story-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h3>Our Beginning</h3>
                  <p>Founded in 2024, REMMIC emerged from recognizing the massive gap between traditional real estate operations and the digital-first world investors demand today.</p>
                </div>
                <div className="about-story-card">
                  <div className="story-icon story-icon--gold">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                  </div>
                  <h3>Our Approach</h3>
                  <p>Our platform democratizes real estate by offering fractional investment opportunities, enabling anyone to build a diversified property portfolio from PKR 3 Lacs.</p>
                </div>
                <div className="about-story-card">
                  <div className="story-icon story-icon--brown">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  </div>
                  <h3>Our Solution</h3>
                  <p>Beyond investments, REMMIC provides comprehensive property management solutions — from tenant screening to automated rent collection and analytics.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="about-mission-section">
            <div className="about-container">
              <div className="mission-vision-grid">
                <div className="mission-card">
                  <div className="mission-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                      <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"/>
                    </svg>
                  </div>
                  <h3>Our Mission</h3>
                  <p>To democratize real estate investment and property management by breaking down traditional barriers. We make premium investment opportunities accessible to everyone.</p>
                </div>
                <div className="mission-card">
                  <div className="mission-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </div>
                  <h3>Our Vision</h3>
                  <p>To transform Pakistan's real estate landscape into a transparent, technology-driven ecosystem where anyone can invest in premium properties through fractional ownership.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="about-cta-section">
            <div className="about-container">
              <div className={`about-cta-content ${isVisible ? 'is-visible' : ''}`}>
                <h2>Ready to Start Your<br /><span>Investment Journey?</span></h2>
                <p className="about-cta-statement">
                  REMMIC is building the global financial infrastructure for real assets — responsibly, transparently, and at institutional standards.
                </p>
                <div className="about-cta-buttons">
                  <a href="/marketplace" className="about-cta-primary">
                    Explore Marketplace
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </a>
                  <a href="/silver-founders" className="about-cta-secondary">
                    Become a Silver Founder
                  </a>
                </div>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>

      <style jsx>{`
        .about-main {
          padding-top: 72px;
        }

        .about-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 5%;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION A: HERO */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .about-hero {
          padding: 72px 5% 80px;
          background: linear-gradient(180deg, #faf9f7 0%, #ffffff 100%);
          position: relative;
          overflow: hidden;
        }

        .about-hero::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          background: radial-gradient(ellipse at 80% 20%, rgba(201, 162, 39, 0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .about-hero-container {
          max-width: 1140px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .about-hero-content {
          opacity: 0;
          transform: translateY(24px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .about-hero-content.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .about-badge {
          display: inline-block;
          padding: 7px 18px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.2);
          color: #c9a227;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 100px;
          margin-bottom: 20px;
          font-family: 'Manrope', sans-serif;
        }

        .about-title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #0a0a0a;
          margin: 0 0 20px;
          font-family: 'Playfair Display', serif;
        }

        .about-title-accent {
          display: block;
          color: #c9a227;
        }

        .about-description {
          font-size: 1.0625rem;
          color: #5f6368;
          line-height: 1.7;
          margin: 0 0 28px;
          max-width: 480px;
          font-family: 'Manrope', sans-serif;
        }

        .about-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 28px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 0.9375rem;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
        }

        .about-cta-btn svg {
          transition: transform 0.3s ease;
        }

        .about-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201, 162, 39, 0.4);
        }

        .about-cta-btn:hover svg {
          transform: translateX(4px);
        }

        .about-hero-image {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12);
          opacity: 0;
          transform: translateY(32px);
          transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
        }

        .about-hero-image.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .about-hero-image img {
          width: 100%;
          height: 420px;
          object-fit: cover;
          display: block;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION B: 3 INFO CARDS */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .about-story-section {
          padding: 72px 0 80px;
          background: #ffffff;
        }

        .about-story-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .about-story-card {
          padding: 28px 26px;
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e8e8e6;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .about-story-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c9a227 0%, #b8922a 100%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .about-story-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);
          border-color: rgba(201, 162, 39, 0.35);
        }

        .about-story-card:hover::before {
          opacity: 1;
        }

        .story-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, rgba(74, 55, 40, 0.1) 0%, rgba(74, 55, 40, 0.04) 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          color: #4a3728;
          transition: all 0.3s ease;
        }

        .story-icon--gold {
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.14) 0%, rgba(201, 162, 39, 0.05) 100%);
          color: #c9a227;
        }

        .story-icon--brown {
          background: linear-gradient(135deg, rgba(74, 55, 40, 0.12) 0%, rgba(74, 55, 40, 0.04) 100%);
          color: #4a3728;
        }

        .about-story-card:hover .story-icon {
          transform: scale(1.08);
        }

        .about-story-card h3 {
          font-size: 1.0625rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px;
          font-family: 'Manrope', sans-serif;
        }

        .about-story-card p {
          font-size: 0.875rem;
          color: #5f6368;
          line-height: 1.65;
          margin: 0;
          font-family: 'Manrope', sans-serif;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION C: MISSION & VISION */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .about-mission-section {
          padding: 72px 0 80px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
        }

        .mission-vision-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }

        .mission-card {
          background: #ffffff;
          padding: 36px 32px;
          border-radius: 20px;
          border: 1px solid #e8e8e6;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .mission-card:hover {
          box-shadow: 0 12px 40px rgba(201, 162, 39, 0.1);
          border-color: rgba(201, 162, 39, 0.3);
          transform: translateY(-2px);
        }

        .mission-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(201, 162, 39, 0.14) 0%, rgba(201, 162, 39, 0.05) 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }

        .mission-card:hover .mission-icon {
          transform: scale(1.08);
        }

        .mission-card h3 {
          font-size: 1.375rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 14px;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.01em;
        }

        .mission-card p {
          font-size: 0.9375rem;
          color: #5f6368;
          line-height: 1.7;
          margin: 0;
          font-family: 'Manrope', sans-serif;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* SECTION D: DARK CTA BLOCK */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        .about-cta-section {
          padding: 72px 0;
          background: linear-gradient(135deg, #0a0a0a 0%, #151515 100%);
          position: relative;
          overflow: hidden;
        }

        .about-cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 0%, rgba(201, 162, 39, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .about-cta-content {
          text-align: center;
          max-width: 640px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s;
        }

        .about-cta-content.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .about-cta-content h2 {
          font-size: clamp(1.75rem, 4vw, 2.75rem);
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 16px;
          line-height: 1.15;
          letter-spacing: -0.02em;
          font-family: 'Playfair Display', serif;
        }

        .about-cta-content h2 span {
          color: #c9a227;
        }

        .about-cta-statement {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.7;
          margin: 0 0 32px;
          font-family: 'Manrope', sans-serif;
        }

        .about-cta-buttons {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
          align-items: stretch;
        }

        .about-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 26px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 0.9375rem;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.35);
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
        }

        .about-cta-primary svg {
          transition: transform 0.3s ease;
        }

        .about-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201, 162, 39, 0.45);
        }

        .about-cta-primary:hover svg {
          transform: translateX(4px);
        }

        .about-cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 14px 26px;
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9375rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          font-family: 'Manrope', sans-serif;
        }

        .about-cta-secondary:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
          transform: translateY(-2px);
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        /* RESPONSIVE */
        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
        @media (max-width: 991px) {
          .about-hero {
            padding: 64px 5% 72px;
          }

          .about-hero-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .about-hero-content {
            text-align: center;
          }

          .about-description {
            max-width: 100%;
            margin-left: auto;
            margin-right: auto;
          }

          .about-hero-image img {
            height: 360px;
          }

          .about-story-grid {
            grid-template-columns: 1fr;
            max-width: 480px;
            margin: 0 auto;
          }

          .mission-vision-grid {
            grid-template-columns: 1fr;
            max-width: 520px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .about-main {
            padding-top: 64px;
          }

          .about-hero {
            padding: 56px 5% 64px;
          }

          .about-title {
            font-size: clamp(1.875rem, 6vw, 2.5rem);
          }

          .about-description {
            font-size: 1rem;
          }

          .about-hero-image img {
            height: 300px;
          }

          .about-story-section,
          .about-mission-section {
            padding: 56px 0 64px;
          }

          .about-story-card {
            padding: 24px 22px;
          }

          .mission-card {
            padding: 28px 24px;
          }

          .mission-card h3 {
            font-size: 1.25rem;
          }

          .about-cta-section {
            padding: 56px 0;
          }

          .about-cta-content h2 {
            font-size: clamp(1.5rem, 5vw, 2rem);
          }

          .about-cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .about-cta-primary,
          .about-cta-secondary {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .about-hero {
            padding: 48px 5% 56px;
          }

          .about-badge {
            font-size: 0.625rem;
            padding: 6px 14px;
          }

          .about-title {
            font-size: clamp(1.625rem, 7vw, 2rem);
          }

          .about-cta-btn {
            width: 100%;
            justify-content: center;
            padding: 14px 24px;
          }

          .about-hero-image img {
            height: 260px;
          }

          .about-story-section,
          .about-mission-section {
            padding: 48px 0 56px;
          }

          .story-icon {
            width: 46px;
            height: 46px;
          }

          .about-story-card h3 {
            font-size: 1rem;
          }

          .mission-icon {
            width: 48px;
            height: 48px;
          }

          .about-cta-section {
            padding: 48px 0;
          }

          .about-cta-statement {
            font-size: 0.9375rem;
          }

          .about-cta-primary,
          .about-cta-secondary {
            padding: 13px 22px;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  )
}
