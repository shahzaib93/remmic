import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { loginUser, signUpUser } from '../lib/firebase'
import Footer from '../components/Footer'

export default function AdminLogin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedFlag = window.localStorage.getItem('isAdmin')
    const storedUser = window.localStorage.getItem('adminUser')
    if (storedFlag && storedUser) {
      router.replace('/admin-dashboard')
    }
  }, [router])

  const adminProfileFrom = (base = {}) => {
    const adminName = base.fullName || base.name || formData.fullName || formData.email.split('@')[0] || 'Admin User'
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

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await loginUser(formData.email, formData.password, 'admin')
      
      if (result.success) {
        const profile = adminProfileFrom(result.userData || { email: formData.email, fullName: formData.fullName })
        storeAdminSession(profile)
        await router.replace('/admin-dashboard')
        if (typeof window !== 'undefined') {
          window.location.assign('/admin-dashboard')
        }
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

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.fullName.trim()) {
      setError('Full name is required for new admins.')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUpUser(
        formData.email,
        formData.password,
        formData.fullName,
        'admin'
      )

      if (result.success) {
        const profile = adminProfileFrom(result.userData || { email: formData.email, fullName: formData.fullName })
        storeAdminSession(profile)
        await router.replace('/admin-dashboard')
        if (typeof window !== 'undefined') {
          window.location.assign('/admin-dashboard')
        }
        return
      } else {
        setError(result.error || 'Unable to create admin account. Please try again.')
      }
    } catch (error) {
      console.error('Admin signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = (targetTab) => {
    setActiveTab(targetTab)
    setError('')
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' })
  }

  return (
    <>
      <Head>
        <title>Admin Login - REMMIC</title>
        <meta name="description" content="Admin login for REMMIC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        
        <div className="main-wrapper">
          <div className="section-login" style={{marginTop: '80px', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center'}}>
            <div className="padding-global">
              <div className="container-large">
                <div className="login-component">
                  <div className="login-form-block w-form">
                    <div className="login-image-wrapper" style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                      <img src="/images/logo.png" 
                           alt="REMMIC Logo" 
                           loading="lazy" 
                           style={{height: '120px', width: 'auto', objectFit: 'contain'}}/>
                    </div>
                    <div className="login-top-content">
                      <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px'}}>
                        <button
                          type="button"
                          onClick={() => resetForm('login')}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '999px',
                            border: activeTab === 'login' ? '2px solid #059669' : '1px solid #d1d5db',
                            background: activeTab === 'login' ? '#059669' : 'transparent',
                            color: activeTab === 'login' ? '#fff' : '#111827',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Admin Login
                        </button>
                        <button
                          type="button"
                          onClick={() => resetForm('signup')}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '999px',
                            border: activeTab === 'signup' ? '2px solid #059669' : '1px solid #d1d5db',
                            background: activeTab === 'signup' ? '#059669' : 'transparent',
                            color: activeTab === 'signup' ? '#fff' : '#111827',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Admin Sign Up
                        </button>
                      </div>
                      <h5 className="heading-style-h5" style={{textAlign: 'center'}}>
                        {activeTab === 'login' ? 'Welcome back, Admin' : 'Create a new admin account'}
                      </h5>
                      <div className="text-size-regular" style={{textAlign: 'center'}}>
                        {activeTab === 'login'
                          ? 'Access REMMIC Admin Dashboard'
                          : 'Provision a new administrator with secure access'}
                      </div>
                    </div>

                    <form
                      onSubmit={activeTab === 'login' ? handleLogin : handleSignup}
                      className="login-from"
                    >
                      {activeTab === 'signup' && (
                        <div className="login-field-wrapper">
                          <label htmlFor="FullName" className="text-size-regular text-color-black-800">Full Name *</label>
                          <input
                            className="login-input w-input"
                            maxLength="256"
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            placeholder="Admin full name"
                            type="text"
                            id="FullName"
                            required
                          />
                        </div>
                      )}

                      <div className="login-field-wrapper">
                        <label htmlFor="AdminEmail" className="text-size-regular text-color-black-800">Email *</label>
                        <input
                          className="login-input w-input"
                          maxLength="256"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Admin email address"
                          type="email"
                          id="AdminEmail"
                          required
                        />
                      </div>

                      <div className="login-field-wrapper">
                        <div className="login-field-top-contant">
                          <label htmlFor="AdminPassword" className="text-size-regular text-color-black-800">Password *</label>
                          {activeTab === 'login' && <a href="#" className="login-field-label">Forgot password?</a>}
                        </div>
                        <input
                          className="login-input w-input"
                          maxLength="256"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder={activeTab === 'login' ? 'Admin password' : 'Create a strong password'}
                          type="password"
                          id="AdminPassword"
                          required
                        />
                      </div>

                      {activeTab === 'signup' && (
                        <div className="login-field-wrapper">
                          <label htmlFor="ConfirmPassword" className="text-size-regular text-color-black-800">Confirm Password *</label>
                          <input
                            className="login-input w-input"
                            maxLength="256"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            placeholder="Re-enter password"
                            type="password"
                            id="ConfirmPassword"
                            required
                          />
                        </div>
                      )}

                      {error && (
                        <div style={{
                          background: '#fee',
                          border: '1px solid #f00',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '20px',
                          fontSize: '14px',
                          color: '#800'
                        }}>
                          {error}
                        </div>
                      )}

                      <input
                        type="submit"
                        disabled={isLoading}
                        className="button is-secondary is-normal w-button"
                        value={isLoading ? (activeTab === 'login' ? 'Logging in...' : 'Creating admin...') : (activeTab === 'login' ? 'Admin Login' : 'Create Admin')}
                      />
                    </form>

                    <div className="text-size-small is-center" style={{marginTop: '20px'}}>
                      {activeTab === 'login' ? (
                        <span>
                          Need to add another admin?{' '}
                          <button
                            type="button"
                            onClick={() => resetForm('signup')}
                            style={{background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 600}}
                          >
                            Create account
                          </button>
                        </span>
                      ) : (
                        <span>
                          Already have an admin account?{' '}
                          <button
                            type="button"
                            onClick={() => resetForm('login')}
                            style={{background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontWeight: 600}}
                          >
                            Sign in instead
                          </button>
                        </span>
                      )}
                    </div>

                    <div className="text-size-small is-center" style={{marginTop: '12px'}}>
                      <a href="/login" className="login-link">Back to regular login</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}
