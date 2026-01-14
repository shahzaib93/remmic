import { useEffect } from 'react'

function Error({ statusCode, hasGetInitialPropsRun, err }) {
  useEffect(() => {
    if (err) {
      console.error('Error caught by _error.js:', err)
    }
  }, [err])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>
          {statusCode >= 500 ? '🔧' : '🔍'}
        </div>
        
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#1f2937', 
          marginBottom: '15px' 
        }}>
          {statusCode
            ? `Server Error ${statusCode}`
            : 'Application Error'}
        </h1>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '30px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          {statusCode
            ? statusCode === 404
              ? 'The page you are looking for could not be found.'
              : 'A server error occurred. Please try again later.'
            : 'An error occurred on the client side. Please try refreshing the page.'}
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go Home
          </button>

          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Dashboard
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && err && (
          <details style={{ 
            marginTop: '30px', 
            textAlign: 'left',
            background: '#fef2f2',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: '600', 
              color: '#dc2626',
              marginBottom: '10px'
            }}>
              Development Error Details
            </summary>
            <pre style={{ 
              fontSize: '12px', 
              color: '#dc2626',
              overflow: 'auto',
              maxHeight: '200px',
              margin: 0
            }}>
              {err.stack || err.message || 'Unknown error'}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode, hasGetInitialPropsRun: true }
}

export default Error