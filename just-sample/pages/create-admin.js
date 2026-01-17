import Head from 'next/head'
import { useState } from 'react'
import { signUpUser } from '../lib/firebase'

export default function CreateAdmin() {
  const [formData, setFormData] = useState({
    email: 'admin@remmic.com',
    password: 'admin123456',
    fullName: 'REMMIC Administrator'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const createAdminAccount = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const result = await signUpUser(
        formData.email,
        formData.password,
        formData.fullName,
        'admin'
      )

      if (result.success) {
        setResult({
          success: true,
          message: 'Admin account created successfully!',
          userData: result.userData
        })
      } else {
        setResult({
          success: false,
          message: result.error
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message
      })
    }

    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Create Admin Account - REMMIC</title>
      </Head>
      
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '500px', 
          width: '100%',
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '30px', 
            color: '#1f2937',
            fontSize: '24px'
          }}>
            🔐 Create Admin Account
          </h1>

          <form onSubmit={createAdminAccount}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Email (will be admin)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                Password (min 6 characters)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#ff5e01',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '15px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>

          {result && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              background: result.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '8px'
            }}>
              <div style={{ 
                color: result.success ? '#166534' : '#dc2626',
                fontWeight: '600',
                marginBottom: result.success ? '10px' : '0'
              }}>
                {result.success ? '✅ Success!' : '❌ Error'}
              </div>
              <div style={{ 
                color: result.success ? '#166534' : '#dc2626',
                fontSize: '14px'
              }}>
                {result.message}
              </div>
              
              {result.success && result.userData && (
                <div style={{ 
                  marginTop: '15px',
                  padding: '10px',
                  background: '#fff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  <strong>Account Details:</strong><br/>
                  Name: {result.userData.name}<br/>
                  Email: {result.userData.email}<br/>
                  Role: {result.userData.role}<br/>
                  ID: {result.userData.id}
                </div>
              )}
            </div>
          )}

          <div style={{ 
            marginTop: '30px',
            padding: '15px',
            background: '#fffbeb',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <strong style={{ color: '#92400e' }}>⚠️ Important:</strong>
            <ul style={{ color: '#92400e', margin: '10px 0 0 0', paddingLeft: '20px' }}>
              <li>This creates a Firebase Authentication account</li>
              <li>The account will have admin role automatically</li>
              <li>Make sure Firebase rules are configured</li>
              <li>Use this account to login at <code>/admin</code></li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a 
              href="/admin"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Go to Admin Login
            </a>
          </div>
        </div>
      </div>
    </>
  )
}