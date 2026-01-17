import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { signUpUser } from '../lib/firebase'
import Footer from '../components/Footer'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'buyer'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signUpUser(formData.email, formData.password, formData.fullName, formData.role)
      
      if (result.success) {
        // Redirect based on role
        if (formData.role === 'admin') {
          router.push('/admin-dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(result.error || 'Signup failed. Please try again.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - REMMIC</title>
        <meta name="description" content="Create your REMMIC account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />
        
        <div className="main-wrapper">
          <div className="section-sign-up" style={{marginTop: '80px', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center'}}>
            <div className="padding-global">
              <div className="container-large">
                <div className="sign-up-component">
                  <div className="sign-up-form-block w-form">
                    <div className="sign-up-top-content">
                      <h5 className="heading-style-h5">Welcome to REMMIC</h5>
                      <div className="text-size-regular">
                        Create an account
                      </div>
                    </div>
                    <form onSubmit={handleSignup} className="sign-up-from">
                      <div className="sign-up-field-wrapper">
                        <div className="sign-up-field-top-content">
                          <label htmlFor="Name-4" className="text-size-regular text-color-black-800">Full Name *</label>
                        </div>
                        <input 
                          className="sign-up-input w-input" 
                          maxLength="256" 
                          placeholder="Your full name" 
                          type="text" 
                          id="Name-4" 
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>
                      <div className="sign-up-field-wrapper">
                        <label htmlFor="Email-2" className="text-size-regular text-color-black-800">Email *</label>
                        <input 
                          className="sign-up-input w-input" 
                          maxLength="256" 
                          placeholder="Your email address" 
                          type="email" 
                          id="Email-2" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="sign-up-field-wrapper">
                        <label htmlFor="Password-4" className="text-size-regular text-color-black-800">Password *</label>
                        <input 
                          className="sign-up-input w-input" 
                          maxLength="256" 
                          placeholder="Your password" 
                          type="password" 
                          id="Password-4" 
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                      <div className="sign-up-field-wrapper">
                        <label htmlFor="Role" className="text-size-regular text-color-black-800">Account Type *</label>
                        <select 
                          className="sign-up-input w-input" 
                          id="Role" 
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                          <option value="renter">Renter</option>
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
                        value={isLoading ? "Creating account..." : "Sign up"}
                      />
                    </form>
                    <div className="sign-up-or-wrapper">
                      <div className="sign-up-or-border"></div>
                      <div className="text-size-small tex-color-black-700">
                        OR
                      </div>
                      <div className="sign-up-or-border"></div>
                    </div>
                    <div className="sign-up-app-link-wrapper">
                      <a href="https://www.google.com/" target="_blank" className="sign-up-app-link w-inline-block">
                        <img loading="lazy" src="/images/68a06250db2face4039507f5_icon.png" alt="Google" className="google-icon"/>
                        <div className="text-size-small text-color-white-200">
                          Sign up with Google
                        </div>
                      </a>
                    </div>
                    <div className="text-size-small tex-color-black-700">
                      Already have an account? <a href="/login" className="sign-up-link">Login</a>
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