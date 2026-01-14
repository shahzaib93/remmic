import Head from 'next/head'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

const INITIAL_CONTACT = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
}

const INITIAL_MAINTENANCE = {
  propertyName: '',
  propertyAddress: '',
  issueType: 'maintenance',
  priority: 'standard',
  description: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
}

export default function Contact() {
  const { submitContactMessage, submitEvaluation } = useFirebase()
  const [contactForm, setContactForm] = useState(INITIAL_CONTACT)
  const [maintenanceForm, setMaintenanceForm] = useState(INITIAL_MAINTENANCE)
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
  const [maintenanceStatus, setMaintenanceStatus] = useState({ type: '', message: '' })
  const [submittingContact, setSubmittingContact] = useState(false)
  const [submittingMaintenance, setSubmittingMaintenance] = useState(false)

  const handleContactChange = (event) => {
    const { name, value } = event.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleMaintenanceChange = (event) => {
    const { name, value } = event.target
    setMaintenanceForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitContact = async (event) => {
    event.preventDefault()
    setSubmittingContact(true)
    setContactStatus({ type: '', message: '' })

    try {
      const payload = {
        name: contactForm.firstName,
        lastname: contactForm.lastName,
        email: contactForm.email,
        phone: contactForm.phone,
        message: contactForm.message,
        fullName: `${contactForm.firstName} ${contactForm.lastName}`.trim(),
      }
      const result = await submitContactMessage(payload)
      if (result?.success) {
        setContactForm(INITIAL_CONTACT)
        setContactStatus({ type: 'success', message: 'Thank you for reaching out! Our support team will respond shortly.' })
      } else {
        setContactStatus({ type: 'error', message: 'Unable to submit your message. Please try again later.' })
      }
    } catch (error) {
      console.error('submitContactMessage failed', error)
      setContactStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setSubmittingContact(false)
    }
  }

  const submitMaintenance = async (event) => {
    event.preventDefault()
    setSubmittingMaintenance(true)
    setMaintenanceStatus({ type: '', message: '' })

    try {
      const payload = {
        title: maintenanceForm.issueType === 'repair' ? 'Repair request' : 'Maintenance request',
        property: maintenanceForm.propertyName,
        address: maintenanceForm.propertyAddress,
        issue: maintenanceForm.description,
        type: maintenanceForm.issueType,
        priority: maintenanceForm.priority,
        userName: maintenanceForm.contactName,
        userEmail: maintenanceForm.contactEmail,
        userPhone: maintenanceForm.contactPhone,
        source: 'contact-maintenance',
      }
      const result = await submitEvaluation(payload)
      if (result?.success) {
        setMaintenanceForm(INITIAL_MAINTENANCE)
        setMaintenanceStatus({ type: 'success', message: 'Request submitted. Our maintenance concierge will reach out soon.' })
      } else {
        setMaintenanceStatus({ type: 'error', message: 'Unable to submit the request. Please try again.' })
      }
    } catch (error) {
      console.error('submitEvaluation failed', error)
      setMaintenanceStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setSubmittingMaintenance(false)
    }
  }

  return (
    <>
      <Head>
        <title>Contact - REMMIC</title>
        <meta name="description" content="Get in touch with REMMIC - Pakistan's leading property management platform." />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="contact-main">
          <div className="contact-container">
            {/* Hero Banner */}
            <section className="contact-hero">
              <div className="contact-hero-content">
                <span className="contact-badge">Talk to our team</span>
                <h1 className="contact-title">
                  We're here to help you<br />
                  <span className="contact-title-accent">invest with confidence</span>
                </h1>
                <p className="contact-description">
                  Our investor success squad is on standby to answer questions,
                  assist with maintenance requests, or schedule a strategy call.
                </p>
              </div>

              <div className="contact-info-cards">
                <div className="contact-info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  <span className="contact-info-label">Investor hotline</span>
                  <strong className="contact-info-value">+92 321 8200550</strong>
                </div>
                <div className="contact-info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="contact-info-label">Email</span>
                  <strong className="contact-info-value">hello@remmic.com</strong>
                </div>
                <div className="contact-info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="contact-info-label">Head Office</span>
                  <strong className="contact-info-value">F-7 Markaz, Islamabad</strong>
                </div>
              </div>
            </section>

            {/* Forms Section */}
            <section className="contact-forms">
              {/* General Contact Form */}
              <form onSubmit={submitContact} className="contact-form-card">
                <h2 className="form-title">General enquiries</h2>
                <p className="form-description">
                  Have a question about REMMIC, your portfolio, or partnership opportunities?
                  Drop us a line and we'll respond within one business day.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First name <span className="required">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={contactForm.firstName}
                      onChange={handleContactChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last name <span className="required">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={contactForm.lastName}
                      onChange={handleContactChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <button type="submit" disabled={submittingContact} className="form-button">
                  {submittingContact ? 'Sending message...' : 'Send message'}
                </button>

                {contactStatus.message && (
                  <div className={`form-status ${contactStatus.type}`}>
                    {contactStatus.message}
                  </div>
                )}
              </form>

              {/* Maintenance Form */}
              <form onSubmit={submitMaintenance} className="contact-form-card">
                <h2 className="form-title">Maintenance & repairs</h2>
                <p className="form-description">
                  Submit a detailed maintenance or repair request. Our property managers
                  will coordinate with local vendors and keep you in the loop.
                </p>

                <div className="form-group">
                  <label htmlFor="propertyName" className="form-label">
                    Property name <span className="required">*</span>
                  </label>
                  <input
                    id="propertyName"
                    name="propertyName"
                    placeholder="Enter property name"
                    value={maintenanceForm.propertyName}
                    onChange={handleMaintenanceChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="propertyAddress" className="form-label">
                    Property address <span className="required">*</span>
                  </label>
                  <input
                    id="propertyAddress"
                    name="propertyAddress"
                    placeholder="Enter property address"
                    value={maintenanceForm.propertyAddress}
                    onChange={handleMaintenanceChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="issueType" className="form-label">
                      Issue type
                    </label>
                    <select
                      id="issueType"
                      name="issueType"
                      value={maintenanceForm.issueType}
                      onChange={handleMaintenanceChange}
                      className="form-select"
                    >
                      <option value="maintenance">Maintenance</option>
                      <option value="repair">Repair</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="priority" className="form-label">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={maintenanceForm.priority}
                      onChange={handleMaintenanceChange}
                      className="form-select"
                    >
                      <option value="standard">Standard priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Issue description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the issue in detail"
                    value={maintenanceForm.description}
                    onChange={handleMaintenanceChange}
                    required
                    rows={4}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactName" className="form-label">
                    Your name <span className="required">*</span>
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    placeholder="Enter your full name"
                    value={maintenanceForm.contactName}
                    onChange={handleMaintenanceChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail" className="form-label">
                    Your email <span className="required">*</span>
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    name="contactEmail"
                    placeholder="Enter your email address"
                    value={maintenanceForm.contactEmail}
                    onChange={handleMaintenanceChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone" className="form-label">
                    Your phone
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    placeholder="Enter your phone number"
                    value={maintenanceForm.contactPhone}
                    onChange={handleMaintenanceChange}
                    className="form-input"
                  />
                </div>

                <button type="submit" disabled={submittingMaintenance} className="form-button">
                  {submittingMaintenance ? 'Submitting...' : 'Submit request'}
                </button>

                {maintenanceStatus.message && (
                  <div className={`form-status ${maintenanceStatus.type}`}>
                    {maintenanceStatus.message}
                  </div>
                )}
              </form>
            </section>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .contact-main {
          padding: 140px 5% 80px;
          background: linear-gradient(180deg, #faf9f7 0%, #ffffff 100%);
          min-height: 100vh;
        }

        .contact-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Hero Section */
        .contact-hero {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border-radius: 24px;
          padding: 48px;
          margin-bottom: 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          border: 1px solid rgba(201, 162, 39, 0.2);
        }

        .contact-badge {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(201, 162, 39, 0.2);
          color: #c9a227;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 100px;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Manrope', sans-serif;
        }

        .contact-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
          margin: 0 0 20px;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }

        .contact-title-accent {
          color: #c9a227;
        }

        .contact-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin: 0;
          font-family: 'Manrope', sans-serif;
        }

        .contact-info-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contact-info-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid rgba(201, 162, 39, 0.1);
        }

        .contact-info-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          display: block;
          font-family: 'Manrope', sans-serif;
        }

        .contact-info-value {
          font-size: 1.125rem;
          color: #ffffff;
          display: block;
          margin-top: 4px;
          font-family: 'Manrope', sans-serif;
        }

        /* Forms Section */
        .contact-forms {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .contact-form-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(201, 162, 39, 0.1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0 0 12px;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.01em;
        }

        .form-description {
          font-size: 1rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 28px;
          font-family: 'Manrope', sans-serif;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-family: 'Manrope', sans-serif;
        }

        .form-label .required {
          color: #dc2626;
          margin-left: 2px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          color: #0a0a0a;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s ease;
          margin-bottom: 0;
          box-sizing: border-box;
          font-family: 'Manrope', sans-serif;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #c9a227;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.1);
        }

        .form-input:invalid:not(:placeholder-shown),
        .form-textarea:invalid:not(:placeholder-shown) {
          border-color: #dc2626;
        }

        .form-input:invalid:not(:placeholder-shown):focus,
        .form-textarea:invalid:not(:placeholder-shown):focus {
          box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
          max-height: 400px;
        }

        .form-button {
          width: 100%;
          padding: 16px 32px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(201, 162, 39, 0.3);
          font-family: 'Manrope', sans-serif;
        }

        .form-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 162, 39, 0.4);
        }

        .form-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .form-status {
          margin-top: 20px;
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          font-size: 0.9375rem;
        }

        .form-status.success {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .form-status.error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 991px) {
          .contact-hero {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .contact-forms {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767px) {
          .contact-main {
            padding: 120px 5% 60px;
          }

          .contact-hero {
            padding: 32px 24px;
          }

          .contact-form-card {
            padding: 28px 24px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
