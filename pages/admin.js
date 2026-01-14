import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { loginUser } from '../lib/firebase'
import { getLogoUrl } from '../lib/assets'

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedFlag = window.localStorage.getItem('isAdmin')
    const storedUser = window.localStorage.getItem('adminUser')
    if (storedFlag && storedUser) {
      router.replace('/admin-dashboard')
    }
  }, [router])

  const adminProfileFrom = (base = {}) => {
    const adminName = base.name || formData.email.split('@')[0] || 'Admin User'
    return {
      role: 'admin',
      name: adminName,
      email: base.email || formData.email,
      loginTime: new Date().toISOString(),
      ...base,
    }
  }

  const storeAdminSession = (profile) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('isAdmin', 'true')
    window.localStorage.setItem('adminUser', JSON.stringify(profile))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Login attempt with:', formData.email)

    // Hardcoded admin credentials for development
    const ADMIN_CREDENTIALS = {
      email: 'adminremmic@gmail.com',
      password: 'admin123'
    }

    try {
      // Check hardcoded admin credentials first
      if (formData.email === ADMIN_CREDENTIALS.email && formData.password === ADMIN_CREDENTIALS.password) {
        console.log('Using hardcoded credentials')
        const profile = adminProfileFrom({
          email: ADMIN_CREDENTIALS.email,
          name: 'REMMIC Admin',
          role: 'admin'
        })
        storeAdminSession(profile)
        console.log('Session stored, redirecting...')
        window.location.href = '/admin-dashboard'
        return
      }

      // Try Firebase login for other admin accounts
      console.log('Trying Firebase login...')
      const result = await loginUser(formData.email, formData.password, 'admin')
      console.log('Firebase result:', result)

      if (result.success) {
        const profile = adminProfileFrom(result.userData || { email: formData.email })
        storeAdminSession(profile)
        console.log('Firebase login success, redirecting...')
        window.location.href = '/admin-dashboard'
        return
      } else {
        setError(result.error || 'Admin login failed. Please try again.')
      }
    } catch (error) {
      console.error('Admin login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Portal - REMMIC</title>
        <meta name="description" content="REMMIC Admin Portal - Secure access for administrators" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="admin-page">
        {/* Left Side - Branding */}
        <div className="admin-branding">
          <div className="admin-branding__content">
            <a href="/" className="admin-branding__logo">
              <img 
                src={getLogoUrl({ format: 'svg', size: 'medium', optimized: false })} 
                alt="REMMIC"
                onError={(e) => {
                  e.target.src = '/REMMIC LOGO SVG.svg';
                }}
              />
            </a>
            <h1 className="admin-branding__title">Admin Portal</h1>
            <p className="admin-branding__subtitle">
              Manage properties, users, and platform operations from a single dashboard.
            </p>

            <div className="admin-branding__features">
              <div className="admin-feature">
                <span className="admin-feature__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </span>
                <div>
                  <strong>Secure Access</strong>
                  <p>Bank-grade encryption protects your data</p>
                </div>
              </div>
              <div className="admin-feature">
                <span className="admin-feature__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </span>
                <div>
                  <strong>Full Control</strong>
                  <p>Manage all platform operations</p>
                </div>
              </div>
              <div className="admin-feature">
                <span className="admin-feature__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>
                  </svg>
                </span>
                <div>
                  <strong>Real-time Analytics</strong>
                  <p>Track performance and insights</p>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-branding__footer">
            <p>&copy; 2026 REMMIC. All rights reserved.</p>
            <p>A product of <strong>Amanorx Group</strong></p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="admin-form-section">
          <div className="admin-form-container">
            {/* Header Badge */}
            <div className="admin-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <span>Authorized Access Only</span>
            </div>

            {/* Form Header */}
            <div className="admin-form-header">
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access the admin dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="admin-error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="admin-form">
              <div className="admin-field">
                <label htmlFor="email">Email Address</label>
                <div className="admin-input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="admin-input-icon">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="admin@remmic.pk"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="admin-field">
                <div className="admin-field-header">
                  <label htmlFor="password">Password</label>
                  <a href="#" className="admin-forgot">Forgot password?</a>
                </div>
                <div className="admin-input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="admin-input-icon">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="admin-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="admin-form-footer">
              <a href="/" className="admin-back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Back to REMMIC Home
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          display: flex;
        }

        /* Left Branding Section */
        .admin-branding {
          width: 45%;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .admin-branding::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(201, 162, 39, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .admin-branding::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -30%;
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(201, 162, 39, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .admin-branding__content {
          position: relative;
          z-index: 1;
        }

        .admin-branding__logo img {
          height: 60px;
          width: auto;
        }

        .admin-branding__title {
          font-size: 48px;
          font-weight: 700;
          color: #fff;
          margin: 48px 0 16px;
          letter-spacing: -1px;
        }

        .admin-branding__subtitle {
          font-size: 18px;
          color: #888;
          line-height: 1.6;
          max-width: 400px;
        }

        .admin-branding__features {
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .admin-feature__icon {
          width: 48px;
          height: 48px;
          background: rgba(201, 162, 39, 0.15);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c9a227;
          flex-shrink: 0;
        }

        .admin-feature strong {
          display: block;
          color: #fff;
          font-size: 16px;
          margin-bottom: 4px;
        }

        .admin-feature p {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .admin-branding__footer {
          position: relative;
          z-index: 1;
          color: #555;
          font-size: 13px;
        }

        .admin-branding__footer p {
          margin: 4px 0;
        }

        .admin-branding__footer strong {
          color: #c9a227;
        }

        /* Right Form Section */
        .admin-form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background: #f8f8f8;
        }

        .admin-form-container {
          width: 100%;
          max-width: 440px;
        }

        /* Badge */
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(201, 162, 39, 0.1);
          border: 1px solid rgba(201, 162, 39, 0.3);
          border-radius: 50px;
          padding: 10px 20px;
          margin-bottom: 32px;
          color: #c9a227;
          font-size: 13px;
          font-weight: 600;
        }

        /* Form Header */
        .admin-form-header {
          margin-bottom: 32px;
        }

        .admin-form-header h2 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px;
        }

        .admin-form-header p {
          font-size: 15px;
          color: #666;
          margin: 0;
        }

        /* Error */
        .admin-error {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 24px;
          color: #dc2626;
          font-size: 14px;
        }

        /* Form */
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .admin-field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-field label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .admin-forgot {
          font-size: 13px;
          color: #c9a227;
          text-decoration: none;
        }

        .admin-forgot:hover {
          text-decoration: underline;
        }

        .admin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .admin-input-icon {
          position: absolute;
          left: 16px;
          color: #999;
          pointer-events: none;
        }

        .admin-input-wrapper input {
          width: 100%;
          padding: 16px 48px;
          border: 2px solid #e5e5e5;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #fff;
        }

        .admin-input-wrapper input:focus {
          outline: none;
          border-color: #c9a227;
          box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.1);
        }

        .admin-input-wrapper input::placeholder {
          color: #aaa;
        }

        .admin-password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-password-toggle:hover {
          color: #666;
        }

        /* Submit Button */
        .admin-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #c9a227 0%, #b8922a 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .admin-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(201, 162, 39, 0.3);
        }

        .admin-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .admin-form-footer {
          margin-top: 40px;
          text-align: center;
        }

        .admin-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }

        .admin-back-link:hover {
          color: #1a1a1a;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .admin-branding {
            width: 40%;
            padding: 32px;
          }

          .admin-branding__title {
            font-size: 36px;
          }

          .admin-branding__features {
            margin-top: 40px;
          }
        }

        @media (max-width: 768px) {
          .admin-page {
            flex-direction: column;
          }

          .admin-branding {
            width: 100%;
            padding: 32px 24px;
            min-height: auto;
          }

          .admin-branding__features {
            display: none;
          }

          .admin-branding__footer {
            display: none;
          }

          .admin-branding__title {
            font-size: 28px;
            margin: 24px 0 8px;
          }

          .admin-branding__subtitle {
            font-size: 14px;
          }

          .admin-form-section {
            padding: 32px 24px;
          }

          .admin-form-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  )
}
