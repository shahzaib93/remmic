import Head from 'next/head'
import { useState } from 'react'
import { useFirebase } from '../contexts/FirebaseContext'

export default function TestFirebase() {
  const { addProperty, getProperties, submitContactMessage, getAllContactMessages } = useFirebase()
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)

  const runFirebaseTests = async () => {
    setLoading(true)
    const results = {}

    try {
      // Test 1: Add a test property
      console.log('Testing addProperty...')
      const propertyResult = await addProperty({
        title: 'Test Property',
        type: 'residential',
        location: 'Test Location',
        description: 'This is a test property to verify Firestore connection',
        landType: 'residential',
        listingType: 'bidding',
        areaSize: '5 Marla',
        ownerName: 'Test User',
        ownerEmail: 'test@example.com'
      })
      results.addProperty = propertyResult
      console.log('Add Property Result:', propertyResult)

      // Test 2: Get properties
      console.log('Testing getProperties...')
      const propertiesResult = await getProperties()
      results.getProperties = propertiesResult
      console.log('Get Properties Result:', propertiesResult)

      // Test 3: Submit a contact message
      console.log('Testing submitContactMessage...')
      const messageResult = await submitContactMessage({
        name: 'Test',
        lastname: 'User',
        email: 'test@example.com',
        phone: '123-456-7890',
        message: 'This is a test message to verify Firestore connection'
      })
      results.submitContactMessage = messageResult
      console.log('Submit Message Result:', messageResult)

      // Test 4: Get all contact messages
      console.log('Testing getAllContactMessages...')
      const messagesResult = await getAllContactMessages()
      results.getAllContactMessages = messagesResult
      console.log('Get Messages Result:', messagesResult)

    } catch (error) {
      console.error('Firebase test error:', error)
      results.error = error.message
    }

    setTestResults(results)
    setLoading(false)
  }

  const formatResult = (result) => {
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2)
    }
    return String(result)
  }

  return (
    <>
      <Head>
        <title>Firebase Connection Test - REMMIC</title>
      </Head>
      
      <div style={{ 
        minHeight: '100vh', 
        padding: '40px 20px',
        background: '#f9fafb',
        fontFamily: 'monospace'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#1f2937' }}>
            🔥 Firebase Firestore Connection Test
          </h1>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <button 
              onClick={runFirebaseTests}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#ff5e01',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Running Tests...' : 'Run Firebase Tests'}
            </button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div>
              <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>Test Results:</h2>
              
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} style={{ 
                  marginBottom: '30px',
                  padding: '20px',
                  background: result?.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${result?.success ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '8px'
                }}>
                  <h3 style={{ 
                    color: result?.success ? '#166534' : '#dc2626',
                    marginBottom: '10px',
                    fontSize: '18px'
                  }}>
                    {result?.success ? '✅' : '❌'} {testName}
                  </h3>
                  
                  <div style={{ 
                    background: '#fff',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    <pre style={{ 
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {formatResult(result)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ 
            marginTop: '40px',
            padding: '20px',
            background: '#fffbeb',
            border: '1px solid #fbbf24',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#92400e', marginBottom: '10px' }}>
              📋 What This Test Does:
            </h3>
            <ul style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Tests adding a property to Firestore</li>
              <li>Tests retrieving properties from Firestore</li>
              <li>Tests submitting a contact message to Firestore</li>
              <li>Tests retrieving contact messages from Firestore</li>
              <li>Falls back to localStorage if Firestore fails</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <a 
              href="/dashboard"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </>
  )
}