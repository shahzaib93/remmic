import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { useFirebase } from '../contexts/FirebaseContext'

export default function AdminLogin() {
  const router = useRouter()
  const { login, register } = useFirebase()
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const dashboardPath = '/admin-dashboard'

  const redirectToDashboard = () => {
    if (router.pathname === dashboardPath) {
      return
    }

    const fallbackRedirect = () => {
      if (typeof window !== 'undefined' && window.location.pathname !== dashboardPath) {
        window.location.href = dashboardPath
      }
    }

    router.replace(dashboardPath).catch(() => {
      fallbackRedirect()
    })

    if (typeof window !== 'undefined') {
      window.setTimeout(fallbackRedirect, 500)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedFlag = window.localStorage.getItem('isAdmin')
    const storedUser = window.localStorage.getItem('adminUser')
    if (storedFlag && storedUser) {
      router.replace(dashboardPath)
    }
  }, [dashboardPath, router])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const adminProfileFrom = (base = {}) => {
    const adminName = base.fullName || base.name || formData.email.split('@')[0] || 'Admin User'
    return {
      role: 'admin',
      name: adminName,
      fullName: base.fullName || adminName,
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      if (mode === 'login') {
        const result = await login(formData.email, formData.password, 'admin')
        if (result.success) {
          const profile = adminProfileFrom(result.userData || { email: formData.email })
          storeAdminSession(profile)
          setIsLoading(false)
          redirectToDashboard()
          return
        } else {
          setError(result.error || 'Login failed. Please check your credentials.')
        }
      } else {
        const signupResult = await register(formData.email, formData.password, {
          fullName: formData.email.split('@')[0],
          role: 'admin',
        })
        if (signupResult.success) {
          const profile = adminProfileFrom(signupResult.userData || { email: formData.email, fullName: formData.email.split('@')[0] })
          storeAdminSession(profile)
          setIsLoading(false)
          redirectToDashboard()
          return
        } else {
          setError(signupResult.error || 'Registration failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Admin authentication error:', err)
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
    setFormData({ email: '', password: '', confirmPassword: '' })
    setError('')
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Admin Login' : 'Admin Sign Up'} - REMMIC</title>
        <meta name="description" content="Admin access for REMMIC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <div className="main-wrapper">
          <div className="section-login" style={{ marginTop: '80px', minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
            <div className="padding-global">
              <div className="container-large">
                <div className="login-component">
                  <div className="login-form-block w-form" style={{ maxWidth: '420px', margin: '0 auto' }}>
                    <div className="login-image-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <img src="/images/logo.png" alt="REMMIC Logo" loading="lazy" style={{ height: '110px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div className="login-top-content">
                      <h5 className="heading-style-h5" style={{ textAlign: 'center' }}>
                        {mode === 'login' ? 'Welcome back, Admin' : 'Create an admin account'}
                      </h5>
                      <div className="text-size-regular" style={{ textAlign: 'center' }}>
                        {mode === 'login'
                          ? 'Sign in to manage REMMIC dashboard.'
                          : 'Register a new admin to manage REMMIC.'}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="login-from">
                      <div className="login-field-wrapper">
                        <label htmlFor="AdminEmail" className="text-size-regular text-color-black-800">Email *</label>
                        <input
                          className="login-input w-input"
                          maxLength="256"
                          id="AdminEmail"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="admin@example.com"
                          required
                        />
                      </div>

                      <div className="login-field-wrapper">
                        <div className="login-field-top-contant">
                          <label htmlFor="AdminPassword" className="text-size-regular text-color-black-800">Password *</label>
                        </div>
                        <input
                          className="login-input w-input"
                          maxLength="256"
                          id="AdminPassword"
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                          required
                        />
                      </div>

                      {mode === 'signup' && (
                        <div className="login-field-wrapper">
                          <label htmlFor="ConfirmPassword" className="text-size-regular text-color-black-800">Confirm Password *</label>
                          <input
                            className="login-input w-input"
                            maxLength="256"
                            id="ConfirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Re-enter password"
                            required
                          />
                        </div>
                      )}

                      {error && (
                        <div style={{
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          borderRadius: '10px',
                          padding: '12px',
                          marginBottom: '18px',
                          fontSize: '14px',
                          color: '#b91c1c',
                        }}>
                          {error}
                        </div>
                      )}

                      <input
                        type="submit"
                        className="button is-secondary is-normal w-button"
                        value={isLoading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Admin Login' : 'Create Account')}
                        disabled={isLoading}
                      />
                    </form>

                    <div className="text-size-small is-center" style={{ marginTop: '18px' }}>
                      {mode === 'login' ? 'Need to add another admin? ' : 'Already have an admin account? '}
                      <button
                        type="button"
                        onClick={toggleMode}
                        style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {mode === 'login' ? 'Create account' : 'Log in instead'}
                      </button>
                    </div>
                    <div className="text-size-small is-center" style={{ marginTop: '12px' }}>
                      <a href="/login" className="login-link">← Back to regular login</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
