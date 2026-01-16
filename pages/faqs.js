import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from 'react'

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null)
  const [activeCategory, setActiveCategory] = useState('general')

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const categories = [
    { id: 'general', label: 'General' },
    { id: 'investment', label: 'Investment' },
    { id: 'property', label: 'Property' },
    { id: 'security', label: 'Security' },
    { id: 'account', label: 'Account' }
  ]

  const faqs = {
    general: [
      {
        q: 'What is REMMIC?',
        a: 'REMMIC (Real Estate Evaluation, Marketing, Management & Investment Company) is a technology-driven PropTech platform designed to bring transparency, trust, and efficiency to real estate transactions in Pakistan. We offer property evaluation, verification, auction, management, and fractional investment services.'
      },
      {
        q: 'How is REMMIC different from other real estate platforms?',
        a: 'Unlike traditional platforms, REMMIC verifies every property listing through a rigorous 4-step process including document verification, legal checks, and physical inspection. We also offer fractional ownership, transparent auctions, and are regulated under SECP sandbox framework.'
      },
      {
        q: 'Is REMMIC a licensed/regulated platform?',
        a: 'Yes, REMMIC operates under the SECP (Securities and Exchange Commission of Pakistan) regulatory sandbox. All financial transactions are processed through SBP-regulated banking partners with proper escrow mechanisms.'
      },
      {
        q: 'What areas does REMMIC currently operate in?',
        a: 'REMMIC currently operates across all major cities in Pakistan including Islamabad, Lahore, Karachi, Rawalpindi, and Peshawar. We are continuously expanding to cover more areas.'
      },
      {
        q: 'How can I contact REMMIC support?',
        a: 'You can reach our support team via email at support@remmic.pk, call us at +92 300 123 4567, or use the contact form on our website. Our support team is available from 9 AM to 6 PM (PKT), Monday through Saturday.'
      }
    ],
    investment: [
      {
        q: 'What is fractional ownership?',
        a: 'Fractional ownership allows you to invest in a portion of a property rather than buying the entire property. You purchase "shares" of a property and earn returns proportional to your ownership stake through rental income or capital appreciation.'
      },
      {
        q: 'What is the minimum investment amount?',
        a: 'The minimum investment varies by property but typically starts from PKR 50,000. Each property listing displays its minimum investment requirement and share price.'
      },
      {
        q: 'How do I earn returns on my investment?',
        a: 'Returns come from two sources: (1) Regular rental income distributed quarterly based on your ownership percentage, and (2) Capital appreciation when the property value increases, realized upon property sale or your share exit.'
      },
      {
        q: 'Can I sell my shares before the investment term ends?',
        a: 'Yes, REMMIC offers a secondary market where you can sell your shares to other investors. However, liquidity depends on buyer demand. Some properties may have a minimum holding period before shares can be traded.'
      },
      {
        q: 'What happens if a property doesn\'t perform well?',
        a: 'Real estate investments carry inherent risks. While REMMIC provides thorough property evaluations and market analysis, returns are not guaranteed. We recommend diversifying your investments across multiple properties.'
      },
      {
        q: 'Are there any fees for investing?',
        a: 'REMMIC charges a small platform fee (typically 1-2%) on investments and a management fee for property management services. All fees are transparently disclosed before you invest.'
      }
    ],
    property: [
      {
        q: 'How does property evaluation work?',
        a: 'Our certified evaluators conduct a comprehensive assessment including physical inspection, document verification, market comparison, location analysis, and legal due diligence. The evaluation report provides an unbiased market value estimate.'
      },
      {
        q: 'What is the "REM Verified" badge?',
        a: 'The REM Verified badge indicates that a property has passed our rigorous 4-step verification process including document authenticity, legal clearance, physical condition assessment, and ownership verification.'
      },
      {
        q: 'How can I list my property on REMMIC?',
        a: 'Visit our "Add Property" page and submit your property details. Our team will contact you to schedule an evaluation. Once verified, your property will be listed with the REM Verified badge.'
      },
      {
        q: 'What documents are required to list a property?',
        a: 'Required documents include: ownership deed, CNIC, property tax receipts, recent utility bills, NOC from society (if applicable), and any mortgage/loan clearance certificates.'
      },
      {
        q: 'How long does the verification process take?',
        a: 'The standard verification process takes 5-7 business days. This may vary depending on document availability and property accessibility. Express verification is available for an additional fee.'
      },
      {
        q: 'What are the property management services?',
        a: 'REMMIC offers comprehensive property management including tenant screening, rent collection, maintenance coordination, legal compliance, and regular property inspections with detailed reports.'
      }
    ],
    security: [
      {
        q: 'How is my investment protected?',
        a: 'All investor funds are held in segregated escrow accounts with SBP-regulated banks. Property investments are backed by actual physical assets. We maintain comprehensive insurance coverage and follow strict compliance protocols.'
      },
      {
        q: 'What security measures protect my account?',
        a: 'We implement bank-grade security including AES-256 encryption, two-factor authentication, secure login monitoring, and regular security audits. All sensitive data is encrypted both in transit and at rest.'
      },
      {
        q: 'What happens if REMMIC shuts down?',
        a: 'Your investments are backed by actual property assets held in legal trust structures. In an unlikely event of platform closure, investors retain their ownership stakes and a appointed trustee would manage the assets.'
      },
      {
        q: 'How do I report suspicious activity?',
        a: 'Contact our security team immediately at security@remmic.pk or call our 24/7 security hotline. We take all reports seriously and investigate promptly.'
      }
    ],
    account: [
      {
        q: 'How do I create an account?',
        a: 'Click "Sign Up" on our homepage, provide your email, create a password, and verify your phone number. You\'ll need to complete KYC verification before making investments.'
      },
      {
        q: 'What is KYC and why is it required?',
        a: 'KYC (Know Your Customer) is a regulatory requirement to verify your identity. It helps prevent fraud and ensures compliance with anti-money laundering regulations. You\'ll need to provide your CNIC and proof of address.'
      },
      {
        q: 'How long does KYC verification take?',
        a: 'Standard KYC verification takes 24-48 hours. You\'ll receive an email notification once your account is verified. Some cases may require additional documentation.'
      },
      {
        q: 'Can I have multiple accounts?',
        a: 'No, each individual can have only one REMMIC account linked to their CNIC. Joint accounts for families or corporate accounts for businesses are available upon request.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page, enter your registered email, and follow the reset link sent to your inbox. For security, reset links expire after 1 hour.'
      },
      {
        q: 'How can I delete my account?',
        a: 'To delete your account, you must first withdraw all funds and exit all investments. Then contact support with your request. Account deletion is processed within 7 business days.'
      }
    ]
  }

  return (
    <>
      <Head>
        <title>Frequently Asked Questions - REMMIC</title>
        <meta name="description" content="Find answers to common questions about REMMIC's real estate investment platform, property services, and more" />
      </Head>
      <div className="page-wrapper">
        <Navbar />
        <main className="pt-24">
          {/* Hero Section */}
          <section className="faq-hero">
            <div className="faq-hero__container">
              <h1 className="faq-hero__title">Frequently Asked Questions</h1>
              <p className="faq-hero__subtitle">
                Find answers to common questions about REMMIC's services, investments, and platform features.
              </p>
            </div>
          </section>

          {/* FAQs Section */}
          <section className="faq-main">
            <div className="faq-main__container">
              {/* Category Tabs */}
              <div className="faq-categories">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`faq-category ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="faq-list">
                {faqs[activeCategory].map((faq, index) => (
                  <div
                    key={index}
                    className={`faq-item ${openIndex === index ? 'open' : ''}`}
                  >
                    <button
                      className="faq-item__question"
                      onClick={() => toggleFAQ(index)}
                    >
                      <span>{faq.q}</span>
                      <span className="faq-item__icon">{openIndex === index ? '−' : '+'}</span>
                    </button>
                    {openIndex === index && (
                      <div className="faq-item__answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Still Have Questions */}
          <section className="faq-contact">
            <div className="faq-contact__container">
              <h2>Still have questions?</h2>
              <p>Our support team is here to help you with any queries.</p>
              <div className="faq-contact__buttons">
                <a href="/contact" className="faq-contact__btn faq-contact__btn--primary">Contact Support</a>
                <a href="mailto:support@remmic.pk" className="faq-contact__btn faq-contact__btn--secondary">Email Us</a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .faq-hero {
          padding: 110px 5% 56px;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .faq-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 0%, rgba(201, 162, 39, 0.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .faq-hero__container {
          max-width: 640px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .faq-hero__title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 600;
          margin: 0 0 14px;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #ffffff;
          font-family: 'Playfair Display', serif;
        }
        .faq-hero__subtitle {
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          font-size: 1.0625rem;
          max-width: 520px;
          font-family: 'Manrope', sans-serif;
        }

        .faq-main {
          padding: 72px 5% 100px;
          background: linear-gradient(180deg, #f8f7f5 0%, #ffffff 100%);
        }
        .faq-main__container {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-categories {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .faq-category {
          padding: 12px 24px;
          border: 1px solid #e8e8e6;
          background: #ffffff;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Manrope', sans-serif;
          color: #3d3d3d;
        }
        .faq-category:hover {
          border-color: rgba(201, 162, 39, 0.5);
          color: #c9a227;
          background: rgba(201, 162, 39, 0.06);
        }
        .faq-category.active {
          background: #0a0a0a;
          color: #fff;
          border-color: #0a0a0a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .faq-item {
          border: 1px solid #e8e8e6;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.25s ease;
          background: #ffffff;
        }
        .faq-item:hover {
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
          border-color: rgba(201, 162, 39, 0.25);
        }
        .faq-item.open {
          border-color: rgba(201, 162, 39, 0.5);
          box-shadow: 0 8px 32px rgba(201, 162, 39, 0.1);
        }
        .faq-item__question {
          width: 100%;
          padding: 22px 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          gap: 16px;
          font-family: 'Manrope', sans-serif;
          line-height: 1.5;
        }
        .faq-item__icon {
          font-size: 1.5rem;
          color: #c9a227;
          flex-shrink: 0;
          font-weight: 300;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 162, 39, 0.1);
          border-radius: 50%;
        }
        .faq-item__answer {
          padding: 0 26px 22px;
          background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
          border-top: 1px solid #f0f0ee;
        }
        .faq-item__answer p {
          font-size: 0.9375rem;
          color: #5f6368;
          line-height: 1.7;
          margin: 0;
          padding-top: 18px;
          font-family: 'Manrope', sans-serif;
        }

        .faq-contact {
          padding: 80px 5% 100px;
          background: linear-gradient(180deg, #0a0a0a 0%, #111111 100%);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .faq-contact::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 100%;
          background: radial-gradient(ellipse at 50% 100%, rgba(201, 162, 39, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .faq-contact__container {
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .faq-contact h2 {
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: 600;
          margin: 0 0 14px;
          color: #ffffff;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }
        .faq-contact p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 32px;
          font-family: 'Manrope', sans-serif;
          line-height: 1.6;
        }
        .faq-contact__buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .faq-contact__btn {
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s ease;
          font-family: 'Manrope', sans-serif;
        }
        .faq-contact__btn:hover {
          transform: translateY(-2px);
        }
        .faq-contact__btn--primary {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
        }
        .faq-contact__btn--primary:hover {
          box-shadow: 0 8px 30px rgba(201, 162, 39, 0.4);
        }
        .faq-contact__btn--secondary {
          background: transparent;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .faq-contact__btn--secondary:hover {
          border-color: rgba(201, 162, 39, 0.5);
          background: rgba(201, 162, 39, 0.1);
        }

        @media (max-width: 768px) {
          .faq-hero {
            padding: 100px 6% 48px;
          }
          .faq-hero__title {
            font-size: clamp(1.75rem, 6vw, 2.5rem);
          }
          .faq-hero__subtitle {
            font-size: 1rem;
          }
          .faq-main {
            padding: 56px 5% 80px;
          }
          .faq-categories {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 10px;
            margin-bottom: 36px;
          }
          .faq-category {
            flex-shrink: 0;
            padding: 10px 20px;
          }
          .faq-item__question {
            padding: 18px 20px;
            font-size: 0.9375rem;
          }
          .faq-item__answer {
            padding: 0 20px 18px;
          }
          .faq-contact {
            padding: 64px 5% 80px;
          }
          .faq-contact__btn {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .faq-hero {
            padding: 96px 5% 40px;
          }
          .faq-hero__title {
            font-size: clamp(1.5rem, 7vw, 2rem);
          }
          .faq-main {
            padding: 48px 5% 72px;
          }
          .faq-item {
            border-radius: 14px;
          }
          .faq-item__icon {
            width: 24px;
            height: 24px;
            font-size: 1.25rem;
          }
          .faq-contact {
            padding: 56px 5% 72px;
          }
          .faq-contact h2 {
            font-size: clamp(1.5rem, 6vw, 1.75rem);
          }
        }
      `}</style>
    </>
  )
}
