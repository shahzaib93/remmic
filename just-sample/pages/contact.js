import Head from 'next/head'
import { useState } from 'react'
import Navbar from '../components/Navbar'
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

const ACCENT = '#ff5e01'
const ACCENT_GRADIENT = 'linear-gradient(135deg, #ff5e01 0%, #ff7a32 45%, #ff9659 100%)'

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

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '32px',
    color: '#1f2937',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    fontSize: '1rem',
  }

  return (
    <>
      <Head>
        <title>Contact - REMMIC</title>
      </Head>
      <div className="page-wrapper" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        <Navbar />
        <main className="main-wrapper" style={{ padding: '80px 0 120px' }}>
          <div style={{
            position: 'relative',
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '0 24px',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at top, rgba(255, 94, 1, 0.35), transparent 60%)',
              filter: 'blur(120px)',
              zIndex: 0,
            }} />

            <section style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                background: ACCENT_GRADIENT,
                borderRadius: '28px',
                padding: '48px',
                boxShadow: '0 40px 80px rgba(255, 94, 1, 0.35)',
                color: '#fff',
                marginBottom: '48px',
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              }}>
                <div>
                  <p style={{ letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85, fontSize: '0.85rem' }}>Talk to our team</p>
                  <h1 style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.2, marginTop: '12px' }}>We're here to help you invest with confidence</h1>
                  <p style={{ marginTop: '18px', lineHeight: 1.6, opacity: 0.92 }}>
                    Our investor success squad is on standby to answer questions, assist with maintenance requests, or schedule a strategy call.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    background: 'rgba(15,23,42,0.25)',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ opacity: 0.85 }}>Investor hotline</span>
                    <strong style={{ fontSize: '1.35rem' }}>+92 321 8200550</strong>
                  </div>
                  <div style={{
                    background: 'rgba(15,23,42,0.25)',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ opacity: 0.85 }}>Email</span>
                    <strong style={{ fontSize: '1.1rem' }}>hello@remmic.com</strong>
                  </div>
                  <div style={{
                    background: 'rgba(15,23,42,0.25)',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <span style={{ opacity: 0.85 }}>Head Office</span>
                    <strong style={{ fontSize: '1.1rem' }}>F-7 Markaz, Islamabad</strong>
                  </div>
                </div>
              </div>
            </section>

            <section style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
            }}>
              <form onSubmit={submitContact} style={cardStyle}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 600, marginBottom: '18px', color: '#1f2937' }}>General enquiries</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
                  Have a question about REMMIC, your portfolio, or partnership opportunities? Drop us a line and we’ll respond within one business day.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <input
                    name="firstName"
                    placeholder="First name"
                    value={contactForm.firstName}
                    onChange={handleContactChange}
                    required
                    style={inputStyle}
                  />
                  <input
                    name="lastName"
                    placeholder="Last name"
                    value={contactForm.lastName}
                    onChange={handleContactChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    style={inputStyle}
                  />
                  <input
                    name="phone"
                    placeholder="Phone"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    style={inputStyle}
                  />
                </div>

                <textarea
                  name="message"
                  placeholder="Tell us how we can help"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  required
                  rows={4}
                  style={{ ...inputStyle, marginTop: '16px', resize: 'vertical' }}
                />

                <button
                  type="submit"
                  disabled={submittingContact}
                  style={{
                    width: '100%',
                    marginTop: '22px',
                    padding: '14px',
                    borderRadius: '999px',
                    border: 'none',
                    background: ACCENT_GRADIENT,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: '0 16px 40px rgba(255, 94, 1, 0.45)',
                    cursor: submittingContact ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingContact ? 'Sending message...' : 'Send message'}
                </button>

                {contactStatus.message && (
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: contactStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: contactStatus.type === 'success' ? '#34D399' : '#F87171',
                    textAlign: 'center',
                  }}>
                    {contactStatus.message}
                  </div>
                )}
              </form>

              <form onSubmit={submitMaintenance} style={{ ...cardStyle, background: '#ffffff' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 600, marginBottom: '18px', color: '#1f2937' }}>Maintenance & repairs</h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
                  Submit a detailed maintenance or repair request. Our property managers will coordinate with local vendors and keep you in the loop.
                </p>

                <input
                  name="propertyName"
                  placeholder="Property name"
                  value={maintenanceForm.propertyName}
                  onChange={handleMaintenanceChange}
                  required
                  style={inputStyle}
                />
                <input
                  name="propertyAddress"
                  placeholder="Property address"
                  value={maintenanceForm.propertyAddress}
                  onChange={handleMaintenanceChange}
                  required
                  style={{ ...inputStyle, marginTop: '14px' }}
                />

                <div style={{ display: 'flex', gap: '14px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <select
                    name="issueType"
                    value={maintenanceForm.issueType}
                    onChange={handleMaintenanceChange}
                    style={{ ...inputStyle, flex: 1, background: '#ffffff' }}
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                  </select>
                  <select
                    name="priority"
                    value={maintenanceForm.priority}
                    onChange={handleMaintenanceChange}
                    style={{ ...inputStyle, flex: 1, background: '#ffffff' }}
                  >
                    <option value="standard">Standard priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <textarea
                  name="description"
                  placeholder="Describe the issue"
                  value={maintenanceForm.description}
                  onChange={handleMaintenanceChange}
                  required
                  rows={4}
                  style={{ ...inputStyle, marginTop: '14px', resize: 'vertical' }}
                />

                <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
                  <input
                    name="contactName"
                    placeholder="Contact name"
                    value={maintenanceForm.contactName}
                    onChange={handleMaintenanceChange}
                    required
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="Contact email"
                    value={maintenanceForm.contactEmail}
                    onChange={handleMaintenanceChange}
                    required
                    style={inputStyle}
                  />
                  <input
                    name="contactPhone"
                    placeholder="Contact phone"
                    value={maintenanceForm.contactPhone}
                    onChange={handleMaintenanceChange}
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingMaintenance}
                  style={{
                    width: '100%',
                    marginTop: '22px',
                    padding: '14px',
                    borderRadius: '999px',
                    border: 'none',
                    background: ACCENT_GRADIENT,
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: submittingMaintenance ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submittingMaintenance ? 'Submitting...' : 'Submit request'}
                </button>

                {maintenanceStatus.message && (
                  <div style={{
                    marginTop: '16px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: maintenanceStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                    color: maintenanceStatus.type === 'success' ? '#34D399' : '#F87171',
                    textAlign: 'center',
                  }}>
                    {maintenanceStatus.message}
                  </div>
                )}
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  )
}
