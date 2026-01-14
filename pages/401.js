import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PasswordProtected() {
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setShowError(false)

    setTimeout(() => {
      if (password === 'correct-password') {
        console.log('Password correct')
      } else {
        setShowError(true)
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      <Head>
        <title>Protected Page - REMMIC</title>
        <meta name="description" content="This page is password protected" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <Navbar />

        <main style={{
          paddingTop: '120px',
          paddingBottom: '80px',
          minHeight: 'calc(100vh - 200px)',
          background: 'linear-gradient(180deg, #faf9f7 0%, #f5f3ef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '440px',
            width: '100%',
            margin: '0 auto',
            padding: '48px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(201, 162, 39, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(201, 162, 39, 0.05) 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#0a0a0a',
              margin: '0 0 8px'
            }}>
              Password Protected
            </h1>
            <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 32px' }}>
              Enter password to access this page
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    background: '#f9fafb',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#c9a227'
                    e.target.style.background = '#ffffff'
                    e.target.style.boxShadow = '0 0 0 4px rgba(201, 162, 39, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.background = '#f9fafb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>

              {showError && (
                <div style={{
                  padding: '14px 16px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginBottom: '24px'
                }}>
                  Incorrect password. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #c9a227 0%, #d4b13d 100%)',
                  color: '#0a0a0a',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(201, 162, 39, 0.3)'
                }}
              >
                {isLoading ? 'Verifying...' : 'Submit'}
              </button>
            </form>

            <p style={{
              marginTop: '24px',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <Link href="/" style={{ color: '#c9a227', textDecoration: 'none', fontWeight: '500' }}>
                ← Back to Home
              </Link>
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
