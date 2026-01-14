import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useFirebase } from '../contexts/FirebaseContext'

export default function Login() {
  const router = useRouter()
  const { login, loginWithGoogle } = useFirebase()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.email, formData.password, formData.role)

      if (result.success) {
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/'
        localStorage.removeItem('redirectAfterLogin')
        router.push(redirectTo)
      } else {
        setError(result.error || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const result = await loginWithGoogle()
      if (result.success) {
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard'
        localStorage.removeItem('redirectAfterLogin')
        router.push(redirectTo)
      } else {
        setError(result.error || 'Google sign-in failed. Please try again.')
      }
    } catch (error) {
      console.error('Google login error:', error)
      setError('Google sign-in encountered an issue. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - REMMIC</title>
        <meta name="description" content="Login to your REMMIC account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main className="auth-main">
          <div className="auth-container">
            <div className="auth-card">
              {/* Header */}
              <div className="auth-header">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your account</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="auth-form">
                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                    required
                    className="form-input"
                  />
                </div>

                {/* Password */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label className="form-label">Password</label>
                    <Link href="/forgot-password" className="form-link">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter your password"
                      required
                      className="form-input form-input--password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Type */}
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                    className="form-select"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="renter">Renter</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="form-error">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="form-submit"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* Google Login */}
              <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
                <img src="/images/68a06250db2face4039507f5_icon.png" alt="Google" width="20" height="20" />
                Continue with Google
              </button>

              {/* Sign Up Link */}
              <p className="auth-footer">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="auth-footer-link">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .auth-main {
          padding: 120px 5% 80px;
          min-height: calc(100vh - 200px);
          background: linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%);
        }

        .auth-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .auth-card {
          max-width: 480px;
          margin: 0 auto;
          padding: 48px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(201, 162, 39, 0.1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 600;
          color: #0a0a0a;
          margin: 0 0 8px;
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.02em;
        }

        .auth-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
          font-family: 'Manrope', sans-serif;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-family: 'Manrope', sans-serif;
        }

        .form-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .form-link {
          font-size: 0.875rem;
          color: #c9a227;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .form-link:hover {
          color: #a88620;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 14px 16px;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #f9fafb;
          color: #0a0a0a;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
          font-family: 'Manrope', sans-serif;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: #c9a227;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(201, 162, 39, 0.1);
        }

        .form-input--password {
          padding-right: 48px;
        }

        .password-wrapper {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #6b7280;
        }

        .form-error {
          padding: 14px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .form-submit {
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

        .form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(201, 162, 39, 0.4);
        }

        .form-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .auth-divider span {
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .google-btn {
          width: 100%;
          padding: 14px 20px;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.2s ease;
          font-family: 'Manrope', sans-serif;
        }

        .google-btn:hover {
          border-color: #c9a227;
          background: #fffbeb;
        }

        .auth-footer {
          text-align: center;
          margin-top: 32px;
          font-size: 0.9375rem;
          color: #6b7280;
          font-family: 'Manrope', sans-serif;
        }

        .auth-footer-link {
          color: #c9a227;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .auth-footer-link:hover {
          color: #a88620;
        }

        @media (max-width: 767px) {
          .auth-main {
            padding: 100px 5% 60px;
          }

          .auth-card {
            padding: 32px 24px;
          }

          .auth-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </>
  )
}
