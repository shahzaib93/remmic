import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { loginUser } from '../lib/firebase'
import Footer from '../components/Footer'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'buyer'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await loginUser(formData.email, formData.password, formData.role)
      
      if (result.success) {
        // Always redirect to homepage with logged-in state
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

  return (
    <>
      <Head>
        <title>Login - REMMIC</title>
        <meta name="description" content="Login to your REMMIC account" />
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
                    <div className="login-top-content">
                      <h5 className="heading-style-h5">Welcome to REMMIC</h5>
                      <div className="text-size-regular">
                        Log in to access your dashboard.
                      </div>
                    </div>
                    <form onSubmit={handleLogin} className="login-from">
                      <div className="login-field-wrapper">
                        <label htmlFor="Email-2" className="text-size-regular text-color-black-800">Email *</label>
                        <input 
                          className="login-input w-input" 
                          maxLength="256" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="Your email address" 
                          type="email" 
                          id="Email-2" 
                          required
                        />
                      </div>
                      <div className="login-field-wrapper">
                        <div className="login-field-top-contant">
                          <label htmlFor="Password-2" className="text-size-regular text-color-black-800">Password *</label>
                          <a href="#" className="login-field-label">Forgot your password?</a>
                        </div>
                        <input 
                          className="login-input w-input" 
                          maxLength="256" 
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Your password" 
                          type="password" 
                          id="Password-2" 
                          required
                        />
                      </div>
                      <div className="login-field-wrapper">
                        <label htmlFor="Role" className="text-size-regular text-color-black-800">Account Type *</label>
                        <select 
                          className="login-input w-input" 
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          id="Role" 
                          required
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="renter">Renter</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
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
                        value={isLoading ? "Logging in..." : "Log In"}
                      />
                    </form>
                    <div className="login-or-wrapper">
                      <div className="login-or-border"></div>
                      <div className="text-size-small tex-color-black-700">
                        OR
                      </div>
                      <div className="login-or-border"></div>
                    </div>
                    <div className="login-app-link-wrapper">
                      <a href="https://www.google.com/" target="_blank" className="login-app-link w-inline-block">
                        <img loading="lazy" src="/images/68a06250db2face4039507f5_icon.png" alt=""/>
                        <div className="text-size-small text-color-white-200">
                          Continue with Google
                        </div>
                      </a>
                    </div>
                    <div className="text-size-small is-center">
                      Don&apos;t have an account? <a href="/signup" className="login-link">Sign up here</a>.
                    </div>
                    <div className="w-form-done">
                      <div>
                        Thank you! Your submission has been received!
                      </div>
                    </div>
                    <div className="w-form-fail">
                      <div>
                        Oops! Something went wrong while submitting the form.
                      </div>
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