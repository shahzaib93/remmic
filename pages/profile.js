import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Profile() {
  const { user: firebaseUser, logout, updateUserProfile } = useFirebase()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan'
  })

  const [kycForm, setKycForm] = useState({
    cnicNumber: '',
    cnicFront: null,
    cnicBack: null,
    proofOfAddress: null,
    kycStatus: 'pending'
  })

  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    smsNotifications: false,
    investmentAlerts: true,
    marketingEmails: false,
    twoFactorAuth: false
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setProfileForm({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            address: parsedUser.address || '',
            city: parsedUser.city || '',
            country: parsedUser.country || 'Pakistan'
          })
          setKycForm(prev => ({
            ...prev,
            cnicNumber: parsedUser.cnicNumber || '',
            kycStatus: parsedUser.kycStatus || 'pending'
          }))
        } else {
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update local storage
      const updatedUser = { ...user, ...profileForm }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      setUser(updatedUser)

      // Try to update Firebase if available
      if (updateUserProfile) {
        await updateUserProfile(profileForm)
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    }

    setSaving(false)
  }

  const handleKycSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Validate CNIC format
      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/
      if (!cnicRegex.test(kycForm.cnicNumber)) {
        setMessage({ type: 'error', text: 'Please enter valid CNIC format: 12345-1234567-1' })
        setSaving(false)
        return
      }

      // Update local storage
      const updatedUser = {
        ...user,
        cnicNumber: kycForm.cnicNumber,
        kycStatus: 'submitted'
      }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setKycForm(prev => ({ ...prev, kycStatus: 'submitted' }))

      setMessage({ type: 'success', text: 'KYC documents submitted for verification!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit KYC. Please try again.' })
    }

    setSaving(false)
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const updatedUser = { ...user, settings: settingsForm }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      setUser(updatedUser)

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    }

    setSaving(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getKycStatusBadge = () => {
    const statusMap = {
      pending: { color: '#f59e0b', text: 'Pending' },
      submitted: { color: '#3b82f6', text: 'Under Review' },
      verified: { color: '#10b981', text: 'Verified' },
      rejected: { color: '#ef4444', text: 'Rejected' }
    }
    const status = statusMap[kycForm.kycStatus] || statusMap.pending
    return (
      <span className="kyc-status-badge" style={{ background: `${status.color}20`, color: status.color }}>
        {status.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p>Loading your profile...</p>
        <style jsx>{`
          .profile-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a0a;
            color: #ffffff;
            gap: 20px;
          }
          .profile-loading__spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(201, 162, 39, 0.2);
            border-top-color: #c9a227;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Profile & Settings - REMMIC</title>
        <meta name="description" content="Manage your REMMIC profile, KYC verification, and account settings" />
      </Head>

      <Navbar />

      <main className="profile-page">
        {/* Header */}
        <section className="profile-header">
          <div className="profile-header__container">
            <div className="profile-header__info">
              <div className="profile-avatar">
                <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <div className="profile-header__text">
                <h1>{user.name || 'User'}</h1>
                <p>{user.email}</p>
                {getKycStatusBadge()}
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Logout
            </button>
          </div>
        </section>

        {/* Tabs */}
        <section className="profile-content">
          <div className="profile-content__container">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </button>
              <button
                className={`profile-tab ${activeTab === 'kyc' ? 'active' : ''}`}
                onClick={() => setActiveTab('kyc')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                KYC Verification
              </button>
              <button
                className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Settings
              </button>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`profile-message profile-message--${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form className="profile-form" onSubmit={handleProfileSubmit}>
                <h2 className="form-title">Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="Your city"
                    />
                  </div>
                  <div className="form-group form-group--full">
                    <label>Address</label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="Enter your complete address"
                      rows={3}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <form className="profile-form" onSubmit={handleKycSubmit}>
                <div className="kyc-header">
                  <h2 className="form-title">KYC Verification</h2>
                  {getKycStatusBadge()}
                </div>
                <p className="form-description">
                  Complete your KYC verification to unlock full investment access and higher limits.
                </p>

                {kycForm.kycStatus === 'verified' ? (
                  <div className="kyc-verified">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#10b981">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                    <h3>Your KYC is Verified</h3>
                    <p>You have full access to all REMMIC investment features.</p>
                  </div>
                ) : (
                  <>
                    <div className="form-grid">
                      <div className="form-group form-group--full">
                        <label>CNIC Number</label>
                        <input
                          type="text"
                          value={kycForm.cnicNumber}
                          onChange={(e) => setKycForm({ ...kycForm, cnicNumber: e.target.value })}
                          placeholder="12345-1234567-1"
                          pattern="\d{5}-\d{7}-\d{1}"
                        />
                        <span className="form-hint">Format: 12345-1234567-1</span>
                      </div>
                      <div className="form-group">
                        <label>CNIC Front Image</label>
                        <div className="file-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setKycForm({ ...kycForm, cnicFront: e.target.files[0] })}
                          />
                          <div className="file-upload__placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                            <span>{kycForm.cnicFront ? kycForm.cnicFront.name : 'Upload front side'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>CNIC Back Image</label>
                        <div className="file-upload">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setKycForm({ ...kycForm, cnicBack: e.target.files[0] })}
                          />
                          <div className="file-upload__placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                            <span>{kycForm.cnicBack ? kycForm.cnicBack.name : 'Upload back side'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group form-group--full">
                        <label>Proof of Address (Optional)</label>
                        <div className="file-upload">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setKycForm({ ...kycForm, proofOfAddress: e.target.files[0] })}
                          />
                          <div className="file-upload__placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                            </svg>
                            <span>{kycForm.proofOfAddress ? kycForm.proofOfAddress.name : 'Upload utility bill or bank statement'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="submit-btn" disabled={saving || kycForm.kycStatus === 'submitted'}>
                      {saving ? 'Submitting...' : kycForm.kycStatus === 'submitted' ? 'Under Review' : 'Submit for Verification'}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <form className="profile-form" onSubmit={handleSettingsSubmit}>
                <h2 className="form-title">Notification Settings</h2>
                <div className="settings-list">
                  <label className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Email Notifications</span>
                      <span className="setting-description">Receive updates via email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.emailNotifications}
                      onChange={(e) => setSettingsForm({ ...settingsForm, emailNotifications: e.target.checked })}
                    />
                    <span className="toggle"></span>
                  </label>
                  <label className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">SMS Notifications</span>
                      <span className="setting-description">Receive updates via SMS</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.smsNotifications}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smsNotifications: e.target.checked })}
                    />
                    <span className="toggle"></span>
                  </label>
                  <label className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Investment Alerts</span>
                      <span className="setting-description">Get notified about new investment opportunities</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.investmentAlerts}
                      onChange={(e) => setSettingsForm({ ...settingsForm, investmentAlerts: e.target.checked })}
                    />
                    <span className="toggle"></span>
                  </label>
                  <label className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Marketing Emails</span>
                      <span className="setting-description">Receive promotional content</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.marketingEmails}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marketingEmails: e.target.checked })}
                    />
                    <span className="toggle"></span>
                  </label>
                </div>

                <h2 className="form-title" style={{ marginTop: '40px' }}>Security</h2>
                <div className="settings-list">
                  <label className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">Two-Factor Authentication</span>
                      <span className="setting-description">Add extra security to your account</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.twoFactorAuth}
                      onChange={(e) => setSettingsForm({ ...settingsForm, twoFactorAuth: e.target.checked })}
                    />
                    <span className="toggle"></span>
                  </label>
                </div>

                <button type="submit" className="submit-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .profile-page {
          min-height: 100vh;
          background: #f9fafb;
          padding-top: 90px;
        }

        /* Header */
        .profile-header {
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 60px 5%;
        }

        .profile-header__container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }

        .profile-header__info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 2rem;
          font-weight: 700;
          border-radius: 20px;
        }

        .profile-header__text h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .profile-header__text p {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 8px;
        }

        .kyc-status-badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 100px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          font-size: 0.9375rem;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #c62828;
          border-color: #c62828;
        }

        /* Content */
        .profile-content {
          padding: 40px 5%;
        }

        .profile-content__container {
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Tabs */
        .profile-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          background: #ffffff;
          padding: 8px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .profile-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          background: transparent;
          border: none;
          color: #6b7280;
          font-size: 0.9375rem;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-tab:hover {
          color: #0a0a0a;
        }

        .profile-tab.active {
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
        }

        /* Message */
        .profile-message {
          padding: 16px 20px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .profile-message--success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .profile-message--error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        /* Form */
        .profile-form {
          background: #ffffff;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .form-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0a0a0a;
          margin: 0 0 24px;
        }

        .form-description {
          color: #6b7280;
          margin: -16px 0 24px;
          font-size: 0.9375rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group--full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.1);
        }

        .form-group input:disabled {
          background: #f3f4f6;
          color: #9ca3af;
        }

        .form-hint {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        /* File Upload */
        .file-upload {
          position: relative;
        }

        .file-upload input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .file-upload__placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .file-upload:hover .file-upload__placeholder {
          border-color: #c9a227;
          color: #c9a227;
        }

        /* KYC Verified */
        .kyc-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .kyc-verified {
          text-align: center;
          padding: 60px 20px;
        }

        .kyc-verified h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
          margin: 24px 0 8px;
        }

        .kyc-verified p {
          color: #6b7280;
          margin: 0;
        }

        /* Settings */
        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: #f9fafb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .setting-item:hover {
          background: #f3f4f6;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #0a0a0a;
        }

        .setting-description {
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .setting-item input {
          display: none;
        }

        .toggle {
          position: relative;
          width: 48px;
          height: 28px;
          background: #e5e7eb;
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        .toggle::after {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .setting-item input:checked + .toggle {
          background: #c9a227;
        }

        .setting-item input:checked + .toggle::after {
          left: 24px;
        }

        /* Submit Button */
        .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 16px 40px;
          background: linear-gradient(135deg, #c9a227 0%, #d4b13d 100%);
          color: #0a0a0a;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(201, 162, 39, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .profile-header__container {
            flex-direction: column;
            text-align: center;
          }

          .profile-header__info {
            flex-direction: column;
          }

          .profile-tabs {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .profile-form {
            padding: 24px;
          }
        }
      `}</style>
    </>
  )
}
